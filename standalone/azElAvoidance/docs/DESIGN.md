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

Every stored segment is a packed three-phase, piecewise-constant-jerk law.
For total duration `T`, every packed phase has duration `h = T/3`. On each
phase and axis,

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

The rolling control alphabet is the Cartesian product `{-J, 0, +J}` on the
two axes. `J` is bounded by both the configured jerk limit and the acceleration
change possible in one `TimeStep_s`; when possible it is snapped downward so a
two-step `(+J,-J)` acceleration pulse lands on the position grid. Rolling
constant-jerk controls use durations of one, three, or four time steps. At zero
acceleration, the two-step pulse is also available. These controls accelerate,
coast, brake, and reverse without resetting a derivative.

Stationary grid states may additionally use cached rest-to-rest spatial macro
edges. A macro is a sequence of four packed laws generated and checked by the
same evaluator. It is an exact physical edge, not a waypoint velocity reset or
an alternate planner. Macro expansion is enabled only when its stationary
projection is the active finite graph. A zero-jerk hold is legal only at
`v = a = 0` within the centralized tolerance.

The exact initial state, every generated successor, and every terminal state
retain physical position, velocity, and acceleration. Fixed and moving
terminal connectors enforce requested terminal derivatives through the same
packed law and collision pipeline. A connector is an ordinary checked A* edge,
not a second planner or post-search reset. The finite graph is
resolution-complete only for this documented control and duration table.

## 3. Quantization, identity, and time

Position is identified by the nearest cell of one anchored
azimuth/elevation grid, but the propagated physical position is retained.
Velocity and acceleration are independently quantized on each axis using the
documented `velocityResolution_deg_s` and
`accelerationResolution_deg_s2` diagnostics. Time is an integer multiple of
`TimeStep_s` from the exact start time except for an exact terminal connector.
The general identity is therefore

```text
(positionCell, velocityBinAz, velocityBinEl,
 accelerationBinAz, accelerationBinEl, timeIndex).
```

No two generated states with different physical time are duplicates. A packed
numeric hash table owns the general identity. When preprocessing proves that
the enabled graph contains only stationary macro edges and stationary holds,
the derivative bins are invariant and a dense `(positionCell,timeIndex)` table
is an exact specialization. It is never selected for a nonzero initial
derivative or the aligned rolling graph.

No unproved cross-time or cross-derivative dominance is applied. An improved
label replaces the identity-table entry, and an older heap record becomes
stale; improved closed identities can reopen. Spatial, temporal, velocity, and
acceleration tolerances are centralized. Quantization never overwrites a
propagated physical state. Finite-search failure is reported as resolution- or
resource-limited, not as continuous infeasibility.

## 4. Relaxed spatial graph

The reverse graph projects a forward state to its position cell and discards
velocity, acceleration, time, moving obstacles, and terminal derivatives. Its
edge table contains every stationary macro offset in both directions. The
angular edge weight is the Euclidean chord between endpoint cells. The duration
lower-bound edge weight is that chord divided by
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

The reverse field is always built and reported. Its value is combined with the
forward heuristic only when preprocessing proves that the enabled forward
projection is the stationary macro stencil and no questionable static-node
removal was used. Otherwise the forward search retains the analytic
straight-line lower bound; a computed but unproved reverse value is never used.

For an aligned rolling fixed-goal graph with moving obstacles, a supplementary
time-layered spatial dynamic program may be built within a general entry
budget. It discards derivatives and uses a supergraph of one- and two-layer
rolling displacements. Endpoint occupancy is removed only where the same
obstacle policy guarantees a forward endpoint would be rejected. This table is
also a relaxation and is recorded under
`reverseDijkstra.dynamicRelaxation`.

## 5. Lower-bound argument

When the reverse field is enabled, every accepted macro edge `e = (x, x')`
has the projected edge `(pi(x), pi(x'))`. Its angular chord is no greater than
the edge's nonnegative angular-travel cost. Its chord divided by the maximum
two-axis speed norm is no greater than the edge duration. A feasible endpoint
is never one of the removed always-blocked nodes. Every enabled forward path
therefore projects to a relaxed path whose accumulated cost is no greater than
the forward cost.

The Dijkstra value at a projected state is consequently a lower bound on that
implemented finite graph. Goal-cell zero seeding is optimistic for off-grid
terminal connectors. The always-valid analytic straight-line bound is used in
all cases. A proved reverse or dynamic-relaxation value may strengthen it by
taking the maximum of lower bounds; an unproved table contributes nothing.

For `minimumAngularDistance`, `h` has degree units. For `minimumTime`, the
angular field is divided by the maximum speed norm and `h` has second units.
Unsupported nonnegative objective terms contribute zero. No weighted or
inflated heuristic is used.

The combined heuristic is treated as admissible but not assumed consistent.
The forward implementation therefore supports reopening and uses the incumbent
open-bound termination rule.

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

Obstacle geometry is never extrapolated beyond its sampled time range. For a
moving convex region with matching vertices, preprocessing forms a conservative
swept boundary from both endpoint polygons and the quadrilaterals swept by
their corresponding edges. At a query time, the base interval and the temporal
companion interval that reproduces nearest-source `+/-1` padding are tested.
If the region is not provably convex, the original nearest source slice and its
two adjacent source slices are tested instead.

Every edge is queried in increasing physical time at endpoints, packed-law
phase boundaries, crossed obstacle event times, and uniform subdivisions.
Terminal connectors through non-convex moving geometry are additionally
checked no more coarsely than the public output sample time. Search and final
segment validation call the same prepared-polygon containment and edge-distance
tests. The result reports the largest unchecked interval; it does not describe
a finite subdivision as exact continuous collision proof.

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
