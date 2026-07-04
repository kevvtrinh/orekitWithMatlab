function sensors = scenarioSensorTable(scenario)
%SCENARIOSENSORTABLE List every attached sensor in the scenario.

sensorName = strings(0, 1);
platformName = strings(0, 1);
platformType = strings(0, 1);
sensorType = strings(0, 1);

for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if ~isprop(obj, "Sensors") || isempty(obj.Sensors)
        continue;
    end
    for s = 1:numel(obj.Sensors)
        sensor = obj.Sensors{s};
        sensorName(end + 1, 1) = string(sensor.Name); %#ok<AGROW>
        platformName(end + 1, 1) = string(obj.Name); %#ok<AGROW>
        platformType(end + 1, 1) = string(obj.ObjectType); %#ok<AGROW>
        sensorType(end + 1, 1) = string(sensor.SensorType); %#ok<AGROW>
    end
end

sensors = table(sensorName, platformName, platformType, sensorType, ...
    'VariableNames', {'SensorName', 'PlatformName', 'PlatformType', 'SensorType'});
end
