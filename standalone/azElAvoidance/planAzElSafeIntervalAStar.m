function plan = planAzElSafeIntervalAStar( ...
        azElData, initialState, goalState, limits, options)
%PLANAZELSAFEINTERVALASTAR One safe-interval A* for static and moving volumes.
%
% plan = planAzElSafeIntervalAStar( ...
%     azElData, initialState, goalState, limits, options)
%
% Unified planner: a single safe-interval A* (SIPP) search covers static
% obstacles, moving obstacles, waiting, azimuth wrapping, and an optional
% quintic terminal-capture edge for nonzero goal velocity/acceleration.
%   1. A state is one az/el lattice point paired with one maximal
%      collision-free time interval at that point.
%   2. A workspace whose slices never change collapses every point to a
%      single interval, so the same search degenerates to plain 2-D A*
%      over a precomputed free-cell mask with no per-edge polygon queries;
%      exactness is restored by the shortcut pass and final validation.
%   3. Edges are analytic rest-to-rest slews scheduled at the earliest
%      collision-free departure inside the interval overlap window.
%   4. An exact space-time shortcut pass removes lattice staircase corners.
%   5. Every returned command is validated against the packed polygons.
%
% Inputs and returned plan fields follow planAzElAdaptiveAStar. Differences:
% the search runs at the single resolution options.GridStep_deg
% (GridStepSchedule_deg is accepted but not used), and plan.method is
% "safeIntervalAStar". See docs/SAFE_INTERVAL_PLANNER.md.

timer = tic;
if nargin < 5
    options = struct();
end
[initialState, goalState, limits, options] = ...
    normalizeSafeIntervalInputs(initialState, goalState, limits, options);
hasTerminalDynamics = any(abs([goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2]) > 1e-12);

prebuiltWorkspace = isstruct(azElData) && isscalar(azElData) && ...
    isfield(azElData, "Format") && ...
    string(azElData.Format) == "AzElTimeObstacleWorkspace";
if prebuiltWorkspace
    workspace = azElData;
else
    workspace = buildAzElTimeObstacleWorkspace(azElData, struct( ...
        "MaximumVerticesPerRegion", options.MaximumVerticesPerRegion));
end

% Slice-change instants are the only times a stationary point can switch
% between free and blocked. A workspace whose geometry never changes over
% the horizon needs only the two endpoint instants, which collapses every
% lattice point to one interval and the search to ordinary 2-D A*.
workspaceIsStatic = isAzElTimeObstacleWorkspaceStatic( ...
    workspace, initialState.time_s, goalState.time_s);
if workspaceIsStatic
    eventTimes = [initialState.time_s; goalState.time_s];
else
    eventTimes = collectEventTimes( ...
        workspace, initialState.time_s, goalState.time_s, options);
end

search = runSafeIntervalSearch(workspace, initialState, goalState, ...
    limits, options, eventTimes, workspaceIsStatic, ...
    hasTerminalDynamics, timer);
if ~search.Success
    plan = failedSafeIntervalPlan(search.Message, workspace, ...
        initialState, goalState, limits, options, search, toc(timer));
    plan = finalizeAzElPlanFailure(plan);
    return;
end

route = shortcutSpaceTimeRoute(workspace, search.Route, limits, ...
    options, workspaceIsStatic, search.StaticFreeCellMask, search.Lattice);
search.ShortcutBypassCount = route.shortcutBypassCount;

profile = makeSafeIntervalProfile(route, initialState.time_s, ...
    goalState.time_s, options.SampleTime_s, limits, options);
validationProfile = makeSafeIntervalProfile(route, initialState.time_s, ...
    goalState.time_s, options.ValidationStep_s, limits, options);
route.angularPathLength_deg = sum(hypot( ...
    diff(validationProfile.positionUnwrapped_deg(:, 1)), ...
    diff(validationProfile.positionUnwrapped_deg(:, 2))));
% The lattice and safe intervals only guide the search; the packed polygon
% workspace remains the collision authority for the returned command.
blocked = queryAzElTimeObstacle(workspace, ...
    [validationProfile.position_deg(:, 1); profile.position_deg(:, 1)], ...
    [validationProfile.position_deg(:, 2); profile.position_deg(:, 2)], ...
    [validationProfile.time_s; profile.time_s], collisionOptions(options));
if any(blocked)
    search.TerminationReason = "denseValidationFailed";
    plan = failedSafeIntervalPlan(sprintf( ...
        "Safe-interval A* failed dense validation at %d samples.", ...
        nnz(blocked)), workspace, initialState, goalState, limits, ...
        options, search, toc(timer));
    plan = finalizeAzElPlanFailure(plan);
    return;
end

endpointDelta = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
lowerBound_deg = hypot(endpointDelta(1), endpointDelta(2));
if options.Objective == "minimumAngularDistance"
    objectiveCost = route.angularPathLength_deg;
    objectiveUnits = "deg";
else
    objectiveCost = route.arrivalTime_s(end) - initialState.time_s;
    objectiveUnits = "s";
end
searchReport = rmfield(rmfield(rmfield(search, "Route"), ...
    "StaticFreeCellMask"), "Lattice");
plan = struct( ...
    "success", true, ...
    "message", ...
    "Unified safe-interval A* found an exact-checked trajectory.", ...
    "method", "safeIntervalAStar", ...
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
    "angularLowerBound_deg", lowerBound_deg, ...
    "suboptimalityBound", max(1, route.angularPathLength_deg / ...
        max(lowerBound_deg, eps)), ...
    "optimalOnLattice", false, ...
    "optimalGlobally", ~hasTerminalDynamics && ...
        abs(route.angularPathLength_deg - lowerBound_deg) <= 1e-9, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", search.ExpandedNodeCount, ...
    "generatedNodeCount", search.GeneratedNodeCount, ...
    "searchElapsed_s", toc(timer), ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", limits, ...
    "options", options, ...
    "workspace", workspace, ...
    "resolutionAttempts", attemptRecord(options, search, profile, ...
        objectiveCost, true), ...
    "safeIntervalSearch", searchReport);
end

function search = runSafeIntervalSearch(workspace, initialState, ...
        goalState, limits, options, eventTimes, workspaceIsStatic, ...
        hasTerminalDynamics, timer)
% Earliest-arrival SIPP over (lattice point, safe interval) states.
lattice = makeLattice(limits, options);
templates = edgeTemplates(primitiveOffsets(options), lattice, limits);
cache = struct( ...
    "Intervals", containers.Map('KeyType', 'double', 'ValueType', 'any'), ...
    "QueryCount", 0, ...
    "FreeCell", []);
% A static workspace turns every safe interval into the whole horizon, so
% one vectorized query classifies the complete lattice up front and every
% lattice edge check becomes a mask lookup on the cells the slew crosses.
if workspaceIsStatic
    cache = classifyWholeLattice(workspace, lattice, ...
        initialState.time_s, options, cache);
end

startCellId = cellIdentifier(initialState.position_deg, lattice, true);
[startIntervals, cache] = safeIntervalsAt(initialState.position_deg, ...
    workspace, eventTimes, options, cache, startCellId, lattice);
startIntervalIndex = containingInterval(startIntervals, initialState.time_s);
if startIntervalIndex == 0
    search = failedSearch( ...
        "The start is not inside a sampled safe interval.", ...
        "unsafeStart", eventTimes, cache, 0, 0, toc(timer), options);
    return;
end
goalCellId = cellIdentifier(goalState.position_deg, lattice, false);
[goalIntervals, cache] = safeIntervalsAt(goalState.position_deg, ...
    workspace, eventTimes, options, cache, goalCellId, lattice);
goalIntervalIndex = containingInterval(goalIntervals, goalState.time_s);
if goalIntervalIndex == 0
    search = failedSearch( ...
        "The stop is not inside a sampled safe interval.", ...
        "unsafeGoal", eventTimes, cache, 0, 0, toc(timer), options);
    return;
end

% Node labels: one best (earliest) arrival per (cell, interval) state.
% Waiting is continuous inside an interval, so long holds cost no states.
nodes = struct( ...
    "PositionDeg", zeros(options.InitialNodeCapacity, 2), ...
    "StateKey", zeros(options.InitialNodeCapacity, 1), ...
    "ArrivalTime_s", inf(options.InitialNodeCapacity, 1), ...
    "ParentIndex", zeros(options.InitialNodeCapacity, 1, "uint32"), ...
    "DepartureTime_s", nan(options.InitialNodeCapacity, 1), ...
    "MotionDuration_s", zeros(options.InitialNodeCapacity, 1), ...
    "IsTerminalCapture", false(options.InitialNodeCapacity, 1), ...
    "Count", 0);
% One label slot per possible (cell, interval) state. A flat array is far
% cheaper than a hash map; the map fallback only guards degenerate cases
% where huge lattices meet thousands of safe intervals per cell.
maximumIntervalCount = ceil((numel(eventTimes) + 1) / 2) + 2;
bestNode = makeLabelStore(lattice.CellIdSpace * maximumIntervalCount);
heap = makeHeap(options.InitialNodeCapacity);
startKey = stateKey(startCellId, startIntervalIndex, lattice);
startDelta = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
startHeuristic_s = minimumSlewTime(startDelta(1), startDelta(2), ...
    limits, hasTerminalDynamics);
[nodes, startIndex] = appendNode(nodes, initialState.position_deg, ...
    startKey, initialState.time_s, 0, NaN, 0, false);
bestNode = labelSet(bestNode, startKey, startIndex);
heap = heapPush(heap, startIndex, initialState.time_s + ...
    options.HeuristicWeight * startHeuristic_s, startHeuristic_s);

goalIsStart = samePosition(initialState.position_deg, ...
    goalState.position_deg, limits, options);
if goalIsStart && ~hasTerminalDynamics && startCellId == goalCellId && ...
        startIntervalIndex == goalIntervalIndex
    % Waiting in place is the whole plan; no expansion is required.
    search = successfulSearch(extractRoute(nodes, startIndex, ...
        initialState, goalState, limits, options), workspaceIsStatic, ...
        0, 1, cache, eventTimes, toc(timer), options, lattice);
    return;
end

