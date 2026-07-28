function result = searchAzElAnyAngleAStar( ...
        occupied, azimuthValues_deg, elevationValues_deg, ...
        startPosition_deg, goalPosition_deg, options)
%SEARCHAZELANYANGLEASTAR Discover a short route through a 2-D occupancy map.
%
% The search expands an 8-connected grid and applies Theta*-style
% parent line-of-sight relaxation. This preserves A*'s useful ordering while
% producing an any-angle polyline with far fewer corners than a raw grid
% route. Closed nodes are reopened when a shorter parent is discovered.

if nargin < 6
    options = struct();
end
defaults = struct( ...
    "AllowAzimuthWrap", false, ...
    "HeuristicWeight", 1, ...
    "UseAnyAngleRelaxation", true, ...
    "MaximumExpandedNodes", 2000000, ...
    "MaximumWallTime_s", 30, ...
    "InitialHeapCapacity", 4096);
options = applyDefaults(options, defaults);
validateInputs( ...
    occupied, azimuthValues_deg, elevationValues_deg, ...
    startPosition_deg, goalPosition_deg, options);

timer = tic;
occupied = logical(occupied);
azimuthValues_deg = double(azimuthValues_deg(:).');
elevationValues_deg = double(elevationValues_deg(:));
rowCount = numel(elevationValues_deg);
columnCount = numel(azimuthValues_deg);
nodeCount = rowCount * columnCount;

startNode = nearestFreeNode( ...
    occupied, azimuthValues_deg, elevationValues_deg, ...
    startPosition_deg, options.AllowAzimuthWrap);
goalNode = nearestFreeNode( ...
    occupied, azimuthValues_deg, elevationValues_deg, ...
    goalPosition_deg, options.AllowAzimuthWrap);
if startNode == 0 || goalNode == 0
    result = failedResult( ...
        "No free grid cell is available for the start or goal.", ...
        toc(timer), options);
    return;
end

gScore = inf(nodeCount, 1);
parent = zeros(nodeCount, 1, "uint32");
closed = false(nodeCount, 1);
gScore(startNode) = 0;
parent(startNode) = uint32(startNode);
heap = emptyHeap(options.InitialHeapCapacity);
startHeuristic = gridHeuristic( ...
    startNode, goalNode, azimuthValues_deg, ...
    elevationValues_deg, options.AllowAzimuthWrap);
heap = heapPush(heap, startNode, ...
    options.HeuristicWeight * startHeuristic, ...
    startHeuristic, 0);

expanded = 0;
generated = 1;
reachedGoal = false;
stopReason = "";
rowOffset = [-1 -1 -1 0 0 1 1 1];
columnOffset = [-1 0 1 -1 1 -1 0 1];
while heap.Count > 0
    if toc(timer) >= options.MaximumWallTime_s
        stopReason = "wallTimeLimit";
        break;
    end
    if expanded >= options.MaximumExpandedNodes
        stopReason = "expansionLimit";
        break;
    end
    [heap, currentNode, pushedG] = heapPop(heap);
    if closed(currentNode) || ...
            pushedG > gScore(currentNode) + 1e-12
        continue;
    end
    if currentNode == goalNode
        reachedGoal = true;
        break;
    end

    closed(currentNode) = true;
    expanded = expanded + 1;
    [currentRow, currentColumn] = ...
        ind2sub([rowCount columnCount], currentNode);
    for neighborNumber = 1:numel(rowOffset)
        neighborRow = currentRow + rowOffset(neighborNumber);
        neighborColumn = currentColumn + columnOffset(neighborNumber);
        if neighborRow < 1 || neighborRow > rowCount
            continue;
        end
        if options.AllowAzimuthWrap
            neighborColumn = mod(neighborColumn - 1, columnCount) + 1;
        elseif neighborColumn < 1 || neighborColumn > columnCount
            continue;
        end
        if occupied(neighborRow, neighborColumn)
            continue;
        end
        if rowOffset(neighborNumber) ~= 0 && ...
                columnOffset(neighborNumber) ~= 0 && ...
                diagonalCornerBlocked(occupied, currentRow, ...
                currentColumn, neighborRow, neighborColumn, ...
                options.AllowAzimuthWrap)
            continue;
        end

        neighborNode = sub2ind( ...
            [rowCount columnCount], neighborRow, neighborColumn);
        anchorNode = currentNode;
        if options.UseAnyAngleRelaxation
            candidateAnchor = double(parent(currentNode));
            if candidateAnchor ~= currentNode && ...
                    gridLineOfSight(occupied, candidateAnchor, ...
                    neighborNode, options.AllowAzimuthWrap)
                anchorNode = candidateAnchor;
            end
        end
        tentativeG = gScore(anchorNode) + gridDistance( ...
            anchorNode, neighborNode, azimuthValues_deg, ...
            elevationValues_deg, options.AllowAzimuthWrap);
        if tentativeG >= gScore(neighborNode) - 1e-12
            continue;
        end

        gScore(neighborNode) = tentativeG;
        parent(neighborNode) = uint32(anchorNode);
        closed(neighborNode) = false;
        h = gridHeuristic(neighborNode, goalNode, ...
            azimuthValues_deg, elevationValues_deg, ...
            options.AllowAzimuthWrap);
        heap = heapPush(heap, neighborNode, ...
            tentativeG + options.HeuristicWeight * h, h, tentativeG);
        generated = generated + 1;
    end
end

if ~reachedGoal
    if stopReason == ""
        stopReason = "noPath";
        message = "No grid route connects the start and goal.";
    elseif stopReason == "wallTimeLimit"
        message = "Topology search reached MaximumWallTime_s.";
    else
        message = "Topology search reached MaximumExpandedNodes.";
    end
    result = failedResult(message, toc(timer), options);
    result.ExpandedNodeCount = expanded;
    result.GeneratedNodeCount = generated;
    result.TerminationReason = stopReason;
    return;
end

nodePath = reconstructPath(parent, goalNode);
path = gridNodePositions(nodePath, azimuthValues_deg, ...
    elevationValues_deg, options.AllowAzimuthWrap);
result = struct( ...
    "Success", true, ...
    "Message", "Any-angle topology route found.", ...
    "Method", "anyAngleAStar", ...
    "Path_deg", path, ...
    "GridNodePath", nodePath, ...
    "AngularLength_deg", polylineLength(path), ...
    "ExpandedNodeCount", expanded, ...
    "GeneratedNodeCount", generated, ...
    "SearchElapsed_s", toc(timer), ...
    "TerminationReason", "goalReached", ...
    "Options", options);
end

function blocked = diagonalCornerBlocked( ...
        occupied, currentRow, currentColumn, ...
        neighborRow, neighborColumn, allowWrap)
columnCount = size(occupied, 2);
firstColumn = neighborColumn;
secondColumn = currentColumn;
if allowWrap
    firstColumn = mod(firstColumn - 1, columnCount) + 1;
    secondColumn = mod(secondColumn - 1, columnCount) + 1;
end
blocked = occupied(currentRow, firstColumn) || ...
    occupied(neighborRow, secondColumn);
end

function yes = gridLineOfSight(occupied, firstNode, secondNode, allowWrap)
[rowCount, columnCount] = size(occupied);
[firstRow, firstColumn] = ...
    ind2sub([rowCount columnCount], firstNode);
[secondRow, secondColumn] = ...
    ind2sub([rowCount columnCount], secondNode);
columnDelta = secondColumn - firstColumn;
if allowWrap
    columnDelta = mod(columnDelta + columnCount / 2, columnCount) - ...
        columnCount / 2;
end
rowDelta = secondRow - firstRow;
sampleCount = max(2, ...
    ceil(4 * max(abs(rowDelta), abs(columnDelta))) + 1);
row = round(firstRow + linspace(0, rowDelta, sampleCount));
column = round(firstColumn + linspace(0, columnDelta, sampleCount));
if allowWrap
    column = mod(column - 1, columnCount) + 1;
end
row = min(max(row, 1), rowCount);
column = min(max(column, 1), columnCount);
index = unique(sub2ind([rowCount columnCount], row, column), "stable");
yes = ~any(occupied(index));
end

function distance = gridHeuristic( ...
        firstNode, secondNode, azimuth, elevation, allowWrap)
distance = gridDistance( ...
    firstNode, secondNode, azimuth, elevation, allowWrap);
end

function distance = gridDistance( ...
        firstNode, secondNode, azimuth, elevation, allowWrap)
rowCount = numel(elevation);
columnCount = numel(azimuth);
[firstRow, firstColumn] = ...
    ind2sub([rowCount columnCount], firstNode);
[secondRow, secondColumn] = ...
    ind2sub([rowCount columnCount], secondNode);
azimuthDelta = azimuth(secondColumn) - azimuth(firstColumn);
if allowWrap
    span = azimuth(end) - azimuth(1);
    if columnCount > 1
        span = span + median(diff(azimuth));
    end
    azimuthDelta = mod(azimuthDelta + span / 2, span) - span / 2;
end
elevationDelta = elevation(secondRow) - elevation(firstRow);
distance = hypot(azimuthDelta, elevationDelta);
end

function node = nearestFreeNode( ...
        occupied, azimuth, elevation, position, allowWrap)
[azimuthGrid, elevationGrid] = meshgrid(azimuth, elevation);
azimuthDelta = azimuthGrid - position(1);
if allowWrap
    span = azimuth(end) - azimuth(1);
    if numel(azimuth) > 1
        span = span + median(diff(azimuth));
    end
    azimuthDelta = mod(azimuthDelta + span / 2, span) - span / 2;
end
distanceSquared = azimuthDelta.^2 + ...
    (elevationGrid - position(2)).^2;
distanceSquared(occupied) = Inf;
[minimumDistance, node] = min(distanceSquared(:));
if ~isfinite(minimumDistance)
    node = 0;
end
end

function path = reconstructPath(parent, goalNode)
path = zeros(128, 1, "uint32");
count = 0;
node = uint32(goalNode);
while true
    count = count + 1;
    if count > numel(path)
        path(2 * numel(path), 1) = 0;
    end
    path(count) = node;
    next = parent(node);
    if next == node
        break;
    end
    if next == 0
        error("searchAzElAnyAngleAStar:BrokenParentChain", ...
            "Topology search produced an incomplete parent chain.");
    end
    node = next;
end
path = flipud(path(1:count));
end

function path = gridNodePositions( ...
        nodes, azimuth, elevation, allowWrap)
rowCount = numel(elevation);
columnCount = numel(azimuth);
[row, column] = ind2sub([rowCount columnCount], double(nodes));
wrappedAzimuth = azimuth(column).';
path = [wrappedAzimuth, elevation(row)];
if allowWrap
    span = azimuth(end) - azimuth(1);
    if columnCount > 1
        span = span + median(diff(azimuth));
    end
    for k = 2:size(path, 1)
        delta = mod(path(k, 1) - path(k - 1, 1) + ...
            span / 2, span) - span / 2;
        path(k, 1) = path(k - 1, 1) + delta;
    end
end
end

function length_deg = polylineLength(path)
delta = diff(path, 1, 1);
length_deg = sum(hypot(delta(:, 1), delta(:, 2)));
end

function result = failedResult(message, elapsed_s, options)
result = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "Method", "anyAngleAStar", ...
    "Path_deg", zeros(0, 2), ...
    "GridNodePath", zeros(0, 1, "uint32"), ...
    "AngularLength_deg", Inf, ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SearchElapsed_s", elapsed_s, ...
    "TerminationReason", "", ...
    "Options", options);
