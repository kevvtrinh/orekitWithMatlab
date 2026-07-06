function tests = testOrbitUiSpec
tests = functiontests(localfunctions);
end

% Spec JSON authored the same way the web UI submits it: heterogeneous
% objects (satellites + ground objects) so jsondecode yields a cell array.
function json = specJson()
json = ['{"version":1,"rev":3,"meta":{"name":"Spec Pipeline Test",' ...
    '"epochUtc":"2026-07-05T00:00:00Z","durationSeconds":3600,"stepSeconds":60},' ...
    '"objects":[' ...
    '{"kind":"satellite","name":"Kep-1","color":"#4fb8d1","propagator":"Keplerian",' ...
    '"massKg":850,"orbit":{"type":"keplerian","semiMajorAxisKm":7000,' ...
    '"eccentricity":0.001,"inclinationDeg":51.6,"raanDeg":40,"argPerigeeDeg":0,' ...
    '"trueAnomalyDeg":10}},' ...
    '{"kind":"groundStation","name":"Denver GS","latitudeDeg":39.7392,' ...
    '"longitudeDeg":-104.9903,"altitudeM":1609,"minElevationDeg":10},' ...
    '{"kind":"target","name":"Pikes Peak","latitudeDeg":38.8409,' ...
    '"longitudeDeg":-105.0423,"altitudeM":4302,"priority":7}' ...
    ']}'];
end

% Scheduling spec: near-equatorial satellite with a sensor plus an equatorial
% point target, so a field-of-regard pass (and a scheduled task) is
% guaranteed within the 3 h span regardless of epoch sidereal time.
function json = schedulingSpecJson()
json = ['{"version":1,"rev":1,"meta":{"name":"Scheduling Test",' ...
    '"epochUtc":"2026-07-05T00:00:00Z","durationSeconds":10800,"stepSeconds":60},' ...
    '"objects":[' ...
    '{"kind":"satellite","name":"EqSat","propagator":"Keplerian","massKg":900,' ...
    '"sensor":{"coneHalfAngleDeg":15,"fieldOfRegardDeg":60,"slewRateDegPerSec":2},' ...
    '"orbit":{"type":"keplerian","semiMajorAxisKm":7000,"eccentricity":0.001,' ...
    '"inclinationDeg":1,"raanDeg":0,"argPerigeeDeg":0,"trueAnomalyDeg":0}},' ...
    '{"kind":"target","name":"Eq Target","latitudeDeg":0,' ...
    '"longitudeDeg":0,"altitudeM":0,"priority":5}' ...
    '],' ...
    '"tasks":[{"id":"task-1","name":"Image Eq Target","satelliteName":"EqSat",' ...
    '"targetName":"Eq Target","priority":5,"dwellSeconds":60}]}'];
end

function testBuildScenarioFromSpec(testCase)
scenario = buildScenarioFromSpec(jsondecode(specJson()));

verifyEqual(testCase, string(scenario.Config.Name), "Spec Pipeline Test");
verifyEqual(testCase, scenario.Config.Epoch, ...
    datetime(2026, 7, 5, 0, 0, 0, "TimeZone", "UTC"));
verifyEqual(testCase, seconds(scenario.Config.Duration), 3600);
verifyEqual(testCase, seconds(scenario.Config.TimeStep), 60);
verifyEqual(testCase, numel(scenario.Objects), 3);

sat = scenario.Objects{1};
verifyEqual(testCase, string(sat.ObjectType), "Satellite");
verifyEqual(testCase, sat.SemiMajorAxisMeters, 7000e3);
verifyEqual(testCase, sat.InclinationDeg, 51.6);
verifyEqual(testCase, sat.MassKg, 850);
verifyEqual(testCase, sat.Color, [79 184 209] / 255, "AbsTol", 1e-12);

gs = scenario.Objects{2};
verifyEqual(testCase, string(gs.ObjectType), "GroundStation");
verifyEqual(testCase, gs.MinElevationDeg, 10);

target = scenario.Objects{3};
verifyEqual(testCase, string(target.ObjectType), "Target");
verifyEqual(testCase, target.Priority, 7);
end

