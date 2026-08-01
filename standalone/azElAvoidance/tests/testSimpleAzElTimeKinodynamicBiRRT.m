function tests = testSimpleAzElTimeKinodynamicBiRRT
%% Section 0: Header & Readme
% SYNTAX
%   tests = testSimpleAzElTimeKinodynamicBiRRT
%**************************************************************************
% PURPOSE
%   - Verify the simple bidirectional RRT time direction, propagation,
%     collision checks, wrapping, reconstruction, and visualization.
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
%   - Add the standalone planner, examples, and support files to the path.
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

function testDefaultOptionsExposeSimpleControls(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testDefaultOptionsExposeSimpleControls(testCase)
%**************************************************************************
% PURPOSE
%   - Verify the documented sampling, connection, and collision controls.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - None.
options = planSimpleAzElTimeKinodynamicBiRRT();
verifyTrue(testCase, isfield(options, "DestinationSampleProbability"));
verifyTrue(testCase, isfield(options, "CollisionCheckStep_s"));
verifyTrue(testCase, isfield(options, ...
    "ConnectionPositionTolerance_deg"));
verifyTrue(testCase, isfield(options, ...
    "ConnectionVelocityTolerance_deg_s"));
verifyTrue(testCase, isfield(options, ...
    "ConnectionAccelerationTolerance_deg_s2"));
end

function testForwardAndBackwardTreesConnect(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testForwardAndBackwardTreesConnect(testCase)
%**************************************************************************
% PURPOSE
%   - Verify an exact jerk-reachable motion and inspect both tree schemas.
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
[azElData, initialState, destinationState, limits, options] = ...
    reachableProblem(0, 3);
options.AllowAzimuthWrap = false;
plan = planSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyTrue(testCase, plan.forwardDynamicsValidated);
verifyTrue(testCase, plan.exactCollisionValidated);
verifyFalse(testCase, plan.continuousCollisionGuaranteed);
verifyGreaterThan(testCase, plan.connectionNodeIndices(1), 0);
verifyGreaterThan(testCase, plan.connectionNodeIndices(2), 0);
verifyEqual(testCase, plan.time_s, (0:5).');
verifyEqual(testCase, plan.position_deg(1, :), [0, 0], ...
    "AbsTol", 1e-12);
verifyEqual(testCase, plan.position_deg(end, :), [3, 0], ...
    "AbsTol", 1e-12);
verifyEqual(testCase, plan.initialTree.SearchDirection, "forward");
verifyEqual(testCase, plan.destinationTree.SearchDirection, "backward");
verifyEqual(testCase, size(plan.initialTree.State, 2), 7);
verifyEqual(testCase, size(plan.destinationTree.State, 2), 7);
verifyEqual(testCase, size(plan.initialTree.AppliedJerk_deg_s3, 2), 2);
verifyEqual(testCase, size(plan.destinationTree.AppliedJerk_deg_s3, 2), 2);
end

function testDestinationTreeEdgesReproduceParentsForward(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testDestinationTreeEdgesReproduceParentsForward(testCase)
%**************************************************************************
% PURPOSE
%   - Verify reverse growth stores controls that reproduce parents using
%     the ordinary forward constant-jerk equations.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - State units follow the planner.
[azElData, initialState, destinationState, limits, options] = ...
    reachableProblem(0, 3);
plan = planSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, initialState, destinationState, limits, options);
verifyTrue(testCase, plan.success, plan.message);

tree = plan.destinationTree;
for nodeIndex = 2:tree.NodeCount
    childState = tree.State(nodeIndex, :);
    parentNodeIndex = double(tree.ParentNodeIndex(nodeIndex));
    parentState = tree.State(parentNodeIndex, :);
    edgeDuration_s = tree.EdgeDuration_s(nodeIndex);
    appliedJerk_deg_s3 = tree.AppliedJerk_deg_s3(nodeIndex, :);
    predictedAcceleration_deg_s2 = childState(6:7) + ...
        appliedJerk_deg_s3 * edgeDuration_s;
    predictedVelocity_deg_s = childState(4:5) + ...
        childState(6:7) * edgeDuration_s + ...
        0.5 * appliedJerk_deg_s3 * edgeDuration_s^2;
    predictedPosition_deg = childState(2:3) + ...
        childState(4:5) * edgeDuration_s + ...
        0.5 * childState(6:7) * edgeDuration_s^2 + ...
        (1 / 6) * appliedJerk_deg_s3 * edgeDuration_s^3;
    predictedPosition_deg(1) = limits.azimuth_deg(1) + mod( ...
        predictedPosition_deg(1) - limits.azimuth_deg(1), 360);
    verifyLessThan(testCase, childState(1), parentState(1));
    verifyEqual(testCase, childState(1) + edgeDuration_s, ...
        parentState(1), "AbsTol", 1e-12);
    verifyEqual(testCase, predictedPosition_deg, parentState(2:3), ...
        "AbsTol", 1e-10);
    verifyEqual(testCase, predictedVelocity_deg_s, parentState(4:5), ...
        "AbsTol", 1e-10);
    verifyEqual(testCase, predictedAcceleration_deg_s2, ...
        parentState(6:7), "AbsTol", 1e-10);
end
end

function testTrueHoldAndWaitingClassification(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testTrueHoldAndWaitingClassification(testCase)
%**************************************************************************
% PURPOSE
%   - Verify that zero jerk is called waiting only with zero dynamics and
%     unchanged position.
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
time_s = (0:3).';
azElData = emptyObstacleData(time_s);
initialState = boundaryState(0, [0, 0]);
destinationState = boundaryState(3, [0, 0]);
limits = standardLimits();
options = struct( ...
    "JerkCommands_deg_s3", [0, 0], ...
    "MaximumIterations", 20, ...
    "MaximumTreeNodes", 20, ...
    "RandomSeed", 1);

plan = planSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, initialState, destinationState, limits, options);
verifyTrue(testCase, plan.success, plan.message);
verifyFalse(testCase, plan.isWaiting(1));
verifyTrue(testCase, all(plan.isWaiting(2:end)));
verifyEqual(testCase, plan.velocity_deg_s, zeros(4, 2));
verifyEqual(testCase, plan.acceleration_deg_s2, zeros(4, 2));
verifyEqual(testCase, plan.jerk_deg_s3, zeros(4, 2));
end

function testMovingObstacleRejectsHoldingEdges(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testMovingObstacleRejectsHoldingEdges(testCase)
%**************************************************************************
% PURPOSE
%   - Verify interior collision samples reject both forward and reverse
%     holding edges even though both boundary states are collision free.
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
time_s = (0:3).';
azimuthBoundaryByTime_deg = repmat({zeros(0, 1)}, 4, 1);
elevationBoundaryByTime_deg = repmat({zeros(0, 1)}, 4, 1);
blockingAzimuth_deg = [-1; 1; 1; -1; -1];
blockingElevation_deg = [-1; -1; 1; 1; -1];
azimuthBoundaryByTime_deg{2} = blockingAzimuth_deg;
azimuthBoundaryByTime_deg{3} = blockingAzimuth_deg;
elevationBoundaryByTime_deg{2} = blockingElevation_deg;
elevationBoundaryByTime_deg{3} = blockingElevation_deg;
azElData = makeAzElObstacleData("Appearing blocker", time_s, ...
    azimuthBoundaryByTime_deg, elevationBoundaryByTime_deg);
initialState = boundaryState(0, [0, 0]);
destinationState = boundaryState(3, [0, 0]);
limits = standardLimits();
options = struct( ...
    "JerkCommands_deg_s3", [0, 0], ...
    "MaximumIterations", 20, ...
    "MaximumTreeNodes", 20, ...
    "RandomSeed", 1);

plan = planSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, initialState, destinationState, limits, options);
verifyFalse(testCase, plan.success);
verifyGreaterThan(testCase, plan.rejectedNodeCount, 0);
verifyEmpty(testCase, plan.time_s);
verifyFalse(testCase, plan.exactCollisionValidated);
end

function testWrappedAzimuthReconstruction(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testWrappedAzimuthReconstruction(testCase)
%**************************************************************************
% PURPOSE
%   - Verify search distance, propagation, and output cross the azimuth
%     seam without duplicating the search domain.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Azimuth is degrees.
[azElData, initialState, destinationState, limits, options] = ...
    reachableProblem(179, -178);
options.RandomSeed = 14;
plan = planSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, initialState, destinationState, limits, options);

verifyTrue(testCase, plan.success, plan.message);
verifyEqual(testCase, plan.position_deg(end, 1), -178, ...
    "AbsTol", 1e-12);
verifyEqual(testCase, plan.positionUnwrapped_deg(end, 1), 182, ...
    "AbsTol", 1e-10);
verifyTrue(testCase, all(plan.position_deg(:, 1) >= -180));
verifyTrue(testCase, all(plan.position_deg(:, 1) < 180));
end

function testExampleAndPlotter(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testExampleAndPlotter(testCase)
%**************************************************************************
% PURPOSE
%   - Verify the shipped example and headless tree visualization execute.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - None.
plan = example_simple_azEl_time_kinodynamic_birrt(false);
verifyTrue(testCase, plan.success, plan.message);

time_s = (0:5).';
azElData = emptyObstacleData(time_s);
figureHandle = figure("Visible", "off");
cleanup = onCleanup(@() close(figureHandle));
handles = plotSimpleAzElTimeKinodynamicBiRRT( ...
    azElData, plan, struct("Figure", figureHandle));
verifyTrue(testCase, isgraphics(handles.Axes, "axes"));
verifyTrue(testCase, isgraphics(handles.Trajectory, "line"));
end

function [azElData, initialState, destinationState, limits, options] = ...
        reachableProblem(initialAzimuth_deg, destinationAzimuth_deg)
%% Section 0: Header & Readme
% SYNTAX
%   [azElData, initialState, destinationState, limits, options] = ...
%       reachableProblem(initialAzimuth, destinationAzimuth)
%**************************************************************************
% PURPOSE
%   - Create a deterministic five-step rest-to-rest jerk-reachable problem.
%**************************************************************************
% INPUTS
%   - initialAzimuth_deg, destinationAzimuth_deg (numeric scalars)
%       Boundary azimuths separated by three wrapped degrees.
%**************************************************************************
% OUTPUTS
%   - azElData, initialState, destinationState, limits, options
%       Complete planner inputs.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:5).';
azElData = emptyObstacleData(time_s);
initialState = boundaryState(0, [initialAzimuth_deg, 0]);
destinationState = boundaryState(5, [destinationAzimuth_deg, 0]);
limits = standardLimits();
options = struct( ...
    "JerkCommands_deg_s3", [-1, 0; 0, 0; 1, 0], ...
    "DestinationSampleProbability", 0.3, ...
    "MaximumIterations", 500, ...
    "MaximumTreeNodes", 500, ...
    "RandomSeed", 2);
end

function azElData = emptyObstacleData(time_s)
%% Section 0: Header & Readme
% SYNTAX
%   azElData = emptyObstacleData(time_s)
%**************************************************************************
% PURPOSE
%   - Create a canonical obstacle record with no occupied polygons.
%**************************************************************************
% INPUTS
%   - time_s (numeric column vector)
%       Obstacle sample times.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Canonical empty moving obstacle.
%**************************************************************************
% UNITS
%   - Time is seconds.
emptyBoundaryByTime = repmat({zeros(0, 1)}, numel(time_s), 1);
azElData = makeAzElObstacleData( ...
    "Empty", time_s, emptyBoundaryByTime, emptyBoundaryByTime);
end

function state = boundaryState(time_s, position_deg)
%% Section 0: Header & Readme
% SYNTAX
%   state = boundaryState(time_s, position_deg)
%**************************************************************************
% PURPOSE
%   - Construct a zero-velocity, zero-acceleration boundary state.
%**************************************************************************
% INPUTS
%   - time_s (numeric scalar)
%       Boundary time.
%   - position_deg (1-by-2 numeric row)
%       Azimuth and elevation.
%**************************************************************************
% OUTPUTS
%   - state (scalar struct)
%       Planner boundary state.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
state = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
end

function limits = standardLimits()
%% Section 0: Header & Readme
% SYNTAX
%   limits = standardLimits()
%**************************************************************************
% PURPOSE
%   - Return compact limits shared by the focused planner tests.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - limits (scalar struct)
%       Planner limits.
%**************************************************************************
% UNITS
%   - Limit names carry their physical units.
limits = struct( ...
    "azimuth_deg", [-180, 180], ...
    "elevation_deg", [-10, 10], ...
    "maxVelocity_deg_s", [3, 3], ...
    "maxAcceleration_deg_s2", [2, 2], ...
    "maxJerk_deg_s3", [1, 1]);
end
