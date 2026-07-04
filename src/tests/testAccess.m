function tests = testAccess
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testAccessResultShape(testCase)
scenario = localScenario();
scenario = scenario.propagate();
accessResult = computeAccess(scenario, "Sat-1", "Denver GS");

requiredFields = ["SourceName", "TargetName", "AccessLogical", ...
    "AccessWindows", "Azimuth", "Elevation", "Range"];
for fieldName = requiredFields
    verifyTrue(testCase, isfield(accessResult, fieldName));
end

expectedColumns = ["Source", "Target", "StartTime", "StopTime", ...
    "DurationSeconds", "MaxElevationDeg", "MinRangeKm", "AccessType"];
verifyTrue(testCase, all(ismember(expectedColumns, ...
    accessResult.AccessWindows.Properties.VariableNames)));
end

function scenario = localScenario()
cfg = ScenarioConfig("Duration", minutes(30), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
gs = GroundStationObject("Denver GS", 39.7392, -104.9903, 1609, 10);
scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);
end
