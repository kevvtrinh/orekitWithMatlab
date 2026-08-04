function plan = planAzElTrajectory(scenario, optionOverrides)
%PLANAZELTRAJECTORY Plan one bounded azimuth/elevation trajectory.
%
% plan = planAzElTrajectory(scenario)
% plan = planAzElTrajectory(scenario, optionOverrides)
% options = planAzElTrajectory()
%
% The core method is a deterministic space-time lattice. Every edge is one
% constant-jerk trajectory with continuous position, velocity, and acceleration.

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
objective = normalizePlannerObjective(scenario.options);

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
plan.method = "reverseDijkstraForwardKinodynamicAStar";

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
    duration_s = minimumConstantJerkDuration( ...
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
if ~isfinite(options.GoalConnectionRadius_deg)
    options.GoalConnectionRadius_deg = ...
        options.MaximumPrimitiveDistance_deg;
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
staticObstacleModel = obstacleModel([obstacleModel.isStatic]);
maximumPrimitiveCells = max(1, floor( ...
    options.MaximumPrimitiveDistance_deg / gridStep_deg));
candidateRadiusCells = unique(min( ...
    maximumPrimitiveCells, [1 2 4 8 16 32 64]));
effectiveDirectionCount = options.DirectionCount;
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

%% Section 3: Compute The Reverse-Dijkstra Cost Field
[reverseCostToGo, reverseDiagnostics] = buildReverseDijkstraField( ...
    staticObstacleModel, azimuthGrid_deg, elevationGrid_deg, ...
    terminalCandidates, primitiveOffsets, primitiveDistance_deg, ...
    objective, maximumVelocity_deg_s, initialState.time_s, ...
    safetyMargin_deg, allowAzimuthWrap, ...
    options.GoalConnectionRadius_deg);
representationElapsed_s = toc(representationTimer);

counters = struct( ...
    "geometryIsStatic", geometryIsStatic, ...
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
    "costBoundRejections", 0, ...
    "propagationAttempts", 0, ...
    "kinematicRejections", 0, ...
    "collisionRejections", 0, ...
    "deadlineRejections", 0, ...
    "boundsRejections", 0, ...
    "terminalConnectorAttempts", 0, ...
    "terminalConnectorRejections", 0, ...
    "heapPushes", 1, ...
    "heapPops", 0, ...
    "stalePops", 0, ...
    "collisionPointQueries", 0, ...
    "cacheHits", 0, ...
    "cacheMisses", 0, ...
    "peakLiveStates", 1);

%% Section 4: Run Forward Kinodynamic A-Star
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
initialHeuristic = stateHeuristic( ...
    initialPositionUnwrapped_deg, startCellId, reverseCostToGo, ...
    terminalCandidates, objective, maximumVelocity_deg_s, ...
    options.HeuristicMode);
heapCount = 0;
[heapState, heapPriority, heapCount] = heapPush( ...
    heapState, heapPriority, heapCount, uint32(1), ...
    initialHeuristic);

solutionStateIndex = uint32(0);
solutionTerminalCandidateIndex = 0;
solutionTerminalCoefficients = zeros(18, 2);
solutionConnectorEndTime_s = NaN;
solutionFollowingSegments = repmat(emptySegment(), 0, 1);
incumbentCost = Inf;
optimalityProven = false;
resourceLimitReached = false;
failureReason = "The finite lattice was exhausted without a feasible terminal connector.";
firstFeasibleTime_s = NaN;

while heapCount > 0
    if isfinite(incumbentCost) && ...
            heapPriority(1) >= incumbentCost - options.CostTolerance
        optimalityProven = true;
        break;
    end
    if toc(plannerTimer) >= options.MaxWallTime_s
        failureReason = "The wall-time budget was exhausted.";
        resourceLimitReached = true;
        break;
    end
    if counters.expandedStates >= options.MaxExpandedStates
        failureReason = "The expanded-state budget was exhausted.";
        resourceLimitReached = true;
        break;
    end
    [heapState, heapPriority, heapCount, currentStateIndex] = ...
        heapPop(heapState, heapPriority, heapCount);
    counters.heapPops = counters.heapPops + 1;
    if currentStateIndex == 0 || stateClosed(currentStateIndex)
        counters.stalePops = counters.stalePops + 1;
        continue;
    end
    currentCellId = double(stateCellId(currentStateIndex));
    currentTimeIndex = double(stateTimeIndex(currentStateIndex));
    currentKey = uint64(currentTimeIndex) * uint64(gridCellCount) + ...
        uint64(currentCellId);
    if ~isKey(stateLookup, currentKey) || ...
            stateLookup(currentKey) ~= currentStateIndex
        counters.stalePops = counters.stalePops + 1;
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

    % The start is an ordinary A* state, so a direct edge remains inside the
    % authoritative pipeline after the reverse field has been computed.
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
        connectorCost = terminalConnectionObjectiveCost( ...
            coefficients, currentTime_s, connectorEndTime_s, ...
            followingSegments, objective);
        candidateCost = stateCost(currentStateIndex) + connectorCost;
        if candidateCost < incumbentCost - options.CostTolerance
            incumbentCost = candidateCost;
            solutionStateIndex = currentStateIndex;
            solutionTerminalCandidateIndex = candidateIndex;
            solutionTerminalCoefficients = coefficients;
            solutionConnectorEndTime_s = connectorEndTime_s;
            solutionFollowingSegments = followingSegments;
            if ~isfinite(firstFeasibleTime_s)
                firstFeasibleTime_s = toc(searchTimer);
            end
        end
    end

    % Stationary hold is a legal edge only after the initial nonzero
    % derivatives have been brought to rest by a motion primitive.
    waitCanChangeFeasibility = ~geometryIsStatic || ...
        scenario.requestKind ~= "fixed-goal";
    waitAllowed = waitCanChangeFeasibility && ...
        (currentStateIndex ~= 1 || ( ...
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
                minimumDuration_s = minimumConstantJerkDuration( ...
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
        if objective == "minimumTime"
            transitionCost = duration_s;
        else
            transitionCost = transitionDistance_deg;
        end
        coefficients = constantJerkLaw( ...
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
        nextKey = uint64(nextTimeIndex) * uint64(gridCellCount) + ...
            uint64(nextCellId);
        nextCost = stateCost(currentStateIndex) + transitionCost;
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
            resourceLimitReached = true;
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
        heuristic = stateHeuristic( ...
            nextPosition_deg, nextCellId, reverseCostToGo, ...
            terminalCandidates, objective, maximumVelocity_deg_s, ...
            options.HeuristicMode);
        priority = nextCost + heuristic;
        if priority >= incumbentCost - options.CostTolerance
            counters.costBoundRejections = ...
                counters.costBoundRejections + 1;
            continue;
        end
        [heapState, heapPriority, heapCount] = heapPush( ...
            heapState, heapPriority, heapCount, uint32(stateCount), priority);
        counters.heapPushes = counters.heapPushes + 1;
    end
    counters.peakLiveStates = max(counters.peakLiveStates, heapCount);
end
searchElapsed_s = toc(searchTimer);
if solutionTerminalCandidateIndex > 0 && ~resourceLimitReached && ...
        heapCount == 0
    optimalityProven = true;
end

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
    plan.diagnostics = struct( ...
        "reverseDijkstra", reverseDiagnostics, ...
        "forwardAStar", forwardDiagnostics( ...
            plan.searchDiagnostics, false, Inf, failureReason));
    return;
end

%% Section 5: Reconstruct And Sample The Trajectory
reconstructionTimer = tic;
terminalCandidate = terminalCandidates(solutionTerminalCandidateIndex);
parentChain = double(solutionStateIndex);
while stateParent(parentChain(1)) ~= 0
    parentChain = [double(stateParent(parentChain(1))); parentChain]; %#ok<AGROW>
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
    segment.coefficients = constantJerkLaw( ...
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
terminalEvaluation = evaluateAzElConstantJerkSegment( ...
    solutionTerminalCoefficients, ...
    [0; solutionConnectorEndTime_s - connectorStartTime_s]);
terminalSegment.isHold = terminalEvaluation.isWaiting;
terminalSegment.kind = "terminal";
segments(end + 1, 1) = terminalSegment;
if ~isempty(solutionFollowingSegments)
    segments = [segments; solutionFollowingSegments];
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
                boundaryAcceleration_deg_s2, ~] = evaluateConstantJerkLaw( ...
                segments(1).coefficients, 0);
        else
            boundarySegment = segments(boundaryIndex);
            boundaryTime_s = boundarySegment.endTime_s;
            boundaryDuration_s = boundarySegment.endTime_s - ...
                boundarySegment.startTime_s;
            [boundaryPosition_deg, boundaryVelocity_deg_s, ...
                boundaryAcceleration_deg_s2, ~] = evaluateConstantJerkLaw( ...
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
        relocatedHold.coefficients = constantJerkLaw( ...
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
        shiftedSegments(end).coefficients = constantJerkLaw( ...
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
angularPathLength_deg = trajectoryAngularTravel(segments);
reconstructionElapsed_s = toc(reconstructionTimer);

%% Section 6: Independently Validate The Result
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
    plan.diagnostics = struct( ...
        "reverseDijkstra", reverseDiagnostics, ...
        "forwardAStar", forwardDiagnostics( ...
            plan.searchDiagnostics, false, incumbentCost, plan.message));
    return;
end

%% Section 7: Assemble Diagnostics
plan.success = true;
if optimalityProven
    plan.message = "Optimal finite-lattice trajectory found and independently validated.";
else
    plan.message = "Feasible trajectory found and independently validated before the resource limit.";
end
plan.time_s = time_s;
plan.position_deg = position_deg;
plan.positionUnwrapped_deg = positionUnwrapped_deg;
plan.velocity_deg_s = velocity_deg_s;
plan.acceleration_deg_s2 = acceleration_deg_s2;
plan.jerk_deg_s3 = jerk_deg_s3;
plan.isWaiting = isWaiting;
plan.angularPathLength_deg = angularPathLength_deg;
plan.objective = objective;
plan.objectiveCost = trajectoryObjectiveCost(segments, objective);
plan.stopState = struct( ...
    "time_s", terminalCandidate.time_s, ...
    "position_deg", terminalCandidate.position_deg, ...
    "velocity_deg_s", terminalCandidate.velocity_deg_s, ...
    "acceleration_deg_s2", terminalCandidate.acceleration_deg_s2);
if scenario.requestKind == "tracking" && ...
        segments(end).kind == "tracking"
    plan.coreTrackingTerminationReason = ...
        segments(end).terminationReason;
end
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
plan.diagnostics = struct( ...
    "reverseDijkstra", reverseDiagnostics, ...
    "forwardAStar", forwardDiagnostics( ...
        plan.searchDiagnostics, optimalityProven, ...
        plan.objectiveCost, ""));
plan.options = options;

%% Section 8: Local Functions
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
    "HeuristicMode", "reverseDijkstra", ...
    "CostTolerance", 1e-10, ...
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
    "method", "reverseDijkstraForwardKinodynamicAStar", ...
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
    "coreTrackingTerminationReason", "", ...
    "failureAssessment", failureAssessment( ...
        "not-run", false, "Planner did not run."), ...
    "searchDiagnostics", struct(), ...
    "diagnostics", struct( ...
        "reverseDijkstra", emptyReverseDiagnostics(), ...
        "forwardAStar", emptyForwardDiagnostics()));
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
    "CostTolerance" "KinematicTolerance" ...
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
options.HeuristicMode = lower(strtrim(string(options.HeuristicMode)));
if ~isscalar(options.HeuristicMode) || ...
        ~any(options.HeuristicMode == ["reversedijkstra" "zero"])
    message = "HeuristicMode must be reverseDijkstra or zero.";
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
if isempty(candidateTimes_s) || candidateTimes_s(end) < ...
        scenario.options.latestInterceptTime_s - 1e-9
    candidateTimes_s(end + 1, 1) = ...
        scenario.options.latestInterceptTime_s;
end
if isfield(scenario.options, "maximumInterceptCandidates") && ...
        numel(candidateTimes_s) > ...
        scenario.options.maximumInterceptCandidates
    selectedRows = unique(round(linspace(1, numel(candidateTimes_s), ...
        scenario.options.maximumInterceptCandidates)));
    candidateTimes_s = candidateTimes_s(selectedRows);
end
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
isPackedField = isstruct(azElData) && isscalar(azElData) && ...
    isfield(azElData, "Format") && any(string(azElData.Format) == ...
    ["AzElTimeObstacleField" "AzElTimeObstacleWorkspace"]);
if isPackedField
    model = preparePackedObstacleModel(azElData);
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

function model = preparePackedObstacleModel(obstacleField)
packedObstacles = obstacleField.Obstacles;
model = repmat(struct( ...
    "time_s", [], "slices", {{}}, "isStatic", false, ...
    "isUniformTime", false, "timeStep_s", NaN), ...
    numel(packedObstacles), 1);
for obstacleIndex = 1:numel(packedObstacles)
    packed = packedObstacles(obstacleIndex);
    model(obstacleIndex).time_s = double(packed.TimeSeconds(:));
    sliceCount = numel(model(obstacleIndex).time_s);
    slices = cell(sliceCount, 1);
    for sliceIndex = 1:sliceCount
        firstEdge = double(packed.EdgeOffsets(sliceIndex));
        lastEdge = double(packed.EdgeOffsets(sliceIndex + 1)) - 1;
        if lastEdge < firstEdge
            slices{sliceIndex} = prepareBoundarySlice([], []);
            continue;
        end
        edgeRows = firstEdge:lastEdge;
        startAzimuth_deg = double( ...
            packed.EdgeStartAzimuthDeg(edgeRows));
        startElevation_deg = double( ...
            packed.EdgeStartElevationDeg(edgeRows));
        endAzimuth_deg = double(packed.EdgeEndAzimuthDeg(edgeRows));
        endElevation_deg = double(packed.EdgeEndElevationDeg(edgeRows));
        regionEnds = false(numel(edgeRows), 1);
        regionFirstIndex = 1;
        for edgeIndex = 1:numel(edgeRows)
            closesRegion = abs(endAzimuth_deg(edgeIndex) - ...
                startAzimuth_deg(regionFirstIndex)) <= 1e-6 && ...
                abs(endElevation_deg(edgeIndex) - ...
                startElevation_deg(regionFirstIndex)) <= 1e-6;
            if closesRegion
                regionEnds(edgeIndex) = true;
                regionFirstIndex = edgeIndex + 1;
            end
        end
        separatorCount = max(0, nnz(regionEnds) - 1);
        vertexCount = numel(edgeRows) + separatorCount;
        azimuth_deg = nan(vertexCount, 1);
        elevation_deg = nan(vertexCount, 1);
        writeIndex = 0;
        for edgeIndex = 1:numel(edgeRows)
            writeIndex = writeIndex + 1;
            azimuth_deg(writeIndex) = startAzimuth_deg(edgeIndex);
            elevation_deg(writeIndex) = startElevation_deg(edgeIndex);
            if regionEnds(edgeIndex) && edgeIndex < numel(edgeRows)
                writeIndex = writeIndex + 1;
            end
        end
        slices{sliceIndex} = prepareBoundarySlice( ...
            azimuth_deg, elevation_deg);
    end
    isStatic = true;
    for sliceIndex = 2:sliceCount
        if ~isequaln(slices{1}, slices{sliceIndex})
            isStatic = false;
            break;
        end
    end
    model(obstacleIndex).isStatic = isStatic;
    if isStatic && ~isempty(slices)
        model(obstacleIndex).slices = slices(1);
    else
        model(obstacleIndex).slices = slices;
    end
    model(obstacleIndex).isUniformTime = logical(packed.IsUniformTime);
    model(obstacleIndex).timeStep_s = double(packed.TimeStepSeconds);
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
velocityDuration_s = 9 * absoluteDisplacement_deg ./ ...
    (4 * maximumVelocity_deg_s);
accelerationDuration_s = 3 * sqrt( ...
    absoluteDisplacement_deg ./ maximumAcceleration_deg_s2);
jerkDuration_s = nthroot(54 * absoluteDisplacement_deg ./ ...
    maximumJerk_deg_s3, 3);
duration_s = max([velocityDuration_s accelerationDuration_s ...
    jerkDuration_s], [], "all");
end

function duration_s = minimumConstantJerkDuration( ...
        firstPosition_deg, firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, secondPosition_deg, ...
        secondVelocity_deg_s, secondAcceleration_deg_s2, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, timeStep_s)
boundaryIsRestToRest = all(abs([firstVelocity_deg_s, ...
    firstAcceleration_deg_s2, secondVelocity_deg_s, ...
    secondAcceleration_deg_s2]) <= 1e-12);
if boundaryIsRestToRest
    displacement_deg = secondPosition_deg - firstPosition_deg;
    firstDuration_s = restToRestMinimumDuration( ...
        displacement_deg, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3);
else
    % Feasibility is not monotone in duration for arbitrary endpoint
    % derivatives. Enumerate the finite duration lattice in ascending order.
    firstDuration_s = timeStep_s;
end
firstDurationStep = max(1, ceil( ...
    firstDuration_s / timeStep_s - 1e-12));
for trialIndex = 0:199
    duration_s = (firstDurationStep + trialIndex) * timeStep_s;
    law = constantJerkLaw( ...
        firstPosition_deg, firstVelocity_deg_s, ...
        firstAcceleration_deg_s2, secondPosition_deg, ...
        secondVelocity_deg_s, secondAcceleration_deg_s2, duration_s);
    [passes, ~] = segmentKinematicsPass( ...
        law, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, 1e-10);
    if passes
        return;
    end
end
duration_s = Inf;
end

function law = constantJerkLaw( ...
        firstPosition, firstVelocity, firstAcceleration, ...
        secondPosition, secondVelocity, secondAcceleration, duration_s)
firstState = struct( ...
    "position_deg", firstPosition, ...
    "velocity_deg_s", firstVelocity, ...
    "acceleration_deg_s2", firstAcceleration);
secondState = struct( ...
    "position_deg", secondPosition, ...
    "velocity_deg_s", secondVelocity, ...
    "acceleration_deg_s2", secondAcceleration);
evaluation = evaluateAzElConstantJerkSegment( ...
    firstState, secondState, duration_s, [0; duration_s]);
law = evaluation.law;
end

function [position, velocity, acceleration, jerk] = ...
        evaluateConstantJerkLaw(law, localTime_s)
evaluation = evaluateAzElConstantJerkSegment(law, localTime_s);
position = evaluation.position_deg;
velocity = evaluation.velocity_deg_s;
acceleration = evaluation.acceleration_deg_s2;
jerk = evaluation.jerk_deg_s3;
end

function [passes, extrema] = segmentKinematicsPass( ...
        law, duration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, tolerance)
evaluation = evaluateAzElConstantJerkSegment( ...
    law, [0; duration_s]);
extrema = evaluation.extrema;
passes = all(extrema.maximumVelocity_deg_s <= ...
    maximumVelocity_deg_s + tolerance) && ...
    all(extrema.maximumAcceleration_deg_s2 <= ...
    maximumAcceleration_deg_s2 + tolerance) && ...
    all(extrema.maximumJerk_deg_s3 <= maximumJerk_deg_s3 + tolerance);
end

function [collisionFree, queryCount] = segmentCollisionFree( ...
        obstacleModel, coefficients, firstTime_s, secondTime_s, ...
        maximumStep_s, safetyMargin_deg, allowWrap)
duration_s = secondTime_s - firstTime_s;
allStatic = isempty(obstacleModel) || all([obstacleModel.isStatic]);
straightProbeTime_s = linspace(0, duration_s, 5).';
[straightProbePosition_deg, ~, ~, ~] = ...
    evaluateConstantJerkLaw(coefficients, straightProbeTime_s);
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
            evaluateConstantJerkLaw(coefficients, localOverlapTime_s);
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
        evaluateConstantJerkLaw(coefficients, coarseLocalTime_s);
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
uniformLocalTime_s = linspace(0, duration_s, intervalCount + 1).';
phaseBoundaryTime_s = duration_s * [1; 2] / 3;
eventTimeParts = cell(numel(obstacleModel), 1);
for obstacleIndex = 1:numel(obstacleModel)
    obstacleEventTimes_s = obstacleModel(obstacleIndex).time_s;
    eventIsInside = obstacleEventTimes_s > firstTime_s & ...
        obstacleEventTimes_s < secondTime_s;
    eventTimeParts{obstacleIndex} = ...
        obstacleEventTimes_s(eventIsInside) - firstTime_s;
end
if isempty(eventTimeParts)
    eventLocalTime_s = zeros(0, 1);
else
    eventLocalTime_s = vertcat(eventTimeParts{:});
end
localTime_s = unique([uniformLocalTime_s; phaseBoundaryTime_s; ...
    eventLocalTime_s]);
[position_deg, ~, ~, ~] = evaluateConstantJerkLaw(coefficients, localTime_s);
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

function objective = normalizePlannerObjective(scenarioOptions)
objective = "minimumAngularDistance";
if isfield(scenarioOptions, "objective")
    requested = lower(strtrim(string(scenarioOptions.objective)));
    if any(requested == ["minimumtime" "time"])
        objective = "minimumTime";
    elseif ~any(requested == ["minimumangulardistance" ...
            "angulardistance" "distance"])
        error("planAzElTrajectory:InvalidObjective", ...
            "The objective must be minimumAngularDistance or minimumTime.");
    end
end
end

function heuristic = stateHeuristic( ...
        position_deg, cellId, reverseCostToGo, candidates, objective, ...
        maximumVelocity_deg_s, heuristicMode)
if heuristicMode == "zero"
    heuristic = 0;
    return;
end
straightLineDistance_deg = terminalDistanceHeuristic( ...
    position_deg, candidates);
if objective == "minimumTime"
    straightLineBound = straightLineDistance_deg / ...
        hypot(maximumVelocity_deg_s(1), maximumVelocity_deg_s(2));
else
    straightLineBound = straightLineDistance_deg;
end
relaxedGraphBound = reverseCostToGo(cellId);
heuristic = min(straightLineBound, relaxedGraphBound);
if ~isfinite(heuristic)
    heuristic = straightLineBound;
end
end

function distance_deg = terminalDistanceHeuristic(position_deg, candidates)
distance_deg = Inf;
for candidateIndex = 1:numel(candidates)
    delta = candidates(candidateIndex).positionUnwrapped_deg - position_deg;
    distance_deg = min(distance_deg, hypot(delta(1), delta(2)));
end
end

function [costToGo, diagnostics] = buildReverseDijkstraField( ...
        staticObstacleModel, azimuthGrid_deg, elevationGrid_deg, ...
        candidates, primitiveOffsets, primitiveDistance_deg, objective, ...
        maximumVelocity_deg_s, queryTime_s, safetyMargin_deg, allowWrap, ...
        goalConnectionRadius_deg)
reverseTimer = tic;
azimuthCount = numel(azimuthGrid_deg);
elevationCount = numel(elevationGrid_deg);
cellCount = azimuthCount * elevationCount;
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
gridPoints_deg = [azimuthMesh_deg(:) elevationMesh_deg(:)];
if isempty(staticObstacleModel)
    blocked = false(cellCount, 1);
else
    blocked = pointsCollide( ...
        staticObstacleModel, gridPoints_deg, repmat(queryTime_s, ...
        cellCount, 1), safetyMargin_deg, allowWrap);
end

goalSeed = false(cellCount, 1);
for candidateIndex = 1:numel(candidates)
    deltaAzimuth_deg = gridPoints_deg(:, 1) - ...
        candidates(candidateIndex).positionUnwrapped_deg(1);
    if allowWrap
        deltaAzimuth_deg = wrapDegrees(deltaAzimuth_deg);
    end
    deltaElevation_deg = gridPoints_deg(:, 2) - ...
        candidates(candidateIndex).positionUnwrapped_deg(2);
    connectorDistance_deg = hypot(deltaAzimuth_deg, deltaElevation_deg);
    goalSeed = goalSeed | ...
        connectorDistance_deg <= goalConnectionRadius_deg + 1e-12;
end
goalSeed = goalSeed & ~blocked;
goalCellIds = find(goalSeed);

if objective == "minimumTime"
    relaxedEdgeCost = primitiveDistance_deg / ...
        hypot(maximumVelocity_deg_s(1), maximumVelocity_deg_s(2));
else
    relaxedEdgeCost = primitiveDistance_deg;
end
costToGo = inf(cellCount, 1);
settled = false(cellCount, 1);
heapCapacity = max(1024, min(cellCount, 65536));
heapCell = zeros(heapCapacity, 1, "uint32");
heapPriority = inf(heapCapacity, 1);
heapCount = 0;
heapPushes = 0;
for seedIndex = 1:numel(goalCellIds)
    seedCellId = goalCellIds(seedIndex);
    costToGo(seedCellId) = 0;
    [heapCell, heapPriority, heapCount] = heapPush( ...
        heapCell, heapPriority, heapCount, uint32(seedCellId), 0);
    heapPushes = heapPushes + 1;
end

heapPops = 0;
stalePops = 0;
settledCount = 0;
relaxationAttempts = 0;
successfulRelaxations = 0;
while heapCount > 0
    poppedPriority = heapPriority(1);
    [heapCell, heapPriority, heapCount, poppedCell] = ...
        heapPop(heapCell, heapPriority, heapCount);
    heapPops = heapPops + 1;
    cellId = double(poppedCell);
    if settled(cellId) || ...
            poppedPriority > costToGo(cellId) + 1e-12
        stalePops = stalePops + 1;
        continue;
    end
    settled(cellId) = true;
    settledCount = settledCount + 1;
    [elevationIndex, azimuthIndex] = ind2sub( ...
        [elevationCount azimuthCount], cellId);
    for primitiveIndex = 1:size(primitiveOffsets, 1)
        relaxationAttempts = relaxationAttempts + 1;
        predecessorAzimuthIndex = ...
            azimuthIndex - primitiveOffsets(primitiveIndex, 1);
        predecessorElevationIndex = ...
            elevationIndex - primitiveOffsets(primitiveIndex, 2);
        if allowWrap
            predecessorAzimuthIndex = mod( ...
                predecessorAzimuthIndex - 1, azimuthCount) + 1;
        elseif predecessorAzimuthIndex < 1 || ...
                predecessorAzimuthIndex > azimuthCount
            continue;
        end
        if predecessorElevationIndex < 1 || ...
                predecessorElevationIndex > elevationCount
            continue;
        end
        predecessorCellId = sub2ind( ...
            [elevationCount azimuthCount], predecessorElevationIndex, ...
            predecessorAzimuthIndex);
        if blocked(predecessorCellId) || settled(predecessorCellId)
            continue;
        end
        trialCost = poppedPriority + relaxedEdgeCost(primitiveIndex);
        if trialCost >= costToGo(predecessorCellId) - 1e-12
            continue;
        end
        costToGo(predecessorCellId) = trialCost;
        successfulRelaxations = successfulRelaxations + 1;
        [heapCell, heapPriority, heapCount] = heapPush( ...
            heapCell, heapPriority, heapCount, ...
            uint32(predecessorCellId), trialCost);
        heapPushes = heapPushes + 1;
    end
end
diagnostics = struct( ...
    "executed", true, ...
    "goalSeedCount", numel(goalCellIds), ...
    "blockedBinCount", nnz(blocked), ...
    "settledCount", settledCount, ...
    "heapPushes", heapPushes, ...
    "heapPops", heapPops, ...
    "stalePops", stalePops, ...
    "relaxationAttempts", relaxationAttempts, ...
    "successfulRelaxations", successfulRelaxations, ...
    "unreachableBinCount", nnz(~isfinite(costToGo)), ...
    "elapsed_s", toc(reverseTimer), ...
    "objectiveUnits", objectiveUnits(objective));
end

function [heapState, heapPriority, heapCount] = heapPush( ...
        heapState, heapPriority, heapCount, stateIndex, priority)
heapCount = heapCount + 1;
writeIndex = heapCount;
while writeIndex > 1
    parentIndex = floor(writeIndex / 2);
    parentPrecedesEntry = ~heapEntryPrecedes( ...
        priority, stateIndex, heapPriority(parentIndex), ...
        heapState(parentIndex));
    if parentPrecedesEntry
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
    if rightChild <= heapCount && heapEntryPrecedes( ...
            heapPriority(rightChild), heapState(rightChild), ...
            heapPriority(leftChild), heapState(leftChild))
        smallerChild = rightChild;
    end
    if ~heapEntryPrecedes( ...
            heapPriority(smallerChild), heapState(smallerChild), ...
            lastPriority, lastState)
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

function assertion = heapEntryPrecedes( ...
        firstPriority, firstState, secondPriority, secondState)
assertion = firstPriority < secondPriority - 1e-14 || ( ...
    abs(firstPriority - secondPriority) <= 1e-14 && ...
    firstState < secondState);
end

function segment = emptySegment()
segment = struct( ...
    "startTime_s", NaN, ...
    "endTime_s", NaN, ...
    "coefficients", zeros(18, 2), ...
    "isHold", false, ...
    "kind", "", ...
    "terminationReason", "");
end

function [passed, coefficients, connectorEndTime_s, followingSegments, ...
        queryCount] = attemptTerminalConnection( ...
        startPosition_deg, startVelocity_deg_s, startAcceleration_deg_s2, ...
        startTime_s, candidate, scenario, obstacleModel, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2, ...
        maximumJerk_deg_s3, options, safetyMargin_deg, allowWrap)
passed = false;
coefficients = zeros(18, 2);
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
minimumDuration_s = minimumConstantJerkDuration( ...
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
    trialCoefficients = constantJerkLaw( ...
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
        holdCoefficients = constantJerkLaw( ...
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
firstCoefficients = zeros(18, 2);
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
            firstTrial = constantJerkLaw( ...
                startPosition_deg, startVelocity_deg_s, ...
                startAcceleration_deg_s2, viaPosition_deg, ...
                viaVelocity_deg_s, viaAcceleration_deg_s2, ...
                firstDuration_s);
            secondTrial = constantJerkLaw( ...
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
% constant-jerk trajectory law and is useful when two separated dynamic openings
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
                    firstTrial = constantJerkLaw( ...
                        startPosition_deg, startVelocity_deg_s, ...
                        startAcceleration_deg_s2, firstViaPosition_deg, ...
                        firstViaVelocity_deg_s, [0 0], firstDuration_s);
                    middleTrial = constantJerkLaw( ...
                        firstViaPosition_deg, firstViaVelocity_deg_s, ...
                        [0 0], secondViaPosition_deg, ...
                        secondViaVelocity_deg_s, [0 0], middleDuration_s);
                    finalTrial = constantJerkLaw( ...
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
terminationReason = "trackingWindowComplete";
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
    coefficients = constantJerkLaw( ...
        firstPosition, firstState.velocity_deg_s, ...
        firstState.acceleration_deg_s2, secondPosition, ...
        secondState.velocity_deg_s, secondState.acceleration_deg_s2, ...
        intervalDuration_s);
    [kinematicsPass, ~] = segmentKinematicsPass( ...
        coefficients, intervalDuration_s, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3, ...
        options.KinematicTolerance);
    if ~kinematicsPass
        terminationReason = "kinematicLimit";
        break;
    end
    collisionFree = segmentCollisionFree( ...
        obstacleModel, coefficients, trackingTimes_s(intervalIndex), ...
        trackingTimes_s(intervalIndex + 1), ...
        options.CollisionCheckStep_s, safetyMargin_deg, allowWrap);
    if ~collisionFree
        terminationReason = "obstacle";
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
    segments(end).terminationReason = terminationReason;
    duration_s = segments(end).endTime_s - candidate.time_s;
end
end

function cost = terminalConnectionObjectiveCost( ...
        coefficients, startTime_s, connectorEndTime_s, ...
        followingSegments, objective)
if objective == "minimumTime"
    if isempty(followingSegments)
        cost = connectorEndTime_s - startTime_s;
    else
        cost = followingSegments(end).endTime_s - startTime_s;
    end
    return;
end
cost = segmentAngularTravel( ...
    coefficients, connectorEndTime_s - startTime_s);
for segmentIndex = 1:numel(followingSegments)
    segment = followingSegments(segmentIndex);
    cost = cost + segmentAngularTravel( ...
        segment.coefficients, segment.endTime_s - segment.startTime_s);
end
end

function cost = trajectoryObjectiveCost(segments, objective)
if objective == "minimumTime"
    cost = segments(end).endTime_s - segments(1).startTime_s;
else
    cost = trajectoryAngularTravel(segments);
end
end

function travel_deg = trajectoryAngularTravel(segments)
travel_deg = 0;
for segmentIndex = 1:numel(segments)
    segment = segments(segmentIndex);
    travel_deg = travel_deg + segmentAngularTravel( ...
        segment.coefficients, segment.endTime_s - segment.startTime_s);
end
end

function travel_deg = segmentAngularTravel(coefficients, duration_s)
if duration_s <= 0
    travel_deg = 0;
    return;
end
phaseDuration_s = duration_s / 3;
travel_deg = 0;
for phaseIndex = 1:3
    firstTime_s = (phaseIndex - 1) * phaseDuration_s;
    lastTime_s = phaseIndex * phaseDuration_s;
    travel_deg = travel_deg + integral( ...
        @(queryTime_s) segmentSpeed(coefficients, queryTime_s), ...
        firstTime_s, lastTime_s, "AbsTol", 1e-9, "RelTol", 1e-9);
end
end

function speed_deg_s = segmentSpeed(coefficients, queryTime_s)
evaluation = evaluateAzElConstantJerkSegment( ...
    coefficients, queryTime_s(:));
speed_deg_s = hypot( ...
    evaluation.velocity_deg_s(:, 1), ...
    evaluation.velocity_deg_s(:, 2));
speed_deg_s = reshape(speed_deg_s, size(queryTime_s));
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
        evaluateConstantJerkLaw(segment.coefficients, localTime_s);
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
    elevationLimits_deg = reshape(double(limits.elevation_deg), 1, 2);
    elevationInsideBounds = ...
        extrema.minimumPosition_deg(2) >= elevationLimits_deg(1) - 1e-8 && ...
        extrema.maximumPosition_deg(2) <= elevationLimits_deg(2) + 1e-8;
    azimuthInsideBounds = true;
    if ~allowWrap
        azimuthLimits_deg = reshape(double(limits.azimuth_deg), 1, 2);
        azimuthInsideBounds = ...
            extrema.minimumPosition_deg(1) >= ...
            azimuthLimits_deg(1) - 1e-8 && ...
            extrema.maximumPosition_deg(1) <= ...
            azimuthLimits_deg(2) + 1e-8;
    end
    if ~azimuthInsideBounds || ~elevationInsideBounds
        validation.message = ...
            "A segment violates a continuous angular position bound.";
        return;
    end
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
            evaluateConstantJerkLaw(segment.coefficients, duration_s);
        [secondPosition, secondVelocity, secondAcceleration] = ...
            evaluateConstantJerkLaw(segments(segmentIndex + 1).coefficients, 0);
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
    evaluateConstantJerkLaw(segments(1).coefficients, 0);
lastSegment = segments(end);
[lastPosition, lastVelocity, lastAcceleration] = evaluateConstantJerkLaw( ...
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

function diagnostics = forwardDiagnostics( ...
        searchDiagnostics, optimalityProven, incumbentCost, stopReason)
diagnostics = searchDiagnostics;
diagnostics.executed = true;
diagnostics.optimalityProven = logical(optimalityProven);
diagnostics.incumbentCost = incumbentCost;
diagnostics.stopReason = string(stopReason);
end

function diagnostics = emptyReverseDiagnostics()
diagnostics = struct( ...
    "executed", false, ...
    "goalSeedCount", 0, ...
    "blockedBinCount", 0, ...
    "settledCount", 0, ...
    "heapPushes", 0, ...
    "heapPops", 0, ...
    "stalePops", 0, ...
    "relaxationAttempts", 0, ...
    "successfulRelaxations", 0, ...
    "unreachableBinCount", 0, ...
    "elapsed_s", 0, ...
    "objectiveUnits", "");
end

function diagnostics = emptyForwardDiagnostics()
diagnostics = struct( ...
    "executed", false, ...
    "optimalityProven", false, ...
    "incumbentCost", Inf, ...
    "stopReason", "");
end

function units = objectiveUnits(objective)
if objective == "minimumTime"
    units = "s";
else
    units = "deg";
end
end

function angle_deg = wrapDegrees(angle_deg)
angle_deg = mod(angle_deg + 180, 360) - 180;
end
