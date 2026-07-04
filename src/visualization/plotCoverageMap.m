function ax = plotCoverageMap(coverageResult, metricName, ax)
%PLOTCOVERAGEMAP Color-coded coverage figure-of-merit map.
%
% ax = plotCoverageMap(coverageResult)
% ax = plotCoverageMap(coverageResult, "MaxGapMinutes")
%
% metricName is any figure-of-merit column of coverageResult.Points
% ("CoveragePercent" by default, or "NumPasses", "TotalAccessMinutes",
% "MaxGapMinutes", "MeanGapMinutes").

if nargin < 2 || isempty(metricName)
    metricName = "CoveragePercent";
end
metricName = string(metricName);
if nargin < 3 || isempty(ax)
    figure("Name", "Coverage Map");
    ax = axes();
end

points = coverageResult.Points;
if ~ismember(metricName, string(points.Properties.VariableNames))
    error("plotCoverageMap:UnknownMetric", ...
        "Coverage metric '%s' was not found in coverageResult.Points.", metricName);
end

hold(ax, "on");
drawCoastlines(ax);
scatter(ax, points.LongitudeDeg, points.LatitudeDeg, 34, points.(metricName), ...
    "filled", "MarkerFaceAlpha", 0.85);
colormap(ax, "parula");
colorbar(ax);
xlabel(ax, "Longitude (deg)");
ylabel(ax, "Latitude (deg)");
title(ax, "Coverage - " + metricName);
xlim(ax, [-180 180]);
ylim(ax, [-90 90]);
grid(ax, "on");
end

function drawCoastlines(ax)
try
    coast = load("coastlines");
    plot(ax, coast.coastlon, coast.coastlat, "Color", [0.15 0.35 0.18]);
catch
    rectangle("Parent", ax, "Position", [-180 -90 360 180], ...
        "EdgeColor", [0.2 0.2 0.2]);
end
end
