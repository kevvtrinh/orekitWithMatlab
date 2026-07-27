function handles = animateAzElTimeObstacleWorkspace(data, workspace, options)
%ANIMATEAZELTIMEOBSTACLEWORKSPACE Animate 2-D az/el and build its 3-D volume.
%
% handles = animateAzElTimeObstacleWorkspace(data, workspace)
%
% The left pane animates the current sensor-frame area boundary. The right
% pane progressively reveals representative slices of the packed
% azimuth/elevation/time obstacle. Display sampling does not remove any
% collision-query samples from workspace.
%
% options.ViewMode may be "2d", "3d", or "combined" (default). "both" and
% "together" are accepted as aliases for "combined".

if nargin < 3
    options = struct();
end
defaults = struct( ...
    "Figure", [], ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 600, ...
    "MaximumDisplayedSlices", 100, ...
    "MaximumCommandPoints", 2000, ...
    "PauseSeconds", 0.005, ...
    "FaceAlpha", 0.18, ...
    "ShowEnvelope", true, ...
    "EnvelopeFaceAlpha", 0.12, ...
    "EnvelopeVerticesPerContour", 48, ...
    "EnvelopeMaximumCentroidStep", 0.75, ...
    "ShowCombinedSweep", true, ...
    "MaximumSweepSamples", 100, ...
    "MaximumSweepVerticesPerPolygon", 120, ...
    "CombinedSweepFaceAlpha", 0.14, ...
    "ShowVisibilityControls", true, ...
    "ShowCommandPath", true, ...
    "TimeUnit", "auto");
options = applyDefaults(options, defaults);
options.ViewMode = normalizeViewMode(options.ViewMode);
validateOptions(options);
validateInput(data, workspace);

obstacleIndex = matchingObstacle(data, workspace);
obstacle = workspace.Obstacles(obstacleIndex);
sampleCount = numel(data.Time);
if obstacle.SampleCount ~= sampleCount
    error("animateAzElTimeObstacleWorkspace:SampleMismatch", ...
        "The az/el data and packed obstacle must have the same sample count.");
end

showTwoDimensional = options.ViewMode ~= "3d";
showThreeDimensional = options.ViewMode ~= "2d";
if options.ViewMode == "combined"
    figurePosition = [80 80 1500 720];
    columnCount = 2;
else
    figurePosition = [140 80 980 720];
    columnCount = 1;
end
if isempty(options.Figure)
    figureHandle = figure("Color", "w", "NumberTitle", "off", ...
        "Name", char(string(data.TargetName) + " az/el obstacle workspace"), ...
        "Position", figurePosition);
else
    figureHandle = options.Figure;
    clf(figureHandle);
end
layout = tiledlayout(figureHandle, 1, columnCount, ...
    "TileSpacing", "compact", "Padding", "compact");
if options.ShowVisibilityControls
    layout.OuterPosition = [0 0.055 1 0.945];
end
leftAxes = gobjects(0, 1);
rightAxes = gobjects(0, 1);
left = emptyTwoDimensionalHandles();
right = emptyThreeDimensionalHandles();
sliceHandles = gobjects(0, 1);
sliceSamples = zeros(0, 1);
timeScale = 1;
timeLabel = "s";
if showTwoDimensional
    leftAxes = nexttile(layout);
    left = initializeTwoDimensionalAxes(leftAxes, data);
end
if showThreeDimensional
    rightAxes = nexttile(layout);
    [right, sliceHandles, sliceSamples, timeScale, timeLabel] = ...
        initializeThreeDimensionalAxes(rightAxes, obstacle, options);
end

frameCount = min(sampleCount, options.MaximumAnimationFrames);
frameSamples = unique(round(linspace(1, sampleCount, frameCount)));
commandSamples = selectedCommandSamples( ...
    obstacle, options.MaximumCommandPoints);
revealed = false(size(sliceHandles));

