%% Script 228: show one selected sensor
script_227_satelliteSensorInspectionMode;
opts = SensorViewerOptions("SelectedSensorName", "NadirCam", "ShowFOV", true, "ShowFOR", true);
plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
