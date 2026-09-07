function buildCountryCatalog()
%BUILDCOUNTRYCATALOG Convert the bundled Natural Earth shapefile for the UI.
% Requires MATLAB Mapping Toolbox (shaperead). Run from any directory.
root = fileparts(fileparts(mfilename("fullpath")));
source = fullfile(root, "data", "geography", "source");
if ~isfolder(source), mkdir(source); end
unzip(fullfile(root, "data", "geography", "ne_50m_admin_0_countries.zip"), source);
records = shaperead(fullfile(source, "ne_50m_admin_0_countries.shp"), "UseGeoCoords", true);
countries = cell(numel(records), 1);
for k = 1:numel(records)
    record = records(k);
    separators = [0 find(isnan(record.Lon)) numel(record.Lon) + 1];
    rings = {};
    signedAreas = [];
    for r = 1:numel(separators) - 1
        ids = separators(r) + 1:separators(r + 1) - 1;
        if numel(ids) < 4, continue; end
        ring = round([record.Lon(ids).' record.Lat(ids).'], 6);
        rings{end + 1} = ring; %#ok<AGROW>
        signedAreas(end + 1) = sum(ring(1:end-1, 1) .* ring(2:end, 2) - ring(2:end, 1) .* ring(1:end-1, 2)); %#ok<AGROW>
    end
    % ESRI shapefiles use clockwise exterior rings and counterclockwise holes.
    exteriors = find(signedAreas < 0);
    holes = find(signedAreas > 0);
    polygons = cell(1, numel(exteriors));
    for p = 1:numel(exteriors), polygons{p} = {rings{exteriors(p)}}; end
    for h = holes
        hole = rings{h};
        parent = [];
        for p = 1:numel(exteriors)
            outer = rings{exteriors(p)};
            if inpolygon(hole(1, 1), hole(1, 2), outer(:, 1), outer(:, 2))
                parent = p; break;
            end
        end
        if isempty(parent), error("CountryCatalog:OrphanHole", "Unassigned hole in %s", record.ADMIN); end
        polygons{parent}{end + 1} = hole;
    end
    code = dbfText(record.ISO_A3);
    if code == "-99", code = dbfText(record.ADM0_A3); end
    countries{k} = struct("code", code, "name", dbfText(record.NAME_EN), ...
        "adminName", dbfText(record.ADMIN), "continent", dbfText(record.CONTINENT), ...
        "geometry", struct("type", "MultiPolygon", "coordinates", {polygons}));
end
destination = fullfile(root, "apps", "orbit-ui", "public", "geography");
if ~isfolder(destination), mkdir(destination); end
catalog = struct("source", "Natural Earth", "version", "5.1.1", "scale", "1:50m", ...
    "countries", {countries});
file = fopen(fullfile(destination, "countries.json"), "w", "n", "UTF-8");
if file < 0, error("CountryCatalog:WriteFailed", "Cannot write country catalog."); end
closeFile = onCleanup(@() fclose(file));
fprintf(file, "%s\n", jsonencode(catalog));
fprintf("Exported %d country boundaries.\n", numel(countries));
end

function value = dbfText(value)
% DBF character fields may be padded with NUL bytes as well as spaces.
value = strtrim(erase(string(value), char(0)));
end
