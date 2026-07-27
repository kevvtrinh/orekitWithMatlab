function azElData = computeAreaTargetAzElSweep( ...
        scenario, parentName, sensorName, areaTargetName, options)
%COMPUTEAREATARGETAZELSWEEP Prepare scenario histories for az/el projection.
%
% azElData = computeAreaTargetAzElSweep(scenario, parentName, sensorName, ...
%     areaTargetName, options)
%
% This convenience adapter selects projection times and computes the sensor
% ECEF position and fixed-to-sensor attitude history. It delegates all
% boundary processing and azElData creation to calculateAreaTargetAzEl.
%
% The returned struct always has exactly the canonical fields:
%   targetName, time_s, az_deg, el_deg, status
%
% Options:
%   TimeVector               Explicit datetime samples. When supplied, no
%                            access interval is selected.
%   TimeStepSeconds          Access/projection sampling step (default 1).
%   AccessIndex              Access interval to project (default 1).
%   AccessPaddingSeconds     Time before/after the access (default 1).
%   MaximumBoundaryStepDeg   Densification step (default 0.15).
%   AttitudeMode             "NadirSun", "NadirVelocity", or "Sensor".
%   MountOffsetMeters        Sensor-frame x/y/z offset.

if nargin < 5
    options = struct();
end

parent = scenario.getObject(parentName);
if ~isa(parent, "SatelliteObject")
    error("computeAreaTargetAzElSweep:InvalidParent", ...
        "The sensor parent must be a propagated SatelliteObject.");
end
if ~parent.IsPropagated || isempty(parent.Ephemeris)
    error("computeAreaTargetAzElSweep:NotPropagated", ...
        "Propagate satellite '%s' before computing the az/el sweep.", ...
        parent.Name);
end
sensor = parent.getSensor(sensorName);
target = scenario.getObject(areaTargetName);
if ~isa(target, "AreaTargetObject")
    error("computeAreaTargetAzElSweep:InvalidTarget", ...
        "Target '%s' must be an AreaTargetObject.", string(areaTargetName));
end
target.validate();

defaults = struct( ...
    "TimeVector", datetime.empty(0, 1), ...
    "TimeStepSeconds", 1, ...
    "AccessIndex", 1, ...
    "AccessPaddingSeconds", 1, ...
    "MaximumBoundaryStepDeg", 0.15, ...
    "AttitudeMode", string(parent.Attitude), ...
    "MountOffsetMeters", sensor.MountOffsetMeters);
options = applyDefaults(options, defaults);
validateOptions(options);

timeVector = projectionTimes( ...
    scenario, parentName, sensorName, areaTargetName, options);
parentPositionMeters = parent.getECEFMatrix(timeVector);
[sensorPositionMeters, fixedToSensor] = sensorPose( ...
    scenario, parent, sensor, timeVector, parentPositionMeters, options);
time_s = seconds(timeVector - OrekitTime.ensureUtc(scenario.Config.Epoch));
boundaryLatLon_deg = [ ...
    target.BoundaryLatDeg(:), target.BoundaryLonDeg(:)];

azElData = calculateAreaTargetAzEl( ...
    target.Name, boundaryLatLon_deg, time_s, ...
    sensorPositionMeters / 1000, fixedToSensor, ...
    options.MaximumBoundaryStepDeg);
end

function options = applyDefaults(options, defaults)
names = fieldnames(defaults);
for k = 1:numel(names)
    name = names{k};
    if ~isfield(options, name) || isempty(options.(name))
        options.(name) = defaults.(name);
    end
end
end

function validateOptions(options)
validateattributes(options.TimeStepSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.AccessIndex, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.AccessPaddingSeconds, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.MaximumBoundaryStepDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.MountOffsetMeters, {'numeric'}, ...
    {'vector', 'numel', 3, 'real', 'finite'});
if ~isempty(options.TimeVector) && ~isdatetime(options.TimeVector)
    error("computeAreaTargetAzElSweep:InvalidTimeVector", ...
        "TimeVector must be a datetime vector.");
end
end

