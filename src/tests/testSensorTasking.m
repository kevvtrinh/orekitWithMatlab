function tests = testSensorTasking
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
end

function testSensorTaskAndSchedulerOptions(testCase)
task = SensorTask("TaskID", "T-1", "TaskName", "Collect A", ...
    "TaskType", "TrackPointTarget", "TargetName", "Target A", ...
    "Priority", 8, "RequiredDwellTimeSeconds", 60);
task.validate();
verifyEqual(testCase, task.TaskID, "T-1");
verifyEqual(testCase, task.TaskStatus, "Unscheduled");

options = SchedulerOptions("SchedulerType", "Greedy", ...
    "MinimumCandidateDurationSeconds", 30);
verifyEqual(testCase, options.SchedulerType, "Greedy");
verifyEqual(testCase, options.MinimumCandidateDurationSeconds, 30);
end

function testAreaTargetGrid(testCase)
area = AreaTargetObject("Area A", [39 39 40 40], [-105 -104 -104 -105], 0);
area.GridResolutionKm = 50;
gridPoints = area.generateGrid();
verifyGreaterThanOrEqual(testCase, height(gridPoints), 1);
verifyTrue(testCase, all(ismember(["GridPointID", "LatitudeDeg", "LongitudeDeg"], ...
    gridPoints.Properties.VariableNames)));
verifyGreaterThan(testCase, area.getAreaKm2(), 0);
end

function testConflictAndGreedySchedule(testCase)
tz = "UTC";
startA = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", tz);
stopA = startA + minutes(10);
startB = startA + minutes(5);
stopB = startA + minutes(15);
startC = startA + minutes(20);
stopC = startA + minutes(30);

candidateA = makeTaskCandidateRow(struct("CandidateID", "C-A", ...
    "TaskID", "T-A", "TaskName", "A", "TaskType", "TrackPointTarget", ...
    "SensorName", "Cam-1", "PlatformName", "Sat-1", "TargetName", "Target A", ...
    "StartTime", startA, "StopTime", stopA, "DurationSeconds", 600, ...
    "QualityScore", 0.8, "Priority", 10, "Feasible", true), tz);
candidateB = makeTaskCandidateRow(struct("CandidateID", "C-B", ...
    "TaskID", "T-B", "TaskName", "B", "TaskType", "TrackPointTarget", ...
    "SensorName", "Cam-1", "PlatformName", "Sat-1", "TargetName", "Target B", ...
    "StartTime", startB, "StopTime", stopB, "DurationSeconds", 600, ...
    "QualityScore", 0.7, "Priority", 9, "Feasible", true), tz);
candidateC = makeTaskCandidateRow(struct("CandidateID", "C-C", ...
    "TaskID", "T-C", "TaskName", "C", "TaskType", "TrackPointTarget", ...
    "SensorName", "Cam-1", "PlatformName", "Sat-1", "TargetName", "Target C", ...
    "StartTime", startC, "StopTime", stopC, "DurationSeconds", 600, ...
    "QualityScore", 0.6, "Priority", 8, "Feasible", true), tz);

candidates = [candidateA; candidateB; candidateC];
conflicts = detectTaskConflicts(candidates, SchedulerOptions());
verifyGreaterThanOrEqual(testCase, height(conflicts), 1);
verifyTrue(testCase, any(conflicts.ConflictType == "SameSensorOverlap"));

scenario = MissionScenario(ScenarioConfig("Name", "Schedule Unit Test"));
schedule = scheduleSensorTasksGreedy(scenario, candidates, SchedulerOptions());
verifyGreaterThanOrEqual(testCase, height(schedule), 2);
verifyFalse(testCase, any(schedule.CandidateID == "C-B"));
report = validateSchedule(schedule, SchedulerOptions());
verifyTrue(testCase, report.IsValid);
end
