# Dijkstra Readability Refactor

## Scope

This pass reveals the existing planner; it does not redesign it. The branch at
commit `7d9267b` remains the behavioral source of truth for public arguments,
defaults, output fields, static-versus-dynamic selection, graph connectivity,
motion primitives, timing, collision checks, and deterministic tie-breaking.

The maintained implementation still has one public entry point:
`planAzElDijkstra`. No alternate educational planner, generic graph layer,
heuristic, or toolbox shortest-path call was added.

A follow-up pass applies the same readability contract to every other MATLAB
file in `standalone/azElAvoidance`. This includes public obstacle and
visualization APIs, numbered examples, scenario support, benchmarks, the
documentation figure generator, and test entry points. A corrective runtime
pass then revisited every root API instead of treating existing section headers
as proof that its internal structure had already been reviewed. Scenario
equations, random draw order, planner options, validation thresholds, and
public result schemas remain the behavioral source of truth.

## Actual execution map

```text
planAzElDijkstra
    validate and normalize states, limits, and options
    build or reuse buildAzElTimeObstacleField output
    classify obstacle geometry over the planning horizon

    static minimum-angular-distance case
        run each global grid resolution from coarse to fine
        solveStaticGoalDijkstra
            check exact endpoint occupancy
            build the complete spatial grid
            classify grid occupancy
            map exact endpoints to free grid nodes
            initialize the goal-rooted angular-cost heap
            propagate cost-to-go labels from the goal
            store a successor toward the goal on every relaxation
            reconstruct the successor chain from the start
            connect the exact endpoints
            remove visible lattice corners
            retime the route with synchronized two-axis slews
            validate the timed route against packed polygons
        retain the shortest successful exact-validated candidate

    dynamic or terminal-capture case
        run each global grid resolution from coarse to fine
        searchAzElSafeIntervalDijkstra
            build the obstacle event timeline
            cache safe intervals at queried positions
            test the direct-route certificate
            build motion primitives
            initialize (position, safe interval) states
            propagate earliest-arrival labels
            schedule waiting and collision-free motion
            store parent and transition data on every relaxation
            reconstruct the selected state chain
            rebuild the continuous timed profile
            validate output and dense samples against packed polygons
        retain the best candidate for the requested objective

    normalize the stable public plan schema
```

## Static Dijkstra invariant

The static search starts at the goal and propagates

```text
J(v) = c(v,u) + J(u)
```

when the route through settled neighbor `u` improves node `v`. Because `u` is
closer to the goal, `u` is stored as `v`'s successor. Following successors from
the initial node therefore reaches the goal.

The binary heap is prioritized by angular cost. Improved labels are pushed as
new entries rather than applying decrease-key. A popped entry is ignored when
its label has already been superseded or its node is settled. This preserves
ordinary Dijkstra correctness while keeping the heap implementation compact
and deterministic.

## Dynamic Dijkstra invariant

A dynamic state is the pair

```text
(azimuth/elevation position, safe-interval index)
```

Its label is the earliest feasible arrival time:

```text
T(v) = earliest collision-free arrival inside v's safe interval
```

One position may therefore own several states. A transition may wait at its
parent before starting a rate- and acceleration-limited slew. A relaxation
replaces the state-key mapping only when the new arrival is earlier. The new
node stores its parent, departure time, arrival time, and motion duration.

The arrival heap also avoids decrease-key. Improved labels create a new node
and heap entry; the state-key mapping identifies and rejects obsolete nodes
when they are popped.

## Existing improvements retained

| Improvement | Basic operation improved | Why it remains valid |
| --- | --- | --- |
| Binary min-heaps | Select the minimum Dijkstra label | Heap order changes runtime, not relaxation semantics. |
| Stale-entry rejection | Update an existing label | The best current label remains authoritative without decrease-key. |
| Coarse-to-fine schedules | Search one global graph | Every level is a complete graph at its own resolution; successful candidates are validated and compared. |
| Wrapped azimuth | Generate neighbors and distances | Canonical output and shortest wrapped displacement preserve the periodic domain. |
| Packed polygon queries | Test occupancy and edges | The same authoritative geometry is used for search support and final validation. |
| Event-compressed intervals | Represent safe time | Consecutive safe event samples become one continuous waiting interval. |
| On-demand interval cache | Reclassify repeated positions | A position key has one authoritative interval classification per search. |
| Exact shortcut checks | Remove unnecessary grid corners | A corner is removed only when the complete replacement segment passes polygon queries. |
| Analytic slew retiming | Convert a spatial route to commands | Each segment obeys the supplied per-axis rate and acceleration limits. |
| Direct lower-bound certificate | Stop refinement | A collision-free straight route equals the Euclidean angular lower bound. |

## MATLAB utility review

No new toolbox dependency was introduced.

| Operation | Decision |
| --- | --- |
| Grid indexing | Keep `sub2ind` and `ind2sub`; they expose the matrix-to-node mapping directly. |
| Occupancy | Keep `queryAzElTimeObstacle`; MATLAB graph functions do not implement the packed moving-polygon semantics. |
| Static shortest path | Keep the explicit heap and relaxation loop; `shortestpath` would hide successor, settled, and cost-field diagnostics. |
| Dynamic shortest path | Keep the explicit safe-interval loop; MATLAB graph objects do not represent continuous waiting and on-demand interval states directly. |
| Safe-interval cache | Keep `containers.Map`; keys encode wrapped planner positions and interval identities. |
| Motion retiming | Keep the analytic triangular/trapezoidal profiles; no general optimization solver is needed. |

