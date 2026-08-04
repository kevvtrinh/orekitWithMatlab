function evaluation = evaluateAzElConstantJerkSegment( ...
        firstInput, secondInput, duration_s, localTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   evaluation = evaluateAzElConstantJerkSegment( ...
%       firstState, stopState, duration_s)
%   evaluation = evaluateAzElConstantJerkSegment( ...
%       firstState, stopState, duration_s, localTime_s)
%   evaluation = evaluateAzElConstantJerkSegment(law, localTime_s)
%**************************************************************************
% PURPOSE
%   - Build and evaluate the authoritative three-phase constant-jerk law.
%   - Return analytic position, velocity, acceleration, and jerk extrema.
%**************************************************************************
% INPUTS
%   - firstState, stopState (scalar structs)
%       position_deg, velocity_deg_s, and acceleration_deg_s2 endpoints.
%   - duration_s (positive numeric scalar)
%       Total duration shared by three equal jerk phases.
%   - law (numeric 18-by-2 matrix)
%       Previously returned packed phase law.
%   - localTime_s (numeric vector, optional)
%       Segment-relative query times in the closed duration interval.
%**************************************************************************
% OUTPUTS
%   - evaluation (scalar struct)
%       law, duration_s, time_s, position_deg, velocity_deg_s,
%       acceleration_deg_s2, jerk_deg_s3, extrema, endpointError, and
%       isWaiting.
%**************************************************************************
% UNITS
%   - Position is degrees; time is seconds; derivatives use deg/s powers.

%% Section 1: Validate Inputs & Build Or Reuse The Law
isPackedLawCall = nargin == 2 && isnumeric(firstInput) && ...
    isequal(size(firstInput), [18 2]);
if isPackedLawCall
    law = double(firstInput);
    localTime_s = secondInput;
    duration_s = law(18, 1) + law(17, 1);
    requestedStopState = struct();
else
    if nargin < 3
        error("evaluateAzElConstantJerkSegment:NotEnoughInputs", ...
            "Endpoint calls require firstState, stopState, and duration_s.");
    end
    firstState = normalizeEndpoint(firstInput, "firstState");
    requestedStopState = normalizeEndpoint(secondInput, "stopState");
    validateattributes(duration_s, {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
    duration_s = double(duration_s);
    if nargin < 4 || isempty(localTime_s)
        localTime_s = [0; duration_s];
    end
    law = buildLaw(firstState, requestedStopState, duration_s);
end

validateattributes(localTime_s, {'numeric'}, ...
    {'vector', 'real', 'finite', '>=', 0, '<=', duration_s});
localTime_s = double(localTime_s(:));
if any(~isfinite(law), "all")
    error("evaluateAzElConstantJerkSegment:NonfiniteLaw", ...
        "The endpoint request produced a nonfinite jerk law.");
end

%% Section 2: Evaluate Requested Times
[position_deg, velocity_deg_s, acceleration_deg_s2, jerk_deg_s3] = ...
    evaluateLaw(law, localTime_s);

%% Section 3: Evaluate Analytic Continuous Extrema
extrema = analyticExtrema(law);
[finalPosition_deg, finalVelocity_deg_s, ...
    finalAcceleration_deg_s2, ~] = evaluateLaw(law, duration_s);
if isempty(fieldnames(requestedStopState))
    endpointError = struct( ...
        "position_deg", [NaN NaN], ...
        "velocity_deg_s", [NaN NaN], ...
        "acceleration_deg_s2", [NaN NaN]);
else
    endpointError = struct( ...
        "position_deg", finalPosition_deg - ...
            requestedStopState.position_deg, ...
        "velocity_deg_s", finalVelocity_deg_s - ...
            requestedStopState.velocity_deg_s, ...
        "acceleration_deg_s2", finalAcceleration_deg_s2 - ...
            requestedStopState.acceleration_deg_s2);
end
startPosition_deg = law(1, :);
startVelocity_deg_s = law(2, :);
startAcceleration_deg_s2 = law(3, :);
jerkRows = [4 10 16];
isWaiting = all(abs(finalPosition_deg - startPosition_deg) <= 1e-12) && ...
    all(abs([startVelocity_deg_s, startAcceleration_deg_s2, ...
    finalVelocity_deg_s, finalAcceleration_deg_s2]) <= 1e-12) && ...
    all(abs(law(jerkRows, :)) <= 1e-12, "all");

%% Section 4: Assemble The Stable Evaluation
evaluation = struct( ...
    "Format", "AzElThreePhaseConstantJerkEvaluation", ...
    "law", law, ...
    "duration_s", duration_s, ...
    "time_s", localTime_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "jerk_deg_s3", jerk_deg_s3, ...
    "extrema", extrema, ...
    "endpointError", endpointError, ...
    "isWaiting", isWaiting);
end

%% Section 5: Local Functions
function state = normalizeEndpoint(input, name)
requiredFields = ["position_deg", "velocity_deg_s", ...
    "acceleration_deg_s2"];
if ~isstruct(input) || ~isscalar(input) || ...
        ~all(isfield(input, requiredFields))
    error("evaluateAzElConstantJerkSegment:InvalidEndpoint", ...
        "%s requires position, velocity, and acceleration fields.", name);
end
state = struct( ...
    "position_deg", reshape(double(input.position_deg), 1, 2), ...
    "velocity_deg_s", reshape(double(input.velocity_deg_s), 1, 2), ...
    "acceleration_deg_s2", ...
        reshape(double(input.acceleration_deg_s2), 1, 2));
if any(~isfinite([state.position_deg, state.velocity_deg_s, ...
        state.acceleration_deg_s2]))
    error("evaluateAzElConstantJerkSegment:NonfiniteEndpoint", ...
        "%s contains a nonfinite value.", name);
end
end

function law = buildLaw(firstState, stopState, duration_s)
phaseDuration_s = duration_s / 3;
firstPosition_deg = firstState.position_deg;
firstVelocity_deg_s = firstState.velocity_deg_s;
firstAcceleration_deg_s2 = firstState.acceleration_deg_s2;
stopPosition_deg = stopState.position_deg;
stopVelocity_deg_s = stopState.velocity_deg_s;
stopAcceleration_deg_s2 = stopState.acceleration_deg_s2;

accelerationResidual_deg_s2 = ...
    stopAcceleration_deg_s2 - firstAcceleration_deg_s2;
velocityResidual_deg_s = stopVelocity_deg_s - firstVelocity_deg_s - ...
    firstAcceleration_deg_s2 * duration_s;
positionResidual_deg = stopPosition_deg - firstPosition_deg - ...
    firstVelocity_deg_s * duration_s - ...
    0.5 * firstAcceleration_deg_s2 * duration_s^2;
scaledResidual = [ ...
    accelerationResidual_deg_s2 / phaseDuration_s; ...
    2 * velocityResidual_deg_s / phaseDuration_s^2; ...
    6 * positionResidual_deg / phaseDuration_s^3];
inverseEndpointMap = (1 / 6) * [ ...
    2 -3 1; ...
    -7 9 -2; ...
    11 -6 1];
phaseJerk_deg_s3 = inverseEndpointMap * scaledResidual;

law = zeros(18, 2);
phasePosition_deg = firstPosition_deg;
phaseVelocity_deg_s = firstVelocity_deg_s;
phaseAcceleration_deg_s2 = firstAcceleration_deg_s2;
for phaseIndex = 1:3
    firstRow = 6 * (phaseIndex - 1) + 1;
    phaseJerk = phaseJerk_deg_s3(phaseIndex, :);
    law(firstRow, :) = phasePosition_deg;
    law(firstRow + 1, :) = phaseVelocity_deg_s;
    law(firstRow + 2, :) = phaseAcceleration_deg_s2;
    law(firstRow + 3, :) = phaseJerk;
    law(firstRow + 4, :) = (phaseIndex - 1) * phaseDuration_s;
    law(firstRow + 5, :) = phaseDuration_s;
    phasePosition_deg = phasePosition_deg + ...
        phaseVelocity_deg_s * phaseDuration_s + ...
        0.5 * phaseAcceleration_deg_s2 * phaseDuration_s^2 + ...
        (1 / 6) * phaseJerk * phaseDuration_s^3;
    phaseVelocity_deg_s = phaseVelocity_deg_s + ...
        phaseAcceleration_deg_s2 * phaseDuration_s + ...
        0.5 * phaseJerk * phaseDuration_s^2;
    phaseAcceleration_deg_s2 = phaseAcceleration_deg_s2 + ...
        phaseJerk * phaseDuration_s;
end
end

function [position_deg, velocity_deg_s, acceleration_deg_s2, ...
        jerk_deg_s3] = evaluateLaw(law, localTime_s)
localTime_s = double(localTime_s(:));
sampleCount = numel(localTime_s);
position_deg = zeros(sampleCount, 2);
velocity_deg_s = zeros(sampleCount, 2);
acceleration_deg_s2 = zeros(sampleCount, 2);
jerk_deg_s3 = zeros(sampleCount, 2);
phaseDuration_s = law(6, 1);
totalDuration_s = 3 * phaseDuration_s;
for sampleIndex = 1:sampleCount
    queryTime_s = min(totalDuration_s, max(0, localTime_s(sampleIndex)));
    phaseIndex = min(3, floor(queryTime_s / phaseDuration_s) + 1);
    if queryTime_s >= totalDuration_s
        phaseIndex = 3;
    end
    firstRow = 6 * (phaseIndex - 1) + 1;
    phaseStart_s = law(firstRow + 4, 1);
    phaseTime_s = queryTime_s - phaseStart_s;
    phasePosition_deg = law(firstRow, :);
    phaseVelocity_deg_s = law(firstRow + 1, :);
    phaseAcceleration_deg_s2 = law(firstRow + 2, :);
    phaseJerk_deg_s3 = law(firstRow + 3, :);
    position_deg(sampleIndex, :) = phasePosition_deg + ...
        phaseVelocity_deg_s * phaseTime_s + ...
        0.5 * phaseAcceleration_deg_s2 * phaseTime_s^2 + ...
        (1 / 6) * phaseJerk_deg_s3 * phaseTime_s^3;
    velocity_deg_s(sampleIndex, :) = phaseVelocity_deg_s + ...
        phaseAcceleration_deg_s2 * phaseTime_s + ...
        0.5 * phaseJerk_deg_s3 * phaseTime_s^2;
    acceleration_deg_s2(sampleIndex, :) = ...
        phaseAcceleration_deg_s2 + phaseJerk_deg_s3 * phaseTime_s;
    jerk_deg_s3(sampleIndex, :) = phaseJerk_deg_s3;
end
end

function extrema = analyticExtrema(law)
minimumPosition_deg = [Inf Inf];
maximumPosition_deg = [-Inf -Inf];
maximumVelocity_deg_s = [0 0];
maximumAcceleration_deg_s2 = [0 0];
maximumJerk_deg_s3 = [0 0];
for phaseIndex = 1:3
    firstRow = 6 * (phaseIndex - 1) + 1;
    phaseDuration_s = law(firstRow + 5, 1);
    for axisIndex = 1:2
        position0_deg = law(firstRow, axisIndex);
        velocity0_deg_s = law(firstRow + 1, axisIndex);
        acceleration0_deg_s2 = law(firstRow + 2, axisIndex);
        jerk_deg_s3 = law(firstRow + 3, axisIndex);
        velocityTimes_s = zeros(3, 1);
        velocityTimes_s(1:2) = [0; phaseDuration_s];
        velocityTimeCount = 2;
        accelerationRootIsInterior = false;
        if abs(jerk_deg_s3) > eps(max(1, abs(acceleration0_deg_s2)))
            accelerationRoot_s = -acceleration0_deg_s2 / jerk_deg_s3;
            accelerationRootIsInterior = accelerationRoot_s > 0 && ...
                accelerationRoot_s < phaseDuration_s;
        end
        if accelerationRootIsInterior
            velocityTimeCount = 3;
            velocityTimes_s(3) = accelerationRoot_s;
        end
        velocityTimes_s = velocityTimes_s(1:velocityTimeCount);
        velocityValues_deg_s = velocity0_deg_s + ...
            acceleration0_deg_s2 * velocityTimes_s + ...
            0.5 * jerk_deg_s3 * velocityTimes_s.^2;
        maximumVelocity_deg_s(axisIndex) = max( ...
            maximumVelocity_deg_s(axisIndex), ...
            max(abs(velocityValues_deg_s)));

        accelerationValues_deg_s2 = acceleration0_deg_s2 + ...
            jerk_deg_s3 * [0; phaseDuration_s];
        maximumAcceleration_deg_s2(axisIndex) = max( ...
            maximumAcceleration_deg_s2(axisIndex), ...
            max(abs(accelerationValues_deg_s2)));
        maximumJerk_deg_s3(axisIndex) = max( ...
            maximumJerk_deg_s3(axisIndex), abs(jerk_deg_s3));

        positionTimes_s = [0; phaseDuration_s; ...
            velocityRoots(velocity0_deg_s, ...
            acceleration0_deg_s2, jerk_deg_s3, phaseDuration_s)];
        positionValues_deg = position0_deg + ...
            velocity0_deg_s * positionTimes_s + ...
            0.5 * acceleration0_deg_s2 * positionTimes_s.^2 + ...
            (1 / 6) * jerk_deg_s3 * positionTimes_s.^3;
        minimumPosition_deg(axisIndex) = min( ...
            minimumPosition_deg(axisIndex), min(positionValues_deg));
        maximumPosition_deg(axisIndex) = max( ...
            maximumPosition_deg(axisIndex), max(positionValues_deg));
    end
end
extrema = struct( ...
    "minimumPosition_deg", minimumPosition_deg, ...
    "maximumPosition_deg", maximumPosition_deg, ...
    "maximumVelocity_deg_s", maximumVelocity_deg_s, ...
    "maximumAcceleration_deg_s2", maximumAcceleration_deg_s2, ...
    "maximumJerk_deg_s3", maximumJerk_deg_s3);
end

function roots_s = velocityRoots( ...
        velocity0_deg_s, acceleration0_deg_s2, jerk_deg_s3, duration_s)
roots_s = zeros(0, 1);
quadraticCoefficient = 0.5 * jerk_deg_s3;
scale = max(1, max(abs([velocity0_deg_s, ...
    acceleration0_deg_s2, jerk_deg_s3])));
if abs(quadraticCoefficient) <= eps(scale)
    if abs(acceleration0_deg_s2) <= eps(scale)
        return;
    end
    candidate_s = -velocity0_deg_s / acceleration0_deg_s2;
    if candidate_s > 0 && candidate_s < duration_s
        roots_s = candidate_s;
    end
    return;
end
discriminant = acceleration0_deg_s2^2 - ...
    4 * quadraticCoefficient * velocity0_deg_s;
discriminantTolerance = 64 * eps(scale^2);
if discriminant < -discriminantTolerance
    return;
end
discriminant = max(0, discriminant);
squareRoot = sqrt(discriminant);
signedRoot = squareRoot;
if acceleration0_deg_s2 < 0
    signedRoot = -squareRoot;
end
stableNumerator = -0.5 * ...
    (acceleration0_deg_s2 + signedRoot);
firstRoot_s = stableNumerator / quadraticCoefficient;
if abs(stableNumerator) > eps(scale)
    secondRoot_s = velocity0_deg_s / stableNumerator;
else
    secondRoot_s = -acceleration0_deg_s2 / ...
        (2 * quadraticCoefficient);
end
candidates_s = unique([firstRoot_s; secondRoot_s]);
roots_s = candidates_s(candidates_s > 0 & candidates_s < duration_s);
end
