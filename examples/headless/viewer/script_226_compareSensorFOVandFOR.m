%% Script 226: compare FOV and FOR
script_227_satelliteSensorInspectionMode;
opts = SensorViewerOptions("ShowFOV", true, "ShowFOR", true);
plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
