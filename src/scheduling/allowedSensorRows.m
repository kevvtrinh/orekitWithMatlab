function sensors = allowedSensorRows(scenario, task)
%ALLOWEDSENSORROWS Filter scenario sensors for a task.

sensors = scenarioSensorTable(scenario);
if isempty(sensors) || height(sensors) == 0
    return;
end

assignedSensor = string(taskField(task, "AssignedSensorName", ""));
assignedPlatform = string(taskField(task, "AssignedPlatformName", ""));
allowedSensors = string(taskField(task, "AllowedSensorNames", strings(0, 1)));
allowedPlatforms = string(taskField(task, "AllowedPlatformNames", strings(0, 1)));
forbiddenSensors = string(taskField(task, "ForbiddenSensorNames", strings(0, 1)));

keep = true(height(sensors), 1);
if strlength(strtrim(assignedSensor)) > 0
    keep = keep & sensors.SensorName == assignedSensor;
end
if strlength(strtrim(assignedPlatform)) > 0
    keep = keep & sensors.PlatformName == assignedPlatform;
end
if ~isempty(allowedSensors) && any(strlength(strtrim(allowedSensors)) > 0)
    keep = keep & ismember(sensors.SensorName, allowedSensors(strlength(strtrim(allowedSensors)) > 0));
end
if ~isempty(allowedPlatforms) && any(strlength(strtrim(allowedPlatforms)) > 0)
    keep = keep & ismember(sensors.PlatformName, allowedPlatforms(strlength(strtrim(allowedPlatforms)) > 0));
end
if ~isempty(forbiddenSensors)
    keep = keep & ~ismember(sensors.SensorName, forbiddenSensors);
end
sensors = sensors(keep, :);
end
