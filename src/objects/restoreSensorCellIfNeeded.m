function value = restoreSensorCellIfNeeded(value, propertyName)
%RESTORESENSORCELLIFNEEDED Rehydrate sensor structs during scenario load.

if ~strcmp(propertyName, "Sensors") || isempty(value)
    return;
end

for k = 1:numel(value)
    if isstruct(value{k})
        value{k} = SensorObject.fromStruct(value{k});
    end
end
end
