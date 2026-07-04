function tests = testExports
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testExportContactPlan(testCase)
scenario = localScenario();
scenario = scenario.propagate();
accessResult = computeAccess(scenario, "Sat-1", "Denver GS");
outFile = fullfile(tempdir, "orekit_suite_contact_plan_test.csv");
if isfile(outFile)
    delete(outFile);
end
exportContactPlan(accessResult, outFile);
verifyTrue(testCase, isfile(outFile));
end

function scenario = localScenario()
cfg = ScenarioConfig("Duration", minutes(10), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
gs = GroundStationObject("Denver GS", 39.7392, -104.9903, 1609, 10);
scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);
end
