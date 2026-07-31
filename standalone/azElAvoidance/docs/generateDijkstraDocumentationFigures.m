function files = generateDijkstraDocumentationFigures()
%GENERATEADAPTIVEASTARDOCUMENTATIONFIGURES Rebuild guide illustrations.

root = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(root));
outputFolder = fullfile(fileparts(mfilename("fullpath")), "figures");
if ~isfolder(outputFolder)
    mkdir(outputFolder);
end

files = strings(4, 1);
files(1) = fullfile(outputFolder, "01_workspace_transformation.png");
files(2) = fullfile(outputFolder, "02_progressive_static_search.png");
files(3) = fullfile(outputFolder, "03_dynamic_safe_intervals.png");
files(4) = fullfile(outputFolder, "04_rest_to_rest_edge.png");

makeWorkspaceTransformationFigure(files(1));
makeProgressiveStaticFigure(files(2));
makeDynamicSafeIntervalFigure(files(3));
makeMotionEdgeFigure(files(4));
end

function makeWorkspaceTransformationFigure(file)
time_s = [0; 5; 10];
azimuth = cell(3, 1);
elevation = cell(3, 1);
for k = 1:3
    center = -3 + 3 * (k - 1);
    azimuth{k} = center + [-1; 1; 1; -1; -1];
    elevation{k} = [-2; -2; 2; 2; -2];
end
data = makeAzElObstacleData( ...
    "Moving forbidden region", time_s, azimuth, elevation);
obstacleField = buildAzElTimeObstacleField(data);

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1400 430]);
layout = tiledlayout(figureHandle, 1, 3, ...
    "TileSpacing", "compact", "Padding", "compact");
colors = lines(3);

ax = nexttile(layout);
hold(ax, "on");
for k = 1:3
    patch(ax, azimuth{k}, elevation{k}, colors(k, :), ...
        "FaceAlpha", 0.14, "EdgeColor", colors(k, :), ...
        "LineWidth", 1.8, ...
        "DisplayName", sprintf("t = %g s", time_s(k)));
end
plot(ax, [-5 5], [0 0], "k:", "HandleVisibility", "off");
axis(ax, "equal");
xlim(ax, [-5 5]);
ylim(ax, [-3 3]);
grid(ax, "on");
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
title(ax, "(a) azElData polygon slices");
legend(ax, "Location", "southoutside", "Orientation", "horizontal");

ax = nexttile(layout);
hold(ax, "on");
for k = 1:3
    patch(ax, azimuth{k}, elevation{k}, ...
        repmat(time_s(k), size(azimuth{k})), colors(k, :), ...
        "FaceAlpha", 0.18, "EdgeColor", colors(k, :), ...
        "LineWidth", 1.5);
end
grid(ax, "on");
box(ax, "on");
view(ax, 38, 24);
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
zlabel(ax, "Time (s)");
title(ax, "(b) Same slices in az/el/time");

ax = nexttile(layout);
hold(ax, "on");
obstacle = obstacleField.Obstacles(1);
vertexIndex = (1:numel(obstacle.AzimuthDeg)).';
plot(ax, vertexIndex, obstacle.AzimuthDeg, "-o", ...
    "Color", [0.08 0.36 0.70], "MarkerSize", 3, ...
    "DisplayName", "Packed azimuth");
plot(ax, vertexIndex, obstacle.ElevationDeg, "-s", ...
    "Color", [0.82 0.28 0.13], "MarkerSize", 3, ...
    "DisplayName", "Packed elevation");
offsets = double(obstacle.SliceOffsets);
for k = 1:numel(offsets)
    xline(ax, offsets(k), ":", "Color", [0.25 0.25 0.25], ...
        "HandleVisibility", "off");
end
grid(ax, "on");
xlabel(ax, "Packed vertex index");
ylabel(ax, "Angle (deg)");
title(ax, "(c) Contiguous arrays + slice offsets");
legend(ax, "Location", "southoutside", "Orientation", "horizontal");

title(layout, ...
    "Workspace transformation: geometry is packed, not voxelized", ...
    "FontWeight", "bold");
exportgraphics(figureHandle, file, "Resolution", 180);
close(figureHandle);
end

