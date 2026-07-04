%% debug_sensor_access_no_windows.m
% Reproduces and diagnoses "sensor access returns no windows" for a 30-day
% scenario with a satellite sensor and a fixed ground target.
%
% Root cause found in this investigation (2026-07): TEMPORAL ALIASING plus
% nearest-sample geometry. A 20 deg half-angle LEO sensor keeps a ground
% point in view for only ~60-90 s per overpass. With the coarse scenario
% time steps typically used for 30-day runs (>= 5-10 min), every pass falls
% BETWEEN access samples, so the access logical never goes true even though
% the ground track crosses the target. The fixes applied to the backend:
%   1. computeSensorAccess now accepts options.TimeStepSeconds to sample
%      access on a dense grid independent of the scenario step.
%   2. SatelliteObject.getECEF/getECEFMatrix interpolate between ephemeris
%      samples (previously nearest-sample, which quantized geometry to the
%      propagation grid and made dense sampling impossible).
%   3. computeSensorAccess is vectorized (a 30-day run used to take minutes
%      because of per-step nearest-neighbor searches over the ephemeris).
%   4. VelocityVector pointing now uses the Earth-fixed velocity direction
%      (it previously used the inertial GCRF velocity in ECEF math).
%   5. A computeSensorAccess:NoWindows warning now reports the closest
%      off-boresight approach and flags coarse-step aliasing.
%
% Run from the repository root:  debug_sensor_access_no_windows

startupOrekitSuite();

%% 1) Scenario setup - EDIT THIS BLOCK to match your failing case
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
scenarioStep = seconds(600);          % coarse step, typical for 30-day runs
denseStepSeconds = 10;                % dense access-sampling step
cfg = ScenarioConfig("Name", "Sensor Access Debug", "Epoch", epoch, ...
    "Duration", days(30), "TimeStep", scenarioStep);
scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Imager", "Sat-1", 20);   % 20 deg FOV cone
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = 60;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);

target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);
scenario = scenario.addObject(target);

%% 2) Checklist: attachment, object list, target definition, timing
fprintf("\n=== Setup checks ===\n");
satCheck = scenario.getObject("Sat-1");
fprintf("[1] Sensor attached to Sat-1: %s\n", string(satCheck.hasSensor("Imager")));
disp(satCheck.listSensors());
fprintf("[2] Scenario object list:\n");
disp(scenario.listObjects());
fprintf("[3] Target: lat %.4f deg, lon %.4f deg (negative = West), alt %.0f m, frame: geodetic WGS84\n", ...
    target.LatitudeDeg, target.LongitudeDeg, target.AltitudeMeters);
fprintf("[20/21] Lat/lon are degrees, altitude is meters by suite convention.\n");
timeVector = cfg.getTimeVector();
fprintf("[4] Epoch %s -> stop %s, step %.0f s, %d samples\n", ...
    string(cfg.Epoch), string(cfg.getStopTime()), seconds(cfg.TimeStep), numel(timeVector));

%% 3) Propagate and verify ephemeris coverage (checks 5-7)
scenario = scenario.propagate();
sat = scenario.getObject("Sat-1");
eph = sat.Ephemeris;
fprintf("\n=== Propagation checks ===\n");
fprintf("[5] IsPropagated: %s, ephemeris rows: %d\n", string(sat.IsPropagated), height(eph));
fprintf("[6] Ephemeris span: %s -> %s (scenario stop %s)\n", ...
    string(eph.Time(1)), string(eph.Time(end)), string(cfg.getStopTime()));
assert(eph.Time(1) <= cfg.Epoch && eph.Time(end) >= cfg.getStopTime() - seconds(1), ...
    "Ephemeris does not cover the scenario span.");
fprintf("[7] ECEF at epoch (km): [%.1f %.1f %.1f]\n", sat.getECEF(cfg.Epoch) / 1000);
fprintf("[17] Ephemeris time zone: %s (Orekit conversions are UTC-based)\n", eph.Time.TimeZone);