function testBuildScenarioFromSpecMillisecondEpoch(testCase)
spec = jsondecode(specJson());
spec.meta.epochUtc = '2026-07-05T12:30:00.500Z';
scenario = buildScenarioFromSpec(spec);
expected = datetime(2026, 7, 5, 12, 30, 0.5, "TimeZone", "UTC");
verifyEqual(testCase, scenario.Config.Epoch, expected);
end

function testBuildScenarioFromSpecRejectsUnknownKind(testCase)
spec = jsondecode(strrep(specJson(), '"kind":"target"', '"kind":"banana"'));
verifyError(testCase, @() buildScenarioFromSpec(spec), ...
    "buildScenarioFromSpec:UnknownKind");
end

function testBuildScenarioFromSpecRejectsWrongVersion(testCase)
spec = jsondecode(strrep(specJson(), '"version":1', '"version":99'));
verifyError(testCase, @() buildScenarioFromSpec(spec), ...
    "buildScenarioFromSpec:UnsupportedVersion");
end

function testBuildScenarioFromSpecWithSensor(testCase)
scenario = buildScenarioFromSpec(jsondecode(schedulingSpecJson()));
sat = scenario.Objects{1};
verifyEqual(testCase, numel(sat.Sensors), 1);
sensor = sat.Sensors{1};
verifyEqual(testCase, string(sensor.Name), "EqSat Sensor");
verifyEqual(testCase, sensor.effectiveConeHalfAngleDeg(), 15);
verifyEqual(testCase, sensor.FieldOfRegardDeg, 60);
verifyEqual(testCase, string(sensor.PointingMode), "Nadir");
verifyEqual(testCase, sensor.effectiveSlewRateDegPerSec(), 2);
end

function testRunScenarioWithScheduling(testCase)
specFile = [tempname(), '.json'];
outputFile = [tempname(), '.json'];
cleanupFiles = onCleanup(@() cellfun(@deleteIfExists, {specFile, outputFile}));

fid = fopen(specFile, "w");
fwrite(fid, schedulingSpecJson(), "char");
fclose(fid);

payload = orbitUiRunScenario(specFile, outputFile);

% Sensor definitions are exported for the frontend cones/domes.
verifyEqual(testCase, numel(payload.sensors), 1);
sensor = payload.sensors{1};
verifyEqual(testCase, string(sensor.name), "EqSat Sensor");
verifyEqual(testCase, string(sensor.parent), "EqSat");
verifyEqual(testCase, sensor.coneHalfAngleDeg, 15);
verifyEqual(testCase, sensor.fieldOfRegardDeg, 60);

% The task was scheduled onto the sensor with a finite slew lead-in.
verifyNotEmpty(testCase, payload.schedule);
entry = payload.schedule{1};
verifyEqual(testCase, string(entry.taskId), "task-1");
verifyEqual(testCase, string(entry.platformName), "EqSat");
verifyEqual(testCase, string(entry.sensorName), "EqSat Sensor");
verifyEqual(testCase, string(entry.targetName), "Eq Target");
verifyGreaterThanOrEqual(testCase, entry.durationSeconds, 60);
verifyGreaterThanOrEqual(testCase, entry.slewTimeSeconds, 0);

% FOR windows (reachable by slewing) must exist and enclose at least as
% much time as the narrow-beam FOV windows.
verifyEqual(testCase, numel(payload.sensorAccesses), 1);
pair = payload.sensorAccesses{1};
verifyEqual(testCase, string(pair.platform), "EqSat");
verifyEqual(testCase, string(pair.target), "Eq Target");
verifyNotEmpty(testCase, pair.forWindows);
forSeconds = sum(cellfun(@(w) w.durationSeconds, pair.forWindows));
fovSeconds = 0;
if ~isempty(pair.fovWindows)
    fovSeconds = sum(cellfun(@(w) w.durationSeconds, pair.fovWindows));
end
verifyGreaterThanOrEqual(testCase, forSeconds, fovSeconds);
verifyGreaterThan(testCase, forSeconds, 0);

