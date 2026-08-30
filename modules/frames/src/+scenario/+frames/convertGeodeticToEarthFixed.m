function position_m = convertGeodeticToEarthFixed(geodetic_lla)
%% Section 0: Header & Readme
% SYNTAX
%   position_m = scenario.frames.convertGeodeticToEarthFixed(geodetic_lla)
%**************************************************************************
% PURPOSE
%   - Convert WGS84 geodetic coordinates to Earth-fixed Cartesian positions.
%**************************************************************************
% INPUTS
%   - geodetic_lla (N-by-3 real numeric array)
%       Rows contain [latitude_deg, longitude_deg, altitude_m]. Latitude is
%       geodetic degrees north, longitude is degrees east in [-180, 180], and
%       altitude is ellipsoidal height above WGS84.
%**************************************************************************
% OUTPUTS
%   - position_m (N-by-3 double array)
%       Rows contain [x_m, y_m, z_m] in the WGS84 Earth-Centered, Earth-Fixed
%       coordinate system. Empty input returns zeros(0, 3).
%**************************************************************************
% UNITS
%   - Latitude and longitude are degrees. Altitude and position are metres.
%**************************************************************************

%% Section 1: Validate The Geodetic Coordinates

validateattributes(geodetic_lla, {'numeric'}, ...
    {'real', 'finite', '2d'}, ...
    "convertGeodeticToEarthFixed", "geodetic_lla");
if size(geodetic_lla, 2) ~= 3
    error("convertGeodeticToEarthFixed:InvalidColumnCount", ...
        "geodetic_lla must have three columns [latitude_deg, " + ...
        "longitude_deg, altitude_m]; got %d columns.", ...
        size(geodetic_lla, 2));
end
if any(geodetic_lla(:, 1) < -90 | geodetic_lla(:, 1) > 90)
    error("convertGeodeticToEarthFixed:InvalidLatitude", ...
        "Every latitude must be between -90 and 90 degrees.");
end
if any(geodetic_lla(:, 2) < -180 | geodetic_lla(:, 2) > 180)
    error("convertGeodeticToEarthFixed:InvalidLongitude", ...
        "Every longitude must be between -180 and 180 degrees.");
end

%% Section 2: Verify The Aerospace Toolbox Provider

if exist('lla2ecef', 'file') ~= 2
    error("convertGeodeticToEarthFixed:MissingAerospaceToolbox", ...
        "lla2ecef is unavailable. Install or enable Aerospace Toolbox.");
end

%% Section 3: Convert To Earth-Fixed Cartesian Position

if isempty(geodetic_lla)
    position_m = zeros(0, 3);
    return
end

position_m = lla2ecef(double(geodetic_lla), 'WGS84');
end