for frame = 1:numel(frameSamples)
    sample = frameSamples(frame);
    currentAzimuth = data.AzimuthDeg{sample};
    currentElevation = data.ElevationDeg{sample};
    if showTwoDimensional
        set(left.Boundary, "XData", currentAzimuth, ...
            "YData", currentElevation);
        set(left.Command, "XData", data.CommandAzimuthDeg(sample), ...
            "YData", data.CommandElevationDeg(sample));
    end

    trailSamples = commandSamples(commandSamples <= sample);
    if options.ShowCommandPath && ~isempty(trailSamples)
        if showTwoDimensional
            set(left.CommandTrail, ...
                "XData", obstacle.CommandAzimuthDeg(trailSamples), ...
                "YData", obstacle.CommandElevationDeg(trailSamples));
        end
        if showThreeDimensional
            set(right.CommandTrail, ...
                "XData", obstacle.CommandAzimuthDeg(trailSamples), ...
                "YData", obstacle.CommandElevationDeg(trailSamples), ...
                "ZData", obstacle.TimeSeconds(trailSamples) / timeScale);
        end
    end

    if showThreeDimensional
        z = obstacle.TimeSeconds(sample) / timeScale;
        set(right.CurrentSlice, ...
            "XData", currentAzimuth, ...
            "YData", currentElevation, ...
            "ZData", repmat(z, size(currentAzimuth)));
        newlyRevealed = ~revealed & sliceSamples <= sample;
        if any(newlyRevealed)
            set(sliceHandles(newlyRevealed), "Visible", "on");
            revealed(newlyRevealed) = true;
        end
        title(rightAxes, sprintf( ...
            "Accumulated 3-D slices | t = %.3f %s", z, timeLabel));
    end

    if showTwoDimensional
        left.Status.String = statusMessage(data, sample);
        left.Time.String = sprintf("%s | sample %d of %d", ...
            string(data.Time(sample)), sample, sampleCount);
    end
    drawnow limitrate;
    if options.PauseSeconds > 0
        pause(options.PauseSeconds);
    end
end

if showThreeDimensional
    if any(~revealed)
        set(sliceHandles(~revealed), "Visible", "on");
    end
    if isgraphics(right.Envelope)
        set(right.Envelope, "Visible", "on");
    end
    title(rightAxes, sprintf( ...
        "3-D swept obstacle | shell + %d internal slices", ...
        numel(unique(sliceSamples))));
end

combinedSweep = gobjects(0, 1);
sweepSamples = zeros(0, 1);
if showTwoDimensional && options.ShowCombinedSweep
    [sweepShape, sweepSamples] = combinedSweepShape( ...
        data, options.MaximumSweepSamples, ...
        options.MaximumSweepVerticesPerPolygon);
    if sweepShape.NumRegions > 0
        combinedSweep = plot(leftAxes, sweepShape, ...
            "FaceColor", [0.18 0.55 0.78], ...
            "FaceAlpha", options.CombinedSweepFaceAlpha, ...
            "EdgeColor", [0.05 0.32 0.58], ...
            "LineWidth", 1.2, ...
            "DisplayName", "Combined sweep");
        uistack(combinedSweep, "bottom");
        legend(leftAxes, [left.Boundary left.Command left.CommandTrail ...
            left.Home left.Limits combinedSweep], "Location", "best");
    end
end

sliceVisibilityControl = gobjects(0, 1);
sweepVisibilityControl = gobjects(0, 1);
if options.ShowVisibilityControls
    if showThreeDimensional && ~isempty(sliceHandles)
        sliceObjects = [sliceHandles; right.CurrentSlice];
        sliceVisibilityControl = visibilityControl(figureHandle, ...
            "Show 3-D slices", controlPosition(options.ViewMode, "3d"), ...
            sliceObjects);
    end
    if showTwoDimensional && isgraphics(combinedSweep)
        sweepVisibilityControl = visibilityControl(figureHandle, ...
            "Show combined 2-D sweep", ...
            controlPosition(options.ViewMode, "2d"), combinedSweep);
    end
end

handles = struct( ...
    "Figure", figureHandle, ...
    "Layout", layout, ...
    "ViewMode", options.ViewMode, ...
    "TwoDimensionalAxes", leftAxes, ...
    "ThreeDimensionalAxes", rightAxes, ...
    "Boundary", left.Boundary, ...
    "Command", left.Command, ...
    "CommandTrail2D", left.CommandTrail, ...
    "CurrentSlice3D", right.CurrentSlice, ...
    "CommandTrail3D", right.CommandTrail, ...
    "EnvelopeHandle", right.Envelope, ...
    "SliceHandles", sliceHandles, ...
    "CombinedSweep", combinedSweep, ...
    "CombinedSweepSamples", sweepSamples, ...
    "SliceVisibilityControl", sliceVisibilityControl, ...
    "SweepVisibilityControl", sweepVisibilityControl, ...
    "DisplayedSliceSamples", unique(sliceSamples), ...
    "AnimationFrameSamples", frameSamples, ...
    "TimeScale", timeScale, ...
    "TimeUnit", timeLabel);
end

function left = emptyTwoDimensionalHandles()
empty = gobjects(0, 1);
left = struct( ...
    "Limits", empty, ...
    "CommandTrail", empty, ...
    "Boundary", empty, ...
    "Command", empty, ...
    "Home", empty, ...
    "Status", empty, ...
    "Time", empty);
