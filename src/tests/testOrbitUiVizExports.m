function tests = testOrbitUiVizExports
%TESTORBITUIVIZEXPORTS Validate the web-UI Sun/orientation/pointing exports.
%
% The static console renders whatever these exports say, so this suite pins
% them against direct Orekit results at astronomically meaningful dates
% (equinox/solstice epochs catch frame, sign, longitude, and UTC errors) and
% against resolveSensorPointing for the scheduled-pointing timeline.
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

% ---- Sun geometry across the year ------------------------------------------

function testSubsolarPointAtEquinoxesAndSolstices(testCase)
% Epoch (near the 2026 event), expected subsolar latitude.
cases = {
    datetime(2026, 3, 20, 14, 45, 0, "TimeZone", "UTC"), 0.0, 0.6;
    datetime(2026, 6, 21, 8, 25, 0, "TimeZone", "UTC"), 23.44, 0.2;
    datetime(2026, 9, 23, 0, 5, 0, "TimeZone", "UTC"), 0.0, 0.6;
    datetime(2026, 12, 21, 20, 50, 0, "TimeZone", "UTC"), -23.44, 0.2};
for k = 1:size(cases, 1)
    viz = sunVizAt(cases{k, 1});
    latDeg = viz.sun.ephemeris.subsolarLatDeg(1);
    verifyEqual(testCase, latDeg, cases{k, 2}, "AbsTol", cases{k, 3}, ...
        "Subsolar latitude at " + string(cases{k, 1}));
end
end

function testSubsolarLongitudeTracksUtc(testCase)
% At ~12:00 UTC the Sun is over the Greenwich meridian give or take the
% equation of time (about +/-4 deg); at ~00:00 UTC it is near the
% antimeridian. Catches GMST sign/offset and longitude-convention errors.
noon = sunVizAt(datetime(2026, 7, 5, 12, 0, 0, "TimeZone", "UTC"));
verifyLessThan(testCase, abs(noon.sun.ephemeris.subsolarLonDeg(1)), 6);
midnight = sunVizAt(datetime(2026, 7, 5, 0, 0, 0, "TimeZone", "UTC"));
verifyGreaterThan(testCase, abs(midnight.sun.ephemeris.subsolarLonDeg(1)), 174);
end

function testSunVectorsMatchDirectOrekit(testCase)
epoch = datetime(2026, 3, 20, 12, 0, 0, "TimeZone", "UTC");
viz = sunVizAt(epoch);
eph = viz.sun.ephemeris;

% Unit vectors are unit.
verifyEqual(testCase, vecnorm(eph.ecefUnit, 2, 2), ...
    ones(numel(eph.tOffsetSec), 1), "AbsTol", 1e-6);
verifyEqual(testCase, vecnorm(eph.eciUnit, 2, 2), ...
    ones(numel(eph.tOffsetSec), 1), "AbsTol", 1e-6);

% Exported ECI direction equals the direct Orekit sun query.
direct = OrekitBodies.sunPositions(epoch, "GCRF");
directUnit = [direct.X_m, direct.Y_m, direct.Z_m];
directUnit = directUnit / norm(directUnit);
verifyEqual(testCase, eph.eciUnit(1, :), directUnit, "AbsTol", 1e-6);

% Exported ECEF direction equals the Orekit frame transform of the ECI sun
% (the UI never re-derives this; the export must already be consistent).
transformed = OrekitFrameTransform.gcrfToEcef(epoch, directUnit);
verifyEqual(testCase, eph.ecefUnit(1, :), transformed, "AbsTol", 1e-6);
end

function testEarthOrientationSeries(testCase)
epoch = datetime(2026, 6, 21, 0, 0, 0, "TimeZone", "UTC");
viz = sunVizAt(epoch);
eo = viz.earthOrientation;
gmst = eo.gmstRad;

% Continuous (unwrapped) and increasing at the sidereal rate.
verifyGreaterThan(testCase, min(diff(gmst)), 0);
rate = (gmst(end) - gmst(1)) / (eo.tOffsetSec(end) - eo.tOffsetSec(1));
verifyEqual(testCase, rate, 2 * pi / 86164.0905, "RelTol", 1e-4);

