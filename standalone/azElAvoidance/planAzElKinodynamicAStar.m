function result = planAzElKinodynamicAStar( ...
        obstacleWorkspace, startState, goalState, limits, options)
%PLANAZELKINODYNAMICASTAR Plan a rate/acceleration-limited boresight slew.
%
% result = planAzElKinodynamicAStar(workspace, start, goal, limits, options)
%
% The unweighted A* state is [azimuth, elevation, azimuth rate,
% elevation rate, time]. Edges are constant-acceleration motion
% primitives. The returned SteeringProfile contains the requested 2-D
% azimuth/elevation command as a function of time.
%
% Required start fields:
%   AzimuthDeg, ElevationDeg
% Optional start fields:
%   AzimuthRateDegPerSec, ElevationRateDegPerSec (default 0)
%   Time (datetime or seconds from workspace.ReferenceTime)
%
% Required goal fields:
%   AzimuthDeg, ElevationDeg
% Optional goal fields:
%   EarliestTime, LatestTime, PositionToleranceDeg, RateToleranceDeg
%
% Limits fields:
%   AzimuthLimitsDeg, ElevationLimitsDeg
%   AzimuthRateLimitDegPerSec, ElevationRateLimitDegPerSec
%   AzimuthAccelerationLimitDegPerSec2
%   ElevationAccelerationLimitDegPerSec2
%
% Important options:
%   TimeStepSeconds, MaxPlanningTimeSeconds, AzimuthWrap
%   CollisionCheckStepSeconds, TimePaddingSamples, MaxExpansions
%   MaxWallTimeSeconds
%   Objective: "minimumTime" or "minimumAngularDistance"
%   HeuristicWeight: 1 for exact A*, >1 for bounded weighted A*
%
% The planner is optimal on the configured finite lattice when it returns
% success. The visual swept-envelope mesh is not used for collision tests.

if nargin < 4 || isempty(limits)
    limits = struct();
end
if nargin < 5
    options = struct();
end
if ~isstruct(obstacleWorkspace) || ...
        ~isfield(obstacleWorkspace, "Format") || ...
        obstacleWorkspace.Format ~= "AzElTimeObstacleWorkspace"
    obstacleWorkspace = buildAzElTimeObstacleWorkspace(obstacleWorkspace);
end
validateWorkspace(obstacleWorkspace);
limits = normalizeLimits(limits);
options = normalizeOptions(options, limits);
validateLatticeCompatibility(options, limits);

referenceTime = obstacleWorkspace.ReferenceTime;
start = normalizeStart(startState, referenceTime, limits, options);
goal = normalizeGoal(goalState, referenceTime, start, limits, options);
controls = accelerationControls(limits, options.AccelerationLevels);

if pointCollision(obstacleWorkspace, start.State, ...
        start.TimeSeconds, options)
    error("planAzElKinodynamicAStar:StartInCollision", ...
        "The initial boresight state is inside an obstacle.");
end

nodes = initializeNodes(options.InitialNodeCapacity);
startKey = stateKey(start.State, start.Acceleration, limits, options);
startHeuristic = options.HeuristicWeight * ...
    heuristic(start.State, goal, limits, options);
startTie = motionTie(start.State, goal, limits, options);
if options.Objective == "minimumAngularDistance"
    startTie = 0;
end
[nodes, startIndex] = appendNode(nodes, start.State, 0, ...
    start.Acceleration, 0, startHeuristic, startTie);
bestNode = containers.Map('KeyType', 'char', 'ValueType', 'double');
bestNode(startKey) = startIndex;
heap = emptyHeap(options.InitialNodeCapacity);
heap = heapPush(heap, startIndex, nodes.F(startIndex), ...
    nodes.Tie(startIndex));

expanded = 0;
generated = 1;
goalIndex = 0;
reachedExpansionLimit = false;
reachedWallTimeLimit = false;
searchTimer = tic;
while heap.Count > 0
    if toc(searchTimer) >= options.MaxWallTimeSeconds
        reachedWallTimeLimit = true;
        break;
    end
    [heap, currentIndex] = heapPop(heap);
    current = nodes.State(currentIndex, :);
    key = stateKey(current, nodes.Acceleration(currentIndex, :), ...
        limits, options);
    if ~isKey(bestNode, key) || bestNode(key) ~= currentIndex
        continue;
    end
    if isGoal(current, nodes.Acceleration(currentIndex, :), goal, limits)
        goalIndex = currentIndex;
        break;
    end
    if expanded >= options.MaxExpansions
        reachedExpansionLimit = true;
        break;
    end
    expanded = expanded + 1;
    if current(5) >= goal.LatestStep
        continue;
    end
    if ~canStillReach(current, goal, limits, options)
        continue;
    end

    controlCount = size(controls, 1);
    nextStates = zeros(controlCount, 5);
    validControl = false(controlCount, 1);
    for controlIndex = 1:controlCount
        acceleration = controls(controlIndex, :);
        [next, valid] = propagatePrimitive( ...
            current, acceleration, limits, options);
        if valid && next(5) <= goal.LatestStep && ...
                canStillReach(next, goal, limits, options)
            nextStates(controlIndex, :) = next;
            validControl(controlIndex) = true;
        end
    end
    candidateControls = find(validControl);
    if isempty(candidateControls)
        continue;
    end
    collision = primitiveCollisions(obstacleWorkspace, current, ...
        controls(candidateControls, :), start.TimeSeconds, limits, options);

    for candidateIndex = 1:numel(candidateControls)
        if collision(candidateIndex)
            continue;
        end
        controlIndex = candidateControls(candidateIndex);
        acceleration = controls(controlIndex, :);
        next = nextStates(controlIndex, :);
        tentativeG = nodes.G(currentIndex) + ...
            transitionCost(current, acceleration, options);
        tie = motionTie(next, goal, limits, options);
        if options.Objective == "minimumAngularDistance"
            % Among equal-length schedules, favor earlier goal progress.
            tie = nodes.Tie(currentIndex) + ...
                options.TimeStepSeconds * tie;
        end
        nextKey = stateKey(next, acceleration, limits, options);
        if isKey(bestNode, nextKey)
            oldIndex = bestNode(nextKey);
            worseCost = tentativeG > nodes.G(oldIndex) + 1e-12;
            equalCost = abs(tentativeG - nodes.G(oldIndex)) <= 1e-12;
            if worseCost || (equalCost && ...
                    tie >= nodes.Tie(oldIndex) - 1e-12)
                continue;
            end
        end
        h = options.HeuristicWeight * ...
            heuristic(next, goal, limits, options);
        [nodes, nextIndex] = appendNode(nodes, next, currentIndex, ...
            acceleration, tentativeG, h, tie);
        bestNode(nextKey) = nextIndex;
        heap = heapPush(heap, nextIndex, nodes.F(nextIndex), ...
            nodes.Tie(nextIndex));
        generated = generated + 1;
    end
