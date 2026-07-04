function scenario = loadScenario(filename)
%LOADSCENARIO Load a UI-independent scenario struct.

loaded = load(filename, "scenarioData");
if ~isfield(loaded, "scenarioData")
    error("loadScenario:InvalidFile", ...
        "File does not contain a scenarioData variable.");
end
scenario = MissionScenario.fromStruct(loaded.scenarioData);
end

