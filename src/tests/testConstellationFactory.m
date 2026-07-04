function tests = testConstellationFactory
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(genpath(fullfile(suiteRoot, "src")));
end

function testWalkerDeltaCreatesExpectedSlots(testCase)
sats = ConstellationFactory.walkerDelta("WD", 12, 3, 1, 7000e3, 53);

verifyEqual(testCase, numel(sats), 12);
verifyEqual(testCase, sats{1}.Name, "WD-P01-S01");
verifyEqual(testCase, sats{5}.Name, "WD-P02-S01");
verifyEqual(testCase, sats{9}.Name, "WD-P03-S01");

verifyEqual(testCase, sats{1}.RAANDeg, 0, "AbsTol", 1e-12);
verifyEqual(testCase, sats{5}.RAANDeg, 120, "AbsTol", 1e-12);
verifyEqual(testCase, sats{9}.RAANDeg, 240, "AbsTol", 1e-12);

verifyEqual(testCase, sats{1}.TrueAnomalyDeg, 0, "AbsTol", 1e-12);
verifyEqual(testCase, sats{2}.TrueAnomalyDeg, 90, "AbsTol", 1e-12);
verifyEqual(testCase, sats{5}.TrueAnomalyDeg, 30, "AbsTol", 1e-12);
end

function testWalkerStarUsesHalfRaanSpread(testCase)
sats = ConstellationFactory.walkerStar("WS", 8, 4, 1, 26560e3, 63.4);

verifyEqual(testCase, numel(sats), 8);
verifyEqual(testCase, sats{1}.RAANDeg, 0, "AbsTol", 1e-12);
verifyEqual(testCase, sats{3}.RAANDeg, 45, "AbsTol", 1e-12);
verifyEqual(testCase, sats{5}.RAANDeg, 90, "AbsTol", 1e-12);
verifyEqual(testCase, sats{7}.RAANDeg, 135, "AbsTol", 1e-12);
end

function testAddToScenario(testCase)
cfg = ScenarioConfig("Duration", minutes(5), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sats = ConstellationFactory.walkerDelta("Small", 4, 2, 1, 7000e3, 45);

scenario = ConstellationFactory.addToScenario(scenario, sats);

objects = scenario.listObjects();
verifyEqual(testCase, height(objects), 4);
verifyTrue(testCase, scenario.hasObject("Small-P02-S02"));
end

function testInvalidPlaneCount(testCase)
verifyError(testCase, @() ConstellationFactory.walkerDelta("Bad", 10, 3, 0, 7000e3, 45), ...
    "ConstellationFactory:InvalidPlaneCount");
end
