function files = generateDijkstraDocumentationFigures()
%% Section 0: Header & Readme
% SYNTAX
%   files = generateDijkstraDocumentationFigures()
%**************************************************************************
% PURPOSE
%   - Rebuild the four deterministic figures used by the Dijkstra guide.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - files (string column vector)
%       Absolute paths of the generated PNG files in display order.
%**************************************************************************
% UNITS
%   - Figure quantities use degrees and seconds as labeled.

%% Section 1: Resolve Paths & Output Names
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(packageRoot));
outputFolder = fullfile(fileparts(mfilename("fullpath")), "figures");
if ~isfolder(outputFolder)
    mkdir(outputFolder);
end

files = strings(4, 1);
files(1) = fullfile(outputFolder, "01_workspace_transformation.png");
files(2) = fullfile(outputFolder, "02_progressive_static_search.png");
files(3) = fullfile(outputFolder, "03_dynamic_safe_intervals.png");
files(4) = fullfile(outputFolder, "04_rest_to_rest_edge.png");

%% Section 2: Render Every Documentation Figure
makeWorkspaceTransformationFigure(files(1));
makeProgressiveStaticFigure(files(2));
makeDynamicSafeIntervalFigure(files(3));
makeMotionEdgeFigure(files(4));
end

%% Section 3: Local Figure Functions
% Each figure builder owns one complete illustration and is kept separate so
% plotting details do not conceal the ordered document-generation workflow.
function makeWorkspaceTransformationFigure(outputFile)
%% Section 0: Header & Readme
% Show canonical slices, their space-time interpretation, and packed arrays.
time_s = [0; 5; 10];
azimuth_deg = cell(3, 1);
elevation_deg = cell(3, 1);
for sliceIndex = 1:3
    centerAzimuth_deg = -3 + 3 * (sliceIndex - 1);
    azimuth_deg{sliceIndex} = centerAzimuth_deg + ...
        [-1; 1; 1; -1; -1];
    elevation_deg{sliceIndex} = [-2; -2; 2; 2; -2];
end
azElData = makeAzElObstacleData( ...
    "Moving forbidden region", time_s, azimuth_deg, elevation_deg);
obstacleField = buildAzElTimeObstacleField(azElData);

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1400 430]);
layout = tiledlayout(figureHandle, 1, 3, ...
    "TileSpacing", "compact", "Padding", "compact");
colors = lines(3);

ax = nexttile(layout);
hold(ax, "on");
for sliceIndex = 1:3
    patch(ax, azimuth_deg{sliceIndex}, elevation_deg{sliceIndex}, ...
        colors(sliceIndex, :), ...
        "FaceAlpha", 0.14, "EdgeColor", colors(sliceIndex, :), ...
        "LineWidth", 1.8, ...
        "DisplayName", sprintf("t = %g s", time_s(sliceIndex)));
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
for sliceIndex = 1:3
    patch(ax, azimuth_deg{sliceIndex}, elevation_deg{sliceIndex}, ...
        repmat(time_s(sliceIndex), size(azimuth_deg{sliceIndex})), ...
        colors(sliceIndex, :), ...
        "FaceAlpha", 0.18, "EdgeColor", colors(sliceIndex, :), ...
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
for offsetIndex = 1:numel(offsets)
    xline(ax, offsets(offsetIndex), ":", ...
        "Color", [0.25 0.25 0.25], ...
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
exportgraphics(figureHandle, outputFile, "Resolution", 180);
close(figureHandle);
end

function makeProgressiveStaticFigure(outputFile)
%% Section 0: Header & Readme
% Show coarse-to-fine static occupancy, contenders, and the selected route.
time_s = (0:1:30).';
azimuthBoundary = [-1.5; 1.5; 1.5; -1.5; -1.5];
elevationBoundary = [-4; -4; 4; 4; -4];
azElData = makeAzElObstacleData( ...
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
    azElData, initialState, goalState, limits, options);
assert(plan.success, "Static documentation example did not plan.");

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1120 850]);
layout = tiledlayout(figureHandle, 2, 2, ...
    "TileSpacing", "compact", "Padding", "compact");