function timeVector = projectionTimes( ...
        scenario, parentName, sensorName, targetName, options)
if ~isempty(options.TimeVector)
    timeVector = OrekitTime.ensureUtc(options.TimeVector(:));
    if any(isnat(timeVector))
        error("computeAreaTargetAzElSweep:InvalidTimeVector", ...
            "TimeVector cannot contain NaT.");
    end
    return;
end

accessOptions = struct( ...
    "TimeStepSeconds", options.TimeStepSeconds, ...
    "UseFieldOfRegard", true, ...
    "SuppressNoAccessWarning", true);
accessResult = computeSensorAccess( ...
    scenario, parentName, sensorName, targetName, accessOptions);
if height(accessResult.AccessWindows) < options.AccessIndex
    error("computeAreaTargetAzElSweep:NoAccess", ...
        "Access interval %d does not exist between '%s' and '%s'.", ...
        options.AccessIndex, string(parentName), string(targetName));
end

row = accessResult.AccessWindows(options.AccessIndex, :);
scenarioStart = OrekitTime.ensureUtc(scenario.Config.Epoch);
scenarioStop = OrekitTime.ensureUtc(scenario.Config.getStopTime());
startTime = max( ...
    row.StartTime - seconds(options.AccessPaddingSeconds), scenarioStart);
stopTime = min( ...
    row.StopTime + seconds(options.AccessPaddingSeconds), scenarioStop);
timeVector = (startTime:seconds(options.TimeStepSeconds):stopTime).';
if timeVector(end) < stopTime
    timeVector(end + 1, 1) = stopTime;
end
end

function [sensorPosition, fixedToSensor] = sensorPose( ...
        scenario, parent, sensor, timeVector, parentPosition, options)
n = numel(timeVector);
zAxis = zeros(n, 3);
for k = 1:n
    zAxis(k, :) = sensor.getBoresightVector(timeVector(k), scenario);
end
zAxis = normalizeRows(zAxis);

mode = upper(string(options.AttitudeMode));
switch mode
    case {"NADIRSUN", "NADIR_SUN", "SUNCONSTRAINED"}
        sun = OrekitBodies.sunPositions(timeVector, "ECEF");
        reference = [sun.X_m, sun.Y_m, sun.Z_m] - parentPosition;
    case {"SENSOR", "SENSORFRAME"}
        reference = repmat([1 0 0], n, 1);
    otherwise
        if n == 1
            dt = seconds(1);
            reference = parent.getECEFMatrix(timeVector + dt) - ...
                parent.getECEFMatrix(timeVector - dt);
        else
            t = seconds(timeVector - timeVector(1));
            reference = [ ...
                gradient(parentPosition(:, 1), t), ...
                gradient(parentPosition(:, 2), t), ...
                gradient(parentPosition(:, 3), t)];
        end
end

xAxis = reference - sum(reference .* zAxis, 2) .* zAxis;
bad = sqrt(sum(xAxis.^2, 2)) < 1e-9;
if any(bad)
    seed = repmat([0 0 1], nnz(bad), 1);
    nearlyParallel = abs(sum(seed .* zAxis(bad, :), 2)) > 0.9;
    seed(nearlyParallel, :) = repmat([0 1 0], nnz(nearlyParallel), 1);
    xAxis(bad, :) = cross(seed, zAxis(bad, :), 2);
end
xAxis = normalizeRows(xAxis);
yAxis = normalizeRows(cross(zAxis, xAxis, 2));
xAxis = normalizeRows(cross(yAxis, zAxis, 2));

fixedToSensor = zeros(3, 3, n);
for k = 1:n
    fixedToSensor(:, :, k) = [xAxis(k, :); yAxis(k, :); zAxis(k, :)];
end
offset = reshape(double(options.MountOffsetMeters), 1, 3);
sensorPosition = parentPosition + offset(1) .* xAxis + ...
    offset(2) .* yAxis + offset(3) .* zAxis;
end

function rows = normalizeRows(rows)
rows = rows ./ max(sqrt(sum(rows.^2, 2)), eps);
end
