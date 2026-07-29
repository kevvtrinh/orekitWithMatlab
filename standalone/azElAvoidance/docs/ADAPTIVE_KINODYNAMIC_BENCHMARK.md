# Adaptive-Mesh Kinodynamic A* Benchmark

## Question

Can unweighted kinodynamic A* run faster while using the adaptive
azimuth/elevation/time mesh as its collision representation?

## Method

Examples 02-12 were run with their existing planner to establish a valid
baseline. Example 13 used deterministic seed `1478112231`; its moving target
was fixed at the interception selected by the baseline planner. Example 01
was omitted because it intentionally requires caller-supplied `azElData`.

For each case:

1. Build `AdaptiveAzElTimeMesh` using the example limits, safety margin, and
   time interval.
2. Run `planAzElKinodynamicAStar` with heuristic weight one and a 15-second
   wall-time limit.
3. Compare up to 5,000 adaptive leaf/time samples with the original packed
   polygons.
4. Densely replay every successful motion primitive against the packed
   polygons at 0.1-second spacing.

The kinematic state lattice is unchanged. Only the collision backend is
replaced by the adaptive mesh.

## Results

| Example | Mesh build (s) | Leaves | Occupancy accuracy | False-positive free-space loss | A* result |
|---|---:|---:|---:|---:|---|
| 02 Vietnam + China | 12.84 | 5,562 | 94.28% | 6.62% | Timeout |
| 03 Kinodynamic detour | 0.21 | 156 | 87.18% | 13.89% | Timeout |
| 04 Moving walls | 0.31 | 105 | 72.84% | 32.63% | **Pass, 1.11 s** |
| 05 Five-turn spiral | 17.41 | 3,340 | 74.54% | 52.09% | Timeout |
| 06 Stop-go gates | 0.34 | 82 | 100.00% | 0.00% | Timeout |
| 07 Wrapped seam | 1.34 | 1,152 | 91.67% | 9.38% | Timeout |
| 08 Alternating slalom | 1.52 | 959 | 67.47% | 43.39% | Timeout |
| 09 U-trap | 1.28 | 902 | 68.74% | 48.62% | Timeout |
| 10 Rotating slots | 303.66 | 6,913 | 89.64% | 24.13% | Timeout |
| 11 Chased boresight | 5.78 | 393 | 88.14% | 23.29% | Timeout |
| 12 Windmills | 20.47 | 640 | 62.68% | 71.82% | Timeout |
| 13 Blinking intercept | 12.90 | 512 | 68.86% | 58.29% | No path |

Every sampled case had a zero false-negative rate: the mesh did not label an
exactly occupied sample as free. It was instead conservative, sometimes
discarding most of the real free space.

Example 04 produced a 14.839-degree path, 0.984 times the baseline length,
with zero collisions in exact replay. It expanded 267 nodes.

Examples 03 and 06 were also run with 60-second limits. Both still timed
out, after 21,301 and 31,621 expansions respectively.

## Matched Collision-Backend Control

On the same case-04 kinodynamic lattice:

- packed polygons: 0.54 seconds, 399 expansions;
- adaptive mesh: 1.11 seconds, 267 expansions.

For case 03, both backends timed out at 15 seconds:

- packed polygons processed 15,377 expansions;
- adaptive mesh processed 5,300 expansions.

The packed representation is highly vectorized. The MATLAB adaptive lookup
has enough per-query overhead that fewer collision candidates do not
currently translate into higher search throughput.

## Conclusion

The adaptive mesh is safe and useful for visualization, coarse topology,
and heuristic guidance. It is not a good direct replacement for packed
polygon collision checking in unweighted kinodynamic A*:

- unweighted space-time state expansion dominates run time;
- conservative mixed cells remove narrow valid corridors;
- dynamic curved obstacles can make adaptive construction expensive;
- packed polygon batches are currently faster than adaptive MATLAB lookup.

The recommended architecture is hybrid:

1. use adaptive leaves to discover topology and construct an informed
   corridor or heuristic;
2. retain packed polygons for exact primitive collision checks;
3. use adaptive safe-interval A* rather than global unweighted kinodynamic
   A*;
4. refine only the selected corridor and ambiguous endpoint cells.

Run the benchmark with:

```matlab
report = benchmarkAdaptiveMeshKinodynamicAStar();
```
