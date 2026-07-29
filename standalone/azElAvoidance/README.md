# Standalone Az/El Obstacle Avoidance

This folder is self-contained. It starts with `azElData` and does not use
Orekit, a satellite scenario, or any repository startup function.

Every numbered entry point in `examples` opens the synchronized combined animation:
the current 2-D azimuth/elevation geometry is shown beside the accumulating
3-D azimuth/elevation/time obstacle volume and steering path.

Add this folder to the MATLAB path:

```matlab
root = "C:\path\to\azElAvoidance";
addpath(genpath(root))
```

The package root contains the supported planners, workspace functions, and
visualizer. Planner implementation details are in `private`, runnable
examples are in `examples`, scenario-only helpers are in `examples/support`,
tests are in `tests`, and performance runners are in `benchmarks`.

See [`examples/README.md`](examples/README.md) for the numbered example list
and an algorithm-by-algorithm breakdown.

The mathematical design, pseudocode, guarantees, complexity, and maintenance
boundaries for the planner used by every numbered example are documented in
[`ADAPTIVE_ASTAR_PLANNER.md`](docs/ADAPTIVE_ASTAR_PLANNER.md).

## Input data

Each obstacle is a scalar struct with exactly these fields:

```matlab
azElData = struct( ...
    "targetName", "Vietnam", ...
    "time_s", time_s, ...
    "az_deg", {azimuthBoundaryByTime}, ...
    "el_deg", {elevationBoundaryByTime}, ...
    "status", status);
```

- `time_s` is a strictly increasing numeric column vector.
- `az_deg` and `el_deg` are cell arrays with one polygon boundary per time.
- An empty polygon is `zeros(0,1)` in both cells.
- `status` contains one string per time sample.
- Each scalar struct is one independent obstacle.

## Multiple obstacles

Pass a struct array, cell array, or the output of
`combineAzElObstacles`. Vietnam and China may use different time grids; each
obstacle is active over its own `time_s` range.

```matlab
azElData = combineAzElObstacles( ...
    vietnamAzElData, chinaAzElData);

% These equivalent forms are also accepted:
azElData = [vietnamAzElData, chinaAzElData];
azElData = {vietnamAzElData, chinaAzElData};

workspace = buildAzElTimeObstacleWorkspace(azElData);
assert(workspace.ObstacleCount == 2);
```

The planner, collision query, static plot, and animation treat every element
as a separate obstacle and combine their occupied regions as a union.

Run the included two-obstacle example with your real projected data:

```matlab
plan = example02VietnamChinaAvoidance( ...
    vietnamAzElData, chinaAzElData);
```

Calling `example02VietnamChinaAvoidance` with no inputs loads the bundled
geoBoundaries ADM0 latitude/longitude outlines, capped at 500 vertices per
country. It applies the translation-only display mapping
`azimuth = longitude - 110`, `elevation = latitude`, allowing the example to
run without Orekit. This preserves the recognizable country outlines but is
not a physical sensor-frame projection.

## Unified planner

```matlab
startState = struct( ...
    "time_s", 2700, ...
    "position_deg", [-30, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);

stopState = struct( ...
    "time_s", 3000, ...
    "position_deg", [80, 80], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);

limits = struct( ...
    "azimuth_deg", [-180, 180], ...
    "elevation_deg", [-90, 90], ...
    "maxVelocity_deg_s", [1, 1], ...
    "maxAcceleration_deg_s2", [3, 3]);

options = struct( ...
    "SampleTime_s", 0.1, ...
    "GridStep_deg", 0.5, ...
    "GridStepSchedule_deg", [2 1 0.5], ...
    "SafetyMargin_deg", 1, ...
    "AllowAzimuthWrap", true, ...
    "Objective", "minimumAngularDistance", ...
    "MaxSearchTime_s", 30);

plan = planAzElAdaptiveAStar( ...
    azElData, startState, stopState, limits, options);
```

The steering command is in `plan.time_s` and `plan.position_deg`.
`plan.positionUnwrapped_deg` preserves continuous azimuth across the
`-180/180` seam. Velocity, acceleration, waiting samples, search statistics,
and the packed obstacle workspace are also returned.

