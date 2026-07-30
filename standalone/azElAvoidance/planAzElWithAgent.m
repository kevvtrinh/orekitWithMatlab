function plan = planAzElWithAgent( ...
        azElData, initialState, goalState, limits, options)
%PLANAZELWITHAGENT Deploy the trained profile selector and exact planner.
%
% plan = planAzElWithAgent( ...
%     azElData, initialState, goalState, limits, options)
%
% Agent options:
%   AgentArtifact          In-memory artifact returned by the trainer.
%   AgentFile              Saved artifact path when AgentArtifact is empty.
%   AgentMaxSearchTime_s   Total time across ranked fallbacks (default 45).
%   AgentFallback          Try remaining profiles after a failure (true).
%   AgentPrintDiagnostics  Print the ranking and selected profile (true).
%
% Any other option is an explicit planAzElDijkstra override applied to every
% ranked profile. The learned model chooses only an order. Exact polygon
% collision validation remains mandatory for a successful deployed plan.

if nargin < 5
    options = struct();
end
packageRoot = fileparts(mfilename("fullpath"));
defaultAgentFile = fullfile(packageRoot, ...
    "models", "azElPlannerAgent.mat");
if ~isfield(options, "AgentArtifact")
    options.AgentArtifact = [];
end
if ~isfield(options, "AgentFile") || isempty(options.AgentFile)
    options.AgentFile = defaultAgentFile;
end
if ~isfield(options, "AgentMaxSearchTime_s") || ...
        isempty(options.AgentMaxSearchTime_s)
    options.AgentMaxSearchTime_s = 45;
end
if ~isfield(options, "AgentFallback") || isempty(options.AgentFallback)
    options.AgentFallback = true;
end
if ~isfield(options, "AgentPrintDiagnostics") || ...
        isempty(options.AgentPrintDiagnostics)
    options.AgentPrintDiagnostics = true;
end
validateattributes(options.AgentMaxSearchTime_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.AgentFallback, ...
    {'logical', 'numeric'}, {'scalar'});
validateattributes(options.AgentPrintDiagnostics, ...
    {'logical', 'numeric'}, {'scalar'});
options.AgentFallback = logical(options.AgentFallback);
options.AgentPrintDiagnostics = logical(options.AgentPrintDiagnostics);

%% Load and validate the frozen agent
if isempty(options.AgentArtifact)
    if ~isfile(options.AgentFile)
        error("planAzElWithAgent:MissingArtifact", ...
            "Train the agent first with trainAzElPlannerAgent('%s').", ...
            options.AgentFile);
    end
    loadedArtifact = load(options.AgentFile, "agentArtifact");
    if ~isfield(loadedArtifact, "agentArtifact")
        error("planAzElWithAgent:InvalidArtifact", ...
            "The MAT-file does not contain agentArtifact.");
    end
    agentArtifact = loadedArtifact.agentArtifact;
else
    agentArtifact = options.AgentArtifact;
end
requiredArtifactFields = ["Format", "Version", "FeatureNames", ...
    "Profiles", "Model", "ExactValidationRequired"];
if ~isstruct(agentArtifact) || ~isscalar(agentArtifact) || ...
        ~all(isfield(agentArtifact, cellstr(requiredArtifactFields))) || ...
        string(agentArtifact.Format) ~= "AzElPlannerSelectionAgent"
    error("planAzElWithAgent:InvalidArtifact", ...
        "Artifact is not an AzElPlannerSelectionAgent.");
end
if ~agentArtifact.ExactValidationRequired
    error("planAzElWithAgent:UnsafeArtifact", ...
        "Deployment requires an exact-validation agent artifact.");
end

%% Rank the learned actions
[featureValues, featureNames, featureDiagnostics] = extractAzElPlannerFeatures( ...
    azElData, initialState, goalState, limits);
if ~isequal(string(agentArtifact.FeatureNames), string(featureNames))
    error("planAzElWithAgent:FeatureVersionMismatch", ...
        "Artifact feature ordering differs from this deployment.");
end
[predictedClass, classScores] = predict( ...
    agentArtifact.Model, featureValues);
modelClassNames = string(agentArtifact.Model.ClassNames);
artifactProfileNames = string({agentArtifact.Profiles.Name});
profileScores = -inf(1, numel(artifactProfileNames));
for modelClassIndex = 1:numel(modelClassNames)
    isMatchingProfile = artifactProfileNames == modelClassNames( ...
        modelClassIndex);
    matchingProfile = find(isMatchingProfile, 1);
    if ~isempty(matchingProfile)
        profileScores(matchingProfile) = classScores(modelClassIndex);
    end
