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
| 01 | `example01PlanFromAzElData` | Adaptive A*: direct certificate | User-supplied `azElData`; a collision-free direct wait-and-slew reaches the angular lower bound. |
| 02 | `example02VietnamChinaAvoidance` | Goal-rooted Dijkstra | Progressive complete-grid Dijkstra, rest-to-rest retiming, and polygon validation around two obstacles. |
| 03 | `example03KinodynamicDetour` | Goal-rooted Dijkstra | A rate- and acceleration-limited detour around a static blocker. |
| 04 | `example04DynamicSafeIntervals` | Adaptive A*: dynamic | Event-compressed safe-interval A* through two moving volumes. |
| 05 | `example05FiveTurnSpiral` | Goal-rooted Dijkstra | Unguided global coarse-to-fine Dijkstra through a deep spiral. |
| 06 | `example06StopGoGates` | Adaptive A*: dynamic | Safe-interval A* through sequentially opening gates; waiting is planner-selected. |
| 07 | `example07WrappedAzimuthSeam` | Goal-rooted Dijkstra | Shortest wrapped lattice route across the `-180/180` azimuth seam. |
| 08 | `example08AlternatingSlalom` | Goal-rooted Dijkstra | Global coarse-to-fine Dijkstra through alternating barriers. |
| 09 | `example09UTrapEscape` | Goal-rooted Dijkstra | Global coarse-to-fine Dijkstra out of a cul-de-sac. |
| 10 | `example10RotatingSlots` | Adaptive A*: dynamic | Safe-interval timing through four rotating slots and planner-selected chamber waits. |
| 11 | `example11ChasedBoresight` | Adaptive A*: dynamic | Safe-interval planning while a slower obstacle pursues the boresight. |
| 12 | `example12SynchronizedWindmills` | Adaptive A*: dynamic | Symmetric safe-interval A* through synchronized rotating windmills. |
| 13 | `example13RandomBlinkingIntercept` | Moving-target adaptive A* | Interception-time search where every candidate uses the same dynamic A*. |
| 14 | `example14MovingRendezvousAndTrail` | Velocity-matched adaptive A* | Crossy Road-style capture through twelve nonoverlapping four-vehicle rows in a narrow central corridor; rows 9-12 sweep the center slot as timed gates. |
| 15 | `example15SpinningRodSpiral` | Adaptive A*: dynamic | Unguided traversal of a two-turn spiral while a faster rotating rod forces planner-selected waits in three protected wall notches. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Unified Planner

Every fixed-goal example calls `planAzElAdaptiveAStar`, either directly or
through `runAzElGauntletCase`. Example 13 uses
`planAzElMovingTargetIntercept`, which tests interception times by calling
the same adaptive A* planner.

The planner routes static geometry through progressive goal-rooted Dijkstra.
Moving volumes use progressive event-compressed safe-interval A*. Both modes
retime analytic rest-to-rest internal slews and validate against the packed
polygons. Example 14 enables the optional quintic terminal edge to match a
moving target's nonzero rate before trailing it.

The static search, exact shortcutter, and retimer are local functions inside
the unified planner. The dynamic safe-interval search remains a separate
private kernel because it is an independently complex algorithm. Scenario
construction and diagnostics remain under `support`.
