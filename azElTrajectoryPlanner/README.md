# Clean-Room Azimuth-Elevation Trajectory Planner

`planAzElTrajectory` is a deterministic quintic space-time lattice planner
designed only from the neutral `azElStandaloneExamples` handoff.

```matlab
plannerRoot = "C:\Users\Kevin\Documents\OREKIT\azElTrajectoryPlanner";
benchmarkRoot = "C:\Users\Kevin\Documents\OREKIT\azElStandaloneExamples";
addpath(plannerRoot)
addpath(benchmarkRoot)
report = runAllAzElExamples(@planAzElTrajectory, struct());
```

Inspect uniform defaults with:

```matlab
options = planAzElTrajectory();
```

Run the verified local tests with:

```matlab
addpath(fullfile(plannerRoot, "tests"))
results = runPlannerTests();
auditFindings = runSourceAudit();
perturbations = runPerturbationTests();
```

Run the frozen acceptance gate with:

```matlab
report = runFullBenchmark();
```

The benchmark command writes `results/full_benchmark.csv`,
`results/planner_diagnostics.csv`, and `results/full_benchmark.mat`, then
asserts every validation and assertion column. The planner never reads fixture
identity, acceptance criteria, obstacle names, target names, or source options.

The checked-in `results/full_benchmark.csv` and `.mat` are the latest exact
fresh-session report. All 15 rows pass planner-call, independent-validation,
behavioral-assertion, and overall-success checks.
