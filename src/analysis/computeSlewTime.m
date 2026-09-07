function slewTimeSeconds = computeSlewTime(slewAngleDeg, slewRateDegPerSec, slewAccelerationDegPerSec2)
%COMPUTESLEWTIME Minimum rest-to-rest angular slew time in seconds.
% Angle is a nonnegative array in degrees. Rate and acceleration are
% positive scalar limits in deg/s and deg/s^2; Inf removes that limit.
% This scalar-axis model does not model jerk or nonzero endpoint rates.

if nargin < 3
    slewAccelerationDegPerSec2 = Inf;
end
validateattributes(slewAngleDeg, {'numeric'}, {'real', 'finite', 'nonnegative'});
validateattributes(slewRateDegPerSec, {'numeric'}, {'real', 'scalar', 'positive', 'nonnan'});
validateattributes(slewAccelerationDegPerSec2, {'numeric'}, ...
    {'real', 'scalar', 'positive', 'nonnan'});
if isinf(slewAccelerationDegPerSec2)
    slewTimeSeconds = slewAngleDeg ./ slewRateDegPerSec;
else
    % Both ramps consume v^2/a degrees; longer slews cruise between ramps.
    slewTimeSeconds = 2 .* sqrt(slewAngleDeg ./ slewAccelerationDegPerSec2);
    cruise = slewAngleDeg > slewRateDegPerSec^2 / slewAccelerationDegPerSec2;
    slewTimeSeconds(cruise) = slewAngleDeg(cruise) ./ slewRateDegPerSec + ...
        slewRateDegPerSec / slewAccelerationDegPerSec2;
end
end
