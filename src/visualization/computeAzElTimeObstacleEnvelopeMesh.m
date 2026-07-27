function mesh = computeAzElTimeObstacleEnvelopeMesh(obstacle, options)
%COMPUTEAZELTIMEOBSTACLEENVELOPEMESH Loft a visual shell between contours.
%
% mesh = computeAzElTimeObstacleEnvelopeMesh(obstacle, options)
%
% Adjacent contours are resampled and aligned before their boundary walls
% are joined. Unlike a point-cloud shrink-wrap, this preserves concave
% openings and does not span time intervals with missing slices. The shell
% remains visualization-only; collision avoidance should use
% QUERYAZELTIMEOBSTACLE and the complete packed slices.

if nargin < 2
    options = struct();
end
defaults = struct( ...
    "TimeScale", 1, ...
    "MaximumSlices", 100, ...
    "VerticesPerContour", 48, ...
    "MaximumCentroidStep", 0.75);
options = applyDefaults(options, defaults);
validateattributes(options.TimeScale, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.MaximumSlices, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.VerticesPerContour, {'numeric'}, ...
    {'scalar', 'integer', '>=', 3});
validateattributes(options.MaximumCentroidStep, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});

mesh = struct( ...
    "Faces", zeros(0, 3), ...
    "Vertices", zeros(0, 3), ...
    "SampleIndices", zeros(0, 1), ...
    "ConnectedSlicePairs", zeros(0, 2));
validSlice = all(isfinite(obstacle.BoundsDeg), 2);
available = find(validSlice);
if numel(available) < 2
    return;
end
sliceCount = min(numel(available), options.MaximumSlices);
selection = unique(round(linspace(1, numel(available), sliceCount)));
selection = available(selection);
mesh.SampleIndices = selection(:);

finiteBounds = double(obstacle.BoundsDeg(validSlice, :));
coordinateScale = [ ...
    max(finiteBounds(:, 2)) - min(finiteBounds(:, 1)), ...
    max(finiteBounds(:, 4)) - min(finiteBounds(:, 3))];
coordinateScale = max(coordinateScale, 1);

vertices = zeros(0, 3);
faces = zeros(0, 3);
connectedPairs = zeros(0, 2);
for pair = 1:numel(selection) - 1
    firstSample = selection(pair);
    secondSample = selection(pair + 1);
    if ~all(validSlice(firstSample:secondSample))
        continue;
    end
    firstRegions = sliceRegions(obstacle, firstSample);
    secondRegions = sliceRegions(obstacle, secondSample);
    matches = matchRegions(firstRegions, secondRegions, ...
        coordinateScale, options.MaximumCentroidStep);
    pairConnected = false;
    for match = 1:size(matches, 1)
        firstContour = resampleContour( ...
            firstRegions{matches(match, 1)}, options.VerticesPerContour);
        secondContour = resampleContour( ...
            secondRegions{matches(match, 2)}, options.VerticesPerContour);
        if isempty(firstContour) || isempty(secondContour)
            continue;
        end
        secondContour = alignContour( ...
            firstContour, secondContour, coordinateScale);
        firstZ = obstacle.TimeSeconds(firstSample) / options.TimeScale;
        secondZ = obstacle.TimeSeconds(secondSample) / options.TimeScale;
        firstVertices = [firstContour, ...
            repmat(firstZ, options.VerticesPerContour, 1)];
        secondVertices = [secondContour, ...
            repmat(secondZ, options.VerticesPerContour, 1)];
        base = size(vertices, 1);
        vertices = [vertices; firstVertices; secondVertices]; %#ok<AGROW>
        count = options.VerticesPerContour;
        current = (1:count).';
        next = [2:count 1].';
        firstIndex = base + current;
        firstNext = base + next;
        secondIndex = base + count + current;
        secondNext = base + count + next;
        faces = [faces; ...
            firstIndex, firstNext, secondNext; ...
            firstIndex, secondNext, secondIndex]; %#ok<AGROW>
        pairConnected = true;
    end
    if pairConnected
        connectedPairs(end + 1, :) = ...
            [firstSample secondSample]; %#ok<AGROW>
    end
