function info = exportStkSensorPointing(scenario, parentName, sensorName, filename, options)
%EXPORTSTKSENSORPOINTING Write absolute ECEF sensor pointing to an STK *.sp.
%
% Scheduled task boundaries are inserted into the sample grid. Explicit
% Fixed axes make the pointing independent of a synthesized parent attitude.

arguments
    scenario MissionScenario
    parentName
    sensorName
    filename
    options.Version (1, 1) string = "12.0"
end

parent = scenario.getObject(parentName);
if ~isprop(parent, "Sensors") || ~parent.hasSensor(sensorName)
    error("exportStkSensorPointing:SensorNotFound", ...
        "Sensor '%s' was not found on '%s'.", string(sensorName), string(parentName));
end
sensor = parent.getSensor(sensorName);
timeVector = pointingTimes(scenario, parent, sensor);
if numel(timeVector) < 2
    error("exportStkSensorPointing:InsufficientTimes", ...
        "At least two unique pointing times are required.");
end

epoch = scenario.Config.Epoch;
epoch.TimeZone = "UTC";
offsetSeconds = seconds(timeVector - epoch);
quaternions = zeros(numel(timeVector), 4);
previousYAxis = [NaN NaN NaN];

for k = 1:numel(timeVector)
    pointing = resolveSensorPointing(scenario, parentName, sensorName, timeVector(k));
    zAxis = unitRow(pointing.BoresightEcef);
    [rotation, previousYAxis] = pointingRotation(zAxis, sensor.UpVector, previousYAxis);
    quaternions(k, :) = rotationMatrixToStkQuaternion(rotation);
    if k > 1 && dot(quaternions(k, :), quaternions(k - 1, :)) < 0
        quaternions(k, :) = -quaternions(k, :);
    end
end

fid = fopen(filename, "w");
if fid < 0
    error("exportStkSensorPointing:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>

fprintf(fid, "stk.v.%s\n", options.Version);
fprintf(fid, "# Absolute sensor orientation; sensor body +Z is the boresight\n");
fprintf(fid, "BEGIN Attitude\n");
fprintf(fid, "NumberOfAttitudePoints %d\n", numel(timeVector));
fprintf(fid, "ScenarioEpoch %s\n", formatStkUtc(epoch));
fprintf(fid, "TimeFormat EpSec\n");
fprintf(fid, "InterpolationOrder 1\n");
fprintf(fid, "AttitudeDeviations Rapid\n");
fprintf(fid, "CentralBody %s\n", string(scenario.Config.CentralBody));
fprintf(fid, "CoordinateAxes Fixed\n");
fprintf(fid, "AttitudeTimeQuaternions\n");
for k = 1:numel(timeVector)
    fprintf(fid, "%.9f %.16g %.16g %.16g %.16g\n", ...
        offsetSeconds(k), quaternions(k, 1), quaternions(k, 2), ...
        quaternions(k, 3), quaternions(k, 4));
end
fprintf(fid, "END Attitude\n");

info = struct("Filename", string(filename), "PointCount", numel(timeVector), ...
    "StartTime", timeVector(1), "StopTime", timeVector(end), ...
    "CoordinateAxes", "Fixed", "ScheduleBoundariesIncluded", true);
end

function times = pointingTimes(scenario, parent, sensor)
if isa(parent, "SatelliteObject")
    if isempty(parent.Ephemeris)
        error("exportStkSensorPointing:UnpropagatedParent", ...
            "Satellite parent '%s' has not been propagated.", parent.Name);
    end
    times = parent.Ephemeris.Time;
else
    times = scenario.Config.getTimeVector();
end
times = times(:);

schedule = scenario.SensorSchedule;
if ~isempty(schedule) && height(schedule) > 0 && ...
        all(ismember(["SensorName", "StartTime", "StopTime"], ...
        schedule.Properties.VariableNames))
    mask = strcmp(string(schedule.SensorName), string(sensor.Name));
    if ismember("PlatformName", schedule.Properties.VariableNames)
        mask = mask & strcmp(string(schedule.PlatformName), string(parent.Name));
    end
    if ismember("Scheduled", schedule.Properties.VariableNames)
        mask = mask & schedule.Scheduled;
    end
    boundaries = [schedule.StartTime(mask); schedule.StopTime(mask)];
    boundaries = boundaries(~isnat(boundaries));
    times = [times; boundaries(:)]; %#ok<AGROW>
end

startTime = scenario.Config.Epoch;
stopTime = scenario.Config.getStopTime();
times = times(times >= startTime & times <= stopTime & ~isnat(times));
times = unique(sort(times));
end

function [rotation, yAxis] = pointingRotation(zAxis, preferredY, previousY)
candidate = reshape(double(preferredY), 1, 3);
candidate = candidate - dot(candidate, zAxis) * zAxis;
if norm(candidate) < 1e-10 && all(isfinite(previousY))
    candidate = previousY - dot(previousY, zAxis) * zAxis;
end
if norm(candidate) < 1e-10
    candidate = perpendicularTo(zAxis);
end
yAxis = unitRow(candidate);
xAxis = unitRow(cross(yAxis, zAxis));
yAxis = unitRow(cross(zAxis, xAxis));
rotation = [xAxis; yAxis; zAxis];
end

function value = unitRow(value)
value = reshape(double(value), 1, 3);
magnitude = norm(value);
if ~isfinite(magnitude) || magnitude < eps
    error("exportStkSensorPointing:InvalidBoresight", ...
        "Sensor pointing produced an invalid direction.");
end
value = value / magnitude;
end

function value = perpendicularTo(axis)
[~, index] = min(abs(axis));
seed = zeros(1, 3);
seed(index) = 1;
value = unitRow(cross(seed, axis));
end