end

function heap = emptyHeap(capacity)
heap = struct( ...
    "Node", zeros(capacity, 1, "uint32"), ...
    "F", inf(capacity, 1), ...
    "H", inf(capacity, 1), ...
    "G", inf(capacity, 1), ...
    "Serial", zeros(capacity, 1, "uint64"), ...
    "Count", 0, ...
    "NextSerial", uint64(0));
end

function heap = heapPush(heap, node, f, h, g)
if heap.Count >= numel(heap.Node)
    oldCapacity = numel(heap.Node);
    newCapacity = 2 * oldCapacity;
    heap.Node(newCapacity, 1) = 0;
    heap.F(oldCapacity + 1:newCapacity, 1) = Inf;
    heap.H(oldCapacity + 1:newCapacity, 1) = Inf;
    heap.G(oldCapacity + 1:newCapacity, 1) = Inf;
    heap.Serial(oldCapacity + 1:newCapacity, 1) = 0;
end
heap.Count = heap.Count + 1;
heap.NextSerial = heap.NextSerial + 1;
index = heap.Count;
heap.Node(index) = uint32(node);
heap.F(index) = f;
heap.H(index) = h;
heap.G(index) = g;
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

function [heap, node, g] = heapPop(heap)
node = double(heap.Node(1));
g = heap.G(1);
heap.Node(1) = heap.Node(heap.Count);
heap.F(1) = heap.F(heap.Count);
heap.H(1) = heap.H(heap.Count);
heap.G(1) = heap.G(heap.Count);
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
elseif heap.H(first) < heap.H(second) - tolerance
    yes = true;
