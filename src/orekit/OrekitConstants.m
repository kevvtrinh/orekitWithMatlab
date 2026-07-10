classdef OrekitConstants
    %OREKITCONSTANTS Shared physical constants for the suite.
    %
    % Single source of truth for the WGS84 Earth model values that were
    % previously duplicated across OrekitFrames, OrekitOrbitFactory, and
    % the line-of-sight helpers.

    properties (Constant)
        % WGS84 Earth equatorial radius [m]
        WGS84EarthEquatorialRadiusMeters = 6378137.0

        % WGS84 Earth flattening [-]
        WGS84EarthFlattening = 1.0 / 298.257223563

        % WGS84 Earth gravitational parameter [m^3/s^2]
        WGS84EarthMu = 3.986004418e14

        % WGS84 Earth angular velocity [rad/s]
        WGS84EarthAngularVelocityRadPerSec = 7.292115e-5
    end
end
