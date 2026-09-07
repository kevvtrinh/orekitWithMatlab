function tests = testManeuverStateHistory
% Event boundaries must not influence the preceding continuous trajectory.
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testGridAlignedBurnDoesNotAffectEarlierState(testCase)
[config, satellite, reference] = propagatedPair(600);
queryTime = config.Epoch + seconds(570);
actual = satellite.getState(queryTime);
expected = reference.getState(queryTime);
% The old interpolation introduced exactly 1500 m and 50 m/s here.
verifyEqual(testCase, actual, expected, "AbsTol", 1e-6);
verifyEqual(testCase, satellite.Ephemeris.Time, config.getTimeVector());
end

function testMixedQueryBatchPreservesBeforeBurnGeometry(testCase)
[config, satellite, reference] = propagatedPair(600);
station = GroundStationObject("GS", 39.7, -105, 0, 0);
times = config.Epoch + seconds([300; 330; 300]);
actual = computeAzElRange(satellite, station, times);
expected = computeAzElRange(reference, station, times);
verifyEqual(testCase, actual{:, 2:4}, expected{:, 2:4}, "AbsTol", 1e-9);
single = computeAzElRange(satellite, station, times(1));
verifyEqual(testCase, actual{1, 2:4}, single{1, 2:4}, "AbsTol", 1e-12);
verifyError(testCase, @() computeAzElRange(satellite, station, ...
    config.Epoch - seconds(1)), "OrekitAccessEngine:OutsideEphemeris");
end

function testExactEcefOnlyHistoryRemainsQueryable(testCase)
[config, satellite, ~] = propagatedPair(600);
station = GroundStationObject("GS", 39.7, -105, 0, 0);
query = config.Epoch + seconds(300);
expected = computeAzElRange(satellite, station, query);
satellite.Ephemeris = satellite.Ephemeris(:, ...
    ["Time", "ECEF_X_m", "ECEF_Y_m", "ECEF_Z_m"]);
satellite.EphemerisSegments = {};
satellite.OrekitPropagator = [];
actual = computeAzElRange(satellite, station, query);
verifyEqual(testCase, actual, expected);
verifyError(testCase, @() computeAzElRange(satellite, station, ...
    query + seconds(30)), "OrekitAccessEngine:MissingStateColumns");
end

function testOffGridMultipleBurnsRespectEachContinuousArc(testCase)
[config, satellite, reference] = propagatedPair(575);
firstBurnOnly = satellite;
secondTime = config.Epoch + seconds(650);
satellite = satellite.addManeuver( ...
    ImpulsiveManeuver("Second", secondTime, "Inertial", [-20 30 40]));
satellite = satellite.propagate(config.getTimeVector(), config);
verifyEqual(testCase, numel(satellite.EphemerisSegments), 3);
times = config.Epoch + seconds([550; 600; 675]);
propagators = {reference.OrekitPropagator, ...
    firstBurnOnly.OrekitPropagator, satellite.OrekitPropagator};
for timeIndex = 1:numel(times)
    exact = OrekitPropagatorFactory.propagate( ...
        propagators{timeIndex}, times(timeIndex));
    expected = exact{1, ["X_m", "Y_m", "Z_m", "VX_mps", "VY_mps", "VZ_mps"]};
    actual = satellite.getState(times(timeIndex));
    % A 60 s cubic Hermite approximation in this LEO has submeter error.
    verifyLessThan(testCase, norm(actual(1:3) - expected(1:3)), 1);
    verifyLessThan(testCase, norm(actual(4:6) - expected(4:6)), 0.05);
end
before = lastState(satellite.EphemerisSegments{2});
after = satellite.getState(secondTime);
verifyEqual(testCase, after(1:3), before(1:3), "AbsTol", 1e-6);
verifyEqual(testCase, after(4:6) - before(4:6), [-20 30 40], "AbsTol", 1e-8);
end

function testCoincidentAndEndpointBurnsUseFinalPostBurnState(testCase)
config = ScenarioConfig("Duration", minutes(10), "TimeStep", seconds(60));
satellite = newSatellite();
satellite = satellite.addManeuver( ...
    ImpulsiveManeuver("StartA", config.Epoch, "Inertial", [10 0 0]));
