function plan = planAzElDijkstra( ...
        azElData, initialState, goalState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   options = planAzElDijkstra(limits, "defaults")
%   plan = planAzElDijkstra( ...
%       azElData, initialState, goalState, limits)
%   plan = planAzElDijkstra( ...
%       azElData, initialState, goalState, limits, options)
%**************************************************************************
% PURPOSE
%   - Plan one exact-checked azimuth/elevation/time trajectory with
%     goal-rooted Dijkstra for static geometry or safe-interval Dijkstra for
%     moving geometry.
%**************************************************************************
% INPUTS
%   - azElData (canonical obstacle data or packed obstacle field)
%       Obstacle geometry or a reusable preferred/legacy packed container.
%   - initialState (scalar struct)
%       time_s, position_deg, velocity_deg_s, and acceleration_deg_s2.
%   - goalState (scalar struct)
%       State schema matching initialState at a later time.
%   - limits (scalar struct)
%       azimuth_deg, elevation_deg, maxVelocity_deg_s, and
%       maxAcceleration_deg_s2 axis bounds.
%   - options (scalar struct)
%       Search, collision, objective, and output-diagnostic controls.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Stable success/failure schema with sampled commands, diagnostics,
%       resolved options, obstacleField, and deprecated workspace alias.
%       The explicit defaults call returns resolved argument-dependent
%       options instead.
%**************************************************************************
% UNITS
%   - Angular position is degrees. Time is seconds. Velocity is deg/s and
%     acceleration is deg/s^2.

%% Section 1: Validate Inputs & Apply Defaults
isDefaultsRequest = nargin == 2 && isstruct(azElData) && ...
    (ischar(initialState) || isstring(initialState)) && ...
    isscalar(string(initialState)) && ...
    strcmpi(strtrim(string(initialState)), "defaults");
if isDefaultsRequest
    limits = normalizePlannerLimits(azElData);
    plan = defaultAzElDijkstraOptions(limits);
    return;
end
timer = tic;
if nargin < 5 || isempty(options)
    options = struct();
end
explicitGraph = isstruct(options) && ...
    isfield(options, "GridStep_deg") && ...
    ~isempty(options.GridStep_deg) && ...
    isfield(options, "PrimitiveRadii_deg") && ...
    ~isempty(options.PrimitiveRadii_deg);
requiredStateFields = ["time_s", "position_deg", ...
    "velocity_deg_s", "acceleration_deg_s2"];
initialState = normalizeState( ...
    initialState, "initialState", requiredStateFields);
goalState = normalizeState(goalState, "goalState", requiredStateFields);
if goalState.time_s <= initialState.time_s
    error("planAzElDijkstra:InvalidTime", ...
        "goalState.time_s must follow initialState.time_s.");
end

limits = normalizePlannerLimits(limits);
defaultOptions = defaultAzElDijkstraOptions(limits);
if ~isstruct(options) || ~isscalar(options)
    error("planAzElDijkstra:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownOptionFields = setdiff( ...
    fieldnames(options), fieldnames(defaultOptions), "stable");
if ~isempty(unknownOptionFields)
    warning("planAzElDijkstra:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    options = rmfield(options, unknownOptionFields);
end
defaultOptionFields = fieldnames(defaultOptions);
for defaultOptionIndex = 1:numel(defaultOptionFields)
    defaultOptionField = defaultOptionFields{defaultOptionIndex};
    if ~isfield(options, defaultOptionField) || ...
            isempty(options.(defaultOptionField))
        options.(defaultOptionField) = defaultOptions.(defaultOptionField);
    end
end

finestGridStep_deg = options.GridStep_deg;
if isempty(options.GridStepSchedule_deg)
    if explicitGraph
        options.GridStepSchedule_deg = finestGridStep_deg;
    else
        options.GridStepSchedule_deg = unique( ...
            [4, 2, 1] * finestGridStep_deg, "stable");
    end
end
options.GridStepSchedule_deg = unique( ...
    double(options.GridStepSchedule_deg(:).'), "stable");
options.GridStepSchedule_deg = sort( ...
    options.GridStepSchedule_deg, "descend");
if isempty(options.ValidationStep_s)
    options.ValidationStep_s = min( ...
        options.SampleTime_s, finestGridStep_deg / ...
        max(limits.maxVelocity_deg_s) / 8);
end
if isempty(options.CollisionCheckStep_s)
    options.CollisionCheckStep_s = options.ValidationStep_s;
end

positiveOptionFields = ["SampleTime_s", "ValidationStep_s", ...
    "GridStep_deg", "CollisionCheckStep_s", ...
    "DirectionStep_deg", "MaxSearchTime_s", ...
    "RouteShortcutStep_deg"];
for positiveOptionField = positiveOptionFields
    validateattributes(options.(positiveOptionField), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
end
validateattributes(options.GridStepSchedule_deg, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
validateattributes(options.PrimitiveRadiusMultipliers, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
if ~isempty(options.PrimitiveRadii_deg)
    validateattributes(options.PrimitiveRadii_deg, {'numeric'}, ...
        {'vector', 'real', 'finite', 'positive'});
    options.PrimitiveRadii_deg = unique( ...
        double(options.PrimitiveRadii_deg(:).'));
end
positiveIntegerOptionFields = ["MaximumSafeIntervalSamples", ...
    "MaximumDepartureTrials", "DepartureBatchSize", ...
    "MaxExpansions", "InitialNodeCapacity"];
for positiveIntegerOptionField = positiveIntegerOptionFields
    validateattributes(options.(positiveIntegerOptionField), {'numeric'}, ...
        {'scalar', 'integer', 'positive'});
end
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.SafetyMargin_deg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.AllowAzimuthWrap, ...
    {'logical', 'numeric'}, {'scalar'});
options.AllowAzimuthWrap = logical(options.AllowAzimuthWrap);
validateattributes(options.AllowNonzeroTerminalState, ...
    {'logical', 'numeric'}, {'scalar'});
options.AllowNonzeroTerminalState = logical(options.AllowNonzeroTerminalState);
validateattributes(options.PrintFailureSuggestions, ...
    {'logical', 'numeric'}, {'scalar'});
options.PrintFailureSuggestions = logical(options.PrintFailureSuggestions);
if options.AllowAzimuthWrap && ...
        abs(diff(limits.azimuth_deg) - 360) > 1e-6
    error("planAzElDijkstra:InvalidWrapLimits", ...
        "Wrapped azimuth limits must span exactly 360 degrees.");
end

objectiveName = lower(strtrim(string(options.Objective)));
if any(objectiveName == ["minimumangulardistance", ...
        "angulardistance", "distance"])
    options.Objective = "minimumAngularDistance";
elseif any(objectiveName == ["minimumtime", "time"])
    options.Objective = "minimumTime";
else
    error("planAzElDijkstra:InvalidObjective", ...
        "Objective must be minimumAngularDistance or minimumTime.");
end

if any(abs([initialState.velocity_deg_s, ...
        initialState.acceleration_deg_s2]) > 1e-12)
    error("planAzElDijkstra:NonzeroBoundaryDynamics", ...
        "The maintainable planner requires a rest initial state.");
end
hasTerminalDynamics = any(abs([goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2]) > 1e-12);
if hasTerminalDynamics && ~options.AllowNonzeroTerminalState
    error("planAzElDijkstra:NonzeroTerminalStateDisabled", ...
        "Set AllowNonzeroTerminalState to true for terminal capture.");
end

%% Section 2: Build The Search Representation
isPrebuiltObstacleField = isstruct(azElData) && isscalar(azElData) && ...
    isfield(azElData, "Format") && ...
    any(string(azElData.Format) == [ ...
    "AzElTimeObstacleField", "AzElTimeObstacleWorkspace"]);
% Reusing a packed obstacle field avoids repacking polygons when a
% caller evaluates several initial/goal pairs against one obstacle field.
if isPrebuiltObstacleField
    obstacleField = azElData;
else
    obstacleField = buildAzElTimeObstacleField(azElData, struct( ...
        "MaximumVerticesPerRegion", options.MaximumVerticesPerRegion));
end

schedule = options.GridStepSchedule_deg(:).';
% A static minimum-distance case can use a cheaper complete 2-D graph.
% Terminal dynamics remain in the safe-interval search because the final
% edge must match velocity and acceleration at an exact arrival time.
obstacleFieldIsStatic = true;
for packedObstacle = reshape(obstacleField.Obstacles, 1, [])
    if packedObstacle.SampleCount == 0
        continue;
    end
    doesNotCoverPlanningInterval = packedObstacle.TimeSeconds(1) > ...
        initialState.time_s + 1e-9 || ...
        packedObstacle.TimeSeconds(end) < goalState.time_s - 1e-9;
    packedVertexCounts = double(diff(packedObstacle.SliceOffsets));
    if doesNotCoverPlanningInterval || ...
            any(packedVertexCounts ~= packedVertexCounts(1))
        obstacleFieldIsStatic = false;
        break;
    end
    firstVertexIndices = double(packedObstacle.SliceOffsets(1)): ...
        double(packedObstacle.SliceOffsets(2) - 1);
    firstAzimuth_deg = packedObstacle.AzimuthDeg(firstVertexIndices);
    firstElevation_deg = packedObstacle.ElevationDeg(firstVertexIndices);
    % Strict equality is intentional: equivalent polygons with reordered
    % vertices cannot safely share one static occupancy graph.
    for obstacleSampleIndex = 2:packedObstacle.SampleCount
        sampleVertexIndices = double( ...
            packedObstacle.SliceOffsets(obstacleSampleIndex)): ...
            double(packedObstacle.SliceOffsets(obstacleSampleIndex + 1) - 1);
        sampleMatchesFirst = isequaln( ...
            packedObstacle.AzimuthDeg(sampleVertexIndices), ...
            firstAzimuth_deg) && isequaln( ...
            packedObstacle.ElevationDeg(sampleVertexIndices), ...
            firstElevation_deg);
        if ~sampleMatchesFirst
            obstacleFieldIsStatic = false;
            break;
        end
    end
    if ~obstacleFieldIsStatic
        break;
    end
end
if ~hasTerminalDynamics && ...
        options.Objective == "minimumAngularDistance" && ...
        obstacleFieldIsStatic
    % --- Search Static Geometry From Coarse To Fine -----------------------
    staticAttemptTemplate = struct( ...
        "GridStep_deg", NaN, ...
        "PrimitiveRadii_deg", zeros(1, 0), ...
        "Success", false, ...
        "Message", "", ...
        "ExpandedNodeCount", 0, ...
        "GeneratedNodeCount", 0, ...
        "SearchElapsed_s", 0, ...
        "TerminationReason", "", ...
        "ObjectiveCost", Inf, ...
        "CandidateTime_s", zeros(0, 1), ...
        "CandidatePosition_deg", zeros(0, 2), ...
        "Selected", false);
    staticAttempts = repmat(staticAttemptTemplate, numel(schedule), 1);
    staticAttemptCount = 0;
    bestStaticPlan = struct();
    bestStaticRouteDistance_deg = Inf;

    % Each resolution is a complete finite graph. A coarse failure only
    % proves that graph cannot express a route, so finer levels still run.
    for staticGridLevel = 1:numel(schedule)
        remainingStaticTime_s = options.MaxSearchTime_s - toc(timer);
        if remainingStaticTime_s <= 0
            break;
        end
        staticOptions = options;
        staticOptions.GridStep_deg = schedule(staticGridLevel);
        staticOptions.PrintFailureSuggestions = false;
        remainingStaticLevelCount = numel(schedule) - staticGridLevel + 1;
        staticOptions.MaxSearchTime_s = remainingStaticTime_s / ...
            remainingStaticLevelCount;

        staticCandidate = solveStaticGoalDijkstra( ...
            obstacleField, initialState, goalState, limits, staticOptions);
        staticEndpointDelta_deg = wrappedDelta( ...
            initialState.position_deg, goalState.position_deg, ...
            limits, options);
        staticEndpointLowerBound_deg = hypot( ...
            staticEndpointDelta_deg(1), staticEndpointDelta_deg(2));
        if staticCandidate.success && abs( ...
                staticCandidate.angularPathLength_deg - ...
                staticEndpointLowerBound_deg) <= 1e-9
            staticCandidate.optimalGlobally = true;
            staticCandidate.suboptimalityBound = 1;
        end
        if staticCandidate.success
            staticCandidateTime_s = staticCandidate.time_s;
            staticCandidatePosition_deg = staticCandidate.position_deg;
            staticCandidateCost = staticCandidate.objectiveCost;
        else
            staticCandidateTime_s = zeros(0, 1);
            staticCandidatePosition_deg = zeros(0, 2);
            staticCandidateCost = Inf;
        end
        staticAttemptCount = staticAttemptCount + 1;
        staticAttempts(staticAttemptCount) = struct( ...
            "GridStep_deg", schedule(staticGridLevel), ...
            "PrimitiveRadii_deg", zeros(1, 0), ...
            "Success", staticCandidate.success, ...
            "Message", staticCandidate.message, ...
            "ExpandedNodeCount", staticCandidate.expandedNodeCount, ...
            "GeneratedNodeCount", staticCandidate.generatedNodeCount, ...
            "SearchElapsed_s", staticCandidate.searchElapsed_s, ...
            "TerminationReason", ...
            staticCandidate.topologySearch.TerminationReason, ...
            "ObjectiveCost", staticCandidateCost, ...
            "CandidateTime_s", staticCandidateTime_s, ...
            "CandidatePosition_deg", staticCandidatePosition_deg, ...
            "Selected", false);
        if staticCandidate.success && ...
                staticCandidate.objectiveCost < bestStaticRouteDistance_deg
            bestStaticPlan = staticCandidate;
            bestStaticRouteDistance_deg = staticCandidate.objectiveCost;
        end
        % The straight-line lower bound is a global certificate, so no
        % finer graph can improve a matching exact-validated route.
        if staticCandidate.success && staticCandidate.optimalGlobally
            break;
        end
    end
    staticAttempts = staticAttempts(1:staticAttemptCount);

    if ~isempty(fieldnames(bestStaticPlan))
        selectedStaticAttempt = find([staticAttempts.Success] & ...
            abs([staticAttempts.ObjectiveCost] - ...
            bestStaticRouteDistance_deg) <= 1e-9, 1, "last");
        staticAttempts(selectedStaticAttempt).Selected = true;
        bestStaticPlan.message = "Goal-rooted Dijkstra found an exact-checked route.";
        bestStaticPlan.method = "adaptiveGoalRootedDijkstra";
        bestStaticPlan.exactCollisionValidated = true;
        bestStaticPlan.selectedGridStep_deg = bestStaticPlan.options.GridStep_deg;
        bestStaticPlan.resolutionAttempts = staticAttempts;
        bestStaticPlan.safeIntervalSearch = struct();
        bestStaticPlan.searchElapsed_s = toc(timer);
        bestStaticPlan.options = options;
        plan = normalizeAzElDijkstraPlanSchema(bestStaticPlan);
        return;
    end
end

%% Section 3: Run Dijkstra
attemptTemplate = struct( ...
    "GridStep_deg", NaN, ...
    "PrimitiveRadii_deg", zeros(1, 0), ...
    "Success", false, ...
    "Message", "", ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "", ...
    "ObjectiveCost", Inf, ...
    "CandidateTime_s", zeros(0, 1), ...
    "CandidatePosition_deg", zeros(0, 2), ...
    "Selected", false);
attempts = repmat(attemptTemplate, numel(schedule), 1);
attemptCount = 0;
search = struct();
bestSearch = struct();
bestObjective = Inf;
bestGridStep = NaN;
endpointDelta = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
endpointLowerBound = hypot(endpointDelta(1), endpointDelta(2));

% Coarse failures only mean that a graph could not represent a route. Retry
% the same search at progressively finer spatial resolutions.
for level = 1:numel(schedule)
    remaining = options.MaxSearchTime_s - toc(timer);
    if remaining <= 0
        break;
    end

    levelOptions = options;
    levelOptions.GridStep_deg = schedule(level);
    if isempty(options.PrimitiveRadii_deg)
        levelOptions.PrimitiveRadii_deg = unique( ...
            schedule(level) * options.PrimitiveRadiusMultipliers);
    end
    remainingLevels = numel(schedule) - level + 1;
    % Reserve time for later levels so one difficult coarse graph cannot
    % consume the complete wall-time budget.
    levelBudget = remaining / remainingLevels;
    if level == numel(schedule)
        levelBudget = remaining;
    end
    levelOptions.MaxSearchTime_s = max( ...
        min(levelBudget, options.MaxSearchTime_s), 0.05);

    candidate = searchAzElSafeIntervalDijkstra(obstacleField, ...
        initialState, goalState, limits, levelOptions);
    if candidate.Success
        candidateTime = candidate.Profile.time_s;
        candidatePosition = candidate.Profile.position_deg;
        if options.Objective == "minimumAngularDistance"
            candidateCost = candidate.Route.angularPathLength_deg;
        else
            candidateCost = candidate.Route.arrivalTime_s(end);
        end
    else
        candidateTime = zeros(0, 1);
        candidatePosition = zeros(0, 2);
        candidateCost = Inf;
    end
    attemptCount = attemptCount + 1;
    attempts(attemptCount, 1) = struct( ...
        "GridStep_deg", schedule(level), ...
        "PrimitiveRadii_deg", ...
        levelOptions.PrimitiveRadii_deg, ...
        "Success", candidate.Success, ...
        "Message", candidate.Message, ...
        "ExpandedNodeCount", candidate.ExpandedNodeCount, ...
        "GeneratedNodeCount", candidate.GeneratedNodeCount, ...
        "SearchElapsed_s", candidate.SearchElapsed_s, ...
        "TerminationReason", candidate.TerminationReason, ...
        "ObjectiveCost", candidateCost, ...
        "CandidateTime_s", candidateTime, ...
        "CandidatePosition_deg", candidatePosition, ...
        "Selected", false);
    search = candidate;
    if candidate.Success
        if ~hasTerminalDynamics && ...
                abs(candidate.Route.angularPathLength_deg - ...
                endpointLowerBound) <= 1e-9
            candidate.GlobalAngularOptimal = true;
            search = candidate;
        end
        if options.Objective == "minimumAngularDistance"
            candidateObjective = candidate.Route.angularPathLength_deg;
        else
            candidateObjective = candidate.Route.arrivalTime_s(end);
        end
        if candidateObjective < bestObjective
            bestSearch = candidate;
            bestObjective = candidateObjective;
            bestGridStep = schedule(level);
        end
        % Stop only for an objective certificate or the minimum-time policy.
        % Otherwise keep the best validated candidate and continue refining.
        if candidate.GlobalAngularOptimal || ...
                options.Objective == "minimumTime"
            break;
        end
    end
end

attempts = attempts(1:attemptCount);
if ~isempty(fieldnames(bestSearch))
    search = bestSearch;
    selected = find([attempts.Success] & ...
        abs([attempts.ObjectiveCost] - bestObjective) <= 1e-9, 1, "last");
    attempts(selected).Selected = true;
end

if isempty(fieldnames(search)) || ~search.Success
    if isempty(fieldnames(search))
        message = "The search time budget expired before Dijkstra started.";
    else
        message = search.Message;
    end
    plan = struct( ...
        "success", false, ...
        "message", string(message), ...
        "method", "progressiveSafeIntervalDijkstra", ...
        "time_s", zeros(0, 1), ...
        "position_deg", zeros(0, 2), ...
        "positionUnwrapped_deg", zeros(0, 2), ...
        "velocity_deg_s", zeros(0, 2), ...
        "acceleration_deg_s2", zeros(0, 2), ...
        "isWaiting", false(0, 1), ...
        "cost_s", Inf, ...
        "objective", options.Objective, ...
        "objectiveCost", Inf, ...
        "objectiveCostUnits", "", ...
        "angularPathLength_deg", Inf, ...
        "angularLowerBound_deg", NaN, ...
        "suboptimalityBound", Inf, ...
        "optimalOnLattice", false, ...
        "optimalGlobally", false, ...
        "exactCollisionValidated", false, ...
        "expandedNodeCount", sum([attempts.ExpandedNodeCount]), ...
        "generatedNodeCount", sum([attempts.GeneratedNodeCount]), ...
        "searchElapsed_s", toc(timer), ...
        "selectedGridStep_deg", NaN, ...
        "startState", initialState, ...
        "stopState", goalState, ...
        "limits", limits, ...
        "options", options, ...
        "obstacleField", obstacleField, ...
        "workspace", obstacleField, ... % deprecated compatibility alias
        "resolutionAttempts", attempts, ...
        "safeIntervalSearch", search);
    plan = finalizeAzElPlanFailure(plan);
    plan = normalizeAzElDijkstraPlanSchema(plan);
    return;
end

profile = search.Profile;
route = search.Route;
% Search nodes are maneuver breakpoints. Profile is the uniform command
% history that downstream visualization and control code consumes.
delta = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
lowerBound = hypot(delta(1), delta(2));
if options.Objective == "minimumAngularDistance"
    objectiveCost = route.angularPathLength_deg;
    objectiveUnits = "deg";
else
    objectiveCost = route.arrivalTime_s(end) - initialState.time_s;
    objectiveUnits = "s";
end

%% Section 4: Assemble The Output
plan = struct( ...
    "success", true, ...
    "message", ...
    "Progressive safe-interval Dijkstra found an exact-checked trajectory.", ...
    "method", "progressiveSafeIntervalDijkstra", ...
    "time_s", profile.time_s, ...
    "position_deg", profile.position_deg, ...
    "positionUnwrapped_deg", profile.positionUnwrapped_deg, ...
    "velocity_deg_s", profile.velocity_deg_s, ...
    "acceleration_deg_s2", profile.acceleration_deg_s2, ...
    "isWaiting", profile.isWaiting, ...
    "cost_s", goalState.time_s - initialState.time_s, ...
    "objective", options.Objective, ...
    "objectiveCost", objectiveCost, ...
    "objectiveCostUnits", objectiveUnits, ...
    "angularPathLength_deg", route.angularPathLength_deg, ...
    "angularLowerBound_deg", lowerBound, ...
    "suboptimalityBound", ...
    max(1, route.angularPathLength_deg / max(lowerBound, eps)), ...
    "optimalOnLattice", false, ...
    "optimalGlobally", search.GlobalAngularOptimal, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", sum([attempts.ExpandedNodeCount]), ...
    "generatedNodeCount", sum([attempts.GeneratedNodeCount]), ...
    "searchElapsed_s", toc(timer), ...
    "selectedGridStep_deg", bestGridStep, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", limits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "resolutionAttempts", attempts, ...
    "safeIntervalSearch", search);
plan = normalizeAzElDijkstraPlanSchema(plan);
end

%% Section 5: Local Functions
function plan = solveStaticGoalDijkstra( ...
        obstacleField, initialState, goalState, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   plan = solveStaticGoalDijkstra( ...
%       obstacleField, initialState, goalState, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Solve and retime one complete static goal-rooted Dijkstra graph.
%**************************************************************************
% INPUTS
%   - obstacleField, initialState, goalState, axisLimits, options (planner inputs)
%       Packed geometry, boundary states, limits, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Successful or failed static-plan record.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees and time quantities are seconds.
% Static and moving geometry require different state representations. This
% complete per-resolution core remains separate so neither algorithm hides
% branches of the other inside its expansion loop.
staticTimer = tic;
topology = emptyGoalDijkstraResult(options);
endpointBlocked = queryAzElTimeObstacle(obstacleField, ...
    [initialState.position_deg(1); goalState.position_deg(1)], ...
    [initialState.position_deg(2); goalState.position_deg(2)], ...
    [initialState.time_s; goalState.time_s], struct( ...
    "CollisionMode", "polygon", ...
    "SafetyMarginDeg", options.SafetyMargin_deg));
if any(endpointBlocked)
    plan = failedStaticPlan( ...
        "The initial or goal state lies inside the inflated obstacle field.", ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end

if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    azimuthBinCount = ceil(azimuthSpan_deg / options.GridStep_deg);
    wrappedGridStep_deg = azimuthSpan_deg / azimuthBinCount;
    azimuthGrid_deg = axisLimits.azimuth_deg(1) + ...
        (0:azimuthBinCount - 1) * wrappedGridStep_deg;
else
    azimuthGrid_deg = inclusiveGrid( ...
        axisLimits.azimuth_deg, options.GridStep_deg);
end
elevationGrid_deg = inclusiveGrid( ...
    axisLimits.elevation_deg, options.GridStep_deg);
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
blockedGrid = queryAzElTimeObstacle(obstacleField, ...
    azimuthMesh_deg(:), elevationMesh_deg(:), initialState.time_s, ...
    struct("CollisionMode", "polygon", ...
    "SafetyMarginDeg", options.SafetyMargin_deg));
blockedGrid = reshape(blockedGrid, size(azimuthMesh_deg));

% --- Propagate Exact Lattice Cost Backward From The Goal -----------------
topologySearchTimer = tic;
blockedGrid = logical(blockedGrid);
elevationBinCount = numel(elevationGrid_deg);
azimuthBinCount = numel(azimuthGrid_deg);
gridStateCount = elevationBinCount * azimuthBinCount;
initialGridNode = nearestFreeGridNode(blockedGrid, ...
    azimuthGrid_deg, elevationGrid_deg, initialState.position_deg, ...
    options.AllowAzimuthWrap);
goalGridNode = nearestFreeGridNode(blockedGrid, ...
    azimuthGrid_deg, elevationGrid_deg, goalState.position_deg, ...
    options.AllowAzimuthWrap);
if initialGridNode == 0 || goalGridNode == 0
    topology = emptyGoalDijkstraResult(options);
    topology.Message = "No free grid state is available near an endpoint.";
    topology.SearchElapsed_s = toc(topologySearchTimer);
else
    costToGoal_deg = inf(gridStateCount, 1);
    nextNodeTowardGoal = zeros(gridStateCount, 1, "uint32");
    settledGridState = false(gridStateCount, 1);
    costToGoal_deg(goalGridNode) = 0;
    nextNodeTowardGoal(goalGridNode) = uint32(goalGridNode);
    frontierCapacity = options.InitialNodeCapacity;
    dijkstraFrontier = struct( ...
        "Node", zeros(frontierCapacity, 1, "uint32"), ...
        "Cost_deg", inf(frontierCapacity, 1), ...
        "Serial", zeros(frontierCapacity, 1, "uint64"), ...
        "Count", 0, ...
        "NextSerial", uint64(0));
    dijkstraFrontier = pushDijkstraFrontier( ...
        dijkstraFrontier, goalGridNode, 0);
    expandedGridStateCount = 0;
    generatedGridStateCount = 1;
    topologyTerminationReason = "";
    reachedInitialGridState = false;
    neighborElevationOffsets = [-1 -1 -1 0 0 1 1 1];
    neighborAzimuthOffsets = [-1 0 1 -1 1 -1 0 1];

    while dijkstraFrontier.Count > 0
        if toc(topologySearchTimer) >= options.MaxSearchTime_s
            topologyTerminationReason = "wallTimeLimit";
            break;
        end
        if expandedGridStateCount >= options.MaxExpansions
            topologyTerminationReason = "expansionLimit";
            break;
        end
        [dijkstraFrontier, currentGridNode, queuedCost_deg] = popDijkstraFrontier( ...
            dijkstraFrontier);
        queuedLabelWasSuperseded = queuedCost_deg > ...
            costToGoal_deg(currentGridNode) + 1e-12;
        if settledGridState(currentGridNode) || queuedLabelWasSuperseded
            continue;
        end
        settledGridState(currentGridNode) = true;
        expandedGridStateCount = expandedGridStateCount + 1;
        if currentGridNode == initialGridNode
            reachedInitialGridState = true;
            topologyTerminationReason = "goalCostReachedInitialState";
            break;
        end

        [currentElevationIndex, currentAzimuthIndex] = ind2sub( ...
            [elevationBinCount azimuthBinCount], currentGridNode);
        for neighborDirectionIndex = 1:numel(neighborElevationOffsets)
            neighborElevationIndex = currentElevationIndex + ...
                neighborElevationOffsets(neighborDirectionIndex);
            neighborAzimuthIndex = currentAzimuthIndex + ...
                neighborAzimuthOffsets(neighborDirectionIndex);
            if neighborElevationIndex < 1 || ...
                    neighborElevationIndex > elevationBinCount
                continue;
            end
            if options.AllowAzimuthWrap
                neighborAzimuthIndex = mod( ...
                    neighborAzimuthIndex - 1, azimuthBinCount) + 1;
            elseif neighborAzimuthIndex < 1 || ...
                    neighborAzimuthIndex > azimuthBinCount
                continue;
            end
            if blockedGrid(neighborElevationIndex, neighborAzimuthIndex)
                continue;
            end
            isDiagonalTransition = neighborElevationOffsets( ...
                neighborDirectionIndex) ~= 0 && ...
                neighborAzimuthOffsets(neighborDirectionIndex) ~= 0;
            if isDiagonalTransition
                % Corner cutting would manufacture zero-clearance routes
                % that the continuous obstacle does not actually permit.
                diagonalCutsBlockedCorner = blockedGrid( ...
                    currentElevationIndex, neighborAzimuthIndex) || ...
                    blockedGrid(neighborElevationIndex, ...
                    currentAzimuthIndex);
                if diagonalCutsBlockedCorner
                    continue;
                end
            end

            neighborGridNode = sub2ind( ...
                [elevationBinCount azimuthBinCount], ...
                neighborElevationIndex, neighborAzimuthIndex);
            azimuthDifference_deg = azimuthGrid_deg(neighborAzimuthIndex) - ...
                azimuthGrid_deg(currentAzimuthIndex);
            if options.AllowAzimuthWrap
                azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
                azimuthDifference_deg = mod( ...
                    azimuthDifference_deg + azimuthSpan_deg / 2, ...
                    azimuthSpan_deg) - azimuthSpan_deg / 2;
            end
            elevationDifference_deg = elevationGrid_deg( ...
                neighborElevationIndex) - ...
                elevationGrid_deg(currentElevationIndex);
            transitionDistance_deg = hypot( ...
                azimuthDifference_deg, elevationDifference_deg);
            candidateCost_deg = costToGoal_deg(currentGridNode) + ...
                transitionDistance_deg;
            existingNeighborCost_deg = costToGoal_deg( ...
                neighborGridNode) - 1e-12;
            if candidateCost_deg >= existingNeighborCost_deg
                continue;
            end
            costToGoal_deg(neighborGridNode) = candidateCost_deg;
            nextNodeTowardGoal(neighborGridNode) = uint32(currentGridNode);
            dijkstraFrontier = pushDijkstraFrontier( ...
                dijkstraFrontier, neighborGridNode, candidateCost_deg);
            generatedGridStateCount = generatedGridStateCount + 1;
        end
    end

    if ~reachedInitialGridState
        topology = emptyGoalDijkstraResult(options);
        if topologyTerminationReason == ""
            topologyTerminationReason = "noPath";
            topology.Message = "No lattice route connects the endpoints.";
        elseif topologyTerminationReason == "wallTimeLimit"
            topology.Message = "Dijkstra reached MaxSearchTime_s.";
        else
            topology.Message = "Dijkstra reached MaxExpansions.";
        end
        topology.ExpandedNodeCount = expandedGridStateCount;
        topology.GeneratedNodeCount = generatedGridStateCount;
        topology.SearchElapsed_s = toc(topologySearchTimer);
        topology.TerminationReason = topologyTerminationReason;
        topology.CostToGoal_deg = reshape( ...
            costToGoal_deg, size(blockedGrid));
        topology.SettledMask = reshape( ...
            settledGridState, size(blockedGrid));
    else
        % --- Reconstruct The Selected Goal-Directed Lattice Chain ---------
        gridNodePath = zeros(128, 1, "uint32");
        pathStateCount = 1;
        pathGridNode = uint32(initialGridNode);
        gridNodePath(pathStateCount) = pathGridNode;
        while pathGridNode ~= goalGridNode
            nextPathGridNode = nextNodeTowardGoal(pathGridNode);
            if nextPathGridNode == 0
                error("planAzElDijkstra:BrokenDijkstraSuccessor", ...
                    "Dijkstra produced an incomplete successor chain.");
            end
            pathStateCount = pathStateCount + 1;
            if pathStateCount > numel(gridNodePath)
                gridNodePath(2 * numel(gridNodePath), 1) = 0;
            end
            gridNodePath(pathStateCount) = nextPathGridNode;
            pathGridNode = nextPathGridNode;
        end
        gridNodePath = gridNodePath(1:pathStateCount);
        [pathElevationIndices, pathAzimuthIndices] = ind2sub( ...
            [elevationBinCount azimuthBinCount], double(gridNodePath));
        gridPath_deg = [azimuthGrid_deg(pathAzimuthIndices).', ...
            elevationGrid_deg(pathElevationIndices).'];
        if options.AllowAzimuthWrap
            azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
            for pathStateIndex = 2:size(gridPath_deg, 1)
                azimuthStep_deg = mod( ...
                    gridPath_deg(pathStateIndex, 1) - ...
                    gridPath_deg(pathStateIndex - 1, 1) + ...
                    azimuthSpan_deg / 2, azimuthSpan_deg) - ...
                    azimuthSpan_deg / 2;
                gridPath_deg(pathStateIndex, 1) = gridPath_deg( ...
                    pathStateIndex - 1, 1) + azimuthStep_deg;
            end
        end
        routeStep_deg = diff(gridPath_deg, 1, 1);
        topology = struct( ...
            "Success", true, ...
            "Message", ...
            "Goal-rooted Dijkstra cost reached the initial state.", ...
            "Method", "goalRootedDijkstra", ...
            "Path_deg", gridPath_deg, ...
            "GridNodePath", gridNodePath, ...
            "LatticeDistance_deg", sum(hypot( ...
                routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
            "ExpandedNodeCount", expandedGridStateCount, ...
            "GeneratedNodeCount", generatedGridStateCount, ...
            "SearchElapsed_s", toc(topologySearchTimer), ...
            "TerminationReason", topologyTerminationReason, ...
            "CostToGoal_deg", reshape( ...
                costToGoal_deg, size(blockedGrid)), ...
            "SettledMask", reshape( ...
                settledGridState, size(blockedGrid)), ...
            "BlockedMask", blockedGrid, ...
            "AzimuthGrid_deg", azimuthGrid_deg, ...
            "ElevationGrid_deg", elevationGrid_deg, ...
            "InitialGridNode", initialGridNode, ...
            "GoalGridNode", goalGridNode, ...
            "Options", options);
    end
end
if ~topology.Success
    plan = failedStaticPlan( ...
        "Goal-rooted Dijkstra failed: " + topology.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end

routePositions_deg = [initialState.position_deg; ...
    topology.Path_deg; goalState.position_deg];
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    for routeWaypointIndex = 2:size(routePositions_deg, 1)
        azimuthStep_deg = mod( ...
            routePositions_deg(routeWaypointIndex, 1) - ...
            routePositions_deg(routeWaypointIndex - 1, 1) + ...
            azimuthSpan_deg / 2, azimuthSpan_deg) - azimuthSpan_deg / 2;
        routePositions_deg(routeWaypointIndex, 1) = routePositions_deg( ...
            routeWaypointIndex - 1, 1) + azimuthStep_deg;
    end
end
% Endpoint insertion can duplicate its nearest lattice state. Removing only
% zero-length steps preserves every genuine turn for exact shortcut checks.
keepRouteWaypoint = true(size(routePositions_deg, 1), 1);
keepRouteWaypoint(2:end) = hypot( ...
    diff(routePositions_deg(:, 1)), ...
    diff(routePositions_deg(:, 2))) > 1e-10;
routePositions_deg = routePositions_deg(keepRouteWaypoint, :);
unshortenedRoute_deg = routePositions_deg;
% --- Remove Lattice Turns With Exact Line-Of-Sight Checks ----------------
shortcutTimer = tic;
inputWaypointCount = size(routePositions_deg, 1);
if inputWaypointCount <= 2
    shortcut = successfulShortcut( ...
        routePositions_deg, inputWaypointCount, 0, toc(shortcutTimer));
else
    retainedRoute_deg = zeros(size(routePositions_deg));
    retainedWaypointCount = 1;
    retainedRoute_deg(1, :) = routePositions_deg(1, :);
    currentWaypointIndex = 1;
    collisionCheckCount = 0;
    while currentWaypointIndex < inputWaypointCount
        farthestVisibleIndex = currentWaypointIndex;
        candidateWaypointIndex = currentWaypointIndex + 1;
        while candidateWaypointIndex <= inputWaypointCount
            collisionCheckCount = collisionCheckCount + 1;
            segmentInitialPosition_deg = routePositions_deg( ...
                currentWaypointIndex, :);
            segmentGoalPosition_deg = routePositions_deg( ...
                candidateWaypointIndex, :);
            segmentDisplacement_deg = segmentGoalPosition_deg - ...
                segmentInitialPosition_deg;
            segmentDistance_deg = hypot( ...
                segmentDisplacement_deg(1), segmentDisplacement_deg(2));
            segmentSampleCount = max(2, ceil( ...
                segmentDistance_deg / options.RouteShortcutStep_deg) + 1);
            segmentFraction = linspace(0, 1, segmentSampleCount).';
            queryPosition_deg = segmentInitialPosition_deg + ...
                segmentFraction .* segmentDisplacement_deg;
            if options.AllowAzimuthWrap
                azimuthSpan_deg = diff(axisLimits.azimuth_deg);
                queryPosition_deg(:, 1) = mod( ...
                    queryPosition_deg(:, 1) - ...
                    axisLimits.azimuth_deg(1), azimuthSpan_deg) + ...
                    axisLimits.azimuth_deg(1);
            end
            segmentBlocked = queryAzElTimeObstacle(obstacleField, ...
                queryPosition_deg(:, 1), queryPosition_deg(:, 2), ...
                initialState.time_s, struct( ...
                "CollisionMode", "polygon", ...
                "SafetyMarginDeg", options.SafetyMargin_deg));
            if any(segmentBlocked)
                break;
            end
            farthestVisibleIndex = candidateWaypointIndex;
            candidateWaypointIndex = candidateWaypointIndex + 1;
        end
        if farthestVisibleIndex == currentWaypointIndex
            shortcut = struct( ...
                "Success", false, ...
                "Message", ...
                "An adjacent lattice edge failed exact validation.", ...
                "Path_deg", zeros(0, 2), ...
                "RouteDistance_deg", Inf, ...
                "InputWaypointCount", inputWaypointCount, ...
                "OutputWaypointCount", 0, ...
                "CollisionCheckCount", collisionCheckCount, ...
                "Elapsed_s", toc(shortcutTimer));
            break;
        end
        retainedWaypointCount = retainedWaypointCount + 1;
        retainedRoute_deg(retainedWaypointCount, :) = routePositions_deg( ...
            farthestVisibleIndex, :);
        currentWaypointIndex = farthestVisibleIndex;
    end
    if farthestVisibleIndex ~= currentWaypointIndex || ...
            currentWaypointIndex == inputWaypointCount
        retainedRoute_deg = retainedRoute_deg(1:retainedWaypointCount, :);
        shortcut = successfulShortcut(retainedRoute_deg, ...
            inputWaypointCount, collisionCheckCount, toc(shortcutTimer));
    end
end
if ~shortcut.Success
    plan = failedStaticPlan( ...
        "Exact route shortcut validation failed: " + shortcut.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end
routePositions_deg = shortcut.Path_deg;

% --- Retime The Route With Synchronized Two-Axis Slews -------------------
retimingTimer = tic;
segmentDisplacement_deg = diff(routePositions_deg, 1, 1);
absoluteDisplacement_deg = abs(segmentDisplacement_deg.');
rateScaleCandidate = inf(size(absoluteDisplacement_deg));
accelerationScaleCandidate = inf(size(absoluteDisplacement_deg));
movingAxis = absoluteDisplacement_deg > 1e-12;
rateLimit_deg_s = axisLimits.maxVelocity_deg_s(:);
accelerationLimit_deg_s2 = axisLimits.maxAcceleration_deg_s2(:);
for axisIndex = 1:2
    activeSegment = movingAxis(axisIndex, :);
    rateScaleCandidate(axisIndex, activeSegment) = rateLimit_deg_s( ...
        axisIndex) ./ absoluteDisplacement_deg(axisIndex, activeSegment);
    accelerationScaleCandidate(axisIndex, activeSegment) = accelerationLimit_deg_s2( ...
        axisIndex) ./ ...
        absoluteDisplacement_deg(axisIndex, activeSegment);
end
normalizedRateLimit = min(rateScaleCandidate, [], 1);
normalizedAcceleration = min(accelerationScaleCandidate, [], 1);
stationarySegment = ~isfinite(normalizedRateLimit);
normalizedRateLimit(stationarySegment) = 0;
normalizedAcceleration(stationarySegment) = 1;

triangularProfile = normalizedRateLimit.^2 ./ normalizedAcceleration >= 1;
accelerationDuration_s = normalizedRateLimit ./ normalizedAcceleration;
accelerationDuration_s(triangularProfile) = sqrt( ...
    1 ./ normalizedAcceleration(triangularProfile));
normalizedPeakRate = normalizedAcceleration .* accelerationDuration_s;
accelerationDistance = normalizedAcceleration .* accelerationDuration_s.^2;
cruiseDuration_s = zeros(size(normalizedRateLimit));
cruisingProfile = ~triangularProfile & ~stationarySegment;
cruiseDuration_s(cruisingProfile) = (1 - ...
    accelerationDistance(cruisingProfile)) ./ ...
    normalizedPeakRate(cruisingProfile);
segmentDuration_s = 2 .* accelerationDuration_s + cruiseDuration_s;
segmentDuration_s(stationarySegment) = 0;

minimumManeuverTime_s = sum(segmentDuration_s);
availableManeuverTime_s = goalState.time_s - initialState.time_s;
if minimumManeuverTime_s > availableManeuverTime_s + 1e-9
    retimed = failedRetiming(sprintf( ...
        "Route needs %.3f s but only %.3f s is available.", ...
        minimumManeuverTime_s, availableManeuverTime_s), ...
        toc(retimingTimer));
else
    segmentInitialTime_s = initialState.time_s + ...
        [0, cumsum(segmentDuration_s(1:end - 1))];
    profile = makeStaticRouteProfile(initialState.time_s, ...
        goalState.time_s, routePositions_deg, segmentDisplacement_deg, ...
        segmentInitialTime_s, segmentDuration_s, normalizedPeakRate, ...
        normalizedAcceleration, options.SampleTime_s, axisLimits, options);
    maximumRate_deg_s = max(axisLimits.maxVelocity_deg_s);
    gridCollisionStep_s = options.GridStep_deg / maximumRate_deg_s / 4;
    collisionSampleStep_s = min([options.SampleTime_s, ...
        options.CollisionCheckStep_s, gridCollisionStep_s]);
    validationProfile = makeStaticRouteProfile( ...
        initialState.time_s, goalState.time_s, routePositions_deg, ...
        segmentDisplacement_deg, segmentInitialTime_s, ...
        segmentDuration_s, normalizedPeakRate, normalizedAcceleration, ...
        collisionSampleStep_s, axisLimits, options);
    blockedRetimedSamples = queryAzElTimeObstacle(obstacleField, ...
        validationProfile.position_deg(:, 1), ...
        validationProfile.position_deg(:, 2), ...
        validationProfile.time_s, struct( ...
        "SafetyMarginDeg", options.SafetyMargin_deg, ...
        "TimePaddingSamples", 1));
    if any(blockedRetimedSamples)
        retimed = failedRetiming( ...
            "The retimed route intersects the exact packed obstacle field.", ...
            toc(retimingTimer));
    else
        routeStep_deg = diff(routePositions_deg, 1, 1);
        retimed = struct( ...
            "Success", true, ...
            "Message", ...
            "Static route satisfies timing and exact collision checks.", ...
            "Profile", profile, ...
            "RouteDistance_deg", sum(hypot( ...
                routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
            "MinimumManeuverTime_s", minimumManeuverTime_s, ...
            "SegmentDuration_s", segmentDuration_s, ...
            "SegmentInitialTime_s", segmentInitialTime_s, ...
            "RoutePositions_deg", routePositions_deg, ...
            "SearchElapsed_s", toc(retimingTimer));
    end
end
if ~retimed.Success
    plan = failedStaticPlan( ...
        "Static route retiming failed: " + retimed.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    plan.preShortcutRoute_deg = unshortenedRoute_deg;
    plan.routeShortcut = shortcut;
    return;
end

profile = retimed.Profile;
routeDistance_deg = retimed.RouteDistance_deg;
endpointDelta_deg = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, axisLimits, options);
straightLineLowerBound_deg = hypot( ...
    endpointDelta_deg(1), endpointDelta_deg(2));
plan = struct( ...
    "success", true, ...
    "message", "Goal-rooted Dijkstra route found and retimed.", ...
    "method", "goalRootedDijkstra", ...
    "time_s", profile.time_s, ...
    "position_deg", profile.position_deg, ...
    "positionUnwrapped_deg", profile.positionUnwrapped_deg, ...
    "velocity_deg_s", profile.velocity_deg_s, ...
    "acceleration_deg_s2", profile.acceleration_deg_s2, ...
    "isWaiting", profile.isWaiting, ...
    "cost_s", goalState.time_s - initialState.time_s, ...
    "objective", "minimumAngularDistance", ...
    "objectiveCost", routeDistance_deg, ...
    "objectiveCostUnits", "deg", ...
    "angularPathLength_deg", routeDistance_deg, ...
    "angularLowerBound_deg", straightLineLowerBound_deg, ...
    "suboptimalityBound", max(1, routeDistance_deg / ...
        max(straightLineLowerBound_deg, eps)), ...
    "optimalOnLattice", false, ...
    "topologyOptimalOnLattice", true, ...
    "optimalGlobally", false, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", topology.ExpandedNodeCount, ...
    "generatedNodeCount", topology.GeneratedNodeCount, ...
    "searchElapsed_s", toc(staticTimer), ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", axisLimits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "topologySearch", topology, ...
    "preShortcutRoute_deg", unshortenedRoute_deg, ...
    "routeShortcut", shortcut, ...
    "autonomousRoute_deg", routePositions_deg, ...
    "retiming", retimed);
end

function gridValues = inclusiveGrid(gridLimits, gridStep)
%% Section 0: Header & Readme
% SYNTAX
%   gridValues = inclusiveGrid(gridLimits, gridStep)
%**************************************************************************
% PURPOSE
%   - Construct a grid that always includes both configured boundaries.
%**************************************************************************
% INPUTS
%   - gridLimits (numeric two-vector)
%       Inclusive axis limits.
%   - gridStep (positive numeric scalar)
%       Requested spacing.
%**************************************************************************
% OUTPUTS
%   - gridValues (double vector)
%       Inclusive grid.
%**************************************************************************
% UNITS
%   - All inputs and outputs share the caller's angular units.
% Both axes must include their upper boundary by the same rule even when
% the requested step does not divide the span exactly.
gridValues = gridLimits(1):gridStep:gridLimits(2);
if gridValues(end) < gridLimits(2) - 1e-9
    gridValues(end + 1) = gridLimits(2);
end
gridValues = double(gridValues);
end

function node = nearestFreeGridNode( ...
        blockedGrid, azimuthGrid_deg, elevationGrid_deg, ...
        requestedPosition_deg, allowAzimuthWrap)
%% Section 0: Header & Readme
% SYNTAX
%   node = nearestFreeGridNode( ...
%       blockedGrid, azimuthGrid_deg, elevationGrid_deg, ...
%       requestedPosition_deg, allowAzimuthWrap)
%**************************************************************************
% PURPOSE
%   - Attach a boundary state to its nearest free lattice node.
%**************************************************************************
% INPUTS
%   - blockedGrid (logical matrix)
%       Occupied lattice cells.
%   - azimuthGrid_deg, elevationGrid_deg, requestedPosition_deg (numeric)
%       Lattice axes and requested endpoint.
%   - allowAzimuthWrap (logical scalar)
%       Whether azimuth distance is periodic.
%**************************************************************************
% OUTPUTS
%   - node (nonnegative integer)
%       Linear grid index, or zero when no free node exists.
%**************************************************************************
% UNITS
%   - Angular inputs are degrees.
% Initial and goal endpoints must use identical blocked-cell and azimuth-seam
% rules when they are attached to the lattice.
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
azimuthDifference_deg = azimuthMesh_deg - requestedPosition_deg(1);
if allowAzimuthWrap
    azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
    azimuthDifference_deg = mod(azimuthDifference_deg + ...
        azimuthSpan_deg / 2, azimuthSpan_deg) - azimuthSpan_deg / 2;
end
distanceSquared_deg2 = azimuthDifference_deg.^2 + ...
    (elevationMesh_deg - requestedPosition_deg(2)).^2;
distanceSquared_deg2(blockedGrid) = Inf;
[nearestDistanceSquared_deg2, node] = min(distanceSquared_deg2(:));
if ~isfinite(nearestDistanceSquared_deg2)
    node = 0;
end
end

function azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg)
%% Section 0: Header & Readme
% SYNTAX
%   azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg)
%**************************************************************************
% PURPOSE
%   - Recover the periodic span from a grid without a duplicate endpoint.
%**************************************************************************
% INPUTS
%   - azimuthGrid_deg (numeric vector)
%       Uniform wrapped azimuth samples.
%**************************************************************************
% OUTPUTS
%   - azimuthSpan_deg (numeric scalar)
%       Inferred periodic span.
%**************************************************************************
% UNITS
%   - Input and output are degrees.
% Nearest-node selection, transition costs, and path unwrapping must infer
% the same periodic span from a grid that omits its duplicate endpoint.
azimuthSpan_deg = azimuthGrid_deg(end) - azimuthGrid_deg(1);
if numel(azimuthGrid_deg) > 1
    azimuthSpan_deg = azimuthSpan_deg + median(diff(azimuthGrid_deg));
end
end

function shortcut = successfulShortcut( ...
        routePositions_deg, inputWaypointCount, ...
        collisionCheckCount, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   shortcut = successfulShortcut( ...
%       routePositions_deg, inputWaypointCount, ...
%       collisionCheckCount, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared successful shortcut diagnostic schema.
%**************************************************************************
% INPUTS
%   - routePositions_deg (numeric N-by-2 matrix)
%       Retained route.
%   - inputWaypointCount, collisionCheckCount (nonnegative integers)
%       Input size and validation work.
%   - elapsed_s (nonnegative scalar)
%       Shortcut wall time.
%**************************************************************************
% OUTPUTS
%   - shortcut (scalar struct)
%       Successful shortcut diagnostics.
%**************************************************************************
% UNITS
%   - Route coordinates are degrees and elapsed_s is seconds.
% Both the trivial and searched shortcut paths return this exact schema;
% centralizing it keeps diagnostics consistent.
routeStep_deg = diff(routePositions_deg, 1, 1);
shortcut = struct( ...
    "Success", true, ...
    "Message", "Exact visibility shortcutting complete.", ...
    "Path_deg", routePositions_deg, ...
    "RouteDistance_deg", sum(hypot( ...
        routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
    "InputWaypointCount", inputWaypointCount, ...
    "OutputWaypointCount", size(routePositions_deg, 1), ...
    "CollisionCheckCount", collisionCheckCount, ...
    "Elapsed_s", elapsed_s);
end

function profile = makeStaticRouteProfile( ...
        initialTime_s, goalTime_s, routePositions_deg, ...
        segmentDisplacement_deg, segmentInitialTime_s, ...
        segmentDuration_s, normalizedPeakRate, ...
        normalizedAcceleration, sampleTime_s, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makeStaticRouteProfile( ...
%       initialTime_s, goalTime_s, routePositions_deg, ...
%       segmentDisplacement_deg, segmentInitialTime_s, ...
%       segmentDuration_s, normalizedPeakRate, ...
%       normalizedAcceleration, sampleTime_s, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Sample synchronized static-route motion for output or validation.
%**************************************************************************
% INPUTS
%   - route and timing arguments (numeric)
%       Waypoints, segment laws, time horizon, and sample spacing.
%   - axisLimits, options (scalar structs)
%       Canonicalization limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Sampled position, velocity, acceleration, and waiting state.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
% Output and dense validation sample the same retimed motion law at different
% rates, so this shared evaluator prevents validation/output disagreement.
time_s = (initialTime_s:sampleTime_s:goalTime_s).';
if time_s(end) < goalTime_s
    time_s(end + 1, 1) = goalTime_s;
end
elapsedSegmentTime_s = time_s - segmentInitialTime_s;
accelerationDuration_s = normalizedPeakRate ./ normalizedAcceleration;
accelerationDistance = 0.5 .* normalizedAcceleration .* ...
    accelerationDuration_s.^2;
cruiseDuration_s = max(0, ...
    segmentDuration_s - 2 .* accelerationDuration_s);
segmentProgress = zeros(size(elapsedSegmentTime_s));
segmentRate = zeros(size(elapsedSegmentTime_s));
segmentAcceleration = zeros(size(elapsedSegmentTime_s));

accelerationMatrix = repmat( ...
    normalizedAcceleration, numel(time_s), 1);
accelerationDurationMatrix_s = repmat( ...
    accelerationDuration_s, numel(time_s), 1);
accelerationDistanceMatrix = repmat( ...
    accelerationDistance, numel(time_s), 1);
peakRateMatrix = repmat(normalizedPeakRate, numel(time_s), 1);
segmentDurationMatrix_s = repmat(segmentDuration_s, numel(time_s), 1);

accelerating = elapsedSegmentTime_s > 0 & ...
    elapsedSegmentTime_s < accelerationDuration_s;
segmentProgress(accelerating) = 0.5 .* ...
    accelerationMatrix(accelerating) .* ...
    elapsedSegmentTime_s(accelerating).^2;
segmentRate(accelerating) = accelerationMatrix(accelerating) .* ...
    elapsedSegmentTime_s(accelerating);
segmentAcceleration(accelerating) = accelerationMatrix(accelerating);

cruising = elapsedSegmentTime_s >= accelerationDuration_s & ...
    elapsedSegmentTime_s < accelerationDuration_s + cruiseDuration_s;
segmentProgress(cruising) = accelerationDistanceMatrix(cruising) + ...
    peakRateMatrix(cruising) .* ...
    (elapsedSegmentTime_s(cruising) - ...
    accelerationDurationMatrix_s(cruising));
segmentRate(cruising) = peakRateMatrix(cruising);

decelerationStart_s = accelerationDuration_s + cruiseDuration_s;
decelerating = elapsedSegmentTime_s >= decelerationStart_s & ...
    elapsedSegmentTime_s < segmentDuration_s;
remainingSegmentTime_s = segmentDurationMatrix_s - elapsedSegmentTime_s;
segmentProgress(decelerating) = 1 - 0.5 .* ...
    accelerationMatrix(decelerating) .* ...
    remainingSegmentTime_s(decelerating).^2;
segmentRate(decelerating) = accelerationMatrix(decelerating) .* ...
    remainingSegmentTime_s(decelerating);
segmentAcceleration(decelerating) = -accelerationMatrix(decelerating);
segmentProgress(elapsedSegmentTime_s >= segmentDuration_s) = 1;
positionUnwrapped_deg = routePositions_deg(1, :) + ...
    segmentProgress * segmentDisplacement_deg;
velocity_deg_s = segmentRate * segmentDisplacement_deg;
acceleration_deg_s2 = segmentAcceleration * segmentDisplacement_deg;
position_deg = positionUnwrapped_deg;
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    position_deg(:, 1) = mod(position_deg(:, 1) - ...
        axisLimits.azimuth_deg(1), azimuthSpan_deg) + ...
        axisLimits.azimuth_deg(1);
end
acceleration_deg_s2([1 end], :) = 0;
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "positionUnwrapped_deg", positionUnwrapped_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "isWaiting", all(abs(velocity_deg_s) <= 1e-10, 2) & ...
        all(abs(acceleration_deg_s2) <= 1e-10, 2));
end

function retimed = failedRetiming(message, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   retimed = failedRetiming(message, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared failed-retiming diagnostic schema.
%**************************************************************************
% INPUTS
%   - message (scalar text)
%       Failure explanation.
%   - elapsed_s (nonnegative scalar)
%       Retiming wall time.
%**************************************************************************
% OUTPUTS
%   - retimed (scalar struct)
%       Failed retiming diagnostics.
%**************************************************************************
% UNITS
%   - elapsed_s is seconds; empty route fields retain named angular units.
% Both infeasible timing and collision failures expose the same diagnostic
% fields to the resolution controller.
retimed = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "Profile", struct(), ...
    "RouteDistance_deg", Inf, ...
    "MinimumManeuverTime_s", Inf, ...
    "SegmentDuration_s", zeros(1, 0), ...
    "SegmentInitialTime_s", zeros(1, 0), ...
    "RoutePositions_deg", zeros(0, 2), ...
    "SearchElapsed_s", elapsed_s);
end

function plan = failedStaticPlan( ...
        message, obstacleField, initialState, goalState, axisLimits, ...
        options, topology, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   plan = failedStaticPlan( ...
%       message, obstacleField, initialState, goalState, axisLimits, ...
%       options, topology, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared static-planner failure schema.
%**************************************************************************
% INPUTS
%   - message, obstacleField, initialState, goalState (failure context)
%       Explanation, geometry, and boundary states.
%   - axisLimits, options, topology, elapsed_s (diagnostic context)
%       Limits, resolved controls, topology evidence, and elapsed time.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Failed static plan.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees and elapsed_s is seconds.
% Endpoint, topology, shortcut, and retiming failures share one diagnostic
% schema so the resolution controller can compare attempts safely.
plan = struct( ...
    "success", false, ...
    "message", string(message), ...
    "method", "goalRootedDijkstra", ...
    "time_s", zeros(0, 1), ...
    "position_deg", zeros(0, 2), ...
    "positionUnwrapped_deg", zeros(0, 2), ...
    "velocity_deg_s", zeros(0, 2), ...
    "acceleration_deg_s2", zeros(0, 2), ...
    "isWaiting", false(0, 1), ...
    "cost_s", Inf, ...
    "objective", options.Objective, ...
    "objectiveCost", Inf, ...
    "objectiveCostUnits", "deg", ...
    "angularPathLength_deg", Inf, ...
    "angularLowerBound_deg", NaN, ...
    "suboptimalityBound", Inf, ...
    "optimalOnLattice", false, ...
    "topologyOptimalOnLattice", false, ...
    "optimalGlobally", false, ...
    "exactCollisionValidated", false, ...
    "expandedNodeCount", topology.ExpandedNodeCount, ...
    "generatedNodeCount", topology.GeneratedNodeCount, ...
    "searchElapsed_s", elapsed_s, ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", axisLimits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "topologySearch", topology);
end

function result = emptyGoalDijkstraResult(options)
%% Section 0: Header & Readme
% SYNTAX
%   result = emptyGoalDijkstraResult(options)
%**************************************************************************
% PURPOSE
%   - Define the shared empty topology-search diagnostic schema.
%**************************************************************************
% INPUTS
%   - options (scalar struct)
%       Resolved planner controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Empty goal-rooted Dijkstra result.
%**************************************************************************
% UNITS
%   - Unit-bearing fields identify degrees or seconds.
% Endpoint attachment and all search terminations initialize the same
% topology fields before adding case-specific diagnostics.
result = struct( ...
    "Success", false, ...
    "Message", "Goal-rooted Dijkstra did not run.", ...
    "Method", "goalRootedDijkstra", ...
    "Path_deg", zeros(0, 2), ...
    "GridNodePath", zeros(0, 1, "uint32"), ...
    "LatticeDistance_deg", Inf, ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "notRun", ...
    "CostToGoal_deg", zeros(0, 0), ...
    "SettledMask", false(0, 0), ...
    "BlockedMask", false(0, 0), ...
    "AzimuthGrid_deg", zeros(1, 0), ...
    "ElevationGrid_deg", zeros(1, 0), ...
    "InitialGridNode", 0, ...
    "GoalGridNode", 0, ...
    "Options", options);
end

function frontier = pushDijkstraFrontier(frontier, node, cost_deg)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = pushDijkstraFrontier(frontier, node, cost_deg)
%**************************************************************************
% PURPOSE
%   - Push one cost-labeled node onto the static binary min-heap.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays, count, and serial state.
%   - node (positive integer)
%       Grid node index.
%   - cost_deg (nonnegative scalar)
%       Cost-to-go label.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - cost_deg is degrees; other values are dimensionless.
% Push and pop share the comparison/swap helpers below so equal-cost states
% retain deterministic FIFO tie-breaking.
if frontier.Count >= numel(frontier.Node)
    previousCapacity = numel(frontier.Node);
    expandedCapacity = 2 * previousCapacity;
    frontier.Node(expandedCapacity, 1) = 0;
    frontier.Cost_deg(previousCapacity + 1:expandedCapacity, 1) = Inf;
    frontier.Serial(previousCapacity + 1:expandedCapacity, 1) = 0;
end
frontier.Count = frontier.Count + 1;
frontier.NextSerial = frontier.NextSerial + 1;
frontierIndex = frontier.Count;
frontier.Node(frontierIndex) = uint32(node);
frontier.Cost_deg(frontierIndex) = cost_deg;
frontier.Serial(frontierIndex) = frontier.NextSerial;
while frontierIndex > 1
    parentIndex = floor(frontierIndex / 2);
    if ~dijkstraFrontierEntryIsLess( ...
            frontier, frontierIndex, parentIndex)
        break;
    end
    frontier = swapDijkstraFrontierEntries( ...
        frontier, frontierIndex, parentIndex);
    frontierIndex = parentIndex;
end
end

function [frontier, node, cost_deg] = popDijkstraFrontier(frontier)
%% Section 0: Header & Readme
% SYNTAX
%   [frontier, node, cost_deg] = popDijkstraFrontier(frontier)
%**************************************************************************
% PURPOSE
%   - Remove the minimum-cost static frontier entry.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Nonempty static binary min-heap.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%   - node (positive integer)
%       Removed grid node.
%   - cost_deg (nonnegative scalar)
%       Removed cost label.
%**************************************************************************
% UNITS
%   - cost_deg is degrees; other values are dimensionless.
% This is paired with pushDijkstraFrontier and intentionally reuses the same
% ordering primitive instead of duplicating heap rules.
node = double(frontier.Node(1));
cost_deg = frontier.Cost_deg(1);
frontier.Node(1) = frontier.Node(frontier.Count);
frontier.Cost_deg(1) = frontier.Cost_deg(frontier.Count);
frontier.Serial(1) = frontier.Serial(frontier.Count);
frontier.Count = frontier.Count - 1;
frontierIndex = 1;
while true
    leftChildIndex = 2 * frontierIndex;
    rightChildIndex = leftChildIndex + 1;
    if leftChildIndex > frontier.Count
        break;
    end
    smallerChildIndex = leftChildIndex;
    if rightChildIndex <= frontier.Count && ...
            dijkstraFrontierEntryIsLess( ...
            frontier, rightChildIndex, leftChildIndex)
        smallerChildIndex = rightChildIndex;
    end
    if ~dijkstraFrontierEntryIsLess( ...
            frontier, smallerChildIndex, frontierIndex)
        break;
    end
    frontier = swapDijkstraFrontierEntries( ...
        frontier, smallerChildIndex, frontierIndex);
    frontierIndex = smallerChildIndex;
end
end

function less = dijkstraFrontierEntryIsLess( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   less = dijkstraFrontierEntryIsLess( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Compare static heap entries by cost and deterministic serial order.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to compare.
%**************************************************************************
% OUTPUTS
%   - less (logical scalar)
%       True when the first entry precedes the second.
%**************************************************************************
% UNITS
%   - Comparison result and indices are dimensionless.
% Both heap directions depend on this single tolerance and serial ordering
% rule.
costTolerance_deg = 1e-12;
if frontier.Cost_deg(firstIndex) < ...
        frontier.Cost_deg(secondIndex) - costTolerance_deg
    less = true;
elseif frontier.Cost_deg(firstIndex) > ...
        frontier.Cost_deg(secondIndex) + costTolerance_deg
    less = false;
else
    less = frontier.Serial(firstIndex) < frontier.Serial(secondIndex);
end
end

function frontier = swapDijkstraFrontierEntries( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = swapDijkstraFrontierEntries( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Swap every parallel array in two static heap entries.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to exchange.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - Indices are dimensionless; stored cost units remain degrees.
% Push and pop both swap three parallel arrays; centralizing it prevents
% frontier corruption when the schema changes.
fieldNames = ["Node", "Cost_deg", "Serial"];
for fieldName = fieldNames
    temporaryValue = frontier.(fieldName)(firstIndex);
    frontier.(fieldName)(firstIndex) = frontier.(fieldName)(secondIndex);
    frontier.(fieldName)(secondIndex) = temporaryValue;
end
end

function delta = wrappedDelta(fromPosition, toPosition, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   delta = wrappedDelta(fromPosition, toPosition, limits, options)
%**************************************************************************
% PURPOSE
%   - Compute the shortest configured two-axis displacement.
%**************************************************************************
% INPUTS
%   - fromPosition, toPosition (numeric angular arrays)
%       Boundary positions.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - delta (numeric angular array)
%       Shortest signed displacement.
%**************************************************************************
% UNITS
%   - Positions and delta are degrees.
% Static and dynamic graph operations must agree on the shortest azimuth
% displacement at the periodic seam.
delta = toPosition - fromPosition;
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    delta(1) = mod(delta(1) + span / 2, span) - span / 2;
end
end

function state = normalizeState(state, label, requiredState)
%% Section 0: Header & Readme
% SYNTAX
%   state = normalizeState(state, label, requiredState)
%**************************************************************************
% PURPOSE
%   - Validate one planner boundary-state schema and orientation.
%**************************************************************************
% INPUTS
%   - state (scalar struct)
%       Boundary state to validate.
%   - label (text)
%       Diagnostic state name.
%   - requiredState (string vector)
%       Required field names.
%**************************************************************************
% OUTPUTS
%   - state (scalar struct)
%       Validated double state.
%**************************************************************************
% UNITS
%   - Units are encoded in required field names.
% Initial and goal states share one public schema; centralizing this repeated
% validation prevents one endpoint from accepting a different shape.
if ~isstruct(state) || ~isscalar(state) || ...
        ~all(isfield(state, cellstr(requiredState)))
    error("planAzElDijkstra:InvalidState", ...
        "%s is missing a required field.", label);
end
validateattributes(state.time_s, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
for name = requiredState(2:end)
    validateattributes(state.(name), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    state.(name) = reshape(double(state.(name)), 1, 2);
end
state.time_s = double(state.time_s);
end

function result = searchAzElSafeIntervalDijkstra( ...
        obstacleField, startState, stopState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = searchAzElSafeIntervalDijkstra( ...
%       obstacleField, startState, stopState, limits, options)
%**************************************************************************
% PURPOSE
%   - Find a continuous-time route through event-compressed safe intervals.
%**************************************************************************
% INPUTS
%   - obstacleField, startState, stopState, limits, options (planner inputs)
%       Packed geometry, boundary states, limits, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Route, sampled profile, search diagnostics, and resolved options.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
%
% Each state is an az/el grid point paired with one run-length-compressed
% safe time interval. Dijkstra minimizes the earliest arrival label for that
% state. Transitions are analytic rest-to-rest slews checked against the
% moving packed polygons; an enabled final edge may match nonzero terminal
% dynamics. Time remains continuous inside each interval, so waiting does
% not create one state per time sample.

%% Section 1: Classify Safe Intervals
timer = tic;
hasTerminalDynamics = options.AllowNonzeroTerminalState && ...
    any(abs([stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2]) > 1e-12);
% Event times are the only instants used to classify a stationary grid
% point. Long consecutive safe runs are compressed into one SIPP interval.
packedObstacles = obstacleField.Obstacles;
eventTimeParts = cell(numel(packedObstacles) + 1, 1);
eventTimeParts{1} = [startState.time_s; stopState.time_s];
for obstacleIndex = 1:numel(packedObstacles)
    obstacle = packedObstacles(obstacleIndex);
    obstacleTimes_s = double(obstacle.TimeSeconds(:));
    isInsideSearchHorizon = obstacleTimes_s >= startState.time_s & ...
        obstacleTimes_s <= stopState.time_s;
    eventTimeParts{obstacleIndex + 1} = ...
        obstacleTimes_s(isInsideSearchHorizon);
end
eventTimes = unique(vertcat(eventTimeParts{:}));
if numel(eventTimes) > options.MaximumSafeIntervalSamples
    retainedEventIndices = unique(round(linspace( ...
        1, numel(eventTimes), options.MaximumSafeIntervalSamples)));
    eventTimes = eventTimes(retainedEventIndices);
    eventTimes = unique([ ...
        startState.time_s; eventTimes; stopState.time_s]);
end
if numel(eventTimes) < 2
    eventTimes = [startState.time_s; stopState.time_s];
end
safeCache = containers.Map( ...
    'KeyType', 'char', 'ValueType', 'any');
safeQueryCount = 0;

[startIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
    startState.position_deg, obstacleField, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
startInterval = find( ...
    startState.time_s >= startIntervals(:, 1) - 1e-9 & ...
    startState.time_s <= startIntervals(:, 2) + 1e-9, 1);
if isempty(startInterval)
    startInterval = 0;
end
if startInterval == 0
    result = failedResult( ...
        "The start is not inside a sampled safe interval.", ...
        eventTimes, safeCache, safeQueryCount, toc(timer), options);
    return;
end

[goalIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
    stopState.position_deg, obstacleField, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
goalInterval = find( ...
    stopState.time_s >= goalIntervals(:, 1) - 1e-9 & ...
    stopState.time_s <= goalIntervals(:, 2) + 1e-9, 1);
if isempty(goalInterval)
    goalInterval = 0;
end
if goalInterval == 0
    result = failedResult( ...
        "The stop is not inside a sampled safe interval.", ...
        eventTimes, safeCache, safeQueryCount, toc(timer), options);
    return;
end

[directFound, directRoute, directProfile] = deal(false, struct(), struct());
% A collision-free direct slew has the Euclidean lower-bound distance and is
% therefore a global certificate for the angular-distance objective.
if ~hasTerminalDynamics
    directDelta_deg = wrappedDelta( ...
        startState.position_deg, stopState.position_deg, limits, options);
    [directDuration_s, directMotion] = segmentMotion( ...
        directDelta_deg, limits);
    startSafeInterval_s = startIntervals(startInterval, :);
    goalSafeInterval_s = goalIntervals(goalInterval, :);
    if directDuration_s <= 1e-12
        requiredSafeEndTime_s = stopState.time_s - 1e-9;
        allowedSafeStartTime_s = startState.time_s + 1e-9;
        startRemainsSafe = startSafeInterval_s(2) >= requiredSafeEndTime_s;
        goalAlreadySafe = goalSafeInterval_s(1) <= allowedSafeStartTime_s;
        directFound = startRemainsSafe && goalAlreadySafe;
        directDeparture_s = startState.time_s;
        directArrival_s = startState.time_s;
    else
        [directFound, directDeparture_s, directArrival_s] = scheduleTransition( ...
            obstacleField, startState.position_deg, ...
            directDelta_deg, startState.time_s, ...
            startSafeInterval_s, goalSafeInterval_s, ...
            directDuration_s, directMotion, eventTimes, limits, options);
    end
    if directFound
        if directDuration_s <= 1e-12
            directRoute = struct( ...
                "position_deg", startState.position_deg, ...
                "positionUnwrapped_deg", startState.position_deg, ...
                "arrivalTime_s", startState.time_s, ...
                "departureTime_s", stopState.time_s, ...
                "motionDuration_s", 0, ...
                "waitingDuration_s", ...
                stopState.time_s - startState.time_s, ...
                "hasTerminalCapture", false, ...
                "terminalVelocity_deg_s", [0 0], ...
                "terminalAcceleration_deg_s2", [0 0], ...
                "angularPathLength_deg", 0);
        else
            directUnwrappedGoal_deg = startState.position_deg + ...
                directDelta_deg;
            directRoute = struct( ...
                "position_deg", [ ...
                startState.position_deg; stopState.position_deg], ...
                "positionUnwrapped_deg", [ ...
                startState.position_deg; directUnwrappedGoal_deg], ...
                "arrivalTime_s", [ ...
                startState.time_s; directArrival_s], ...
                "departureTime_s", [ ...
                directDeparture_s; stopState.time_s], ...
                "motionDuration_s", [directDuration_s; 0], ...
                "waitingDuration_s", [ ...
                directDeparture_s - startState.time_s; ...
                stopState.time_s - directArrival_s], ...
                "hasTerminalCapture", false, ...
                "terminalVelocity_deg_s", [0 0], ...
                "terminalAcceleration_deg_s2", [0 0], ...
                "angularPathLength_deg", hypot( ...
                directDelta_deg(1), directDelta_deg(2)));
        end
        directProfile = makeRouteProfile( ...
            directRoute, startState.time_s, stopState.time_s, ...
            options.SampleTime_s, limits, options);
        directValidationProfile = makeRouteProfile( ...
            directRoute, startState.time_s, stopState.time_s, ...
            options.ValidationStep_s, limits, options);
        directBlocked = queryAzElTimeObstacle(obstacleField, ...
            [directValidationProfile.position_deg(:, 1); ...
            directProfile.position_deg(:, 1)], ...
            [directValidationProfile.position_deg(:, 2); ...
            directProfile.position_deg(:, 2)], ...
            [directValidationProfile.time_s; directProfile.time_s], ...
            collisionOptions(options));
        directFound = ~any(directBlocked);
        if ~directFound
            directRoute = struct();
            directProfile = struct();
        end
    end
end
if directFound && options.Objective == "minimumAngularDistance"
    result = struct( ...
        "Success", true, ...
        "Message", ...
        "A direct wait-and-slew trajectory certifies the global " + ...
        "minimum angular distance.", ...
        "Method", "directSafeIntervalCertificate", ...
        "Route", directRoute, ...
        "Profile", directProfile, ...
        "ExpandedNodeCount", 0, ...
        "GeneratedNodeCount", 1, ...
        "SafeIntervalQueryCount", safeQueryCount, ...
        "SafeIntervalCacheCount", safeCache.Count, ...
        "EventTimeCount", numel(eventTimes), ...
        "EventTimes_s", eventTimes, ...
        "SearchElapsed_s", toc(timer), ...
        "TerminationReason", "globalAngularCertificate", ...
        "BlockedValidationSampleCount", 0, ...
        "GlobalAngularOptimal", true, ...
        "Options", options);
    return;
end

%% Section 2: Initialize The Search Graph
primitiveRadii_deg = unique(double(options.PrimitiveRadii_deg(:)));
primitiveAngles_rad = deg2rad((0:options.DirectionStep_deg: ...
    360 - options.DirectionStep_deg).');
offsets = zeros( ...
    numel(primitiveRadii_deg) * numel(primitiveAngles_rad), 2);
offsetCursor = 1;
for primitiveRadius_deg = reshape(primitiveRadii_deg, 1, [])
    primitiveDirectionCount = numel(primitiveAngles_rad);
    directionRows = offsetCursor: ...
        offsetCursor + primitiveDirectionCount - 1;
    offsets(directionRows, :) = primitiveRadius_deg * [ ...
        cos(primitiveAngles_rad), sin(primitiveAngles_rad)];
    offsetCursor = offsetCursor + primitiveDirectionCount;
end
offsets = unique(round(offsets * 1e9) / 1e9, "rows", "stable");
% One node represents (spatial grid point, safe-interval index). Arrival time
% is the label optimized within that state; waiting remains continuous.
nodeCapacity = options.InitialNodeCapacity;
nodes = struct( ...
    "PositionDeg", zeros(nodeCapacity, 2), ...
    "IntervalIndex", zeros(nodeCapacity, 1), ...
    "ArrivalTime_s", inf(nodeCapacity, 1), ...
    "ParentIndex", zeros(nodeCapacity, 1, "uint32"), ...
    "DepartureTime_s", nan(nodeCapacity, 1), ...
    "MotionDuration_s", zeros(nodeCapacity, 1), ...
    "Count", 0);
startKey = stateKey( ...
    startState.position_deg, startInterval, limits, options);
[nodes, startIndex] = appendNode(nodes, ...
    startState.position_deg, startInterval, startState.time_s, ...
    0, NaN, 0);
bestNode = containers.Map( ...
    'KeyType', 'char', 'ValueType', 'double');
bestNode(startKey) = startIndex;
arrivalFrontier = struct( ...
    "Node", zeros(nodeCapacity, 1, "uint32"), ...
    "ArrivalTime_s", inf(nodeCapacity, 1), ...
    "Serial", zeros(nodeCapacity, 1, "uint64"), ...
    "Count", 0, ...
    "NextSerial", uint64(0));
arrivalFrontier = pushArrivalFrontier( ...
    arrivalFrontier, startIndex, startState.time_s);

%% Section 3: Run Dijkstra
expanded = 0;
generated = 1;
goalIndex = 0;
while arrivalFrontier.Count > 0
    if toc(timer) >= options.MaxSearchTime_s
        result = failedResult( ...
            "Safe-interval Dijkstra reached its wall-time limit.", ...
            eventTimes, safeCache, safeQueryCount, toc(timer), options);
        result.ExpandedNodeCount = expanded;
        result.GeneratedNodeCount = generated;
        result.TerminationReason = "wallTimeLimit";
        return;
    end
    if expanded >= options.MaxExpansions
        result = failedResult( ...
            "Safe-interval Dijkstra reached its expansion limit.", ...
            eventTimes, safeCache, safeQueryCount, toc(timer), options);
        result.ExpandedNodeCount = expanded;
        result.GeneratedNodeCount = generated;
        result.TerminationReason = "expansionLimit";
        return;
    end

    [arrivalFrontier, currentIndex] = popArrivalFrontier(arrivalFrontier);
    currentPosition = nodes.PositionDeg(currentIndex, :);
    currentIntervalIndex = nodes.IntervalIndex(currentIndex);
    currentKey = stateKey( ...
        currentPosition, currentIntervalIndex, limits, options);
    % Better labels are appended instead of mutating queued entries. Ignore
    % superseded labels when they eventually reach the frontier root.
    if ~isKey(bestNode, currentKey) || ...
            bestNode(currentKey) ~= currentIndex
        continue;
    end

    if samePosition( ...
            currentPosition, stopState.position_deg, limits, options) && ...
            currentIntervalIndex == goalInterval
        goalIndex = currentIndex;
        break;
    end

    expanded = expanded + 1;
    [currentIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
        currentPosition, obstacleField, eventTimes, limits, options, ...
        safeCache, safeQueryCount);
    currentSafe = currentIntervals(currentIntervalIndex, :);
    candidates = currentPosition + offsets;
    candidates(:, 1) = round(( ...
        candidates(:, 1) - limits.azimuth_deg(1)) / ...
        options.GridStep_deg) * options.GridStep_deg + ...
        limits.azimuth_deg(1);
    candidates(:, 1) = canonicalAzimuth( ...
        candidates(:, 1), limits, options);
    candidates(:, 2) = round(( ...
        candidates(:, 2) - limits.elevation_deg(1)) / ...
        options.GridStep_deg) * options.GridStep_deg + ...
        limits.elevation_deg(1);
    minimumElevation_deg = limits.elevation_deg(1) - 1e-9;
    maximumElevation_deg = limits.elevation_deg(2) + 1e-9;
    isInsideElevationLimits = candidates(:, 2) >= minimumElevation_deg & ...
        candidates(:, 2) <= maximumElevation_deg;
    if ~options.AllowAzimuthWrap
        minimumAzimuth_deg = limits.azimuth_deg(1) - 1e-9;
        maximumAzimuth_deg = limits.azimuth_deg(2) + 1e-9;
        isInsideAzimuthLimits = candidates(:, 1) >= minimumAzimuth_deg & ...
            candidates(:, 1) <= maximumAzimuth_deg;
        isInsideElevationLimits = isInsideElevationLimits & ...
            isInsideAzimuthLimits;
    end
    validPrimitiveCandidates = candidates(isInsideElevationLimits, :);
    candidates = zeros(size(validPrimitiveCandidates, 1) + 1, 2);
    candidates(1:end - 1, :) = validPrimitiveCandidates;
    candidates(end, :) = stopState.position_deg;
    candidates = unique( ...
        round(candidates * 1e9) / 1e9, "rows", "stable");
    isCurrentPosition = false(size(candidates, 1), 1);
    for candidateRow = 1:size(candidates, 1)
        isCurrentPosition(candidateRow) = samePosition( ...
            currentPosition, candidates(candidateRow, :), limits, options);
    end
    candidates = candidates(~isCurrentPosition, :);

    for candidateIndex = 1:size(candidates, 1)
        candidatePosition = candidates(candidateIndex, :);
        delta = wrappedDelta( ...
            currentPosition, candidatePosition, limits, options);
        terminalCandidate = hasTerminalDynamics && ...
            samePosition(candidatePosition, ...
            stopState.position_deg, limits, options);
        % Internal primitives are rest-to-rest. Only the final capture edge
        % may use a quintic that ends with nonzero target kinematics.
        if terminalCandidate
            motionDuration = NaN;
            motion = struct();
        else
            [motionDuration, motion] = segmentMotion(delta, limits);
            if motionDuration <= 1e-12
                continue;
            end
        end
        [candidateIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
            candidatePosition, obstacleField, ...
            eventTimes, limits, options, safeCache, safeQueryCount);
        if isempty(candidateIntervals)
            continue;
        end

        for intervalIndex = 1:size(candidateIntervals, 1)
            candidateSafe = candidateIntervals(intervalIndex, :);
            if samePosition(candidatePosition, ...
                    stopState.position_deg, limits, options) && ...
                    intervalIndex ~= goalInterval
                continue;
            end
            if terminalCandidate
                scheduled = false;
                departureTime = NaN;
                arrivalTime = NaN;
                motionDuration = NaN;
                candidateSafeStart_s = candidateSafe(1) - 1e-9;
                candidateSafeEnd_s = candidateSafe(2) + 1e-9;
                goalInsideCandidateInterval = ...
                    stopState.time_s >= candidateSafeStart_s && ...
                    stopState.time_s <= candidateSafeEnd_s;
                earliestTerminalDeparture_s = max( ...
                    nodes.ArrivalTime_s(currentIndex), currentSafe(1));
                latestTerminalDeparture_s = min( ...
                    currentSafe(2), stopState.time_s - 1e-6);
                terminalWindowIsOrdered = ...
                    latestTerminalDeparture_s >= ...
                    earliestTerminalDeparture_s;
                if goalInsideCandidateInterval && terminalWindowIsOrdered
                    terminalEventCandidates_s = eventTimes( ...
                        eventTimes >= earliestTerminalDeparture_s & ...
                        eventTimes <= latestTerminalDeparture_s);
                    uniformTerminalTrialCount = min( ...
                        options.MaximumDepartureTrials, 16);
                    uniformTerminalCandidates_s = linspace( ...
                        earliestTerminalDeparture_s, ...
                        latestTerminalDeparture_s, ...
                        uniformTerminalTrialCount).';
                    terminalDepartureCandidates_s = unique([ ...
                        earliestTerminalDeparture_s; ...
                        terminalEventCandidates_s; ...
                        uniformTerminalCandidates_s; ...
                        latestTerminalDeparture_s]);
                    if numel(terminalDepartureCandidates_s) > ...
                            options.MaximumDepartureTrials
                        retainedTerminalTrials = unique(round(linspace( ...
                            1, numel(terminalDepartureCandidates_s), ...
                            options.MaximumDepartureTrials)));
                        terminalDepartureCandidates_s = ...
                            terminalDepartureCandidates_s( ...
                            retainedTerminalTrials);
                    end
                    for terminalTrialIndex = 1:numel( ...
                            terminalDepartureCandidates_s)
                        trialDeparture_s = terminalDepartureCandidates_s( ...
                            terminalTrialIndex);
                        trialDuration_s = stopState.time_s - ...
                            trialDeparture_s;
                        maximumVelocity_deg_s = limits.maxVelocity_deg_s + 1e-9;
                        maximumAcceleration_deg_s2 = ...
                            limits.maxAcceleration_deg_s2 + 1e-9;
                        terminalVelocityIsValid = all(abs( ...
                            stopState.velocity_deg_s) <= maximumVelocity_deg_s);
                        terminalAccelerationMagnitude_deg_s2 = ...
                            abs(stopState.acceleration_deg_s2);
                        terminalAccelerationIsValid = all( ...
                            terminalAccelerationMagnitude_deg_s2 <= ...
                            maximumAcceleration_deg_s2);
                        terminalDynamicsInsideLimits = trialDuration_s > 0 && ...
                            terminalVelocityIsValid && ...
                            terminalAccelerationIsValid;
                        if ~terminalDynamicsInsideLimits
                            continue;
                        end
                        terminalDelta_deg = wrappedDelta( ...
                            currentPosition, stopState.position_deg, ...
                            limits, options);
                        terminalStopPosition_deg = currentPosition + ...
                            terminalDelta_deg;
                        terminalCheckStep_s = min( ...
                            options.CollisionCheckStep_s, ...
                            options.ValidationStep_s);
                        terminalSampleCount = max(21, ...
                            ceil(trialDuration_s / ...
                            terminalCheckStep_s) + 1);
                        terminalElapsed_s = linspace( ...
                            0, trialDuration_s, ...
                            terminalSampleCount).';
                        terminalProfile = evaluateAzElBoundaryProfile( ...
                            currentPosition, [0 0], [0 0], ...
                            terminalStopPosition_deg, ...
                            stopState.velocity_deg_s, ...
                            stopState.acceleration_deg_s2, ...
                            trialDuration_s, terminalElapsed_s);
                        terminalRateExceeded = any(abs( ...
                            terminalProfile.velocity_deg_s) > ...
                            limits.maxVelocity_deg_s + 1e-9, "all");
                        terminalAccelerationExceeded = any(abs( ...
                            terminalProfile.acceleration_deg_s2) > ...
                            limits.maxAcceleration_deg_s2 + 1e-9, "all");
                        if terminalRateExceeded || ...
                                terminalAccelerationExceeded
                            continue;
                        end
                        terminalPosition_deg = terminalProfile.position_deg;
                        minimumElevation_deg = limits.elevation_deg(1) - 1e-9;
                        maximumElevation_deg = limits.elevation_deg(2) + 1e-9;
                        aboveMinimumElevation = ...
                            terminalPosition_deg(:, 2) >= ...
                            minimumElevation_deg;
                        belowMaximumElevation = ...
                            terminalPosition_deg(:, 2) <= ...
                            maximumElevation_deg;
                        terminalInsideLimits = aboveMinimumElevation & ...
                            belowMaximumElevation;
                        if ~options.AllowAzimuthWrap
                            minimumAzimuth_deg = limits.azimuth_deg(1) - 1e-9;
                            maximumAzimuth_deg = limits.azimuth_deg(2) + 1e-9;
                            aboveMinimumAzimuth = ...
                                terminalPosition_deg(:, 1) >= ...
                                minimumAzimuth_deg;
                            belowMaximumAzimuth = ...
                                terminalPosition_deg(:, 1) <= ...
                                maximumAzimuth_deg;
                            terminalInsideLimits = terminalInsideLimits & ...
                                aboveMinimumAzimuth & belowMaximumAzimuth;
                        end
                        if ~all(terminalInsideLimits)
                            continue;
                        end
                        terminalQueryPosition_deg = terminalPosition_deg;
                        terminalQueryPosition_deg(:, 1) = canonicalAzimuth( ...
                            terminalQueryPosition_deg(:, 1), ...
                            limits, options);
                        terminalBlocked = queryAzElTimeObstacle( ...
                            obstacleField, ...
                            terminalQueryPosition_deg(:, 1), ...
                            terminalQueryPosition_deg(:, 2), ...
                            trialDeparture_s + terminalElapsed_s, ...
                            collisionOptions(options));
                        if ~any(terminalBlocked)
                            scheduled = true;
                            departureTime = trialDeparture_s;
                            arrivalTime = stopState.time_s;
                            motionDuration = trialDuration_s;
                            break;
                        end
                    end
                end
            else
                [scheduled, departureTime, arrivalTime] = scheduleTransition( ...
                    obstacleField, currentPosition, delta, ...
                    nodes.ArrivalTime_s(currentIndex), currentSafe, ...
                    candidateSafe, motionDuration, motion, eventTimes, ...
                    limits, options);
            end
            % A transition includes any wait at the parent and must arrive
            % inside the child's safe interval before the mission deadline.
            if ~scheduled || arrivalTime > stopState.time_s + 1e-9
                continue;
            end

            candidateKey = stateKey( ...
                candidatePosition, intervalIndex, limits, options);
            if isKey(bestNode, candidateKey)
                previousBestNodeIndex = bestNode(candidateKey);
                previousArrivalTime_s = nodes.ArrivalTime_s( ...
                    previousBestNodeIndex);
                if arrivalTime >= previousArrivalTime_s - 1e-9
                    continue;
                end
            end
            remainingDelta_deg = wrappedDelta( ...
                candidatePosition, stopState.position_deg, limits, options);
            if hasTerminalDynamics
                minimumRemainingTravelTime_s = max( ...
                    abs(remainingDelta_deg) ./ limits.maxVelocity_deg_s);
            else
                [minimumRemainingTravelTime_s, ~] = segmentMotion( ...
                    remainingDelta_deg, limits);
            end
            if arrivalTime + minimumRemainingTravelTime_s > ...
                    stopState.time_s + 1e-9
                continue;
            end
            [nodes, nextIndex] = appendNode(nodes, ...
                candidatePosition, intervalIndex, arrivalTime, ...
                currentIndex, departureTime, motionDuration);
            bestNode(candidateKey) = nextIndex;
            generated = generated + 1;
            % Arrival time is the complete queue cost. The lower bound only
            % rejects labels that cannot meet the deadline.
            arrivalFrontier = pushArrivalFrontier( ...
                arrivalFrontier, nextIndex, arrivalTime);
        end
    end
end

if goalIndex == 0
    result = failedResult( ...
        "No safe-interval Dijkstra path reaches the stop state.", ...
        eventTimes, safeCache, safeQueryCount, toc(timer), options);
    result.ExpandedNodeCount = expanded;
    result.GeneratedNodeCount = generated;
    result.TerminationReason = "noPath";
    return;
end

%% Section 4: Reconstruct & Validate The Route
nodePath = zeros(128, 1, "uint32");
nodePathCount = 0;
pathNodeIndex = uint32(goalIndex);
while pathNodeIndex ~= 0
    nodePathCount = nodePathCount + 1;
    if nodePathCount > numel(nodePath)
        nodePath(2 * numel(nodePath), 1) = 0;
    end
    nodePath(nodePathCount) = pathNodeIndex;
    pathNodeIndex = nodes.ParentIndex(pathNodeIndex);
end
nodePath = double(flipud(nodePath(1:nodePathCount)));
routePosition_deg = nodes.PositionDeg(nodePath, :);
routeArrivalTime_s = nodes.ArrivalTime_s(nodePath);
routeDepartureTime_s = nan(numel(nodePath), 1);
routeMotionDuration_s = zeros(numel(nodePath), 1);
for routeEdgeIndex = 1:numel(nodePath) - 1
    childNodeIndex = nodePath(routeEdgeIndex + 1);
    routeDepartureTime_s(routeEdgeIndex) = nodes.DepartureTime_s( ...
        childNodeIndex);
    routeMotionDuration_s(routeEdgeIndex) = nodes.MotionDuration_s( ...
        childNodeIndex);
end
routeDepartureTime_s(end) = stopState.time_s;

routePositionUnwrapped_deg = routePosition_deg;
routePositionUnwrapped_deg(1, :) = startState.position_deg;
% Canonical positions may jump at the azimuth seam. The unwrapped copy
% cannot, because it drives both motion derivatives and path length.
for routeNodeIndex = 2:size(routePosition_deg, 1)
    routeStep_deg = wrappedDelta( ...
        routePositionUnwrapped_deg(routeNodeIndex - 1, :), ...
        routePosition_deg(routeNodeIndex, :), limits, options);
    routePositionUnwrapped_deg(routeNodeIndex, :) = routePositionUnwrapped_deg( ...
        routeNodeIndex - 1, :) + routeStep_deg;
end
if size(routePositionUnwrapped_deg, 1) == 1
    routePositionUnwrapped_deg(end, :) = stopState.position_deg;
else
    finalRouteStep_deg = wrappedDelta( ...
        routePositionUnwrapped_deg(end - 1, :), ...
        stopState.position_deg, limits, options);
    routePositionUnwrapped_deg(end, :) = routePositionUnwrapped_deg( ...
        end - 1, :) + finalRouteStep_deg;
end
routePosition_deg(:, 1) = canonicalAzimuth( ...
    routePositionUnwrapped_deg(:, 1), limits, options);
routePosition_deg(:, 2) = routePositionUnwrapped_deg(:, 2);
hasTerminalCapture = options.AllowNonzeroTerminalState && ...
    any(abs([stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2]) > 1e-12);
route = struct( ...
    "position_deg", routePosition_deg, ...
    "positionUnwrapped_deg", routePositionUnwrapped_deg, ...
    "arrivalTime_s", routeArrivalTime_s, ...
    "departureTime_s", routeDepartureTime_s, ...
    "motionDuration_s", routeMotionDuration_s, ...
    "waitingDuration_s", max( ...
    0, routeDepartureTime_s - routeArrivalTime_s), ...
    "hasTerminalCapture", hasTerminalCapture, ...
    "terminalVelocity_deg_s", stopState.velocity_deg_s, ...
    "terminalAcceleration_deg_s2", stopState.acceleration_deg_s2, ...
    "angularPathLength_deg", sum(hypot( ...
    diff(routePositionUnwrapped_deg(:, 1)), ...
    diff(routePositionUnwrapped_deg(:, 2)))));
profile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.SampleTime_s, limits, options);
validationProfile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.ValidationStep_s, limits, options);
route.angularPathLength_deg = sum(hypot( ...
    diff(validationProfile.positionUnwrapped_deg(:, 1)), ...
    diff(validationProfile.positionUnwrapped_deg(:, 2))));
blocked = queryAzElTimeObstacle(obstacleField, ...
    [validationProfile.position_deg(:, 1); profile.position_deg(:, 1)], ...
    [validationProfile.position_deg(:, 2); profile.position_deg(:, 2)], ...
    [validationProfile.time_s; profile.time_s], ...
    collisionOptions(options));
% Safe intervals guide the graph search; the packed polygons remain the
% authority. Validate both the fine safety grid and the returned sample grid.
if any(blocked)
    result = failedResult( ...
        sprintf('Safe-interval Dijkstra failed dense validation at %d samples.', ...
        nnz(blocked)), eventTimes, safeCache, ...
        safeQueryCount, toc(timer), options);
    result.ExpandedNodeCount = expanded;
    result.GeneratedNodeCount = generated;
    result.TerminationReason = "denseValidationFailed";
    result.Route = route;
    result.Profile = profile;
    result.BlockedValidationSampleCount = nnz(blocked);
    return;
end

result = struct( ...
    "Success", true, ...
    "Message", "Dynamic safe-interval Dijkstra path found and validated.", ...
    "Method", "adaptiveSafeIntervalDijkstra", ...
    "Route", route, ...
    "Profile", profile, ...
    "ExpandedNodeCount", expanded, ...
    "GeneratedNodeCount", generated, ...
    "SafeIntervalQueryCount", safeQueryCount, ...
    "SafeIntervalCacheCount", safeCache.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", toc(timer), ...
    "TerminationReason", "goalReached", ...
    "BlockedValidationSampleCount", 0, ...
    "GlobalAngularOptimal", false, ...
    "Options", options);
end

function [intervals, cache, queryCount] = safeIntervalsAt( ...
        position, obstacleField, eventTimes, limits, options, cache, queryCount)
%% Section 0: Header & Readme
% SYNTAX
%   [intervals, cache, queryCount] = safeIntervalsAt( ...
%       position, obstacleField, eventTimes, limits, options, ...
%       cache, queryCount)
%**************************************************************************
% PURPOSE
%   - Classify and cache maximal safe time intervals at one position.
%**************************************************************************
% INPUTS
%   - position, obstacleField, eventTimes, limits, options (query inputs)
%       Spatial point, geometry, event grid, limits, and collision controls.
%   - cache, queryCount (diagnostic state)
%       Shared classification cache and cumulative query count.
%**************************************************************************
% OUTPUTS
%   - intervals (numeric N-by-2 matrix)
%       Inclusive safe interval bounds.
%   - cache, queryCount (updated diagnostic state)
%       Shared cache and count.
%**************************************************************************
% UNITS
%   - Position is degrees and intervals/eventTimes are seconds.
% Start, goal, and expanded nodes share this cache so one position has one
% authoritative event classification throughout the search.
key = positionKey(position, limits, options);
if isKey(cache, key)
    intervals = cache(key);
    return;
end
blocked = queryAzElTimeObstacle(obstacleField, ...
    repmat(canonicalAzimuth(position(1), limits, options), ...
    numel(eventTimes), 1), ...
    repmat(position(2), numel(eventTimes), 1), ...
    eventTimes, collisionOptions(options));
safe = ~blocked(:);
% Run-length compression is the key SIPP reduction: hundreds of safe samples
% at one position become a single continuous waiting state.
changes = diff([false; safe; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
intervals = [eventTimes(starts), eventTimes(stops)]; %#ok<FNDSB>
cache(key) = intervals;
queryCount = queryCount + numel(eventTimes);
end

function [scheduled, departure, arrival] = scheduleTransition( ...
        obstacleField, startPosition, delta, currentArrival, currentSafe, ...
        candidateSafe, duration, motion, eventTimes, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   [scheduled, departure, arrival] = scheduleTransition( ...
%       obstacleField, startPosition, delta, currentArrival, ...
%       currentSafe, candidateSafe, duration, motion, ...
%       eventTimes, limits, options)
%**************************************************************************
% PURPOSE
%   - Find the earliest collision-free departure for one motion primitive.
%**************************************************************************
% INPUTS
%   - obstacleField, startPosition, delta, motion (motion inputs)
%       Geometry and analytic primitive definition.
%   - timing arguments, eventTimes, limits, options (search inputs)
%       Safe windows, duration, event grid, limits, and controls.
%**************************************************************************
% OUTPUTS
%   - scheduled (logical scalar)
%       True when a feasible departure exists.
%   - departure, arrival (numeric scalars)
%       Selected transition times, or NaN on failure.
%**************************************************************************
% UNITS
%   - Position/delta are degrees and all timing arguments are seconds.
% Direct certification and graph expansion must apply identical waiting and
% collision rules, so this shared transition scheduler prevents divergence.
earliestDeparture_s = max(currentArrival, candidateSafe(1) - duration);
latestDeparture_s = min(currentSafe(2), candidateSafe(2) - duration);
% This window keeps both endpoint occupancy constraints valid.
if latestDeparture_s < earliestDeparture_s - 1e-9
    scheduled = false;
    departure = NaN;
    arrival = NaN;
    return;
end

departureCandidates_s = eventTimes( ...
    eventTimes >= earliestDeparture_s & eventTimes <= latestDeparture_s);
% Test interval boundaries and obstacle event times first; those are where
% feasibility changes. The trial cap controls worst-case edge cost.
departureCandidates_s = unique( ...
    [earliestDeparture_s; departureCandidates_s; latestDeparture_s]);
if numel(departureCandidates_s) > options.MaximumDepartureTrials
    retainedCandidateIndices = unique(round(linspace( ...
        1, numel(departureCandidates_s), options.MaximumDepartureTrials)));
    departureCandidates_s = departureCandidates_s(retainedCandidateIndices);
end
scheduled = false;
departure = NaN;
arrival = NaN;
batchSize = options.DepartureBatchSize;
for batchStartIndex = 1:batchSize:numel(departureCandidates_s)
    candidateIndices = batchStartIndex:min( ...
        batchStartIndex + batchSize - 1, numel(departureCandidates_s));
    trialDepartures_s = departureCandidates_s(candidateIndices);
    trialCount = numel(trialDepartures_s);
    trialAzimuth_deg = cell(trialCount, 1);
    trialElevation_deg = cell(trialCount, 1);
    trialTime_s = cell(trialCount, 1);
    trialOwner = cell(trialCount, 1);
    relativeSampleCount = max(2, ...
        ceil(duration / options.CollisionCheckStep_s) + 1);
    regularElapsed_s = linspace(0, duration, relativeSampleCount).';
    for trialIndex = 1:trialCount
        trialDeparture_s = trialDepartures_s(trialIndex);
        trialArrival_s = trialDeparture_s + duration;
        missionAlignedTimes_s = [ ...
            alignedTimes(trialDeparture_s, trialArrival_s, ...
            options.ValidationStep_s, eventTimes(1)); ...
            alignedTimes(trialDeparture_s, trialArrival_s, ...
            options.SampleTime_s, eventTimes(1))];
        % The duration-relative and mission-aligned grids close different
        % aliasing gaps against a moving obstacle.
        trialElapsed_s = unique([ ...
            regularElapsed_s; missionAlignedTimes_s - trialDeparture_s]);
        [trialProgress, ~, ~] = segmentProgress( ...
            trialElapsed_s, duration, motion);
        trialUnwrappedAzimuth_deg = startPosition(1) + ...
            trialProgress * delta(1);
        trialAzimuth_deg{trialIndex} = canonicalAzimuth( ...
            trialUnwrappedAzimuth_deg, limits, options);
        trialElevation_deg{trialIndex} = startPosition(2) + ...
            trialProgress * delta(2);
        trialTime_s{trialIndex} = trialDeparture_s + trialElapsed_s;
        trialOwner{trialIndex} = repmat( ...
            trialIndex, numel(trialElapsed_s), 1);
    end
    packedTrialAzimuth_deg = vertcat(trialAzimuth_deg{:});
    packedTrialElevation_deg = vertcat(trialElevation_deg{:});
    packedTrialTime_s = vertcat(trialTime_s{:});
    packedTrialOwner = vertcat(trialOwner{:});
    trialBlocked = queryAzElTimeObstacle( ...
        obstacleField, packedTrialAzimuth_deg, ...
        packedTrialElevation_deg, ...
        packedTrialTime_s, collisionOptions(options));
    collisionFreeCandidate = true(trialCount, 1);
    collisionFreeCandidate(unique( ...
        packedTrialOwner(trialBlocked))) = false;
    firstFreeCandidateInBatch = find(collisionFreeCandidate, 1);
    if ~isempty(firstFreeCandidateInBatch)
        scheduled = true;
        departure = departureCandidates_s( ...
            candidateIndices(firstFreeCandidateInBatch));
        arrival = departure + duration;
        return;
    end
end
end

function times = alignedTimes(firstTime_s, lastTime_s, step_s, originTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   times = alignedTimes(firstTime_s, lastTime_s, step_s, originTime_s)
%**************************************************************************
% PURPOSE
%   - Select mission-clock samples inside one inclusive time interval.
%**************************************************************************
% INPUTS
%   - firstTime_s, lastTime_s, step_s, originTime_s (numeric scalars)
%       Interval, grid spacing, and grid origin.
%**************************************************************************
% OUTPUTS
%   - times (numeric column vector)
%       Aligned samples inside the interval.
%**************************************************************************
% UNITS
%   - All inputs and output are seconds.
% Every edge validator uses the same mission clock phase; duplicating this
% rounding logic would reopen sample-grid aliasing gaps.
firstIndex = ceil((firstTime_s - originTime_s) / step_s - 1e-10);
lastIndex = floor((lastTime_s - originTime_s) / step_s + 1e-10);
if lastIndex < firstIndex
    times = zeros(0, 1);
else
    times = originTime_s + (firstIndex:lastIndex).' * step_s;
end
end

function profile = makeRouteProfile( ...
        route, startTime, stopTime, sampleStep, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makeRouteProfile( ...
%       route, startTime, stopTime, sampleStep, limits, options)
%**************************************************************************
% PURPOSE
%   - Reconstruct a safe-interval route on a requested uniform sample grid.
%**************************************************************************
% INPUTS
%   - route (scalar struct)
%       Waypoints, arrivals, departures, and terminal dynamics.
%   - startTime, stopTime, sampleStep (numeric scalars)
%       Output horizon and spacing.
%   - limits, options (scalar structs)
%       Dynamic limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Sampled position, velocity, acceleration, and waiting state.
%**************************************************************************
% UNITS
%   - Angles are degrees and timing arguments are seconds.
% Returned and validation profiles must reconstruct the same waits and
% motion law at different sampling rates.
time = (startTime:sampleStep:stopTime).';
if time(end) < stopTime - 1e-9
    time(end + 1, 1) = stopTime;
else
    time(end) = stopTime;
end
sampleCount = numel(time);
unwrapped = repmat(route.positionUnwrapped_deg(1, :), sampleCount, 1);
velocity = zeros(sampleCount, 2);
acceleration = zeros(sampleCount, 2);

for node = 2:size(route.positionUnwrapped_deg, 1)
    reached = time >= route.arrivalTime_s(node) - 1e-10;
    unwrapped(reached, :) = repmat( ...
        route.positionUnwrapped_deg(node, :), nnz(reached), 1);
end
% Waiting is established above by holding the most recently reached node.
% Maneuver samples overwrite only each edge's active time window.
for edge = 1:size(route.positionUnwrapped_deg, 1) - 1
    departure = route.departureTime_s(edge);
    duration = route.motionDuration_s(edge);
    moving = time >= departure - 1e-10 & ...
        time <= departure + duration + 1e-10;
    if ~any(moving)
        continue;
    end
    tau = min(max(time(moving) - departure, 0), duration);
    if route.hasTerminalCapture && ...
            edge == size(route.positionUnwrapped_deg, 1) - 1
        terminal = evaluateAzElBoundaryProfile( ...
            route.positionUnwrapped_deg(edge, :), [0 0], [0 0], ...
            route.positionUnwrapped_deg(edge + 1, :), ...
            route.terminalVelocity_deg_s, ...
            route.terminalAcceleration_deg_s2, duration, tau);
        unwrapped(moving, :) = terminal.position_deg;
        velocity(moving, :) = terminal.velocity_deg_s;
        acceleration(moving, :) = terminal.acceleration_deg_s2;
    else
        delta = route.positionUnwrapped_deg(edge + 1, :) - ...
            route.positionUnwrapped_deg(edge, :);
        [~, motion] = segmentMotion(delta, limits);
        [progress, rate, accelerationValue] = segmentProgress( ...
            tau, duration, motion);
        unwrapped(moving, :) = route.positionUnwrapped_deg(edge, :) + ...
            progress * delta;
        velocity(moving, :) = rate * delta;
        acceleration(moving, :) = accelerationValue * delta;
    end
end
position = unwrapped;
position(:, 1) = canonicalAzimuth(position(:, 1), limits, options);
velocity(1, :) = 0;
acceleration(1, :) = 0;
profile = struct( ...
    "time_s", time, ...
    "position_deg", position, ...
    "positionUnwrapped_deg", unwrapped, ...
    "velocity_deg_s", velocity, ...
    "acceleration_deg_s2", acceleration, ...
    "isWaiting", all(abs(velocity) <= 1e-10, 2) & ...
    all(abs(acceleration) <= 1e-10, 2));
end

function [duration, motion] = segmentMotion(delta, limits)
%% Section 0: Header & Readme
% SYNTAX
%   [duration, motion] = segmentMotion(delta, limits)
%**************************************************************************
% PURPOSE
%   - Derive the shortest synchronized rest-to-rest two-axis slew.
%**************************************************************************
% INPUTS
%   - delta (numeric two-vector)
%       Signed axis displacement.
%   - limits (scalar struct)
%       Two-axis velocity and acceleration limits.
%**************************************************************************
% OUTPUTS
%   - duration (nonnegative scalar)
%       Synchronized slew duration.
%   - motion (scalar struct)
%       Normalized trapezoidal or triangular motion law.
%**************************************************************************
% UNITS
%   - delta is degrees and duration is seconds.
% Search edges and profile reconstruction share one synchronized two-axis
% law so feasibility cannot change after route selection.
absoluteDelta = abs(delta);
active = absoluteDelta > 1e-12;
if ~any(active)
    duration = 0;
    motion = struct( ...
        "PeakRate", 0, "Acceleration", 1, ...
        "AccelerationTime", 0, "CruiseTime", 0);
    return;
end
rateLimit = min(limits.maxVelocity_deg_s(active) ./ ...
    absoluteDelta(active));
acceleration = min(limits.maxAcceleration_deg_s2(active) ./ ...
    absoluteDelta(active));
% Both axes follow one normalized progress law. Taking the most restrictive
% normalized limit guarantees each physical axis respects its own bounds.
if rateLimit^2 / acceleration >= 1
    accelerationTime = sqrt(1 / acceleration);
    peakRate = sqrt(acceleration);
    cruiseTime = 0;
else
    accelerationTime = rateLimit / acceleration;
    peakRate = rateLimit;
    cruiseTime = (1 - acceleration * accelerationTime^2) / peakRate;
end
duration = 2 * accelerationTime + cruiseTime;
motion = struct( ...
    "PeakRate", peakRate, ...
    "Acceleration", acceleration, ...
    "AccelerationTime", accelerationTime, ...
    "CruiseTime", cruiseTime);
end

function [progress, rate, acceleration] = segmentProgress( ...
        tau, duration, motion)
%% Section 0: Header & Readme
% SYNTAX
%   [progress, rate, acceleration] = segmentProgress( ...
%       tau, duration, motion)
%**************************************************************************
% PURPOSE
%   - Evaluate normalized segment position, rate, and acceleration.
%**************************************************************************
% INPUTS
%   - tau (numeric vector)
%       Elapsed segment times.
%   - duration (nonnegative scalar)
%       Segment duration.
%   - motion (scalar struct)
%       Analytic normalized motion law.
%**************************************************************************
% OUTPUTS
%   - progress, rate, acceleration (numeric vectors)
%       Normalized motion samples.
%**************************************************************************
% UNITS
%   - progress is dimensionless, rate is 1/s, acceleration is 1/s^2.
% Collision checks and output derivatives must evaluate the exact same
% normalized trapezoidal law.
progress = zeros(size(tau));
rate = zeros(size(tau));
acceleration = zeros(size(tau));
tAcceleration = motion.AccelerationTime;
tCruiseEnd = tAcceleration + motion.CruiseTime;

accelerating = tau > 0 & tau < tAcceleration;
progress(accelerating) = 0.5 * motion.Acceleration .* ...
    tau(accelerating).^2;
rate(accelerating) = motion.Acceleration .* tau(accelerating);
acceleration(accelerating) = motion.Acceleration;

cruising = tau >= tAcceleration & tau < tCruiseEnd;
accelerationDistance = 0.5 * motion.Acceleration * tAcceleration^2;
progress(cruising) = accelerationDistance + motion.PeakRate .* ...
    (tau(cruising) - tAcceleration);
rate(cruising) = motion.PeakRate;

decelerating = tau >= tCruiseEnd & tau < duration;
remaining = duration - tau(decelerating);
progress(decelerating) = 1 - ...
    0.5 * motion.Acceleration .* remaining.^2;
rate(decelerating) = motion.Acceleration .* remaining;
acceleration(decelerating) = -motion.Acceleration;
progress(tau >= duration) = 1;
end

function yes = samePosition(firstPosition, secondPosition, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   yes = samePosition(firstPosition, secondPosition, limits, options)
%**************************************************************************
% PURPOSE
%   - Compare positions with the same wrapped displacement tolerance.
%**************************************************************************
% INPUTS
%   - firstPosition, secondPosition (numeric two-vectors)
%       Positions to compare.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - yes (logical scalar)
%       True when positions are equivalent.
%**************************************************************************
% UNITS
%   - Position and comparison tolerance are degrees.
% Start/goal tests and candidate deduplication require the same seam-aware
% tolerance.
delta = wrappedDelta(firstPosition, secondPosition, limits, options);
yes = hypot(delta(1), delta(2)) <= 1e-9;
end

function azimuth = canonicalAzimuth(azimuth, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   azimuth = canonicalAzimuth(azimuth, limits, options)
%**************************************************************************
% PURPOSE
%   - Map azimuth values into the configured periodic interval.
%**************************************************************************
% INPUTS
%   - azimuth (numeric array)
%       Possibly unwrapped values.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - azimuth (numeric array)
%       Canonical values.
%**************************************************************************
% UNITS
%   - Azimuth and limits are degrees.
% Cache keys, collision queries, and returned commands share this canonical
% interval even though motion is reconstructed unwrapped.
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    azimuth = mod(azimuth - limits.azimuth_deg(1), span) + ...
        limits.azimuth_deg(1);
end
end

function key = stateKey(position, interval, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   key = stateKey(position, interval, limits, options)
%**************************************************************************
% PURPOSE
%   - Build a deterministic cache key for a position-safe-interval state.
%**************************************************************************
% INPUTS
%   - position (numeric two-vector)
%       Spatial state.
%   - interval (positive integer)
%       Safe-interval index.
%   - limits, options (scalar structs)
%       Canonicalization policy.
%**************************************************************************
% OUTPUTS
%   - key (character vector)
%       Stable state key.
%**************************************************************************
% UNITS
%   - Position is degrees; interval and output encoding are dimensionless.
% Every frontier lookup must encode a spatial point and its safe interval
% exactly like every insertion.
key = sprintf('%s#%d', ...
    positionKey(position, limits, options), interval);
end

function key = positionKey(position, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   key = positionKey(position, limits, options)
%**************************************************************************
% PURPOSE
%   - Build a deterministic cache key for one canonical position.
%**************************************************************************
% INPUTS
%   - position (numeric two-vector)
%       Spatial state.
%   - limits, options (scalar structs)
%       Canonicalization policy.
%**************************************************************************
% OUTPUTS
%   - key (character vector)
%       Stable position key.
%**************************************************************************
% UNITS
%   - Position is degrees; output encoding is dimensionless.
% Safe-interval caching and graph-state keys share this spatial encoding.
azimuth = canonicalAzimuth(position(1), limits, options);
key = sprintf('%.9f|%.9f', azimuth, position(2));
end

function queryOptions = collisionOptions(options)
%% Section 0: Header & Readme
% SYNTAX
%   queryOptions = collisionOptions(options)
%**************************************************************************
% PURPOSE
%   - Translate planner controls into the shared collision-query schema.
%**************************************************************************
% INPUTS
%   - options (scalar struct)
%       Resolved planner options.
%**************************************************************************
% OUTPUTS
%   - queryOptions (scalar struct)
%       Exact polygon query controls.
%**************************************************************************
% UNITS
%   - SafetyMarginDeg is degrees; sample padding is dimensionless.
% Every exploratory and final collision query must preserve identical
% spatial margin and temporal padding.
queryOptions = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "SafetyMarginDeg", options.SafetyMargin_deg);
end

function [nodes, index] = appendNode(nodes, position, interval, arrival, ...
        parent, departure, duration)
%% Section 0: Header & Readme
% SYNTAX
%   [nodes, index] = appendNode( ...
%       nodes, position, interval, arrival, parent, departure, duration)
%**************************************************************************
% PURPOSE
%   - Append one geometrically grown safe-interval search node.
%**************************************************************************
% INPUTS
%   - nodes (scalar packed struct)
%       Parallel search-node arrays.
%   - position, interval, arrival, parent, departure, duration (node values)
%       Spatial, safe-interval, timing, and ancestry fields.
%**************************************************************************
% OUTPUTS
%   - nodes (scalar packed struct)
%       Updated arrays.
%   - index (positive integer)
%       Appended node index.
%**************************************************************************
% UNITS
%   - Position is degrees and timing values are seconds.
% Node creation occurs from multiple transition cases; one allocator keeps
% the structure-of-arrays fields synchronized during growth.
if nodes.Count >= size(nodes.PositionDeg, 1)
    previousCapacity = size(nodes.PositionDeg, 1);
    newCapacity = max(2 * previousCapacity, 1);
    nodes.PositionDeg(newCapacity, 2) = 0;
    nodes.IntervalIndex(newCapacity, 1) = 0;
    nodes.ArrivalTime_s(newCapacity, 1) = Inf;
    nodes.ParentIndex(newCapacity, 1) = 0;
    nodes.DepartureTime_s(newCapacity, 1) = NaN;
    nodes.MotionDuration_s(newCapacity, 1) = 0;
end
nodes.Count = nodes.Count + 1;
index = nodes.Count;
nodes.PositionDeg(index, :) = position;
nodes.IntervalIndex(index) = interval;
nodes.ArrivalTime_s(index) = arrival;
nodes.ParentIndex(index) = uint32(parent);
nodes.DepartureTime_s(index) = departure;
nodes.MotionDuration_s(index) = duration;
end

function result = failedResult( ...
        message, eventTimes, cache, queryCount, elapsed, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = failedResult( ...
%       message, eventTimes, cache, queryCount, elapsed, options)
%**************************************************************************
% PURPOSE
%   - Assemble the shared failed safe-interval search schema.
%**************************************************************************
% INPUTS
%   - message (scalar text)
%       Failure explanation.
%   - eventTimes, cache, queryCount, elapsed, options (diagnostic context)
%       Event grid, cache, work counts, wall time, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Failed dynamic-search result.
%**************************************************************************
% UNITS
%   - Event times and elapsed are seconds.
% All early exits expose one stable diagnostic schema to examples and tests.
result = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "Method", "eventCompressedSafeIntervalDijkstra", ...
    "Route", struct(), ...
    "Profile", struct(), ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SafeIntervalQueryCount", queryCount, ...
    "SafeIntervalCacheCount", cache.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", elapsed, ...
    "TerminationReason", "", ...
    "BlockedValidationSampleCount", 0, ...
    "GlobalAngularOptimal", false, ...
    "Options", options);
end

function frontier = pushArrivalFrontier(frontier, node, arrivalTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = pushArrivalFrontier(frontier, node, arrivalTime_s)
%**************************************************************************
% PURPOSE
%   - Push one earliest-arrival label onto the dynamic binary min-heap.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays, count, and serial state.
%   - node (positive integer)
%       Search-node index.
%   - arrivalTime_s (numeric scalar)
%       Earliest-arrival label.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - arrivalTime_s is seconds; other values are dimensionless.
% Push and pop share the comparison/swap helpers below so equal-cost labels
% keep deterministic FIFO tie-breaking.
if frontier.Count >= numel(frontier.Node)
    previousCapacity = numel(frontier.Node);
    newCapacity = max(2 * previousCapacity, 1);
    frontier.Node(newCapacity, 1) = 0;
    frontier.ArrivalTime_s(newCapacity, 1) = Inf;
    frontier.Serial(newCapacity, 1) = 0;
end
frontier.Count = frontier.Count + 1;
frontier.NextSerial = frontier.NextSerial + 1;
index = frontier.Count;
frontier.Node(index) = uint32(node);
frontier.ArrivalTime_s(index) = arrivalTime_s;
frontier.Serial(index) = frontier.NextSerial;
while index > 1
    parent = floor(index / 2);
    if ~arrivalFrontierEntryIsLess(frontier, index, parent)
        break;
    end
    frontier = swapArrivalFrontierEntries(frontier, index, parent);
    index = parent;
end
end

function [frontier, node] = popArrivalFrontier(frontier)
%% Section 0: Header & Readme
% SYNTAX
%   [frontier, node] = popArrivalFrontier(frontier)
%**************************************************************************
% PURPOSE
%   - Remove the earliest dynamic frontier entry.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Nonempty arrival-time binary min-heap.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%   - node (positive integer)
%       Removed search-node index.
%**************************************************************************
% UNITS
%   - Stored arrival labels are seconds; outputs are otherwise dimensionless.
% This is paired with pushArrivalFrontier and intentionally reuses the same
% ordering primitive instead of duplicating heap rules.
node = double(frontier.Node(1));
frontier.Node(1) = frontier.Node(frontier.Count);
frontier.ArrivalTime_s(1) = frontier.ArrivalTime_s(frontier.Count);
frontier.Serial(1) = frontier.Serial(frontier.Count);
frontier.Count = frontier.Count - 1;
index = 1;
while true
    left = 2 * index;
    right = left + 1;
    if left > frontier.Count
        break;
    end
    child = left;
    if right <= frontier.Count && ...
            arrivalFrontierEntryIsLess(frontier, right, left)
        child = right;
    end
    if ~arrivalFrontierEntryIsLess(frontier, child, index)
        break;
    end
    frontier = swapArrivalFrontierEntries(frontier, index, child);
    index = child;
end
end

function isLess = arrivalFrontierEntryIsLess( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   isLess = arrivalFrontierEntryIsLess( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Compare dynamic heap entries by arrival time and serial order.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to compare.
%**************************************************************************
% OUTPUTS
%   - isLess (logical scalar)
%       True when the first entry precedes the second.
%**************************************************************************
% UNITS
%   - Comparison result and indices are dimensionless.
% Both heap directions depend on this single cost and serial ordering rule.
firstArrivalTime_s = frontier.ArrivalTime_s(firstIndex);
secondArrivalTime_s = frontier.ArrivalTime_s(secondIndex);
if firstArrivalTime_s ~= secondArrivalTime_s
    isLess = frontier.ArrivalTime_s(firstIndex) < ...
        frontier.ArrivalTime_s(secondIndex);
else
    isLess = frontier.Serial(firstIndex) < frontier.Serial(secondIndex);
end
end

function frontier = swapArrivalFrontierEntries( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = swapArrivalFrontierEntries( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Swap every parallel array in two dynamic heap entries.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to exchange.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - Indices are dimensionless; arrival-time units remain seconds.
% Push and pop both swap three parallel arrays; centralizing it prevents
% frontier corruption when the schema changes.
fields = ["Node", "ArrivalTime_s", "Serial"];
for fieldName = fields
    temporaryValue = frontier.(fieldName)(firstIndex);
    frontier.(fieldName)(firstIndex) = frontier.(fieldName)(secondIndex);
    frontier.(fieldName)(secondIndex) = temporaryValue;
end
end

function profile = evaluateAzElBoundaryProfile( ...
        initialPosition, initialVelocity, initialAcceleration, ...
        goalPosition, goalVelocity, goalAcceleration, duration_s, tau_s)
%% Section 0: Header & Readme
% SYNTAX
%   profile = evaluateAzElBoundaryProfile( ...
%       initialPosition, initialVelocity, initialAcceleration, ...
%       goalPosition, goalVelocity, goalAcceleration, duration_s, tau_s)
%**************************************************************************
% PURPOSE
%   - Evaluate the shared quintic terminal boundary-value trajectory.
%**************************************************************************
% INPUTS
%   - initial and goal position/velocity/acceleration (numeric two-vectors)
%       Six terminal boundary conditions.
%   - duration_s (positive scalar)
%       Complete maneuver duration.
%   - tau_s (numeric vector)
%       Elapsed evaluation times.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Position, velocity, acceleration, jerk, and coefficients.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
% Terminal feasibility and route reconstruction must evaluate the same
% quintic boundary-value solution.
validateattributes(duration_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
boundaryValues = {initialPosition, initialVelocity, ...
    initialAcceleration, goalPosition, goalVelocity, goalAcceleration};
for boundaryIndex = 1:numel(boundaryValues)
    validateattributes(boundaryValues{boundaryIndex}, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    boundaryValues{boundaryIndex} = reshape( ...
        double(boundaryValues{boundaryIndex}), 1, 2);
end
initialPosition = boundaryValues{1};
initialVelocity = boundaryValues{2};
initialAcceleration = boundaryValues{3};
goalPosition = boundaryValues{4};
goalVelocity = boundaryValues{5};
goalAcceleration = boundaryValues{6};
tau_s = double(tau_s(:));
validateattributes(tau_s, {'numeric'}, ...
    {'real', 'finite', '>=', 0, '<=', duration_s});

coefficient = zeros(6, 2);
coefficient(1, :) = initialPosition;
coefficient(2, :) = duration_s * initialVelocity;
coefficient(3, :) = 0.5 * duration_s^2 * initialAcceleration;
remainingBoundaryConditions = [ ...
    goalPosition - sum(coefficient(1:3, :), 1); ...
    duration_s * goalVelocity - ...
        coefficient(2, :) - 2 * coefficient(3, :); ...
    duration_s^2 * goalAcceleration - 2 * coefficient(3, :)];
boundaryMatrix = [1 1 1; 3 4 5; 6 12 20];
coefficient(4:6, :) = boundaryMatrix \ remainingBoundaryConditions;

normalizedTime = tau_s / duration_s;
positionBasis = [ones(size(normalizedTime)), normalizedTime, ...
    normalizedTime.^2, normalizedTime.^3, ...
    normalizedTime.^4, normalizedTime.^5];
velocityBasis = [zeros(size(normalizedTime)), ...
    ones(size(normalizedTime)), 2 * normalizedTime, ...
    3 * normalizedTime.^2, 4 * normalizedTime.^3, ...
    5 * normalizedTime.^4] / duration_s;
accelerationBasis = [zeros(size(normalizedTime)), ...
    zeros(size(normalizedTime)), 2 * ones(size(normalizedTime)), ...
    6 * normalizedTime, 12 * normalizedTime.^2, ...
    20 * normalizedTime.^3] / duration_s^2;
jerkBasis = [zeros(size(normalizedTime)), ...
    zeros(size(normalizedTime)), zeros(size(normalizedTime)), ...
    6 * ones(size(normalizedTime)), 24 * normalizedTime, ...
    60 * normalizedTime.^2] / duration_s^3;

profile = struct( ...
    "timeFromStart_s", tau_s, ...
    "position_deg", positionBasis * coefficient, ...
    "velocity_deg_s", velocityBasis * coefficient, ...
    "acceleration_deg_s2", accelerationBasis * coefficient, ...
    "jerk_deg_s3", jerkBasis * coefficient, ...
    "coefficient", coefficient);
end

function limits = normalizePlannerLimits(limits)
%% Section 0: Header & Readme
% SYNTAX
%   limits = normalizePlannerLimits(limits)
%**************************************************************************
% PURPOSE
%   - Apply one limits invariant to planning and explicit-default requests.
%**************************************************************************
% INPUTS
%   - limits (scalar struct)
%       Required angular ranges and two-axis dynamic limits.
%**************************************************************************
% OUTPUTS
%   - limits (scalar struct)
%       Validated row-oriented double values.
%**************************************************************************
% UNITS
%   - Angular ranges are degrees, velocity is deg/s, and acceleration is
%     deg/s^2.
requiredLimitFields = ["azimuth_deg", "elevation_deg", ...
    "maxVelocity_deg_s", "maxAcceleration_deg_s2"];
hasRequiredLimits = isstruct(limits) && isscalar(limits) && ...
    all(isfield(limits, cellstr(requiredLimitFields)));
if ~hasRequiredLimits
    error("planAzElDijkstra:InvalidLimits", ...
        "limits is missing a required field.");
end
for limitField = requiredLimitFields
    validateattributes(limits.(limitField), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    limits.(limitField) = reshape(double(limits.(limitField)), 1, 2);
end
rangesIncrease = all(diff(limits.azimuth_deg) > 0) && ...
    all(diff(limits.elevation_deg) > 0);
dynamicsArePositive = all(limits.maxVelocity_deg_s > 0) && ...
    all(limits.maxAcceleration_deg_s2 > 0);
if ~rangesIncrease || ~dynamicsArePositive
    error("planAzElDijkstra:InvalidLimits", ...
        "Limit ranges must increase and dynamic limits must be positive.");
end
end

function options = defaultAzElDijkstraOptions(limits)
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultAzElDijkstraOptions(limits)
%**************************************************************************
% PURPOSE
%   - Keep argument-dependent Dijkstra defaults in one source of truth.
%**************************************************************************
% INPUTS
%   - limits (validated scalar struct)
%       Azimuth span determines whether wrapping is enabled by default.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated base options. Derived sampling defaults remain empty
%       until the public function resolves them against other options.
%**************************************************************************
% UNITS
%   - Unit-bearing option fields use _deg, _s, or their rate derivatives.
options = struct( ...
    "SampleTime_s", 0.5, ...
    "ValidationStep_s", [], ...
    "GridStep_deg", 1, ...
    "GridStepSchedule_deg", [], ...
    "PrimitiveRadii_deg", [], ...
    "PrimitiveRadiusMultipliers", [1 2 4 8], ...
    "DirectionStep_deg", 45, ...
    "CollisionCheckStep_s", [], ...
    "MaximumSafeIntervalSamples", 10000, ...
    "MaximumDepartureTrials", 64, ...
    "DepartureBatchSize", 8, ...
    "MaxExpansions", 100000, ...
    "MaxSearchTime_s", 45, ...
    "InitialNodeCapacity", 4096, ...
    "TimePaddingSamples", 1, ...
    "SafetyMargin_deg", 0, ...
    "AllowAzimuthWrap", diff(limits.azimuth_deg) >= 360 - 1e-9, ...
    "AllowNonzeroTerminalState", false, ...
    "PrintFailureSuggestions", true, ...
    "Objective", "minimumAngularDistance", ...
    "RouteShortcutStep_deg", 0.1, ...
    "MaximumVerticesPerRegion", 500);
end

function plan = normalizeAzElDijkstraPlanSchema(plan)
%% Section 0: Header & Readme
% SYNTAX
%   plan = normalizeAzElDijkstraPlanSchema(plan)
%**************************************************************************
% PURPOSE
%   - Give static, dynamic, successful, and failed public plans the same
%     diagnostic field set without overwriting branch-specific evidence.
%**************************************************************************
% INPUTS
%   - plan (scalar struct)
%       Partially assembled plan from any public exit path.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Plan with every public diagnostic field present.
%**************************************************************************
% UNITS
%   - Unit-bearing fields use degrees, seconds, or their rate derivatives.
schemaDefaults = struct( ...
    "topologyOptimalOnLattice", false, ...
    "topologySearch", struct(), ...
    "preShortcutRoute_deg", zeros(0, 2), ...
    "routeShortcut", struct(), ...
    "autonomousRoute_deg", zeros(0, 2), ...
    "retiming", struct(), ...
    "resolutionAttempts", struct([]), ...
    "safeIntervalSearch", struct(), ...
    "failureCategory", "", ...
    "failureCause", "", ...
    "failureSuggestions", strings(0, 1), ...
    "failureSummary", "");
schemaFieldNames = fieldnames(schemaDefaults);
for fieldIndex = 1:numel(schemaFieldNames)
    fieldName = schemaFieldNames{fieldIndex};
    if ~isfield(plan, fieldName)
        plan.(fieldName) = schemaDefaults.(fieldName);
    end
end
end
