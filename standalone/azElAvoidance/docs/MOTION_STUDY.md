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

These limits are explicit so a later full kinodynamic implementation has a
clear target: jointly search `(az, el, azRate, elRate, time)`, add bounded-jerk
actions, and use adaptive state resolution without losing exact polygon
validation.

## Reproduce

```matlab
result = example17KinematicStateSpaceStudy();
```

Inspect:

```matlab
result.studyPlan.retiming.StateSpaceSearch
result.diagnostics
```
