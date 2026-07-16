function viz = exportScheduleViz(scenario, schedule, options)
%EXPORTSCHEDULEVIZ Serialize sensors + a sensor schedule for the web UI.
%
% viz = exportScheduleViz(scenario)
% viz = exportScheduleViz(scenario, schedule)
%
% Bundles everything the apps/orbit-ui frontend needs to visualize sensor
% tasking on top of a propagated scenario:
%   viz.sensors        attached satellite sensors (FOV/FOR half-angles,
%                      pointing mode, slew rate)
%   viz.schedule       scheduled task rows (scheduleSensorTasksGreedy /
%                      scheduleSensorTasksMILP output) with slew times
%   viz.sensorAccesses per sensor/target pair, both gating modes:
%                      forWindows ("the sensor can slew to see it") and
%                      fovWindows ("the fixed beam sees it right now")
%   viz.areaSensorAccesses projected area-target boundaries in the sensor
%                      az/el frame for each FOR access window
%
% Pass the result to exportScenarioJson via "Extra" to merge it into the
% payload, e.g.
%   exportScenarioJson(scenario, file, "Extra", exportScheduleViz(scenario, schedule))
% This is the compact path for loading a schedule produced by the MATLAB
% scheduling workflow into the web UI.

arguments
    scenario MissionScenario
    schedule table = emptySensorScheduleTable("UTC")
    options.AccessTimeStepSeconds (1, 1) double = 30
    options.MaxAccessPairs (1, 1) double = 24
    options.AreaProjectionTimeStepSeconds (1, 1) double = 10
    options.MaxAreaProjectionWindows (1, 1) double = 6
    options.AccessRequests = []
    options.RestrictToAccessRequests (1, 1) logical = false
end

% --- Sensors attached to satellites ---
sensors = {};
sensorParents = strings(0, 1);
sensorNames = strings(0, 1);
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if obj.ObjectType ~= "Satellite" || isempty(obj.Sensors)
        continue
    end
    for s = 1:numel(obj.Sensors)
        sensor = obj.Sensors{s};
        sensors{end + 1} = struct( ...
            "name", string(sensor.Name), ...
            "parent", string(obj.Name), ...
            "coneHalfAngleDeg", sensor.effectiveConeHalfAngleDeg(), ...
            "fieldOfRegardDeg", sensor.FieldOfRegardDeg, ...
            "pointingMode", string(sensor.PointingMode), ...
            "slewRateDegPerSec", sensor.effectiveSlewRateDegPerSec()); %#ok<AGROW>
        sensorParents(end + 1) = string(obj.Name); %#ok<AGROW>
        sensorNames(end + 1) = string(sensor.Name); %#ok<AGROW>
    end
end
viz = struct();
viz.sensors = sensors;

% --- Scheduled tasks ---
% The return slew needs resolveSensorPointing, which reads the schedule off
% the scenario; attach it locally (value semantics keep the caller's copy
% untouched).
scenarioWithSchedule = scenario;
scenarioWithSchedule.SensorSchedule = schedule;
entries = {};
for k = 1:height(schedule)
    entries{end + 1} = struct( ...
        "taskId", string(schedule.TaskID(k)), ...
        "taskName", string(schedule.TaskName(k)), ...
        "taskType", string(schedule.TaskType(k)), ...
        "sensorName", string(schedule.SensorName(k)), ...
        "platformName", string(schedule.PlatformName(k)), ...
        "targetName", string(schedule.TargetName(k)), ...
        "startUtc", iso8601(schedule.StartTime(k)), ...
        "stopUtc", iso8601(schedule.StopTime(k)), ...
        "durationSeconds", schedule.DurationSeconds(k), ...
        "slewTimeSeconds", finiteOrZero(schedule.SlewTimeSeconds(k)), ...
        "returnSlewTimeSeconds", round(sensorReturnSlewSeconds( ...
            scenarioWithSchedule, schedule(k, :)), 3), ...
        "priority", schedule.Priority(k), ...
        "qualityScore", round(schedule.QualityScore(k), 3)); %#ok<AGROW>
end
viz.schedule = entries;

