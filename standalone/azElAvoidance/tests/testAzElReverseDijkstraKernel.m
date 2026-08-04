function tests = testAzElReverseDijkstraKernel
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElReverseDijkstraKernel.m")
%**************************************************************************
% PURPOSE
%   - Verify reverse heap order, stale entries, relaxation, and settlement.
%   - Verify multi-source seeding, blocked nodes, and wrapped azimuth.
%**************************************************************************
% INPUTS
%   - None; MATLAB supplies local function-test fixtures.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by functiontests.

%% Section 1: Register Local Tests
tests = functiontests(localfunctions);
end

function setupOnce(~)
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(packageRoot));
end

function testImprovedLabelsCreateAndSkipStaleHeapEntries(testCase)
[costToGo, settled, diagnostics, settlementOrder] = ...
    computeAzElReverseDijkstra( ...
    1, 4, false(4, 1), 4, [1 0; 2 0], [1; 10], false);

verifyEqual(testCase, costToGo, [3; 2; 1; 0], "AbsTol", 1e-12);
verifyTrue(testCase, all(settled));
verifyEqual(testCase, settlementOrder, uint32([4; 3; 2; 1]));
verifyEqual(testCase, diagnostics.settledCount, 4);
verifyGreaterThanOrEqual(testCase, diagnostics.stalePops, 2);
verifyGreaterThan(testCase, diagnostics.heapPushes, ...
    diagnostics.settledCount);
verifyEqual(testCase, diagnostics.heapPops, ...
    diagnostics.settledCount + diagnostics.stalePops);
end

function testMultiSourceTieOrderAndBlockedSettlement(testCase)
offsets = [-1 0; 1 0];
edgeCost = [1; 1];
[costToGo, settled, diagnostics, settlementOrder] = ...
    computeAzElReverseDijkstra( ...
    1, 5, false(5, 1), [5; 1], offsets, edgeCost, false);

verifyEqual(testCase, costToGo, [0; 1; 2; 1; 0], "AbsTol", 1e-12);
verifyTrue(testCase, all(settled));
verifyEqual(testCase, settlementOrder, uint32([1; 5; 2; 4; 3]));
verifyEqual(testCase, diagnostics.settledCount, 5);

blocked = false(5, 1);
blocked(3) = true;
[blockedCost, blockedSettled] = computeAzElReverseDijkstra( ...
    1, 5, blocked, [1; 5], offsets, edgeCost, false);
verifyEqual(testCase, blockedCost([1 2 4 5]), [0; 1; 1; 0], ...
    "AbsTol", 1e-12);
verifyEqual(testCase, blockedCost(3), Inf);
verifyFalse(testCase, blockedSettled(3));
end

function testCircularAzimuthTopology(testCase)
[costToGo, settled] = computeAzElReverseDijkstra( ...
    1, 5, false(5, 1), 1, [-1 0; 1 0], [1; 1], true);

verifyEqual(testCase, costToGo, [0; 1; 2; 2; 1], "AbsTol", 1e-12);
verifyTrue(testCase, all(settled));
end

function testRejectsNegativeEdgeCost(testCase)
verifyError(testCase, @() computeAzElReverseDijkstra( ...
    1, 2, false(2, 1), 2, [1 0], -1, false), ...
    "computeAzElReverseDijkstra:InvalidEdges");
end
