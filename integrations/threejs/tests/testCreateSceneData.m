function tests = testCreateSceneData
%% Section 0: Header & Readme
% SYNTAX
%   tests = testCreateSceneData
%**************************************************************************
% PURPOSE
%   - Verify conversion from Scenario objects to Three.js scene payloads.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by MATLAB's function-based test framework.
%**************************************************************************
% UNITS
%   - Position and Earth radius are metres; place coordinates are degrees.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testCreateOhioScene(testCase)
% Verify one ITRF satellite and one Ohio place cross the renderer boundary.

startTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
study = scenario.Scenario("Ohio", startTime, startTime + hours(1));
initialState = struct( ...
    "epoch", startTime, ...
    "frame", "ITRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);
study.addSatellite("LEO-1", initialState);
study.addPlace("Ohio Place", 40, -83, 250);

sceneData = scenario.integrations.threejs.createSceneData(study);

verifyEqual(testCase, sceneData.availableReferenceFrames, ["ECEF", "ECI"]);
verifyEqual(testCase, numel(sceneData.satellites), 1);
verifyEqual(testCase, numel(sceneData.places), 1);
verifySize(testCase, sceneData.places.positionEcef_m, [1, 3]);
verifySize(testCase, sceneData.places.positionEci_m, [1, 3]);
verifyFalse(testCase, sceneData.satellites.hasEphemeris);
verifySize(testCase, sceneData.satellites.orbitPathEci_m, [0, 3]);
verifySize(testCase, sceneData.ecefToEciMatrix, [3, 3]);
verifyNumElements(testCase, sceneData.timeSamples, 1);
verifyFalse(testCase, sceneData.isPlayable);
verifyEqual(testCase, sceneData.startEpochUnix_s, posixtime(startTime));
verifyEqual(testCase, sceneData.stopEpochUnix_s, posixtime(startTime + hours(1)));
verifyEqual(testCase, norm(sceneData.sun.unitDirectionEci), 1, ...
    "AbsTol", 1e-12);
verifyEmpty(testCase, sceneData.warnings);
end

function testOmitUnsupportedFrame(testCase)
% Verify unsupported frames remain visible as an explicit warning.

startTime = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
study = scenario.Scenario("Inertial", startTime, startTime + hours(1));
initialState = struct( ...
    "epoch", startTime, ...
    "frame", "GCRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);
study.addSatellite("LEO-1", initialState);

sceneData = scenario.integrations.threejs.createSceneData(study);

verifyEmpty(testCase, sceneData.satellites);
verifyNumElements(testCase, sceneData.warnings, 1);
end

function testExplicitSunProvider(testCase)
% Verify the renderer uses the provider passed by product composition.

startTime = datetime(2026, 1, 1, "TimeZone", "UTC");
study = scenario.Scenario("Provider", startTime, startTime + minutes(1));
sceneData = scenario.integrations.threejs.createSceneData( ...
    study, @fixedSunProvider);

verifyEqual(testCase, sceneData.sun.model, "TestProvider");
verifyEqual(testCase, sceneData.inertialFrame, "GCRF");
verifyEqual(testCase, sceneData.sun.unitDirectionEci, [1, 0, 0]);
end

function testCreatePlayableTrajectory(testCase)
% Verify a trajectory provider creates synchronized frame histories.

startTime = datetime(2026, 1, 1, "TimeZone", "UTC");
study = scenario.Scenario("Playback", startTime, startTime + minutes(1));
initialState = struct( ...
    "epoch", startTime, ...
    "frame", "ITRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);
study.addSatellite("LEO-1", initialState);

sceneData = scenario.integrations.threejs.createSceneData( ...
    study, @fixedSunProvider, @fixedTrajectoryProvider);

verifyTrue(testCase, sceneData.isPlayable);
verifyNumElements(testCase, sceneData.timeSamples, 2);
verifyTrue(testCase, sceneData.satellites.hasEphemeris);
verifySize(testCase, sceneData.satellites.orbitPathEcef_m, [2, 3]);
verifySize(testCase, sceneData.satellites.orbitPathEci_m, [2, 3]);
verifyEqual(testCase, sceneData.satellites.trajectoryModel, "TestTrajectory");
end

function testBoundLongScenarioSampleCount(testCase)
% Verify long scenarios disclose their bounded visualization cadence.

startTime = datetime(2026, 1, 1, "TimeZone", "UTC");
study = scenario.Scenario("One Day", startTime, startTime + days(1));

sceneData = scenario.integrations.threejs.createSceneData( ...
    study, @fixedSunProvider, @fixedTrajectoryProvider);

verifyEqual(testCase, sceneData.sampleInterval_s, 120);
verifyNumElements(testCase, sceneData.timeSamples, 721);
verifyNumElements(testCase, sceneData.warnings, 1);
verifySubstring(testCase, sceneData.warnings, "120-second intervals");
end

function result = fixedSunProvider(epochUtc)
% Return a deterministic provider-neutral Sun direction for injection tests.

result = struct( ...
    "EpochUtc", epochUtc, ...
    "UnitDirectionEci", [1, 0, 0], ...
    "UnitDirectionEcef", [0, 1, 0], ...
    "InertialFrame", "GCRF", ...
    "Model", "TestProvider", ...
    "Accuracy", "Deterministic test value");
end

function result = fixedTrajectoryProvider(initialState, sampleEpochsUtc)
% Return deterministic frame histories matching the requested sample count.

sampleCount = numel(sampleEpochsUtc);
offsets_m = (0:(sampleCount - 1))';
positionsEcef_m = repmat(initialState.position_m, sampleCount, 1);
positionsEcef_m(:, 2) = positionsEcef_m(:, 2) + offsets_m;
positionsEci_m = positionsEcef_m + 10;
result = struct( ...
    "PositionEcef_m", positionsEcef_m, ...
    "PositionEci_m", positionsEci_m, ...
    "Model", "TestTrajectory");
end
