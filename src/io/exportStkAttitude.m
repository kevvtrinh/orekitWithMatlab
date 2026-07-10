function info = exportStkAttitude(scenario, satelliteName, filename, options)
%EXPORTSTKATTITUDE Write synthesized suite body attitude to an STK *.a file.
%
% The suite does not yet store an independent spacecraft attitude history.
% This writer therefore exports the body frame used by SensorObject:
% +Z radial outward, +X along the Earth-fixed ground-track velocity, and +Y
% completing the right-handed frame. The file records that provenance.

arguments
    scenario MissionScenario
    satelliteName
    filename
    options.Version (1, 1) string = "12.0"
end

satellite = scenario.getObject(satelliteName);
if ~isa(satellite, "SatelliteObject")
    error("exportStkAttitude:NotSatellite", ...
        "Object '%s' is not a satellite.", string(satelliteName));
end
if isempty(satellite.Ephemeris) || height(satellite.Ephemeris) < 2
    error("exportStkAttitude:NoEphemeris", ...
        "Satellite '%s' needs at least two ephemeris points.", string(satelliteName));
end

ephemeris = sortrows(satellite.Ephemeris, "Time");
timeVector = ephemeris.Time;
epoch = scenario.Config.Epoch;
epoch.TimeZone = "UTC";
offsetSeconds = seconds(timeVector - epoch);
quaternions = zeros(numel(timeVector), 4);
basis = eye(3);

for k = 1:numel(timeVector)
    axesEcef = zeros(3, 3);
    for axisIndex = 1:3
        axesEcef(axisIndex, :) = SensorObject.bodyVectorToECEF( ...
            satellite, timeVector(k), basis(axisIndex, :));
    end
    ecefToIcrf = OrekitFrameTransform.ecefToGcrfRotation(timeVector(k));
    axesIcrf = axesEcef * ecefToIcrf.';
    axesIcrf = orthonormalizeRows(axesIcrf);
    quaternions(k, :) = rotationMatrixToStkQuaternion(axesIcrf);
    if k > 1 && dot(quaternions(k, :), quaternions(k - 1, :)) < 0
        quaternions(k, :) = -quaternions(k, :);
    end
end

fid = fopen(filename, "w");
if fid < 0
    error("exportStkAttitude:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>

fprintf(fid, "stk.v.%s\n", options.Version);
fprintf(fid, "# Synthesized by MATLAB Orekit Mission Suite\n");
fprintf(fid, "# Body axes: +X Earth-fixed along-track, +Y right-handed, +Z radial outward\n");
fprintf(fid, "BEGIN Attitude\n");
fprintf(fid, "NumberOfAttitudePoints %d\n", numel(timeVector));
fprintf(fid, "ScenarioEpoch %s\n", formatStkUtc(epoch));
fprintf(fid, "TimeFormat EpSec\n");
fprintf(fid, "InterpolationOrder 1\n");
fprintf(fid, "CentralBody %s\n", string(scenario.Config.CentralBody));
fprintf(fid, "CoordinateAxes ICRF\n");
fprintf(fid, "AttitudeTimeQuaternions\n");
for k = 1:numel(timeVector)
    fprintf(fid, "%.9f %.16g %.16g %.16g %.16g\n", ...
        offsetSeconds(k), quaternions(k, 1), quaternions(k, 2), ...
        quaternions(k, 3), quaternions(k, 4));
end
fprintf(fid, "END Attitude\n");

info = struct("Filename", string(filename), "PointCount", numel(timeVector), ...
    "StartTime", timeVector(1), "StopTime", timeVector(end), ...
    "CoordinateAxes", "ICRF", "Provenance", "SynthesizedSuiteBodyFrame");
end

function rotation = orthonormalizeRows(rotation)
zAxis = unitRow(rotation(3, :));
xAxis = rotation(1, :) - dot(rotation(1, :), zAxis) * zAxis;
if norm(xAxis) < 1e-12
    xAxis = perpendicularTo(zAxis);
else
    xAxis = unitRow(xAxis);
end
yAxis = unitRow(cross(zAxis, xAxis));
xAxis = unitRow(cross(yAxis, zAxis));
rotation = [xAxis; yAxis; zAxis];
end

function value = unitRow(value)
value = reshape(value, 1, 3);
value = value / norm(value);
end

function value = perpendicularTo(axis)
[~, index] = min(abs(axis));
seed = zeros(1, 3);
seed(index) = 1;
value = unitRow(cross(seed, axis));
end
