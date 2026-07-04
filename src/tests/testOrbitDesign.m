function tests = testOrbitDesign
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testSunSynchronousInclination(testCase)
% Textbook values: ~97.4 deg at 550 km, ~98.19 deg at 700 km.
verifyEqual(testCase, OrbitDesigner.sunSynchronousInclination(550e3), 97.6, "AbsTol", 0.4);
verifyEqual(testCase, OrbitDesigner.sunSynchronousInclination(700e3), 98.19, "AbsTol", 0.4);
verifyError(testCase, @() OrbitDesigner.sunSynchronousInclination(30000e3), ...
    "OrbitDesigner:NoSunSyncSolution");
end

function testSunSynchronousSatelliteBuilds(testCase)
epoch = datetime(2026, 3, 20, 12, 0, 0, "TimeZone", "UTC");
sat = OrbitDesigner.sunSynchronous("SSO-1", 700e3, 10.5, epoch);
sat.validate();
verifyEqual(testCase, sat.InclinationDeg, 98.19, "AbsTol", 0.4);
verifyEqual(testCase, sat.SemiMajorAxisMeters, 6378137 + 700e3, "AbsTol", 1);
end

function testGeostationaryPeriodAndAltitude(testCase)
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
sat = OrbitDesigner.geostationary("GEO-1", -75, epoch);
verifyEqual(testCase, sat.SemiMajorAxisMeters, 42164e3, "AbsTol", 5e3);

% Propagate a short arc: the sub-satellite longitude must stay put.
cfg = ScenarioConfig("Epoch", epoch, "Duration", hours(6), "TimeStep", seconds(300));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(sat);
scenario = scenario.propagate();
lon = scenario.getObject("GEO-1").Ephemeris.LongitudeDeg;
verifyEqual(testCase, max(lon) - min(lon), 0, "AbsTol", 1.5);
verifyEqual(testCase, mean(lon), -75, "AbsTol", 2.5);
end

function testMolniyaAndRepeatGroundTrack(testCase)
sat = OrbitDesigner.molniya("Molniya-1");
verifyEqual(testCase, sat.InclinationDeg, 63.4, "AbsTol", 1e-9);
verifyEqual(testCase, sat.SemiMajorAxisMeters, 26554e3, "AbsTol", 20e3);

% 15 revs/day repeat is a ~554 km orbit.
a = OrbitDesigner.repeatGroundTrackSma(15, 1);
verifyEqual(testCase, a - 6378137, 561e3, "AbsTol", 15e3);
end

function testCoverageOffNadirConeTightens(testCase)
cfg = ScenarioConfig("Duration", hours(2), "TimeStep", seconds(120));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.propagate();

grid = CoverageGrid.regionGrid(-60, 60, -180, 180, 20);
open = computeCoverage(scenario, grid, struct("MinElevationDeg", 5));
cone = computeCoverage(scenario, grid, ...
    struct("MinElevationDeg", 5, "MaxOffNadirDeg", 20));
verifyLessThanOrEqual(testCase, cone.Summary.AverageCoveragePercent, ...
    open.Summary.AverageCoveragePercent);
verifyTrue(testCase, all(cone.CoveredLogical(:) <= open.CoveredLogical(:)));
end
