%% Example 21: two-ring constellation vs 500 point targets - method comparison
%
% Six satellites in TWO orbital rings (3 per plane, RAAN 90 deg apart)
% against 500 point targets spread globally, run both ways:
%   A. one-by-one   - computeSatToGroundVectors per satellite
%   B. shared-plane - computeConstellationToGroundVectors, one reference
%                     propagation per ring, siblings phase-shifted
% and compares wall time, propagation time, Orekit sample counts, and
% accuracy (full-grid agreement plus each method's own exact-propagation
% spot checks).
%
% Scale notes at M = 500 targets:
%   * LookEcefMeters is N-by-3-by-500 (~100 MB per satellite at this N),
%     so the scenario samples at 10 s and az/el is disabled; method A's
%     bulky arrays are dropped after extracting what the comparison needs.
%   * Look-vector agreement EQUALS satellite-position agreement by
%     construction (look = ground - sat and the ground points are
%     identical in both methods), so positions and ranges tell the whole
%     accuracy story without holding two copies of the big arrays.
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Two rings vs 500 targets";
cfg.Epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(10);

% --- Two rings, three satellites each, evenly phased ---
sats = {};
ringRaan = [40, 130];
for ring = 1:2
    for slot = 1:3
        name = sprintf("Ring%d-Sat%d", ring, slot);
        sats{end + 1} = SatelliteObject.fromKeplerian(name, ...
            6878e3, 0.001, 51.6, ringRaan(ring), 0, (slot - 1) * 120); %#ok<SAGROW>
    end
end
numSats = numel(sats);

% --- 500 point targets on a Fibonacci sphere (deterministic, global) ---
numTargets = 500;
k = (1:numTargets)';
latDeg = asind(1 - 2 * (k - 0.5) / numTargets);
lonDeg = mod(k * 137.50776405, 360) - 180;
groundPoints = [latDeg, lonDeg, zeros(numTargets, 1)];

% Warmup: absorb the one-time Java/EOP initialization so the timed runs
% are warm-vs-warm.
warmCfg = ScenarioConfig();
warmCfg.Epoch = cfg.Epoch;
warmCfg.Duration = minutes(3);
warmCfg.TimeStep = seconds(1);
computeSatToGroundVectors(sats{1}, groundPoints(1:5, :), warmCfg, "UseParallel", false);

% --- Method A: one satellite at a time (keep only what the comparison needs) ---
timerA = tic;
aSlim = cell(numSats, 1);
propA = 0;
samplesA = 0;
for s = 1:numSats
    r = computeSatToGroundVectors(sats{s}, groundPoints, cfg, "ComputeAER", false);
    aSlim{s} = struct("SatEcefMeters", r.SatEcefMeters, ...
        "RangeMeters", r.RangeMeters, ...
        "ExactCheckMeters", r.Info.InterpolationMaxCheckedErrorMeters);
    propA = propA + r.Info.PropagationSeconds;
    samplesA = samplesA + r.Info.NumOrekitSamples;
    clear r
end
timeA = toc(timerA);

% --- Method B: shared propagation, one reference per ring ---
timerB = tic;
shared = computeConstellationToGroundVectors(sats, groundPoints, cfg, ...
    "ComputeAER", false);
timeB = toc(timerB);
propB = shared.Info.PropagationSeconds;
samplesB = shared.Info.NumOrekitSamples;

% --- Accuracy: full-grid agreement + each method's own exact checks ---
fprintf("\n=== Two rings (%d sats) vs %d targets, %d time samples ===\n", ...
    numSats, numTargets, shared.Info.NumTimeSamples);
fprintf("%-12s %-12s %-10s %14s %14s %19s\n", "Sat", "mode", "reference", ...
    "pos diff [m]", "range diff [m]", "exact-check A/B [m]");
for s = 1:numSats
    b = shared.Satellites{s};
    posDiff = max(vecnorm(aSlim{s}.SatEcefMeters - b.SatEcefMeters, 2, 2));
    rangeDiff = max(abs(aSlim{s}.RangeMeters(:) - b.RangeMeters(:)));
    fprintf("%-12s %-12s %-10s %14.4f %14.4f %12.3f /%6.3f\n", ...
        shared.Names(s), shared.Info.SatelliteMode(s), ...
        shared.Info.ReferenceName(s), posDiff, rangeDiff, ...
        aSlim{s}.ExactCheckMeters, shared.Info.SpotCheckMaxErrorMeters(s));
end

fprintf("\nGroups found: %d\n", numel(shared.Info.Groups));
for g = 1:numel(shared.Info.Groups)
    grp = shared.Info.Groups(g);
    fprintf("  ring %d: reference %s, %d members, %d Orekit nodes\n", ...
        g, grp.ReferenceName, numel(grp.MemberNames), grp.NodeCount);
end

fprintf("\n%-22s %10s %16s %16s\n", "", "total [s]", "propagation [s]", "Orekit samples");
fprintf("%-22s %10.2f %16.2f %16d\n", "A: one-by-one", timeA, propA, samplesA);
fprintf("%-22s %10.2f %16.2f %16d\n", "B: shared-plane", timeB, propB, samplesB);
fprintf("%-22s %9.1fx %15.1fx %15.1fx\n", "B saves", ...
    timeA / timeB, propA / propB, samplesA / samplesB);
fprintf("\nNote: at %d targets the N-by-M geometry pass dominates and is\n", numTargets);
fprintf("identical in both methods - sharing shrinks only the Java\n");
fprintf("propagation share, so the propagation column shows the real win.\n");
