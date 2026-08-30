function positionsEcef_m = convertInertialToEarthFixed(epochUtc, positionsEci_m)
%% Section 0: Header & Readme
% SYNTAX
%   positionsEcef_m = scenario.frames.convertInertialToEarthFixed( ...
%       epochUtc, positionsEci_m)
%**************************************************************************
% PURPOSE
%   - Convert Earth-centered inertial Cartesian positions to Earth-fixed.
%**************************************************************************
% INPUTS
%   - epochUtc (scalar datetime)
%       Explicitly zoned UTC epoch shared by every input position.
%   - positionsEci_m (N-by-3 finite numeric array)
%       Mean-equator, mean-equinox ECI positions ordered [x, y, z].
%**************************************************************************
% OUTPUTS
%   - positionsEcef_m (N-by-3 double array)
%       ECEF Cartesian positions ordered [x, y, z].
%**************************************************************************
% UNITS
%   - Input and output positions are metres. epochUtc is UTC.
%**************************************************************************

%% Section 1: Validate Inputs

if ~(isdatetime(epochUtc) && isscalar(epochUtc) && ...
        strlength(string(epochUtc.TimeZone)) > 0)
    error("convertInertialToEarthFixed:InvalidEpoch", ...
        "epochUtc must be a scalar datetime with an explicit time zone.");
end
validateattributes(positionsEci_m, {'numeric'}, ...
    {'2d', 'ncols', 3, 'finite', 'real'}, mfilename, 'positionsEci_m');

%% Section 2: Transform Positions

rotationEcefToEci = ...
    scenario.frames.calculateEarthFixedToInertialRotation(epochUtc);
positionsEcef_m = (rotationEcefToEci' * positionsEci_m')';
end
