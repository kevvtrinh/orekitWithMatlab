function workspace = buildAzElTimeObstacleWorkspace(azElData, options)
%BUILDAZELTIMEOBSTACLEWORKSPACE Pack moving az/el polygons for path planning.
%
% workspace = buildAzElTimeObstacleWorkspace(azElData)
% workspace = buildAzElTimeObstacleWorkspace({data1, data2, ...}, options)
%
% Inputs may be COMPUTEAREATARGETAZELSWEEP results or compact structs with
% targetName, time_s, az_deg, el_deg, and status fields. The output is an
% implicit 3-D obstacle workspace whose coordinates are sensor azimuth,
% sensor elevation, and time. Boundaries are packed into contiguous
% single-precision arrays and each time slice has a precomputed bounding
% box. This avoids allocating a dense az/el/time voxel array.
%
% Options:
%   MaximumVerticesPerRegion  Boundary cap per region (default 64). Use Inf
%                             to retain every input vertex.
%   PreserveCommandPath       Retain centroid commands (default true).
%   ReferenceTime             Mission epoch for compact time_s input.
%
% Use QUERYAZELTIMEOBSTACLE for collision tests and
% PLOTAZELTIMEOBSTACLEWORKSPACE for a decimated static 3-D view.

if nargin < 2
    options = struct();
end
defaults = struct( ...
    "MaximumVerticesPerRegion", 64, ...
    "PreserveCommandPath", true, ...
    "ReferenceTime", []);
options = applyDefaults(options, defaults);
validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
if isfinite(options.MaximumVerticesPerRegion)
    validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
        {'integer', '>=', 4});
end
validateattributes(options.PreserveCommandPath, {'logical', 'numeric'}, ...
    {'scalar'});

dataList = normalizeInputs(azElData);
referenceTime = chooseReferenceTime(dataList, options.ReferenceTime);
for k = 1:numel(dataList)
    dataList{k} = normalizeAzElTimeObstacleData(dataList{k}, struct( ...
        "ReferenceTime", referenceTime));
end
obstacles = repmat(emptyObstacle(), numel(dataList), 1);
for k = 1:numel(dataList)
    obstacles(k) = packObstacle(dataList{k}, referenceTime, options);
end

workspace = struct();
workspace.Format = "AzElTimeObstacleWorkspace";
workspace.Version = 1;
workspace.ReferenceTime = referenceTime;
workspace.Obstacles = obstacles;
workspace.ObstacleCount = numel(obstacles);
workspace.Options = options;
workspace.EstimatedStorageBytes = sum([obstacles.EstimatedStorageBytes]);
end

function dataList = normalizeInputs(input)
if iscell(input)
    dataList = input(:);
elseif isstruct(input)
    dataList = cell(numel(input), 1);
    for k = 1:numel(input)
        dataList{k} = input(k);
    end
else
    error("buildAzElTimeObstacleWorkspace:InvalidInput", ...
        "Input must be an az/el result struct, struct array, or cell array.");
end
if isempty(dataList)
    error("buildAzElTimeObstacleWorkspace:EmptyInput", ...
        "At least one az/el obstacle is required.");
end
for k = 1:numel(dataList)
    if ~isstruct(dataList{k}) || ~isscalar(dataList{k})
        error("buildAzElTimeObstacleWorkspace:InvalidInput", ...
            "Obstacle %d must be a scalar az/el data struct.", k);
    end
end
end

function referenceTime = chooseReferenceTime(dataList, requested)
if ~isempty(requested)
    referenceTime = ensureUtc(requested);
    if ~isscalar(referenceTime) || isnat(referenceTime)
        error("buildAzElTimeObstacleWorkspace:InvalidReferenceTime", ...
            "ReferenceTime must be a finite datetime scalar.");
    end
    return;
