function tests = testScenario
%% Section 0: Header & Readme
% SYNTAX
%   tests = testScenario
%**************************************************************************
% PURPOSE
%   - Verify Scenario composition with Satellite and PointTarget objects.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by MATLAB's function-based test framework.
%**************************************************************************
% UNITS
%   - Position is metres, velocity is metres per second, and target coordinates
%     are geodetic degrees and ellipsoidal metres.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testAddSatelliteAndOhioTarget(testCase)
% Verify the first complete composition workflow and object ownership.

[study, satellite, place] = createTestScenario();

verifyEqual(testCase, study.Name, "Ohio Demonstration");
verifyEqual(testCase, numel(study.Satellites), 1);
verifyEqual(testCase, numel(study.Places), 1);
verifyEqual(testCase, satellite.Name, "LEO-1");
verifyEqual(testCase, place.Name, "Ohio Place");
end

function testRejectDuplicateObjectName(testCase)
% Verify object names remain unique across platform and target types.

[study, satellite, ~] = createTestScenario();
duplicate = @() study.addTarget(satellite.Name, 40, -83, 250);

verifyError(testCase, duplicate, "Scenario:DuplicateObjectName");
end

function [study, satellite, place] = createTestScenario()
% Create the shared deterministic scenario used by composition tests.

startTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
stopTime = startTime + hours(1);
study = scenario.Scenario("Ohio Demonstration", startTime, stopTime);

initialState = struct( ...
    "epoch", startTime, ...
    "frame", "ITRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);

satellite = study.addSatellite("LEO-1", initialState);
place = study.addPlace("Ohio Place", 40, -83, 250);
end
