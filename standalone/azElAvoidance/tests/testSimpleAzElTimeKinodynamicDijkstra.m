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
