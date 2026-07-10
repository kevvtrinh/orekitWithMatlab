%% Example 17: fast satellite-to-ground look vectors
%
% Computes the vector from one LEO satellite to many ground points at
% every scenario time step, as fast as possible:
%   * Orekit is only sampled at coarse nodes (default every 60 s) and the
%     fine grid is filled by cubic Hermite interpolation - sub-meter
%     accurate for a smooth orbit, and ~60x less Java bridge traffic
%     (the measured max error is reported in result.Info),
%   * all N-by-M vector geometry is a single vectorized MATLAB pass -
%     no Java calls and no loop over time.
% Very large exact-mode runs ("PropagationStepSeconds", 0) can still be
% split across a process-based parallel pool via "UseParallel", true.
%
% Also demonstrates the imported-ECEF mode, which skips Orekit entirely.
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

%% Scenario: 24 hours at 1 second -> 86,401 time samples
cfg = ScenarioConfig();
cfg.Name = "Fast look vector demo";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(1);

sat = SatelliteObject.fromKeplerian("Sat-1", 6878e3, 0.001, 51.6, 40, 0, 0);

% Ground points: M-by-3 [latDeg lonDeg altMeters]. A cell array of
% GroundStationObject / PlaceObject instances works here too.
groundPoints = [ ...
    39.7392  -104.9903  1609;   % Denver
    64.8378  -147.7164   136;   % Fairbanks
    -33.8688   151.2093    58;   % Sydney
    78.2306    15.3894   458;   % Svalbard
    0.3476    32.5825  1155;   % Kampala
    -53.1638   -70.9171    34];  % Punta Arenas

%% Mode A: Orekit propagation with coarse-node interpolation (the default)
result = computeSatToGroundVectors(sat, groundPoints, cfg);

fprintf("\n=== Orekit propagation mode ===\n");
fprintf("%d time samples x %d ground points = %s look vectors\n", ...
    result.Info.NumTimeSamples, result.Info.NumGroundPoints, ...
    string(result.Info.NumTimeSamples * result.Info.NumGroundPoints));
fprintf("Propagation: %.2f s (%d Orekit samples for %d grid points)\n", ...
    result.Info.PropagationSeconds, result.Info.NumOrekitSamples, ...
    result.Info.NumTimeSamples);
if result.Info.Interpolated
    fprintf("Interpolation spot-check max error: %.3f m\n", ...
        result.Info.InterpolationMaxCheckedErrorMeters);
end
fprintf("Vector geometry (all of it): %.3f s\n", result.Info.GeometrySeconds);
fprintf("Total: %.2f s\n\n", result.Info.TotalSeconds);

for j = 1:size(groundPoints, 1)
    fprintf("%-12s min range %8.1f km, max elevation %6.1f deg\n", ...
        result.GroundNames(j), min(result.RangeMeters(:, j)) / 1000, ...
        max(result.ElevationDeg(:, j)));
end

% The look vector from the satellite to Denver at the first time step:
lookToDenver = squeeze(result.LookEcefMeters(1, :, 1));
fprintf("\nSat -> Denver at epoch [m]: [%.1f %.1f %.1f]\n", lookToDenver);

%% Body-frame look vectors
% Same pipeline, plus every look vector expressed in the satellite BODY
% frame. Attitude is LVLH_CCSDS by default (+Z nadir, +X ~ velocity;
% identical to Orekit's VVLH) and is built from ECEF state in pure
% MATLAB - no extra Java beyond fetching velocity alongside position.
resultBody = computeSatToGroundVectors(sat, groundPoints, cfg, "BodyFrame", true);

fprintf("\n=== Body frame ===\n");
fprintf("Attitude: %s, conversion time: %.3f s\n", ...
    resultBody.Info.AttitudeMode, resultBody.Info.BodyFrameSeconds);

% Sanity: at each ground point's closest approach the look vector should
% be dominated by +Z body (near-nadir for a nadir-pointing satellite).
[~, kMin] = min(resultBody.RangeMeters(:, 1));
lookBodyDenver = squeeze(resultBody.LookBodyMeters(kMin, :, 1));
fprintf("Sat -> Denver at closest approach, body frame [m]: [%.1f %.1f %.1f]\n", ...
    lookBodyDenver);

% Real ADCS attitude instead of LVLH? Supply N-by-4 quaternions
% ([w x y z], Hamilton, ECEF->body) - velocity is then not needed at all:
%   resultBody = computeSatToGroundVectors(sat, groundPoints, cfg, ...
%       "BodyFrame", true, "AttitudeQuaternions", myQuats);
% Imported ECEF with exact attitude: pass velocity as a third cell:
%   resultBody = computeSatToGroundVectors({t, posEcef, velEcef}, ...
%       groundPoints, [], "BodyFrame", true);

%% Mode B: imported ECEF (no Orekit involved)
% Any N-by-3 ECEF source works; here we feed back the positions from Mode
% A and confirm the geometry is bit-identical.
imported = computeSatToGroundVectors({result.Time, result.SatEcefMeters}, groundPoints);
fprintf("\n=== Imported ECEF mode ===\n");
fprintf("Geometry-only time: %.3f s\n", imported.Info.TotalSeconds);
fprintf("Max difference vs Mode A: %g m\n", ...
    max(abs(imported.LookEcefMeters(:) - result.LookEcefMeters(:))));

% From a CSV written by exportEphemeris (contains ECEF_X_m columns):
%   ephemeris = readtable("exports/ephemeris/Sat_1_ephemeris.csv");
%   ephemeris.Time = datetime(ephemeris.Time, "TimeZone", "UTC");
%   imported = computeSatToGroundVectors(ephemeris, groundPoints);

%% Optional: interpolated vs exact per-sample comparison
% Exact mode is the pre-interpolation behavior: one Orekit call per grid
% point (86,401 here instead of ~1,441). Useful as a ground-truth check;
% pair it with "UseParallel", true to spread the Java calls over a
% process pool.
compareExact = false;
if compareExact
    exactResult = computeSatToGroundVectors(sat, groundPoints, cfg, ...
        "PropagationStepSeconds", 0); %#ok<UNRCH>
    fprintf("\nExact propagation: %.2f s vs interpolated %.2f s (%.1fx); " + ...
        "max position difference %.3f m\n", ...
        exactResult.Info.PropagationSeconds, result.Info.PropagationSeconds, ...
        exactResult.Info.PropagationSeconds / result.Info.PropagationSeconds, ...
        max(vecnorm(exactResult.SatEcefMeters - result.SatEcefMeters, 2, 2)));
end
