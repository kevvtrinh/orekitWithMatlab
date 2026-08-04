# Design: Reverse Dijkstra + Forward Kinodynamic A*

## 1. Scope and authoritative pipeline

`planAzElTrajectory` owns one production pipeline:

```text
validate and normalize
  -> construct the finite spatial relaxation
  -> run multi-source reverse Dijkstra
  -> run one reopening forward kinodynamic A*
  -> reconstruct stored motion laws
  -> independently re-evaluate every segment
  -> assemble one stable result
```

`planAzElDijkstra` and `planAzElMovingTargetIntercept` are compatibility
facades. They translate their documented positional arguments into the neutral
scenario structure, call `planAzElTrajectory` exactly once, and add aliases
needed by existing callers. They do not search, generate motion, select an
intercept, append tracking samples, or perform fallback planning.

The obstacle packing, point-query, and visualization utilities remain shared
data services. None may create or alter a route.

## 2. State, controls, and finite motion library

The physical state is

```text
x = [q_az, q_el, v_az, v_el, a_az, a_el, t].
```

Azimuth is continuous and unwrapped inside the planner. A single canonical
wrap is applied only for obstacle queries and public `position_deg` samples.

Every stored edge is a three-phase, piecewise-constant-jerk motion. For total
duration `T`, every phase has duration `h = T/3`. On each phase and axis,

```text
a1 = a0 + j h
v1 = v0 + a0 h + 0.5 j h^2
q1 = q0 + v0 h + 0.5 a0 h^2 + (1/6) j h^3.
```

For arbitrary finite endpoint states, the three jerks are the unique solution
of the endpoint map. With

```text
A = af - a0
B = vf - v0 - a0 T
C = qf - q0 - v0 T - 0.5 a0 T^2
S = A/h, V = 2B/h^2, P = 6C/h^3,
```

the exact controls are

```text
[j1; j2; j3] = (1/6) * ...
    [ 2 -3  1; -7  9 -2; 11 -6 1] * [S; V; P].
```

The endpoint-map determinant is nonzero for every `T > 0`. The same evaluator
is used by propagation, collision checking, reconstruction, output sampling,
plotting data, and final validation.

The finite forward stencil consists of deterministic spatial offsets and
snapped durations. At rest states, each offset/duration pair therefore owns a
fixed three-phase jerk sequence; their union is the finite jerk alphabet.
There is one zero-jerk hold primitive. The exact initial state and terminal
state use the same three-phase law as boundary connectors. A connector is an
ordinary checked A* edge, not a second planner or post-search reset.

Search-lattice endpoints are stationary. The exact initial state may have
nonzero velocity or acceleration; its first accepted edge brakes or moves to a
stationary lattice state without discontinuity. Fixed and moving terminal
connectors enforce the requested terminal derivatives. This restricted finite
lattice is resolution-complete only for its documented primitive table.

## 3. Quantization, identity, and time

Position endpoints share one anchored azimuth/elevation grid. Time is an
integer multiple of `TimeStep_s` from the exact start time except for an exact
terminal connector. Generated lattice states have the invariant
`v = a = 0`; the exact boundary state has its own derivative class. State
identity is therefore `(positionCell, timeIndex, derivativeClass)`. No two
generated states with different physical time are duplicates.

In a time-invariant scene, an earlier stationary state with no larger cost may
dominate a later state at the same cell: the earlier state can reproduce the
later departure using the legal zero-jerk hold, and the environment is
unchanged. This dominance is never applied to moving obstacles or moving
goals. Every such prune is counted.

Spatial, temporal, velocity, and acceleration tolerances are centralized in
the default options. Quantization never overwrites a propagated physical
state. A finite-search failure is reported as resolution- or resource-limited,
not as continuous infeasibility.

## 4. Relaxed spatial graph

The reverse graph projects a forward state to its position cell and discards
velocity, acceleration, time, moving obstacles, and terminal derivatives. Its
edge table contains every spatial offset in the forward stencil in both
directions. The angular edge weight is the Euclidean chord between its endpoint
cells. The duration lower-bound edge weight is that chord divided by
`hypot(maxVelocityAz, maxVelocityEl)`.

Only nodes whose representative endpoint is blocked by geometry proved static
over the complete planning horizon may be removed. Moving or questionable
geometry is ignored. Relaxed edges are never removed merely because a sampled
line appears blocked; keeping an optimistic tunneling edge is safer than
invalidating the lower bound.

Fixed goals seed the goal cell and neighboring cells that may contain an exact
terminal connector. Moving goals seed the union of cells occupied by target
samples in the admissible arrival window. Every seed starts at zero, ignoring
terminal derivative and timing costs.

