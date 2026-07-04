function sensorAccessResult = computeSensorAccess(scenario, parentObjectName, sensorName, targetObjectName, options)
%COMPUTESENSORACCESS Compute access from an attached sensor to a target.
%
% Options:
%   TimeStepSeconds  Sample the access geometry at this step instead of the
%                    scenario TimeStep. Sensor passes are short (a 20 deg
%                    half-angle LEO sensor sees a ground point for roughly a
%                    minute per overpass), so a coarse scenario step can
%                    miss every pass entirely. Satellite positions are
%                    interpolated between ephemeris samples, so this can be
%                    much finer than the propagation grid.
%
% Geometry notes: all positions are ECEF meters; satellite positions are
% linearly interpolated between ephemeris samples. Elevation is measured at
% the fixed (ground) end of the link.

if nargin < 5
    options = struct();
end

parent = scenario.getObject(parentObjectName);
target = scenario.getObject(targetObjectName);
sensor = getAttachedSensor(parent, sensorName);
timeVector = accessTimeVector(scenario, options);

n = numel(timeVector);
parentPositions = objectPositionsECEF(parent, timeVector);
targetPositions = objectPositionsECEF(target, timeVector);
boresights = sensorBoresights(sensor, parent, scenario, targetObjectName, ...
    timeVector, parentPositions, targetPositions);

lookVectors = targetPositions - parentPositions;
rangeMeters = sqrt(sum(lookVectors.^2, 2));
rangeKm = rangeMeters / 1000.0;
lookUnits = lookVectors ./ max(rangeMeters, eps);

offBoresightAngleDeg = acosd(max(min(sum(boresights .* lookUnits, 2), 1), -1));
lookAngleDeg = offBoresightAngleDeg;

fieldOfViewOK = fieldOfViewStatus(sensor, lookUnits, boresights, offBoresightAngleDeg);
rangeOK = rangeKm >= sensor.MinRangeKm & rangeKm <= sensor.MaxRangeKm;
availabilityOK = availabilityStatus(sensor, timeVector);
slewOK = true(n, 1);

[azimuthDeg, elevationDeg, lineOfSightOK] = lineOfSightStatus(parent, target, ...
    parentPositions, targetPositions);
earthObstructionOK = lineOfSightOK;
elevationOK = elevationDeg >= sensor.MinElevationDeg | isnan(elevationDeg);
incidenceAngleDeg = 90.0 - elevationDeg;

accessLogical = lineOfSightOK & earthObstructionOK & fieldOfViewOK & ...
    rangeOK & elevationOK & availabilityOK & slewOK;

constraintStatus = table(timeVector, lineOfSightOK, earthObstructionOK, ...
    fieldOfViewOK, rangeOK, elevationOK, availabilityOK, slewOK, accessLogical, ...
    'VariableNames', {'Time', 'LineOfSightOK', 'EarthObstructionOK', ...
    'FieldOfViewOK', 'RangeOK', 'ElevationOK', 'AvailabilityOK', ...
    'SlewOK', 'FinalAccess'});

sensorAccessResult = struct();
sensorAccessResult.SourceName = string(parent.Name);
sensorAccessResult.SensorName = string(sensor.Name);
sensorAccessResult.TargetName = string(target.Name);
sensorAccessResult.ParentName = string(parent.Name);
sensorAccessResult.ParentType = string(parent.ObjectType);
sensorAccessResult.TargetType = string(target.ObjectType);
sensorAccessResult.ScenarioEpoch = scenario.Config.Epoch;
sensorAccessResult.TimeVector = timeVector;
sensorAccessResult.AccessLogical = accessLogical;
sensorAccessResult.AccessWindows = buildSensorAccessWindows(timeVector, ...
    accessLogical, elevationDeg, rangeKm, offBoresightAngleDeg, ...
    parent.Name, sensor.Name, target.Name);
sensorAccessResult.RangeKm = rangeKm;
sensorAccessResult.AzimuthDeg = azimuthDeg;
sensorAccessResult.ElevationDeg = elevationDeg;
sensorAccessResult.OffBoresightAngleDeg = offBoresightAngleDeg;
sensorAccessResult.LookAngleDeg = lookAngleDeg;
sensorAccessResult.IncidenceAngleDeg = incidenceAngleDeg;
sensorAccessResult.ConstraintStatus = constraintStatus;
sensorAccessResult.AccessType = "Sensor";
sensorAccessResult.Metadata = enrichMetadata(options, scenario, sensor);

