function plotHandles = plotSimpleAzElTimeKinodynamicDijkstra(plan, options)
%% Section 0: Header & Readme
% SYNTAX
%   options = plotSimpleAzElTimeKinodynamicDijkstra()
%   plotHandles = plotSimpleAzElTimeKinodynamicDijkstra(plan)
%   plotHandles = plotSimpleAzElTimeKinodynamicDijkstra(plan, options)
%**************************************************************************
% PURPOSE
%   - Show generated and settled search states, occupied space-time cells,
%     and the reconstructed position, velocity, acceleration, and jerk.
%**************************************************************************
% INPUTS
%   - plan (scalar struct)
%       Output from planSimpleAzElTimeKinodynamicDijkstra.
%   - options (scalar struct)
%       .maximumSearchPoints limits displayed generated and settled states.
%       .maximumOccupancyPoints limits displayed occupied cells.
%**************************************************************************
% OUTPUTS
%   - plotHandles (scalar struct)
%       Figure, tiled layout, and four axes handles.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds; derivative units appear on axes.

%% Section 1: Validate Inputs & Apply Defaults
defaultOptions = struct( ...
    "maximumSearchPoints", 20000, ...
    "maximumOccupancyPoints", 20000);
if nargin == 0
    plotHandles = defaultOptions;
    return;
end
if nargin < 2 || isempty(options)
    options = struct();
end
requiredPlanFields = ["success", "occupancy", "statePosition_deg", ...
    "stateTime_s", "settledStateIndices"];
if ~isstruct(plan) || ~isscalar(plan) || ...
        ~all(isfield(plan, cellstr(requiredPlanFields)))
    error("plotSimpleAzElTimeKinodynamicDijkstra:InvalidPlan", ...
        "plan must be a simple kinodynamic Dijkstra result.");
