function payload = orbitUiRunScenario(specFile, outputFile)
%ORBITUIRUNSCENARIO Propagate a web-UI scenario spec and export the result.
%
% payload = orbitUiRunScenario(specFile, outputFile)
%
% Entry point invoked by the apps/orbit-ui Node bridge through `matlab -batch`
% when the user runs a scenario they built in the browser. Reads the scenario
% spec JSON, rebuilds it with the mission classes (buildScenarioFromSpec),
% propagates with the Orekit backend, computes access for every satellite /
% ground-object pair (capped), and writes the payload JSON the frontend
% renders. The spec is echoed into the payload so the frontend can tell which
% objects the results are fresh for.

arguments
    specFile (1, 1) string
    outputFile (1, 1) string = "orbit-ui-scenario.json"
end

MAX_ACCESS_PAIRS = 60;

spec = jsondecode(fileread(specFile));
scenario = buildScenarioFromSpec(spec);
scenario = scenario.propagate();

% Access for each satellite against each ground station, in scenario order,
% capped so a large constellation cannot run unbounded. Targets are excluded:
% computeAccessCore supports satellite<->ground-station geometry; target
% visibility belongs to the sensor-access workflows.
satNames = string.empty;
groundNames = string.empty;
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if obj.ObjectType == "Satellite"
        satNames(end + 1) = string(obj.Name); %#ok<AGROW>
    elseif obj.ObjectType == "GroundStation"
        groundNames(end + 1) = string(obj.Name); %#ok<AGROW>
    end
end

pairCount = 0;
truncated = false;
fieldNames = string.empty;
for s = satNames
    for g = groundNames
        if pairCount >= MAX_ACCESS_PAIRS
            truncated = true;
            break
        end
        result = computeAccess(scenario, s, g);
        fieldName = matlab.lang.makeValidName(s + "_to_" + g);
        fieldName = matlab.lang.makeUniqueStrings(fieldName, fieldNames);
        fieldNames(end + 1) = fieldName; %#ok<AGROW>
        scenario.AccessResults.(fieldName) = result;
        pairCount = pairCount + 1;
    end
    if truncated
        break
    end
end
if truncated
    warning("orbitUiRunScenario:AccessPairsTruncated", ...
        "Access computation capped at %d pairs (%d satellites x %d ground objects).", ...
        MAX_ACCESS_PAIRS, numel(satNames), numel(groundNames));
end

payload = exportScenarioJson(scenario, outputFile, "Extra", struct("spec", spec));
fprintf("orbitUiRunScenario: wrote %s (%d satellites, %d ground objects, %d access pairs)\n", ...
    outputFile, numel(satNames), numel(groundNames), pairCount);
end