expanded = 0;
generated = 1;
goalNodeIndex = 0;
while heap.Count > 0
    if toc(timer) >= options.MaxSearchTime_s
        search = failedSearch( ...
            "Safe-interval A* reached its wall-time limit.", ...
            "wallTimeLimit", eventTimes, cache, expanded, generated, ...
            toc(timer), options);
        return;
    end
    if expanded >= options.MaxExpansions
        search = failedSearch( ...
            "Safe-interval A* reached its expansion limit.", ...
            "expansionLimit", eventTimes, cache, expanded, generated, ...
            toc(timer), options);
        return;
    end
    [heap, currentIndex] = heapPop(heap);
    currentKey = nodes.StateKey(currentIndex);
    % Improved labels are appended rather than re-keyed in the heap, so a
    % popped entry may be stale; only the recorded best label is expanded.
    if labelGet(bestNode, currentKey) ~= currentIndex
        continue;
    end
    currentPosition = nodes.PositionDeg(currentIndex, :);
    if hasTerminalDynamics
        if nodes.IsTerminalCapture(currentIndex)
            goalNodeIndex = currentIndex;
            break;
        end
    elseif samePosition(currentPosition, goalState.position_deg, ...
            limits, options) && ...
            keyIntervalIndex(currentKey, lattice) == goalIntervalIndex
        goalNodeIndex = currentIndex;
        break;
    end
    expanded = expanded + 1;

    currentIntervals = lookupIntervals(cache, ...
        keyCellId(currentKey, lattice), lattice, eventTimes);
    currentSafe = currentIntervals(keyIntervalIndex(currentKey, lattice), :);
    currentArrival = nodes.ArrivalTime_s(currentIndex);

    % The quintic capture edge is scheduled per expansion; every other edge
    % goes through the batched earliest-departure pipeline below.
    if hasTerminalDynamics
        [scheduled, departure_s, arrival_s, captureDuration_s] = ...
            scheduleTerminalCapture(workspace, currentPosition, ...
            currentArrival, currentSafe, goalState, eventTimes, ...
            limits, options);
        % Reserved interval slot one past the goal cell's real intervals:
        % unique per cell, and always inside the label store's key space.
        captureKey = stateKey(goalCellId, ...
            size(goalIntervals, 1) + 1, lattice);
        captureLabel = labelGet(bestNode, captureKey);
        if scheduled && (captureLabel == 0 || arrival_s < ...
                nodes.ArrivalTime_s(captureLabel) - 1e-9)
            [nodes, childIndex] = appendNode(nodes, ...
                goalState.position_deg, captureKey, arrival_s, ...
                currentIndex, departure_s, captureDuration_s, true);
            bestNode = labelSet(bestNode, captureKey, childIndex);
            generated = generated + 1;
            heap = heapPush(heap, childIndex, arrival_s, 0);
        end
    end

    [candidates, cache] = neighborCandidates(currentPosition, ...
        goalState.position_deg, templates, lattice, limits, options, ...
        goalCellId, hasTerminalDynamics, workspace, eventTimes, cache);
    proposals = gatherEdgeProposals(candidates, templates, ...
        currentPosition, currentArrival, currentSafe, goalState, ...
        goalIntervalIndex, hasTerminalDynamics, cache, lattice, ...
        limits, options, bestNode, nodes, eventTimes);
    if isempty(proposals.Duration_s)
        continue;
    end
    if workspaceIsStatic
        earliestIsFree = staticEdgeCheck(workspace, currentPosition, ...
            currentKey, proposals, templates, cache, lattice, ...
            limits, options, initialState.time_s);
    else
        % One vectorized polygon query tests the earliest departure of
        % every proposed edge; query call overhead dominates otherwise.
        earliestIsFree = batchedSlewCheck(workspace, currentPosition, ...
            proposals, eventTimes(1), limits, options);
    end
    for proposalIndex = 1:numel(proposals.Duration_s)
        if earliestIsFree(proposalIndex)
            departure_s = proposals.WindowLow_s(proposalIndex);
        elseif ~workspaceIsStatic
            departure_s = laterDepartureFallback(workspace, ...
                currentPosition, proposals, proposalIndex, eventTimes, ...
                limits, options);
        else
            departure_s = NaN;   % static freeness is time-invariant
        end
        if ~isfinite(departure_s)
            continue;
        end
        arrival_s = departure_s + proposals.Duration_s(proposalIndex);
        candidateKey = proposals.StateKey(proposalIndex);
        existingLabel = labelGet(bestNode, candidateKey);
        if arrival_s > goalState.time_s + 1e-9 || ...
                (existingLabel > 0 && arrival_s >= ...
                nodes.ArrivalTime_s(existingLabel) - 1e-9)
            continue;
        end
        [nodes, childIndex] = appendNode(nodes, ...
            proposals.Position_deg(proposalIndex, :), candidateKey, ...
            arrival_s, currentIndex, departure_s, ...
            proposals.Duration_s(proposalIndex), false);
        bestNode = labelSet(bestNode, candidateKey, childIndex);
        generated = generated + 1;
        heap = heapPush(heap, childIndex, arrival_s + ...
            options.HeuristicWeight * ...
            proposals.Heuristic_s(proposalIndex), ...
            proposals.Heuristic_s(proposalIndex));
    end
end

if goalNodeIndex == 0
    search = failedSearch( ...
        "No safe-interval A* path reaches the stop state.", ...
        "noPath", eventTimes, cache, expanded, generated, ...
        toc(timer), options);
    return;
end
search = successfulSearch(extractRoute(nodes, goalNodeIndex, ...
    initialState, goalState, limits, options), workspaceIsStatic, ...
    expanded, generated, cache, eventTimes, toc(timer), options, lattice);
end

function search = successfulSearch(route, workspaceIsStatic, expanded, ...
        generated, cache, eventTimes, elapsed_s, options, lattice)
search = struct( ...
    "Success", true, ...
    "Message", "Unified safe-interval A* reached the goal state.", ...
    "Method", "unifiedSafeIntervalAStar", ...
    "Route", route, ...
    "StaticFreeCellMask", cache.FreeCell, ...
    "Lattice", lattice, ...
    "WorkspaceIsStatic", workspaceIsStatic, ...
    "ExpandedNodeCount", expanded, ...
    "GeneratedNodeCount", generated, ...
    "SafeIntervalQueryCount", cache.QueryCount, ...
    "SafeIntervalCacheCount", cache.Intervals.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", elapsed_s, ...
    "TerminationReason", "goalReached", ...
    "ShortcutBypassCount", 0, ...
    "Options", options);
end

function lattice = makeLattice(limits, options)
% Regular az/el lattice. With wrapping enabled the azimuth step is adjusted
% so an integer bin count tiles the full circle and indices wrap modulo.
azimuthSpan_deg = diff(limits.azimuth_deg);
if options.AllowAzimuthWrap
    azimuthBinCount = max(1, ceil(azimuthSpan_deg / options.GridStep_deg));
    azimuthStep_deg = azimuthSpan_deg / azimuthBinCount;
else
    azimuthStep_deg = options.GridStep_deg;
    azimuthBinCount = floor(azimuthSpan_deg / azimuthStep_deg + 1e-9) + 1;
end
elevationStep_deg = options.GridStep_deg;
elevationBinCount = floor(diff(limits.elevation_deg) / ...
    elevationStep_deg + 1e-9) + 1;
lattice = struct( ...
    "AzimuthOrigin_deg", limits.azimuth_deg(1), ...
    "AzimuthStep_deg", azimuthStep_deg, ...
    "AzimuthBinCount", azimuthBinCount, ...
    "ElevationOrigin_deg", limits.elevation_deg(1), ...
    "ElevationStep_deg", elevationStep_deg, ...
    "ElevationBinCount", elevationBinCount, ...
    "Wrap", options.AllowAzimuthWrap, ...
    "LatticeCellCount", azimuthBinCount * elevationBinCount, ...
    "StartCellId", azimuthBinCount * elevationBinCount + 1, ...
    "GoalCellId", azimuthBinCount * elevationBinCount + 2, ...
    "CellIdSpace", azimuthBinCount * elevationBinCount + 2);
end

function cellId = cellIdentifier(position_deg, lattice, isStart)
% Lattice-coincident endpoints share the lattice cell id so endpoint states
% merge with ordinary grid states; off-lattice endpoints get reserved ids.
[onLattice, azimuthIndex, elevationIndex] = snapToLattice( ...
    position_deg, lattice);
if onLattice
    cellId = elevationIndex * lattice.AzimuthBinCount + azimuthIndex + 1;
elseif isStart
    cellId = lattice.StartCellId;
else
    cellId = lattice.GoalCellId;
end
end

function [onLattice, azimuthIndex, elevationIndex, snapped_deg] = ...
        snapToLattice(position_deg, lattice)
azimuthOffset = (position_deg(1) - lattice.AzimuthOrigin_deg) / ...
    lattice.AzimuthStep_deg;
elevationOffset = (position_deg(2) - lattice.ElevationOrigin_deg) / ...
    lattice.ElevationStep_deg;
azimuthIndex = round(azimuthOffset);
elevationIndex = round(elevationOffset);
if lattice.Wrap
    azimuthIndex = mod(azimuthIndex, lattice.AzimuthBinCount);
end
snapped_deg = [lattice.AzimuthOrigin_deg + ...
    azimuthIndex * lattice.AzimuthStep_deg, ...
    lattice.ElevationOrigin_deg + ...
    elevationIndex * lattice.ElevationStep_deg];
onLattice = abs(azimuthOffset - round(azimuthOffset)) <= 1e-9 && ...
    abs(elevationOffset - round(elevationOffset)) <= 1e-9 && ...
    elevationIndex >= 0 && elevationIndex < lattice.ElevationBinCount && ...
    (lattice.Wrap || (azimuthIndex >= 0 && ...
    azimuthIndex < lattice.AzimuthBinCount));
end

function key = stateKey(cellId, intervalIndex, lattice)
key = cellId + lattice.CellIdSpace * (intervalIndex - 1);
end

function cellId = keyCellId(key, lattice)
cellId = mod(key - 1, lattice.CellIdSpace) + 1;
end

function intervalIndex = keyIntervalIndex(key, lattice)
intervalIndex = floor((key - 1) / lattice.CellIdSpace) + 1;
end

function offsets = primitiveOffsets(options)
if isempty(options.PrimitiveRadii_deg)
    radii = options.GridStep_deg * options.PrimitiveRadiusMultipliers;
else
    radii = options.PrimitiveRadii_deg;