elseif heap.H(first) > heap.H(second) + tolerance
    yes = false;
else
    yes = heap.Serial(first) < heap.Serial(second);
end
end

function heap = heapSwap(heap, first, second)
fields = ["Node", "F", "H", "G", "Serial"];
for field = fields
    temporary = heap.(field)(first);
    heap.(field)(first) = heap.(field)(second);
    heap.(field)(second) = temporary;
end
end

function validateInputs( ...
        occupied, azimuth, elevation, startPosition, goalPosition, options)
validateattributes(occupied, {'logical', 'numeric'}, {'2d', 'nonempty'});
validateattributes(azimuth, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
validateattributes(elevation, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
if ~isequal(size(occupied), [numel(elevation), numel(azimuth)])
    error("searchAzElAnyAngleAStar:GridSizeMismatch", ...
        "occupied must be elevation-by-azimuth.");
end
validateattributes(startPosition, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
validateattributes(goalPosition, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
validateattributes(options.AllowAzimuthWrap, {'logical', 'numeric'}, ...
    {'scalar'});
validateattributes(options.HeuristicWeight, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 1});
validateattributes(options.UseAnyAngleRelaxation, {'logical', 'numeric'}, ...
    {'scalar'});
validateattributes(options.MaximumExpandedNodes, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumWallTime_s, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
validateattributes(options.InitialHeapCapacity, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
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
