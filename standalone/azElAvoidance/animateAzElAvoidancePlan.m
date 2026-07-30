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
%   ShowDiscretization       Backward-compatible master switch (default true).
%   DiscretizationMode       "off", "final", or "build" (default "final").
%   ShowCandidateRoutes      Show rejected valid routes (default true).
%   MaximumDiscretizationLines  Per-axis lattice-line cap (default 40).
%   MaximumDiscretizationTimePlanes  3-D time-plane cap (default 6).
%   MaximumDiscretizationEdges  Per-tree edge display cap (default 2000).
%   ShowPlanningSummary       Coordinate input, workspace, search, and
%                             selection playback (default false).
%   MovingTarget             Optional struct with time_s and position_deg.
%   FigureVisible            "on" or "off" (default "on").

%% Normalize display options
if nargin < 3
    options = struct();
end
callerSpecifiedDiscretizationMode = isfield( ...
    options, "DiscretizationMode") && ...
    ~isempty(options.DiscretizationMode);
callerSpecifiedObstacleSlices = isfield( ...
    options, "ShowObstacleSlices") && ...
    ~isempty(options.ShowObstacleSlices);
callerSpecifiedCandidateRoutes = isfield( ...
    options, "ShowCandidateRoutes") && ...
    ~isempty(options.ShowCandidateRoutes);
% Empty caller fields intentionally mean "use the library default." This
% lets examples override only the display choices they care about without
% copying a second configuration contract that can drift from this one.
defaultOptions = struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.08, ...
    "ShowDiscretization", true, ...
    "DiscretizationMode", "final", ...
    "ShowCandidateRoutes", true, ...
    "MaximumObstacleLegendEntries", 6, ...
    "MaximumDiscretizationLines", 40, ...
    "MaximumDiscretizationTimePlanes", 6, ...
    "MaximumDiscretizationEdges", 2000, ...
    "ShowPlanningSummary", false, ...
    "MovingTarget", [], ...
    "FigureVisible", "on");
defaultOptionFields = fieldnames(defaultOptions);
for defaultOptionIndex = 1:numel(defaultOptionFields)
    defaultOptionField = defaultOptionFields{defaultOptionIndex};
    if ~isfield(options, defaultOptionField) || ...
            isempty(options.(defaultOptionField))
        options.(defaultOptionField) = defaultOptions.(defaultOptionField);
    end
