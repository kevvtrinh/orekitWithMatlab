%% Script 208: create sensor task list
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
tasks = {SensorTask("TaskID", "T-POINT", "TaskName", "Image Denver", ...
    "TaskType", "TrackPointTarget", "TargetName", "Denver Target", ...
    "Priority", 10, "RequiredDwellTimeSeconds", 120)};
disp(taskToTable(tasks));
