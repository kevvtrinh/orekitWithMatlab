# Trained Planner-Selection Agent

## Purpose

The saved agent improves search configuration selection without replacing
the maintainable Dijkstra planner. It learns which of three graph profiles
to try first:

| Profile | Spatial lattice | Intended use |
|---|---:|---|
| `fast` | 2 deg | Open scenes and wide passages |
| `balanced` | 1 deg | Ordinary clutter |
| `precise` | 0.5 deg | Narrow passages |

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
 fixed-cost 10-feature probe
                |
                v
 saved classification tree
                |
                v
 ranked profiles: fast / balanced / precise
                |
                v
 exact kinodynamic Dijkstra, with ranked fallback
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
centroid motion, boundary complexity, and temporal occupancy change.
The artifact stores the ordered feature names. Deployment refuses an
artifact if its feature order differs from the installed extractor.

## Training

```matlab
root = "C:\path\to\standalone\azElAvoidance";
addpath(genpath(root))

agent = trainAzElPlannerAgent();
```

The deterministic curriculum contains walls with wide, one-degree, and
half-degree passages. Each case is offered to profiles from cheapest to most
expressive. The first profile whose route passes exact polygon validation
becomes the supervised label. Thus labels come from planner evidence, not
from a manually declared answer.

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
        "AgentMaxSearchTime_s", 45, ...
        "AgentFallback", true));
```

Ordinary Dijkstra options in the final struct override profile values. Agent
controls are:

- `AgentArtifact`: use an in-memory trained artifact.
- `AgentFile`: load a different saved artifact.
- `AgentMaxSearchTime_s`: total budget across ranked attempts.
- `AgentFallback`: try lower-ranked profiles after failure.
- `AgentPrintDiagnostics`: print ranking and selection.

The returned `plan.agent` records feature values, classifier scores, ranked
profiles, every attempted profile, fallback use, and deployment time.

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