end
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
validateattributes(options.MaximumDiscretizationLines, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumObstacleLegendEntries, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.MaximumDiscretizationTimePlanes, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumDiscretizationEdges, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
options.ShowFuturePath = logicalScalar( ...
    options.ShowFuturePath, "ShowFuturePath");
options.ShowObstacleSlices = logicalScalar( ...
    options.ShowObstacleSlices, "ShowObstacleSlices");
options.ShowDiscretization = logicalScalar( ...
    options.ShowDiscretization, "ShowDiscretization");
options.DiscretizationMode = lower(string(options.DiscretizationMode));
if ~isscalar(options.DiscretizationMode) || ...
        ~any(options.DiscretizationMode == ["off", "final", "build"])
    error("animateAzElAvoidancePlan:InvalidDiscretizationMode", ...
        "DiscretizationMode must be off, final, or build.");
end
% The legacy boolean remains authoritative so existing scripts that turn
% discretization off cannot unexpectedly display a newly added tree.
if ~options.ShowDiscretization
    options.DiscretizationMode = "off";
end
options.ShowCandidateRoutes = logicalScalar( ...
    options.ShowCandidateRoutes, "ShowCandidateRoutes");
options.ShowPlanningSummary = logicalScalar( ...
    options.ShowPlanningSummary, "ShowPlanningSummary");
if options.ShowPlanningSummary
    % Summary playback defaults to showing every planning stage, but
    % explicit caller choices still permit a quieter diagnostic.
    if ~callerSpecifiedDiscretizationMode && options.ShowDiscretization
        options.DiscretizationMode = "build";
    end
    if ~callerSpecifiedObstacleSlices
        options.ShowObstacleSlices = true;
    end
    if ~callerSpecifiedCandidateRoutes
        options.ShowCandidateRoutes = true;
    end
end
if ~isempty(options.MovingTarget)
    movingTarget = options.MovingTarget;
    if ~isstruct(movingTarget) || ~isscalar(movingTarget) || ...
            ~all(isfield(movingTarget, ["time_s", "position_deg"]))
        error("animateAzElAvoidancePlan:InvalidMovingTarget", ...
            "MovingTarget requires time_s and position_deg.");
    end
    movingTarget.time_s = double(movingTarget.time_s(:));
    movingTarget.position_deg = double(movingTarget.position_deg);
    validateattributes(movingTarget.time_s, {'numeric'}, ...
        {'vector', 'real', 'finite', 'increasing'});
    validateattributes(movingTarget.position_deg, {'numeric'}, ...
        {'2d', 'ncols', 2, 'real', 'finite'});
    if size(movingTarget.position_deg, 1) ~= numel(movingTarget.time_s)
        error("animateAzElAvoidancePlan:MovingTargetSizeMismatch", ...
            "MovingTarget.position_deg must contain one row per time.");
    end
    % Keep the normalized samples in options because both views must use
    % the same interpolation input. Independent normalization could make
    % their displayed endpoint histories disagree.
    options.MovingTarget = movingTarget;
end
options.FigureVisible = lower(string(options.FigureVisible));
if ~isscalar(options.FigureVisible) || ...
        ~any(options.FigureVisible == ["on", "off"])
    error("animateAzElAvoidancePlan:InvalidFigureVisible", ...
        "FigureVisible must be on or off.");
end

%% Normalize obstacle and plan inputs
% combineAzElObstacles preserves one logical obstacle per element. The cell
% representation below is deliberate: each obstacle can have a different
% time base and a different number of vertices per slice.
combinedData = combineAzElObstacles(azElData);
dataList = cell(numel(combinedData), 1);
for obstacleIndex = 1:numel(combinedData)
    dataList{obstacleIndex} = normalizeAzElTimeObstacleData( ...
        combinedData(obstacleIndex));
end
requiredPlanFields = ["success", "time_s", "position_deg"];
if ~isstruct(plan) || ~isscalar(plan) || ...
        ~all(isfield(plan, cellstr(requiredPlanFields))) || ~plan.success
    error("animateAzElAvoidancePlan:InvalidPlan", ...
        "plan must be a successful planAzElDijkstra result.");
end
validateattributes(plan.time_s, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
validateattributes(plan.position_deg, {'numeric'}, ...
    {'2d', 'ncols', 2, 'real', 'finite'});
if size(plan.position_deg, 1) ~= numel(plan.time_s)
    error("animateAzElAvoidancePlan:PlanSizeMismatch", ...
        "plan.position_deg must contain one row per time sample.");
end
if isfield(plan, "workspace") && isstruct(plan.workspace) && ...
        isfield(plan.workspace, "Format") && ...
        plan.workspace.Format == "AzElTimeObstacleWorkspace"
    % A planner-owned workspace is already the exact collision model used
    % to validate the route, so displaying it avoids silently rebuilding a
    % geometrically different view from lossy or transformed source data.
    workspace = plan.workspace;
else
    workspace = buildAzElTimeObstacleWorkspace(dataList);
end

%% Summarize the data-to-command planning chain
inputTimeSampleCount = 0;
for obstacleIndex = 1:numel(dataList)
    inputTimeSampleCount = inputTimeSampleCount + ...
        numel(dataList{obstacleIndex}.time_s);
end
packedSliceCount = 0;
packedEdgeCount = 0;
for obstacleIndex = 1:numel(workspace.Obstacles)
    packedSliceCount = packedSliceCount + ...
        double(workspace.Obstacles(obstacleIndex).SampleCount);
    packedEdgeCount = packedEdgeCount + numel( ...
        workspace.Obstacles(obstacleIndex).EdgeStartAzimuthDeg);
end
searchType = "planned route";
if isfield(plan, "forwardTree") || isfield(plan, "backwardTree")
    searchType = "bidirectional RRT*";
elseif isfield(plan, "selectedGridStep_deg") && ...
        isfinite(plan.selectedGridStep_deg)
    searchType = "Dijkstra lattice";
elseif isfield(plan, "method")
    searchType = string(plan.method);
end
validContenderCount = 0;
if isfield(plan, "resolutionAttempts") && ...
        isstruct(plan.resolutionAttempts)
    resolutionAttempts = plan.resolutionAttempts;
    if all(isfield(resolutionAttempts, ["Success", "Selected"]))
        validContenderCount = nnz( ...
            [resolutionAttempts.Success] & ...
            ~[resolutionAttempts.Selected]);
    end
end
selectedMethod = searchType;
if isfield(plan, "method")
    selectedMethod = string(plan.method);
end
planningSummary = struct( ...
    "InputObstacleCount", numel(dataList), ...
    "InputTimeSampleCount", inputTimeSampleCount, ...
    "PackedSliceCount", packedSliceCount, ...
    "PackedEdgeCount", packedEdgeCount, ...
    "SearchType", searchType, ...
    "SearchItemCount", 0, ...
    "ValidContenderCount", validContenderCount, ...
    "SelectedMethod", selectedMethod, ...
    "SelectedPathSampleCount", numel(plan.time_s));

%% Create the synchronized figure
% Frame decimation affects display only. The plan and collision workspace
% retain all samples for analysis and validation. The final sample is always
% present because linspace includes both ends.
planSampleCount = numel(plan.time_s);
if planSampleCount <= options.MaximumAnimationFrames
    frameIndices = (1:planSampleCount).';
else
    frameIndices = unique(round(linspace( ...
        1, planSampleCount, options.MaximumAnimationFrames))).';
end
colors = lines(max(1, numel(dataList)));
figureHandle = figure( ...
    "Name", "Az/El avoidance-plan playback", ...
    "Color", "w", ...
    "Visible", options.FigureVisible);

azElAxes = gobjects(1);
workspaceAxes = gobjects(1);
switch options.ViewMode
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
summaryTitle = gobjects(1);
if options.ShowPlanningSummary
    summaryTitle = sgtitle(layout, sprintf( ...
        "Planning summary | azElData: %d obstacles, %d samples", ...
        planningSummary.InputObstacleCount, ...
        planningSummary.InputTimeSampleCount), ...
        "FontWeight", "bold");
end
twoDimensional = struct( ...
    "Discretization", gobjects(0, 1), ...
    "DiscretizationData", struct([]), ...
    "CandidateRoutes", gobjects(0, 1), ...
    "SelectedRoute", gobjects(1), ...
    "FuturePath", gobjects(1), ...
    "TraveledPath", gobjects(1), ...
    "CurrentBoresight", gobjects(1), ...
    "TargetPath", gobjects(1), ...
    "TargetTraveled", gobjects(1), ...
    "CurrentTarget", gobjects(1), ...
    "Start", gobjects(1), ...
    "Stop", gobjects(1), ...
    "ObstacleLegend", gobjects(0, 1), ...
    "ObstacleBoundaries", gobjects(0, 1));
threeDimensional = struct( ...
    "Discretization", gobjects(0, 1), ...
    "DiscretizationData", struct([]), ...
    "CandidateRoutes", gobjects(0, 1), ...
    "SelectedRoute", gobjects(1), ...
    "FuturePath", gobjects(1), ...
    "TraveledPath", gobjects(1), ...
    "CurrentBoresight", gobjects(1), ...
    "TargetPath", gobjects(1), ...
    "TargetTraveled", gobjects(1), ...
    "CurrentTarget", gobjects(1), ...
    "CurrentBoundaries", gobjects(0, 1), ...
    "ObstacleSlices", gobjects(0, 1), ...
    "ObstacleSliceTimes_s", zeros(0, 1));
% Initialization and update remain separate lifecycle boundaries. They are
% each entered once syntactically, but update runs once per frame and must
% mutate the stable graphics handles allocated during initialization.
if isgraphics(azElAxes)
    twoDimensional = initializeTwoDimensionalView( ...
        azElAxes, dataList, plan, colors, options);
end
if isgraphics(workspaceAxes)
    threeDimensional = initializeThreeDimensionalView( ...
        workspaceAxes, workspace, dataList, plan, colors, options);
end
summaryDiscretizationData = twoDimensional.DiscretizationData;
if isempty(summaryDiscretizationData)
    summaryDiscretizationData = threeDimensional.DiscretizationData;
end
for layerIndex = 1:numel(summaryDiscretizationData)
    revealOrder = summaryDiscretizationData(layerIndex).RevealOrder;
    layerSearchItemCount = numel(unique( ...
        revealOrder(isfinite(revealOrder))));
    planningSummary.SearchItemCount = planningSummary.SearchItemCount + ...
        layerSearchItemCount;
end

%% Animate display-decimated frames
completedFrameCount = 0;
for frameNumber = 1:numel(frameIndices)
    if ~isgraphics(figureHandle)
        break;
    end
    planIndex = frameIndices(frameNumber);
    currentTime_s = plan.time_s(planIndex);
    playbackProgress = frameNumber / numel(frameIndices);
    isFinalFrame = frameNumber == numel(frameIndices);
    if isgraphics(azElAxes)
        updateTwoDimensionalView( ...
            twoDimensional, dataList, plan, planIndex, ...
            currentTime_s, playbackProgress, isFinalFrame, options);
    end
    if isgraphics(workspaceAxes)
        updateThreeDimensionalView( ...
            threeDimensional, dataList, plan, planIndex, ...
            currentTime_s, playbackProgress, isFinalFrame, options);
    end
    if options.ShowPlanningSummary && isgraphics(summaryTitle)
        processedSliceCount = 0;
        for obstacleIndex = 1:numel(dataList)
            processedSliceCount = processedSliceCount + nnz( ...
                dataList{obstacleIndex}.time_s <= currentTime_s);
        end
        summaryDiscretizationHandles = twoDimensional.Discretization;
        if isempty(summaryDiscretizationHandles)
            summaryDiscretizationHandles = threeDimensional.Discretization;
        end
        visibleSearchItemCount = 0;
        for layerIndex = 1:numel(summaryDiscretizationHandles)
            layerStatus = get( ...
                summaryDiscretizationHandles(layerIndex), "UserData");
            if isstruct(layerStatus) && ...
                    isfield(layerStatus, "VisibleItemCount")
                visibleSearchItemCount = visibleSearchItemCount + ...
                    layerStatus.VisibleItemCount;
            end
        end
        if isFinalFrame
            summaryText = sprintf( ...
                "Selected: %s | %d command samples | " + ...
                "%d valid alternate routes", ...
                planningSummary.SelectedMethod, ...
                planningSummary.SelectedPathSampleCount, ...
                planningSummary.ValidContenderCount);
        else
            summaryText = sprintf( ...
                "azElData: %d obstacles | workspace: %d/%d slices, " + ...
                "%d packed edges | %s: %d/%d search items", ...
                planningSummary.InputObstacleCount, ...
                min(processedSliceCount, planningSummary.PackedSliceCount), ...
                planningSummary.PackedSliceCount, ...
                planningSummary.PackedEdgeCount, ...
                planningSummary.SearchType, ...
                visibleSearchItemCount, ...
                planningSummary.SearchItemCount);
        end
        summaryTitle.String = summaryText;
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
    "SummaryTitle", summaryTitle, ...
    "PlanningSummary", planningSummary, ...
    "FrameIndices", frameIndices, ...
    "FrameCount", completedFrameCount, ...
    "Completed", completedFrameCount == numel(frameIndices), ...
    "Options", options);
end

% The 2-D view owns a distinct set of stable graphics handles. Keeping this
% lifecycle boundary separate prevents frame updates from creating new
% line objects, which is the dominant source of animation slowdown.
function view = initializeTwoDimensionalView( ...
        ax, dataList, plan, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
[view.Discretization, view.DiscretizationData] = plotDiscretization2D( ...
    ax, plan, options);
view.CandidateRoutes = plotCandidateRoutes2D(ax, plan, options);
view.SelectedRoute = plot(ax, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), "-", ...
    "Color", [0.02 0.24 0.62], "LineWidth", 2.8, ...
    "DisplayName", "Selected route", ...
    "Visible", visibility(~options.ShowPlanningSummary));
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
view.TargetPath = gobjects(1);
view.TargetTraveled = gobjects(1);
view.CurrentTarget = gobjects(1);
if ~isempty(options.MovingTarget)
    target = options.MovingTarget;
    visible = target.time_s >= plan.time_s(1) & ...
        target.time_s <= plan.time_s(end);
    view.TargetPath = plot(ax, ...
        target.position_deg(visible, 1), ...
        target.position_deg(visible, 2), ":", ...
        "Color", [0.72 0.12 0.58], "LineWidth", 1.2, ...
        "DisplayName", "Moving endpoint path");
    view.TargetTraveled = plot(ax, NaN, NaN, "-", ...
        "Color", [0.72 0.12 0.58], "LineWidth", 2.0, ...
        "HandleVisibility", "off");
    view.CurrentTarget = plot(ax, NaN, NaN, "p", ...
        "MarkerSize", 10, "MarkerFaceColor", [0.95 0.30 0.72], ...
        "MarkerEdgeColor", "k", "DisplayName", "Moving endpoint");
end
view.Start = plot(ax, plan.position_deg(1, 1), ...
    plan.position_deg(1, 2), "s", ...
    "MarkerSize", 7, "MarkerFaceColor", [0.15 0.65 0.28], ...
    "MarkerEdgeColor", "k", "DisplayName", "Start");
view.Stop = plot(ax, plan.position_deg(end, 1), ...
    plan.position_deg(end, 2), "d", ...
    "MarkerSize", 7, "MarkerFaceColor", [0.82 0.18 0.18], ...
    "MarkerEdgeColor", "k", "DisplayName", "Stop");
view.ObstacleBoundaries = gobjects(numel(dataList), 1);
compactObstacleLegend = numel(dataList) > ...
    options.MaximumObstacleLegendEntries;
for obstacleIndex = 1:numel(dataList)
    handleVisibility = "on";
    if compactObstacleLegend
        handleVisibility = "off";
    end
    view.ObstacleBoundaries(obstacleIndex) = plot(ax, NaN, NaN, "-", ...
        "Color", colors(obstacleIndex, :), "LineWidth", 1.8, ...
        "DisplayName", dataList{obstacleIndex}.targetName, ...
        "HandleVisibility", handleVisibility);
end
view.ObstacleLegend = gobjects(0, 1);
if compactObstacleLegend
    view.ObstacleLegend = plot(ax, NaN, NaN, "-", ...
        "Color", [0.25 0.25 0.25], "LineWidth", 1.8, ...
        "DisplayName", sprintf('%d scenario obstacles', numel(dataList)));
end
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
title(ax, "Current az/el geometry");
applyAngularLimits(ax, plan);
legend(ax, "Location", "best");
end

% The 3-D view mirrors the 2-D lifecycle but additionally owns decimated
% obstacle slices. It stays separate because those patch handles and their
% reveal times have no 2-D equivalent.
function viewState = initializeThreeDimensionalView( ...
        ax, workspace, dataList, plan, colors, options)
hold(ax, "on");
grid(ax, "on");
box(ax, "on");
[viewState.Discretization, viewState.DiscretizationData] = plotDiscretization3D( ...
    ax, plan, options);
viewState.CandidateRoutes = plotCandidateRoutes3D(ax, plan, options);
[selectedAz, selectedEl, selectedTime] = segmentedPlan( ...
    plan, 1:numel(plan.time_s));
viewState.SelectedRoute = plot3(ax, ...
    selectedAz, selectedEl, selectedTime, "-", ...
    "Color", [0.02 0.24 0.62], "LineWidth", 2.8, ...
    "DisplayName", "Selected route", ...
    "Visible", visibility(~options.ShowPlanningSummary));
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
viewState.TargetPath = gobjects(1);
viewState.TargetTraveled = gobjects(1);
viewState.CurrentTarget = gobjects(1);
if ~isempty(options.MovingTarget)
    target = options.MovingTarget;
    visible = target.time_s >= plan.time_s(1) & ...
        target.time_s <= plan.time_s(end);
    viewState.TargetPath = plot3(ax, ...
        target.position_deg(visible, 1), ...
        target.position_deg(visible, 2), ...
        target.time_s(visible), ":", ...
        "Color", [0.72 0.12 0.58], "LineWidth", 1.3, ...
        "DisplayName", "Moving endpoint path");
    viewState.TargetTraveled = plot3(ax, NaN, NaN, NaN, "-", ...
        "Color", [0.72 0.12 0.58], "LineWidth", 2.0, ...
        "HandleVisibility", "off");
    viewState.CurrentTarget = plot3(ax, NaN, NaN, NaN, "p", ...
        "MarkerSize", 10, "MarkerFaceColor", [0.95 0.30 0.72], ...
        "MarkerEdgeColor", "k", "DisplayName", "Moving endpoint");
end
viewState.CurrentBoundaries = gobjects(numel(dataList), 1);
for obstacleIndex = 1:numel(dataList)
    viewState.CurrentBoundaries(obstacleIndex) = plot3( ...
        ax, NaN, NaN, NaN, "-", ...
        "Color", colors(obstacleIndex, :), "LineWidth", 1.8, ...
        "HandleVisibility", "off");
end
[viewState.ObstacleSlices, viewState.ObstacleSliceTimes_s] = createObstacleSlices( ...
    ax, workspace, colors, options);
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
        view, dataList, plan, planIndex, currentTime_s, ...
        playbackProgress, isFinalFrame, options)
