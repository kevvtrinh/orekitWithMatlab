function tests = testAzElStaticDijkstra
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElStaticDijkstra.m")
%**************************************************************************
% PURPOSE
%   - Verify reverse-Dijkstra diagnostics and lower-bound use.
%   - Compare reverse-guided and zero-heuristic forward kinodynamic A*.
%**************************************************************************
% INPUTS
%   - None; MATLAB supplies local function-test fixtures.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by functiontests.
%**************************************************************************
% UNITS
%   - Test quantities follow the planner's degree/second conventions.

%% Section 1: Register Local Tests
tests = functiontests(localfunctions);
end

function setupOnce(~)
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(packageRoot));
end

function testReverseDiagnosticsAndInitialAdmissibility(testCase)
scenario = fixedScenario({}, [-4 -3], [4 3], 20, false);
plan = planAzElTrajectory(scenario, plannerOptions("reverseDijkstra"));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.method, ...
    "reverseDijkstraForwardKinodynamicAStar");
reverse = plan.diagnostics.reverseDijkstra;
forward = plan.diagnostics.forwardAStar;
verifyTrue(testCase, reverse.executed);
verifyTrue(testCase, reverse.usedByForward);
verifyTrue(testCase, reverse.forwardProjectionUsesMacroStencil);
verifyGreaterThan(testCase, reverse.goalSeedCount, 0);
verifyGreaterThanOrEqual(testCase, reverse.heapPushes, ...
    reverse.goalSeedCount);
verifyGreaterThanOrEqual(testCase, reverse.heapPops, reverse.settledCount);
verifyGreaterThan(testCase, reverse.relaxationAttempts, 0);
verifyGreaterThan(testCase, reverse.projectionScale, 0);
verifyLessThanOrEqual(testCase, reverse.projectionScale, 1 + 1e-12);
verifyLessThanOrEqual(testCase, reverse.initialForwardHeuristic, ...
    plan.objectiveCost + 1e-9);
verifyTrue(testCase, forward.executed);
verifyTrue(testCase, forward.optimalityProven);
verifyTrue(testCase, plan.validation.passed);
end

function testZeroHeuristicPreservesFiniteGraphOptimalCost(testCase)
scenario = fixedScenario({}, [-4 -3], [4 3], 20, false);
reversePlan = planAzElTrajectory( ...
    scenario, plannerOptions("reverseDijkstra"));
zeroPlan = planAzElTrajectory(scenario, plannerOptions("zero"));

verifyTrue(testCase, reversePlan.success);
verifyTrue(testCase, zeroPlan.success);
verifyTrue(testCase, ...
    reversePlan.diagnostics.reverseDijkstra.usedByForward);
verifyFalse(testCase, ...
    zeroPlan.diagnostics.reverseDijkstra.usedByForward);
verifyEqual(testCase, reversePlan.objectiveCost, ...
    zeroPlan.objectiveCost, "AbsTol", 1e-9);
verifyLessThanOrEqual(testCase, ...
    reversePlan.expandedStateCount, zeroPlan.expandedStateCount);
verifyLessThanOrEqual(testCase, ...
    reversePlan.diagnostics.reverseDijkstra.initialForwardHeuristic, ...
    zeroPlan.objectiveCost + 1e-9);
verifyTrue(testCase, reversePlan.validation.passed);
verifyTrue(testCase, zeroPlan.validation.passed);
end

function testDeterministicTieBreakingAndStateIdentity(testCase)
staticWall = staticWallData(20);
scenario = fixedScenario({staticWall}, [-4 0], [4 0], 20, false);
options = plannerOptions("reverseDijkstra");
firstPlan = planAzElTrajectory(scenario, options);
secondPlan = planAzElTrajectory(scenario, options);

verifyTrue(testCase, firstPlan.success);
verifyTrue(testCase, secondPlan.success);
verifyEqual(testCase, firstPlan.objectiveCost, ...
    secondPlan.objectiveCost, "AbsTol", 1e-12);
verifyEqual(testCase, firstPlan.time_s, secondPlan.time_s, ...
    "AbsTol", 1e-12);
verifyEqual(testCase, firstPlan.positionUnwrapped_deg, ...
    secondPlan.positionUnwrapped_deg, "AbsTol", 1e-12);
verifyEqual(testCase, firstPlan.velocity_deg_s, ...
    secondPlan.velocity_deg_s, "AbsTol", 1e-12);
verifyEqual(testCase, firstPlan.acceleration_deg_s2, ...
    secondPlan.acceleration_deg_s2, "AbsTol", 1e-12);
verifyEqual(testCase, firstPlan.expandedStateCount, ...
    secondPlan.expandedStateCount);
verifyEqual(testCase, firstPlan.generatedStateCount, ...
    secondPlan.generatedStateCount);
end

function testStaticGeometryUsesProvedProjectedField(testCase)
staticWall = staticWallData(20);
scenario = fixedScenario({staticWall}, [-4 0], [4 0], 20, false);
plan = planAzElTrajectory(scenario, plannerOptions("reverseDijkstra"));

