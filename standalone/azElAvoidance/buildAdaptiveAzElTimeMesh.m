function mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec, options)
%BUILDADAPTIVEAZELTIMEMESH Discretize az/el/time without a dense 3-D grid.
%
% mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec)
% mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec, options)
%
% The spatial mesh is an adaptive quadtree (or binary split at a narrow
% domain edge). Large cells remain in uniformly free or blocked regions.
% Cells touched by an obstacle boundary at any retained time are refined.
% Each leaf stores sampled free/blocked state and compressed safe-time
% intervals, making the same mesh useful as both:
%   * a 2-D azimuth/elevation mesh at one selected time, and
%   * a sparse 3-D azimuth/elevation/time prism workspace.
%
% Required gridSpec fields:
%   AzimuthLimitsDeg       [minimum maximum]
%   ElevationLimitsDeg     [minimum maximum]
%
% Optional gridSpec field:
%   TimeLimitsSeconds      Default union of obstacle time ranges.
%
% Options:
%   InitialCellSizeDeg     Scalar or [az el], default [8 8].
%   MinimumCellSizeDeg     Scalar or [az el], default [0.5 0.5].
%   MaximumTimeSamples     Retained source times, default 300.
%   TimeSeconds            Explicit retained time samples, default [].
%   SafetyMarginDeg        Obstacle clearance, default 0.
%   TimePaddingSamples     Neighboring source slices to test, default 1.
%   MaximumLeafCells       Memory guard, default 100000.
%   AllowAzimuthWrap       Connect domain seam neighbors, default false.
%
% A mixed cell at MinimumCellSizeDeg or the leaf limit is marked
% unresolved and treated as occupied. Time decimation is sampled, not a
% continuous-time collision proof. Validate final trajectories against the
% packed workspace with queryAzElTimeObstacle.

if nargin < 3
    options = struct();
end
validateWorkspace(workspace);
gridSpec = normalizeGridSpec(gridSpec, workspace);
options = normalizeOptions(options);
timeSeconds = resolveTimes(workspace, gridSpec, options);

[rootBounds, rootAzimuthEdges, rootElevationEdges] = ...
    initialBounds(gridSpec, options.InitialCellSizeDeg);
pending = repmat(emptyPending(), size(rootBounds, 1), 1);
for k = 1:size(rootBounds, 1)
    pending(k).BoundsDeg = rootBounds(k, :);
    pending(k).Level = uint16(0);
    pending(k).RootId = uint32(k);
end
leaves = repmat(emptyLeaf(numel(timeSeconds)), 0, 1);
forcedLeafCount = 0;

while ~isempty(pending)
    cellInfo = pending(end);
    pending(end) = [];
    [state, freeByTime, blockedByTime, unresolvedByTime] = ...
        classifyCell(workspace, cellInfo.BoundsDeg, timeSeconds, options);
    canSplit = splittable(cellInfo.BoundsDeg, ...
        options.MinimumCellSizeDeg);
    needsSplit = any(state == 0) && canSplit;
    children = splitBounds(cellInfo.BoundsDeg, ...
        options.MinimumCellSizeDeg);
    wouldExceedLimit = numel(leaves) + numel(pending) + ...
        size(children, 1) > options.MaximumLeafCells;

    if needsSplit && ~wouldExceedLimit
        childLevel = cellInfo.Level + 1;
        newPending = repmat(emptyPending(), size(children, 1), 1);
        for child = 1:size(children, 1)
            newPending(child).BoundsDeg = children(child, :);
            newPending(child).Level = childLevel;
            newPending(child).RootId = cellInfo.RootId;
        end
        pending = [pending; newPending]; %#ok<AGROW>
        continue;
    end

    if needsSplit && wouldExceedLimit
        unresolvedByTime = unresolvedByTime | state == 0;
        freeByTime(unresolvedByTime) = false;
        forcedLeafCount = forcedLeafCount + 1;
    end
    leaf = emptyLeaf(numel(timeSeconds));
    leaf.Id = uint32(numel(leaves) + 1);
    leaf.Level = cellInfo.Level;
    leaf.RootId = cellInfo.RootId;
    leaf.BoundsDeg = cellInfo.BoundsDeg;
    leaf.CenterDeg = [ ...
        mean(cellInfo.BoundsDeg(1:2)), ...
        mean(cellInfo.BoundsDeg(3:4))];
    leaf.SizeDeg = [ ...
        diff(cellInfo.BoundsDeg(1:2)), ...
        diff(cellInfo.BoundsDeg(3:4))];
    leaf.FreeByTime = freeByTime;
    leaf.BlockedByTime = blockedByTime;
    leaf.UnresolvedByTime = unresolvedByTime;
    leaf.SafeIntervals_s = logicalRunsToIntervals( ...
        freeByTime, timeSeconds);
    leaf.BlockedIntervals_s = logicalRunsToIntervals( ...
        blockedByTime | unresolvedByTime, timeSeconds);
    leaves(end + 1, 1) = leaf; %#ok<AGROW>