end
radii = unique(double(radii(:)));
if isempty(options.DirectionAngles_deg)
    angles_rad = deg2rad((0:options.DirectionStep_deg: ...
        360 - options.DirectionStep_deg).');
else
    angles_rad = deg2rad(mod(options.DirectionAngles_deg(:), 360));
end
offsets = zeros(numel(radii) * numel(angles_rad), 2);
row = 1;
for radiusIndex = 1:numel(radii)
    count = numel(angles_rad);
    offsets(row:row + count - 1, :) = radii(radiusIndex) * ...
        [cos(angles_rad), sin(angles_rad)];
    row = row + count;
end
offsets = unique(round(offsets * 1e9) / 1e9, "rows", "stable");
end

function templates = edgeTemplates(offsets, lattice, limits)
% Snap the symmetric primitive star to exact lattice deltas once. Every
% expansion from an on-lattice state reuses the same deltas, durations,
% trapezoid parameters, and (for static masks) the interior cells the slew
% sweeps across, so the hot loop never rebuilds motion profiles.
azimuthIndexStep = round(offsets(:, 1) / lattice.AzimuthStep_deg);
elevationIndexStep = round(offsets(:, 2) / lattice.ElevationStep_deg);
uniqueSteps = unique([azimuthIndexStep, elevationIndexStep], ...
    "rows", "stable");
uniqueSteps = uniqueSteps(any(uniqueSteps ~= 0, 2), :);
templateCount = size(uniqueSteps, 1);
templates = struct( ...
    "AzimuthIndexStep", uniqueSteps(:, 1), ...
    "ElevationIndexStep", uniqueSteps(:, 2), ...
    "DeltaAz_deg", uniqueSteps(:, 1) * lattice.AzimuthStep_deg, ...
    "DeltaEl_deg", uniqueSteps(:, 2) * lattice.ElevationStep_deg, ...
    "Duration_s", zeros(templateCount, 1), ...
    "PeakRate", zeros(templateCount, 1), ...
    "Acceleration", zeros(templateCount, 1), ...
    "AccelerationTime_s", zeros(templateCount, 1), ...
    "CruiseTime_s", zeros(templateCount, 1), ...
    "CrossedAzimuthSteps", {cell(templateCount, 1)}, ...
    "CrossedElevationSteps", {cell(templateCount, 1)});
for templateIndex = 1:templateCount
    delta = [templates.DeltaAz_deg(templateIndex), ...
        templates.DeltaEl_deg(templateIndex)];
    [templates.Duration_s(templateIndex), motion] = ...
        segmentMotion(delta, limits);
    templates.PeakRate(templateIndex) = motion.PeakRate;
    templates.Acceleration(templateIndex) = motion.Acceleration;
    templates.AccelerationTime_s(templateIndex) = motion.AccelerationTime;
    templates.CruiseTime_s(templateIndex) = motion.CruiseTime;
    % Interior lattice cells nearest the swept segment, endpoints excluded:
    % these are the cells a static mask must clear for the edge to pass.
    stepSpan = max(abs(uniqueSteps(templateIndex, :)));
    lineSamples = linspace(0, 1, 4 * stepSpan + 1).';
    crossed = unique(round(lineSamples * uniqueSteps(templateIndex, :)), ...
        "rows");
    interior = ~(all(crossed == 0, 2) | ...
        (crossed(:, 1) == uniqueSteps(templateIndex, 1) & ...
        crossed(:, 2) == uniqueSteps(templateIndex, 2)));
    templates.CrossedAzimuthSteps{templateIndex} = crossed(interior, 1);
    templates.CrossedElevationSteps{templateIndex} = crossed(interior, 2);
end
end

function cache = classifyWholeLattice(workspace, lattice, ...
        missionTime_s, options, cache)
% Static geometry never changes, so one vectorized packed-polygon query at
% one instant classifies every lattice cell for the whole horizon.
azimuthValues = lattice.AzimuthOrigin_deg + ...
    (0:lattice.AzimuthBinCount - 1).' * lattice.AzimuthStep_deg;
elevationValues = lattice.ElevationOrigin_deg + ...
    (0:lattice.ElevationBinCount - 1).' * lattice.ElevationStep_deg;
queryAzimuth = repmat(azimuthValues, lattice.ElevationBinCount, 1);
queryElevation = repelem(elevationValues, lattice.AzimuthBinCount);
blocked = queryAzElTimeObstacle(workspace, queryAzimuth, ...
    queryElevation(:), missionTime_s, collisionOptions(options));
cache.FreeCell = ~blocked(:);
cache.QueryCount = cache.QueryCount + numel(queryAzimuth);
end

function intervals = lookupIntervals(cache, cellId, lattice, eventTimes)
% Static lattice cells read the precomputed mask; everything else (moving
% workspaces and the reserved off-lattice endpoint cells) uses the cache.
if ~isempty(cache.FreeCell) && cellId <= lattice.LatticeCellCount
    if cache.FreeCell(cellId)
        intervals = [eventTimes(1), eventTimes(end)];
    else
        intervals = zeros(0, 2);
    end
else
    intervals = cache.Intervals(cellId);
end
end

function [candidates, cache] = neighborCandidates(currentPosition, ...
        goalPosition, templates, lattice, limits, options, goalCellId, ...
        hasTerminalDynamics, workspace, eventTimes, cache)
% Instantiate the precomputed lattice deltas at the current state and
% always append the exact goal position so an off-lattice goal stays
% reachable. With terminal dynamics the goal entry is kept even at zero
% offset because the quintic capture edge can change velocity in place.
templateCount = numel(templates.Duration_s);
[onLattice, azimuthIndex, elevationIndex] = snapToLattice( ...
    currentPosition, lattice);
candidates = struct( ...
    "Position_deg", zeros(templateCount + 1, 2), ...
    "CellId", zeros(templateCount + 1, 1), ...
    "TemplateIndex", zeros(templateCount + 1, 1), ...
    "Count", 0);
count = 0;
if onLattice
    azimuthNew = azimuthIndex + templates.AzimuthIndexStep;
    elevationNew = elevationIndex + templates.ElevationIndexStep;
    if lattice.Wrap
        azimuthNew = mod(azimuthNew, lattice.AzimuthBinCount);
        validCandidate = elevationNew >= 0 & ...
            elevationNew < lattice.ElevationBinCount;
    else
        validCandidate = elevationNew >= 0 & ...
            elevationNew < lattice.ElevationBinCount & ...
            azimuthNew >= 0 & azimuthNew < lattice.AzimuthBinCount;
    end
    candidateAzimuth_deg = lattice.AzimuthOrigin_deg + ...
        azimuthNew * lattice.AzimuthStep_deg;
    candidateElevation_deg = lattice.ElevationOrigin_deg + ...
        elevationNew * lattice.ElevationStep_deg;
    goalOffsetAz_deg = candidateAzimuth_deg - goalPosition(1);
    if lattice.Wrap
        wrapSpan_deg = lattice.AzimuthBinCount * lattice.AzimuthStep_deg;
        goalOffsetAz_deg = mod(goalOffsetAz_deg + wrapSpan_deg / 2, ...
            wrapSpan_deg) - wrapSpan_deg / 2;
    end
    isGoalCell = hypot(goalOffsetAz_deg, ...
        candidateElevation_deg - goalPosition(2)) <= 1e-9;
    keepRows = find(validCandidate & ~isGoalCell);
    count = numel(keepRows);
    candidates.Position_deg(1:count, :) = [ ...
        candidateAzimuth_deg(keepRows), candidateElevation_deg(keepRows)];
    candidates.CellId(1:count) = elevationNew(keepRows) * ...
        lattice.AzimuthBinCount + azimuthNew(keepRows) + 1;
    candidates.TemplateIndex(1:count) = keepRows;
else
    % Off-lattice states (the start node) snap each primitive offset and
    % fall back to exact per-edge motion because the template deltas do
    % not describe the true displacement from an off-lattice origin.
    seenCellIds = zeros(templateCount, 1);
    for templateIndex = 1:templateCount
        rawPosition = currentPosition + [ ...
            templates.DeltaAz_deg(templateIndex), ...
            templates.DeltaEl_deg(templateIndex)];
        [~, azimuthSnap, elevationSnap, snapped_deg] = snapToLattice( ...
            rawPosition, lattice);
        if elevationSnap < 0 || elevationSnap >= lattice.ElevationBinCount
            continue;
        end
        if ~lattice.Wrap && (azimuthSnap < 0 || ...
                azimuthSnap >= lattice.AzimuthBinCount)
            continue;
        end
        if samePosition(snapped_deg, currentPosition, limits, options) || ...
                samePosition(snapped_deg, goalPosition, limits, options)
            continue;
        end
        cellId = elevationSnap * lattice.AzimuthBinCount + azimuthSnap + 1;
        if any(seenCellIds(1:count) == cellId)
            continue;
        end
        count = count + 1;
        seenCellIds(count) = cellId;
        candidates.Position_deg(count, :) = snapped_deg;
        candidates.CellId(count) = cellId;
        candidates.TemplateIndex(count) = 0;
    end
end
if ~samePosition(currentPosition, goalPosition, limits, options) || ...
        hasTerminalDynamics
    count = count + 1;
    candidates.Position_deg(count, :) = goalPosition;
    candidates.CellId(count) = goalCellId;
    candidates.TemplateIndex(count) = 0;
end
candidates.Count = count;
candidates.GoalRow = 0;
if count > 0 && candidates.CellId(count) == goalCellId
    candidates.GoalRow = count;
end

% Moving workspaces classify uncached candidate cells in one batched
% packed-polygon query; static workspaces already hold the full mask.
if isempty(cache.FreeCell)
    uncachedRows = zeros(count, 1);
    uncachedCount = 0;
    for row = 1:count
        if ~isKey(cache.Intervals, candidates.CellId(row))
            uncachedCount = uncachedCount + 1;
            uncachedRows(uncachedCount) = row;
        end
    end
    if uncachedCount > 0
        uncachedRows = uncachedRows(1:uncachedCount);
        eventCount = numel(eventTimes);
        queryAzimuth = repelem( ...
            candidates.Position_deg(uncachedRows, 1), eventCount);
        queryElevation = repelem( ...
            candidates.Position_deg(uncachedRows, 2), eventCount);
        blocked = queryAzElTimeObstacle(workspace, queryAzimuth(:), ...
            queryElevation(:), repmat(eventTimes(:), uncachedCount, 1), ...
            collisionOptions(options));
        cache.QueryCount = cache.QueryCount + numel(queryAzimuth);
        for listIndex = 1:uncachedCount
            sampleRows = (listIndex - 1) * eventCount + (1:eventCount);
            cache.Intervals(candidates.CellId(uncachedRows(listIndex))) = ...
                compressSafeRuns(~blocked(sampleRows), eventTimes);
        end
    end
end
end

function [intervals, cache] = safeIntervalsAt(position_deg, workspace, ...
        eventTimes, options, cache, cellId, lattice)
if ~isempty(cache.FreeCell) && cellId <= lattice.LatticeCellCount
    intervals = lookupIntervals(cache, cellId, lattice, eventTimes);
    return;
end
if isKey(cache.Intervals, cellId)
    intervals = cache.Intervals(cellId);
    return;
end
blocked = queryAzElTimeObstacle(workspace, ...
    repmat(position_deg(1), numel(eventTimes), 1), ...
    repmat(position_deg(2), numel(eventTimes), 1), ...
    eventTimes, collisionOptions(options));
cache.QueryCount = cache.QueryCount + numel(eventTimes);
intervals = compressSafeRuns(~blocked(:), eventTimes);
cache.Intervals(cellId) = intervals;
end

function intervals = compressSafeRuns(safeMask, eventTimes)
% Run-length compression is the core SIPP reduction: consecutive safe event
% samples become one continuous interval a node can wait inside.
edges = diff([false; safeMask(:); false]);
runStart = find(edges == 1);
runStop = find(edges == -1) - 1;
intervals = [eventTimes(runStart), eventTimes(runStop)];
end

function index = containingInterval(intervals, time_s)
index = find(time_s >= intervals(:, 1) - 1e-9 & ...
    time_s <= intervals(:, 2) + 1e-9, 1);
if isempty(index)
    index = 0;
end
end

function proposals = gatherEdgeProposals(candidates, templates, ...
        currentPosition, currentArrival, currentSafe, goalState, ...
        goalIntervalIndex, hasTerminalDynamics, cache, lattice, ...
        limits, options, bestNode, nodes, eventTimes)
% Flatten every (candidate, interval) pair whose departure window is
% nonempty and whose best-case arrival is not already dominated. The window
% is exactly the departure set keeping both endpoint occupancies safe:
%   depart within the current interval, arrive within the candidate's.
capacity = 4 * max(1, candidates.Count);
proposals = struct( ...
    "Position_deg", zeros(capacity, 2), ...
    "Delta_deg", zeros(capacity, 2), ...
    "Duration_s", zeros(capacity, 1), ...
    "PeakRate", zeros(capacity, 1), ...
    "Acceleration", zeros(capacity, 1), ...
    "AccelerationTime_s", zeros(capacity, 1), ...
    "CruiseTime_s", zeros(capacity, 1), ...
    "WindowLow_s", zeros(capacity, 1), ...
    "WindowHigh_s", zeros(capacity, 1), ...
    "StateKey", zeros(capacity, 1), ...
    "Heuristic_s", zeros(capacity, 1), ...
    "TemplateIndex", zeros(capacity, 1));
count = 0;
if ~isempty(cache.FreeCell)
    % Static fast path: one interval per cell means one proposal per free
    % candidate, and every window/dominance test vectorizes over rows.
    proposals = gatherStaticProposals(candidates, templates, ...
        currentPosition, currentArrival, currentSafe, goalState, ...
        goalIntervalIndex, hasTerminalDynamics, cache, lattice, ...
        limits, options, bestNode, nodes, eventTimes, proposals);
    return;
end
for candidateRow = 1:candidates.Count
    isGoalCandidate = candidateRow == candidates.GoalRow;
    if isGoalCandidate && hasTerminalDynamics
        continue;   % the goal is reached only through the capture edge
    end
    candidatePosition = candidates.Position_deg(candidateRow, :);
    templateIndex = candidates.TemplateIndex(candidateRow);
    if templateIndex > 0
        delta = [templates.DeltaAz_deg(templateIndex), ...
            templates.DeltaEl_deg(templateIndex)];
        slewDuration_s = templates.Duration_s(templateIndex);
        peakRate = templates.PeakRate(templateIndex);
        accelerationScale = templates.Acceleration(templateIndex);
        accelerationTime_s = templates.AccelerationTime_s(templateIndex);
        cruiseTime_s = templates.CruiseTime_s(templateIndex);
    else
        delta = wrappedDelta(currentPosition, candidatePosition, ...
            limits, options);
        [slewDuration_s, motion] = segmentMotion(delta, limits);
        peakRate = motion.PeakRate;
        accelerationScale = motion.Acceleration;
        accelerationTime_s = motion.AccelerationTime;
        cruiseTime_s = motion.CruiseTime;
    end
    if slewDuration_s <= 1e-12
        continue;
    end
    goalDelta = wrappedDelta(candidatePosition, ...
        goalState.position_deg, limits, options);
    heuristic_s = minimumSlewTime(goalDelta(1), goalDelta(2), limits, ...
        hasTerminalDynamics);
    candidateIntervals = lookupIntervals(cache, ...
        candidates.CellId(candidateRow), lattice, eventTimes);
    for intervalIndex = 1:size(candidateIntervals, 1)
        if isGoalCandidate && intervalIndex ~= goalIntervalIndex
            continue;
        end
        windowLow_s = max(currentArrival, ...
            candidateIntervals(intervalIndex, 1) - slewDuration_s);
        windowHigh_s = min(currentSafe(2), ...
            candidateIntervals(intervalIndex, 2) - slewDuration_s);
        if windowHigh_s < windowLow_s - 1e-9
            continue;
        end
        bestCaseArrival_s = windowLow_s + slewDuration_s;
        if bestCaseArrival_s + heuristic_s > goalState.time_s + 1e-9
            continue;
        end
        key = stateKey(candidates.CellId(candidateRow), intervalIndex, ...
            lattice);
        % Later departures only arrive later, so a state already reached
        % at or before the best-case arrival can never be improved here.
        existingLabel = labelGet(bestNode, key);
        if existingLabel > 0 && bestCaseArrival_s >= ...
                nodes.ArrivalTime_s(existingLabel) - 1e-9
            continue;
        end
        count = count + 1;
        if count > capacity
            proposals = growProposals(proposals);
            capacity = 2 * capacity;
        end
        proposals.Position_deg(count, :) = candidatePosition;
        proposals.Delta_deg(count, :) = delta;
        proposals.Duration_s(count) = slewDuration_s;
        proposals.PeakRate(count) = peakRate;
        proposals.Acceleration(count) = accelerationScale;
        proposals.AccelerationTime_s(count) = accelerationTime_s;
        proposals.CruiseTime_s(count) = cruiseTime_s;
        proposals.WindowLow_s(count) = windowLow_s;
        proposals.WindowHigh_s(count) = windowHigh_s;
        proposals.StateKey(count) = key;
        proposals.Heuristic_s(count) = heuristic_s;
        proposals.TemplateIndex(count) = templateIndex;
    end
end
proposals = trimProposals(proposals, count);
end

function proposals = gatherStaticProposals(candidates, templates, ...
        currentPosition, currentArrival, currentSafe, goalState, ...
        goalIntervalIndex, hasTerminalDynamics, cache, lattice, ...
        limits, options, bestNode, nodes, eventTimes, proposals)
% Vectorized proposal builder for static workspaces: every free cell has
% the single interval [t0, tEnd], so windows, deadline pruning, and label
% dominance reduce to array expressions over the candidate rows.
rowCount = candidates.Count;
if rowCount == 0
    proposals = trimProposals(proposals, 0);
    return;
end
rows = (1:rowCount).';
templateRows = candidates.TemplateIndex(rows);
isTemplate = templateRows > 0;
deltaAz = zeros(rowCount, 1);
deltaEl = zeros(rowCount, 1);
duration_s = zeros(rowCount, 1);
peakRate = zeros(rowCount, 1);
accelerationScale = zeros(rowCount, 1);
accelerationTime_s = zeros(rowCount, 1);
cruiseTime_s = zeros(rowCount, 1);
deltaAz(isTemplate) = templates.DeltaAz_deg(templateRows(isTemplate));
deltaEl(isTemplate) = templates.DeltaEl_deg(templateRows(isTemplate));
duration_s(isTemplate) = templates.Duration_s(templateRows(isTemplate));
peakRate(isTemplate) = templates.PeakRate(templateRows(isTemplate));
accelerationScale(isTemplate) = ...
    templates.Acceleration(templateRows(isTemplate));
accelerationTime_s(isTemplate) = ...
    templates.AccelerationTime_s(templateRows(isTemplate));
cruiseTime_s(isTemplate) = templates.CruiseTime_s(templateRows(isTemplate));
for row = reshape(find(~isTemplate), 1, [])
    delta = wrappedDelta(currentPosition, ...
        candidates.Position_deg(row, :), limits, options);
    [duration_s(row), motion] = segmentMotion(delta, limits);
    deltaAz(row) = delta(1);
    deltaEl(row) = delta(2);
    peakRate(row) = motion.PeakRate;
    accelerationScale(row) = motion.Acceleration;
    accelerationTime_s(row) = motion.AccelerationTime;
    cruiseTime_s(row) = motion.CruiseTime;
end

cellIds = candidates.CellId(rows);
cellFree = false(rowCount, 1);
latticeRows = cellIds <= lattice.LatticeCellCount;
cellFree(latticeRows) = cache.FreeCell(cellIds(latticeRows));
for row = reshape(find(~latticeRows), 1, [])
    reservedIntervals = cache.Intervals(cellIds(row));
    cellFree(row) = ~isempty(reservedIntervals);
end
keep = cellFree & duration_s > 1e-12;
if hasTerminalDynamics && candidates.GoalRow > 0
    keep(candidates.GoalRow) = false;   % capture edge owns the goal
end

horizonEnd_s = eventTimes(end);
windowLow_s = repmat(currentArrival, rowCount, 1);
windowHigh_s = min(currentSafe(2), horizonEnd_s - duration_s);
bestCaseArrival_s = windowLow_s + duration_s;
goalDeltaAz = candidates.Position_deg(rows, 1) - ...
    goalState.position_deg(1);
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    goalDeltaAz = mod(goalDeltaAz + span / 2, span) - span / 2;
end
heuristic_s = minimumSlewTime(goalDeltaAz, ...
    candidates.Position_deg(rows, 2) - goalState.position_deg(2), ...
    limits, hasTerminalDynamics);
keep = keep & windowHigh_s >= windowLow_s - 1e-9 & ...
    bestCaseArrival_s + heuristic_s <= goalState.time_s + 1e-9;

stateKeys = cellIds;   % static: the single interval always has index 1
if bestNode.UseArray
    existingLabels = zeros(rowCount, 1);
    existingLabels(keep) = bestNode.Index(stateKeys(keep));
    dominated = existingLabels > 0;
    dominated(dominated) = bestCaseArrival_s(dominated) >= ...
        nodes.ArrivalTime_s(existingLabels(dominated)) - 1e-9;
    keep = keep & ~dominated;
else
    for row = reshape(find(keep), 1, [])
        existingLabel = labelGet(bestNode, stateKeys(row));
        if existingLabel > 0 && bestCaseArrival_s(row) >= ...
                nodes.ArrivalTime_s(existingLabel) - 1e-9
            keep(row) = false;
        end
    end
end

kept = find(keep);
count = numel(kept);
while count > numel(proposals.Duration_s)
    proposals = growProposals(proposals);
end
proposals.Position_deg(1:count, :) = candidates.Position_deg(kept, :);
proposals.Delta_deg(1:count, :) = [deltaAz(kept), deltaEl(kept)];
proposals.Duration_s(1:count) = duration_s(kept);
proposals.PeakRate(1:count) = peakRate(kept);
proposals.Acceleration(1:count) = accelerationScale(kept);
proposals.AccelerationTime_s(1:count) = accelerationTime_s(kept);
proposals.CruiseTime_s(1:count) = cruiseTime_s(kept);
proposals.WindowLow_s(1:count) = windowLow_s(kept);
proposals.WindowHigh_s(1:count) = windowHigh_s(kept);
proposals.StateKey(1:count) = stateKeys(kept);
proposals.Heuristic_s(1:count) = heuristic_s(kept);
proposals.TemplateIndex(1:count) = templateRows(kept);
proposals = trimProposals(proposals, count);
end

function proposals = growProposals(proposals)
names = fieldnames(proposals);
for nameIndex = 1:numel(names)
    values = proposals.(names{nameIndex});
    proposals.(names{nameIndex}) = [values; zeros(size(values))];
end
end

function proposals = trimProposals(proposals, count)
names = fieldnames(proposals);
for nameIndex = 1:numel(names)
    values = proposals.(names{nameIndex});
    proposals.(names{nameIndex}) = values(1:count, :);
end
end

function free = staticEdgeCheck(workspace, currentPosition, currentKey, ...
        proposals, templates, cache, lattice, limits, options, ...
        missionTime_s)
% Static freeness is time-invariant, so lattice edges pass when the mask
% clears every interior cell the slew crosses (endpoints are already known
% free). The exact goal edge is confirmed against the packed polygons only
% after a cheap mask walk along the segment survives.
proposalCount = numel(proposals.Duration_s);
free = false(proposalCount, 1);
currentCellId = keyCellId(currentKey, lattice);
currentIsLattice = currentCellId <= lattice.LatticeCellCount;
if currentIsLattice
    currentAzimuthIndex = mod(currentCellId - 1, lattice.AzimuthBinCount);
    currentElevationIndex = floor((currentCellId - 1) / ...
        lattice.AzimuthBinCount);
end
for proposalIndex = 1:proposalCount
    templateIndex = proposals.TemplateIndex(proposalIndex);
    if templateIndex > 0 && currentIsLattice
        crossedAzimuth = currentAzimuthIndex + ...
            templates.CrossedAzimuthSteps{templateIndex};
        crossedElevation = currentElevationIndex + ...
            templates.CrossedElevationSteps{templateIndex};
        if lattice.Wrap
            crossedAzimuth = mod(crossedAzimuth, lattice.AzimuthBinCount);
        end
        insideLattice = crossedElevation >= 0 & ...
            crossedElevation < lattice.ElevationBinCount & ...
            crossedAzimuth >= 0 & crossedAzimuth < lattice.AzimuthBinCount;
        if ~all(insideLattice)
            continue;
        end
        crossedCells = crossedElevation * lattice.AzimuthBinCount + ...
            crossedAzimuth + 1;
        free(proposalIndex) = all(cache.FreeCell(crossedCells));
    else
        % Off-template segment (goal edge or off-lattice start): mask walk
        % first, then an exact sampled confirmation of the swept motion.
        delta = proposals.Delta_deg(proposalIndex, :);
        if ~maskSegmentIsFree(currentPosition, delta, cache, lattice)
            continue;
        end
        motion = struct( ...
            "PeakRate", proposals.PeakRate(proposalIndex), ...
            "Acceleration", proposals.Acceleration(proposalIndex), ...
            "AccelerationTime", ...
                proposals.AccelerationTime_s(proposalIndex), ...
            "CruiseTime", proposals.CruiseTime_s(proposalIndex));
        free(proposalIndex) = directSlewIsFree(workspace, ...
            currentPosition, delta, ...
            proposals.WindowLow_s(proposalIndex), ...
            proposals.Duration_s(proposalIndex), motion, true, ...
            missionTime_s, limits, options);
    end
end
end

function segmentFree = maskSegmentIsFree(fromPosition, delta, cache, ...
        lattice)
% Nearest-cell walk along the segment in index space; blocked mask cells
% reject the segment before any polygon query is spent on it.
azimuthSpan = delta(1) / lattice.AzimuthStep_deg;
elevationSpan = delta(2) / lattice.ElevationStep_deg;
sampleCount = 2 * ceil(max(abs([azimuthSpan, elevationSpan]))) + 2;
lineFraction = linspace(0, 1, sampleCount).';
azimuthIndex = round((fromPosition(1) - lattice.AzimuthOrigin_deg) / ...
    lattice.AzimuthStep_deg + lineFraction * azimuthSpan);
elevationIndex = round((fromPosition(2) - lattice.ElevationOrigin_deg) / ...
    lattice.ElevationStep_deg + lineFraction * elevationSpan);
if lattice.Wrap
    azimuthIndex = mod(azimuthIndex, lattice.AzimuthBinCount);
end
insideLattice = elevationIndex >= 0 & ...
    elevationIndex < lattice.ElevationBinCount & ...
    azimuthIndex >= 0 & azimuthIndex < lattice.AzimuthBinCount;
cells = elevationIndex(insideLattice) * lattice.AzimuthBinCount + ...
    azimuthIndex(insideLattice) + 1;
segmentFree = all(cache.FreeCell(cells));
end

function free = batchedSlewCheck(workspace, currentPosition, proposals, ...
        missionOrigin_s, limits, options)
% Sample every proposal's earliest-departure motion and resolve them all in
% one packed-polygon query. Moving volumes are sampled in time plus
% mission-aligned instants so an obstacle cannot slip between the
% validation grids of consecutive edges.
proposalCount = numel(proposals.Duration_s);
sampleTau = cell(proposalCount, 1);
for proposalIndex = 1:proposalCount
    duration_s = proposals.Duration_s(proposalIndex);
    sampleCount = max(2, ceil(duration_s / ...
        options.CollisionCheckStep_s) + 1);
    departure_s = proposals.WindowLow_s(proposalIndex);
    aligned = [gridAlignedTimes(departure_s, ...
        departure_s + duration_s, options.ValidationStep_s, ...
        missionOrigin_s); gridAlignedTimes(departure_s, ...
        departure_s + duration_s, options.SampleTime_s, ...
        missionOrigin_s)];
    sampleTau{proposalIndex} = unique( ...
        [linspace(0, duration_s, sampleCount).'; ...
        aligned - departure_s]);
end
sampleOwner = reshape(repelem((1:proposalCount).', ...
    cellfun(@numel, sampleTau)), [], 1);
tauFlat = vertcat(sampleTau{:});
progress = zeros(size(tauFlat));
for proposalIndex = 1:proposalCount
    rows = sampleOwner == proposalIndex;
    progress(rows) = segmentProgress(tauFlat(rows), ...
        proposals.Duration_s(proposalIndex), struct( ...
        "PeakRate", proposals.PeakRate(proposalIndex), ...
        "Acceleration", proposals.Acceleration(proposalIndex), ...
        "AccelerationTime", proposals.AccelerationTime_s(proposalIndex), ...
        "CruiseTime", proposals.CruiseTime_s(proposalIndex)));
end
unwrappedAzimuth = currentPosition(1) + ...
    progress .* proposals.Delta_deg(sampleOwner, 1);
queryElevation = currentPosition(2) + ...
    progress .* proposals.Delta_deg(sampleOwner, 2);
queryTime_s = proposals.WindowLow_s(sampleOwner) + tauFlat;
blocked = queryAzElTimeObstacle(workspace, ...
    canonicalAzimuth(unwrappedAzimuth, limits, options), ...
    queryElevation, queryTime_s, collisionOptions(options));
free = true(proposalCount, 1);
free(unique(sampleOwner(blocked))) = false;
end

function departure_s = laterDepartureFallback(workspace, ...
        currentPosition, proposals, proposalIndex, eventTimes, ...
        limits, options)
% The earliest departure was blocked mid-slew; retry the remaining trial
% departures (obstacle event times inside the window, then the window end)
% in one vectorized sweep and keep the earliest collision-free one.
departure_s = NaN;
windowLow_s = proposals.WindowLow_s(proposalIndex);
windowHigh_s = proposals.WindowHigh_s(proposalIndex);
if windowHigh_s <= windowLow_s + 1e-9
    return;
end
insideWindow = eventTimes(eventTimes > windowLow_s + 1e-9 & ...
    eventTimes < windowHigh_s - 1e-9);
trialDepartures = unique([insideWindow; windowHigh_s]);
if numel(trialDepartures) > options.MaximumDepartureTrials
    keep = unique(round(linspace(1, numel(trialDepartures), ...
        options.MaximumDepartureTrials)));
    trialDepartures = trialDepartures(keep);
end
duration_s = proposals.Duration_s(proposalIndex);
motion = struct( ...
    "PeakRate", proposals.PeakRate(proposalIndex), ...
    "Acceleration", proposals.Acceleration(proposalIndex), ...
    "AccelerationTime", proposals.AccelerationTime_s(proposalIndex), ...
    "CruiseTime", proposals.CruiseTime_s(proposalIndex));
sampleCount = max(2, ceil(duration_s / options.CollisionCheckStep_s) + 1);
baseTau_s = linspace(0, duration_s, sampleCount).';
trialTau = cell(numel(trialDepartures), 1);
for trialIndex = 1:numel(trialDepartures)
    aligned = [gridAlignedTimes(trialDepartures(trialIndex), ...
        trialDepartures(trialIndex) + duration_s, ...
        options.ValidationStep_s, eventTimes(1)); ...
        gridAlignedTimes(trialDepartures(trialIndex), ...
        trialDepartures(trialIndex) + duration_s, ...
        options.SampleTime_s, eventTimes(1))];
    trialTau{trialIndex} = unique([baseTau_s; ...
        aligned - trialDepartures(trialIndex)]);
end
sampleOwner = reshape(repelem((1:numel(trialDepartures)).', ...
    cellfun(@numel, trialTau)), [], 1);
tauFlat = vertcat(trialTau{:});
progress = segmentProgress(tauFlat, duration_s, motion);
unwrappedAzimuth = currentPosition(1) + ...
    progress * proposals.Delta_deg(proposalIndex, 1);
queryElevation = currentPosition(2) + ...
    progress * proposals.Delta_deg(proposalIndex, 2);
blocked = queryAzElTimeObstacle(workspace, ...
    canonicalAzimuth(unwrappedAzimuth, limits, options), ...
    queryElevation, trialDepartures(sampleOwner) + tauFlat, ...
    collisionOptions(options));
trialIsFree = true(numel(trialDepartures), 1);
trialIsFree(unique(sampleOwner(blocked))) = false;
firstFree = find(trialIsFree, 1);
if ~isempty(firstFree)
    departure_s = trialDepartures(firstFree);
end
end

function times = gridAlignedTimes(first_s, last_s, step_s, origin_s)
firstIndex = ceil((first_s - origin_s) / step_s - 1e-10);
lastIndex = floor((last_s - origin_s) / step_s + 1e-10);
if lastIndex < firstIndex
    times = zeros(0, 1);
else
    times = origin_s + (firstIndex:lastIndex).' * step_s;
end
end

function [scheduled, departure_s, arrival_s, captureDuration_s] = ...
        scheduleTerminalCapture(workspace, fromPosition, ...
        earliestDeparture_s, fromSafe, goalState, eventTimes, ...
        limits, options)
% Arrival is pinned to the rendezvous time, so departure time is the free
% variable: it sets the quintic duration and therefore every dynamic
% extremum along the capture edge.
scheduled = false;
departure_s = NaN;
arrival_s = NaN;
captureDuration_s = NaN;
windowLow_s = max(earliestDeparture_s, fromSafe(1));
windowHigh_s = min(fromSafe(2), goalState.time_s - 1e-6);
if windowHigh_s < windowLow_s
    return;
end
insideWindow = eventTimes(eventTimes >= windowLow_s & ...
    eventTimes <= windowHigh_s);
uniformTrials = linspace(windowLow_s, windowHigh_s, ...
    min(options.MaximumDepartureTrials, 16)).';
trialDepartures = unique([windowLow_s; insideWindow; uniformTrials; ...
    windowHigh_s]);
if numel(trialDepartures) > options.MaximumDepartureTrials
    keep = unique(round(linspace(1, numel(trialDepartures), ...
        options.MaximumDepartureTrials)));
    trialDepartures = trialDepartures(keep);
end
delta = wrappedDelta(fromPosition, goalState.position_deg, limits, options);
for trialIndex = 1:numel(trialDepartures)
    trialDuration_s = goalState.time_s - trialDepartures(trialIndex);
    if captureEdgeIsFree(workspace, fromPosition, ...
            fromPosition + delta, trialDepartures(trialIndex), ...
            trialDuration_s, goalState, limits, options)
        scheduled = true;
        departure_s = trialDepartures(trialIndex);
        arrival_s = goalState.time_s;
        captureDuration_s = trialDuration_s;
        return;
    end
end
end

function free = captureEdgeIsFree(workspace, fromPosition, ...
        unwrappedGoal, departure_s, duration_s, goalState, limits, options)
free = false;
if duration_s <= 0 || ...
        any(abs(goalState.velocity_deg_s) > ...
        limits.maxVelocity_deg_s + 1e-9) || ...
        any(abs(goalState.acceleration_deg_s2) > ...
        limits.maxAcceleration_deg_s2 + 1e-9)
    return;
end
sampleStep_s = min(options.CollisionCheckStep_s, options.ValidationStep_s);
sampleCount = max(21, ceil(duration_s / sampleStep_s) + 1);
tau_s = linspace(0, duration_s, sampleCount).';
capture = evaluateQuinticProfile(fromPosition, [0 0], [0 0], ...
    unwrappedGoal, goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2, duration_s, tau_s);
% The quintic matches all six boundary conditions exactly; sampling then
% rejects any rate, acceleration, bounds, or obstacle violation inside.
if any(any(abs(capture.velocity_deg_s) > ...
        limits.maxVelocity_deg_s + 1e-9)) || ...
        any(any(abs(capture.acceleration_deg_s2) > ...
        limits.maxAcceleration_deg_s2 + 1e-9))
    return;
end
inBounds = capture.position_deg(:, 2) >= limits.elevation_deg(1) - 1e-9 & ...
    capture.position_deg(:, 2) <= limits.elevation_deg(2) + 1e-9;
if ~options.AllowAzimuthWrap
    inBounds = inBounds & ...
        capture.position_deg(:, 1) >= limits.azimuth_deg(1) - 1e-9 & ...
        capture.position_deg(:, 1) <= limits.azimuth_deg(2) + 1e-9;
end
if ~all(inBounds)
    return;
end
blocked = queryAzElTimeObstacle(workspace, ...
    canonicalAzimuth(capture.position_deg(:, 1), limits, options), ...
    capture.position_deg(:, 2), departure_s + tau_s, ...
    collisionOptions(options));
free = ~any(blocked);
end

function route = extractRoute(nodes, goalNodeIndex, initialState, ...
        goalState, limits, options)
nodePath = zeros(64, 1);
count = 0;
walkIndex = goalNodeIndex;
while walkIndex ~= 0
    count = count + 1;
    if count > numel(nodePath)
        nodePath(2 * numel(nodePath), 1) = 0;
    end
    nodePath(count) = walkIndex;
    walkIndex = double(nodes.ParentIndex(walkIndex));
end
nodePath = flipud(nodePath(1:count));

position = nodes.PositionDeg(nodePath, :);
arrival = nodes.ArrivalTime_s(nodePath);
departure = nan(count, 1);
duration = zeros(count, 1);
for k = 1:count - 1
    departure(k) = nodes.DepartureTime_s(nodePath(k + 1));
    duration(k) = nodes.MotionDuration_s(nodePath(k + 1));
end
departure(count) = goalState.time_s;

% The unwrapped trace keeps azimuth continuous across the seam for length
% and dynamics; the wrapped trace stays canonical for collision queries.
unwrapped = position;
unwrapped(1, :) = initialState.position_deg;
for k = 2:count
    unwrapped(k, :) = unwrapped(k - 1, :) + wrappedDelta( ...
        unwrapped(k - 1, :), position(k, :), limits, options);
end
position(:, 1) = canonicalAzimuth(unwrapped(:, 1), limits, options);
position(:, 2) = unwrapped(:, 2);
route = struct( ...
    "position_deg", position, ...
    "positionUnwrapped_deg", unwrapped, ...
    "arrivalTime_s", arrival, ...
    "departureTime_s", departure, ...
    "motionDuration_s", duration, ...
    "waitingDuration_s", max(0, departure - arrival), ...
    "hasTerminalCapture", nodes.IsTerminalCapture(goalNodeIndex), ...
    "terminalVelocity_deg_s", goalState.velocity_deg_s, ...
    "terminalAcceleration_deg_s2", goalState.acceleration_deg_s2, ...
    "shortcutBypassCount", 0, ...
    "angularPathLength_deg", sum(hypot(diff(unwrapped(:, 1)), ...
        diff(unwrapped(:, 2)))));
end

function route = shortcutSpaceTimeRoute(workspace, route, limits, ...
        options, workspaceIsStatic, staticFreeCellMask, lattice)
% Replace waypoint chains with one direct slew wherever the exact query
% allows it. Departing as late as possible reproduces the bypassed node's
% recorded departure time, so downstream scheduling is untouched; waiting
% moves to the bypass origin and is re-validated there explicitly. Deltas
% use the unwrapped trace so the bypass preserves the route's winding.
nodeCount = size(route.positionUnwrapped_deg, 1);
lastBypassableNode = nodeCount;
if route.hasTerminalCapture
    lastBypassableNode = nodeCount - 1;   % never rebuild the quintic edge
end
bypassCount = 0;
anchor = 1;
while anchor <= lastBypassableNode - 2
    accepted = false;
    for target = lastBypassableNode:-1:anchor + 2
        delta = route.positionUnwrapped_deg(target, :) - ...
            route.positionUnwrapped_deg(anchor, :);
        % Cheap static rejection first: a bypass whose nearest-cell walk
        % touches a blocked mask cell can never pass the exact check.
        if workspaceIsStatic && ~maskSegmentIsFree( ...
                route.positionUnwrapped_deg(anchor, :), delta, ...
                struct("FreeCell", staticFreeCellMask), lattice)
            continue;
        end
        [slewDuration_s, motion] = segmentMotion(delta, limits);
        latestDeparture_s = route.departureTime_s(target) - slewDuration_s;
        if latestDeparture_s < route.arrivalTime_s(anchor) - 1e-9
            continue;
        end
        % Holding at a route node is trivially safe in a static workspace;
        % moving workspaces must re-validate the longer wait explicitly.
        if ~workspaceIsStatic && ~stationaryHoldIsFree(workspace, ...
                route.position_deg(anchor, :), ...
                route.arrivalTime_s(anchor), latestDeparture_s, options)
            continue;
        end
        if slewDuration_s > 1e-12 && ~directSlewIsFree(workspace, ...
                route.positionUnwrapped_deg(anchor, :), delta, ...
                latestDeparture_s, slewDuration_s, motion, ...
                workspaceIsStatic, route.arrivalTime_s(1), limits, options)
            continue;
        end
        keep = [1:anchor, target:nodeCount];
        route.positionUnwrapped_deg = route.positionUnwrapped_deg(keep, :);
        route.position_deg = route.position_deg(keep, :);
        route.arrivalTime_s = route.arrivalTime_s(keep);
        route.departureTime_s = route.departureTime_s(keep);
        route.motionDuration_s = route.motionDuration_s(keep);
        route.departureTime_s(anchor) = latestDeparture_s;
        route.motionDuration_s(anchor) = slewDuration_s;
        route.arrivalTime_s(anchor + 1) = route.departureTime_s(anchor) + ...
            slewDuration_s;
        removedCount = target - anchor - 1;
        nodeCount = nodeCount - removedCount;
        lastBypassableNode = lastBypassableNode - removedCount;
        bypassCount = bypassCount + 1;
        accepted = true;
        break;
    end
    if ~accepted
        anchor = anchor + 1;
    end
end
route.waitingDuration_s = max(0, ...
    route.departureTime_s - route.arrivalTime_s);
route.shortcutBypassCount = bypassCount;
route.angularPathLength_deg = sum(hypot( ...
    diff(route.positionUnwrapped_deg(:, 1)), ...
    diff(route.positionUnwrapped_deg(:, 2))));
end

function free = directSlewIsFree(workspace, fromUnwrapped, delta, ...
        departure_s, duration_s, motion, workspaceIsStatic, ...
        missionOrigin_s, limits, options)
if workspaceIsStatic
    sampleCount = max(3, ceil(1.5 * hypot(delta(1), delta(2)) / ...
        options.RouteShortcutStep_deg) + 1);
    tau_s = linspace(0, duration_s, sampleCount).';
else
    sampleCount = max(2, ceil(duration_s / ...
        options.CollisionCheckStep_s) + 1);
    aligned = [gridAlignedTimes(departure_s, departure_s + duration_s, ...
        options.ValidationStep_s, missionOrigin_s); ...
        gridAlignedTimes(departure_s, departure_s + duration_s, ...
        options.SampleTime_s, missionOrigin_s)];
    tau_s = unique([linspace(0, duration_s, sampleCount).'; ...
        aligned - departure_s]);
end
progress = segmentProgress(tau_s, duration_s, motion);
blocked = queryAzElTimeObstacle(workspace, ...
    canonicalAzimuth(fromUnwrapped(1) + progress * delta(1), ...
    limits, options), fromUnwrapped(2) + progress * delta(2), ...
    departure_s + tau_s, collisionOptions(options));
free = ~any(blocked);
end

function free = stationaryHoldIsFree(workspace, position_deg, ...
        holdStart_s, holdStop_s, options)
if holdStop_s <= holdStart_s + 1e-9
    free = true;
    return;
end
sampleCount = max(2, ceil((holdStop_s - holdStart_s) / ...
    options.SampleTime_s) + 1);
holdTimes_s = linspace(holdStart_s, holdStop_s, sampleCount).';
blocked = queryAzElTimeObstacle(workspace, ...
    repmat(position_deg(1), sampleCount, 1), ...
    repmat(position_deg(2), sampleCount, 1), ...
    holdTimes_s, collisionOptions(options));
free = ~any(blocked);
end

function profile = makeSafeIntervalProfile(route, startTime_s, ...
        stopTime_s, sampleStep_s, limits, options)
time_s = (startTime_s:sampleStep_s:stopTime_s).';
if time_s(end) < stopTime_s - 1e-9
    time_s(end + 1, 1) = stopTime_s;
else
    time_s(end) = stopTime_s;
end
sampleCount = numel(time_s);
unwrapped = repmat(route.positionUnwrapped_deg(1, :), sampleCount, 1);
velocity = zeros(sampleCount, 2);
acceleration = zeros(sampleCount, 2);
% Waiting falls out by holding the most recently reached node; each edge
% then overwrites only the samples inside its own motion window.
for node = 2:size(route.positionUnwrapped_deg, 1)
    reached = time_s >= route.arrivalTime_s(node) - 1e-10;
    unwrapped(reached, :) = repmat( ...
        route.positionUnwrapped_deg(node, :), nnz(reached), 1);
end
for edge = 1:size(route.positionUnwrapped_deg, 1) - 1
    departure_s = route.departureTime_s(edge);
    duration_s = route.motionDuration_s(edge);
    moving = time_s >= departure_s - 1e-10 & ...
        time_s <= departure_s + duration_s + 1e-10;
    if ~any(moving)
        continue;
    end
    tau_s = min(max(time_s(moving) - departure_s, 0), duration_s);
    delta = route.positionUnwrapped_deg(edge + 1, :) - ...
        route.positionUnwrapped_deg(edge, :);
    if route.hasTerminalCapture && ...
            edge == size(route.positionUnwrapped_deg, 1) - 1
        capture = evaluateQuinticProfile( ...
            route.positionUnwrapped_deg(edge, :), [0 0], [0 0], ...
            route.positionUnwrapped_deg(edge + 1, :), ...
            route.terminalVelocity_deg_s, ...
            route.terminalAcceleration_deg_s2, duration_s, tau_s);
        unwrapped(moving, :) = capture.position_deg;
        velocity(moving, :) = capture.velocity_deg_s;
        acceleration(moving, :) = capture.acceleration_deg_s2;
    else
        [~, motion] = segmentMotion(delta, limits);
        [progress, rate, accelerationScale] = segmentProgress( ...
            tau_s, duration_s, motion);
        unwrapped(moving, :) = route.positionUnwrapped_deg(edge, :) + ...
            progress * delta;
        velocity(moving, :) = rate * delta;
        acceleration(moving, :) = accelerationScale * delta;
    end
end
position = unwrapped;
position(:, 1) = canonicalAzimuth(position(:, 1), limits, options);
velocity(1, :) = 0;
acceleration(1, :) = 0;
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position, ...
    "positionUnwrapped_deg", unwrapped, ...
    "velocity_deg_s", velocity, ...
    "acceleration_deg_s2", acceleration, ...
    "isWaiting", all(abs(velocity) <= 1e-10, 2) & ...
        all(abs(acceleration) <= 1e-10, 2));
