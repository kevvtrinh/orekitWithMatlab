function result = searchAzElSafeIntervalDijkstra( ...
        workspace, startState, stopState, limits, options)
%SEARCHAZELSAFEINTERVALDIJKSTRA Find a dynamic space-time route.
%
% Each state is an az/el grid point paired with one run-length-compressed
% safe time interval. Dijkstra minimizes the earliest arrival label for that
% state. Transitions are analytic rest-to-rest slews checked against the
% moving packed polygons; an enabled final edge may match nonzero terminal
% dynamics. Time remains continuous inside each interval, so waiting does
% not create one state per time sample.

timer = tic;
hasTerminalDynamics = options.AllowNonzeroTerminalState && ...
    any(abs([stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2]) > 1e-12);
% Event times are the only instants used to classify a stationary grid
% point. Long consecutive safe runs are compressed into one SIPP interval.
eventTimes = safeIntervalTimes( ...
    workspace, startState.time_s, stopState.time_s, options);
safeCache = containers.Map( ...
    'KeyType', 'char', 'ValueType', 'any');
safeQueryCount = 0;

[startIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
    startState.position_deg, workspace, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
startInterval = containingInterval( ...
    startIntervals, startState.time_s);
if startInterval == 0
    result = failedResult( ...
        "The start is not inside a sampled safe interval.", ...
        eventTimes, safeCache, safeQueryCount, toc(timer), options);
    return;
end

[goalIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
    stopState.position_deg, workspace, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
goalInterval = containingInterval(goalIntervals, stopState.time_s);
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
    [directFound, directRoute, directProfile] = directAngularCertificate( ...
        workspace, startState, stopState, limits, options, eventTimes, ...
        startIntervals(startInterval, :), goalIntervals(goalInterval, :));
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

offsets = guideOffsets(options);
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
        currentPosition, workspace, eventTimes, limits, options, ...
        safeCache, safeQueryCount);
    currentSafe = currentIntervals(currentIntervalIndex, :);
    candidates = candidatePositions( ...
        currentPosition, stopState.position_deg, offsets, limits, options);

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
            candidatePosition, workspace, ...
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
                [scheduled, departureTime, arrivalTime, motionDuration] = scheduleTerminalTransition( ...
                    workspace, currentPosition, ...
                    nodes.ArrivalTime_s(currentIndex), currentSafe, ...
                    candidateSafe, stopState, eventTimes, limits, options);
            else
                [scheduled, departureTime, arrivalTime] = scheduleTransition( ...
                    workspace, currentPosition, delta, ...
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
                if arrivalTime >= ...
                        nodes.ArrivalTime_s(previousBestNodeIndex) - 1e-9
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
route = makeRoute(nodes, nodePath, startState, stopState, limits, options);
profile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.SampleTime_s, limits, options);
validationProfile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.ValidationStep_s, limits, options);
route.angularPathLength_deg = sum(hypot( ...
    diff(validationProfile.positionUnwrapped_deg(:, 1)), ...
    diff(validationProfile.positionUnwrapped_deg(:, 2))));
