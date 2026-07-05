function payload = exportScenarioJson(scenario, filename, options)
%EXPORTSCENARIOJSON Serialize a propagated scenario to JSON for the web UI.
%
% payload = exportScenarioJson(scenario, filename)
% payload = exportScenarioJson(scenario, filename, "Extra", extraStruct)
%
% Writes a compact JSON document that the apps/orbit-ui frontend can render
% directly: scenario timing, satellite ephemerides (GCRF/ECI km positions,
% geodetic lat/lon/alt), ground points, and any access results stored on
% scenario.AccessResults. Returns the payload struct that was encoded.
% Fields of options.Extra are merged into the top level of the payload
% (e.g. the scenario spec the payload was generated from).
%
% Ephemeris samples are expressed as offsets in seconds from the scenario
% epoch to keep the file small and parsing trivial.

arguments
    scenario MissionScenario
    filename (1, 1) string
    options.Extra (1, 1) struct = struct()
end

epoch = scenario.Config.Epoch;

payload = struct();
payload.meta = struct( ...
    "name", string(scenario.Config.Name), ...
    "generator", "matlab", ...
    "generatedAtUtc", iso8601(datetime("now", "TimeZone", "UTC")), ...
    "epochUtc", iso8601(epoch), ...
    "durationSeconds", seconds(scenario.Config.Duration), ...
    "stepSeconds", seconds(scenario.Config.TimeStep));

satellites = {};
groundPoints = {};
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    switch string(obj.ObjectType)
        case "Satellite"
            satellites{end + 1} = satelliteEntry(obj, epoch); %#ok<AGROW>
        case {"GroundStation", "Place", "Facility", "Target"}
            groundPoints{end + 1} = groundPointEntry(obj); %#ok<AGROW>
    end
end
payload.satellites = satellites;
payload.groundPoints = groundPoints;

accesses = {};
accessNames = fieldnames(scenario.AccessResults);
for k = 1:numel(accessNames)
    accesses{end + 1} = accessEntry( ...
        scenario.AccessResults.(accessNames{k})); %#ok<AGROW>
end
payload.accesses = accesses;

extraFields = fieldnames(options.Extra);
for k = 1:numel(extraFields)
    payload.(extraFields{k}) = options.Extra.(extraFields{k});
end

fid = fopen(filename, "w");
if fid == -1
    error("exportScenarioJson:CannotOpenFile", ...
        "Cannot open '%s' for writing.", filename);
end
cleanup = onCleanup(@() fclose(fid));
fwrite(fid, jsonencode(payload), "char");
end

function entry = satelliteEntry(sat, epoch)
entry = struct();
entry.name = string(sat.Name);
entry.color = rgbToHex(sat.Color);
entry.propagatorType = string(sat.PropagatorType);
entry.orbitDefinitionType = string(sat.OrbitDefinitionType);
if sat.OrbitDefinitionType == "Keplerian"
    entry.elements = struct( ...
        "semiMajorAxisKm", sat.SemiMajorAxisMeters / 1000, ...
        "eccentricity", sat.Eccentricity, ...
        "inclinationDeg", sat.InclinationDeg, ...
        "raanDeg", sat.RAANDeg, ...
        "argPerigeeDeg", sat.ArgPerigeeDeg, ...
        "trueAnomalyDeg", sat.TrueAnomalyDeg);
end

eph = sat.Ephemeris;
if isempty(eph)
    error("exportScenarioJson:NotPropagated", ...
        "Satellite '%s' has no ephemeris. Propagate the scenario first.", ...
        sat.Name);
end
entry.ephemeris = struct( ...
    "tOffsetSec", round(seconds(eph.Time - epoch), 3), ...
    "eciKm", round([eph.X_m, eph.Y_m, eph.Z_m] / 1000, 4), ...
    "llaDeg", round([eph.LatitudeDeg, eph.LongitudeDeg, eph.AltitudeM / 1000], 5));
end

function entry = groundPointEntry(obj)
entry = struct();
entry.name = string(obj.Name);
entry.type = string(obj.ObjectType);
entry.color = rgbToHex(obj.Color);
entry.latitudeDeg = obj.LatitudeDeg;
entry.longitudeDeg = obj.LongitudeDeg;
entry.altitudeM = obj.AltitudeMeters;
if isprop(obj, "MinElevationDeg")
    entry.minElevationDeg = obj.MinElevationDeg;
end
end

function entry = accessEntry(accessResult)
entry = struct();
entry.source = string(accessResult.SourceName);
entry.target = string(accessResult.TargetName);
entry.totalDurationSeconds = accessResult.Duration;
windows = {};
w = accessResult.AccessWindows;
for k = 1:height(w)
    windows{end + 1} = struct( ...
        "startUtc", iso8601(w.StartTime(k)), ...
        "stopUtc", iso8601(w.StopTime(k)), ...
        "durationSeconds", w.DurationSeconds(k), ...
        "maxElevationDeg", round(w.MaxElevationDeg(k), 2), ...
        "minRangeKm", round(w.MinRangeKm(k), 1)); %#ok<AGROW>
end
entry.windows = windows;
end

function text = iso8601(t)
t.TimeZone = "UTC";
text = string(t, "uuuu-MM-dd'T'HH:mm:ss.SSS'Z'");
end

function hex = rgbToHex(rgb)
if isempty(rgb) || numel(rgb) < 3
    rgb = [0.8 0.8 0.8];
end
rgb = max(min(rgb(1:3), 1), 0);
hex = string(sprintf("#%02x%02x%02x", round(rgb * 255)));
end
