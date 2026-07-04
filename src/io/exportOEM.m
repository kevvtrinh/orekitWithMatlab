function exportOEM(scenario, satelliteName, filename)
%EXPORTOEM Write a CCSDS OEM 2.0 ephemeris file (GCRF, UTC, km and km/s).
%
% Interoperates with STK, GMAT, and other CCSDS-aware tools.

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("exportOEM:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", string(satelliteName));
end
ephemeris = sat.Ephemeris;

fid = fopen(filename, "w");
if fid < 0
    error("exportOEM:CannotOpenFile", "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid));

fprintf(fid, "CCSDS_OEM_VERS = 2.0\n");
fprintf(fid, "CREATION_DATE = %s\n", oemTime(datetime("now", "TimeZone", "UTC")));
fprintf(fid, "ORIGINATOR = MATLAB Orekit Mission Suite\n\n");

fprintf(fid, "META_START\n");
fprintf(fid, "OBJECT_NAME = %s\n", string(sat.Name));
fprintf(fid, "OBJECT_ID = %s\n", string(sat.Name));
fprintf(fid, "CENTER_NAME = EARTH\n");
fprintf(fid, "REF_FRAME = GCRF\n");
fprintf(fid, "TIME_SYSTEM = UTC\n");
fprintf(fid, "START_TIME = %s\n", oemTime(ephemeris.Time(1)));
fprintf(fid, "STOP_TIME = %s\n", oemTime(ephemeris.Time(end)));
fprintf(fid, "META_STOP\n\n");

for k = 1:height(ephemeris)
    fprintf(fid, "%s %.9f %.9f %.9f %.12f %.12f %.12f\n", ...
        oemTime(ephemeris.Time(k)), ...
        ephemeris.X_m(k) / 1000.0, ephemeris.Y_m(k) / 1000.0, ephemeris.Z_m(k) / 1000.0, ...
        ephemeris.VX_mps(k) / 1000.0, ephemeris.VY_mps(k) / 1000.0, ephemeris.VZ_mps(k) / 1000.0);
end
end

function text = oemTime(time)
time.TimeZone = "UTC";
text = string(time, "yyyy-MM-dd'T'HH:mm:ss.SSS");
end
