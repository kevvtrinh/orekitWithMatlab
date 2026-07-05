%% Script 221: mount one sensor on a satellite cube
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
scenario = MissionScenario(ScenarioConfig("Name", "One Mounted Sensor"));
sat = SatelliteObject.fromKeplerian("MountSat", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("NadirCam", "MountSat", 8);
sensor.MountFace = "-Z";
sensor.MountLocationBody = [0 0 -0.5];
sensor.MountNormalBody = [0 0 -1];
sensor.BoresightBody = [0 0 -1];
sensor.FORVisible = true;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
plotSatelliteSensorViewer(scenario, "MountSat", SensorViewerOptions("ShowFOR", true));
