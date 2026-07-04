function slewTimeSeconds = computeSlewTime(slewAngleDeg, slewRateDegPerSec, slewAccelerationDegPerSec2)
%COMPUTESLEWTIME Approximate slew time placeholder.

if nargin < 3
    slewAccelerationDegPerSec2 = Inf;
end
if slewRateDegPerSec <= 0
    slewTimeSeconds = Inf;
    return;
end

rateLimitedTime = slewAngleDeg ./ slewRateDegPerSec;
if isfinite(slewAccelerationDegPerSec2) && slewAccelerationDegPerSec2 > 0
    accelerationTime = 2.0 .* sqrt(max(slewAngleDeg, 0) ./ slewAccelerationDegPerSec2);
    slewTimeSeconds = max(rateLimitedTime, accelerationTime);
else
    slewTimeSeconds = rateLimitedTime;
end
end
