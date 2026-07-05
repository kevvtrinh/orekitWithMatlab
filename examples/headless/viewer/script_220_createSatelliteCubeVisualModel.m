%% Script 220: create and plot a cube satellite visual model
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
scenario = MissionScenario(ScenarioConfig("Name", "Cube Visual Model"));
sat = SatelliteObject.fromKeplerian("CubeSat", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.BodyModelType = "Cube";
sat.BodyDimensionsMeters = [1 1 1];
scenario = scenario.addObject(sat);
plotSatelliteSensorViewer(scenario, "CubeSat", SensorViewerOptions("ShowSensorMounts", false));
