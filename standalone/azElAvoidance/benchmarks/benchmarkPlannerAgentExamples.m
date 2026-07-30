function report = benchmarkPlannerAgentExamples(agentBudget_s)
%BENCHMARKPLANNERAGENTEXAMPLES Compare the agent with numbered baselines.
%
% report = benchmarkPlannerAgentExamples()
% report = benchmarkPlannerAgentExamples(agentBudget_s)
%
% Examples 02-12 and 15 expose fixed initial and goal states and are directly
% comparable. Example 01 needs caller data, examples 13-14 solve moving-target
% interception, and example 16 is the agent calibration demonstration.
%
% The baseline example runs first and supplies its already packed workspace,
% boundary states, limits, and mission safety semantics. The agent chooses
% only graph/search settings. Reusing the workspace prevents source packing
% from distorting planner timing.

if nargin < 1
    agentBudget_s = 20;
end
validateattributes(agentBudget_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});

exampleNumbers = [2:12 15];
caseCount = numel(exampleNumbers);
baselineSuccess = false(caseCount, 1);
agentSuccess = false(caseCount, 1);
baselineSearch_s = nan(caseCount, 1);
agentSearch_s = nan(caseCount, 1);
baselinePath_deg = nan(caseCount, 1);
agentPath_deg = nan(caseCount, 1);
baselineCompletion_s = nan(caseCount, 1);
agentCompletion_s = nan(caseCount, 1);
predictedProfile = strings(caseCount, 1);
selectedProfile = strings(caseCount, 1);
attemptCount = zeros(caseCount, 1);
agentMessage = strings(caseCount, 1);
hiddenView = struct( ...
    "FigureVisible", "off", ...
    "MaximumAnimationFrames", 1, ...
    "MaximumDisplayedSlices", 1, ...
    "PauseSeconds", 0, ...
    "DiscretizationMode", "off");
previousFigureVisibility = get(0, "DefaultFigureVisible");
figureCleanup = onCleanup(@() set( ...
    0, "DefaultFigureVisible", previousFigureVisibility));
set(0, "DefaultFigureVisible", "off");

