# Simple Kinodynamic Dijkstra Compliance Check

This audit checks the baseline implementation against
[`SIMPLE_KINODYNAMIC_DIJKSTRA_SPEC.md`](SIMPLE_KINODYNAMIC_DIJKSTRA_SPEC.md).
It describes the state of the implementation on the `simpledjistra` branch.

## Implemented baseline

| Specification area | Status | Implementation evidence |
| --- | --- | --- |
| Canonical `azElData` input | Complete | The planner packs input with `buildAzElTimeObstacleField` and queries the same field used by the mature planner. |
| Azimuth/elevation/time occupancy | Complete | `occupancy(elevationIndex, azimuthIndex, timeIndex)` is built explicitly before the search and returned on `plan`. |
| Seven-coordinate state | Complete | On-demand state rows store azimuth, elevation, time, both velocity components, and both acceleration components. `stateSubscripts` documents and returns the key ordering. |
| Discrete jerk controls | Complete | The default is the Cartesian product of negative maximum, zero, and positive maximum jerk on each axis. A caller may supply a smaller explicit command matrix. |
| Constant-jerk propagation | Complete | Acceleration, velocity, and cubic position equations appear inline in the successor loop. |
| Position, velocity, acceleration, jerk, elevation, and time limits | Complete | Endpoint inputs, continuous propagated endpoints, analytic interior velocity and position extrema, discrete jerk commands, elevation samples, and the exact time grid are validated. |
| Azimuth wrapping | Complete | A full 360-degree domain omits the duplicate upper seam point, wraps propagated and collision-sample positions, and uses wrapped differences for mapping and terminal tests. |
| Uniform state grids | Complete | Position, velocity, and acceleration limits must be integer multiples of their uniform grid steps. Time must map to the uniform time grid within `timeTolerance_s`. |
| Explicit grid mapping | Complete | Every continuous successor is mapped to the nearest position, velocity, and acceleration value in the visible search loop. Half-cell error bounds and mapped endpoints are returned. |
| First-principles Dijkstra | Complete | Costs start at infinity, the initial cost is zero, the minimum-cost unsettled state is selected directly, and the recognizable relaxation operation stores cost, parent, and jerk. No graph or shortest-path toolbox API is used. |
| On-demand state storage | Complete | A generated-state row is created only for a new seven-index character key. `containers.Map` detects duplicates; flat arrays store costs, parents, controls, and settled flags. |
| Destination condition | Complete | The first version intentionally uses an **exact destination time**, within `timeTolerance_s`, plus independent position, velocity, and acceleration tolerances. Position alone is not sufficient. |
| Endpoint collision checks | Complete | Both specified and mapped initial and destination positions are checked. |
| Transition collision checks | Complete with documented sampling limit | Each constant-jerk cubic is sampled at `collisionCheckStep_s`, including its endpoint, and queried against time-varying polygons. `sampledCollisionValidated` reports success; `exactCollisionValidated` is deliberately `false`. |
| Holding versus coasting | Complete | `isWaiting` is true only when the discrete position does not change and the preceding velocity, acceleration, and applied jerk are all zero. A moving zero-jerk transition is not called waiting. |
| Parent reconstruction | Complete | The destination parent chain is reversed into timed position, velocity, acceleration, jerk, waiting, and state-index arrays. |
| Search and trajectory visualization | Complete | `plotSimpleAzElTimeKinodynamicDijkstra` shows generated/settled states, occupied space-time cells, the path, velocity, acceleration, jerk, and true holds. |
| Small runnable example | Complete | `examples/example_simple_azEl_time_kinodynamic_dijkstra.m` uses a moving full-height gate and asserts that a true hold occurs. |
| Focused verification | Complete | MATLAB tests cover rest-to-rest motion, a time-varying gate, and continuous unwrapped azimuth through the seam. |
| Excluded advanced methods | Complete | No safe intervals, A*, heuristics, motion primitives, smoothing, optimization, topology refinement, custom heap, caching, or parallel processing was added. Grid refinement is the first explicitly requested post-baseline extension. |

