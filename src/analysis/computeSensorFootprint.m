function footprint = computeSensorFootprint(scenario, parentName, sensorName, time, options)
%COMPUTESENSORFOOTPRINT Sensor cone projection onto the Earth surface.
%
% footprint = computeSensorFootprint(scenario, "Sat-1", "NadirCam", time)
% footprint = computeSensorFootprint(..., struct("UseFieldOfRegard", true))
%
% Intersects the sensor cone (FOV half-angle, or the field of regard when
% UseFieldOfRegard is set) with a spherical Earth. Rays that miss the Earth
% are clamped to the horizon limb, so wide cones return the visible-Earth
% cap ("what the sensor could ever see"). Rectangular sensors use their
% effective cone half-angle (bounding-cone approximation).
%
% Result fields: LatitudeDeg/LongitudeDeg (closed outline), EcefMeters,
% SubLatitudeDeg/SubLongitudeDeg (sub-satellite point), HalfAngleDeg,
% HorizonLimited, Type ("FOV"|"FOR").

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
if ~(halfAngleDeg > 0)
    error("computeSensorFootprint:InvalidHalfAngle", ...
        "Sensor '%s' has no positive %s half-angle.", string(sensorName), typeName);
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
basis1 = SensorObject.anyPerpendicular(axisUnit);
basis2 = SensorObject.unitVector(cross(axisUnit, basis1));

psi = linspace(0, 2 * pi, numPoints).';
gamma = deg2rad(min(halfAngleDeg, 89.9));
directions = cos(gamma) * repmat(axisUnit, numPoints, 1) + ...
    sin(gamma) * (cos(psi) .* basis1 + sin(psi) .* basis2);

% Clamp rays that miss the Earth onto the horizon limb (slightly inside it
% so the sphere intersection below always exists).
nadir = -p / rNorm;
horizonAngle = asin(earthRadiusM / rNorm) * 0.99999;
cosToNadir = directions * nadir.';
offNadir = acos(max(min(cosToNadir, 1), -1));
horizonLimited = offNadir > horizonAngle;
if any(horizonLimited)
    inPlane = directions(horizonLimited, :) - cosToNadir(horizonLimited) * nadir;
    inPlane = inPlane ./ sqrt(sum(inPlane.^2, 2));
    directions(horizonLimited, :) = cos(horizonAngle) * repmat(nadir, sum(horizonLimited), 1) + ...
        sin(horizonAngle) * inPlane;
end

b = directions * p.';
c = rNorm^2 - earthRadiusM^2;
t = -b - sqrt(max(b.^2 - c, 0));
points = p + t .* directions;

footprint = struct();
footprint.ParentName = string(parentName);
footprint.SensorName = string(sensor.Name);
footprint.Type = typeName;
footprint.Time = time;
footprint.HalfAngleDeg = halfAngleDeg;
footprint.HorizonLimited = any(horizonLimited);
footprint.EcefMeters = points;
footprint.LatitudeDeg = asind(points(:, 3) / earthRadiusM);
footprint.LongitudeDeg = atan2d(points(:, 2), points(:, 1));
footprint.SubLatitudeDeg = asind(-nadir(3));
footprint.SubLongitudeDeg = atan2d(-nadir(2), -nadir(1));
end
