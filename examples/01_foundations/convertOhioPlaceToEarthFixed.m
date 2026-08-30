function position_m = convertOhioPlaceToEarthFixed()
%% Section 0: Header & Readme
% SYNTAX
%   position_m = convertOhioPlaceToEarthFixed()
%**************************************************************************
% PURPOSE
%   - Convert the default Ohio place from WGS84 geodetic coordinates to ECEF.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - position_m (1-by-3 double array)
%       Earth-Centered, Earth-Fixed [x_m, y_m, z_m] position.
%**************************************************************************
% UNITS
%   - Latitude and longitude are degrees. Altitude and position are metres.
%**************************************************************************

%% Section 1: Define The Ohio Place

ohioGeodetic_lla = [40, -83, 250];

%% Section 2: Convert To Earth-Fixed Position

position_m = ...
    scenario.frames.convertGeodeticToEarthFixed(ohioGeodetic_lla);
end

