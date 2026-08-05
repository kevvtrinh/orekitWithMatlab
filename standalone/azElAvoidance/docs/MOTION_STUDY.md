# Dijkstra Motion-State Study

## Outcome

The study branch adds `MotionMode="pathStateSpaceKinematic"`. It preserves the
maintained spatial Dijkstra search, but replaces the final waypoint-by-waypoint
start-stop profile with a second Dijkstra search that carries velocity through
the selected route.

On the circular detour in `example17KinematicStateSpaceStudy`:

| Measurement | Velocity-state study | Start-stop baseline |
|---|---:|---:|
| Motion completion | 12.000 s | 13.000 s |
| Interior stops | 0 | 1 |
| Blocked command samples | 0 | 0 |
| Motion-time ratio | 0.923077 | 1.000000 |

The study expanded 4,347 states and generated 4,780. Its progress and velocity
integration residuals were `3.11e-15 deg` and `3.33e-16 deg/s`. This improved
executed motion at a materially higher planning cost; the example reports that
cost instead of hiding it.

## State & Actions

The searched state is

```text
(path-progress index, path-speed index, elapsed-time index)
```

The continuous route maps each winning state into the physical report

```text
(azimuth, elevation, azimuth rate, elevation rate, time).
```

Acceleration actions are `-1`, `0`, or `+1` lattice levels. For progress step
`ds` and time step `dt`, the study chooses

```text
acceleration step = 2 ds / dt^2
velocity step     = 2 ds / dt
```

This makes every constant-acceleration transition land exactly on the next
progress and velocity cells:

```text
s_next = s + v dt + 0.5 a dt^2
v_next = v + a dt
```

The goal progress index is made even so an exact zero-speed arrival is
representable without a special terminal shortcut.

## Physical Validation

The path model supplies position, tangent, and curvature. An edge maps scalar
path motion into both axes using

```text
axis velocity     = path tangent * path speed
axis acceleration = path curvature * speed^2
                  + path tangent * path acceleration
```

Every candidate edge is sampled densely. A state is added only when all
samples remain inside azimuth/elevation bounds, both axis rate and acceleration
limits, and the exact packed obstacle polygons at their actual times. The
completed output and a separate validation clock are queried again before the
plan is returned.

Because every edge advances one fixed `dt`, processing time layers in order is
uniform-cost Dijkstra. The first exact goal-at-rest state is the earliest
arrival represented by the configured lattice.

## What This Improves

- Velocity is part of the search receipt rather than reset at every waypoint.
- Curvature acceleration is included while crossing rounded corners.
- The planner may accelerate, coast, decelerate, or wait at rest.
- Moving polygons are evaluated during each physical transition.
- Winning state and action histories are returned for independent auditing.
- The legacy `profile` and `pathFirstThenKinematic` modes remain unchanged.

## Current Boundary Of The Study

This is near physical state space, not yet full free-flight state space:

- Spatial topology is chosen first; motion cannot switch homotopy afterward.
- Speed is scalar forward progress on that path, not two independent rate
  dimensions during search.
- Acceleration is an edge action rather than a carried state, so jerk is not
  constrained and acceleration may change at a time-step boundary.
- Reverse progress and wrapped azimuth are not supported.
- Initial and terminal velocity and acceleration must be zero.
- Completeness and earliest-arrival claims apply only to the configured
  discrete path-state lattice.
- Dense polygon checks make the study slower than the start-stop retimer.

Those explicit limits supplied the target for the joint extension below:
search both axes and their derivative states together, add bounded-jerk
actions, and use adaptive resolution without losing exact polygon validation.

## Joint Bounded-Jerk Extension

The next study step is now available as
`MotionMode="jointStateSpaceKinematic"`. It searches seven state dimensions:

```text
(azimuth, elevation,
 azimuth rate, elevation rate,
 azimuth acceleration, elevation acceleration,
 time)
```

Each edge carries one constant two-axis jerk action. Position, rate, and
acceleration therefore remain continuous across action boundaries. The search
does not need a spatial route first, so it can reverse, cross wrapped azimuth,
choose a different obstacle side, or wait for a moving opening as part of the
same state search.

Sparse A* orders the frontier with optimistic time and distance bounds. The
accumulated objective is

```text
time weight     * elapsed time / obstacle-free time bound
+ distance weight * path length / straight-line distance bound
```

The weights are normalized automatically. The default equal weighting makes
`1.0` the unattainable-or-ideal reference when obstacles or jerk limits add no
cost. This is an additive planning objective; examples may also report the
geometric-mean ratio used by the no-wrap benchmark.

The requested position step controls spatial fidelity. A coarse-to-fine
schedule first tries twice that step and then the requested step. For each
level, the time step grows automatically until its exact jerk lattice fits the
axis acceleration and jerk limits. Successful levels are compared by their
dimensionless combined ratio.

The maintained examples request `MotionMode="jointParetoKinematic"`. This
uses the same joint search, then builds an adaptive piecewise-quintic direct-
collocation mesh. Regular time knots describe the whole maneuver; additional
knots preserve sharp turns and stop/start transitions. A deterministic local
search moves important interior knot positions and refines the common clock.
It has no Optimization Toolbox dependency, and exact quintic interpolation
prevents state columns from drifting apart between knots.

