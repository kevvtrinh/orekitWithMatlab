function plan = planAzElTrajectory(scenario, optionOverrides)
%PLANAZELTRAJECTORY Plan one bounded azimuth/elevation trajectory.
%
% plan = planAzElTrajectory(scenario)
% plan = planAzElTrajectory(scenario, optionOverrides)
% options = planAzElTrajectory()
%
% The core method is a deterministic space-time lattice. Every edge is one
% quintic trajectory with continuous position, velocity, and acceleration.

%% Section 0: Header & Readme
defaults = plannerDefaults();
if nargin == 0
    plan = defaults;
    return;
end
if nargin < 2
    optionOverrides = struct();
end
plan = emptyPlan(defaults);
plannerTimer = tic;

%% Section 1: Validate Inputs And Apply Defaults
[inputIsValid, inputMessage] = validateScenario(scenario);
if ~inputIsValid
    plan.message = inputMessage;
    plan.failureAssessment = failureAssessment( ...
        "invalid-input", true, inputMessage);
    return;
end
[options, optionsAreValid, optionMessage] = applyOptionOverrides( ...
    defaults, optionOverrides);
if ~optionsAreValid
    plan.message = optionMessage;
    plan.failureAssessment = failureAssessment( ...
        "invalid-input", true, optionMessage);
    return;
end

initialState = normalizeState(scenario.initialState);
limits = scenario.limits;
maximumVelocity_deg_s = reshape(double(limits.maxVelocity_deg_s), 1, 2);
maximumAcceleration_deg_s2 = reshape( ...
    double(limits.maxAcceleration_deg_s2), 1, 2);
if isfield(limits, "maxJerk_deg_s3")
    maximumJerk_deg_s3 = reshape(double(limits.maxJerk_deg_s3), 1, 2);
elseif all(isfinite(options.MaxJerk_deg_s3))
    maximumJerk_deg_s3 = reshape(options.MaxJerk_deg_s3, 1, 2);
else
    maximumJerk_deg_s3 = max(10, 20 * maximumAcceleration_deg_s2);
end
allowAzimuthWrap = isfield(scenario.options, "allowAzimuthWrap") && ...
    logical(scenario.options.allowAzimuthWrap);
safetyMargin_deg = 0;
if isfield(scenario.options, "safetyMargin_deg")
    safetyMargin_deg = double(scenario.options.safetyMargin_deg);
end
scenarioSampleTime_s = double(scenario.options.sampleTime_s);
timeStepWasAutomatic = ~isfinite(options.TimeStep_s);
if ~isfinite(options.TimeStep_s)
    options.TimeStep_s = scenarioSampleTime_s;
end
if ~isfinite(options.SampleTime_s)
    options.SampleTime_s = scenarioSampleTime_s;
end
if ~isfinite(options.CollisionCheckStep_s)
    if isfield(scenario.options, "collisionCheckStep_s")
        requestedCollisionStep_s = min(scenarioSampleTime_s, ...
            double(scenario.options.collisionCheckStep_s));
    else
        requestedCollisionStep_s = min(0.2, scenarioSampleTime_s);
    end
    outputSubdivisions = ceil( ...
        scenarioSampleTime_s / requestedCollisionStep_s - 1e-12);
    options.CollisionCheckStep_s = ...
        scenarioSampleTime_s / outputSubdivisions;
end
if isfield(scenario.resourceBudget, "maximumWallTime_s") && ...
        isfinite(scenario.resourceBudget.maximumWallTime_s)
    if isfinite(options.MaxWallTime_s)
        options.MaxWallTime_s = min(options.MaxWallTime_s, ...
            scenario.resourceBudget.maximumWallTime_s);
    else
        options.MaxWallTime_s = scenario.resourceBudget.maximumWallTime_s;
    end
elseif ~isfinite(options.MaxWallTime_s)
    options.MaxWallTime_s = 60;
end
if isfield(scenario.resourceBudget, "maximumExpansions") && ...
        isfinite(scenario.resourceBudget.maximumExpansions)
    options.MaxExpandedStates = min(options.MaxExpandedStates, ...
        double(scenario.resourceBudget.maximumExpansions));
end
options.MaxJerk_deg_s3 = maximumJerk_deg_s3;

plan.startState = initialState;
plan.limits = limits;
plan.options = options;
plan.method = "deterministicQuinticSpaceTimeLattice";

[terminalCandidates, terminalMessage] = buildTerminalCandidates( ...
    scenario, initialState, allowAzimuthWrap);
if isempty(terminalCandidates)
    plan.message = terminalMessage;
    plan.failureAssessment = failureAssessment( ...
        "invalid-input", true, terminalMessage);
    return;
end
latestTerminalTime_s = max([terminalCandidates.time_s]);
timeHorizon_s = latestTerminalTime_s - initialState.time_s;
if timeHorizon_s <= 0
    plan.message = "Every terminal candidate must follow the initial state.";
    plan.failureAssessment = failureAssessment( ...
        "infeasible", true, plan.message);
    return;
end
if timeStepWasAutomatic
    targetTimeStep_s = max(scenarioSampleTime_s, ...
        min(1, timeHorizon_s / 120));
    options.TimeStep_s = ceil(targetTimeStep_s / ...
        scenarioSampleTime_s - 1e-12) * scenarioSampleTime_s;
end

% An obstacle-free minimum-time certificate is the only continuous-space
% infeasibility proof used by the finite search.
minimumCandidateDuration_s = inf;
for candidateIndex = 1:numel(terminalCandidates)
    candidate = terminalCandidates(candidateIndex);
    duration_s = minimumQuinticDuration( ...
        initialState.position_deg, initialState.velocity_deg_s, ...
        initialState.acceleration_deg_s2, candidate.positionUnwrapped_deg, ...
        candidate.velocity_deg_s, candidate.acceleration_deg_s2, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options.TimeStep_s);
    minimumCandidateDuration_s = min( ...
        minimumCandidateDuration_s, duration_s);
end
availableCandidateDuration_s = max([terminalCandidates.time_s]) - ...
    initialState.time_s;
if minimumCandidateDuration_s > availableCandidateDuration_s + 1e-9
    plan.message = "The terminal deadline is shorter than the obstacle-free minimum maneuver time.";
    plan.failureAssessment = failureAssessment( ...
        "infeasible", true, plan.message);
    plan.searchElapsed_s = toc(plannerTimer);
    return;
end

%% Section 2: Build The Planning Representation
representationTimer = tic;
obstacleModel = prepareObstacleModel(scenario.azElData);
geometryIsStatic = isempty(obstacleModel) || all([obstacleModel.isStatic]);
if scenario.requestKind == "fixed-goal" && ...
        all(abs(terminalCandidates(1).velocity_deg_s) <= ...
        options.KinematicTolerance) && ...
        all(abs(terminalCandidates(1).acceleration_deg_s2) <= ...
        options.KinematicTolerance)
    terminalCheckTimes_s = (initialState.time_s:options.TimeStep_s: ...
        terminalCandidates(1).time_s).';
    if terminalCheckTimes_s(end) < terminalCandidates(1).time_s - 1e-12
        terminalCheckTimes_s(end + 1, 1) = ...
            terminalCandidates(1).time_s;
    end
    terminalCheckPositions_deg = repmat( ...
        terminalCandidates(1).positionUnwrapped_deg, ...
        numel(terminalCheckTimes_s), 1);
    terminalBlocked = pointsCollide( ...
        obstacleModel, terminalCheckPositions_deg, terminalCheckTimes_s, ...
        safetyMargin_deg, allowAzimuthWrap);
    lastBlockedIndex = find(terminalBlocked, 1, "last");
    if isempty(lastBlockedIndex)
        terminalCandidates(1).holdOpenTime_s = initialState.time_s;
    elseif lastBlockedIndex < numel(terminalCheckTimes_s)
        terminalCandidates(1).holdOpenTime_s = ...
            terminalCheckTimes_s(lastBlockedIndex + 1);
    else
        terminalCandidates(1).holdOpenTime_s = Inf;
    end
end
azimuthLimits_deg = reshape(double(limits.azimuth_deg), 1, 2);
elevationLimits_deg = reshape(double(limits.elevation_deg), 1, 2);
initialPositionUnwrapped_deg = initialState.position_deg;
if allowAzimuthWrap
    unwrappedAzimuthLimits_deg = initialState.position_deg(1) + [-180 180];
    for candidateIndex = 1:numel(terminalCandidates)
        wrappedDifference_deg = wrapDegrees( ...
            terminalCandidates(candidateIndex).position_deg(1) - ...
            initialState.position_deg(1));
        terminalCandidates(candidateIndex).positionUnwrapped_deg(1) = ...
            initialState.position_deg(1) + wrappedDifference_deg;
    end
else
    unwrappedAzimuthLimits_deg = azimuthLimits_deg;
end
candidatePositionsUnwrapped_deg = ...
    vertcat(terminalCandidates.positionUnwrapped_deg);
azimuthSpan_deg = diff(unwrappedAzimuthLimits_deg);
elevationSpan_deg = diff(elevationLimits_deg);
if ~isfinite(options.GridStep_deg)
    options.GridStep_deg = min(0.5, max(0.2, ...
        min(azimuthSpan_deg, elevationSpan_deg) / 96));
end
gridStep_deg = options.GridStep_deg;
if ~isfinite(options.MaximumPrimitiveDistance_deg)
    domainDiagonal_deg = hypot(azimuthSpan_deg, elevationSpan_deg);
    options.MaximumPrimitiveDistance_deg = min(20, ...
        max(10, 0.05 * domainDiagonal_deg));
end
goalConnectionRadiusIsAutomatic = ...
    ~isfinite(options.GoalConnectionRadius_deg);
if goalConnectionRadiusIsAutomatic
    if ~geometryIsStatic && scenario.requestKind == "fixed-goal" && ...
            timeHorizon_s > 60
        options.GoalConnectionRadius_deg = max(4, ...
            0.4 * options.MaximumPrimitiveDistance_deg);
    else
        options.GoalConnectionRadius_deg = ...
            options.MaximumPrimitiveDistance_deg;
    end
end
[azimuthGrid_deg, startAzimuthIndex] = anchoredGrid( ...
    unwrappedAzimuthLimits_deg, initialPositionUnwrapped_deg(1), gridStep_deg);
[elevationGrid_deg, startElevationIndex] = anchoredGrid( ...
    elevationLimits_deg, initialPositionUnwrapped_deg(2), gridStep_deg);
gridCellCount = numel(azimuthGrid_deg) * numel(elevationGrid_deg);
if gridCellCount > options.MaximumGridCells
    scale = sqrt(gridCellCount / options.MaximumGridCells);
    gridStep_deg = gridStep_deg * scale;
    options.GridStep_deg = gridStep_deg;
    [azimuthGrid_deg, startAzimuthIndex] = anchoredGrid( ...
        unwrappedAzimuthLimits_deg, initialPositionUnwrapped_deg(1), gridStep_deg);
    [elevationGrid_deg, startElevationIndex] = anchoredGrid( ...
        elevationLimits_deg, initialPositionUnwrapped_deg(2), gridStep_deg);
    gridCellCount = numel(azimuthGrid_deg) * numel(elevationGrid_deg);
end
options.GridStep_deg = gridStep_deg;
plan.options = options;
startCellId = sub2ind( ...
    [numel(elevationGrid_deg), numel(azimuthGrid_deg)], ...
    startElevationIndex, startAzimuthIndex);
staticHeuristic_deg = zeros(0, 1);
staticObstacleModel = obstacleModel([obstacleModel.isStatic]);
if scenario.requestKind == "fixed-goal" && ...
        ~isempty(staticObstacleModel) && ...
        gridCellCount <= options.MaximumGridCells
    staticHeuristic_deg = buildStaticDistanceHeuristic( ...
        staticObstacleModel, azimuthGrid_deg, elevationGrid_deg, ...
        terminalCandidates(1).positionUnwrapped_deg, gridStep_deg, ...
        initialState.time_s, safetyMargin_deg, allowAzimuthWrap);
end

maximumPrimitiveCells = max(1, floor( ...
    options.MaximumPrimitiveDistance_deg / gridStep_deg));
staticVertexCount = 0;
for obstacleIndex = find([obstacleModel.isStatic])
    staticSlice = obstacleModel(obstacleIndex).slices{1};
    for regionIndex = 1:numel(staticSlice.regionAzimuth)
        staticVertexCount = staticVertexCount + ...
            numel(staticSlice.regionAzimuth{regionIndex});
    end
end
dynamicSceneIsDense = ~geometryIsStatic && numel(obstacleModel) > 3;
if goalConnectionRadiusIsAutomatic && ~geometryIsStatic && ...
        numel(obstacleModel) <= 3 && staticVertexCount > 80
    options.GoalConnectionRadius_deg = max(2, ...
        0.2 * options.MaximumPrimitiveDistance_deg);
    plan.options = options;
end
if ~geometryIsStatic && scenario.requestKind == "fixed-goal" && ...
        timeHorizon_s > 60 && staticVertexCount <= 80
    terminalCandidates(1).earliestConnectorTime_s = ...
        terminalCandidates(1).time_s - 0.25 * timeHorizon_s;
end
if geometryIsStatic
    candidateRadiusCells = unique(min( ...
        maximumPrimitiveCells, [1 2 4 8 16 32 64]));
    effectiveDirectionCount = options.DirectionCount;
elseif numel(obstacleModel) <= 3 && timeHorizon_s <= 60
    candidateRadiusCells = unique(min( ...
        maximumPrimitiveCells, [1 2 4 8 16 32 64]));
    effectiveDirectionCount = min(16, options.DirectionCount);
elseif numel(obstacleModel) == 4
    candidateRadiusCells = unique(min( ...
        maximumPrimitiveCells, [1 4 16 64]));
    effectiveDirectionCount = min(16, options.DirectionCount);
else
    candidateRadiusCells = unique(min( ...
        maximumPrimitiveCells, [1 4 16 64]));
    effectiveDirectionCount = min(8, options.DirectionCount);
end
primitiveOffsets = zeros( ...
    numel(candidateRadiusCells) * effectiveDirectionCount, 2);
primitiveWriteIndex = 0;
for radiusIndex = 1:numel(candidateRadiusCells)
    radiusCells = candidateRadiusCells(radiusIndex);
    for directionIndex = 0:effectiveDirectionCount - 1
        direction_rad = 2 * pi * directionIndex / effectiveDirectionCount;
        offset = round(radiusCells * [cos(direction_rad) sin(direction_rad)]);
        if all(offset == 0)
            continue;
        end
        primitiveWriteIndex = primitiveWriteIndex + 1;
        primitiveOffsets(primitiveWriteIndex, :) = offset;
    end
end
primitiveOffsets = unique( ...
    primitiveOffsets(1:primitiveWriteIndex, :), "rows", "stable");
primitiveCount = size(primitiveOffsets, 1);
primitiveDurationSteps = zeros(primitiveCount, 1);
primitiveDistance_deg = zeros(primitiveCount, 1);
for primitiveIndex = 1:primitiveCount
    displacement_deg = gridStep_deg * primitiveOffsets(primitiveIndex, :);
    primitiveDistance_deg(primitiveIndex) = hypot( ...
        displacement_deg(1), displacement_deg(2));
    duration_s = restToRestMinimumDuration( ...
        displacement_deg, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3);
    primitiveDurationSteps(primitiveIndex) = max(1, ...
        ceil(duration_s / options.TimeStep_s - 1e-12));
end
representationElapsed_s = toc(representationTimer);

