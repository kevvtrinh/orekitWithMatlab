function handles = animateAzElAvoidancePlan(azElData, plan, options)
%ANIMATEAZELAVOIDANCEPLAN Animate a completed az/el avoidance plan.
%
% handles = animateAzElAvoidancePlan(azElData, plan)
%
% The combined view synchronizes the current moving obstacle boundary and
% boresight in 2-D with accumulated obstacle slices and the traveled plan
% in azimuth/elevation/time space. Playback is display-decimated only; the
% plan and packed collision workspace retain every input sample.
%
% Options:
%   ViewMode                 "2d", "3d", or "combined" (default).
%   MaximumAnimationFrames   Display-frame cap (default 180).
%   MaximumDisplayedSlices  3-D obstacle-slice cap (default 100).
%   PauseSeconds             Pause after each frame (default 0.01).
%   ShowFuturePath           Show the remaining path (default true).
%   ShowObstacleSlices       Reveal accumulated 3-D slices (default true).
%   ObstacleFaceAlpha        3-D slice opacity (default 0.08).
%   FigureVisible            "on" or "off" (default "on").

if nargin < 3
    options = struct();
end
options = normalizeOptions(options);
dataList = normalizeDataList(azElData);
for k = 1:numel(dataList)
    dataList{k} = normalizeAzElTimeObstacleData(dataList{k});
end
validatePlan(plan);
workspace = planWorkspace(plan, dataList);

frameIndices = displayIndices( ...
    numel(plan.time_s), options.MaximumAnimationFrames);
colors = lines(max(1, numel(dataList)));
figureHandle = figure( ...
    "Name", "Az/El avoidance-plan playback", ...
    "Color", "w", ...
    "Visible", options.FigureVisible);

[layout, azElAxes, workspaceAxes] = createLayout( ...
    figureHandle, options.ViewMode);
twoDimensional = emptyTwoDimensionalView();
threeDimensional = emptyThreeDimensionalView();
if isgraphics(azElAxes)
    twoDimensional = initializeTwoDimensionalView( ...
        azElAxes, dataList, plan, colors, options);
end
if isgraphics(workspaceAxes)
    threeDimensional = initializeThreeDimensionalView( ...
        workspaceAxes, workspace, dataList, plan, colors, options);
end

completedFrameCount = 0;
for frameNumber = 1:numel(frameIndices)
    if ~isgraphics(figureHandle)
        break;
    end
    planIndex = frameIndices(frameNumber);
    currentTime_s = plan.time_s(planIndex);
    if isgraphics(azElAxes)
        updateTwoDimensionalView( ...
            twoDimensional, dataList, plan, planIndex, ...
            currentTime_s, options);
    end
    if isgraphics(workspaceAxes)
        updateThreeDimensionalView( ...
            threeDimensional, dataList, plan, planIndex, ...
            currentTime_s, options);
    end
    drawnow limitrate;
    if options.PauseSeconds > 0
        pause(options.PauseSeconds);
    end
    completedFrameCount = frameNumber;
end
if isgraphics(figureHandle)
    drawnow;
end

handles = struct( ...
    "Figure", figureHandle, ...
    "Layout", layout, ...
    "AzElAxes", azElAxes, ...
    "WorkspaceAxes", workspaceAxes, ...
    "TwoDimensional", twoDimensional, ...
    "ThreeDimensional", threeDimensional, ...
    "FrameIndices", frameIndices, ...
    "FrameCount", completedFrameCount, ...
    "Completed", completedFrameCount == numel(frameIndices), ...
    "Options", options);
end