verifyTrue(testCase, plan.success);
verifyTrue(testCase, plan.diagnostics.reverseDijkstra.executed);
verifyTrue(testCase, plan.diagnostics.reverseDijkstra.usedByForward);
verifyGreaterThan(testCase, ...
    plan.diagnostics.reverseDijkstra.blockedBinCount, 0);
verifyTrue(testCase, ...
    plan.diagnostics.reverseDijkstra.exactEdgeFilteringExecuted);
verifyGreaterThan(testCase, ...
    plan.diagnostics.reverseDijkstra.collisionRejectedEdges, 0);
verifyGreaterThan(testCase, ...
    plan.diagnostics.reverseDijkstra.initialForwardHeuristic, 8);
verifyLessThanOrEqual(testCase, ...
    plan.diagnostics.reverseDijkstra.initialForwardHeuristic, ...
    plan.objectiveCost + 1e-9);
verifyGreaterThan(testCase, plan.angularPathLength_deg, 8);
verifyTrue(testCase, plan.validation.collisionFree);
end

function testStaticDominanceSupportsHashedExactIdentity(testCase)
staticWall = staticWallData(20);
scenario = fixedScenario({staticWall}, [-4 0], [4 0], 20, false);
denseOptions = plannerOptions("reverseDijkstra");
hashedOptions = denseOptions;
hashedOptions.MaximumDenseStateLookupEntries = 1;
densePlan = planAzElTrajectory(scenario, denseOptions);
hashedPlan = planAzElTrajectory(scenario, hashedOptions);

verifyTrue(testCase, densePlan.success);
verifyTrue(testCase, hashedPlan.success);
verifyFalse(testCase, ...
    hashedPlan.diagnostics.forwardAStar.useDenseStateLookup);
verifyTrue(testCase, ...
    hashedPlan.diagnostics.forwardAStar.staticRestDominanceEnabled);
verifyGreaterThan(testCase, ...
    hashedPlan.diagnostics.forwardAStar.dominanceComparisons, 0);
verifyEqual(testCase, hashedPlan.objectiveCost, ...
    densePlan.objectiveCost, "AbsTol", 1e-9);
verifyTrue(testCase, hashedPlan.validation.passed);
end

function testAzimuthWrapUsesShortUnwrappedRoute(testCase)
scenario = fixedScenario({}, [170 0], [-170 0], 30, true);
scenario.limits.azimuth_deg = [-180 180];
plan = planAzElTrajectory(scenario, plannerOptions("reverseDijkstra"));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.position_deg(end, 1), -170, "AbsTol", 1e-9);
verifyEqual(testCase, ...
    plan.positionUnwrapped_deg(end, 1), 190, "AbsTol", 1e-9);
verifyEqual(testCase, plan.angularPathLength_deg, 20, "AbsTol", 1e-9);
verifyTrue(testCase, plan.validation.passed);
end

function scenario = fixedScenario( ...
        azElData, startPosition_deg, goalPosition_deg, stopTime_s, allowWrap)
initialState = boundaryState(0, startPosition_deg);
goalState = boundaryState(stopTime_s, goalPosition_deg);
scenario = struct( ...
    "requestKind", "fixed-goal", ...
    "azElData", {azElData}, ...
    "initialState", initialState, ...
    "goalState", goalState, ...
    "target", [], ...
    "limits", struct( ...
        "azimuth_deg", [-5 5], ...
        "elevation_deg", [-3 3], ...
        "maxVelocity_deg_s", [2 2], ...
        "maxAcceleration_deg_s2", [1 1], ...
        "maxJerk_deg_s3", [10 10]), ...
    "options", struct( ...
        "sampleTime_s", 0.25, ...
        "collisionCheckStep_s", 0.125, ...
        "safetyMargin_deg", 0.05, ...
        "allowAzimuthWrap", allowWrap, ...
        "objective", "minimumAngularDistance"), ...
    "resourceBudget", struct( ...
        "maximumWallTime_s", 10, ...
        "maximumExpansions", 50000));
end

function options = plannerOptions(heuristicMode)
options = struct( ...
    "GridStep_deg", 1, ...
    "TimeStep_s", 0.5, ...
    "MaximumPrimitiveDistance_deg", 2, ...
    "GoalConnectionRadius_deg", 1, ...
    "DirectionCount", 16, ...
    "HeuristicMode", heuristicMode, ...
    "MaxWallTime_s", 10, ...
    "MaxExpandedStates", 50000, ...
    "MaxGeneratedStates", 200000);
end

function data = staticWallData(stopTime_s)
time_s = (0:stopTime_s).';
azimuth = repmat({[-0.6; 0.6; 0.6; -0.6; -0.6]}, ...
    numel(time_s), 1);
elevation = repmat({[-1.5; -1.5; 1.5; 1.5; -1.5]}, ...
    numel(time_s), 1);
data = makeAzElObstacleData("Static wall", time_s, azimuth, elevation);
end

function state = boundaryState(time_s, position_deg)
state = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0]);
end
