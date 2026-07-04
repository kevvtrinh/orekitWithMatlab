function tests = testEphemerisInterop
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testOemRoundTrip(testCase)
scenario = localScenario(minutes(30), seconds(60));
oemFile = fullfile(tempdir, "suiteTest.oem");
exportOEM(scenario, "Sat-1", oemFile);

loaded = loadOEMFile(oemFile);
verifyEqual(testCase, string(loaded.Name), "Sat-1");
verifyEqual(testCase, loaded.OrbitDefinitionType, "Ephemeris");

original = scenario.getObject("Sat-1").Ephemeris;
verifyEqual(testCase, height(loaded.SourceEphemeris), height(original));
% Round trip through km-precision text stays within a meter.
verifyEqual(testCase, loaded.SourceEphemeris.X_m, original.X_m, "AbsTol", 1.0);
verifyEqual(testCase, loaded.SourceEphemeris.VX_mps, original.VX_mps, "AbsTol", 1e-3);
end

function testEphemerisSatellitePropagatesByResampling(testCase)
sourceScenario = localScenario(minutes(30), seconds(60));
oemFile = fullfile(tempdir, "suiteTest.oem");
exportOEM(sourceScenario, "Sat-1", oemFile);
loaded = loadOEMFile(oemFile, "Sat-OEM");

% Same span on a finer grid: resampling must reproduce the trajectory.
cfg = ScenarioConfig("Epoch", sourceScenario.Config.Epoch, ...
    "Duration", minutes(30), "TimeStep", seconds(30));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(loaded);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-Ref", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.propagate();

resampled = scenario.getObject("Sat-OEM").Ephemeris;
reference = scenario.getObject("Sat-Ref").Ephemeris;
positionError = sqrt((resampled.X_m - reference.X_m).^2 + ...
    (resampled.Y_m - reference.Y_m).^2 + (resampled.Z_m - reference.Z_m).^2);
verifyLessThan(testCase, max(positionError), 50);
end

function testDeckAccessMergesSatellites(testCase)
scenario = localScenario(hours(3), seconds(60));
sat2 = SatelliteObject.fromKeplerian("Sat-2", 7000e3, 0.001, 51.6, 180, 0, 0);
scenario = scenario.addObject(sat2);
scenario = scenario.propagate();

deck = computeDeckAccess(scenario, "Denver GS");
verifyEqual(testCase, sort(deck.SatelliteNames), ["Sat-1"; "Sat-2"]);
verifyEqual(testCase, height(deck.Summary), 2);
if height(deck.AccessWindows) > 1
    verifyTrue(testCase, issorted(deck.AccessWindows.StartTime));
end
end

function testInterpolatedStateBetweenSamples(testCase)
scenario = localScenario(minutes(30), seconds(60));
sat = scenario.getObject("Sat-1");
midTime = sat.Ephemeris.Time(1) + seconds(30);
state = sat.getState(midTime);
% Interpolated point stays near the orbit radius, far from both samples.
radius = norm(state(1:3));
verifyEqual(testCase, radius, 7000e3, "RelTol", 1e-3);
speed = norm(state(4:6));
verifyEqual(testCase, speed, sqrt(3.986004418e14 / 7000e3), "RelTol", 1e-3);
end

function testSunExclusionTightensAccess(testCase)
scenario = localScenario(hours(6), seconds(120));
open = computeAccess(scenario, "Sat-1", "Denver GS");
constrained = computeAccess(scenario, "Sat-1", "Denver GS", ...
    struct("SunExclusionAngleDeg", 170));
verifyLessThanOrEqual(testCase, constrained.Duration, open.Duration);
end

function scenario = localScenario(duration, timeStep)
cfg = ScenarioConfig("Duration", duration, "TimeStep", timeStep);
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 5));
scenario = scenario.propagate();
end
