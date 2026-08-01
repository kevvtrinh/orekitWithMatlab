function boundary = loadCountryBoundaryLatLon(country)
%% Section 0: Header & Readme
% SYNTAX
%   boundary = loadCountryBoundaryLatLon("Vietnam")
%   boundary = loadCountryBoundaryLatLon("China")
%**************************************************************************
% PURPOSE
%   - Load and validate one bundled ADM0 country boundary and its provenance.
%**************************************************************************
% INPUTS
%   - country (scalar text)
%       Vietnam/VNM or China/CHN, matched case-insensitively.
%**************************************************************************
% OUTPUTS
%   - boundary (scalar struct)
%       Latitude/longitude vertices, polygon parts, and source metadata.
%**************************************************************************
% UNITS
%   - Latitude and longitude are degrees.

%% Section 1: Resolve The Requested Country
requestedCountry = lower(strtrim(string(country)));
if ~isscalar(requestedCountry)
    error("loadCountryBoundaryLatLon:InvalidCountry", ...
        "country must be Vietnam, VNM, China, or CHN.");
end
switch requestedCountry
    case {"vietnam", "viet nam", "vnm"}
        iso3 = "VNM";
        fileName = "vietnam_adm0_latlon.csv";
    case {"china", "chn"}
        iso3 = "CHN";
        fileName = "china_adm0_latlon.csv";
    otherwise
        error("loadCountryBoundaryLatLon:InvalidCountry", ...
            "country must be Vietnam, VNM, China, or CHN.");
end

%% Section 2: Load & Validate Boundary Vertices
supportDirectory = fileparts(mfilename("fullpath"));
packageRoot = fileparts(fileparts(supportDirectory));
dataDirectory = fullfile(packageRoot, "data");
boundaryValues = readmatrix(fullfile(dataDirectory, fileName));
if size(boundaryValues, 2) < 3
    error("loadCountryBoundaryLatLon:InvalidData", ...
        "%s must contain latitude, longitude, and part columns.", fileName);
end
latitude_deg = double(boundaryValues(:, 1));
longitude_deg = double(boundaryValues(:, 2));
partIndex = double(boundaryValues(:, 3));
isFiniteVertex = isfinite(latitude_deg) & isfinite(longitude_deg);
hasMismatchedSeparator = any( ...
    isfinite(latitude_deg) ~= isfinite(longitude_deg));
finiteVertexCount = nnz(isFiniteVertex);
if finiteVertexCount > 500 || finiteVertexCount < 4 || ...
        hasMismatchedSeparator
    error("loadCountryBoundaryLatLon:InvalidData", ...
        "%s has invalid separators or exceeds 500 vertices.", fileName);
end

%% Section 3: Match Provenance Metadata
manifest = jsondecode(fileread( ...
    fullfile(dataDirectory, "boundary_manifest.json")));
manifestEntry = manifest(strcmpi(string({manifest.iso3}), iso3));
if numel(manifestEntry) ~= 1
    error("loadCountryBoundaryLatLon:InvalidManifest", ...
        "No unique %s entry exists in boundary_manifest.json.", iso3);
end

%% Section 4: Assemble The Boundary Record
boundary = struct( ...
    "name", string(manifestEntry.country), ...
    "iso3", iso3, ...
    "latitude_deg", latitude_deg, ...
    "longitude_deg", longitude_deg, ...
    "partIndex", partIndex, ...
    "vertexCount", finiteVertexCount, ...
    "polygonPartCount", double(manifestEntry.polygonParts), ...
    "boundaryID", string(manifestEntry.boundaryID), ...
    "boundaryYearRepresented", ...
    string(manifestEntry.boundaryYearRepresented), ...
    "license", string(manifestEntry.license), ...
    "sourceUrl", string(manifestEntry.sourceUrl));
end
