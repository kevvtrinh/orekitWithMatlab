function payload = orbitUiDemoScenario(outputFile)
%ORBITUIDEMOSCENARIO Build the demo scenario used by the web-UI bridges.
%
% payload = orbitUiDemoScenario(outputFile)
%
% Authors a small deterministic mission as a scenario *spec* (the same
% schema the browser consoles edit) and runs it through orbitUiRunScenario,
% so a demo payload carries exactly what a user-run payload carries: the
% echoed spec, access windows, sensors, the sensor-task schedule, the
% time-tagged pointing history, and the Orekit Sun/lighting/orientation
% blocks. The mission: an ISS-like LEO satellite, a sun-synchronous imager
% with a conic sensor, two ground stations, a point target the imager is
% tasked to track, a reachable area it is tasked to scan, and an Ohio area
% target ready for sensor-area access experiments.
%
% The point and area targets are placed on the imager's actual propagated
% ground track (offset cross-track) so the scheduler always finds real
% opportunities - the demo never depends on hand-tuned geography.

arguments
    outputFile (1, 1) string = "orbit-ui-scenario.json"
end

epoch = datetime(2026, 7, 5, 0, 0, 0, "TimeZone", "UTC");
durationSeconds = 3 * 3600;
stepSeconds = 30;

% --- Probe pass: propagate just the imager to place targets on its track ---
probeCfg = ScenarioConfig();
probeCfg.Name = "Demo Probe";
probeCfg.Epoch = epoch;
probeCfg.Duration = seconds(durationSeconds);
probeCfg.TimeStep = seconds(stepSeconds);
probe = MissionScenario(probeCfg);
probe = probe.addObject(imagerSatellite());
probe = probe.propagate();
imagerEphemeris = probe.getObject("SSO-Imager").Ephemeris;

pointAnchor = groundTrackPoint(imagerEphemeris, epoch + minutes(45));
areaAnchor = groundTrackPoint(imagerEphemeris, epoch + minutes(96));

% --- The demo spec (schema: apps/orbit-*/js|lib/spec.js, version 1) ---
objects = {};
objects{end + 1} = struct( ...
    "kind", "satellite", "name", "ISS-Demo", "color", "#e8a33d", ...
    "propagator", "Keplerian", "massKg", 420000, ...
    "orbit", struct("type", "keplerian", "semiMajorAxisKm", 6778, ...
        "eccentricity", 0.0007, "inclinationDeg", 51.6, "raanDeg", 60, ...
        "argPerigeeDeg", 30, "trueAnomalyDeg", 0));
imagerSpec = struct( ...
    "kind", "satellite", "name", "SSO-Imager", "color", "#4fb8d1", ...
    "propagator", "Keplerian", "massKg", 1200, ...
    "orbit", struct("type", "keplerian", "semiMajorAxisKm", 7078.137, ...
        "eccentricity", 0.001, "inclinationDeg", 98.19, "raanDeg", 100, ...
        "argPerigeeDeg", 0, "trueAnomalyDeg", 0));
imagerSpec.sensor = struct( ...
    "name", "Imager-1", "coneHalfAngleDeg", 15, "fieldOfRegardDeg", 55, ...
    "slewRateDegPerSec", 2, "pointing", "Nadir");
objects{end + 1} = imagerSpec;
objects{end + 1} = struct( ...
    "kind", "groundStation", "name", "Denver GS", "color", "#5aa0d8", ...
    "latitudeDeg", 39.7392, "longitudeDeg", -104.9903, ...
    "altitudeM", 1609, "minElevationDeg", 10);
objects{end + 1} = struct( ...
    "kind", "groundStation", "name", "Kourou GS", "color", "#5aa0d8", ...
    "latitudeDeg", 5.2360, "longitudeDeg", -52.7686, ...
    "altitudeM", 9, "minElevationDeg", 5);
