function tests = testAzElDijkstra
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElDijkstra.m")
%**************************************************************************
% PURPOSE
%   - Verify the compatibility facade and unified planner result schema.
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

function testDirectPathUsesUnifiedPipeline(testCase)
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
verifyFalse(testCase, plan.optimalGlobally);
verifyTrue(testCase, plan.optimalOnLattice);
verifyEqual(testCase, plan.angularPathLength_deg, 8, "AbsTol", 1e-9);
verifyEqual(testCase, plan.selectedGridStep_deg, 1);
verifyEqual(testCase, plan.method, ...
    "reverseDijkstraForwardKinodynamicAStar");
verifyTrue(testCase, plan.diagnostics.reverseDijkstra.executed);
verifyTrue(testCase, plan.diagnostics.forwardAStar.executed);
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
verifyEqual(testCase, plan.method, ...
    "reverseDijkstraForwardKinodynamicAStar");
verifyTrue(testCase, plan.diagnostics.reverseDijkstra.executed);
verifyTrue(testCase, plan.diagnostics.forwardAStar.executed);
verifyGreaterThan(testCase, ...
    plan.diagnostics.forwardAStar.propagationAttempts, 0);
verifyPlan(testCase, plan);
end

function testMovingGeometryStillUsesUnifiedPipeline(testCase)
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
verifyEqual(testCase, plan.method, ...
    "reverseDijkstraForwardKinodynamicAStar");
verifyFalse(testCase, plan.optimalGlobally);
verifyEqual(testCase, plan.angularPathLength_deg, 8, "AbsTol", 1e-9);
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
verifyLessThanOrEqual(testCase, ...
    max(abs(plan.jerk_deg_s3), [], 1), ...
    plan.options.MaxJerk_deg_s3 + 1e-8);
verifyTrue(testCase, plan.validation.passed);
verifyTrue(testCase, plan.validation.collisionFree);
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
