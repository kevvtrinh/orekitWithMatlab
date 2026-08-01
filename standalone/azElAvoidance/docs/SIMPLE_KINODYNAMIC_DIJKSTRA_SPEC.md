# Simple Kinodynamic Azimuth–Elevation–Time Dijkstra Planner

## Purpose

This repository already contains a working planner, but its methods have become too interconnected to serve as a clear learning foundation.

Use the existing planner and examples as references for:

* the `azElData` input format;
* coordinate and time conventions;
* obstacle interpretation;
* representative scenarios;
* expected outputs and plots;
* established MATLAB style.

Do not copy the existing planner architecture or advanced implementation.

Build a new Dijkstra planner from first principles using a simple kinodynamic azimuth–elevation–time model.

It is acceptable if the first version does not pass every existing example. Readability, correctness, and inspectability are more important than immediately matching the mature planner.

## Main Goal

The new planner should clearly show:

```text
azElData
→ azimuth/elevation/time occupancy
→ discretized kinodynamic states
→ admissible jerk commands
→ velocity and acceleration propagation
→ collision-free transitions
→ Dijkstra expansion
→ parent reconstruction
→ timed kinodynamic trajectory
```

A search state must represent:

```text
azimuth
elevation
time
azimuth velocity
elevation velocity
azimuth acceleration
elevation acceleration
```

Jerk is the control applied between states. It does not need to be another persistent state dimension because it can be recovered from consecutive acceleration values.

## Initial Scope

Implement:

* time-varying `azElData` obstacles;
* uniform azimuth and elevation discretization;
* uniform time steps;
* discretized velocity and acceleration;
* a small discrete set of jerk commands;
* azimuth wrapping;
* bounded elevation;
* velocity limits;
* acceleration limits;
* jerk limits;
* an initial kinodynamic state;
* a destination kinodynamic state or terminal tolerance;
* waiting or holding when dynamically feasible;
* first-principles Dijkstra;
* parent-state and control storage;
* trajectory reconstruction;
* simple search and trajectory visualization.

Do not initially add:

* safe intervals;
* A* or other heuristics;
* true-distance heuristics;
* multiresolution search;
* analytic motion primitives;
* nonlinear trajectory optimization;
* path smoothing;
* topology refinement;
* advanced caching;
* parallel processing;
* a custom optimized heap unless basic node selection becomes unusably slow.

Add these later, one at a time.

## Simple Kinodynamic Model

Use one constant jerk command over each time step.

For each axis, propagate the state using:

```matlab
nextAcceleration_deg_s2 = ...
    currentAcceleration_deg_s2 + jerk_deg_s3*timeStep_s;

nextVelocity_deg_s = ...
    currentVelocity_deg_s + ...
    currentAcceleration_deg_s2*timeStep_s + ...
    0.5*jerk_deg_s3*timeStep_s^2;

nextPosition_deg = ...
    currentPosition_deg + ...
    currentVelocity_deg_s*timeStep_s + ...
    0.5*currentAcceleration_deg_s2*timeStep_s^2 + ...
    (1/6)*jerk_deg_s3*timeStep_s^3;
```

Apply the equations independently to azimuth and elevation.

Reject a transition when the propagated state violates:

```text
azimuth velocity limits
elevation velocity limits
azimuth acceleration limits
elevation acceleration limits
azimuth jerk limits
elevation jerk limits
elevation position limits
time limits
```

Wrap the resulting azimuth position when azimuth wrapping is enabled.

The propagated position, velocity, and acceleration may need to be mapped to their nearest discrete grid values. Keep this mapping explicit and document the approximation.

## Azimuth Wrapping

Azimuth wrapping is required.

For a complete azimuth domain such as `[-180,180]`, positions crossing one boundary must continue through the opposite boundary.

Use wrapped angular displacement when comparing azimuth values:

```matlab
azimuthDifference_deg = mod( ...
    secondAzimuth_deg - firstAzimuth_deg + 180,360) - 180;
```

Do not wrap:

* elevation;
* velocity;
* acceleration;
* jerk;
* time.

Do not duplicate the entire state space merely to implement wrapping unless there is a documented need.

## Initial and Destination State Names

Avoid vague names such as:

```matlab
start
stop
state1
state2
point1
point2
temp
data
```

Use meaningful names such as:

```matlab
initialState
destinationState
initialPosition_deg
destinationPosition_deg
initialVelocity_deg_s
destinationVelocity_deg_s
initialAcceleration_deg_s2
destinationAcceleration_deg_s2
initialTime_s
destinationTime_s
currentStateIndex
neighborStateIndex
parentStateIndex
appliedJerk_deg_s3
```

Before implementation, inspect the repository for established endpoint terminology.

Ask the user once when the meaning of an endpoint is genuinely ambiguous, such as whether it represents:

