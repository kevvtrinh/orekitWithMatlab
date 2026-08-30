function geodetic_lla = convertEarthFixedToGeodetic(position_m)
%% Section 0: Header & Readme
% SYNTAX
%   geodetic_lla = scenario.frames.convertEarthFixedToGeodetic(position_m)
%**************************************************************************
% PURPOSE
%   - Convert Earth-fixed Cartesian positions to WGS84 geodetic coordinates.
%**************************************************************************
% INPUTS
%   - position_m (N-by-3 real numeric array)
%       Rows contain [x_m, y_m, z_m] in the WGS84 Earth-Centered, Earth-Fixed
%       coordinate system. The Earth-center singularity is unsupported.
%**************************************************************************
% OUTPUTS
%   - geodetic_lla (N-by-3 double array)
%       Rows contain [latitude_deg, longitude_deg, altitude_m]. Empty input
%       returns zeros(0, 3).
%**************************************************************************
% UNITS
%   - Position and altitude are metres. Latitude and longitude are degrees.
%**************************************************************************

%% Section 1: Validate The Earth-Fixed Positions

validateattributes(position_m, {'numeric'}, ...
    {'real', 'finite', '2d'}, ...
    "convertEarthFixedToGeodetic", "position_m");
if size(position_m, 2) ~= 3
    error("convertEarthFixedToGeodetic:InvalidColumnCount", ...
        "position_m must have three columns [x_m, y_m, z_m]; got %d columns.", ...
        size(position_m, 2));
end
if any(vecnorm(position_m, 2, 2) == 0)
    error("convertEarthFixedToGeodetic:EarthCenterSingularity", ...
        "position_m cannot contain the Earth-center singularity [0, 0, 0].");
end

%% Section 2: Verify The Aerospace Toolbox Provider

if exist('ecef2lla', 'file') ~= 2
    error("convertEarthFixedToGeodetic:MissingAerospaceToolbox", ...
        "ecef2lla is unavailable. Install or enable Aerospace Toolbox.");
end

%% Section 3: Convert To WGS84 Geodetic Coordinates

if isempty(position_m)
    geodetic_lla = zeros(0, 3);
    return
end

geodetic_lla = ecef2lla(double(position_m), 'WGS84');
end
