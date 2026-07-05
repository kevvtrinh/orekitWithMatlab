function tests = testSensorAccessSampling
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testDenseSamplingFindsShortPasses(testCase)
% Equatorial orbit over an equatorial target: a ~1 min pass every orbit.
% With a 600 s scenario step most passes fall between samples; the dense
% grid must recover them.
scenario = localScenario(seconds(600));
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
coarse = computeSensorAccess(scenario, "Sat-1", "Imager", "EqTarget");
dense = computeSensorAccess(scenario, "Sat-1", "Imager", "EqTarget", ...
    struct("TimeStepSeconds", 10));

verifyGreaterThan(testCase, height(dense.AccessWindows), 3);
verifyGreaterThan(testCase, max(dense.AccessWindows.DurationSeconds), 30);
verifyGreaterThanOrEqual(testCase, ...
    sum(dense.AccessLogical) * 10, sum(coarse.AccessLogical) * 600 * 0.5);
end

function testDenseGridMatchesFineScenarioGrid(testCase)
% Access sampled densely on a coarse ephemeris must agree with access
% computed on a natively fine scenario grid (validates the ECEF
% interpolation used between ephemeris samples).
coarseScenario = localScenario(seconds(600));
fineScenario = localScenario(seconds(10));
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
interpolated = computeSensorAccess(coarseScenario, "Sat-1", "Imager", ...
    "EqTarget", struct("TimeStepSeconds", 10));
native = computeSensorAccess(fineScenario, "Sat-1", "Imager", "EqTarget");

verifyEqual(testCase, height(interpolated.AccessWindows), ...
    height(native.AccessWindows), "AbsTol", 1);
verifyEqual(testCase, sum(interpolated.AccessLogical), ...
    sum(native.AccessLogical), "RelTol", 0.2);
end

function testInterpolationStaysOnOrbitArc(testCase)
scenario = localScenario(seconds(600));
sat = scenario.getObject("Sat-1");
midTimes = sat.Ephemeris.Time(1:end-1) + seconds(300);
positions = sat.getECEFMatrix(midTimes);
radii = sqrt(sum(positions.^2, 2));
% Circular orbit: interpolated radius must stay at the orbit radius, not
% dip toward the chord (a linear chord would lose ~370 km here).
verifyEqual(testCase, radii, repmat(7000e3, numel(midTimes), 1), "RelTol", 2e-3);
end

function testNoWindowsWarningFires(testCase)
scenario = localScenario(seconds(600));
sat = scenario.getObject("Sat-1");
sensor = SensorObject.fixedVector("NorthCam", "Sat-1", [0 0 1], 1);
sensor.PointingMode = "FixedVector";
sensor.FieldOfRegardDeg = 1; % non-slewable: FOR equals the fixed beam
sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);
verifyWarning(testCase, ...
    @() computeSensorAccess(scenario, "Sat-1", "NorthCam", "EqTarget"), ...
    "computeSensorAccess:NoWindows");
end

function scenario = localScenario(timeStep)
cfg = ScenarioConfig("Duration", hours(6), "TimeStep", timeStep);
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.0001, 0.01, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", 20);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = 20; % non-slewable: passes stay short (~1 min)
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
scenario = scenario.addObject(PlaceObject("EqTarget", 0, 0, 0));
scenario = scenario.propagate();
end
