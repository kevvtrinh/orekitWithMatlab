%% Example 06: export a contact plan
example_03_groundStationAccess;

outFile = fullfile(tempdir, "contactPlan.csv");
exportContactPlan(accessResult, outFile);
fprintf("Wrote %s\n", outFile);

