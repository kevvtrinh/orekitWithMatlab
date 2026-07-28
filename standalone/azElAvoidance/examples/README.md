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
| 01 | `example01PlanFromAzElData` | Space-Time Funnel: direct mode | User-supplied `azElData`; a collision-free direct wait-and-slew certificate reaches the angular lower bound. |
| 02 | `example02VietnamChinaAvoidance` | Space-Time Funnel: static topology | Static-union rasterization, Theta*-style any-angle topology acceleration, visibility simplification, dynamic retiming, and polygon validation. |
| 03 | `example03KinodynamicDetour` | Space-Time Funnel: static topology | A rate- and acceleration-limited detour around a static blocker using the unified planner. |
| 04 | `example04SpaceTimeFunnel` | Space-time funnel | Event-compressed safe-interval planning followed by widening-corridor kinodynamic ARA* refinement through moving volumes. |
| 05 | `example05FiveTurnSpiral` | Space-Time Funnel: static topology | Unguided any-angle topology discovery through a deep spiral, followed by visibility simplification and retiming. |
| 06 | `example06StopGoGates` | Space-Time Funnel: dynamic | Safe-interval timing and optional ARA* refinement through sequentially opening gates; waiting is produced by the planner. |
| 07 | `example07WrappedAzimuthSeam` | Space-Time Funnel: static topology | Wrapped-azimuth static topology acceleration across the `-180/180` seam. |
| 08 | `example08AlternatingSlalom` | Space-Time Funnel: static topology | Unguided any-angle topology acceleration through alternating barriers. |
| 09 | `example09UTrapEscape` | Space-Time Funnel: static topology | Coarse any-angle topology acceleration, narrow-tube refinement, visibility simplification, and retiming out of a cul-de-sac. |
| 10 | `example10RotatingSlots` | Space-time funnel | Safe-interval timing through four independently rotating slots, including planner-selected chamber waits. |
| 11 | `example11ChasedBoresight` | Space-time funnel | Dynamic safe-interval planning while a slower obstacle pursues the boresight and the goal remains closed. |
| 12 | `example12SynchronizedWindmills` | Space-time funnel | Symmetric eight-direction safe-interval search through synchronized rotating windmills, with ARA* refinement when useful. |
| 13 | `example13RandomBlinkingIntercept` | Moving-target interception plus space-time funnel | Earliest-feasible interception-time search against a random moving endpoint; each candidate is solved by the dynamic funnel planner. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Unified Planner

Every fixed-goal example calls `planAzElSpaceTimeFunnel`, either directly or
through `runAzElGauntletCase`. Example 13 uses
`planAzElMovingTargetIntercept`, which tests interception times by calling
the same funnel for every candidate.

The funnel selects its internal mode from the data:

- A direct wait-and-slew certificate handles unobstructed motion.
- Static volumes use any-angle topology acceleration and dynamic retiming.
- Dynamic volumes use event-compressed safe intervals.
- Kinodynamic ARA* optionally refines the resulting space-time guide.

Lower-level searches remain independently testable implementation
components, but examples do not select them. Scenario construction and
diagnostic code is in `support`. No example injects a reference path,
one-way edge, state corridor, or preferred direction.
