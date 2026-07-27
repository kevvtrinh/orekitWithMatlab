function handles = plotAzElAvoidancePlan(azElData, plan, options)
%PLOTAZELAVOIDANCEPLAN Plot obstacle slices and the steering command.

if nargin < 3
    options = struct();
end
options = applyDefaults(options, struct("MaximumObstacleSlices", 80));
validateattributes(options.MaximumObstacleSlices, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
if ~isstruct(plan) || ~isfield(plan, "success") || ~plan.success
    error("plotAzElAvoidancePlan:InvalidPlan", ...
        "plan must be a successful planAzElAvoidance result.");
end

dataList = normalizeDataList(azElData);
figureHandle = figure("Name", "Az/El obstacle-avoidance plan");
layout = tiledlayout(figureHandle, 1, 2, ...
    "TileSpacing", "compact", "Padding", "compact");

azElAxes = nexttile(layout);
hold(azElAxes, "on");
colors = lines(max(1, numel(dataList)));
obstacleHandles = gobjects(0, 1);
for obstacleIndex = 1:numel(dataList)
    data = normalizeAzElTimeObstacleData(dataList{obstacleIndex});
    shown = displayIndices(numel(data.time_s), ...
        options.MaximumObstacleSlices);
    firstHandle = gobjects(1);
    for sampleIndex = shown
        azimuth = data.az_deg{sampleIndex};
        elevation = data.el_deg{sampleIndex};
        finite = isfinite(azimuth) & isfinite(elevation);
        if nnz(finite) < 2
            continue;
        end
        sliceColor = 0.55 + 0.45 .* colors(obstacleIndex, :);
        sliceHandle = plot(azElAxes, azimuth(finite), elevation(finite), ...
            "Color", sliceColor, ...
            "LineWidth", 0.75, "HandleVisibility", "off");
        if ~isgraphics(firstHandle)
            firstHandle = sliceHandle;
        end
    end
    if isgraphics(firstHandle)
        firstHandle.DisplayName = data.targetName;
        firstHandle.HandleVisibility = "on";
        obstacleHandles(end + 1, 1) = firstHandle; %#ok<AGROW>
    end
end
pathHandle = plot(azElAxes, plan.position_deg(:, 1), ...
    plan.position_deg(:, 2), "k-", "LineWidth", 2.2, ...
    "DisplayName", "Planned boresight");
startHandle = plot(azElAxes, plan.position_deg(1, 1), ...
    plan.position_deg(1, 2), "go", "MarkerFaceColor", "g", ...
    "DisplayName", "Start");
stopHandle = plot(azElAxes, plan.position_deg(end, 1), ...
    plan.position_deg(end, 2), "ro", "MarkerFaceColor", "r", ...
    "DisplayName", "Stop");
grid(azElAxes, "on");
xlabel(azElAxes, "Azimuth (deg)");
ylabel(azElAxes, "Elevation (deg)");
title(azElAxes, "Azimuth/elevation workspace");
legend(azElAxes, "Location", "best");

timeAxes = nexttile(layout);
plot(timeAxes, plan.time_s, plan.position_deg(:, 1), ...
    "LineWidth", 1.5, "DisplayName", "Azimuth");
hold(timeAxes, "on");
plot(timeAxes, plan.time_s, plan.position_deg(:, 2), ...
    "LineWidth", 1.5, "DisplayName", "Elevation");
grid(timeAxes, "on");
xlabel(timeAxes, "Time (s)");
ylabel(timeAxes, "Angle (deg)");
title(timeAxes, "Boresight steering command");
legend(timeAxes, "Location", "best");

handles = struct( ...
    "Figure", figureHandle, ...
    "Layout", layout, ...
    "AzElAxes", azElAxes, ...
    "TimeAxes", timeAxes, ...
    "ObstacleLines", obstacleHandles, ...
    "Path", pathHandle, ...
    "Start", startHandle, ...
    "Stop", stopHandle);
end

function dataList = normalizeDataList(input)
if iscell(input)
    dataList = input(:);
elseif isstruct(input)
    dataList = arrayfun(@(item) item, input(:), ...
        "UniformOutput", false);
else
    error("plotAzElAvoidancePlan:InvalidInput", ...
        "azElData must be a struct, struct array, or cell array.");
end
end

function indices = displayIndices(sampleCount, maximumCount)
if sampleCount <= maximumCount
    indices = 1:sampleCount;
else
    indices = unique(round(linspace(1, sampleCount, maximumCount)));
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
