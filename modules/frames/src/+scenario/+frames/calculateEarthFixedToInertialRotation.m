function rotationsEcefToEci = calculateEarthFixedToInertialRotation(epochUtc)
%% Section 0: Header & Readme
% SYNTAX
%   rotationsEcefToEci = ...
%       scenario.frames.calculateEarthFixedToInertialRotation(epochUtc)
%**************************************************************************
% PURPOSE
%   - Calculate Earth-fixed-to-inertial rotations for one or more epochs.
%**************************************************************************
% INPUTS
%   - epochUtc (M-by-1 datetime vector)
%       Finite epochs with one explicit time zone. Row vectors are normalized
%       to columns before applying the IAU-2000/2006 reduction.
%**************************************************************************
% OUTPUTS
%   - rotationsEcefToEci (3-by-3-by-M double array)
%       Direction cosine matrices mapping ECEF column vectors into the
%       mean-equator, mean-equinox ECI frame. Scalar input returns 3-by-3.
%**************************************************************************
% UNITS
%   - Rotations are dimensionless. epochUtc represents UTC instants.
%**************************************************************************

%% Section 1: Validate And Normalize Epochs

isValidEpoch = isdatetime(epochUtc) && isvector(epochUtc) && ...
    ~isempty(epochUtc) && all(~isnat(epochUtc), "all") && ...
    strlength(string(epochUtc.TimeZone)) > 0;
if ~isValidEpoch
    error("calculateEarthFixedToInertialRotation:InvalidEpoch", ...
        "epochUtc must be a nonempty datetime vector with an explicit " + ...
        "time zone and no NaT values.");
end
epochUtc = epochUtc(:);

%% Section 2: Calculate Batched Direction Cosine Matrices

rotationsEciToEcef = dcmeci2ecef("IAU-2000/2006", epochUtc);
rotationsEcefToEci = permute(rotationsEciToEcef, [2, 1, 3]);
end
