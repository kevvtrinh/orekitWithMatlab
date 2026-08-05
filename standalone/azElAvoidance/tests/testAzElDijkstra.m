function tests = testAzElDijkstra
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElDijkstra.m")
%**************************************************************************
% PURPOSE
%   - Verify maintained static/dynamic Dijkstra behavior and public schemas.
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

function testDirectPathUsesExactCertificate(testCase)
time_s = (0:10).';
empty = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData("Empty", time_s, empty, empty);
[startState, stopState, limits] = standardProblem(10);

plan = planAzElDijkstra( ...
    data, startState, stopState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "Objective", "minimumAngularDistance", ...
    "GridStepSchedule_deg", [4 2 1]));

verifyTrue(testCase, plan.success);
verifyTrue(testCase, plan.optimalGlobally);
verifyEqual(testCase, plan.angularPathLength_deg, 8, "AbsTol", 1e-9);
verifyEqual(testCase, plan.selectedGridStep_deg, 4);
verifyPlan(testCase, plan);
end

function testMovingWallProducesDynamicDetour(testCase)
time_s = (0:20).';
azimuth = cell(numel(time_s), 1);
elevation = cell(numel(time_s), 1);
for sampleIndex = 1:numel(time_s)
    centerElevation_deg = 0.35 * sin(time_s(sampleIndex) / 3);
    azimuth{sampleIndex} = [-1; 1; 1; -1; -1];
    elevation{sampleIndex} = centerElevation_deg + ...
        [-2; -2; 2; 2; -2];
end
data = makeAzElObstacleData( ...
    "Moving wall", time_s, azimuth, elevation);
[startState, stopState, limits] = standardProblem(20);

