function value = taskField(task, name, defaultValue)
%TASKFIELD Read a SensorTask property or struct field with a default.

if isobject(task) && isprop(task, name)
    value = task.(name);
elseif isstruct(task) && isfield(task, name)
    value = task.(name);
else
    value = defaultValue;
end
end
