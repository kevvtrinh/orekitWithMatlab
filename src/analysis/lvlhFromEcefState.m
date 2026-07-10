function [dcmBodyFromEcef, axes] = lvlhFromEcefState(posEcefMeters, velEcefMps, options)
%LVLHFROMECEFSTATE Orbit-local body attitude DCMs from ECEF state, vectorized.
%
% [dcm, axes] = lvlhFromEcefState(posEcefMeters, velEcefMps)
% [dcm, axes] = lvlhFromEcefState(posEcefMeters, velEcefMps, "Convention", "LVLH_CCSDS")
%
% posEcefMeters  N-by-3 satellite ECEF (ITRF) positions [m]
% velEcefMps     N-by-3 satellite velocity in the ROTATING ECEF frame [m/s]
%                (what Orekit returns for getPVCoordinates(itrf))
%
% Returns dcmBodyFromEcef, a 3-by-3-by-N stack of rotation matrices whose
% rows are the body axes expressed in ECEF, i.e. vBody = dcm(:,:,k) *
% vEcef(:). axes is a struct with the XBody/YBody/ZBody rows as N-by-3.
%
% Conventions (named to match Orekit's LOFType exactly):
%   "LVLH_CCSDS" (default, identical to Orekit VVLH):
%       +Z toward the Earth's center (geocentric nadir, -r_hat)
%       +Y opposite the orbital angular momentum (-h_hat)
%       +X completes the triad (approximately along velocity)
%   "QSW" (identical to Orekit's plain LVLH):
%       +X along position (+r_hat, zenith)
%       +Z along the orbital angular momentum (+h_hat)
%       +Y completes the triad (approximately along velocity)
%
% The orbital frame is defined with INERTIAL velocity. Given the rotating
% frame velocity, the inertial velocity expressed in ECEF axes is
% recovered as v_inertial = v_ecef + omegaEarth x r, so this entire
% attitude computation is pure vectorized MATLAB - zero Java calls.

arguments
    posEcefMeters (:, 3) double
    velEcefMps (:, 3) double
    options.Convention (1, 1) string = "LVLH_CCSDS"
end

if size(velEcefMps, 1) ~= size(posEcefMeters, 1)
    error("lvlhFromEcefState:SizeMismatch", ...
        "Position and velocity must both be N-by-3 with the same N.");
end

n = size(posEcefMeters, 1);
omega = OrekitConstants.WGS84EarthAngularVelocityRadPerSec;

% Inertial velocity expressed in ECEF axes: v + omega x r, omega = [0 0 w].
velInertial = velEcefMps + omega * [-posEcefMeters(:, 2), posEcefMeters(:, 1), zeros(n, 1)];

radialUnit = posEcefMeters ./ vecnorm(posEcefMeters, 2, 2);
momentum = cross(posEcefMeters, velInertial, 2);
momentumNorm = vecnorm(momentum, 2, 2);
if any(momentumNorm < eps * max(vecnorm(posEcefMeters, 2, 2) .* vecnorm(velInertial, 2, 2), 1))
    error("lvlhFromEcefState:DegenerateState", ...
        "Position and inertial velocity are parallel; the orbital frame is undefined.");
end
momentumUnit = momentum ./ momentumNorm;

switch upper(options.Convention)
    case "LVLH_CCSDS"
        zBody = -radialUnit;
        yBody = -momentumUnit;
        xBody = cross(yBody, zBody, 2); % unit: y and z are orthonormal
    case "QSW"
        xBody = radialUnit;
        zBody = momentumUnit;
        yBody = cross(zBody, xBody, 2);
    otherwise
        error("lvlhFromEcefState:UnsupportedConvention", ...
            "Unsupported convention '%s'. Use LVLH_CCSDS or QSW.", options.Convention);
end

% Stack rows into 3-by-3-by-N: dcm(i,:,k) = i-th body axis in ECEF.
dcmBodyFromEcef = permute(cat(3, xBody, yBody, zBody), [3 2 1]);
axes = struct("XBody", xBody, "YBody", yBody, "ZBody", zBody);
end
