function tests = testPropagation
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testPropagationProducesEphemeris(testCase)
scenario = localScenario();
scenario = scenario.propagate();
sat = scenario.getObject("Sat-1");
verifyFalse(testCase, isempty(sat.Ephemeris));
verifyTrue(testCase, all(ismember(["Time", "X_m", "Y_m", "Z_m", "LatitudeDeg"], ...
    sat.Ephemeris.Properties.VariableNames)));
end

function scenario = localScenario()
cfg = ScenarioConfig("Duration", minutes(10), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
scenario = scenario.addObject(sat);
end
