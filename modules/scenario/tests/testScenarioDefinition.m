function tests = testScenarioDefinition
%% Section 0: Header & Readme
% SYNTAX
%   tests = testScenarioDefinition
%**************************************************************************
% PURPOSE
%   - Verify provider-neutral Scenario definition export and reconstruction.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Deterministic tests for Version 1 scenario definitions.
%**************************************************************************
% UNITS
%   - Epochs use POSIX seconds in UTC. Positions use metres, velocities use
%     metres per second, and WGS84 coordinates use degrees and metres.
%**************************************************************************

tests = functiontests(localfunctions);
end

function testRoundTripScenarioComposition(testCase)
% Verify all supported object collections survive a JSON-compatible round trip.

study = createPopulatedScenario();
definition = scenario.createScenarioDefinition(study);
restored = scenario.createScenarioFromDefinition(definition);

verifyEqual(testCase, definition.Format, "scenario-definition");
verifyEqual(testCase, definition.Version, 1);
verifyEqual(testCase, restored.Name, study.Name);
verifyEqual(testCase, restored.StartTime, study.StartTime);
verifyEqual(testCase, restored.StopTime, study.StopTime);
verifyEqual(testCase, restored.Satellites{1}.InitialState, ...
    study.Satellites{1}.InitialState);
verifyEqual(testCase, restored.Places{1}.Name, "Ohio Place");
verifyEqual(testCase, restored.Targets{1}.Name, "Ohio Target");
end

function testJsonRoundTripWithEmptyCollections(testCase)
% Verify JSON's untyped empty arrays remain valid scenario collections.

startTime = datetime(2026, 1, 1, "TimeZone", "UTC");
study = scenario.Scenario("Empty", startTime, startTime + hours(1));
definition = jsondecode(jsonencode( ...
    scenario.createScenarioDefinition(study)));

restored = scenario.createScenarioFromDefinition(definition);

verifyEmpty(testCase, restored.Satellites);
verifyEmpty(testCase, restored.Places);
verifyEmpty(testCase, restored.Targets);
end

function testRejectUnsupportedDefinitionVersion(testCase)
% Verify unsupported definition versions fail with an identified diagnostic.

definition = scenario.createScenarioDefinition(createPopulatedScenario());
definition.Version = 2;

verifyError(testCase, ...
    @() scenario.createScenarioFromDefinition(definition), ...
    "createScenarioFromDefinition:UnsupportedFormat");
end

function study = createPopulatedScenario()
% Create one scenario containing every object type supported by persistence.

startTime = datetime(2026, 1, 1, 17, 0, 0, "TimeZone", "UTC");
study = scenario.Scenario("Ohio Demonstration", ...
    startTime, startTime + hours(6));
initialState = struct( ...
    "epoch", startTime, ...
    "frame", "ITRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);
study.addSatellite("LEO-1", initialState);
study.addPlace("Ohio Place", 40, -83, 250);
study.addTarget("Ohio Target", 39.9, -82.9, 275);
end