% --- FOR vs FOV access windows per sensor/target pair ---
% Pairs come from the schedule first (always exported), then every remaining
% sensor x point-target combination up to the cap.
targetNames = strings(0, 1);
for k = 1:numel(scenario.Objects)
    if scenario.Objects{k}.ObjectType == "Target"
        targetNames(end + 1) = string(scenario.Objects{k}.Name); %#ok<AGROW>
    end
end
pairs = strings(0, 3); % [platform, sensor, target]
for k = 1:height(schedule)
    pairs = addPair(pairs, string(schedule.PlatformName(k)), ...
        string(schedule.SensorName(k)), string(schedule.TargetName(k)), ...
        options.MaxAccessPairs);
end

if options.RestrictToAccessRequests
    requests = entryCells(options.AccessRequests);
    for k = 1:numel(requests)
        request = requests{k};
        type = lower(string(fieldOr(request, "type", "access")));
        if type ~= "sensor"
            continue
        end
        platform = string(fieldOr(request, "platformName", ...
            fieldOr(request, "sourceName", "")));
        target = string(fieldOr(request, "targetName", ""));
        sensor = string(fieldOr(request, "sensorName", ""));
        if strlength(sensor) == 0
            idx = find(sensorParents == scalarString(platform), 1);
            if ~isempty(idx)
                sensor = sensorNames(idx);
            end
        end
        pairs = addPair(pairs, platform, sensor, target, ...
            options.MaxAccessPairs);
    end
else
    for k = 1:numel(sensorNames)
        for ti = 1:numel(targetNames)
            pairs = addPair(pairs, sensorParents(k), sensorNames(k), ...
                targetNames(ti), options.MaxAccessPairs);
        end
    end
end

% FOV passes are often empty for narrow beams; that is expected, not a
% problem worth a console warning per pair.
warnState = warning("off", "computeSensorAccess:NoWindows");
restoreWarn = onCleanup(@() warning(warnState));

accessEntries = {};
areaAccessEntries = {};
accessOptions = struct("TimeStepSeconds", options.AccessTimeStepSeconds);
for k = 1:size(pairs, 1)
    forOptions = accessOptions;
    forOptions.UseFieldOfRegard = true;
    fovOptions = accessOptions;
    fovOptions.UseFieldOfRegard = false;
    forResult = computeSensorAccess(scenario, pairs(k, 1), pairs(k, 2), ...
        pairs(k, 3), forOptions);
    fovResult = computeSensorAccess(scenario, pairs(k, 1), pairs(k, 2), ...
        pairs(k, 3), fovOptions);
    accessEntries{end + 1} = struct( ...
        "platform", pairs(k, 1), ...
        "sensor", pairs(k, 2), ...
        "target", pairs(k, 3), ...
        "forWindows", {windowList(forResult.AccessWindows)}, ...
        "fovWindows", {windowList(fovResult.AccessWindows)}); %#ok<AGROW>

    targetObject = scenario.getObject(pairs(k, 3));
    if isa(targetObject, "AreaTargetObject")
        areaAccessEntries{end + 1} = areaProjectionEntry( ...
            scenario, pairs(k, :), forResult.AccessWindows, ...
            options.AreaProjectionTimeStepSeconds, ...
            options.MaxAreaProjectionWindows); %#ok<AGROW>
    end
end
viz.sensorAccesses = accessEntries;
viz.areaSensorAccesses = areaAccessEntries;
end

function entry = areaProjectionEntry(scenario, pair, accessWindows, stepSeconds, maxWindows)
parent = scenario.getObject(pair(1));
sensor = parent.getSensor(pair(2));
windowCount = min(height(accessWindows), max(0, floor(maxWindows)));
projectionWindows = cell(windowCount, 1);