end

function [duration_s, motion] = segmentMotion(delta, limits)
% Both axes follow one normalized trapezoidal progress law; taking the most
% restrictive normalized limit keeps each physical axis inside its bounds.
absoluteDelta = abs(delta);
active = absoluteDelta > 1e-12;
if ~any(active)
    duration_s = 0;
    motion = struct("PeakRate", 0, "Acceleration", 1, ...
        "AccelerationTime", 0, "CruiseTime", 0);
    return;
end
rateLimit = min(limits.maxVelocity_deg_s(active) ./ ...
    absoluteDelta(active));
accelerationLimit = min(limits.maxAcceleration_deg_s2(active) ./ ...
    absoluteDelta(active));
if rateLimit^2 / accelerationLimit >= 1
    accelerationTime_s = sqrt(1 / accelerationLimit);
    peakRate = sqrt(accelerationLimit);
    cruiseTime_s = 0;
else
    accelerationTime_s = rateLimit / accelerationLimit;
    peakRate = rateLimit;
    cruiseTime_s = (1 - accelerationLimit * accelerationTime_s^2) / ...
        peakRate;
end
duration_s = 2 * accelerationTime_s + cruiseTime_s;
motion = struct("PeakRate", peakRate, "Acceleration", accelerationLimit, ...
    "AccelerationTime", accelerationTime_s, "CruiseTime", cruiseTime_s);
