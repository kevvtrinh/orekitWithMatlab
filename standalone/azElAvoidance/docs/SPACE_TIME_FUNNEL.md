# Unified Az/El Space-Time Funnel

## Purpose

`planAzElSpaceTimeFunnel` plans a boresight command through a static or moving
azimuth/elevation obstacle volume. Time is the third workspace coordinate,
but the controlled state also includes azimuth/elevation rate and
acceleration. The implementation is standalone and depends only on canonical
`azElData`, boundary states, actuator limits, and planner options.

The design targets long scenarios where a full
azimuth/elevation/rate/time lattice would be too large. It combines three
methods behind one planner entry point:

1. A direct wait-and-slew optimality certificate.
2. Any-angle topology acceleration for static obstacle volumes.
3. Event-compressed Safe Interval Path Planning (SIPP) for topology and
   waiting decisions.
4. A widening spatial funnel followed by kinodynamic Anytime Repairing A*
   (ARA*) for smooth lattice refinement.

## Problem

Let the boresight configuration be:

```text
q(t) = [azimuth(t), elevation(t)].
```

The command must remain outside every moving polygon `O_i(t)`, obey angular
position limits, optionally wrap azimuth, and satisfy per-axis rate and
acceleration bounds. Start and stop position, velocity, acceleration, and
time are fixed.

The default objective is angular path length. A minimum-time mode is also
available, although a fixed stop time still defines the planning horizon.

## Algorithm

### 1. Direct certificate

The planner first builds a synchronized rest-to-rest triangular or
trapezoidal slew along the wrapped endpoint chord. Candidate departure times
come from safe-interval events. If any departure lets the vehicle wait at
the start, traverse the chord, and wait safely at the stop, the path length
equals the Euclidean wrapped endpoint distance.

No feasible path can be shorter than that endpoint distance, so this result
is a continuous-space global optimum for the angular-distance objective.
`plan.optimalGlobally` is true only for this certificate.

### 2. Static topology acceleration

When every obstacle slice is unchanged over the requested interval, the
planner compresses the volume to one inflated occupancy raster. A
Theta*-style any-angle search discovers the obstacle homotopy, optional
narrow-tube refinement improves that route, and visibility shortcutting
removes unnecessary stops. The resulting polyline is dynamically retimed
and densely checked against the original polygons. This avoids expanding a
large number of identical safe-interval states for deep static structures
such as spirals and cul-de-sacs.

This is an internal mode of `planAzElSpaceTimeFunnel`; examples do not select
a separate planner or provide a route.

### 3. Event-compressed safe-interval guide

If the direct chord cannot be certified, the guide lazily associates each
visited az/el grid point with run-length-compressed safe time intervals.
A search state is:

```text
(azimuth grid point, elevation grid point, safe interval index)
```

It is not one state per time sample. Long waits remain one state. Spatial
successors use configurable polar motion primitives plus a direct goal
primitive. Every transition is a synchronized analytic rest-to-rest slew.
Departure times jump among relevant obstacle events and safe-interval
boundaries.

The guide searches for early feasible arrivals with an inflated
time-to-go heuristic. It is intended to discover useful space-time topology,
not certify a global optimum.

### 4. Widening kinodynamic funnel

The feasible guide trajectory defines a time-indexed spatial tube. The
existing five-dimensional kinodynamic ARA* then searches position, angular
rate, and time states inside that tube. Constant-acceleration controls are
used as motion primitives.

The tube radius follows `CorridorRadiusSchedule_deg`. A narrow first pass is
fast; later passes recover alternatives that the first tube excludes. An
optional unrestricted final pass removes the guide-tube restriction when
resources allow.

ARA* reuses search information while reducing epsilon. Its reported bound
applies to the configured finite lattice and, for a funnel pass, only to
that restricted lattice. It is not a continuous global-optimality claim.

### 5. Validation

Candidate guide edges are checked on:

- a dense internal collision grid,
- the exact requested output-time grid, and
- the exact dense final-validation grid.

Every returned trajectory is independently checked against the original
packed moving polygons, including configured neighboring time slices and
safety margin. Rate and acceleration are produced analytically for guide
segments or directly by the kinodynamic lattice.

## Performance model

Let:

- `T` be input obstacle samples,
- `E` be retained safe-interval event samples,
- `V` be lazily visited guide positions,
- `K` be the number of kinodynamic states inside a funnel.

The guide stores approximately `O(VE)` point-occupancy results and expands
safe intervals rather than `O(T)` wait states at each point. `E` is capped
by `MaximumSafeIntervalSamples`. The refinement cost is approximately
`O(K log K)` and is controlled primarily by time step, angular/rate
resolution, acceleration levels, and funnel radius.

The direct certificate often avoids both graph searches. The included
`benchmarkSpaceTimeFunnelLongHorizon` uses 86,401 obstacle slices and reports
event compression, wall time, memory, and expansions.

## Guarantees and limitations

- A successful direct certificate is globally shortest for angular path
  length in the continuous wrapped az/el plane.
- A completed ARA* epsilon-1 pass is optimal only on its configured finite
  lattice. A funnel-restricted pass is optimal only inside that funnel.
- Other safe-interval guide results are feasible but not globally optimal.
- Collision guarantees use the workspace's sampled-time semantics and the
  configured validation spacing. Continuous obstacle motion between input
  slices is not reconstructed.
- Event capping can miss a very short safe window. This causes a conservative
  failure to find a path, not acceptance of an unvalidated path. Raise
  `MaximumSafeIntervalSamples` for rapidly changing geometry.
- The safe-interval guide currently requires zero start/stop rate and
  acceleration. Nonzero boundary derivatives use unrestricted kinodynamic
  ARA* when enabled.
- All search methods are resolution-complete rather than complete in an
  unconstrained continuous state space.

## Practical tuning

- Start with `GuideGridStep_deg` near the obstacle clearance scale.
- Keep `ValidationStep_s` small enough that the fastest boresight cannot
  cross a thin obstacle between checks.
- Use an increasing corridor schedule such as `[2 4 8]` degrees.
- Use `[2.5 1.5 1]` for a final lattice-optimal ARA* pass, or omit `1` when
  a faster bounded answer is preferred.
- Increase `MaximumSafeIntervalSamples` when brief time windows matter.
- Disable ARA refinement when a rest-to-rest guide trajectory is sufficient.

## References

1. M. Phillips and M. Likhachev, "SIPP: Safe Interval Path Planning for
   Dynamic Environments," *IEEE International Conference on Robotics and
   Automation*, 2011. <https://doi.org/10.1109/ICRA.2011.5980306>
2. M. Likhachev, G. Gordon, and S. Thrun, "ARA*: Anytime A* with Provable
   Bounds on Sub-Optimality," *Advances in Neural Information Processing
   Systems 16*, 2003.
   <https://proceedings.neurips.cc/paper/2003/hash/ee8fe9093fbbb687bef15a38facc44d2-Abstract.html>
3. M. Pivtoraiko and A. Kelly, "Efficient Constrained Path Planning via
   Search in State Lattices," *International Symposium on Artificial
   Intelligence, Robotics and Automation in Space*, 2005.
4. P. Fiorini and Z. Shiller, "Motion Planning in Dynamic Environments
   Using Velocity Obstacles," *International Journal of Robotics Research*,
   1998. <https://doi.org/10.1177/027836499801700706>
