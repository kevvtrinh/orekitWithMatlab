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
| 02 | `example02VietnamChinaAvoidance` | Adaptive A*: static | Progressive any-angle A*, rest-to-rest retiming, and polygon validation around two obstacles. |
| 03 | `example03KinodynamicDetour` | Adaptive A*: static | A rate- and acceleration-limited detour around a static blocker. |
| 04 | `example04DynamicSafeIntervals` | Adaptive A*: dynamic | Event-compressed safe-interval A* through two moving volumes. |
| 05 | `example05FiveTurnSpiral` | Adaptive A*: static | Unguided coarse-to-fine any-angle A* through a deep spiral. |
| 06 | `example06StopGoGates` | Adaptive A*: dynamic | Safe-interval A* through sequentially opening gates; waiting is planner-selected. |
| 07 | `example07WrappedAzimuthSeam` | Adaptive A*: static | Any-angle A* across the wrapped `-180/180` azimuth seam. |
| 08 | `example08AlternatingSlalom` | Adaptive A*: static | Coarse-to-fine any-angle A* through alternating barriers. |
| 09 | `example09UTrapEscape` | Adaptive A*: static | Coarse-to-fine any-angle A* out of a cul-de-sac. |
| 10 | `example10RotatingSlots` | Adaptive A*: dynamic | Safe-interval timing through four rotating slots and planner-selected chamber waits. |
| 11 | `example11ChasedBoresight` | Adaptive A*: dynamic | Safe-interval planning while a slower obstacle pursues the boresight. |
| 12 | `example12SynchronizedWindmills` | Adaptive A*: dynamic | Symmetric safe-interval A* through synchronized rotating windmills. |
| 13 | `example13RandomBlinkingIntercept` | Moving-target adaptive A* | Interception-time search where every candidate uses the same dynamic A*. |
| 14 | `example14MovingRendezvousAndTrail` | Velocity-matched adaptive A* | Curved, variable-speed target capture through four traffic rows containing 12 reversing vehicles; the final four pace at alternating row ends. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Unified Planner

Every fixed-goal example calls `planAzElAdaptiveAStar`, either directly or
through `runAzElGauntletCase`. Example 13 uses
`planAzElMovingTargetIntercept`, which tests interception times by calling
the same adaptive A* planner.

The planner collapses static safe intervals into progressive any-angle A*.
Moving volumes use progressive event-compressed safe-interval A*. Both modes
retime analytic rest-to-rest internal slews and validate against the packed
polygons. Example 14 enables the optional quintic terminal edge to match a
moving target's nonzero rate before trailing it.

Lower-level searches remain independently testable implementation
components, but examples do not select them. Scenario construction and
diagnostic code is in `support`. No example injects a reference path,
one-way edge, state corridor, or preferred direction.
