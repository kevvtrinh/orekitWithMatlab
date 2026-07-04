function tests = testMissionScenario
tests = functiontests(localfunctions);
end

function testAddRemoveList(testCase)
cfg = ScenarioConfig("Duration", minutes(5), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
gs = GroundStationObject("Denver GS", 39.7392, -104.9903, 1609, 10);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);
objects = scenario.listObjects();
verifyEqual(testCase, height(objects), 2);
verifyTrue(testCase, scenario.hasObject("Sat-1"));

scenario = scenario.removeObject("Sat-1");
verifyFalse(testCase, scenario.hasObject("Sat-1"));
end