counters = struct( ...
    "geometryIsStatic", geometryIsStatic, ...
    "dynamicSceneIsDense", dynamicSceneIsDense, ...
    "terminalHoldOpenTime_s", terminalCandidates(1).holdOpenTime_s, ...
    "maximumExpandedTime_s", initialState.time_s, ...
    "maximumExpandedTimePosition_deg", initialPositionUnwrapped_deg, ...
    "minimumTerminalDistance_deg", min(hypot( ...
        candidatePositionsUnwrapped_deg(:, 1) - ...
        initialPositionUnwrapped_deg(1), ...
        candidatePositionsUnwrapped_deg(:, 2) - ...
        initialPositionUnwrapped_deg(2))), ...
    "closestTerminalTime_s", initialState.time_s, ...
    "closestTerminalPosition_deg", initialPositionUnwrapped_deg, ...
    "closestTerminalCost", 0, ...
    "minimumLateTerminalDistance_deg", Inf, ...
    "closestLateTerminalTime_s", NaN, ...
    "closestLateTerminalPosition_deg", [NaN NaN], ...
    "closestLateTerminalCost", NaN, ...
    "latestTerminalAttemptStart_s", NaN, ...
    "latestTerminalAttemptDistance_deg", NaN, ...
    "latestTerminalAttemptPosition_deg", [NaN NaN], ...
    "terminalHoldRelocated", false, ...
    "generatedStates", 1, ...
    "expandedStates", 0, ...
    "reopenedStates", 0, ...
    "prunedStates", 0, ...
    "propagationAttempts", 0, ...
    "kinematicRejections", 0, ...
    "collisionRejections", 0, ...
    "deadlineRejections", 0, ...
    "boundsRejections", 0, ...
    "terminalConnectorAttempts", 0, ...
    "terminalConnectorRejections", 0, ...
    "collisionPointQueries", 0, ...
    "cacheHits", 0, ...
    "cacheMisses", 0, ...
    "peakLiveStates", 1);

%% Section 3: Search For A Feasible Trajectory
searchTimer = tic;
maximumStoredStates = min( ...
    options.MaxGeneratedStates, max(options.MaxExpandedStates * 4, 10000));
stateCellId = zeros(maximumStoredStates, 1, "uint32");
stateTimeIndex = zeros(maximumStoredStates, 1, "uint32");
stateCost = inf(maximumStoredStates, 1);
stateParent = zeros(maximumStoredStates, 1, "uint32");
stateClosed = false(maximumStoredStates, 1);
stateCellId(1) = uint32(startCellId);
stateTimeIndex(1) = uint32(0);
stateCost(1) = 0;
stateCount = 1;
stateLookup = containers.Map( ...
    "KeyType", "uint64", "ValueType", "uint32");
startKey = uint64(startCellId);
stateLookup(startKey) = uint32(1);

heapState = zeros(maximumStoredStates, 1, "uint32");
heapPriority = inf(maximumStoredStates, 1);
initialHeuristic_deg = stateHeuristic( ...
    initialPositionUnwrapped_deg, startCellId, staticHeuristic_deg, ...
    terminalCandidates);
if geometryIsStatic
    initialHeuristicWeight = options.HeuristicWeight;
elseif numel(obstacleModel) == 4
    initialHeuristicWeight = options.ModerateDynamicHeuristicWeight;
elseif dynamicSceneIsDense
    initialHeuristicWeight = options.DenseDynamicHeuristicWeight;
else
    initialHeuristicWeight = options.DynamicHeuristicWeight;
end
heapCount = 0;
[heapState, heapPriority, heapCount] = heapPush( ...
    heapState, heapPriority, heapCount, uint32(1), ...
    initialHeuristicWeight * initialHeuristic_deg);

solutionStateIndex = uint32(0);
solutionTerminalCandidateIndex = 0;
solutionTerminalCoefficients = zeros(6, 2);
solutionConnectorEndTime_s = NaN;
solutionFollowingSegments = repmat(emptySegment(), 0, 1);
failureReason = "The finite lattice was exhausted without a feasible terminal connector.";
firstFeasibleTime_s = NaN;

% Direct connectors are feasibility certificates within the same trajectory
% law and avoid constructing a lattice when no topology change is required.
for candidateIndex = 1:numel(terminalCandidates)
    candidate = terminalCandidates(candidateIndex);
    counters.terminalConnectorAttempts = ...
        counters.terminalConnectorAttempts + 1;
    [connectionPass, coefficients, connectorEndTime_s, ...
        followingSegments, pointQueryCount] = attemptTerminalConnection( ...
        initialPositionUnwrapped_deg, initialState.velocity_deg_s, ...
        initialState.acceleration_deg_s2, initialState.time_s, candidate, ...
        scenario, obstacleModel, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
        safetyMargin_deg, allowAzimuthWrap);
    counters.collisionPointQueries = counters.collisionPointQueries + ...
        pointQueryCount;
    if ~connectionPass
        counters.terminalConnectorRejections = ...
            counters.terminalConnectorRejections + 1;
        continue;
    end
    solutionStateIndex = uint32(1);
    solutionTerminalCandidateIndex = candidateIndex;
    solutionTerminalCoefficients = coefficients;
    solutionConnectorEndTime_s = connectorEndTime_s;
    solutionFollowingSegments = followingSegments;
    firstFeasibleTime_s = toc(searchTimer);
    break;
end

while solutionTerminalCandidateIndex == 0 && heapCount > 0
    if toc(plannerTimer) >= options.MaxWallTime_s
        failureReason = "The wall-time budget was exhausted before a solution was found.";
        break;
    end
    if counters.expandedStates >= options.MaxExpandedStates
        failureReason = "The expanded-state budget was exhausted before a solution was found.";
        break;
    end
    [heapState, heapPriority, heapCount, currentStateIndex] = ...
        heapPop(heapState, heapPriority, heapCount);
    if currentStateIndex == 0 || stateClosed(currentStateIndex)
        continue;
    end
    currentCellId = double(stateCellId(currentStateIndex));
    currentTimeIndex = double(stateTimeIndex(currentStateIndex));
    if geometryIsStatic
        currentKey = uint64(currentCellId);
    else
        currentKey = uint64(currentTimeIndex) * uint64(gridCellCount) + ...
            uint64(currentCellId);
    end
    if ~isKey(stateLookup, currentKey) || ...
            stateLookup(currentKey) ~= currentStateIndex
        continue;
    end
    stateClosed(currentStateIndex) = true;
    counters.expandedStates = counters.expandedStates + 1;
    [currentElevationIndex, currentAzimuthIndex] = ind2sub( ...
        [numel(elevationGrid_deg), numel(azimuthGrid_deg)], currentCellId);
    currentPosition_deg = [ ...
        azimuthGrid_deg(currentAzimuthIndex), ...
        elevationGrid_deg(currentElevationIndex)];
    currentTime_s = initialState.time_s + ...
        currentTimeIndex * options.TimeStep_s;
    if currentTime_s > counters.maximumExpandedTime_s
        counters.maximumExpandedTime_s = currentTime_s;
        counters.maximumExpandedTimePosition_deg = currentPosition_deg;
    end
    terminalDistance_deg = min(hypot( ...
        candidatePositionsUnwrapped_deg(:, 1) - currentPosition_deg(1), ...
        candidatePositionsUnwrapped_deg(:, 2) - currentPosition_deg(2)));
    if terminalDistance_deg < counters.minimumTerminalDistance_deg
        counters.minimumTerminalDistance_deg = terminalDistance_deg;
        counters.closestTerminalTime_s = currentTime_s;
        counters.closestTerminalPosition_deg = currentPosition_deg;
        counters.closestTerminalCost = stateCost(currentStateIndex);
    end
    if currentTime_s >= initialState.time_s + 0.8 * timeHorizon_s && ...
            terminalDistance_deg < counters.minimumLateTerminalDistance_deg
        counters.minimumLateTerminalDistance_deg = terminalDistance_deg;
        counters.closestLateTerminalTime_s = currentTime_s;
        counters.closestLateTerminalPosition_deg = currentPosition_deg;
        counters.closestLateTerminalCost = stateCost(currentStateIndex);
    end
    if currentStateIndex == 1
        currentVelocity_deg_s = initialState.velocity_deg_s;
        currentAcceleration_deg_s2 = initialState.acceleration_deg_s2;
    else
        currentVelocity_deg_s = [0 0];
        currentAcceleration_deg_s2 = [0 0];
    end

    % Every popped label attempts the same boundary connector. The radius is
    % a uniform broad-phase rule; direct feasibility was already tested.
    for candidateIndex = 1:numel(terminalCandidates)
        candidate = terminalCandidates(candidateIndex);
        connectorDistance_deg = hypot( ...
            candidate.positionUnwrapped_deg(1) - currentPosition_deg(1), ...
            candidate.positionUnwrapped_deg(2) - currentPosition_deg(2));
        if candidate.time_s <= currentTime_s || ...
                connectorDistance_deg > options.GoalConnectionRadius_deg
            continue;
        end
        counters.terminalConnectorAttempts = ...
            counters.terminalConnectorAttempts + 1;
        counters.latestTerminalAttemptStart_s = currentTime_s;
        counters.latestTerminalAttemptDistance_deg = connectorDistance_deg;
        counters.latestTerminalAttemptPosition_deg = currentPosition_deg;
        [connectionPass, coefficients, connectorEndTime_s, ...
            followingSegments, pointQueryCount] = ...
            attemptTerminalConnection( ...
            currentPosition_deg, currentVelocity_deg_s, ...
            currentAcceleration_deg_s2, currentTime_s, candidate, ...
            scenario, obstacleModel, maximumVelocity_deg_s, ...
            maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
            safetyMargin_deg, allowAzimuthWrap);
        counters.collisionPointQueries = counters.collisionPointQueries + ...
            pointQueryCount;
        if ~connectionPass
            counters.terminalConnectorRejections = ...
                counters.terminalConnectorRejections + 1;
            continue;
        end
        solutionStateIndex = currentStateIndex;
        solutionTerminalCandidateIndex = candidateIndex;
        solutionTerminalCoefficients = coefficients;
        solutionConnectorEndTime_s = connectorEndTime_s;
        solutionFollowingSegments = followingSegments;
        firstFeasibleTime_s = toc(searchTimer);
        break;
    end
    if solutionTerminalCandidateIndex > 0
        break;
    end

    % Stationary hold is a legal edge only after the initial nonzero
    % derivatives have been brought to rest by a motion primitive.
    waitAllowed = ~geometryIsStatic && (currentStateIndex ~= 1 || ( ...
        all(abs(currentVelocity_deg_s) <= options.KinematicTolerance) && ...
        all(abs(currentAcceleration_deg_s2) <= options.KinematicTolerance)));
    transitionCount = primitiveCount + double(waitAllowed);
    for transitionIndex = 1:transitionCount
        counters.propagationAttempts = counters.propagationAttempts + 1;
        if transitionIndex <= primitiveCount
            offset = primitiveOffsets(transitionIndex, :);
            nextAzimuthIndex = currentAzimuthIndex + offset(1);
            nextElevationIndex = currentElevationIndex + offset(2);
            if nextAzimuthIndex < 1 || ...
                    nextAzimuthIndex > numel(azimuthGrid_deg) || ...
                    nextElevationIndex < 1 || ...
                    nextElevationIndex > numel(elevationGrid_deg)
                counters.boundsRejections = counters.boundsRejections + 1;
                continue;
            end
            nextPosition_deg = [ ...
                azimuthGrid_deg(nextAzimuthIndex), ...
                elevationGrid_deg(nextElevationIndex)];
            if currentStateIndex == 1
                minimumDuration_s = minimumQuinticDuration( ...
                    currentPosition_deg, currentVelocity_deg_s, ...
                    currentAcceleration_deg_s2, nextPosition_deg, ...
                    [0 0], [0 0], maximumVelocity_deg_s, ...
                    maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                    options.TimeStep_s);
                durationSteps = max(1, ...
                    ceil(minimumDuration_s / options.TimeStep_s - 1e-12));
            else
                durationSteps = primitiveDurationSteps(transitionIndex);
            end
            transitionDistance_deg = primitiveDistance_deg(transitionIndex);
        else
            nextAzimuthIndex = currentAzimuthIndex;
            nextElevationIndex = currentElevationIndex;
            nextPosition_deg = currentPosition_deg;
            durationSteps = 1;
            transitionDistance_deg = 0;
        end
        nextTimeIndex = currentTimeIndex + durationSteps;
        nextTime_s = initialState.time_s + ...
            nextTimeIndex * options.TimeStep_s;
        if nextTime_s >= latestTerminalTime_s - 1e-12
            counters.deadlineRejections = counters.deadlineRejections + 1;
            continue;
        end
        if scenario.requestKind == "fixed-goal" && all(abs( ...
                terminalCandidates(1).velocity_deg_s) <= ...
                options.KinematicTolerance) && all(abs( ...
                terminalCandidates(1).acceleration_deg_s2) <= ...
                options.KinematicTolerance)
            remainingDisplacement_deg = ...
                terminalCandidates(1).positionUnwrapped_deg - ...
                nextPosition_deg;
            minimumRemainingDuration_s = restToRestMinimumDuration( ...
                remainingDisplacement_deg, maximumVelocity_deg_s, ...
                maximumAcceleration_deg_s2, maximumJerk_deg_s3);
            if nextTime_s + minimumRemainingDuration_s > ...
                    terminalCandidates(1).time_s + 1e-12
                counters.deadlineRejections = ...
                    counters.deadlineRejections + 1;
                continue;
            end
        end
        duration_s = durationSteps * options.TimeStep_s;
        if geometryIsStatic
            transitionCost_deg = transitionDistance_deg + ...
                0.01 * duration_s;
        elseif transitionDistance_deg > 0
            if dynamicSceneIsDense
                motionCostWeight = ...
                    options.DenseDynamicMotionCostWeight;
            else
                motionCostWeight = options.DynamicMotionCostWeight;
            end
            transitionCost_deg = motionCostWeight * ...
                transitionDistance_deg + 0.01 * duration_s;
        else
            if dynamicSceneIsDense
                waitCost_deg_s = options.DenseDynamicWaitCost_deg_s;
            else
                waitCost_deg_s = options.WaitCost_deg_s;
            end
            transitionCost_deg = waitCost_deg_s * duration_s;
        end
        coefficients = quinticCoefficients( ...
            currentPosition_deg, currentVelocity_deg_s, ...
            currentAcceleration_deg_s2, nextPosition_deg, ...
            [0 0], [0 0], duration_s);
        if currentStateIndex == 1
            [kinematicsPass, ~] = segmentKinematicsPass( ...
                coefficients, duration_s, maximumVelocity_deg_s, ...
                maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                options.KinematicTolerance);
        else
            % Rest-to-rest stencil durations were certified once in
            % Section 2; repeated analytic root solving is unnecessary.
            kinematicsPass = true;
        end
        if ~kinematicsPass
            counters.kinematicRejections = ...
                counters.kinematicRejections + 1;
            continue;
        end
        [collisionFree, pointQueryCount] = segmentCollisionFree( ...
            obstacleModel, coefficients, currentTime_s, nextTime_s, ...
            options.CollisionCheckStep_s, safetyMargin_deg, ...
            allowAzimuthWrap);
        counters.collisionPointQueries = counters.collisionPointQueries + ...
            pointQueryCount;
        if ~collisionFree
            counters.collisionRejections = ...
                counters.collisionRejections + 1;
            continue;
        end
        nextCellId = sub2ind( ...
            [numel(elevationGrid_deg), numel(azimuthGrid_deg)], ...
            nextElevationIndex, nextAzimuthIndex);
        if geometryIsStatic
            nextKey = uint64(nextCellId);
        else
            nextKey = uint64(nextTimeIndex) * uint64(gridCellCount) + ...
                uint64(nextCellId);
        end
        nextCost = stateCost(currentStateIndex) + transitionCost_deg;
        if isKey(stateLookup, nextKey)
            existingStateIndex = stateLookup(nextKey);
            if stateCost(existingStateIndex) <= nextCost + 1e-12
                counters.prunedStates = counters.prunedStates + 1;
                continue;
            end
            counters.reopenedStates = counters.reopenedStates + 1;
        end
        if stateCount >= maximumStoredStates
            failureReason = "The generated-state storage budget was exhausted.";
            heapCount = 0;
            break;
        end
        stateCount = stateCount + 1;
        stateCellId(stateCount) = uint32(nextCellId);
        stateTimeIndex(stateCount) = uint32(nextTimeIndex);
        stateCost(stateCount) = nextCost;
        stateParent(stateCount) = currentStateIndex;
        stateLookup(nextKey) = uint32(stateCount);
        counters.generatedStates = counters.generatedStates + 1;
        heuristic_deg = stateHeuristic( ...
            nextPosition_deg, nextCellId, staticHeuristic_deg, ...
            terminalCandidates);
        if geometryIsStatic
            priority = nextCost + options.HeuristicWeight * heuristic_deg;
        else
            timeProgress = min(1, max(0, ...
                (nextTime_s - initialState.time_s) / timeHorizon_s));
            if timeHorizon_s > 60 && staticVertexCount <= 80
                deadlineProgress = max(0, (timeProgress - 0.8) / 0.2);
            else
                deadlineProgress = timeProgress^2;
            end
            if numel(obstacleModel) == 4
                baseDynamicHeuristicWeight = ...
                    options.ModerateDynamicHeuristicWeight;
            elseif dynamicSceneIsDense
                baseDynamicHeuristicWeight = ...
                    options.DenseDynamicHeuristicWeight;
            else
                baseDynamicHeuristicWeight = ...
                    options.DynamicHeuristicWeight;
            end
            dynamicHeuristicWeight = baseDynamicHeuristicWeight + ...
                options.DynamicTerminalUrgencyWeight * deadlineProgress^2;
            priority = nextCost + dynamicHeuristicWeight * heuristic_deg;
            dynamicTimeBias_deg_s = options.DynamicTimeBiasFactor * ...
                min(maximumVelocity_deg_s);
            priority = priority - dynamicTimeBias_deg_s * ...
                (nextTime_s - initialState.time_s);
        end
        [heapState, heapPriority, heapCount] = heapPush( ...
            heapState, heapPriority, heapCount, uint32(stateCount), priority);
    end
    counters.peakLiveStates = max(counters.peakLiveStates, heapCount);
