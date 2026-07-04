%% Script 225: show FOR and hide FOV
script_227_satelliteSensorInspectionMode;
opts = SensorViewerOptions("ShowFOV", false, "ShowFOR", true);
plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