Reverse Dijkstra uses a binary min-heap ordered by accumulated cost, cell id,
and insertion serial. A popped entry whose cost no longer matches the best
cell label is stale. Diagnostics record pushes, pops, stale pops, settlements,
relaxations, seeds, unreachable cells, and elapsed time.

## 5. Lower-bound argument

For every accepted forward lattice edge `e = (x, x')`, the relaxed graph has
the projected edge `(pi(x), pi(x'))`. Its angular chord is no greater than the
forward edge's nonnegative angular-travel cost. Its chord divided by the
maximum two-axis speed norm is no greater than the edge duration. A feasible
forward endpoint is never one of the removed always-blocked nodes. Every
forward path therefore projects to a relaxed path whose accumulated relaxed
cost is no greater than the forward cost.

The Dijkstra value at a projected state is consequently a lower bound on the
implemented finite graph. Goal-cell zero seeding is optimistic for off-grid
terminal connectors. Lookup also takes the lower envelope with the analytic
straight-line bound so a long terminal connector cannot make the field
overestimate.

For `minimumAngularDistance`, `h` has degree units. For `minimumTime`, the
angular field is divided by the maximum speed norm and `h` has second units.
Unsupported nonnegative objective terms contribute zero. No weighted or
inflated heuristic is used.

The lower envelope is admissible but is not assumed consistent. An exhaustive
small-graph audit compares it with exact remaining forward costs and checks
projection coverage for every primitive.

## 6. Forward A* rules

The forward heap is ordered deterministically by `(f, -g, stateId, serial)`;
the `-g` tie break prefers progress among equal admissible `f` values without
altering cost. Every relaxation uses exact nonnegative additive edge cost.
Stale entries are skipped. A better label reopens a state even if an older
record was closed.

A validated terminal connector produces an incumbent cost `C`. Search ends
optimally on the finite graph only when the minimum open `f` cannot improve
`C`. Resource expiry may return a validated incumbent marked non-optimal;
otherwise it returns resource exhaustion. It never launches Dijkstra, a safe
interval planner, a direct-path planner, a target-time loop, or a recovery
planner.

The `minimumAngularDistance` edge cost is the deterministic chord-sum of the
stored phases; a hold costs zero. The `minimumTime` edge cost is duration. Both
are finite, scalar, additive, and nonnegative. Queue tie-breaks do not enter
the objective.

## 7. Bounds, collision safety, and interpolation

For every constant-jerk phase, acceleration extrema occur at endpoints.
Velocity extrema are checked at endpoints and at `a(t) = 0`. Position extrema
are checked at endpoints and every real in-range root of the quadratic
velocity. Jerk is checked directly. Joins preserve exact `q`, `v`, and `a`;
jerk may change finitely without an impulse.

Obstacle geometry uses the existing authoritative policy: nearest source time
slice, no extrapolation, and configured adjacent-slice temporal padding.
Every edge is queried in increasing physical time at endpoints, phase
boundaries, crossed obstacle event times, and uniform conservative
subdivisions. The result reports the largest unchecked time and the associated
maximum-motion bound. The same policy is rerun independently after
reconstruction.

A wait is legal only when position is unchanged, velocity and acceleration are
within stationary tolerance, and all three jerk phases are zero. A moving
state must reach rest through the same checked motion law.

## 8. Goals and tracking

One terminal predicate handles fixed and moving requests. Fixed requests match
the exact goal position, time, velocity, and acceleration. Moving requests use
one linear target-state interpolator over unwrapped azimuth samples and match
the configured position/velocity/acceleration tolerances at an admissible
arrival time.

Tracking is evaluated as the continuation of the same terminal edge. Each
target interval is represented by the same three-phase constant-jerk law and
checked for bounds and collision before it becomes part of the incumbent.
Tracking ends at the requested time or at the first unsafe interval. No raw
target sample is appended and every returned sample belongs to a validated
stored segment.

## 9. Runtime and memory policy

Budgets are based on public resource limits, domain/grid size, time horizon,
and the common primitive table. Production code does not read example names,
descriptions, obstacle names, random seeds, assertion text, known coordinates,
or fixture identity. Numeric arrays are preallocated to bounded capacity,
heaps are compact, immutable obstacle data is packed once, and collision
queries use broad-phase time and bounding-box rejection.

Diagnostics separate representation, reverse-Dijkstra, forward-A*,
reconstruction, and validation time. They report state counts, heap counts,
pruning/rejection causes, collision work, peak live states, and estimated
storage.

## 10. Guarantees and limits

Optimality is with respect to the selected finite state/time/primitive graph
and selected additive objective when A* reaches the open-bound termination
condition. The implementation does not claim continuous-space completeness or
global continuous optimality. Collision safety is conservative for the
documented piecewise-constant obstacle model up to the reported subdivision
and motion bound. A result is returned as successful only after independent
segment validation.
