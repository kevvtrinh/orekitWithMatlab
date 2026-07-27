function [occupied, obstacleIndex, details] = queryAzElTimeObstacle( ...
        workspace, azimuthDeg, elevationDeg, queryTime, options)
%QUERYAZELTIMEOBSTACLE Test points against packed az/el/time obstacles.
%
% occupied = queryAzElTimeObstacle(workspace, az, el, time)
% [occupied, obstacleIndex] = queryAzElTimeObstacle(...)
%
% time may be a datetime array or numeric seconds from
% workspace.ReferenceTime. Scalar inputs expand to match vector inputs.
%
% Options:
%   CollisionMode       "polygon" (default) for an exact narrow phase, or
%                       "bounds" for a faster conservative rectangle test.
%   TimePaddingSamples  Also test neighboring slices (default 0). Set to 1
%                       for conservative avoidance between time samples.
%   BoundsMarginDeg     [azimuth elevation] broad-phase margin (default 0).

if nargin < 5
    options = struct();
end
defaults = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", 0, ...
    "BoundsMarginDeg", [0 0]);
options = applyDefaults(options, defaults);
mode = lower(string(options.CollisionMode));
if ~any(mode == ["polygon", "bounds"])
    error("queryAzElTimeObstacle:InvalidMode", ...
        "CollisionMode must be 'polygon' or 'bounds'.");
end
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.BoundsMarginDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
validateWorkspace(workspace);

[azimuthDeg, elevationDeg, timeSeconds, outputSize] = normalizeQueries( ...
    azimuthDeg, elevationDeg, queryTime, workspace.ReferenceTime);
queryCount = numel(azimuthDeg);
occupied = false(queryCount, 1);
obstacleIndex = zeros(queryCount, 1, "uint32");

for obstacleNumber = 1:numel(workspace.Obstacles)
    unresolved = ~occupied & isfinite(azimuthDeg) & ...
        isfinite(elevationDeg) & isfinite(timeSeconds);
    if ~any(unresolved)
        break;
    end
    obstacle = workspace.Obstacles(obstacleNumber);
    [sampleIndex, validTime] = nearestSamples(obstacle, timeSeconds);
    valid = unresolved & validTime;
    for offset = -options.TimePaddingSamples:options.TimePaddingSamples
        candidateIndex = sampleIndex + offset;
        candidate = valid & candidateIndex >= 1 & ...
            candidateIndex <= obstacle.SampleCount & ~occupied;
        if ~any(candidate)
            continue;
        end
        hit = collideAtSamples(obstacle, candidateIndex, candidate, ...
            azimuthDeg, elevationDeg, mode, options.BoundsMarginDeg);
        newHit = hit & ~occupied;
        occupied(newHit) = true;
        obstacleIndex(newHit) = uint32(obstacleNumber);
    end
end

occupied = reshape(occupied, outputSize);
obstacleIndex = reshape(obstacleIndex, outputSize);
if nargout >= 3
    names = strings(queryCount, 1);
    flatIndex = obstacleIndex(:);
    for k = 1:numel(workspace.Obstacles)
        names(flatIndex == k) = workspace.Obstacles(k).Name;
    end
    details = struct( ...
        "ObstacleName", reshape(names, outputSize), ...
        "QueryTimeSeconds", reshape(timeSeconds, outputSize), ...
        "CollisionMode", mode);
end
end

function [sampleIndex, valid] = nearestSamples(obstacle, querySeconds)
n = obstacle.SampleCount;
sampleIndex = zeros(size(querySeconds));
if n == 0
    valid = false(size(querySeconds));
    return;
end
time = obstacle.TimeSeconds;
valid = querySeconds >= time(1) & querySeconds <= time(end);
if n == 1
    sampleIndex(valid) = 1;
elseif obstacle.IsUniformTime
    sampleIndex(valid) = round((querySeconds(valid) - time(1)) ./ ...
        obstacle.TimeStepSeconds) + 1;
else
    sampleIndex(valid) = interp1(time, (1:n).', querySeconds(valid), ...
        "nearest");
end
sampleIndex = round(sampleIndex);
end

function hit = collideAtSamples(obstacle, sampleIndex, candidate, ...
        azimuthDeg, elevationDeg, mode, margin)
hit = false(size(candidate));
rows = find(candidate);
samples = sampleIndex(rows);
bounds = double(obstacle.BoundsDeg(samples, :));
insideBounds = all(isfinite(bounds), 2) & ...
    azimuthDeg(rows) >= bounds(:, 1) - margin(1) & ...
    azimuthDeg(rows) <= bounds(:, 2) + margin(1) & ...
    elevationDeg(rows) >= bounds(:, 3) - margin(2) & ...
    elevationDeg(rows) <= bounds(:, 4) + margin(2);
