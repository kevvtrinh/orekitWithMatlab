function tests = testTaskingFieldOfRegard
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testAccessOptionsDefaultToFieldOfRegard(testCase)
% The scheduler default must request FOR-gated, densely sampled access.
cfg = ScenarioConfig("Duration", hours(2), "TimeStep", seconds(600));
scenario = MissionScenario(cfg);
options = normalizeSchedulerOptions(SchedulerOptions());
accessOptions = taskAccessOptions(scenario, options);

verifyTrue(testCase, accessOptions.UseFieldOfRegard);
verifyEqual(testCase, accessOptions.TimeStepSeconds, 10);
end

function testAccessOptionsClampStepToScenario(testCase)
cfg = ScenarioConfig("Duration", minutes(30), "TimeStep", seconds(5));
scenario = MissionScenario(cfg);
options = normalizeSchedulerOptions(SchedulerOptions());
accessOptions = taskAccessOptions(scenario, options);
% Never sample coarser than the requested 10 s, but do not go finer than
% the scenario step either.
verifyEqual(testCase, accessOptions.TimeStepSeconds, 5);
end

function testPointTaskFindsForOpportunitiesWhenFovMisses(testCase)
% A nadir sensor with a narrow 5 deg FOV but a wide 55 deg FOR passing to
% one side of a target: the fixed beam never covers it, but a tasked
% (slewable) sensor can, so FOR-based tasking must find opportunities.
scenario = localScenario(5, 55);
task = SensorTask("TaskID", "T-Point", "TaskType", "TrackPointTarget", ...
    "TargetName", "OffTrackTarget", "Priority", 5, ...
    "RequiredDwellTimeSeconds", 5);

forOptions = SchedulerOptions("UseFieldOfRegardForTasking", true);
fovOptions = SchedulerOptions("UseFieldOfRegardForTasking", false);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));

forCandidates = computeSensorTaskOpportunities(scenario, task, forOptions);
fovCandidates = computeSensorTaskOpportunities(scenario, task, fovOptions);

feasibleFor = forCandidates(forCandidates.Feasible, :);
feasibleFov = fovCandidates(fovCandidates.Feasible, :);
verifyGreaterThan(testCase, height(feasibleFor), 0);
verifyGreaterThan(testCase, height(feasibleFor), height(feasibleFov));
end

function testForOpportunityRespectsFieldOfRegardLimit(testCase)
% Off-nadir angles reported for FOR opportunities must never exceed the
% sensor's field of regard (the gate that admitted them).
scenario = localScenario(5, 40);
task = SensorTask("TaskID", "T-Lim", "TaskType", "TrackPointTarget", ...
    "TargetName", "OffTrackTarget", "RequiredDwellTimeSeconds", 5);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
candidates = computeSensorTaskOpportunities(scenario, task, SchedulerOptions());
feasible = candidates(candidates.Feasible, :);

verifyGreaterThan(testCase, height(feasible), 0);
verifyLessThanOrEqual(testCase, max(feasible.MaxOffNadirDeg), 40 + 1e-6);
end

function testCoarseSchedulerStepStillFindsShortPasses(testCase)
% Even with a 600 s scenario step, dense access sampling inside tasking
% must recover the short overpasses.
scenario = localScenario(20, 55);
task = SensorTask("TaskID", "T-Coarse", "TaskType", "TrackPointTarget", ...
    "TargetName", "OffTrackTarget", "RequiredDwellTimeSeconds", 5);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));
candidates = computeSensorTaskOpportunities(scenario, task, SchedulerOptions());
verifyGreaterThan(testCase, height(candidates(candidates.Feasible, :)), 0);
end

function testAreaScanUsesFieldOfRegard(testCase)
scenario = localAreaScenario(10, 50);
task = SensorTask("TaskID", "T-Area", "TaskType", "ScanAreaTarget", ...
    "TargetName", "Region", "RequiredDwellTimeSeconds", 5);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));

forCandidates = computeSensorTaskOpportunities(scenario, task, ...
    SchedulerOptions("UseFieldOfRegardForTasking", true));
fovCandidates = computeSensorTaskOpportunities(scenario, task, ...
    SchedulerOptions("UseFieldOfRegardForTasking", false));

verifyGreaterThanOrEqual(testCase, ...
    sum(forCandidates.DurationSeconds), sum(fovCandidates.DurationSeconds));
verifyGreaterThan(testCase, height(forCandidates(forCandidates.Feasible, :)), 0);
end

function testGreedyScheduleFromForOpportunities(testCase)
% End to end: FOR opportunities feed the greedy scheduler and produce a
% non-empty schedule.
scenario = localScenario(5, 55);
task = SensorTask("TaskID", "T-Sched", "TaskType", "TrackPointTarget", ...
    "TargetName", "OffTrackTarget", "Priority", 9, ...
    "RequiredDwellTimeSeconds", 5);
warning("off", "computeSensorAccess:NoWindows");
cleaner = onCleanup(@() warning("on", "computeSensorAccess:NoWindows"));

candidates = computeSensorTaskOpportunities(scenario, task, SchedulerOptions());
schedule = scheduleSensorTasksGreedy(scenario, candidates, SchedulerOptions());
verifyGreaterThan(testCase, sum(schedule.Scheduled), 0);
end

function scenario = localScenario(fovHalfAngleDeg, forHalfAngleDeg)
cfg = ScenarioConfig("Duration", hours(3), "TimeStep", seconds(600));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.0001, 0.01, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", fovHalfAngleDeg);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = forHalfAngleDeg;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
% Target ~3 deg off the equatorial ground track: outside a 5 deg beam,
% inside a wide FOR.
scenario = scenario.addObject(PlaceObject("OffTrackTarget", 3.0, 0, 0));
scenario = scenario.propagate();
end

function scenario = localAreaScenario(fovHalfAngleDeg, forHalfAngleDeg)
cfg = ScenarioConfig("Duration", hours(3), "TimeStep", seconds(600));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.0001, 0.01, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", fovHalfAngleDeg);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = forHalfAngleDeg;
sensor.SwathWidthKm = 200;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
area = AreaTargetObject("Region", [2 2 4 4], [-1 1 1 -1], 0);
area.GridResolutionKm = 50;
scenario = scenario.addObject(area);
scenario = scenario.propagate();
end