end

if goalIndex == 0
    if reachedWallTimeLimit
        message = "Search reached MaxWallTimeSeconds before finding a path.";
    elseif reachedExpansionLimit
        message = "Search reached MaxExpansions before finding a path.";
    else
        message = "No lattice path reaches the goal before LatestTime.";
    end
    result = failedResult(message, expanded, generated, limits, options);
    return;
end

nodePath = reconstructNodePath(nodes, goalIndex);
path = makePathTable(nodes, nodePath, start.TimeSeconds, ...
    referenceTime, limits, options);
result = struct();
result.Success = true;
result.OptimalOnLattice = options.HeuristicWeight == 1;
if result.OptimalOnLattice
    result.Message = "Optimal " + options.Objective + ...
        " lattice path found.";
else
    result.Message = "Bounded " + options.Objective + ...
        " weighted-A* lattice path found.";
end
result.Objective = options.Objective;
result.HeuristicWeight = options.HeuristicWeight;
result.SuboptimalityBound = options.HeuristicWeight;
result.ObjectiveCost = nodes.G(goalIndex);
result.ObjectiveCostUnits = objectiveCostUnits(options.Objective);
result.CostSeconds = path.ElapsedSeconds(end);
if options.Objective == "minimumAngularDistance"
    result.AngularPathLengthDeg = nodes.G(goalIndex);
else
    result.AngularPathLengthDeg = pathAngularLength(path, options);
end
result.ExpandedNodeCount = expanded;
result.GeneratedNodeCount = generated;
result.Path = path;
result.SteeringProfile = path(:, { ...
    'Time', 'AzimuthDeg', 'AzimuthUnwrappedDeg', 'ElevationDeg'});
result.Limits = limits;
result.Options = options;
result.Goal = goal;
end

function limits = normalizeLimits(limits)
defaults = struct( ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [0 90], ...
    "AzimuthRateLimitDegPerSec", 5, ...
    "ElevationRateLimitDegPerSec", 5, ...
    "AzimuthAccelerationLimitDegPerSec2", 1, ...
    "ElevationAccelerationLimitDegPerSec2", 1);