end

[leaves, adjacencyEdges] = connectLeaves( ...
    leaves, gridSpec, options.AllowAzimuthWrap);
cellSizes = vertcat(leaves.SizeDeg);
levels = double([leaves.Level]);
freeSamples = sum(cellfun(@nnz, {leaves.FreeByTime}));
blockedSamples = sum(cellfun(@nnz, {leaves.BlockedByTime}));
unresolvedSamples = sum(cellfun(@nnz, {leaves.UnresolvedByTime}));

mesh = struct();
mesh.Format = "AdaptiveAzElTimeMesh";
mesh.Version = 1;
mesh.ReferenceTime = workspace.ReferenceTime;
mesh.GridSpec = gridSpec;
mesh.Options = options;
mesh.TimeSeconds = timeSeconds;
mesh.Leaves = leaves;
mesh.AdjacencyEdges = adjacencyEdges;
mesh.LeafCount = numel(leaves);
rootLeafIds = cell(size(rootBounds, 1), 1);
for k = 1:numel(leaves)
    rootLeafIds{leaves(k).RootId}(end + 1, 1) = leaves(k).Id;
end
mesh.SpatialIndex = struct( ...
    "AzimuthEdgesDeg", rootAzimuthEdges, ...
    "ElevationEdgesDeg", rootElevationEdges, ...
    "RootLeafIds", {rootLeafIds});
mesh.Stats = struct( ...
    "LeafCount", numel(leaves), ...
    "AdjacencyEdgeCount", size(adjacencyEdges, 1), ...
    "MaximumLevel", max(levels), ...
    "MinimumCellSizeDeg", min(cellSizes, [], 1), ...
    "MaximumCellSizeDeg", max(cellSizes, [], 1), ...
    "RetainedTimeSampleCount", numel(timeSeconds), ...
    "SourceTimeSampleCount", countSourceTimes(workspace, gridSpec), ...
    "FreeCellTimeSamples", freeSamples, ...
    "BlockedCellTimeSamples", blockedSamples, ...
    "UnresolvedCellTimeSamples", unresolvedSamples, ...
    "ForcedLeafCount", forcedLeafCount, ...
    "DenseMinimumGridVoxelEstimate", denseVoxelEstimate( ...
        gridSpec, min(cellSizes, [], 1), numel(timeSeconds)), ...
    "AdaptiveCellTimeSamples", numel(leaves) * numel(timeSeconds));
mesh.Notes = [ ...
    "Unresolved leaves are occupied for conservative planning."; ...
    "Safe intervals describe retained samples, not continuous time."; ...
    "Validate final paths against queryAzElTimeObstacle."];
end

function [state, freeByTime, blockedByTime, unresolvedByTime] = ...
        classifyCell(workspace, bounds, timeSeconds, options)
azimuth = [ ...
    mean(bounds(1:2)); bounds(1); bounds(2); bounds(2); bounds(1); ...
    mean(bounds(1:2)); bounds(2); mean(bounds(1:2)); bounds(1)];
elevation = [ ...
    mean(bounds(3:4)); bounds(3); bounds(3); bounds(4); bounds(4); ...
    bounds(3); mean(bounds(3:4)); bounds(4); mean(bounds(3:4))];
timeCount = numel(timeSeconds);
sampleCount = numel(azimuth);
sampleAzimuth = repmat(azimuth, timeCount, 1);
sampleElevation = repmat(elevation, timeCount, 1);
sampleTimes = repelem(timeSeconds, sampleCount);
queryOptions = struct( ...
    "SafetyMarginDeg", options.SafetyMarginDeg, ...
    "TimePaddingSamples", options.TimePaddingSamples);
occupiedSamples = queryAzElTimeObstacle(workspace, ...
    sampleAzimuth, sampleElevation, sampleTimes, queryOptions);
occupiedSamples = reshape(occupiedSamples, sampleCount, timeCount).';

halfDiagonal = 0.5 * hypot( ...
    diff(bounds(1:2)), diff(bounds(3:4)));