%% 4) Access on the scenario grid vs a dense grid (checks 8, 14-16, 22)
fprintf("\n=== Access computation ===\n");
fprintf("[22/8] Using computeSensorAccess (sensor-to-target API, sensor object resolved by name).\n");
coarse = computeSensorAccess(scenario, "Sat-1", "Imager", "Denver Target");
fprintf("Coarse grid (%.0f s step): %d access samples, %d windows\n", ...
    seconds(cfg.TimeStep), sum(coarse.AccessLogical), height(coarse.AccessWindows));

dense = computeSensorAccess(scenario, "Sat-1", "Imager", "Denver Target", ...
    struct("TimeStepSeconds", denseStepSeconds));
fprintf("Dense grid (%d s step): %d access samples, %d windows, total %.1f min\n", ...
    denseStepSeconds, sum(dense.AccessLogical), height(dense.AccessWindows), ...
    dense.Duration / 60);
if height(dense.AccessWindows) > 0
    disp(dense.AccessWindows(1:min(8, height(dense.AccessWindows)), :));
end

%% 5) Constraint breakdown (checks 9-14)
fprintf("\n=== Constraint breakdown (dense grid) ===\n");
cs = dense.ConstraintStatus;
constraintNames = ["LineOfSightOK", "EarthObstructionOK", "FieldOfViewOK", ...
    "RangeOK", "ElevationOK", "AvailabilityOK", "SlewOK"];
for name = constraintNames
    fprintf("  %-20s passes %7d / %d samples\n", name, sum(cs.(name)), height(cs));
end
fprintf("[9] Boresight body vector: [%g %g %g], FOV type %s, cone half-angle %.1f deg, FOR %.1f deg\n", ...
    sensor.BoresightVector, sensor.FieldOfViewType, ...
    sensor.effectiveConeHalfAngleDeg(), sensor.FieldOfRegardDeg);
fprintf("[11] Pointing mode: %s (nadir-pointing => boresight = -satellite position)\n", ...
    sensor.PointingMode);
fprintf("[14] Constraint settings: MinEl %.1f deg, range [%.0f, %g] km, availability windows: %d\n", ...
    sensor.MinElevationDeg, sensor.MinRangeKm, sensor.MaxRangeKm, ...
    height(sensor.AvailabilityWindows));

%% 6) Closest-pass diagnostics (debug outputs requested)
fprintf("\n=== Closest passes (dense grid) ===\n");
tDense = dense.TimeVector;
satEcef = sat.getECEFMatrix(tDense);
satLatDeg = asind(satEcef(:, 3) ./ sqrt(sum(satEcef.^2, 2)));
satLonDeg = atan2d(satEcef(:, 2), satEcef(:, 1));
satAltKm = (sqrt(sum(satEcef.^2, 2)) - 6378137) / 1000;
offNadirDeg = acosd(max(min(sum((-satEcef ./ sqrt(sum(satEcef.^2, 2))) .* ...
    ((repmat(target.getECEF(), numel(tDense), 1) - satEcef) ./ ...
    max(sqrt(sum((repmat(target.getECEF(), numel(tDense), 1) - satEcef).^2, 2)), eps)), 2), 1), -1));

% Local minima of the boresight-to-target angle = pass centers.
angle = dense.OffBoresightAngleDeg;
isMin = [false; angle(2:end-1) < angle(1:end-2) & angle(2:end-1) < angle(3:end); false];
minIdx = find(isMin);
[~, order] = sort(angle(minIdx));
bestIdx = minIdx(order(1:min(5, numel(order))));