function view = initializeTwoDimensionalView( ...
        ax, dataList, plan, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
view.FuturePath = plot(ax, NaN, NaN, "--", ...
    "Color", [0.65 0.67 0.72], "LineWidth", 1.1, ...
    "DisplayName", "Future path", ...
    "Visible", visibility(options.ShowFuturePath));
view.TraveledPath = plot(ax, NaN, NaN, "-", ...
    "Color", [0.05 0.32 0.68], "LineWidth", 2.2, ...
    "DisplayName", "Traveled path");
view.CurrentBoresight = plot(ax, NaN, NaN, "o", ...
    "MarkerSize", 8, "MarkerFaceColor", [0.95 0.62 0.08], ...
    "MarkerEdgeColor", "k", "DisplayName", "Current boresight");
view.Start = plot(ax, plan.position_deg(1, 1), ...
    plan.position_deg(1, 2), "s", ...
    "MarkerSize", 7, "MarkerFaceColor", [0.15 0.65 0.28], ...
    "MarkerEdgeColor", "k", "DisplayName", "Start");
view.Stop = plot(ax, plan.position_deg(end, 1), ...
    plan.position_deg(end, 2), "d", ...
    "MarkerSize", 7, "MarkerFaceColor", [0.82 0.18 0.18], ...
    "MarkerEdgeColor", "k", "DisplayName", "Stop");
view.ObstacleBoundaries = gobjects(numel(dataList), 1);
for obstacleIndex = 1:numel(dataList)
    view.ObstacleBoundaries(obstacleIndex) = plot(ax, NaN, NaN, "-", ...
        "Color", colors(obstacleIndex, :), "LineWidth", 1.8, ...
        "DisplayName", dataList{obstacleIndex}.targetName);
end
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
title(ax, "Current az/el geometry");
applyAngularLimits(ax, plan);
legend(ax, "Location", "best");
end

function viewState = initializeThreeDimensionalView( ...
        ax, workspace, dataList, plan, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
[futureAz, futureEl, futureTime] = segmentedPlan(plan, ...
    1:numel(plan.time_s));
viewState.FuturePath = plot3(ax, futureAz, futureEl, futureTime, "--", ...
    "Color", [0.65 0.67 0.72], "LineWidth", 1.0, ...
    "DisplayName", "Future path", ...
    "Visible", visibility(options.ShowFuturePath));
viewState.TraveledPath = plot3(ax, NaN, NaN, NaN, "-", ...
    "Color", [0.05 0.32 0.68], "LineWidth", 2.4, ...
    "DisplayName", "Traveled path");
viewState.CurrentBoresight = plot3(ax, NaN, NaN, NaN, "o", ...
    "MarkerSize", 8, "MarkerFaceColor", [0.95 0.62 0.08], ...
    "MarkerEdgeColor", "k", "DisplayName", "Current boresight");
viewState.CurrentBoundaries = gobjects(numel(dataList), 1);
for obstacleIndex = 1:numel(dataList)
    viewState.CurrentBoundaries(obstacleIndex) = plot3( ...
        ax, NaN, NaN, NaN, "-", ...
        "Color", colors(obstacleIndex, :), "LineWidth", 1.8, ...
        "HandleVisibility", "off");
end
[viewState.ObstacleSlices, viewState.ObstacleSliceTimes_s] = ...
    createObstacleSlices(ax, workspace, colors, options);
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
zlabel(ax, "Time (s)");
title(ax, "Plan through az/el/time workspace");
applyAngularLimits(ax, plan);
zlim(ax, expandedLimits(plan.time_s));
view(ax, 38, 25);
axis(ax, "vis3d");
legend(ax, "Location", "best");
end

function updateTwoDimensionalView( ...
        view, dataList, plan, planIndex, currentTime_s, options)
[traveledAz, traveledEl] = segmentedPlan(plan, 1:planIndex);
set(view.TraveledPath, "XData", traveledAz, "YData", traveledEl);
if options.ShowFuturePath
    [futureAz, futureEl] = segmentedPlan( ...
        plan, planIndex:numel(plan.time_s));
    set(view.FuturePath, "XData", futureAz, "YData", futureEl);
end
set(view.CurrentBoresight, ...
    "XData", plan.position_deg(planIndex, 1), ...
    "YData", plan.position_deg(planIndex, 2));
for obstacleIndex = 1:numel(dataList)
    data = dataList{obstacleIndex};
    sample = nearestSample(data.time_s, currentTime_s);
    set(view.ObstacleBoundaries(obstacleIndex), ...
        "XData", data.az_deg{sample}, ...
        "YData", data.el_deg{sample});
end
title(view.TraveledPath.Parent, sprintf( ...
    "Current az/el geometry at t = %.1f s", currentTime_s));
end

function updateThreeDimensionalView( ...
        view, dataList, plan, planIndex, currentTime_s, options)
[traveledAz, traveledEl, traveledTime] = ...
    segmentedPlan(plan, 1:planIndex);
set(view.TraveledPath, ...
    "XData", traveledAz, ...
    "YData", traveledEl, ...
    "ZData", traveledTime);
if options.ShowFuturePath
    [futureAz, futureEl, futureTime] = segmentedPlan( ...
        plan, planIndex:numel(plan.time_s));
    set(view.FuturePath, ...
        "XData", futureAz, ...
        "YData", futureEl, ...
        "ZData", futureTime);
end
set(view.CurrentBoresight, ...
    "XData", plan.position_deg(planIndex, 1), ...
    "YData", plan.position_deg(planIndex, 2), ...
    "ZData", currentTime_s);
for obstacleIndex = 1:numel(dataList)
    data = dataList{obstacleIndex};
    sample = nearestSample(data.time_s, currentTime_s);
    azimuth = data.az_deg{sample};
    set(view.CurrentBoundaries(obstacleIndex), ...
        "XData", azimuth, ...
        "YData", data.el_deg{sample}, ...
        "ZData", repmat(currentTime_s, size(azimuth)));
end
if options.ShowObstacleSlices && ~isempty(view.ObstacleSlices)
    visibleSlices = view.ObstacleSliceTimes_s <= currentTime_s;
    if any(visibleSlices)
        set(view.ObstacleSlices(visibleSlices), "Visible", "on");
    end
end
title(view.TraveledPath.Parent, sprintf( ...
    "Az/el/time workspace at t = %.1f s", currentTime_s));
end

function [sliceHandles, sliceTimes_s] = createObstacleSlices( ...
        ax, workspace, colors, options)
sliceHandles = gobjects(0, 1);
sliceTimes_s = zeros(0, 1);
if ~options.ShowObstacleSlices || options.MaximumDisplayedSlices == 0
    return;
end
obstacleCount = numel(workspace.Obstacles);
maximumPerObstacle = max(1, floor( ...
    options.MaximumDisplayedSlices / max(1, obstacleCount)));
for obstacleIndex = 1:obstacleCount
    obstacle = workspace.Obstacles(obstacleIndex);
    available = find(all(isfinite(obstacle.BoundsDeg), 2));
    selected = selectedSamples(available, maximumPerObstacle);
    color = colors(min(obstacleIndex, size(colors, 1)), :);
    for sample = reshape(selected, 1, [])
        [azimuthParts, elevationParts] = sliceRegions(obstacle, sample);
        for region = 1:numel(azimuthParts)
            sliceHandles(end + 1, 1) = patch(ax, ...
                azimuthParts{region}, elevationParts{region}, ...
                repmat(obstacle.TimeSeconds(sample), ...
                size(azimuthParts{region})), color, ...
                "FaceAlpha", options.ObstacleFaceAlpha, ...
                "EdgeColor", 0.7 .* color, ...
                "LineWidth", 0.4, ...
                "Visible", "off", ...
                "HandleVisibility", "off"); %#ok<AGROW>
            sliceTimes_s(end + 1, 1) = ...
                obstacle.TimeSeconds(sample); %#ok<AGROW>
        end
    end
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

function [azimuth, elevation, time_s] = segmentedPlan(plan, indices)
indices = reshape(indices, [], 1);
azimuth = plan.position_deg(indices, 1);
elevation = plan.position_deg(indices, 2);
time_s = plan.time_s(indices);
wrapBreak = [false; abs(diff(azimuth)) > 180];
azimuth(wrapBreak) = NaN;
elevation(wrapBreak) = NaN;
time_s(wrapBreak) = NaN;
end

function sample = nearestSample(time_s, queryTime_s)
[~, sample] = min(abs(time_s - queryTime_s));
end

function selected = selectedSamples(available, maximumCount)
if isempty(available)
    selected = zeros(0, 1);
elseif numel(available) <= maximumCount
    selected = available;
else
    position = unique(round(linspace(1, numel(available), maximumCount)));
    selected = available(position);
end
end

function indices = displayIndices(sampleCount, maximumCount)
if sampleCount <= maximumCount
    indices = (1:sampleCount).';
else
    indices = unique(round(linspace(1, sampleCount, maximumCount))).';
end
end

function [layout, azElAxes, workspaceAxes] = createLayout(figureHandle, mode)
azElAxes = gobjects(1);
workspaceAxes = gobjects(1);
switch mode
    case "2d"
        layout = tiledlayout(figureHandle, 1, 1, ...
            "TileSpacing", "compact", "Padding", "compact");
        azElAxes = nexttile(layout);
    case "3d"
        layout = tiledlayout(figureHandle, 1, 1, ...
            "TileSpacing", "compact", "Padding", "compact");
        workspaceAxes = nexttile(layout);
    otherwise
        layout = tiledlayout(figureHandle, 1, 2, ...
            "TileSpacing", "compact", "Padding", "compact");
        azElAxes = nexttile(layout);
        workspaceAxes = nexttile(layout);
end
end

function applyAngularLimits(ax, plan)
if isfield(plan, "limits") && ...
        all(isfield(plan.limits, ["azimuth_deg", "elevation_deg"]))
    xlim(ax, plan.limits.azimuth_deg);
    ylim(ax, plan.limits.elevation_deg);
else
    xlim(ax, expandedLimits(plan.position_deg(:, 1)));
    ylim(ax, expandedLimits(plan.position_deg(:, 2)));
end
end

function limits = expandedLimits(values)
finite = values(isfinite(values));
if isempty(finite)
    limits = [-1 1];
    return;
end
limits = [min(finite), max(finite)];
if diff(limits) < eps(max(abs(limits)) + 1)
    limits = limits + [-0.5 0.5];
else
    padding = 0.03 * diff(limits);
    limits = limits + [-padding padding];
end
end

function workspace = planWorkspace(plan, dataList)
if isfield(plan, "workspace") && isstruct(plan.workspace) && ...
        isfield(plan.workspace, "Format") && ...
        plan.workspace.Format == "AzElTimeObstacleWorkspace"
    workspace = plan.workspace;
else
    workspace = buildAzElTimeObstacleWorkspace(dataList);
end
end

function validatePlan(plan)
required = ["success", "time_s", "position_deg"];
if ~isstruct(plan) || ~isscalar(plan) || ...
        ~all(isfield(plan, cellstr(required))) || ~plan.success
    error("animateAzElAvoidancePlan:InvalidPlan", ...
        "plan must be a successful planAzElAvoidance result.");
end
validateattributes(plan.time_s, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
validateattributes(plan.position_deg, {'numeric'}, ...
    {'2d', 'ncols', 2, 'real', 'finite'});
if size(plan.position_deg, 1) ~= numel(plan.time_s)
    error("animateAzElAvoidancePlan:PlanSizeMismatch", ...
        "plan.position_deg must contain one row per time sample.");
end
end

function dataList = normalizeDataList(input)
if iscell(input)
    dataList = input(:);
elseif isstruct(input)
    dataList = arrayfun(@(item) item, input(:), ...
        "UniformOutput", false);
else
    error("animateAzElAvoidancePlan:InvalidInput", ...
        "azElData must be a struct, struct array, or cell array.");
end
if isempty(dataList)
    error("animateAzElAvoidancePlan:EmptyInput", ...
        "At least one azElData obstacle is required.");
end
end

function view = emptyTwoDimensionalView()
view = struct( ...
    "FuturePath", gobjects(1), ...
    "TraveledPath", gobjects(1), ...
    "CurrentBoresight", gobjects(1), ...
    "Start", gobjects(1), ...
    "Stop", gobjects(1), ...
    "ObstacleBoundaries", gobjects(0, 1));
end

function view = emptyThreeDimensionalView()
view = struct( ...
    "FuturePath", gobjects(1), ...
    "TraveledPath", gobjects(1), ...
    "CurrentBoresight", gobjects(1), ...
    "CurrentBoundaries", gobjects(0, 1), ...
    "ObstacleSlices", gobjects(0, 1), ...
    "ObstacleSliceTimes_s", zeros(0, 1));
end

function options = normalizeOptions(input)
defaults = struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.08, ...
    "FigureVisible", "on");
options = applyDefaults(input, defaults);
options.ViewMode = lower(string(options.ViewMode));
if ~any(options.ViewMode == ["2d", "3d", "combined"])
    error("animateAzElAvoidancePlan:InvalidViewMode", ...
        "ViewMode must be 2d, 3d, or combined.");
end
validateattributes(options.MaximumAnimationFrames, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumDisplayedSlices, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.PauseSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.ObstacleFaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
options.ShowFuturePath = logicalScalar( ...
    options.ShowFuturePath, "ShowFuturePath");
options.ShowObstacleSlices = logicalScalar( ...
    options.ShowObstacleSlices, "ShowObstacleSlices");
options.FigureVisible = lower(string(options.FigureVisible));
if ~isscalar(options.FigureVisible) || ...
        ~any(options.FigureVisible == ["on", "off"])
    error("animateAzElAvoidancePlan:InvalidFigureVisible", ...
        "FigureVisible must be on or off.");
end
end

function value = logicalScalar(value, name)
validateattributes(value, {'logical', 'numeric'}, {'scalar'});
if value ~= 0 && value ~= 1
    error("animateAzElAvoidancePlan:InvalidOption", ...
        "%s must be logical or numeric 0/1.", name);
end
value = logical(value);
end

function value = visibility(isVisible)
if isVisible
    value = "on";
else
    value = "off";
end
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