if any(accessLogical)
    sensorAccessResult.Duration = sum(sensorAccessResult.AccessWindows.DurationSeconds);
    sensorAccessResult.MaxElevation = max(elevationDeg(accessLogical), [], "omitnan");
    sensorAccessResult.MinRange = min(rangeKm(accessLogical), [], "omitnan");
    sensorAccessResult.MaxOffBoresight = max(offBoresightAngleDeg(accessLogical), [], "omitnan");
else
    sensorAccessResult.Duration = 0;
    sensorAccessResult.MaxElevation = NaN;
    sensorAccessResult.MinRange = NaN;
    sensorAccessResult.MaxOffBoresight = NaN;
    warnNoAccess(scenario, sensor, timeVector, offBoresightAngleDeg, rangeKm, ...
        lineOfSightOK, options);
end
end

function timeVector = accessTimeVector(scenario, options)
timeVector = scenario.Config.getTimeVector();
if isfield(options, "TimeStepSeconds") && ~isempty(options.TimeStepSeconds) && ...
        options.TimeStepSeconds > 0
    stopTime = scenario.Config.getStopTime();
    timeVector = (scenario.Config.Epoch:seconds(options.TimeStepSeconds):stopTime).';
    if timeVector(end) < stopTime
        timeVector(end + 1, 1) = stopTime;
    end
end
end

function positions = objectPositionsECEF(obj, timeVector)
n = numel(timeVector);
if isa(obj, "SatelliteObject")
    positions = obj.getECEFMatrix(timeVector);
elseif isa(obj, "TargetObject") && obj.isMoving()
    positions = zeros(n, 3);
    for k = 1:n
        positions(k, :) = SensorObject.objectPositionECEF(obj, timeVector(k));
    end
elseif isprop(obj, "LatitudeDeg") && isprop(obj, "LongitudeDeg")
    positions = repmat(SensorObject.objectPositionECEF(obj, timeVector(1)), n, 1);
else
    positions = zeros(n, 3);
    for k = 1:n
        positions(k, :) = SensorObject.objectPositionECEF(obj, timeVector(k));
    end
end
end

function boresights = sensorBoresights(sensor, parent, scenario, targetName, ...
        timeVector, parentPositions, targetPositions)
n = numel(timeVector);
isSatelliteParent = isa(parent, "SatelliteObject");

switch upper(string(sensor.PointingMode))
    case {"NADIR", "NADIRPOINTING"}
        if isSatelliteParent
            boresights = -parentPositions;
        else
            boresights = repmat(SensorObject.localEnuVectorToECEF(parent, [0 0 1]), n, 1);
        end

    case {"TARGETED", "TARGET"}
        pointingTarget = sensor.CurrentPointingTarget;
        if strlength(pointingTarget) == 0
            pointingTarget = string(targetName);
        end
        if strlength(pointingTarget) == 0
            error("SensorObject:MissingPointingTarget", ...
                "Targeted sensor '%s' requires a pointing target.", sensor.Name);
        end
        if strcmp(pointingTarget, string(targetName))
            boresights = targetPositions - parentPositions;
        else
            pointingPositions = objectPositionsECEF( ...
                scenario.getObject(pointingTarget), timeVector);
            boresights = pointingPositions - parentPositions;
        end

    case {"MOUNTED", "MOUNTEDBODY", "BODYMOUNTED", "BODYFIXED"}
        boresights = zeros(n, 3);
        for k = 1:n
            boresights(k, :) = SensorObject.bodyVectorToECEF( ...
                parent, timeVector(k), sensor.BoresightBody);
        end

    case "FIXEDVECTOR"
        if isSatelliteParent
            if strcmpi(sensor.BoresightFrame, "Body")
                boresights = zeros(n, 3);
                for k = 1:n
                    boresights(k, :) = SensorObject.bodyVectorToECEF( ...
                        parent, timeVector(k), sensor.BoresightBody);
                end
            else
                boresights = repmat(reshape(sensor.BoresightVector, 1, 3), n, 1);
            end
        else
            boresights = repmat(SensorObject.localEnuVectorToECEF(parent, ...
                sensor.BoresightVector), n, 1);
        end

    case "VELOCITYVECTOR"
        if isSatelliteParent
            % Earth-fixed velocity from the ECEF track (the inertial GCRF
            % velocity is the wrong frame for ECEF look geometry).
            timeSeconds = seconds(timeVector - timeVector(1));
            boresights = [gradient(parentPositions(:, 1), timeSeconds), ...
                gradient(parentPositions(:, 2), timeSeconds), ...
                gradient(parentPositions(:, 3), timeSeconds)];
        else
            boresights = repmat(SensorObject.localEnuVectorToECEF(parent, [0 0 1]), n, 1);
        end

    case {"SUNPOINTING", "SUN"}
        sunEcef = OrekitBodies.sunPositions(timeVector, "ECEF");
        boresights = [sunEcef.X_m, sunEcef.Y_m, sunEcef.Z_m] - parentPositions;

    otherwise
        boresights = zeros(n, 3);
        for k = 1:n
            boresights(k, :) = sensor.getBoresightVector(timeVector(k), scenario, targetName);
        end
