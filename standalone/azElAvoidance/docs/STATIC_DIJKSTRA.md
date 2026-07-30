# Static Goal-Rooted Dijkstra

## Why this branch exists

When every obstacle polygon is unchanged throughout a maneuver, time does
not change which azimuth/elevation positions connect. The unified
`planAzElDijkstra` entry point therefore solves topology in two
dimensions before applying actuator timing.

The implementation uses one maintainable static algorithm:

1. rasterize the complete az/el domain;
2. propagate exact lattice cost backward from the goal with Dijkstra;
3. recover a route by following stored successors from the initial state;
4. shorten that route with exact polygon visibility checks;
5. apply rate- and acceleration-limited rest-to-rest slews; and
6. validate the sampled command against the original packed polygons.

No guide path, direction hint, route tube, or second static planner is used.

## Backward cost propagation

Let each free grid state be \(q_i=[\alpha_i,\epsilon_i]^T\). Free
eight-connected neighbors share an edge with angular cost

\[
c(q_i,q_j)=\sqrt{
  \Delta\alpha_{\mathrm{wrap}}^2+
  \Delta\epsilon^2}.
\]

The goal state is inserted into a minimum heap with cost zero. Whenever a
state \(q_i\) is settled, each free neighbor \(q_j\) is relaxed:

\[
J(q_j)\leftarrow
\min\left(J(q_j),\,c(q_j,q_i)+J(q_i)\right).
\]

When the candidate through \(q_i\) is better, the planner stores
`nextTowardGoal(q_j)=q_i`. Search ends when the initial state is settled.
The resulting `CostToGoal_deg` is a discrete navigation function over all
settled states.

```text
cost(goal) = 0
frontier.push(goal)

while frontier is not empty:
    current = frontier.popMinimumCost()
    if current is initial:
        break

    for each collision-free neighbor:
        candidate = cost(current) + edgeDistance(neighbor, current)
        if candidate < cost(neighbor):
            cost(neighbor) = candidate
            nextTowardGoal(neighbor) = current
            frontier.push(neighbor, candidate)

route = initial
while route.last is not goal:
    route.append(nextTowardGoal(route.last))
```

Because all edge costs are nonnegative, the first settled value at each
state is its globally minimum cost on that finite lattice. The algorithm is
uninformed: unlike A*, it does not rely on a heuristic or preferred
direction.

## Progressive discretization

If the requested finest spacing is \(h\), the default complete-domain
schedule is

\[
[4h,\;2h,\;h].
\]

Coarse levels can reject disconnected representations quickly. Finer levels
represent narrower gaps and usually produce shorter validated routes. Every
successful level is retained in `plan.resolutionAttempts`; the shortest
exact-validated result is selected.

This is global refinement. Grid cells become denser everywhere, not only
near a previously discovered route.

## Exact geometry remains authoritative

Grid occupancy discovers connectivity but does not certify a command.
After Dijkstra:

- adjacent and shortcut segments are sampled against packed polygons;
- each retained segment receives a synchronized triangular or trapezoidal
  motion law;
- collision validation uses an internal time step no larger than one
  quarter-grid traversal at maximum rate; and
- the final plan is returned only if those exact polygon queries are free.

A failed coarse grid is not proof that no continuous route exists. A
successful grid route that fails exact validation is also rejected.

## Diagnostic fields

The selected static result exposes:

| Field | Meaning |
| --- | --- |
| `plan.topologySearch.CostToGoal_deg` | Cost-to-go grid; unsettled states remain `Inf` |
| `plan.topologySearch.SettledMask` | States whose minimum lattice cost was finalized |
| `plan.topologySearch.BlockedMask` | Inflated occupancy grid |
| `plan.topologySearch.GridNodePath` | Initial-to-goal lattice successor chain |
| `plan.topologySearch.LatticeDistance_deg` | Optimal distance on the selected lattice |
| `plan.preShortcutRoute_deg` | Requested endpoints plus raw lattice route |
| `plan.autonomousRoute_deg` | Exact-visibility-shortened route |
| `plan.resolutionAttempts` | Coarse-to-fine candidates and termination reasons |

Along `GridNodePath`, `CostToGoal_deg` must decrease strictly until it reaches
zero at the goal. This invariant is tested in `testAzElStaticDijkstra`.

## Guarantees

- Dijkstra is globally shortest on each completed finite occupancy lattice.
- Diagonal moves cannot cut between two blocked orthogonal neighbors.
- Azimuth edges use the shortest wrapped displacement when wrapping is
  enabled.
- Every returned profile passes the configured packed-polygon checks and
  respects axis rate and acceleration limits.

The continuous-space path is not generally proven globally shortest. The
straight collision-free route is the exception because it reaches the
Euclidean angular lower bound.

## Complexity

For \(N\) grid states and at most eight edges per state, binary-heap
Dijkstra is

\[
O(N\log N)
\]

in the worst case, with \(O(N)\) cost, successor, occupancy, and settled
storage. Polygon rasterization and exact visibility checks can dominate the
heap propagation for detailed obstacle boundaries.

## Spiral benchmark

The five-turn spiral uses no hints. On the current test geometry, the
0.5-degree result is approximately 241.4 degrees and winds slightly more
than four turns around the center. Runtime varies by machine; the Dijkstra
heap itself is normally much cheaper than occupancy rasterization and exact
shortcut validation.
