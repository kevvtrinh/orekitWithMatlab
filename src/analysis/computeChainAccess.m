function chainResult = computeChainAccess(scenario, nodeNames, options)
%COMPUTECHAINACCESS Multi-hop access along a node chain (STK Chains lite).
%
% chainResult = computeChainAccess(scenario, ["Sat-LEO", "Sat-Relay", "Denver GS"])
%
% The chain is available at a time step when every consecutive link
% (node k to node k+1) has access simultaneously. options are passed to
% each link's access computation (same constraint fields as computeAccess).
%
% chainResult fields: NodeNames, TimeVector, AccessLogical, Links (cell of
% per-link access results), AccessWindows, Duration.

arguments
    scenario MissionScenario
    nodeNames
    options struct = struct()
end

nodeNames = string(nodeNames(:)).';
if numel(nodeNames) < 2
    error("computeChainAccess:TooFewNodes", ...
        "A chain requires at least two nodes.");
end

timeVector = scenario.Config.getTimeVector();
combined = true(numel(timeVector), 1);
links = cell(1, numel(nodeNames) - 1);
for k = 1:numel(nodeNames) - 1
    links{k} = computeAccessCore(scenario, nodeNames(k), nodeNames(k + 1), options);
    combined = combined & links{k}.AccessLogical;
end

chainResult = struct();
chainResult.NodeNames = nodeNames;
chainResult.TimeVector = timeVector;
chainResult.AccessLogical = combined;
chainResult.Links = links;
chainResult.AccessWindows = buildContactPlan(timeVector, combined, ...
    nan(numel(timeVector), 1), nan(numel(timeVector), 1), ...
    nodeNames(1), nodeNames(end));
chainResult.Duration = sum(chainResult.AccessWindows.DurationSeconds);
end