end
if ~isstruct(options) || ~isscalar(options)
    error("plotSimpleAzElTimeKinodynamicDijkstra:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownFields = setdiff(fieldnames(options), fieldnames(defaultOptions));
if ~isempty(unknownFields)
    warning("plotSimpleAzElTimeKinodynamicDijkstra:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownFields), ", "));
    options = rmfield(options, unknownFields);
end
resolvedOptions = defaultOptions;
providedFields = fieldnames(options);
for fieldIndex = 1:numel(providedFields)
    resolvedOptions.(providedFields{fieldIndex}) = ...
        options.(providedFields{fieldIndex});
end
options = resolvedOptions;
validateattributes(options.maximumSearchPoints, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.maximumOccupancyPoints, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});

%% Section 2: Select Display Samples
generatedStateCount = size(plan.statePosition_deg, 1);
generatedDisplayIndex = unique(round(linspace(1, ...
    max(1, generatedStateCount), ...
    min(generatedStateCount, options.maximumSearchPoints))));
settledStateIndices = double(plan.settledStateIndices(:));
if numel(settledStateIndices) > options.maximumSearchPoints
    settledDisplayLocation = unique(round(linspace(1, ...
        numel(settledStateIndices), options.maximumSearchPoints)));
    settledStateIndices = settledStateIndices(settledDisplayLocation);
end

[occupiedElevationIndex, occupiedAzimuthIndex, occupiedTimeIndex] = ...
    ind2sub(size(plan.occupancy), find(plan.occupancy));
if numel(occupiedAzimuthIndex) > options.maximumOccupancyPoints
    occupancyDisplayLocation = unique(round(linspace(1, ...
        numel(occupiedAzimuthIndex), options.maximumOccupancyPoints)));
    occupiedElevationIndex = ...
        occupiedElevationIndex(occupancyDisplayLocation);
    occupiedAzimuthIndex = occupiedAzimuthIndex(occupancyDisplayLocation);
    occupiedTimeIndex = occupiedTimeIndex(occupancyDisplayLocation);
end

%% Section 3: Plot Search And Space-Time Occupancy
figureHandle = figure( ...
    "Color", "w", "Name", "Simple kinodynamic az/el/time Dijkstra");
tiledLayout = tiledlayout(figureHandle, 2, 2, ...
    "TileSpacing", "compact", "Padding", "compact");

searchAxes = nexttile(tiledLayout);
hold(searchAxes, "on");
if generatedStateCount > 0
    scatter(searchAxes, ...
        plan.statePosition_deg(generatedDisplayIndex, 1), ...
        plan.statePosition_deg(generatedDisplayIndex, 2), ...
        9, [0.75, 0.78, 0.82], "filled", ...
        "DisplayName", "Generated");
end
if ~isempty(settledStateIndices)
    scatter(searchAxes, ...
        plan.statePosition_deg(settledStateIndices, 1), ...
        plan.statePosition_deg(settledStateIndices, 2), ...
        12, plan.stateTime_s(settledStateIndices), "filled", ...
        "DisplayName", "Settled");
end
if plan.success
    plot(searchAxes, plan.position_deg(:, 1), plan.position_deg(:, 2), ...
        "k-o", "LineWidth", 2, "MarkerFaceColor", "y", ...
        "DisplayName", "Trajectory");
end
grid(searchAxes, "on");
xlabel(searchAxes, "Azimuth (deg)");
ylabel(searchAxes, "Elevation (deg)");
title(searchAxes, sprintf("Search: %d expanded, %d generated", ...
    plan.expandedStateCount, plan.generatedStateCount));
legend(searchAxes, "Location", "best");

spaceTimeAxes = nexttile(tiledLayout);
hold(spaceTimeAxes, "on");
if ~isempty(occupiedAzimuthIndex)
    scatter3(spaceTimeAxes, ...
        plan.azimuthGrid_deg(occupiedAzimuthIndex), ...
        plan.elevationGrid_deg(occupiedElevationIndex), ...
        plan.timeGrid_s(occupiedTimeIndex), 10, ...
        [0.85, 0.25, 0.20], "filled", ...
        "MarkerFaceAlpha", 0.2, "DisplayName", "Occupied cells");
end
if plan.success
    plot3(spaceTimeAxes, plan.position_deg(:, 1), ...
        plan.position_deg(:, 2), plan.time_s, "b-o", ...
        "LineWidth", 2, "MarkerFaceColor", "b", ...
        "DisplayName", "Trajectory");
end
grid(spaceTimeAxes, "on");
xlabel(spaceTimeAxes, "Azimuth (deg)");
ylabel(spaceTimeAxes, "Elevation (deg)");
zlabel(spaceTimeAxes, "Time (s)");
title(spaceTimeAxes, "Azimuth/elevation/time occupancy");
view(spaceTimeAxes, 3);
legend(spaceTimeAxes, "Location", "best");

%% Section 4: Plot Reconstructed Kinematics
velocityAxes = nexttile(tiledLayout);
hold(velocityAxes, "on");
if plan.success
    plot(velocityAxes, plan.time_s, plan.velocity_deg_s(:, 1), ...
        "-o", "LineWidth", 1.5, "DisplayName", "Azimuth velocity");
    plot(velocityAxes, plan.time_s, plan.velocity_deg_s(:, 2), ...
        "-o", "LineWidth", 1.5, "DisplayName", "Elevation velocity");
    waitingRows = find(plan.isWaiting);
    if ~isempty(waitingRows)
        scatter(velocityAxes, plan.time_s(waitingRows), ...
            zeros(size(waitingRows)), 45, "k", "filled", ...
            "DisplayName", "True hold");
    end
end
grid(velocityAxes, "on");
xlabel(velocityAxes, "Time (s)");
ylabel(velocityAxes, "Velocity (deg/s)");
title(velocityAxes, "Velocity and true holds");
legend(velocityAxes, "Location", "best");

controlAxes = nexttile(tiledLayout);
hold(controlAxes, "on");
if plan.success
    plot(controlAxes, plan.time_s, plan.acceleration_deg_s2(:, 1), ...
        "-o", "LineWidth", 1.5, "DisplayName", "Azimuth acceleration");
    plot(controlAxes, plan.time_s, plan.acceleration_deg_s2(:, 2), ...
        "-o", "LineWidth", 1.5, "DisplayName", "Elevation acceleration");
    stairs(controlAxes, plan.time_s, plan.jerk_deg_s3(:, 1), ...
        "--", "LineWidth", 1.2, "DisplayName", "Azimuth jerk");
    stairs(controlAxes, plan.time_s, plan.jerk_deg_s3(:, 2), ...
        "--", "LineWidth", 1.2, "DisplayName", "Elevation jerk");
end
grid(controlAxes, "on");
xlabel(controlAxes, "Time (s)");
ylabel(controlAxes, "Acceleration / jerk");
title(controlAxes, "Acceleration and applied jerk");
legend(controlAxes, "Location", "best");

title(tiledLayout, string(plan.message));
plotHandles = struct( ...
    "Figure", figureHandle, ...
    "TiledLayout", tiledLayout, ...
    "SearchAxes", searchAxes, ...
    "SpaceTimeAxes", spaceTimeAxes, ...
    "VelocityAxes", velocityAxes, ...
    "ControlAxes", controlAxes, ...
    "Options", options);
end
