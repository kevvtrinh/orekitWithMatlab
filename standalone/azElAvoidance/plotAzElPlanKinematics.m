function plotResult = plotAzElPlanKinematics(plan, optionOverrides)
%% Section 0: Header & Readme
% SYNTAX
%   optionDefaults = plotAzElPlanKinematics()
%   plotResult = plotAzElPlanKinematics(plan)
%   plotResult = plotAzElPlanKinematics(plan, optionOverrides)
%**************************************************************************
% PURPOSE
%   - Plot sampled position, velocity, acceleration, and finite-difference
%     jerk, with optional XLSX export.
%**************************************************************************
% INPUTS
%   - plan (scalar struct)
%       Successful sampled boresight plan.
%   - optionOverrides (scalar struct)
%       ExportExcel, ExcelFile, PositionMode, Figure, FigureVisible, and
%       Title controls.
%**************************************************************************
% OUTPUTS
%   - plotResult (scalar struct)
%       Data table, sampled jerk, graphics handles, export path, and resolved
%       options. A zero-argument call returns default options.
%**************************************************************************
% UNITS
%   - Position is degrees, time is seconds, velocity is deg/s,
%     acceleration is deg/s^2, and sampled jerk is deg/s^3.

%% Section 1: Validate Inputs & Apply Defaults
defaultOptions = defaultPlotAzElPlanKinematicsOptions();
if nargin == 0
    plotResult = defaultOptions;
    return;
end
if nargin < 2 || isempty(optionOverrides)
    optionOverrides = struct();
end
if ~isstruct(optionOverrides) || ~isscalar(optionOverrides)
    error("plotAzElPlanKinematics:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownOptionFields = setdiff( ...
    fieldnames(optionOverrides), fieldnames(defaultOptions), "stable");