end

function right = emptyThreeDimensionalHandles()
empty = gobjects(0, 1);
right = struct( ...
    "CommandTrail", empty, ...
    "CurrentSlice", empty, ...
    "Envelope", empty);
end

function [sweepShape, samples] = combinedSweepShape( ...
        data, maximumSamples, maximumVertices)
hasBoundary = false(numel(data.Time), 1);
for k = 1:numel(data.Time)
    azimuth = data.AzimuthDeg{k}(:);
    elevation = data.ElevationDeg{k}(:);
    count = min(numel(azimuth), numel(elevation));
    hasBoundary(k) = nnz(isfinite(azimuth(1:count)) & ...
        isfinite(elevation(1:count))) >= 3;
end
available = find(hasBoundary);
if isempty(available)
    sweepShape = polyshape();
    samples = zeros(0, 1);
    return;
end
count = min(numel(available), maximumSamples);
selection = unique(round(linspace(1, numel(available), count)));
samples = available(selection);
shapes = cell(numel(samples), 1);
shapeCount = 0;
for sample = reshape(samples, 1, [])
    instantaneous = boundaryShape(data.AzimuthDeg{sample}, ...
        data.ElevationDeg{sample}, maximumVertices);
    if instantaneous.NumRegions > 0
        shapeCount = shapeCount + 1;
        shapes{shapeCount} = instantaneous;
    end
end
shapes = shapes(1:shapeCount);
if isempty(shapes)
    sweepShape = polyshape();
    return;
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
        keep = unique(round(linspace(1, size(vertices, 1), ...
            maximumVertices)));
        vertices = vertices(keep, :);
    end
    if size(vertices, 1) >= 3
        warningState = warning("off", ...
            "MATLAB:polyshape:repairedBySimplify");
        restoreWarning = onCleanup(@() warning(warningState));
        regionShape = polyshape(vertices(:, 1), vertices(:, 2), ...
            "Simplify", true);
        clear restoreWarning;
        if regionShape.NumRegions > 0 && area(regionShape) > 0
            shape = union(shape, regionShape);
        end
    end
end
end

function control = visibilityControl(figureHandle, label, position, objects)
control = uicontrol(figureHandle, ...
    "Style", "checkbox", ...
    "Units", "normalized", ...
    "Position", position, ...
    "String", label, ...
    "Value", 1, ...
    "BackgroundColor", figureHandle.Color, ...
    "FontSize", 9, ...
    "Callback", @(source, ~) setObjectVisibility(source, objects));
end

function position = controlPosition(viewMode, content)
if viewMode == "combined"
    if content == "2d"
        position = [0.16 0.008 0.20 0.035];
    else
        position = [0.68 0.008 0.14 0.035];
    end
else
    position = [0.39 0.008 0.22 0.035];
end
end

function setObjectVisibility(control, objects)
objects = objects(isgraphics(objects));
if control.Value
    visibility = "on";
else
    visibility = "off";
end
set(objects, "Visible", visibility);
end

function left = initializeTwoDimensionalAxes(ax, data)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
xlim(ax, [-180 180]);
ylim(ax, [0 90]);
title(ax, "Current 2-D az/el slice");

azimuthLimits = dataField(data, "AzimuthLimitsDeg", [-180 180]);
elevationLimits = dataField(data, "ElevationLimitsDeg", [0 90]);
home = dataField(data, "HomeAzElDeg", [0 90]);
left.Limits = plot(ax, ...
    [azimuthLimits(1) azimuthLimits(2) azimuthLimits(2) ...
    azimuthLimits(1) azimuthLimits(1)], ...
    [elevationLimits(1) elevationLimits(1) elevationLimits(2) ...
    elevationLimits(2) elevationLimits(1)], ...
    "k--", "LineWidth", 1.1, "DisplayName", "Position limits");
left.CommandTrail = plot(ax, NaN, NaN, "-", ...
    "Color", [0.10 0.35 0.85], "LineWidth", 1.2, ...
    "DisplayName", "Command history");
left.Boundary = plot(ax, NaN, NaN, "-", ...
    "Color", [0.85 0.15 0.10], "LineWidth", 2.2, ...
    "DisplayName", char(string(data.TargetName) + " boundary"));
left.Command = plot(ax, NaN, NaN, "+", ...
    "Color", [0.05 0.20 0.75], "LineWidth", 2, "MarkerSize", 10, ...
    "DisplayName", "Current command");
left.Home = plot(ax, home(1), home(2), "ko", ...
    "LineWidth", 1.3, "MarkerSize", 6, "DisplayName", "Home");
