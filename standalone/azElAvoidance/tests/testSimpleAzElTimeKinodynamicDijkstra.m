function tests = testSimpleAzElTimeKinodynamicDijkstra
%% Section 0: Header & Readme
% SYNTAX
%   tests = testSimpleAzElTimeKinodynamicDijkstra
%**************************************************************************
% PURPOSE
%   - Define focused tests for the simple kinodynamic Dijkstra planner.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.Test array)
%       Tests constructed from the local test functions.
%**************************************************************************
% UNITS
%   - Test quantities use the units documented by the planner.
tests = functiontests(localfunctions);
end

function setupOnce(~)
%% Section 0: Header & Readme
% SYNTAX
%   setupOnce(~)
%**************************************************************************
% PURPOSE
%   - Add the standalone planner and its support files to the MATLAB path.
%**************************************************************************
% INPUTS
%   - ~ (discarded test fixture)
%       Fixture supplied by the function-based test framework.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - None.
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(plannerRoot));
end

function testRestToRestTrajectory(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testRestToRestTrajectory(testCase)
%**************************************************************************
% PURPOSE
%   - Verify endpoint dynamics, limits, and sampled-collision diagnostics.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, options] = standardProblem(4);

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyEqual(testCase, plan.position_deg(1, :), [0, 0]);
verifyEqual(testCase, plan.position_deg(end, :), [2, 0]);
verifyEqual(testCase, plan.velocity_deg_s([1, end], :), zeros(2, 2));
verifyEqual(testCase, plan.acceleration_deg_s2([1, end], :), zeros(2, 2));
verifyLessThanOrEqual(testCase, ...
    max(abs(plan.velocity_deg_s), [], 1), limits.maxVelocity_deg_s);
verifyLessThanOrEqual(testCase, ...
    max(abs(plan.acceleration_deg_s2), [], 1), ...
    limits.maxAcceleration_deg_s2);
verifyFalse(testCase, plan.exactCollisionValidated);
verifyTrue(testCase, plan.sampledCollisionValidated);
end

