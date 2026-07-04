%% Script 229: show all sensors
script_227_satelliteSensorInspectionMode;
opts = SensorViewerOptions("ShowFOV", true, "ShowFOR", true);
plotSatelliteSensorViewer(scenario, "ViewerSat-1", opts);
