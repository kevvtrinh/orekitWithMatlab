function scenario = removeSensorFromObject(scenario, parentObjectName, sensorName)
%REMOVESENSORFROMOBJECT Remove an attached sensor from a scenario object.

parent = scenario.getObject(parentObjectName);
if ~ismethod(parent, "removeSensor")
    error("removeSensorFromObject:UnsupportedParent", ...
        "Object '%s' does not support attached sensors yet.", string(parentObjectName));
end
parent = parent.removeSensor(sensorName);
scenario = scenario.updateObject(parent);
end