updateDiscretizationDisplay(view.Discretization, ...
    view.DiscretizationData, playbackProgress, isFinalFrame, options);
if options.ShowPlanningSummary
    showContenders = playbackProgress >= 0.65 && ~isFinalFrame;
    set(view.CandidateRoutes, "Visible", visibility(showContenders));
    set(view.SelectedRoute, "Visible", visibility(isFinalFrame));
end
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
if ~isempty(options.MovingTarget)
    [targetPosition, targetPast] = movingTargetAtTime( ...
        options.MovingTarget, currentTime_s);
    set(view.CurrentTarget, ...
        "XData", targetPosition(1), ...
        "YData", targetPosition(2));
    set(view.TargetTraveled, ...
        "XData", targetPast(:, 1), ...
        "YData", targetPast(:, 2));
end
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
        view, dataList, plan, planIndex, currentTime_s, ...
        playbackProgress, isFinalFrame, options)
updateDiscretizationDisplay(view.Discretization, ...
    view.DiscretizationData, playbackProgress, isFinalFrame, options);
if options.ShowPlanningSummary
    showContenders = playbackProgress >= 0.65 && ~isFinalFrame;
    set(view.CandidateRoutes, "Visible", visibility(showContenders));
    set(view.SelectedRoute, "Visible", visibility(isFinalFrame));
