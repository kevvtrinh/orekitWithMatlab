function animationHandles = animateAzElAvoidancePlan(scenario, plan, options)
%ANIMATEAZELAVOIDANCEPLAN Animate a planned azimuth/elevation trajectory.
%
% options = animateAzElAvoidancePlan()
% handles = animateAzElAvoidancePlan(scenario, plan)
% handles = animateAzElAvoidancePlan(scenario, plan, options)
%
% The combined view shows the current obstacle geometry in azimuth/elevation
% and the complete obstacle history in azimuth/elevation/time. Animation is
% display-only and does not alter the scenario, plan, or validation result.

defaultOptions = animationDefaults();
if nargin == 0
    animationHandles = defaultOptions;
    return;
end
if nargin < 3 || isempty(options)
    options = struct();
end
options = resolveOptions(options, defaultOptions);
validateInputs(scenario, plan);

obstacles = normalizeObstacles(scenario.azElData);
frameIndices = displayFrameIndices(numel(plan.time_s), ...
    options.MaximumAnimationFrames);
colors = lines(max(1, numel(obstacles)));
figureName = options.FigureName;
if strlength(figureName) == 0
    if isfield(scenario, "id") && isfield(scenario, "name")
        figureName = string(scenario.id) + " - " + string(scenario.name);
    elseif isfield(scenario, "name")
        figureName = string(scenario.name);
    else
        figureName = "Az/El avoidance-plan playback";
    end
end

figureHandle = figure("Name", figureName, "Color", "w", ...
    "Units", "normalized", "Position", [0.05 0.08 0.90 0.84], ...
    "Visible", options.FigureVisible);
[layout, azElAxes, timeAxes] = createAxes(figureHandle, options.ViewMode);
summaryTitle = sgtitle(layout, "", "FontWeight", "bold", ...
    "Interpreter", "none");

twoDimensional = struct();
threeDimensional = struct();
if isgraphics(azElAxes)
    twoDimensional = initializeTwoDimensionalView( ...
        azElAxes, scenario, plan, obstacles, colors, options);
end
if isgraphics(timeAxes)
    threeDimensional = initializeThreeDimensionalView( ...
        timeAxes, scenario, plan, obstacles, colors, options);
end

completedFrameCount = 0;
for frameNumber = 1:numel(frameIndices)
    if ~isgraphics(figureHandle)
        break;
    end
    planIndex = frameIndices(frameNumber);
    currentTime_s = plan.time_s(planIndex);
    if isgraphics(azElAxes)
        updateTwoDimensionalView(twoDimensional, obstacles, scenario, ...
            plan, planIndex, currentTime_s, options);
    end
    if isgraphics(timeAxes)
        updateThreeDimensionalView(threeDimensional, scenario, plan, ...
            planIndex, currentTime_s);
    end
    if isgraphics(summaryTitle)
        summaryTitle.String = sprintf( ...
            "%s | t = %.2f s | frame %d/%d", figureName, ...
            currentTime_s, frameNumber, numel(frameIndices));
    end
    drawnow;
    if options.PauseSeconds > 0
        pause(options.PauseSeconds);
    end
    completedFrameCount = frameNumber;
end

animationHandles = struct( ...
    "Figure", figureHandle, ...
    "Layout", layout, ...
    "SummaryTitle", summaryTitle, ...
    "AzElAxes", azElAxes, ...
    "TimeAxes", timeAxes, ...
    "TwoDimensional", twoDimensional, ...
    "ThreeDimensional", threeDimensional, ...
    "FrameIndices", frameIndices, ...
    "FrameCount", completedFrameCount, ...
    "Completed", completedFrameCount == numel(frameIndices), ...
    "Options", options);
end

function [layout, azElAxes, timeAxes] = createAxes(figureHandle, viewMode)
azElAxes = gobjects(1);
timeAxes = gobjects(1);
switch viewMode
    case "2d"
        layout = tiledlayout(figureHandle, 1, 1, ...
            "TileSpacing", "compact", "Padding", "compact");
        azElAxes = nexttile(layout);
    case "3d"
        layout = tiledlayout(figureHandle, 1, 1, ...
            "TileSpacing", "compact", "Padding", "compact");
        timeAxes = nexttile(layout);
    otherwise
        layout = tiledlayout(figureHandle, 1, 2, ...
            "TileSpacing", "compact", "Padding", "compact");
        azElAxes = nexttile(layout);
        timeAxes = nexttile(layout);
