function accessLogical = computeLineOfSight(sourceSatellite, targetSatellite, timeVector)
%COMPUTELINEOFSIGHT Simple spherical-Earth satellite-satellite LOS check.

earthRadiusMeters = 6378137.0;
n = numel(timeVector);
accessLogical = false(n, 1);

for k = 1:n
    p1 = sourceSatellite.getECI(timeVector(k));
    p2 = targetSatellite.getECI(timeVector(k));
    accessLogical(k) = distanceFromOriginToSegment(p1, p2) > earthRadiusMeters;
end
end

function distance = distanceFromOriginToSegment(p1, p2)
segment = p2 - p1;
if norm(segment) == 0
    distance = norm(p1);
    return;
end
t = -dot(p1, segment) / dot(segment, segment);
t = min(max(t, 0), 1);
closest = p1 + t * segment;
distance = norm(closest);
end

