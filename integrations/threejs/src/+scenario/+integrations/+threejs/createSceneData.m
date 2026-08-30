function [sceneData, sceneCache] = createSceneData( ...
        study, sunDirectionProvider, trajectoryProvider, sceneCache)
%% Section 0: Header & Readme
% SYNTAX
%   sceneData = scenario.integrations.threejs.createSceneData(study)
%   sceneData = scenario.integrations.threejs.createSceneData( ...
%       study, sunDirectionProvider)
%   sceneData = scenario.integrations.threejs.createSceneData( ...
%       study, sunDirectionProvider, trajectoryProvider)
%   [sceneData, sceneCache] = ...
%       scenario.integrations.threejs.createSceneData( ...
%           study, sunDirectionProvider, trajectoryProvider, sceneCache)
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
%   - sceneCache (scalar struct or empty, optional; default empty)
%       Opaque cache returned by an earlier call using the same providers.
%       Unchanged time histories and satellite trajectories are reused only
%       after their epochs, providers, names, and initial states match.
%**************************************************************************
% OUTPUTS
%   - sceneData (scalar struct)
%       Renderer payload containing time samples, frame-specific positions,
%       orbit paths, Sun directions, provenance, and warnings. Public fields
%       remain present for snapshot-only and playable results.
%   - sceneCache (scalar struct)
%       Opaque reusable calculation data. It is not part of the renderer
%       payload and must be passed back unchanged when reuse is desired.
%**************************************************************************
% UNITS
%   - Positions and Earth radius are metres. Place coordinates are degrees and
%     ellipsoidal metres. Epochs use UTC and epochUnix_s is POSIX seconds.
%     Playback rate is scenario seconds per real second. Position histories
%     are N-by-3 [x, y, z].
%**************************************************************************

%% Section 1: Validate Inputs And Resolve Providers

if nargin < 3
    trajectoryProvider = [];
end
if nargin < 2
    sunDirectionProvider = [];
end
if nargin < 4
    sceneCache = [];
end
[sunDirectionProvider, trajectoryProvider, sceneCache] = ...
    validateAndResolveInputs( ...
        study, sunDirectionProvider, trajectoryProvider, sceneCache);

%% Section 2: Create Authoritative Time Samples

[sampleInterval_s, samplingWarning] = ...
    resolveSampleInterval(study, trajectoryProvider);
playbackRate = 240;
sampleEpochsUtc = createSampleEpochs( ...
    study, trajectoryProvider, sampleInterval_s);
[timeSamples, sun, isTimeContextReused] = resolveTimeContext( ...
    sampleEpochsUtc, sunDirectionProvider, trajectoryProvider, sceneCache);

%% Section 3: Collect Satellite Trajectories

[satellites, warnings, satelliteCache] = collectSatellites( ...
    study, sampleEpochsUtc, trajectoryProvider, sceneCache, ...
    isTimeContextReused);
if strlength(samplingWarning) > 0
    warnings(end + 1, 1) = samplingWarning;
end

%% Section 4: Collect WGS84 Places

places = collectPlaces(study, timeSamples);

%% Section 5: Assemble The Renderer Payload

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
    "inertialFrame", sun.inertialFrame, ...
    "ecefToEciMatrix", timeSamples(1).ecefToEciMatrix, ...
    "earthRadius_m", 6378137, ...
    "timeSamples", timeSamples, ...
    "satellites", satellites, ...
    "places", places, ...
    "sun", sun, ...
    "warnings", warnings);
sceneCache = struct( ...
    "Version", 1, ...
    "SampleEpochsUtc", sampleEpochsUtc, ...
    "SunDirectionProvider", sunDirectionProvider, ...
    "TrajectoryProvider", trajectoryProvider, ...
    "TimeSamples", timeSamples, ...
    "Sun", sun, ...
    "Satellites", satelliteCache);
end

function [sunDirectionProvider, trajectoryProvider, sceneCache] = ...
        validateAndResolveInputs( ...
            study, sunDirectionProvider, trajectoryProvider, sceneCache)
% Validate public contracts and resolve optional providers in one place.

if ~isa(study, "scenario.Scenario")
    error("createSceneData:InvalidScenario", ...
        "study must be a scenario.Scenario instance.");
end
if isempty(sunDirectionProvider)
    sunDirectionProvider = @scenario.environment.calculateSunDirection;
end
if ~isa(sunDirectionProvider, "function_handle")
    error("createSceneData:InvalidSunProvider", ...
        "sunDirectionProvider must be a function handle.");
end
if ~(isempty(trajectoryProvider) || ...
        isa(trajectoryProvider, "function_handle"))
    error("createSceneData:InvalidTrajectoryProvider", ...
        "trajectoryProvider must be empty or a function handle.");
end
if isempty(sceneCache)
    return
end
if isstruct(sceneCache) && isempty(fieldnames(sceneCache))
    sceneCache = [];
    return
end
validateSceneCache(sceneCache);
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

function [timeSamples, sun, isReused] = resolveTimeContext( ...
        sampleEpochsUtc, sunDirectionProvider, trajectoryProvider, sceneCache)
% Reuse scenario-wide values only when every calculation input matches.

isReused = canReuseTimeContext( ...
    sceneCache, sampleEpochsUtc, sunDirectionProvider, trajectoryProvider);
if isReused
    timeSamples = sceneCache.TimeSamples;
    sun = sceneCache.Sun;
    return
