# Numbered Examples

Add the complete standalone package to the MATLAB path:

```matlab
root = "C:\path\to\standalone\azElAvoidance";
addpath(genpath(root));
```

Every numbered example uses the common combined animation, with current 2-D
azimuth/elevation geometry beside the accumulated 3-D
azimuth/elevation/time obstacle field.

## Algorithm Map

| # | Entry point | Primary algorithm | What the example exercises |
|---:|---|---|---|
| 01 | `example01PlanFromAzElData` | Goal-rooted Dijkstra | Caller-supplied `azElData`; a progressive `[2, 1]` degree full-field search and independent command validation. |
| 02 | `example02VietnamChinaAvoidance` | Goal-rooted Dijkstra | Progressive complete-grid Dijkstra, rest-to-rest retiming, and polygon validation around two obstacles. |
| 03 | `example03KinodynamicDetour` | Goal-rooted Dijkstra | A rate- and acceleration-limited detour around a static blocker. |
| 04 | `example04DynamicSafeIntervals` | Safe-interval Dijkstra | Event-compressed Dijkstra through two moving volumes. |
| 05 | `example05FiveTurnSpiral` | Goal-rooted Dijkstra | Unguided global coarse-to-fine Dijkstra followed by continuous corner-blended motion through a deep spiral. |
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
| 16 | `example16NoWrapRisingDiskEfficiency` | Goal-rooted Dijkstra | A no-wrap `-175` to `+175` crossing over a large slowly rising disk, using continuous minimum-time path scaling and stored analytic distance/time comparisons. |
| 17 | `example17KinematicStateSpaceStudy` | Path-state Dijkstra | Compares a velocity-carrying path-state search, mapped into five-dimensional position/rate/time receipts, with the waypoint start-stop profile on the same circular detour. |
| 18 | `example18JointBoundedJerkStudy` | Joint A* plus continuous refinement | Searches route, two-axis velocity, acceleration, time, and bounded jerk together, then replays a continuously optimized 80-control Pareto trajectory and compares separate shortest-path and fastest-time references. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Unified Planner

Every fixed-goal example calls `planAzElDijkstra`, either directly or
through `runAzElGauntletCase`. Example 13 uses
`planAzElMovingTargetIntercept`, which tests interception times by calling
the same Dijkstra planner.

The planner routes static geometry through progressive goal-rooted Dijkstra.
Moving volumes normally use progressive event-compressed safe-interval
Dijkstra. Path-first examples may instead apply one continuous clock to a
corner-blended spatial route before validating it against the moving packed
polygons. Example 14 enables the optional quintic terminal edge to match a
moving target's nonzero rate before trailing it.

The static search, exact shortcutter, and retimer are local functions inside
the unified planner. The dynamic safe-interval search remains a separate
private kernel because it is an independently complex algorithm. Scenario
construction and diagnostics remain under `support`.
