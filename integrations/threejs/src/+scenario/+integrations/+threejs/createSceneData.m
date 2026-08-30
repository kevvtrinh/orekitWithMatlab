function sceneData = createSceneData( ...
        study, sunDirectionProvider, trajectoryProvider)
%% Section 0: Header & Readme
% SYNTAX
%   sceneData = scenario.integrations.threejs.createSceneData(study)
%   sceneData = scenario.integrations.threejs.createSceneData( ...
%       study, sunDirectionProvider)
%   sceneData = scenario.integrations.threejs.createSceneData( ...
%       study, sunDirectionProvider, trajectoryProvider)
%**************************************************************************
% PURPOSE
%   - Convert a MATLAB Scenario into a time-tagged Three.js scene payload.
%**************************************************************************
% INPUTS
%   - study (scenario.Scenario)
%       Scenario containing satellites and WGS84 places. Satellites outside
%       ITRF are omitted because this integration has no transform provider.
%   - sunDirectionProvider (function handle, optional)
%       Function accepting one zoned datetime and returning the documented
%       environment Sun-direction result contract. The default is the
%       provider-independent scenario.environment calculation.
%   - trajectoryProvider (function handle or empty, optional; default [])
%       Function accepting initialState and N-by-1 UTC sample epochs. It must
%       return N-by-3 PositionEci_m and PositionEcef_m arrays. Empty produces
%       a single non-playable snapshot without inventing propagation.
%**************************************************************************
% OUTPUTS
%   - sceneData (scalar struct)
%       Renderer payload containing time samples, frame-specific positions,
%       orbit paths, Sun directions, provenance, and warnings. Public fields
%       remain present for snapshot-only and playable results.
%**************************************************************************
% UNITS
%   - Positions and Earth radius are metres. Place coordinates are degrees and
%     ellipsoidal metres. Epochs use UTC and epochUnix_s is POSIX seconds.
%     Playback rate is scenario seconds per real second. Position histories
%     are N-by-3 [x, y, z].
%**************************************************************************

%% Section 1: Validate Inputs And Resolve Providers

if ~isa(study, "scenario.Scenario")
    error("createSceneData:InvalidScenario", ...
        "study must be a scenario.Scenario instance.");
end
if nargin < 2 || isempty(sunDirectionProvider)
    sunDirectionProvider = @scenario.environment.calculateSunDirection;
end
if ~isa(sunDirectionProvider, "function_handle")
    error("createSceneData:InvalidSunProvider", ...
        "sunDirectionProvider must be a function handle.");
end
if nargin < 3
    trajectoryProvider = [];
end
if ~(isempty(trajectoryProvider) || isa(trajectoryProvider, "function_handle"))
    error("createSceneData:InvalidTrajectoryProvider", ...
        "trajectoryProvider must be empty or a function handle.");
end

%% Section 2: Create Authoritative Time Samples

[sampleInterval_s, samplingWarning] = ...
    resolveSampleInterval(study, trajectoryProvider);
playbackRate = 240;
sampleEpochsUtc = createSampleEpochs( ...
    study, trajectoryProvider, sampleInterval_s);
timeSamples = createTimeSamples(sampleEpochsUtc, sunDirectionProvider);

%% Section 3: Collect Satellite Trajectories

[satellites, warnings] = collectSatellites( ...
    study, sampleEpochsUtc, trajectoryProvider);
if strlength(samplingWarning) > 0
    warnings(end + 1, 1) = samplingWarning;
end

%% Section 4: Collect WGS84 Places

places = collectPlaces(study, timeSamples);

%% Section 5: Assemble The Renderer Payload

initialSunDirection = sunDirectionProvider(sampleEpochsUtc(1));
validateSunDirection(initialSunDirection);
sun = struct( ...
    "name", "Sun", ...
    "unitDirectionEcef", initialSunDirection.UnitDirectionEcef, ...
    "unitDirectionEci", initialSunDirection.UnitDirectionEci, ...
    "model", initialSunDirection.Model, ...
    "accuracy", initialSunDirection.Accuracy);
sceneData = struct( ...
    "kind", "scene", ...
    "scenarioName", study.Name, ...
    "epoch", string(sampleEpochsUtc(1)), ...
    "startEpoch", string(sampleEpochsUtc(1)), ...
    "stopEpoch", string(sampleEpochsUtc(end)), ...
    "startEpochUnix_s", posixtime(study.StartTime), ...
    "stopEpochUnix_s", posixtime(study.StopTime), ...
    "sampleInterval_s", sampleInterval_s, ...
    "playbackRate", playbackRate, ...
    "isPlayable", numel(sampleEpochsUtc) > 1, ...
    "availableReferenceFrames", ["ECEF", "ECI"], ...
    "inertialFrame", initialSunDirection.InertialFrame, ...
    "ecefToEciMatrix", timeSamples(1).ecefToEciMatrix, ...
    "earthRadius_m", 6378137, ...
    "timeSamples", timeSamples, ...
    "satellites", satellites, ...
    "places", places, ...
    "sun", sun, ...
    "warnings", warnings);
