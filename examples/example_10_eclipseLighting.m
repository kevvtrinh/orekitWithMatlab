%% Example 10: eclipse, beta angle, and ground lighting
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Lighting Demo", "Duration", hours(6), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.addObject(GroundStationObject( ...
    "Denver GS", 39.7392, -104.9903, 1609, 10));
scenario = scenario.propagate();

eclipse = computeEclipse(scenario, "Sat-1");
fprintf("Sat-1 sunlit %.1f%% of the scenario\n", eclipse.SunlitFractionPercent);
disp(eclipse.EclipseWindows);
plotEclipseTimeline(eclipse);

betaTable = computeBetaAngle(scenario, "Sat-1");
fprintf("Beta angle: %.2f deg\n", betaTable.BetaAngleDeg(1));

sunAtSite = computeSunElevation(scenario, "Denver GS");
fprintf("Denver daylight fraction: %.1f%%\n", ...
    100 * sum(sunAtSite.IsDaylight) / height(sunAtSite));

% Access restricted to night-time passes of a sunlit satellite
% (typical optical ground-observation constraint).
nightPass = computeAccess(scenario, "Sat-1", "Denver GS", ...
    struct("GroundLighting", "Dark", "SatelliteLighting", "Sunlit"));
disp(nightPass.AccessWindows);