end

function [progress, rate, acceleration] = segmentProgress( ...
        tau_s, duration_s, motion)
progress = zeros(size(tau_s));
rate = zeros(size(tau_s));
acceleration = zeros(size(tau_s));
accelerationEnd_s = motion.AccelerationTime;
cruiseEnd_s = accelerationEnd_s + motion.CruiseTime;
accelerating = tau_s > 0 & tau_s < accelerationEnd_s;
progress(accelerating) = 0.5 * motion.Acceleration .* ...
    tau_s(accelerating).^2;
rate(accelerating) = motion.Acceleration .* tau_s(accelerating);
acceleration(accelerating) = motion.Acceleration;
cruising = tau_s >= accelerationEnd_s & tau_s < cruiseEnd_s;
progress(cruising) = 0.5 * motion.Acceleration * accelerationEnd_s^2 + ...
    motion.PeakRate .* (tau_s(cruising) - accelerationEnd_s);
rate(cruising) = motion.PeakRate;
decelerating = tau_s >= cruiseEnd_s & tau_s < duration_s;
remaining_s = duration_s - tau_s(decelerating);
progress(decelerating) = 1 - 0.5 * motion.Acceleration .* remaining_s.^2;
rate(decelerating) = motion.Acceleration .* remaining_s;
acceleration(decelerating) = -motion.Acceleration;
progress(tau_s >= duration_s) = 1;
end

