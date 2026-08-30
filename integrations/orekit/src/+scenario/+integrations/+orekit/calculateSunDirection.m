function result = calculateSunDirection(epochUtc)
%% Section 0: Header & Readme
% SYNTAX
%   result = scenario.integrations.orekit.calculateSunDirection(epochUtc)
%**************************************************************************
% PURPOSE
%   - Calculate geocentric Sun directions using Orekit ephemeris data.
%**************************************************************************
% INPUTS
%   - epochUtc (scalar datetime)
%       Explicitly zoned UTC epoch.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       GCRF and ITRF unit directions plus model and runtime provenance.
%**************************************************************************
% UNITS
%   - Direction vectors are dimensionless. Orekit positions use metres.
%**************************************************************************

%% Section 1: Validate The Epoch

if ~(isdatetime(epochUtc) && isscalar(epochUtc) && ...
        strlength(string(epochUtc.TimeZone)) > 0)
    error("orekitSunDirection:InvalidEpoch", ...
        "epochUtc must be a scalar datetime with an explicit time zone.");
end
epochUtc.TimeZone = "UTC";

%% Section 2: Initialize Orekit And Time

runtimeStatus = scenario.integrations.orekit.initialize();
utcScale = javaMethod("getUTC", "org.orekit.time.TimeScalesFactory");
epochText = char(string(epochUtc, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS"));
absoluteDate = javaObject( ...
    "org.orekit.time.AbsoluteDate", epochText, utcScale);

%% Section 3: Query Sun Positions

sun = javaMethod("getSun", ...
    "org.orekit.bodies.CelestialBodyFactory");
gcrf = javaMethod("getGCRF", "org.orekit.frames.FramesFactory");
iers2010 = javaMethod("valueOf", ...
    "org.orekit.utils.IERSConventions", "IERS_2010");
itrf = javaMethod("getITRF", "org.orekit.frames.FramesFactory", ...
    iers2010, true);

positionGcrf = sun.getPosition(absoluteDate, gcrf);
positionItrf = sun.getPosition(absoluteDate, itrf);
unitDirectionEci = normalizePosition(positionGcrf);
unitDirectionEcef = normalizePosition(positionItrf);

%% Section 4: Assemble Provider-Neutral Result

result = struct( ...
    "EpochUtc", epochUtc, ...
    "UnitDirectionEci", unitDirectionEci, ...
    "UnitDirectionEcef", unitDirectionEcef, ...
    "InertialFrame", "GCRF", ...
    "EarthFixedFrame", "ITRF-IERS2010", ...
    "Model", "Orekit-CelestialBodyFactory-Sun", ...
    "Accuracy", "Orekit data-context celestial ephemeris", ...
    "Provider", "Orekit", ...
    "ProviderVersion", runtimeStatus.OrekitVersion, ...
    "DataRoot", runtimeStatus.DataRoot, ...
    "DataVersion", runtimeStatus.DataVersion);
end

function unitDirection = normalizePosition(position)
% Convert an Orekit Vector3D position to a 1-by-3 MATLAB unit vector.

position_m = [position.getX(), position.getY(), position.getZ()];
positionNorm_m = norm(position_m);
if ~(isfinite(positionNorm_m) && positionNorm_m > 0)
    error("orekitSunDirection:InvalidPosition", ...
        "Orekit returned a non-finite or zero-length Sun position.");
end
unitDirection = position_m / positionNorm_m;
end
