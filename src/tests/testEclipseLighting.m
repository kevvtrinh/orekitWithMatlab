function tests = testEclipseLighting
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testEclipseFieldsAndBounds(testCase)
scenario = localScenario();
eclipse = computeEclipse(scenario, "Sat-1");
verifyEqual(testCase, numel(eclipse.LightingState), ...
    numel(scenario.Config.getTimeVector()));
verifyGreaterThanOrEqual(testCase, eclipse.SunlitFractionPercent, 0);
verifyLessThanOrEqual(testCase, eclipse.SunlitFractionPercent, 100);
verifyTrue(testCase, all(eclipse.UmbraLogical <= eclipse.ShadowLogical));
verifyTrue(testCase, all(ismember(["Type", "StartTime", "StopTime"], ...
    eclipse.EclipseWindows.Properties.VariableNames)));
end

function testLeoSeesBothSunAndShadow(testCase)
scenario = localScenario();
eclipse = computeEclipse(scenario, "Sat-1");
% A 51.6 deg LEO over a full period is partly sunlit and partly shadowed.
verifyGreaterThan(testCase, eclipse.SunlitFractionPercent, 0);
verifyLessThan(testCase, eclipse.SunlitFractionPercent, 100);
end

function testBetaAngleWithinBounds(testCase)
scenario = localScenario();
betaTable = computeBetaAngle(scenario, "Sat-1");
verifyTrue(testCase, all(abs(betaTable.BetaAngleDeg) <= 90));
end

function testSunElevationAtGroundStation(testCase)
scenario = localScenario();
sunTable = computeSunElevation(scenario, "Denver GS");
verifyEqual(testCase, height(sunTable), numel(scenario.Config.getTimeVector()));
verifyTrue(testCase, all(abs(sunTable.SunElevationDeg) <= 90));
verifyTrue(testCase, islogical(sunTable.IsDaylight));
end

function scenario = localScenario()
cfg = ScenarioConfig("Duration", minutes(100), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 5));
scenario = scenario.propagate();
end
