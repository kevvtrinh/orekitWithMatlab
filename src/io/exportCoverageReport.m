function exportCoverageReport(coverageResult, filename)
%EXPORTCOVERAGEREPORT Write per-point coverage figures of merit to CSV.

points = coverageResult.Points;
writetable(points, filename);

summary = coverageResult.Summary;
fprintf("Coverage report written to %s\n", string(filename));
fprintf("  Assets: %s\n", strjoin(summary.AssetNames, ", "));
fprintf("  Area-weighted coverage: %.2f%%\n", summary.AverageCoveragePercent);
fprintf("  Points with access: %.1f%%\n", summary.PercentPointsWithAccess);
fprintf("  Worst revisit gap: %.1f minutes\n", summary.WorstMaxGapMinutes);
end