% Sun block: ephemeris on the scenario grid, eclipse windows for the LEO
% satellite (guaranteed for a near-equatorial orbit), target daylight.
verifyTrue(testCase, isfield(payload, "sun"));
verifyEqual(testCase, numel(payload.sun.ephemeris.tOffsetSec), 181);
sunRadiusKm = sqrt(sum(payload.sun.ephemeris.eciKm(1, :).^2));
verifyGreaterThan(testCase, sunRadiusKm, 1.4e8);
verifyLessThan(testCase, sunRadiusKm, 1.6e8);
verifyEqual(testCase, numel(payload.sun.eclipses), 1);
verifyEqual(testCase, string(payload.sun.eclipses{1}.satellite), "EqSat");
verifyNotEmpty(testCase, payload.sun.eclipses{1}.windows);
verifyEqual(testCase, numel(payload.sun.groundLighting), 1);
verifyEqual(testCase, string(payload.sun.groundLighting{1}.name), "Eq Target");
end

function testRunScenarioEndToEnd(testCase)
specFile = [tempname(), '.json'];
outputFile = [tempname(), '.json'];
cleanupFiles = onCleanup(@() cellfun(@deleteIfExists, {specFile, outputFile}));

fid = fopen(specFile, "w");
fwrite(fid, specJson(), "char");
fclose(fid);

payload = orbitUiRunScenario(specFile, outputFile);

% Written file parses back to the same payload shape.
written = jsondecode(fileread(outputFile));
verifyEqual(testCase, string(written.meta.name), "Spec Pipeline Test");

% One satellite propagated over the full span at the requested step.
verifyEqual(testCase, numel(payload.satellites), 1);
sat = payload.satellites{1};
verifyEqual(testCase, string(sat.name), "Kep-1");
verifyEqual(testCase, numel(sat.ephemeris.tOffsetSec), 61);
radiusKm = sqrt(sum(sat.ephemeris.eciKm.^2, 2));
verifyEqual(testCase, radiusKm, 7000 * ones(61, 1), "AbsTol", 15);

% Access computed for satellite x ground station; targets are excluded
% (plain access does not support them; they belong to sensor workflows).
verifyEqual(testCase, numel(payload.accesses), 1);
access = payload.accesses{1};
verifyEqual(testCase, string(access.source), "Kep-1");
verifyEqual(testCase, string(access.target), "Denver GS");

% The spec snapshot is echoed so the frontend can check freshness.
verifyTrue(testCase, isfield(payload, "spec"));
verifyEqual(testCase, payload.spec.rev, 3);
verifyEqual(testCase, string(payload.spec.meta.epochUtc), ...
    "2026-07-05T00:00:00Z");

% No sensors in the spec: no sensor/schedule payload blocks. Sun data is
% always exported (satellite eclipses + daylight at both ground objects).
verifyFalse(testCase, isfield(payload, "sensors"));
verifyTrue(testCase, isfield(payload, "sun"));
verifyEqual(testCase, numel(payload.sun.eclipses), 1);
verifyEqual(testCase, numel(payload.sun.groundLighting), 2);
end

function testRunScenarioWithSelectedPlainAccess(testCase)
spec = jsondecode(specJson());
spec.objects{end + 1} = struct( ...
    "kind", "groundStation", ...
    "name", "Canberra GS", ...
    "latitudeDeg", -35.398, ...
    "longitudeDeg", 148.9819, ...
    "altitudeM", 691, ...
    "minElevationDeg", 10);
spec.accessRequests = struct( ...
    "type", "access", ...
    "sourceName", "Kep-1", ...
    "targetName", "Denver GS");

specFile = [tempname(), '.json'];
outputFile = [tempname(), '.json'];
cleanupFiles = onCleanup(@() cellfun(@deleteIfExists, {specFile, outputFile}));

fid = fopen(specFile, "w");
fwrite(fid, jsonencode(spec), "char");
fclose(fid);

payload = orbitUiRunScenario(specFile, outputFile);

verifyEqual(testCase, numel(payload.accesses), 1);
verifyEqual(testCase, string(payload.accesses{1}.source), "Kep-1");
verifyEqual(testCase, string(payload.accesses{1}.target), "Denver GS");
verifyEqual(testCase, string(payload.spec.accessRequests.type), "access");
end

