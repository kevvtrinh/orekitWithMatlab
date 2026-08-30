function tests = testPointTarget
%% Section 0: Header & Readme
% SYNTAX
%   tests = testPointTarget
%**************************************************************************
% PURPOSE
%   - Verify the passive WGS84 PointTarget value object.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by MATLAB's function-based test framework.
%**************************************************************************
% UNITS
%   - Latitude and longitude are degrees; altitude is metres.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testCreateOhioTarget(testCase)
% Verify a representative coordinate inside Ohio is retained exactly.

target = scenario.target.PointTarget("Ohio Point", 40, -83, 250);

verifyEqual(testCase, target.Name, "Ohio Point");
verifyEqual(testCase, target.Latitude_deg, 40);
verifyEqual(testCase, target.Longitude_deg, -83);
verifyEqual(testCase, target.Altitude_m, 250);
verifyEqual(testCase, target.ReferenceSurface, "WGS84");
end

function testRejectInvalidLatitude(testCase)
% Verify latitude outside the physical range is rejected.

constructor = @() scenario.target.PointTarget("Invalid", 91, -83, 0);
verifyError(testCase, constructor, "PointTarget:InvalidLatitude");
end

function testCreateOhioPlace(testCase)
% Verify Place uses the same explicit WGS84 coordinate contract.

place = scenario.target.Place("Ohio Place", 40, -83, 250);

verifyEqual(testCase, place.Name, "Ohio Place");
verifyEqual(testCase, place.Body, "Earth");
verifyEqual(testCase, place.ReferenceSurface, "WGS84");
end
