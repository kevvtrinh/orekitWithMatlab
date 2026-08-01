function tests = testSimpleDijkstraLegacySpiralScenarios
%% Section 0: Header & Readme
% SYNTAX
%   tests = testSimpleDijkstraLegacySpiralScenarios
%**************************************************************************
% PURPOSE
%   - Apply the simple kinodynamic Dijkstra planner directly to legacy
%     spiral azElData and endpoint states without mature planner machinery.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.Test array)
%       Direct simple-planner legacy-scenario regression tests.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
tests = functiontests(localfunctions);
end

function setupOnce(~)
%% Section 0: Header & Readme
% SYNTAX
%   setupOnce(~)
%**************************************************************************
% PURPOSE
%   - Add the standalone planner, examples, and data fixtures to the path.
%**************************************************************************
% INPUTS
%   - ~ (discarded test fixture)
%       Fixture supplied by the function-based test framework.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - None.
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(plannerRoot));
end

function testSimpleDijkstraSolvesFiveTurnSpiral(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testSimpleDijkstraSolvesFiveTurnSpiral(testCase)
%**************************************************************************
% PURPOSE
%   - Require the simple planner to solve the legacy five-turn spiral data.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
[azElData, initialState, destinationState, limits] = ...
    fiveTurnSpiralInputs();
options = fiveTurnSimpleOptions();

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

failureMessage = sprintf( ...
    "Simple five-turn spiral failed: %s Expanded %d; generated %d.", ...
    plan.message, plan.expandedStateCount, plan.generatedStateCount);
verifyTrue(testCase, plan.success, failureMessage);
if ~plan.success
    return;
end

windingTurns = trajectoryWindingTurns(plan.positionUnwrapped_deg);
blockedNodes = queryAzElTimeObstacle( ...
    plan.obstacleField, plan.position_deg(:, 1), ...
    plan.position_deg(:, 2), plan.time_s, ...
    options.collisionQueryOptions);
verifyFalse(testCase, any(blockedNodes));
verifyGreaterThanOrEqual(testCase, windingTurns, 4);
end

function testSimpleDijkstraSolvesSpinningRodSpiral(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testSimpleDijkstraSolvesSpinningRodSpiral(testCase)
%**************************************************************************
% PURPOSE
%   - Require the simple planner to solve the legacy spinning-rod azElData.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
legacyProblem = makeSpinningRodSpiralGauntlet();
azElData = legacyProblem.azElData;
initialState = legacyProblem.startState;
destinationState = legacyProblem.stopState;
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.2, 0.2];
options = spinningRodSimpleOptions();

plan = planSimpleAzElTimeKinodynamicDijkstra( ...
    azElData, initialState, destinationState, limits, options);

failureMessage = sprintf( ...
    "Simple spinning-rod spiral failed: %s Expanded %d; generated %d.", ...
    plan.message, plan.expandedStateCount, plan.generatedStateCount);
verifyTrue(testCase, plan.success, failureMessage);
if ~plan.success
    return;
end

windingTurns = trajectoryWindingTurns(plan.positionUnwrapped_deg);
blockedNodes = queryAzElTimeObstacle( ...
    plan.obstacleField, plan.position_deg(:, 1), ...
    plan.position_deg(:, 2), plan.time_s, ...
    options.collisionQueryOptions);
verifyFalse(testCase, any(blockedNodes));
verifyGreaterThanOrEqual(testCase, windingTurns, 0.8);
verifyTrue(testCase, any(plan.isWaiting));
end

function [azElData, initialState, destinationState, limits] = ...
        fiveTurnSpiralInputs()
%% Section 0: Header & Readme
% SYNTAX
%   [azElData, initialState, destinationState, limits] = ...
%       fiveTurnSpiralInputs()
%**************************************************************************
% PURPOSE
%   - Reproduce only the legacy five-turn obstacle, endpoints, and limits.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Canonical static five-turn spiral wall samples.
%   - initialState, destinationState (scalar structs)
%       Legacy rest-to-rest endpoint states.
%   - limits (scalar struct)
%       Legacy position, velocity, and acceleration limits plus simple jerk.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:0.5:400).';
[wallAzimuth_deg, wallElevation_deg] = ...
    fiveTurnSpiralWall(5, 2, 3, 0.4, 241);
