%% Script 207: multi-satellite area scan
script_206_twoSensorsScanOneArea;
multiAreaSchedule = scheduleSensorTasksGreedy(scenario, multiAreaCandidates, options);
disp(multiAreaSchedule);
