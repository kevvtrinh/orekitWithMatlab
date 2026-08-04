function [position_deg, velocity_deg_s, acceleration_deg_s2, ...
        jerk_deg_s3] = evaluatePackedAzElConstantJerkLaw( ...
        law, localTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   [position_deg, velocity_deg_s, acceleration_deg_s2, jerk_deg_s3] = ...
%       evaluatePackedAzElConstantJerkLaw(law, localTime_s)
%**************************************************************************
% PURPOSE
%   - Evaluate one validated packed three-phase constant-jerk law.
%   - Own the propagation equations shared by search, collision checking,
%     reconstruction, sampling, plotting data, and independent validation.
%**************************************************************************
% INPUTS
%   - law (18-by-2 numeric matrix)
%       Packed phase initial states, jerks, start times, and durations.
%   - localTime_s (numeric vector)
%       Segment-relative times already clamped to the law duration.
%**************************************************************************
% OUTPUTS
%   - position_deg, velocity_deg_s, acceleration_deg_s2, jerk_deg_s3
%       Sample-by-two analytic state and control arrays.
%**************************************************************************
% UNITS
%   - Position is degrees; time is seconds; derivatives use deg/s powers.

%% Section 1: Evaluate The Authoritative Constant-Jerk Equations
localTime_s = double(localTime_s(:));
sampleCount = numel(localTime_s);
position_deg = zeros(sampleCount, 2);
velocity_deg_s = zeros(sampleCount, 2);
acceleration_deg_s2 = zeros(sampleCount, 2);
jerk_deg_s3 = zeros(sampleCount, 2);
phaseDuration_s = law(6, 1);
totalDuration_s = 3 * phaseDuration_s;
phaseIndex = min(3, floor(localTime_s / phaseDuration_s) + 1);
phaseIndex(localTime_s >= totalDuration_s) = 3;
for phase = 1:3
    rows = phaseIndex == phase;
    if ~any(rows)
        continue;
    end
    firstRow = 6 * (phase - 1) + 1;
    phaseTime_s = localTime_s(rows) - law(firstRow + 4, 1);
    phasePosition_deg = law(firstRow, :);
    phaseVelocity_deg_s = law(firstRow + 1, :);
    phaseAcceleration_deg_s2 = law(firstRow + 2, :);
    phaseJerk_deg_s3 = law(firstRow + 3, :);
    position_deg(rows, :) = phasePosition_deg + ...
        phaseTime_s * phaseVelocity_deg_s + ...
        0.5 * phaseTime_s.^2 * phaseAcceleration_deg_s2 + ...
        (1 / 6) * phaseTime_s.^3 * phaseJerk_deg_s3;
    velocity_deg_s(rows, :) = phaseVelocity_deg_s + ...
        phaseTime_s * phaseAcceleration_deg_s2 + ...
        0.5 * phaseTime_s.^2 * phaseJerk_deg_s3;
    acceleration_deg_s2(rows, :) = phaseAcceleration_deg_s2 + ...
        phaseTime_s * phaseJerk_deg_s3;
    jerk_deg_s3(rows, :) = repmat( ...
        phaseJerk_deg_s3, nnz(rows), 1);
end
end