% Rz(gmst) maps ECEF into GCRF up to the (small) precession/nutation pole
% tilt - the same approximation both web UIs use to spin the globe.
eph = viz.sun.ephemeris;
for k = [1, numel(eo.tOffsetSec)]
    theta = mod(gmst(k), 2 * pi);
    rz = [cos(theta), -sin(theta), 0; sin(theta), cos(theta), 0; 0, 0, 1];
    rotated = (rz * eph.ecefUnit(k, :).').';
    angleErr = acos(min(max(dot(rotated, eph.eciUnit(k, :)), -1), 1));
    verifyLessThan(testCase, angleErr, deg2rad(0.5));
end
end

% ---- Pointing timeline -----------------------------------------------------

function testPointingTimelinePhasesAndBoresights(testCase)
[scenario, schedule] = scheduledScenario();
viz = exportPointingViz(scenario, schedule);
verifyEqual(testCase, numel(viz.pointing), 1);
series = viz.pointing{1};
verifyEqual(testCase, string(series.platform), "Sat One");
verifyEqual(testCase, string(series.sensor), "Imager");

% Unit boresights everywhere.
verifyEqual(testCase, vecnorm(series.boresightEcef, 2, 2), ...
    ones(numel(series.tOffsetSec), 1), "AbsTol", 1e-4);

% All phases appear: idle before, slew in, track, return, idle after.
phases = string(series.phase);
verifyTrue(testCase, all(ismember(["idle", "slew", "track", "return"], phases)));

% Track samples aim exactly where resolveSensorPointing aims.
scenario.SensorSchedule = schedule;
trackIdx = find(phases == "track");
mid = trackIdx(ceil(numel(trackIdx) / 2));
t = scenario.Config.Epoch + seconds(series.tOffsetSec(mid));
resolved = resolveSensorPointing(scenario, "Sat One", "Imager", t);
verifyEqual(testCase, series.boresightEcef(mid, :), resolved.BoresightEcef, ...
    "AbsTol", 1e-4);
verifyEqual(testCase, string(series.targetName(mid)), "Target One");
verifyTrue(testCase, isfinite(series.aimLatDeg(mid)));

% Slew is continuous: the first slew sample matches home pointing and each
% subsequent sample moves monotonically toward the acquisition direction
% (no snap at the task boundary).
slewIdx = find(phases == "slew");
verifyGreaterThan(testCase, numel(slewIdx), 1);
sensor = scenario.getObject("Sat One").getSensor("Imager");
tFirst = scenario.Config.Epoch + seconds(series.tOffsetSec(slewIdx(1)));
home = sensor.getBoresightVector(tFirst, scenario);
verifyGreaterThan(testCase, ...
    dot(series.boresightEcef(slewIdx(1), :), home), cosd(2));
acquired = resolveSensorPointing(scenario, "Sat One", "Imager", ...
    scenario.Config.Epoch + seconds(series.tOffsetSec(trackIdx(1))));
approach = series.boresightEcef(slewIdx, :) * acquired.BoresightEcef.';
verifyGreaterThan(testCase, min(diff(approach)), -1e-6, ...
    "Slew must approach the acquisition direction monotonically.");
verifyGreaterThan(testCase, approach(end), approach(1) + 0.01);

% Idle samples follow the home pointing mode (nadir here).
idleIdx = find(phases == "idle", 1);
tIdle = scenario.Config.Epoch + seconds(series.tOffsetSec(idleIdx));
homeIdle = sensor.getBoresightVector(tIdle, scenario);
verifyGreaterThan(testCase, ...
    dot(series.boresightEcef(idleIdx, :), homeIdle), cosd(1));
end

function testAreaScanPointingSweepsTheArea(testCase)
[scenario, schedule] = scheduledScenario("ScanAreaTarget");
viz = exportPointingViz(scenario, schedule);
series = viz.pointing{1};
phases = string(series.phase);
verifyTrue(testCase, any(phases == "scan"));
scanIdx = find(phases == "scan");
lats = series.aimLatDeg(scanIdx);
lons = series.aimLonDeg(scanIdx);
lats = lats(isfinite(lats));
lons = lons(isfinite(lons));
verifyGreaterThan(testCase, numel(lats), 5);
% The serpentine sweep moves across the area, not just its centroid.
verifyGreaterThan(testCase, max(lats) - min(lats), 0.5);
verifyGreaterThan(testCase, max(lons) - min(lons), 0.5);
end

function testScheduleVizExportsReturnSlew(testCase)
[scenario, schedule] = scheduledScenario();
viz = exportScheduleViz(scenario, schedule);
verifyEqual(testCase, numel(viz.schedule), 1);
entry = viz.schedule{1};
verifyTrue(testCase, isfield(entry, "returnSlewTimeSeconds"));
verifyGreaterThanOrEqual(testCase, entry.returnSlewTimeSeconds, 0);
verifyTrue(testCase, isfinite(entry.returnSlewTimeSeconds));
end

% ---- helpers -----------------------------------------------------------------

function viz = sunVizAt(epoch)
cfg = ScenarioConfig("Name", "Sun Export Test", "Epoch", epoch, ...
    "Duration", minutes(30), "TimeStep", seconds(300));
scenario = MissionScenario(cfg);
viz = exportSunViz(scenario);
end

function [scenario, schedule] = scheduledScenario(taskType)
if nargin < 1
    taskType = "TrackPointTarget";
end
epoch = datetime(2026, 7, 5, 0, 0, 0, "TimeZone", "UTC");
cfg = ScenarioConfig("Name", "Pointing Export Test", "Epoch", epoch, ...
    "Duration", minutes(20), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
satellite = SatelliteObject.fromKeplerian("Sat One", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat One", 12);
sensor.FieldOfRegardDeg = 60;
% A finite slew rate so the return-home phase has a real duration (an
% unlimited-rate sensor legitimately snaps home in zero seconds).
sensor.MaxSlewRateDegPerSec = 2;
satellite = satellite.addSensor(sensor);
scenario = scenario.addObject(satellite);
scenario = scenario.addObject(TargetObject("Target One", 10, 20, 0));
area = AreaTargetObject("Area One", [8; 8; 12; 12], [18; 22; 22; 18], 0);
scenario = scenario.addObject(area);
scenario = scenario.propagate();

% One hand-authored schedule row keeps the test deterministic (the real
% scheduler is covered elsewhere); times sit inside the scenario span.
if taskType == "ScanAreaTarget"
    targetName = "";
    areaName = "Area One";
else
    targetName = "Target One";
    areaName = "";
end
schedule = table( ...
    "task-1", "Test Task", string(taskType), "Imager", "Sat One", ...
    string(targetName), epoch + seconds(300), epoch + seconds(600), 300, 20, ...
    5, 0.9, string(areaName), true, ...
    'VariableNames', {'TaskID', 'TaskName', 'TaskType', 'SensorName', ...
    'PlatformName', 'TargetName', 'StartTime', 'StopTime', ...
    'DurationSeconds', 'SlewTimeSeconds', 'Priority', 'QualityScore', ...
    'AreaTargetName', 'Scheduled'});
end
