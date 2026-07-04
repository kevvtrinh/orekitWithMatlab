%% Script 230: show viewer for a scheduled task
script_217_demoSensorTaskingFullWorkflow;
if height(schedule) > 0
    opts = SensorViewerOptions("ShowFOV", true, "ShowFOR", true);
    plotScheduledSensorTask(scenario, schedule, schedule.TaskID(1), opts);
end
