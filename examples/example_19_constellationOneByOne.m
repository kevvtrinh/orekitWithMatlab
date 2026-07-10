%% Example 19: constellation look vectors, one satellite at a time
%
% The baseline for example 20's comparison: the same four co-planar
% satellites as example 18, each propagated independently through
% computeSatToGroundVectors (which itself uses coarse-node Hermite
% interpolation - this is the fast SINGLE-satellite path, just without
% any sharing between satellites).
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "One-by-one demo";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(1);

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

oneByOne = cell(numel(sats), 1);
totalTimer = tic;
totalOrekitSamples = 0;
for k = 1:numel(sats)
    oneByOne{k} = computeSatToGroundVectors(sats{k}, groundPoints, cfg, ...
        "BodyFrame", true);
    totalOrekitSamples = totalOrekitSamples + oneByOne{k}.Info.NumOrekitSamples;
end
elapsed = toc(totalTimer);

fprintf("\n=== One-by-one propagation ===\n");
fprintf("%d satellites x %d time samples, %d Orekit samples total\n", ...
    numel(sats), oneByOne{1}.Info.NumTimeSamples, totalOrekitSamples);
fprintf("Total: %.2f s\n\n", elapsed);

for k = 1:numel(sats)
    r = oneByOne{k};
    fprintf("%-6s propagation %.2f s  interp check %.3f m  min range %8.1f km\n", ...
        string(sats{k}.Name), r.Info.PropagationSeconds, ...
        r.Info.InterpolationMaxCheckedErrorMeters, ...
        min(r.RangeMeters(:)) / 1000);
end
