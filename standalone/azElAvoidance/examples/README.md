# Numbered Examples

Add the complete standalone package to the MATLAB path:

```matlab
root = "C:\path\to\standalone\azElAvoidance";
addpath(genpath(root));
```

Every numbered example uses the common combined animation, with current 2-D
azimuth/elevation geometry beside the accumulated 3-D
azimuth/elevation/time workspace.

## Algorithm Map

| # | Entry point | Primary algorithm | What the example exercises |
|---:|---|---|---|
| 01 | `example01PlanFromAzElData` | Goal-rooted Dijkstra | Caller-supplied `azElData`; a progressive `[2, 1]` degree full-field search and independent command validation. |
| 02 | `example02VietnamChinaAvoidance` | Goal-rooted Dijkstra | Progressive complete-grid Dijkstra, rest-to-rest retiming, and polygon validation around two obstacles. |
| 03 | `example03KinodynamicDetour` | Bidirectional kinodynamic RRT* | Both fixed-time trees find and validate a rate- and acceleration-limited detour around a static blocker. |
| 04 | `example04DynamicSafeIntervals` | Bidirectional kinodynamic RRT* | Seeded space-time tree growth through two moving obstacle volumes. |
| 05 | `example05FiveTurnSpiral` | Goal-rooted Dijkstra | Unguided global coarse-to-fine Dijkstra through a deep spiral. |
| 06 | `example06StopGoGates` | Safe-interval Dijkstra | Uniform-cost search through sequentially opening gates; waiting is planner-selected. |
| 07 | `example07WrappedAzimuthSeam` | Goal-rooted Dijkstra | Shortest wrapped lattice route across the `-180/180` azimuth seam. |
| 08 | `example08AlternatingSlalom` | Goal-rooted Dijkstra | Global coarse-to-fine Dijkstra through alternating barriers. |
| 09 | `example09UTrapEscape` | Goal-rooted Dijkstra | Global coarse-to-fine Dijkstra out of a cul-de-sac. |
| 10 | `example10RotatingSlots` | Safe-interval Dijkstra | Uniform-cost timing through four rotating slots and planner-selected chamber waits. |
| 11 | `example11ChasedBoresight` | Safe-interval Dijkstra | Uniform-cost planning while a slower obstacle pursues the boresight. |
| 12 | `example12SynchronizedWindmills` | Safe-interval Dijkstra | Symmetric safe-interval Dijkstra through synchronized rotating windmills. |
| 13 | `example13RandomBlinkingIntercept` | Moving-target Dijkstra | Interception-time search where every candidate uses the same dynamic Dijkstra kernel. |
| 14 | `example14MovingRendezvousAndTrail` | Velocity-matched Dijkstra | Crossy Road-style capture through twelve nonoverlapping four-vehicle rows in a narrow central corridor; rows 9-12 sweep the center slot as timed gates. |
| 15 | `example15SpinningRodSpiral` | Safe-interval Dijkstra | Unguided traversal of a two-turn spiral while a faster rotating rod forces planner-selected waits in three protected wall notches. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Planner Routing

Examples 03 and 04 call
`planAzElBidirectionalKinodynamicRRTStar` directly. Their fixed seeds make
the demonstrations repeatable, and both examples independently recheck the
returned command against the packed polygons. The retained forward and
backward trees appear in the common planning animation.

The remaining fixed-goal examples call `planAzElDijkstra`, either directly
or through `runAzElGauntletCase`. Examples 13 and 14 use
`planAzElMovingTargetIntercept`, which tests interception times with the
Dijkstra planner. The RRT* comparison planner currently requires rest at a
fixed-time goal, so it cannot perform example 14's nonzero-rate rendezvous.

The Dijkstra planner routes static geometry through progressive goal-rooted
Dijkstra. Moving volumes use progressive event-compressed safe-interval
Dijkstra. Both modes retime analytic rest-to-rest internal slews and validate
against the packed polygons. Example 14 enables the optional quintic terminal
edge to match a moving target's nonzero rate before trailing it.

The Dijkstra static search, exact shortcutter, and retimer are local
functions inside its public planner. The dynamic safe-interval search remains
a separate private kernel because it is an independently complex algorithm.
Scenario construction and diagnostics remain under `support`.
