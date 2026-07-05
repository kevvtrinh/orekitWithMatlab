%% Example 07: build and propagate a Walker constellation
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Walker Delta Demo", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(3), ...
    "TimeStep", seconds(120));
scenario = MissionScenario(cfg);

satellites = ConstellationFactory.walkerDelta("WD", 12, 3, 1, ...
    7000e3, 53.0, ...
    "Eccentricity", 0.001, ...
    "RAANOffsetDeg", 0, ...
    "TrueAnomalyOffsetDeg", 0);
scenario = ConstellationFactory.addToScenario(scenario, satellites);

scenario = scenario.addObject(GroundStationObject( ...
    "Colorado Springs", 38.8339, -104.8214, 1840, 5));
scenario = scenario.propagate();

objects = scenario.listObjects();
disp(objects);

accessResult = scenario.computeAccess("WD-P01-S01", "Colorado Springs");
disp(accessResult.AccessWindows);

plotOrbit3D(scenario, "WD-P01-S01");
