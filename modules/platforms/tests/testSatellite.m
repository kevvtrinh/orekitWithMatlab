function tests = testSatellite
%% Section 0: Header & Readme
% SYNTAX
%   tests = testSatellite
%**************************************************************************
% PURPOSE
%   - Verify the engine-neutral Satellite value object.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by MATLAB's function-based test framework.
%**************************************************************************
% UNITS
%   - Position is metres and velocity is metres per second.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testCreateSatellite(testCase)
% Verify a valid state is stored with normalized row-vector histories.

epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
initialState = struct( ...
    "epoch", epoch, ...
    "frame", "GCRF", ...
    "position_m", [7000000; 0; 0], ...
    "velocity_m_s", [0; 7546; 0]);

satellite = scenario.platform.Satellite("LEO-1", initialState);

verifyEqual(testCase, satellite.Name, "LEO-1");
verifySize(testCase, satellite.InitialState.position_m, [1, 3]);
verifySize(testCase, satellite.InitialState.velocity_m_s, [1, 3]);
end

function testRejectMissingFrame(testCase)
% Verify that an incomplete state fails with an actionable identifier.

initialState = struct( ...
    "epoch", datetime(2026, 1, 1), ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);

constructor = @() scenario.platform.Satellite("LEO-1", initialState);
verifyError(testCase, constructor, "Satellite:MissingInitialStateField");
end