for w = 1:windowCount
    startTime = accessWindows.StartTime(w);
    stopTime = accessWindows.StopTime(w);
    timeVector = (startTime:seconds(stepSeconds):stopTime).';
    if timeVector(end) < stopTime
        timeVector(end + 1, 1) = stopTime; %#ok<AGROW>
    end
    projection = computeAreaTargetAzElSweep( ...
        scenario, pair(1), pair(2), pair(3), struct( ...
        "TimeVector", timeVector, ...
        "MaximumBoundaryStepDeg", 0.25, ...
        "AzimuthLimitsDeg", [-180 180], ...
        "ElevationLimitsDeg", [max(0, 90 - sensor.FieldOfRegardDeg), 90], ...
        "HomeAzElDeg", [0 90]));

    samples = cell(numel(projection.Time), 1);
    for sampleIndex = 1:numel(projection.Time)
        samples{sampleIndex} = struct( ...
            "tOffsetSec", round(seconds( ...
                projection.Time(sampleIndex) - scenario.Config.Epoch), 3), ...
            "boundarySegments", {finiteAzElSegments( ...
                projection.AzimuthDeg{sampleIndex}, ...
                projection.ElevationDeg{sampleIndex})}, ...
            "commandAzimuthDeg", round(projection.CommandAzimuthDeg(sampleIndex), 5), ...
            "commandElevationDeg", round(projection.CommandElevationDeg(sampleIndex), 5), ...
            "commandInsideFor", projection.CommandInsidePositionLimits(sampleIndex), ...
            "status", projection.Status(sampleIndex));
    end

    projectionWindows{w} = struct( ...
        "startUtc", iso8601(startTime), ...
        "stopUtc", iso8601(stopTime), ...
        "samples", {samples});
end

entry = struct( ...
    "platform", pair(1), ...
    "sensor", pair(2), ...
    "target", pair(3), ...
    "fieldOfRegardDeg", sensor.FieldOfRegardDeg, ...
    "coneHalfAngleDeg", sensor.effectiveConeHalfAngleDeg(), ...
    "projectionWindows", {projectionWindows});
end

function segments = finiteAzElSegments(azimuthDeg, elevationDeg)
azimuthDeg = double(azimuthDeg(:));
elevationDeg = double(elevationDeg(:));
finite = isfinite(azimuthDeg) & isfinite(elevationDeg);
changes = diff([false; finite; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
segments = cell(numel(starts), 1);
for k = 1:numel(starts)
    segments{k} = round([azimuthDeg(starts(k):stops(k)), ...
        elevationDeg(starts(k):stops(k))], 5);
end
end

function pairs = addPair(pairs, platform, sensor, target, maxPairs)
platform = scalarString(platform);
sensor = scalarString(sensor);
target = scalarString(target);
if strlength(platform) == 0 || strlength(sensor) == 0 || strlength(target) == 0
    return
end
if size(pairs, 1) >= maxPairs
    return
end
candidate = [platform, sensor, target];
for k = 1:size(pairs, 1)
    if all(pairs(k, :) == candidate)
        return
    end
end
pairs(end + 1, :) = candidate;
end

function windows = windowList(accessWindows)
windows = {};
for k = 1:height(accessWindows)
    windows{end + 1} = struct( ...
        "startUtc", iso8601(accessWindows.StartTime(k)), ...
        "stopUtc", iso8601(accessWindows.StopTime(k)), ...
        "durationSeconds", accessWindows.DurationSeconds(k), ...
        "maxElevationDeg", round(accessWindows.MaxElevationDeg(k), 2), ...
        "minRangeKm", round(accessWindows.MinRangeKm(k), 1)); %#ok<AGROW>
end
end

function value = finiteOrZero(value)
if ~isfinite(value)
    value = 0;
end
end

function text = iso8601(t)
t.TimeZone = "UTC";
text = string(t, "uuuu-MM-dd'T'HH:mm:ss.SSS'Z'");
end

function entries = entryCells(entries)
if isempty(entries)
    entries = {};
elseif isstruct(entries)
    entries = num2cell(entries);
elseif ~iscell(entries)
    entries = {};
end
end

function value = fieldOr(entry, name, fallback)
if isfield(entry, name) && ~isempty(entry.(name))
    value = entry.(name);
else
    value = fallback;
end
end

function text = scalarString(value)
text = string(value);
if isempty(text)
    text = "";
else
    text = text(1);
end
end
