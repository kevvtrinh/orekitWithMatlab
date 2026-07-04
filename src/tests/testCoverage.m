function tests = testCoverage
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testGridPointsAndWeights(testCase)
grid = CoverageGrid.regionGrid(20, 50, -110, -70, 10);
points = grid.points();
verifyGreaterThan(testCase, height(points), 0);
verifyEqual(testCase, sum(points.AreaWeight), 1.0, "AbsTol", 1e-9);
verifyTrue(testCase, all(points.LatitudeDeg >= 20 & points.LatitudeDeg <= 50));
end

function testCoverageFiguresOfMerit(testCase)
scenario = localScenario();
grid = CoverageGrid.regionGrid(-60, 60, -180, 180, 15);
coverage = computeCoverage(scenario, grid, struct("MinElevationDeg", 5));

points = coverage.Points;
verifyTrue(testCase, all(points.CoveragePercent >= 0 & points.CoveragePercent <= 100));
verifyTrue(testCase, any(points.NumPasses > 0));
verifyGreaterThanOrEqual(testCase, coverage.Summary.AverageCoveragePercent, 0);
verifyEqual(testCase, size(coverage.CoveredLogical), ...
    [height(points), numel(scenario.Config.getTimeVector())]);
end

function testCoverageRequiresPropagatedAssets(testCase)
cfg = ScenarioConfig("Duration", minutes(30), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
grid = CoverageGrid.globalGrid(30);
verifyError(testCase, ...
    @() computeCoverage(scenario, grid), "computeCoverage:NoAssets");
end

function scenario = localScenario()
cfg = ScenarioConfig("Duration", hours(3), "TimeStep", seconds(120));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0));
scenario = scenario.propagate();
end
