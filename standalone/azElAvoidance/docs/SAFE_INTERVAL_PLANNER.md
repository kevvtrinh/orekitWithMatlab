# planAzElSafeIntervalAStar: Unified Safe-Interval Planner

## Purpose

`planAzElSafeIntervalAStar` is a single-algorithm alternative to
`planAzElAdaptiveAStar`. The baseline planner routes static geometry through
progressive goal-rooted Dijkstra and moving geometry through progressive
safe-interval A*, giving two search stacks with separate retiming and
validation paths. This planner keeps one search — safe-interval A* (SIPP) —
for every case and treats static geometry as the degenerate instance in
which each lattice point has exactly one safe interval.

It exists to answer an Occam's-razor question benchmarked in
`benchmarks/runPlannerComparisonBenchmark.m`: is one understandable
algorithm enough for every documented scenario, and what does the
simplification cost? The measured answer and a replacement recommendation
are at the end of this document.

## Algorithm selection

Three minimal candidates were compared before implementation:

| Candidate | Static | Moving | Waiting | Long horizons | Verdict |
| --- | --- | --- | --- | --- | --- |
| 2-D A*/backward Dijkstra cost map | yes | no | no | yes | needs a second algorithm for moving volumes — this is the baseline's two-branch design |
| Time-expanded A* over (az, el, t) | yes | yes | one state per time step | no — an 86,401-slice day multiplies the state count | rejected |
| Safe-interval A* (SIPP) | yes (degenerate single interval) | yes | native (continuous inside an interval) | yes (slice times compress into intervals) | selected |

SIPP is the only one of the three that covers every required behavior —
static and moving obstacles, azimuth wrapping, velocity/acceleration
limits, waiting, and a velocity-matched terminal edge — with one state
space and one expansion rule.

## State representation

A search state is `(lattice point, safe interval index)`:

- The lattice point is an azimuth/elevation grid node (details below). Two
  reserved cell ids describe an off-lattice start or goal exactly; a
  lattice-coincident endpoint shares the ordinary cell id so endpoint
  states merge with grid states.
- The safe interval is one maximal run of collision-free obstacle event
  times at that point. Arrival time is a label optimized per state, not
  part of the state, so waiting never multiplies states.
- States are keyed as `cellId + cellIdSpace * (intervalIndex - 1)` and the
  best (earliest) arrival label per key lives in a flat numeric array
  (hash-map fallback above 5e7 keys).
- The boresight is at rest at every search state. Velocity appears only
  inside edges: the analytic slew profile between states and the optional
  quintic terminal edge.

## Discretization

- Space: one regular lattice at `GridStep_deg` anchored at the lower
  limits. With `AllowAzimuthWrap`, the azimuth step is adjusted so an
  integer bin count tiles exactly 360 degrees and indices wrap modulo the
  bin count. `GridStepSchedule_deg` is accepted for option compatibility
  but not used — there is deliberately no progressive multi-resolution
  machinery.
