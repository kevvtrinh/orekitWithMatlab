# Standalone Az/El Obstacle Avoidance

This folder is self-contained. It starts with `azElData` and does not use
Orekit, a satellite scenario, or any repository startup function.
Library edits follow the inline-first conventions in [`STYLE.md`](STYLE.md).

The learning-oriented random-search baseline is
[`planSimpleAzElTimeKinodynamicBiRRT.m`](planSimpleAzElTimeKinodynamicBiRRT.m).
It keeps two inspectable seven-state trees: the initial tree grows forward
with constant-jerk dynamics, while the destination tree uses the analytic
inverse of the same step. Destination-tree controls are stored in their
forward-time form, and every accepted result is reconstructed and checked
again with the forward equations. It intentionally omits RRT* rewiring,
informed sampling, smoothing, safe intervals, optimization-based steering,
and all mature-planner acceleration structures.

Run its deterministic moving-obstacle example with:

```matlab
[plan, handles] = example_simple_azEl_time_kinodynamic_birrt(true);
```

The returned `initialTree` and `destinationTree` expose state rows, parent
indices, applied jerks, edge durations, and search directions. Collision
checking samples each cubic constant-jerk edge at `CollisionCheckStep_s` and
queries the original packed polygons; `continuousCollisionGuaranteed` is
therefore deliberately false.

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
[`DIJKSTRA_PLANNER.md`](docs/DIJKSTRA_PLANNER.md).
The all-Dijkstra branch comparison and measured runtime tradeoffs are in
[`ALL_DIJKSTRA_EXPERIMENT.md`](docs/ALL_DIJKSTRA_EXPERIMENT.md).

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
initialState = struct( ...
    "time_s", 2700, ...
    "position_deg", [-30, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);

goalState = struct( ...
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

plan = planAzElDijkstra( ...
    azElData, initialState, goalState, limits, options);
```

The steering command is in `plan.time_s` and `plan.position_deg`.
`plan.positionUnwrapped_deg` preserves continuous azimuth across the
`-180/180` seam. Velocity, acceleration, waiting samples, search statistics,
and the packed obstacle workspace are also returned.

Static obstacle volumes use progressive goal-rooted Dijkstra. Moving volumes
use progressive event-compressed safe-interval Dijkstra. Both modes use
analytic rest-to-rest slews and validate the command against the original
packed polygons.

## Experimental bidirectional kinodynamic RRT*

`planAzElBidirectionalKinodynamicRRTStar` is a separate comparison planner;
it does not replace or modify `planAzElDijkstra`. A forward space-time RRT*
tree grows from the initial state while a backward tree grows from the
fixed-time goal. Nodes are zero-rate states at sampled times. Every edge
waits at its source and then executes a synchronized quintic slew that
respects the azimuth/elevation rate and acceleration limits.

```matlab
rrtOptions = struct( ...
    "SafetyMargin_deg", 0.5, ...
    "RandomSeed", 7, ...
    "MaxSearchTime_s", 45, ...
    "IterationsAfterFirstSolution", 0);

rrtPlan = planAzElBidirectionalKinodynamicRRTStar( ...
    azElData, initialState, goalState, limits, rrtOptions);
```

Tree growth uses configurable coarse collision sampling. A complete
start-to-goal candidate cannot become the incumbent until the full command
passes the authoritative `ValidationStep_s` polygon check. The returned
forward and backward trees expose every sampled contender for diagnosis.
Space and time samples are uniform over the complete allowed domain. There
is no goal-bias option, supplied waypoint route, preferred direction, or
scenario-specific search corridor.

RRT* is stochastic: a finite run has no success or global-optimum guarantee.
Use multiple seeds when measuring reliability. Run the repeatable
rotating-slot comparison with:

```matlab
report = benchmarkBidirectionalRRTStar([7 19 31]);
```

The benchmark runs deterministic Dijkstra once and RRT* once per seed using
the same packed workspace, dynamics, safety margin, and final validation.

### Moving rendezvous and trailing

`planAzElMovingTargetIntercept` can match a moving target's position,
velocity, and acceleration at capture without adding velocity to every graph
state. Internal edges remain rest-to-rest; only the final edge uses a
quintic boundary profile:

```matlab
options.MatchTargetVelocity = true;
options.MatchTargetAcceleration = true;
options.ContinueTrackingAfterIntercept = true;
options.TrackingEndTime_s = target.time_s(end);

plan = planAzElMovingTargetIntercept( ...
    azElData, initialState, target, limits, options);
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

## Dynamic safe-interval Dijkstra

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
benchmark = benchmarkDijkstraLongHorizon();
```

The design summary is in
[`DIJKSTRA_PLANNER.md`](docs/DIJKSTRA_PLANNER.md).

## Static topology component

The static implementation is documented in
[`docs/STATIC_DIJKSTRA.md`](docs/STATIC_DIJKSTRA.md).

The adaptive planner first proves that every obstacle slice is unchanged
over the requested interval. At each requested grid spacing it then:

1. builds a complete inflated occupancy grid;
2. propagates Dijkstra cost backward from the goal;
3. follows stored successors from the initial grid state to the goal;
4. removes unnecessary grid corners using exact polygon visibility checks;
5. retimes the route under rate and acceleration limits; and
6. validates the complete command against the packed polygons.

`plan.topologySearch.CostToGoal_deg` and `SettledMask` expose the propagated
workspace for diagnosis. Every value in `GridStepSchedule_deg` applies to the
complete az/el domain. There is no route-tube, supplied guide, preferred
direction, or separate static planner entry point.

## Animate the completed plan

```matlab
view = animateAzElAvoidancePlan( ...
    azElData, plan, struct( ...
    "ViewMode", "combined", ...  % "2d", "3d", or "combined"
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "ShowPlanningSummary", true));
```

The 2-D pane shows the selected search lattice, every valid rejected resolution
route, the selected route, current obstacle boundary, and current boresight.
The 3-D pane places the same search information beside accumulating obstacle
slices in azimuth/elevation/time space. Display decimation does not change
the plan or collision workspace.

`ShowPlanningSummary=true` coordinates those layers into a data-to-command
playback. The heading reports the input `azElData`, packed workspace growth,
search-structure growth, valid alternate routes, and final selected method.
Contenders appear during selection and the final route is emphasized at the
end. Dijkstra plans reveal their lattice. Plans that contain `forwardTree`
and `backwardTree` reveal both retained RRT* spanning trees in 2-D and 3-D.

Control the search-space layer independently:

```matlab
% Never draw the lattice or trees.
options = struct("DiscretizationMode", "off");

% Reveal only the completed lattice or trees on the final frame.
options = struct("DiscretizationMode", "final");

% Reveal lattice lines or tree edges progressively during playback.
options = struct("DiscretizationMode", "build");
```

The older `ShowDiscretization=false` option remains a master off switch.
`MaximumDiscretizationLines`, `MaximumDiscretizationTimePlanes`, and
`MaximumDiscretizationEdges` cap graphics only; they do not alter the search
or exact collision validation.

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
straight angular lower bound. Dynamic Dijkstra minimizes earliest arrival
labels on its configured safe-interval graph; exact polygon validation still
governs whether a returned trajectory is accepted.

## Generated-data gauntlet

Five examples create only `azElData`, boundary states, limits, and options.
No Orekit or scenario object is used:

1. `example05FiveTurnSpiral`
2. `example06StopGoGates`
3. `example07WrappedAzimuthSeam`
4. `example08AlternatingSlalom`
5. `example09UTrapEscape`

The five-turn spiral is intentionally beyond the practical search range of
the raw kinodynamic lattice. It calls `planAzElDijkstra`, supplies no
guide path or direction, and asserts that static goal-rooted Dijkstra autonomously
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
