function tests = testAzElFailureGuidance
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElFailureGuidance.m")
%**************************************************************************
% PURPOSE
%   - Verify evidence-ranked failure diagnoses and suggested recovery actions.
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

function testImpossibleDeadlineReportsKinematicLowerBound(testCase)
data = emptyObstacleData((0:1).'); %#ok<NASGU>
startState = boundaryState(0, [-4 0]);
stopState = boundaryState(1, [4 0]);
limits = standardLimits(); %#ok<NASGU>

output = evalc("plan = planAzElDijkstra( " + ...
    "data, startState, stopState, limits, struct( " + ...
    "'GridStepSchedule_deg', 2, 'MaxSearchTime_s', 2));");

verifyFalse(testCase, plan.success);
verifyEqual(testCase, ...
    plan.failureAssessment.viability, "unlikelyWithCurrentInputs");
verifyEqual(testCase, ...
    plan.failureAssessment.reasonCode, "kinematicallyUnreachable");
verifyGreaterThan(testCase, ...
    plan.failureAssessment.minimumObstacleFreeTime_s, ...
    stopState.time_s - startState.time_s);
verifyTrue(testCase, contains(output, "Not viable"));
verifyTrue(testCase, contains(output, "lower bound"));
end

function testExpiredSearchBudgetSaysRouteMayStillBeViable(testCase)
time_s = (0:20).';
azimuth = cell(numel(time_s), 1);
elevation = cell(numel(time_s), 1);
for sampleIndex = 1:numel(time_s)
    centerElevation_deg = 0.25 * sin(time_s(sampleIndex));
    azimuth{sampleIndex} = [-1; 1; 1; -1; -1];
    elevation{sampleIndex} = centerElevation_deg + ...
        [-2; -2; 2; 2; -2];
end
data = makeAzElObstacleData( ...
    "Moving wall", time_s, azimuth, elevation); %#ok<NASGU>
startState = boundaryState(0, [-4 0]); %#ok<NASGU>
stopState = boundaryState(20, [4 0]); %#ok<NASGU>
limits = standardLimits(); %#ok<NASGU>

output = evalc("plan = planAzElDijkstra( " + ...
    "data, startState, stopState, limits, struct( " + ...
    "'GridStepSchedule_deg', [2 1], " + ...
    "'MaxSearchTime_s', 1e-6));");

verifyFalse(testCase, plan.success);
verifyEqual(testCase, ...
    plan.failureAssessment.viability, "likelyViable");
verifyEqual(testCase, ...
    plan.failureAssessment.reasonCode, "searchTimeLimit");
verifyTrue(testCase, contains(output, "may still be viable"));
verifyTrue(testCase, contains(output, "MaxSearchTime_s"));
end

function testMovingTargetOutsideLimitsExplainsCurrentInfeasibility(testCase)
time_s = (0:10).';
data = emptyObstacleData(time_s); %#ok<NASGU>
startState = boundaryState(0, [0 0]); %#ok<NASGU>
target = struct( ...
    "time_s", time_s, ...
    "position_deg", [50 + 0 * time_s, 0 * time_s]); %#ok<NASGU>
limits = standardLimits(); %#ok<NASGU>
options = struct( ...
    "EarliestInterceptTime_s", 2, ...
    "LatestInterceptTime_s", 8, ...
    "InterceptTimeStep_s", 1); %#ok<NASGU>

output = evalc("plan = planAzElMovingTargetIntercept( " + ...
    "data, startState, target, limits, options);");

verifyFalse(testCase, plan.success);
verifyEqual(testCase, plan.interceptFilter.insideLimitCount, 0);
verifyEqual(testCase, ...
    plan.failureAssessment.reasonCode, "targetOutsideLimits");
verifyEqual(testCase, ...
    plan.failureAssessment.viability, "unlikelyWithCurrentInputs");
verifyTrue(testCase, contains(output, "allowed azimuth/elevation bounds"));
end

function testPrintingCanBeDisabledForProgrammaticBatchRuns(testCase)
data = emptyObstacleData((0:1).'); %#ok<NASGU>
startState = boundaryState(0, [-4 0]); %#ok<NASGU>
stopState = boundaryState(1, [4 0]); %#ok<NASGU>
limits = standardLimits(); %#ok<NASGU>

output = evalc("plan = planAzElDijkstra( " + ...
    "data, startState, stopState, limits, struct( " + ...
    "'GridStepSchedule_deg', 2, 'MaxSearchTime_s', 2, " + ...
    "'PrintFailureSuggestions', false));");

verifyFalse(testCase, plan.success);
verifyTrue(testCase, isfield(plan, "failureAssessment"));
verifyEqual(testCase, strlength(strtrim(output)), 0);
end

function data = emptyObstacleData(time_s)
empty = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData("Empty", time_s, empty, empty);
end

function limits = standardLimits()
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
