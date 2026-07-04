%% Script 203: single sensor tracks one point target
script_217_demoSensorTaskingFullWorkflow;
oneTask = tasks(1);
oneCandidateSet = generateTaskCandidates(scenario, oneTask, options);
disp(oneCandidateSet);
