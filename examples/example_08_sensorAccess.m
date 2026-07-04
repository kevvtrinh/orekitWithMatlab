%% Example 08: satellite sensor to place target access
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Sensor Demo";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(60);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);

sensor = SensorObject.simpleConic("NadirCam", "Sat-1", 20.0);
sensor.PointingMode = "Nadir";
sensor.MaxRangeKm = 2500;
sensor.
sat = sat.addSensor(sensor);

target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609.0);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(target);
scenario = scenario.propagate();

result = computeSensorAccess(scenario, "Sat-1", "NadirCam", "Denver Target");

disp(result.AccessWindows);

plotSensorAccessTimeline(result);
plotOffBoresightAngle(result);

% outFile = fullfile(tempdir, "sensor_access_report.csv");
% exportSensorAccessReport(result, outFile);
% fprintf("Wrote %s\n", outFile);