blocked = queryAzElTimeObstacle(workspace, ...
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

function times = safeIntervalTimes(workspace, startTime, stopTime, options)
% Preserve obstacle sample events when possible, then decimate globally if
% the requested horizon would make every point query too expensive.
times = [startTime; stopTime];
for obstacle = reshape(workspace.Obstacles, 1, [])
    candidate = double(obstacle.TimeSeconds(:));
    candidate = candidate(candidate >= startTime & candidate <= stopTime);
    times = [times; candidate]; %#ok<AGROW>
end
times = unique(times);
maximum = options.MaximumSafeIntervalSamples;
if numel(times) > maximum
    keep = unique(round(linspace(1, numel(times), maximum)));
    times = times(keep);
    times = unique([startTime; times; stopTime]);
end
if numel(times) < 2
    times = [startTime; stopTime];
end
end

function [intervals, cache, queryCount] = safeIntervalsAt( ...
        position, workspace, eventTimes, limits, options, cache, queryCount)
key = positionKey(position, limits, options);
if isKey(cache, key)
    intervals = cache(key);
    return;
end
blocked = queryAzElTimeObstacle(workspace, ...
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

function index = containingInterval(intervals, time)
index = find(time >= intervals(:, 1) - 1e-9 & ...
    time <= intervals(:, 2) + 1e-9, 1);
if isempty(index)
    index = 0;
end
end

function [scheduled, departure, arrival] = scheduleTransition( ...
        workspace, startPosition, delta, currentArrival, currentSafe, ...
        candidateSafe, duration, motion, eventTimes, limits, options)
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
    collisionFreeCandidate = transitionFree( ...
        workspace, startPosition, delta, ...
        departureCandidates_s(candidateIndices), duration, motion, eventTimes(1), ...
        limits, options);
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

function [scheduled, departure, arrival, duration] = scheduleTerminalTransition( ...
        workspace, startPosition, currentArrival, currentSafe, ...
        candidateSafe, stopState, eventTimes, limits, options)
scheduled = false;
departure = NaN;
arrival = NaN;
duration = NaN;
if stopState.time_s < candidateSafe(1) - 1e-9 || ...
        stopState.time_s > candidateSafe(2) + 1e-9
    return;
end
% Arrival is fixed by the rendezvous state. Search departure time instead;
% changing it changes the quintic duration and thus all dynamic extrema.
lower = max(currentArrival, currentSafe(1));
upper = min(currentSafe(2), stopState.time_s - 1e-6);
if upper < lower
    return;
end

eventCandidates = eventTimes(eventTimes >= lower & eventTimes <= upper);
uniformCount = min(options.MaximumDepartureTrials, 16);
uniformCandidates = linspace(lower, upper, uniformCount).';
candidateTimes = unique([lower; eventCandidates; uniformCandidates; upper]);
if numel(candidateTimes) > options.MaximumDepartureTrials
    keep = unique(round(linspace( ...
        1, numel(candidateTimes), options.MaximumDepartureTrials)));
    candidateTimes = candidateTimes(keep);
end
for k = 1:numel(candidateTimes)
    candidateDeparture = candidateTimes(k);
    candidateDuration = stopState.time_s - candidateDeparture;
    if terminalTransitionFree( ...
            workspace, startPosition, candidateDeparture, ...
            candidateDuration, stopState, limits, options)
        scheduled = true;
        departure = candidateDeparture;
        arrival = stopState.time_s;
        duration = candidateDuration;
        return;
    end
end
end

function free = terminalTransitionFree( ...
        workspace, startPosition, departure, duration, ...
        stopState, limits, options)
if duration <= 0 || ...
        any(abs(stopState.velocity_deg_s) > ...
        limits.maxVelocity_deg_s + 1e-9) || ...
        any(abs(stopState.acceleration_deg_s2) > ...
        limits.maxAcceleration_deg_s2 + 1e-9)
    free = false;
    return;
end
delta = wrappedDelta( ...
    startPosition, stopState.position_deg, limits, options);
stopPosition = startPosition + delta;
step = min(options.CollisionCheckStep_s, options.ValidationStep_s);
sampleCount = max(21, ceil(duration / step) + 1);
tau = linspace(0, duration, sampleCount).';
% The terminal polynomial exactly matches all six boundary conditions.
% Sampling then rejects rate/acceleration or obstacle violations.
profile = evaluateAzElBoundaryProfile( ...
    startPosition, [0 0], [0 0], ...
    stopPosition, stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2, duration, tau);
if any(abs(profile.velocity_deg_s) > ...
        limits.maxVelocity_deg_s + 1e-9, "all") || ...
        any(abs(profile.acceleration_deg_s2) > ...
        limits.maxAcceleration_deg_s2 + 1e-9, "all")
    free = false;
    return;
end
position = profile.position_deg;
inside = position(:, 2) >= limits.elevation_deg(1) - 1e-9 & ...
    position(:, 2) <= limits.elevation_deg(2) + 1e-9;
if ~options.AllowAzimuthWrap
    inside = inside & ...
        position(:, 1) >= limits.azimuth_deg(1) - 1e-9 & ...
        position(:, 1) <= limits.azimuth_deg(2) + 1e-9;
end
if ~all(inside)
    free = false;
    return;
end
queryPosition = position;
queryPosition(:, 1) = canonicalAzimuth( ...
    queryPosition(:, 1), limits, options);
blocked = queryAzElTimeObstacle(workspace, ...
    queryPosition(:, 1), queryPosition(:, 2), departure + tau, ...
    collisionOptions(options));
free = ~any(blocked);
end

function free = transitionFree(workspace, startPosition, delta, ...
        departures, duration, motion, gridOrigin, limits, options)
departureCount = numel(departures);
queryAzimuth = cell(departureCount, 1);
queryElevation = cell(departureCount, 1);
queryTime = cell(departureCount, 1);
queryOwner = cell(departureCount, 1);
sampleCount = max(2, ...
    ceil(duration / options.CollisionCheckStep_s) + 1);
regularTau = linspace(0, duration, sampleCount).';
for candidate = 1:departureCount
    departure = departures(candidate);
    arrival = departure + duration;
    aligned = [ ...
        alignedTimes(departure, arrival, ...
        options.ValidationStep_s, gridOrigin); ...
        alignedTimes(departure, arrival, ...
        options.SampleTime_s, gridOrigin)];
    % Include both a duration-relative grid and mission-aligned grids so a
    % moving obstacle cannot repeatedly fall between all validation samples.
    tau = unique([regularTau; aligned - departure]);
    [progress, ~, ~] = segmentProgress(tau, duration, motion);
    unwrappedAzimuth = startPosition(1) + progress * delta(1);
    queryAzimuth{candidate} = canonicalAzimuth( ...
        unwrappedAzimuth, limits, options);
    queryElevation{candidate} = startPosition(2) + progress * delta(2);
    queryTime{candidate} = departure + tau;
    queryOwner{candidate} = repmat(candidate, numel(tau), 1);
end
queryAzimuth = vertcat(queryAzimuth{:});
queryElevation = vertcat(queryElevation{:});
queryTime = vertcat(queryTime{:});
queryOwner = vertcat(queryOwner{:});
blocked = queryAzElTimeObstacle(workspace, ...
    queryAzimuth, queryElevation, queryTime, ...
    collisionOptions(options));
free = true(departureCount, 1);
% One vectorized collision query evaluates the whole departure batch.
free(unique(queryOwner(blocked))) = false;
end

function times = alignedTimes(firstTime_s, lastTime_s, step_s, originTime_s)
firstIndex = ceil((firstTime_s - originTime_s) / step_s - 1e-10);
lastIndex = floor((lastTime_s - originTime_s) / step_s + 1e-10);
if lastIndex < firstIndex
    times = zeros(0, 1);
else
    times = originTime_s + (firstIndex:lastIndex).' * step_s;
end
end

function [found, route, profile] = directAngularCertificate( ...
        workspace, startState, stopState, limits, options, eventTimes, ...
        startSafe, goalSafe)
delta = wrappedDelta( ...
    startState.position_deg, stopState.position_deg, limits, options);
[duration, motion] = segmentMotion(delta, limits);
% Waiting does not add angular distance, so any feasible departure for this
% straight segment attains the endpoint-distance lower bound.
if duration <= 1e-12
    found = startSafe(2) >= stopState.time_s - 1e-9 && ...
        goalSafe(1) <= startState.time_s + 1e-9;
    departure = startState.time_s;
    arrival = startState.time_s;
else
    [found, departure, arrival] = scheduleTransition( ...
        workspace, startState.position_deg, delta, ...
        startState.time_s, startSafe, goalSafe, duration, motion, ...
        eventTimes, limits, options);
end
route = struct();
profile = struct();
if ~found
    return;
end

if duration <= 1e-12
    unwrapped = startState.position_deg;
    position = startState.position_deg;
    route = struct( ...
        "position_deg", position, ...
        "positionUnwrapped_deg", unwrapped, ...
        "arrivalTime_s", startState.time_s, ...
        "departureTime_s", stopState.time_s, ...
        "motionDuration_s", 0, ...
        "waitingDuration_s", stopState.time_s - startState.time_s, ...
        "hasTerminalCapture", false, ...
        "terminalVelocity_deg_s", [0 0], ...
        "terminalAcceleration_deg_s2", [0 0], ...
        "angularPathLength_deg", 0);
else
    unwrappedGoal = startState.position_deg + delta;
    position = [startState.position_deg; stopState.position_deg];
    unwrapped = [startState.position_deg; unwrappedGoal];
    route = struct( ...
        "position_deg", position, ...
        "positionUnwrapped_deg", unwrapped, ...
        "arrivalTime_s", [startState.time_s; arrival], ...
        "departureTime_s", [departure; stopState.time_s], ...
        "motionDuration_s", [duration; 0], ...
        "waitingDuration_s", ...
        [departure - startState.time_s; stopState.time_s - arrival], ...
        "hasTerminalCapture", false, ...
        "terminalVelocity_deg_s", [0 0], ...
        "terminalAcceleration_deg_s2", [0 0], ...
        "angularPathLength_deg", hypot(delta(1), delta(2)));
end

profile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.SampleTime_s, limits, options);
validation = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.ValidationStep_s, limits, options);
blocked = queryAzElTimeObstacle(workspace, ...
    [validation.position_deg(:, 1); profile.position_deg(:, 1)], ...
    [validation.position_deg(:, 2); profile.position_deg(:, 2)], ...
    [validation.time_s; profile.time_s], collisionOptions(options));