end
[timeSamples, sun] = createTimeSamples( ...
    sampleEpochsUtc, sunDirectionProvider);
end

function isReusable = canReuseTimeContext( ...
        sceneCache, sampleEpochsUtc, sunDirectionProvider, trajectoryProvider)
% Compare the complete scenario-wide cache provenance.

isReusable = ~isempty(sceneCache) && ...
    isequal(sceneCache.SampleEpochsUtc, sampleEpochsUtc) && ...
    isequal(sceneCache.SunDirectionProvider, sunDirectionProvider) && ...
    isequal(sceneCache.TrajectoryProvider, trajectoryProvider);
end

function [timeSamples, sun] = createTimeSamples( ...
        sampleEpochsUtc, sunDirectionProvider)
% Calculate frame orientation and Sun directions at every playback epoch.

emptySample = struct( ...
    "epoch", "", ...
    "epochUnix_s", 0, ...
    "ecefToEciMatrix", eye(3), ...
    "sunDirectionEcef", zeros(1, 3), ...
    "sunDirectionEci", zeros(1, 3));
sampleCount = numel(sampleEpochsUtc);
timeSamples = repmat(emptySample, sampleCount, 1);
rotationsEcefToEci = ...
    scenario.frames.calculateEarthFixedToInertialRotation(sampleEpochsUtc);
initialSunDirection = struct();
for sampleIndex = 1:sampleCount
    epochUtc = sampleEpochsUtc(sampleIndex);
    sunDirection = sunDirectionProvider(epochUtc);
    validateSunDirection(sunDirection);
    if sampleIndex == 1
        initialSunDirection = sunDirection;
    end
    timeSamples(sampleIndex) = struct( ...
        "epoch", string(epochUtc), ...
        "epochUnix_s", posixtime(epochUtc), ...
        "ecefToEciMatrix", rotationsEcefToEci(:, :, sampleIndex), ...
        "sunDirectionEcef", sunDirection.UnitDirectionEcef, ...
        "sunDirectionEci", sunDirection.UnitDirectionEci);
end
sun = createSunData(initialSunDirection);
end

function sun = createSunData(initialSunDirection)
% Retain initial Sun display data and frame provenance without another query.

sun = struct( ...
    "name", "Sun", ...
    "unitDirectionEcef", initialSunDirection.UnitDirectionEcef, ...
    "unitDirectionEci", initialSunDirection.UnitDirectionEci, ...
    "inertialFrame", initialSunDirection.InertialFrame, ...
    "model", initialSunDirection.Model, ...
    "accuracy", initialSunDirection.Accuracy);
end

function [satellites, warnings, satelliteCache] = collectSatellites( ...
        study, sampleEpochsUtc, trajectoryProvider, sceneCache, ...
        isTimeContextReused)
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
emptyCacheEntry = struct( ...
    "Name", "", ...
    "InitialState", struct(), ...
    "Data", emptySatellite);
satelliteCache = repmat(emptyCacheEntry, 0, 1);
reusableEntries = repmat(emptyCacheEntry, 0, 1);
if isTimeContextReused
    reusableEntries = sceneCache.Satellites;
end
for satelliteIndex = 1:numel(study.Satellites)
    satellite = study.Satellites{satelliteIndex};
    if satellite.InitialState.frame ~= "ITRF"
        warnings(end + 1, 1) = "Satellite '" + satellite.Name + ...
            "' was omitted because its frame is not ITRF."; %#ok<AGROW>
        continue
    end
    [satelliteData, isReused] = findReusableSatellite( ...
        reusableEntries, satellite.Name, satellite.InitialState);
    if ~isReused
        satelliteData = createSatelliteData( ...
            satellite, sampleEpochsUtc, trajectoryProvider, emptySatellite);
    end
    satellites(end + 1, 1) = satelliteData; %#ok<AGROW>
    cacheEntry = emptyCacheEntry;
    cacheEntry.Name = satellite.Name;
    cacheEntry.InitialState = satellite.InitialState;
    cacheEntry.Data = satelliteData;
    satelliteCache(end + 1, 1) = cacheEntry; %#ok<AGROW>
end
end

function [satelliteData, isReused] = findReusableSatellite( ...
        reusableEntries, satelliteName, initialState)
% Find an authoritative trajectory whose identity and complete state match.

satelliteData = struct();
isReused = false;
for entryIndex = 1:numel(reusableEntries)
    entry = reusableEntries(entryIndex);
    isMatchingEntry = entry.Name == satelliteName && ...
        isequaln(entry.InitialState, initialState);
    if isMatchingEntry
        satelliteData = entry.Data;
        isReused = true;
        return
    end
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

function validateSceneCache(sceneCache)
% Reject modified or incompatible opaque cache structures.

requiredFields = [ ...
    "Version", "SampleEpochsUtc", "SunDirectionProvider", ...
    "TrajectoryProvider", "TimeSamples", "Sun", "Satellites"];
isValidStructure = isstruct(sceneCache) && isscalar(sceneCache) && ...
    all(isfield(sceneCache, requiredFields));
if ~isValidStructure
    error("createSceneData:InvalidSceneCache", ...
        "sceneCache must be empty or an unchanged cache returned by " + ...
        "createSceneData.");
end
if ~isequal(sceneCache.Version, 1)
    error("createSceneData:UnsupportedSceneCacheVersion", ...
        "sceneCache version must be 1; observed version was %s.", ...
        string(sceneCache.Version));
end
end
