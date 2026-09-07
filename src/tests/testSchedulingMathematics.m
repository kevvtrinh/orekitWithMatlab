function tests = testSchedulingMathematics
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
end

function testRestToRestSlewHasBothAccelerationRamps(testCase)
verifyEqual(testCase, computeSlewTime([0 1 9 36 90], 3, 1), ...
    [0 2 6 15 33], "AbsTol", 1e-12);
verifyEqual(testCase, computeSlewTime([0 4], Inf, 1), [0 4]);
verifyEqual(testCase, computeSlewTime([0 36], 3, Inf), [0 12]);
verifyEqual(testCase, computeSlewTime([0 36], Inf, Inf), [0 0]);
end

function testActualOppositePointingsNeedFortySeconds(testCase)
[scenario, epoch] = localScenario(1);
parent = scenario.getObject("P");
sensor = parent.Sensors{1};
sensor.SlewRateDegPerSec = 3;
parent.Sensors{1} = sensor;
scenario = scenario.updateObject(parent);
% Equatorial geodetic construction gives look directions exactly +/-60
% degrees from the local vertical, hence a 120 degree transition.
earthRadius_m = 6378137;
longitude_deg = 0.01;
altitude_m = earthRadius_m / ...
    (cosd(longitude_deg) - sind(longitude_deg) / tand(60)) - earthRadius_m;
scenario = scenario.addObject(PlaceObject("East", 0, longitude_deg, altitude_m));
scenario = scenario.addObject(PlaceObject("West", 0, -longitude_deg, altitude_m));
a = pointCandidate(scenario, "East", "P", "S1", epoch, epoch + seconds(10));
b = pointCandidate(scenario, "West", "P", "S1", epoch + seconds(40), epoch + seconds(50));
[conflict, kind, ~, required, available] = candidateRowsConflict(a, b);
verifyTrue(testCase, conflict);
verifyEqual(testCase, kind, "InsufficientSlewTime");
verifyEqual(testCase, required, 40, "AbsTol", 1e-8);
verifyEqual(testCase, available, 30);
b = pointCandidate(scenario, "West", "P", "S1", epoch + seconds(51), epoch + seconds(61));
verifyFalse(testCase, candidateRowsConflict(a, b));
end

function testMissingGeometryIsExplicitAndLegacyOverlapStillWorks(testCase)
[scenario, epoch] = localScenario(1);
a = pointCandidate(scenario, "T", "P", "S1", epoch, epoch + seconds(10));
b = pointCandidate(scenario, "T", "P", "S1", epoch + seconds(30), epoch + seconds(40));
a.SlewTransitionData = "";
b.SlewTransitionData = "";
[conflict, kind, ~, required] = candidateRowsConflict(a, b);
verifyTrue(testCase, conflict);
verifyEqual(testCase, kind, "UnknownSlewGeometry");
verifyTrue(testCase, isnan(required));
options = SchedulerOptions("EnforceSlew", false);
verifyFalse(testCase, candidateRowsConflict(a, b, options));
a.TaskID = "A";
b.TaskID = "B";
legacy = [a; b];
legacy.SlewTransitionData = [];
schedule = scheduleSensorTasksGreedy(scenario, legacy, options);
verifyEqual(testCase, height(schedule), 2);
end

function testDwellAndDurationCapsCannotProduceFeasibleShortCollections(testCase)
[scenario, ~] = localScenario(1);
parent = scenario.getObject("P");
sensor = parent.Sensors{1};
sensor.MaxDwellTimeSeconds = 10;
parent.Sensors{1} = sensor;
scenario = scenario.updateObject(parent);
task = SensorTask("TaskID", "D60", "TargetName", "T", ...
    "RequiredDwellTimeSeconds", 60);
verifyEmpty(testCase, computeSensorTaskOpportunities(scenario, task));
sensor.MaxDwellTimeSeconds = Inf;
parent.Sensors{1} = sensor;
scenario = scenario.updateObject(parent);
task.MaxDurationSeconds = 10;
verifyEmpty(testCase, computeSensorTaskOpportunities(scenario, task));
task.MaxDurationSeconds = 60;
candidates = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, candidates.DwellTimeSeconds, 60);
verifyEqual(testCase, candidates.DurationSeconds, 60);
verifyTrue(testCase, all(candidates.Feasible));
end

function testLegacyStructCharAndCsvCellstrMetadata(testCase)
[scenario, epoch] = localScenario(1);
a = pointCandidate(scenario, "T", "P", "S1", epoch, epoch + seconds(10));
b = pointCandidate(scenario, "T", "P", "S1", epoch + seconds(30), epoch + seconds(40));
first = table2struct(a);
second = table2struct(b);
first.SlewTransitionData = char(first.SlewTransitionData);
second.SlewTransitionData = char(second.SlewTransitionData);
verifyFalse(testCase, candidateRowsConflict(first, second));
a.SlewTransitionData = cellstr(a.SlewTransitionData);
b.SlewTransitionData = cellstr(b.SlewTransitionData);
verifyFalse(testCase, candidateRowsConflict(a, b));
first.SlewTransitionData = '';
second.SlewTransitionData = '';
first.SensorName = 'Camera';
second.SensorName = 'Camera';
first.PlatformName = 'Platform-One';
second.PlatformName = 'Platform-Two';
verifyFalse(testCase, candidateRowsConflict(first, second));
end

function testMultiSensorImageStripUsesAreaCandidates(testCase)
[scenario, ~] = localScenario(2);
area = AreaTargetObject("Region", [-0.001 -0.001 0.001 0.001], ...
    [-0.001 0.001 0.001 -0.001], 1000);
scenario = scenario.addObject(area);
task = SensorTask("TaskID", "Strip", "TaskType", "ImageStrip", ...
    "TargetName", "Region", "RequiredSensorCount", 2, ...
    "RequiresSimultaneousSensors", true);
