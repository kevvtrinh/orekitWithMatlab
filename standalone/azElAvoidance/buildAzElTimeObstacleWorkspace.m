function workspace = buildAzElTimeObstacleWorkspace(azElData, options)
%BUILDAZELTIMEOBSTACLEWORKSPACE Pack moving az/el polygons for path planning.
%
% workspace = buildAzElTimeObstacleWorkspace(azElData)
% workspace = buildAzElTimeObstacleWorkspace([data1, data2, ...], options)
% workspace = buildAzElTimeObstacleWorkspace({data1, data2, ...}, options)
%
% Each scalar azElData struct becomes an independent obstacle. Struct arrays,
% cell arrays, and nested mixtures are accepted. The output is an implicit
% 3-D obstacle workspace whose coordinates are sensor azimuth, sensor
% elevation, and time_s. Boundaries are packed into contiguous
% single-precision arrays and each slice has a precomputed bounding box.
%
% Options:
%   MaximumVerticesPerRegion  Boundary cap per region (default 64). Use Inf
%                             to retain every input vertex.
%   ReferenceTime             Optional mission datetime at time_s == 0.
%
% Use QUERYAZELTIMEOBSTACLE for collision tests and
% PLOTAZELTIMEOBSTACLEWORKSPACE for a decimated static 3-D view.

if nargin < 2
    options = struct();
end
defaults = struct( ...
    "MaximumVerticesPerRegion", 64, ...
    "ReferenceTime", []);
options = applyDefaults(options, defaults);
validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
if isfinite(options.MaximumVerticesPerRegion)
    validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
        {'integer', '>=', 4});
end
dataList = combineAzElObstacles(azElData);
referenceTime = normalizeReferenceTime(options.ReferenceTime);
obstacles = repmat(emptyObstacle(), numel(dataList), 1);
for k = 1:numel(dataList)
    obstacles(k) = packObstacle(dataList(k), options);
end

workspace = struct();
workspace.Format = "AzElTimeObstacleWorkspace";
workspace.Version = 2;
workspace.ReferenceTime = referenceTime;
workspace.Obstacles = obstacles;
workspace.ObstacleCount = numel(obstacles);
workspace.Options = options;
workspace.EstimatedStorageBytes = sum([obstacles.EstimatedStorageBytes]);
end

function referenceTime = normalizeReferenceTime(requested)
if isempty(requested)
    referenceTime = datetime(1970, 1, 1, 0, 0, 0, ...
        "TimeZone", "UTC");
else
    referenceTime = ensureUtc(requested);
    if ~isscalar(referenceTime) || isnat(referenceTime)
        error("buildAzElTimeObstacleWorkspace:InvalidReferenceTime", ...
            "ReferenceTime must be a finite datetime scalar.");
    end
end
end

function obstacle = packObstacle(data, options)
timeSeconds = data.time_s;
n = numel(timeSeconds);

% First pass computes exact storage sizes. This avoids growing the packed
% arrays across long missions with tens of thousands of slices.
counts = zeros(n, 1, "uint64");
edgeCounts = zeros(n, 1, "uint64");
bounds = nan(n, 4, "single");
for k = 1:n
    [azimuth, elevation, sliceBounds] = prepareSlice( ...
        data.az_deg{k}, data.el_deg{k}, ...
        options.MaximumVerticesPerRegion);
    counts(k) = uint64(numel(azimuth));
    edgeCounts(k) = uint64(countSliceEdges(azimuth, elevation));
    bounds(k, :) = single(sliceBounds);
end

offsets = ones(n + 1, 1, "uint64");
edgeOffsets = ones(n + 1, 1, "uint64");
for k = 1:n
    offsets(k + 1) = offsets(k) + counts(k);
    edgeOffsets(k + 1) = edgeOffsets(k) + edgeCounts(k);
end
packedCount = double(offsets(end) - 1);
packedEdgeCount = double(edgeOffsets(end) - 1);
% Vertices support reconstruction and plotting; explicit edges support the
% vectorized point-in-polygon and safety-margin narrow phases.
packedAzimuth = nan(packedCount, 1, "single");
packedElevation = nan(packedCount, 1, "single");
edgeStartAzimuth = nan(packedEdgeCount, 1, "single");
edgeStartElevation = nan(packedEdgeCount, 1, "single");
edgeEndAzimuth = nan(packedEdgeCount, 1, "single");
edgeEndElevation = nan(packedEdgeCount, 1, "single");
for k = 1:n
    if counts(k) == 0
        continue;
    end
    [azimuth, elevation] = prepareSlice( ...
        data.az_deg{k}, data.el_deg{k}, ...
        options.MaximumVerticesPerRegion);
    index = double(offsets(k)):double(offsets(k + 1) - 1);
    packedAzimuth(index) = single(azimuth);
    packedElevation(index) = single(elevation);
    if edgeCounts(k) > 0
        [startAz, startEl, endAz, endEl] = sliceEdges(azimuth, elevation);
        edgeIndex = double(edgeOffsets(k)):double(edgeOffsets(k + 1) - 1);
        edgeStartAzimuth(edgeIndex) = single(startAz);
        edgeStartElevation(edgeIndex) = single(startEl);
        edgeEndAzimuth(edgeIndex) = single(endAz);
        edgeEndElevation(edgeIndex) = single(endEl);
    end