function makeProgressiveStaticFigure(file)
time_s = (0:1:30).';
azimuthBoundary = [-1.5; 1.5; 1.5; -1.5; -1.5];
elevationBoundary = [-4; -4; 4; 4; -4];
data = makeAzElObstacleData( ...
    "Static blocker", time_s, azimuthBoundary, elevationBoundary);
initialState = restState(0, [-8 0]);
goalState = restState(30, [8 0]);
limits = standardLimits([-10 10], [-7 7], [3 3], [2 2]);
options = struct( ...
    "SampleTime_s", 0.25, ...
    "GridStep_deg", 0.5, ...
    "GridStepSchedule_deg", [4 2 1 0.5], ...
    "SafetyMargin_deg", 0.25, ...
    "MaxSearchTime_s", 30);
plan = planAzElDijkstra( ...
    data, initialState, goalState, limits, options);
assert(plan.success, "Static documentation example did not plan.");

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1120 850]);
layout = tiledlayout(figureHandle, 2, 2, ...
    "TileSpacing", "compact", "Padding", "compact");
attempts = plan.resolutionAttempts;
obstacleField = plan.obstacleField;
for k = 1:numel(attempts)
    ax = nexttile(layout);
    hold(ax, "on");
    step = attempts(k).GridStep_deg;
    azimuthValues = limits.azimuth_deg(1):step:limits.azimuth_deg(2);
    elevationValues = ...
        limits.elevation_deg(1):step:limits.elevation_deg(2);
    [azimuthGrid, elevationGrid] = ...
        meshgrid(azimuthValues, elevationValues);
    blocked = queryAzElTimeObstacle(obstacleField, ...
        azimuthGrid(:), elevationGrid(:), ...
        repmat(initialState.time_s, numel(azimuthGrid), 1), struct( ...
        "SafetyMarginDeg", options.SafetyMargin_deg));
    scatter(ax, azimuthGrid(~blocked), elevationGrid(~blocked), ...
        8, [0.72 0.76 0.81], "filled", ...
        "HandleVisibility", "off");
    scatter(ax, azimuthGrid(blocked), elevationGrid(blocked), ...
        12, [0.78 0.20 0.18], "filled", ...
        "DisplayName", "Blocked grid state");
    patch(ax, azimuthBoundary, elevationBoundary, ...
        [0.85 0.25 0.18], "FaceAlpha", 0.12, ...
        "EdgeColor", [0.55 0.08 0.05], "LineWidth", 1.5, ...
        "DisplayName", "Exact polygon");
    if attempts(k).Success
        if attempts(k).Selected
            color = [0.03 0.28 0.72];
            style = "-";
            width = 2.8;
            routeName = "Selected route";
        else
            color = [0.92 0.40 0.08];
            style = "--";
            width = 1.8;
            routeName = "Valid contender";
        end
        plot(ax, attempts(k).CandidatePosition_deg(:, 1), ...
            attempts(k).CandidatePosition_deg(:, 2), style, ...
            "Color", color, "LineWidth", width, ...
            "DisplayName", routeName);
    end
    plot(ax, initialState.position_deg(1), ...
        initialState.position_deg(2), "s", ...
        "MarkerFaceColor", [0.12 0.65 0.25], ...
        "MarkerEdgeColor", "k", "DisplayName", "Start");
    plot(ax, goalState.position_deg(1), ...
        goalState.position_deg(2), "d", ...
        "MarkerFaceColor", [0.82 0.12 0.15], ...
        "MarkerEdgeColor", "k", "DisplayName", "Goal");
    axis(ax, "equal");
    xlim(ax, limits.azimuth_deg);
    ylim(ax, limits.elevation_deg);
    grid(ax, "on");
    xlabel(ax, "Azimuth (deg)");
    ylabel(ax, "Elevation (deg)");
    if attempts(k).Success
        resultText = sprintf("%.2f deg", attempts(k).ObjectiveCost);
    else
        resultText = "no route";
    end
    title(ax, sprintf("h = %.1f deg: %s", step, resultText));
    if k == 1
        legend(ax, "Location", "southoutside", ...
            "Orientation", "horizontal");
    end
