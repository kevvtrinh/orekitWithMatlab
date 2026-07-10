function info = exportStkEphemeris(scenario, satelliteName, filename, options)
%EXPORTSTKEPHEMERIS Write an STK ASCII ephemeris file (*.e).

arguments
    scenario MissionScenario
    satelliteName
    filename
    options.Version (1, 1) string = "12.0"
end

satellite = scenario.getObject(satelliteName);
if ~isa(satellite, "SatelliteObject")
    error("exportStkEphemeris:NotSatellite", ...
        "Object '%s' is not a satellite.", string(satelliteName));
end
if isempty(satellite.Ephemeris)
    error("exportStkEphemeris:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", string(satelliteName));
end

ephemeris = sortrows(satellite.Ephemeris, "Time");
required = ["Time", "X_m", "Y_m", "Z_m", "VX_mps", "VY_mps", "VZ_mps"];
if ~all(ismember(required, ephemeris.Properties.VariableNames))
    error("exportStkEphemeris:MissingColumns", ...
        "Satellite ephemeris is missing STK position/velocity columns.");
end
epoch = scenario.Config.Epoch;
epoch.TimeZone = "UTC";
offsetSeconds = seconds(ephemeris.Time - epoch);
interpolationOrder = max(1, min(5, height(ephemeris) - 1));

fid = fopen(filename, "w");
if fid < 0
    error("exportStkEphemeris:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>

fprintf(fid, "stk.v.%s\n", options.Version);
fprintf(fid, "BEGIN Ephemeris\n");
fprintf(fid, "NumberOfEphemerisPoints %d\n", height(ephemeris));
fprintf(fid, "ScenarioEpoch %s\n", formatStkUtc(epoch));
fprintf(fid, "InterpolationMethod Lagrange\n");
fprintf(fid, "InterpolationOrder %d\n", interpolationOrder);
fprintf(fid, "CentralBody %s\n", string(scenario.Config.CentralBody));
fprintf(fid, "CoordinateSystem ICRF\n");
fprintf(fid, "DistanceUnit Meters\n");
boundaryOffsets = maneuverBoundaryOffsets(satellite, epoch, ...
    ephemeris.Time(1), ephemeris.Time(end));
if ~isempty(boundaryOffsets)
    fprintf(fid, "BEGIN SegmentBoundaryTimes\n");
    for boundary = reshape(boundaryOffsets, 1, [])
        fprintf(fid, "%.9f\n", boundary);
    end
    fprintf(fid, "END SegmentBoundaryTimes\n");
end
fprintf(fid, "EphemerisTimePosVel\n");
for k = 1:height(ephemeris)
    fprintf(fid, "%.9f %.15g %.15g %.15g %.15g %.15g %.15g\n", ...
        offsetSeconds(k), ephemeris.X_m(k), ephemeris.Y_m(k), ephemeris.Z_m(k), ...
        ephemeris.VX_mps(k), ephemeris.VY_mps(k), ephemeris.VZ_mps(k));
end
fprintf(fid, "END Ephemeris\n");

info = struct("Filename", string(filename), "PointCount", height(ephemeris), ...
    "StartTime", ephemeris.Time(1), "StopTime", ephemeris.Time(end), ...
    "CoordinateSystem", "ICRF", "DistanceUnit", "Meters", ...
    "SegmentBoundaryCount", numel(boundaryOffsets));
end

function offsets = maneuverBoundaryOffsets(satellite, epoch, startTime, stopTime)
offsets = zeros(0, 1);
for k = 1:numel(satellite.Maneuvers)
    maneuver = satellite.Maneuvers{k};
    if isstruct(maneuver)
        if ~isfield(maneuver, "Time")
            continue;
        end
        maneuverTime = maneuver.Time;
    else
        maneuverTime = maneuver.Time;
    end
    if ~isdatetime(maneuverTime) || isnat(maneuverTime) || ...
            maneuverTime <= startTime || maneuverTime >= stopTime
        continue;
    end
    offsets(end + 1, 1) = seconds(maneuverTime - epoch); %#ok<AGROW>
end
offsets = unique(sort(offsets));
end
