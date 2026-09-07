function [tf, conflictType, overlapSeconds, requiredSlewSeconds, availableSlewSeconds] = ...
        candidateRowsConflict(candidateA, candidateB, options)
%CANDIDATEROWSCONFLICT Check shared platform/sensor occupancy and transitions.
% Uses actual parent-body endpoint directions under a rest-to-rest model.
% Unknown endpoint geometry conflicts when EnforceSlew=true. Set it false
% explicitly to perform only occupancy checks on geometry-free legacy rows.
if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
tf = false;
conflictType = "";
overlapSeconds = 0;
requiredSlewSeconds = 0;
availableSlewSeconds = Inf;

resourcesA = candidateSensorResources(candidateA);
resourcesB = candidateSensorResources(candidateB);
for a = 1:numel(resourcesA)
    for b = 1:numel(resourcesB)
        if resourcesA(a).Key ~= resourcesB(b).Key
            continue;
        end
        [tf, conflictType, overlapSeconds, requiredSlewSeconds, availableSlewSeconds] = ...
            resourceConflict(resourcesA(a), resourcesB(b), options);
        if tf
            return;
        end
    end
end
end

function [tf, kind, overlap, required, available] = resourceConflict(a, b, options)
% Match each resource's own occupancy, including asynchronous cooperation.
tf = false;
kind = "";
required = 0;
overlap = max(0, min(a.StopTimeUnixSeconds, b.StopTimeUnixSeconds) - ...
    max(a.StartTimeUnixSeconds, b.StartTimeUnixSeconds));
available = max(0, max(a.StartTimeUnixSeconds, b.StartTimeUnixSeconds) - ...
    min(a.StopTimeUnixSeconds, b.StopTimeUnixSeconds));
if options.EnforceOneTaskPerSensor && overlap > 0
    tf = true;
    kind = "SameSensorOverlap";
    return;
end
if ~options.EnforceSlew
    return;
end
if ~a.HasSlewGeometry || ~b.HasSlewGeometry
    tf = true;
    kind = "UnknownSlewGeometry";
    required = NaN;
    return;
end
if b.StartTimeUnixSeconds < a.StartTimeUnixSeconds
    temporary = a;
    a = b;
    b = temporary;
end
required = transitionSeconds(a, b);
if available < required
    tf = true;
    kind = "InsufficientSlewTime";
end
end

function duration = transitionSeconds(a, b)
% A scalar-limited slew follows the shortest arc. With finite axis limits,
% use a conservative realizable azimuth-then-elevation rest-to-rest path.
if string(a.Frame) ~= "ParentBody" || string(b.Frame) ~= "ParentBody"
    error("candidateRowsConflict:UnsupportedFrame", ...
        "Slew endpoint vectors must be expressed in ParentBody coordinates.");
end
from = reshape(a.StopPointing, 1, 3);
to = reshape(b.StartPointing, 1, 3);
validateattributes(from, {'numeric'}, {'real', 'finite'});
validateattributes(to, {'numeric'}, {'real', 'finite'});
if norm(from) == 0 || norm(to) == 0
    error("candidateRowsConflict:InvalidPointing", "Slew directions must be nonzero.");
end
rate = min([str2double(string(a.RateDegPerSec)), ...
    str2double(string(b.RateDegPerSec))]);
acceleration = min([str2double(string(a.AccelerationDegPerSec2)), ...
    str2double(string(b.AccelerationDegPerSec2))]);
axisRates = min([str2double(string(a.AxisRatesDegPerSec(:))).'; ...
    str2double(string(b.AxisRatesDegPerSec(:))).'], [], 1);
axisAccelerations = min([str2double(string(a.AxisAccelerationsDegPerSec2(:))).'; ...
    str2double(string(b.AxisAccelerationsDegPerSec2(:))).'], [], 1);
if all(isinf([axisRates, axisAccelerations]))
    duration = computeSlewTime(computeSlewAngle(from, to), rate, acceleration);
else
    fromAzEl = SensorObject.azElFromBodyVector(from);
    toAzEl = SensorObject.azElFromBodyVector(to);
    delta = abs(toAzEl - fromAzEl);
    delta(1) = abs(mod(toAzEl(1) - fromAzEl(1) + 180, 360) - 180);
    duration = 0;
    for axisIndex = 1:2
        duration = duration + computeSlewTime(delta(axisIndex), ...
            min(rate, axisRates(axisIndex)), min(acceleration, axisAccelerations(axisIndex)));
    end
end
settling = max(a.SettlingTimeSeconds, b.SettlingTimeSeconds);
validateattributes(settling, {'numeric'}, {'real', 'scalar', 'finite', 'nonnegative'});
duration = duration + settling;
end
