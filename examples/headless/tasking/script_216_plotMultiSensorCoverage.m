%% Script 216: plot the scheduled area-scan tasks across all sensors
script_217_demoSensorTaskingFullWorkflow;
areaSchedule = schedule(contains(schedule.TaskType, "Area"), :);
if height(areaSchedule) == 0
    fprintf("No area-scan tasks were scheduled; timeline will be empty.\n");
end
plotSensorTimeline(areaSchedule);
