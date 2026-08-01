# Simple Dijkstra Example Compatibility

## Test boundary

`tests/runSimpleDijkstraExampleCompatibility.m` reconstructs or extracts the
`azElData`, endpoint states, and physical limits from every standalone
azimuth/elevation example. Every row calls only
`planSimpleAzElTimeKinodynamicDijkstra`.

The compatibility runner does not call `planAzElDijkstra`,
`planAzElMovingTargetIntercept`, `runAzElGauntletCase`, safe intervals, guide
paths, topology search, or a mature-planner result. Examples 13 and 14 contain
moving targets, while the simple planner accepts one exact destination state.
The runner therefore uses the collision-free, earliest advertised 16-second
target sample for
Example 13 and the advertised 56-second target state for Example 14.

Example 01 requires caller-supplied obstacle data. Its row uses canonical
empty `azElData` with the example's original endpoints and limits. The new
simple moving-gate example is the sixteenth row.

## Complete baseline result

The first complete run used the case-specific 10,000, 20,000, or 30,000 state
budgets recorded in the runner. All sixteen rows executed. Only the new simple
moving-gate example passed. Every numbered legacy example failed.

The requested doubled-budget rerun used 20,000, 40,000, or 60,000 states and
the original visible scan frontier:

| Example | Expanded | Generated | Result |
| --- | ---: | ---: | --- |
| 01 plan from `azElData` | 8,380 | 20,000 | generated-state cap |
| 02 Vietnam-China avoidance | 8,392 | 20,000 | generated-state cap |
| 03 kinodynamic detour | 9,067 | 20,000 | generated-state cap |
| 04 dynamic safe intervals | 12,020 | 20,000 | generated-state cap |
| 05 five-turn spiral | 27,062 | 27,062 | reachable lattice exhausted |
| 06 stop-go gates | 37,867 | 40,000 | generated-state cap |
| 07 wrapped azimuth seam | 12,899 | 40,000 | generated-state cap |
| 08 alternating slalom | 48,208 | 60,000 | generated-state cap |
| 09 U-trap escape | 44,592 | 60,000 | generated-state cap |
| 10 rotating slots | 23,816 | 60,000 | generated-state cap |
| 11 chased boresight | 3,627 | 3,627 | reachable lattice exhausted |
| 12 synchronized windmills | 2,625 | 2,625 | reachable lattice exhausted |
| 13 random blinking intercept | 15 | 15 | reachable lattice exhausted |
| 14 moving rendezvous | 27,532 | 60,000 | generated-state cap |
| 15 spinning-rod spiral | 51,613 | 60,000 | generated-state cap |

This is a compatibility measurement, not a claim that the numbered examples
are impossible. A cap result means only that this simple configuration did not
reach the exact terminal state before its configured allocation limit.

## Gradual feature stages

### Stable binary-heap frontier

The feature is selected with `options.frontierMethod = "binaryHeap"`.
Section 7 allocates the indexed frontier, Section 8 selects from it, and
Section 10 performs decrease-key updates. The two local functions
`pushOrDecreaseSimpleDijkstraFrontier` and `popSimpleDijkstraFrontier` contain
the heap mechanics. Equal costs are ordered by generated-state index, matching
the baseline scan deterministically.

The focused equivalence test verifies identical cost, expansion order, state
counts, and trajectory. The doubled-budget compatibility rerun produced the
same pass/fail outcomes and state counts: zero of fifteen legacy rows passed.
It was slower for this MATLAB implementation at the measured sizes, so
`"scan"` remains the default and the heap is not presented as a performance
win.

### Destination-distance equal-cost ordering

The feature is selected with
`options.equalCostTieBreaker = "destinationDistance"`. The implementation is
inside the scan branch in Section 8. It first selects the exact minimum
Dijkstra cost, then ranks only states with that exact same cost by normalized
position, velocity, and acceleration distance to the destination. It never
promotes a higher-cost state.

The focused test verifies the same successful trajectory cost with no more
expansions on its reference problem. The complete doubled-budget legacy rerun
still passed zero of fifteen rows and was slower on the large cases. The
baseline `"stateIndex"` ordering therefore remains the compatibility default.

### Coarse-to-fine time lattice

The feature is selected with `options.timeStepSchedule_s`, for example
`[2 1]`. Section 2 routes the request to
`runSimpleDijkstraTimeRefinement`. Each time step runs an independent simple
Dijkstra search. `plan.timeRefinement.Levels` records the time step, success,
message, cost, state counts, elapsed time, and selected level.