azElData = makeAzElObstacleData( ...
    "Five-turn spiral wall", time_s, ...
    wallAzimuth_deg, wallElevation_deg);
initialState = endpointState(0, [18, 1.5]);
destinationState = endpointState(400, [0, 0]);
limits = struct( ...
    "azimuth_deg", [-20, 20], ...
    "elevation_deg", [-20, 20], ...
    "maxVelocity_deg_s", [3, 3], ...
    "maxAcceleration_deg_s2", [3, 3], ...
    "maxJerk_deg_s3", [0.125, 0.125]);
end

function options = fiveTurnSimpleOptions()
%% Section 0: Header & Readme
% SYNTAX
%   options = fiveTurnSimpleOptions()
%**************************************************************************
% PURPOSE
%   - Define a bounded unguided simple lattice for the five-turn scenario.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Simple-planner-only options with no guide or mature search fields.
%**************************************************************************
% UNITS
%   - Field suffixes state their physical units.
options = struct( ...
    "timeStep_s", 4, ...
    "positionStep_deg", [1, 1], ...
    "velocityStep_deg_s", [0.5, 0.5], ...
    "accelerationStep_deg_s2", [0.5, 0.5], ...
    "allowAzimuthWrap", false, ...
    "collisionCheckStep_s", 0.25, ...
    "collisionQueryOptions", struct( ...
        "CollisionMode", "polygon", ...
        "TimePaddingSamples", 0, ...
        "BoundsMarginDeg", [0, 0], ...
        "SafetyMarginDeg", 0), ...
    "positionTolerance_deg", [0.5, 0.5], ...
    "velocityTolerance_deg_s", [0.25, 0.25], ...
    "accelerationTolerance_deg_s2", [0.25, 0.25], ...
    "maximumGeneratedStates", 100000, ...
    "maximumExpandedStates", 100000);
end

function options = spinningRodSimpleOptions()
%% Section 0: Header & Readme
% SYNTAX
%   options = spinningRodSimpleOptions()
%**************************************************************************
% PURPOSE
%   - Define a bounded unguided simple lattice for the spinning-rod data.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Simple-planner-only options with no guide or mature search fields.
%**************************************************************************
% UNITS
%   - Field suffixes state their physical units.
options = struct( ...
    "timeStep_s", 2, ...
    "positionStep_deg", [1, 1], ...
    "velocityStep_deg_s", [0.2, 0.2], ...
    "accelerationStep_deg_s2", [0.4, 0.4], ...
    "allowAzimuthWrap", false, ...
    "collisionCheckStep_s", 0.08, ...
    "collisionQueryOptions", struct( ...
        "CollisionMode", "polygon", ...
        "TimePaddingSamples", 0, ...
        "BoundsMarginDeg", [0, 0], ...
        "SafetyMarginDeg", 0.2), ...
    "positionTolerance_deg", [0.5, 0.5], ...
    "velocityTolerance_deg_s", [0.1, 0.1], ...
    "accelerationTolerance_deg_s2", [0.2, 0.2], ...
    "maximumGeneratedStates", 30000, ...
    "maximumExpandedStates", 30000);
end

function [azimuth_deg, elevation_deg] = fiveTurnSpiralWall( ...
        turnCount, innerRadius_deg, turnSpacing_deg, halfWidth_deg, ...
        sampleCount)
