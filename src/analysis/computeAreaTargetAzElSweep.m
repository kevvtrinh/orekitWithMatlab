function result = computeAreaTargetAzElSweep( ...
        scenario, parentName, sensorName, areaTargetName, options)
%COMPUTEAREATARGETAZELSWEEP Project an area boundary into a moving sensor frame.
%
% result = computeAreaTargetAzElSweep(scenario, parentName, sensorName, ...
%     areaTargetName, options)
%
% Orekit supplies the propagated ECEF trajectory, WGS-84 geometry, and Sun
% direction.  This function densifies the geographic boundary, clips it at
% the ellipsoidal horizon, and expresses every visible direction as sensor
% azimuth/elevation.  Sensor elevation is 90 deg on the nominal boresight.
%
% Options (all optional):
%   TimeVector               Explicit datetime samples. When supplied, no
%                            access interval is selected.
%   TimeStepSeconds          Access/projection sampling step (default 1).
%   AccessIndex              Access interval to project (default 1).
%   AccessPaddingSeconds     Time before/after the access (default 1).
%   MaximumBoundaryStepDeg   Densification step (default 0.15).
%   AzimuthLimitsDeg         Mechanical limits (default [-180 180]).
%   ElevationLimitsDeg       Mechanical limits (default [0 90]).
%   HomeAzElDeg              Home position (default [0 90]).
%   AttitudeMode             "NadirSun", "NadirVelocity", or "Sensor".
%                            Default is the satellite Attitude property.
%   MountOffsetMeters        Offset in sensor-frame x/y/z (default from
%                            SensorObject.MountOffsetMeters).

% Output azimuth/elevation cells retain NaN separators at horizon and
% azimuth-wrap discontinuities so they can be plotted directly.

% See also PLOTAREATARGETAZELSWEEP, ANIMATEAREATARGETAZEL.

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
        "Propagate satellite '%s' before computing the az/el sweep.", parent.Name);
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
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [0 90], ...
    "HomeAzElDeg", [0 90], ...
    "AttitudeMode", string(parent.Attitude), ...
    "MountOffsetMeters", sensor.MountOffsetMeters);
options = applyDefaults(options, defaults);
validateOptions(options);

[timeVector, accessWindow, accessResult] = projectionTimes( ...
    scenario, parentName, sensorName, areaTargetName, options);
parentPosition = parent.getECEFMatrix(timeVector);
[sensorPosition, fixedToSensor] = sensorPose( ...
    scenario, parent, sensor, timeVector, parentPosition, options);

[denseLatLon, denseFixed] = denseBoundary(target, ...
    options.MaximumBoundaryStepDeg);
[azimuthDeg, elevationDeg, status] = projectBoundary( ...
    denseLatLon, denseFixed, sensorPosition, fixedToSensor);

centroid = target.getCentroid();
[cx, cy, cz] = OrekitFrames.geodeticToECEF( ...
    centroid(1), centroid(2), target.AltitudeMeters);
centroidFixed = [cx cy cz];
[commandAzimuthDeg, commandElevationDeg] = directionAzEl( ...
    centroidFixed - sensorPosition, fixedToSensor);
insidePositionLimits = commandAzimuthDeg >= options.AzimuthLimitsDeg(1) & ...
    commandAzimuthDeg <= options.AzimuthLimitsDeg(2) & ...
    commandElevationDeg >= options.ElevationLimitsDeg(1) & ...
    commandElevationDeg <= options.ElevationLimitsDeg(2);

