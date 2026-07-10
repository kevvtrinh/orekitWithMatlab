function info = exportStkAzElMask(maskTable, filename, options)
%EXPORTSTKAZELMASK Write an STK azimuth-elevation mask file (*.aem).

arguments
    maskTable table
    filename
    options.Version (1, 1) string = "12.0"
end

required = ["AzimuthDeg", "MinElevationDeg"];
if isempty(maskTable) || ~all(ismember(required, maskTable.Properties.VariableNames))
    error("exportStkAzElMask:InvalidMask", ...
        "Mask table must contain AzimuthDeg and MinElevationDeg.");
end

azimuth = mod(double(maskTable.AzimuthDeg(:)), 360);
elevation = double(maskTable.MinElevationDeg(:));
valid = isfinite(azimuth) & isfinite(elevation);
azimuth = azimuth(valid);
elevation = elevation(valid);
if isempty(azimuth)
    error("exportStkAzElMask:EmptyMask", "Mask has no finite points.");
end
[azimuth, order] = sort(azimuth);
elevation = elevation(order);
[azimuth, uniqueIndices] = unique(azimuth, "stable");
elevation = elevation(uniqueIndices);

if azimuth(1) > 0
    extendedAz = [azimuth(end) - 360; azimuth; azimuth(1) + 360];
    extendedEl = [elevation(end); elevation; elevation(1)];
    elevationAtZero = interp1(extendedAz, extendedEl, 0, "linear");
    azimuth = [0; azimuth];
    elevation = [elevationAtZero; elevation];
end
if azimuth(1) == 0
    elevationAtZero = elevation(1);
else
    elevationAtZero = elevation(end);
end
azimuth(end + 1, 1) = 360;
elevation(end + 1, 1) = elevationAtZero;

fid = fopen(filename, "w");
if fid < 0
    error("exportStkAzElMask:CannotOpenFile", ...
        "Could not open %s for writing.", string(filename));
end
cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>

fprintf(fid, "stk.v.%s\n", options.Version);
fprintf(fid, "BEGIN AzElMask\n");
fprintf(fid, "NumberOfPoints %d\n", numel(azimuth));
fprintf(fid, "BEGIN AzElMaskData\n");
for k = 1:numel(azimuth)
    fprintf(fid, "%.12g %.12g\n", azimuth(k), elevation(k));
end
fprintf(fid, "END AzElMask\n");

info = struct("Filename", string(filename), "PointCount", numel(azimuth));
end