Static obstacle volumes use progressive any-angle A*. Moving volumes use
progressive event-compressed safe-interval A*. Both modes use analytic
rest-to-rest slews and validate the command against the original packed
polygons.

### Moving rendezvous and trailing

`planAzElMovingTargetIntercept` can match a moving target's position,
velocity, and acceleration at capture without adding velocity to every A*
state. Internal edges remain rest-to-rest; only the final edge uses a
quintic boundary profile:

```matlab
options.MatchTargetVelocity = true;
options.MatchTargetAcceleration = true;
options.ContinueTrackingAfterIntercept = true;
options.TrackingEndTime_s = target.time_s(end);

plan = planAzElMovingTargetIntercept( ...
    azElData, startState, target, limits, options);
```

After capture, target samples are appended only while position, rate,
acceleration, and polygon collision checks remain valid. The plan records
`trackingTerminationReason`; an obstacle ends tracking before its first
blocked sample is added. Run `example14MovingRendezvousAndTrail` for the
animated demonstration.

Every unsuccessful public planning call also returns
`plan.failureAssessment`, containing a viability category, reason code,
plain-language summary, actionable suggestions, and (when applicable) the
obstacle-free kinematic lower bound. The same diagnosis prints once in the
Command Window. Set `options.PrintFailureSuggestions=false` for quiet batch
runs; the structured assessment remains available in the returned plan.

## Dynamic safe-interval A*

Run the moving two-obstacle example:

```matlab
result = example04DynamicSafeIntervals();
```

Run the animated four-ring timing gauntlet:

```matlab
result = example10RotatingSlots();
```

The boresight waits outside or in the safe annular chambers until each
independently rotating slot admits the next inward crossing. The combined
view animates current 2-D geometry beside the accumulated 3-D
azimuth/elevation/time volume.

Run the animated pursued-boresight gauntlet:

```matlab
result = example11ChasedBoresight();
```

A slightly slower moving barrier spans a bidirectional square corridor
behind the boresight. The goal alcove remains blocked until late in the
scenario, so the planner must keep circulating, choose its own steering
direction, and enter only after the gate opens. No directed or one-way
motion constraint is used.

Run the level-6-inspired synchronized-windmill gauntlet:

```matlab
result = example12SynchronizedWindmills();
```

Eight four-blade windmills rotate at one common rate through an S-shaped
corridor. Coins are deliberately omitted. The boresight must traverse both
rows, follow the changing clearance around a windmill, and take an opening
to the next one. The benchmark supplies no guide path, corridor, preferred
direction, or one-way edge; the safe-interval planner uses its default full
eight-direction symmetric action set.

Run a fresh randomized blinking-board interception:

```matlab
result = example13RandomBlinkingIntercept();
```

The checkerboard changes on independently jittered transitions and includes
random temporary cell outages. A moving endpoint follows a separately
generated trajectory and may cross closed cells; the boresight must remain
collision-free and catch it at a sampled feasible time. The example prints
its seed. Replay that exact case with:

```matlab
result = example13RandomBlinkingIntercept(printedSeed);
```

Run an unfiltered randomized batch with:

```matlab
report = runRandomBlinkingChessboardStressTest(20);
```

Every generated seed is retained whether it passes or fails. The runner
never searches for a favorable seed, and its reported root seed reproduces
the complete batch. The MATLAB unit test draws five new cases on every run
and requires at least an 80 percent success rate, zero boresight collisions,
real multi-cell traversal, and endpoint motion through closed cells.

Run the default 86,401-slice long-horizon benchmark:

```matlab
benchmark = benchmarkAdaptiveAStarLongHorizon();
```

The design summary is in
[`ADAPTIVE_ASTAR_PLANNER.md`](docs/ADAPTIVE_ASTAR_PLANNER.md).

## Static topology component

The technical design, mathematical scope, guarantees, complexity analysis,
and benchmark results are documented in
[`docs/autonomous_az_el_corridor_planner_white_paper.md`](../../docs/autonomous_az_el_corridor_planner_white_paper.md).

The adaptive planner invokes its static any-angle component for difficult
static topology without a supplied guide path. The lower-level component can
still be tested directly:

