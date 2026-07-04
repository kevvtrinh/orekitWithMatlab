function accessResult = computeAccess(scenario, sourceName, targetName, options)
%COMPUTEACCESS Compute access between two scenario objects.
%
% This public backend function is UI-independent.

arguments
    scenario MissionScenario
    sourceName
    targetName
    options struct = struct()
end

accessResult = computeAccessCore(scenario, sourceName, targetName, options);
end

