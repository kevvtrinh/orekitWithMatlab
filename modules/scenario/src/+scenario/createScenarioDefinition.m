function definition = createScenarioDefinition(study)
%% Section 0: Header & Readme
% SYNTAX
%   definition = scenario.createScenarioDefinition(study)
%**************************************************************************
% PURPOSE
%   - Export one Scenario composition as a provider-neutral MATLAB structure.
%**************************************************************************
% INPUTS
%   - study (scenario.Scenario)
%       Scenario whose interval, satellites, places, and point targets are
%       exported. Runtime providers and derived analysis results are excluded.
%**************************************************************************
% OUTPUTS
%   - definition (scalar struct)
%       Versioned scenario-definition structure suitable for jsonencode and
%       scenario.createScenarioFromDefinition. Empty collections are retained.
%**************************************************************************
% UNITS
%   - Epochs are POSIX seconds in UTC. Cartesian positions are metres and
%     velocities are metres per second. Geodetic coordinates are degrees and
%     ellipsoidal metres. Cartesian ordering is [x, y, z].
%**************************************************************************

%% Section 1: Validate The Scenario

if ~isa(study, "scenario.Scenario")
    error("createScenarioDefinition:InvalidScenario", ...
        "study must be a scenario.Scenario instance.");
end

%% Section 2: Export Platform And Location Definitions

satellites = exportSatellites(study.Satellites);
places = exportLocations(study.Places);
targets = exportLocations(study.Targets);

%% Section 3: Assemble The Versioned Definition

definition = struct( ...
    "Format", "scenario-definition", ...
    "Version", 1, ...
    "Name", study.Name, ...
    "StartEpochUnix_s", posixtime(study.StartTime), ...
    "StopEpochUnix_s", posixtime(study.StopTime), ...
    "Satellites", satellites, ...
    "Places", places, ...
    "Targets", targets);
end

function definitions = exportSatellites(satellites)
% Export satellite names and engine-neutral Cartesian initial states.

emptyDefinition = struct( ...
    "Name", "", ...
    "InitialEpochUnix_s", 0, ...
    "Frame", "", ...
    "Position_m", zeros(1, 3), ...
    "Velocity_m_s", zeros(1, 3));
definitions = repmat(emptyDefinition, numel(satellites), 1);
for satelliteIndex = 1:numel(satellites)
    satellite = satellites{satelliteIndex};
    state = satellite.InitialState;
    definitions(satelliteIndex) = struct( ...
        "Name", satellite.Name, ...
        "InitialEpochUnix_s", posixtime(state.epoch), ...
        "Frame", state.frame, ...
        "Position_m", state.position_m, ...
        "Velocity_m_s", state.velocity_m_s);
end
end

function definitions = exportLocations(locations)
% Export WGS84 place or point-target definitions with stable fields.

emptyDefinition = struct( ...
    "Name", "", ...
    "Latitude_deg", 0, ...
    "Longitude_deg", 0, ...
    "Altitude_m", 0);
definitions = repmat(emptyDefinition, numel(locations), 1);
for locationIndex = 1:numel(locations)
    location = locations{locationIndex};
    definitions(locationIndex) = struct( ...
        "Name", location.Name, ...
        "Latitude_deg", location.Latitude_deg, ...
        "Longitude_deg", location.Longitude_deg, ...
        "Altitude_m", location.Altitude_m);
end
end
