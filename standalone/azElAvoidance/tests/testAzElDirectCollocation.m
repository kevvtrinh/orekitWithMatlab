function tests = testAzElDirectCollocation
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElDirectCollocation.m")
%**************************************************************************
% PURPOSE
%   - Verify direct-collocation coordinate and clock policy independently
%     from obstacle packing and trajectory sampling.
%**************************************************************************
% INPUTS
%   - None; MATLAB supplies local function-test fixtures.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by functiontests.
%**************************************************************************
% UNITS
%   - The synthetic evaluator uses arbitrary consistent units.

%% Section 1: Register Local Tests
tests = functiontests(localfunctions);
end

function setupOnce(~)
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(packageRoot);
end

function testCoordinateAndClockPolicyImproveABentSeed(testCase)
seed = struct( ...
    "Blend", 0, ...
    "TimeScale", 1, ...
    "NodeTime_s", [0; 0.5; 1], ...
    "Position_deg", [0 0; 0.5 1; 1 0], ...
    "Velocity_deg_s", zeros(3, 2), ...
    "Acceleration_deg_s2", zeros(3, 2), ...
    "PathLength_deg", 2 * hypot(0.5, 1), ...
    "CompletionDuration_s", 1, ...
    "CombinedRatio", 1 + 2 * hypot(0.5, 1), ...
    "MaximumJerkRatio", 0.1);
options = struct( ...
    "ParetoRefinementCandidateBudget", 12, ...
    "ParetoRefinementCoordinateMoveFractions", [0.5 1], ...
    "ParetoRefinementCoordinatePassCount", 1, ...
    "ParetoRefinementMinimumTimeScale", 0.5);

[winner, diagnostics] = optimizeAzElDirectCollocation( ...
    seed, @measureSyntheticCandidate, 0, false, options);

verifyLessThan(testCase, abs(winner.Position_deg(2, 2)), 1);
verifyLessThan(testCase, winner.CompletionDuration_s, 1);
verifyLessThan(testCase, winner.CombinedRatio, seed.CombinedRatio);
verifyGreaterThan(testCase, diagnostics.CandidateCount, 0);
verifyEqual(testCase, diagnostics.CandidateCount, ...
    diagnostics.FeasibleCandidateCount);
end

function [candidateIsSafe, candidate] = ...
        measureSyntheticCandidate(candidate)
pathStep = diff(candidate.Position_deg, 1, 1);
candidate.PathLength_deg = sum(hypot(pathStep(:, 1), pathStep(:, 2)));
candidate.CompletionDuration_s = ...
    candidate.NodeTime_s(end) - candidate.NodeTime_s(1);
candidate.CombinedRatio = candidate.PathLength_deg + ...
    candidate.CompletionDuration_s;
candidate.MaximumJerkRatio = 0.1;
candidateIsSafe = true;
end