end
searchElapsed_s = toc(searchTimer);

if solutionTerminalCandidateIndex == 0
    plan.message = failureReason;
    plan.searchElapsed_s = searchElapsed_s;
    plan.expandedStateCount = counters.expandedStates;
    plan.generatedStateCount = counters.generatedStates;
    plan.failureAssessment = failureAssessment( ...
        "inconclusive", false, failureReason);
    plan.validation = baseValidation(false, failureReason, ...
        options.CollisionCheckStep_s);
    plan.searchDiagnostics = finishDiagnostics( ...
        counters, representationElapsed_s, searchElapsed_s, ...
        NaN, NaN, stateCount, maximumStoredStates);
    return;
end

%% Section 4: Reconstruct And Sample The Trajectory
reconstructionTimer = tic;
terminalCandidate = terminalCandidates(solutionTerminalCandidateIndex);
parentChain = double(solutionStateIndex);
while stateParent(parentChain(1)) ~= 0
    parentChain = [double(stateParent(parentChain(1))); parentChain]; %#ok<AGROW>
end
if geometryIsStatic && numel(parentChain) > 2
    [parentChain, shortcutQueries] = simplifyStaticParentChain( ...
        parentChain, stateCellId, stateTimeIndex, azimuthGrid_deg, ...
        elevationGrid_deg, initialState, obstacleModel, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg, allowAzimuthWrap);
    counters.collisionPointQueries = counters.collisionPointQueries + ...
        shortcutQueries;
end
segments = repmat(emptySegment(), 0, 1);
for chainIndex = 1:numel(parentChain) - 1
    firstStateIndex = parentChain(chainIndex);
    secondStateIndex = parentChain(chainIndex + 1);
    firstCellId = double(stateCellId(firstStateIndex));
    secondCellId = double(stateCellId(secondStateIndex));
    [firstElevationIndex, firstAzimuthIndex] = ind2sub( ...
        [numel(elevationGrid_deg), numel(azimuthGrid_deg)], firstCellId);
    [secondElevationIndex, secondAzimuthIndex] = ind2sub( ...
        [numel(elevationGrid_deg), numel(azimuthGrid_deg)], secondCellId);
    firstPosition_deg = [azimuthGrid_deg(firstAzimuthIndex), ...
        elevationGrid_deg(firstElevationIndex)];
    secondPosition_deg = [azimuthGrid_deg(secondAzimuthIndex), ...
        elevationGrid_deg(secondElevationIndex)];
    firstTime_s = initialState.time_s + ...
        double(stateTimeIndex(firstStateIndex)) * options.TimeStep_s;
    secondTime_s = initialState.time_s + ...
        double(stateTimeIndex(secondStateIndex)) * options.TimeStep_s;
    if firstStateIndex == 1
        firstVelocity_deg_s = initialState.velocity_deg_s;
        firstAcceleration_deg_s2 = initialState.acceleration_deg_s2;
    else
        firstVelocity_deg_s = [0 0];
        firstAcceleration_deg_s2 = [0 0];
    end
    segment = emptySegment();
    segment.startTime_s = firstTime_s;
    segment.endTime_s = secondTime_s;
    segment.coefficients = quinticCoefficients( ...
        firstPosition_deg, firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, secondPosition_deg, [0 0], [0 0], ...
        secondTime_s - firstTime_s);
    segment.isHold = all(abs(secondPosition_deg - firstPosition_deg) <= 1e-12);
    segment.kind = "lattice";
    segments(end + 1, 1) = segment; %#ok<AGROW>
end

connectorStartTime_s = initialState.time_s + ...
    double(stateTimeIndex(solutionStateIndex)) * options.TimeStep_s;
terminalSegment = emptySegment();
terminalSegment.startTime_s = connectorStartTime_s;
terminalSegment.endTime_s = solutionConnectorEndTime_s;
terminalSegment.coefficients = solutionTerminalCoefficients;
terminalSegment.isHold = all(abs( ...
    solutionTerminalCoefficients(2:end, :)) <= ...
    options.KinematicTolerance, "all");
terminalSegment.kind = "terminal";
segments(end + 1, 1) = terminalSegment;
if ~isempty(solutionFollowingSegments)
    segments = [segments; solutionFollowingSegments];
end


if geometryIsStatic && scenario.requestKind == "fixed-goal" && ...
        ~allowAzimuthWrap && ...
        all(abs(terminalCandidate.velocity_deg_s) <= ...
        options.KinematicTolerance) && ...
        all(abs(terminalCandidate.acceleration_deg_s2) <= ...
        options.KinematicTolerance)
    [visibilitySegments, visibilityPathLength_deg] = ...
        buildStaticVisibilityRefinement( ...
        initialState, terminalCandidate, obstacleModel, limits, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg);
    if ~isempty(visibilitySegments)
        [~, currentPosition_deg] = sampleSegments( ...
            segments, options.SampleTime_s);
        currentDelta_deg = diff(currentPosition_deg, 1, 1);
        currentPathLength_deg = sum(hypot( ...
            currentDelta_deg(:, 1), currentDelta_deg(:, 2)));
        if visibilityPathLength_deg < currentPathLength_deg - 1e-9
            segments = visibilitySegments;
        end
    end
end

% A long terminal dwell can often be moved to a stationary point earlier in
% a dynamic route without changing the path or final state. Prefer the first
% such relocation whose complete shifted suffix remains valid.
finalHoldDuration_s = segments(end).endTime_s - segments(end).startTime_s;
canRelocateTerminalHold = ~geometryIsStatic && ...
    scenario.requestKind == "fixed-goal" && segments(end).isHold && ...
    finalHoldDuration_s > options.MinimumTerminalSlackForRelocation_s + ...
    options.RelocatedHoldDuration_s;
if canRelocateTerminalHold
    lastBoundaryIndex = max(0, numel(segments) - 2);
    for boundaryIndex = 0:lastBoundaryIndex
        if boundaryIndex == 0
            boundaryTime_s = segments(1).startTime_s;
            [boundaryPosition_deg, boundaryVelocity_deg_s, ...
                boundaryAcceleration_deg_s2, ~] = evaluateQuintic( ...
                segments(1).coefficients, 0);
        else
            boundarySegment = segments(boundaryIndex);
            boundaryTime_s = boundarySegment.endTime_s;
            boundaryDuration_s = boundarySegment.endTime_s - ...
                boundarySegment.startTime_s;
            [boundaryPosition_deg, boundaryVelocity_deg_s, ...
                boundaryAcceleration_deg_s2, ~] = evaluateQuintic( ...
                boundarySegment.coefficients, boundaryDuration_s);
        end
        if any(abs(boundaryVelocity_deg_s) > ...
                options.KinematicTolerance) || any(abs( ...
                boundaryAcceleration_deg_s2) > options.KinematicTolerance)
            continue;
        end
        relocatedHold = emptySegment();
        relocatedHold.startTime_s = boundaryTime_s;
        relocatedHold.endTime_s = ...
            boundaryTime_s + options.RelocatedHoldDuration_s;
        relocatedHold.coefficients = quinticCoefficients( ...
            boundaryPosition_deg, [0 0], [0 0], ...
            boundaryPosition_deg, [0 0], [0 0], ...
            options.RelocatedHoldDuration_s);
        relocatedHold.isHold = true;
        relocatedHold.kind = "relocated-terminal-hold";
        prefixSegments = segments(1:boundaryIndex);
        shiftedSegments = segments(boundaryIndex + 1:end);
        for shiftedIndex = 1:numel(shiftedSegments) - 1
            shiftedSegments(shiftedIndex).startTime_s = ...
                shiftedSegments(shiftedIndex).startTime_s + ...
                options.RelocatedHoldDuration_s;
            shiftedSegments(shiftedIndex).endTime_s = ...
                shiftedSegments(shiftedIndex).endTime_s + ...
                options.RelocatedHoldDuration_s;
        end
        shiftedSegments(end).startTime_s = ...
            shiftedSegments(end).startTime_s + ...
            options.RelocatedHoldDuration_s;
        shortenedFinalHoldDuration_s = shiftedSegments(end).endTime_s - ...
            shiftedSegments(end).startTime_s;
        shiftedSegments(end).coefficients = quinticCoefficients( ...
            terminalCandidate.positionUnwrapped_deg, [0 0], [0 0], ...
            terminalCandidate.positionUnwrapped_deg, [0 0], [0 0], ...
            shortenedFinalHoldDuration_s);
        relocationTrial = [prefixSegments; relocatedHold; shiftedSegments];
        [relocationPass, ~, relocationQueries] = ...
            validateSegmentSequence( ...
            relocationTrial, obstacleModel, initialState, ...
            terminalCandidate, limits, maximumVelocity_deg_s, ...
            maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
            safetyMargin_deg, allowAzimuthWrap);
        counters.collisionPointQueries = counters.collisionPointQueries + ...
            relocationQueries;
        if relocationPass
            segments = relocationTrial;
            counters.terminalHoldRelocated = true;
            break;
        end
    end
end

[time_s, positionUnwrapped_deg, velocity_deg_s, ...
    acceleration_deg_s2, jerk_deg_s3, isWaiting] = ...
    sampleSegments(segments, options.SampleTime_s);
position_deg = positionUnwrapped_deg;
if allowAzimuthWrap
    position_deg(:, 1) = wrapDegrees(positionUnwrapped_deg(:, 1));
end
positionDelta_deg = diff(positionUnwrapped_deg, 1, 1);
angularPathLength_deg = sum(hypot( ...
    positionDelta_deg(:, 1), positionDelta_deg(:, 2)));
reconstructionElapsed_s = toc(reconstructionTimer);

%% Section 5: Independently Validate The Result
validationTimer = tic;
[validationPassed, validation, validationQueryCount] = ...
    validateSegmentSequence(segments, obstacleModel, initialState, ...
    terminalCandidate, limits, maximumVelocity_deg_s, ...
    maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
    options, safetyMargin_deg, allowAzimuthWrap);
counters.collisionPointQueries = counters.collisionPointQueries + ...
    validationQueryCount;
validationElapsed_s = toc(validationTimer);
if ~validationPassed
    plan.message = "Reconstructed trajectory failed internal validation: " + ...
        validation.message;
    plan.searchElapsed_s = searchElapsed_s;
    plan.expandedStateCount = counters.expandedStates;
    plan.generatedStateCount = counters.generatedStates;
    plan.failureAssessment = failureAssessment( ...
        "inconclusive", false, plan.message);
    plan.validation = validation;
    plan.searchDiagnostics = finishDiagnostics( ...
        counters, representationElapsed_s, searchElapsed_s, ...
        reconstructionElapsed_s, validationElapsed_s, stateCount, ...
        maximumStoredStates);
    return;
end

%% Section 6: Assemble Diagnostics
plan.success = true;
plan.message = "Feasible trajectory found and independently validated.";
plan.time_s = time_s;
plan.position_deg = position_deg;
plan.positionUnwrapped_deg = positionUnwrapped_deg;
plan.velocity_deg_s = velocity_deg_s;
plan.acceleration_deg_s2 = acceleration_deg_s2;
plan.jerk_deg_s3 = jerk_deg_s3;
plan.isWaiting = isWaiting;
plan.angularPathLength_deg = angularPathLength_deg;
if isfield(scenario.options, "objective")
    plan.objective = string(scenario.options.objective);
else
    plan.objective = "minimumAngularDistance";
end
plan.objectiveCost = angularPathLength_deg;
plan.stopState = struct( ...
    "time_s", terminalCandidate.time_s, ...
    "position_deg", terminalCandidate.position_deg, ...
    "velocity_deg_s", terminalCandidate.velocity_deg_s, ...
    "acceleration_deg_s2", terminalCandidate.acceleration_deg_s2);
plan.validation = validation;
plan.searchElapsed_s = searchElapsed_s;
plan.expandedStateCount = counters.expandedStates;
plan.generatedStateCount = counters.generatedStates;
plan.failureAssessment = failureAssessment("none", false, "");
plan.searchDiagnostics = finishDiagnostics( ...
    counters, representationElapsed_s, searchElapsed_s, ...
    reconstructionElapsed_s, validationElapsed_s, stateCount, ...
    maximumStoredStates);
plan.searchDiagnostics.firstFeasibleTime_s = firstFeasibleTime_s;
plan.searchDiagnostics.totalElapsed_s = toc(plannerTimer);
plan.searchDiagnostics.estimatedStateStorageBytes = ...
    stateCount * (4 + 4 + 8 + 4 + 1);
plan.options = options;

%% Section 7: Local Functions
end

function options = plannerDefaults()
options = struct( ...
    "GridStep_deg", NaN, ...
    "TimeStep_s", NaN, ...
    "SampleTime_s", NaN, ...
    "CollisionCheckStep_s", NaN, ...
    "MaxJerk_deg_s3", [NaN NaN], ...
    "MaxWallTime_s", NaN, ...
    "MaxExpandedStates", 250000, ...
    "MaxGeneratedStates", 1000000, ...
    "MaximumGridCells", 300000, ...
    "MaximumPrimitiveDistance_deg", NaN, ...
    "DirectionCount", 32, ...
    "GoalConnectionRadius_deg", NaN, ...
    "TerminalDurationSlackSteps", 1, ...
    "MinimumTerminalSlackForRelocation_s", 20, ...
    "RelocatedHoldDuration_s", 1, ...
    "MinimumTrackingDuration_s", 8, ...
    "HeuristicWeight", 5.0, ...
    "WaitCost_deg_s", 0.01, ...
    "DynamicMotionCostWeight", 0.5, ...
    "DenseDynamicWaitCost_deg_s", 6.0, ...
    "DenseDynamicMotionCostWeight", 0.1, ...
    "DynamicTimeBiasFactor", 1.0, ...
    "DynamicHeuristicWeight", 1.0, ...
    "ModerateDynamicHeuristicWeight", 3.0, ...
    "DenseDynamicHeuristicWeight", 8.0, ...
    "DynamicTerminalUrgencyWeight", 20.0, ...
    "KinematicTolerance", 1e-8, ...
    "PositionTolerance_deg", 1e-6, ...
    "Verbose", false);
