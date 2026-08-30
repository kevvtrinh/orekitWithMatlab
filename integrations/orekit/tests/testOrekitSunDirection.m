function tests = testOrekitSunDirection
%% Section 0: Header & Readme
% SYNTAX
%   tests = testOrekitSunDirection
%**************************************************************************
% PURPOSE
%   - Verify the Orekit Sun adapter contract and pinned runtime provenance.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Deterministic integration tests requiring the installed runtime.
%**************************************************************************
% UNITS
%   - Direction vectors are dimensionless and epochs are UTC.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testSunDirectionContract(testCase)
% Verify frames, shapes, norms, version, and a broad direction regression.

epochUtc = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
result = scenario.integrations.orekit.calculateSunDirection(epochUtc);

verifySize(testCase, result.UnitDirectionEci, [1, 3]);
verifySize(testCase, result.UnitDirectionEcef, [1, 3]);
verifyEqual(testCase, norm(result.UnitDirectionEci), 1, "AbsTol", 1e-14);
verifyEqual(testCase, norm(result.UnitDirectionEcef), 1, "AbsTol", 1e-14);
verifyEqual(testCase, result.InertialFrame, "GCRF");
verifyEqual(testCase, result.EarthFixedFrame, "ITRF-IERS2010");
verifyEqual(testCase, result.Provider, "Orekit");
verifyEqual(testCase, result.ProviderVersion, "13.1.6");
verifyGreaterThan(testCase, strlength(result.DataVersion), 7);
expectedDirection = [0.1773, -0.9030, -0.3914];
verifyLessThan(testCase, ...
    acosd(dot(result.UnitDirectionEci, expectedDirection / ...
    norm(expectedDirection))), 0.01);
end

function testInvalidEpoch(testCase)
% Verify that an unzoned datetime is rejected before Java is called.

epoch = datetime(2026, 1, 1);
verifyError(testCase, ...
    @() scenario.integrations.orekit.calculateSunDirection(epoch), ...
    "orekitSunDirection:InvalidEpoch");
end
