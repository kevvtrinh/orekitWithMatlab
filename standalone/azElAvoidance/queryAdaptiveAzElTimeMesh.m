function [occupied, details] = queryAdaptiveAzElTimeMesh( ...
        mesh, azimuthDeg, elevationDeg, queryTime)
%QUERYADAPTIVEAZELTIMEMESH Query adaptive leaf state at az/el/time points.
%
% [occupied, details] = queryAdaptiveAzElTimeMesh(mesh, az, el, time)
%
% Numeric time is seconds on mesh.TimeSeconds. Datetime input is converted
% relative to mesh.ReferenceTime. The nearest retained time page is used.
% Unresolved cells are conservatively returned as occupied.

validateMesh(mesh);
[azimuthDeg, elevationDeg, timeSeconds, outputSize] = normalizeInputs( ...
    azimuthDeg, elevationDeg, queryTime, mesh.ReferenceTime);
queryCount = numel(azimuthDeg);
occupied = true(queryCount, 1);
leafId = zeros(queryCount, 1, "uint32");
timeIndex = zeros(queryCount, 1, "uint32");
isFree = false(queryCount, 1);
isBlocked = false(queryCount, 1);
isUnresolved = true(queryCount, 1);

allBounds = vertcat(mesh.Leaves.BoundsDeg);
for k = 1:queryCount
    if ~all(isfinite([azimuthDeg(k), elevationDeg(k), timeSeconds(k)]))
        continue;
    end
    azimuth = wrapIfRequested(azimuthDeg(k), mesh);
    candidates = spatialCandidates(mesh, azimuth, elevationDeg(k));
    bounds = allBounds(candidates, :);
    atAzimuthMaximum = abs( ...
        bounds(:, 2) - mesh.GridSpec.AzimuthLimitsDeg(2)) <= 1e-12;
    atElevationMaximum = abs( ...
        bounds(:, 4) - mesh.GridSpec.ElevationLimitsDeg(2)) <= 1e-12;
    inside = azimuth >= bounds(:, 1) - 1e-12 & ...
        (azimuth < bounds(:, 2) - 1e-12 | ...
        (atAzimuthMaximum & azimuth <= bounds(:, 2) + 1e-12)) & ...
        elevationDeg(k) >= bounds(:, 3) - 1e-12 & ...
        (elevationDeg(k) < bounds(:, 4) - 1e-12 | ...
        (atElevationMaximum & ...
        elevationDeg(k) <= bounds(:, 4) + 1e-12));
    candidates = candidates(inside);
    if isempty(candidates) || ...
            timeSeconds(k) < mesh.TimeSeconds(1) || ...
            timeSeconds(k) > mesh.TimeSeconds(end)
        continue;
    end
    if numel(candidates) > 1
        areas = prod(vertcat(mesh.Leaves(candidates).SizeDeg), 2);
        [~, smallest] = min(areas);
        candidates = candidates(smallest);
    end
    [~, page] = min(abs(mesh.TimeSeconds - timeSeconds(k)));
    leafId(k) = uint32(candidates);
    timeIndex(k) = uint32(page);
    isFree(k) = mesh.Leaves(candidates).FreeByTime(page);
    isBlocked(k) = mesh.Leaves(candidates).BlockedByTime(page);
    isUnresolved(k) = mesh.Leaves(candidates).UnresolvedByTime(page);
    occupied(k) = ~isFree(k);
end

occupied = reshape(occupied, outputSize);
details = struct( ...
    "LeafId", reshape(leafId, outputSize), ...
    "TimeIndex", reshape(timeIndex, outputSize), ...
    "IsFree", reshape(isFree, outputSize), ...
    "IsBlocked", reshape(isBlocked, outputSize), ...
    "IsUnresolved", reshape(isUnresolved, outputSize), ...
    "QueryTimeSeconds", reshape(timeSeconds, outputSize));
end

function candidates = spatialCandidates(mesh, azimuth, elevation)
if ~isfield(mesh, "SpatialIndex") || ...
        ~isfield(mesh.SpatialIndex, "RootLeafIds")
    candidates = (1:numel(mesh.Leaves)).';
    return;
end
azimuthBin = discretize( ...
    azimuth, mesh.SpatialIndex.AzimuthEdgesDeg);
elevationBin = discretize( ...
    elevation, mesh.SpatialIndex.ElevationEdgesDeg);
if isnan(azimuthBin) || isnan(elevationBin)
    candidates = zeros(0, 1);
    return;
end
azimuthCount = numel(mesh.SpatialIndex.AzimuthEdgesDeg) - 1;
rootId = (elevationBin - 1) * azimuthCount + azimuthBin;
candidates = double(mesh.SpatialIndex.RootLeafIds{rootId});
end

function value = wrapIfRequested(value, mesh)
limits = mesh.GridSpec.AzimuthLimitsDeg;
if mesh.Options.AllowAzimuthWrap
    width = diff(limits);
    value = mod(value - limits(1), width) + limits(1);
    if abs(value - limits(1)) < 1e-12 && ...
            abs(value - limits(2)) < abs(value - limits(1))
        value = limits(2);
    end
end
end

function [azimuth, elevation, timeSeconds, outputSize] = ...
        normalizeInputs(azimuth, elevation, queryTime, referenceTime)
if isdatetime(queryTime)
    timeSeconds = seconds(queryTime - referenceTime);
else
    timeSeconds = double(queryTime);
end
values = {double(azimuth), double(elevation), double(timeSeconds)};
counts = cellfun(@numel, values);
nonScalar = find(counts > 1, 1, "first");
if isempty(nonScalar)
    outputSize = [1 1];
else
    outputSize = size(values{nonScalar});
end
targetCount = max(counts);
for k = 1:numel(values)
    if isscalar(values{k})
        values{k} = repmat(values{k}, targetCount, 1);
    elseif numel(values{k}) ~= targetCount
        error("queryAdaptiveAzElTimeMesh:IncompatibleInputs", ...
            "Inputs must be scalar or have equal element counts.");
    end
    values{k} = values{k}(:);
end
azimuth = values{1};
elevation = values{2};
timeSeconds = values{3};
end

function validateMesh(mesh)
if ~isstruct(mesh) || ~isscalar(mesh) || ...
        ~isfield(mesh, "Format") || ...
        mesh.Format ~= "AdaptiveAzElTimeMesh"
    error("queryAdaptiveAzElTimeMesh:InvalidMesh", ...
        "Use buildAdaptiveAzElTimeMesh to create mesh.");
end
end
