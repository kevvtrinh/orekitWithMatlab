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

function testRejectUnzonedEpoch(testCase)
% Verify that an implicit time scale is rejected.

operation = @() scenario.frames.convertEarthFixedToInertial( ...
    datetime(2026, 1, 1), [6378137, 0, 0]);
verifyError(testCase, operation, ...
    "convertEarthFixedToInertial:InvalidEpoch");
end