left.Status = text(ax, 0.02, 0.97, "", "Units", "normalized", ...
    "VerticalAlignment", "top", "FontWeight", "bold", ...
    "FontSize", 9, "BackgroundColor", "w", "Margin", 1);
left.Time = text(ax, 0.02, 0.02, "", "Units", "normalized", ...
    "VerticalAlignment", "bottom");
legend(ax, [left.Boundary left.Command left.CommandTrail ...
    left.Home left.Limits], "Location", "best");
end

function [right, sliceHandles, sliceSamples, timeScale, timeLabel] = ...
        initializeThreeDimensionalAxes(ax, obstacle, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
[timeScale, timeLabel] = chooseTimeScale( ...
    obstacle.TimeSeconds, options.TimeUnit);
available = find(all(isfinite(obstacle.BoundsDeg), 2));
if isempty(available)
    selection = zeros(0, 1);
else
    count = min(numel(available), options.MaximumDisplayedSlices);
    selection = unique(round(linspace(1, numel(available), count)));
    selection = available(selection);
end

color = [0.82 0.18 0.12];
sliceHandles = gobjects(0, 1);
sliceSamples = zeros(0, 1);
firstPatch = true;
for sample = reshape(selection, 1, [])
    [azimuthParts, elevationParts] = sliceRegions(obstacle, sample);
    z = obstacle.TimeSeconds(sample) / timeScale;
    for region = 1:numel(azimuthParts)
        displayName = "";
        visibility = "off";
        if firstPatch
            displayName = obstacle.Name + " obstacle";
            visibility = "on";
            firstPatch = false;
        end
        sliceHandles(end + 1, 1) = patch(ax, ...
            azimuthParts{region}, elevationParts{region}, ...
            repmat(z, size(azimuthParts{region})), color, ...
            "FaceAlpha", options.FaceAlpha, ...
            "EdgeColor", 0.72 .* color, ...
            "LineWidth", 0.4, ...
            "Visible", "off", ...
            "DisplayName", displayName, ...
            "HandleVisibility", visibility); %#ok<AGROW>
        sliceSamples(end + 1, 1) = sample; %#ok<AGROW>
    end
end

right.CommandTrail = plot3(ax, NaN, NaN, NaN, "-", ...
    "Color", [0.05 0.25 0.75], "LineWidth", 1.5, ...
    "DisplayName", "Command path");
right.CurrentSlice = plot3(ax, NaN, NaN, NaN, "k-", ...
    "LineWidth", 1.8, "DisplayName", "Current slice");
right.Envelope = gobjects(0, 1);
if options.ShowEnvelope
    mesh = computeAzElTimeObstacleEnvelopeMesh(obstacle, struct( ...
        "TimeScale", timeScale, ...
        "MaximumSlices", options.MaximumDisplayedSlices, ...
        "VerticesPerContour", options.EnvelopeVerticesPerContour, ...
        "MaximumCentroidStep", options.EnvelopeMaximumCentroidStep));
    if ~isempty(mesh.Faces)
        right.Envelope = patch(ax, ...
            "Faces", mesh.Faces, ...
            "Vertices", mesh.Vertices, ...
            "FaceColor", [0.48 0.08 0.72], ...
            "FaceAlpha", options.EnvelopeFaceAlpha, ...
            "EdgeColor", "none", ...
            "Visible", "off", ...
            "DisplayName", "Final swept envelope");
    end
end
xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
zlabel(ax, sprintf("Elapsed time (%s)", timeLabel));
xlim(ax, [-180 180]);
ylim(ax, [0 90]);
if isempty(obstacle.TimeSeconds) || ...
        obstacle.TimeSeconds(end) == obstacle.TimeSeconds(1)
    zlim(ax, [-0.5 0.5]);
else
    zlim(ax, [obstacle.TimeSeconds(1), obstacle.TimeSeconds(end)] / ...
        timeScale);
end
view(ax, 35, 25);
axis(ax, "vis3d");
title(ax, "Accumulated 3-D slices");
legend(ax, "Location", "best");
end

function samples = selectedCommandSamples(obstacle, maximumPoints)
valid = isfinite(obstacle.CommandAzimuthDeg) & ...
    isfinite(obstacle.CommandElevationDeg);
samples = find(valid);
if numel(samples) > maximumPoints
    selection = unique(round(linspace(1, numel(samples), maximumPoints)));
    samples = samples(selection);
end
end

function [azimuthParts, elevationParts] = sliceRegions(obstacle, sample)
first = double(obstacle.SliceOffsets(sample));
last = double(obstacle.SliceOffsets(sample + 1) - 1);
if last < first
    azimuthParts = {};
    elevationParts = {};
    return;
end
azimuth = double(obstacle.AzimuthDeg(first:last));
elevation = double(obstacle.ElevationDeg(first:last));
finite = isfinite(azimuth) & isfinite(elevation);
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
azimuthParts = cell(numel(starts), 1);
elevationParts = cell(numel(starts), 1);
for region = 1:numel(starts)
    index = starts(region):stops(region);
    azimuthParts{region} = azimuth(index);
    elevationParts{region} = elevation(index);
end
end

function message = statusMessage(data, sample)
if isfield(data, "Status") && numel(data.Status) >= sample
    status = string(data.Status(sample));
else
    status = "slice";
end
if isfield(data, "CommandInsidePositionLimits") && ...
        numel(data.CommandInsidePositionLimits) >= sample
    if data.CommandInsidePositionLimits(sample)
        limitStatus = "inside limits";
    else
        limitStatus = "outside limits";
    end
    message = sprintf("%s | command %s", status, limitStatus);
else
    message = char(status);
end
end

function value = dataField(data, name, fallback)
if isfield(data, name) && ~isempty(data.(name))
    value = double(reshape(data.(name), 1, []));
else
    value = fallback;
end
end

function index = matchingObstacle(data, workspace)
index = 1;
if isfield(data, "TargetName")
    names = string({workspace.Obstacles.Name});
    match = find(names == string(data.TargetName), 1);
    if ~isempty(match)
        index = match;
    end
end
end

function [scale, label] = chooseTimeScale(timeSeconds, requested)
requested = lower(string(requested));
duration = 0;
if ~isempty(timeSeconds)
    duration = max(timeSeconds) - min(timeSeconds);
end
if requested == "auto"
    if duration >= 2 * 3600
        requested = "hours";
    elseif duration >= 2 * 60
        requested = "minutes";
    else
        requested = "seconds";
    end
end
switch requested
    case "seconds"
        scale = 1;
        label = "s";
    case "minutes"
        scale = 60;
        label = "min";
    case "hours"
        scale = 3600;
        label = "h";
    otherwise
        error("animateAzElTimeObstacleWorkspace:InvalidTimeUnit", ...
            "TimeUnit must be auto, seconds, minutes, or hours.");
end
end

function validateInput(data, workspace)
requiredData = ["Time", "AzimuthDeg", "ElevationDeg", ...
    "CommandAzimuthDeg", "CommandElevationDeg"];
if ~isstruct(data) || ~all(isfield(data, cellstr(requiredData)))
    error("animateAzElTimeObstacleWorkspace:InvalidData", ...
        "data must be a computeAreaTargetAzElSweep result.");
end
if ~isstruct(workspace) || ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace" || ...
        ~isfield(workspace, "Obstacles") || isempty(workspace.Obstacles)
    error("animateAzElTimeObstacleWorkspace:InvalidWorkspace", ...
        "Use buildAzElTimeObstacleWorkspace to create workspace.");
end
end

function validateOptions(options)
validateattributes(options.MaximumAnimationFrames, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumDisplayedSlices, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumCommandPoints, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.PauseSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.FaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
validateattributes(options.ShowEnvelope, {'logical', 'numeric'}, ...
    {'scalar'});
validateattributes(options.EnvelopeFaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
validateattributes(options.EnvelopeVerticesPerContour, {'numeric'}, ...
    {'scalar', 'integer', '>=', 3});
validateattributes(options.EnvelopeMaximumCentroidStep, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.ShowCombinedSweep, {'logical', 'numeric'}, ...
    {'scalar'});
validateattributes(options.MaximumSweepSamples, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumSweepVerticesPerPolygon, {'numeric'}, ...
    {'scalar', 'integer', '>=', 3});
validateattributes(options.CombinedSweepFaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
validateattributes(options.ShowVisibilityControls, {'logical', 'numeric'}, ...
    {'scalar'});
end

function mode = normalizeViewMode(value)
mode = lower(string(value));
if ~isscalar(mode)
    error("animateAzElTimeObstacleWorkspace:InvalidViewMode", ...
        "ViewMode must be 2d, 3d, or combined.");
end
switch mode
    case "2d"
        mode = "2d";
    case "3d"
        mode = "3d";
    case {"combined", "both", "together"}
        mode = "combined";
    otherwise
        error("animateAzElTimeObstacleWorkspace:InvalidViewMode", ...
            "ViewMode must be 2d, 3d, or combined.");
end
end

function options = applyDefaults(options, defaults)
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(options, names{k}) || isempty(options.(names{k}))
        options.(names{k}) = defaults.(names{k});
    end
end
end