found = ~any(blocked);
if ~found
    route = struct();
    profile = struct();
end
end

function route = makeRoute( ...
        nodes, nodePath, startState, stopState, limits, options)
position = nodes.PositionDeg(nodePath, :);
arrival = nodes.ArrivalTime_s(nodePath);
departure = nan(numel(nodePath), 1);
duration = zeros(numel(nodePath), 1);
for k = 1:numel(nodePath) - 1
    child = nodePath(k + 1);
    departure(k) = nodes.DepartureTime_s(child);
    duration(k) = nodes.MotionDuration_s(child);
end
departure(end) = stopState.time_s;

unwrapped = position;
unwrapped(1, :) = startState.position_deg;
% Keep a continuous azimuth representation for length and dynamics while
% retaining canonical wrapped positions for collision queries and output.
for k = 2:size(position, 1)
    delta = wrappedDelta( ...
        unwrapped(k - 1, :), position(k, :), limits, options);
    unwrapped(k, :) = unwrapped(k - 1, :) + delta;
end
if size(unwrapped, 1) == 1
    unwrapped(end, :) = stopState.position_deg;
else
    unwrapped(end, :) = unwrapGoal( ...
        unwrapped(end - 1, :), stopState.position_deg, limits, options);
end
position(:, 1) = canonicalAzimuth( ...
    unwrapped(:, 1), limits, options);
