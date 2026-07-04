%% Script 206: compute ground sensor to satellite access
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Ground Sensor Access", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(4), ...
    "TimeStep", seconds(120));
scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
place = PlaceObject("Denver Site", 39.7392, -104.9903, 1609);
sensor = SensorObject.targeted("Tracker", "Denver Site", "Sat-1", 2);
place = place.addSensor(sensor);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(place);
scenario = scenario.propagate();

result = computeSensorAccess(scenario, "Denver Site", "Tracker", "Sat-1");
disp(result.AccessWindows);
