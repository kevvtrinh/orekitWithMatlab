function scenario = propagateScenario(scenario)
%PROPAGATESCENARIO Propagate all propagatable objects in a scenario.

scenario.Config.validate();
OrekitInitializer.initialize();
timeVector = scenario.Config.getTimeVector();

for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if isa(obj, "SatelliteObject")
        obj = obj.propagate(timeVector, scenario.Config);
        scenario.Objects{k} = obj;
        scenario.PropagationResults.(matlab.lang.makeValidName(obj.Name)) = obj.Ephemeris;
    end
end
end

