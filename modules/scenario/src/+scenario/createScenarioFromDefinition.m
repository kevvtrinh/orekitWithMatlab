function study = createScenarioFromDefinition(definition)
%% Section 0: Header & Readme
% SYNTAX
%   study = scenario.createScenarioFromDefinition(definition)
%**************************************************************************
% PURPOSE
%   - Recreate one Scenario from a versioned provider-neutral definition.
%**************************************************************************
% INPUTS
%   - definition (scalar struct)
%       Structure returned by scenario.createScenarioDefinition. Format must
%       be "scenario-definition" and Version must be 1. Unknown fields are
%       ignored. Missing required fields or invalid object values raise errors.
%**************************************************************************
% OUTPUTS
%   - study (scenario.Scenario)
%       New mutable Scenario containing reconstructed satellites, places, and
%       point targets. Derived results and runtime providers are not restored.
%**************************************************************************
% UNITS
%   - Epochs are POSIX seconds in UTC. Cartesian positions are metres and
%     velocities are metres per second. Geodetic coordinates are degrees and
%     ellipsoidal metres. Cartesian ordering is [x, y, z].
%**************************************************************************

%% Section 1: Validate The Definition Envelope

validateDefinitionEnvelope(definition);

%% Section 2: Create The Scenario Interval

startTime = datetime(definition.StartEpochUnix_s, ...
    "ConvertFrom", "posixtime", "TimeZone", "UTC");
stopTime = datetime(definition.StopEpochUnix_s, ...
    "ConvertFrom", "posixtime", "TimeZone", "UTC");
study = scenario.Scenario(definition.Name, startTime, stopTime);

%% Section 3: Restore Satellites

satellites = definition.Satellites;
for satelliteIndex = 1:numel(satellites)
    satellite = satellites(satelliteIndex);
    validateSatelliteDefinition(satellite);
    initialEpoch = datetime(satellite.InitialEpochUnix_s, ...
        "ConvertFrom", "posixtime", "TimeZone", "UTC");
    initialState = struct( ...
        "epoch", initialEpoch, ...
        "frame", string(satellite.Frame), ...
        "position_m", reshape(satellite.Position_m, 1, 3), ...
        "velocity_m_s", reshape(satellite.Velocity_m_s, 1, 3));
    study.addSatellite(string(satellite.Name), initialState);
end

%% Section 4: Restore Places And Targets

restoreLocations(study, definition.Places, "Place");
restoreLocations(study, definition.Targets, "Target");
end

function validateDefinitionEnvelope(definition)
% Enforce format, version, interval, and required collection fields.

requiredFields = [ ...
    "Format", "Version", "Name", "StartEpochUnix_s", ...
    "StopEpochUnix_s", "Satellites", "Places", "Targets"];
if ~(isstruct(definition) && isscalar(definition) && ...
        all(isfield(definition, requiredFields)))
    error("createScenarioFromDefinition:InvalidDefinition", ...
        "definition must be a scalar scenario-definition structure.");
end
validateFormat(definition.Format);
validateVersion(definition.Version);
validateattributes(definition.StartEpochUnix_s, {'numeric'}, ...
    {'real', 'finite', 'scalar'});
validateattributes(definition.StopEpochUnix_s, {'numeric'}, ...
    {'real', 'finite', 'scalar'});
validateCollection(definition.Satellites, "Satellites");
validateCollection(definition.Places, "Places");
validateCollection(definition.Targets, "Targets");
end

function validateFormat(value)
% Enforce the scalar identifier for Version 1 scenario definitions.

format = string(value);
isSupported = isscalar(format) && ~ismissing(format) && ...
    format == "scenario-definition";
if ~isSupported
    error("createScenarioFromDefinition:UnsupportedFormat", ...
        "Only scenario-definition Version 1 is supported.");
end
end

function validateVersion(value)
% Enforce the only schema version currently supported by this module.

isSupported = isnumeric(value) && isscalar(value) && ...
    isfinite(value) && value == 1;
if ~isSupported
    error("createScenarioFromDefinition:UnsupportedFormat", ...
        "Only scenario-definition Version 1 is supported.");
end
end

function validateCollection(value, fieldName)
% Accept a structure collection or JSON's untyped empty-array representation.

isUntypedEmpty = isnumeric(value) && isempty(value);
if ~(isstruct(value) || isUntypedEmpty)
    error("createScenarioFromDefinition:InvalidCollection", ...
        "definition.%s must be a structure array or empty array.", fieldName);
end
end

function validateSatelliteDefinition(satellite)
% Validate fields and Cartesian array shapes before reconstruction.

requiredFields = [ ...
    "Name", "InitialEpochUnix_s", "Frame", "Position_m", "Velocity_m_s"];
if ~(isstruct(satellite) && isscalar(satellite) && ...
        all(isfield(satellite, requiredFields)))
    error("createScenarioFromDefinition:InvalidSatellite", ...
        "Every satellite requires name, epoch, frame, position, and velocity.");
end
validateattributes(satellite.InitialEpochUnix_s, {'numeric'}, ...
    {'real', 'finite', 'scalar'});
validateattributes(satellite.Position_m, {'numeric'}, ...
    {'real', 'finite', 'vector', 'numel', 3});
validateattributes(satellite.Velocity_m_s, {'numeric'}, ...
    {'real', 'finite', 'vector', 'numel', 3});
end

function restoreLocations(study, definitions, locationType)
% Restore one homogeneous WGS84 place or target collection.

for locationIndex = 1:numel(definitions)
    location = definitions(locationIndex);
    validateLocationDefinition(location, locationType);
    arguments = { ...
        string(location.Name), ...
        location.Latitude_deg, ...
        location.Longitude_deg, ...
        location.Altitude_m};
    if locationType == "Place"
        study.addPlace(arguments{:});
    else
        study.addTarget(arguments{:});
    end
end
end

function validateLocationDefinition(location, locationType)
% Enforce required WGS84 location fields before constructor validation.

requiredFields = ["Name", "Latitude_deg", "Longitude_deg", "Altitude_m"];
if ~(isstruct(location) && isscalar(location) && ...
        all(isfield(location, requiredFields)))
    error("createScenarioFromDefinition:InvalidLocation", ...
        "Every %s requires name, latitude, longitude, and altitude.", ...
        lower(locationType));
end
end
