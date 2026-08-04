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

Visualize one frozen example in synchronized 2-D azimuth/elevation and 3-D
azimuth/elevation/time views with:

```matlab
result = visualizeAzElExample(4);
```

Select several examples, or animate all 15 sequentially:

```matlab
results = visualizeAzElExample([1 4 7]);
results = visualizeAllAzElExamples();
```

Playback can be accelerated or limited to one view:

```matlab
animationOptions = struct( ...
    "ViewMode", "2d", ...       % "2d", "3d", or "combined"
    "MaximumAnimationFrames", 80, ...
    "PauseSeconds", 0.005);
result = visualizeAzElExample(10, animationOptions);
```

For a scenario and plan already in the workspace, call the animator directly:

```matlab
handles = animateAzElAvoidancePlan(scenario, plan);
```

Call `animateAzElAvoidancePlan()` with no inputs to inspect all display
defaults. Visualization is independent of benchmark pass/fail validation.

The benchmark command writes `results/full_benchmark.csv`,
`results/planner_diagnostics.csv`, and `results/full_benchmark.mat`, then
asserts every validation and assertion column. The planner never reads fixture
identity, acceptance criteria, obstacle names, target names, or source options.

The checked-in `results/full_benchmark.csv` and `.mat` are the latest exact
fresh-session report. All 15 rows pass planner-call, independent-validation,
behavioral-assertion, and overall-success checks.