The focused test intentionally fails at two seconds and succeeds at one
second. Applied alone to Examples 05, 11, 12, and 13, time refinement passed
zero of four. Their finest reachable-state counts were 3,185, 48, 4,321, and
21, exposing control-to-grid incompatibility rather than only insufficient
allocation.

### Lattice-compatible default jerk

The feature is selected with
`options.jerkCommandMode = "latticeCompatible"`. Section 6 computes the
largest jerk not exceeding each physical limit whose one-step acceleration
change is a whole number of configured acceleration cells. Explicit
`jerkCommands_deg_s3` still take precedence. The default remains `"maximum"`.

The focused test verifies both the jerk limit and whole-cell acceleration
changes. With refined velocity/acceleration grids and time refinement, the
four targeted legacy rows still passed zero of four, but reachability changed
materially:

| Example | Finest expanded | Finest generated | Result |
| --- | ---: | ---: | --- |
| 05 five-turn spiral | 18,701 | 60,000 | generated-state cap |
| 11 chased boresight | 784 | 784 | reachable lattice exhausted |
| 12 synchronized windmills | 35,419 | 60,000 | generated-state cap |
| 13 random blinking intercept | 38,063 | 60,000 | generated-state cap |

The feature restored a much larger reachable lattice in three cases, but it
did not make a numbered legacy example pass at the tested limits.

### Exact final-slice pruning

The feature is selected with
`options.pruneNonterminalFinalStates = true`. Section 9 applies the complete
position, velocity, and acceleration terminal test before allocating a state
on the exact final time slice. A failing state on that slice has no outgoing
transition and therefore cannot become a solution. The focused test verifies
the same solution and cost with fewer generated states.

This feature did not change the 120,000-state blinking-intercept result,
showing that its cap pressure occurred before the final time slice.

### Backward dynamic-reachability pruning

The feature is selected with
`options.pruneDynamicallyUnreachableStates = true`. Immediately after Section
6, `buildSimpleDijkstraAxisBackwardReachability` constructs an obstacle-free
position/velocity/acceleration/time reachability table for each axis using the
same constant-jerk propagation and nearest-grid mapping as the forward search.
Section 9 rejects a successor only when either axis has no remaining discrete
jerk sequence to the complete terminal lattice. Obstacles and interior extrema
are omitted from the backward table, making it conservative: a false entry
proves dynamic unreachability, while a true entry does not promise collision
feasibility.

The focused test verifies identical solution/cost, fewer generated states, and
a positive prune count. The complete doubled-budget legacy rerun produced the
first three numbered-example passes:

| Example | Expanded | Generated | Result |
| --- | ---: | ---: | --- |
| 01 plan from `azElData` | 8,701 | 20,000 | generated-state cap |
| 02 Vietnam-China avoidance | 8,761 | 20,000 | generated-state cap |
| 03 kinodynamic detour | 13,607 | 20,000 | generated-state cap |
| 04 dynamic safe intervals | 5,212 | 5,212 | **passed** |
| 05 five-turn spiral | 22,642 | 60,000 | time levels failed; finest hit cap |
| 06 stop-go gates | 3,771 | 3,771 | **passed** |
| 07 wrapped azimuth seam | 14,742 | 40,000 | generated-state cap |
| 08 alternating slalom | 50,859 | 50,859 | **passed** |
| 09 U-trap escape | 1 | 1 | initial lattice state dynamically unreachable |
| 10 rotating slots | 28,125 | 60,000 | generated-state cap |
| 11 chased boresight | 270 | 270 | time levels exhausted |
| 12 synchronized windmills | 40,588 | 60,000 | time levels failed; finest hit cap |
| 13 random blinking intercept | 1,217 | 1,217 | time levels exhausted at 16-second target |
| 14 moving rendezvous | 1 | 1 | initial lattice state dynamically unreachable |
| 15 spinning-rod spiral | 52,533 | 60,000 | generated-state cap |

These are direct simple-planner results. Rotating slots and alternating slalom
are both explicitly present: rotating slots remains red, while slalom is green.

## Rerunning

Run every case at its base budget:

```matlab
report = runSimpleDijkstraExampleCompatibility();
```

Run only failed numbered cases with doubled budgets:

```matlab
report = runSimpleDijkstraExampleCompatibility(2, 1:15);
```

Run the aggregate MATLAB test, which always completes every row before its
final assertion:

```matlab
runtests("tests/testSimpleDijkstraExampleCompatibility.m")
```
