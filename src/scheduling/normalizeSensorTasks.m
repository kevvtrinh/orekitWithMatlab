function taskCells = normalizeSensorTasks(taskList)
%NORMALIZESENSORTASKS Return tasks as a cell array of SensorTask objects/structs.

if nargin < 1 || isempty(taskList)
    taskCells = {};
elseif isa(taskList, "SensorTask")
    taskCells = num2cell(taskList);
elseif iscell(taskList)
    taskCells = taskList;
elseif isstruct(taskList)
    if isscalar(taskList)
        taskCells = {SensorTask.fromStruct(taskList)};
    else
        taskCells = cell(1, numel(taskList));
        for k = 1:numel(taskList)
            taskCells{k} = SensorTask.fromStruct(taskList(k));
        end
    end
else
    error("normalizeSensorTasks:InvalidTasks", ...
        "Tasks must be SensorTask objects, structs, or cells.");
end
end
