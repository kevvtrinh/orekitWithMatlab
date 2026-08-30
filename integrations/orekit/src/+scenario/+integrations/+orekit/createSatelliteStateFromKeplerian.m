function initialState = createSatelliteStateFromKeplerian(elements)
%% Section 0: Header & Readme
% SYNTAX
%   initialState = ...
%       scenario.integrations.orekit.createSatelliteStateFromKeplerian( ...
%           elements)
%**************************************************************************
% PURPOSE
%   - Convert classical Keplerian elements into one ITRF Cartesian state.
%**************************************************************************
% INPUTS
%   - elements (scalar struct)
%       Fields EpochUtc, Altitude_m, Eccentricity, Inclination_deg, Raan_deg,
%       ArgumentOfPerigee_deg, and TrueAnomaly_deg. EpochUtc is a scalar zoned
%       datetime. Altitude_m is semimajor-axis altitude above the WGS84
%       equatorial radius, not instantaneous altitude. Angles use degrees.
%**************************************************************************
% OUTPUTS
%   - initialState (scalar struct)
%       Fields epoch, frame, position_m, and velocity_m_s suitable for
%       scenario.Scenario.addSatellite. The Cartesian state is expressed in
%       ITRF using IERS 2010 conventions. Invalid or non-elliptic inputs error.
%**************************************************************************
% UNITS
%   - Altitude and position are metres. Velocity is metres per second. Angles
%     are degrees. EpochUtc uses UTC. The output frame is ITRF-IERS2010.
%**************************************************************************

%% Section 1: Validate And Normalize Elements

elements = validateElements(elements);

%% Section 2: Initialize Orekit Frames And Epoch

scenario.integrations.orekit.initialize();
utcScale = javaMethod("getUTC", "org.orekit.time.TimeScalesFactory");
absoluteDate = createAbsoluteDate(elements.EpochUtc, utcScale);
gcrf = javaMethod("getGCRF", "org.orekit.frames.FramesFactory");
iers2010 = javaMethod("valueOf", ...
    "org.orekit.utils.IERSConventions", "IERS_2010");
itrf = javaMethod("getITRF", "org.orekit.frames.FramesFactory", ...
    iers2010, true);

%% Section 3: Create The Inertial Keplerian Orbit

wgs84EquatorialRadius_m = 6378137;
earthGravitationalParameter_m3_s2 = 3.986004418e14;
semimajorAxis_m = wgs84EquatorialRadius_m + elements.Altitude_m;
positionAngleType = javaMethod("valueOf", ...
    "org.orekit.orbits.PositionAngleType", "TRUE");
orbit = javaObject("org.orekit.orbits.KeplerianOrbit", ...
    semimajorAxis_m, ...
    elements.Eccentricity, ...
    deg2rad(elements.Inclination_deg), ...
    deg2rad(elements.ArgumentOfPerigee_deg), ...
    deg2rad(elements.Raan_deg), ...
    deg2rad(elements.TrueAnomaly_deg), ...
    positionAngleType, gcrf, absoluteDate, ...
    earthGravitationalParameter_m3_s2);

%% Section 4: Transform The Complete State To ITRF

pvGcrf = orbit.getPVCoordinates();
gcrfToItrf = gcrf.getTransformTo(itrf, absoluteDate);
pvItrf = gcrfToItrf.transformPVCoordinates(pvGcrf);

%% Section 5: Assemble The Platform State Contract

initialState = struct( ...
    "epoch", elements.EpochUtc, ...
    "frame", "ITRF", ...
    "position_m", readVector(pvItrf.getPosition()), ...
    "velocity_m_s", readVector(pvItrf.getVelocity()));
end

function elements = validateElements(elements)
% Validate required fields and normalize the UTC epoch.

if ~(isstruct(elements) && isscalar(elements))
    error("createSatelliteStateFromKeplerian:InvalidElements", ...
        "elements must be a scalar structure.");
end
requiredFields = [ ...
    "EpochUtc", "Altitude_m", "Eccentricity", "Inclination_deg", ...
    "Raan_deg", "ArgumentOfPerigee_deg", "TrueAnomaly_deg"];
if ~all(isfield(elements, requiredFields))
    error("createSatelliteStateFromKeplerian:MissingField", ...
        "elements is missing one or more required classical elements.");
end
validateEpoch(elements.EpochUtc);
validateattributes(elements.Altitude_m, {'numeric'}, ...
    {'real', 'finite', 'scalar', 'positive'});
validateattributes(elements.Eccentricity, {'numeric'}, ...
    {'real', 'finite', 'scalar', '>=', 0, '<', 1});
validateattributes(elements.Inclination_deg, {'numeric'}, ...
    {'real', 'finite', 'scalar', '>=', 0, '<=', 180});
angleFields = ["Raan_deg", "ArgumentOfPerigee_deg", "TrueAnomaly_deg"];
for fieldIndex = 1:numel(angleFields)
    validateattributes(elements.(angleFields(fieldIndex)), {'numeric'}, ...
        {'real', 'finite', 'scalar'});
end
elements.EpochUtc.TimeZone = "UTC";
end

function validateEpoch(epochUtc)
% Enforce a finite, scalar, explicitly zoned epoch.

isValidEpoch = isdatetime(epochUtc) && isscalar(epochUtc) && ...
    ~isnat(epochUtc) && strlength(string(epochUtc.TimeZone)) > 0;
if ~isValidEpoch
    error("createSatelliteStateFromKeplerian:InvalidEpoch", ...
        "elements.EpochUtc must be a scalar zoned datetime.");
end
end

function absoluteDate = createAbsoluteDate(epochUtc, utcScale)
% Convert one zoned MATLAB datetime into an Orekit AbsoluteDate.

epochUtc.TimeZone = "UTC";
epochText = char(string(epochUtc, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS"));
absoluteDate = javaObject( ...
    "org.orekit.time.AbsoluteDate", epochText, utcScale);
end

function components = readVector(vector)
% Convert one Hipparchus Vector3D to a 1-by-3 MATLAB row.

components = [vector.getX(), vector.getY(), vector.getZ()];
end
