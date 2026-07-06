function scenario = buildScenarioFromSpec(spec)
%BUILDSCENARIOFROMSPEC Construct a MissionScenario from a web-UI scenario spec.
%
% scenario = buildScenarioFromSpec(spec)
%
% spec is the struct produced by jsondecode on a scenario spec JSON document
% authored by the apps/orbit-ui frontend (schema: apps/orbit-ui/src/lib/spec.js).
% The scenario is assembled from the same mission classes the MATLAB UI uses
% (SatelliteObject, GroundStationObject, TargetObject); propagation is left to
% the caller.

arguments
    spec (1, 1) struct
end

if ~isfield(spec, "version") || spec.version ~= 1
    error("buildScenarioFromSpec:UnsupportedVersion", ...
        "Unsupported scenario spec version (expected 1).");
end

cfg = ScenarioConfig();
cfg.Name = string(spec.meta.name);
cfg.Epoch = parseIsoUtc(spec.meta.epochUtc);
cfg.Duration = seconds(double(spec.meta.durationSeconds));
cfg.TimeStep = seconds(double(spec.meta.stepSeconds));
cfg.validate();

scenario = MissionScenario(cfg);

% jsondecode yields a struct array for homogeneous objects and a cell array
% for heterogeneous ones; normalize to a cell array.
objects = spec.objects;
if isstruct(objects)
    objects = num2cell(objects);
elseif ~iscell(objects)
    objects = {};
end

for k = 1:numel(objects)
    entry = objects{k};
    switch string(entry.kind)
        case "satellite"
            scenario = scenario.addObject(buildSatellite(entry, cfg.Epoch));
        case "groundStation"
            gs = GroundStationObject(string(entry.name), ...
                double(entry.latitudeDeg), double(entry.longitudeDeg), ...
                double(entry.altitudeM), fieldOr(entry, "minElevationDeg", 5));
            scenario = scenario.addObject(applyColor(gs, entry));
        case "target"
            target = TargetObject(string(entry.name), ...
                double(entry.latitudeDeg), double(entry.longitudeDeg), ...
                double(entry.altitudeM));
            target.Priority = double(fieldOr(entry, "priority", 1));
            scenario = scenario.addObject(applyColor(target, entry));
        otherwise
            error("buildScenarioFromSpec:UnknownKind", ...
                "Unknown spec object kind '%s' (objects[%d]).", ...
                string(entry.kind), k);
    end
end
end

function sat = buildSatellite(entry, epoch)
orbit = entry.orbit;
switch string(orbit.type)
    case "keplerian"
        sat = SatelliteObject.fromKeplerian(string(entry.name), ...
            double(orbit.semiMajorAxisKm) * 1000.0, ...
            double(orbit.eccentricity), double(orbit.inclinationDeg), ...
            double(orbit.raanDeg), double(orbit.argPerigeeDeg), ...
            double(orbit.trueAnomalyDeg));
    case "tle"
        sat = SatelliteObject.fromTLE(string(entry.name), ...
            strtrim(string(orbit.line1)), strtrim(string(orbit.line2)));
    otherwise
        error("buildScenarioFromSpec:UnknownOrbitType", ...
            "Unknown orbit type '%s' for satellite '%s'.", ...
            string(orbit.type), string(entry.name));
end
sat.PropagatorType = string(fieldOr(entry, "propagator", sat.PropagatorType));
sat.MassKg = double(fieldOr(entry, "massKg", sat.MassKg));
sat = applyColor(sat, entry);
if isfield(entry, "sensor") && isstruct(entry.sensor)
    sat = sat.addSensor(buildSensor(entry.sensor, string(entry.name)));
end
sat = addManeuvers(sat, entry, epoch);
end

function sat = addManeuvers(sat, entry, epoch)
% Spec maneuvers are impulsive burns at an offset from the scenario epoch;
% propagation applies them piecewise (propagateWithManeuvers). SGP4 has no
% maneuver support - the frontend validator steers users to Numerical.
if ~isfield(entry, "maneuvers") || isempty(entry.maneuvers)
    return
