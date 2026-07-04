function scenario = addSensorToObject(scenario, parentObjectName, sensor)
%ADDSENSORTOOBJECT Attach a SensorObject to a scenario object.

parent = scenario.getObject(parentObjectName);
if ~ismethod(parent, "addSensor")
    error("addSensorToObject:UnsupportedParent", ...
        "Object '%s' does not support attached sensors yet.", string(parentObjectName));
end
sensor.ParentName = string(parentObjectName);
parent = parent.addSensor(sensor);
scenario = scenario.updateObject(parent);
end
