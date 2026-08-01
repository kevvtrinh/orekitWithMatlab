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
