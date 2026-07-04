function saveScenario(scenario, filename)
%SAVESCENARIO Save a UI-independent scenario struct.

scenarioData = scenario.toStruct();
save(filename, "scenarioData");
end