Each candidate is densely rechecked against the original polygons and physical
limits. If the joint lattice cannot finish within its short attempt budget,
the explicit fallback starts from a validated path-first or safe-interval
command and records that fact before the same refinement pass. No candidate is
published unless it improves the weighted ratio without weakening validation
or needlessly increasing jerk. A separate physical receipt makes an important
distinction explicit: collision-valid profile fallback is not labeled
bounded-jerk when it has no analytic jerk history.

### Measured circular study

`example18JointBoundedJerkStudy` now reports three motion levels:

| Measurement | Continuous Pareto replay | Joint A* lattice | Earlier path-first clock |
|---|---:|---:|---:|
| Path length | 21.321906 deg | 21.757974 deg | 21.478052 deg |
| Completion time | 7.258250 s | 8.349 s | 14.187 s |
| Peak jerk | 7.999 deg/s^3 | 2.405 deg/s^3 | 39.589 deg/s^3 sampled equivalent |
| Blocked samples | 0 | 0 | 0 |

The continuous result comes from
`optimizeCircularBoundedJerkTrajectory`. Duration and 80 two-axis jerk
commands are the only optimization variables. Position, velocity, and
acceleration are integrated from those commands exactly, so they cannot drift
apart during the solve. The stored controls are plain MATLAB source in
`storedCircularBoundedJerkReference`, and every example run replays them at a
fine time step and rechecks the circle, axis limits, jerk, and terminal state.

The replay's dense receipt is:

| Check | Value |
|---|---:|
| Exact tangent-plus-arc distance lower bound | 21.237991721 deg |
| Distance ratio | 1.003951 |
| Best known jerk-limited completion time | 7.257400000 s |
| Time ratio | 1.000117 |
| Worst of the two ratios | 1.003951 |
| Minimum protected-circle clearance | 0.000099 deg |
| Maximum dense limit violation | 0 |
| Terminal-state residual | 1.2e-9 |

This deliberately does not claim that one trajectory can equal both
independent lower bounds. The exact shortest curve changes from a straight
tangent to a circular arc without a curvature ramp. At nonzero speed that
would change acceleration direction instantly, which requires unbounded jerk.
The fastest bounded-jerk path is therefore slightly longer. Conversely, a
trajectory can approach the exact geometric curve by slowing through those
transitions, but it is no longer the fastest trajectory. The reported worst
ratio makes that tradeoff visible instead of hiding it in a single average.

The fine 0.25-degree level expanded 3,604 states and generated 9,255. Its
position, velocity, and acceleration integration residual was below
`3e-15`. The joint route is slightly longer, but it is substantially faster
than the original path-first clock and removes its large acceleration jumps.
The continuous pass then improves both lattice path length and lattice time.

The timed-gate regression also verifies a capability the path-first study did
not have: the joint search found the shortest 24-degree route through three
moving openings with zero blocked samples. Wrapped `-175` to `+175` motion is
covered by a separate exact-integration regression.

The broader examples show why this remains opt-in:

| Existing example | Joint result | Interpretation |
|---|---:|---|
| 08, alternating slalom | 48.881 deg / 18.000 s | Succeeds, but coarse jerk primitives lengthen the route |
| 09, U-trap | 40.659 deg / 14.000 s | Jointly backtracks and finishes, but spatial Dijkstra remains shorter |
| 10, rotating slots | 90 s study limit | Sparse frontier does not yet scale to this moving 2-D maze |
| 16, rising disk | 390.356 deg / 35.000 s | Coarse 5-degree level succeeds; the specialized path-first result remains much closer to its absolute bounds |

These are direct, no-fallback study runs. They demonstrate capability, not a
claim that joint state space always produces a better command.

### Remaining boundary

This is much closer to physical state space, but still discrete. Its guarantee
is optimal weighted cost on the searched lattice. Fine two-dimensional moving
scenes can be expensive: the rotating-slot example reached a 90-second study
budget after expanding 31,124 states. Profile fallback remains necessary for
such cases. Adaptive action sets, dominance pruning, and better kinodynamic
heuristics are the next scaling improvements.

The circular direct optimizer is a study tool, not a general replacement for
the polygon planner. It uses a smooth analytic circle constraint so MATLAB can
refine the path efficiently. General moving polygons still use the joint A*
lattice and its exact collision validation.

## Reproduce

```matlab
result = example17KinematicStateSpaceStudy();
jointResult = example18JointBoundedJerkStudy();
```

Inspect:

```matlab
result.studyPlan.retiming.StateSpaceSearch
result.diagnostics
jointResult.jointPlan.retiming.StateSpaceSearch
jointResult.continuousRefinement
jointResult.diagnostics
```

To continue optimizing from the stored Pareto trajectory:

```matlab
options = optimizeCircularBoundedJerkTrajectory();
options.IntervalCount = 80;
options.Objective = "minimumTime";
reference = storedCircularBoundedJerkReference();
circle = struct("Center_deg", [0 0], "ProtectedRadius_deg", 3.5);

continued = optimizeCircularBoundedJerkTrajectory( ...
    jointResult.initialState, jointResult.goalState, jointResult.limits, ...
    circle, reference.trajectorySeed, options);
```