for k = bestIdx.'
    fprintf(['%s | sat %7.2f deg, %8.2f deg, %6.1f km | tgt %7.2f, %8.2f | ' ...
        'range %7.1f km | elev %6.2f | off-nadir %6.2f | boresight-angle %6.2f ' ...
        '(FOV %.0f, FOR %.0f)\n'], ...
        string(tDense(k)), satLatDeg(k), satLonDeg(k), satAltKm(k), ...
        target.LatitudeDeg, target.LongitudeDeg, dense.RangeKm(k), ...
        dense.ElevationDeg(k), offNadirDeg(k), angle(k), ...
        sensor.effectiveConeHalfAngleDeg(), sensor.FieldOfRegardDeg);
    fprintf("    constraints: LOS %d, FOV %d, Range %d, Elev %d, Avail %d, final %d\n", ...
        cs.LineOfSightOK(k), cs.FieldOfViewOK(k), cs.RangeOK(k), ...
        cs.ElevationOK(k), cs.AvailabilityOK(k), cs.FinalAccess(k));
end

%% 7) Diagnostic plots
figure("Name", "Debug: ground track and target");
ax = axes(); hold(ax, "on");
plotGroundTrack(scenario, "Sat-1", ax);
scatter(ax, target.LongitudeDeg, target.LatitudeDeg, 90, "p", "filled", ...
    "MarkerFaceColor", [0.75 0.1 0.1]);
title(ax, "Ground track with target");

figure("Name", "Debug: geometry vs time");
layout = tiledlayout(4, 1, "TileSpacing", "compact");
ax1 = nexttile(layout);
plot(ax1, tDense, dense.RangeKm); ylabel(ax1, "Range (km)"); grid(ax1, "on");
ax2 = nexttile(layout);
plot(ax2, tDense, dense.ElevationDeg); yline(ax2, sensor.MinElevationDeg, "--r");
ylabel(ax2, "Elevation (deg)"); grid(ax2, "on");
ax3 = nexttile(layout);
plot(ax3, tDense, angle);
yline(ax3, sensor.effectiveConeHalfAngleDeg(), "--r", "FOV");
yline(ax3, sensor.FieldOfRegardDeg, "--b", "FOR");
ylabel(ax3, "Boresight-to-target (deg)"); grid(ax3, "on");
ax4 = nexttile(layout);
stairs(ax4, tDense, double(dense.AccessLogical)); ylim(ax4, [-0.1 1.1]);
ylabel(ax4, "Access"); grid(ax4, "on");
linkaxes([ax1 ax2 ax3 ax4], "x");

figure("Name", "Debug: off-nadir angle");
plot(tDense, offNadirDeg); hold on;
yline(sensor.effectiveConeHalfAngleDeg(), "--r", "FOV");
yline(sensor.FieldOfRegardDeg, "--b", "FOR");
ylabel("Off-nadir angle to target (deg)"); grid on;

%% 8) Verdict
fprintf("\n=== Verdict ===\n");
if ~any(coarse.AccessLogical) && any(dense.AccessLogical)
    fprintf(['CAUSE: temporal aliasing. Passes last ~%.0f s but the scenario step is %.0f s,\n' ...
        'so the coarse access grid skips over every pass. The geometry, target, frames,\n' ...
        'and constraints are all correct - use options.TimeStepSeconds (dense grid found\n' ...
        '%d windows), or shorten the scenario TimeStep.\n'], ...
        max(dense.AccessWindows.DurationSeconds), seconds(cfg.TimeStep), ...
        height(dense.AccessWindows));
elseif ~any(dense.AccessLogical)
    [minAngle, atIdx] = min(angle);
    fprintf(['CAUSE: geometry/constraints. Even densely sampled, the closest boresight\n' ...
        'approach is %.1f deg (FOV limit %.1f deg) at %s. Check pointing mode, cone\n' ...
        'half-angle, or the constraint breakdown above.\n'], ...
        minAngle, sensor.effectiveConeHalfAngleDeg(), string(tDense(atIdx)));
else
    fprintf("Access found on both grids - if your scenario still shows none, compare\n");
    fprintf("your sensor/target settings against this script's setup block.\n");
end