end
[traveledAz, traveledEl, traveledTime] = segmentedPlan( ...
    plan, 1:planIndex);
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
if ~isempty(options.MovingTarget)
    [targetPosition, targetPast, targetPastTime] = movingTargetAtTime( ...
        options.MovingTarget, currentTime_s);
    set(view.CurrentTarget, ...
        "XData", targetPosition(1), ...
        "YData", targetPosition(2), ...
        "ZData", currentTime_s);
    set(view.TargetTraveled, ...
        "XData", targetPast(:, 1), ...
        "YData", targetPast(:, 2), ...
        "ZData", targetPastTime);
end
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
% Share the global display budget across obstacles so adding another
% obstacle cannot multiply figure object count without bound.
maximumPerObstacle = max(1, floor( ...
    options.MaximumDisplayedSlices / max(1, obstacleCount)));
for obstacleIndex = 1:obstacleCount
    obstacle = workspace.Obstacles(obstacleIndex);
    availableSamples = find(all(isfinite(obstacle.BoundsDeg), 2));
    if numel(availableSamples) <= maximumPerObstacle
        displayedSamples = availableSamples;
    else
        % Uniform index sampling retains the beginning and end of each
        % obstacle history. It reduces graphics cost only; every packed
        % sample remains available to collision queries.
        displayPositions = unique(round(linspace( ...
            1, numel(availableSamples), maximumPerObstacle)));
        displayedSamples = availableSamples(displayPositions);
    end
    color = colors(min(obstacleIndex, size(colors, 1)), :);
    for sampleIndex = reshape(displayedSamples, 1, [])
        firstVertex = double(obstacle.SliceOffsets(sampleIndex));
        finalVertex = double(obstacle.SliceOffsets(sampleIndex + 1) - 1);
        if finalVertex < firstVertex
            % An empty slice is a legitimate "obstacle absent" sample, not
            % malformed packing. It should create no patch and no reveal
            % timestamp.
            continue;
        end
        sliceAzimuth = double( ...
            obstacle.AzimuthDeg(firstVertex:finalVertex));
        sliceElevation = double( ...
            obstacle.ElevationDeg(firstVertex:finalVertex));
        isRealVertex = isfinite(sliceAzimuth) & isfinite(sliceElevation);
        regionChanges = diff([false; isRealVertex; false]);
        regionStarts = find(regionChanges == 1);
        regionStops = find(regionChanges == -1) - 1;
        % NaNs delimit independent polygon rings in the packed slice. Each
        % ring needs its own patch or MATLAB would bridge separate regions
        % with a false filled face.
        for regionIndex = 1:numel(regionStarts)
            vertexIndices = regionStarts(regionIndex):regionStops(regionIndex);
            sliceHandles(end + 1, 1) = patch(ax, ...
                sliceAzimuth(vertexIndices), ...
                sliceElevation(vertexIndices), ...
                repmat(obstacle.TimeSeconds(sampleIndex), ...
                numel(vertexIndices), 1), color, ...
                "FaceAlpha", options.ObstacleFaceAlpha, ...
                "EdgeColor", 0.7 .* color, ...
                "LineWidth", 0.4, ...
                "Visible", "off", ...
                "HandleVisibility", "off"); %#ok<AGROW>
            sliceTimes_s(end + 1, 1) = obstacle.TimeSeconds( ...
                sampleIndex); %#ok<AGROW>
        end
    end