centerOccupiedInflated = queryAzElTimeObstacle(workspace, ...
    repmat(azimuth(1), timeCount, 1), ...
    repmat(elevation(1), timeCount, 1), timeSeconds, struct( ...
    "SafetyMarginDeg", options.SafetyMarginDeg + halfDiagonal, ...
    "TimePaddingSamples", options.TimePaddingSamples));

fullFree = ~centerOccupiedInflated(:);
fullBlocked = all(occupiedSamples, 2);
state = zeros(timeCount, 1, "int8");
state(fullFree) = 1;
state(fullBlocked & ~fullFree) = -1;
freeByTime = state == 1;
blockedByTime = state == -1;
unresolvedByTime = state == 0;
end

function [bounds, azimuthEdges, elevationEdges] = ...
        initialBounds(gridSpec, initialSize)
azimuthEdges = makeEdges( ...
    gridSpec.AzimuthLimitsDeg, initialSize(1));
elevationEdges = makeEdges( ...
    gridSpec.ElevationLimitsDeg, initialSize(2));
bounds = zeros( ...
    (numel(azimuthEdges) - 1) * (numel(elevationEdges) - 1), 4);
cursor = 1;
for elevation = 1:numel(elevationEdges) - 1
    for azimuth = 1:numel(azimuthEdges) - 1
        bounds(cursor, :) = [ ...
            azimuthEdges(azimuth), azimuthEdges(azimuth + 1), ...
            elevationEdges(elevation), elevationEdges(elevation + 1)];
        cursor = cursor + 1;
    end
end
end

function edges = makeEdges(limits, cellSize)
count = max(1, ceil(diff(limits) / cellSize));
edges = linspace(limits(1), limits(2), count + 1);
end

function tf = splittable(bounds, minimumSize)
sizeDeg = [diff(bounds(1:2)), diff(bounds(3:4))];
tf = any(sizeDeg > minimumSize .* (1 + 1e-10));
end

function children = splitBounds(bounds, minimumSize)
splitAzimuth = diff(bounds(1:2)) > minimumSize(1) * (1 + 1e-10);
splitElevation = diff(bounds(3:4)) > minimumSize(2) * (1 + 1e-10);
if ~splitAzimuth && ~splitElevation
    children = zeros(0, 4);
    return;
end
if splitAzimuth
    azimuthEdges = [bounds(1), mean(bounds(1:2)), bounds(2)];
else
    azimuthEdges = bounds(1:2);
end
if splitElevation
    elevationEdges = [bounds(3), mean(bounds(3:4)), bounds(4)];
else
    elevationEdges = bounds(3:4);
end
children = zeros( ...
    (numel(azimuthEdges) - 1) * (numel(elevationEdges) - 1), 4);
cursor = 1;
for elevation = 1:numel(elevationEdges) - 1
    for azimuth = 1:numel(azimuthEdges) - 1
        children(cursor, :) = [ ...
            azimuthEdges(azimuth), azimuthEdges(azimuth + 1), ...
            elevationEdges(elevation), elevationEdges(elevation + 1)];
        cursor = cursor + 1;
    end
end
end

function intervals = logicalRunsToIntervals(mask, timeSeconds)
mask = logical(mask(:));
changes = diff([false; mask; false]);
starts = changes(1:end - 1) == 1;
stops = changes(2:end) == -1;
intervals = [timeSeconds(starts), timeSeconds(stops)];
end

function [leaves, edges] = connectLeaves(leaves, gridSpec, allowWrap)
leafCount = numel(leaves);
neighbors = cell(leafCount, 1);
left = containers.Map("KeyType", "char", "ValueType", "any");
right = containers.Map("KeyType", "char", "ValueType", "any");
bottom = containers.Map("KeyType", "char", "ValueType", "any");
top = containers.Map("KeyType", "char", "ValueType", "any");
for k = 1:leafCount
    bounds = leaves(k).BoundsDeg;
    left = addEdge(left, bounds(1), [k bounds(3:4)]);
    right = addEdge(right, bounds(2), [k bounds(3:4)]);
    bottom = addEdge(bottom, bounds(3), [k bounds(1:2)]);
    top = addEdge(top, bounds(4), [k bounds(1:2)]);
end
neighbors = connectEdgeMaps(right, left, neighbors);
neighbors = connectEdgeMaps(top, bottom, neighbors);
if allowWrap
    rightKey = coordinateKey(gridSpec.AzimuthLimitsDeg(2));
    leftKey = coordinateKey(gridSpec.AzimuthLimitsDeg(1));
    if isKey(right, rightKey) && isKey(left, leftKey)
        neighbors = connectEdgeLists( ...
            right(rightKey), left(leftKey), neighbors);
    end
