function positionsEci_m = convertEarthFixedToInertial(epochUtc, positionsEcef_m)
%% Section 0: Header & Readme
% SYNTAX
%   positionsEci_m = scenario.frames.convertEarthFixedToInertial( ...
%       epochUtc, positionsEcef_m)
%**************************************************************************
% PURPOSE
%   - Convert Earth-fixed Cartesian positions to Earth-centered inertial.
%**************************************************************************
% INPUTS
%   - epochUtc (scalar datetime)
%       Explicitly zoned UTC epoch shared by every input position.
%   - positionsEcef_m (N-by-3 finite numeric array)
%       ECEF Cartesian positions ordered [x, y, z].
%**************************************************************************
% OUTPUTS
%   - positionsEci_m (N-by-3 double array)
%       Mean-equator, mean-equinox ECI positions ordered [x, y, z].
%**************************************************************************
% UNITS
%   - Input and output positions are metres. epochUtc is UTC.
%**************************************************************************

%% Section 1: Validate Inputs

if ~(isdatetime(epochUtc) && isscalar(epochUtc) && ...
        strlength(string(epochUtc.TimeZone)) > 0)
    error("convertEarthFixedToInertial:InvalidEpoch", ...
        "epochUtc must be a scalar datetime with an explicit time zone.");
end
validateattributes(positionsEcef_m, {'numeric'}, ...
    {'2d', 'ncols', 3, 'finite', 'real'}, mfilename, 'positionsEcef_m');

%% Section 2: Transform Positions

rotationEcefToEci = ...
    scenario.frames.calculateEarthFixedToInertialRotation(epochUtc);
positionsEci_m = (rotationEcefToEci * positionsEcef_m')';
end