The retained custom heap helpers are planner support code, not competing
planner implementations. Their comparison and swap helpers are shared by push
and pop so ordering rules cannot diverge.

## Behavioral-equivalence evidence

Before structural edits, the focused public/static suite passed 9 of 9 tests.
The five-turn spiral baseline was:

```text
angular path length: 241.439 deg
winding:             4.09 turns
motion completion:   117.0 s
```

After the public, static, and dynamic readability edits, the same 9 tests
passed and the same three spiral values were reproduced. MATLAB Code Analyzer
reported zero messages for `planAzElDijkstra.m`.

The final full-suite result is recorded here after verification:

```text
37 passed, 0 failed, 0 incomplete
```

The final randomized blinking campaign passed all 5 fresh seeds. The stop/go,
Crossy Road, and spinning-rod spiral animation checks also passed.

The folder-wide follow-up produced the following additional evidence:

```text
MATLAB files with Section 0 headers: 50 of 50
MATLAB Code Analyzer messages:       0 across 50 files
Complete test suite:                 37 passed, 0 failed, 0 incomplete
Fresh randomized blinking batch:     5 of 5 passed
Five-turn spiral path length:        241.439 deg
Five-turn spiral winding:            4.09 turns
Five-turn spiral motion completion:  117.0 s
```

The follow-up did not modify `planAzElDijkstra` after its dedicated pass. The
corrective root-runtime pass made substantive behavior-preserving edits to the
ten remaining public and shared runtime files. Canonical obstacle records,
packed obstacles, query candidates, blockers, moving-target candidates, and
kinematics samples now carry diagnostic names. The obstacle packer no longer
converts a canonical struct array to cells merely to index it. The animator
folds its single-caller grid sampler into the lattice builder; its padded-limit
helper remains because angular and time axes both share that nontrivial policy.

## Behavioral-preservation checklist

- [x] Public function name and argument order unchanged.
- [x] Option names and defaults unchanged.
- [x] Output fields and dimensions unchanged.
- [x] Static-versus-dynamic selection unchanged.
- [x] Grid schedules and connectivity unchanged.
- [x] Motion primitives and transition timing unchanged.
- [x] Collision margins and validation sampling unchanged.
- [x] Binary heaps and deterministic tie-breaking unchanged.
- [x] Static successor and dynamic parent semantics made explicit.
- [x] No new toolbox requirement.
- [x] Complete standalone MATLAB suite rerun after final code edits.

## Files changed

- `planAzElDijkstra.m`: stage boundaries, diagnostic names, and comments
  connecting the two relaxation loops to their mathematics.
- `buildAzElTimeObstacleField.m`, `queryAzElTimeObstacle.m`, and
  `buildAzElTimeObstacleWorkspace.m`: direct canonical-struct packing,
  explicit CSR offset names, blocker-oriented query names, and documented
  compatibility forwarding.
- `makeAzElObstacleData.m`, `normalizeAzElTimeObstacleData.m`, and
  `combineAzElObstacles.m`: canonical-data names and traceable nested-input
  flattening.
- `animateAzElAvoidancePlan.m` and `defaultAzElAnimationOptions.m`:
  explicit display-only lattice sampling, fewer one-caller helpers, and clear
  override versus presentation-preference precedence.
- `planAzElMovingTargetIntercept.m` and `plotAzElPlanKinematics.m`:
  unit-bearing interception candidates, catch diagnostics, tracking samples,
  plotted derivatives, and export results.
- `DIJKSTRA_PLANNER.md`: maintained call flow and representation-selection
  map.
- `STATIC_DIJKSTRA.md`: implementation-stage and frontier behavior map.
- `REFACTOR_DIJKSTRA.md`: scope, decisions, evidence, and checklist.
- `examples/*.m`: ordered scenario/planning/validation/animation sections,
  inline one-call state/default constructors, and diagnostic variable names.
- `examples/support/*.m`: explicit generator and diagnostic stages; the
  randomized board generator now exposes its full seeded construction inline.
- `benchmarks/*.m`: reproducible input, measurement, and report stages.
- `docs/generateDijkstraDocumentationFigures.m`: explicit figure intent,
  sample/attempt names, and unit-bearing motion-profile variables.
- `tests/*.m`: documented test entry points and diagnostic loop names.
- `STYLE.md`: folder-wide continuation, loop, randomized-case, example, and
  test conventions.

## Suspected bugs and unresolved items

No behavioral bug was intentionally fixed in this refactor. The dynamic
terminal-capture transition remains a dense block because its trial ordering,
sampling, and tolerance behavior are part of the current source of truth.
Extracting or redesigning it should be a separately tested change.

The main planner remains a large function-oriented file in accordance with
`STYLE.md`. Its major algorithms remain inline and in execution order; local
helpers survive only where several call sites share a nontrivial invariant or
where duplicating heap/profile logic would risk inconsistent behavior.
