function [azDeg, elDeg, rangeM] = enuAzElRange(latDeg, lonDeg, altMeters, targetEcef)
%ENUAZELRANGE Azimuth/elevation/range from a geodetic site to ECEF targets.
%
% targetEcef is an N x 3 matrix of ECEF positions in meters. Outputs are
% N x 1 vectors. Azimuth is measured clockwise from north in degrees.

[siteX, siteY, siteZ] = OrekitFrames.geodeticToECEF(latDeg, lonDeg, altMeters);
rho = targetEcef - [siteX, siteY, siteZ];

lat = deg2rad(latDeg);
lon = deg2rad(lonDeg);
east = [-sin(lon), cos(lon), 0];
north = [-sin(lat) * cos(lon), -sin(lat) * sin(lon), cos(lat)];
up = [cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat)];

e = rho * east.';
n = rho * north.';
u = rho * up.';

rangeM = sqrt(sum(rho.^2, 2));
elDeg = asind(u ./ max(rangeM, eps));
azDeg = mod(atan2d(e, n), 360.0);
end
