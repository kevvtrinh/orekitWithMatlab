# Simple Dijkstra Advanced Feature Stages

This ledger keeps every post-baseline capability independently reviewable.
The simple planner remains a seven-coordinate, constant-jerk Dijkstra search
by default. Each stage has one explicit option, a named implementation site,
focused verification, a compatibility rerun, and a separate Git commit.

## Stage 1: static goal-rooted topology Dijkstra

### Selection and scope

Set:

```matlab
options.equalCostTieBreaker = "staticTopology";
```

The option is valid only when the rasterized position occupancy is identical
at every time slice. It does not change transition costs, accept a nonterminal
state, prune a kinodynamic state, or replace the seven-coordinate search. It
orders only unsettled states whose Dijkstra costs are exactly equal.

### Developer map

| Responsibility | Inspectable implementation |
| --- | --- |
| Static occupancy guard and feature call | `planSimpleAzElTimeKinodynamicDijkstra`, Section 6 |
| Equal-cost-only integration | `planSimpleAzElTimeKinodynamicDijkstra`, Section 9 scan selection |
| Reverse eight-connected Dijkstra | `buildSimpleAzElStaticTopologyDijkstra`, Sections 2 and 3 |
| No diagonal obstacle-corner cutting | `buildSimpleAzElStaticTopologyDijkstra`, Section 3, `edgeIsDiagonal` branch |
| Initial static route reconstruction | `buildSimpleAzElStaticTopologyDijkstra`, Section 4 |
| Public diagnostics | `plan.staticTopology`, packaged in planner Section 13 |
| Cost-preservation test | `testStaticTopologyTieBreakerPreservesDijkstraCost` |
| Corner-cutting test | `testStaticTopologyForbidsDiagonalCornerCutting` |

The returned `plan.staticTopology` record exposes `CostToGoal_deg`,
`SettledMask`, next-cell parent indices, the mapped initial grid route, and
expanded/reachable node counts. This makes the feature inspectable even when
the full kinodynamic search does not succeed.

### Verification result

MATLAB Code Analyzer reported zero findings for the planner, topology builder,
focused test file, and compatibility runner. All thirteen focused simple
planner tests passed.

The affected static numbered examples were rerun at the same doubled budgets
used by the preceding stage. Example 08 is included as the previously passing
static regression control.

| Example | Expanded | Generated | Result |
| --- | ---: | ---: | --- |
| 01 plan from `azElData` | 9,224 | 20,000 | generated-state cap |
| 02 Vietnam-China avoidance | 9,443 | 20,000 | generated-state cap |
| 03 kinodynamic detour | 13,939 | 20,000 | generated-state cap |
| 05 five-turn spiral | 23,733 | 60,000 | time levels failed; finest hit cap |
| 07 wrapped azimuth seam | 15,054 | 40,000 | generated-state cap |
| 08 alternating slalom | 50,859 | 50,859 | **passed** |
| 09 U-trap escape | 1 | 1 | initial lattice state dynamically unreachable |

No new numbered example passed. The result justifies keeping static topology
separate from the next feature: an analytic retiming stage must determine
whether a topology route can be converted into a feasible rest-to-rest
trajectory without enlarging or obscuring the baseline successor loop.

## Stage 2: analytic jerk-limited rest-to-rest retiming

### Selection and scope

Set:

```matlab
options.staticRouteRetiming = "analyticRestToRest";
```

The feature first attempts to convert the static topology route into analytic
rest-to-rest segments. A successful attempt returns without entering the
seven-coordinate successor loop and sets
`plan.solutionMethod = "staticTopologyAnalyticRestToRest"`. A failed attempt
remains visible in `plan.analyticRetiming` and falls back to the original state
lattice. This fallback prevents an optional advanced method from removing a
baseline success.

Unlike the mature planner's acceleration-limited trapezoid, the simple-planner
feature preserves its jerk contract. Each segment uses

```text
p(u) = 10u^3 - 15u^4 + 6u^5,  0 <= u <= 1
```

with both axes driven by the same normalized progress. Segment duration is
the maximum required by the exact normalized derivative bounds
`max|p'| = 15/8`, `max|p''| = 10/sqrt(3)`, and `max|p'''| = 60`.

### Developer map

| Responsibility | Inspectable implementation |
| --- | --- |
| Attempt and explicit fallback | `planSimpleAzElTimeKinodynamicDijkstra`, Section 7 |
| Preserve only genuine topology turns | `retimeSimpleAzElStaticTopologyRoute`, Section 2 |
| Velocity/acceleration/jerk duration bounds | `retimeSimpleAzElStaticTopologyRoute`, Section 3 |
| Shared quintic profile and exact-time destination hold | `retimeSimpleAzElStaticTopologyRoute`, Section 4 |
| Packed-obstacle sample validation | `retimeSimpleAzElStaticTopologyRoute`, Section 5 |
| Stable public result schema | `packageSimpleDijkstraAnalyticRetiming` |
| Derivative-limit success test | `testAnalyticStaticRetimingRespectsDerivativeLimits` |
| Insufficient-time/fallback test | `testAnalyticStaticRetimingReportsInsufficientTime` |

### Verification result

MATLAB Code Analyzer reported zero findings. All fifteen focused simple-planner
tests passed. The same static cases were rerun at doubled budgets:

| Example | Final method | Expanded | Generated | Result |
| --- | --- | ---: | ---: | --- |
| 01 plan from `azElData` | analytic retiming | 0 | 0 | **passed** |
| 02 Vietnam-China avoidance | analytic retiming | 0 | 0 | **passed** |
| 03 kinodynamic detour | analytic retiming | 0 | 0 | **passed** |
| 05 five-turn spiral | lattice fallback | 23,733 | 60,000 | time levels failed; finest hit cap |
| 07 wrapped azimuth seam | lattice fallback | 15,054 | 40,000 | generated-state cap |
| 08 alternating slalom | lattice fallback | 50,859 | 50,859 | **passed** |
| 09 U-trap escape | lattice fallback | 1 | 1 | initial lattice state dynamically unreachable |

The analytic candidate for Example 05 failed packed-obstacle sampling. The
candidates for Examples 07, 08, and 09 required 35.710, 111.355, and 60.871
seconds against horizons of 30, 60, and 60 seconds. The fallback then retained
the prior pass/fail behavior. Stage 2 therefore adds three numbered-example
passes without losing the slalom pass.
