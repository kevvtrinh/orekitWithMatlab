function payload = orbitUiRunScenario(specFile, outputFile)
%ORBITUIRUNSCENARIO Propagate a web-UI scenario spec and export the result.
%
% payload = orbitUiRunScenario(specFile, outputFile)
%
% Entry point invoked by the apps/orbit-ui Node bridge through `matlab -batch`
% when the user runs a scenario they built in the browser. Reads the scenario
% spec JSON, rebuilds it with the mission classes (buildScenarioFromSpec),
% propagates with the Orekit backend, computes access for every satellite /
% ground-object pair (capped), runs the sensor-tasking scheduler when the
% spec requests tasks, adds Sun/eclipse/daylight data, and writes the payload
% JSON the frontend renders. The spec is echoed into the payload so the
% frontend can tell which objects the results are fresh for.

arguments
    specFile (1, 1) string
    outputFile (1, 1) string = "orbit-ui-scenario.json"
end

MAX_ACCESS_PAIRS = 60;

spec = jsondecode(fileread(specFile));
scenario = buildScenarioFromSpec(spec);
scenario = scenario.propagate();

% Access for each satellite against each ground station, in scenario order,
% capped so a large constellation cannot run unbounded. Targets are excluded:
% computeAccessCore supports satellite<->ground-station geometry; target
% visibility belongs to the sensor-access workflows.
satNames = string.empty;
groundNames = string.empty;
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if obj.ObjectType == "Satellite"
        satNames(end + 1) = string(obj.Name); %#ok<AGROW>
    elseif obj.ObjectType == "GroundStation"
        groundNames(end + 1) = string(obj.Name); %#ok<AGROW>
    end
end

pairCount = 0;
truncated = false;
fieldNames = string.empty;
for s = satNames
    for g = groundNames
        if pairCount >= MAX_ACCESS_PAIRS
            truncated = true;
            break
        end
        result = computeAccess(scenario, s, g);
        fieldName = matlab.lang.makeValidName(s + "_to_" + g);
        fieldName = matlab.lang.makeUniqueStrings(fieldName, fieldNames);
        fieldNames(end + 1) = fieldName; %#ok<AGROW>
        scenario.AccessResults.(fieldName) = result;
        pairCount = pairCount + 1;
    end
    if truncated
        break
    end
end
if truncated
    warning("orbitUiRunScenario:AccessPairsTruncated", ...
        "Access computation capped at %d pairs (%d satellites x %d ground objects).", ...
        MAX_ACCESS_PAIRS, numel(satNames), numel(groundNames));
end

extra = struct("spec", spec);

% Sensor tasking: schedule the spec's tasks (TrackPointTarget against point
% targets) and export sensors + schedule + FOR/FOV access windows. Sensors
% without tasks still get their access windows so the UI can show FOR-valid
% vs FOV-in-view geometry.
tasks = buildSensorTasks(spec, scenario);
schedule = emptySensorScheduleTable(scenario.Config.Epoch.TimeZone);
if ~isempty(tasks)
    schedulerOptions = SchedulerOptions("AccessTimeStepSeconds", 30, ...
        "MinimumCandidateDurationSeconds", 30);
    candidates = generateTaskCandidates(scenario, tasks, schedulerOptions);
    schedule = scheduleSensorTasksGreedy(scenario, candidates, schedulerOptions);
end
scheduleViz = exportScheduleViz(scenario, schedule);
if ~isempty(scheduleViz.sensors) || ~isempty(tasks)
    extra = mergeStructs(extra, scheduleViz);
end

% Sun geometry and lighting are cheap relative to propagation and always
% useful in the 3D view.
extra = mergeStructs(extra, exportSunViz(scenario));

payload = exportScenarioJson(scenario, outputFile, "Extra", extra);
fprintf("orbitUiRunScenario: wrote %s (%d satellites, %d ground objects, %d access pairs, %d scheduled tasks)\n", ...
    outputFile, numel(satNames), numel(groundNames), pairCount, height(schedule));
end

function tasks = buildSensorTasks(spec, scenario)
% Convert spec.tasks entries into SensorTask objects. A task names a point
% target and optionally the satellite whose sensor must perform it; without
% a satellite any sensor may be scheduled.
tasks = {};
if ~isfield(spec, "tasks") || isempty(spec.tasks)
    return
end
entries = spec.tasks;
if isstruct(entries)
    entries = num2cell(entries);
elseif ~iscell(entries)
    return
end
for k = 1:numel(entries)
    entry = entries{k};
    taskId = string(taskFieldOr(entry, "id", sprintf("task-%d", k)));
    allowedSensors = strings(0, 1);
    satelliteName = string(taskFieldOr(entry, "satelliteName", ""));
    if strlength(satelliteName) > 0
        sat = scenario.getObject(satelliteName);
        for s = 1:numel(sat.Sensors)
            allowedSensors(end + 1, 1) = string(sat.Sensors{s}.Name); %#ok<AGROW>
        end
    end
    tasks{end + 1} = SensorTask( ...
        "TaskID", taskId, ...
        "TaskName", string(taskFieldOr(entry, "name", taskId)), ...
        "TaskType", "TrackPointTarget", ...
        "TargetName", string(entry.targetName), ...
        "Priority", double(taskFieldOr(entry, "priority", 1)), ...
        "RequiredDwellTimeSeconds", double(taskFieldOr(entry, "dwellSeconds", 60)), ...
        "AllowedSensorNames", allowedSensors); %#ok<AGROW>
end
end

function value = taskFieldOr(entry, name, fallback)
if isfield(entry, name) && ~isempty(entry.(name))
    value = entry.(name);
else
    value = fallback;
end
end

function merged = mergeStructs(merged, extra)
names = fieldnames(extra);
for k = 1:numel(names)
    merged.(names{k}) = extra.(names{k});
end
end
