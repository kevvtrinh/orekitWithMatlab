%% Script 219: complete sensor access demo
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Sensor Full Demo", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(4), ...
    "TimeStep", seconds(120));
scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);

sensor = SensorObject.targeted("TargetCam", "Sat-1", "Denver Target", 5);
sensor.MaxRangeKm = Inf;
sat = sat.addSensor(sensor);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(target);
scenario = scenario.propagate();

result = computeSensorAccess(scenario, "Sat-1", "TargetCam", "Denver Target");
disp(result.AccessWindows);

plotSensorAccessTimeline(result);
plotOffBoresightAngle(result);

outFile = fullfile(tempdir, "sensor_full_demo_report.csv");
exportSensorAccessReport(result, outFile);
fprintf("Wrote %s\n", outFile);
