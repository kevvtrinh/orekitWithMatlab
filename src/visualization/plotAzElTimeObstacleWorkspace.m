function handles = plotAzElTimeObstacleWorkspace(workspace, options)
%PLOTAZELTIMEOBSTACLEWORKSPACE Plot packed az/el/time obstacles in 3-D.
%
% The plot deliberately displays a bounded number of representative
% slices. Collision queries still use every packed time sample.

if nargin < 2
    options = struct();
end
if ~isstruct(workspace) || ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace"
    workspace = buildAzElTimeObstacleWorkspace(workspace);
end
defaults = struct( ...
    "Figure", [], ...
    "MaximumDisplayedSlices", 100, ...
    "FaceAlpha", 0.16, ...
    "ShowEnvelope", true, ...
    "EnvelopeFaceAlpha", 0.12, ...
    "EnvelopeVerticesPerContour", 48, ...
    "EnvelopeMaximumCentroidStep", 0.75, ...
    "ShowSliceToggle", true, ...
    "TimeUnit", "auto");
options = applyDefaults(options, defaults);
validateattributes(options.MaximumDisplayedSlices, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.FaceAlpha, {'numeric'}, ...
    {'scalar', '>=', 0, '<=', 1});
validateattributes(options.ShowEnvelope, {'logical', 'numeric'}, ...
    {'scalar'});
validateattributes(options.EnvelopeFaceAlpha, {'numeric'}, ...
    {'scalar', '>=', 0, '<=', 1});
validateattributes(options.EnvelopeVerticesPerContour, {'numeric'}, ...
    {'scalar', 'integer', '>=', 3});
validateattributes(options.EnvelopeMaximumCentroidStep, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.ShowSliceToggle, {'logical', 'numeric'}, ...
    {'scalar'});

if isempty(options.Figure)
    figureHandle = figure("Color", "w", ...
        "Name", "Az/el/time obstacle workspace");
else
    figureHandle = options.Figure;
end
ax = axes(figureHandle);
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
colors = lines(max(1, numel(workspace.Obstacles)));
[timeScale, timeLabel] = chooseTimeScale(workspace, options.TimeUnit);
sliceHandles = gobjects(0, 1);
envelopeHandles = gobjects(0, 1);

for obstacleNumber = 1:numel(workspace.Obstacles)
    obstacle = workspace.Obstacles(obstacleNumber);
    available = find(all(isfinite(obstacle.BoundsDeg), 2));
    if isempty(available)
        continue;
    end
    count = min(numel(available), options.MaximumDisplayedSlices);
    selection = unique(round(linspace(1, numel(available), count)));
    selection = available(selection);
    firstPatch = true;
    for sample = reshape(selection, 1, [])
        [azimuthParts, elevationParts] = sliceRegions(obstacle, sample);
        z = obstacle.TimeSeconds(sample) / timeScale;
        for region = 1:numel(azimuthParts)
            displayName = "";
            visibility = "off";
            if firstPatch
                displayName = obstacle.Name;
                visibility = "on";
                firstPatch = false;
            end
            sliceHandles(end + 1, 1) = patch(ax, ...
                azimuthParts{region}, elevationParts{region}, ...
                repmat(z, size(azimuthParts{region})), ...
                colors(obstacleNumber, :), ...
                "FaceAlpha", options.FaceAlpha, ...
                "EdgeColor", colors(obstacleNumber, :), ...
                "LineWidth", 0.35, ...
                "DisplayName", displayName, ...
                "HandleVisibility", visibility); %#ok<AGROW>
        end
    end

    if options.ShowEnvelope
        mesh = computeAzElTimeObstacleEnvelopeMesh(obstacle, struct( ...
            "TimeScale", timeScale, ...
            "MaximumSlices", options.MaximumDisplayedSlices, ...
            "VerticesPerContour", options.EnvelopeVerticesPerContour, ...
            "MaximumCentroidStep", options.EnvelopeMaximumCentroidStep));
        if ~isempty(mesh.Faces)
            envelopeHandles(end + 1, 1) = patch(ax, ...
                "Faces", mesh.Faces, ...
                "Vertices", mesh.Vertices, ...
                "FaceColor", [0.48 0.08 0.72], ...
                "FaceAlpha", options.EnvelopeFaceAlpha, ...
                "EdgeColor", "none", ...
                "DisplayName", obstacle.Name + " swept envelope"); %#ok<AGROW>
        end
    end
end

xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
zlabel(ax, sprintf("Time from %s (%s)", ...
    string(workspace.ReferenceTime), timeLabel));
title(ax, sprintf("Az/el/time obstacle workspace (%d obstacle%s)", ...
    workspace.ObstacleCount, pluralSuffix(workspace.ObstacleCount)));
xlim(ax, [-180 180]);
ylim(ax, [0 90]);
view(ax, 3);
axis(ax, "vis3d");
if ~isempty(sliceHandles)
    legend(ax, "Location", "best");
end
sliceVisibilityControl = gobjects(0, 1);
if options.ShowSliceToggle && ~isempty(sliceHandles)
    sliceVisibilityControl = uicontrol(figureHandle, ...
        "Style", "checkbox", ...
        "Units", "normalized", ...
        "Position", [0.40 0.008 0.22 0.035], ...
        "String", "Show 3-D slices", ...
        "Value", 1, ...
        "BackgroundColor", figureHandle.Color, ...
        "Callback", @(source, ~) setSliceVisibility( ...
        source, sliceHandles));
end

handles = struct( ...
    "Figure", figureHandle, ...
    "Axes", ax, ...
    "SliceHandles", sliceHandles, ...
    "EnvelopeHandles", envelopeHandles, ...
    "SliceVisibilityControl", sliceVisibilityControl, ...
    "TimeScale", timeScale, ...
    "TimeUnit", timeLabel);
end

function setSliceVisibility(control, sliceHandles)
sliceHandles = sliceHandles(isgraphics(sliceHandles));
if control.Value
    visibility = "on";
else
    visibility = "off";
end
set(sliceHandles, "Visible", visibility);
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

function [scale, label] = chooseTimeScale(workspace, requested)
requested = lower(string(requested));
maximum = 0;
for k = 1:numel(workspace.Obstacles)
    if ~isempty(workspace.Obstacles(k).TimeSeconds)
        maximum = max(maximum, max(workspace.Obstacles(k).TimeSeconds));
    end
end
if requested == "auto"
    if maximum >= 2 * 3600
        requested = "hours";
    elseif maximum >= 2 * 60
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
        error("plotAzElTimeObstacleWorkspace:InvalidTimeUnit", ...
            "TimeUnit must be auto, seconds, minutes, or hours.");
end
end

function suffix = pluralSuffix(count)
if count == 1
    suffix = "";
else
    suffix = "s";
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