% Maneuvering satellite whose sensor holds a fixed ECEF boresight; exercises
% the sensor pointing + maneuver blocks of the spec schema.
function json = maneuverSpecJson()
json = ['{"version":1,"rev":1,"meta":{"name":"Maneuver Test",' ...
    '"epochUtc":"2026-07-05T00:00:00Z","durationSeconds":7200,"stepSeconds":60},' ...
    '"objects":[' ...
    '{"kind":"satellite","name":"Burner","propagator":"Keplerian","massKg":500,' ...
    '"sensor":{"coneHalfAngleDeg":10,"fieldOfRegardDeg":45,"slewRateDegPerSec":1,' ...
    '"pointing":"FixedVector","boresight":[0,0,-1]},' ...
    '"maneuvers":[' ...
    '{"name":"Raise","timeOffsetSec":1800,"frame":"TNW","deltaVmps":[25,0,0]},' ...
    '{"timeOffsetSec":3600,"frame":"Inertial","deltaVmps":[0,5,0]}],' ...
    '"orbit":{"type":"keplerian","semiMajorAxisKm":7000,"eccentricity":0.001,' ...
    '"inclinationDeg":51.6,"raanDeg":0,"argPerigeeDeg":0,"trueAnomalyDeg":0}}' ...
    ']}'];
end

function testBuildScenarioFromSpecWithManeuvers(testCase)
scenario = buildScenarioFromSpec(jsondecode(maneuverSpecJson()));
sat = scenario.Objects{1};
verifyEqual(testCase, numel(sat.Maneuvers), 2);

m1 = sat.Maneuvers{1};
verifyEqual(testCase, string(m1.Name), "Raise");
verifyEqual(testCase, m1.Time, ...
    datetime(2026, 7, 5, 0, 30, 0, "TimeZone", "UTC"));
verifyEqual(testCase, string(m1.Frame), "TNW");
verifyEqual(testCase, m1.DeltaVmps, [25 0 0]);

m2 = sat.Maneuvers{2};
verifyEqual(testCase, string(m2.Name), "Burner Maneuver 2");
verifyEqual(testCase, m2.Time, ...
    datetime(2026, 7, 5, 1, 0, 0, "TimeZone", "UTC"));
verifyEqual(testCase, string(m2.Frame), "Inertial");
verifyEqual(testCase, m2.DeltaVmps, [0 5 0]);
end

function testBuildScenarioFromSpecSensorPointing(testCase)
scenario = buildScenarioFromSpec(jsondecode(maneuverSpecJson()));
sensor = scenario.Objects{1}.Sensors{1};
verifyEqual(testCase, string(sensor.PointingMode), "FixedVector");
verifyEqual(testCase, string(sensor.BoresightFrame), "ECEF");
verifyEqual(testCase, sensor.BoresightVector, [0 0 -1]);
end

function testBuildScenarioFromSpecRejectsUnknownPointing(testCase)
spec = jsondecode(strrep(maneuverSpecJson(), ...
    '"pointing":"FixedVector"', '"pointing":"Sideways"'));
verifyError(testCase, @() buildScenarioFromSpec(spec), ...
    "buildScenarioFromSpec:UnknownPointingMode");
end

function testBuildScenarioFromSpecRejectsTleManeuvers(testCase)
json = ['{"version":1,"rev":1,"meta":{"name":"SGP4 Maneuver",' ...
    '"epochUtc":"2026-07-05T00:00:00Z","durationSeconds":3600,"stepSeconds":60},' ...
    '"objects":[' ...
    '{"kind":"satellite","name":"ISS","propagator":"TLE","massKg":420000,' ...
    '"maneuvers":[{"timeOffsetSec":600,"frame":"TNW","deltaVmps":[1,0,0]}],' ...
    '"orbit":{"type":"tle",' ...
    '"line1":"1 25544U 98067A   24183.51782528  .00016717  00000+0  30403-3 0  9995",' ...
    '"line2":"2 25544  51.6416 197.2432 0007782 103.9422 356.9484 15.49376197459965"}}' ...
    ']}'];
verifyError(testCase, @() buildScenarioFromSpec(jsondecode(json)), ...
    "buildScenarioFromSpec:ManeuversUnsupported");
end

function deleteIfExists(file)
if exist(file, "file")
    delete(file);
end
end