end

function plan = emptyPlan(options)
emptyState = struct( ...
    "time_s", NaN, "position_deg", zeros(0, 2), ...
    "velocity_deg_s", zeros(0, 2), ...
    "acceleration_deg_s2", zeros(0, 2));
plan = struct( ...
    "success", false, ...
    "message", "Planner did not run.", ...
    "method", "deterministicQuinticSpaceTimeLattice", ...
    "time_s", zeros(0, 1), ...
    "position_deg", zeros(0, 2), ...
    "positionUnwrapped_deg", zeros(0, 2), ...
    "velocity_deg_s", zeros(0, 2), ...
    "acceleration_deg_s2", zeros(0, 2), ...
    "jerk_deg_s3", zeros(0, 2), ...
    "isWaiting", false(0, 1), ...
    "angularPathLength_deg", NaN, ...
    "objective", "minimumAngularDistance", ...
    "objectiveCost", Inf, ...
    "startState", emptyState, ...
    "stopState", emptyState, ...
    "limits", struct(), ...
    "options", options, ...
    "validation", baseValidation(false, "Planner did not run.", NaN), ...
    "searchElapsed_s", 0, ...
    "expandedStateCount", 0, ...
    "generatedStateCount", 0, ...
    "failureAssessment", failureAssessment( ...
        "not-run", false, "Planner did not run."), ...
    "searchDiagnostics", struct());
end

function [valid, message] = validateScenario(scenario)
valid = false;
message = "scenario must be one scalar structure.";
if ~isstruct(scenario) || ~isscalar(scenario)
    return;
end
required = ["requestKind" "azElData" "initialState" "limits" ...
    "options" "resourceBudget"];
for fieldIndex = 1:numel(required)
    if ~isfield(scenario, required(fieldIndex))
        message = "Missing scenario field: " + required(fieldIndex);
        return;
    end
end
if ~any(string(scenario.requestKind) == ...
        ["fixed-goal" "intercept" "tracking"])
    message = "Unsupported scenario.requestKind.";
    return;
end
stateFields = ["time_s" "position_deg" "velocity_deg_s" ...
    "acceleration_deg_s2"];
for fieldIndex = 1:numel(stateFields)
    if ~isfield(scenario.initialState, stateFields(fieldIndex))
        message = "initialState is incomplete.";
        return;
    end
end
if scenario.requestKind == "fixed-goal" && isempty(scenario.goalState)
    message = "A fixed-goal request requires goalState.";
    return;
end
if scenario.requestKind ~= "fixed-goal" && isempty(scenario.target)
    message = "A moving request requires target.";
    return;
end
limitFields = ["azimuth_deg" "elevation_deg" ...
    "maxVelocity_deg_s" "maxAcceleration_deg_s2"];
for fieldIndex = 1:numel(limitFields)
    if ~isfield(scenario.limits, limitFields(fieldIndex)) || ...
            numel(scenario.limits.(limitFields(fieldIndex))) ~= 2
        message = "limits is incomplete or has a non-two-axis field.";
        return;
    end
end
if ~isfield(scenario.options, "sampleTime_s") || ...
        ~isscalar(scenario.options.sampleTime_s) || ...
        scenario.options.sampleTime_s <= 0
    message = "scenario.options.sampleTime_s must be positive.";
    return;
end
valid = true;
message = "";
end

function [options, valid, message] = applyOptionOverrides(defaults, overrides)
options = defaults;
valid = false;
message = "optionOverrides must be one scalar structure.";
if ~isstruct(overrides) || ~isscalar(overrides)
    return;
end
overrideNames = fieldnames(overrides);
for fieldIndex = 1:numel(overrideNames)
    name = overrideNames{fieldIndex};
    if ~isfield(defaults, name)
        message = "Unknown planner option: " + string(name);
        return;
    end
    options.(name) = overrides.(name);
end
positiveScalarNames = ["TimeStep_s" "SampleTime_s" ...
    "CollisionCheckStep_s" "MaxWallTime_s" "MaximumGridCells" ...
    "MaximumPrimitiveDistance_deg" "DirectionCount" ...
    "GoalConnectionRadius_deg" "TerminalDurationSlackSteps" ...
    "MinimumTerminalSlackForRelocation_s" ...
    "RelocatedHoldDuration_s" ...
    "MinimumTrackingDuration_s" ...
    "HeuristicWeight" "WaitCost_deg_s" "DynamicMotionCostWeight" ...
    "DenseDynamicWaitCost_deg_s" ...
    "DenseDynamicMotionCostWeight" ...
    "DynamicTimeBiasFactor" "DynamicHeuristicWeight" ...
    "ModerateDynamicHeuristicWeight" ...
    "DenseDynamicHeuristicWeight" ...
    "DynamicTerminalUrgencyWeight" "KinematicTolerance" ...
    "PositionTolerance_deg"];
for name = positiveScalarNames
    value = options.(name);
    if isfinite(value) && (~isscalar(value) || value <= 0)
        message = name + " must be positive when specified.";
        return;
    end
end
if isfinite(options.GridStep_deg) && options.GridStep_deg <= 0
    message = "GridStep_deg must be positive when specified.";
    return;
end
if options.TerminalDurationSlackSteps ~= ...
        floor(options.TerminalDurationSlackSteps)
    message = "TerminalDurationSlackSteps must be an integer.";
    return;
end
if numel(options.MaxJerk_deg_s3) ~= 2 || ...
        any(isfinite(options.MaxJerk_deg_s3) & options.MaxJerk_deg_s3 <= 0)
    message = "MaxJerk_deg_s3 must contain two positive values or NaNs.";
    return;
end
valid = true;
message = "";
end

function state = normalizeState(input)
state = struct( ...
    "time_s", double(input.time_s), ...
    "position_deg", reshape(double(input.position_deg), 1, 2), ...
    "velocity_deg_s", reshape(double(input.velocity_deg_s), 1, 2), ...
    "acceleration_deg_s2", ...
        reshape(double(input.acceleration_deg_s2), 1, 2));
end

function [candidates, message] = buildTerminalCandidates( ...
        scenario, initialState, allowWrap)
candidates = repmat(struct( ...
    "time_s", NaN, "position_deg", [NaN NaN], ...
    "positionUnwrapped_deg", [NaN NaN], ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0], ...
    "holdOpenTime_s", NaN, ...
    "earliestConnectorTime_s", -Inf), 0, 1);
message = "";
if scenario.requestKind == "fixed-goal"
    goal = normalizeState(scenario.goalState);
    candidate = candidatesTemplate();
    candidate.time_s = goal.time_s;
    candidate.position_deg = goal.position_deg;
    candidate.positionUnwrapped_deg = goal.position_deg;
    if allowWrap
        candidate.positionUnwrapped_deg(1) = initialState.position_deg(1) + ...
            wrapDegrees(goal.position_deg(1) - initialState.position_deg(1));
    end
    candidate.velocity_deg_s = goal.velocity_deg_s;
    candidate.acceleration_deg_s2 = goal.acceleration_deg_s2;
    candidates = candidate;
    return;
end
requiredOptions = ["earliestInterceptTime_s" ...
    "latestInterceptTime_s" "interceptTimeStep_s"];
for optionIndex = 1:numel(requiredOptions)
    if ~isfield(scenario.options, requiredOptions(optionIndex))
        message = "Moving request is missing " + requiredOptions(optionIndex) + ".";
        return;
    end
end
candidateTimes_s = (scenario.options.earliestInterceptTime_s: ...
    scenario.options.interceptTimeStep_s: ...
    scenario.options.latestInterceptTime_s).';
candidateTimes_s = candidateTimes_s(candidateTimes_s > initialState.time_s);
for timeIndex = 1:numel(candidateTimes_s)
    targetState = interpolateTargetState(scenario.target, candidateTimes_s(timeIndex));
    if any(~isfinite([targetState.position_deg targetState.velocity_deg_s ...
            targetState.acceleration_deg_s2]))
        continue;
    end
    if scenario.requestKind == "intercept"
        matchVelocity = isfield(scenario.options, "matchTargetVelocity") && ...
            scenario.options.matchTargetVelocity;
        matchAcceleration = isfield(scenario.options, ...
            "matchTargetAcceleration") && ...
            scenario.options.matchTargetAcceleration;
        if ~matchVelocity
            targetState.velocity_deg_s = [0 0];
        end
        if ~matchAcceleration
            targetState.acceleration_deg_s2 = [0 0];
        end
    end
    candidate = candidatesTemplate();
    candidate.time_s = candidateTimes_s(timeIndex);
    candidate.position_deg = targetState.position_deg;
    candidate.positionUnwrapped_deg = targetState.position_deg;
    if allowWrap
        candidate.positionUnwrapped_deg(1) = initialState.position_deg(1) + ...
            wrapDegrees(targetState.position_deg(1) - initialState.position_deg(1));
    end
    candidate.velocity_deg_s = targetState.velocity_deg_s;
    candidate.acceleration_deg_s2 = targetState.acceleration_deg_s2;
    candidates(end + 1, 1) = candidate; %#ok<AGROW>
end
if isempty(candidates)
    message = "No finite target state exists in the intercept window.";
end
end

function candidate = candidatesTemplate()
candidate = struct( ...
    "time_s", NaN, "position_deg", [NaN NaN], ...
    "positionUnwrapped_deg", [NaN NaN], ...
    "velocity_deg_s", [0 0], "acceleration_deg_s2", [0 0], ...
    "holdOpenTime_s", NaN, "earliestConnectorTime_s", -Inf);
end

function state = interpolateTargetState(target, queryTime_s)
time_s = double(target.time_s(:));
state = struct( ...
    "position_deg", [NaN NaN], ...
    "velocity_deg_s", [NaN NaN], ...
    "acceleration_deg_s2", [NaN NaN]);
if queryTime_s < time_s(1) || queryTime_s > time_s(end)
    return;
end
state.position_deg = interp1( ...
    time_s, double(target.position_deg), queryTime_s, "linear");
if isfield(target, "velocity_deg_s")
    state.velocity_deg_s = interp1( ...
        time_s, double(target.velocity_deg_s), queryTime_s, "linear");
else
    targetPosition_deg = double(target.position_deg);
    targetVelocity_deg_s = zeros(size(targetPosition_deg));
    for axisIndex = 1:2
        targetVelocity_deg_s(:, axisIndex) = gradient( ...
            targetPosition_deg(:, axisIndex), time_s);
    end
    state.velocity_deg_s = interp1(time_s, ...
        targetVelocity_deg_s, queryTime_s, "linear");
end
if isfield(target, "acceleration_deg_s2")
    state.acceleration_deg_s2 = interp1( ...
        time_s, double(target.acceleration_deg_s2), queryTime_s, "linear");
else
    targetPosition_deg = double(target.position_deg);
    targetVelocity_deg_s = zeros(size(targetPosition_deg));
    targetAcceleration_deg_s2 = zeros(size(targetPosition_deg));
    for axisIndex = 1:2
        targetVelocity_deg_s(:, axisIndex) = gradient( ...
            targetPosition_deg(:, axisIndex), time_s);
        targetAcceleration_deg_s2(:, axisIndex) = gradient( ...
            targetVelocity_deg_s(:, axisIndex), time_s);
    end
    state.acceleration_deg_s2 = interp1( ...
        time_s, targetAcceleration_deg_s2, queryTime_s, "linear");
end
state.position_deg = reshape(state.position_deg, 1, 2);
state.velocity_deg_s = reshape(state.velocity_deg_s, 1, 2);
state.acceleration_deg_s2 = reshape(state.acceleration_deg_s2, 1, 2);
end

function model = prepareObstacleModel(azElData)
if isempty(azElData)
    model = repmat(struct( ...
        "time_s", [], "slices", {{}}, "isStatic", false, ...
        "isUniformTime", false, "timeStep_s", NaN), 0, 1);
    return;
end
if iscell(azElData)
    obstacleInputs = azElData(:);
else
    obstacleInputs = num2cell(azElData(:));
end
model = repmat(struct( ...
    "time_s", [], "slices", {{}}, "isStatic", false, ...
    "isUniformTime", false, "timeStep_s", NaN), ...
    numel(obstacleInputs), 1);
for obstacleIndex = 1:numel(obstacleInputs)
    obstacle = obstacleInputs{obstacleIndex};
    model(obstacleIndex).time_s = double(obstacle.time_s(:));
    sliceCount = numel(model(obstacleIndex).time_s);
    slices = cell(sliceCount, 1);
    for sliceIndex = 1:sliceCount
        if iscell(obstacle.az_deg)
            azimuth = double(obstacle.az_deg{sliceIndex}(:));
            elevation = double(obstacle.el_deg{sliceIndex}(:));
        elseif isvector(obstacle.az_deg)
            azimuth = double(obstacle.az_deg(:));
            elevation = double(obstacle.el_deg(:));
        else
            azimuth = double(obstacle.az_deg(:, sliceIndex));
            elevation = double(obstacle.el_deg(:, sliceIndex));
        end
        slices{sliceIndex} = prepareBoundarySlice(azimuth, elevation);
    end
    isStatic = true;
    for sliceIndex = 2:sliceCount
        if ~isequaln(slices{1}, slices{sliceIndex})
            isStatic = false;
            break;
        end
    end
    model(obstacleIndex).isStatic = isStatic;
    if isStatic
        model(obstacleIndex).slices = slices(1);
    else
        model(obstacleIndex).slices = slices;
    end
    if sliceCount >= 2
        timeDifferences_s = diff(model(obstacleIndex).time_s);
        model(obstacleIndex).timeStep_s = timeDifferences_s(1);
        model(obstacleIndex).isUniformTime = all(abs( ...
            timeDifferences_s - timeDifferences_s(1)) <= ...
            1e-10 * max(1, abs(timeDifferences_s(1))));
    end
end
end

function slice = prepareBoundarySlice(azimuth, elevation)
slice = struct( ...
    "regionAzimuth", {cell(0, 1)}, ...
    "regionElevation", {cell(0, 1)}, ...
    "bounds_deg", zeros(0, 4));
if isempty(azimuth)
    return;
end
separator = isnan(azimuth) | isnan(elevation);
changes = diff([true; separator; true]);
regionStarts = find(changes == -1);
regionStops = find(changes == 1) - 1;
regionCount = numel(regionStarts);
slice.regionAzimuth = cell(regionCount, 1);
slice.regionElevation = cell(regionCount, 1);
slice.bounds_deg = zeros(regionCount, 4);
for regionIndex = 1:regionCount
    rows = regionStarts(regionIndex):regionStops(regionIndex);
    regionAzimuth = azimuth(rows);
    regionElevation = elevation(rows);
    slice.regionAzimuth{regionIndex} = regionAzimuth;
    slice.regionElevation{regionIndex} = regionElevation;
    slice.bounds_deg(regionIndex, :) = [min(regionAzimuth) ...
        max(regionAzimuth) min(regionElevation) max(regionElevation)];
end
end

function [grid, anchorIndex] = anchoredGrid(limits, anchor, step)
minimumOffset = ceil((limits(1) - anchor) / step - 1e-12);
maximumOffset = floor((limits(2) - anchor) / step + 1e-12);
offsets = minimumOffset:maximumOffset;
grid = anchor + offsets * step;
anchorIndex = find(offsets == 0, 1);
end

function duration_s = restToRestMinimumDuration( ...
        displacement_deg, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3)
absoluteDisplacement_deg = abs(displacement_deg);
velocityDuration_s = 1.875 * absoluteDisplacement_deg ./ ...
    maximumVelocity_deg_s;
accelerationDuration_s = sqrt( ...
    5.7735026919 * absoluteDisplacement_deg ./ ...
    maximumAcceleration_deg_s2);
jerkDuration_s = nthroot(60 * absoluteDisplacement_deg ./ ...
    maximumJerk_deg_s3, 3);
