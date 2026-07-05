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
end

function deleteIfExists(file)
if exist(file, "file")
    delete(file);
end
end
