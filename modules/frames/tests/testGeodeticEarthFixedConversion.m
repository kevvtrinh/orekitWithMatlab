function tests = testGeodeticEarthFixedConversion
%% Section 0: Header & Readme
% SYNTAX
%   tests = testGeodeticEarthFixedConversion
%**************************************************************************
% PURPOSE
%   - Validate WGS84 geodetic and ECEF coordinate conversions.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by MATLAB's function-based test framework.
%**************************************************************************
% UNITS
%   - Position and altitude are metres. Latitude and longitude are degrees.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testEquatorialReferencePoint(testCase)
% Verify the WGS84 semi-major axis at zero latitude and longitude.

position_m = scenario.frames.convertGeodeticToEarthFixed([0, 0, 0]);

verifyEqual(testCase, position_m, [6378137, 0, 0], "AbsTol", 1e-6);
end

function testAltitudeAndLongitudeReferencePoint(testCase)
% Verify a nonsingular WGS84 reference with altitude and longitude.

position_m = scenario.frames.convertGeodeticToEarthFixed([0, 45, 1000]);
expectedPosition_m = [4510731.030818009, 4510731.030818008, 0];

verifyEqual(testCase, position_m, expectedPosition_m, "AbsTol", 1e-6);
end

function testOhioRoundTrip(testCase)
% Verify a representative Ohio point survives an independent round trip.

inputGeodetic_lla = [40, -83, 250];
position_m = scenario.frames.convertGeodeticToEarthFixed(inputGeodetic_lla);
outputGeodetic_lla = ...
    scenario.frames.convertEarthFixedToGeodetic(position_m);

verifyEqual(testCase, outputGeodetic_lla(:, 1:2), ...
    inputGeodetic_lla(:, 1:2), "AbsTol", 1e-9);
verifyEqual(testCase, outputGeodetic_lla(:, 3), ...
    inputGeodetic_lla(:, 3), "AbsTol", 1e-6);
end

function testRejectEarthCenter(testCase)
% Verify the undefined inverse coordinate is rejected explicitly.

converter = @() scenario.frames.convertEarthFixedToGeodetic([0, 0, 0]);
verifyError(testCase, converter, ...
    "convertEarthFixedToGeodetic:EarthCenterSingularity");
end
