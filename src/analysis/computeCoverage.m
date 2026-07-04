function coverageResult = computeCoverage(scenario, grid, options)
%COMPUTECOVERAGE Grid coverage and revisit analysis (STK Coverage style).
%
% coverageResult = computeCoverage(scenario, grid)
% coverageResult = computeCoverage(scenario, grid, struct("Assets", ["Sat-1"], "MinElevationDeg", 10))
%
% Options:
%   Assets           String array of satellite names. Default: every
%                    propagated satellite in the scenario.
%   MinElevationDeg  Elevation mask each grid point applies to the assets.
%                    Default 5 degrees.
%
% A grid point is covered at a time step when at least one asset is above
% the elevation mask. Figures of merit are reported per point and
% area-weighted in the summary:
%   CoveragePercent    Percent of scenario time the point is covered.
%   NumPasses          Number of distinct coverage intervals.
%   TotalAccessMinutes Accumulated coverage duration.
%   MaxGapMinutes      Longest revisit gap (uncovered run, span edges included).
%   MeanGapMinutes     Mean revisit gap.

arguments
    scenario MissionScenario
    grid CoverageGrid
    options struct = struct()
end

if isfield(options, "Assets") && ~isempty(options.Assets)
    assetNames = string(options.Assets);
else
    assetNames = defaultAssets(scenario);
end
if isempty(assetNames)
    error("computeCoverage:NoAssets", ...
        "No propagated satellites are available for coverage analysis.");
end
minElevationDeg = 5;
if isfield(options, "MinElevationDeg") && ~isempty(options.MinElevationDeg)
    minElevationDeg = options.MinElevationDeg;
end

timeVector = scenario.Config.getTimeVector();
n = numel(timeVector);
stepSeconds = seconds(scenario.Config.TimeStep);

% Gather asset ECEF ephemerides once.
assetEcef = cell(numel(assetNames), 1);
for s = 1:numel(assetNames)
    sat = scenario.getObject(assetNames(s));
    if isempty(sat.Ephemeris)
        error("computeCoverage:NotPropagated", ...
            "Satellite '%s' has not been propagated.", assetNames(s));
    end
    [found, idx] = ismember(timeVector, sat.Ephemeris.Time);
    if ~all(found)
        error("computeCoverage:TimeMismatch", ...
            "Satellite '%s' ephemeris does not cover the scenario time vector.", ...
            assetNames(s));
    end
    assetEcef{s} = [sat.Ephemeris.ECEF_X_m(idx), ...
        sat.Ephemeris.ECEF_Y_m(idx), sat.Ephemeris.ECEF_Z_m(idx)];
end

pointTable = grid.points();
m = height(pointTable);
covered = false(m, n);

for p = 1:m
    for s = 1:numel(assetNames)
        [~, elDeg] = enuAzElRange(pointTable.LatitudeDeg(p), ...
            pointTable.LongitudeDeg(p), grid.AltitudeMeters, assetEcef{s});
        covered(p, :) = covered(p, :) | (elDeg.' >= minElevationDeg);
    end
end

coveragePercent = zeros(m, 1);
numPasses = zeros(m, 1);
totalAccessMinutes = zeros(m, 1);
maxGapMinutes = zeros(m, 1);
meanGapMinutes = zeros(m, 1);

for p = 1:m
    flag = covered(p, :).';
    coveragePercent(p) = 100.0 * sum(flag) / n;
    passChanges = diff([false; flag; false]);
    numPasses(p) = sum(passChanges == 1);
    totalAccessMinutes(p) = sum(flag) * stepSeconds / 60.0;

    gapChanges = diff([false; ~flag; false]);
    gapStarts = find(gapChanges == 1);
    gapStops = find(gapChanges == -1) - 1;
    if isempty(gapStarts)
        maxGapMinutes(p) = 0;
        meanGapMinutes(p) = 0;
    else
        gapMinutes = (gapStops - gapStarts + 1) * stepSeconds / 60.0;
        maxGapMinutes(p) = max(gapMinutes);
        meanGapMinutes(p) = mean(gapMinutes);
    end
end

pointTable.CoveragePercent = coveragePercent;
pointTable.NumPasses = numPasses;
pointTable.TotalAccessMinutes = totalAccessMinutes;
pointTable.MaxGapMinutes = maxGapMinutes;
pointTable.MeanGapMinutes = meanGapMinutes;

summary = struct();
summary.AssetNames = assetNames;
summary.MinElevationDeg = minElevationDeg;
summary.AverageCoveragePercent = sum(pointTable.AreaWeight .* coveragePercent);
summary.PercentPointsWithAccess = 100.0 * sum(numPasses > 0) / m;
summary.WorstMaxGapMinutes = max(maxGapMinutes);
summary.AreaWeightedMeanGapMinutes = sum(pointTable.AreaWeight .* meanGapMinutes);

coverageResult = struct();
coverageResult.Grid = grid;
coverageResult.Points = pointTable;
coverageResult.TimeVector = timeVector;
coverageResult.CoveredLogical = covered;
coverageResult.Options = struct("Assets", assetNames, "MinElevationDeg", minElevationDeg);
coverageResult.Summary = summary;
end

function assetNames = defaultAssets(scenario)
assetNames = strings(0, 1);
for k = 1:numel(scenario.Objects)
    candidate = scenario.Objects{k};
    if isa(candidate, "SatelliteObject") && candidate.IsPropagated
        assetNames(end + 1, 1) = string(candidate.Name); %#ok<AGROW>
    end
end
end