for caseIndex = 1:caseCount
    exampleNumber = exampleNumbers(caseIndex);
    fprintf("\n=== Agent benchmark example %02d ===\n", exampleNumber);
    try
        % Examples predate one common scenario factory, so this explicit
        % switch keeps benchmark control flow visible without adding twelve
        % single-call adapter files.
        switch exampleNumber
            case 2
                baselinePlan = example02VietnamChinaAvoidance();
            case 3
                baselinePlan = example03KinodynamicDetour(hiddenView);
            case 4
                baselineResult = example04DynamicSafeIntervals(hiddenView);
                baselinePlan = baselineResult.plan;
            case 5
                baselineResult = example05FiveTurnSpiral();
                baselinePlan = baselineResult.plan;
            case 6
                baselineResult = example06StopGoGates();
                baselinePlan = baselineResult.plan;
            case 7
                baselineResult = example07WrappedAzimuthSeam();
                baselinePlan = baselineResult.plan;
            case 8
                baselineResult = example08AlternatingSlalom();
                baselinePlan = baselineResult.plan;
            case 9
                baselineResult = example09UTrapEscape();
                baselinePlan = baselineResult.plan;
            case 10
                baselineResult = example10RotatingSlots(hiddenView);
                baselinePlan = baselineResult.plan;
            case 11
                baselineResult = example11ChasedBoresight(hiddenView);
                baselinePlan = baselineResult.plan;
            case 12
                baselineResult = example12SynchronizedWindmills(hiddenView);
                baselinePlan = baselineResult.plan;
            case 15
                baselineResult = example15SpinningRodSpiral(hiddenView);
                baselinePlan = baselineResult.plan;
        end
        close all force;
        baselineSuccess(caseIndex) = baselinePlan.success;
        baselineSearch_s(caseIndex) = baselinePlan.searchElapsed_s;
        baselinePath_deg(caseIndex) = baselinePlan.angularPathLength_deg;
        baselineMovingSample = any( ...
            abs(baselinePlan.velocity_deg_s) > 1e-9, 2);
        finalBaselineMotion = find(baselineMovingSample, 1, "last");
        if isempty(finalBaselineMotion)
            baselineCompletion_s(caseIndex) = baselinePlan.startState.time_s;
        else
            baselineCompletion_s(caseIndex) = baselinePlan.time_s( ...
                finalBaselineMotion);
        end

        agentOptions = struct( ...
            "AgentMaxSearchTime_s", agentBudget_s, ...
            "AgentPrintDiagnostics", false, ...
            "PrintFailureSuggestions", false);
        missionOptionNames = [ ...
            "SafetyMargin_deg", ...
            "AllowAzimuthWrap", ...
            "Objective", ...
            "TimePaddingSamples", ...
            "MaximumVerticesPerRegion"];
        for missionOptionName = missionOptionNames
            if isfield(baselinePlan.options, missionOptionName)
                agentOptions.(missionOptionName) = baselinePlan.options.( ...
                    missionOptionName);
            end
        end

        agentTimer = tic;
        agentPlan = planAzElWithAgent( ...
            baselinePlan.workspace, ...
            baselinePlan.startState, baselinePlan.stopState, ...
            baselinePlan.limits, agentOptions);
        agentSearch_s(caseIndex) = toc(agentTimer);
        agentSuccess(caseIndex) = agentPlan.success && ...
            agentPlan.exactCollisionValidated;
        predictedProfile(caseIndex) = agentPlan.agent.PredictedProfileName;
        selectedProfile(caseIndex) = agentPlan.agent.SelectedProfileName;
        attemptCount(caseIndex) = numel(agentPlan.agent.Attempts);
        agentMessage(caseIndex) = agentPlan.message;
        if agentSuccess(caseIndex)
            agentPath_deg(caseIndex) = agentPlan.angularPathLength_deg;
            agentMovingSample = any( ...
                abs(agentPlan.velocity_deg_s) > 1e-9, 2);
            finalAgentMotion = find(agentMovingSample, 1, "last");
            if isempty(finalAgentMotion)
                agentCompletion_s(caseIndex) = agentPlan.startState.time_s;
            else
                agentCompletion_s(caseIndex) = agentPlan.time_s( ...
                    finalAgentMotion);
            end
        end
    catch benchmarkError
        close all force;
        agentMessage(caseIndex) = string(benchmarkError.identifier) + ": " + ...
            string(benchmarkError.message);
    end

    fprintf( ...
        "Example %02d baseline=%d agent=%d predicted=%s " + ...
        "selected=%s attempts=%d\n", ...
        exampleNumber, baselineSuccess(caseIndex), ...
        agentSuccess(caseIndex), predictedProfile(caseIndex), ...
        selectedProfile(caseIndex), attemptCount(caseIndex));
end

results = table( ...
    exampleNumbers(:), baselineSuccess, agentSuccess, ...
    baselineSearch_s, agentSearch_s, ...
    baselinePath_deg, agentPath_deg, ...
    baselineCompletion_s, agentCompletion_s, ...
    predictedProfile, selectedProfile, attemptCount, agentMessage, ...
    'VariableNames', cellstr([ ...
        "Example", "BaselineSuccess", "AgentSuccess", ...
        "BaselineSearch_s", "AgentSearch_s", ...
        "BaselinePath_deg", "AgentPath_deg", ...
        "BaselineCompletion_s", "AgentCompletion_s", ...
        "PredictedProfile", "SelectedProfile", ...
        "AttemptCount", "AgentMessage"]));
disp(results);
successfulComparison = baselineSuccess & agentSuccess;
if any(successfulComparison)
    medianRuntimeRatio = median( ...
        agentSearch_s(successfulComparison) ./ ...
        baselineSearch_s(successfulComparison));
    medianPathRatio = median( ...
        agentPath_deg(successfulComparison) ./ ...
        baselinePath_deg(successfulComparison));
else
    medianRuntimeRatio = Inf;
    medianPathRatio = Inf;
end
report = struct( ...
    "results", results, ...
    "applicableExampleCount", caseCount, ...
    "agentSuccessCount", nnz(agentSuccess), ...
    "agentSuccessRate", nnz(agentSuccess) / caseCount, ...
    "medianRuntimeRatioOnMutualSuccess", medianRuntimeRatio, ...
    "medianPathRatioOnMutualSuccess", medianPathRatio, ...
    "agentBudget_s", agentBudget_s);
fprintf( ...
    "\nAgent summary: %d/%d success (%.1f%%), " + ...
    "median runtime ratio %.3f, median path ratio %.3f.\n", ...
    report.agentSuccessCount, report.applicableExampleCount, ...
    100 * report.agentSuccessRate, ...
    report.medianRuntimeRatioOnMutualSuccess, ...
    report.medianPathRatioOnMutualSuccess);
end