end
title(layout, ...
    "Static mode: progressively finer Dijkstra grids, exact polygon checks", ...
    "FontWeight", "bold");
exportgraphics(figureHandle, file, "Resolution", 180);
close(figureHandle);
end

function makeDynamicSafeIntervalFigure(file)
time_s = (0:0.5:30).';
azimuth = cell(numel(time_s), 1);
elevation = cell(numel(time_s), 1);
for k = 1:numel(time_s)
    center = 3.2 * sin(2 * pi * time_s(k) / 15);
    azimuth{k} = [-1; 1; 1; -1; -1];
    elevation{k} = center + [-1.2; -1.2; 1.2; 1.2; -1.2];
end
data = makeAzElObstacleData( ...
    "Oscillating gate", time_s, azimuth, elevation);
initialState = restState(0, [-6 0]);
goalState = restState(30, [6 0]);
limits = standardLimits([-8 8], [-6 6], [2 2], [1 1]);
options = struct( ...
    "SampleTime_s", 0.25, ...
    "GridStep_deg", 1, ...
    "GridStepSchedule_deg", [4 2 1], ...
    "SafetyMargin_deg", 0.15, ...
    "MaxSearchTime_s", 20);
plan = planAzElDijkstra( ...
    data, initialState, goalState, limits, options);
assert(plan.success, "Dynamic documentation example did not plan.");
obstacleField = plan.obstacleField;

probeElevation = [-4; 0; 4];
queryTime = time_s;
blocked = false(numel(probeElevation), numel(queryTime));
for k = 1:numel(probeElevation)
    blocked(k, :) = queryAzElTimeObstacle(obstacleField, ...
        zeros(numel(queryTime), 1), ...
        repmat(probeElevation(k), numel(queryTime), 1), ...
        queryTime, struct( ...
        "SafetyMarginDeg", options.SafetyMargin_deg)).';
end

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1300 520]);
layout = tiledlayout(figureHandle, 1, 2, ...
    "TileSpacing", "compact", "Padding", "compact");

ax = nexttile(layout);
imagesc(ax, queryTime, 1:numel(probeElevation), blocked);
colormap(ax, [0.90 0.96 0.90; 0.82 0.18 0.15]);
set(ax, "YTick", 1:numel(probeElevation), ...
    "YTickLabel", compose("q: el = %g deg", probeElevation));
xlabel(ax, "Time (s)");
ylabel(ax, "Spatial state");
title(ax, "(a) Safe intervals compress repeated free times");
grid(ax, "on");
hold(ax, "on");
text(ax, 1, 0.7, "green = safe", ...
    "Color", [0.10 0.38 0.10], "FontWeight", "bold");
text(ax, 1, 1.05, "red = blocked", ...
    "Color", [0.55 0.03 0.03], "FontWeight", "bold");

ax = nexttile(layout);
hold(ax, "on");
sliceIndex = unique(round(linspace( ...
    1, numel(time_s), min(18, numel(time_s)))));
for k = sliceIndex
    patch(ax, azimuth{k}, elevation{k}, ...
        repmat(time_s(k), size(azimuth{k})), ...
        [0.80 0.18 0.15], ...
        "FaceAlpha", 0.05, "EdgeColor", [0.65 0.18 0.16], ...
        "LineWidth", 0.55, "HandleVisibility", "off");
end
attempts = plan.resolutionAttempts;
for k = 1:numel(attempts)
    if ~attempts(k).Success
        continue;
    end
    if attempts(k).Selected
        color = [0.02 0.25 0.72];
        style = "-";
        width = 2.8;
        name = "Selected route";
    else
        color = [0.92 0.40 0.08];
        style = "--";
        width = 1.5;
        name = "Valid contender";
    end
    plot3(ax, attempts(k).CandidatePosition_deg(:, 1), ...
        attempts(k).CandidatePosition_deg(:, 2), ...
        attempts(k).CandidateTime_s, style, ...
        "Color", color, "LineWidth", width, ...
        "DisplayName", name);