end
edgeParts = cell(leafCount, 1);
for k = 1:leafCount
    neighbors{k} = unique(uint32(neighbors{k}(:))).';
    leaves(k).NeighborIds = neighbors{k};
    greater = neighbors{k}(neighbors{k} > k);
    edgeParts{k} = [repmat(uint32(k), numel(greater), 1), greater(:)];
end
if any(~cellfun(@isempty, edgeParts))
    edges = vertcat(edgeParts{:});
else
    edges = zeros(0, 2, "uint32");
end
end

function map = addEdge(map, coordinate, row)
key = coordinateKey(coordinate);
if isKey(map, key)
    map(key) = [map(key); row];
else
    map(key) = row;
end
end

function neighbors = connectEdgeMaps(first, second, neighbors)
firstKeys = keys(first);
for k = 1:numel(firstKeys)
    key = firstKeys{k};
    if isKey(second, key)
        neighbors = connectEdgeLists(first(key), second(key), neighbors);
    end
end
end

function neighbors = connectEdgeLists(first, second, neighbors)
tolerance = 1e-10;
for a = 1:size(first, 1)
    overlap = min(first(a, 3), second(:, 3)) - ...
        max(first(a, 2), second(:, 2));
    matches = find(overlap > tolerance);
    for b = reshape(matches, 1, [])
        firstId = first(a, 1);
        secondId = second(b, 1);
        if firstId ~= secondId
            neighbors{firstId}(end + 1) = secondId;
            neighbors{secondId}(end + 1) = firstId;
        end
    end
end
end

function key = coordinateKey(value)
key = sprintf("%.12g", value);
end

function gridSpec = normalizeGridSpec(gridSpec, workspace)
if ~isstruct(gridSpec) || ~isscalar(gridSpec) || ...
        ~all(isfield(gridSpec, ...
        {'AzimuthLimitsDeg', 'ElevationLimitsDeg'}))
    error("buildAdaptiveAzElTimeMesh:InvalidGridSpec", ...
        "gridSpec must define azimuth and elevation limits.");
end
gridSpec.AzimuthLimitsDeg = normalizeLimits( ...
    gridSpec.AzimuthLimitsDeg, "AzimuthLimitsDeg");
gridSpec.ElevationLimitsDeg = normalizeLimits( ...
    gridSpec.ElevationLimitsDeg, "ElevationLimitsDeg");
available = workspaceTimeLimits(workspace);
if ~isfield(gridSpec, "TimeLimitsSeconds") || ...
        isempty(gridSpec.TimeLimitsSeconds)
    gridSpec.TimeLimitsSeconds = available;
else
    gridSpec.TimeLimitsSeconds = normalizeLimits( ...
        gridSpec.TimeLimitsSeconds, "TimeLimitsSeconds");
    if gridSpec.TimeLimitsSeconds(2) < available(1) || ...
            gridSpec.TimeLimitsSeconds(1) > available(2)
        error("buildAdaptiveAzElTimeMesh:TimeOutsideWorkspace", ...
            "TimeLimitsSeconds does not overlap the workspace.");
    end
end
end

function options = normalizeOptions(options)
defaults = struct( ...
    "InitialCellSizeDeg", [8 8], ...
    "MinimumCellSizeDeg", [0.5 0.5], ...
    "MaximumTimeSamples", 300, ...
    "TimeSeconds", [], ...
    "SafetyMarginDeg", 0, ...
    "TimePaddingSamples", 1, ...
    "MaximumLeafCells", 100000, ...
    "AllowAzimuthWrap", false);
options = applyDefaults(options, defaults);
options.InitialCellSizeDeg = normalizeCellSize( ...
    options.InitialCellSizeDeg, "InitialCellSizeDeg");
options.MinimumCellSizeDeg = normalizeCellSize( ...
    options.MinimumCellSizeDeg, "MinimumCellSizeDeg");
if any(options.MinimumCellSizeDeg >= options.InitialCellSizeDeg)
    error("buildAdaptiveAzElTimeMesh:InvalidCellSizes", ...
        "MinimumCellSizeDeg must be smaller than InitialCellSizeDeg.");
end
validateattributes(options.MaximumTimeSamples, {'numeric'}, ...
    {'scalar', 'integer', '>=', 2});
