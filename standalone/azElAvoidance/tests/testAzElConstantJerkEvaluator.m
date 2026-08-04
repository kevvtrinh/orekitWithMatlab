function tests = testAzElConstantJerkEvaluator
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElConstantJerkEvaluator.m")
%**************************************************************************
% PURPOSE
%   - Verify the authoritative packed constant-jerk propagation law.
%   - Verify arbitrary endpoint matching and analytic continuous extrema.
%**************************************************************************
% INPUTS
%   - None; MATLAB supplies local function-test fixtures.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by functiontests.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; temporal quantities are seconds.

%% Section 1: Register Local Tests
tests = functiontests(localfunctions);
end

function setupOnce(~)
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(packageRoot));
end

function testMatchesArbitraryNonzeroBoundaryStates(testCase)
firstState = endpoint([1.2 -2.4], [0.6 -0.3], [0.2 0.4]);
stopState = endpoint([4.7 0.8], [-0.25 0.55], [-0.1 -0.35]);
duration_s = 3.2;
evaluation = evaluateAzElConstantJerkSegment( ...
    firstState, stopState, duration_s, linspace(0, duration_s, 17).');

verifyEqual(testCase, evaluation.position_deg(1, :), ...
    firstState.position_deg, "AbsTol", 1e-12);
verifyEqual(testCase, evaluation.velocity_deg_s(1, :), ...
    firstState.velocity_deg_s, "AbsTol", 1e-12);
verifyEqual(testCase, evaluation.acceleration_deg_s2(1, :), ...
    firstState.acceleration_deg_s2, "AbsTol", 1e-12);
verifyLessThan(testCase, max(abs([ ...
    evaluation.endpointError.position_deg, ...
    evaluation.endpointError.velocity_deg_s, ...
    evaluation.endpointError.acceleration_deg_s2])), 2e-12);

phaseDuration_s = duration_s / 3;
boundaryEvaluation = evaluatePackedAzElConstantJerkLaw( ...
    evaluation.law, [phaseDuration_s; 2 * phaseDuration_s]);
verifyEqual(testCase, boundaryEvaluation(1, :), ...
    evaluation.law(7, :), "AbsTol", 2e-12);
verifyEqual(testCase, boundaryEvaluation(2, :), ...
    evaluation.law(13, :), "AbsTol", 2e-12);
end

function testPackedConstantControlMatchesClosedForm(testCase)
position0_deg = [-1.5 2.25];
velocity0_deg_s = [0.7 -0.45];
acceleration0_deg_s2 = [-0.3 0.55];
jerk_deg_s3 = [0.2 -0.15];
duration_s = 4.5;
queryTime_s = linspace(0, duration_s, 31).';
law = packedConstantControlLaw( ...
    position0_deg, velocity0_deg_s, acceleration0_deg_s2, ...
    jerk_deg_s3, duration_s);

[position_deg, velocity_deg_s, acceleration_deg_s2, actualJerk_deg_s3] = ...
    evaluatePackedAzElConstantJerkLaw(law, queryTime_s);
expectedPosition_deg = position0_deg + queryTime_s * velocity0_deg_s + ...
    0.5 * queryTime_s.^2 * acceleration0_deg_s2 + ...
    (1 / 6) * queryTime_s.^3 * jerk_deg_s3;
expectedVelocity_deg_s = velocity0_deg_s + ...
    queryTime_s * acceleration0_deg_s2 + ...
    0.5 * queryTime_s.^2 * jerk_deg_s3;
expectedAcceleration_deg_s2 = acceleration0_deg_s2 + ...
    queryTime_s * jerk_deg_s3;

verifyEqual(testCase, position_deg, expectedPosition_deg, "AbsTol", 2e-12);
verifyEqual(testCase, velocity_deg_s, expectedVelocity_deg_s, ...
    "AbsTol", 2e-12);
verifyEqual(testCase, acceleration_deg_s2, ...
    expectedAcceleration_deg_s2, "AbsTol", 2e-12);
verifyEqual(testCase, actualJerk_deg_s3, ...
    repmat(jerk_deg_s3, numel(queryTime_s), 1), "AbsTol", 1e-14);
end

function testAnalyticExtremaMatchDenseIndependentSamples(testCase)
duration_s = 4;
law = packedConstantControlLaw( ...
    [0.3 -0.2], [1 -1.5], [-2 1.2], [1 -0.4], duration_s);
evaluation = evaluateAzElConstantJerkSegment(law, [0; duration_s]);
denseTime_s = linspace(0, duration_s, 100001).';
[position_deg, velocity_deg_s, acceleration_deg_s2, jerk_deg_s3] = ...
    evaluatePackedAzElConstantJerkLaw(law, denseTime_s);

verifyEqual(testCase, evaluation.extrema.minimumPosition_deg, ...
    min(position_deg, [], 1), "AbsTol", 2e-8);
verifyEqual(testCase, evaluation.extrema.maximumPosition_deg, ...
    max(position_deg, [], 1), "AbsTol", 2e-8);
verifyEqual(testCase, evaluation.extrema.maximumVelocity_deg_s, ...
    max(abs(velocity_deg_s), [], 1), "AbsTol", 2e-8);
verifyEqual(testCase, evaluation.extrema.maximumAcceleration_deg_s2, ...
    max(abs(acceleration_deg_s2), [], 1), "AbsTol", 2e-8);
verifyEqual(testCase, evaluation.extrema.maximumJerk_deg_s3, ...
    max(abs(jerk_deg_s3), [], 1), "AbsTol", 1e-14);
end

function testWaitAndInvalidQueryTime(testCase)
restState = endpoint([2 -3], [0 0], [0 0]);
evaluation = evaluateAzElConstantJerkSegment( ...
    restState, restState, 2, (0:0.25:2).');
verifyTrue(testCase, evaluation.isWaiting);
verifyEqual(testCase, evaluation.position_deg, ...
    repmat(restState.position_deg, 9, 1), "AbsTol", 1e-14);
verifyError(testCase, ...
    @() evaluateAzElConstantJerkSegment(evaluation.law, [-0.1; 1]), ...
    "evaluateAzElConstantJerkSegment:TimeOutsideSegment");
end

function state = endpoint(position_deg, velocity_deg_s, acceleration_deg_s2)
state = struct( ...
    "position_deg", position_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2);
end

function law = packedConstantControlLaw( ...
        position_deg, velocity_deg_s, acceleration_deg_s2, ...
        jerk_deg_s3, duration_s)
phaseDuration_s = duration_s / 3;
law = zeros(18, 2);
for phaseIndex = 1:3
    firstRow = 6 * (phaseIndex - 1) + 1;
    law(firstRow, :) = position_deg;
    law(firstRow + 1, :) = velocity_deg_s;
    law(firstRow + 2, :) = acceleration_deg_s2;
    law(firstRow + 3, :) = jerk_deg_s3;
    law(firstRow + 4, :) = (phaseIndex - 1) * phaseDuration_s;
    law(firstRow + 5, :) = phaseDuration_s;
    position_deg = position_deg + velocity_deg_s * phaseDuration_s + ...
        0.5 * acceleration_deg_s2 * phaseDuration_s^2 + ...
        (1 / 6) * jerk_deg_s3 * phaseDuration_s^3;
    velocity_deg_s = velocity_deg_s + ...
        acceleration_deg_s2 * phaseDuration_s + ...
        0.5 * jerk_deg_s3 * phaseDuration_s^2;
    acceleration_deg_s2 = acceleration_deg_s2 + ...
        jerk_deg_s3 * phaseDuration_s;
end
end
