function tests = testOrekitFrameTransform
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testEcefToGcrfMatchesPropagatedEphemeris(testCase)
cfg = ScenarioConfig("Name", "Frame Transform Test", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", minutes(10), ...
    "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
sat = scenario.getObject("Sat-1");

idx = 4;
time = sat.Ephemeris.Time(idx);
ecef = [sat.Ephemeris.ECEF_X_m(idx), ...
    sat.Ephemeris.ECEF_Y_m(idx), sat.Ephemeris.ECEF_Z_m(idx)];
expectedGcrf = [sat.Ephemeris.X_m(idx), ...
    sat.Ephemeris.Y_m(idx), sat.Ephemeris.Z_m(idx)];

actualGcrf = OrekitFrameTransform.ecefToGcrf(time, ecef);
verifyEqual(testCase, actualGcrf, expectedGcrf, "AbsTol", 1e-6);

roundTripEcef = OrekitFrameTransform.gcrfToEcef(time, actualGcrf);
verifyEqual(testCase, roundTripEcef, ecef, "AbsTol", 1e-6);
end
