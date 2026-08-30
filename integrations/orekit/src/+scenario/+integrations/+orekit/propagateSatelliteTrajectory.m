function result = propagateSatelliteTrajectory(initialState, sampleEpochsUtc)
%% Section 0: Header & Readme
% SYNTAX
%   result = scenario.integrations.orekit.propagateSatelliteTrajectory( ...
%       initialState, sampleEpochsUtc)
%**************************************************************************
% PURPOSE
%   - Propagate one Cartesian satellite state with Orekit two-body dynamics.
%**************************************************************************
% INPUTS
%   - initialState (scalar struct)
%       Fields epoch, frame, position_m, and velocity_m_s define one state.
%       epoch is a scalar explicitly zoned datetime. frame must be "ITRF".
%       Cartesian vectors are 1-by-3 [x, y, z]. The ITRF velocity is relative
%       to the rotating frame and is transformed by Orekit with the position.
%   - sampleEpochsUtc (N-by-1 datetime array)
%       Explicitly zoned epochs at which states are requested. Epochs may be
%       before or after initialState.epoch and must be nondecreasing.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Fields EpochsUtc, PositionEci_m, PositionEcef_m, InertialFrame,
%       EarthFixedFrame, Model, Provider, and ProviderVersion. Position arrays
%       are N-by-3. Empty sampleEpochsUtc returns zero-row position arrays.
%**************************************************************************
% UNITS
%   - Positions are metres, velocities are metres per second, and epochs use
%     UTC. ECI is GCRF. ECEF is ITRF using IERS 2010 conventions.
%**************************************************************************

%% Section 1: Validate The State And Sample Epochs

initialState = validateInitialState(initialState);
sampleEpochsUtc = validateSampleEpochs(sampleEpochsUtc);

%% Section 2: Initialize Orekit Frames And Time

runtimeStatus = scenario.integrations.orekit.initialize();
utcScale = javaMethod("getUTC", "org.orekit.time.TimeScalesFactory");
gcrf = javaMethod("getGCRF", "org.orekit.frames.FramesFactory");
iers2010 = javaMethod("valueOf", ...
    "org.orekit.utils.IERSConventions", "IERS_2010");
itrf = javaMethod("getITRF", "org.orekit.frames.FramesFactory", ...
    iers2010, true);
initialDate = createAbsoluteDate(initialState.epoch, utcScale);

%% Section 3: Create The Two-Body Propagator

positionItrf = createVector3D(initialState.position_m);
velocityItrf = createVector3D(initialState.velocity_m_s);
pvItrf = javaObject("org.orekit.utils.PVCoordinates", ...
    positionItrf, velocityItrf);
itrfToGcrf = itrf.getTransformTo(gcrf, initialDate);
pvGcrf = itrfToGcrf.transformPVCoordinates(pvItrf);

% This is Orekit's WGS84_EARTH_MU constant. Keeping the value here avoids
% leaking a Java constant object through this provider-neutral boundary.
earthGravitationalParameter_m3_s2 = 3.986004418e14;
initialOrbit = javaObject("org.orekit.orbits.CartesianOrbit", ...
    pvGcrf, gcrf, initialDate, earthGravitationalParameter_m3_s2);
propagator = javaObject( ...
    "org.orekit.propagation.analytical.KeplerianPropagator", initialOrbit);

%% Section 4: Propagate The Requested Samples

sampleCount = numel(sampleEpochsUtc);
positionsEci_m = zeros(sampleCount, 3);
positionsEcef_m = zeros(sampleCount, 3);
for sampleIndex = 1:sampleCount
    sampleDate = createAbsoluteDate(sampleEpochsUtc(sampleIndex), utcScale);
    spacecraftState = propagator.propagate(sampleDate);
    positionsEci_m(sampleIndex, :) = readPosition( ...
        spacecraftState.getPVCoordinates(gcrf));
    positionsEcef_m(sampleIndex, :) = readPosition( ...
        spacecraftState.getPVCoordinates(itrf));
end

%% Section 5: Assemble The Provider-Neutral Result

result = struct( ...
    "EpochsUtc", reshape(sampleEpochsUtc, [], 1), ...
    "PositionEci_m", positionsEci_m, ...
    "PositionEcef_m", positionsEcef_m, ...
    "InertialFrame", "GCRF", ...
    "EarthFixedFrame", "ITRF-IERS2010", ...
    "Model", "Orekit-KeplerianPropagator", ...
    "Provider", "Orekit", ...
    "ProviderVersion", runtimeStatus.OrekitVersion);
