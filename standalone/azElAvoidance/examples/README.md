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
| 01 | `example01PlanFromAzElData` | `planAzElAvoidance` dispatcher | User-supplied `azElData`; continuous minimum-distance search first, then unweighted kinodynamic A* when the continuous search cannot solve the request. |
| 02 | `example02VietnamChinaAvoidance` | Autonomous static corridor | Static-union rasterization, Theta*-style any-angle A*, visibility simplification, dynamic retiming, and polygon validation for two country obstacles. |
| 03 | `example03KinodynamicARAStar` | Kinodynamic ARA* | Anytime repair of a position/rate/time lattice with constant-acceleration primitives and a decreasing epsilon bound. |
| 04 | `example04SpaceTimeFunnel` | Space-time funnel | Event-compressed safe-interval planning followed by widening-corridor kinodynamic ARA* refinement through moving volumes. |
| 05 | `example05FiveTurnSpiral` | Autonomous static corridor | Unguided Theta*-style topology discovery through a deep spiral, then visibility simplification and dynamically feasible retiming. |
| 06 | `example06StopGoGates` | `planAzElAvoidance` minimum-distance mode | Continuous candidate timing and waypoint search through sequentially opening gates; waiting is produced by the planner. |
| 07 | `example07WrappedAzimuthSeam` | `planAzElAvoidance` minimum-distance mode | Wrapped-azimuth geometry and a collision-free detour across the `-180/180` seam. |
| 08 | `example08AlternatingSlalom` | Autonomous static corridor | Unguided any-angle topology search through alternating barriers, followed by route simplification and retiming. |
| 09 | `example09UTrapEscape` | Multiresolution autonomous corridor | Coarse any-angle topology discovery, narrow-tube fine refinement, visibility simplification, and retiming out of a cul-de-sac. |
| 10 | `example10RotatingSlots` | Space-time funnel | Safe-interval timing through four independently rotating slots, including planner-selected chamber waits. |
| 11 | `example11ChasedBoresight` | Space-time funnel | Dynamic safe-interval planning while a slower obstacle pursues the boresight and the goal remains closed. |
| 12 | `example12SynchronizedWindmills` | Space-time funnel | Symmetric eight-direction safe-interval search through synchronized rotating windmills, with ARA* refinement when useful. |
| 13 | `example13RandomBlinkingIntercept` | Moving-target interception plus space-time funnel | Earliest-feasible interception-time search against a random moving endpoint; each candidate is solved by the dynamic funnel planner. |

Examples 05-09 can be run as a set:

```matlab
results = runStaticGauntletExamples();
```

## Planner Layers

The public planners live at the package root:

- `planAzElAvoidance`: general dispatcher for minimum-distance and
  minimum-time requests.
- `planAzElAutonomousCorridor`: difficult static topology.
- `planAzElKinodynamicAStar`: exact unweighted A* on the configured finite
  motion lattice.
- `planAzElKinodynamicARAStar`: anytime bounded search on that lattice.
- `planAzElSpaceTimeFunnel`: dynamic az/el/time volumes.
- `planAzElMovingTargetIntercept`: moving endpoint interception.

Algorithm-only dependencies are in `private`. Scenario construction and
diagnostic code used only by these examples is in `support`. No example
injects a reference path, one-way edge, state corridor, or preferred
direction.