limits = applyDefaults(limits, defaults);
validateattributes(limits.AzimuthLimitsDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
validateattributes(limits.ElevationLimitsDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
names = ["AzimuthRateLimitDegPerSec", ...
    "ElevationRateLimitDegPerSec", ...
    "AzimuthAccelerationLimitDegPerSec2", ...
    "ElevationAccelerationLimitDegPerSec2"];
for name = names
    validateattributes(limits.(name), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
end
limits.AzimuthLimitsDeg = reshape(double(limits.AzimuthLimitsDeg), 1, 2);
limits.ElevationLimitsDeg = reshape(double(limits.ElevationLimitsDeg), 1, 2);
end

function options = normalizeOptions(options, limits)
if ~isfield(options, "TimeStepSeconds") || ...
        isempty(options.TimeStepSeconds)
    options.TimeStepSeconds = 1;
end
validateattributes(options.TimeStepSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
dt = options.TimeStepSeconds;
defaults = struct( ...
    "MaxPlanningTimeSeconds", 120, ...
    "Objective", "minimumTime", ...
    "HeuristicWeight", 1, ...
    "AzimuthWrap", diff(limits.AzimuthLimitsDeg) >= 360 - 1e-9, ...
    "AzimuthResolutionDeg", ...
    0.5 * limits.AzimuthAccelerationLimitDegPerSec2 * dt^2, ...
    "ElevationResolutionDeg", ...
    0.5 * limits.ElevationAccelerationLimitDegPerSec2 * dt^2, ...
    "AzimuthRateResolutionDegPerSec", ...
    limits.AzimuthAccelerationLimitDegPerSec2 * dt, ...
    "ElevationRateResolutionDegPerSec", ...
    limits.ElevationAccelerationLimitDegPerSec2 * dt, ...
    "AccelerationLevels", [-1 0 1], ...
    "CollisionCheckStepSeconds", dt / 4, ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", 1, ...
    "BoundsMarginDeg", [0 0], ...
    "SafetyMarginDeg", 0, ...
    "MaxExpansions", 200000, ...
    "MaxWallTimeSeconds", Inf, ...
    "InitialNodeCapacity", 4096);
options = applyDefaults(options, defaults);
options.Objective = normalizeObjective(options.Objective);
validateattributes(options.MaxPlanningTimeSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.HeuristicWeight, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 1});
validateattributes(options.AzimuthWrap, {'logical', 'numeric'}, {'scalar'});
if options.AzimuthWrap ~= 0 && options.AzimuthWrap ~= 1
    error("planAzElKinodynamicAStar:InvalidAzimuthWrap", ...
        "AzimuthWrap must be logical or numeric 0/1.");
end

options.AzimuthWrap = logical(options.AzimuthWrap);
resolutionNames = ["AzimuthResolutionDeg", "ElevationResolutionDeg", ...
    "AzimuthRateResolutionDegPerSec", ...
    "ElevationRateResolutionDegPerSec", ...
    "CollisionCheckStepSeconds"];
for name = resolutionNames
    validateattributes(options.(name), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
end
validateattributes(options.AccelerationLevels, {'numeric'}, ...
    {'vector', 'real', 'finite', '>=', -1, '<=', 1});
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.BoundsMarginDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
validateattributes(options.SafetyMarginDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.MaxExpansions, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaxWallTimeSeconds, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
validateattributes(options.InitialNodeCapacity, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
mode = lower(string(options.CollisionMode));
if ~any(mode == ["polygon", "bounds"])
    error("planAzElKinodynamicAStar:InvalidCollisionMode", ...
        "CollisionMode must be polygon or bounds.");
end
options.CollisionMode = mode;
levels = unique(double(options.AccelerationLevels(:).'));
if ~any(abs(levels) < 1e-12)
    levels = sort([levels 0]);
end
options.AccelerationLevels = levels;
if options.AzimuthWrap && ...
        abs(diff(limits.AzimuthLimitsDeg) - 360) > 1e-6
    error("planAzElKinodynamicAStar:InvalidWrapLimits", ...
        "AzimuthWrap requires azimuth limits spanning exactly 360 degrees.");
end
end

function objective = normalizeObjective(value)
value = lower(strtrim(string(value)));
if ~isscalar(value)
    error("planAzElKinodynamicAStar:InvalidObjective", ...
        "Objective must be minimumTime or minimumAngularDistance.");
end
switch value
    case {"minimumtime", "time"}
        objective = "minimumTime";
    case {"minimumangulardistance", "angulardistance", "distance"}
        objective = "minimumAngularDistance";
    otherwise
        error("planAzElKinodynamicAStar:InvalidObjective", ...
            "Objective must be minimumTime or minimumAngularDistance.");
end
end

function validateLatticeCompatibility(options, limits)
dt = options.TimeStepSeconds;
checks = [ ...
    limits.AzimuthAccelerationLimitDegPerSec2 * ...
    options.AccelerationLevels(:) * dt / ...
    options.AzimuthRateResolutionDegPerSec; ...
    limits.ElevationAccelerationLimitDegPerSec2 * ...
    options.AccelerationLevels(:) * dt / ...
    options.ElevationRateResolutionDegPerSec; ...
    options.AzimuthRateResolutionDegPerSec * dt / ...
    options.AzimuthResolutionDeg; ...
    options.ElevationRateResolutionDegPerSec * dt / ...
    options.ElevationResolutionDeg; ...
    0.5 * limits.AzimuthAccelerationLimitDegPerSec2 * ...
    options.AccelerationLevels(:) * dt^2 / ...
    options.AzimuthResolutionDeg; ...
    0.5 * limits.ElevationAccelerationLimitDegPerSec2 * ...
    options.AccelerationLevels(:) * dt^2 / ...
    options.ElevationResolutionDeg];
if any(abs(checks - round(checks)) > 1e-8)
    error("planAzElKinodynamicAStar:IncompatibleLattice", ...
        ["Position/rate resolutions must make every acceleration " ...
        "primitive land exactly on the lattice. Use the derived defaults " ...
        "or compatible multiples."]);
end
if options.AzimuthWrap
    binCount = diff(limits.AzimuthLimitsDeg) / ...
        options.AzimuthResolutionDeg;
    if abs(binCount - round(binCount)) > 1e-8
        error("planAzElKinodynamicAStar:IncompatibleAzimuthWrap", ...
            "Wrapped azimuth span must contain an integer number of bins.");
    end
end
end

function start = normalizeStart(input, referenceTime, limits, options)
requiredFields(input, ["AzimuthDeg", "ElevationDeg"], "startState");
validateattributes(input.AzimuthDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(input.ElevationDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
azimuthRate = fieldOr(input, "AzimuthRateDegPerSec", 0);
elevationRate = fieldOr(input, "ElevationRateDegPerSec", 0);
azimuthAcceleration = fieldOr(input, ...
    "AzimuthAccelerationDegPerSec2", 0);
elevationAcceleration = fieldOr(input, ...
    "ElevationAccelerationDegPerSec2", 0);
validateattributes(azimuthRate, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(elevationRate, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(azimuthAcceleration, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(elevationAcceleration, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
startTime = fieldOr(input, "Time", referenceTime);
startSeconds = timeSeconds(startTime, referenceTime);
state = [double(input.AzimuthDeg), double(input.ElevationDeg), ...
    double(azimuthRate), double(elevationRate), 0];
state = snapState(state, limits, options);
validateStateLimits(state, limits, options, "start");
start = struct();
start.State = state;
start.TimeSeconds = startSeconds;
start.Acceleration = [double(azimuthAcceleration), ...
    double(elevationAcceleration)];
if abs(start.Acceleration(1)) > ...
        limits.AzimuthAccelerationLimitDegPerSec2 + 1e-9 || ...
        abs(start.Acceleration(2)) > ...
        limits.ElevationAccelerationLimitDegPerSec2 + 1e-9
    error("planAzElKinodynamicAStar:StateOutsideLimits", ...
        "start acceleration lies outside the configured limits.");
end
end

function goal = normalizeGoal(input, referenceTime, start, limits, options)
requiredFields(input, ["AzimuthDeg", "ElevationDeg"], "goalState");
validateattributes(input.AzimuthDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(input.ElevationDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
goal = struct();
goal.AzimuthDeg = canonicalAzimuth(double(input.AzimuthDeg), limits, options);
goal.ElevationDeg = double(input.ElevationDeg);
goal.AzimuthRateDegPerSec = double(fieldOr( ...
    input, "AzimuthRateDegPerSec", 0));
goal.ElevationRateDegPerSec = double(fieldOr( ...
    input, "ElevationRateDegPerSec", 0));
validateattributes(goal.AzimuthRateDegPerSec, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
validateattributes(goal.ElevationRateDegPerSec, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
defaultPositionTolerance = [options.AzimuthResolutionDeg, ...
    options.ElevationResolutionDeg] / 2 + 1e-9;
positionTolerance = fieldOr(input, "PositionToleranceDeg", ...
    defaultPositionTolerance);
if isscalar(positionTolerance)
    positionTolerance = [positionTolerance positionTolerance];
end
goal.PositionToleranceDeg = reshape(double(positionTolerance), 1, 2);
validateattributes(goal.PositionToleranceDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
defaultRateTolerance = [options.AzimuthRateResolutionDegPerSec, ...
    options.ElevationRateResolutionDegPerSec] / 2 + 1e-9;
rateTolerance = fieldOr(input, "RateToleranceDegPerSec", ...
    defaultRateTolerance);
if isscalar(rateTolerance)
    rateTolerance = [rateTolerance rateTolerance];
end
goal.RateToleranceDegPerSec = reshape(double(rateTolerance), 1, 2);
validateattributes(goal.RateToleranceDegPerSec, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
hasAccelerationGoal = isfield(input, "AzimuthAccelerationDegPerSec2") || ...
    isfield(input, "ElevationAccelerationDegPerSec2");
goal.AccelerationDegPerSec2 = [double(fieldOr( ...
    input, "AzimuthAccelerationDegPerSec2", 0)), double(fieldOr( ...
    input, "ElevationAccelerationDegPerSec2", 0))];
if hasAccelerationGoal
    accelerationTolerance = fieldOr( ...
        input, "AccelerationToleranceDegPerSec2", 1e-9);
    if isscalar(accelerationTolerance)
        accelerationTolerance = [ ...
            accelerationTolerance accelerationTolerance];
    end
    goal.AccelerationToleranceDegPerSec2 = ...
        reshape(double(accelerationTolerance), 1, 2);
    validateattributes(goal.AccelerationToleranceDegPerSec2, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
else
    goal.AccelerationToleranceDegPerSec2 = [Inf Inf];
end
startSeconds = start.TimeSeconds;
earliest = timeSeconds(fieldOr(input, "EarliestTime", startSeconds), ...
    referenceTime);
latestDefault = startSeconds + options.MaxPlanningTimeSeconds;
latest = timeSeconds(fieldOr(input, "LatestTime", latestDefault), ...
    referenceTime);
if latest < earliest || earliest < startSeconds - 1e-9
    error("planAzElKinodynamicAStar:InvalidGoalWindow", ...
        "Goal time window must follow the start time.");
end
goal.EarliestTimeSeconds = earliest;
goal.LatestTimeSeconds = latest;
goal.EarliestStep = max(0, ceil((earliest - startSeconds) / ...
    options.TimeStepSeconds - 1e-10));
goal.LatestStep = floor((latest - startSeconds) / ...
    options.TimeStepSeconds + 1e-10);
goal.Options = options;
if goal.ElevationDeg < limits.ElevationLimitsDeg(1) || ...
        goal.ElevationDeg > limits.ElevationLimitsDeg(2)
    error("planAzElKinodynamicAStar:GoalOutsideLimits", ...
        "Goal elevation lies outside the configured limits.");
end
if abs(goal.AzimuthRateDegPerSec) > ...
        limits.AzimuthRateLimitDegPerSec + 1e-9 || ...
        abs(goal.ElevationRateDegPerSec) > ...
        limits.ElevationRateLimitDegPerSec + 1e-9 || ...
        abs(goal.AccelerationDegPerSec2(1)) > ...
        limits.AzimuthAccelerationLimitDegPerSec2 + 1e-9 || ...
        abs(goal.AccelerationDegPerSec2(2)) > ...
        limits.ElevationAccelerationLimitDegPerSec2 + 1e-9
    error("planAzElKinodynamicAStar:GoalOutsideLimits", ...
        "Goal velocity or acceleration lies outside configured limits.");
end
end

function [next, valid] = propagatePrimitive(state, acceleration, limits, options)
dt = options.TimeStepSeconds;
next = state;
next(1) = state(1) + state(3) * dt + 0.5 * acceleration(1) * dt^2;
next(2) = state(2) + state(4) * dt + 0.5 * acceleration(2) * dt^2;
next(3) = state(3) + acceleration(1) * dt;
next(4) = state(4) + acceleration(2) * dt;
next(5) = state(5) + 1;
next = snapState(next, limits, options);
valid = abs(next(3)) <= limits.AzimuthRateLimitDegPerSec + 1e-9 && ...
    abs(next(4)) <= limits.ElevationRateLimitDegPerSec + 1e-9 && ...
    next(2) >= limits.ElevationLimitsDeg(1) - 1e-9 && ...
    next(2) <= limits.ElevationLimitsDeg(2) + 1e-9;
if ~options.AzimuthWrap
    valid = valid && next(1) >= limits.AzimuthLimitsDeg(1) - 1e-9 && ...
        next(1) <= limits.AzimuthLimitsDeg(2) + 1e-9;
end
end

function state = snapState(state, limits, options)
state(1) = round((state(1) - limits.AzimuthLimitsDeg(1)) / ...
    options.AzimuthResolutionDeg) * options.AzimuthResolutionDeg + ...
    limits.AzimuthLimitsDeg(1);
state(2) = round((state(2) - limits.ElevationLimitsDeg(1)) / ...
    options.ElevationResolutionDeg) * options.ElevationResolutionDeg + ...
    limits.ElevationLimitsDeg(1);
state(3) = round(state(3) / options.AzimuthRateResolutionDegPerSec) * ...
    options.AzimuthRateResolutionDegPerSec;
state(4) = round(state(4) / options.ElevationRateResolutionDegPerSec) * ...
    options.ElevationRateResolutionDegPerSec;
state(1) = canonicalAzimuth(state(1), limits, options);
end

function collision = primitiveCollisions(workspace, state, accelerations, ...
        startTimeSeconds, limits, options)
dt = options.TimeStepSeconds;
count = max(2, ceil(dt / options.CollisionCheckStepSeconds) + 1);
tau = linspace(0, dt, count).';
tauSquared = tau.^2;
azimuth = state(1) + state(3) .* tau + ...
    0.5 * tauSquared * accelerations(:, 1).';
elevation = state(2) + state(4) .* tau + ...
    0.5 * tauSquared * accelerations(:, 2).';
collision = false(1, size(accelerations, 1));
if options.AzimuthWrap
    azimuth = canonicalAzimuth(azimuth, limits, options);
else
    collision = collision | any( ...
        azimuth < limits.AzimuthLimitsDeg(1) - 1e-9 | ...
        azimuth > limits.AzimuthLimitsDeg(2) + 1e-9, 1);
end
collision = collision | any( ...
    elevation < limits.ElevationLimitsDeg(1) - 1e-9 | ...
    elevation > limits.ElevationLimitsDeg(2) + 1e-9, 1);
querySeconds = startTimeSeconds + state(5) * dt + tau;
querySeconds = repmat(querySeconds, 1, size(accelerations, 1));
blocked = queryAzElTimeObstacle(workspace, azimuth(:), elevation(:), ...
    querySeconds(:), struct( ...
    "CollisionMode", options.CollisionMode, ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "BoundsMarginDeg", options.BoundsMarginDeg, ...
    "SafetyMarginDeg", options.SafetyMarginDeg));
collision = collision | any(reshape(blocked, size(azimuth)), 1);
collision = collision(:);
end

function collision = pointCollision( ...
        workspace, startState, startTimeSeconds, options)
blocked = queryAzElTimeObstacle(workspace, startState(1), startState(2), ...
    startTimeSeconds, struct( ...
    "CollisionMode", options.CollisionMode, ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "BoundsMarginDeg", options.BoundsMarginDeg, ...
    "SafetyMarginDeg", options.SafetyMarginDeg));
collision = any(blocked);
end

function cost = transitionCost(state, acceleration, options)
if options.Objective == "minimumAngularDistance"
    cost = primitiveAngularLength( ...
        state(3:4), acceleration, options.TimeStepSeconds);
else
    cost = options.TimeStepSeconds;
end
end

function lengthDeg = primitiveAngularLength(rate, acceleration, dt)
sampleCount = 9;
tau = linspace(0, dt, sampleCount).';
velocity = rate + tau .* acceleration;
speed = hypot(velocity(:, 1), velocity(:, 2));
weights = [1; 4; 2; 4; 2; 4; 2; 4; 1];
lengthDeg = (dt / (sampleCount - 1)) / 3 * sum(weights .* speed);
end

function lengthDeg = pathAngularLength(path, options)
lengthDeg = 0;
for k = 1:height(path) - 1
    rate = [ ...
        path.AzimuthRateDegPerSec(k), ...
        path.ElevationRateDegPerSec(k)];
    acceleration = [ ...
        path.AzimuthAccelerationDegPerSec2(k + 1), ...
        path.ElevationAccelerationDegPerSec2(k + 1)];
    lengthDeg = lengthDeg + primitiveAngularLength( ...
        rate, acceleration, options.TimeStepSeconds);
end
end

function units = objectiveCostUnits(objective)
if objective == "minimumAngularDistance"
    units = "degrees";
else
    units = "seconds";
end
end

function yes = canStillReach(state, goal, limits, options)
[minimumTime, ~] = motionLowerBound(state, goal, limits, options);
remainingTime = max(0, goal.LatestStep - state(5)) * ...
    options.TimeStepSeconds;
yes = minimumTime <= remainingTime + 1e-9;
end

function value = heuristic(state, goal, limits, options)
if options.Objective == "minimumAngularDistance"
    [azimuthDistance, elevationDistance] = ...
        positionDistance(state, goal, limits, options);
    value = hypot(azimuthDistance, elevationDistance);
else
    [motionTime, ~] = motionLowerBound(state, goal, limits, options);
    currentTime = state(5) * options.TimeStepSeconds;
    earliestRelative = goal.EarliestStep * options.TimeStepSeconds;
    windowWait = max(0, earliestRelative - currentTime);
    value = max(motionTime, windowWait);
end
end

function [value, positionTime] = motionLowerBound( ...
        state, goal, limits, options)
[azimuthDistance, elevationDistance] = ...
    positionDistance(state, goal, limits, options);
positionTime = max( ...
    azimuthDistance / limits.AzimuthRateLimitDegPerSec, ...
    elevationDistance / limits.ElevationRateLimitDegPerSec);
stoppingTime = max( ...
    max(0, abs(state(3) - goal.AzimuthRateDegPerSec) - ...
    goal.RateToleranceDegPerSec(1)) / ...
    limits.AzimuthAccelerationLimitDegPerSec2, ...
    max(0, abs(state(4) - goal.ElevationRateDegPerSec) - ...
    goal.RateToleranceDegPerSec(2)) / ...
    limits.ElevationAccelerationLimitDegPerSec2);
value = max(positionTime, stoppingTime);
end

function [azimuthDistance, elevationDistance] = ...
        positionDistance(state, goal, limits, options)
azimuthDistance = abs(azimuthDifference( ...
    state(1), goal.AzimuthDeg, limits, options));
azimuthDistance = max(0, ...
    azimuthDistance - goal.PositionToleranceDeg(1));
elevationDistance = max(0, ...
    abs(state(2) - goal.ElevationDeg) - goal.PositionToleranceDeg(2));
end

function value = motionTie(state, goal, limits, options)
if options.Objective == "minimumAngularDistance"
    [azimuthDistance, elevationDistance] = ...
        positionDistance(state, goal, limits, options);
    value = hypot(azimuthDistance, elevationDistance);
else
    [value, ~] = motionLowerBound(state, goal, limits, options);
end
end

function yes = isGoal(state, acceleration, goal, limits)
options = goal.Options;
azimuthError = abs(azimuthDifference( ...
    state(1), goal.AzimuthDeg, limits, options));
yes = state(5) >= goal.EarliestStep && state(5) <= goal.LatestStep && ...
    azimuthError <= goal.PositionToleranceDeg(1) && ...
    abs(state(2) - goal.ElevationDeg) <= goal.PositionToleranceDeg(2) && ...
    abs(state(3) - goal.AzimuthRateDegPerSec) <= ...
    goal.RateToleranceDegPerSec(1) && ...
    abs(state(4) - goal.ElevationRateDegPerSec) <= ...
    goal.RateToleranceDegPerSec(2) && ...
    abs(acceleration(1) - goal.AccelerationDegPerSec2(1)) <= ...
    goal.AccelerationToleranceDegPerSec2(1) && ...
    abs(acceleration(2) - goal.AccelerationDegPerSec2(2)) <= ...
    goal.AccelerationToleranceDegPerSec2(2);
end

function controls = accelerationControls(limits, levels)
[azimuthLevel, elevationLevel] = ndgrid(levels, levels);
controls = [ ...
    azimuthLevel(:) * limits.AzimuthAccelerationLimitDegPerSec2, ...
    elevationLevel(:) * limits.ElevationAccelerationLimitDegPerSec2];
effort = sum(abs([azimuthLevel(:), elevationLevel(:)]), 2);
[~, order] = sortrows([effort, abs(azimuthLevel(:)), ...
    abs(elevationLevel(:)), azimuthLevel(:), elevationLevel(:)]);
controls = controls(order, :);
end

function key = stateKey(state, acceleration, limits, options)
azimuthBin = round((state(1) - limits.AzimuthLimitsDeg(1)) / ...
    options.AzimuthResolutionDeg);
elevationBin = round((state(2) - limits.ElevationLimitsDeg(1)) / ...
    options.ElevationResolutionDeg);
azimuthRateBin = round(state(3) / ...
    options.AzimuthRateResolutionDegPerSec);
elevationRateBin = round(state(4) / ...
    options.ElevationRateResolutionDegPerSec);
azimuthAcceleration = acceleration(1) / ...
    limits.AzimuthAccelerationLimitDegPerSec2;
elevationAcceleration = acceleration(2) / ...
    limits.ElevationAccelerationLimitDegPerSec2;
key = sprintf('%d|%d|%d|%d|%d|%.12g|%.12g', ...
    azimuthBin, elevationBin, azimuthRateBin, elevationRateBin, ...
    round(state(5)), azimuthAcceleration, elevationAcceleration);
end

function azimuth = canonicalAzimuth(azimuth, limits, options)
if options.AzimuthWrap
    lower = limits.AzimuthLimitsDeg(1);
    span = diff(limits.AzimuthLimitsDeg);
    azimuth = mod(azimuth - lower, span) + lower;
end
end

function delta = azimuthDifference(first, second, limits, options)
delta = first - second;
if options.AzimuthWrap
    span = diff(limits.AzimuthLimitsDeg);
    delta = mod(delta + span / 2, span) - span / 2;
end
end

function validateStateLimits(state, limits, options, label)
if state(2) < limits.ElevationLimitsDeg(1) || ...
        state(2) > limits.ElevationLimitsDeg(2) || ...
        abs(state(3)) > limits.AzimuthRateLimitDegPerSec || ...
        abs(state(4)) > limits.ElevationRateLimitDegPerSec || ...
        (~options.AzimuthWrap && ...
        (state(1) < limits.AzimuthLimitsDeg(1) || ...
        state(1) > limits.AzimuthLimitsDeg(2)))
    error("planAzElKinodynamicAStar:StateOutsideLimits", ...
        "%s state lies outside the configured limits.", label);
end
end

function nodes = initializeNodes(capacity)
nodes = struct( ...
    "State", zeros(capacity, 5), ...
    "Parent", zeros(capacity, 1), ...
    "Acceleration", zeros(capacity, 2), ...
    "G", inf(capacity, 1), ...
    "F", inf(capacity, 1), ...
    "Tie", inf(capacity, 1), ...
    "Count", 0);
end

function [nodes, index] = appendNode( ...
        nodes, state, parent, acceleration, g, h, tie)
if nodes.Count >= size(nodes.State, 1)
    oldCapacity = size(nodes.State, 1);
    newCapacity = 2 * oldCapacity;
    nodes.State(newCapacity, 5) = 0;
    nodes.Parent(newCapacity, 1) = 0;
    nodes.Acceleration(newCapacity, 2) = 0;
    nodes.G(oldCapacity + 1:newCapacity, 1) = inf;
    nodes.F(oldCapacity + 1:newCapacity, 1) = inf;
    nodes.Tie(oldCapacity + 1:newCapacity, 1) = inf;
end
nodes.Count = nodes.Count + 1;
index = nodes.Count;
nodes.State(index, :) = state;
nodes.Parent(index) = parent;
nodes.Acceleration(index, :) = acceleration;
nodes.G(index) = g;
nodes.F(index) = g + h;
nodes.Tie(index) = tie;
end

function heap = emptyHeap(capacity)
heap = struct( ...
    "Node", zeros(capacity, 1), ...
    "F", inf(capacity, 1), ...
    "Tie", inf(capacity, 1), ...
    "Serial", zeros(capacity, 1), ...
    "Count", 0, ...
    "NextSerial", 0);
end

function heap = heapPush(heap, node, f, tie)
if heap.Count >= numel(heap.Node)
    oldCapacity = numel(heap.Node);
    newCapacity = 2 * oldCapacity;
    heap.Node(newCapacity, 1) = 0;
    heap.F(oldCapacity + 1:newCapacity, 1) = inf;
    heap.Tie(oldCapacity + 1:newCapacity, 1) = inf;
    heap.Serial(oldCapacity + 1:newCapacity, 1) = 0;
end
heap.Count = heap.Count + 1;
heap.NextSerial = heap.NextSerial + 1;
index = heap.Count;
heap.Node(index) = node;
heap.F(index) = f;
heap.Tie(index) = tie;
heap.Serial(index) = heap.NextSerial;
while index > 1
    parent = floor(index / 2);
    if ~heapLess(heap, index, parent)
        break;
    end
    heap = heapSwap(heap, index, parent);
    index = parent;
end
end

function [heap, node] = heapPop(heap)
node = heap.Node(1);
heap.Node(1) = heap.Node(heap.Count);
heap.F(1) = heap.F(heap.Count);
heap.Tie(1) = heap.Tie(heap.Count);
heap.Serial(1) = heap.Serial(heap.Count);
heap.Count = heap.Count - 1;
index = 1;
while true
    left = 2 * index;
    right = left + 1;
    if left > heap.Count
        break;
    end
    best = left;
    if right <= heap.Count && heapLess(heap, right, left)
        best = right;
    end
    if ~heapLess(heap, best, index)
        break;
    end
    heap = heapSwap(heap, index, best);
    index = best;
end
end

function yes = heapLess(heap, first, second)
tolerance = 1e-12;
if heap.F(first) < heap.F(second) - tolerance
    yes = true;
elseif heap.F(first) > heap.F(second) + tolerance
    yes = false;
elseif heap.Tie(first) < heap.Tie(second) - tolerance
    yes = true;
elseif heap.Tie(first) > heap.Tie(second) + tolerance
    yes = false;
else
    yes = heap.Serial(first) < heap.Serial(second);
end
end

function heap = heapSwap(heap, first, second)
fields = ["Node", "F", "Tie", "Serial"];
for field = fields
    temporary = heap.(field)(first);
    heap.(field)(first) = heap.(field)(second);
    heap.(field)(second) = temporary;
end
end

function indices = reconstructNodePath(nodes, goalIndex)
indices = zeros(64, 1);
count = 0;
index = goalIndex;
while index ~= 0
    count = count + 1;
    if count > numel(indices)
        indices(2 * numel(indices), 1) = 0;
    end
    indices(count) = index;
    index = nodes.Parent(index);
end
indices = flipud(indices(1:count));
end

function path = makePathTable(nodes, indices, startTimeSeconds, ...
        referenceTime, limits, options)
state = nodes.State(indices, :);
elapsed = state(:, 5) * options.TimeStepSeconds;
timeFromReference = startTimeSeconds + elapsed;
time = referenceTime + seconds(timeFromReference);
azimuth = state(:, 1);
unwrappedAzimuth = azimuth;
for k = 2:numel(azimuth)
    unwrappedAzimuth(k) = unwrappedAzimuth(k - 1) + ...
        azimuthDifference(azimuth(k), azimuth(k - 1), limits, options);
end
acceleration = nodes.Acceleration(indices, :);
isWaiting = false(numel(indices), 1);
for k = 2:numel(indices)
    isWaiting(k) = ...
        abs(azimuthDifference(azimuth(k), azimuth(k - 1), ...
        limits, options)) < 1e-10 && ...
        abs(state(k, 2) - state(k - 1, 2)) < 1e-10 && ...
        abs(state(k, 3)) < 1e-10 && abs(state(k, 4)) < 1e-10;
end
path = table(time, timeFromReference, elapsed, azimuth, ...
    unwrappedAzimuth, state(:, 2), state(:, 3), state(:, 4), ...
    acceleration(:, 1), acceleration(:, 2), isWaiting, ...
    'VariableNames', {'Time', 'TimeSecondsFromReference', ...
    'ElapsedSeconds', 'AzimuthDeg', 'AzimuthUnwrappedDeg', ...
    'ElevationDeg', 'AzimuthRateDegPerSec', ...
    'ElevationRateDegPerSec', 'AzimuthAccelerationDegPerSec2', ...
    'ElevationAccelerationDegPerSec2', 'IsWaiting'});
end

function result = failedResult(message, expanded, generated, limits, options)
emptyTime = NaT(0, 1, "TimeZone", "UTC");
path = table(emptyTime, zeros(0, 1), zeros(0, 1), zeros(0, 1), ...
    zeros(0, 1), zeros(0, 1), zeros(0, 1), zeros(0, 1), ...
    zeros(0, 1), zeros(0, 1), false(0, 1), ...
    'VariableNames', {'Time', 'TimeSecondsFromReference', ...
    'ElapsedSeconds', 'AzimuthDeg', 'AzimuthUnwrappedDeg', ...
    'ElevationDeg', 'AzimuthRateDegPerSec', ...
    'ElevationRateDegPerSec', 'AzimuthAccelerationDegPerSec2', ...
    'ElevationAccelerationDegPerSec2', 'IsWaiting'});
result = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "OptimalOnLattice", false, ...
    "Objective", options.Objective, ...
    "HeuristicWeight", options.HeuristicWeight, ...
    "SuboptimalityBound", options.HeuristicWeight, ...
    "ObjectiveCost", Inf, ...
    "ObjectiveCostUnits", objectiveCostUnits(options.Objective), ...
    "CostSeconds", Inf, ...
    "AngularPathLengthDeg", Inf, ...
    "ExpandedNodeCount", expanded, ...
    "GeneratedNodeCount", generated, ...
    "Path", path, ...
    "SteeringProfile", path(:, {'Time', 'AzimuthDeg', ...
    'AzimuthUnwrappedDeg', 'ElevationDeg'}), ...
    "Limits", limits, ...
    "Options", options, ...
    "Goal", struct());
end

function secondsValue = timeSeconds(value, referenceTime)
if isdatetime(value) && isscalar(value) && ~isnat(value)
    value.TimeZone = "UTC";
    secondsValue = seconds(value - referenceTime);
elseif isnumeric(value) && isscalar(value) && isfinite(value)
    secondsValue = double(value);
else
    error("planAzElKinodynamicAStar:InvalidTime", ...
        "Times must be datetime scalars or seconds from ReferenceTime.");
end
end

function requiredFields(input, names, label)
if ~isstruct(input) || ~all(isfield(input, cellstr(names)))
    error("planAzElKinodynamicAStar:MissingField", ...
        "%s is missing required fields: %s.", label, strjoin(names, ", "));
end
end

function value = fieldOr(input, name, fallback)
if isstruct(input) && isfield(input, name) && ~isempty(input.(name))
    value = input.(name);
else
    value = fallback;
end
end

function output = applyDefaults(input, defaults)
output = input;
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(output, names{k}) || isempty(output.(names{k}))
        output.(names{k}) = defaults.(names{k});
    end
end
end

function validateWorkspace(workspace)
if ~isstruct(workspace) || ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace" || ...
        ~isfield(workspace, "ReferenceTime") || ...
        ~isfield(workspace, "Obstacles")
    error("planAzElKinodynamicAStar:InvalidWorkspace", ...
        "Use buildAzElTimeObstacleWorkspace to create the workspace.");
end
end
