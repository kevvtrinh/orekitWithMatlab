%% Example 20: shared-plane vs one-by-one constellation propagation
%
% Runs the same 4-satellite, single-plane, 24 h @ 1 s scenario both ways:
%   A. one-by-one   - computeSatToGroundVectors per satellite (example 19)
%   B. shared-plane - computeConstellationToGroundVectors, which
%                     propagates ONE reference satellite and phase-shifts
%                     the siblings (example 18)
% then compares wall time, Orekit sample counts, and the full-grid
% agreement of every output array. Both methods also carry their own
% built-in spot-checks against exact Orekit propagation, so the table
% shows each method's true error, not just their mutual agreement.
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Constellation method comparison";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(1);

sats = { ...
    SatelliteObject.fromKeplerian("Sat-1", 6878e3, 0.001, 51.6, 40, 0, 0), ...
    SatelliteObject.fromKeplerian("Sat-2", 6878e3, 0.001, 51.6, 40, 0, 90), ...
    SatelliteObject.fromKeplerian("Sat-3", 6878e3, 0.001, 51.6, 40, 0, 180), ...
    SatelliteObject.fromKeplerian("Sat-4", 6878e3, 0.001, 51.6, 40, 0, 270)};
numSats = numel(sats);

groundPoints = [ ...
    39.7392  -104.9903  1609;   % Denver
    64.8378  -147.7164   136;   % Fairbanks
    -33.8688   151.2093    58;   % Sydney
    78.2306    15.3894   458;   % Svalbard
    0.3476    32.5825  1155;   % Kampala
    -53.1638   -70.9171    34];  % Punta Arenas

% Warmup: absorb the one-time Java/EOP initialization so the timed runs
% below are warm-vs-warm.
warmCfg = ScenarioConfig();
warmCfg.Epoch = cfg.Epoch;
warmCfg.Duration = minutes(3);
warmCfg.TimeStep = seconds(1);
computeSatToGroundVectors(sats{1}, groundPoints, warmCfg, "UseParallel", false);

% --- Method A: one satellite at a time ---
timerA = tic;
oneByOne = cell(numSats, 1);
samplesA = 0;
for k = 1:numSats
    oneByOne{k} = computeSatToGroundVectors(sats{k}, groundPoints, cfg, ...
        "BodyFrame", true);
    samplesA = samplesA + oneByOne{k}.Info.NumOrekitSamples;
end
timeA = toc(timerA);

% --- Method B: shared-plane propagation ---
timerB = tic;
shared = computeConstellationToGroundVectors(sats, groundPoints, cfg, ...
    "BodyFrame", true);
timeB = toc(timerB);
samplesB = shared.Info.NumOrekitSamples;

% --- Full-grid agreement between the methods, per satellite ---
fprintf("\n=== Shared-plane vs one-by-one (%d sats, %d samples, %d targets) ===\n", ...
    numSats, oneByOne{1}.Info.NumTimeSamples, size(groundPoints, 1));
fprintf("%-6s %-12s %13s %13s %15s %18s\n", "Sat", "mode", ...
    "pos diff [m]", "look diff [m]", "body diff [m]", "exact-check A/B [m]");
for k = 1:numSats
    a = oneByOne{k};
    b = shared.Satellites{k};
    posDiff = max(vecnorm(a.SatEcefMeters - b.SatEcefMeters, 2, 2));
    lookDiff = max(abs(a.LookEcefMeters(:) - b.LookEcefMeters(:)));
    bodyDiff = max(abs(a.LookBodyMeters(:) - b.LookBodyMeters(:)));
    fprintf("%-6s %-12s %13.4f %13.4f %15.4f %11.3f /%6.3f\n", ...
        shared.Names(k), shared.Info.SatelliteMode(k), ...
        posDiff, lookDiff, bodyDiff, ...
        a.Info.InterpolationMaxCheckedErrorMeters, ...
        shared.Info.SpotCheckMaxErrorMeters(k));
end

fprintf("\n%-22s %10s %16s\n", "", "time [s]", "Orekit samples");
fprintf("%-22s %10.2f %16d\n", "A: one-by-one", timeA, samplesA);
fprintf("%-22s %10.2f %16d\n", "B: shared-plane", timeB, samplesB);
fprintf("%-22s %9.1fx %15.1fx\n", "B saves", timeA / timeB, samplesA / samplesB);