* a required exact state;
* a destination region;
* a terminal time window;
* a target that may be reached at any valid time.

Otherwise, use descriptive terminology and document the chosen meaning.

## Required Building Blocks

Keep the main progression visible:

```matlab
%% Section 0: Header & Readme
%% Section 1: Validate Inputs
%% Section 2: Resolve Grid And Kinodynamic Options
%% Section 3: Build The Azimuth Elevation Time Occupancy
%% Section 4: Build The Discrete State Axes
%% Section 5: Map The Initial And Destination States
%% Section 6: Define The Discrete Jerk Commands
%% Section 7: Initialize Dijkstra
%% Section 8: Propagate Candidate Kinodynamic States
%% Section 9: Check Limits And Collision
%% Section 10: Relax Dijkstra Costs
%% Section 11: Reconstruct The Trajectory
%% Section 12: Package The Result
```

The exact section boundaries may be adjusted, but the algorithm must still read in this order.

## Keep the Dijkstra Process Visible

A reader should be able to locate:

1. initialization of all costs to infinity;
2. assignment of zero cost to the initial state;
3. selection of the unsettled state with the lowest cost;
4. extraction of its position, velocity, acceleration, and time;
5. application of each allowed jerk command;
6. kinodynamic propagation;
7. discretization of the propagated state;
8. limit checking;
9. collision checking;
10. transition-cost calculation;
11. Dijkstra relaxation;
12. parent and jerk-command storage;
13. destination-state detection;
14. trajectory reconstruction.

Keep the relaxation operation recognizable:

```matlab
candidateCost = currentCost + transitionCost;

if candidateCost < bestKnownCost(neighborStateIndex)
    bestKnownCost(neighborStateIndex) = candidateCost;
    parentStateIndex(neighborStateIndex) = currentStateIndex;
    parentJerk_deg_s3(neighborStateIndex,:) = appliedJerk_deg_s3;
end
```

Do not hide the search inside:

```matlab
graph
digraph
shortestpath
distances
```

Those may only be used later for verification of small simplified cases.

## Transition Cost

Use a simple nonnegative transition cost.

The initial version may minimize elapsed time:

```matlab
transitionCost = timeStep_s;
```

Optionally, add small documented penalties for acceleration or jerk only when needed:

```matlab
transitionCost = timeStep_s + ...
    accelerationWeight*sum(nextAcceleration_deg_s2.^2)*timeStep_s + ...
    jerkWeight*sum(appliedJerk_deg_s3.^2)*timeStep_s;
```

Default the additional weights to zero so the first version remains minimum-time Dijkstra.

Do not introduce a complicated objective before the state propagation is understood.

## Holding and Waiting

A zero-jerk command does not automatically mean the sensor waits in place.

It preserves the current acceleration, which may continue changing velocity and position.

A true hold transition is possible only when the current dynamics produce no movement over the time step, normally when:

```text
velocity = 0
acceleration = 0
jerk = 0
```

Do not label a moving zero-jerk transition as waiting.

Return an `isWaiting` value only when the position remains unchanged within a documented tolerance.

## Destination Condition

The planner should support a clear terminal test.

Prefer tolerances for the first implementation:

```matlab
positionTolerance_deg
velocityTolerance_deg_s
accelerationTolerance_deg_s2
timeTolerance_s
```

Document whether the destination time is:

* exact;
* a minimum;
* a maximum;
* a time window;
* unrestricted.

Do not silently assume that reaching the destination position alone is sufficient when terminal velocity or acceleration is specified.

## Collision Checking

At minimum, verify:

* the destination state is not occupied;
* the motion between consecutive states does not pass through an obstacle.

Sample the constant-jerk transition at a simple configurable interval:

```matlab
collisionCheckStep_s
```

Evaluate the same cubic position equations at the intermediate sample times.

Use wrapped azimuth values consistently during collision checks.

Do not claim continuous collision guarantees from endpoint-only checking.

## Keep Local Functions Limited

Prefer inline code for operations that are short, used once, and central to understanding the algorithm.

Keep these operations inline when readable:

```matlab
nextAcceleration_deg_s2 = ...
    currentAcceleration_deg_s2 + appliedJerk_deg_s3*timeStep_s;

stateIndex = sub2ind( ...
    stateGridSize, ...
    elevationIndex,azimuthIndex,timeIndex, ...
    elevationVelocityIndex,azimuthVelocityIndex, ...
    elevationAccelerationIndex,azimuthAccelerationIndex);

candidateCost = currentCost + transitionCost;
```

Create local functions only for substantial responsibilities, such as:

* rasterizing all moving obstacles;
* checking one complete constant-jerk transition;
* reconstructing the parent chain;
* plotting planner diagnostics.

Do not create local helpers for:

```text
adding costs
wrapping one index
testing one inequality
reading one array element
advancing one time index
```

Use local functions rather than nested functions, and pass required data explicitly.

## State Storage

A full dense array across position, time, velocity, and acceleration may become extremely large.

Keep the state definition conceptually explicit, but use on-demand generated states when a dense allocation is unreasonable.

A practical simple representation may use:

```text
one row per generated state
a key mapping discretized state coordinates to a state index
arrays for cost, parent, settled status, and applied jerk
```

Do not introduce a complex state container prematurely.

Document:

* the state-key ordering;
* how a state key maps to an integer index;
* when a new state is created;
* how duplicate states are detected.

## Coding Style

Follow the established project style:

* Section 0 immediately after every function declaration;
* `%` followed by 74 asterisks for header banners;
* numbered MATLAB sections;
* descriptive names with units;
* explicit intermediate values;
* minimal nesting;
* simple loops where they reveal the algorithm;
* inline simple arithmetic and indexing;
* few substantial local functions;
* no nested functions unless absolutely necessary;
* comments explaining purpose and mathematics;
* no clever compression;
* no unnecessary abstractions.

Use MATLAB built-ins for routine utilities where appropriate:

```matlab
validateattributes
sub2ind
ind2sub
discretize
inpolygon
containers.Map
```

Do not rewrite standard MATLAB behavior without a documented reason.

Do not replace the visible planner logic with a toolbox black box.

## Suggested Files

Keep the initial framework small:

```text
planSimpleAzElTimeKinodynamicDijkstra.m
plotSimpleAzElTimeKinodynamicDijkstra.m
example_simple_azEl_time_kinodynamic_dijkstra.m
```

Add another file only when it has a clear independent responsibility.

## Expected Inputs

Use the existing `azElData` format where practical.

Use state structures similar to:

```matlab
initialState = struct( ...
    'time_s',initialTime_s, ...
    'position_deg',initialPosition_deg, ...
    'velocity_deg_s',initialVelocity_deg_s, ...
    'acceleration_deg_s2',initialAcceleration_deg_s2);

destinationState = struct( ...
    'time_s',destinationTime_s, ...
    'position_deg',destinationPosition_deg, ...
    'velocity_deg_s',destinationVelocity_deg_s, ...
    'acceleration_deg_s2',destinationAcceleration_deg_s2);
```

Use limits similar to:

```matlab
limits = struct( ...
    'azimuth_deg',azimuthLimits_deg, ...
    'elevation_deg',elevationLimits_deg, ...
    'maxVelocity_deg_s',maximumVelocity_deg_s, ...
    'maxAcceleration_deg_s2',maximumAcceleration_deg_s2, ...
    'maxJerk_deg_s3',maximumJerk_deg_s3);
```

## Expected Output

Return enough information to inspect the search and reconstructed trajectory:

```matlab
plan.success
plan.message
plan.time_s
plan.position_deg
plan.positionUnwrapped_deg
plan.velocity_deg_s
plan.acceleration_deg_s2
plan.jerk_deg_s3
plan.isWaiting
plan.stateIndices
plan.totalCost
plan.expandedStateCount
plan.generatedStateCount
plan.azimuthGrid_deg
plan.elevationGrid_deg
plan.timeGrid_s
plan.settledStateIndices
plan.bestKnownCost
plan.parentStateIndex
plan.parentJerk_deg_s3
plan.exactCollisionValidated
```

Avoid returning only the final position path.

## Relationship to the Existing Planner

The existing planner is a source of input conventions, examples, and test scenarios.

Use it to understand:

* `azElData`;
* moving obstacle boundaries;
* azimuth wrapping expectations;
* state and limit structures;
* useful visualizations;
* challenging scenarios.

Do not copy:

* safe-interval compression;
* advanced motion primitives;
* multiresolution search;
* optimized frontiers;
* topology refinement;
* analytic shortcutting;
* advanced caching.

When the simple planner fails an existing scenario, document why. Do not immediately import all mature-planner machinery.

## Completion Criteria

The first version is complete when another developer can explain:

* how azimuth, elevation, and time are discretized;
* how velocity and acceleration are discretized;
* how jerk commands are selected;
* how a jerk command propagates one state;
* how velocity, acceleration, and jerk limits are enforced;
* how azimuth wrapping is applied;
* how elevation remains bounded;
* how moving obstacles become occupied space-time regions;
* how transitions are collision checked;
* how Dijkstra selects the next state;
* how costs are relaxed;
* how parents and jerk commands are stored;
* how the final kinodynamic trajectory is reconstructed;
* how waiting is distinguished from coasting;
* how the search is visualized.

Build the simple kinodynamic baseline first.

Add advanced capability only after this framework is clear, tested, and easy to modify.
