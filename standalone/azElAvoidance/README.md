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
- Pass a struct array or cell array to plan around multiple obstacles.

## Direct planner

```matlab
startState = struct( ...
    "time_s", 2700, ...
    "position_deg", [-30, 0], ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);

stopState = struct( ...
    "time_s", 3000, ...
    "position_deg", [80, 0], ...
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
    "MaxSearchTime_s", 30);

plan = planAzElAvoidance( ...
    azElData, startState, stopState, limits, options);
```

The steering command is in `plan.time_s` and `plan.position_deg`.
`plan.positionUnwrapped_deg` preserves continuous azimuth across the
`-180/180` seam. Velocity, acceleration, waiting samples, search statistics,
and the packed obstacle workspace are also returned.

Long fixed-time requests use a coarse control-decision lattice first while
retaining `SampleTime_s` for collision checks and returned steering samples.
If that lattice cannot reach the requested terminal state, the planner tries
finer lattices within `MaxSearchTime_s`.

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

`planAzElAvoidance` uses unweighted kinodynamic A* on a finite motion
lattice. A successful result is optimal on that configured lattice, not in
continuous azimuth/elevation space.
