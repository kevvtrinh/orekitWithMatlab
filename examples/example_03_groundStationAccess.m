%% Example 03: compute satellite to ground station access
example_02_propagateSatellite;

accessResult = computeAccess(scenario, "Sat-1", "Denver GS");

disp(summarizeAccess(accessResult));
disp(accessResult.AccessWindows);

