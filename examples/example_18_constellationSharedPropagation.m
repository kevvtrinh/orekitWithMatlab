%% Example 18: shared propagation for a co-planar constellation
%
% Four satellites evenly phased on ONE orbital plane are the same
% two-body trajectory with a time offset, so only the first satellite is
% actually propagated with Orekit. The other three tracks come from the
% shared Hermite interpolant, time-shifted by their phase offset and
% rotated about the pole to undo the extra Earth spin. Every satellite is
% spot-checked against its own exact Orekit propagation.
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Shared plane demo";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(1);

% Same a/e/i/RAAN/argPerigee, true anomaly 90 deg apart.
sats = { ...
    SatelliteObject.fromKeplerian("Sat-1", 6878e3, 0.001, 51.6, 40, 0, 0), ...
    SatelliteObject.fromKeplerian("Sat-2", 6878e3, 0.001, 51.6, 40, 0, 90), ...
    SatelliteObject.fromKeplerian("Sat-3", 6878e3, 0.001, 51.6, 40, 0, 180), ...
    SatelliteObject.fromKeplerian("Sat-4", 6878e3, 0.001, 51.6, 40, 0, 270)};

groundPoints = [ ...
    39.7392  -104.9903  1609;   % Denver
    64.8378  -147.7164   136;   % Fairbanks
    -33.8688   151.2093    58;   % Sydney
    78.2306    15.3894   458;   % Svalbard
    0.3476    32.5825  1155;   % Kampala
    -53.1638   -70.9171    34];  % Punta Arenas

results = computeConstellationToGroundVectors(sats, groundPoints, cfg, ...
    "BodyFrame", true);

fprintf("\n=== Shared-plane propagation ===\n");
fprintf("%d satellites x %d time samples, %d Orekit samples total\n", ...
    results.Info.NumSatellites, results.Info.NumTimeSamples, ...
    results.Info.NumOrekitSamples);
fprintf("Propagation + sharing: %.2f s, total %.2f s\n\n", ...
    results.Info.PropagationSeconds, results.Info.TotalSeconds);

for k = 1:numel(results.Satellites)
    r = results.Satellites{k};
    fprintf("%-6s mode %-16s dt %+8.1f s  spot-check %.3f m  min range %8.1f km\n", ...
        results.Names(k), results.Info.SatelliteMode(k), ...
        results.Info.DeltaTSeconds(k), ...
        results.Info.SpotCheckMaxErrorMeters(k), ...
        min(r.RangeMeters(:)) / 1000);
end

% Each element of results.Satellites has the full single-satellite result:
% LookEcefMeters (N-by-3-by-M), RangeMeters, ElevationDeg, LookBodyMeters...
lookSat3ToDenver = squeeze(results.Satellites{3}.LookEcefMeters(1, :, 1));
fprintf("\nSat-3 -> Denver at epoch [m]: [%.1f %.1f %.1f]\n", lookSat3ToDenver);
