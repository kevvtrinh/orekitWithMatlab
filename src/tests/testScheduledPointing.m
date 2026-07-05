function tests = testScheduledPointing
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testTaskPointingTracksTarget(testCase)
[scenario, window] = localScenario();
sat = scenario.getObject("Sat-1");
tMid = window(1) + minutes(5);
lla = sat.getLLA(tMid);
target = PlaceObject("T1", lla(1), wrapLon(lla(2) + 25), 0);
scenario = scenario.addObject(target);
scenario.SensorSchedule = localScheduleRow("TrackPointTarget", "T1", "", window);

pointing = resolveSensorPointing(scenario, "Sat-1", "Imager", tMid);
verifyEqual(testCase, pointing.Mode, "Task");
verifyEqual(testCase, pointing.TargetName, "T1");
expected = SensorObject.unitVector(target.getECEF() - sat.getECEF(tMid));
verifyGreaterThan(testCase, dot(pointing.BoresightEcef, expected), 0.9999);

idle = resolveSensorPointing(scenario, "Sat-1", "Imager", window(2) + minutes(5));
verifyEqual(testCase, idle.Mode, "Idle");
nadir = SensorObject.unitVector(-sat.getECEF(window(2) + minutes(5)));
verifyGreaterThan(testCase, dot(idle.BoresightEcef, nadir), 0.9999);
end

function testAreaScanAimSweepsTheArea(testCase)
[scenario, window] = localScenario();
area = AreaTargetObject("Area-1", [20 20 30 30], [-10 10 10 -10], 0);
scenario = scenario.addObject(area);
scenario.SensorSchedule = localScheduleRow("ScanAreaTarget", "", "Area-1", window);

early = resolveSensorPointing(scenario, "Sat-1", "Imager", ...
    window(1) + 0.25 * (window(2) - window(1)));
late = resolveSensorPointing(scenario, "Sat-1", "Imager", ...
    window(1) + 0.75 * (window(2) - window(1)));

verifyEqual(testCase, early.Mode, "Task");
% The aim point moves as the scan progresses...
verifyGreaterThan(testCase, norm(early.AimEcefMeters - late.AimEcefMeters), 50e3);
% ...and stays inside the area's latitude/longitude bounding box.
for pointing = [early, late]
    aim = pointing.AimEcefMeters;
    aimLat = asind(aim(3) / norm(aim));
    aimLon = atan2d(aim(2), aim(1));
    verifyGreaterThanOrEqual(testCase, aimLat, 20 - 0.5);
    verifyLessThanOrEqual(testCase, aimLat, 30 + 0.5);
    verifyGreaterThanOrEqual(testCase, aimLon, -10 - 0.5);
    verifyLessThanOrEqual(testCase, aimLon, 10 + 0.5);
end
end

function testFovFootprintFollowsTask(testCase)
[scenario, window] = localScenario();
sat = scenario.getObject("Sat-1");
tMid = window(1) + minutes(5);
lla = sat.getLLA(tMid);
target = PlaceObject("T1", lla(1), wrapLon(lla(2) + 20), 0);
scenario = scenario.addObject(target);
scenario.SensorSchedule = localScheduleRow("TrackPointTarget", "T1", "", window);

fov = computeSensorFootprint(scenario, "Sat-1", "Imager", tMid);
forFootprint = computeSensorFootprint(scenario, "Sat-1", "Imager", tMid, ...
    struct("UseFieldOfRegard", true));

% The tracked FOV footprint shifts toward the target; the FOR stays
% centered on the nominal (nadir) axis.
fovShift = angdiff(mean(fov.LongitudeDeg), fov.SubLongitudeDeg);
forShift = angdiff(mean(forFootprint.LongitudeDeg), forFootprint.SubLongitudeDeg);
verifyGreaterThan(testCase, abs(fovShift), 2);
verifyLessThan(testCase, abs(forShift), 1);
end

function schedule = localScheduleRow(taskType, targetName, areaName, window)
schedule = table(string(taskType), "Imager", "Sat-1", string(targetName), ...
    string(areaName), window(1), window(2), true, ...
    'VariableNames', {'TaskType', 'SensorName', 'PlatformName', 'TargetName', ...
    'AreaTargetName', 'StartTime', 'StopTime', 'Scheduled'});
end

function [scenario, window] = localScenario()
cfg = ScenarioConfig("Duration", hours(1), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", 20);
sensor.PointingMode = "Nadir";
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
window = [cfg.Epoch + minutes(10), cfg.Epoch + minutes(30)];
end

function lon = wrapLon(lon)
lon = mod(lon + 180, 360) - 180;
end

function delta = angdiff(a, b)
delta = mod(a - b + 180, 360) - 180;
end