end

boresights = boresights ./ max(sqrt(sum(boresights.^2, 2)), eps);
end

function fieldOfViewOK = fieldOfViewStatus(sensor, lookUnits, boresights, offBoresightAngleDeg)
n = size(lookUnits, 1);
switch upper(string(sensor.FieldOfViewType))
    case {"SIMPLECONIC", "CONIC", "CIRCULAR"}
        fieldOfViewOK = offBoresightAngleDeg <= sensor.effectiveConeHalfAngleDeg();
    case {"COMPLEXCONIC", "ANNULAR"}
        fieldOfViewOK = offBoresightAngleDeg >= sensor.InnerHalfAngleDeg & ...
            offBoresightAngleDeg <= sensor.OuterHalfAngleDeg;
    otherwise
        fieldOfViewOK = false(n, 1);
        for k = 1:n
            fieldOfViewOK(k) = sensor.isInsideFieldOfView(lookUnits(k, :), boresights(k, :));
        end
end
end

function availabilityOK = availabilityStatus(sensor, timeVector)
windows = sensor.AvailabilityWindows;
if isempty(windows) || height(windows) == 0 || ...
        ~all(ismember(["StartTime", "StopTime"], windows.Properties.VariableNames))
    availabilityOK = true(numel(timeVector), 1);
    return;
end
availabilityOK = false(numel(timeVector), 1);
for w = 1:height(windows)
    availabilityOK = availabilityOK | ...
        (timeVector >= windows.StartTime(w) & timeVector <= windows.StopTime(w));
end
end

function sensor = getAttachedSensor(parent, sensorName)
if ismethod(parent, "getSensor") && parent.hasSensor(sensorName)
    sensor = parent.getSensor(sensorName);
    return;
end
error("computeSensorAccess:SensorNotFound", ...
    "Sensor '%s' was not found on '%s'.", string(sensorName), parent.Name);
end

function [azDeg, elDeg, losOK] = lineOfSightStatus(parent, target, parentPositions, targetPositions)
if isFixedObject(parent)
    [azDeg, elDeg] = enuAzElRange(parent.LatitudeDeg, parent.LongitudeDeg, ...
        fixedAltitudeMeters(parent), targetPositions);
    losOK = elDeg >= 0;
elseif isFixedObject(target)
    [azDeg, elDeg] = enuAzElRange(target.LatitudeDeg, target.LongitudeDeg, ...
        fixedAltitudeMeters(target), parentPositions);
    losOK = elDeg >= 0;
else
    earthRadiusMeters = 6378137.0;
    n = size(parentPositions, 1);
    losOK = false(n, 1);
    for k = 1:n
        losOK(k) = distanceFromOriginToSegment(parentPositions(k, :), ...
            targetPositions(k, :)) > earthRadiusMeters;
    end
    azDeg = nan(n, 1);
    elDeg = nan(n, 1);
end
end

function altitudeMeters = fixedAltitudeMeters(obj)
altitudeMeters = 0;
if isprop(obj, "AltitudeMeters")
    altitudeMeters = obj.AltitudeMeters;
end
end

function tf = isFixedObject(obj)
tf = isprop(obj, "LatitudeDeg") && isprop(obj, "LongitudeDeg") && ...
    ~(isa(obj, "TargetObject") && obj.isMoving());
end

function distance = distanceFromOriginToSegment(p1, p2)
segment = p2 - p1;
if norm(segment) == 0
    distance = norm(p1);
    return;
end
t = -dot(p1, segment) / dot(segment, segment);
t = min(max(t, 0), 1);
closest = p1 + t * segment;
distance = norm(closest);
end

function warnNoAccess(scenario, sensor, timeVector, offBoresightAngleDeg, rangeKm, ...
        lineOfSightOK, options)
[minOff, idx] = min(offBoresightAngleDeg);
stepSeconds = seconds(scenario.Config.TimeStep);
usedDenseSampling = isfield(options, "TimeStepSeconds") && ...
    ~isempty(options.TimeStepSeconds) && options.TimeStepSeconds > 0;
