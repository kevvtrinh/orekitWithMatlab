function [costToGo, settled, diagnostics, settlementOrder] = ...
        computeAzElReverseDijkstra( ...
        elevationCount, azimuthCount, blocked, goalCellIds, ...
        predecessorOffsets, edgeCost, allowAzimuthWrap, ...
        predecessorAllowed, goalCost)
%% Section 0: Header & Readme
% SYNTAX
%   [costToGo, settled, diagnostics] = computeAzElReverseDijkstra( ...
%       elevationCount, azimuthCount, blocked, goalCellIds, ...
%       predecessorOffsets, edgeCost, allowAzimuthWrap)
%   [costToGo, settled, diagnostics, settlementOrder] = ...
%       computeAzElReverseDijkstra(...)
%**************************************************************************
% PURPOSE
%   - Solve one deterministic, nonnegative, multi-source reverse grid graph.
%   - Own reverse-queue ordering, stale-entry handling, and relaxation.
%**************************************************************************
% INPUTS
%   - elevationCount, azimuthCount (positive integer scalars)
%       Grid dimensions used by MATLAB column-major cell identifiers.
%   - blocked (cellCount-by-1 logical)
%       Nodes excluded from the relaxation.
%   - goalCellIds (numeric vector)
%       Unblocked zero-cost source identifiers.
%   - predecessorOffsets (edgeCount-by-2 integer matrix)
%       [azimuth,elevation] offsets subtracted from a settled cell.
%   - edgeCost (edgeCount-by-1 nonnegative finite numeric vector)
%       Optimistic cost for each predecessor offset.
%   - allowAzimuthWrap (logical scalar)
%       Whether predecessor azimuth indices wrap circularly.
%   - predecessorAllowed (cellCount-by-edgeCount logical, optional)
%       Exact edge-availability mask indexed by predecessor cell. Empty
%       admits every in-bounds edge.
%   - goalCost (goalCount-by-1 numeric, optional)
%       Nonnegative initial source labels. Empty uses zero labels.
%**************************************************************************
% OUTPUTS
%   - costToGo (cellCount-by-1 double)
%       Exact shortest reverse-graph cost or Inf when unreachable.
%   - settled (cellCount-by-1 logical)
%       True for every permanently settled graph node.
%   - diagnostics (scalar struct)
%       Heap, stale-entry, settlement, and relaxation counters.
%   - settlementOrder (settledCount-by-1 uint32, optional)
%       Deterministic pop order, allocated only when requested.