- Time: obstacle slice times inside the horizon (capped at
  `MaximumSafeIntervalSamples`, endpoints preserved) are the only event
  instants; safe intervals are run-length compressed from point queries at
  those instants. When `isAzElTimeObstacleWorkspaceStatic` proves the
  geometry never changes over the horizon, the event list collapses to the
  two endpoints, every point has at most one interval, and one vectorized
  packed-polygon query classifies the whole lattice up front (the "static
  mask").

## Graph edges

1. **Rest-to-rest slews.** Neighbor offsets are the same symmetric
   primitive star as the baseline (`DirectionStep_deg` /
   `DirectionAngles_deg` directions times `PrimitiveRadii_deg` or
   `GridStep_deg * PrimitiveRadiusMultipliers` radii), snapped once to
   exact lattice deltas ("edge templates") with precomputed trapezoid
   parameters. The exact goal position is appended to every expansion so an
   off-lattice goal stays reachable.
2. **Waiting.** Implicit: a departure may be any time inside the parent's
   interval, so an edge is "wait then slew".
3. **Terminal capture.** With `AllowNonzeroTerminalState` and nonzero goal
   velocity/acceleration, a quintic edge from any expanded state arrives
   exactly at `goalState.time_s` matching all six boundary conditions;
   departure time (hence quintic duration) is searched over interval and
   uniform trial instants.

### Edge feasibility

The departure window for an edge with slew duration `T` from interval
`[a1, b1]` into interval `[a2, b2]` after arriving at `t_arr` is
`[max(t_arr, a2 - T), min(b1, b2 - T)]` — exactly the departures that keep
both endpoint occupancies safe. Mid-slew freeness is then confirmed:

- Moving volumes: the swept motion of every proposed edge's earliest
  departure is sampled at `CollisionCheckStep_s` plus instants aligned to
  the `ValidationStep_s` and `SampleTime_s` mission grids, and the whole
  expansion resolves in **one** vectorized packed-polygon query. If the
  earliest departure is blocked mid-slew, later trials (event times inside
  the window, capped at `MaximumDepartureTrials`) are swept in one more
  query.
- Static volumes: lattice edges pass when the static mask clears every
  interior cell the slew crosses (cell lists precomputed per template);
  the appended goal edge is confirmed with an exact sampled query only
  after a cheap mask walk along the segment survives. This matches the
  baseline static branch's collision rigor during search — in both
  planners, exactness for static scenes is delivered by the exact
  shortcut checks and the final dense validation, not by per-edge queries.

## Cost function and heuristic

- Cost-to-come: earliest arrival time. Keeping only the earliest arrival
  per (point, interval) preserves all future options — waiting is free —
  which is the standard SIPP dominance argument.
- Heuristic: minimum obstacle-free slew time to the goal (closed-form
  trapezoid law; rate-only bound when the final edge is a quintic
  capture). Admissible and consistent for the arrival objective; scenario
  options may weight it (`HeuristicWeight`), trading optimality for speed
  exactly as in the baseline.
- `Objective` is honored at the reporting level as in the baseline:
  `minimumAngularDistance` reports the shortcut route's angular length and
  a suboptimality bound against the straight-chord lower bound;
  `optimalGlobally` is claimed only when the returned length matches that
  lower bound to 1e-9.

## Space-time shortcut pass

The raw SIPP route contains lattice staircase corners. One unified pass
replaces waypoint chains `i .. j` with a direct slew when an exact check
allows it, departing as late as possible so the bypassed node's recorded
departure time — and therefore the entire downstream schedule — is
untouched; the extra wait moves to node `i`. Holds are trivially safe in
static workspaces and re-validated by sampling in moving ones; bypass
segments use the same exact motion sampling as search edges (with a static
mask walk as a cheap pre-filter). Deltas use the unwrapped trace, so the
pass preserves the route's winding and never rebuilds the terminal quintic
edge.

## Kinematic enforcement

Both axes follow one normalized progress law per slew; the most
restrictive normalized rate and acceleration keep each physical axis
inside `maxVelocity_deg_s` / `maxAcceleration_deg_s2` (identical math to
the baseline). Quintic terminal edges are sampled and rejected if any
sample exceeds a limit. The emitted profile is the same trapezoid /
quintic evaluation used during search, so the command cannot disagree with
what was checked.

## Waiting behavior

Waiting appears wherever the scheduled departure is later than the arrival
at a node: the profile holds position with zero rate and acceleration and
marks `plan.isWaiting`. Long waits cost nothing during search because time
is continuous inside an interval.

## Azimuth wrapping

`AllowAzimuthWrap` (span must be exactly 360 degrees) makes azimuth indices
modular and all deltas shortest-signed. The route keeps an unwrapped trace
for length, dynamics, and profiles, and a canonical wrapped trace for
collision queries and output — the same dual representation as the
baseline.

## Collision validation

The lattice, mask, and intervals only guide the search. Every returned
command is validated against the packed polygon workspace
(`queryAzElTimeObstacle`, polygon mode, the configured `SafetyMargin_deg`
and `TimePaddingSamples`) at both `ValidationStep_s` density and the
returned sample grid; any hit fails the plan. The benchmark additionally
re-validates every trajectory against a workspace packed directly from the
original `azElData`, independent of anything the planner returned.

## Pseudocode

```text
events   = obstacle slice times in horizon (2 endpoints if static)
static   ⇒ classify whole lattice in one polygon query (free mask)
S0       = (start point, interval containing t0);  fail if none
G        = (goal point, interval containing tGoal); fail if none
push S0 with f = t0 + w·h(S0)

while open not empty (within MaxExpansions / MaxSearchTime_s):
    s = pop lowest f; skip stale labels
    if s is goal state (or a terminal-capture node): break
    if terminal dynamics: try quintic capture edge from s
    candidates = template neighbors of s + exact goal point
    proposals  = (candidate, interval) pairs with nonempty departure
                 window, deadline-feasible bound, not label-dominated
    static: mask-check crossed cells (goal edge: mask walk then exact)
    moving: one vectorized query over all earliest departures,
            per-edge later-departure retry on mid-slew blockage
    relax survivors with arrival = departure + T

route   = parent chain of goal label
route   = exact space-time shortcut pass
profile = trapezoid/quintic sampling at SampleTime_s
fail unless dense exact validation of profile passes
```

## Complexity

For `N` lattice points, `K(q)` safe intervals at point `q`, and `B`
primitive offsets:

- states ≤ Σ K(q) ≤ N · ceil((events+1)/2); expansions ≤ states.
- Each expansion is O(B) window/label arithmetic plus, for moving volumes,
  one vectorized polygon query over O(B · samples-per-edge) points (plus
  rare retry queries). Static volumes pay one up-front O(N) query and then
  O(B · crossed-cells) mask lookups per expansion with no per-edge queries.
- Heap operations are O(log states); labels are O(1) array reads.
- The shortcut pass is O(route²) mask walks with exact queries only on
  surviving bypasses; the final validation is one query over the profile.

Compared with the baseline: the static branch loses Dijkstra's
"one settled pass, no heuristic, no time labels" minimalism but gains
identical treatment of static and moving worlds; the dynamic branch is the
same SIPP idea minus progressive resolution levels, departure batching
options, and the direct-certificate special case.

## Completeness and optimality limitations

- Complete only with respect to the finite lattice, the sampled event
  times, and the sampled departure trials — the same qualifications as the
  baseline. A failure is not a proof that no continuous solution exists.
- Earliest-arrival ordering with an admissible heuristic returns
  earliest-arrival routes on the searched graph when `HeuristicWeight = 1`;
  scenario-configured weights (some examples use 4–12) make it bounded
  suboptimal, as they do for the baseline.
- Angular distance is optimized only indirectly (arrival-ordered search
  plus the shortcut pass), so `minimumAngularDistance` results carry a
  reported suboptimality bound, and `optimalGlobally` is set only for
  straight-chord certificates.
- Static-mode search edges trust the inflated cell mask between exact
  checks, exactly like the baseline's static lattice; clipping hazards are
  caught by the shortcut's exact segment checks and the final dense
  validation, which fail the plan rather than return an unchecked command.
- The single resolution means a lattice too coarse to represent a passage
  fails outright instead of being rescued by a finer scheduled level; the
  scenario's documented `GridStep_deg` must resolve the passage.
- Safe intervals are closed runs of sampled event times; sub-sample
  obstacle flickers between event times are handled conservatively by
  `TimePaddingSamples` in every query, not by the interval structure.

## Measured benchmark results

Produced by `benchmarks/runPlannerComparisonBenchmark.m` (single entry
point; MAT + CSV outputs; identical builder-produced inputs for both
planners; authoritative re-validation against the original packed
polygons; declared chessboard seeds, none filtered).

Execution environment for the numbers below: GNU Octave 8.4 (headless
Linux container; MATLAB was unavailable), with a mechanical
double-quoted-string transpilation plus `string`/`RandStream` shims, and
`SearchTimeScale = 4` applied identically to both planners to compensate
for interpreter speed. Wall-clock comparisons are therefore fair *between*
the two planners but not representative of MATLAB absolute times; the
chessboard seed-to-board mapping under the Octave shim differs from
MATLAB's `RandStream`, so seeds reproduce boards within this environment.
Re-run the same entry point under MATLAB R2024b for native numbers.

RESULTS_TABLE_PLACEHOLDER

## Recommendation

RECOMMENDATION_PLACEHOLDER