attempts = plan.resolutionAttempts;
obstacleField = plan.obstacleField;
for attemptIndex = 1:numel(attempts)
    ax = nexttile(layout);
    hold(ax, "on");
    gridStep_deg = attempts(attemptIndex).GridStep_deg;
    azimuthValues = limits.azimuth_deg(1):gridStep_deg:limits.azimuth_deg(2);
    elevationValues = limits.elevation_deg(1):gridStep_deg: ...
        limits.elevation_deg(2);
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
    if attempts(attemptIndex).Success
        if attempts(attemptIndex).Selected
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
        plot(ax, attempts(attemptIndex).CandidatePosition_deg(:, 1), ...
            attempts(attemptIndex).CandidatePosition_deg(:, 2), style, ...
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
    if attempts(attemptIndex).Success
        resultText = sprintf( ...
            "%.2f deg", attempts(attemptIndex).ObjectiveCost);
    else
        resultText = "no route";
    end
    title(ax, sprintf("h = %.1f deg: %s", gridStep_deg, resultText));
    if attemptIndex == 1
        legend(ax, "Location", "southoutside", ...
            "Orientation", "horizontal");
    end
end
title(layout, ...
    "Static mode: progressively finer Dijkstra grids, exact polygon checks", ...
    "FontWeight", "bold");
exportgraphics(figureHandle, outputFile, "Resolution", 180);
close(figureHandle);
end

function makeDynamicSafeIntervalFigure(outputFile)
%% Section 0: Header & Readme
% Show safe-interval compression and valid routes through space-time.
time_s = (0:0.5:30).';
azimuth_deg = cell(numel(time_s), 1);
elevation_deg = cell(numel(time_s), 1);
for sampleIndex = 1:numel(time_s)
    centerElevation_deg = 3.2 * sin(2 * pi * time_s(sampleIndex) / 15);
    azimuth_deg{sampleIndex} = [-1; 1; 1; -1; -1];
    elevation_deg{sampleIndex} = centerElevation_deg + ...
        [-1.2; -1.2; 1.2; 1.2; -1.2];
end
azElData = makeAzElObstacleData( ...
    "Oscillating gate", time_s, azimuth_deg, elevation_deg);
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
    azElData, initialState, goalState, limits, options);
assert(plan.success, "Dynamic documentation example did not plan.");
obstacleField = plan.obstacleField;