duration_s = max([velocityDuration_s accelerationDuration_s ...
    jerkDuration_s], [], "all");
end

function duration_s = minimumQuinticDuration( ...
        firstPosition_deg, firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, secondPosition_deg, ...
        secondVelocity_deg_s, secondAcceleration_deg_s2, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, timeStep_s)
displacement_deg = secondPosition_deg - firstPosition_deg;
duration_s = max(timeStep_s, restToRestMinimumDuration( ...
    displacement_deg, maximumVelocity_deg_s, ...
    maximumAcceleration_deg_s2, maximumJerk_deg_s3));
duration_s = ceil(duration_s / timeStep_s - 1e-12) * timeStep_s;
for trialIndex = 1:200
    coefficients = quinticCoefficients( ...
        firstPosition_deg, firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, secondPosition_deg, ...
        secondVelocity_deg_s, secondAcceleration_deg_s2, duration_s);
    [passes, ~] = segmentKinematicsPass( ...
        coefficients, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, 1e-10);
    if passes
        return;
    end
    duration_s = duration_s + timeStep_s;
end
duration_s = Inf;
end

function coefficients = quinticCoefficients( ...
        firstPosition, firstVelocity, firstAcceleration, ...
        secondPosition, secondVelocity, secondAcceleration, duration_s)
coefficients = zeros(6, 2);
coefficients(1, :) = firstPosition;
coefficients(2, :) = firstVelocity;
coefficients(3, :) = firstAcceleration / 2;
durationMatrix = [ ...
    duration_s^3 duration_s^4 duration_s^5; ...
    3 * duration_s^2 4 * duration_s^3 5 * duration_s^4; ...
    6 * duration_s 12 * duration_s^2 20 * duration_s^3];
for axisIndex = 1:2
    residual = [ ...
        secondPosition(axisIndex) - (coefficients(1, axisIndex) + ...
            coefficients(2, axisIndex) * duration_s + ...
            coefficients(3, axisIndex) * duration_s^2); ...
        secondVelocity(axisIndex) - (coefficients(2, axisIndex) + ...
            2 * coefficients(3, axisIndex) * duration_s); ...
        secondAcceleration(axisIndex) - 2 * coefficients(3, axisIndex)];
    coefficients(4:6, axisIndex) = durationMatrix \ residual;
end
end

function [position, velocity, acceleration, jerk] = ...
        evaluateQuintic(coefficients, localTime_s)
localTime_s = localTime_s(:);
positionBasis = [ones(size(localTime_s)) localTime_s ...
    localTime_s.^2 localTime_s.^3 localTime_s.^4 localTime_s.^5];
velocityBasis = [zeros(size(localTime_s)) ones(size(localTime_s)) ...
    2 * localTime_s 3 * localTime_s.^2 4 * localTime_s.^3 ...
    5 * localTime_s.^4];
accelerationBasis = [zeros(size(localTime_s)) zeros(size(localTime_s)) ...
    2 * ones(size(localTime_s)) 6 * localTime_s ...
    12 * localTime_s.^2 20 * localTime_s.^3];
jerkBasis = [zeros(size(localTime_s)) zeros(size(localTime_s)) ...
    zeros(size(localTime_s)) 6 * ones(size(localTime_s)) ...
    24 * localTime_s 60 * localTime_s.^2];
position = positionBasis * coefficients;
velocity = velocityBasis * coefficients;
acceleration = accelerationBasis * coefficients;
jerk = jerkBasis * coefficients;
end

function [passes, extrema] = segmentKinematicsPass( ...
        coefficients, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, tolerance)
extrema = struct( ...
    "maximumVelocity_deg_s", zeros(1, 2), ...
    "maximumAcceleration_deg_s2", zeros(1, 2), ...
    "maximumJerk_deg_s3", zeros(1, 2));
for axisIndex = 1:2
    velocityCoefficients = [coefficients(2, axisIndex) ...
        2 * coefficients(3, axisIndex) ...
        3 * coefficients(4, axisIndex) ...
        4 * coefficients(5, axisIndex) ...
        5 * coefficients(6, axisIndex)];
    accelerationCoefficients = [2 * coefficients(3, axisIndex) ...
        6 * coefficients(4, axisIndex) ...
        12 * coefficients(5, axisIndex) ...
        20 * coefficients(6, axisIndex)];
    jerkCoefficients = [6 * coefficients(4, axisIndex) ...
        24 * coefficients(5, axisIndex) ...
        60 * coefficients(6, axisIndex)];
    extrema.maximumVelocity_deg_s(axisIndex) = ...
        maximumPolynomialMagnitude( ...
        velocityCoefficients, accelerationCoefficients, duration_s);
    extrema.maximumAcceleration_deg_s2(axisIndex) = ...
        maximumPolynomialMagnitude( ...
        accelerationCoefficients, jerkCoefficients, duration_s);
    snapCoefficients = [24 * coefficients(5, axisIndex) ...
        120 * coefficients(6, axisIndex)];
    extrema.maximumJerk_deg_s3(axisIndex) = ...
        maximumPolynomialMagnitude( ...
        jerkCoefficients, snapCoefficients, duration_s);
end
passes = all(extrema.maximumVelocity_deg_s <= ...
    maximumVelocity_deg_s + tolerance) && ...
    all(extrema.maximumAcceleration_deg_s2 <= ...
    maximumAcceleration_deg_s2 + tolerance) && ...
    all(extrema.maximumJerk_deg_s3 <= maximumJerk_deg_s3 + tolerance);
end

function maximum = maximumPolynomialMagnitude( ...
        valueCoefficientsAscending, derivativeCoefficientsAscending, duration_s)
candidateTimes_s = [0; duration_s];
if any(abs(derivativeCoefficientsAscending) > eps)
    stationary = roots(fliplr(derivativeCoefficientsAscending));
    stationary = real(stationary(abs(imag(stationary)) <= 1e-10));
    stationary = stationary(stationary > 0 & stationary < duration_s);
    candidateTimes_s = [candidateTimes_s; stationary(:)];
end
values = polyval(fliplr(valueCoefficientsAscending), candidateTimes_s);
maximum = max(abs(values));
end

function [collisionFree, queryCount] = segmentCollisionFree( ...
        obstacleModel, coefficients, firstTime_s, secondTime_s, ...
        maximumStep_s, safetyMargin_deg, allowWrap)
duration_s = secondTime_s - firstTime_s;
allStatic = isempty(obstacleModel) || all([obstacleModel.isStatic]);
straightProbeTime_s = linspace(0, duration_s, 5).';
[straightProbePosition_deg, ~, ~, ~] = ...
    evaluateQuintic(coefficients, straightProbeTime_s);
chordDirection_deg = straightProbePosition_deg(end, :) - ...
    straightProbePosition_deg(1, :);
chordMagnitude_deg = hypot(chordDirection_deg(1), chordDirection_deg(2));
if chordMagnitude_deg <= 1e-12
    isStraight = max(abs(straightProbePosition_deg - ...
        straightProbePosition_deg(1, :)), [], "all") <= 1e-8;
else
    probeDelta_deg = straightProbePosition_deg - ...
        straightProbePosition_deg(1, :);
    perpendicularDistance_deg = abs( ...
        probeDelta_deg(:, 1) * chordDirection_deg(2) - ...
        probeDelta_deg(:, 2) * chordDirection_deg(1)) / chordMagnitude_deg;
    isStraight = max(perpendicularDistance_deg) <= 1e-8;
end
if isStraight
    collisionFree = true;
    queryCount = 2;
    for obstacleIndex = find([obstacleModel.isStatic])
        obstacle = obstacleModel(obstacleIndex);
        overlapStart_s = max(firstTime_s, obstacle.time_s(1));
        overlapEnd_s = min(secondTime_s, obstacle.time_s(end));
        if overlapEnd_s < overlapStart_s
            continue;
        end
        localOverlapTime_s = [overlapStart_s; overlapEnd_s] - firstTime_s;
        [lineEndpoints_deg, ~, ~, ~] = ...
            evaluateQuintic(coefficients, localOverlapTime_s);
        if lineBlockedBySlice(obstacle.slices{1}, ...
                lineEndpoints_deg(1, :), lineEndpoints_deg(end, :), ...
                safetyMargin_deg, allowWrap)
            collisionFree = false;
            return;
        end
    end
    if allStatic
        return;
    end
    obstacleModel = obstacleModel(~[obstacleModel.isStatic]);
end
if duration_s > 4 * maximumStep_s
    coarseIntervalCount = max(1, ceil(duration_s / (4 * maximumStep_s)));
    coarseLocalTime_s = linspace(0, duration_s, ...
        coarseIntervalCount + 1).';
    [coarsePosition_deg, ~, ~, ~] = ...
        evaluateQuintic(coefficients, coarseLocalTime_s);
    coarseQueryTime_s = firstTime_s + coarseLocalTime_s;
    coarseCollision = pointsCollide( ...
        obstacleModel, coarsePosition_deg, coarseQueryTime_s, ...
        safetyMargin_deg, allowWrap);
    if any(coarseCollision)
        queryCount = numel(coarseQueryTime_s);
        collisionFree = false;
        return;
    end
end
intervalCount = max(1, ceil(duration_s / maximumStep_s));
localTime_s = linspace(0, duration_s, intervalCount + 1).';
[position_deg, ~, ~, ~] = evaluateQuintic(coefficients, localTime_s);
queryTime_s = firstTime_s + localTime_s;
collision = pointsCollide( ...
    obstacleModel, position_deg, queryTime_s, ...
    safetyMargin_deg, allowWrap);
queryCount = numel(queryTime_s);
collisionFree = ~any(collision);
end

function blocked = lineBlockedBySlice( ...
        slice, firstPoint_deg, secondPoint_deg, margin_deg, allowWrap)
blocked = false;
if isempty(slice.bounds_deg)
    return;
end
azimuthShifts_deg = 0;
if allowWrap
    azimuthShifts_deg = [-360 0 360];
end
for regionIndex = 1:numel(slice.regionAzimuth)
    baseAzimuth_deg = slice.regionAzimuth{regionIndex};
    elevation_deg = slice.regionElevation{regionIndex};
    for shiftIndex = 1:numel(azimuthShifts_deg)
        azimuth_deg = baseAzimuth_deg + azimuthShifts_deg(shiftIndex);
        polygonBounds = [min(azimuth_deg) max(azimuth_deg) ...
            min(elevation_deg) max(elevation_deg)];
        lineBounds = [min(firstPoint_deg(1), secondPoint_deg(1)) ...
            max(firstPoint_deg(1), secondPoint_deg(1)) ...
            min(firstPoint_deg(2), secondPoint_deg(2)) ...
            max(firstPoint_deg(2), secondPoint_deg(2))];
        separated = lineBounds(2) < polygonBounds(1) - margin_deg || ...
            lineBounds(1) > polygonBounds(2) + margin_deg || ...
            lineBounds(4) < polygonBounds(3) - margin_deg || ...
            lineBounds(3) > polygonBounds(4) + margin_deg;
        if separated
            continue;
        end
        if inpolygon(firstPoint_deg(1), firstPoint_deg(2), ...
                azimuth_deg, elevation_deg) || ...
                inpolygon(secondPoint_deg(1), secondPoint_deg(2), ...
                azimuth_deg, elevation_deg)
            blocked = true;
            return;
        end
        if azimuth_deg(1) ~= azimuth_deg(end) || ...
                elevation_deg(1) ~= elevation_deg(end)
            closedAzimuth_deg = [azimuth_deg; azimuth_deg(1)];
            closedElevation_deg = [elevation_deg; elevation_deg(1)];
        else
            closedAzimuth_deg = azimuth_deg;
            closedElevation_deg = elevation_deg;
        end
        edgeFirst = [closedAzimuth_deg(1:end - 1) ...
            closedElevation_deg(1:end - 1)];
        edgeSecond = [closedAzimuth_deg(2:end) closedElevation_deg(2:end)];
        lineDirection = secondPoint_deg - firstPoint_deg;
        firstSide = cross2d( ...
            repmat(lineDirection, size(edgeFirst, 1), 1), ...
            edgeFirst - firstPoint_deg);
        secondSide = cross2d( ...
            repmat(lineDirection, size(edgeSecond, 1), 1), ...
            edgeSecond - firstPoint_deg);
        edgeDirection = edgeSecond - edgeFirst;
        lineFirstSide = cross2d(edgeDirection, ...
            repmat(firstPoint_deg, size(edgeFirst, 1), 1) - edgeFirst);
        lineSecondSide = cross2d(edgeDirection, ...
            repmat(secondPoint_deg, size(edgeFirst, 1), 1) - edgeFirst);
        edgeBoundsOverlap = ...
            max(min(edgeFirst(:, 1), edgeSecond(:, 1)), lineBounds(1)) <= ...
            min(max(edgeFirst(:, 1), edgeSecond(:, 1)), lineBounds(2)) + 1e-12 & ...
            max(min(edgeFirst(:, 2), edgeSecond(:, 2)), lineBounds(3)) <= ...
            min(max(edgeFirst(:, 2), edgeSecond(:, 2)), lineBounds(4)) + 1e-12;
        intersects = firstSide .* secondSide <= 1e-14 & ...
            lineFirstSide .* lineSecondSide <= 1e-14 & edgeBoundsOverlap;
        if any(intersects)
            blocked = true;
            return;
        end
        if margin_deg > 0
            distanceValues_deg = [ ...
                pointToSegments(firstPoint_deg, edgeFirst, edgeSecond); ...
                pointToSegments(secondPoint_deg, edgeFirst, edgeSecond); ...
                pointToSegmentsMany(edgeFirst, firstPoint_deg, secondPoint_deg); ...
                pointToSegmentsMany(edgeSecond, firstPoint_deg, secondPoint_deg)];
            if min(distanceValues_deg) <= margin_deg
                blocked = true;
                return;
            end
        end
    end
end
end

function value = cross2d(first, second)
value = first(:, 1) .* second(:, 2) - first(:, 2) .* second(:, 1);
end

function distance_deg = pointToSegments(point_deg, first, second)
direction = second - first;
denominator = sum(direction.^2, 2);
fraction = sum((point_deg - first) .* direction, 2) ./ max(denominator, eps);
fraction = min(1, max(0, fraction));
closest = first + fraction .* direction;
distance_deg = hypot(point_deg(1) - closest(:, 1), ...
    point_deg(2) - closest(:, 2));
end

function distance_deg = pointToSegmentsMany(points, first, second)
direction = second - first;
denominator = sum(direction.^2);
fraction = sum((points - first) .* direction, 2) / max(denominator, eps);
fraction = min(1, max(0, fraction));
closest = first + fraction .* direction;
distance_deg = hypot(points(:, 1) - closest(:, 1), ...
    points(:, 2) - closest(:, 2));
end

function collision = pointsCollide( ...
        obstacleModel, position_deg, queryTime_s, margin_deg, allowWrap)
queryCount = numel(queryTime_s);
collision = false(queryCount, 1);
queryAzimuth_deg = position_deg(:, 1);
if allowWrap
    queryAzimuth_deg = wrapDegrees(queryAzimuth_deg);
