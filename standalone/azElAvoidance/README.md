# Standalone Az/El Obstacle Avoidance

This folder is self-contained. It starts with `azElData` and does not use
Orekit, a satellite scenario, or any repository startup function.

Add this folder to the MATLAB path:

```matlab
addpath("C:\path\to\azElAvoidance")
```

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
plan = exampleVietnamChinaAzElAvoidance( ...
    vietnamAzElData, chinaAzElData);
```

Calling `exampleVietnamChinaAzElAvoidance` with no inputs loads the bundled
geoBoundaries ADM0 latitude/longitude outlines, capped at 500 vertices per
country. It applies the translation-only display mapping
`azimuth = longitude - 110`, `elevation = latitude`, allowing the example to
run without Orekit. This preserves the recognizable country outlines but is
not a physical sensor-frame projection.

## Direct planner

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
    "GridStep_deg", 0.1, ...
    "SafetyMargin_deg", 1, ...
    "AllowAzimuthWrap", true, ...
    "Objective", "minimumAngularDistance", ...
    "MaxSearchTime_s", 30);

plan = planAzElAvoidance( ...
    azElData, startState, stopState, limits, options);
```

The steering command is in `plan.time_s` and `plan.position_deg`.
`plan.positionUnwrapped_deg` preserves continuous azimuth across the
`-180/180` seam. Velocity, acceleration, waiting samples, search statistics,
and the packed obstacle workspace are also returned.

`minimumAngularDistance` first tests the globally shortest straight segment,
then searches dynamically feasible waypoint paths with coarse-to-fine
refinement. `plan.angularLowerBound_deg` and `plan.suboptimalityBound`
quantify how close a returned waypoint route is to the unknown global
optimum. Every returned sample is checked at `SampleTime_s`.

Set `Objective` to `minimumTime` to use kinodynamic A* on the finite motion
lattice. Long fixed-time lattice requests start with coarse control decisions
while retaining `SampleTime_s` for collision checks and returned commands.

## Anytime kinodynamic ARA*

`planAzElKinodynamicARAStar` is a separate low-level planner that reuses its
search while progressively reducing heuristic inflation:

```matlab
workspace = buildAzElTimeObstacleWorkspace(azElData);

start = struct( ...
    "AzimuthDeg", -6, ...
    "ElevationDeg", 45, ...
    "Time", workspace.ReferenceTime);
goal = struct( ...
    "AzimuthDeg", 6, ...
    "ElevationDeg", 45);
limits = struct( ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [40 50], ...
    "AzimuthRateLimitDegPerSec", 2, ...
    "ElevationRateLimitDegPerSec", 2, ...
    "AzimuthAccelerationLimitDegPerSec2", 1, ...
    "ElevationAccelerationLimitDegPerSec2", 1);
options = struct( ...
    "Objective", "minimumTime", ...
    "EpsilonSchedule", [2.5 2 1.5 1], ...
    "TimeStepSeconds", 1, ...
    "CollisionCheckStepSeconds", 0.2);

result = planAzElKinodynamicARAStar( ...
    workspace, start, goal, limits, options);
```

Each edge is a constant-acceleration motion primitive. Position, rate,
acceleration, time-window, collision, safety-margin, and azimuth-wrap
constraints use the same definitions as `planAzElKinodynamicAStar`.
`result.SolutionHistory` records the incumbent cost and certified bound after
each epsilon pass. If a resource limit interrupts refinement, the best path
is retained with the last completed certificate. A bound of one means exact
optimality on the configured finite lattice, not in continuous space.

Run the visual convergence example with:

```matlab
[result, handles] = exampleKinodynamicARAStar();
```

## Autonomous corridor planner

The technical design, mathematical scope, guarantees, complexity analysis,
and benchmark results are documented in
[`docs/autonomous_az_el_corridor_planner_white_paper.md`](../../docs/autonomous_az_el_corridor_planner_white_paper.md).

`planAzElAutonomousCorridor` handles difficult static topology without a
supplied guide path:

```matlab
options = struct( ...
    "SampleTime_s", 0.5, ...
    "TopologyGridStep_deg", 0.5, ...
    "SafetyMargin_deg", 0.5, ...
    "AllowAzimuthWrap", false, ...
    "Objective", "minimumAngularDistance", ...
    "FallbackToExistingPlanner", false);

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

Time-dependent geometry, minimum-time objectives, and nonzero boundary rates
or accelerations fall back to `planAzElAvoidance` by default. Set
`FallbackToExistingPlanner` to false when a test must prove autonomous static
topology discovery was used.

## Animate the completed plan

```matlab
view = animateAzElAvoidancePlan( ...
    azElData, plan, struct( ...
    "ViewMode", "combined", ...  % "2d", "3d", or "combined"
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100));
```

The 2-D pane shows the current obstacle boundary, current boresight, traveled
path, and future path. The 3-D pane places the route and accumulating
obstacle slices in azimuth/elevation/time space. Display decimation does not
change the plan or collision workspace.

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

1. `exampleGauntlet01FiveTurnSpiral`
2. `exampleGauntlet02StopGoStopGo`
3. `exampleGauntlet03WrappedSeamDetour`
4. `exampleGauntlet04AlternatingSlalom`
5. `exampleGauntlet05UTrapEscape`

The five-turn spiral is intentionally beyond the practical topology-search
range of the raw kinodynamic lattice. It runs
`planAzElAutonomousCorridor` with fallback disabled, supplies no
`GuidePath_deg`, and asserts that the route autonomously winds through the
spiral before reaching its center. The discovered polyline is dynamically
retimed and densely collision-checked against the original polygons.
Because the shortest legal path enters at the wall's outer opening and rounds
its inner tip, its net polar winding is slightly above four turns even though
the obstacle centerline itself contains five complete turns.

Run all five:

```matlab
results = runAzElAvoidanceGauntlet();
```

Every example returns its generated inputs and completed plan, checks every
returned command sample for collision, and asserts the behavior named by the
example. Animate any result with:

```matlab
animateAzElAvoidancePlan( ...
    results(1).azElData, results(1).plan, ...
    struct("ViewMode", "combined"));
```