function testMovingGateProducesTrueHold(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testMovingGateProducesTrueHold(testCase)
%**************************************************************************
% PURPOSE
%   - Verify time-varying collision avoidance and true-hold classification.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azimuthBoundaryByTime_deg = cell(numel(time_s), 1);
elevationBoundaryByTime_deg = cell(numel(time_s), 1);
for timeIndex = 1:numel(time_s)
    if time_s(timeIndex) <= 2
        azimuthBoundaryByTime_deg{timeIndex} = [0.5; 1.5; 1.5; 0.5; 0.5];
        elevationBoundaryByTime_deg{timeIndex} = [-2; -2; 2; 2; -2];
    else
        azimuthBoundaryByTime_deg{timeIndex} = zeros(0, 1);
        elevationBoundaryByTime_deg{timeIndex} = zeros(0, 1);
    end
end
azElData = makeAzElObstacleData( ...
    "Clearing gate", time_s, azimuthBoundaryByTime_deg, ...
    elevationBoundaryByTime_deg);
[initialState, destinationState, limits, options] = standardProblem(6);

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyTrue(testCase, any(plan.isWaiting));
blockedNodes = queryAzElTimeObstacle(plan.obstacleField, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s);
verifyFalse(testCase, any(blockedNodes));
end

function testWrappedAzimuthUsesShortContinuousDirection(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testWrappedAzimuthUsesShortContinuousDirection(testCase)
%**************************************************************************
% PURPOSE
%   - Verify seam wrapping and continuous unwrapped trajectory output.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Azimuth is degrees and time is seconds.
time_s = (0:4).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, options] = standardProblem(4);
initialState.position_deg = [179, 0];
destinationState.position_deg = [-179, 0];

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyEqual(testCase, plan.position_deg(end, 1), -179);
verifyEqual(testCase, plan.positionUnwrapped_deg(end, 1), 181);
verifyLessThanOrEqual(testCase, ...
    max(abs(diff(plan.positionUnwrapped_deg(:, 1)))), 1);
end

function testCoarseToFinePositionGridRefinement(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testCoarseToFinePositionGridRefinement(testCase)
%**************************************************************************
% PURPOSE
%   - Verify honest coarse failure and selection of the finest valid grid.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Position lattice steps are degrees.
time_s = (0:4).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, options] = standardProblem(4);
options.positionStepSchedule_deg = [4, 2, 1, 0.5];

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyTrue(testCase, plan.gridRefinement.Used);
verifyEqual(testCase, plan.gridRefinement.Schedule_deg, [4, 2, 1, 0.5]);
verifyEqual(testCase, numel(plan.gridRefinement.Levels), 4);
verifyFalse(testCase, plan.gridRefinement.Levels(1).Success);
verifyTrue(testCase, plan.gridRefinement.Levels(end).Success);
verifyEqual(testCase, ...
    plan.gridRefinement.SelectedPositionStep_deg, 0.5);
verifyTrue(testCase, plan.gridRefinement.FinestLevelSucceeded);
verifyEqual(testCase, diff(plan.azimuthGrid_deg(1:2)), 0.5);
verifyTrue(testCase, plan.gridRefinement.Levels(end).Selected);
end

function testCoarseToFineTimeGridRefinement(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testCoarseToFineTimeGridRefinement(testCase)
%**************************************************************************
% PURPOSE
%   - Verify coarse time-lattice failure followed by successful refinement.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Time lattice steps are seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, options] = standardProblem(4);
options.timeStepSchedule_s = [2, 1];

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyTrue(testCase, plan.timeRefinement.Used);
verifyEqual(testCase, plan.timeRefinement.Schedule_s, [2, 1]);
verifyFalse(testCase, plan.timeRefinement.Levels(1).Success);
verifyTrue(testCase, plan.timeRefinement.Levels(2).Success);
verifyEqual(testCase, plan.timeRefinement.SelectedTimeStep_s, 1);
verifyTrue(testCase, plan.timeRefinement.FinestLevelSucceeded);
end

function testLatticeCompatibleJerkCommands(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testLatticeCompatibleJerkCommands(testCase)
%**************************************************************************
% PURPOSE
%   - Verify default jerk commands can be aligned to whole acceleration
%     cells without exceeding the physical jerk limit.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Acceleration is deg/s^2 and jerk is deg/s^3.
time_s = (0:1).';
azElData = emptyObstacleData(time_s);
initialState = struct( ...
    "time_s", 0, ...
    "position_deg", [0, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
destinationState = initialState;
limits = struct( ...
    "azimuth_deg", [-2, 2], ...
    "elevation_deg", [-2, 2], ...
    "maxVelocity_deg_s", [1, 1], ...
    "maxAcceleration_deg_s2", [1, 1], ...
    "maxJerk_deg_s3", [0.75, 0.75]);
options = struct( ...
    "timeStep_s", 1, ...
    "positionStep_deg", [1, 1], ...
    "velocityStep_deg_s", [0.5, 0.5], ...
    "accelerationStep_deg_s2", [0.5, 0.5], ...
    "jerkCommandMode", "latticeCompatible", ...
    "allowAzimuthWrap", false);

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyEqual(testCase, ...
    max(abs(plan.jerkCommands_deg_s3), [], 1), [0.5, 0.5]);
accelerationCellChange = plan.jerkCommands_deg_s3 .* ...
    options.timeStep_s ./ options.accelerationStep_deg_s2;
verifyEqual(testCase, accelerationCellChange, ...
    round(accelerationCellChange));
end

function testExactFinalSlicePruningPreservesSolution(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testExactFinalSlicePruningPreservesSolution(testCase)
%**************************************************************************
% PURPOSE
%   - Verify exact final-slice pruning preserves the Dijkstra solution while
%     refusing to store states that cannot satisfy terminal tolerances.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, baselineOptions] = ...
    standardProblem(4);
prunedOptions = baselineOptions;
prunedOptions.pruneNonterminalFinalStates = true;

baselinePlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, baselineOptions);
prunedPlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, prunedOptions);

verifyTrue(testCase, prunedPlan.success, prunedPlan.message);
verifyEqual(testCase, prunedPlan.totalCost, baselinePlan.totalCost);
verifyEqual(testCase, prunedPlan.position_deg, baselinePlan.position_deg);
verifyLessThan(testCase, prunedPlan.generatedStateCount, ...
    baselinePlan.generatedStateCount);
end

function testBackwardDynamicReachabilityPruning(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testBackwardDynamicReachabilityPruning(testCase)
%**************************************************************************
% PURPOSE
%   - Verify obstacle-free backward lattice reachability preserves the
%     solution while pruning states with no remaining jerk sequence.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, baselineOptions] = ...
    standardProblem(4);
prunedOptions = baselineOptions;
prunedOptions.pruneDynamicallyUnreachableStates = true;

baselinePlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, baselineOptions);
prunedPlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, prunedOptions);

verifyTrue(testCase, prunedPlan.success, prunedPlan.message);
verifyEqual(testCase, prunedPlan.totalCost, baselinePlan.totalCost);
verifyEqual(testCase, prunedPlan.position_deg, baselinePlan.position_deg);
verifyGreaterThan(testCase, ...
    prunedPlan.dynamicReachabilityPrunedStateCount, 0);
verifyLessThan(testCase, prunedPlan.generatedStateCount, ...
    baselinePlan.generatedStateCount);
