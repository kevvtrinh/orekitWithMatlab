%% Script 217: full sensor tasking and scheduling workflow
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Sensor Tasking Full Workflow", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(24), ...
    "TimeStep", seconds(180), ...
    "AnimationStep", seconds(180));
scenario = MissionScenario(cfg);

sat1 = SatelliteObject.fromKeplerian("TaskSat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sat2 = SatelliteObject.fromKeplerian("TaskSat-2", 7050e3, 0.001, 51.6, 35, 0, 180);

sensor1 = SensorObject.simpleConic("WideCam-1", "TaskSat-1", 55);
sensor1.SensorType = "OpticalAgile";
sensor1.PointingMode = "Targeted";
sensor1.CurrentPointingTarget = "";
sensor1.FieldOfRegardDeg = 80;
sensor1.MaxSlewRateDegPerSec = 2.0;
sensor1.MaxSlewAccelDegPerSec2 = 0.5;
sensor1.SettlingTimeSeconds = 5;
sensor1.DataRateBps = 75e6;
sensor1.PowerWatts = 120;
sensor1.SwathWidthKm = 80;
sensor1.MountFace = "-Z";
sensor1.MountLocationBody = [0 0 -0.5];
sensor1.MountNormalBody = [0 0 -1];
sensor1.BoresightBody = [0 0 -1];
sensor1.FORVisible = true;

sensor2 = SensorObject.simpleConic("WideCam-2", "TaskSat-2", 55);
sensor2.SensorType = "OpticalAgile";
sensor2.PointingMode = "Targeted";
sensor2.CurrentPointingTarget = "";
sensor2.FieldOfRegardDeg = 80;
sensor2.MaxSlewRateDegPerSec = 2.0;
sensor2.MaxSlewAccelDegPerSec2 = 0.5;
sensor2.SettlingTimeSeconds = 5;
sensor2.DataRateBps = 75e6;
sensor2.PowerWatts = 120;
sensor2.SwathWidthKm = 80;
sensor2.MountFace = "+Y";
sensor2.MountLocationBody = [0 0.5 0];
sensor2.MountNormalBody = [0 1 0];
sensor2.BoresightBody = [0 1 0];
sensor2.FORVisible = true;

sat1 = sat1.addSensor(sensor1);
sat2 = sat2.addSensor(sensor2);

target = TargetObject("Denver Target", 39.7392, -104.9903, 1609);
target.Priority = 10;
target.RequiredDwellTimeSeconds = 60;

area = AreaTargetObject("Denver Metro Area", ...
    [39.25 39.25 40.10 40.10], [-105.45 -104.45 -104.45 -105.45], 1609);
area.GridResolutionKm = 35;
area.RequiredCoveragePercent = 30;
area.RequiredDwellPerGridPointSeconds = 20;
area.Priority = 7;
area.GridPoints = area.generateGrid();

scenario = scenario.addObject(sat1);
scenario = scenario.addObject(sat2);
scenario = scenario.addObject(target);
scenario = scenario.addObject(area);
scenario = scenario.propagate();

tasks = { ...
    SensorTask("TaskID", "T-POINT-1", "TaskName", "Image Denver A", ...
        "TaskType", "TrackPointTarget", "TargetName", "Denver Target", ...
        "Priority", 10, "RequiredDwellTimeSeconds", 180, ...
        "AllowedSensorNames", "WideCam-1"), ...
    SensorTask("TaskID", "T-POINT-2", "TaskName", "Image Denver B", ...
        "TaskType", "TrackPointTarget", "TargetName", "Denver Target", ...
        "Priority", 8, "RequiredDwellTimeSeconds", 180, ...
        "AllowedSensorNames", "WideCam-1"), ...
    SensorTask("TaskID", "T-AREA-1", "TaskName", "Scan Denver Metro", ...
        "TaskType", "ScanAreaTarget", "TargetName", "Denver Metro Area", ...
        "Priority", 7, "RequiredDwellTimeSeconds", 30, ...
        "RequiredCoveragePercent", 25, ...
        "AllowedSensorNames", ["WideCam-1"; "WideCam-2"]), ...
    SensorTask("TaskID", "T-MULTI-1", "TaskName", "Two-sensor Denver collect", ...
        "TaskType", "MultiSensorTrackPointTarget", "TargetName", "Denver Target", ...
        "Priority", 6, "RequiredDwellTimeSeconds", 120, ...
        "RequiresSimultaneousSensors", true, "RequiredSensorCount", 2, ...
        "AllowedSensorNames", ["WideCam-1"; "WideCam-2"]) ...
    };

options = SchedulerOptions("MinimumCandidateDurationSeconds", 60, ...
    "MinimumCoveragePercent", 20, ...
    "SimultaneousToleranceSeconds", 60);

candidates = generateTaskCandidates(scenario, tasks, options);
conflicts = detectTaskConflicts(candidates, options);
schedule = scheduleSensorTasksGreedy(scenario, candidates, options);
validation = validateSchedule(schedule, options);

outputFolder = fullfile(tempdir, "orekit_sensor_tasking_demo");
if ~isfolder(outputFolder)
    mkdir(outputFolder);
end
scheduleFile = exportSensorSchedule(schedule, fullfile(outputFolder, "sensor_schedule.csv"));
milpFiles = exportMILPInputs(candidates, conflicts, tasks, fullfile(outputFolder, "milp_inputs"));

fprintf("Generated %d candidate(s).\n", height(candidates));
fprintf("Detected %d conflict(s).\n", height(conflicts));
fprintf("Scheduled %d task(s). Schedule valid: %d\n", height(schedule), validation.IsValid);
fprintf("Schedule CSV: %s\n", scheduleFile);
fprintf("MILP candidates CSV: %s\n", milpFiles.Candidates);

disp(schedule(:, {'TaskID', 'TaskName', 'SensorName', 'StartTime', 'StopTime', 'QualityScore'}));
plotSensorTimeline(schedule);