end
end

function [azimuth, elevation, time_s] = segmentedPlan(plan, indices)
indices = reshape(indices, [], 1);
azimuth = plan.position_deg(indices, 1);
elevation = plan.position_deg(indices, 2);
time_s = plan.time_s(indices);
% Insert NaNs at canonical azimuth jumps so plotting does not draw a false
% chord across the entire figure.
wrapBreak = [false; abs(diff(azimuth)) > 180];
azimuth(wrapBreak) = NaN;
elevation(wrapBreak) = NaN;
time_s(wrapBreak) = NaN;
end

function [handles, layerData] = plotDiscretization2D(ax, plan, options)
emptyLayer = struct("XData", zeros(0, 1), ...
    "YData", zeros(0, 1), "ZData", zeros(0, 1), ...
    "RevealOrder", zeros(0, 1));
if options.DiscretizationMode == "off"
    handles = gobjects(0, 1);
    layerData = repmat(emptyLayer, 0, 1);
    return;
end

%% Prepare the Dijkstra lattice when the plan exposes a grid resolution
[azimuth, elevation, step] = latticeLineData(plan, options);
treeLayers = searchTreeLayers(plan, options);
hasLattice = ~isempty(azimuth);
layerCount = double(hasLattice) + numel(treeLayers);
handles = gobjects(layerCount, 1);
layerData = repmat(emptyLayer, layerCount, 1);
layerIndex = 0;
if ~isempty(azimuth)
    layerIndex = layerIndex + 1;
    latticeLineCount = numel(azimuth) / 3;
    handles(layerIndex) = plot(ax, NaN, NaN, ":", ...
        "Color", [0.72 0.75 0.80], "LineWidth", 0.55, ...
        "DisplayName", sprintf("Selected lattice (%.3g deg)", step));
    layerData(layerIndex) = struct( ...
        "XData", azimuth, ...
        "YData", elevation, ...
        "ZData", zeros(0, 1), ...
        "RevealOrder", repelem((1:latticeLineCount).', 3));
end

%% Prepare retained RRT* trees when the plan exposes them
for treeLayerIndex = 1:numel(treeLayers)
    layerIndex = layerIndex + 1;
    treeLayer = treeLayers(treeLayerIndex);
    handles(layerIndex) = plot(ax, NaN, NaN, "-", ...
        "Color", treeLayer.Color, "LineWidth", 0.7, ...
        "DisplayName", treeLayer.Name);
    layerData(layerIndex) = struct( ...
        "XData", treeLayer.XData, ...
        "YData", treeLayer.YData, ...
        "ZData", zeros(0, 1), ...
        "RevealOrder", treeLayer.RevealOrder);
end
end

function [handles, layerData] = plotDiscretization3D(ax, plan, options)
emptyLayer = struct("XData", zeros(0, 1), ...
    "YData", zeros(0, 1), "ZData", zeros(0, 1), ...
    "RevealOrder", zeros(0, 1));
if options.DiscretizationMode == "off"
    handles = gobjects(0, 1);
    layerData = repmat(emptyLayer, 0, 1);
    return;
end

%% Prepare time planes for a Dijkstra lattice
[azimuth, elevation, step] = latticeLineData(plan, options);
treeLayers = searchTreeLayers(plan, options);
hasLattice = ~isempty(azimuth);
layerCount = double(hasLattice) + numel(treeLayers);
handles = gobjects(layerCount, 1);
layerData = repmat(emptyLayer, layerCount, 1);
layerIndex = 0;
if ~isempty(azimuth)
layerIndex = layerIndex + 1;
planeTimes_s = zeros(0, 1);
if isfield(plan, "safeIntervalSearch") && ...
        isstruct(plan.safeIntervalSearch) && ...
        isfield(plan.safeIntervalSearch, "EventTimes_s")
    planeTimes_s = double(plan.safeIntervalSearch.EventTimes_s(:));
end
if isempty(planeTimes_s)
    % Plans without safe-interval diagnostics still receive reference
    % planes. These are visual guides and do not imply search event times.
    planeTimes_s = linspace(plan.time_s(1), plan.time_s(end), ...
        min(3, options.MaximumDiscretizationTimePlanes)).';
elseif numel(planeTimes_s) > options.MaximumDiscretizationTimePlanes
    selectedPlaneIndices = unique(round(linspace( ...
        1, numel(planeTimes_s), ...
        options.MaximumDiscretizationTimePlanes)));
    planeTimes_s = planeTimes_s(selectedPlaneIndices);
end
linePointCount = numel(azimuth);
x = repmat(azimuth, numel(planeTimes_s), 1);
y = repmat(elevation, numel(planeTimes_s), 1);
z = zeros(size(x));
for planeIndex = 1:numel(planeTimes_s)
    planeRows = (planeIndex - 1) * linePointCount + ...
        (1:linePointCount);
    z(planeRows) = planeTimes_s(planeIndex);
end
    latticeLineCount = numel(x) / 3;
    handles(layerIndex) = plot3(ax, NaN, NaN, NaN, ":", ...
        "Color", [0.76 0.78 0.82], "LineWidth", 0.45, ...
        "DisplayName", sprintf( ...
        "Dijkstra lattice planes (%.3g deg)", step));
    layerData(layerIndex) = struct( ...
        "XData", x, ...
        "YData", y, ...
        "ZData", z, ...
        "RevealOrder", repelem((1:latticeLineCount).', 3));
end

%% Prepare the same RRT* edges in physical az/el/time coordinates
for treeLayerIndex = 1:numel(treeLayers)
    layerIndex = layerIndex + 1;
    treeLayer = treeLayers(treeLayerIndex);
    handles(layerIndex) = plot3(ax, NaN, NaN, NaN, "-", ...
        "Color", treeLayer.Color, "LineWidth", 0.65, ...
        "DisplayName", treeLayer.Name);
    layerData(layerIndex) = struct( ...
        "XData", treeLayer.XData, ...
        "YData", treeLayer.YData, ...
        "ZData", treeLayer.ZData, ...
        "RevealOrder", treeLayer.RevealOrder);
end
end

function layers = searchTreeLayers(plan, options)
% Both views consume this extraction, so tree validation, display
% decimation, and reveal order must remain identical in 2-D and 3-D.
emptyTreeLayer = struct("XData", zeros(0, 1), ...
    "YData", zeros(0, 1), "ZData", zeros(0, 1), ...
    "RevealOrder", zeros(0, 1), "Color", zeros(1, 3), "Name", "");
layers = repmat(emptyTreeLayer, 2, 1);
layerCount = 0;
treeFieldNames = ["forwardTree", "backwardTree"];
treeDisplayNames = ["RRT* forward tree", "RRT* backward tree"];
treeColors = [0.10 0.52 0.34; 0.56 0.24 0.67];
requiredTreeFields = ["Position_deg", "Time_s", "ParentIndex"];
for treeIndex = 1:numel(treeFieldNames)
    treeFieldName = treeFieldNames(treeIndex);
    if ~isfield(plan, treeFieldName)
        continue;
    end
    tree = plan.(treeFieldName);
    if ~isstruct(tree) || ~isscalar(tree) || ...
            ~all(isfield(tree, cellstr(requiredTreeFields)))
        continue;
    end
    treePosition_deg = double(tree.Position_deg);
    treeTime_s = double(tree.Time_s(:));
    treeParentIndex = double(tree.ParentIndex(:));
    treeNodeCount = min([ ...
        size(treePosition_deg, 1), ...
        numel(treeTime_s), ...
        numel(treeParentIndex)]);
    if treeNodeCount < 2 || size(treePosition_deg, 2) ~= 2
        continue;
    end
    childNodeIndices = find( ...
        treeParentIndex(1:treeNodeCount) >= 1 & ...
        treeParentIndex(1:treeNodeCount) <= treeNodeCount);
    if isempty(childNodeIndices)
        continue;
    end
    if numel(childNodeIndices) > options.MaximumDiscretizationEdges
        % Uniform edge decimation retains early and late tree growth. It is
        % a rendering cap only; the plan still owns every generated node.
        retainedEdgePositions = unique(round(linspace( ...
            1, numel(childNodeIndices), ...
            options.MaximumDiscretizationEdges)));
        childNodeIndices = childNodeIndices(retainedEdgePositions);
    end

    edgeCount = numel(childNodeIndices);
    edgeAzimuth = nan(3 * edgeCount, 1);
    edgeElevation = nan(3 * edgeCount, 1);
    edgeTime_s = nan(3 * edgeCount, 1);
    edgeRevealOrder = zeros(3 * edgeCount, 1);
    for displayedEdgeIndex = 1:edgeCount
        childNodeIndex = childNodeIndices(displayedEdgeIndex);
        parentNodeIndex = treeParentIndex(childNodeIndex);
        edgeRows = 3 * displayedEdgeIndex - 2:3 * displayedEdgeIndex;
        parentPosition_deg = treePosition_deg(parentNodeIndex, :);
        childPosition_deg = treePosition_deg(childNodeIndex, :);
        if abs(childPosition_deg(1) - parentPosition_deg(1)) <= 180
            edgeAzimuth(edgeRows) = [ ...
                parentPosition_deg(1); childPosition_deg(1); NaN];
            edgeElevation(edgeRows) = [ ...
                parentPosition_deg(2); childPosition_deg(2); NaN];
            edgeTime_s(edgeRows) = [ ...
                treeTime_s(parentNodeIndex); ...
                treeTime_s(childNodeIndex); NaN];
        end
        if isfield(tree, "CreationIteration") && ...
                numel(tree.CreationIteration) >= childNodeIndex
            creationOrder = double( ...
                tree.CreationIteration(childNodeIndex));
        else
            % Existing plans do not retain failed sampling iterations. Node
            % insertion order still gives a deterministic growth sequence.
            creationOrder = childNodeIndex;
        end
        edgeRevealOrder(edgeRows) = creationOrder;
    end
    layerCount = layerCount + 1;
    layers(layerCount) = struct( ...
        "XData", edgeAzimuth, ...
        "YData", edgeElevation, ...
        "ZData", edgeTime_s, ...
        "RevealOrder", edgeRevealOrder, ...
        "Color", treeColors(treeIndex, :), ...
        "Name", treeDisplayNames(treeIndex));
end
layers = layers(1:layerCount);
end

function updateDiscretizationDisplay( ...
        handles, layerData, playbackProgress, isFinalFrame, options)
% Both views use this updater so "final" and "build" have exactly the same
% reveal semantics. Graphics state changes; planner diagnostics do not.
if isempty(handles)
    return;
end
if options.DiscretizationMode == "final"
    revealFraction = double(isFinalFrame);
else
    revealFraction = playbackProgress;
end
for layerIndex = 1:numel(layerData)
    fullXData = layerData(layerIndex).XData;
    fullYData = layerData(layerIndex).YData;
    fullZData = layerData(layerIndex).ZData;
    revealOrder = layerData(layerIndex).RevealOrder(:);
    uniqueRevealOrder = unique(revealOrder(isfinite(revealOrder)));
    visibleItemCount = 0;
    if revealFraction <= 0 || isempty(uniqueRevealOrder)
        isVisiblePoint = false(size(revealOrder));
    else
        visibleItemCount = min(numel(uniqueRevealOrder), ...
            max(1, ceil(revealFraction * numel(uniqueRevealOrder))));
        revealCutoff = uniqueRevealOrder(visibleItemCount);
        isVisiblePoint = revealOrder <= revealCutoff;
    end
    displayedXData = fullXData;
    displayedYData = fullYData;
    displayedXData(~isVisiblePoint) = NaN;
    displayedYData(~isVisiblePoint) = NaN;
    if isempty(fullZData)
        set(handles(layerIndex), ...
            "XData", displayedXData, ...
            "YData", displayedYData);
    else
        displayedZData = fullZData;
        displayedZData(~isVisiblePoint) = NaN;
        set(handles(layerIndex), ...
            "XData", displayedXData, ...
            "YData", displayedYData, ...
            "ZData", displayedZData);
    end
    % UserData makes headless regression tests and downstream inspection
    % able to distinguish hidden, partial, and complete search structures.
    set(handles(layerIndex), "UserData", struct( ...
        "Mode", options.DiscretizationMode, ...
        "VisibleItemCount", visibleItemCount, ...
        "TotalItemCount", numel(uniqueRevealOrder), ...
        "Complete", visibleItemCount == numel(uniqueRevealOrder)));
end
end

function handles = plotCandidateRoutes2D(ax, plan, options)
handles = gobjects(0, 1);
attempts = candidateAttempts(plan, options);
candidateVisibility = visibility(~options.ShowPlanningSummary);
% These are successful but unselected resolution attempts, not unsafe paths.
for attemptIndex = 1:numel(attempts)
    [azimuth, elevation] = segmentedCandidate( ...
        attempts(attemptIndex).CandidatePosition_deg, []);
    visibilityValue = "off";
    if attemptIndex == 1
        visibilityValue = "on";
    end
    handles(end + 1, 1) = plot(ax, azimuth, elevation, "--", ...
        "Color", [0.88 0.38 0.10], "LineWidth", 1.25, ...
        "DisplayName", "Rejected valid contender", ...
        "Visible", candidateVisibility, ...
        "HandleVisibility", visibilityValue); %#ok<AGROW>
end
end

function handles = plotCandidateRoutes3D(ax, plan, options)
handles = gobjects(0, 1);
attempts = candidateAttempts(plan, options);
candidateVisibility = visibility(~options.ShowPlanningSummary);
% A contender appears only after exact validation. Missing lines therefore
% mean no alternate validated resolution existed, not that plotting lost
% failed search attempts.
for attemptIndex = 1:numel(attempts)
    [azimuth, elevation, time_s] = segmentedCandidate( ...
        attempts(attemptIndex).CandidatePosition_deg, ...
        attempts(attemptIndex).CandidateTime_s);
    visibilityValue = "off";
    if attemptIndex == 1
        visibilityValue = "on";
    end
    handles(end + 1, 1) = plot3(ax, ...
        azimuth, elevation, time_s, "--", ...
        "Color", [0.88 0.38 0.10], "LineWidth", 1.25, ...
        "DisplayName", "Rejected valid contender", ...
        "Visible", candidateVisibility, ...
        "HandleVisibility", visibilityValue); %#ok<AGROW>
end
end

function attempts = candidateAttempts(plan, options)
attempts = struct([]);
if ~options.ShowCandidateRoutes || ...
        ~isfield(plan, "resolutionAttempts") || ...
        isempty(plan.resolutionAttempts)
    return;
end
allAttempts = plan.resolutionAttempts;
requiredFields = ["Success", "Selected", ...
    "CandidateTime_s", "CandidatePosition_deg"];
if ~all(isfield(allAttempts, cellstr(requiredFields)))
    % Older planner results lack enough metadata to distinguish rejected
    % valid contenders from ordinary failed searches, so drawing nothing
    % is safer than mislabeling an unsafe route.
    return;
end
wasSuccessful = reshape([allAttempts.Success], [], 1);
wasSelected = reshape([allAttempts.Selected], [], 1);
hasCandidatePosition = false(numel(allAttempts), 1);
for attemptIndex = 1:numel(allAttempts)
    candidatePosition = allAttempts(attemptIndex).CandidatePosition_deg;
    hasCandidatePosition(attemptIndex) = ~isempty(candidatePosition);
end
keepAttempt = wasSuccessful & ~wasSelected & hasCandidatePosition;
attempts = allAttempts(keepAttempt);
end

function [azimuth, elevation, time_s] = segmentedCandidate( ...
        position, time_s)
azimuth = position(:, 1);
elevation = position(:, 2);
if isempty(time_s)
    time_s = zeros(size(azimuth));
else
    time_s = time_s(:);
end
wrapBreak = [false; abs(diff(azimuth)) > 180];
azimuth(wrapBreak) = NaN;
elevation(wrapBreak) = NaN;
time_s(wrapBreak) = NaN;
end

function [azimuth, elevation, step] = latticeLineData(plan, options)
azimuth = zeros(0, 1);
elevation = zeros(0, 1);
step = NaN;
if ~isfield(plan, "selectedGridStep_deg") || ...
        ~isfinite(plan.selectedGridStep_deg) || ...
        plan.selectedGridStep_deg <= 0 || ...
        ~isfield(plan, "limits") || ...
        ~all(isfield(plan.limits, ["azimuth_deg", "elevation_deg"]))
    return;
end
step = plan.selectedGridStep_deg;
azimuthValues = sampledGridValues( ...
    plan.limits.azimuth_deg, step, ...
    options.MaximumDiscretizationLines);
elevationValues = sampledGridValues( ...
    plan.limits.elevation_deg, step, ...
    options.MaximumDiscretizationLines);
verticalCount = numel(azimuthValues);
horizontalCount = numel(elevationValues);
azimuth = nan( ...
    3 * (verticalCount + horizontalCount), 1);
elevation = azimuth;
cursor = 1;
for value = azimuthValues
    rows = cursor:cursor + 2;
    azimuth(rows) = [value; value; NaN];
    elevation(rows) = [plan.limits.elevation_deg(:); NaN];
    cursor = cursor + 3;
end
for value = elevationValues
    rows = cursor:cursor + 2;
    azimuth(rows) = [plan.limits.azimuth_deg(:); NaN];
    elevation(rows) = [value; value; NaN];
    cursor = cursor + 3;
end
end

function values = sampledGridValues(limits, step, maximumCount)
values = limits(1):step:limits(2);
if isempty(values) || values(end) < limits(2) - 1e-9
    values(end + 1) = limits(2);
end
if numel(values) > maximumCount
    % Decimate lines uniformly for readability; this is not the planner's
    % actual state reduction.
    selected = unique(round(linspace(1, numel(values), maximumCount)));
    values = values(selected);
end
values = double(values);
end

function sampleIndex = nearestSample(time_s, queryTime_s)
% Nearest-neighbor selection matches the piecewise-constant obstacle
% semantics used by the packed workspace. Interpolating polygon vertices
% here would display geometry that collision checking never evaluated.
[~, sampleIndex] = min(abs(time_s - queryTime_s));
end

function [position, past, pastTime] = movingTargetAtTime( ...
        target, queryTime_s)
position = interp1(target.time_s, target.position_deg, ...
    queryTime_s, "linear", "extrap");
pastIndex = target.time_s <= queryTime_s;
pastTime = [target.time_s(pastIndex); queryTime_s];
past = [target.position_deg(pastIndex, :); position];
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

function value = logicalScalar(value, name)
% Shared by four flags so they all reject ambiguous truthy values such as
% 2 or NaN instead of silently producing inconsistent display behavior.
validateattributes(value, {'logical', 'numeric'}, {'scalar'});
if value ~= 0 && value ~= 1
    error("animateAzElAvoidancePlan:InvalidOption", ...
        "%s must be logical or numeric 0/1.", name);
end
value = logical(value);
end

function value = visibility(isVisible)
% MATLAB graphics properties require on/off text even though the public
% options use logical scalars.
if isVisible
    value = "on";
else
    value = "off";
end
end