end

function [sampleInterval_s, warningMessage] = resolveSampleInterval( ...
        study, trajectoryProvider)
% Bound renderer payload size while retaining explicit sampling provenance.

minimumSampleInterval_s = 60;
maximumSampleCount = 721;
sampleInterval_s = minimumSampleInterval_s;
warningMessage = "";
if isempty(trajectoryProvider)
    return
end
scenarioDuration_s = seconds(study.StopTime - study.StartTime);
requiredInterval_s = scenarioDuration_s / (maximumSampleCount - 1);
wholeMinuteInterval_s = ...
    ceil(requiredInterval_s / minimumSampleInterval_s) * ...
    minimumSampleInterval_s;
sampleInterval_s = max(minimumSampleInterval_s, wholeMinuteInterval_s);
if sampleInterval_s > minimumSampleInterval_s
    warningMessage = sprintf( ...
        "Visualization sampling uses %.0f-second intervals to keep " + ...
        "the payload at or below %d samples.", ...
        sampleInterval_s, maximumSampleCount);
end
end

function sampleEpochsUtc = createSampleEpochs( ...
        study, trajectoryProvider, sampleInterval_s)
% Create inclusive, uniformly spaced UTC epochs for optional playback.

if isempty(trajectoryProvider)
    sampleEpochsUtc = study.StartTime;
    return
end
sampleEpochsUtc = (study.StartTime:seconds(sampleInterval_s):study.StopTime)';
if sampleEpochsUtc(end) < study.StopTime
    sampleEpochsUtc(end + 1, 1) = study.StopTime;
end
sampleEpochsUtc.TimeZone = "UTC";
end

function timeSamples = createTimeSamples(sampleEpochsUtc, sunDirectionProvider)
% Calculate frame orientation and Sun directions at every playback epoch.

emptySample = struct( ...
    "epoch", "", ...
    "epochUnix_s", 0, ...
    "ecefToEciMatrix", eye(3), ...
    "sunDirectionEcef", zeros(1, 3), ...
    "sunDirectionEci", zeros(1, 3));
sampleCount = numel(sampleEpochsUtc);
timeSamples = repmat(emptySample, sampleCount, 1);
for sampleIndex = 1:sampleCount
    epochUtc = sampleEpochsUtc(sampleIndex);
    sunDirection = sunDirectionProvider(epochUtc);
    validateSunDirection(sunDirection);
    transformedBasis = scenario.frames.convertEarthFixedToInertial( ...
        epochUtc, eye(3));
    timeSamples(sampleIndex) = struct( ...
        "epoch", string(epochUtc), ...
        "epochUnix_s", posixtime(epochUtc), ...
        "ecefToEciMatrix", transformedBasis', ...
        "sunDirectionEcef", sunDirection.UnitDirectionEcef, ...
        "sunDirectionEci", sunDirection.UnitDirectionEci);
end
end

function [satellites, warnings] = collectSatellites( ...
        study, sampleEpochsUtc, trajectoryProvider)
% Convert supported satellites and preserve explicit omission diagnostics.

emptySatellite = struct( ...
    "name", "", ...
    "positionEcef_m", zeros(1, 3), ...
    "positionEci_m", zeros(1, 3), ...
    "hasEphemeris", false, ...
    "positionSamplesEcef_m", zeros(0, 3), ...
    "positionSamplesEci_m", zeros(0, 3), ...
    "orbitPathEcef_m", zeros(0, 3), ...
    "orbitPathEci_m", zeros(0, 3), ...
    "trajectoryModel", "");
satellites = repmat(emptySatellite, 0, 1);
warnings = strings(0, 1);
for satelliteIndex = 1:numel(study.Satellites)
    satellite = study.Satellites{satelliteIndex};
    if satellite.InitialState.frame ~= "ITRF"
        warnings(end + 1, 1) = "Satellite '" + satellite.Name + ...
            "' was omitted because its frame is not ITRF."; %#ok<AGROW>
        continue
    end
    satelliteData = createSatelliteData( ...
        satellite, sampleEpochsUtc, trajectoryProvider, emptySatellite);
    satellites(end + 1, 1) = satelliteData; %#ok<AGROW>
end
end

