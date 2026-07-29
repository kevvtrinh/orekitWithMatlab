function [occupied, info] = queryAzElTimeWorkspacePyramid( ...
        pyramid, azimuthDeg, elevationDeg, timeSeconds, options)
%QUERYAZELTIMEWORKSPACEPYRAMID Query fine patches before the coarse raster.
%
% [occupied, info] = queryAzElTimeWorkspacePyramid( ...
%     pyramid, azimuthDeg, elevationDeg, timeSeconds)
%
% Fine patches are searched newest-first. Queries not covered by a patch use
% the coarse raster. Coarse cells marked for refinement are unresolved; by
% default they are treated as occupied so a coarse search cannot silently
% pass through uncertain geometry.
%
% Option:
%   TreatUnresolvedAsOccupied  Default true.
%
% info fields:
%   RawOccupancy     Occupancy stored at the selected level.
%   NeedsRefinement  True for unresolved coarse cells.
%   Level            "coarse" or "fine-N".
%   CellSizeDeg      Selected [azimuth elevation] cell size.

if nargin < 5
    options = struct();
end
if ~isfield(options, "TreatUnresolvedAsOccupied") || ...
        isempty(options.TreatUnresolvedAsOccupied)
    options.TreatUnresolvedAsOccupied = true;
end
validateattributes(options.TreatUnresolvedAsOccupied, ...
    {'logical', 'numeric'}, {'scalar'});
options.TreatUnresolvedAsOccupied = ...
    logical(options.TreatUnresolvedAsOccupied);
validatePyramid(pyramid);
[azimuthDeg, elevationDeg, timeSeconds, outputSize] = ...
    normalizeQueries(azimuthDeg, elevationDeg, timeSeconds);
globalRegion = struct( ...
    "AzimuthLimitsDeg", pyramid.GridSpec.AzimuthLimitsDeg, ...
    "ElevationLimitsDeg", pyramid.GridSpec.ElevationLimitsDeg, ...
    "TimeLimitsSeconds", pyramid.GridSpec.TimeLimitsSeconds);
if any(~insideRegion( ...
        globalRegion, azimuthDeg, elevationDeg, timeSeconds))
    error("queryAzElTimeWorkspacePyramid:QueryOutsidePyramid", ...
        "Every query must lie inside the pyramid limits.");
end

count = numel(azimuthDeg);
raw = false(count, 1);
needsRefinement = false(count, 1);
level = strings(count, 1);
cellSize = nan(count, 2);
resolved = false(count, 1);

for patchIndex = numel(pyramid.FinePatches):-1:1
    patch = pyramid.FinePatches(patchIndex);
    candidate = ~resolved & insideRegion( ...
        patch.Region, azimuthDeg, elevationDeg, timeSeconds);
    if ~any(candidate)
        continue;
    end
    raw(candidate) = sampleGrid(patch.Grid, ...
        azimuthDeg(candidate), elevationDeg(candidate), ...
        timeSeconds(candidate));
    level(candidate) = "fine-" + patch.Id;
    cellSize(candidate, :) = repmat( ...
        patch.Grid.CellSizeDeg, nnz(candidate), 1);
    resolved(candidate) = true;
end

coarseQuery = ~resolved;
if any(coarseQuery)
    [raw(coarseQuery), coarseLinear] = sampleGrid( ...
        pyramid.Coarse, azimuthDeg(coarseQuery), ...
        elevationDeg(coarseQuery), timeSeconds(coarseQuery));
    candidateMask = pyramid.RefinementCandidateMask;
    needsRefinement(coarseQuery) = candidateMask(coarseLinear);
    level(coarseQuery) = "coarse";
    cellSize(coarseQuery, :) = repmat( ...
        pyramid.Coarse.CellSizeDeg, nnz(coarseQuery), 1);
end

occupied = raw;
if options.TreatUnresolvedAsOccupied
    occupied = occupied | needsRefinement;
end
occupied = reshape(occupied, outputSize);
info = struct( ...
    "RawOccupancy", reshape(raw, outputSize), ...
    "NeedsRefinement", reshape(needsRefinement, outputSize), ...
    "Level", reshape(level, outputSize), ...
    "CellSizeDeg", reshape(cellSize, [outputSize, 2]));
end

function validatePyramid(pyramid)
if ~isstruct(pyramid) || ~isscalar(pyramid) || ...
        ~isfield(pyramid, "Format") || ...
        pyramid.Format ~= "AzElTimeWorkspacePyramid"
    error("queryAzElTimeWorkspacePyramid:InvalidPyramid", ...
        "Use buildAzElTimeWorkspacePyramid to create pyramid.");
end
end

function inside = insideRegion(region, azimuth, elevation, time)
inside = azimuth >= region.AzimuthLimitsDeg(1) & ...
    azimuth <= region.AzimuthLimitsDeg(2) & ...
    elevation >= region.ElevationLimitsDeg(1) & ...
    elevation <= region.ElevationLimitsDeg(2) & ...
    time >= region.TimeLimitsSeconds(1) & ...
    time <= region.TimeLimitsSeconds(2);
end

function [occupied, linearIndex] = sampleGrid( ...
        grid, azimuth, elevation, time)
azimuthCount = numel(grid.AzimuthCentersDeg);
elevationCount = numel(grid.ElevationCentersDeg);
timeCount = numel(grid.TimeSeconds);
azimuthMinimum = grid.GridSpec.AzimuthLimitsDeg(1);
elevationMinimum = grid.GridSpec.ElevationLimitsDeg(1);

azimuthIndex = floor((azimuth - azimuthMinimum) / ...
    grid.CellSizeDeg(1)) + 1;
elevationIndex = floor((elevation - elevationMinimum) / ...
    grid.CellSizeDeg(2)) + 1;
azimuthIndex = min(max(azimuthIndex, 1), azimuthCount);
elevationIndex = min(max(elevationIndex, 1), elevationCount);
if timeCount == 1
    timeIndex = ones(size(time));
else
    timeIndex = interp1(grid.TimeSeconds, (1:timeCount).', ...
        time, "nearest", "extrap");
end
timeIndex = min(max(round(timeIndex), 1), timeCount);
linearIndex = sub2ind( ...
    [elevationCount, azimuthCount, timeCount], ...
    elevationIndex, azimuthIndex, timeIndex);
occupied = grid.Occupancy(linearIndex);
end

function [azimuth, elevation, time, outputSize] = ...
        normalizeQueries(azimuth, elevation, time)
values = {double(azimuth), double(elevation), double(time)};
lengths = cellfun(@numel, values);
nonScalar = lengths(lengths > 1);
if isempty(nonScalar)
    outputSize = size(values{1});
    targetCount = 1;
elseif any(nonScalar ~= nonScalar(1))
    error("queryAzElTimeWorkspacePyramid:SizeMismatch", ...
        "Non-scalar query inputs must have equal size.");
else
    targetCount = nonScalar(1);
    source = find(lengths == targetCount, 1);
    outputSize = size(values{source});
end
for k = 1:3
    if lengths(k) == 1
        values{k} = repmat(values{k}, targetCount, 1);
    elseif ~isequal(size(values{k}), outputSize)
        values{k} = reshape(values{k}, outputSize);
    end
    values{k} = values{k}(:);
end
azimuth = values{1};
elevation = values{2};
time = values{3};
end