%% Section 0: Header & Readme
% SYNTAX
%   [azimuth_deg, elevation_deg] = fiveTurnSpiralWall( ...
%       turnCount, innerRadius_deg, turnSpacing_deg, halfWidth_deg, ...
%       sampleCount)
%**************************************************************************
% PURPOSE
%   - Reproduce the legacy thick Archimedean spiral obstacle polygon.
%**************************************************************************
% INPUTS
%   - turnCount, sampleCount (positive integers)
%       Spiral turns and centerline samples.
%   - innerRadius_deg, turnSpacing_deg, halfWidth_deg (numeric scalars)
%       Spiral radial geometry.
%**************************************************************************
% OUTPUTS
%   - azimuth_deg, elevation_deg (numeric columns)
%       Closed spiral-wall polygon boundary.
%**************************************************************************
% UNITS
%   - Radius, spacing, width, azimuth, and elevation are degrees.
theta_rad = linspace(0, 2 * pi * turnCount, sampleCount).';
radius_deg = innerRadius_deg + ...
    turnSpacing_deg * theta_rad / (2 * pi);
centerAzimuth_deg = radius_deg .* cos(theta_rad);
centerElevation_deg = radius_deg .* sin(theta_rad);
deltaAzimuth_deg = gradient(centerAzimuth_deg);
deltaElevation_deg = gradient(centerElevation_deg);
tangentMagnitude_deg = hypot(deltaAzimuth_deg, deltaElevation_deg);
normalAzimuth = -deltaElevation_deg ./ tangentMagnitude_deg;
normalElevation = deltaAzimuth_deg ./ tangentMagnitude_deg;
leftAzimuth_deg = centerAzimuth_deg + halfWidth_deg * normalAzimuth;
leftElevation_deg = centerElevation_deg + halfWidth_deg * normalElevation;
rightAzimuth_deg = centerAzimuth_deg - halfWidth_deg * normalAzimuth;
rightElevation_deg = centerElevation_deg - halfWidth_deg * normalElevation;
azimuth_deg = [ ...
    leftAzimuth_deg; flipud(rightAzimuth_deg); leftAzimuth_deg(1)];
elevation_deg = [ ...
    leftElevation_deg; flipud(rightElevation_deg); leftElevation_deg(1)];
end

function endpoint = endpointState(time_s, position_deg)
%% Section 0: Header & Readme
% SYNTAX
%   endpoint = endpointState(time_s, position_deg)
%**************************************************************************
% PURPOSE
%   - Build one complete rest endpoint for a copied legacy scenario.
%**************************************************************************
% INPUTS
%   - time_s (numeric scalar)
%       Exact endpoint time.
%   - position_deg (1-by-2 numeric row)
%       Endpoint azimuth and elevation.
%**************************************************************************
% OUTPUTS
%   - endpoint (scalar struct)
%       Complete zero-velocity, zero-acceleration endpoint state.
%**************************************************************************
% UNITS
%   - Position is degrees and time is seconds.
endpoint = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
end

function windingTurns = trajectoryWindingTurns(position_deg)
%% Section 0: Header & Readme
% SYNTAX
%   windingTurns = trajectoryWindingTurns(position_deg)
%**************************************************************************
% PURPOSE
%   - Measure accumulated polar winding outside the undefined origin region.
%**************************************************************************
% INPUTS
%   - position_deg (N-by-2 numeric array)
%       Unwrapped azimuth and elevation trajectory.
%**************************************************************************
% OUTPUTS
%   - windingTurns (numeric scalar)
%       Absolute accumulated polar angle divided by one revolution.
%**************************************************************************
% UNITS
%   - Position is degrees and windingTurns is dimensionless.
radialDistance_deg = hypot(position_deg(:, 1), position_deg(:, 2));
positionHasDefinedAngle = radialDistance_deg >= 0.75;
polarAngle_rad = unwrap(atan2( ...
    position_deg(positionHasDefinedAngle, 2), ...
    position_deg(positionHasDefinedAngle, 1)));
windingTurns = abs(polarAngle_rad(end) - polarAngle_rad(1)) / (2 * pi);
end
