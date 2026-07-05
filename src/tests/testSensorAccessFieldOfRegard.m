function tests = testSensorAccessFieldOfRegard
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testTargetOutsideFovButInsideForHasAccess(testCase)
% STK-style sensor access is field-of-regard reachability: a nadir sensor
% with a narrow 5 deg beam passing ~28 deg off nadir from a target never
% holds it in the instantaneous FOV, but a slewable sensor with a 55 deg
% FOR can point at it, so access must exist by default.
scenario = localScenario(5, 55);
result = computeSensorAccess(scenario, "Sat-1", "Imager", "OffTrackTarget", ...
    struct("TimeStepSeconds", 10));

verifyEqual(testCase, result.FieldOfViewMode, "FOR");
verifyEqual(testCase, result.FovLimitDeg, 55);
verifyTrue(testCase, any(result.AccessLogical));
% Every access sample is outside the 5 deg beam: FOV containment alone
% would have rejected all of them.
verifyGreaterThan(testCase, min(result.OffBoresightAngleDeg(result.AccessLogical)), 5);
verifyLessThanOrEqual(testCase, ...
    max(result.OffBoresightAngleDeg(result.AccessLogical)), 55 + 1e-6);
end

function testFovModeStillRejectsTargetOutsideBeam(testCase)
% Opting out of FOR gating asks the instantaneous-beam question, and the
% 5 deg fixed beam never covers the off-track target.
scenario = localScenario(5, 55);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
result = computeSensorAccess(scenario, "Sat-1", "Imager", "OffTrackTarget", ...
    struct("UseFieldOfRegard", false, "TimeStepSeconds", 10));

verifyEqual(testCase, result.FieldOfViewMode, "FOV");
verifyEqual(testCase, result.FovLimitDeg, 5);
verifyFalse(testCase, any(result.AccessLogical));
end

function testTargetOutsideForHasNoAccess(testCase)
% The target sits ~28 deg off nadir at closest approach, beyond a 10 deg
% field of regard, so even a slewable sensor cannot reach it.
scenario = localScenario(5, 10);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
result = computeSensorAccess(scenario, "Sat-1", "Imager", "OffTrackTarget", ...
    struct("TimeStepSeconds", 10));

verifyEqual(testCase, result.FieldOfViewMode, "FOR");
verifyEqual(testCase, result.FovLimitDeg, 10);
verifyFalse(testCase, any(result.AccessLogical));
end

function scenario = localScenario(fovHalfAngleDeg, forHalfAngleDeg)
cfg = ScenarioConfig("Duration", hours(3), "TimeStep", seconds(600));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.0001, 0.01, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", fovHalfAngleDeg);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = forHalfAngleDeg;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
% Target ~3 deg off the equatorial ground track (~28 deg off nadir at
% closest approach): outside a 5 deg beam, inside a wide FOR.
scenario = scenario.addObject(PlaceObject("OffTrackTarget", 3.0, 0, 0));
scenario = scenario.propagate();
end
