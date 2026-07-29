# Maintainable Adaptive A* Planner

## Goal

`planAzElAdaptiveAStar` is the single planner used by the numbered examples.
It avoids a dense azimuth/elevation/time voxel lattice and uses only A*
search components.

The obstacle workspace remains a packed collection of the original polygons.
Discretization creates search states and edges only. Every returned trajectory
is checked against the packed polygons.

## State spaces

### Static obstacles

If every obstacle slice is identical over the planning interval, time adds no
topological information. The planner searches a 2-D azimuth/elevation graph:

```text
state = (azimuth grid index, elevation grid index)
```

Eight-connected A* discovers connectivity. Any-angle parent relaxation tests
line of sight to skip unnecessary grid corners. The resulting polyline is
retimed with analytic rest-to-rest rate and acceleration profiles, then checked
against the original polygons.

### Moving obstacles

For moving obstacles, a separate state for every time sample would make long
waits expensive. The planner instead uses safe-interval states:

```text
state = (azimuth, elevation, maximal safe time interval)
```

At a spatial state `q`, sampled occupancy is run-length encoded into intervals

```math
I_k(q) = [t_k^{start}, t_k^{end}].
```

One state represents any arrival time inside the interval. Waiting changes the
departure time but does not create another A* node.

## Motion edges

Candidate neighbors are generated symmetrically at several radii and direction
angles. No preferred direction or example-specific route is supplied.

For displacement `d = [d_az, d_el]`, the edge uses a synchronized
rest-to-rest trapezoidal or triangular slew. Its duration is the shortest
duration satisfying both axes' configured velocity and acceleration limits.

An edge from `(q_i, I_i)` to `(q_j, I_j)` is accepted only if:

1. departure and arrival lie inside their safe intervals;
2. the analytic slew respects rate and acceleration limits;
3. sampled points along the complete edge are outside every packed polygon;
4. the arrival can still reach the requested final time.

Azimuth differences use the shortest wrapped displacement when
`AllowAzimuthWrap` is true.

## Coarse-to-fine policy

When no graph is explicitly configured, the default angular schedule is

```text
[4h, 2h, h]
```

where `h` is `GridStep_deg`, or one degree when omitted.

For static scenes, the same any-angle A* is run from coarse to fine. Every
successful level is exactly validated and the shortest result is retained.
For moving scenes, safe-interval A* starts coarse and stops at the first
validated solution; finer levels are attempted only after failure.

This policy avoids allocating a global fine 3-D raster. Narrow passages remain
discoverable at `h`, while open topology is tested cheaply first.

If `GridStep_deg` and `PrimitiveRadii_deg` are both supplied, they define one
explicit graph and are used directly. This keeps carefully configured dynamic
problems reproducible.

## Search pseudocode

```text
workspace = pack(original obstacle polygons)
levels = choose coarse-to-fine angular resolutions

if obstacle geometry is static:
    best = none
    for h in levels:
        occupancy = sample one 2-D grid at resolution h
        route = any-angle A*(occupancy)
        command = rest-to-rest retime(route)
        if exact_polygon_validation(command):
            best = shorter(best, command)
    return best

for h in levels:
    open = {(start_position, start_safe_interval)}
    while open is not empty:
        current = pop_lowest_f(open)
        for symmetric motion primitive from current:
            intervals = cached_safe_intervals(neighbor)
            departure = earliest_exact_valid_departure(
                current, neighbor, intervals)
            relax(neighbor_interval, departure)
    if exact_polygon_validation(goal_command):
        return goal_command

return no_path
```

## Practical tuning

Start with:

```matlab
options = struct( ...
    "GridStep_deg", 0.5, ...
    "GridStepSchedule_deg", [2 1 0.5], ...
    "PrimitiveRadiusMultipliers", [1 2 4 8], ...
    "DirectionStep_deg", 45, ...
    "HeuristicWeight", 1, ...
    "SafetyMargin_deg", 0.25, ...
    "MaxSearchTime_s", 30);
```

- Reduce `GridStep_deg` only when the narrowest useful passage cannot be
  represented.
- Add longer primitive radii for large open workspaces.
- Reduce `DirectionStep_deg` when diagonal geometry needs more angular
  choices; this increases branching.
- Keep `HeuristicWeight = 1` for ordinary A*. Values above one trade graph
  optimality for speed.
- Set `ValidationStep_s` from obstacle motion and required safety fidelity,
  not from animation frame rate.
- Increase `MaximumSafeIntervalSamples` when short opening windows must be
  preserved.

## Guarantees and limits

- Returned commands are validated against the original polygons at the
  configured temporal and edge-sampling resolution.
- Velocity and acceleration limits are enforced by analytic motion profiles.
- A direct exact-valid path attains the global angular-distance lower bound.
- Other optimality claims apply only to the configured finite graph and only
  when the A* heuristic weight is one.
- Coarser failed levels do not imply no continuous path; the finest configured
  level defines search resolution completeness.
- The current public planner supports rest-to-rest boundary states. Nonzero
  boundary rate or acceleration is rejected explicitly.
- Polygon motion between input samples is represented by the workspace query
  rules. Safety-critical use must choose input and validation sampling that
  bounds that interpolation error.

## Maintenance boundaries

The core is intentionally split by responsibility:

- `planAzElAdaptiveAStar.m`: input normalization, resolution loop, mode choice.
- `private/searchAzElAnyAngleAStar.m`: static A* graph search.
- `private/searchAzElSafeIntervalAStar.m`: dynamic safe-interval A*.
- `queryAzElTimeObstacle.m`: authoritative collision query.
- `planAzElAutonomousCorridor.m`: static retiming and exact validation.

Scenario generators and assertions live under `examples`; they do not inject
routes, one-way edges, corridors, or preferred directions.

## Search visualization

Every numbered example uses `animateAzElAvoidancePlan`. Its 2-D and 3-D views
show the display-decimated selected lattice, every successful resolution
candidate that was not selected, and the selected route. Candidate trajectories
come from `plan.resolutionAttempts`; they are actual exact-validated planner
outputs rather than reconstructed display approximations.