message = sprintf(['No access windows: closest approach to the field of view was ' ...
    '%.1f deg off boresight (limit %.1f deg) at %s, range %.0f km, line of sight %s.'], ...
    minOff, sensor.effectiveConeHalfAngleDeg(), ...
    string(timeVector(idx)), rangeKm(idx), string(lineOfSightOK(idx)));
if ~usedDenseSampling && stepSeconds > 60
    message = sprintf(['%s The scenario time step is %.0f s while a typical LEO ' ...
        'sensor pass lasts about a minute, so passes may fall between samples; ' ...
        'retry with computeSensorAccess(..., struct("TimeStepSeconds", 10)).'], ...
        message, stepSeconds);
end
warning("computeSensorAccess:NoWindows", "%s", message);
end

function windows = buildSensorAccessWindows(timeVector, accessLogical, elevationDeg, ...
        rangeKm, offBoresightDeg, parentName, sensorName, targetName)
timeVector = timeVector(:);
accessLogical = accessLogical(:);

if isempty(timeVector) || ~any(accessLogical)
    windows = emptySensorAccessWindowTable();
    return;
end

changes = diff([false; accessLogical; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
n = numel(starts);

parent = strings(n, 1);
sensor = strings(n, 1);
target = strings(n, 1);
startTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
stopTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
durationSeconds = zeros(n, 1);
maxElevationDeg = nan(n, 1);
minRangeKm = nan(n, 1);
maxOffBoresightDeg = nan(n, 1);
accessType = strings(n, 1);

for k = 1:n
    idx = starts(k):stops(k);
    parent(k) = string(parentName);
    sensor(k) = string(sensorName);
    target(k) = string(targetName);
    startTime(k) = timeVector(starts(k));
    stopTime(k) = timeVector(stops(k));
    durationSeconds(k) = seconds(stopTime(k) - startTime(k));
    maxElevationDeg(k) = max(elevationDeg(idx), [], "omitnan");
    minRangeKm(k) = min(rangeKm(idx), [], "omitnan");
    maxOffBoresightDeg(k) = max(offBoresightDeg(idx), [], "omitnan");
    accessType(k) = "Sensor";
end

windows = table(parent, sensor, target, startTime, stopTime, ...
    durationSeconds, maxElevationDeg, minRangeKm, maxOffBoresightDeg, accessType, ...
    'VariableNames', {'Parent', 'Sensor', 'Target', 'StartTime', 'StopTime', ...
    'DurationSeconds', 'MaxElevationDeg', 'MinRangeKm', ...
    'MaxOffBoresightDeg', 'AccessType'});
end

function windows = emptySensorAccessWindowTable()
windows = table(strings(0, 1), strings(0, 1), strings(0, 1), ...
    NaT(0, 1, "TimeZone", "UTC"), NaT(0, 1, "TimeZone", "UTC"), ...
    zeros(0, 1), nan(0, 1), nan(0, 1), nan(0, 1), strings(0, 1), ...
    'VariableNames', {'Parent', 'Sensor', 'Target', 'StartTime', 'StopTime', ...
    'DurationSeconds', 'MaxElevationDeg', 'MinRangeKm', ...
    'MaxOffBoresightDeg', 'AccessType'});
end

function metadata = enrichMetadata(options, scenario, sensor)
metadata = options;
metadata.ScenarioName = scenario.Config.Name;
metadata.SensorType = sensor.SensorType;
metadata.PointingMode = sensor.PointingMode;
metadata.FieldOfViewType = sensor.FieldOfViewType;
metadata.ConeHalfAngleDeg = sensor.ConeHalfAngleDeg;
metadata.RectangularHalfAngleXDeg = sensor.RectangularHalfAngleXDeg;
metadata.RectangularHalfAngleYDeg = sensor.RectangularHalfAngleYDeg;
metadata.MountAzimuthDeg = sensor.MountAzimuthDeg;
metadata.MountElevationDeg = sensor.MountElevationDeg;
metadata.AzimuthRateLimitDegPerSec = sensor.AzimuthRateLimitDegPerSec;
metadata.ElevationRateLimitDegPerSec = sensor.ElevationRateLimitDegPerSec;
metadata.AzimuthAccelerationLimitDegPerSec2 = sensor.AzimuthAccelerationLimitDegPerSec2;
metadata.ElevationAccelerationLimitDegPerSec2 = sensor.ElevationAccelerationLimitDegPerSec2;
end