position(:, 2) = unwrapped(:, 2);
route = struct( ...
    "position_deg", position, ...
    "positionUnwrapped_deg", unwrapped, ...
    "arrivalTime_s", arrival, ...
    "departureTime_s", departure, ...
    "motionDuration_s", duration, ...
    "waitingDuration_s", max(0, departure - arrival), ...
    "hasTerminalCapture", ...
        options.AllowNonzeroTerminalState && ...
        any(abs([stopState.velocity_deg_s, ...
        stopState.acceleration_deg_s2]) > 1e-12), ...
    "terminalVelocity_deg_s", stopState.velocity_deg_s, ...
    "terminalAcceleration_deg_s2", ...
        stopState.acceleration_deg_s2, ...
    "angularPathLength_deg", sum(hypot( ...
    diff(unwrapped(:, 1)), diff(unwrapped(:, 2)))));
end

function profile = makeRouteProfile( ...
        route, startTime, stopTime, sampleStep, limits, options)
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

function candidates = candidatePositions( ...
        current, goal, offsets, limits, options)
candidates = current + offsets;
candidates(:, 1) = snapAzimuth(candidates(:, 1), limits, options);
candidates(:, 2) = round((candidates(:, 2) - limits.elevation_deg(1)) / ...
    options.GridStep_deg) * options.GridStep_deg + ...
    limits.elevation_deg(1);