objects{end + 1} = struct( ...
    "kind", "target", "name", "Survey Site", "color", "#e0705c", ...
    "latitudeDeg", round(pointAnchor.latDeg + 1.5, 2), ...
    "longitudeDeg", round(pointAnchor.lonDeg + 1.0, 2), ...
    "altitudeM", 0, "priority", 8);
areaCenterLat = max(min(round(areaAnchor.latDeg, 1), 60), -60);
areaCenterLon = round(areaAnchor.lonDeg, 1);
objects = [objects, areaGridTargets("Scan Region", areaCenterLat, ...
    areaCenterLon, 160, 120, 40, 6)];
objects = [objects, areaGridTargets("Ohio", 40.25, -82.75, ...
    370, 400, 75, 5)];

spec = struct();
spec.version = 1;
spec.meta = struct( ...
    "name", "Orbit UI Demo", ...
    "epochUtc", string(epoch, "uuuu-MM-dd'T'HH:mm:ss.SSS'Z'"), ...
    "durationSeconds", durationSeconds, ...
    "stepSeconds", stepSeconds);
spec.objects = objects;
spec.tasks = { ...
    struct("id", "task-1", "name", "Image Survey Site", ...
        "taskType", "TrackPointTarget", "targetName", "Survey Site", ...
        "dwellSeconds", 60, "priority", 8), ...
    struct("id", "task-2", "name", "Scan Region Sweep", ...
        "taskType", "ScanAreaTarget", "targetName", "Scan Region", ...
        "dwellSeconds", 30, "priority", 6, "requiredCoveragePercent", 50)};

specFile = fullfile(tempdir, "orbit-ui-demo-spec.json");
fid = fopen(specFile, "w");
if fid == -1
    error("orbitUiDemoScenario:CannotOpenFile", ...
        "Cannot open '%s' for writing.", specFile);
end
cleanup = onCleanup(@() fclose(fid));
fwrite(fid, jsonencode(spec), "char");
clear cleanup

payload = orbitUiRunScenario(specFile, outputFile);
end

% -------------------------------------------------------------------------

function sat = imagerSatellite()
sat = SatelliteObject.fromKeplerian("SSO-Imager", 7078.137e3, 0.001, ...
    98.19, 100, 0, 0);
end

function point = groundTrackPoint(ephemeris, time)
[~, index] = min(abs(ephemeris.Time - time));
point = struct("latDeg", ephemeris.LatitudeDeg(index), ...
    "lonDeg", ephemeris.LongitudeDeg(index));
end

function targets = areaGridTargets(name, centerLatDeg, centerLonDeg, ...
    widthKm, heightKm, spacingKm, priority)
% Mirror of the consoles' expandAreaGrid (spec.js): equal cells no larger
% than the spacing, one point per cell center, grid points named
% <name>-RrrCcc and tagged with the shared group + area metadata.
kmPerDegLat = 111.32;
rows = max(1, ceil(heightKm / spacingKm));
cols = max(1, ceil(widthKm / spacingKm));
cosLat = cos(deg2rad(centerLatDeg));
heightDeg = heightKm / kmPerDegLat;
widthDeg = widthKm / (kmPerDegLat * cosLat);
area = struct("name", name, "centerLatDeg", centerLatDeg, ...
    "centerLonDeg", centerLonDeg, "widthKm", widthKm, ...
    "heightKm", heightKm, "spacingKm", spacingKm);
targets = {};
for r = 1:rows
    lat = centerLatDeg + ((r - 0.5) / rows - 0.5) * heightDeg;
    for c = 1:cols
        lon = centerLonDeg + ((c - 0.5) / cols - 0.5) * widthDeg;
        lon = mod(lon + 180, 360) - 180;
        targets{end + 1} = struct( ...
            "kind", "target", ...
            "name", sprintf("%s-R%02dC%02d", name, r, c), ...
            "color", "", "group", name, "area", area, ...
            "latitudeDeg", lat, "longitudeDeg", lon, ...
            "altitudeM", 0, "priority", priority); %#ok<AGROW>
    end
end
end