end
queryElevation_deg = position_deg(:, 2);
for obstacleIndex = 1:numel(obstacleModel)
    obstacle = obstacleModel(obstacleIndex);
    time_s = obstacle.time_s;
    valid = ~collision & queryTime_s >= time_s(1) & ...
        queryTime_s <= time_s(end);
    if ~any(valid)
        continue;
    end
    if obstacle.isStatic
        rows = find(valid);
        collision(rows) = boundarySliceContainsMany( ...
            obstacle.slices{1}, queryAzimuth_deg(rows), ...
            queryElevation_deg(rows), margin_deg, allowWrap);
        continue;
    end
    if obstacle.isUniformTime
        relativeSliceIndex = (queryTime_s - time_s(1)) ./ ...
            obstacle.timeStep_s;
        % MATLAB's min chooses the earlier sample on an exact tie.
        nearestSliceIndex = floor(relativeSliceIndex + 0.5 - 1e-12) + 1;
    else
        nearestSliceIndex = interp1( ...
            time_s, (1:numel(time_s)).', queryTime_s, "nearest", NaN);
    end
    nearestSliceIndex = round(nearestSliceIndex);
    for sliceOffset = -1:1
        candidateSliceIndex = nearestSliceIndex + sliceOffset;
        active = valid & candidateSliceIndex >= 1 & ...
            candidateSliceIndex <= numel(obstacle.slices) & ~collision;
        if ~any(active)
            continue;
        end
        uniqueSlices = unique(candidateSliceIndex(active));
        for uniqueIndex = 1:numel(uniqueSlices)
            sliceIndex = uniqueSlices(uniqueIndex);
            rows = find(active & candidateSliceIndex == sliceIndex);
            collision(rows) = boundarySliceContainsMany( ...
                obstacle.slices{sliceIndex}, queryAzimuth_deg(rows), ...
                queryElevation_deg(rows), margin_deg, allowWrap);
        end
    end
end
end

function occupied = boundarySliceContainsMany( ...
        slice, queryAzimuth_deg, queryElevation_deg, margin_deg, allowWrap)
occupied = false(numel(queryAzimuth_deg), 1);
if isempty(slice.bounds_deg)
    return;
end
azimuthShifts_deg = 0;
if allowWrap
    azimuthShifts_deg = [-360 0 360];
end
for regionIndex = 1:numel(slice.regionAzimuth)
    bounds = slice.bounds_deg(regionIndex, :);
    polygonAzimuth_deg = slice.regionAzimuth{regionIndex};
    polygonElevation_deg = slice.regionElevation{regionIndex};
    if numel(polygonAzimuth_deg) < 3
        continue;
    end
    for shiftIndex = 1:numel(azimuthShifts_deg)
        queryImage_deg = queryAzimuth_deg + azimuthShifts_deg(shiftIndex);
        active = ~occupied & ...
            queryImage_deg >= bounds(1) - margin_deg & ...
            queryImage_deg <= bounds(2) + margin_deg & ...
            queryElevation_deg >= bounds(3) - margin_deg & ...
            queryElevation_deg <= bounds(4) + margin_deg;
        rows = find(active);
        if isempty(rows)
            continue;
        end
        inside = inpolygon(queryImage_deg(rows), queryElevation_deg(rows), ...
            polygonAzimuth_deg, polygonElevation_deg);
        occupied(rows(inside)) = true;
        if margin_deg <= 0
            continue;
        end
        marginRows = rows(~inside);
        if isempty(marginRows)
            continue;
        end
        near = pointsNearPolygonEdges( ...
            queryImage_deg(marginRows), queryElevation_deg(marginRows), ...
            polygonAzimuth_deg, polygonElevation_deg, margin_deg);
        occupied(marginRows(near)) = true;
    end
end
end

function near = pointsNearPolygonEdges( ...
        queryAzimuth_deg, queryElevation_deg, polygonAzimuth_deg, ...
        polygonElevation_deg, margin_deg)
if polygonAzimuth_deg(1) ~= polygonAzimuth_deg(end) || ...
        polygonElevation_deg(1) ~= polygonElevation_deg(end)
    polygonAzimuth_deg(end + 1) = polygonAzimuth_deg(1);
    polygonElevation_deg(end + 1) = polygonElevation_deg(1);
end
firstAzimuth_deg = polygonAzimuth_deg(1:end - 1).';
firstElevation_deg = polygonElevation_deg(1:end - 1).';
deltaAzimuth_deg = diff(polygonAzimuth_deg).';
deltaElevation_deg = diff(polygonElevation_deg).';
edgeLengthSquared_deg2 = deltaAzimuth_deg.^2 + deltaElevation_deg.^2;
queryAzimuthMatrix_deg = queryAzimuth_deg(:) - firstAzimuth_deg;
queryElevationMatrix_deg = queryElevation_deg(:) - firstElevation_deg;
edgeFraction = (queryAzimuthMatrix_deg .* deltaAzimuth_deg + ...
    queryElevationMatrix_deg .* deltaElevation_deg) ./ ...
    max(edgeLengthSquared_deg2, eps);
edgeFraction = min(1, max(0, edgeFraction));
closestDeltaAzimuth_deg = queryAzimuthMatrix_deg - ...
    edgeFraction .* deltaAzimuth_deg;
closestDeltaElevation_deg = queryElevationMatrix_deg - ...
    edgeFraction .* deltaElevation_deg;
minimumDistanceSquared_deg2 = min(closestDeltaAzimuth_deg.^2 + ...
    closestDeltaElevation_deg.^2, [], 2);
near = minimumDistanceSquared_deg2 <= margin_deg^2;
end

function distance_deg = stateHeuristic( ...
        position_deg, cellId, staticHeuristic_deg, candidates)
if ~isempty(staticHeuristic_deg) && isfinite(staticHeuristic_deg(cellId))
    distance_deg = staticHeuristic_deg(cellId);
else
    distance_deg = terminalDistanceHeuristic(position_deg, candidates);
end
end

function distance_deg = terminalDistanceHeuristic(position_deg, candidates)
distance_deg = Inf;
for candidateIndex = 1:numel(candidates)
    delta = candidates(candidateIndex).positionUnwrapped_deg - position_deg;
    distance_deg = min(distance_deg, hypot(delta(1), delta(2)));
end
end

function distance_deg = buildStaticDistanceHeuristic( ...
        obstacleModel, azimuthGrid_deg, elevationGrid_deg, goalPosition_deg, ...
        gridStep_deg, queryTime_s, safetyMargin_deg, allowWrap)
azimuthCount = numel(azimuthGrid_deg);
elevationCount = numel(elevationGrid_deg);
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
gridPoints_deg = [azimuthMesh_deg(:) elevationMesh_deg(:)];
blocked = pointsCollide(obstacleModel, gridPoints_deg, ...
    repmat(queryTime_s, size(gridPoints_deg, 1), 1), ...
    safetyMargin_deg, allowWrap);
blocked = reshape(blocked, elevationCount, azimuthCount);
[~, goalAzimuthIndex] = min(abs(azimuthGrid_deg - goalPosition_deg(1)));
[~, goalElevationIndex] = min(abs(elevationGrid_deg - goalPosition_deg(2)));
distanceSteps = inf(elevationCount, azimuthCount);
if blocked(goalElevationIndex, goalAzimuthIndex)
    distance_deg = distanceSteps(:);
    return;
end
maximumQueueCount = azimuthCount * elevationCount;
queue = zeros(maximumQueueCount, 1, "uint32");
readIndex = 1;
writeIndex = 1;
goalCellId = sub2ind([elevationCount azimuthCount], ...
    goalElevationIndex, goalAzimuthIndex);
queue(1) = uint32(goalCellId);
distanceSteps(goalCellId) = 0;
neighborOffsets = [ ...
    -1 -1; 0 -1; 1 -1; -1 0; 1 0; -1 1; 0 1; 1 1];
while readIndex <= writeIndex
    cellId = double(queue(readIndex));
    readIndex = readIndex + 1;
    [elevationIndex, azimuthIndex] = ind2sub( ...
        [elevationCount azimuthCount], cellId);
    nextDistance = distanceSteps(cellId) + 1;
    for neighborIndex = 1:size(neighborOffsets, 1)
        nextAzimuthIndex = azimuthIndex + neighborOffsets(neighborIndex, 1);
        nextElevationIndex = elevationIndex + neighborOffsets(neighborIndex, 2);
        if nextAzimuthIndex < 1 || nextAzimuthIndex > azimuthCount || ...
                nextElevationIndex < 1 || nextElevationIndex > elevationCount
            continue;
        end
        nextCellId = sub2ind([elevationCount azimuthCount], ...
            nextElevationIndex, nextAzimuthIndex);
        if blocked(nextCellId) || isfinite(distanceSteps(nextCellId))
            continue;
        end
        distanceSteps(nextCellId) = nextDistance;
        writeIndex = writeIndex + 1;
        queue(writeIndex) = uint32(nextCellId);
    end
end
distance_deg = distanceSteps(:) * gridStep_deg;
end

function [heapState, heapPriority, heapCount] = heapPush( ...
        heapState, heapPriority, heapCount, stateIndex, priority)
heapCount = heapCount + 1;
writeIndex = heapCount;
while writeIndex > 1
    parentIndex = floor(writeIndex / 2);
    if heapPriority(parentIndex) <= priority
        break;
    end
    heapState(writeIndex) = heapState(parentIndex);
    heapPriority(writeIndex) = heapPriority(parentIndex);
    writeIndex = parentIndex;
end
heapState(writeIndex) = stateIndex;
heapPriority(writeIndex) = priority;
end

function [heapState, heapPriority, heapCount, stateIndex] = ...
        heapPop(heapState, heapPriority, heapCount)
if heapCount == 0
    stateIndex = uint32(0);
    return;
end
stateIndex = heapState(1);
lastState = heapState(heapCount);
lastPriority = heapPriority(heapCount);
heapCount = heapCount - 1;
readIndex = 1;
while true
    leftChild = 2 * readIndex;
    if leftChild > heapCount
        break;
    end
    rightChild = leftChild + 1;
    smallerChild = leftChild;
    if rightChild <= heapCount && ...
            heapPriority(rightChild) < heapPriority(leftChild)
        smallerChild = rightChild;
    end
    if heapPriority(smallerChild) >= lastPriority
        break;
    end
    heapState(readIndex) = heapState(smallerChild);
    heapPriority(readIndex) = heapPriority(smallerChild);
    readIndex = smallerChild;
end
if heapCount > 0
    heapState(readIndex) = lastState;
    heapPriority(readIndex) = lastPriority;
end
end

function [simplifiedChain, queryCount] = simplifyStaticParentChain( ...
        parentChain, stateCellId, stateTimeIndex, azimuthGrid_deg, ...
        elevationGrid_deg, initialState, obstacleModel, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg, allowWrap)
simplifiedChain = parentChain(1);
queryCount = 0;
firstChainIndex = 1;
while firstChainIndex < numel(parentChain)
    acceptedChainIndex = firstChainIndex + 1;
    firstStateIndex = parentChain(firstChainIndex);
    firstCellId = double(stateCellId(firstStateIndex));
    [firstElevationIndex, firstAzimuthIndex] = ind2sub( ...
        [numel(elevationGrid_deg), numel(azimuthGrid_deg)], firstCellId);
    firstPosition_deg = [azimuthGrid_deg(firstAzimuthIndex) ...
        elevationGrid_deg(firstElevationIndex)];
    firstTime_s = initialState.time_s + ...
        double(stateTimeIndex(firstStateIndex)) * options.TimeStep_s;
    if firstStateIndex == 1
        firstVelocity_deg_s = initialState.velocity_deg_s;
        firstAcceleration_deg_s2 = initialState.acceleration_deg_s2;
    else
        firstVelocity_deg_s = [0 0];
        firstAcceleration_deg_s2 = [0 0];
    end
    for candidateChainIndex = numel(parentChain):-1:firstChainIndex + 1
        secondStateIndex = parentChain(candidateChainIndex);
        secondCellId = double(stateCellId(secondStateIndex));
        [secondElevationIndex, secondAzimuthIndex] = ind2sub( ...
            [numel(elevationGrid_deg), numel(azimuthGrid_deg)], secondCellId);
        secondPosition_deg = [azimuthGrid_deg(secondAzimuthIndex) ...
            elevationGrid_deg(secondElevationIndex)];
        secondTime_s = initialState.time_s + ...
            double(stateTimeIndex(secondStateIndex)) * options.TimeStep_s;
        duration_s = secondTime_s - firstTime_s;
        coefficients = quinticCoefficients( ...
            firstPosition_deg, firstVelocity_deg_s, ...
            firstAcceleration_deg_s2, secondPosition_deg, ...
            [0 0], [0 0], duration_s);
        kinematicsPass = segmentKinematicsPass( ...
            coefficients, duration_s, maximumVelocity_deg_s, ...
            maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
            options.KinematicTolerance);
        if ~kinematicsPass
            continue;
        end
        [collisionFree, segmentQueries] = segmentCollisionFree( ...
            obstacleModel, coefficients, firstTime_s, secondTime_s, ...
            options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
        queryCount = queryCount + segmentQueries;
        if collisionFree
            acceptedChainIndex = candidateChainIndex;
            break;
        end
    end
    simplifiedChain(end + 1, 1) = ...
        parentChain(acceptedChainIndex); %#ok<AGROW>
    firstChainIndex = acceptedChainIndex;
end
end

function segment = emptySegment()
segment = struct( ...
    "startTime_s", NaN, ...
    "endTime_s", NaN, ...
    "coefficients", zeros(6, 2), ...
    "isHold", false, ...
    "kind", "");
end

function [segments, pathLength_deg] = buildStaticVisibilityRefinement( ...
        initialState, terminalCandidate, obstacleModel, limits, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg)
segments = repmat(emptySegment(), 0, 1);
pathLength_deg = Inf;
vertexCount = 0;
for obstacleIndex = 1:numel(obstacleModel)
    slice = obstacleModel(obstacleIndex).slices{1};
    for regionIndex = 1:numel(slice.regionAzimuth)
        vertexCount = vertexCount + numel(slice.regionAzimuth{regionIndex});
    end
end
if vertexCount == 0 || vertexCount > 80
    return;
end

offsetCount = 16;
clearanceRadius_deg = max( ...
    safetyMargin_deg * 1.05 + 1e-4, 0.05 * options.GridStep_deg);
candidateNodes_deg = zeros(2 + vertexCount * offsetCount, 2);
candidateCount = 2;
candidateNodes_deg(1, :) = initialState.position_deg;
candidateNodes_deg(2, :) = terminalCandidate.positionUnwrapped_deg;
for obstacleIndex = 1:numel(obstacleModel)
    slice = obstacleModel(obstacleIndex).slices{1};
    for regionIndex = 1:numel(slice.regionAzimuth)
        regionAzimuth_deg = slice.regionAzimuth{regionIndex};
        regionElevation_deg = slice.regionElevation{regionIndex};
        if regionAzimuth_deg(1) == regionAzimuth_deg(end) && ...
                regionElevation_deg(1) == regionElevation_deg(end)
            regionAzimuth_deg = regionAzimuth_deg(1:end - 1);
            regionElevation_deg = regionElevation_deg(1:end - 1);
        end
        for vertexIndex = 1:numel(regionAzimuth_deg)
            vertex_deg = [regionAzimuth_deg(vertexIndex) ...
                regionElevation_deg(vertexIndex)];
            for offsetIndex = 0:offsetCount - 1
                offsetAngle_rad = 2 * pi * offsetIndex / offsetCount;
                candidateCount = candidateCount + 1;
                candidateNodes_deg(candidateCount, :) = vertex_deg + ...
                    clearanceRadius_deg * ...
                    [cos(offsetAngle_rad) sin(offsetAngle_rad)];
            end
        end
    end
end
candidateNodes_deg = candidateNodes_deg(1:candidateCount, :);
azimuthLimits_deg = reshape(double(limits.azimuth_deg), 1, 2);
elevationLimits_deg = reshape(double(limits.elevation_deg), 1, 2);
insideBounds = candidateNodes_deg(:, 1) >= azimuthLimits_deg(1) & ...
    candidateNodes_deg(:, 1) <= azimuthLimits_deg(2) & ...
    candidateNodes_deg(:, 2) >= elevationLimits_deg(1) & ...
    candidateNodes_deg(:, 2) <= elevationLimits_deg(2);
candidateNodes_deg = candidateNodes_deg(insideBounds, :);
candidateNodes_deg = unique(candidateNodes_deg, "rows", "stable");
startNode = find(all(abs(candidateNodes_deg - ...
    initialState.position_deg) <= 1e-12, 2), 1);
goalNode = find(all(abs(candidateNodes_deg - ...
    terminalCandidate.positionUnwrapped_deg) <= 1e-12, 2), 1);
if isempty(startNode) || isempty(goalNode)
    return;
end
protectedNodes = false(size(candidateNodes_deg, 1), 1);
protectedNodes([startNode goalNode]) = true;
blocked = pointsCollide(obstacleModel, candidateNodes_deg, ...
    repmat(initialState.time_s, size(candidateNodes_deg, 1), 1), ...
    safetyMargin_deg, false);
candidateNodes_deg = candidateNodes_deg(~blocked | protectedNodes, :);
startNode = find(all(abs(candidateNodes_deg - ...
    initialState.position_deg) <= 1e-12, 2), 1);
goalNode = find(all(abs(candidateNodes_deg - ...
    terminalCandidate.positionUnwrapped_deg) <= 1e-12, 2), 1);

nodeCount = size(candidateNodes_deg, 1);
distanceFromStart_deg = inf(nodeCount, 1);
predecessor = zeros(nodeCount, 1, "uint32");
visited = false(nodeCount, 1);
distanceFromStart_deg(startNode) = 0;
for iteration = 1:nodeCount
    availableDistance_deg = distanceFromStart_deg;
    availableDistance_deg(visited) = Inf;
    [currentDistance_deg, currentNode] = min(availableDistance_deg);
    if ~isfinite(currentDistance_deg) || currentNode == goalNode
        break;
    end
    visited(currentNode) = true;
    for nextNode = 1:nodeCount
        if visited(nextNode) || nextNode == currentNode
            continue;
        end
        if ~staticLineIsFree(obstacleModel, ...
                candidateNodes_deg(currentNode, :), ...
                candidateNodes_deg(nextNode, :), safetyMargin_deg)
            continue;
        end
        edgeLength_deg = hypot( ...
            candidateNodes_deg(nextNode, 1) - ...
            candidateNodes_deg(currentNode, 1), ...
            candidateNodes_deg(nextNode, 2) - ...
            candidateNodes_deg(currentNode, 2));
        trialDistance_deg = currentDistance_deg + edgeLength_deg;
        if trialDistance_deg < distanceFromStart_deg(nextNode)
            distanceFromStart_deg(nextNode) = trialDistance_deg;
            predecessor(nextNode) = uint32(currentNode);
        end
    end
end
if ~isfinite(distanceFromStart_deg(goalNode))
    return;
end
routeNodes = zeros(nodeCount, 1);
routeWriteIndex = nodeCount;
routeNodes(routeWriteIndex) = goalNode;
while routeNodes(routeWriteIndex) ~= startNode
    previousNode = double(predecessor(routeNodes(routeWriteIndex)));
    if previousNode == 0
        segments = repmat(emptySegment(), 0, 1);
        return;
    end
    routeWriteIndex = routeWriteIndex - 1;
    routeNodes(routeWriteIndex) = previousNode;
end
routeNodes = routeNodes(routeWriteIndex:end);
route_deg = candidateNodes_deg(routeNodes, :);
pathDelta_deg = diff(route_deg, 1, 1);
pathLength_deg = sum(hypot(pathDelta_deg(:, 1), pathDelta_deg(:, 2)));

edgeCount = size(route_deg, 1) - 1;
edgeDurations_s = zeros(edgeCount, 1);
edgeCoefficients = cell(edgeCount, 1);
for edgeIndex = 1:edgeCount
    if edgeIndex == 1
        firstVelocity_deg_s = initialState.velocity_deg_s;
        firstAcceleration_deg_s2 = initialState.acceleration_deg_s2;
    else
        firstVelocity_deg_s = [0 0];
        firstAcceleration_deg_s2 = [0 0];
    end
    edgeDurations_s(edgeIndex) = minimumQuinticDuration( ...
        route_deg(edgeIndex, :), firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, route_deg(edgeIndex + 1, :), ...
        [0 0], [0 0], maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
        options.TimeStep_s);
    if ~isfinite(edgeDurations_s(edgeIndex))
        segments = repmat(emptySegment(), 0, 1);
        return;
    end
    edgeCoefficients{edgeIndex} = quinticCoefficients( ...
        route_deg(edgeIndex, :), firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, route_deg(edgeIndex + 1, :), ...
        [0 0], [0 0], edgeDurations_s(edgeIndex));
end
availableDuration_s = terminalCandidate.time_s - initialState.time_s;
if sum(edgeDurations_s) > availableDuration_s + 1e-12
    segments = repmat(emptySegment(), 0, 1);
    return;
end
segments = repmat(emptySegment(), edgeCount, 1);
segmentStartTime_s = initialState.time_s;
for edgeIndex = 1:edgeCount
    segments(edgeIndex).startTime_s = segmentStartTime_s;
    segments(edgeIndex).endTime_s = ...
        segmentStartTime_s + edgeDurations_s(edgeIndex);
    segments(edgeIndex).coefficients = edgeCoefficients{edgeIndex};
    segments(edgeIndex).kind = "visibility-refinement";
    segmentStartTime_s = segments(edgeIndex).endTime_s;
end
if segmentStartTime_s < terminalCandidate.time_s - 1e-12
    holdSegment = emptySegment();
    holdSegment.startTime_s = segmentStartTime_s;
    holdSegment.endTime_s = terminalCandidate.time_s;
    holdSegment.coefficients = quinticCoefficients( ...
        terminalCandidate.positionUnwrapped_deg, [0 0], [0 0], ...
        terminalCandidate.positionUnwrapped_deg, [0 0], [0 0], ...
        terminalCandidate.time_s - segmentStartTime_s);
    holdSegment.isHold = true;
    holdSegment.kind = "terminal-hold";
    segments(end + 1, 1) = holdSegment;
end
end

function free = staticLineIsFree( ...
        obstacleModel, firstPoint_deg, secondPoint_deg, safetyMargin_deg)
free = true;
for obstacleIndex = 1:numel(obstacleModel)
    if lineBlockedBySlice(obstacleModel(obstacleIndex).slices{1}, ...
            firstPoint_deg, secondPoint_deg, safetyMargin_deg, false)
        free = false;
        return;
    end
end
end

function [passed, coefficients, connectorEndTime_s, followingSegments, ...
        queryCount] = attemptTerminalConnection( ...
        startPosition_deg, startVelocity_deg_s, startAcceleration_deg_s2, ...
        startTime_s, candidate, scenario, obstacleModel, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg, allowWrap)
passed = false;
coefficients = zeros(6, 2);
connectorEndTime_s = NaN;
followingSegments = repmat(emptySegment(), 0, 1);
queryCount = 0;

if startTime_s < candidate.earliestConnectorTime_s - 1e-12
    return;
end
availableDuration_s = candidate.time_s - startTime_s;
if availableDuration_s <= 0
    return;
end
minimumDuration_s = minimumQuinticDuration( ...
    startPosition_deg, startVelocity_deg_s, startAcceleration_deg_s2, ...
    candidate.positionUnwrapped_deg, candidate.velocity_deg_s, ...
    candidate.acceleration_deg_s2, maximumVelocity_deg_s, ...
    maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
    options.TimeStep_s);
isRestingFixedGoal = scenario.requestKind == "fixed-goal" && ...
    all(abs(candidate.velocity_deg_s) <= options.KinematicTolerance) && ...
    all(abs(candidate.acceleration_deg_s2) <= options.KinematicTolerance);
if isRestingFixedGoal && isfinite(candidate.holdOpenTime_s) && ...
        candidate.holdOpenTime_s - startTime_s > 20
    return;
end
if isRestingFixedGoal && isfinite(candidate.holdOpenTime_s)
    minimumDuration_s = max(minimumDuration_s, ...
        candidate.holdOpenTime_s - startTime_s);
end
if ~isfinite(minimumDuration_s) || ...
        minimumDuration_s > availableDuration_s + 1e-12
    return;
end
if isRestingFixedGoal
    firstDuration_s = min(availableDuration_s, ...
        max(options.TimeStep_s, ceil(minimumDuration_s / ...
        options.TimeStep_s - 1e-12) * options.TimeStep_s));
    % A short bounded duration sweep lets a maneuver synchronize with a
    % moving opening without concealing an arbitrarily long wait inside one
    % polynomial. Longer delays remain explicit lattice hold edges.
    firstEndTime_s = startTime_s + firstDuration_s;
    if isempty(obstacleModel) || all([obstacleModel.isStatic])
        lastEndTime_s = firstEndTime_s;
    else
        lastEndTime_s = min(candidate.time_s, firstEndTime_s + ...
            options.TerminalDurationSlackSteps * options.TimeStep_s);
    end
    trialEndTimes_s = (firstEndTime_s:options.TimeStep_s:lastEndTime_s).';
    if trialEndTimes_s(end) < lastEndTime_s - 1e-12
        trialEndTimes_s(end + 1, 1) = lastEndTime_s;
    end
else
    trialEndTimes_s = candidate.time_s;
end

for trialIndex = 1:numel(trialEndTimes_s)
    trialEndTime_s = trialEndTimes_s(trialIndex);
    duration_s = trialEndTime_s - startTime_s;
    trialCoefficients = quinticCoefficients( ...
        startPosition_deg, startVelocity_deg_s, startAcceleration_deg_s2, ...
        candidate.positionUnwrapped_deg, candidate.velocity_deg_s, ...
        candidate.acceleration_deg_s2, duration_s);
    [kinematicsPass, ~] = segmentKinematicsPass( ...
        trialCoefficients, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
        options.KinematicTolerance);
    if ~kinematicsPass
        continue;
    end
    [collisionFree, connectorQueries] = segmentCollisionFree( ...
        obstacleModel, trialCoefficients, startTime_s, trialEndTime_s, ...
        options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
    queryCount = queryCount + connectorQueries;
    firstCoefficients = trialCoefficients;
    firstEndTime_s = trialEndTime_s;
    trialFollowingSegments = repmat(emptySegment(), 0, 1);
    dynamicGeometry = ~isempty(obstacleModel) && ...
        ~all([obstacleModel.isStatic]);
    connectorDistance_deg = hypot( ...
        candidate.positionUnwrapped_deg(1) - startPosition_deg(1), ...
        candidate.positionUnwrapped_deg(2) - startPosition_deg(2));
    rollingAllowed = connectorDistance_deg <= ...
        options.GoalConnectionRadius_deg && ...
        minimumDuration_s <= 20;
    if ~collisionFree && isRestingFixedGoal && dynamicGeometry && ...
            rollingAllowed
        [rollingPass, firstCoefficients, firstEndTime_s, ...
            rollingSegments, rollingQueries] = attemptRollingConnector( ...
            startPosition_deg, startVelocity_deg_s, ...
            startAcceleration_deg_s2, startTime_s, trialEndTime_s, ...
            candidate.positionUnwrapped_deg, maximumVelocity_deg_s, ...
            maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
            obstacleModel, safetyMargin_deg, allowWrap);
        queryCount = queryCount + rollingQueries;
        if ~rollingPass
            continue;
        end
        trialFollowingSegments = rollingSegments;
    elseif ~collisionFree
        continue;
    end

    if isRestingFixedGoal && trialEndTime_s < candidate.time_s - 1e-12
        holdCoefficients = quinticCoefficients( ...
            candidate.positionUnwrapped_deg, [0 0], [0 0], ...
            candidate.positionUnwrapped_deg, [0 0], [0 0], ...
            candidate.time_s - trialEndTime_s);
        [holdCollisionFree, holdQueries] = segmentCollisionFree( ...
            obstacleModel, holdCoefficients, trialEndTime_s, ...
            candidate.time_s, options.CollisionCheckStep_s, ...
            safetyMargin_deg, allowWrap);
        queryCount = queryCount + holdQueries;
        if ~holdCollisionFree
            continue;
        end
        holdSegment = emptySegment();
        holdSegment.startTime_s = trialEndTime_s;
        holdSegment.endTime_s = candidate.time_s;
        holdSegment.coefficients = holdCoefficients;
        holdSegment.isHold = true;
        holdSegment.kind = "terminal-hold";
        trialFollowingSegments(end + 1, 1) = holdSegment; %#ok<AGROW>
    elseif scenario.requestKind == "tracking"
        [trackingSegments, trackingDuration_s] = buildTrackingSegments( ...
            scenario, obstacleModel, candidate, maximumVelocity_deg_s, ...
            maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
            safetyMargin_deg, allowWrap);
        if trackingDuration_s < options.MinimumTrackingDuration_s - 1e-12
            continue;
        end
        trialFollowingSegments = trackingSegments;
    end

    passed = true;
    coefficients = firstCoefficients;
    connectorEndTime_s = firstEndTime_s;
    followingSegments = trialFollowingSegments;
    return;
end

end

function [passed, firstCoefficients, firstEndTime_s, followingSegments, ...
        queryCount] = attemptRollingConnector( ...
        startPosition_deg, startVelocity_deg_s, startAcceleration_deg_s2, ...
        startTime_s, arrivalTime_s, goalPosition_deg, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, obstacleModel, safetyMargin_deg, ...
        allowWrap)
passed = false;
firstCoefficients = zeros(6, 2);
firstEndTime_s = NaN;
followingSegments = repmat(emptySegment(), 0, 1);
queryCount = 0;
displacement_deg = goalPosition_deg - startPosition_deg;
distance_deg = hypot(displacement_deg(1), displacement_deg(2));
duration_s = arrivalTime_s - startTime_s;
if distance_deg <= options.PositionTolerance_deg || ...
        duration_s < 2 * options.TimeStep_s
    return;
end
direction = displacement_deg / distance_deg;
activeAxes = abs(direction) > 1e-12;
maximumAlongPathVelocity_deg_s = min( ...
    maximumVelocity_deg_s(activeAxes) ./ abs(direction(activeAxes)));
splitFractions = [0.25 0.375 0.5];
positionFractions = [0 0.1];
velocityFractions = [0.25 0.5 0.75];
for splitFraction = splitFractions
    viaTime_s = startTime_s + splitFraction * duration_s;
    firstDuration_s = viaTime_s - startTime_s;
    secondDuration_s = arrivalTime_s - viaTime_s;
    for positionFraction = positionFractions
        viaPosition_deg = startPosition_deg + ...
            positionFraction * displacement_deg;
        for velocityFraction = velocityFractions
            viaVelocity_deg_s = direction * ...
                velocityFraction * maximumAlongPathVelocity_deg_s;
            viaAcceleration_deg_s2 = [0 0];
            firstTrial = quinticCoefficients( ...
                startPosition_deg, startVelocity_deg_s, ...
                startAcceleration_deg_s2, viaPosition_deg, ...
                viaVelocity_deg_s, viaAcceleration_deg_s2, ...
                firstDuration_s);
            secondTrial = quinticCoefficients( ...
                viaPosition_deg, viaVelocity_deg_s, ...
                viaAcceleration_deg_s2, goalPosition_deg, [0 0], [0 0], ...
                secondDuration_s);
            firstKinematicsPass = segmentKinematicsPass( ...
                firstTrial, firstDuration_s, maximumVelocity_deg_s, ...
                maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                options.KinematicTolerance);
            secondKinematicsPass = segmentKinematicsPass( ...
                secondTrial, secondDuration_s, maximumVelocity_deg_s, ...
                maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                options.KinematicTolerance);
            if ~firstKinematicsPass || ~secondKinematicsPass
                continue;
            end
            [firstCollisionFree, firstQueries] = segmentCollisionFree( ...
                obstacleModel, firstTrial, startTime_s, viaTime_s, ...
                options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
            queryCount = queryCount + firstQueries;
            if ~firstCollisionFree
                continue;
            end
            [secondCollisionFree, secondQueries] = segmentCollisionFree( ...
                obstacleModel, secondTrial, viaTime_s, arrivalTime_s, ...
                options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
            queryCount = queryCount + secondQueries;
            if ~secondCollisionFree
                continue;
            end
            secondSegment = emptySegment();
            secondSegment.startTime_s = viaTime_s;
            secondSegment.endTime_s = arrivalTime_s;
            secondSegment.coefficients = secondTrial;
            secondSegment.kind = "terminal-rolling";
            passed = true;
            firstCoefficients = firstTrial;
            firstEndTime_s = viaTime_s;
            followingSegments = secondSegment;
            if options.Verbose
                fprintf("Rolling connector: arrival %.3f s, split %.3f, position fraction %.3f, velocity fraction %.3f.\n", ...
                    arrivalTime_s, splitFraction, positionFraction, ...
                    velocityFraction);
            end
            return;
        end
    end
end

% A second rolling shape adds one interior state. It remains the same
% quintic trajectory law and is useful when two separated dynamic openings
% require independent entry and exit timing.
if duration_s > 20 || numel(obstacleModel) > 3
    return;
end
splitPairs = [0.2 0.55; 0.25 0.6; 0.3 0.65; 0.35 0.7];
firstPositionFractions = [0 0.05 0.1];
secondPositionFractions = [0.25 0.35 0.45];
firstVelocityFractions = [0.1 0.3 0.5];
secondVelocityFractions = [0.5 0.75 0.95];
for splitIndex = 1:size(splitPairs, 1)
    firstViaTime_s = startTime_s + splitPairs(splitIndex, 1) * duration_s;
    secondViaTime_s = startTime_s + splitPairs(splitIndex, 2) * duration_s;
    firstDuration_s = firstViaTime_s - startTime_s;
    middleDuration_s = secondViaTime_s - firstViaTime_s;
    finalDuration_s = arrivalTime_s - secondViaTime_s;
    for firstPositionFraction = firstPositionFractions
        firstViaPosition_deg = startPosition_deg + ...
            firstPositionFraction * displacement_deg;
        for secondPositionFraction = secondPositionFractions
            secondViaPosition_deg = startPosition_deg + ...
                secondPositionFraction * displacement_deg;
            for firstVelocityFraction = firstVelocityFractions
                firstViaVelocity_deg_s = direction * ...
                    firstVelocityFraction * maximumAlongPathVelocity_deg_s;
                for secondVelocityFraction = secondVelocityFractions
                    secondViaVelocity_deg_s = direction * ...
                        secondVelocityFraction * ...
                        maximumAlongPathVelocity_deg_s;
                    firstTrial = quinticCoefficients( ...
                        startPosition_deg, startVelocity_deg_s, ...
                        startAcceleration_deg_s2, firstViaPosition_deg, ...
                        firstViaVelocity_deg_s, [0 0], firstDuration_s);
                    middleTrial = quinticCoefficients( ...
                        firstViaPosition_deg, firstViaVelocity_deg_s, ...
                        [0 0], secondViaPosition_deg, ...
                        secondViaVelocity_deg_s, [0 0], middleDuration_s);
                    finalTrial = quinticCoefficients( ...
                        secondViaPosition_deg, secondViaVelocity_deg_s, ...
                        [0 0], goalPosition_deg, [0 0], [0 0], ...
                        finalDuration_s);
                    firstPass = segmentKinematicsPass( ...
                        firstTrial, firstDuration_s, maximumVelocity_deg_s, ...
                        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                        options.KinematicTolerance);
                    middlePass = segmentKinematicsPass( ...
                        middleTrial, middleDuration_s, maximumVelocity_deg_s, ...
                        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                        options.KinematicTolerance);
                    finalPass = segmentKinematicsPass( ...
                        finalTrial, finalDuration_s, maximumVelocity_deg_s, ...
                        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
                        options.KinematicTolerance);
                    if ~firstPass || ~middlePass || ~finalPass
                        continue;
                    end
                    [firstFree, firstQueries] = segmentCollisionFree( ...
                        obstacleModel, firstTrial, startTime_s, ...
                        firstViaTime_s, options.CollisionCheckStep_s, ...
                        safetyMargin_deg, allowWrap);
                    queryCount = queryCount + firstQueries;
                    if ~firstFree
                        continue;
                    end
                    [middleFree, middleQueries] = segmentCollisionFree( ...
                        obstacleModel, middleTrial, firstViaTime_s, ...
                        secondViaTime_s, options.CollisionCheckStep_s, ...
                        safetyMargin_deg, allowWrap);
                    queryCount = queryCount + middleQueries;
                    if ~middleFree
                        continue;
                    end
                    [finalFree, finalQueries] = segmentCollisionFree( ...
                        obstacleModel, finalTrial, secondViaTime_s, ...
                        arrivalTime_s, options.CollisionCheckStep_s, ...
                        safetyMargin_deg, allowWrap);
                    queryCount = queryCount + finalQueries;
                    if ~finalFree
                        continue;
                    end
                    middleSegment = emptySegment();
                    middleSegment.startTime_s = firstViaTime_s;
                    middleSegment.endTime_s = secondViaTime_s;
                    middleSegment.coefficients = middleTrial;
                    middleSegment.kind = "terminal-rolling";
                    finalSegment = emptySegment();
                    finalSegment.startTime_s = secondViaTime_s;
                    finalSegment.endTime_s = arrivalTime_s;
                    finalSegment.coefficients = finalTrial;
                    finalSegment.kind = "terminal-rolling";
                    passed = true;
                    firstCoefficients = firstTrial;
                    firstEndTime_s = firstViaTime_s;
                    followingSegments = [middleSegment; finalSegment];
                    if options.Verbose
                        fprintf("Three-stage rolling connector: arrival %.3f s.\n", ...
                            arrivalTime_s);
                    end
                    return;
                end
            end
        end
    end
end
end

function [segments, duration_s] = buildTrackingSegments( ...
        scenario, obstacleModel, candidate, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, options, ...
        safetyMargin_deg, allowWrap)
segments = repmat(emptySegment(), 0, 1);
duration_s = 0;
trackingEndTime_s = min( ...
    double(scenario.options.trackingEndTime_s), ...
    double(scenario.target.time_s(end)));
trackingStep_s = double(scenario.options.trackingSampleTime_s);
trackingTimes_s = (candidate.time_s:trackingStep_s:trackingEndTime_s).';
if isempty(trackingTimes_s) || trackingTimes_s(end) < trackingEndTime_s - 1e-12
    trackingTimes_s(end + 1, 1) = trackingEndTime_s;
end
for intervalIndex = 1:numel(trackingTimes_s) - 1
    firstState = interpolateTargetState( ...
        scenario.target, trackingTimes_s(intervalIndex));
    secondState = interpolateTargetState( ...
        scenario.target, trackingTimes_s(intervalIndex + 1));
    firstPosition = firstState.position_deg;
    secondPosition = secondState.position_deg;
    if allowWrap
        secondPosition(1) = firstPosition(1) + ...
            wrapDegrees(secondPosition(1) - firstPosition(1));
    end
    intervalDuration_s = trackingTimes_s(intervalIndex + 1) - ...
        trackingTimes_s(intervalIndex);
    coefficients = quinticCoefficients( ...
        firstPosition, firstState.velocity_deg_s, ...
        firstState.acceleration_deg_s2, secondPosition, ...
        secondState.velocity_deg_s, secondState.acceleration_deg_s2, ...
        intervalDuration_s);
    [kinematicsPass, ~] = segmentKinematicsPass( ...
        coefficients, intervalDuration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
        options.KinematicTolerance);
    if ~kinematicsPass
        break;
    end
    collisionFree = segmentCollisionFree( ...
        obstacleModel, coefficients, trackingTimes_s(intervalIndex), ...
        trackingTimes_s(intervalIndex + 1), ...
        options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
    if ~collisionFree
        break;
    end
    segment = emptySegment();
    segment.startTime_s = trackingTimes_s(intervalIndex);
    segment.endTime_s = trackingTimes_s(intervalIndex + 1);
    segment.coefficients = coefficients;
    segment.kind = "tracking";
    segments(end + 1, 1) = segment; %#ok<AGROW>
end
if ~isempty(segments)
    duration_s = segments(end).endTime_s - candidate.time_s;
end
end

function [time_s, position_deg, velocity_deg_s, acceleration_deg_s2, ...
        jerk_deg_s3, isWaiting] = sampleSegments(segments, sampleTime_s)
timeParts = cell(numel(segments), 1);
positionParts = cell(numel(segments), 1);
velocityParts = cell(numel(segments), 1);
accelerationParts = cell(numel(segments), 1);
jerkParts = cell(numel(segments), 1);
waitingParts = cell(numel(segments), 1);
for segmentIndex = 1:numel(segments)
    segment = segments(segmentIndex);
    duration_s = segment.endTime_s - segment.startTime_s;
    localTime_s = (0:sampleTime_s:duration_s).';
    if isempty(localTime_s) || localTime_s(end) < duration_s - 1e-12
        localTime_s(end + 1, 1) = duration_s; %#ok<AGROW>
    end
    if segmentIndex > 1
        localTime_s(1) = [];
    end
    [position, velocity, acceleration, jerk] = ...
        evaluateQuintic(segment.coefficients, localTime_s);
    timeParts{segmentIndex} = segment.startTime_s + localTime_s;
    positionParts{segmentIndex} = position;
    velocityParts{segmentIndex} = velocity;
    accelerationParts{segmentIndex} = acceleration;
    jerkParts{segmentIndex} = jerk;
    waitingParts{segmentIndex} = repmat( ...
        segment.isHold, numel(localTime_s), 1);
end
time_s = vertcat(timeParts{:});
position_deg = vertcat(positionParts{:});
velocity_deg_s = vertcat(velocityParts{:});
acceleration_deg_s2 = vertcat(accelerationParts{:});
jerk_deg_s3 = vertcat(jerkParts{:});
isWaiting = vertcat(waitingParts{:});
end

function [passed, validation, queryCount] = validateSegmentSequence( ...
        segments, obstacleModel, initialState, terminalCandidate, limits, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg, allowWrap)
passed = false;
queryCount = 0;
validation = baseValidation(false, "No segments were reconstructed.", ...
    options.CollisionCheckStep_s);
if isempty(segments)
    return;
end
maximumVelocity = zeros(1, 2);
maximumAcceleration = zeros(1, 2);
maximumJerk = zeros(1, 2);
for segmentIndex = 1:numel(segments)
    segment = segments(segmentIndex);
    duration_s = segment.endTime_s - segment.startTime_s;
    [kinematicsPass, extrema] = segmentKinematicsPass( ...
        segment.coefficients, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
        options.KinematicTolerance);
    if ~kinematicsPass
        validation.message = "A segment violates an analytic kinematic extremum.";
        return;
    end
    maximumVelocity = max(maximumVelocity, extrema.maximumVelocity_deg_s);
    maximumAcceleration = max( ...
        maximumAcceleration, extrema.maximumAcceleration_deg_s2);
    maximumJerk = max(maximumJerk, extrema.maximumJerk_deg_s3);
    [collisionFree, segmentQueries] = segmentCollisionFree( ...
        obstacleModel, segment.coefficients, segment.startTime_s, ...
        segment.endTime_s, options.CollisionCheckStep_s, ...
        safetyMargin_deg, allowWrap);
    queryCount = queryCount + segmentQueries;
    if ~collisionFree
        validation.message = "A reconstructed segment intersects an obstacle check.";
        return;
    end
    if segmentIndex < numel(segments)
        [firstPosition, firstVelocity, firstAcceleration] = ...
            evaluateQuintic(segment.coefficients, duration_s);
        [secondPosition, secondVelocity, secondAcceleration] = ...
            evaluateQuintic(segments(segmentIndex + 1).coefficients, 0);
        joinError = max(abs([firstPosition - secondPosition ...
            firstVelocity - secondVelocity ...
            firstAcceleration - secondAcceleration]), [], "all");
        if joinError > 1e-7
            validation.message = "A segment join is not continuous through acceleration.";
            return;
        end
    end
end
[firstPosition, firstVelocity, firstAcceleration] = ...
    evaluateQuintic(segments(1).coefficients, 0);
lastSegment = segments(end);
[lastPosition, lastVelocity, lastAcceleration] = evaluateQuintic( ...
    lastSegment.coefficients, lastSegment.endTime_s - lastSegment.startTime_s);
initialError = max(abs([firstPosition - initialState.position_deg ...
    firstVelocity - initialState.velocity_deg_s ...
    firstAcceleration - initialState.acceleration_deg_s2]), [], "all");
if initialError > options.PositionTolerance_deg
    validation.message = "The reconstructed initial boundary state is incorrect.";
    return;
end
if lastSegment.kind ~= "tracking"
    terminalError = max(abs([ ...
        lastPosition - terminalCandidate.positionUnwrapped_deg ...
        lastVelocity - terminalCandidate.velocity_deg_s ...
        lastAcceleration - terminalCandidate.acceleration_deg_s2]), [], "all");
    if terminalError > max(options.PositionTolerance_deg, 1e-7)
        validation.message = "The reconstructed terminal boundary state is incorrect.";
        return;
    end
end
[sampleTime, samplePosition, ~, ~, ~, ~] = ...
    sampleSegments(segments, options.CollisionCheckStep_s);
if allowWrap
    wrappedAzimuth = wrapDegrees(samplePosition(:, 1));
else
    wrappedAzimuth = samplePosition(:, 1);
end
azimuthLimits = reshape(double(limits.azimuth_deg), 1, 2);
elevationLimits = reshape(double(limits.elevation_deg), 1, 2);
if any(wrappedAzimuth < azimuthLimits(1) - 1e-8) || ...
        any(wrappedAzimuth > azimuthLimits(2) + 1e-8) || ...
        any(samplePosition(:, 2) < elevationLimits(1) - 1e-8) || ...
        any(samplePosition(:, 2) > elevationLimits(2) + 1e-8) || ...
        any(diff(sampleTime) <= 0)
    validation.message = "The sampled trajectory violates bounds or forward time.";
    return;
end
passed = true;
validation.passed = true;
validation.message = "Analytic kinematics and subdivided collision checks passed.";
validation.collisionFree = true;
validation.maximumVelocity_deg_s = maximumVelocity;
validation.maximumAcceleration_deg_s2 = maximumAcceleration;
validation.maximumJerk_deg_s3 = maximumJerk;
validation.maximumUncheckedInterval_s = options.CollisionCheckStep_s;
validation.boundaryStateError = max(initialError, 0);
end

function validation = baseValidation(passed, message, maximumStep_s)
validation = struct( ...
    "passed", logical(passed), ...
    "message", string(message), ...
    "collisionFree", false, ...
    "maximumVelocity_deg_s", [NaN NaN], ...
    "maximumAcceleration_deg_s2", [NaN NaN], ...
    "maximumJerk_deg_s3", [NaN NaN], ...
    "maximumUncheckedInterval_s", maximumStep_s, ...
    "boundaryStateError", NaN, ...
    "obstacleTimePolicy", ...
        "nearest-source-slice-with-one-neighbor-padding-and-no-extrapolation");
end

function assessment = failureAssessment(classification, proven, reason)
assessment = struct( ...
    "classification", string(classification), ...
    "provenInfeasible", logical(proven), ...
    "inconclusive", string(classification) == "inconclusive", ...
    "reason", string(reason));
end

function diagnostics = finishDiagnostics( ...
        counters, representationElapsed_s, searchElapsed_s, ...
        reconstructionElapsed_s, validationElapsed_s, ...
        storedStateCount, allocatedStateCount)
diagnostics = counters;
diagnostics.representationElapsed_s = representationElapsed_s;
diagnostics.searchElapsed_s = searchElapsed_s;
diagnostics.reconstructionElapsed_s = reconstructionElapsed_s;
diagnostics.validationElapsed_s = validationElapsed_s;
diagnostics.storedStateCount = storedStateCount;
diagnostics.allocatedStateCount = allocatedStateCount;
diagnostics.firstFeasibleTime_s = NaN;
diagnostics.totalElapsed_s = NaN;
diagnostics.estimatedStateStorageBytes = NaN;
end

function angle_deg = wrapDegrees(angle_deg)
angle_deg = mod(angle_deg + 180, 360) - 180;
end
