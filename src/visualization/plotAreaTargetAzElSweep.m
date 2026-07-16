function result = plotAreaTargetAzElSweep(data, options)
%PLOTAREATARGETAZELSWEEP Plot the accumulated area-target sensor sweep.
if nargin < 2
    options = struct();
end
defaults = struct("FaceColor", [0.85 0.15 0.10], "FaceAlpha", 0.30, ...
    "EdgeColor", [0.65 0.05 0.05], "MaximumUnionSamples", 80, ...
    "MaximumVerticesPerPolygon", 120, "MaximumDisplayedTraces", 40, ...
    "ShowTimeTraces", true, "ShowCommandPath", true);
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(options, names{k}) || isempty(options.(names{k}))
        options.(names{k}) = defaults.(names{k});
    end
end

n = numel(data.Time);
hasBoundary = false(n, 1);
for k = 1:n
    hasBoundary(k) = sum(isfinite(data.AzimuthDeg{k}) & ...
        isfinite(data.ElevationDeg{k})) >= 3;
end
available = find(hasBoundary);
if isempty(available)
    error("plotAreaTargetAzElSweep:NoBoundary", ...
        "No finite %s az/el boundaries were found.", data.TargetName);
end

sampleCount = min(numel(available), options.MaximumUnionSamples);
selected = available(unique(round(linspace(1, numel(available), sampleCount))));
instantaneous = cell(n, 1);
validShape = false(n, 1);
shapes = cell(numel(selected), 1);
shapeCount = 0;
for k = selected(:).'
    shape = boundaryShape(data.AzimuthDeg{k}, data.ElevationDeg{k}, ...
        options.MaximumVerticesPerPolygon);
    if shape.NumRegions > 0 && area(shape) > 0
        instantaneous{k} = shape;
        validShape(k) = true;
        shapeCount = shapeCount + 1;
        shapes{shapeCount} = shape;
    end
end
shapes = shapes(1:shapeCount);
if isempty(shapes)
    error("plotAreaTargetAzElSweep:NoPolygon", ...
        "No valid %s az/el polygons could be formed.", data.TargetName);
end
while numel(shapes) > 1
    nextLevel = cell(ceil(numel(shapes) / 2), 1);
    for k = 1:floor(numel(shapes) / 2)
        nextLevel{k} = union(shapes{2 * k - 1}, shapes{2 * k});
    end
    if mod(numel(shapes), 2)
        nextLevel{end} = shapes{end};
    end
    shapes = nextLevel;
end
sweepShape = shapes{1};

figureHandle = figure("Color", "w", ...
    "Name", char(data.TargetName + " az/el sweep"));
ax = axes(figureHandle);
hold(ax, "on"); grid(ax, "on"); box(ax, "on");
xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
xlim(ax, [-180 180]); ylim(ax, [0 90]);
sweepHandle = plot(ax, sweepShape, "FaceColor", options.FaceColor, ...
    "FaceAlpha", options.FaceAlpha, "EdgeColor", options.EdgeColor, ...
    "LineWidth", 2, "DisplayName", char(data.TargetName + " swept area"));

traceHandles = gobjects(0, 1);
if options.ShowTimeTraces
    traceIndex = find(validShape);
    count = min(numel(traceIndex), options.MaximumDisplayedTraces);
    traceIndex = traceIndex(unique(round(linspace(1, numel(traceIndex), count))));
    colors = turbo(max(2, numel(traceIndex)));
    for k = 1:numel(traceIndex)
        traceHandles(end + 1, 1) = plot(ax, instantaneous{traceIndex(k)}, ...
            "FaceColor", "none", "EdgeColor", colors(k, :), ...
            "LineWidth", 0.5, "HandleVisibility", "off"); %#ok<AGROW>
    end
end

azLim = data.AzimuthLimitsDeg;
elLim = data.ElevationLimitsDeg;
limitHandle = plot(ax, [azLim(1) azLim(2) azLim(2) azLim(1) azLim(1)], ...
    [elLim(1) elLim(1) elLim(2) elLim(2) elLim(1)], "k--", ...
    "LineWidth", 1.5, "DisplayName", "Sensor position limits");
homeHandle = plot(ax, data.HomeAzElDeg(1), data.HomeAzElDeg(2), "ko", ...
    "LineWidth", 1.5, "MarkerSize", 7, "DisplayName", "Home position");

commandHandle = gobjects(0, 1);
if options.ShowCommandPath
    validCommand = isfinite(data.CommandAzimuthDeg) & ...
        isfinite(data.CommandElevationDeg);
    if any(validCommand)
        commandHandle = plot(ax, data.CommandAzimuthDeg(validCommand), ...
            data.CommandElevationDeg(validCommand), "b-", "LineWidth", 1.5, ...
            "DisplayName", "Centroid az/el command");
    end
end

validIndex = find(validShape);
firstIndex = validIndex(1);
lastIndex = validIndex(end);
firstHandle = plot(ax, instantaneous{firstIndex}, "FaceColor", "none", ...
    "EdgeColor", [0 0.55 0], "LineWidth", 2, ...
    "DisplayName", "First visible shape");
lastHandle = plot(ax, instantaneous{lastIndex}, "FaceColor", "none", ...
    "EdgeColor", [0.5 0 0.8], "LineWidth", 2, ...
    "DisplayName", "Last visible shape");
legendHandles = [sweepHandle limitHandle homeHandle firstHandle lastHandle];
if ~isempty(commandHandle), legendHandles(end + 1) = commandHandle; end
legend(ax, legendHandles, "Location", "best");

planarAreaDeg2 = area(sweepShape);
title(ax, sprintf("%s az/el sweep | %.2f to %.2f s | area %.3f deg^2", ...
    data.TargetName, data.ElapsedSeconds(firstIndex), ...
    data.ElapsedSeconds(lastIndex), planarAreaDeg2));
result = struct("SweepShape", sweepShape, "PlanarAreaDeg2", planarAreaDeg2, ...
    "ValidTimeMask", validShape, "ValidTimes", data.Time(validShape), ...
    "NumberOfUnionSamples", shapeCount, "Figure", figureHandle, ...
    "Axes", ax, "SweepHandle", sweepHandle, "TraceHandles", traceHandles);
end

function shape = boundaryShape(azimuthDeg, elevationDeg, maximumVertices)
azimuthDeg = double(azimuthDeg(:));
elevationDeg = double(elevationDeg(:));
finite = isfinite(azimuthDeg) & isfinite(elevationDeg);
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
shape = polyshape();
for k = 1:numel(starts)
    vertices = [azimuthDeg(starts(k):stops(k)), ...
        elevationDeg(starts(k):stops(k))];
    if size(vertices, 1) > maximumVertices
        keep = unique(round(linspace(1, size(vertices, 1), maximumVertices)));
        vertices = vertices(keep, :);
    end
    if size(vertices, 1) >= 3
        warningState = warning("off", "MATLAB:polyshape:repairedBySimplify");
        restoreWarning = onCleanup(@() warning(warningState));
        segment = polyshape(vertices(:, 1), vertices(:, 2), "Simplify", true);
        clear restoreWarning;
        if segment.NumRegions > 0 && area(segment) > 0
            shape = union(shape, segment);
        end
    end
end
end