end

function initialState = validateInitialState(initialState)
% Validate and normalize the supported ITRF Cartesian state contract.

if ~(isstruct(initialState) && isscalar(initialState))
    error("propagateSatelliteTrajectory:InvalidInitialState", ...
        "initialState must be a scalar structure.");
end
requiredFields = ["epoch", "frame", "position_m", "velocity_m_s"];
if ~all(isfield(initialState, requiredFields))
    error("propagateSatelliteTrajectory:MissingInitialStateField", ...
        "initialState requires epoch, frame, position_m, and velocity_m_s.");
end
validateInitialEpoch(initialState.epoch);
validateInitialFrame(initialState.frame);
validateattributes(initialState.position_m, {'numeric'}, ...
    {'real', 'finite', 'vector', 'numel', 3}, mfilename, ...
    'initialState.position_m');
validateattributes(initialState.velocity_m_s, {'numeric'}, ...
    {'real', 'finite', 'vector', 'numel', 3}, mfilename, ...
    'initialState.velocity_m_s');
initialState.epoch.TimeZone = "UTC";
initialState.position_m = reshape(initialState.position_m, 1, 3);
initialState.velocity_m_s = reshape(initialState.velocity_m_s, 1, 3);
end

function validateInitialEpoch(epoch)
% Enforce a finite, scalar, explicitly zoned initial epoch.

isValidEpoch = isdatetime(epoch) && isscalar(epoch) && ~isnat(epoch) && ...
    strlength(string(epoch.TimeZone)) > 0;
if ~isValidEpoch
    error("propagateSatelliteTrajectory:InvalidInitialEpoch", ...
        "initialState.epoch must be a scalar datetime with an explicit zone.");
end
end

function validateInitialFrame(frameValue)
% Enforce the one Earth-fixed frame supported by this adapter.

frame = string(frameValue);
isSupportedFrame = isscalar(frame) && ~ismissing(frame) && frame == "ITRF";
if ~isSupportedFrame
    error("propagateSatelliteTrajectory:UnsupportedFrame", ...
        "initialState.frame must be scalar text equal to ITRF.");
end
end

function sampleEpochsUtc = validateSampleEpochs(sampleEpochsUtc)
% Validate, orient, and normalize the requested UTC epochs.

if ~isdatetime(sampleEpochsUtc)
    error("propagateSatelliteTrajectory:InvalidSampleEpochs", ...
        "sampleEpochsUtc must be a datetime array with an explicit zone.");
end
if strlength(string(sampleEpochsUtc.TimeZone)) == 0
    error("propagateSatelliteTrajectory:MissingSampleTimeZone", ...
        "sampleEpochsUtc must declare an explicit time zone.");
end
sampleEpochsUtc = reshape(sampleEpochsUtc, [], 1);
sampleEpochsUtc.TimeZone = "UTC";
if any(isnat(sampleEpochsUtc))
    error("propagateSatelliteTrajectory:InvalidSampleEpochs", ...
        "sampleEpochsUtc cannot contain NaT values.");
end
if any(diff(sampleEpochsUtc) < seconds(0))
    error("propagateSatelliteTrajectory:NonmonotonicEpochs", ...
        "sampleEpochsUtc must be monotonically increasing.");
end
end

function absoluteDate = createAbsoluteDate(epochUtc, utcScale)
% Convert one zoned MATLAB datetime to an Orekit AbsoluteDate.

epochUtc.TimeZone = "UTC";
epochText = char(string(epochUtc, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS"));
absoluteDate = javaObject( ...
    "org.orekit.time.AbsoluteDate", epochText, utcScale);
end

function vector = createVector3D(components)
% Convert one 1-by-3 MATLAB vector to a Hipparchus Vector3D.

vector = javaObject( ...
    "org.hipparchus.geometry.euclidean.threed.Vector3D", ...
    components(1), components(2), components(3));
end

function position_m = readPosition(pvCoordinates)
% Convert one Orekit position to a 1-by-3 MATLAB row in metres.

position = pvCoordinates.getPosition();
position_m = [position.getX(), position.getY(), position.getZ()];
end