end

function testRejectsIntermediateVelocityLimitViolation(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testRejectsIntermediateVelocityLimitViolation(testCase)
%**************************************************************************
% PURPOSE
%   - Verify velocity limits between otherwise valid transition endpoints.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:1).';
azElData = emptyObstacleData(time_s);
initialState = struct( ...
    "time_s", 0, ...
    "position_deg", [0, 0], ...
    "velocity_deg_s", [1, 0], ...
    "acceleration_deg_s2", [1, 0]);
destinationState = struct( ...
    "time_s", 1, ...
    "position_deg", [1, 0], ...
    "velocity_deg_s", [1, 0], ...
    "acceleration_deg_s2", [-1, 0]);
limits = struct( ...
    "azimuth_deg", [-180, 180], ...
    "elevation_deg", [-2, 2], ...
    "maxVelocity_deg_s", [1, 1], ...
    "maxAcceleration_deg_s2", [1, 1], ...
    "maxJerk_deg_s3", [2, 1]);
options = struct( ...
    "jerkCommands_deg_s3", [-2, 0], ...
    "positionTolerance_deg", [0.25, 0.25], ...
    "velocityTolerance_deg_s", [0.25, 0.25], ...
    "accelerationTolerance_deg_s2", [0.25, 0.25]);

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

verifyFalse(testCase, plan.success);
verifyEqual(testCase, plan.generatedStateCount, 1);
end

function testBinaryHeapFrontierMatchesVisibleScan(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testBinaryHeapFrontierMatchesVisibleScan(testCase)
%**************************************************************************
% PURPOSE
%   - Verify that the optional stable binary heap preserves the original
%     visible minimum-scan Dijkstra result and expansion order.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, scanOptions] = ...
    standardProblem(4);
scanOptions.frontierMethod = "scan";
heapOptions = scanOptions;
heapOptions.frontierMethod = "binaryHeap";

scanPlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, scanOptions);
heapPlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, heapOptions);

verifyTrue(testCase, heapPlan.success, heapPlan.message);
verifyEqual(testCase, heapPlan.frontierMethod, "binaryHeap");
verifyEqual(testCase, heapPlan.totalCost, scanPlan.totalCost);
verifyEqual(testCase, heapPlan.expandedStateCount, ...
    scanPlan.expandedStateCount);
verifyEqual(testCase, heapPlan.generatedStateCount, ...
    scanPlan.generatedStateCount);
verifyEqual(testCase, heapPlan.settledStateIndices, ...
    scanPlan.settledStateIndices);
verifyEqual(testCase, heapPlan.position_deg, scanPlan.position_deg);
verifyEqual(testCase, heapPlan.velocity_deg_s, scanPlan.velocity_deg_s);
verifyEqual(testCase, heapPlan.acceleration_deg_s2, ...
    scanPlan.acceleration_deg_s2);
end

function testDestinationTieBreakerPreservesDijkstraCost(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testDestinationTieBreakerPreservesDijkstraCost(testCase)
%**************************************************************************
% PURPOSE
%   - Verify destination-distance ordering changes only exactly equal-cost
%     scan choices and preserves the successful Dijkstra trajectory cost.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, baselineOptions] = ...
    standardProblem(4);
destinationTieOptions = baselineOptions;
destinationTieOptions.equalCostTieBreaker = "destinationDistance";

baselinePlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, baselineOptions);
destinationTiePlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, ...
    destinationTieOptions);

verifyTrue(testCase, destinationTiePlan.success, ...
    destinationTiePlan.message);
verifyEqual(testCase, destinationTiePlan.equalCostTieBreaker, ...
    "destinationDistance");
verifyEqual(testCase, destinationTiePlan.totalCost, ...
    baselinePlan.totalCost);
verifyLessThanOrEqual(testCase, ...
    destinationTiePlan.expandedStateCount, ...
    baselinePlan.expandedStateCount);
end

function testStaticTopologyTieBreakerPreservesDijkstraCost(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testStaticTopologyTieBreakerPreservesDijkstraCost(testCase)
%**************************************************************************
% PURPOSE
%   - Verify goal-rooted static topology orders only equal-cost states and
%     preserves the successful seven-coordinate Dijkstra trajectory cost.
%   - Verify the exposed static route follows nonincreasing cost-to-go.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Position and topology costs are degrees. Time is seconds.
time_s = (0:6).';
azElData = emptyObstacleData(time_s);
[initialState, destinationState, limits, baselineOptions] = ...
    standardProblem(4);
topologyOptions = baselineOptions;
topologyOptions.equalCostTieBreaker = "staticTopology";

baselinePlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, baselineOptions);
topologyPlan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, topologyOptions);

