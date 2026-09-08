function tests = testOrbitUiAnalysisExports
%TESTORBITUIANALYSISEXPORTS Backend report values and JSON transport contract.
tests = functiontests(localfunctions);
end

function setupOnce(testCase)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
cfg = ScenarioConfig("Duration", minutes(10), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Report Sat", 7200e3, 0.02, 63.4, 40, 30, 15));
testCase.TestData.scenario = scenario.propagate();
end

function testOrbitalAndBetaHistoriesMatchBackend(testCase)
scenario = testCase.TestData.scenario;
viz = exportAnalysisViz(scenario);
verifyEqual(testCase, numel(viz.analysis.satellites), 1);
entry = viz.analysis.satellites{1};
elements = computeOrbitalElements(scenario, "Report Sat");
beta = computeBetaAngle(scenario, "Report Sat");

verifyEqual(testCase, entry.satellite, "Report Sat");
verifyEqual(testCase, entry.frame, "GCRF");
verifyEmpty(testCase, fieldnames(entry.errors));
verifyEqual(testCase, cell2mat(entry.tOffsetSec), ...
    seconds(elements.Time - scenario.Config.Epoch));
verifyEqual(testCase, cell2mat(entry.orbitalElements.semiMajorAxisKm), ...
    elements.SemiMajorAxisMeters / 1000, "AbsTol", 1e-9);
verifyEqual(testCase, entry.orbitalElements.semiMajorAxisKm{1}, 7200, "AbsTol", 1e-6);
verifyEqual(testCase, entry.orbitalElements.eccentricity{1}, 0.02, "AbsTol", 1e-9);
verifyEqual(testCase, entry.orbitalElements.inclinationDeg{1}, 63.4, "AbsTol", 1e-9);

fields = ["eccentricity", "inclinationDeg", "raanDeg", "argPerigeeDeg", ...
    "trueAnomalyDeg", "periodMinutes", "apogeeAltKm", "perigeeAltKm"];
columns = ["Eccentricity", "InclinationDeg", "RAANDeg", "ArgPerigeeDeg", ...
    "TrueAnomalyDeg", "PeriodMinutes", "ApogeeAltKm", "PerigeeAltKm"];
for k = 1:numel(fields)
    verifyEqual(testCase, cell2mat(entry.orbitalElements.(fields(k))), ...
        elements.(columns(k)), "AbsTol", 1e-9);
end
verifyEqual(testCase, string(entry.orbitalElements.angleConvention), elements.AngleConvention);
verifyEqual(testCase, cell2mat(entry.betaAngleDeg), beta.BetaAngleDeg, "AbsTol", 1e-12);
end

function testStoredEphemerisGridIsPreserved(testCase)
scenario = testCase.TestData.scenario;
satellite = scenario.getObject("Report Sat");
satellite.Ephemeris = satellite.Ephemeris([2 4 8], :);
scenario = scenario.updateObject(satellite);
viz = exportAnalysisViz(scenario);
entry = viz.analysis.satellites{1};
verifyEqual(testCase, cell2mat(entry.tOffsetSec), [60; 180; 420]);
verifyEqual(testCase, numel(entry.betaAngleDeg), 3);
verifyEqual(testCase, numel(entry.orbitalElements.trueAnomalyDeg), 3);
end

function testManeuveredHistoryShowsChangedOrbit(testCase)
cfg = ScenarioConfig("Duration", minutes(20), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
satellite = SatelliteObject.fromKeplerian("Burner", 7000e3, 0.01, 51.6, 0, 0, 0);
satellite = satellite.addManeuver(ImpulsiveManeuver( ...
    "Raise", cfg.Epoch + minutes(10), "TNW", [100 0 0]));
scenario = scenario.addObject(satellite);
scenario = scenario.propagate();
viz = exportAnalysisViz(scenario);
history = cell2mat(viz.analysis.satellites{1}.orbitalElements.semiMajorAxisKm);
direct = computeOrbitalElements(scenario, "Burner");
verifyEqual(testCase, history, direct.SemiMajorAxisMeters / 1000, "AbsTol", 1e-9);
verifyGreaterThan(testCase, history(end) - history(2), 50);
end

function testSingletonHistoriesEncodeAsArrays(testCase)
scenario = stateScenario([7000e3 0 0 0 sqrt(3.986004418e14 / 7000e3) 0], 12.25);
viz = exportAnalysisViz(scenario);
text = string(jsonencode(viz));
verifyTrue(testCase, contains(text, '"satellites":['));
verifyTrue(testCase, contains(text, '"tOffsetSec":[12.25]'));
verifyTrue(testCase, contains(text, '"semiMajorAxisKm":['));
verifyTrue(testCase, contains(text, '"betaAngleDeg":['));
verifyTrue(testCase, contains(text, '"angleConvention":["CircularEquatorial"]'));

sunViz = exportSunViz(scenario);
sunText = string(jsonencode(sunViz));
verifyTrue(testCase, contains(sunText, '"tOffsetSec":[12.25]'));
verifyTrue(testCase, contains(sunText, '"lightingState":['));
verifyEqual(testCase, numel(sunViz.sun.eclipses{1}.lightingState), 1);
end

function testEmptyAndUnpropagatedSatellites(testCase)
scenario = MissionScenario(ScenarioConfig("Duration", minutes(1)));
scenario = scenario.addObject(GroundStationObject("Ground", 0, 0, 0, 0));
viz = exportAnalysisViz(scenario);
verifyEmpty(testCase, viz.analysis.satellites);
verifyEqual(testCase, string(jsonencode(viz)), string('{"analysis":{"satellites":[]}}'));
scenario = scenario.addObject(SatelliteObject.fromKeplerian( ...
    "Pending", 7000e3, 0.01, 20, 0, 0, 0));
viz = exportAnalysisViz(scenario);
verifyEmpty(testCase, viz.analysis.satellites);
end

function testUnboundQuantitiesEncodeAsNull(testCase)
scenario = stateScenario([7000e3 0 0 0 12000 0], 0);
viz = exportAnalysisViz(scenario);
orbit = viz.analysis.satellites{1}.orbitalElements;
verifyEqual(testCase, orbit.periodMinutes{1}, Inf);
verifyEqual(testCase, orbit.apogeeAltKm{1}, Inf);
verifyTrue(testCase, isfinite(orbit.perigeeAltKm{1}));
text = string(jsonencode(viz));
verifyTrue(testCase, contains(text, '"periodMinutes":[null]'));
verifyTrue(testCase, contains(text, '"apogeeAltKm":[null]'));
end

function testFailedReportsPreserveOtherSatellites(testCase)
% Numerically unresolved angular momentum is unavailable in both reports,
% and must not suppress another satellite's valid histories.
scenario = stateScenario([7000e3 0 0 1000 1e-13 0], 0);
verifyError(testCase, @() computeBetaAngle(scenario, "Imported"), ...
    "computeBetaAngle:DegenerateState");
healthy = testCase.TestData.scenario.getObject("Report Sat");
scenario = scenario.addObject(healthy);
viz = exportAnalysisViz(scenario);
verifyEqual(testCase, numel(viz.analysis.satellites), 2);
entry = viz.analysis.satellites{1};
verifyTrue(testCase, isfield(entry.errors, "orbitalElements"));
verifyNotEmpty(testCase, entry.errors.orbitalElements);
verifyEmpty(testCase, fieldnames(entry.orbitalElements));
verifyTrue(testCase, isfield(entry.errors, "betaAngle"));
verifyEmpty(testCase, entry.betaAngleDeg);
verifyEmpty(testCase, fieldnames(viz.analysis.satellites{2}.errors));
end

function testRadialStateHasNoDefinedOrbitNormal(testCase)
scenario = stateScenario([7000e3 0 0 1000 0 0], 0);
verifyError(testCase, @() computeBetaAngle(scenario, "Imported"), ...
    "computeBetaAngle:DegenerateState");
viz = exportAnalysisViz(scenario);
entry = viz.analysis.satellites{1};
verifyTrue(testCase, isfield(entry.errors, "orbitalElements"));
verifyTrue(testCase, isfield(entry.errors, "betaAngle"));
verifyEmpty(testCase, fieldnames(entry.orbitalElements));
verifyEmpty(testCase, entry.betaAngleDeg);
verifyTrue(testCase, contains(string(jsonencode(viz)), '"betaAngleDeg":[]'));
end

function testLightingHistoryMatchesEclipseSamples(testCase)
scenario = testCase.TestData.scenario;
viz = exportSunViz(scenario);
entry = viz.sun.eclipses{1};
direct = computeEclipse(scenario, "Report Sat");
verifyEqual(testCase, cell2mat(entry.tOffsetSec), ...
    seconds(direct.TimeVector - scenario.Config.Epoch));
verifyEqual(testCase, string(entry.lightingState), direct.LightingState);
verifyEqual(testCase, entry.sunlitFractionPercent, round(direct.SunlitFractionPercent, 1));
end

function testScenarioRunIncludesAnalysisInWrittenPayload(testCase)
spec = struct("version", 1);
spec.meta = struct("name", "Reports Integration", ...
    "epochUtc", "2026-01-01T00:00:00Z", "durationSeconds", 60, "stepSeconds", 30);
spec.objects = {struct("kind", "satellite", "name", "Web Sat", ...
    "propagator", "Keplerian", "orbit", struct("type", "keplerian", ...
    "semiMajorAxisKm", 7000, "eccentricity", 0.01, "inclinationDeg", 51.6, ...
    "raanDeg", 40, "argPerigeeDeg", 30, "trueAnomalyDeg", 0))};
specFile = string(tempname) + ".json";
outputFile = string(tempname) + ".json";
cleanup = onCleanup(@() deleteFiles({specFile, outputFile})); %#ok<NASGU>
writelines(jsonencode(spec), specFile);
payload = orbitUiRunScenario(specFile, outputFile);
verifyEqual(testCase, payload.analysis.satellites{1}.satellite, "Web Sat");
written = jsondecode(fileread(outputFile));
verifyEqual(testCase, string(written.analysis.satellites.satellite), "Web Sat");
verifyEqual(testCase, written.analysis.satellites.tOffsetSec, [0; 30; 60]);
verifyEqual(testCase, numel(written.sun.eclipses.lightingState), 3);
end

function scenario = stateScenario(state, offsetSeconds)
epoch = datetime(2026, 1, 1, "TimeZone", "UTC");
ephemeris = array2table(state, 'VariableNames', ...
    {'X_m', 'Y_m', 'Z_m', 'VX_mps', 'VY_mps', 'VZ_mps'});
ephemeris.Time = epoch + seconds(offsetSeconds);
satellite = SatelliteObject.fromEphemeris("Imported", ephemeris);
satellite.Ephemeris = ephemeris;
scenario = MissionScenario(ScenarioConfig("Epoch", epoch, "Duration", minutes(2)));
scenario = scenario.addObject(satellite);
end

function deleteFiles(files)
for k = 1:numel(files)
    if isfile(files{k})
        delete(files{k});
    end
end
end