plan = planAzElDijkstra( ...
    data, startState, stopState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "GridStepSchedule_deg", [2 1], ...
    "SafetyMargin_deg", 0.1, ...
    "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyGreaterThan(testCase, plan.angularPathLength_deg, 8);
verifyGreaterThan(testCase, plan.expandedNodeCount, 0);
verifyEqual(testCase, plan.method, "progressiveSafeIntervalDijkstra");
verifyEqual(testCase, ...
    plan.safeIntervalSearch.Method, "adaptiveSafeIntervalDijkstra");
verifyPlan(testCase, plan);
end

function testMovingGeometryAllowsDirectDynamicCertificate(testCase)
time_s = (0:0.5:20).';
azimuth = repmat({zeros(0, 1)}, numel(time_s), 1);
elevation = repmat({zeros(0, 1)}, numel(time_s), 1);
azimuth{2} = [-9; -8; -8; -9; -9];
elevation{2} = [3; 3; 4; 4; 3];
data = makeAzElObstacleData( ...
    "Irrelevant moving obstacle", time_s, azimuth, elevation);
[initialState, goalState, limits] = standardProblem(20);

plan = planAzElDijkstra(data, initialState, goalState, ...
    limits, struct("SampleTime_s", 0.25, ...
    "GridStepSchedule_deg", [2 1], "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.method, "progressiveSafeIntervalDijkstra");
verifyTrue(testCase, plan.optimalGlobally);
verifyEqual(testCase, plan.angularPathLength_deg, 8, "AbsTol", 1e-9);
verifyPlan(testCase, plan);
end

function testPathFirstMotionAppliesKinematicsBeforeReturning(testCase)
% The obstacle changes shape, so this is a time-aware scene, but it remains
% far from the route. Path-first motion should therefore keep its spatial
% route after the kinematic and moving-obstacle checks.
time_s = (0:0.5:20).';
azimuth = repmat({zeros(0, 1)}, numel(time_s), 1);
elevation = repmat({zeros(0, 1)}, numel(time_s), 1);
azimuth{2} = [-9; -8; -8; -9; -9];
elevation{2} = [3; 3; 4; 4; 3];
data = makeAzElObstacleData( ...
    "Irrelevant moving obstacle", time_s, azimuth, elevation);
[initialState, goalState, limits] = standardProblem(20);

plan = planAzElDijkstra(data, initialState, goalState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "GridStepSchedule_deg", [2 1], ...
    "MotionMode", "path-first-then-kinematic", ...
    "FallbackToProfile", true, ...
    "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.method, "pathFirstThenKinematicDijkstra");
verifyEqual(testCase, ...
    plan.motionPlanning.RequestedMode, "pathFirstThenKinematic");
verifyEqual(testCase, ...
    plan.motionPlanning.SelectedMode, "pathFirstThenKinematic");
verifyTrue(testCase, plan.motionPlanning.PathFirstAttempted);
verifyTrue(testCase, plan.motionPlanning.PathFirstSucceeded);
verifyFalse(testCase, plan.motionPlanning.FallbackUsed);
verifyNotEmpty(testCase, ...
    plan.motionPlanning.PathFirstResolutionAttempts);
verifyPlan(testCase, plan);
end

function testPathFirstMotionFallsBackToProfile(testCase)
% The opening snapshot has a clear direct path. The obstacle then crosses
% that path while an immediate slew is in progress. Path-first validation
% must reject the command, after which the profile search may wait until the
% crossing is over.
[data, initialState, goalState, limits] = crossingObstacleProblem();

plan = planAzElDijkstra(data, initialState, goalState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "GridStepSchedule_deg", [2 1], ...
    "MotionMode", "pathFirstThenKinematic", ...
    "FallbackToProfile", true, ...
    "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.method, "progressiveSafeIntervalDijkstra");
verifyEqual(testCase, plan.motionPlanning.SelectedMode, "profile");
verifyTrue(testCase, plan.motionPlanning.PathFirstAttempted);
verifyFalse(testCase, plan.motionPlanning.PathFirstSucceeded);
verifyTrue(testCase, plan.motionPlanning.FallbackUsed);
verifyNotEmpty(testCase, plan.motionPlanning.PathFirstMessage);
verifyPlan(testCase, plan);
end

function testPathFirstMotionCanDisableProfileFallback(testCase)
[data, initialState, goalState, limits] = crossingObstacleProblem();

plan = planAzElDijkstra(data, initialState, goalState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "GridStepSchedule_deg", [2 1], ...
    "MotionMode", "pathFirstThenKinematic", ...
    "FallbackToProfile", false, ...
    "PrintFailureSuggestions", false, ...
    "MaxSearchTime_s", 8));

verifyFalse(testCase, plan.success);
verifyEqual(testCase, plan.method, "pathFirstThenKinematicDijkstra");
verifyFalse(testCase, plan.motionPlanning.FallbackEnabled);
verifyFalse(testCase, plan.motionPlanning.FallbackUsed);
verifyTrue(testCase, plan.motionPlanning.PathFirstAttempted);
verifyFalse(testCase, plan.motionPlanning.PathFirstSucceeded);
verifyTrue(testCase, contains(plan.message, "fallback is disabled"));
end

function testPathStateSpaceCarriesVelocityThroughOneSearch(testCase)
time_s = (0:0.25:10).';
emptyBoundary = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData( ...
    "Empty physical-state scene", time_s, emptyBoundary, emptyBoundary);
[initialState, goalState, limits] = standardProblem(10);

plan = planAzElDijkstra(data, initialState, goalState, limits, struct( ...
    "SampleTime_s", 0.05, ...
    "GridStep_deg", 1, ...
    "GridStepSchedule_deg", 1, ...
    "AllowAzimuthWrap", false, ...
    "MotionMode", "pathStateSpaceKinematic", ...
    "KinematicTimeStep_s", 1, ...
    "KinematicProgressStep_deg", 0.5, ...
    "FallbackToProfile", false, ...
    "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.method, "pathStateSpaceKinematicDijkstra");
verifyEqual(testCase, ...
    plan.motionPlanning.SelectedMode, "pathStateSpaceKinematic");
verifyTrue(testCase, plan.motionPlanning.StateSpaceAttempted);
verifyTrue(testCase, plan.motionPlanning.StateSpaceSucceeded);
verifyNotEmpty(testCase, plan.motionPlanning.StateSpaceMessage);
verifyEqual(testCase, ...
    plan.retiming.MinimumManeuverTime_s, 6, "AbsTol", 1e-12);
stateSearch = plan.retiming.StateSpaceSearch;
verifyEqual(testCase, numel(stateSearch.StateDimensionNames), 5);
progressResidual_deg = diff(stateSearch.ProgressDistance_deg) - ...
    0.5 * (stateSearch.PathSpeed_deg_s(1:end - 1) + ...
    stateSearch.PathSpeed_deg_s(2:end)) * stateSearch.TimeStep_s;
velocityResidual_deg_s = diff(stateSearch.PathSpeed_deg_s) - ...
    stateSearch.AccelerationCommand_deg_s2 * stateSearch.TimeStep_s;
verifyLessThanOrEqual(testCase, max(abs(progressResidual_deg)), 1e-12);
verifyLessThanOrEqual(testCase, max(abs(velocityResidual_deg_s)), 1e-12);
movingIndices = find(~plan.isWaiting);
verifyFalse(testCase, any(plan.isWaiting( ...
    movingIndices(1):movingIndices(end))));
verifyPlan(testCase, plan);
end

function testWrappedAzimuthUsesShortChord(testCase)
time_s = (0:20).';
empty = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData("Empty", time_s, empty, empty);
startState = boundaryState(0, [170 0]);
stopState = boundaryState(20, [-170 0]);
limits = struct( ...
    "azimuth_deg", [-180 180], ...
    "elevation_deg", [-10 10], ...
    "maxVelocity_deg_s", [2 2], ...
    "maxAcceleration_deg_s2", [1 1]);

plan = planAzElDijkstra( ...
    data, startState, stopState, limits, struct( ...
    "SampleTime_s", 0.25, ...
    "AllowAzimuthWrap", true));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, plan.angularPathLength_deg, 20, "AbsTol", 1e-9);
verifyEqual(testCase, plan.positionUnwrapped_deg(end, 1), ...
    190, "AbsTol", 1e-9);
verifyPlan(testCase, plan);
end

function testEnabledTerminalCaptureMatchesNonzeroRate(testCase)
time_s = (0:10).';
empty = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData("Empty", time_s, empty, empty);
startState = boundaryState(0, [0 0]);
stopState = boundaryState(10, [5 0]);
stopState.velocity_deg_s = [0.5 0];
limits = struct( ...
    "azimuth_deg", [-10 10], ...
    "elevation_deg", [-5 5], ...
    "maxVelocity_deg_s", [2 2], ...
    "maxAcceleration_deg_s2", [1 1]);

plan = planAzElDijkstra( ...
    data, startState, stopState, limits, struct( ...
    "AllowNonzeroTerminalState", true, ...
    "SampleTime_s", 0.1, ...
    "GridStepSchedule_deg", 1, ...
    "MaxSearchTime_s", 8));

verifyTrue(testCase, plan.success);
verifyEqual(testCase, ...
    plan.position_deg(end, :), [5 0], "AbsTol", 1e-9);
verifyEqual(testCase, ...
    plan.velocity_deg_s(end, :), [0.5 0], "AbsTol", 1e-9);
verifyEqual(testCase, ...
    plan.acceleration_deg_s2(end, :), [0 0], "AbsTol", 1e-9);
verifyPlan(testCase, plan);
end

function testObstacleFieldMigrationAndDefaults(testCase)
time_s = [0; 10];
data = makeAzElObstacleData("remote", time_s, ...
    [40; 45; 45; 40; 40], [20; 20; 25; 25; 20]);

fieldOptions = buildAzElTimeObstacleField();
verifyEqual(testCase, fieldOptions.MaximumVerticesPerRegion, 64);
obstacleField = buildAzElTimeObstacleField(data);
verifyEqual(testCase, obstacleField.Format, "AzElTimeObstacleField");

forwardedField = buildAzElTimeObstacleWorkspace(data);
verifyEqual(testCase, forwardedField.Format, "AzElTimeObstacleField");
verifyEqual(testCase, forwardedField.Obstacles, obstacleField.Obstacles);

legacyField = obstacleField;
legacyField.Format = "AzElTimeObstacleWorkspace";
verifyFalse(testCase, queryAzElTimeObstacle( ...
    legacyField, 0, 0, 5));
queryOptions = queryAzElTimeObstacle();
verifyEqual(testCase, queryOptions.CollisionMode, "polygon");

[startState, stopState, limits] = standardProblem(10);
plannerDefaults = planAzElDijkstra(limits, "defaults");
verifyTrue(testCase, isfield(plannerDefaults, "AllowAzimuthWrap"));
verifyEqual(testCase, plannerDefaults.MotionMode, "profile");
verifyEqual(testCase, plannerDefaults.PathFirstTimeScaling, "minimumJerk");
verifyEqual(testCase, plannerDefaults.KinematicTimeStep_s, 0.5);
verifyEqual(testCase, plannerDefaults.KinematicProgressStep_deg, 0.25);
verifyTrue(testCase, plannerDefaults.FallbackToProfile);
plan = planAzElDijkstra(obstacleField, startState, stopState, limits, ...
    struct("GridStep_deg", 5, "GridStepSchedule_deg", 5, ...
    "MaxSearchTime_s", 5, "PrintFailureSuggestions", false));
verifyTrue(testCase, isfield(plan, "obstacleField"));
verifyTrue(testCase, isfield(plan, "workspace"));
verifyEqual(testCase, plan.workspace, plan.obstacleField);
end

function verifyPlan(testCase, plan)
blocked = queryAzElTimeObstacle(plan.obstacleField, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct( ...
    "SafetyMarginDeg", plan.options.SafetyMargin_deg, ...
    "TimePaddingSamples", plan.options.TimePaddingSamples));
verifyFalse(testCase, any(blocked));
verifyLessThanOrEqual(testCase, ...
    max(abs(plan.velocity_deg_s), [], 1), ...
    plan.limits.maxVelocity_deg_s + 1e-8);
verifyLessThanOrEqual(testCase, ...
    max(abs(plan.acceleration_deg_s2), [], 1), ...
    plan.limits.maxAcceleration_deg_s2 + 1e-8);
end

function [startState, stopState, limits] = standardProblem(stopTime)
startState = boundaryState(0, [-4 0]);
stopState = boundaryState(stopTime, [4 0]);
limits = struct( ...
    "azimuth_deg", [-10 10], ...
    "elevation_deg", [-5 5], ...
    "maxVelocity_deg_s", [2 2], ...
    "maxAcceleration_deg_s2", [1 1]);
end

function state = boundaryState(time_s, position)
state = struct( ...
    "time_s", time_s, ...
    "position_deg", position, ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0]);
end

function [data, initialState, goalState, limits] = ...
        crossingObstacleProblem()
% The obstacle starts beyond the goal, crosses the direct chord near the
% time an immediate slew reaches its center, and leaves early enough that a
% wait-then-slew profile still meets the deadline.
time_s = [0; 3; 6; 20];
azimuth = { ...
    [7; 8; 8; 7; 7]; ...
    [-1; 1; 1; -1; -1]; ...
    [7; 8; 8; 7; 7]; ...
    [7; 8; 8; 7; 7]};
elevation = repmat({[-1; -1; 1; 1; -1]}, numel(time_s), 1);
data = makeAzElObstacleData( ...
    "Crossing obstacle", time_s, azimuth, elevation);
[initialState, goalState, limits] = standardProblem(20);
end
