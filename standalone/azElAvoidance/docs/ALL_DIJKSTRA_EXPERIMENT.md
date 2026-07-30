# All-Dijkstra Planner Experiment

## Purpose

Branch `codex/all-dijkstra` tests the smallest search architecture that
supports both static and moving azimuth/elevation obstacles:

- static geometry uses reverse Dijkstra on a spatial occupancy lattice;
- moving geometry uses forward Dijkstra on spatial-point/safe-interval
  states.

The dynamic conversion changes only queue ordering. Workspace packing,
adaptive spatial resolutions, safe-interval compression, analytic slew
edges, waiting, terminal capture, and authoritative polygon validation remain
unchanged.

## Dynamic state and queue cost

A dynamic state is

```text
(azimuth/elevation grid point, safe-interval index)
```

Its label is the earliest collision-free arrival time in that interval.
Queue priority is exactly

```text
priority = arrival time
```

The obstacle-free time-to-go lower bound remains useful for rejecting labels
that cannot meet the deadline and for breaking equal-cost ties. It never
changes the primary queue order.

Provided transitions obey the first-in-first-out property, this is ordinary
uniform-cost Dijkstra on the finite sampled safe-interval graph. It minimizes
earliest arrival on that graph. It does not establish continuous-space
optimality, and it does not minimize angular distance when the public planner
later compares candidates by angular length.

## Validation

MATLAB R2024b produced:

- zero Code Analyzer messages across the public, private, and example-support
  MATLAB files;
- 5/5 focused fixed-goal tests passed;
- 33/33 complete standalone tests passed;
- 5/5 fresh randomized blinking-board cases passed during the all-Dijkstra
  full-suite run.

Every successful plan retained exact packed-polygon validation and the
configured velocity, acceleration, endpoint, and azimuth-wrap checks.

## Runtime observations

The full all-Dijkstra suite accumulated `247.826 s` of test duration. The
unchanged `6b8ee45` baseline accumulated `162.393 s`, making the experimental
run about 52.6% slower. That aggregate comparison is directional rather than
a controlled benchmark because randomized tests used different fresh seeds
and MATLAB runtime varies between processes.

Three deterministic dynamic tests were therefore rerun separately:

| Scenario | Baseline test time | All-Dijkstra test time | Change |
| --- | ---: | ---: | ---: |
| Stop-go gates | 11.991 s | 13.141 s | +9.6% |
| Crossy Road rendezvous | 36.099 s | 32.823 s | -9.1% |
| Spinning-rod spiral | 30.160 s | 55.212 s | +83.1% |

The spinning-rod planner search itself increased from `28.95 s` to `53.84 s`.
This is the expected weakness of uniform-cost search: it must settle all
cheaper arrival labels before reaching a distant goal, while A* can focus
expansion toward that goal. Crossy Road did not show that penalty in this
run, illustrating that heuristic guidance is not uniformly beneficial and
that process-level timing noise remains material.

## Conclusion

The all-Dijkstra design is valid and notably simpler:

1. use reverse Dijkstra for static topology;
2. use forward safe-interval Dijkstra for moving topology;
3. apply the same kinematic edges and exact validation to both.

It passed the current functional suite without scenario hints. The measured
spinning-rod penalty is large enough that this branch should remain an
experiment until repeated, fixed-seed benchmarks show whether the maintenance
benefit outweighs dynamic runtime. The existing heuristic search remains the
better performance default for difficult distant-goal dynamic volumes.