function capture = evaluateQuinticProfile(initialPosition, ...
        initialVelocity, initialAcceleration, goalPosition, ...
        goalVelocity, goalAcceleration, duration_s, tau_s)
% Quintic with all six boundary conditions per axis, in normalized time.
coefficient = zeros(6, 2);
coefficient(1, :) = initialPosition;
coefficient(2, :) = duration_s * initialVelocity;
coefficient(3, :) = 0.5 * duration_s^2 * initialAcceleration;
boundary = [goalPosition - sum(coefficient(1:3, :), 1); ...
    duration_s * goalVelocity - coefficient(2, :) - 2 * coefficient(3, :); ...
    duration_s^2 * goalAcceleration - 2 * coefficient(3, :)];
coefficient(4:6, :) = [1 1 1; 3 4 5; 6 12 20] \ boundary;
normalizedTime = tau_s(:) / duration_s;
positionBasis = [ones(size(normalizedTime)), normalizedTime, ...
    normalizedTime.^2, normalizedTime.^3, normalizedTime.^4, ...
    normalizedTime.^5];
velocityBasis = [zeros(size(normalizedTime)), ...
    ones(size(normalizedTime)), 2 * normalizedTime, ...
    3 * normalizedTime.^2, 4 * normalizedTime.^3, ...
    5 * normalizedTime.^4] / duration_s;