%% Section 1: Validate The Finite Graph
validateattributes(elevationCount, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(azimuthCount, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
cellCount = double(elevationCount) * double(azimuthCount);
blocked = logical(blocked(:));
if numel(blocked) ~= cellCount
    error("computeAzElReverseDijkstra:InvalidBlockedMask", ...
        "blocked must contain one value per grid cell.");
end
goalCellIds = double(goalCellIds(:));
if any(goalCellIds < 1 | goalCellIds > cellCount | ...
        goalCellIds ~= round(goalCellIds))
    error("computeAzElReverseDijkstra:InvalidGoalCell", ...
        "goalCellIds must be valid integer cell identifiers.");
end
predecessorOffsets = double(predecessorOffsets);
edgeCost = double(edgeCost(:));
if size(predecessorOffsets, 2) ~= 2 || ...
        size(predecessorOffsets, 1) ~= numel(edgeCost) || ...
        any(predecessorOffsets ~= round(predecessorOffsets), "all") || ...
        any(~isfinite(edgeCost) | edgeCost < 0)
    error("computeAzElReverseDijkstra:InvalidEdges", ...
        "Offsets must be integer pairs with finite nonnegative costs.");
end
allowAzimuthWrap = logical(allowAzimuthWrap);
if ~isscalar(allowAzimuthWrap)
    error("computeAzElReverseDijkstra:InvalidWrap", ...
        "allowAzimuthWrap must be a logical scalar.");
end
if nargin < 8 || isempty(predecessorAllowed)
    predecessorAllowed = false(0, 0);
else
    predecessorAllowed = logical(predecessorAllowed);
    if ~isequal(size(predecessorAllowed), ...
            [cellCount, size(predecessorOffsets, 1)])
        error("computeAzElReverseDijkstra:InvalidEdgeMask", ...
            "predecessorAllowed must have one row per cell and one column per edge.");
    end
end
if nargin < 9 || isempty(goalCost)
    goalCost = zeros(numel(goalCellIds), 1);
else
    goalCost = double(goalCost(:));
    if numel(goalCost) ~= numel(goalCellIds) || ...
            any(~isfinite(goalCost) | goalCost < 0)
        error("computeAzElReverseDijkstra:InvalidGoalCost", ...
            "goalCost must contain one finite nonnegative label per goal cell.");
    end
end
[goalCellIds, ~, goalGroup] = unique(goalCellIds, "sorted");
goalCost = accumarray(goalGroup, goalCost, [], @min);
unblockedGoal = ~blocked(goalCellIds);
goalCellIds = goalCellIds(unblockedGoal);
goalCost = goalCost(unblockedGoal);

%% Section 2: Initialize The Multi-Source Binary Heap
costToGo = inf(cellCount, 1);
settled = false(cellCount, 1);
heapCapacity = max(16, min(cellCount, 65536));
heapCell = zeros(heapCapacity, 1, "uint32");
heapPriority = inf(heapCapacity, 1);
heapCount = 0;
heapPushes = 0;
for seedIndex = 1:numel(goalCellIds)
    seedCellId = goalCellIds(seedIndex);
    seedCost = goalCost(seedIndex);
    costToGo(seedCellId) = seedCost;
    [heapCell, heapPriority, heapCount] = reverseHeapPush( ...
        heapCell, heapPriority, heapCount, uint32(seedCellId), seedCost);
    heapPushes = heapPushes + 1;
end
if nargout >= 4
    settlementOrder = zeros(cellCount, 1, "uint32");
else
    settlementOrder = zeros(0, 1, "uint32");
end

%% Section 3: Settle And Relax In Deterministic Cost Order
heapPops = 0;
stalePops = 0;
settledCount = 0;
relaxationAttempts = 0;
successfulRelaxations = 0;
while heapCount > 0
    poppedPriority = heapPriority(1);
    [heapCell, heapPriority, heapCount, poppedCell] = reverseHeapPop( ...
        heapCell, heapPriority, heapCount);
    heapPops = heapPops + 1;
    cellId = double(poppedCell);
    if settled(cellId) || ...
            poppedPriority > costToGo(cellId) + 1e-12
        stalePops = stalePops + 1;
        continue;
    end
    settled(cellId) = true;
    settledCount = settledCount + 1;
    if nargout >= 4
        settlementOrder(settledCount) = poppedCell;
    end
    [elevationIndex, azimuthIndex] = ind2sub( ...
        [elevationCount azimuthCount], cellId);
    for edgeIndex = 1:size(predecessorOffsets, 1)
        relaxationAttempts = relaxationAttempts + 1;
        predecessorAzimuthIndex = azimuthIndex - ...
            predecessorOffsets(edgeIndex, 1);
        predecessorElevationIndex = elevationIndex - ...
            predecessorOffsets(edgeIndex, 2);
        if allowAzimuthWrap
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
        if ~isempty(predecessorAllowed) && ...
                ~predecessorAllowed(predecessorCellId, edgeIndex)
            continue;
        end
        trialCost = poppedPriority + edgeCost(edgeIndex);
        if trialCost >= costToGo(predecessorCellId) - 1e-12
            continue;
        end
        costToGo(predecessorCellId) = trialCost;
        successfulRelaxations = successfulRelaxations + 1;
        [heapCell, heapPriority, heapCount] = reverseHeapPush( ...
            heapCell, heapPriority, heapCount, ...
            uint32(predecessorCellId), trialCost);
        heapPushes = heapPushes + 1;
    end
end
if nargout >= 4
    settlementOrder = settlementOrder(1:settledCount);
end

%% Section 4: Assemble Stable Queue Diagnostics
diagnostics = struct( ...
    "heapPushes", heapPushes, ...
    "heapPops", heapPops, ...
    "stalePops", stalePops, ...
    "settledCount", settledCount, ...
    "relaxationAttempts", relaxationAttempts, ...
    "successfulRelaxations", successfulRelaxations);
end

%% Section 5: Local Binary-Heap Functions
function [heapCell, heapPriority, heapCount] = reverseHeapPush( ...
        heapCell, heapPriority, heapCount, cellId, priority)
heapCount = heapCount + 1;
writeIndex = heapCount;
while writeIndex > 1
    parentIndex = floor(writeIndex / 2);
    if reverseEntryPrecedes( ...
            heapPriority(parentIndex), heapCell(parentIndex), ...
            priority, cellId)
        break;
    end
    heapCell(writeIndex) = heapCell(parentIndex);
    heapPriority(writeIndex) = heapPriority(parentIndex);
    writeIndex = parentIndex;
end
heapCell(writeIndex) = cellId;
heapPriority(writeIndex) = priority;
end

function [heapCell, heapPriority, heapCount, poppedCell] = ...
        reverseHeapPop(heapCell, heapPriority, heapCount)
poppedCell = heapCell(1);
lastCell = heapCell(heapCount);
lastPriority = heapPriority(heapCount);
heapCount = heapCount - 1;
if heapCount == 0
    return;
end
writeIndex = 1;
while true
    leftIndex = 2 * writeIndex;
    if leftIndex > heapCount
        break;
    end
    rightIndex = leftIndex + 1;
    childIndex = leftIndex;
    if rightIndex <= heapCount && reverseEntryPrecedes( ...
            heapPriority(rightIndex), heapCell(rightIndex), ...
            heapPriority(leftIndex), heapCell(leftIndex))
        childIndex = rightIndex;
    end
    if reverseEntryPrecedes(lastPriority, lastCell, ...
            heapPriority(childIndex), heapCell(childIndex))
        break;
    end
    heapCell(writeIndex) = heapCell(childIndex);
    heapPriority(writeIndex) = heapPriority(childIndex);
    writeIndex = childIndex;
end
heapCell(writeIndex) = lastCell;
heapPriority(writeIndex) = lastPriority;
end

function precedes = reverseEntryPrecedes( ...
        firstPriority, firstCell, secondPriority, secondCell)
precedes = firstPriority < secondPriority - 1e-14 || ( ...
    abs(firstPriority - secondPriority) <= 1e-14 && ...
    firstCell < secondCell);
end