result = struct();
result.TargetName = string(target.Name);
result.ParentName = string(parent.Name);
result.SensorName = string(sensor.Name);
result.Time = timeVector;
result.ElapsedSeconds = seconds(timeVector - scenario.Config.Epoch);
result.AzimuthDeg = azimuthDeg;
result.ElevationDeg = elevationDeg;
result.Status = status;
result.CommandAzimuthDeg = commandAzimuthDeg;
result.CommandElevationDeg = commandElevationDeg;
result.CommandInsidePositionLimits = insidePositionLimits;
result.AccessWindow = accessWindow;
result.AccessResult = accessResult;
result.AzimuthLimitsDeg = reshape(options.AzimuthLimitsDeg, 1, 2);
result.ElevationLimitsDeg = reshape(options.ElevationLimitsDeg, 1, 2);
result.HomeAzElDeg = reshape(options.HomeAzElDeg, 1, 2);
result.SensorPositionEcefMeters = sensorPosition;
result.FixedToSensorDcm = fixedToSensor;
result.DenseBoundaryLatLonDeg = denseLatLon;
result.Options = options;
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
validateattributes(options.AzimuthLimitsDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
validateattributes(options.ElevationLimitsDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
validateattributes(options.HomeAzElDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
validateattributes(options.MountOffsetMeters, {'numeric'}, ...
    {'vector', 'numel', 3, 'real', 'finite'});
if ~isempty(options.TimeVector) && ~isdatetime(options.TimeVector)
    error("computeAreaTargetAzElSweep:InvalidTimeVector", ...
        "TimeVector must be a datetime vector.");
end
end

function [timeVector, accessWindow, accessResult] = projectionTimes( ...
        scenario, parentName, sensorName, targetName, options)
accessResult = struct();
accessWindow = NaT(1, 2, "TimeZone", "UTC");
if ~isempty(options.TimeVector)
    timeVector = OrekitTime.ensureUtc(options.TimeVector(:));
    if any(isnat(timeVector))
        error("computeAreaTargetAzElSweep:InvalidTimeVector", ...
            "TimeVector cannot contain NaT.");
    end
    return;
end

accessOptions = struct("TimeStepSeconds", options.TimeStepSeconds, ...
    "UseFieldOfRegard", true, "SuppressNoAccessWarning", true);
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
startTime = max(row.StartTime - seconds(options.AccessPaddingSeconds), scenarioStart);
stopTime = min(row.StopTime + seconds(options.AccessPaddingSeconds), scenarioStop);
accessWindow = [startTime stopTime];
timeVector = (startTime:seconds(options.TimeStepSeconds):stopTime).';
if timeVector(end) < stopTime
    timeVector(end + 1, 1) = stopTime;
end
end

function [sensorPosition, fixedToSensor] = sensorPose( ...
        scenario, parent, sensor, timeVector, parentPosition, options)
n = numel(timeVector);
zAxis = zeros(n, 3);
mode = upper(string(options.AttitudeMode));

% The sensor frame +Z is the nominal boresight, matching the source smart
% sensor convention where elevation 90 deg lies on boresight.
for k = 1:n
    zAxis(k, :) = sensor.getBoresightVector(timeVector(k), scenario);
end
zAxis = normalizeRows(zAxis);

switch mode
    case {"NADIRSUN", "NADIR_SUN", "SUNCONSTRAINED"}
        sun = OrekitBodies.sunPositions(timeVector, "ECEF");
        reference = [sun.X_m, sun.Y_m, sun.Z_m] - parentPosition;
    case {"SENSOR", "SENSORFRAME"}
        reference = repmat([1 0 0], n, 1);
    otherwise
        % Nadir-velocity/local-orbital frame.  Central differences on the
        % interpolated ECEF path are adequate for defining the transverse axis.
        if n == 1
            dt = seconds(1);
            reference = parent.getECEFMatrix(timeVector + dt) - ...
                parent.getECEFMatrix(timeVector - dt);
        else
            t = seconds(timeVector - timeVector(1));
            reference = [gradient(parentPosition(:, 1), t), ...
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

function [denseLatLon, denseFixed] = denseBoundary(target, maximumStepDeg)
boundary = [target.BoundaryLatDeg(:), target.BoundaryLonDeg(:)];
if isequal(boundary(1, :), boundary(end, :))
    boundary(end, :) = [];
end
segment = cell(size(boundary, 1), 1);
for k = 1:size(boundary, 1)
    next = mod(k, size(boundary, 1)) + 1;
    delta = boundary(next, :) - boundary(k, :);
    delta(2) = wrap180(delta(2));
    count = max(1, ceil(hypot(delta(1), delta(2)) / maximumStepDeg));
    fraction = (0:count - 1).' / count;
    segment{k} = boundary(k, :) + fraction .* delta;
    segment{k}(:, 2) = wrap180(segment{k}(:, 2));
end
denseLatLon = vertcat(segment{:});
denseLatLon(end + 1, :) = denseLatLon(1, :);
[x, y, z] = geodeticToEcefVector(denseLatLon(:, 1), ...
    denseLatLon(:, 2), target.AltitudeMeters);
denseFixed = [x y z];
end

function [azimuthDeg, elevationDeg, status] = projectBoundary( ...
        denseLatLon, denseFixed, sensorPosition, fixedToSensor)
a = 6378137.0;
b = 6356752.314245;
normal = [denseFixed(:, 1) / a^2, denseFixed(:, 2) / a^2, ...
    denseFixed(:, 3) / b^2];
n = size(sensorPosition, 1);
azimuthDeg = cell(n, 1);
elevationDeg = cell(n, 1);
status = strings(n, 1);

for k = 1:n
    sensorFixed = sensorPosition(k, :);
    visibility = sum(normal .* (sensorFixed - denseFixed), 2);
    visible = visibility >= 0;
    clipped = zeros(0, 3);

    for edge = 1:size(denseFixed, 1) - 1
        if visible(edge)
            if isempty(clipped) || any(isnan(clipped(end, :))) || ...
                    norm(clipped(end, :) - denseFixed(edge, :)) > 1e-6
                clipped(end + 1, :) = denseFixed(edge, :); %#ok<AGROW>
            end
        end
        if visible(edge) ~= visible(edge + 1)
            crossing = horizonCrossing(denseLatLon(edge, :), ...
                denseLatLon(edge + 1, :), sensorFixed, a, b);
            clipped(end + 1, :) = crossing; %#ok<AGROW>
            if visible(edge)
                clipped(end + 1, :) = NaN(1, 3); %#ok<AGROW>
            end
        end
    end
    if visible(end)
        clipped(end + 1, :) = denseFixed(end, :); %#ok<AGROW>
    end
    while ~isempty(clipped) && any(isnan(clipped(end, :)))
        clipped(end, :) = [];
    end

    if isempty(clipped)
        azimuthDeg{k} = zeros(0, 1);
        elevationDeg{k} = zeros(0, 1);
        status(k) = "below_horizon";
        continue;
    end

    finite = all(isfinite(clipped), 2);
    look = clipped(finite, :) - sensorFixed;
    look = normalizeRows(look);
    local = (fixedToSensor(:, :, k) * look.').';
    localAz = wrap180(atan2d(local(:, 2), local(:, 1)));
    localEl = atan2d(local(:, 3), hypot(local(:, 1), local(:, 2)));
    inFront = localEl >= 0 & localEl <= 90;

    currentAz = NaN(size(clipped, 1), 1);
    currentEl = NaN(size(clipped, 1), 1);
    finiteIndex = find(finite);
    currentAz(finiteIndex(inFront)) = localAz(inFront);
    currentEl(finiteIndex(inFront)) = localEl(inFront);
    adjacent = isfinite(currentAz(1:end - 1)) & isfinite(currentAz(2:end));
    breaks = find(adjacent & abs(diff(currentAz)) > 180) + 1;
    currentAz(breaks) = NaN;
    currentEl(breaks) = NaN;

    azimuthDeg{k} = currentAz;
    elevationDeg{k} = currentEl;
    if any(isfinite(currentAz))
        status(k) = "visible";
    else
        status(k) = "outside_sensor_front";
    end
end
end

function crossing = horizonCrossing(point1Deg, point2Deg, sensor, a, b)
delta = point2Deg - point1Deg;
delta(2) = wrap180(delta(2));
low = 0;
high = 1;
lowValue = tangentValue(point1Deg, sensor, a, b);
for iteration = 1:24
    middle = (low + high) / 2;
    trial = point1Deg + middle .* delta;
    trial(2) = wrap180(trial(2));
    middleValue = tangentValue(trial, sensor, a, b);
    if sign(middleValue) == sign(lowValue)
        low = middle;
        lowValue = middleValue;
    else
        high = middle;
    end
end
point = point1Deg + ((low + high) / 2) .* delta;
point(2) = wrap180(point(2));
[x, y, z] = geodeticToEcefVector(point(1), point(2), 0);
crossing = [x y z];
end

function value = tangentValue(pointDeg, sensor, a, b)
[x, y, z] = geodeticToEcefVector(pointDeg(1), pointDeg(2), 0);
point = [x y z];
normal = [x / a^2, y / a^2, z / b^2];
value = sum(normal .* (sensor - point));
end

function [azimuthDeg, elevationDeg] = directionAzEl(direction, fixedToSensor)
n = size(direction, 1);
azimuthDeg = nan(n, 1);
elevationDeg = nan(n, 1);
for k = 1:n
    local = fixedToSensor(:, :, k) * direction(k, :).';
    azimuthDeg(k) = wrap180(atan2d(local(2), local(1)));
    elevationDeg(k) = atan2d(local(3), hypot(local(1), local(2)));
end
end

function rows = normalizeRows(rows)
rows = rows ./ max(sqrt(sum(rows.^2, 2)), eps);
end

function angle = wrap180(angle)
angle = mod(angle + 180, 360) - 180;
end

function [x, y, z] = geodeticToEcefVector(latDeg, lonDeg, altitudeMeters)
% Vectorized WGS-84 equivalent of OrekitFrames.geodeticToECEF.
a = 6378137.0;
f = 1.0 / 298.257223563;
e2 = f * (2.0 - f);
lat = deg2rad(latDeg);
lon = deg2rad(lonDeg);
n = a ./ sqrt(1.0 - e2 .* sin(lat).^2);
x = (n + altitudeMeters) .* cos(lat) .* cos(lon);
y = (n + altitudeMeters) .* cos(lat) .* sin(lon);
z = (n .* (1.0 - e2) + altitudeMeters) .* sin(lat);
end