end
% Artifact order is the cheap-to-expressive fallback order, so it resolves
% equal classifier scores deterministically.
rankingKeys = [-profileScores(:), ...
    (1:numel(profileScores)).'];
[~, rankingOrder] = sortrows(rankingKeys, [1 2]);
rankedProfileNames = artifactProfileNames(rankingOrder);
rankedScores = profileScores(rankingOrder);
if ~options.AgentFallback
    rankedProfileNames = rankedProfileNames(1);
    rankedScores = rankedScores(1);
end

%% Execute ranked searches until one exact-valid route succeeds
agentOptionNames = [ ...
    "AgentArtifact", "AgentFile", "AgentMaxSearchTime_s", ...
    "AgentFallback", "AgentPrintDiagnostics"];
plannerOverrides = options;
for agentOptionIndex = 1:numel(agentOptionNames)
    agentOptionName = agentOptionNames(agentOptionIndex);
    if isfield(plannerOverrides, agentOptionName)
        plannerOverrides = rmfield(plannerOverrides, agentOptionName);
    end
end
overrideNames = fieldnames(plannerOverrides);
attemptTemplate = struct( ...
    "ProfileName", "", ...
    "Score", NaN, ...
    "Success", false, ...
    "ExactCollisionValidated", false, ...
    "Elapsed_s", NaN, ...
    "Message", "");
agentAttempts = repmat(attemptTemplate, numel(rankedProfileNames), 1);
agentAttemptCount = 0;
deploymentTimer = tic;
plan = struct();

for rankingIndex = 1:numel(rankedProfileNames)
    elapsedDeployment_s = toc(deploymentTimer);
    remainingSearchTime_s = options.AgentMaxSearchTime_s - ...
        elapsedDeployment_s;
    if remainingSearchTime_s <= 0
        break;
    end
    profileName = rankedProfileNames(rankingIndex);
    matchingProfile = find(artifactProfileNames == profileName, 1);
    if isempty(matchingProfile)
        continue;
    end
    plannerOptions = agentArtifact.Profiles( ...
        matchingProfile).PlannerOptions;
    for overrideIndex = 1:numel(overrideNames)
        overrideName = overrideNames{overrideIndex};
        plannerOptions.(overrideName) = plannerOverrides.(overrideName);
    end
    plannerOptions.MaxSearchTime_s = min( ...
        plannerOptions.MaxSearchTime_s, remainingSearchTime_s);
    plannerOptions.PrintFailureSuggestions = false;

    attemptTimer = tic;
    candidatePlan = planAzElDijkstra( ...
        azElData, initialState, goalState, limits, plannerOptions);
    attemptElapsed_s = toc(attemptTimer);
    exactSuccess = candidatePlan.success && ...
        candidatePlan.exactCollisionValidated;
    agentAttemptCount = agentAttemptCount + 1;
    agentAttempts(agentAttemptCount) = struct( ...
        "ProfileName", profileName, ...
        "Score", rankedScores(rankingIndex), ...
        "Success", candidatePlan.success, ...
        "ExactCollisionValidated", ...
        candidatePlan.exactCollisionValidated, ...
        "Elapsed_s", attemptElapsed_s, ...
        "Message", string(candidatePlan.message));
    plan = candidatePlan;
    if exactSuccess
        break;
    end
end
agentAttempts = agentAttempts(1:agentAttemptCount);
if isempty(fieldnames(plan))
    error("planAzElWithAgent:BudgetExpired", ...
        "Agent budget expired before a planner profile could run.");
end

selectedProfileName = "";
if plan.success
    selectedProfileName = agentAttempts(end).ProfileName;
end
plan.agent = struct( ...
    "ArtifactVersion", agentArtifact.Version, ...
    "PredictedProfileName", string(predictedClass), ...
    "SelectedProfileName", selectedProfileName, ...
    "RankedProfileNames", rankedProfileNames, ...
    "RankedScores", rankedScores, ...
    "FallbackUsed", agentAttemptCount > 1, ...
    "Attempts", agentAttempts, ...
    "FeatureNames", featureNames, ...
    "FeatureValues", featureValues, ...
    "FeatureDiagnostics", featureDiagnostics, ...
    "DeploymentElapsed_s", toc(deploymentTimer));
if options.AgentPrintDiagnostics
    fprintf("Planner agent ranked: %s\n", ...
        strjoin(rankedProfileNames, " > "));
    if plan.success
        fprintf("Selected %s after %d attempt(s); exact validation passed.\n", ...
            selectedProfileName, agentAttemptCount);
    else
        fprintf("No ranked profile found an exact-valid route.\n");
    end
end
end
