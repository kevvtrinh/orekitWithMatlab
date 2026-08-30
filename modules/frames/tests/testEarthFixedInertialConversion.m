function tests = testEarthFixedInertialConversion
%% Section 0: Header & Readme
% SYNTAX
%   tests = testEarthFixedInertialConversion
%**************************************************************************
% PURPOSE
%   - Verify ECEF and ECI position conversion contracts.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Deterministic function-based tests.
%**************************************************************************
% UNITS
%   - Positions are metres and epochs are UTC.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testRoundTrip(testCase)
% Verify representative position rows survive an ECEF-ECI-ECEF round trip.

epochUtc = datetime(2026, 8, 29, 12, 0, 0, "TimeZone", "UTC");
inputEcef_m = [6378137, 0, 0; 1000000, -5000000, 3000000];
positionsEci_m = scenario.frames.convertEarthFixedToInertial( ...
    epochUtc, inputEcef_m);
outputEcef_m = scenario.frames.convertInertialToEarthFixed( ...
    epochUtc, positionsEci_m);

% The paired IAU transformation includes sub-millimetre numerical roundoff.
verifyEqual(testCase, outputEcef_m, inputEcef_m, "AbsTol", 1e-3);
end

function testBatchedRotationsMatchToolboxConversion(testCase)
% Verify batched matrices reproduce independent Aerospace Toolbox results.

startEpochUtc = datetime(2026, 8, 29, 12, 0, 0, "TimeZone", "UTC");
epochUtc = startEpochUtc + minutes([0; 15; 30]);
rotationsEcefToEci = ...
    scenario.frames.calculateEarthFixedToInertialRotation(epochUtc);
inputEcef_m = [6378137; -2500000; 1200000];

verifySize(testCase, rotationsEcefToEci, [3, 3, 3]);
for epochIndex = 1:numel(epochUtc)
    expectedEci_m = ecef2eci(epochUtc(epochIndex), inputEcef_m);
    actualEci_m = rotationsEcefToEci(:, :, epochIndex) * inputEcef_m;
    verifyEqual(testCase, actualEci_m, expectedEci_m, "AbsTol", 1e-3);
end
end

function testRejectUnzonedRotationEpochs(testCase)
% Verify batched rotation calculation rejects an implicit time scale.

operation = @() ...
    scenario.frames.calculateEarthFixedToInertialRotation( ...
        datetime(2026, 1, 1) + minutes(0:2));
verifyError(testCase, operation, ...
    "calculateEarthFixedToInertialRotation:InvalidEpoch");
end

function testRejectUnzonedEpoch(testCase)
% Verify that an implicit time scale is rejected.

operation = @() scenario.frames.convertEarthFixedToInertial( ...
    datetime(2026, 1, 1), [6378137, 0, 0]);
verifyError(testCase, operation, ...
    "convertEarthFixedToInertial:InvalidEpoch");
end
