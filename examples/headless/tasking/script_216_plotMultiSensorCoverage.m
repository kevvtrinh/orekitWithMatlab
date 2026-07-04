%% Script 216: plot multi-sensor coverage timeline placeholder
script_217_demoSensorTaskingFullWorkflow;
areaSchedule = schedule(contains(schedule.TaskType, "Area"), :);
plotSensorTimeline(areaSchedule);