end

name = string(data.targetName);
[isUniform, sampleStep] = uniformSampling(timeSeconds);

obstacle = emptyObstacle();
obstacle.Name = name;
obstacle.TimeSeconds = timeSeconds;
obstacle.IsUniformTime = isUniform;
obstacle.TimeStepSeconds = sampleStep;
obstacle.SliceOffsets = offsets;
obstacle.AzimuthDeg = packedAzimuth;
obstacle.ElevationDeg = packedElevation;
obstacle.EdgeOffsets = edgeOffsets;
obstacle.EdgeStartAzimuthDeg = edgeStartAzimuth;
obstacle.EdgeStartElevationDeg = edgeStartElevation;
obstacle.EdgeEndAzimuthDeg = edgeEndAzimuth;
obstacle.EdgeEndElevationDeg = edgeEndElevation;
obstacle.BoundsDeg = bounds;
obstacle.SampleCount = n;
obstacle.PackedVertexCount = packedCount;
obstacle.PackedEdgeCount = packedEdgeCount;
obstacle.EstimatedStorageBytes = estimateStorage(obstacle);
end

function count = countSliceEdges(azimuth, elevation)
finite = isfinite(azimuth) & isfinite(elevation);
if ~any(finite)
    count = 0;
    return;
end
if all(finite)
    count = numel(azimuth);
    if count > 1 && hypot(azimuth(1) - azimuth(end), ...
            elevation(1) - elevation(end)) <= 1e-12
        count = count - 1;
    end
    return;
end
changes = diff([false; finite; false]);
% NaN rows separate independent polygon regions in one time slice.
starts = find(changes == 1);
stops = find(changes == -1) - 1;
count = 0;
for region = 1:numel(starts)
    index = starts(region):stops(region);
    regionAzimuth = azimuth(index);
    regionElevation = elevation(index);
    nextAzimuth = circshift(regionAzimuth, -1);
    nextElevation = circshift(regionElevation, -1);
    count = count + nnz(hypot(nextAzimuth - regionAzimuth, ...
        nextElevation - regionElevation) > 1e-12);
end
end

function [startAzimuth, startElevation, endAzimuth, endElevation] = ...
        sliceEdges(azimuth, elevation)
finite = isfinite(azimuth) & isfinite(elevation);
if ~any(finite)
    startAzimuth = zeros(0, 1);
    startElevation = zeros(0, 1);
    endAzimuth = zeros(0, 1);
    endElevation = zeros(0, 1);
    return;
end
if all(finite)
    % A repeated closing vertex already supplies every edge except the
    % zero-length last-to-first edge. Otherwise close the polygon explicitly.
    if numel(azimuth) > 1 && hypot(azimuth(1) - azimuth(end), ...
            elevation(1) - elevation(end)) <= 1e-12
        startAzimuth = azimuth(1:end - 1);
        startElevation = elevation(1:end - 1);
        endAzimuth = azimuth(2:end);
        endElevation = elevation(2:end);
    else
        startAzimuth = azimuth;
        startElevation = elevation;
        endAzimuth = circshift(azimuth, -1);
        endElevation = circshift(elevation, -1);
    end
    return;
end
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
edgeCounts = max(0, stops - starts + 1);
total = sum(edgeCounts);
startAzimuth = zeros(total, 1);
startElevation = zeros(total, 1);
endAzimuth = zeros(total, 1);
endElevation = zeros(total, 1);
cursor = 1;
for region = 1:numel(starts)
    index = starts(region):stops(region);
    regionAzimuth = azimuth(index);
    regionElevation = elevation(index);
    nextAzimuth = circshift(regionAzimuth, -1);
    nextElevation = circshift(regionElevation, -1);
    nonzero = hypot(nextAzimuth - regionAzimuth, ...
        nextElevation - regionElevation) > 1e-12;
    regionAzimuth = regionAzimuth(nonzero);
    regionElevation = regionElevation(nonzero);
    nextAzimuth = nextAzimuth(nonzero);
    nextElevation = nextElevation(nonzero);
    count = numel(regionAzimuth);
    output = cursor:cursor + count - 1;
    startAzimuth(output) = regionAzimuth;
    startElevation(output) = regionElevation;
    endAzimuth(output) = nextAzimuth;
    endElevation(output) = nextElevation;
    cursor = cursor + count;
end
startAzimuth = startAzimuth(1:cursor - 1);
startElevation = startElevation(1:cursor - 1);
endAzimuth = endAzimuth(1:cursor - 1);
endElevation = endElevation(1:cursor - 1);
end

function [azimuthOut, elevationOut, bounds] = prepareSlice( ...
        azimuthIn, elevationIn, maximumVertices)
azimuth = double(azimuthIn(:));
elevation = double(elevationIn(:));
count = min(numel(azimuth), numel(elevation));
azimuth = azimuth(1:count);
elevation = elevation(1:count);
finite = isfinite(azimuth) & isfinite(elevation);
if ~any(finite)
    azimuthOut = zeros(0, 1);
    elevationOut = zeros(0, 1);
    bounds = nan(1, 4);
    return;