end
if upper(string(sat.PropagatorType)) == "TLE"
    error("buildScenarioFromSpec:ManeuversUnsupported", ...
        "Satellite '%s' uses the SGP4 propagator, which cannot maneuver. " + ...
        "Switch the propagator to Numerical.", sat.Name);
end
entries = entry.maneuvers;
if isstruct(entries)
    entries = num2cell(entries);
elseif ~iscell(entries)
    return
end
for k = 1:numel(entries)
    m = entries{k};
    name = string(fieldOr(m, "name", sprintf("%s Maneuver %d", sat.Name, k)));
    burnTime = epoch + seconds(double(m.timeOffsetSec));
    frame = string(fieldOr(m, "frame", "TNW"));
    deltaV = double(reshape(m.deltaVmps, 1, 3));
    sat = sat.addManeuver(ImpulsiveManeuver(name, burnTime, frame, deltaV));
end
end

function sensor = buildSensor(spec, satName)
% Web-UI sensors are conic imagers: the field of view is the instantaneous
% beam, the field of regard is how far the sensor can slew off the nominal
% boresight (spec.pointing; nadir by default). Scheduling tasks slew the
% boresight; access is FOR-gated (computeSensorAccess default) with FOV
% windows as the in-view subset.
name = string(fieldOr(spec, "name", satName + " Sensor"));
sensor = SensorObject.simpleConic(name, satName, ...
    double(fieldOr(spec, "coneHalfAngleDeg", 20)));
sensor.FieldOfRegardDeg = double(fieldOr(spec, "fieldOfRegardDeg", 60));
sensor.MaxSlewRateDegPerSec = double(fieldOr(spec, "slewRateDegPerSec", 2));

pointing = string(fieldOr(spec, "pointing", "Nadir"));
switch lower(pointing)
    case "nadir"
        sensor.PointingMode = "Nadir";
    case "velocityvector"
        sensor.PointingMode = "VelocityVector";
    case {"sunpointing", "sun"}
        sensor.PointingMode = "SunPointing";
    case "fixedvector"
        boresight = fieldOr(spec, "boresight", []);
        if numel(boresight) ~= 3 || any(~isfinite(boresight)) ...
                || norm(double(boresight)) == 0
            error("buildScenarioFromSpec:InvalidBoresight", ...
                "Sensor '%s' FixedVector pointing needs a finite nonzero " + ...
                "boresight [x, y, z].", name);
        end
        sensor.PointingMode = "FixedVector";
        % Constant Earth-fixed direction (any non-Body BoresightFrame is
        % used verbatim by SensorObject.getBoresightVector).
        sensor.BoresightFrame = "ECEF";
        sensor.BoresightVector = double(reshape(boresight, 1, 3));
    otherwise
        error("buildScenarioFromSpec:UnknownPointingMode", ...
            "Sensor '%s' has unknown pointing mode '%s'.", name, pointing);
end
end

function obj = applyColor(obj, entry)
hex = string(fieldOr(entry, "color", ""));
if ~isempty(regexp(hex, "^#[0-9a-fA-F]{6}$", "once"))
    obj.Color = double([hex2dec(extractBetween(hex, 2, 3)), ...
        hex2dec(extractBetween(hex, 4, 5)), ...
        hex2dec(extractBetween(hex, 6, 7))]) / 255.0;
end
end

function value = fieldOr(entry, name, fallback)
if isfield(entry, name) && ~isempty(entry.(name))
    value = entry.(name);
else
    value = fallback;
end
end

function t = parseIsoUtc(text)
text = strtrim(string(text));
formats = ["uuuu-MM-dd'T'HH:mm:ss.SSS'Z'", "uuuu-MM-dd'T'HH:mm:ss'Z'"];
for fmt = formats
    try
        t = datetime(text, "InputFormat", fmt, "TimeZone", "UTC");
        return
    catch
        % try the next format
    end
end
error("buildScenarioFromSpec:InvalidEpoch", ...
    "Cannot parse epoch '%s' (expected ISO-8601 UTC).", text);
end