end
end

function view = initializeTwoDimensionalView( ...
        ax, scenario, plan, obstacles, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
view.Obstacles = gobjects(numel(obstacles), 1);
for obstacleIndex = 1:numel(obstacles)
    obstacleHandleVisibility = "on";
    if obstacleIndex > options.MaximumObstacleLegendEntries
        obstacleHandleVisibility = "off";
    end
    view.Obstacles(obstacleIndex) = patch(ax, NaN, NaN, ...
        colors(obstacleIndex, :), ...
        "FaceAlpha", options.ObstacleFaceAlpha, ...
        "EdgeColor", colors(obstacleIndex, :), ...
        "LineWidth", 1.2, ...
        "HandleVisibility", obstacleHandleVisibility, ...
        "DisplayName", obstacles(obstacleIndex).name);
end
[fullAzimuth, fullElevation] = segmentedPath(plan.position_deg);
view.FullPath = plot(ax, fullAzimuth, fullElevation, "-", ...
    "Color", [0.65 0.65 0.65], "LineWidth", 1.2, ...
    "DisplayName", "Complete plan");
view.FuturePath = plot(ax, NaN, NaN, "--", ...
    "Color", [0.25 0.45 0.90], "LineWidth", 1.3, ...
    "DisplayName", "Future plan");
view.TraveledPath = plot(ax, NaN, NaN, "b-", "LineWidth", 2.4, ...
    "DisplayName", "Traveled plan");
view.CurrentBoresight = plot(ax, NaN, NaN, "ko", ...
    "MarkerFaceColor", [1.00 0.80 0.10], "MarkerSize", 8, ...
    "DisplayName", "Current boresight");
view.Start = plot(ax, plan.position_deg(1, 1), plan.position_deg(1, 2), ...
    "go", "MarkerFaceColor", "g", "MarkerSize", 7, ...
    "DisplayName", "Start");
view.Terminal = plot(ax, plan.position_deg(end, 1), ...
    plan.position_deg(end, 2), "rs", "MarkerFaceColor", "r", ...
    "MarkerSize", 7, "DisplayName", "Terminal");
[view.TargetPath, view.CurrentTarget] = initializeTarget2d(ax, scenario);
applyAngularLimits(ax, scenario, plan);
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
title(ax, "Current azimuth/elevation geometry");
legend(ax, "Location", "bestoutside");
end

function [targetPath, currentTarget] = initializeTarget2d(ax, scenario)
targetPath = gobjects(1);
currentTarget = gobjects(1);
if ~hasTarget(scenario)
    return;
end
[targetAzimuth, targetElevation] = segmentedPath( ...
    scenario.target.position_deg);
targetPath = plot(ax, targetAzimuth, targetElevation, "m--", ...
    "LineWidth", 1.4, "DisplayName", "Target path");
currentTarget = plot(ax, NaN, NaN, "md", "MarkerFaceColor", "m", ...
    "MarkerSize", 7, "DisplayName", "Current target");
end

function viewState = initializeThreeDimensionalView( ...
        ax, scenario, plan, obstacles, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
viewState.ObstacleSlices = gobjects(0, 1);
if options.ShowObstacleSlices
    slicesPerObstacle = max(1, floor( ...
        options.MaximumDisplayedSlices / max(1, numel(obstacles))));
    for obstacleIndex = 1:numel(obstacles)
        obstacle = obstacles(obstacleIndex);
        sliceIndices = displayFrameIndices(numel(obstacle.time_s), ...
            slicesPerObstacle);
        for sliceIndex = reshape(sliceIndices, 1, [])
            [azimuth, elevation] = closedSlice( ...
                obstacle.slices{sliceIndex});
            sliceTime_s = obstacle.time_s(sliceIndex);
            sliceHandle = patch(ax, azimuth, elevation, ...
                repmat(sliceTime_s, size(azimuth)), ...
                colors(obstacleIndex, :), ...
                "FaceAlpha", options.ObstacleFaceAlpha * 0.7, ...
                "EdgeColor", colors(obstacleIndex, :), ...
                "EdgeAlpha", 0.45, "HandleVisibility", "off");
            viewState.ObstacleSlices(end + 1, 1) = sliceHandle;
        end
    end
end
[pathAzimuth, pathElevation, pathTime] = segmentedPath( ...
    plan.position_deg, plan.time_s);
viewState.Plan = plot3(ax, pathAzimuth, pathElevation, pathTime, "b-", ...
    "LineWidth", 2.2, "DisplayName", "Planned trajectory");
viewState.TraveledPath = plot3(ax, NaN, NaN, NaN, "c-", ...
    "LineWidth", 3.0, "DisplayName", "Traveled trajectory");
viewState.CurrentBoresight = plot3(ax, NaN, NaN, NaN, "ko", ...
    "MarkerFaceColor", [1.00 0.80 0.10], "MarkerSize", 8, ...
    "DisplayName", "Current boresight");
[viewState.TargetPath, viewState.CurrentTarget] = ...
    initializeTarget3d(ax, scenario);
azimuthLimits = angularLimits(scenario, plan, 1);
elevationLimits = angularLimits(scenario, plan, 2);
[planeAzimuth, planeElevation] = meshgrid(azimuthLimits, elevationLimits);
viewState.CurrentTimePlane = surf(ax, planeAzimuth, planeElevation, ...
    repmat(plan.time_s(1), 2, 2), ...
    "FaceColor", [0.25 0.25 0.25], "FaceAlpha", 0.05, ...
    "EdgeColor", [0.4 0.4 0.4], "EdgeAlpha", 0.2, ...
    "HandleVisibility", "off");
xlim(ax, azimuthLimits);
ylim(ax, elevationLimits);
zlim(ax, paddedLimits(plan.time_s));
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
zlabel(ax, "Time (s)");
title(ax, "Space-time trajectory and obstacle slices");
view(ax, 42, 25);
legend(ax, "Location", "bestoutside");
end

function [targetPath, currentTarget] = initializeTarget3d(ax, scenario)
targetPath = gobjects(1);
currentTarget = gobjects(1);
if ~hasTarget(scenario)
    return;
end
[azimuth, elevation, time_s] = segmentedPath( ...
    scenario.target.position_deg, scenario.target.time_s);
targetPath = plot3(ax, azimuth, elevation, time_s, "m--", ...
    "LineWidth", 1.4, "DisplayName", "Target trajectory");
currentTarget = plot3(ax, NaN, NaN, NaN, "md", ...
    "MarkerFaceColor", "m", "MarkerSize", 7, ...
    "DisplayName", "Current target");
end

function updateTwoDimensionalView( ...
        view, obstacles, scenario, plan, planIndex, currentTime_s, options)
for obstacleIndex = 1:numel(obstacles)
    obstacle = obstacles(obstacleIndex);
    [azimuth, elevation, visible] = obstacleAtTime( ...
        obstacle, currentTime_s);
    if visible
        set(view.Obstacles(obstacleIndex), "XData", azimuth, ...
            "YData", elevation, "Visible", "on");
    else
        set(view.Obstacles(obstacleIndex), "XData", NaN, ...
            "YData", NaN, "Visible", "off");
    end
end
[traveledAzimuth, traveledElevation] = segmentedPath( ...
    plan.position_deg(1:planIndex, :));
set(view.TraveledPath, "XData", traveledAzimuth, ...
    "YData", traveledElevation);
if options.ShowFuturePath
    [futureAzimuth, futureElevation] = segmentedPath( ...
        plan.position_deg(planIndex:end, :));
    set(view.FuturePath, "XData", futureAzimuth, ...
        "YData", futureElevation, "Visible", "on");
else
    set(view.FuturePath, "Visible", "off");
end
set(view.CurrentBoresight, ...
    "XData", plan.position_deg(planIndex, 1), ...
    "YData", plan.position_deg(planIndex, 2));
if hasTarget(scenario) && isgraphics(view.CurrentTarget)
    targetPosition = targetAtTime(scenario.target, currentTime_s);
    set(view.CurrentTarget, "XData", targetPosition(1), ...
        "YData", targetPosition(2));
end
end

function updateThreeDimensionalView( ...
        view, scenario, plan, planIndex, currentTime_s)
[azimuth, elevation, time_s] = segmentedPath( ...
    plan.position_deg(1:planIndex, :), plan.time_s(1:planIndex));
set(view.TraveledPath, "XData", azimuth, "YData", elevation, ...
    "ZData", time_s);
set(view.CurrentBoresight, ...
    "XData", plan.position_deg(planIndex, 1), ...
    "YData", plan.position_deg(planIndex, 2), ...
    "ZData", currentTime_s);
set(view.CurrentTimePlane, "ZData", repmat(currentTime_s, 2, 2));
if hasTarget(scenario) && isgraphics(view.CurrentTarget)
    targetPosition = targetAtTime(scenario.target, currentTime_s);
    set(view.CurrentTarget, "XData", targetPosition(1), ...
        "YData", targetPosition(2), "ZData", currentTime_s);
end
end

function obstacles = normalizeObstacles(azElData)
emptyObstacle = struct("name", "", "time_s", zeros(0, 1), ...
    "slices", {{}});
if isempty(azElData)
    obstacles = repmat(emptyObstacle, 0, 1);
    return;
end
if iscell(azElData)
    obstacleInputs = azElData(:);
else
    obstacleInputs = num2cell(azElData(:));
end
obstacles = repmat(emptyObstacle, numel(obstacleInputs), 1);
for obstacleIndex = 1:numel(obstacleInputs)
    input = obstacleInputs{obstacleIndex};
    times = double(input.time_s(:));
    slices = cell(numel(times), 1);
    for sliceIndex = 1:numel(times)
        if iscell(input.az_deg)
            azimuth = double(input.az_deg{sliceIndex}(:));
            elevation = double(input.el_deg{sliceIndex}(:));
        elseif isvector(input.az_deg)
            azimuth = double(input.az_deg(:));
            elevation = double(input.el_deg(:));
        else
            azimuth = double(input.az_deg(:, sliceIndex));
            elevation = double(input.el_deg(:, sliceIndex));
        end
        slices{sliceIndex} = [azimuth, elevation];
    end
    obstacleName = "Obstacle " + obstacleIndex;
    if isfield(input, "targetName") && strlength(string(input.targetName)) > 0
        obstacleName = string(input.targetName);
    end
    obstacles(obstacleIndex) = struct("name", obstacleName, ...
        "time_s", times, "slices", {slices});
end
end

function [azimuth, elevation, visible] = obstacleAtTime(obstacle, queryTime_s)
visible = queryTime_s >= obstacle.time_s(1) && ...
    queryTime_s <= obstacle.time_s(end);
if ~visible
    azimuth = NaN;
    elevation = NaN;
    return;
end
[~, sliceIndex] = min(abs(obstacle.time_s - queryTime_s));
[azimuth, elevation] = closedSlice(obstacle.slices{sliceIndex});
end

function [azimuth, elevation] = closedSlice(slice)
azimuth = slice(:, 1);
elevation = slice(:, 2);
if isempty(azimuth)
    azimuth = NaN;
    elevation = NaN;
elseif azimuth(1) ~= azimuth(end) || elevation(1) ~= elevation(end)
    azimuth(end + 1, 1) = azimuth(1);
    elevation(end + 1, 1) = elevation(1);
end
end

function varargout = segmentedPath(position_deg, time_s)
if nargin < 2
    time_s = [];
end
position_deg = double(position_deg);
insertBreakAfter = abs(diff(position_deg(:, 1))) > 180;
outputLength = size(position_deg, 1) + nnz(insertBreakAfter);
azimuth = nan(outputLength, 1);
elevation = nan(outputLength, 1);
if ~isempty(time_s)
    segmentedTime = nan(outputLength, 1);
    time_s = double(time_s(:));
end
writeIndex = 1;
for sampleIndex = 1:size(position_deg, 1)
    azimuth(writeIndex) = position_deg(sampleIndex, 1);
    elevation(writeIndex) = position_deg(sampleIndex, 2);
    if ~isempty(time_s)
        segmentedTime(writeIndex) = time_s(sampleIndex);
    end
    writeIndex = writeIndex + 1;
    if sampleIndex < size(position_deg, 1) && insertBreakAfter(sampleIndex)
        writeIndex = writeIndex + 1;
    end
end
varargout = {azimuth, elevation};
if ~isempty(time_s)
    varargout{3} = segmentedTime;
end
end

function position = targetAtTime(target, queryTime_s)
queryTime_s = min(max(queryTime_s, target.time_s(1)), target.time_s(end));
position = interp1(double(target.time_s(:)), ...
    double(target.position_deg), queryTime_s, "linear");
end

function assertion = hasTarget(scenario)
assertion = isfield(scenario, "target") && ~isempty(scenario.target) && ...
    isfield(scenario.target, "time_s") && ...
    isfield(scenario.target, "position_deg") && ...
    ~isempty(scenario.target.time_s);
end

function applyAngularLimits(ax, scenario, plan)
xlim(ax, angularLimits(scenario, plan, 1));
ylim(ax, angularLimits(scenario, plan, 2));
end

function limits = angularLimits(scenario, plan, axisIndex)
fieldNames = ["azimuth_deg", "elevation_deg"];
fieldName = fieldNames(axisIndex);
if isfield(scenario, "limits") && isfield(scenario.limits, fieldName)
    limits = double(scenario.limits.(fieldName));
elseif isfield(plan, "limits") && isfield(plan.limits, fieldName)
    limits = double(plan.limits.(fieldName));
else
    limits = paddedLimits(plan.position_deg(:, axisIndex));
end
limits = reshape(limits, 1, 2);
end

function limits = paddedLimits(values)
values = double(values(isfinite(values)));
if isempty(values)
    limits = [-1 1];
    return;
end
limits = [min(values), max(values)];
if diff(limits) <= eps(max(abs(limits)) + 1)
    limits = limits + [-0.5 0.5];
else
    limits = limits + 0.03 * diff(limits) * [-1 1];
end
end

function indices = displayFrameIndices(sampleCount, maximumCount)
if sampleCount <= maximumCount
    indices = (1:sampleCount).';
else
    indices = unique(round(linspace(1, sampleCount, maximumCount))).';
end
end

function validateInputs(scenario, plan)
if ~isstruct(scenario) || ~isscalar(scenario) || ...
        ~all(isfield(scenario, ["azElData", "limits"]))
    error("animateAzElAvoidancePlan:InvalidScenario", ...
        "scenario must be a scalar planner scenario.");
end
requiredPlanFields = ["success", "time_s", "position_deg"];
if ~isstruct(plan) || ~isscalar(plan) || ...
        ~all(isfield(plan, requiredPlanFields)) || ~plan.success
    error("animateAzElAvoidancePlan:InvalidPlan", ...
        "plan must be a successful planAzElTrajectory result.");
end
validateattributes(plan.time_s, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
validateattributes(plan.position_deg, {'numeric'}, ...
    {'2d', 'ncols', 2, 'real', 'finite'});
if size(plan.position_deg, 1) ~= numel(plan.time_s)
    error("animateAzElAvoidancePlan:PlanSizeMismatch", ...
        "plan.position_deg must have one row per time sample.");
end
end

function options = resolveOptions(options, defaults)
if ~isstruct(options) || ~isscalar(options)
    error("animateAzElAvoidancePlan:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownFields = setdiff(fieldnames(options), fieldnames(defaults));
if ~isempty(unknownFields)
    error("animateAzElAvoidancePlan:UnknownOption", ...
        "Unknown option fields: %s.", strjoin(string(unknownFields), ", "));
end
defaultFields = fieldnames(defaults);
for fieldIndex = 1:numel(defaultFields)
    fieldName = defaultFields{fieldIndex};
    if ~isfield(options, fieldName) || isempty(options.(fieldName))
        options.(fieldName) = defaults.(fieldName);
    end
end
options.ViewMode = lower(string(options.ViewMode));
if ~isscalar(options.ViewMode) || ...
        ~any(options.ViewMode == ["2d", "3d", "combined"])
    error("animateAzElAvoidancePlan:InvalidViewMode", ...
        "ViewMode must be 2d, 3d, or combined.");
end
options.FigureVisible = lower(string(options.FigureVisible));
if ~isscalar(options.FigureVisible) || ...
        ~any(options.FigureVisible == ["on", "off"])
    error("animateAzElAvoidancePlan:InvalidFigureVisible", ...
        "FigureVisible must be on or off.");
end
options.FigureName = string(options.FigureName);
validateattributes(options.MaximumAnimationFrames, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumDisplayedSlices, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumObstacleLegendEntries, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.PauseSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.ObstacleFaceAlpha, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
options.ShowFuturePath = logicalScalar(options.ShowFuturePath, ...
    "ShowFuturePath");
options.ShowObstacleSlices = logicalScalar(options.ShowObstacleSlices, ...
    "ShowObstacleSlices");
end

function value = logicalScalar(value, name)
validateattributes(value, {'logical', 'numeric'}, {'scalar'});
if value ~= 0 && value ~= 1
    error("animateAzElAvoidancePlan:InvalidOption", ...
        "%s must be logical or numeric 0/1.", name);
end
value = logical(value);
end

function options = animationDefaults()
options = struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "MaximumObstacleLegendEntries", 8, ...
    "PauseSeconds", 0.02, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.12, ...
    "FigureVisible", "on", ...
    "FigureName", "");
end
