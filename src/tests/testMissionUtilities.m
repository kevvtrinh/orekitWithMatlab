function tests = testMissionUtilities
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testHohmannLeoToGeo(testCase)
plan = ManeuverPlanner.hohmann(6678e3, 42164e3);
verifyEqual(testCase, plan.TotalDVmps, 3893, "AbsTol", 25);
verifyEqual(testCase, plan.TransferTimeSeconds, 18990, "AbsTol", 200);
verifyGreaterThan(testCase, plan.DV1mps, 0);
verifyGreaterThan(testCase, plan.DV2mps, 0);
end

function testHohmannManeuverPair(testCase)
startTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
maneuvers = ManeuverPlanner.hohmannManeuvers(startTime, 7000e3, 7500e3);
verifyEqual(testCase, numel(maneuvers), 2);
verifyGreaterThan(testCase, maneuvers{2}.Time, maneuvers{1}.Time);
verifyEqual(testCase, string(maneuvers{1}.Frame), "TNW");
end

function testPlaneChange(testCase)
% 60 deg plane change costs exactly the orbital speed.
speed = 7500;
verifyEqual(testCase, ManeuverPlanner.planeChange(speed, 60), speed, "RelTol", 1e-12);
end

function testLoadTLEFileThreeLineSets(testCase)
filename = localTleFile([ ...
    "ISS (ZARYA)"
    "1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9994"
    "2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.49560532    15"
    "0 NOAA 19"
    "1 33591U 09005A   24001.50000000  .00000123  00000-0  90084-4 0  9992"
    "2 33591  99.1000 100.0000 0014000  60.0000 300.0000 14.12501077    18"]);
sats = loadTLEFile(filename);
verifyEqual(testCase, numel(sats), 2);
verifyEqual(testCase, string(sats{1}.Name), "ISS (ZARYA)");
verifyEqual(testCase, string(sats{2}.Name), "NOAA 19");
verifyEqual(testCase, sats{1}.OrbitDefinitionType, "TLE");
end

function testLoadTLEFileBareSetsAndFilter(testCase)
filename = localTleFile([ ...
    "1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9994"
    "2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.49560532    15"]);
sats = loadTLEFile(filename);
verifyEqual(testCase, numel(sats), 1);
verifyEqual(testCase, string(sats{1}.Name), "SAT-25544");

filtered = loadTLEFile(filename, struct("NamePattern", "NOMATCH"));
verifyTrue(testCase, isempty(filtered));
end

function testLinkBudgetKnownFspl(testCase)
accessResult = localAccessResult(1000.0);
linkResult = computeLinkBudget(accessResult, struct("FrequencyHz", 2.2e9));
% FSPL at 1000 km / 2.2 GHz is about 159.3 dB.
verifyEqual(testCase, linkResult.Table.FSPLdB(1), 159.3, "AbsTol", 0.2);
verifyTrue(testCase, isfinite(linkResult.Summary.WorstMarginDb));
end

function testLinkBudgetMarginImprovesWithShorterRange(testCase)
nearResult = computeLinkBudget(localAccessResult(500.0), struct());
farResult = computeLinkBudget(localAccessResult(2000.0), struct());
verifyGreaterThan(testCase, nearResult.Summary.WorstMarginDb, ...
    farResult.Summary.WorstMarginDb);
end

function testAccessRangeConstraintTightensWindows(testCase)
scenario = localAccessScenario();
open = computeAccess(scenario, "Sat-1", "Denver GS");
constrained = computeAccess(scenario, "Sat-1", "Denver GS", ...
    struct("MaxRangeKm", 1000));
verifyLessThanOrEqual(testCase, constrained.Duration, open.Duration);
verifyTrue(testCase, all(constrained.AccessLogical <= open.AccessLogical));
end

function testAccessGroundLightingSplitsDayNight(testCase)
scenario = localAccessScenario();
sunlit = computeAccess(scenario, "Sat-1", "Denver GS", ...
    struct("GroundLighting", "Sunlit"));
dark = computeAccess(scenario, "Sat-1", "Denver GS", ...
    struct("GroundLighting", "Dark"));
open = computeAccess(scenario, "Sat-1", "Denver GS");
verifyEqual(testCase, sum(sunlit.AccessLogical) + sum(dark.AccessLogical), ...
    sum(open.AccessLogical));
end

function filename = localTleFile(lines)
filename = fullfile(tempdir, "suiteTestCatalog.tle");
writelines(lines, filename);
end

function accessResult = localAccessResult(rangeKm)
n = 5;
accessResult = struct();
accessResult.SourceName = "Sat-1";
accessResult.TargetName = "GS";
accessResult.TimeVector = (datetime(2026, 1, 1, "TimeZone", "UTC") + ...
    minutes(0:n - 1)).';
accessResult.AccessLogical = true(n, 1);
accessResult.Range = repmat(rangeKm, n, 1);
end

function scenario = localAccessScenario()
cfg = ScenarioConfig("Duration", hours(6), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 5));
scenario = scenario.propagate();
end
