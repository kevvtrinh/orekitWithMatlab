function tests = testCalculateSunDirection
%% Section 0: Header & Readme
% SYNTAX
%   tests = testCalculateSunDirection
%**************************************************************************
% PURPOSE
%   - Verify Sun-direction shapes, norms, frames, and provenance.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Deterministic function-based tests.
%**************************************************************************
% UNITS
%   - Direction vectors are dimensionless and epochs are UTC.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testDirectionNorms(testCase)
% Verify both returned frame representations are unit vectors.

epochUtc = datetime(2026, 8, 29, 12, 0, 0, "TimeZone", "UTC");
warningState = warning("off", ...
    "calculateSunDirection:ApproximateEphemeris");
cleanup = onCleanup(@() warning(warningState));
result = scenario.environment.calculateSunDirection(epochUtc);

verifySize(testCase, result.UnitDirectionEci, [1, 3]);
verifySize(testCase, result.UnitDirectionEcef, [1, 3]);
verifyEqual(testCase, norm(result.UnitDirectionEci), 1, "AbsTol", 1e-12);
verifyEqual(testCase, norm(result.UnitDirectionEcef), 1, "AbsTol", 1e-12);
verifyNotEmpty(testCase, result.Model);
clear cleanup
end