accelerationBasis = [zeros(size(normalizedTime)), ...
    zeros(size(normalizedTime)), 2 * ones(size(normalizedTime)), ...
    6 * normalizedTime, 12 * normalizedTime.^2, ...
    20 * normalizedTime.^3] / duration_s^2;
capture = struct( ...
    "position_deg", positionBasis * coefficient, ...
    "velocity_deg_s", velocityBasis * coefficient, ...
    "acceleration_deg_s2", accelerationBasis * coefficient);
end

function heuristic_s = minimumSlewTime(deltaAz_deg, deltaEl_deg, ...
        limits, hasTerminalDynamics)
% Admissible remaining-time bound: rest-to-rest slew time for fixed goals;
% the looser rate-only bound when the final edge is a quintic capture.
% Closed form of the normalized trapezoid law, vectorized over rows.
absoluteAz = abs(deltaAz_deg(:));
absoluteEl = abs(deltaEl_deg(:));
if hasTerminalDynamics
    heuristic_s = max(absoluteAz / limits.maxVelocity_deg_s(1), ...
        absoluteEl / limits.maxVelocity_deg_s(2));
    return;
end
rateScale = min(limits.maxVelocity_deg_s(1) ./ max(absoluteAz, 1e-300), ...
    limits.maxVelocity_deg_s(2) ./ max(absoluteEl, 1e-300));
accelerationScale = min( ...
    limits.maxAcceleration_deg_s2(1) ./ max(absoluteAz, 1e-300), ...
    limits.maxAcceleration_deg_s2(2) ./ max(absoluteEl, 1e-300));
triangular = rateScale.^2 ./ accelerationScale >= 1;
heuristic_s = zeros(size(absoluteAz));
heuristic_s(triangular) = 2 * sqrt(1 ./ accelerationScale(triangular));
trapezoid = ~triangular;
heuristic_s(trapezoid) = 2 * rateScale(trapezoid) ./ ...
    accelerationScale(trapezoid) + ...
    (1 - rateScale(trapezoid).^2 ./ accelerationScale(trapezoid)) ./ ...
    rateScale(trapezoid);
heuristic_s(absoluteAz + absoluteEl <= 1e-12) = 0;
end
function times = collectEventTimes(workspace, startTime_s, stopTime_s, ...
        options)
times = [startTime_s; stopTime_s];
for obstacleIndex = 1:numel(workspace.Obstacles)
    sliceTimes = double(workspace.Obstacles(obstacleIndex).TimeSeconds(:));
    times = [times; sliceTimes(sliceTimes >= startTime_s & ...
        sliceTimes <= stopTime_s)]; %#ok<AGROW>
end
times = unique(times);
if numel(times) > options.MaximumSafeIntervalSamples
    keep = unique(round(linspace(1, numel(times), ...
        options.MaximumSafeIntervalSamples)));
    times = unique([startTime_s; times(keep); stopTime_s]);
end
end

function value = collisionOptions(options)
value = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "SafetyMarginDeg", options.SafetyMargin_deg);
end

function delta = wrappedDelta(fromPosition, toPosition, limits, options)
delta = toPosition - fromPosition;
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    delta(1) = mod(delta(1) + span / 2, span) - span / 2;
end
end

function azimuth = canonicalAzimuth(azimuth, limits, options)
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    azimuth = mod(azimuth - limits.azimuth_deg(1), span) + ...
        limits.azimuth_deg(1);
end
end

function yes = samePosition(firstPosition, secondPosition, limits, options)
delta = wrappedDelta(firstPosition, secondPosition, limits, options);
yes = hypot(delta(1), delta(2)) <= 1e-9;
end

function [nodes, index] = appendNode(nodes, position, key, arrival_s, ...
        parentIndex, departure_s, duration_s, isTerminalCapture)
if nodes.Count >= size(nodes.PositionDeg, 1)
    oldCapacity = size(nodes.PositionDeg, 1);
    nodes.PositionDeg(2 * oldCapacity, 2) = 0;
    nodes.StateKey(2 * oldCapacity, 1) = 0;
    nodes.ArrivalTime_s(oldCapacity + 1:2 * oldCapacity, 1) = Inf;
    nodes.ParentIndex(2 * oldCapacity, 1) = 0;
    nodes.DepartureTime_s(oldCapacity + 1:2 * oldCapacity, 1) = NaN;
    nodes.MotionDuration_s(2 * oldCapacity, 1) = 0;
    nodes.IsTerminalCapture(2 * oldCapacity, 1) = false;
end
nodes.Count = nodes.Count + 1;
index = nodes.Count;
nodes.PositionDeg(index, :) = position;
nodes.StateKey(index) = key;
nodes.ArrivalTime_s(index) = arrival_s;
nodes.ParentIndex(index) = uint32(parentIndex);
nodes.DepartureTime_s(index) = departure_s;
nodes.MotionDuration_s(index) = duration_s;
nodes.IsTerminalCapture(index) = isTerminalCapture;
end

function store = makeLabelStore(keySpace)
% Flat-array label store when the key space fits comfortably in memory,
% hash-map fallback otherwise (huge lattice x thousands of intervals).
if keySpace <= 5e7
    store = struct("UseArray", true, "Index", zeros(keySpace, 1), ...
        "Map", []);
else
    store = struct("UseArray", false, "Index", [], ...
        "Map", containers.Map('KeyType', 'double', 'ValueType', 'double'));
end
end

function nodeIndex = labelGet(store, key)
if store.UseArray
    nodeIndex = store.Index(key);
elseif isKey(store.Map, key)
    nodeIndex = store.Map(key);
else
    nodeIndex = 0;
end
end

function store = labelSet(store, key, nodeIndex)
if store.UseArray
    store.Index(key) = nodeIndex;
else
    store.Map(key) = nodeIndex; %#ok<NASGU> handle-semantics map
end
end

function heap = makeHeap(capacity)
heap = struct( ...
    "Node", zeros(capacity, 1, "uint32"), ...
    "F", inf(capacity, 1), ...
    "H", inf(capacity, 1), ...
    "Serial", zeros(capacity, 1, "uint64"), ...
    "Count", 0, ...
    "NextSerial", uint64(0));
end