function satelliteData = createSatelliteData( ...
        satellite, sampleEpochsUtc, trajectoryProvider, emptySatellite)
% Create one snapshot or provider-backed satellite history.

satelliteData = emptySatellite;
satelliteData.name = satellite.Name;
if isempty(trajectoryProvider)
    positionEcef_m = satellite.InitialState.position_m;
    positionEci_m = scenario.frames.convertEarthFixedToInertial( ...
        sampleEpochsUtc(1), positionEcef_m);
    satelliteData.positionEcef_m = positionEcef_m;
    satelliteData.positionEci_m = positionEci_m;
    satelliteData.positionSamplesEcef_m = positionEcef_m;
    satelliteData.positionSamplesEci_m = positionEci_m;
    return
end
trajectory = trajectoryProvider(satellite.InitialState, sampleEpochsUtc);
validateTrajectory(trajectory, numel(sampleEpochsUtc));
satelliteData.positionEcef_m = trajectory.PositionEcef_m(1, :);
satelliteData.positionEci_m = trajectory.PositionEci_m(1, :);
satelliteData.hasEphemeris = true;
satelliteData.positionSamplesEcef_m = trajectory.PositionEcef_m;
satelliteData.positionSamplesEci_m = trajectory.PositionEci_m;
satelliteData.orbitPathEcef_m = trajectory.PositionEcef_m;
satelliteData.orbitPathEci_m = trajectory.PositionEci_m;
satelliteData.trajectoryModel = string(trajectory.Model);
end

function places = collectPlaces(study, timeSamples)
% Convert places and rotate their histories using MATLAB frame transforms.

emptyPlace = struct( ...
    "name", "", ...
    "positionEcef_m", zeros(1, 3), ...
    "positionEci_m", zeros(1, 3), ...
    "positionSamplesEcef_m", zeros(0, 3), ...
    "positionSamplesEci_m", zeros(0, 3));
places = repmat(emptyPlace, 0, 1);
sampleCount = numel(timeSamples);
for placeIndex = 1:numel(study.Places)
    place = study.Places{placeIndex};
    geodetic_lla = [ ...
        place.Latitude_deg, place.Longitude_deg, place.Altitude_m];
    positionEcef_m = ...
        scenario.frames.convertGeodeticToEarthFixed(geodetic_lla);
    positionsEcef_m = repmat(positionEcef_m, sampleCount, 1);
    positionsEci_m = zeros(sampleCount, 3);
    for sampleIndex = 1:sampleCount
        rotation = timeSamples(sampleIndex).ecefToEciMatrix;
        positionsEci_m(sampleIndex, :) = (rotation * positionEcef_m')';
    end
    placeData = emptyPlace;
    placeData.name = place.Name;
    placeData.positionEcef_m = positionsEcef_m(1, :);
    placeData.positionEci_m = positionsEci_m(1, :);
    placeData.positionSamplesEcef_m = positionsEcef_m;
    placeData.positionSamplesEci_m = positionsEci_m;
    places(end + 1, 1) = placeData; %#ok<AGROW>
end
end

function validateTrajectory(trajectory, sampleCount)
% Enforce the provider-neutral trajectory result contract and array shapes.

requiredFields = ["PositionEcef_m", "PositionEci_m", "Model"];
if ~(isstruct(trajectory) && isscalar(trajectory) && ...
        all(isfield(trajectory, requiredFields)))
    error("createSceneData:InvalidTrajectoryResult", ...
        "The trajectory provider must return PositionEcef_m, " + ...
        "PositionEci_m, and Model fields.");
end
validateattributes(trajectory.PositionEcef_m, {'numeric'}, ...
    {'real', 'finite', 'size', [sampleCount, 3]});
validateattributes(trajectory.PositionEci_m, {'numeric'}, ...
    {'real', 'finite', 'size', [sampleCount, 3]});
end

function validateSunDirection(sunDirection)
% Enforce the renderer's provider-neutral Sun-direction contract.

requiredFields = [ ...
    "UnitDirectionEcef", "UnitDirectionEci", "InertialFrame", ...
    "Model", "Accuracy"];
if ~(isstruct(sunDirection) && isscalar(sunDirection) && ...
        all(isfield(sunDirection, requiredFields)))
    error("createSceneData:InvalidSunResult", ...
        "The Sun provider must return UnitDirectionEcef, " + ...
        "UnitDirectionEci, InertialFrame, Model, and Accuracy fields.");
end
validateattributes(sunDirection.UnitDirectionEcef, {'numeric'}, ...
    {'real', 'finite', 'size', [1, 3]});
validateattributes(sunDirection.UnitDirectionEci, {'numeric'}, ...
    {'real', 'finite', 'size', [1, 3]});
end
