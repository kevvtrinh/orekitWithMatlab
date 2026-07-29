# Understanding and Discretizing the Az/El/Time Workspace

## The Three Representations

The workflow uses three different representations on purpose.

### 1. `azElData`

This is the readable input. At each `time_s(k)`, it stores one polygon
boundary:

```matlab
azElData.time_s(k)
azElData.az_deg{k}
azElData.el_deg{k}
```

It is easy to inspect but expensive to traverse repeatedly.

### 2. Packed polygon workspace

```matlab
workspace = buildAzElTimeObstacleWorkspace(azElData);
```

This is not a voxel grid. It is the same polygon history packed into
contiguous arrays. Slice `k` of obstacle `j` is:

```matlab
obstacle = workspace.Obstacles(j);
first = double(obstacle.SliceOffsets(k));
last = double(obstacle.SliceOffsets(k + 1) - 1);
azimuth = obstacle.AzimuthDeg(first:last);
elevation = obstacle.ElevationDeg(first:last);
```

The important fields are:

| Field | Purpose |
|---|---|
| `TimeSeconds` | Time coordinate of every polygon slice |
| `SliceOffsets` | Start and stop index of each packed polygon |
| `AzimuthDeg`, `ElevationDeg` | Packed single-precision vertices |
| `BoundsDeg` | Fast rejection box for each slice |
| `EdgeOffsets` and edge arrays | Prebuilt edges for distance checks |

`queryAzElTimeObstacle` uses this representation directly. It avoids
allocating the complete azimuth/elevation/time volume.

The builder retains at most 64 vertices per polygon region by default. To
preserve every supplied boundary vertex:

```matlab
workspace = buildAzElTimeObstacleWorkspace( ...
    azElData, struct("MaximumVerticesPerRegion", Inf));
```

Boundary simplification and raster cell size are separate choices.

### 3. Raster hierarchy

A raster assigns occupancy to discrete cells. It is useful for visualization
and graph search, but a globally fine raster can be enormous.

For cell sizes `deltaAz`, `deltaEl`, and `Nt` time samples:

```text
Nvoxels =
    floor(azimuthSpan / deltaAz)
  * floor(elevationSpan / deltaEl)
  * Nt
```

MATLAB logical arrays use roughly one byte per element. A full
`360 deg x 180 deg` workspace at `0.1 deg` and 86,401 times is about
560 billion voxels, or roughly 522 GiB before array overhead. Building that
first is not a practical planning strategy.

## Coarse First

Build a small global preview:

```matlab
workspace = buildAzElTimeObstacleWorkspace(azElData);

gridSpec = struct( ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [-90 90], ...
    "TimeLimitsSeconds", [azElData.time_s(1), azElData.time_s(end)]);

pyramid = buildAzElTimeWorkspacePyramid( ...
    workspace, gridSpec, struct( ...
    "CoarseCellSizeDeg", 2, ...
    "FineCellSizeDeg", 0.25, ...
    "MaximumCoarseTimeSamples", 200));
```

The coarse raster answers structural questions:

- Where are the large occupied regions?
- Which side of an obstacle contains a useful corridor?
- At which coarse times does topology change?
- Which cells are close enough to a boundary to deserve refinement?

`pyramid.RefinementCandidateMask` marks spatial and temporal occupancy
changes. An unresolved candidate cell is treated as occupied by
`queryAzElTimeWorkspacePyramid` unless a fine patch covers it.

The scanline raster classifies cell centers. A feature narrower than one
coarse cell can be missed completely, and motion between retained coarse
times is not reconstructed. Choose coarse cells smaller than the narrowest
feature needed for topology, optionally dilate with `MarginCells`, and never
use the coarse preview as the final collision certificate.

## Refine a Local Region

After choosing a corridor or area of interest, rasterize only that
subvolume:

```matlab
region = struct( ...
    "AzimuthLimitsDeg", [-20 30], ...
    "ElevationLimitsDeg", [10 45], ...
    "TimeLimitsSeconds", [2700 3000]);

[pyramid, patch] = refineAzElTimeWorkspacePyramid( ...
    pyramid, workspace, region, struct( ...
    "MaximumTimeSamples", 1000));
```

The default fine cell size comes from `pyramid.FineSpec`. The region is
expanded to complete coarse cells so the hierarchy stays nested.

For complete source-time detail inside a small region:

```matlab
[pyramid, patch] = refineAzElTimeWorkspacePyramid( ...
    pyramid, workspace, region, struct( ...
    "UseAllSourceTimes", true));
```

A memory guard prevents accidental construction of a huge patch.

## Query the Hierarchy

```matlab
[occupied, info] = queryAzElTimeWorkspacePyramid( ...
    pyramid, azimuth_deg, elevation_deg, time_s);
```

`info.Level` reports whether the answer came from `"coarse"` or a fine
patch. `info.NeedsRefinement` identifies a coarse boundary cell with no fine
coverage.

The hierarchy query is suitable for grid-search acceleration. It is not the
final collision authority.

## Final Validation

Always validate a completed trajectory against the packed polygons:

```matlab
blocked = queryAzElTimeObstacle( ...
    workspace, plan.position_deg(:, 1), ...
    plan.position_deg(:, 2), plan.time_s, struct( ...
    "SafetyMarginDeg", safetyMargin_deg, ...
    "TimePaddingSamples", 1));

assert(~any(blocked), "The final path intersects an obstacle.");
```

This division of labor is the useful part:

1. Coarse raster finds global structure quickly.
2. Fine patches resolve narrow passages locally.
3. Packed polygons provide final collision accuracy.

## Visual Inspection

Run:

```matlab
result = demoCoarseToFineWorkspace();
```

The left pane shows one coarse time page. Blue cells are occupied and the
red outline marks cells that deserve refinement. The right pane shows the
coarse occupied volume and the selected fine patch in azimuth, elevation,
and time.
## Smart Adaptive Discretization

`buildAdaptiveAzElTimeMesh` provides a second, planner-oriented
representation beside the uniform coarse/fine raster pyramid.

The domain starts as large azimuth/elevation rectangles. At every retained
time, each rectangle is classified as:

- **free** when the obstacle is farther from the cell center than the cell
  half-diagonal plus the requested safety margin;
- **blocked** when all nine cell probes are occupied;
- **mixed** when an obstacle boundary may cross the cell.

Only mixed cells split. A split produces four children when both dimensions
can still shrink, or two children at a narrow domain edge. At the requested
minimum cell size, mixed cells become **unresolved** and are conservatively
treated as occupied. This prevents a coarse mesh from inventing a passage.

The spatial leaves form the 2-D discretization. Each leaf also stores
`FreeByTime`, `BlockedByTime`, `UnresolvedByTime`, and compressed
`SafeIntervals_s`. Extruding one spatial leaf over each state interval
creates sparse 3-D azimuth/elevation/time prisms without allocating a dense
voxel cube.

```matlab
mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec, struct( ...
    "InitialCellSizeDeg", 8, ...
    "MinimumCellSizeDeg", 0.5, ...
    "MaximumTimeSamples", 300));

plotAdaptiveAzElTimeMesh(mesh, struct("ViewMode", "combined"));
```

Shared-edge neighbors, including optional azimuth seam neighbors, are
precomputed in `mesh.AdjacencyEdges`. A planner can therefore search large
open leaves cheaply while using small leaves where topology is difficult.

Time decimation is still sampled. It cannot prove what happens between
retained pages, and a blocked classification may conservatively discard a
very small free pocket. Always validate a returned continuous path against
`queryAzElTimeObstacle`.
