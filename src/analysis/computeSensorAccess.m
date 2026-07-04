function sensorAccessResult = computeSensorAccess(scenario, parentObjectName, sensorName, targetObjectName, options)
%COMPUTESENSORACCESS Compute access from an attached sensor to a target.

if nargin < 5
    options = struct();
end

parent = scenario.getObject(parentObjectName);
target = scenario.getObject(targetObjectName);
sensor = getAttachedSensor(parent, sensorName);
timeVector = scenario.Config.getTimeVector();

n = numel(timeVector);
rangeKm = nan(n, 1);
azimuthDeg = nan(n, 1);
elevationDeg = nan(n, 1);
offBoresightAngleDeg = nan(n, 1);
lookAngleDeg = nan(n, 1);
incidenceAngleDeg = nan(n, 1);
lineOfSightOK = false(n, 1);
earthObstructionOK = false(n, 1);
fieldOfViewOK = false(n, 1);
rangeOK = false(n, 1);
elevationOK = false(n, 1);
availabilityOK = false(n, 1);
slewOK = true(n, 1);

for k = 1:n
    time = timeVector(k);
    parentPosition = SensorObject.objectPositionECEF(parent, time);
    targetPosition = SensorObject.objectPositionECEF(target, time);
    lookVectorMeters = targetPosition - parentPosition;
    rangeKm(k) = norm(lookVectorMeters) / 1000.0;
    lookUnit = SensorObject.unitVector(lookVectorMeters);
    boresight = sensor.getBoresightVector(time, scenario, targetObjectName);
    offBoresightAngleDeg(k) = SensorObject.vectorAngleDeg(boresight, lookUnit);
    lookAngleDeg(k) = offBoresightAngleDeg(k);
    fieldOfViewOK(k) = sensor.isInsideFieldOfView(lookUnit, boresight);
    rangeOK(k) = rangeKm(k) >= sensor.MinRangeKm && rangeKm(k) <= sensor.MaxRangeKm;
    availabilityOK(k) = isWithinAvailability(sensor, time);

    [azimuthDeg(k), elevationDeg(k), lineOfSightOK(k)] = ...
        lineOfSightStatus(parent, target, parentPosition, targetPosition);
    earthObstructionOK(k) = lineOfSightOK(k);
    elevationOK(k) = elevationDeg(k) >= sensor.MinElevationDeg;
    incidenceAngleDeg(k) = 90.0 - elevationDeg(k);
end

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

function [azDeg, elDeg, losOK] = lineOfSightStatus(parent, target, parentPosition, targetPosition)
if isFixedObject(parent)
    [azDeg, elDeg] = azElFromFixedObject(parent, targetPosition - parentPosition);
    losOK = elDeg >= 0;
elseif isFixedObject(target)
    [azDeg, elDeg] = azElFromFixedObject(target, parentPosition - targetPosition);
    losOK = elDeg >= 0;
else
    earthRadiusMeters = 6378137.0;
    losOK = distanceFromOriginToSegment(parentPosition, targetPosition) > earthRadiusMeters;
    azDeg = NaN;
    elDeg = NaN;
end
end

function tf = isFixedObject(obj)
tf = isprop(obj, "LatitudeDeg") && isprop(obj, "LongitudeDeg");
end

function [azDeg, elDeg] = azElFromFixedObject(fixedObject, lookVector)
[latDeg, lonDeg] = SensorObject.objectLatLon(fixedObject);
east = [-sind(lonDeg), cosd(lonDeg), 0];
north = [-sind(latDeg) * cosd(lonDeg), ...
    -sind(latDeg) * sind(lonDeg), cosd(latDeg)];
up = [cosd(latDeg) * cosd(lonDeg), ...
    cosd(latDeg) * sind(lonDeg), sind(latDeg)];
lookUnit = SensorObject.unitVector(lookVector);
eastComponent = dot(lookUnit, east);
northComponent = dot(lookUnit, north);
upComponent = dot(lookUnit, up);
azDeg = mod(atan2d(eastComponent, northComponent), 360.0);
elDeg = asind(min(1.0, max(-1.0, upComponent)));
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

function tf = isWithinAvailability(sensor, time)
windows = sensor.AvailabilityWindows;
if isempty(windows) || height(windows) == 0
    tf = true;
    return;
end
if ~all(ismember(["StartTime", "StopTime"], windows.Properties.VariableNames))
    tf = true;
    return;
end
tf = any(time >= windows.StartTime & time <= windows.StopTime);
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
end
