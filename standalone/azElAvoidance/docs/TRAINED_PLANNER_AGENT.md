# Trained Planner-Selection Agent

## Purpose

The saved agent improves search configuration selection without replacing
the maintainable Dijkstra planner. It is intentionally hybrid:

- A small classification tree ranks three static graph profiles.
- Observable dynamic topology selects one of four moving-scene profiles.
- A deterministic guard selects a fine topology profile for traps/slaloms.
- Ordinary Dijkstra receives a reserved fallback budget.

| Profile | Spatial lattice | Intended use |
|---|---:|---|
| `fast` | 2 deg | Open scenes and wide passages |
| `balanced` | 2 then 1 deg | Ordinary clutter |
| `precise` | 0.5 deg | Narrow passages |
| `topologyFine` | 1, 0.5, then 0.25 deg | Traps and slaloms |
| `dynamicTiming` | 0.5 deg | Gates and rotating slots |
| `dynamicPursuit` | 1 deg | Highly occupied moving scenes |
| `dynamicDense` | 1 deg | Many rapidly changing obstacles |
| `dynamicLongHorizon` | 2 deg | Long event-heavy missions |

This is deliberately not an end-to-end neural steering controller. A
classifier-generated trajectory would be difficult to audit and could
silently collide outside its training distribution. Here, the classifier
only changes search order. `planAzElDijkstra` still generates the command,
enforces rate and acceleration limits, and checks the result against the
packed source polygons.

## Data Flow

```text
azElData + boundary states + limits
                |
                v
 fixed-cost 14-feature probe
                |
                v
 static classifier or dynamic mode policy
                |
                v
 ranked mode-compatible profiles
                |
                v
 exact kinodynamic Dijkstra, with reserved ordinary fallback
                |
                v
 accepted only when exactCollisionValidated == true
```

The fixed probe does not rasterize the full mission. It samples 13 by 11
angular points at five times, samples the direct start-to-goal segment, and
reads inexpensive packed-polygon statistics. Its cost therefore does not
grow with an 86,400-sample source history.

Features describe obstacle count, mission duration, endpoint separation,
kinematic slack, sampled occupancy, direct-path obstruction, polygon area,
centroid motion, boundary complexity, temporal occupancy change, exact
static/dynamic status, source sample density, rotating-boundary motion, and
the fraction of obstacles that change.
The artifact stores the ordered feature names. Deployment refuses an
artifact if its feature order differs from the installed extractor.

## Training

```matlab
root = "C:\path\to\standalone\azElAvoidance";
addpath(genpath(root))

agent = trainAzElPlannerAgent();
```

The deterministic curriculum contains walls with wide, one-degree, and
half-degree passages. Every static profile runs. A profile is eligible only
when its route passes exact polygon validation and is within 5% of the
shortest curriculum route; the cheapest eligible resolution becomes the
label. Thus a coarse but unnecessarily long detour is not rewarded.

Dynamic mode selection is deterministic rather than falsely learned from
the static curriculum. Obstacle count, occupied fraction, temporal change,
mission horizon, and boundary motion select the profile family. This keeps
the policy inspectable until enough independent dynamic mission data exists
for held-out training.

The resulting artifact is saved at:

```text
models/azElPlannerAgent.mat
```

Retrain after changing feature definitions, profile definitions, collision
semantics, or the representative mission distribution. For an operational
system, replace or supplement the starter curriculum with recorded mission
benchmarks and retain an unseen validation set.

## Deployment

`planAzElWithAgent` has the same five primary inputs as the Dijkstra planner:

```matlab
plan = planAzElWithAgent( ...
    azElData, initialState, goalState, limits, struct( ...
        "AgentMaxSearchTime_s", 180, ...
        "AgentFallbackReserve_s", 45, ...
        "AgentFallback", true));
```

Ordinary Dijkstra options in the final struct override profile values. Agent
controls are:

- `AgentArtifact`: use an in-memory trained artifact.
- `AgentFile`: load a different saved artifact.
- `AgentMaxSearchTime_s`: total budget across ranked attempts.
- `AgentFallback`: try lower-ranked profiles after failure.
- `AgentFallbackReserve_s`: time preserved for ordinary Dijkstra.
- `AgentMaximumProfiles`: profile attempts before ordinary fallback.
- `AgentPrintDiagnostics`: print ranking and selection.

The returned `plan.agent` records problem mode, selection source/reason,
feature values, static classifier scores, nearest-training distance,
abstention status, ranked profiles, every attempt, and deployment time.

## Safety Boundary

The classifier has no collision authority. A successful return requires:

```matlab
plan.success && plan.exactCollisionValidated
```

Misclassification can waste search time because a poor profile may fail
before fallback. It cannot turn an invalid candidate into a successful
route. This architecture is appropriate for accelerating configuration
selection, but it does not certify vehicle hardware, environment modeling,
or real-time execution.

## Numbered-Example Benchmark

Run the fixed-goal comparison with:

```matlab
report = benchmarkPlannerAgentExamples();
```

Examples 02-12 and 15 are directly comparable. Example 01 requires caller
data, examples 13-14 use the moving-target interception workflow, and
example 16 is the calibration demonstration.

The version-2 acceptance run on 2026-07-30 produced:

- 12 of 12 exact-validated successes.
- 0.964 median agent/baseline runtime ratio.
- 1.000 median and 1.040 maximum angular-path ratio.
- One selected profile attempt for every case.

In the rotating-slot case, denser departure events reduced the route from
20.061 to 18.717 degrees and completion from 85.2 to 63.8 seconds. The
benchmark reports route ratios and completion delay alongside runtime;
training accuracy alone is not an acceptance criterion.

No finite curriculum proves success on every possible continuous problem.
Artifacts should be accepted only when held-out scenario families pass,
route inflation stays bounded, and ordinary progressive Dijkstra remains an
abstention/failure fallback. An exact-valid failure is preferable to an
unsafe accepted trajectory.
