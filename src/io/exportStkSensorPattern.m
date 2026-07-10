function info = exportStkSensorPattern(boundary, filename, options)
%EXPORTSTKSENSORPATTERN Write an STK custom sensor pattern (*.pattern).

arguments
    boundary table
    filename
    options.Version (1, 1) string = "12.0"
end

names = string(boundary.Properties.VariableNames);
if all(ismember(["AzimuthDeg", "ElevationDeg"], names))
    first = double(boundary.AzimuthDeg(:));
    second = double(boundary.ElevationDeg(:));
    dataKeyword = "AzElMaskData";
    formatName = "AzElMask";
elseif all(ismember(["HalfAngleDeg", "AzimuthDeg"], names))
    first = double(boundary.HalfAngleDeg(:));
    second = double(boundary.AzimuthDeg(:));
    dataKeyword = "HalfAngleAzimuthData";
    formatName = "HalfAngleAzimuth";
elseif all(ismember(["AngleOffBoresightDeg", "AzimuthDeg"], names))
    first = double(boundary.AngleOffBoresightDeg(:));
    second = double(boundary.AzimuthDeg(:));
    dataKeyword = "HalfAngleAzimuthData";
    formatName = "HalfAngleAzimuth";
else
    error("exportStkSensorPattern:UnsupportedBoundary", ...
        "Custom boundary needs AzimuthDeg/ElevationDeg or half-angle/azimuth columns.");
end

valid = isfinite(first) & isfinite(second);
first = first(valid);
second = second(valid);
if numel(first) < 3
    error("exportStkSensorPattern:TooFewPoints", ...
        "A custom STK sensor pattern needs at least three finite points.");
end
if first(1) ~= first(end) || second(1) ~= second(end)
    first(end + 1, 1) = first(1);
    second(end + 1, 1) = second(1);
end

fid = fopen(filename, "w");
if fid < 0
    error("exportStkSensorPattern:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>

fprintf(fid, "stk.v.%s\n", options.Version);
fprintf(fid, "NumberPoints %d\n", numel(first));
fprintf(fid, "%s\n", dataKeyword);
for k = 1:numel(first)
    fprintf(fid, "%.12g %.12g\n", first(k), second(k));
end
fprintf(fid, "EndPatternData\n");

info = struct("Filename", string(filename), "PointCount", numel(first), ...
    "Format", formatName);
end
