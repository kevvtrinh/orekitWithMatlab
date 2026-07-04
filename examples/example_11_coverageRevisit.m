%% Example 11: constellation coverage and revisit analysis
startupOrekitSuite();

cfg = ScenarioConfig("Name", "Coverage Demo", "Duration", hours(12), "TimeStep", seconds(120));
scenario = MissionScenario(cfg);

sats = ConstellationFactory.walkerDelta("WD", 12, 3, 1, 7178e3, 53.0);
scenario = ConstellationFactory.addToScenario(scenario, sats);
scenario = scenario.propagate();

grid = CoverageGrid.regionGrid(-60, 60, -180, 180, 6);
coverage = computeCoverage(scenario, grid, struct("MinElevationDeg", 10));

fprintf("Area-weighted coverage: %.1f%%\n", coverage.Summary.AverageCoveragePercent);
fprintf("Worst revisit gap: %.1f minutes\n", coverage.Summary.WorstMaxGapMinutes);

plotCoverageMap(coverage, "CoveragePercent");
plotCoverageMap(coverage, "MaxGapMinutes");
exportCoverageReport(coverage, "coverage_report.csv");