satellite = satellite.addManeuver( ...
    ImpulsiveManeuver("StartB", config.Epoch, "Inertial", [0 20 0]));
satellite = satellite.addManeuver(ImpulsiveManeuver( ...
    "Stop", config.getStopTime(), "Inertial", [0 0 30]));
satellite = satellite.propagate(config.getTimeVector(), config);
before = lastState(satellite.EphemerisSegments{1});
after = satellite.getState(config.Epoch);
verifyEqual(testCase, after(4:6) - before(4:6), [10 20 0], "AbsTol", 1e-8);
before = lastState(satellite.EphemerisSegments{3});
after = satellite.getState(config.getStopTime());
verifyEqual(testCase, after(4:6) - before(4:6), [0 0 30], "AbsTol", 1e-8);
verifyEqual(testCase, satellite.Ephemeris.Time, config.getTimeVector());
end

function testNativeSaveReloadRetainsNumericManeuverHistory(testCase)
[config, satellite, ~] = propagatedPair(575);
scenario = MissionScenario(config);
scenario = scenario.addObject(satellite);
filename = string(tempname) + ".mat";
cleanup = onCleanup(@() delete(filename)); %#ok<NASGU>
saveScenario(scenario, filename, "ExportStkBundle", false);
loadedScenario = loadScenario(filename);
loaded = loadedScenario.getObject(satellite.Name);
verifyEmpty(testCase, loaded.OrekitPropagator);
verifyEqual(testCase, loaded.EphemerisSegments, satellite.EphemerisSegments);
times = config.Epoch + seconds([550; 575; 590]);
for timeIndex = 1:numel(times)
    verifyEqual(testCase, loaded.getState(times(timeIndex)), ...
        satellite.getState(times(timeIndex)), "AbsTol", 1e-12);
end
station = GroundStationObject("GS", 39.7, -105, 0, 0);
expected = computeAzElRange(satellite, station, times);
actual = computeAzElRange(loaded, station, times);
verifyEqual(testCase, actual, expected);
end

function testLegacyHistoryCannotInterpolateThroughUnrecordedBurn(testCase)
[config, satellite, ~] = propagatedPair(600);
data = satellite.toStruct();
data = rmfield(data, "EphemerisSegments");
legacy = SatelliteObject.fromStruct(data);
verifyEqual(testCase, legacy.getState(config.Epoch + seconds(600)), ...
    satellite.getState(config.Epoch + seconds(600)), "AbsTol", 1e-12);
verifyError(testCase, @() legacy.getState(config.Epoch + seconds(570)), ...
    "SatelliteObject:MissingManeuverHistory");
end

function testImportedEphemerisRejectsUnappliedManeuvers(testCase)
[config, ~, reference] = propagatedPair(600);
satellite = SatelliteObject.fromEphemeris("Imported", reference.Ephemeris);
satellite = satellite.addManeuver(ImpulsiveManeuver( ...
    "Unapplied", config.Epoch + seconds(600), "Inertial", [1 0 0]));
verifyError(testCase, @() satellite.propagate(config.getTimeVector(), config), ...
    "SatelliteObject:EphemerisManeuversUnsupported");
end

function [config, satellite, reference] = propagatedPair(burnSeconds)
config = ScenarioConfig("Duration", minutes(20), "TimeStep", seconds(60));
reference = newSatellite();
satellite = reference.addManeuver(ImpulsiveManeuver( ...
    "Raise", config.Epoch + seconds(burnSeconds), "TNW", [200 0 0]));
reference = reference.propagate(config.getTimeVector(), config);
satellite = satellite.propagate(config.getTimeVector(), config);
end

function satellite = newSatellite()
satellite = SatelliteObject.fromKeplerian("Satellite", ...
    7000e3, 0.001, 51.6, 40, 20, 10);
end

function state = lastState(ephemeris)
state = ephemeris{end, ["X_m", "Y_m", "Z_m", "VX_mps", "VY_mps", "VZ_mps"]};
end