verifyTrue(testCase, topologyPlan.success, topologyPlan.message);
verifyEqual(testCase, topologyPlan.totalCost, baselinePlan.totalCost);
verifyEqual(testCase, topologyPlan.equalCostTieBreaker, ...
    "staticTopology");
verifyTrue(testCase, topologyPlan.staticTopology.Used);
verifyTrue(testCase, topologyPlan.staticTopology.GeometryIsStatic);
verifyTrue(testCase, ...
    topologyPlan.staticTopology.AppliedAsEqualCostTieBreaker);
verifyTrue(testCase, topologyPlan.staticTopology.Success, ...
    topologyPlan.staticTopology.Message);

pathSubscripts = double( ...
    topologyPlan.staticTopology.InitialPathSubscripts);
pathPositionIndices = sub2ind( ...
    size(topologyPlan.staticTopology.CostToGoal_deg), ...
    pathSubscripts(:, 2), pathSubscripts(:, 1));
pathCostToGoal_deg = ...
    topologyPlan.staticTopology.CostToGoal_deg(pathPositionIndices);
verifyGreaterThan(testCase, numel(pathCostToGoal_deg), 1);
verifyLessThanOrEqual(testCase, max(diff(pathCostToGoal_deg)), 0);
verifyEqual(testCase, pathCostToGoal_deg(end), 0);
end

function testStaticTopologyForbidsDiagonalCornerCutting(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testStaticTopologyForbidsDiagonalCornerCutting(testCase)
%**************************************************************************
% PURPOSE
%   - Verify a diagonal topology edge cannot pass between two occupied
%     cardinal neighbor cells.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Position and topology costs are degrees.
occupiedPosition = false(3, 3);
occupiedPosition(1, 2) = true;
occupiedPosition(2, 1) = true;
topology = buildSimpleAzElStaticTopologyDijkstra( ...
    occupiedPosition, 0:2, 0:2, 1, 1, 3, 3, false);

verifyTrue(testCase, topology.Used);
verifyFalse(testCase, topology.Success);
verifyEqual(testCase, topology.InitialCostToGoal_deg, Inf);
verifyEmpty(testCase, topology.InitialPathSubscripts);
end

function [initialState, destinationState, limits, options] = ...
        standardProblem(destinationTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   [initialState, destinationState, limits, options] = ...
%       standardProblem(destinationTime_s)
%**************************************************************************
% PURPOSE
%   - Create one compact, deterministic kinodynamic planning fixture.
%**************************************************************************
% INPUTS
%   - destinationTime_s (numeric scalar)
%       Exact destination time.
%**************************************************************************
% OUTPUTS
%   - initialState, destinationState (scalar structs)
%       Complete endpoint states.
%   - limits, options (scalar structs)
%       Physical limits and planner lattice options.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
initialState = struct( ...
    "time_s", 0, ...
    "position_deg", [0, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
destinationState = struct( ...
    "time_s", destinationTime_s, ...
    "position_deg", [2, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
limits = struct( ...
    "azimuth_deg", [-180, 180], ...
    "elevation_deg", [-2, 2], ...
    "maxVelocity_deg_s", [2, 1], ...
    "maxAcceleration_deg_s2", [1, 1], ...
    "maxJerk_deg_s3", [1, 1]);
options = struct( ...
    "timeStep_s", 1, ...
    "positionStep_deg", [1, 1], ...
    "velocityStep_deg_s", [0.5, 1], ...
    "accelerationStep_deg_s2", [1, 1], ...
    "jerkCommands_deg_s3", [-1, 0; 0, 0; 1, 0], ...
    "positionTolerance_deg", [0.25, 0.25], ...
    "velocityTolerance_deg_s", [0.25, 0.25], ...
    "accelerationTolerance_deg_s2", [0.25, 0.25], ...
    "collisionCheckStep_s", 0.2, ...
    "maximumGeneratedStates", 10000, ...
    "maximumExpandedStates", 10000);
end

function azElData = emptyObstacleData(time_s)
%% Section 0: Header & Readme
% SYNTAX
%   azElData = emptyObstacleData(time_s)
%**************************************************************************
% PURPOSE
%   - Create canonical time samples containing no occupied polygons.
%**************************************************************************
% INPUTS
%   - time_s (numeric vector)
%       Strictly increasing obstacle sample times.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Canonical empty moving-obstacle record.
%**************************************************************************
% UNITS
%   - time_s is seconds and empty boundaries are degrees.
emptyBoundaries_deg = repmat({zeros(0, 1)}, numel(time_s), 1);
azElData = makeAzElObstacleData( ...
    "Empty", time_s, emptyBoundaries_deg, emptyBoundaries_deg);
end