```matlab
options = struct( ...
    "SampleTime_s", 0.5, ...
    "TopologyGridStep_deg", 0.5, ...
    "SafetyMargin_deg", 0.5, ...
    "AllowAzimuthWrap", false, ...
    "Objective", "minimumAngularDistance");

plan = planAzElAutonomousCorridor( ...
    azElData, startState, stopState, limits, options);
```

The planner verifies that packed obstacle slices are static, constructs one
inflated occupancy raster, discovers a route with any-angle A*, removes grid
staircasing through line-of-sight parent relaxation, and automatically
retimes the resulting corridor under the rate and acceleration limits.
Collision validation uses a finer internal timestep than the requested output
when necessary, reducing the risk that fast slews cross thin obstacles
between samples. Visibility shortcutting then removes waypoint stops only
when dense samples along the replacement chord clear the original polygons.

Set `EnableTopologyRefinement` to true to run a second any-angle search on a
finer grid restricted to a narrow tube around the coarse route. Configure it
with `RefinementGridStep_deg` and
`RefinementCorridorHalfWidth_deg`. This spends more computation to reduce
angular path length while concentrating search near the discovered route.
The default coarse mode generally gives the best computation-time and
maneuver-time balance.

Numbered examples call `planAzElAdaptiveAStar`, which selects static topology
only when every obstacle slice is unchanged over the requested interval.

## Animate the completed plan

```matlab
view = animateAzElAvoidancePlan( ...
    azElData, plan, struct( ...
    "ViewMode", "combined", ...  % "2d", "3d", or "combined"
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100));
```

The 2-D pane shows the selected A* lattice, every valid rejected resolution
route, the selected route, current obstacle boundary, and current boresight.
The 3-D pane places the same search information beside accumulating obstacle
slices in azimuth/elevation/time space. Display decimation does not change
the plan or collision workspace.

## Plot and export boresight kinematics

Plot position, velocity, acceleration, and sampled jerk after planning:

```matlab
kinematics = plotAzElPlanKinematics(plan);
```

The underlying values are returned in `kinematics.Data`. Excel export is off
by default. Enable it explicitly when needed:

```matlab
kinematics = plotAzElPlanKinematics(plan, struct( ...
    "ExportExcel", true, ...
    "ExcelFile", "boresight_kinematics.xlsx"));
```

The spreadsheet includes absolute and elapsed time, wrapped and unwrapped
position, velocity, acceleration, and finite-difference jerk for both axes.
Sampled jerk shows acceleration-command transitions; the planner does not
currently impose a jerk limit.

## Workspace and collision queries

Build once when many candidate paths will query the same obstacles:

```matlab
workspace = buildAzElTimeObstacleWorkspace(azElData);

occupied = queryAzElTimeObstacle( ...
    workspace, azimuth_deg, elevation_deg, time_s, ...
    struct("SafetyMarginDeg", 1));
```

The workspace packs all time slices into contiguous arrays. Display
decimation never affects collision queries.

The continuous waypoint result reports a certified bound derived from the
straight angular lower bound. A `minimumTime` A* result reports whether it is
optimal on its configured finite lattice.

## Generated-data gauntlet

Five examples create only `azElData`, boundary states, limits, and options.
No Orekit or scenario object is used:

1. `example05FiveTurnSpiral`
2. `example06StopGoGates`
3. `example07WrappedAzimuthSeam`
4. `example08AlternatingSlalom`
5. `example09UTrapEscape`

The five-turn spiral is intentionally beyond the practical search range of
the raw kinodynamic lattice. It calls `planAzElAdaptiveAStar`, supplies no
guide path or direction, and asserts that static any-angle A* autonomously
winds through the spiral before reaching its center. The
discovered polyline is dynamically retimed and densely collision-checked.
Because the shortest legal path enters at the wall's outer opening and rounds
its inner tip, its net polar winding is slightly above four turns even though
the obstacle centerline itself contains five complete turns.

Run all five:

```matlab
results = runStaticGauntletExamples();
```

Every example returns its generated inputs and completed plan, checks every
returned command sample for collision, and asserts the behavior named by the
example. Animate any result with:

```matlab
animateAzElAvoidancePlan( ...
    results(1).azElData, results(1).plan, ...
    struct("ViewMode", "combined"));
```
