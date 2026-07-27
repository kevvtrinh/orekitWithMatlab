function tests = testAreaTargetAzElSweep
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testNadirAreaProjectsNearNinetyDegrees(testCase)
scenario = localScenario();
time = scenario.Config.Epoch;
data = computeAreaTargetAzElSweep(scenario, "Sat-1", "Cam", "Area", ...
    struct("TimeVector", time, "MaximumBoundaryStepDeg", 0.2));

verifyEqual(testCase, sort(string(fieldnames(data))), ...
    sort(["targetName"; "time_s"; "az_deg"; "el_deg"; "status"]));
verifyEqual(testCase, data.status, "visible");
verifyEqual(testCase, data.time_s, 0);
verifyGreaterThanOrEqual(testCase, ...
    sum(isfinite(data.az_deg{1})), 4);
end

function testCalculateAreaTargetAzElIsCanonicalProducer(testCase)
boundary = [-0.1 -0.1; -0.1 0.1; 0.1 0.1; 0.1 -0.1];
sensorFixed_km = [7078.137 0 0];
fixedToSensor = [0 1 0; 0 0 -1; -1 0 0];

data = calculateAreaTargetAzEl( ...
    "Area", boundary, 0, sensorFixed_km, fixedToSensor, 0.1);

verifyEqual(testCase, sort(string(fieldnames(data))), ...
    sort(["targetName"; "time_s"; "az_deg"; "el_deg"; "status"]));
verifyEqual(testCase, data.targetName, "Area");
verifyEqual(testCase, data.status, "visible");
verifyGreaterThan(testCase, max(data.el_deg{1}, [], "omitnan"), 85);
end

function scenario = localScenario()
cfg = ScenarioConfig("Epoch", ...
    datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", minutes(2), "TimeStep", seconds(10));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7078e3, 0, 0, 0, 0, 0);
sensor = SensorObject.simpleConic("Cam", "Sat-1", 5);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = 80;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
sat = scenario.getObject("Sat-1");
centerLat = sat.Ephemeris.LatitudeDeg(1);
centerLon = sat.Ephemeris.LongitudeDeg(1);
area = AreaTargetObject("Area", centerLat + [-0.2 -0.2 0.2 0.2], ...
    centerLon + [-0.2 0.2 0.2 -0.2], 0);
scenario = scenario.addObject(area);
end