inside = candidates(:, 2) >= limits.elevation_deg(1) - 1e-9 & ...
    candidates(:, 2) <= limits.elevation_deg(2) + 1e-9;
if ~options.AllowAzimuthWrap
    inside = inside & ...
        candidates(:, 1) >= limits.azimuth_deg(1) - 1e-9 & ...
        candidates(:, 1) <= limits.azimuth_deg(2) + 1e-9;
end
candidates = candidates(inside, :);
candidates = [candidates; goal];
candidates = unique(round(candidates * 1e9) / 1e9, "rows", "stable");
same = false(size(candidates, 1), 1);
for k = 1:size(candidates, 1)
    same(k) = samePosition(current, candidates(k, :), limits, options);
end
candidates = candidates(~same, :);
end

function offsets = guideOffsets(options)
radii = unique(double(options.PrimitiveRadii_deg(:)));
if isempty(options.DirectionAngles_deg)
    angle = deg2rad((0:options.DirectionStep_deg: ...
        360 - options.DirectionStep_deg).');
else
    angle = deg2rad(mod( ...
        options.DirectionAngles_deg(:), 360));
end
offsets = zeros(numel(radii) * numel(angle), 2);
cursor = 1;
for radius = reshape(radii, 1, [])
    count = numel(angle);
    offsets(cursor:cursor + count - 1, :) = radius * ...
        [cos(angle), sin(angle)];
    cursor = cursor + count;
end
offsets = unique(round(offsets * 1e9) / 1e9, "rows", "stable");
end

function delta = wrappedDelta(fromPosition, toPosition, limits, options)
delta = toPosition - fromPosition;
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    delta(1) = mod(delta(1) + span / 2, span) - span / 2;
end
end

function goal = unwrapGoal(previous, requested, limits, options)
goal = previous + wrappedDelta(previous, requested, limits, options);
goal(2) = requested(2);
end

function yes = samePosition(firstPosition, secondPosition, limits, options)
delta = wrappedDelta(firstPosition, secondPosition, limits, options);
yes = hypot(delta(1), delta(2)) <= 1e-9;
end

function azimuth = snapAzimuth(azimuth, limits, options)
azimuth = round((azimuth - limits.azimuth_deg(1)) / ...
    options.GridStep_deg) * options.GridStep_deg + ...
    limits.azimuth_deg(1);
azimuth = canonicalAzimuth(azimuth, limits, options);
end

function azimuth = canonicalAzimuth(azimuth, limits, options)
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    azimuth = mod(azimuth - limits.azimuth_deg(1), span) + ...
        limits.azimuth_deg(1);
end
end

function key = stateKey(position, interval, limits, options)
key = sprintf('%s#%d', ...
    positionKey(position, limits, options), interval);
end

function key = positionKey(position, limits, options)
azimuth = canonicalAzimuth(position(1), limits, options);
key = sprintf('%.9f|%.9f', azimuth, position(2));
end

function queryOptions = collisionOptions(options)
queryOptions = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "SafetyMarginDeg", options.SafetyMargin_deg);
end

function [nodes, index] = appendNode(nodes, position, interval, arrival, ...
        parent, departure, duration)
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
if frontier.ArrivalTime_s(firstIndex) ~= ...
        frontier.ArrivalTime_s(secondIndex)
    isLess = frontier.ArrivalTime_s(firstIndex) < ...
        frontier.ArrivalTime_s(secondIndex);
else
    isLess = frontier.Serial(firstIndex) < frontier.Serial(secondIndex);
end
end

function frontier = swapArrivalFrontierEntries( ...
        frontier, firstIndex, secondIndex)
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
% Evaluate the quintic terminal edge owned by this dynamic search.
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
