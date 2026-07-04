%% Example 16: orbit design wizard - SSO, GEO, Molniya, sensor-cone coverage
startupOrekitSuite();

epoch = datetime(2026, 6, 1, 0, 0, 0, "TimeZone", "UTC");
cfg = ScenarioConfig("Name", "Orbit Design Demo", "Epoch", epoch, ...
    "Duration", hours(12), "TimeStep", seconds(120));
scenario = MissionScenario(cfg);

% 10:30 LTAN sun-synchronous imager at 700 km.
sso = OrbitDesigner.sunSynchronous("SSO-Imager", 700e3, 10.5, epoch);
fprintf("SSO inclination: %.2f deg, RAAN: %.2f deg\n", ...
    sso.InclinationDeg, sso.RAANDeg);

% GEO comms over 75W and a Molniya for high-latitude coverage.
geo = OrbitDesigner.geostationary("GEO-75W", -75, epoch);
molniya = OrbitDesigner.molniya("Molniya-1", 90);

scenario = scenario.addObject(sso);
scenario = scenario.addObject(geo);
scenario = scenario.addObject(molniya);
scenario = scenario.propagate();

plotGroundTrack(scenario, "SSO-Imager");
plotGroundTrack(scenario, "Molniya-1");

% Imager coverage: 5 deg elevation AND within 25 deg of nadir.
grid = CoverageGrid.regionGrid(-80, 80, -180, 180, 5);
coverage = computeCoverage(scenario, grid, struct( ...
    "Assets", "SSO-Imager", "MinElevationDeg", 5, "MaxOffNadirDeg", 25));
fprintf("Imager swath coverage in 12 h: %.1f%% of points seen\n", ...
    coverage.Summary.PercentPointsWithAccess);
plotCoverageMap(coverage, "NumPasses");
