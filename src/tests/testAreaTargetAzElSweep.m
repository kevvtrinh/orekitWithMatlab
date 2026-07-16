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

verifyEqual(testCase, data.Status, "visible");
verifyGreaterThan(testCase, data.CommandElevationDeg, 89.0);
verifyTrue(testCase, data.CommandInsidePositionLimits);
verifyGreaterThanOrEqual(testCase, ...
    sum(isfinite(data.AzimuthDeg{1})), 4);
end

function testMechanicalLimitStatus(testCase)
scenario = localScenario();
data = computeAreaTargetAzElSweep(scenario, "Sat-1", "Cam", "Area", ...
    struct("TimeVector", scenario.Config.Epoch, ...
    "ElevationLimitsDeg", [0 80]));
verifyFalse(testCase, data.CommandInsidePositionLimits);
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
