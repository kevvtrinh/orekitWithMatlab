function result = calculateSunDirection(epochUtc)
%% Section 0: Header & Readme
% SYNTAX
%   result = scenario.environment.calculateSunDirection(epochUtc)
%**************************************************************************
% PURPOSE
%   - Calculate a geocentric Sun direction with explicit model provenance.
%**************************************************************************
% INPUTS
%   - epochUtc (scalar datetime)
%       Explicitly zoned UTC epoch.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       UnitDirectionEci and UnitDirectionEcef are 1-by-3 unit vectors.
%       Model and Accuracy describe the selected ephemeris model.
%**************************************************************************
% UNITS
%   - Direction vectors are dimensionless. Angles are calculated in radians.
%**************************************************************************

%% Section 1: Validate The Epoch

if ~(isdatetime(epochUtc) && isscalar(epochUtc) && ...
        strlength(string(epochUtc.TimeZone)) > 0)
    error("calculateSunDirection:InvalidEpoch", ...
        "epochUtc must be a scalar datetime with an explicit time zone.");
end

%% Section 2: Calculate The Inertial Direction

try
    sunPosition_km = planetEphemeris( ...
        juliandate(epochUtc), 'Earth', 'Sun', '430', 'km');
    unitDirectionEci = sunPosition_km / norm(sunPosition_km);
    model = "JPL-DE430";
    accuracy = "JPL DE430 through MathWorks planetEphemeris";
catch ephemerisError
    isUnavailable = string(ephemerisError.identifier) == ...
        "aero:aeroephemerides:unavailableDatabase";
    if ~isUnavailable
        rethrow(ephemerisError)
    end
    warning("calculateSunDirection:ApproximateEphemeris", ...
        "MathWorks ephemeris data is unavailable. Returning the " + ...
        "documented low-precision analytical Sun direction.");
    unitDirectionEci = calculateAnalyticalDirection(epochUtc);
    model = "LowPrecisionAnalyticalSun";
    accuracy = "Approximate; intended for visualization, not analysis";
end

%% Section 3: Transform The Direction To ECEF

unitDirectionEcef = scenario.frames.convertInertialToEarthFixed( ...
    epochUtc, unitDirectionEci);
unitDirectionEcef = unitDirectionEcef / norm(unitDirectionEcef);

%% Section 4: Assemble Provenance

result = struct( ...
    "EpochUtc", epochUtc, ...
    "UnitDirectionEci", unitDirectionEci, ...
    "UnitDirectionEcef", unitDirectionEcef, ...
    "InertialFrame", "MeanEquatorMeanEquinox", ...
    "Model", model, ...
    "Accuracy", accuracy);
end

function unitDirectionEci = calculateAnalyticalDirection(epochUtc)
% Calculate the common low-precision solar direction approximation.

julianCenturies = (juliandate(epochUtc) - 2451545.0) / 36525;
meanLongitude_deg = mod(280.460 + 36000.770 * julianCenturies, 360);
meanAnomaly_rad = deg2rad(mod(357.528 + ...
    35999.050 * julianCenturies, 360));
eclipticLongitude_rad = deg2rad(meanLongitude_deg + ...
    1.915 * sin(meanAnomaly_rad) + 0.020 * sin(2 * meanAnomaly_rad));
obliquity_rad = deg2rad(23.4393 - 0.0130 * julianCenturies);

unitDirectionEci = [ ...
    cos(eclipticLongitude_rad), ...
    cos(obliquity_rad) * sin(eclipticLongitude_rad), ...
    sin(obliquity_rad) * sin(eclipticLongitude_rad)];
end
