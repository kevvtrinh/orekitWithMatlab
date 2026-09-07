function footprint = computeSensorFootprint(scenario, parentName, sensorName, time, options)
%COMPUTESENSORFOOTPRINT Sensor cone projection onto the Earth surface.
%
% footprint = computeSensorFootprint(scenario, "Sat-1", "NadirCam", time)
% footprint = computeSensorFootprint(..., struct("UseFieldOfRegard", true))
%
% Intersects the sensor cone (FOV half-angle, or the field of regard when
% UseFieldOfRegard is set) with a spherical Earth. The outline combines
% cone-boundary arcs that intersect Earth and horizon arcs inside the cone.
% A cone that misses Earth returns empty coordinates. Rectangular sensors
% use their enclosing cone (an explicit bounding-cone approximation).
%
% Result fields: LatitudeDeg/LongitudeDeg (closed outline), EcefMeters,
% SubLatitudeDeg/SubLongitudeDeg (sub-satellite point), HalfAngleDeg,
% HorizonLimited, Type ("FOV"|"FOR").
% Empty coordinates have shapes 0-by-1 and 0-by-3. Disconnected boundary
% rings (possible for cones wider than 90 degrees) have NaN separators.
% NumPoints controls angular tessellation; surface intersections and the
% cone/horizon crossings are analytic. Latitude is spherical/geocentric.

arguments
    scenario MissionScenario
    parentName
    sensorName
    time
    options struct = struct()
end

useFor = isfield(options, "UseFieldOfRegard") && options.UseFieldOfRegard;
numPoints = 73;
if isfield(options, "NumPoints") && ~isempty(options.NumPoints)
    numPoints = options.NumPoints;
end
validateattributes(numPoints, {'numeric'}, {'scalar', 'finite', 'integer', '>=', 4});

parent = scenario.getObject(parentName);
if ~isa(parent, "SatelliteObject")
    error("computeSensorFootprint:UnsupportedParent", ...
        "Footprints are only defined for satellite sensors.");
end
sensor = parent.getSensor(sensorName);

if useFor
    halfAngleDeg = sensor.FieldOfRegardDeg;
    typeName = "FOR";
else
    halfAngleDeg = sensor.effectiveConeHalfAngleDeg();
    typeName = "FOV";
end
if ~isscalar(halfAngleDeg) || ~isfinite(halfAngleDeg) || ...
        halfAngleDeg <= 0 || halfAngleDeg > 180
    error("computeSensorFootprint:InvalidHalfAngle", ...
        "Sensor '%s' requires a %s half-angle in (0, 180] degrees.", string(sensorName), typeName);
end

earthRadiusM = 6378137.0;
p = parent.getECEF(time);
rNorm = norm(p);
if rNorm <= earthRadiusM
    error("computeSensorFootprint:BelowSurface", ...
        "Satellite '%s' is not above the Earth surface at the requested time.", ...
        string(parentName));
end

% FOV follows the live pointing (including an active scheduled task, so a
% tracked/scanned footprint sits on the target); the field of regard is
% always drawn around the sensor's nominal axis since it describes where
% the sensor could point, not where it is currently pointing.
if useFor
    axisUnit = sensor.getBoresightVector(time, scenario);
else
    pointing = resolveSensorPointing(scenario, parentName, sensorName, time);
    axisUnit = pointing.BoresightEcef;
end
axisUnit = SensorObject.unitVector(axisUnit);
if any(~isfinite(axisUnit))
    error("computeSensorFootprint:InvalidBoresight", ...
        "Sensor boresight must be a finite nonzero ECEF vector.");
end
nadir = -p / rNorm;
horizonAngle = asin(earthRadiusM / rNorm);
gamma = deg2rad(halfAngleDeg);
[coneArc, coneClosed] = capBoundaryArc(axisUnit, gamma, nadir, horizonAngle, numPoints);
[limbArc, limbClosed] = capBoundaryArc(nadir, horizonAngle, axisUnit, gamma, numPoints);
directions = joinBoundaryArcs(coneArc, coneClosed, limbArc, limbClosed);

points = zeros(size(directions));
finiteRows = all(isfinite(directions), 2);
b = directions(finiteRows, :) * p.';
c = rNorm^2 - earthRadiusM^2;
% Clamping here removes only floating-point roundoff at analytic tangency;
% unlike ray clamping, it never changes a direction to create an intersection.
discriminant = b.^2 - c;
roundoffTolerance = 64 * eps(rNorm^2);
if any(discriminant < -roundoffTolerance) || any(b >= 0)
    error("computeSensorFootprint:InvalidIntersection", ...
        "Clipped boundary contains a ray without a forward Earth intersection.");
end
t = -b - sqrt(max(discriminant, 0));
points(finiteRows, :) = p + t .* directions(finiteRows, :);
points(~finiteRows, :) = NaN;

footprint = struct();
footprint.ParentName = string(parentName);
footprint.SensorName = string(sensor.Name);
footprint.Type = typeName;
footprint.Time = time;
footprint.HalfAngleDeg = halfAngleDeg;
footprint.HorizonLimited = ~isempty(limbArc);
footprint.EcefMeters = points;
footprint.LatitudeDeg = asind(max(-1, min(1, points(:, 3) / earthRadiusM)));
footprint.LatitudeDeg(~finiteRows) = NaN;
footprint.LongitudeDeg = atan2d(points(:, 2), points(:, 1));
footprint.SubLatitudeDeg = asind(-nadir(3));
footprint.SubLongitudeDeg = atan2d(-nadir(2), -nadir(1));
end

function [arc, isClosed] = capBoundaryArc(axis, radius, otherAxis, otherRadius, count)
% Analytic interval on one small circle lying inside the other spherical cap.
arc = zeros(0, 3);
isClosed = false;
if radius >= pi
    return; % A whole-sphere cap has no boundary of its own.
end
first = SensorObject.anyPerpendicular(axis);
second = cross(axis, first);
a = sin(radius) * dot(first, otherAxis);
b = sin(radius) * dot(second, otherAxis);
threshold = cos(otherRadius) - cos(radius) * dot(axis, otherAxis);
amplitude = hypot(a, b);
roundoffTolerance = 64 * eps;
if amplitude <= roundoffTolerance
    if threshold > roundoffTolerance
        return;
    end
    isClosed = true;
elseif threshold >= amplitude
    return; % Empty or a zero-area external tangency.
elseif threshold <= -amplitude
    isClosed = true;
end
if isClosed
    phase = linspace(0, 2 * pi, count).';
else
    center = atan2(b, a);
    halfSpan = acos(max(-1, min(1, threshold / amplitude)));
    arcCount = max(3, ceil((count - 1) * halfSpan / pi) + 1);
    phase = linspace(center - halfSpan, center + halfSpan, arcCount).';
end
arc = cos(radius) * axis + sin(radius) * ...
    (cos(phase) .* first + sin(phase) .* second);
end

function directions = joinBoundaryArcs(coneArc, coneClosed, limbArc, limbClosed)
% Preserve separate rings for a wide cone that excludes a disk inside Earth.
if isempty(coneArc)
    directions = limbArc;
elseif isempty(limbArc)
    directions = coneArc;
elseif coneClosed || limbClosed
    directions = [coneArc; NaN(1, 3); limbArc];
else
    if norm(coneArc(end, :) - limbArc(end, :)) < ...
            norm(coneArc(end, :) - limbArc(1, :))
        limbArc = flipud(limbArc);
    end
    directions = [coneArc; limbArc(2:end, :)];
    directions(end, :) = directions(1, :);
end
end