if ~isempty(unknownOptionFields)
    warning("plotAzElPlanKinematics:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    optionOverrides = rmfield(optionOverrides, unknownOptionFields);
end
resolvedOptions = optionOverrides;
defaultOptionFields = fieldnames(defaultOptions);
for defaultOptionIndex = 1:numel(defaultOptionFields)
    defaultOptionField = defaultOptionFields{defaultOptionIndex};
    isMissingOption = ~isfield(resolvedOptions, defaultOptionField);
    defaultOptionValue = defaultOptions.(defaultOptionField);
    if isMissingOption
        resolvedOptions.(defaultOptionField) = defaultOptionValue;
    elseif isempty(resolvedOptions.(defaultOptionField))
        resolvedOptions.(defaultOptionField) = defaultOptionValue;
    end
end
validateattributes(resolvedOptions.ExportExcel, ...
    {'logical', 'numeric'}, {'scalar'});
resolvedOptions.ExportExcel = logical(resolvedOptions.ExportExcel);
resolvedOptions.PositionMode = lower(strtrim( ...
    string(resolvedOptions.PositionMode)));
if ~any(resolvedOptions.PositionMode == ["wrapped" "unwrapped"])
    error("plotAzElPlanKinematics:InvalidPositionMode", ...
        "PositionMode must be wrapped or unwrapped.");
end
resolvedOptions.FigureVisible = lower(strtrim( ...
    string(resolvedOptions.FigureVisible)));
if ~any(resolvedOptions.FigureVisible == ["on" "off"])
    error("plotAzElPlanKinematics:InvalidFigureVisible", ...
        "FigureVisible must be on or off.");
end
resolvedOptions.Title = string(resolvedOptions.Title);
if ~isscalar(resolvedOptions.Title)
    error("plotAzElPlanKinematics:InvalidTitle", ...
        "Title must be a string scalar.");
end
hasSuppliedFigure = ~isempty(resolvedOptions.Figure);
figureIsScalar = isscalar(resolvedOptions.Figure);
figureIsGraphics = isgraphics(resolvedOptions.Figure, "figure");
suppliedFigureIsValid = figureIsScalar && figureIsGraphics;
hasInvalidFigure = hasSuppliedFigure && ~suppliedFigureIsValid;
if hasInvalidFigure
    error("plotAzElPlanKinematics:InvalidFigure", ...
        "Figure must be a valid scalar figure handle.");
end
resolvedOptions.ExcelFile = string(resolvedOptions.ExcelFile);
if ~isscalar(resolvedOptions.ExcelFile)
    error("plotAzElPlanKinematics:InvalidExcelFile", ...
        "ExcelFile must be a string scalar.");
end

%% Section 2: Normalize The Sampled Command
requiredPlanFields = ["time_s", "position_deg", ...
    "velocity_deg_s", "acceleration_deg_s2"];
if ~isstruct(plan) || ~isscalar(plan) || ...
        ~all(isfield(plan, cellstr(requiredPlanFields)))
    error("plotAzElPlanKinematics:InvalidPlan", ...
        "plan is missing time, position, velocity, or acceleration.");
end
if isfield(plan, "success") && ~plan.success
    error("plotAzElPlanKinematics:UnsuccessfulPlan", ...
        "Cannot plot an unsuccessful plan.");
end
time_s = double(plan.time_s(:));
validateattributes(time_s, {'numeric'}, ...
    {'nonempty', 'real', 'finite', 'increasing'});
sampleCount = numel(time_s);
wrappedPosition_deg = normalizeSamples( ...
    plan.position_deg, sampleCount, "position_deg");
velocity_deg_s = normalizeSamples( ...
    plan.velocity_deg_s, sampleCount, "velocity_deg_s");
acceleration_deg_s2 = normalizeSamples( ...
    plan.acceleration_deg_s2, sampleCount, "acceleration_deg_s2");
if isfield(plan, "positionUnwrapped_deg") && ...
        ~isempty(plan.positionUnwrapped_deg)
    unwrappedPosition_deg = normalizeSamples( ...
        plan.positionUnwrapped_deg, sampleCount, ...
        "positionUnwrapped_deg");
else
    % Older callers may omit the unwrapped command. Reconstructing it here
    % keeps plots continuous, but cannot recover intentional full revolutions.
    unwrappedPosition_deg = wrappedPosition_deg;
    wrappedAzimuth_deg = wrappedPosition_deg(:, 1);
    unwrappedPosition_deg(:, 1) = rad2deg( ...
        unwrap(deg2rad(wrappedAzimuth_deg)));
end

%% Section 3: Derive Sampled Jerk
% Jerk is derived from returned acceleration samples. It is a sampled
% diagnostic, not an independently constrained planner state.
jerk_deg_s3 = zeros(size(acceleration_deg_s2));
if sampleCount > 1
    jerk_deg_s3(1, :) = ( ...
        acceleration_deg_s2(2, :) - acceleration_deg_s2(1, :)) / ...
        (time_s(2) - time_s(1));
    jerk_deg_s3(end, :) = (acceleration_deg_s2(end, :) - ...
        acceleration_deg_s2(end - 1, :)) / ...
        (time_s(end) - time_s(end - 1));
    if sampleCount > 2
        centeredDuration_s = time_s(3:end) - time_s(1:end - 2);
        jerk_deg_s3(2:end - 1, :) = ( ...
            acceleration_deg_s2(3:end, :) - ...
            acceleration_deg_s2(1:end - 2, :)) ./ centeredDuration_s;
    end
end
elapsedTime_s = time_s - time_s(1);

%% Section 4: Build The Table & Figure
kinematicsTable = table( ...
    time_s, elapsedTime_s, ...
    wrappedPosition_deg(:, 1), wrappedPosition_deg(:, 2), ...
    unwrappedPosition_deg(:, 1), unwrappedPosition_deg(:, 2), ...
    velocity_deg_s(:, 1), velocity_deg_s(:, 2), ...
    acceleration_deg_s2(:, 1), acceleration_deg_s2(:, 2), ...
    jerk_deg_s3(:, 1), jerk_deg_s3(:, 2), ...
    'VariableNames', { ...
    'Time_s', 'ElapsedTime_s', ...
    'AzimuthWrapped_deg', 'ElevationWrapped_deg', ...
    'AzimuthUnwrapped_deg', 'ElevationUnwrapped_deg', ...
    'AzimuthVelocity_deg_s', 'ElevationVelocity_deg_s', ...
    'AzimuthAcceleration_deg_s2', 'ElevationAcceleration_deg_s2', ...
    'AzimuthJerk_deg_s3', 'ElevationJerk_deg_s3'});

if isempty(resolvedOptions.Figure)
    figureHandle = figure( ...
        "Color", "w", ...
        "Visible", resolvedOptions.FigureVisible, ...
        "Name", resolvedOptions.Title, ...
        "Position", [100 100 1200 900]);
else
    figureHandle = resolvedOptions.Figure;
    clf(figureHandle);
end
layout = tiledlayout(figureHandle, 4, 1, ...
    "TileSpacing", "compact", "Padding", "compact");
title(layout, resolvedOptions.Title);

if resolvedOptions.PositionMode == "unwrapped"
    plottedPosition_deg = unwrappedPosition_deg;
    positionTitle = "Position (unwrapped azimuth)";
else
    plottedPosition_deg = wrappedPosition_deg;
    positionTitle = "Position (wrapped azimuth)";
end

axesHandles = gobjects(4, 1);
axesHandles(1) = nexttile(layout);
plotPair(axesHandles(1), elapsedTime_s, plottedPosition_deg);
ylabel(axesHandles(1), "Angle (deg)");
title(axesHandles(1), positionTitle);
legend(axesHandles(1), ["Azimuth" "Elevation"], ...
    "Location", "best", "Orientation", "horizontal");

axesHandles(2) = nexttile(layout);
plotPair(axesHandles(2), elapsedTime_s, velocity_deg_s);
ylabel(axesHandles(2), "Rate (deg/s)");
title(axesHandles(2), "Velocity");

axesHandles(3) = nexttile(layout);
plotPair(axesHandles(3), elapsedTime_s, acceleration_deg_s2);
ylabel(axesHandles(3), "Accel. (deg/s^2)");
title(axesHandles(3), "Acceleration");

axesHandles(4) = nexttile(layout);
plotPair(axesHandles(4), elapsedTime_s, jerk_deg_s3);
ylabel(axesHandles(4), "Jerk (deg/s^3)");
title(axesHandles(4), "Sampled jerk");
xlabel(axesHandles(4), "Elapsed time (s)");
linkaxes(axesHandles, "x");
xlim(axesHandles(4), [elapsedTime_s(1), elapsedTime_s(end)]);
set(axesHandles(1:3), "XTickLabel", []);

excelFile = "";
if resolvedOptions.ExportExcel
    % Keep export opt-in because long trajectories can create large workbook
    % files and plotting should otherwise remain side-effect free.
    requestedExcelFile = resolvedOptions.ExcelFile;
    if strlength(requestedExcelFile) == 0
        requestedExcelFile = fullfile( ...
            pwd, "az_el_plan_kinematics.xlsx");
    end
    [excelFolder, excelName, excelExtension] = fileparts( ...
        requestedExcelFile);
    if excelExtension == ""
        excelExtension = ".xlsx";
    elseif ~strcmpi(excelExtension, ".xlsx")
        error("plotAzElPlanKinematics:InvalidExcelExtension", ...
            "ExcelFile must use the .xlsx extension.");
    end
    if excelFolder == ""
        excelFolder = pwd;
    end
    if ~isfolder(excelFolder)
        error("plotAzElPlanKinematics:MissingExcelFolder", ...
            "Excel output folder does not exist: %s", excelFolder);
    end
    excelFile = string(fullfile( ...
        excelFolder, excelName + excelExtension));
    writetable(kinematicsTable, excelFile, "Sheet", "Kinematics");
end

plotResult = struct( ...
    "Data", kinematicsTable, ...
    "Jerk_deg_s3", jerk_deg_s3, ...
    "Figure", figureHandle, ...
    "Layout", layout, ...
    "Axes", axesHandles, ...
    "ExportedExcel", resolvedOptions.ExportExcel, ...
    "ExcelFile", excelFile, ...
    "Options", resolvedOptions);
end

%% Section 5: Local Functions
function plotPair(ax, time_s, values)
%% Section 0: Header & Readme
% SYNTAX
%   plotPair(ax, time_s, values)
%**************************************************************************
% PURPOSE
%   - Draw azimuth and elevation series with one shared panel style.
%**************************************************************************
% INPUTS
%   - ax (axes handle)
%       Destination axes.
%   - time_s (numeric vector)
%       Horizontal sample coordinates.
%   - values (numeric matrix)
%       Two sampled angular quantities.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - time_s is seconds; value units are defined by the caller.
% Every panel uses the same axis colors and presentation. Keeping this
% repeated drawing primitive shared prevents one derivative panel drifting
% from the others.
plot(ax, time_s, values(:, 1), ...
    "LineWidth", 1.6, "Color", [0.00 0.35 0.70]);
hold(ax, "on");
plot(ax, time_s, values(:, 2), ...
    "LineWidth", 1.6, "Color", [0.85 0.33 0.10]);
hold(ax, "off");
grid(ax, "on");
box(ax, "on");
end

function values = normalizeSamples(values, sampleCount, name)
%% Section 0: Header & Readme
% SYNTAX
%   values = normalizeSamples(values, sampleCount, name)
%**************************************************************************
% PURPOSE
%   - Enforce the shared finite N-by-2 sampled-plan shape.
%**************************************************************************
% INPUTS
%   - values (numeric matrix)
%       Samples to validate.
%   - sampleCount (positive integer)
%       Required row count.
%   - name (text)
%       Diagnostic argument name.
%**************************************************************************
% OUTPUTS
%   - values (double matrix)
%       Validated samples.
%**************************************************************************
% UNITS
%   - Units are carried by the caller and argument name.
% Position, velocity, acceleration, and optional unwrapped position all
% require the same N-by-2 finite sample contract.
validateattributes(values, {'numeric'}, ...
    {'2d', 'nrows', sampleCount, 'ncols', 2, ...
    'real', 'finite'}, mfilename, name);
values = double(values);
end

function options = defaultPlotAzElPlanKinematicsOptions()
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultPlotAzElPlanKinematicsOptions()
%**************************************************************************
% PURPOSE
%   - Keep plotting and export defaults in one source of truth.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated kinematics-plot options.
%**************************************************************************
% UNITS
%   - Options contain no numeric physical quantities.
options = struct( ...
    "ExportExcel", false, ...
    "ExcelFile", "", ...
    "PositionMode", "unwrapped", ...
    "Figure", [], ...
    "FigureVisible", string(get(groot, "DefaultFigureVisible")), ...
    "Title", "Boresight az/el kinematics");
end