validateattributes(options.SafetyMarginDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.MaximumLeafCells, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.AllowAzimuthWrap, {'logical', 'numeric'}, ...
    {'scalar'});
options.AllowAzimuthWrap = logical(options.AllowAzimuthWrap);
end

function values = resolveTimes(workspace, gridSpec, options)
if ~isempty(options.TimeSeconds)
    values = double(options.TimeSeconds(:));
    validateattributes(values, {'numeric'}, ...
        {'vector', 'real', 'finite', 'nonempty'});
    if any(diff(values) <= 0) || ...
            values(1) < gridSpec.TimeLimitsSeconds(1) - 1e-9 || ...
            values(end) > gridSpec.TimeLimitsSeconds(2) + 1e-9
        error("buildAdaptiveAzElTimeMesh:InvalidTimeSeconds", ...
            "TimeSeconds must increase within TimeLimitsSeconds.");
    end
    return;
end
parts = cell(numel(workspace.Obstacles), 1);
for k = 1:numel(workspace.Obstacles)
    candidate = double(workspace.Obstacles(k).TimeSeconds(:));
    parts{k} = candidate(candidate >= gridSpec.TimeLimitsSeconds(1) & ...
        candidate <= gridSpec.TimeLimitsSeconds(2));
end
values = unique([gridSpec.TimeLimitsSeconds(:); vertcat(parts{:})]);
if numel(values) > options.MaximumTimeSamples
    target = linspace(values(1), values(end), ...
        options.MaximumTimeSamples).';
    index = interp1(values, (1:numel(values)).', target, "nearest");
    values = values(unique([1; round(index); numel(values)]));
end
end

function count = countSourceTimes(workspace, gridSpec)
parts = cell(numel(workspace.Obstacles), 1);
for k = 1:numel(workspace.Obstacles)
    values = double(workspace.Obstacles(k).TimeSeconds(:));
    parts{k} = values(values >= gridSpec.TimeLimitsSeconds(1) & ...
        values <= gridSpec.TimeLimitsSeconds(2));
end
count = numel(unique([gridSpec.TimeLimitsSeconds(:); vertcat(parts{:})]));
end

function count = denseVoxelEstimate(gridSpec, cellSize, timeCount)
spatial = ceil(diff(gridSpec.AzimuthLimitsDeg) / cellSize(1)) * ...
    ceil(diff(gridSpec.ElevationLimitsDeg) / cellSize(2));
count = double(spatial) * double(timeCount);
end

function limits = workspaceTimeLimits(workspace)
first = arrayfun(@(item) item.TimeSeconds(1), workspace.Obstacles);
last = arrayfun(@(item) item.TimeSeconds(end), workspace.Obstacles);
limits = [min(first), max(last)];
end

function validateWorkspace(workspace)
if ~isstruct(workspace) || ~isscalar(workspace) || ...
        ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace" || ...
        ~isfield(workspace, "Obstacles") || isempty(workspace.Obstacles)
    error("buildAdaptiveAzElTimeMesh:InvalidWorkspace", ...
        "Use buildAzElTimeObstacleWorkspace to create workspace.");
end
end

function value = normalizeLimits(value, name)
validateattributes(value, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
value = reshape(double(value), 1, 2);
if value(2) <= value(1)
    error("buildAdaptiveAzElTimeMesh:InvalidLimits", ...
        "%s must increase.", name);
end
end

function value = normalizeCellSize(value, name)
validateattributes(value, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
if isscalar(value)
    value = [value value];
elseif numel(value) ~= 2
    error("buildAdaptiveAzElTimeMesh:InvalidCellSize", ...
        "%s must be scalar or a two-element vector.", name);
end
value = reshape(double(value), 1, 2);
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

function item = emptyPending()
item = struct( ...
    "BoundsDeg", zeros(1, 4), ...
    "Level", uint16(0), ...
    "RootId", uint32(0));
end

function leaf = emptyLeaf(timeCount)
leaf = struct( ...
    "Id", uint32(0), ...
    "Level", uint16(0), ...
    "RootId", uint32(0), ...
    "BoundsDeg", zeros(1, 4), ...
    "CenterDeg", zeros(1, 2), ...
    "SizeDeg", zeros(1, 2), ...
    "FreeByTime", false(timeCount, 1), ...
    "BlockedByTime", false(timeCount, 1), ...
    "UnresolvedByTime", false(timeCount, 1), ...
    "SafeIntervals_s", zeros(0, 2), ...
    "BlockedIntervals_s", zeros(0, 2), ...
    "NeighborIds", zeros(1, 0, "uint32"));
end