end
isCompact = false(numel(dataList), 1);
isNative = false(numel(dataList), 1);
for k = 1:numel(dataList)
    isCompact(k) = all(isfield(dataList{k}, ...
        {'time_s', 'az_deg', 'el_deg'}));
    isNative(k) = all(isfield(dataList{k}, ...
        {'Time', 'AzimuthDeg', 'ElevationDeg'}));
end
if all(isCompact & ~isNative)
    referenceTime = datetime(1970, 1, 1, 0, 0, 0, ...
        "TimeZone", "UTC");
elseif all(isNative)
    firstTimes = NaT(numel(dataList), 1, "TimeZone", "UTC");
    for k = 1:numel(dataList)
        times = ensureUtc(dataList{k}.Time);
        if isempty(times) || any(isnat(times))
            error("buildAzElTimeObstacleWorkspace:InvalidTime", ...
                "Obstacle %d must contain finite datetime samples.", k);
        end
        firstTimes(k) = min(times);
    end
    referenceTime = min(firstTimes);
else
    error("buildAzElTimeObstacleWorkspace:MixedTimeFormats", ...
        ["Mixed compact and native inputs require options.ReferenceTime " ...
        "to define their common epoch."]);
end
end

function obstacle = packObstacle(data, referenceTime, options)
times = ensureUtc(data.Time(:));
n = numel(times);
if ~iscell(data.AzimuthDeg) || ~iscell(data.ElevationDeg) || ...
        numel(data.AzimuthDeg) ~= n || numel(data.ElevationDeg) ~= n
    error("buildAzElTimeObstacleWorkspace:InvalidBoundary", ...
        "AzimuthDeg and ElevationDeg must be cells matching Time.");
end
timeSeconds = seconds(times - referenceTime);
if any(diff(timeSeconds) <= 0)
    error("buildAzElTimeObstacleWorkspace:InvalidTime", ...
        "Obstacle time samples must be strictly increasing.");
end

counts = zeros(n, 1, "uint64");
edgeCounts = zeros(n, 1, "uint64");
bounds = nan(n, 4, "single");
for k = 1:n
    [azimuth, elevation, sliceBounds] = prepareSlice( ...
        data.AzimuthDeg{k}, data.ElevationDeg{k}, ...
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
        data.AzimuthDeg{k}, data.ElevationDeg{k}, ...
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

name = getTextField(data, "TargetName", "Obstacle");
parentName = getTextField(data, "ParentName", "");
sensorName = getTextField(data, "SensorName", "");
[isUniform, sampleStep] = uniformSampling(timeSeconds);

obstacle = emptyObstacle();
obstacle.Name = name;
obstacle.ParentName = parentName;
obstacle.SensorName = sensorName;
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
if options.PreserveCommandPath
    obstacle.CommandAzimuthDeg = copyVectorField( ...
        data, "CommandAzimuthDeg", n);
    obstacle.CommandElevationDeg = copyVectorField( ...
        data, "CommandElevationDeg", n);
else
    obstacle.CommandAzimuthDeg = single.empty(0, 1);
    obstacle.CommandElevationDeg = single.empty(0, 1);
end
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

function value = copyVectorField(data, fieldName, n)
if isfield(data, fieldName) && numel(data.(fieldName)) == n
    value = single(data.(fieldName)(:));
else
    value = nan(n, 1, "single");
end
end

function value = getTextField(data, fieldName, fallback)
if isfield(data, fieldName) && ~isempty(data.(fieldName))
    value = string(data.(fieldName));
    value = value(1);
else
    value = string(fallback);
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
    numel(obstacle.BoundsDeg) + numel(obstacle.CommandAzimuthDeg) + ...
    numel(obstacle.CommandElevationDeg));
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
    "ParentName", "", ...
    "SensorName", "", ...
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
    "CommandAzimuthDeg", single.empty(0, 1), ...
    "CommandElevationDeg", single.empty(0, 1), ...
    "EstimatedStorageBytes", 0);
end
