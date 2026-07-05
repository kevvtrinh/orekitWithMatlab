function pointing = resolveSensorPointing(scenario, parentName, sensorName, time)
%RESOLVESENSORPOINTING Where a sensor is actually aiming at an instant.
%
% Consults scenario.SensorSchedule: while a scheduled task window is active
% for this sensor, the sensor aims at the task target (point tasks) or at a
% serpentine scan point sweeping across the area target (area tasks), so
% animations show the beam tracking or scanning. Outside any task window it
% falls back to the sensor's own pointing mode.
%
% pointing fields:
%   Mode           "Task" | "Idle"
%   TaskType       schedule TaskType ("" when idle)
%   TargetName     aim target name ("" when idle)
%   BoresightEcef  1x3 unit vector, ECEF
%   AimEcefMeters  1x3 ground aim point, ECEF meters (NaN when idle)

arguments
    scenario MissionScenario
    parentName
    sensorName
    time
end

parent = scenario.getObject(parentName);
sensor = parent.getSensor(sensorName);
parentPosition = SensorObject.objectPositionECEF(parent, time);

pointing = struct("Mode", "Idle", "TaskType", "", "TargetName", "", ...
    "BoresightEcef", [NaN NaN NaN], "AimEcefMeters", [NaN NaN NaN]);

row = activeScheduleRow(scenario.SensorSchedule, parentName, sensorName, time);
if ~isempty(row)
    pointing.Mode = "Task";
    pointing.TaskType = string(row.TaskType);
    aim = taskAimPoint(scenario, row, time);
    if all(isfinite(aim))
        pointing.TargetName = taskAimTargetName(row);
        pointing.AimEcefMeters = aim;
        pointing.BoresightEcef = SensorObject.unitVector(aim - parentPosition);
        return;
    end
    pointing.Mode = "Idle"; % unresolvable task target: fall through
end

pointing.BoresightEcef = sensor.getBoresightVector(time, scenario);
end

function row = activeScheduleRow(schedule, parentName, sensorName, time)
row = [];
if isempty(schedule) || height(schedule) == 0
    return;
end
required = ["SensorName", "StartTime", "StopTime"];
if ~all(ismember(required, schedule.Properties.VariableNames))
    return;
end
mask = strcmp(string(schedule.SensorName), string(sensorName)) & ...
    time >= schedule.StartTime & time <= schedule.StopTime;
if ismember("PlatformName", schedule.Properties.VariableNames)
    mask = mask & strcmp(string(schedule.PlatformName), string(parentName));
end
if ismember("Scheduled", schedule.Properties.VariableNames)
    mask = mask & schedule.Scheduled;
end
idx = find(mask, 1);
if ~isempty(idx)
    row = schedule(idx, :);
end
end

function name = taskAimTargetName(row)
name = "";
if ismember("AreaTargetName", row.Properties.VariableNames) && ...
        strlength(string(row.AreaTargetName)) > 0
    name = string(row.AreaTargetName);
elseif ismember("TargetName", row.Properties.VariableNames)
    name = string(row.TargetName);
end
end

function aim = taskAimPoint(scenario, row, time)
aim = [NaN NaN NaN];
targetName = taskAimTargetName(row);
if strlength(targetName) == 0 || ~scenario.hasObject(targetName)
    return;
end
target = scenario.getObject(targetName);

if isa(target, "AreaTargetObject")
    aim = areaScanAimPoint(target, row, time);
else
    aim = SensorObject.objectPositionECEF(target, time);
end
end

function aim = areaScanAimPoint(area, row, time)
% Serpentine (boustrophedon) sweep over the area bounding box: latitude
% advances strip by strip while longitude sweeps back and forth, completing
% exactly one full scan over the task window.
latMin = min(area.BoundaryLatDeg);
latMax = max(area.BoundaryLatDeg);
lonMin = min(area.BoundaryLonDeg);
lonMax = max(area.BoundaryLonDeg);
if isempty(latMin) || ~isfinite(latMin)
    aim = [NaN NaN NaN];
    return;
end

windowSeconds = max(seconds(row.StopTime - row.StartTime), 1);
progress = min(max(seconds(time - row.StartTime) / windowSeconds, 0), 1);

numStrips = max(3, min(8, round((latMax - latMin) / 1.0)));
stripProgress = min(progress * numStrips, numStrips - eps);
strip = floor(stripProgress);
alongStrip = stripProgress - strip;

latDeg = latMin + (latMax - latMin) * (strip + 0.5) / numStrips;
if mod(strip, 2) == 0
    lonDeg = lonMin + (lonMax - lonMin) * alongStrip;
else
    lonDeg = lonMax - (lonMax - lonMin) * alongStrip;
end

[x, y, z] = OrekitFrames.geodeticToECEF(latDeg, lonDeg, area.AltitudeMeters);
aim = [x, y, z];
end
