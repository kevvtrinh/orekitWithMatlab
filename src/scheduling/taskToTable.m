function tasks = taskToTable(taskList)
%TASKTOTABLE Convert task objects/structs to a compact export table.

taskCells = normalizeSensorTasks(taskList);
if isempty(taskCells)
    tasks = table(strings(0, 1), strings(0, 1), strings(0, 1), ...
        strings(0, 1), zeros(0, 1), false(0, 1), zeros(0, 1), ...
        'VariableNames', {'TaskID', 'TaskName', 'TaskType', 'TargetName', ...
        'Priority', 'RequiresSimultaneousSensors', 'RequiredSensorCount'});
    return;
end

taskID = strings(numel(taskCells), 1);
taskName = strings(numel(taskCells), 1);
taskType = strings(numel(taskCells), 1);
targetName = strings(numel(taskCells), 1);
priority = zeros(numel(taskCells), 1);
requiresSimultaneous = false(numel(taskCells), 1);
requiredSensorCount = zeros(numel(taskCells), 1);

for k = 1:numel(taskCells)
    task = taskCells{k};
    taskID(k) = string(taskField(task, "TaskID", ""));
    taskName(k) = string(taskField(task, "TaskName", ""));
    taskType(k) = string(taskField(task, "TaskType", ""));
    targetName(k) = string(taskField(task, "TargetName", ""));
    priority(k) = taskField(task, "Priority", 0);
    requiresSimultaneous(k) = taskField(task, "RequiresSimultaneousSensors", false);
    requiredSensorCount(k) = taskField(task, "RequiredSensorCount", 1);
end

tasks = table(taskID, taskName, taskType, targetName, priority, ...
    requiresSimultaneous, requiredSensorCount, ...
    'VariableNames', {'TaskID', 'TaskName', 'TaskType', 'TargetName', ...
    'Priority', 'RequiresSimultaneousSensors', 'RequiredSensorCount'});
end
