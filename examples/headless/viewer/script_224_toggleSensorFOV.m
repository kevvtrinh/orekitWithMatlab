%% Script 224: show FOV and hide FOR
script_227_satelliteSensorInspectionMode;
opts = SensorViewerOptions("ShowFOV", true, "ShowFOR", false);
plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