end
grid(ax, "on");
box(ax, "on");
view(ax, 38, 24);
xlim(ax, limits.azimuth_deg);
ylim(ax, limits.elevation_deg);
zlim(ax, [time_s(1) time_s(end)]);
xlabel(ax, "Azimuth (deg)");
ylabel(ax, "Elevation (deg)");
zlabel(ax, "Time (s)");
title(ax, "(b) Dijkstra route through safe space-time intervals");
legend(ax, "Location", "southoutside", "Orientation", "horizontal");

title(layout, ...
    "Dynamic mode: one node represents a spatial state and a safe interval", ...
    "FontWeight", "bold");
exportgraphics(figureHandle, file, "Resolution", 180);
close(figureHandle);
end

function makeMotionEdgeFigure(file)
[triangularTime, triangular] = ...
    motionProfile(4, 10, 2, 0.02);
[trapezoidalTime, trapezoidal] = ...
    motionProfile(12, 3, 1, 0.02);

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1100 800]);
layout = tiledlayout(figureHandle, 3, 2, ...
    "TileSpacing", "compact", "Padding", "compact");
names = ["Triangular edge", "Trapezoidal edge"];
times = {triangularTime, trapezoidalTime};
profiles = {triangular, trapezoidal};
labels = ["Position (deg)", "Velocity (deg/s)", ...
    "Acceleration (deg/s^2)"];
fields = ["Position", "Velocity", "Acceleration"];
for row = 1:3
    for column = 1:2
        ax = nexttile(layout);
        plot(ax, times{column}, ...
            profiles{column}.(fields(row)), ...
            "Color", [0.04 0.32 0.72], "LineWidth", 2);
        grid(ax, "on");
        xlabel(ax, "Edge time (s)");
        ylabel(ax, labels(row));
        if row == 1
            title(ax, names(column));
        end
    end
end
title(layout, ...
    "Each graph edge is retimed as an acceleration-limited rest-to-rest slew", ...
    "FontWeight", "bold");
exportgraphics(figureHandle, file, "Resolution", 180);
close(figureHandle);
end

function [time_s, profile] = motionProfile( ...
        distance, maximumVelocity, maximumAcceleration, step)
switchDistance = maximumVelocity^2 / maximumAcceleration;
if distance <= switchDistance
    accelerationTime = sqrt(distance / maximumAcceleration);
    cruiseTime = 0;
    peakVelocity = maximumAcceleration * accelerationTime;
else
    accelerationTime = maximumVelocity / maximumAcceleration;
    cruiseTime = ...
        (distance - switchDistance) / maximumVelocity;
    peakVelocity = maximumVelocity;
end
duration = 2 * accelerationTime + cruiseTime;
time_s = (0:step:duration).';
if time_s(end) < duration
    time_s(end + 1, 1) = duration;
end
position = zeros(size(time_s));
velocity = zeros(size(time_s));
acceleration = zeros(size(time_s));
cruiseEnd = accelerationTime + cruiseTime;
accelerationDistance = ...
    0.5 * maximumAcceleration * accelerationTime^2;
for k = 1:numel(time_s)
    t = time_s(k);
    if t < accelerationTime
        acceleration(k) = maximumAcceleration;
        velocity(k) = maximumAcceleration * t;
        position(k) = 0.5 * maximumAcceleration * t^2;
    elseif t < cruiseEnd
        velocity(k) = peakVelocity;
        position(k) = accelerationDistance + ...
            peakVelocity * (t - accelerationTime);
    elseif t < duration
        remaining = duration - t;
        acceleration(k) = -maximumAcceleration;
        velocity(k) = maximumAcceleration * remaining;
        position(k) = distance - ...
            0.5 * maximumAcceleration * remaining^2;
    else
        position(k) = distance;
    end
end
profile = struct( ...
    "Position", position, ...
    "Velocity", velocity, ...
    "Acceleration", acceleration);
end

function state = restState(time_s, position)
state = struct( ...
    "time_s", time_s, ...
    "position_deg", position, ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0]);
end

function limits = standardLimits( ...
        azimuth, elevation, velocity, acceleration)
limits = struct( ...
    "azimuth_deg", azimuth, ...
    "elevation_deg", elevation, ...
    "maxVelocity_deg_s", velocity, ...
    "maxAcceleration_deg_s2", acceleration);
end