function heap = heapPush(heap, nodeIndex, f, h)
if heap.Count >= numel(heap.Node)
    oldCapacity = numel(heap.Node);
    heap.Node(2 * oldCapacity, 1) = 0;
    heap.F(oldCapacity + 1:2 * oldCapacity, 1) = Inf;
    heap.H(oldCapacity + 1:2 * oldCapacity, 1) = Inf;
    heap.Serial(2 * oldCapacity, 1) = 0;
end
heap.Count = heap.Count + 1;
heap.NextSerial = heap.NextSerial + 1;
slot = heap.Count;
heap.Node(slot) = uint32(nodeIndex);
heap.F(slot) = f;
heap.H(slot) = h;
heap.Serial(slot) = heap.NextSerial;
while slot > 1
    parentSlot = floor(slot / 2);
    if ~heapEntryIsLess(heap, slot, parentSlot)
        break;
    end
    heap = heapSwap(heap, slot, parentSlot);
    slot = parentSlot;
end
end

function [heap, nodeIndex] = heapPop(heap)
nodeIndex = double(heap.Node(1));
heap.Node(1) = heap.Node(heap.Count);
heap.F(1) = heap.F(heap.Count);
heap.H(1) = heap.H(heap.Count);
heap.Serial(1) = heap.Serial(heap.Count);
heap.Count = heap.Count - 1;
slot = 1;
while true
    leftSlot = 2 * slot;
    rightSlot = leftSlot + 1;
    if leftSlot > heap.Count
        break;
    end
    smallerSlot = leftSlot;
    if rightSlot <= heap.Count && heapEntryIsLess(heap, rightSlot, leftSlot)
        smallerSlot = rightSlot;
    end
    if ~heapEntryIsLess(heap, smallerSlot, slot)
        break;
    end
    heap = heapSwap(heap, smallerSlot, slot);
    slot = smallerSlot;
end
end

function yes = heapEntryIsLess(heap, firstSlot, secondSlot)
if heap.F(firstSlot) ~= heap.F(secondSlot)
    yes = heap.F(firstSlot) < heap.F(secondSlot);
elseif heap.H(firstSlot) ~= heap.H(secondSlot)
    yes = heap.H(firstSlot) < heap.H(secondSlot);
else
    yes = heap.Serial(firstSlot) < heap.Serial(secondSlot);
end
end

function heap = heapSwap(heap, firstSlot, secondSlot)
% Scalar element swaps; a fieldname loop would copy whole arrays per swap.
heldNode = heap.Node(firstSlot);
heap.Node(firstSlot) = heap.Node(secondSlot);
heap.Node(secondSlot) = heldNode;
heldF = heap.F(firstSlot);
heap.F(firstSlot) = heap.F(secondSlot);
heap.F(secondSlot) = heldF;
heldH = heap.H(firstSlot);
heap.H(firstSlot) = heap.H(secondSlot);
heap.H(secondSlot) = heldH;
heldSerial = heap.Serial(firstSlot);
heap.Serial(firstSlot) = heap.Serial(secondSlot);
heap.Serial(secondSlot) = heldSerial;
end

function search = failedSearch(message, reason, eventTimes, cache, ...
        expanded, generated, elapsed_s, options)
search = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "Method", "unifiedSafeIntervalAStar", ...
    "Route", struct(), ...
    "StaticFreeCellMask", [], ...
    "Lattice", struct(), ...
    "WorkspaceIsStatic", false, ...
    "ExpandedNodeCount", expanded, ...
    "GeneratedNodeCount", generated, ...
    "SafeIntervalQueryCount", cache.QueryCount, ...
    "SafeIntervalCacheCount", cache.Intervals.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", elapsed_s, ...
    "TerminationReason", string(reason), ...
    "ShortcutBypassCount", 0, ...
    "Options", options);
end

function record = attemptRecord(options, search, profile, ...
        objectiveCost, selected)
% One-entry attempt log shaped like planAzElAdaptiveAStar resolution
% attempts so the shared animator and diagnostics tooling work unchanged.
if isempty(options.PrimitiveRadii_deg)
    radii = options.GridStep_deg * options.PrimitiveRadiusMultipliers;
else
    radii = options.PrimitiveRadii_deg;
end
record = struct( ...
    "GridStep_deg", options.GridStep_deg, ...
    "PrimitiveRadii_deg", unique(double(radii(:).')), ...
    "Success", search.Success, ...
    "Message", search.Message, ...
    "ExpandedNodeCount", search.ExpandedNodeCount, ...
    "GeneratedNodeCount", search.GeneratedNodeCount, ...
    "SearchElapsed_s", search.SearchElapsed_s, ...
    "TerminationReason", search.TerminationReason, ...
    "ObjectiveCost", objectiveCost, ...
    "CandidateTime_s", profile.time_s, ...
    "CandidatePosition_deg", profile.position_deg, ...
    "Selected", selected);
end

function plan = failedSafeIntervalPlan(message, workspace, initialState, ...
        goalState, limits, options, search, elapsed_s)
emptyProfile = struct("time_s", zeros(0, 1), ...
    "position_deg", zeros(0, 2));
searchReport = search;
for privateName = ["Route", "StaticFreeCellMask", "Lattice"]
    if isfield(searchReport, privateName)
        searchReport = rmfield(searchReport, privateName);
    end
end
plan = struct( ...
    "success", false, ...
    "message", string(message), ...
    "method", "safeIntervalAStar", ...
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
    "expandedNodeCount", search.ExpandedNodeCount, ...
    "generatedNodeCount", search.GeneratedNodeCount, ...
    "searchElapsed_s", elapsed_s, ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", limits, ...
    "options", options, ...
    "workspace", workspace, ...
    "resolutionAttempts", attemptRecord(options, search, ...
        emptyProfile, Inf, false), ...
    "safeIntervalSearch", searchReport);
end

function [initialState, goalState, limits, options] = ...
        normalizeSafeIntervalInputs(initialState, goalState, limits, options)
requiredState = ["time_s", "position_deg", ...
    "velocity_deg_s", "acceleration_deg_s2"];
initialState = normalizeBoundaryState( ...
    initialState, "initialState", requiredState);
goalState = normalizeBoundaryState(goalState, "goalState", requiredState);
if goalState.time_s <= initialState.time_s
    error("planAzElSafeIntervalAStar:InvalidTime", ...
        "goalState.time_s must follow initialState.time_s.");
end
if any(abs([initialState.velocity_deg_s, ...
        initialState.acceleration_deg_s2]) > 1e-12)
    error("planAzElSafeIntervalAStar:NonzeroBoundaryDynamics", ...
        "The safe-interval planner requires a rest initial state.");
end

requiredLimits = ["azimuth_deg", "elevation_deg", ...
    "maxVelocity_deg_s", "maxAcceleration_deg_s2"];
if ~isstruct(limits) || ~isscalar(limits) || ...
        ~all(isfield(limits, cellstr(requiredLimits)))
    error("planAzElSafeIntervalAStar:InvalidLimits", ...
        "limits is missing a required field.");
end
for name = requiredLimits
    validateattributes(limits.(name), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    limits.(name) = reshape(double(limits.(name)), 1, 2);
end
if any(diff(limits.azimuth_deg) <= 0) || ...
        any(diff(limits.elevation_deg) <= 0) || ...
        any(limits.maxVelocity_deg_s <= 0) || ...
        any(limits.maxAcceleration_deg_s2 <= 0)
    error("planAzElSafeIntervalAStar:InvalidLimits", ...
        "Limit ranges must increase and dynamic limits must be positive.");
end

% Shared option names and defaults match planAzElAdaptiveAStar so both
% planners can consume one benchmark scenario struct unchanged. The
% schedule and batching options are accepted for compatibility but unused:
% this planner searches its single finest lattice.
defaults = struct( ...
    "SampleTime_s", 0.5, ...
    "ValidationStep_s", [], ...
    "GridStep_deg", 1, ...
    "GridStepSchedule_deg", [], ...
    "PrimitiveRadii_deg", [], ...
    "PrimitiveRadiusMultipliers", [1 2 4 8], ...
    "DirectionStep_deg", 45, ...
    "DirectionAngles_deg", [], ...
    "HeuristicWeight", 1, ...
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
optionNames = fieldnames(defaults);
for k = 1:numel(optionNames)
    if ~isfield(options, optionNames{k}) || isempty(options.(optionNames{k}))
        options.(optionNames{k}) = defaults.(optionNames{k});
    end
end
if isempty(options.ValidationStep_s)
    options.ValidationStep_s = min(options.SampleTime_s, ...
        options.GridStep_deg / max(limits.maxVelocity_deg_s) / 8);
end
if isempty(options.CollisionCheckStep_s)
    options.CollisionCheckStep_s = options.ValidationStep_s;
end

positiveOptions = ["SampleTime_s", "ValidationStep_s", "GridStep_deg", ...
    "CollisionCheckStep_s", "DirectionStep_deg", "HeuristicWeight", ...
    "MaxSearchTime_s", "RouteShortcutStep_deg"];
for name = positiveOptions
    validateattributes(options.(name), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
end
integerOptions = ["MaximumSafeIntervalSamples", ...
    "MaximumDepartureTrials", "MaxExpansions", "InitialNodeCapacity"];
for name = integerOptions
    validateattributes(options.(name), {'numeric'}, ...
        {'scalar', 'integer', 'positive'});
end
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.SafetyMargin_deg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
if ~isempty(options.PrimitiveRadii_deg)
    validateattributes(options.PrimitiveRadii_deg, {'numeric'}, ...
        {'vector', 'real', 'finite', 'positive'});
end
validateattributes(options.PrimitiveRadiusMultipliers, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
if ~isempty(options.DirectionAngles_deg)
    validateattributes(options.DirectionAngles_deg, {'numeric'}, ...
        {'vector', 'real', 'finite'});
end
options.AllowAzimuthWrap = logical(options.AllowAzimuthWrap);
options.AllowNonzeroTerminalState = ...
    logical(options.AllowNonzeroTerminalState);
options.PrintFailureSuggestions = ...
    logical(options.PrintFailureSuggestions);
if options.AllowAzimuthWrap && ...
        abs(diff(limits.azimuth_deg) - 360) > 1e-6
    error("planAzElSafeIntervalAStar:InvalidWrapLimits", ...
        "Wrapped azimuth limits must span exactly 360 degrees.");
end
hasTerminalDynamics = any(abs([goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2]) > 1e-12);
if hasTerminalDynamics && ~options.AllowNonzeroTerminalState
    error("planAzElSafeIntervalAStar:NonzeroTerminalStateDisabled", ...
        "Set AllowNonzeroTerminalState to true for terminal capture.");
end

objective = lower(strtrim(string(options.Objective)));
if any(objective == ["minimumangulardistance", ...
        "angulardistance", "distance"])
    options.Objective = "minimumAngularDistance";
elseif any(objective == ["minimumtime", "time"])
    options.Objective = "minimumTime";
else
    error("planAzElSafeIntervalAStar:InvalidObjective", ...
        "Objective must be minimumAngularDistance or minimumTime.");
end
end

function state = normalizeBoundaryState(state, label, requiredState)
if ~isstruct(state) || ~isscalar(state) || ...
        ~all(isfield(state, cellstr(requiredState)))
    error("planAzElSafeIntervalAStar:InvalidState", ...
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