candidates = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, height(candidates), 1);
verifyEqual(testCase, candidates.AreaTargetName, "Region");
resources = candidateSensorResources(candidates);
verifyFalse(testCase, any([resources.HasSlewGeometry]));
end

function testThreeDistinctSensorsAreActuallySelected(testCase)
[scenario, ~] = localScenario(3);
% RequiredSensorCount is honored even without a MultiSensor task type.
task = SensorTask("TaskID", "M3", "TargetName", "T", ...
    "RequiredSensorCount", 3, "RequiresSimultaneousSensors", true, ...
    "RequiredDwellTimeSeconds", 60);
candidates = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, height(candidates), 1);
resources = candidateSensorResources(candidates);
verifyEqual(testCase, numel(resources), 3);
verifyEqual(testCase, numel(unique(string({resources.Key}))), 3);
verifyEqual(testCase, candidates.RequiredSensorCount, 3);
end

function testCommonWindowMustContainRequiredDwell(testCase)
[scenario, epoch] = localScenario(2);
scenario = availability(scenario, "P", "S1", epoch, epoch + seconds(120));
scenario = availability(scenario, "P", "S2", epoch + seconds(80), epoch + seconds(200));
task = SensorTask("TaskID", "M2", "TargetName", "T", ...
    "RequiredSensorCount", 2, "RequiresSimultaneousSensors", true, ...
    "RequiredDwellTimeSeconds", 60);
verifyEmpty(testCase, computeSensorTaskOpportunities(scenario, task));
scenario = availability(scenario, "P", "S1", epoch, epoch + seconds(140));
candidates = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, height(candidates), 1);
verifyEqual(testCase, candidates.DurationSeconds, 60);
verifyEqual(testCase, candidates.DwellTimeSeconds, 60);
verifyEqual(testCase, candidates.DataVolumeMb, 120);
verifyEqual(testCase, candidates.PowerUsedWh, 2);
entries = candidateSensorResources(candidates);
verifyEqual(testCase, [entries.StartTimeUnixSeconds], repmat(posixtime(epoch + seconds(80)), 1, 2));
verifyEqual(testCase, [entries.StopTimeUnixSeconds], repmat(posixtime(epoch + seconds(140)), 1, 2));
end

function testSameSensorNamesOnDifferentPlatformsAreIndependent(testCase)
[scenario, epoch] = localScenario(1);
parent = PlaceObject("P2", 0, 0, 0);
parent = parent.addSensor(SensorObject.simpleConic("S1", "P2", 20));
scenario = scenario.addObject(parent);
a = pointCandidate(scenario, "T", "P", "S1", epoch, epoch + seconds(60));
b = pointCandidate(scenario, "T", "P2", "S1", epoch, epoch + seconds(60));
verifyFalse(testCase, candidateRowsConflict(a, b));
task = SensorTask("TaskID", "M2", "TargetName", "T", ...
    "RequiredSensorCount", 2, "RequiresSimultaneousSensors", true);
candidates = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, height(candidates), 1);
verifyEqual(testCase, numel(candidateSensorResources(candidates)), 2);
end

function testAsynchronousMembersKeepTheirOwnOccupiedWindows(testCase)
[scenario, epoch] = localScenario(2);
scenario = availability(scenario, "P", "S1", epoch, epoch + seconds(60));
scenario = availability(scenario, "P", "S2", epoch + seconds(100), epoch + seconds(160));
task = SensorTask("TaskID", "Async", "TargetName", "T", ...
    "RequiredSensorCount", 2, "RequiresSimultaneousSensors", false, ...
    "RequiredDwellTimeSeconds", 60);
cooperative = computeSensorTaskOpportunities(scenario, task);
verifyEqual(testCase, height(cooperative), 1);
scenario = availability(scenario, "P", "S1", epoch, epoch + seconds(200));
other = pointCandidate(scenario, "T", "P", "S1", epoch + seconds(100), epoch + seconds(160));
verifyFalse(testCase, candidateRowsConflict(cooperative, other));
end

function [scenario, epoch] = localScenario(sensorCount)
% Fixed sensor and elevated fixed target avoid external propagation engines.
config = ScenarioConfig("Duration", seconds(200), "TimeStep", seconds(10));
epoch = config.Epoch;
scenario = MissionScenario(config);
parent = PlaceObject("P", 0, 0, 0);
for index = 1:sensorCount
    sensor = SensorObject.simpleConic("S" + index, "P", 20);
    sensor.DataRateBps = 8e6;
    sensor.PowerWatts = 60;
    parent = parent.addSensor(sensor);
end
scenario = scenario.addObject(parent);
scenario = scenario.addObject(PlaceObject("T", 0, 0, 1000));
end

function candidate = pointCandidate(scenario, target, platform, sensor, startTime, stopTime)
% Exercise production geometry and metadata rather than hand-authoring angles.
task = SensorTask("TaskID", "Point", "TargetName", target, ...
    "AssignedPlatformName", platform, "AssignedSensorName", sensor, ...
    "RequiredStartTime", startTime, "RequiredStopTime", stopTime);
candidate = computeSensorTaskOpportunities(scenario, task);
end

function scenario = availability(scenario, platform, name, startTime, stopTime)
% Set deterministic sensor availability through its public properties.
parent = scenario.getObject(platform);
for index = 1:numel(parent.Sensors)
    sensor = parent.Sensors{index};
    if sensor.Name == name
        sensor.AvailabilityWindows = table(startTime, stopTime, ...
            'VariableNames', {'StartTime', 'StopTime'});
        parent.Sensors{index} = sensor;
    end
end
scenario = scenario.updateObject(parent);
end
