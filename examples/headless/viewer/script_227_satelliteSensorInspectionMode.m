%% Script 227: satellite sensor inspection mode
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);

cfg = ScenarioConfig("Name", "Sensor Viewer Demo", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(2), ...
    "TimeStep", seconds(60));
scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("ViewerSat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.BodyModelType = "Cube";
sat.BodyDimensionsMeters = [1.5 1.5 1.5];
sat.BodyColor = [0.70 0.76 0.82];

nadirCam = SensorObject.simpleConic("NadirCam", "ViewerSat-1", 8);
nadirCam.SensorType = "OpticalAgile";
nadirCam.FieldOfRegardDeg = 45;
nadirCam.MountFace = "-Z";
nadirCam.MountLocationBody = [0 0 -0.75];
nadirCam.MountNormalBody = [0 0 -1];
nadirCam.BoresightBody = [0 0 -1];
nadirCam.SensorSizeMeters = [0.18 0.18 0.14];
nadirCam.FORVisible = true;

sideScanner = SensorObject.simpleConic("SideScanner", "ViewerSat-1", 15);
sideScanner.SensorType = "WideAreaScanner";
sideScanner.FieldOfRegardDeg = 65;
sideScanner.MountFace = "+Y";
sideScanner.MountLocationBody = [0 0.75 0];
sideScanner.MountNormalBody = [0 1 0];
sideScanner.BoresightBody = [0 1 0];
sideScanner.SensorSizeMeters = [0.20 0.16 0.12];
sideScanner.FORVisible = true;
sideScanner.Color = [0.95 0.45 0.10];

sat = sat.addSensor(nadirCam);
sat = sat.addSensor(sideScanner);
scenario = scenario.addObject(sat);

opts = SensorViewerOptions();
opts.ShowSatelliteBody = true;
opts.ShowBodyFrame = true;
opts.ShowSensorMounts = true;
opts.ShowBoresight = true;
opts.ShowFOV = true;
opts.ShowFOR = true;
opts.ShowLabels = true;
opts.FOVScale = 1.4;
opts.FORScale = 2.3;
opts.BoresightLength = 1.1;

plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
