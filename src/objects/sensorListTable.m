function sensors = sensorListTable(sensorCells)
%SENSORLISTTABLE Convert a cell array of SensorObject instances to a table.

names = strings(numel(sensorCells), 1);
types = strings(numel(sensorCells), 1);
pointingModes = strings(numel(sensorCells), 1);
fovTypes = strings(numel(sensorCells), 1);
for k = 1:numel(sensorCells)
    names(k) = sensorCells{k}.Name;
    types(k) = sensorCells{k}.SensorType;
    pointingModes(k) = sensorCells{k}.PointingMode;
    fovTypes(k) = sensorCells{k}.FieldOfViewType;
end

sensors = table(names, types, pointingModes, fovTypes, ...
    'VariableNames', {'Name', 'SensorType', 'PointingMode', 'FieldOfViewType'});
end