probeElevation = [-4; 0; 4];
queryTime = time_s;
blocked = false(numel(probeElevation), numel(queryTime));
for probeIndex = 1:numel(probeElevation)
    blocked(probeIndex, :) = queryAzElTimeObstacle(obstacleField, ...
        zeros(numel(queryTime), 1), ...
        repmat(probeElevation(probeIndex), numel(queryTime), 1), ...
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
for displaySliceIndex = sliceIndex
    patch(ax, azimuth_deg{displaySliceIndex}, ...
        elevation_deg{displaySliceIndex}, ...
        repmat(time_s(displaySliceIndex), ...
        size(azimuth_deg{displaySliceIndex})), ...
        [0.80 0.18 0.15], ...
        "FaceAlpha", 0.05, "EdgeColor", [0.65 0.18 0.16], ...
        "LineWidth", 0.55, "HandleVisibility", "off");
end
attempts = plan.resolutionAttempts;
for attemptIndex = 1:numel(attempts)
    if ~attempts(attemptIndex).Success
        continue;
    end
    if attempts(attemptIndex).Selected
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
    plot3(ax, attempts(attemptIndex).CandidatePosition_deg(:, 1), ...
        attempts(attemptIndex).CandidatePosition_deg(:, 2), ...
        attempts(attemptIndex).CandidateTime_s, style, ...
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
exportgraphics(figureHandle, outputFile, "Resolution", 180);
close(figureHandle);
end

function makeMotionEdgeFigure(outputFile)
%% Section 0: Header & Readme
% Compare triangular and trapezoidal rest-to-rest slew profiles.
[triangularTime_s, triangularProfile] = motionProfile(4, 10, 2, 0.02);
[trapezoidalTime_s, trapezoidalProfile] = motionProfile(12, 3, 1, 0.02);

figureHandle = figure( ...
    "Color", "w", "Visible", "off", ...
    "Position", [100 100 1100 800]);
layout = tiledlayout(figureHandle, 3, 2, ...
    "TileSpacing", "compact", "Padding", "compact");
names = ["Triangular edge", "Trapezoidal edge"];
times = {triangularTime_s, trapezoidalTime_s};
profiles = {triangularProfile, trapezoidalProfile};
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
exportgraphics(figureHandle, outputFile, "Resolution", 180);
close(figureHandle);
end

function [time_s, profile] = motionProfile( ...
        distance_deg, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, sampleStep_s)
%% Section 0: Header & Readme
% Build the exact one-axis rest-to-rest profile illustrated in the guide.
switchDistance_deg = maximumVelocity_deg_s^2 / ...
    maximumAcceleration_deg_s2;
if distance_deg <= switchDistance_deg
    accelerationTime_s = sqrt(distance_deg / maximumAcceleration_deg_s2);
    cruiseTime_s = 0;
    peakVelocity_deg_s = maximumAcceleration_deg_s2 * accelerationTime_s;
else
    accelerationTime_s = maximumVelocity_deg_s / maximumAcceleration_deg_s2;
    cruiseTime_s = (distance_deg - switchDistance_deg) / ...
        maximumVelocity_deg_s;
    peakVelocity_deg_s = maximumVelocity_deg_s;
end
duration_s = 2 * accelerationTime_s + cruiseTime_s;
time_s = (0:sampleStep_s:duration_s).';
if time_s(end) < duration_s
    time_s(end + 1, 1) = duration_s;
end
position_deg = zeros(size(time_s));
velocity_deg_s = zeros(size(time_s));
acceleration_deg_s2 = zeros(size(time_s));
cruiseEndTime_s = accelerationTime_s + cruiseTime_s;
accelerationDistance_deg = 0.5 * maximumAcceleration_deg_s2 * ...
    accelerationTime_s^2;
for sampleIndex = 1:numel(time_s)
    sampleTime_s = time_s(sampleIndex);
    if sampleTime_s < accelerationTime_s
        acceleration_deg_s2(sampleIndex) = maximumAcceleration_deg_s2;
        velocity_deg_s(sampleIndex) = maximumAcceleration_deg_s2 * ...
            sampleTime_s;
        position_deg(sampleIndex) = 0.5 * ...
            maximumAcceleration_deg_s2 * sampleTime_s^2;
    elseif sampleTime_s < cruiseEndTime_s
        velocity_deg_s(sampleIndex) = peakVelocity_deg_s;
        position_deg(sampleIndex) = accelerationDistance_deg + ...
            peakVelocity_deg_s * (sampleTime_s - accelerationTime_s);
    elseif sampleTime_s < duration_s
        remainingTime_s = duration_s - sampleTime_s;
        acceleration_deg_s2(sampleIndex) = -maximumAcceleration_deg_s2;
        velocity_deg_s(sampleIndex) = maximumAcceleration_deg_s2 * ...
            remainingTime_s;
        position_deg(sampleIndex) = distance_deg - 0.5 * ...
            maximumAcceleration_deg_s2 * remainingTime_s^2;
    else
        position_deg(sampleIndex) = distance_deg;
    end
end
profile = struct( ...
    "Position", position_deg, ...
    "Velocity", velocity_deg_s, ...
    "Acceleration", acceleration_deg_s2);
end

function state = restState(time_s, position_deg)
%% Section 0: Header & Readme
% Keep the identical rest-state schema shared by both planner figures.
state = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0]);
end

function limits = standardLimits( ...
        azimuthLimits_deg, elevationLimits_deg, ...
        maximumVelocity_deg_s, maximumAcceleration_deg_s2)
%% Section 0: Header & Readme
% Keep the identical limit schema shared by both planner figures.
limits = struct( ...
    "azimuth_deg", azimuthLimits_deg, ...
    "elevation_deg", elevationLimits_deg, ...
    "maxVelocity_deg_s", maximumVelocity_deg_s, ...
    "maxAcceleration_deg_s2", maximumAcceleration_deg_s2);
end
