%% Script 200: create a satellite simple-conic sensor
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite();

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("NadirCam", "Sat-1", 20);
sensor.PointingMode = "Nadir";
sensor.MaxRangeKm = 2500;
sat = sat.addSensor(sensor);

disp(sat.listSensors());