rows = rows(insideBounds);
samples = samples(insideBounds);
if isempty(rows)
    return;
end
if mode == "bounds"
    hit(rows) = true;
else
    hit(rows) = pointsInPackedEdges(obstacle, samples, ...
        azimuthDeg(rows), elevationDeg(rows));
end
end

function inside = pointsInPackedEdges(obstacle, samples, ...
        queryAzimuth, queryElevation)
edgeCount = double(obstacle.EdgeOffsets(samples + 1) - ...
    obstacle.EdgeOffsets(samples));
edgeCount = edgeCount(:);
hasEdges = edgeCount > 0;
inside = false(size(samples));
if ~any(hasEdges)
    return;
end
activeSamples = samples(hasEdges);
activeAzimuth = queryAzimuth(hasEdges);
activeElevation = queryElevation(hasEdges);
edgeCount = edgeCount(hasEdges);
edgeStart = double(obstacle.EdgeOffsets(activeSamples));
edgeStart = edgeStart(:);
groupCount = numel(activeSamples);
totalEdges = sum(edgeCount);
group = repelem((1:groupCount).', edgeCount);
groupBase = repelem(cumsum([0; edgeCount(1:end - 1)]), edgeCount);
group = group(:);
groupBase = groupBase(:);
withinGroup = (0:totalEdges - 1).' - groupBase;
repeatedEdgeStart = repelem(edgeStart, edgeCount);
edgeIndex = repeatedEdgeStart(:) + withinGroup;

x1 = double(obstacle.EdgeStartAzimuthDeg(edgeIndex));
y1 = double(obstacle.EdgeStartElevationDeg(edgeIndex));
x2 = double(obstacle.EdgeEndAzimuthDeg(edgeIndex));
y2 = double(obstacle.EdgeEndElevationDeg(edgeIndex));
qx = activeAzimuth(group);
qy = activeElevation(group);
x1 = x1(:);
y1 = y1(:);
x2 = x2(:);
y2 = y2(:);
qx = qx(:);
qy = qy(:);

straddles = (y1 > qy) ~= (y2 > qy);
crosses = false(totalEdges, 1);
crosses(straddles) = qx(straddles) < x1(straddles) + ...
    (qy(straddles) - y1(straddles)) .* ...
    (x2(straddles) - x1(straddles)) ./ ...
    (y2(straddles) - y1(straddles));
crossingCount = accumarray(group, double(crosses), ...
    [groupCount 1], @sum, 0);

edgeLength = hypot(x2 - x1, y2 - y1);
crossProduct = (qx - x1) .* (y2 - y1) - ...
    (qy - y1) .* (x2 - x1);
tolerance = 1e-7 .* max(1, edgeLength);
onEdge = abs(crossProduct) <= tolerance & ...
    qx >= min(x1, x2) - tolerance & ...
    qx <= max(x1, x2) + tolerance & ...
    qy >= min(y1, y2) - tolerance & ...
    qy <= max(y1, y2) + tolerance;
boundaryCount = accumarray(group, double(onEdge), ...
    [groupCount 1], @sum, 0);
activeInside = mod(crossingCount, 2) == 1 | boundaryCount > 0;
inside(hasEdges) = activeInside;
end

function [azimuth, elevation, timeSeconds, outputSize] = normalizeQueries( ...
        azimuth, elevation, queryTime, referenceTime)
if isdatetime(queryTime)
    timeSeconds = seconds(ensureUtc(queryTime) - referenceTime);
elseif isnumeric(queryTime)
    timeSeconds = double(queryTime);
else
    error("queryAzElTimeObstacle:InvalidTime", ...
        "queryTime must be datetime or seconds from ReferenceTime.");
end
values = {double(azimuth), double(elevation), double(timeSeconds)};
lengths = cellfun(@numel, values);
nonScalar = lengths(lengths > 1);
if isempty(nonScalar)
    outputSize = size(values{1});
    if isequal(outputSize, [1 1])
        outputSize = [1 1];
    end
    targetCount = 1;
elseif any(nonScalar ~= nonScalar(1))
    error("queryAzElTimeObstacle:SizeMismatch", ...
        "Non-scalar azimuth, elevation, and time inputs must have equal size.");
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
timeSeconds = values{3};
end

function validateWorkspace(workspace)
if ~isstruct(workspace) || ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace" || ...
        ~isfield(workspace, "Obstacles") || ...
        ~isfield(workspace, "ReferenceTime")
    error("queryAzElTimeObstacle:InvalidWorkspace", ...
        "Use buildAzElTimeObstacleWorkspace to create the workspace.");
end
end

function times = ensureUtc(times)
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