## Post-baseline feature: position-grid refinement

The planner now accepts `options.positionStepSchedule_deg`. A schedule such as
`[4 2 1 0.5]` runs the same visible first-principles Dijkstra algorithm on
independent, progressively finer azimuth/elevation lattices. Coarse failures do
not prevent finer attempts. The finest successful result is returned, and
`plan.gridRefinement.Levels` records the resolution, success, message, cost,
state counts, elapsed time, and selected level for every attempt.
Terminal tolerances are always measured against the specified destination,
not its nearest coarse-grid proxy, so a level that cannot represent the
endpoint closely enough fails rather than reporting a snapped false success.

This extension refines only the position grid. Time, velocity, acceleration,
jerk commands, collision sampling, and terminal semantics remain unchanged.
It deliberately does not introduce path corridors, heuristics, topology
refinement, or cached search state between levels.

## Deliberate first-version limitations

- Nearest-grid snapping makes the lattice finite, but a snapped successor can
  differ from the continuous constant-jerk endpoint by up to half a cell on
  each state axis. The bounds are returned in
  `plan.maximumDiscretizationError`; the specified and mapped endpoints are
  both returned for inspection.
- Collision checking is temporal sampling, not a continuous geometric proof.
  Reducing `collisionCheckStep_s` improves coverage at additional cost. The
  planner therefore never claims `exactCollisionValidated`.
- The destination time is exact in this baseline. Minimum-time-to-any-arrival,
  time windows, and unrestricted arrival times should be separate later
  extensions rather than hidden changes to the terminal rule.
- Basic minimum selection scans the generated state rows. This preserves the
  Dijkstra teaching sequence; a heap is intentionally deferred until measured
  runtime makes the selection step unusable.
- Dense occupancy is limited by `maximumOccupancyCells`, while the much larger
  seven-dimensional state space remains on demand.

## Coding-style audit

The implementation was checked against both the original specification and
`standalone/azElAvoidance/STYLE.md`:

| Style requirement | Audit result |
| --- | --- |
| Section 0 immediately after every function declaration | Complete: every planner, plotter, example, test, and local function has the required header. |
| Header order and banners | Complete: `SYNTAX`, `PURPOSE`, `INPUTS`, `OUTPUTS`, and `UNITS` appear in order, separated by `%` plus 74 asterisks. |
| Main numbered progression | Complete: occupancy construction, state axes, endpoint mapping, jerk controls, Dijkstra initialization, propagation, checks, relaxation, reconstruction, and packaging remain in execution order. |
| Sections inside loops | Complete: the Section 9 and Section 10 stages use dashed comments inside the search loop rather than nested MATLAB `%%` sections. |
| Descriptive names and units | Complete: endpoint, state-index, and physical-quantity names are explicit and unit-suffixed. |
| Public and diagnostic field casing | Complete: public `plan.*` fields use lower camel case; nested diagnostic records use PascalCase. |
| Visible Dijkstra implementation | Complete: minimum unsettled-state selection, propagation, collision checks, cost relaxation, parent storage, and reconstruction remain inline; no graph toolbox black box is used. |
| Local-function scope | Complete: local functions are limited to defaults and validation, one refinement responsibility, complete-transition checking, and parent reconstruction. No nested functions are used. |
| MATLAB Code Analyzer | Complete: `checkcode` reports zero findings for all four implementation and verification files. |

## Verification record

MATLAB `checkcode` reports zero findings for the planner, plotter, example,
and focused test file. The focused test suite contains five passing tests:

1. rest-to-rest kinodynamic propagation and dynamic limits;
2. a moving full-height obstacle that produces a true hold;
3. a wrapped `179 deg` to `-179 deg` slew whose unwrapped endpoint is
   `181 deg`;
4. coarse-to-fine `[4 2 1 0.5]` position-grid refinement selecting the
   successful `0.5 deg` lattice;
5. rejection of a constant-jerk transition whose velocity exceeds its limit
   between two otherwise valid endpoint velocities.