end
bounds = [min(azimuth(finite)), max(azimuth(finite)), ...
    min(elevation(finite)), max(elevation(finite))];
if all(finite)
    [azimuthOut, elevationOut] = reduceRegion( ...
        azimuth, elevation, maximumVertices);
    return;
end

% Preserve NaN-separated regions as separate rings. Reducing each ring
% independently prevents a false edge from connecting disconnected regions.
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
azimuthParts = cell(numel(starts), 1);
elevationParts = cell(numel(starts), 1);
partCount = 0;
for region = 1:numel(starts)
    index = starts(region):stops(region);
    if numel(index) < 3
        continue;
    end
    [regionAzimuth, regionElevation] = reduceRegion( ...
        azimuth(index), elevation(index), maximumVertices);
    if numel(regionAzimuth) < 3
        continue;
    end
    partCount = partCount + 1;
    azimuthParts{partCount} = regionAzimuth;
    elevationParts{partCount} = regionElevation;
end
if partCount == 0
    azimuthOut = zeros(0, 1);
    elevationOut = zeros(0, 1);
    return;
end
azimuthParts = azimuthParts(1:partCount);
elevationParts = elevationParts(1:partCount);
outputCount = sum(cellfun(@numel, azimuthParts)) + partCount - 1;
azimuthOut = nan(outputCount, 1);
elevationOut = nan(outputCount, 1);
cursor = 1;
for k = 1:partCount
    count = numel(azimuthParts{k});
    index = cursor:cursor + count - 1;
    azimuthOut(index) = azimuthParts{k};
    elevationOut(index) = elevationParts{k};
    cursor = cursor + count + 1;
end
end

function [azimuth, elevation] = reduceRegion( ...
        azimuth, elevation, maximumVertices)
isClosed = numel(azimuth) > 3 && ...
    hypot(azimuth(1) - azimuth(end), ...
    elevation(1) - elevation(end)) < 1e-10;
if ~isfinite(maximumVertices) || numel(azimuth) <= maximumVertices
    return;
end
% Uniform boundary subsampling is a storage/performance control, not a
% geometric simplifier. Preserve explicit ring closure when it is present.
if isClosed
    retained = maximumVertices - 1;
    index = round(linspace(1, numel(azimuth) - 1, retained));
    azimuth = [azimuth(index); azimuth(index(1))];
    elevation = [elevation(index); elevation(index(1))];
else
    index = round(linspace(1, numel(azimuth), maximumVertices));
    azimuth = azimuth(index);
    elevation = elevation(index);
end
end

function [isUniform, sampleStep] = uniformSampling(timeSeconds)
if numel(timeSeconds) < 2
    isUniform = true;
    sampleStep = NaN;
    return;
end
delta = diff(timeSeconds);
sampleStep = median(delta);
tolerance = max(1e-9, abs(sampleStep) * 1e-9);
isUniform = all(abs(delta - sampleStep) <= tolerance);
if ~isUniform
    sampleStep = NaN;
end
end

function bytes = estimateStorage(obstacle)
bytes = 8 * numel(obstacle.TimeSeconds) + ...
    8 * (numel(obstacle.SliceOffsets) + numel(obstacle.EdgeOffsets)) + ...
    4 * (numel(obstacle.AzimuthDeg) + numel(obstacle.ElevationDeg) + ...
    numel(obstacle.EdgeStartAzimuthDeg) + ...
    numel(obstacle.EdgeStartElevationDeg) + ...
    numel(obstacle.EdgeEndAzimuthDeg) + ...
    numel(obstacle.EdgeEndElevationDeg) + ...
    numel(obstacle.BoundsDeg));
end

function times = ensureUtc(times)
if ~isdatetime(times)
    error("buildAzElTimeObstacleWorkspace:InvalidTime", ...
        "Time must be a datetime vector.");
end
times.TimeZone = "UTC";
end

function options = applyDefaults(options, defaults)
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(options, names{k}) || isempty(options.(names{k}))
        options.(names{k}) = defaults.(names{k});
    end
end
end

function obstacle = emptyObstacle()
obstacle = struct( ...
    "Name", "", ...
    "TimeSeconds", zeros(0, 1), ...
    "IsUniformTime", false, ...
    "TimeStepSeconds", NaN, ...
    "SliceOffsets", ones(1, 1, "uint64"), ...
    "AzimuthDeg", single.empty(0, 1), ...
    "ElevationDeg", single.empty(0, 1), ...
    "EdgeOffsets", ones(1, 1, "uint64"), ...
    "EdgeStartAzimuthDeg", single.empty(0, 1), ...
    "EdgeStartElevationDeg", single.empty(0, 1), ...
    "EdgeEndAzimuthDeg", single.empty(0, 1), ...
    "EdgeEndElevationDeg", single.empty(0, 1), ...
    "BoundsDeg", single.empty(0, 4), ...
    "SampleCount", 0, ...
    "PackedVertexCount", 0, ...
    "PackedEdgeCount", 0, ...
    "EstimatedStorageBytes", 0);
end