end
mesh.Faces = faces;
mesh.Vertices = vertices;
mesh.ConnectedSlicePairs = connectedPairs;
end

function regions = sliceRegions(obstacle, sample)
first = double(obstacle.SliceOffsets(sample));
last = double(obstacle.SliceOffsets(sample + 1) - 1);
if last < first
    regions = {};
    return;
end
azimuth = double(obstacle.AzimuthDeg(first:last));
elevation = double(obstacle.ElevationDeg(first:last));
finite = isfinite(azimuth) & isfinite(elevation);
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
regions = cell(numel(starts), 1);
kept = false(numel(starts), 1);
for region = 1:numel(starts)
    index = starts(region):stops(region);
    points = [azimuth(index), elevation(index)];
    if size(points, 1) >= 3
        regions{region} = points;
        kept(region) = true;
    end
end
regions = regions(kept);
end

function matches = matchRegions(firstRegions, secondRegions, ...
        coordinateScale, maximumStep)
matches = zeros(0, 2);
if isempty(firstRegions) || isempty(secondRegions)
    return;
end
firstCentroid = zeros(numel(firstRegions), 2);
secondCentroid = zeros(numel(secondRegions), 2);
for k = 1:numel(firstRegions)
    firstCentroid(k, :) = mean(firstRegions{k}, 1);
end
for k = 1:numel(secondRegions)
    secondCentroid(k, :) = mean(secondRegions{k}, 1);
end
used = false(numel(secondRegions), 1);
for first = 1:numel(firstRegions)
    delta = (secondCentroid - firstCentroid(first, :)) ./ coordinateScale;
    distance = hypot(delta(:, 1), delta(:, 2));
    distance(used) = inf;
    [minimum, second] = min(distance);
    if isfinite(minimum) && minimum <= maximumStep
        matches(end + 1, :) = [first second]; %#ok<AGROW>
        used(second) = true;
    end
end
end

function contour = resampleContour(points, count)
if size(points, 1) > 1 && norm(points(1, :) - points(end, :)) < 1e-10
    points(end, :) = [];
end
if size(points, 1) < 3
    contour = zeros(0, 2);
    return;
end
closed = [points; points(1, :)];
segmentLength = hypot(diff(closed(:, 1)), diff(closed(:, 2)));
keep = [true; segmentLength > 1e-12];
closed = closed(keep, :);
if size(closed, 1) < 4
    contour = zeros(0, 2);
    return;
end
distance = [0; cumsum(hypot(diff(closed(:, 1)), ...
    diff(closed(:, 2))))];
sampleDistance = (0:count - 1).' .* (distance(end) / count);
contour = [ ...
    interp1(distance, closed(:, 1), sampleDistance, "linear"), ...
    interp1(distance, closed(:, 2), sampleDistance, "linear")];
end

function aligned = alignContour(reference, candidate, coordinateScale)
if signedArea(reference) * signedArea(candidate) < 0
    candidate = flipud(candidate);
end
bestScore = inf;
aligned = candidate;
for shift = 0:size(candidate, 1) - 1
    shifted = circshift(candidate, shift, 1);
    delta = (reference - shifted) ./ coordinateScale;
    score = sum(delta(:, 1).^2 + delta(:, 2).^2);
    if score < bestScore
        bestScore = score;
        aligned = shifted;
    end
end
end

function value = signedArea(points)
next = circshift(points, -1, 1);
value = 0.5 * sum(points(:, 1) .* next(:, 2) - ...
    next(:, 1) .* points(:, 2));
end

function options = applyDefaults(options, defaults)
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(options, names{k}) || isempty(options.(names{k}))
        options.(names{k}) = defaults.(names{k});
    end
end
end
