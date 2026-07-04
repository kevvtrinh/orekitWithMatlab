function tests = testSensorFootprint
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testNadirConicFootprintRadius(testCase)
scenario = localScenario(20, 60);
time = scenario.Config.Epoch;
footprint = computeSensorFootprint(scenario, "Sat-1", "Cam", time);

% 20 deg half-angle at ~700 km: Earth central angle asin((r/Re)sin g)-g ~ 2.3 deg.
centralAngles = footprintCentralAnglesDeg(footprint);
verifyEqual(testCase, mean(centralAngles), 2.31, "AbsTol", 0.4);
verifyLessThan(testCase, max(centralAngles) - min(centralAngles), 0.2);
verifyFalse(testCase, footprint.HorizonLimited);
verifyEqual(testCase, footprint.Type, "FOV");
end

function testFieldOfRegardFootprintIsWider(testCase)
scenario = localScenario(20, 60);
time = scenario.Config.Epoch;
fov = computeSensorFootprint(scenario, "Sat-1", "Cam", time);
forFootprint = computeSensorFootprint(scenario, "Sat-1", "Cam", time, ...
    struct("UseFieldOfRegard", true));

verifyEqual(testCase, forFootprint.Type, "FOR");
verifyGreaterThan(testCase, mean(footprintCentralAnglesDeg(forFootprint)), ...
    mean(footprintCentralAnglesDeg(fov)));
end

function testWideConeClampsToHorizon(testCase)
scenario = localScenario(20, 89);
time = scenario.Config.Epoch;
footprint = computeSensorFootprint(scenario, "Sat-1", "Cam", time, ...
    struct("UseFieldOfRegard", true));

% At ~700 km the horizon cap spans ~25.7 deg of central angle.
verifyTrue(testCase, footprint.HorizonLimited);
verifyLessThanOrEqual(testCase, max(footprintCentralAnglesDeg(footprint)), 26.5);
verifyGreaterThan(testCase, max(footprintCentralAnglesDeg(footprint)), 24.0);
end

function angles = footprintCentralAnglesDeg(footprint)
subPoint = [cosd(footprint.SubLatitudeDeg) * cosd(footprint.SubLongitudeDeg), ...
    cosd(footprint.SubLatitudeDeg) * sind(footprint.SubLongitudeDeg), ...
    sind(footprint.SubLatitudeDeg)];
outline = footprint.EcefMeters ./ sqrt(sum(footprint.EcefMeters.^2, 2));
angles = acosd(max(min(outline * subPoint.', 1), -1));
end

function scenario = localScenario(coneHalfAngleDeg, fieldOfRegardDeg)
cfg = ScenarioConfig("Duration", minutes(10), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7078e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Cam", "Sat-1", coneHalfAngleDeg);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = fieldOfRegardDeg;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
end
