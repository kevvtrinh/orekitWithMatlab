%% Example 01: create a headless scenario
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Demo Scenario";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", ...
    7000e3, 0.001, 51.6, 0, 0, 0);
gs = GroundStationObject("Denver GS", ...
    39.7392, -104.9903, 1609, 10);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);

disp(scenario.listObjects());
