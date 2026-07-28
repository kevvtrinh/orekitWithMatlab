# Hybrid Near-Optimal Azimuth-Elevation Steering Through Time-Varying Obstacles

**Technical white paper**

Version 1.0<br>
27 July 2026<br>
OREKIT MATLAB Upgrade Project

## Abstract

This paper describes a practical planner for steering a sensor boresight in
azimuth-elevation coordinates while avoiding time-varying forbidden regions.
The planner accepts polygonal obstacle slices indexed by time, fixed start and
stop states, azimuth and elevation limits, and per-axis rate and acceleration
limits. Its default objective is minimum azimuth-elevation coordinate-path
length.

The implementation is hybrid. It first searches a continuous family of
rest-to-rest trajectories: retimed straight segments followed, when necessary,
by dynamically feasible two-leg paths through one waypoint. The waypoint is
selected with a vectorized coarse-to-fine search in azimuth, elevation, and
time. If this search is inapplicable or unsuccessful, the planner falls back
to A* over a finite kinodynamic state lattice whose edges are
constant-acceleration motion primitives.

The method makes two distinct optimality statements. If a collision-free
retiming of the shortest wrapped straight segment exists, that segment is a
global minimum of the stated coordinate-length objective. For a returned
waypoint route of length `L`, the straight endpoint distance `L_lb` is a lower
bound on every feasible route. Therefore `L/L_lb` is a valid upper bound on
the route's multiplicative suboptimality within the planner's sampled
collision model. The Vietnam development benchmark produced a 143.092 degree
route against a 136.015 degree lower bound, certifying a ratio no greater than
1.052. This is a near-optimality certificate, not proof that the waypoint
route is the exact continuous global optimum.

## 1. Scope and Design Goals

The planner addresses a focused command-generation problem:

> Given moving forbidden regions in an azimuth-elevation-time workspace,
> compute a rate- and acceleration-limited boresight command from a prescribed
> initial state to a prescribed terminal state.

The implementation was designed around five engineering goals:

1. Work directly from compact `azElData`, without requiring Orekit at planning
   time.
2. Support long horizons and dense output, including tens of thousands of
   obstacle time slices.
3. Respect independent azimuth and elevation rate and acceleration limits.
4. Treat azimuth as periodic when requested.
5. Report the strength and scope of every optimality claim.

The planner is intended for analysis, scheduling studies, and command
prototyping. It is not, by itself, a flight-qualified guidance or collision
assurance system.

## 2. Problem Formulation

### 2.1 State and control

Let the unwrapped boresight coordinate be

```text
q(t) = [a(t), e(t)]^T,
```

where `a` is azimuth in degrees and `e` is elevation in degrees. The
kinodynamic state and control are

```text
x(t) = [a(t), e(t), a_dot(t), e_dot(t)]^T
u(t) = [a_ddot(t), e_ddot(t)]^T.
```

The model is a pair of double integrators:

```text
q_dot(t)  = v(t)
v_dot(t)  = u(t).
```

The componentwise constraints are

```text
q_min <= q(t) <= q_max,
|v(t)| <= v_max,
|u(t)| <= u_max.
```

When azimuth wrapping is enabled, azimuth occupies a 360 degree periodic
domain. Elevation remains bounded and nonperiodic.

### 2.2 Boundary conditions

The public API accepts position, velocity, and acceleration at fixed start
and stop times:

```matlab
startState = struct( ...
    "time_s", t0, ...
    "position_deg", [a0, e0], ...
    "velocity_deg_s", [va0, ve0], ...
    "acceleration_deg_s2", [aa0, ae0]);

stopState = struct( ...
    "time_s", tf, ...
    "position_deg", [af, ef], ...
    "velocity_deg_s", [vaf, vef], ...
    "acceleration_deg_s2", [aaf, aef]);
```

The continuous straight/waypoint stage currently requires zero boundary
velocity and acceleration. Nonzero boundary derivatives are routed to the
kinodynamic lattice.

### 2.3 Time-varying obstacles

At each input time `t_k`, an obstacle is a polygon in the azimuth-elevation
plane:

```text
O_k subset of R^2.
```

The sampled free-space condition is

```text
q(t_j) not in O_k expanded by the requested safety margin,
```

where the collision query maps `t_j` to the nearest obstacle slice and may
also test neighboring slices. Multiple `azElData` objects form the union of
all forbidden regions.

This is a configuration-time representation of moving obstacles, a standard
way to convert known obstacle motion into a static higher-dimensional
planning problem [6].

### 2.4 Objective

The default cost is azimuth-elevation coordinate-path length:

```text
             tf
J[q] = integral sqrt(a_dot(t)^2 + e_dot(t)^2) dt.
             t0
```

This objective measures travel in the flat azimuth-elevation chart. It is not
the great-circle angle swept by the physical boresight unit vector. Section
9.2 discusses that distinction.

The alternative objective is elapsed time. Because the public API prescribes
the terminal time, minimum-time search is most useful through the lower-level
lattice API when a goal time window is supplied.

## 3. Packed Obstacle Workspace

### 3.1 Data layout

`buildAzElTimeObstacleWorkspace` converts each input obstacle into contiguous
arrays:

- Time samples and uniform-sampling metadata
- Packed single-precision azimuth and elevation vertices
- Packed polygon edge endpoints
- Per-slice vertex and edge offsets
- Per-slice axis-aligned azimuth-elevation bounds

The default builder retains at most 64 vertices per polygonal region. Setting
`MaximumVerticesPerRegion` to `Inf` preserves every input vertex.

Packing avoids one MATLAB cell-array traversal per collision query. Bounding
boxes provide a broad phase, while packed edges support vectorized point-in-
polygon and point-to-edge distance tests.

### 3.2 Collision query

`queryAzElTimeObstacle` performs:

1. Time normalization and nearest-slice lookup
2. Axis-aligned bounding-box rejection
3. A ray-crossing polygon test for surviving points
4. An optional Euclidean edge-clearance test for `SafetyMarginDeg`
5. Optional testing of adjacent time slices through `TimePaddingSamples`

For azimuth clearance, point-to-edge checks consider shifts of -360, 0, and
360 degrees. This prevents the safety margin from becoming discontinuous at
the wrap seam.

The `"bounds"` collision mode stops after the broad phase and is
conservative. The default `"polygon"` mode uses the actual packed edges.

### 3.3 Complexity

Let `V` be the total retained vertex count, `E` the packed edge count, `K`
the number of time slices, and `Q` the number of collision queries.

- Workspace construction is `O(V + E + K)`.
- Uniform-time nearest-slice lookup is `O(Q)`.
- Broad-phase testing is `O(Q)` per obstacle.
- Narrow-phase work is proportional to the edges belonging to slices whose
  bounds contain a query point.

The exact runtime depends more strongly on broad-phase selectivity than on
the total number of stored slices. This is why packing 86,400 time samples is
practical while repeatedly rebuilding polygon objects is not.

## 4. Continuous Minimum-Distance Stage

### 4.1 Wrapped endpoint displacement

For a 360 degree azimuth span, the requested goal azimuth is unwrapped to the
shortest signed displacement from the start:

```text
Delta_a = mod(af - a0 + 180, 360) - 180.
```

The unwrapped endpoint displacement is

```text
Delta = [Delta_a, ef - e0]^T,
```

and the straight coordinate distance is

```text
L_lb = ||Delta||_2.
```

### 4.2 Synchronized rest-to-rest motion

For one geometric segment with displacement `d`, the trajectory is

```text
q(t) = q_start + s(t)d,
```

where scalar progress `s` increases monotonically from 0 to 1. Per-axis
limits induce scalar progress limits

```text
V = min_i(v_max,i / |d_i|)
A = min_i(u_max,i / |d_i|),
```

with zero-displacement axes omitted from the minimum.

The planner uses a symmetric triangular or trapezoidal velocity profile:

```text
If V^2/A >= 1:
    t_acc = sqrt(1/A)
    v_peak = sqrt(A)
    t_cruise = 0

Otherwise:
    t_acc = V/A
    v_peak = V
    t_cruise = (1 - A*t_acc^2)/v_peak

T_segment = 2*t_acc + t_cruise.
```

Because every axis uses the same `s(t)`, all axes start and stop together and
their individual limits are respected. Since `s(t)` is monotone, the
coordinate-path length of the segment is exactly `||d||_2`, independent of
its timing.

### 4.3 Straight-path retiming

The globally shortest geometric candidate is the wrapped straight segment.
The planner computes its minimum dynamically feasible duration and tests
different motion start times over the available interval. Waiting may occur
before the slew or after arrival, but does not add coordinate length.

At most 200 straight-path start times are tested. An obstacle-free workspace
requires only one timing candidate.

### 4.4 One-waypoint family

If every tested straight timing is blocked, the planner searches paths

```text
q0 -> w -> qf
```

through waypoint

```text
w = [a_w, e_w] at time t_w.
```

Both legs are synchronized rest-to-rest profiles. The first leg ends at rest
at `t_w`; the second begins from rest at the same time. A candidate is
dynamically feasible only if

```text
t_w - T_1 >= t0
t_w + T_2 <= tf.
```

Its objective value is

```text
L(w) = ||w - q0||_2 + ||qf - w||_2.
```

This restricted family is deliberately simple. It produces smooth position
and continuous velocity commands, is easy to inspect, and is much cheaper
than searching an unrestricted continuous trajectory space.

### 4.5 Coarse-to-fine search

The initial spatial grid covers the start, goal, and observed obstacle
bounds, with 20 degrees of additional room, clipped to the configured
coordinate limits. Its spacing is 10 degrees. Candidate waypoint times cover
approximately 20 percent through 95 percent of the planning interval, with a
spacing of `max(5 s, horizon/30)`.

After the best coarse waypoint is found, three local refinement levels are
used:

| Level | Az/el radius | Az/el spacing | Time radius | Time spacing |
|---:|---:|---:|---:|---:|
| 1 | 12 deg | 2 deg | 20 s | 2 s |
| 2 | 3 deg | 1 deg | 5 s | 1 s |
| 3 | 1.5 deg | 0.5 deg | 3 s | 0.5 s |

Only a refinement that shortens the best feasible path is accepted. Search
stops when all levels finish or `MaxSearchTime_s` is reached.

### 4.6 Vectorized candidate evaluation

Candidate waypoints are generated with an `ndgrid` over waypoint time,
azimuth, and elevation. The planner then:

1. Computes both legs' minimum durations in vector form.
2. Rejects candidates that cannot fit in the fixed time interval.
3. Evaluates remaining trajectories in batches of 600.
4. Uses a preliminary collision grid no finer than 0.5 seconds.
5. Sorts surviving candidates by geometric length.
6. Reconstructs candidates in that order and rechecks the selected profile at
   the requested `SampleTime_s`.

This arrangement spends most computation in vectorized numeric kernels and
does not construct one MATLAB object per candidate.

## 5. Kinodynamic A* Fallback

Kinodynamic planning combines obstacle avoidance with velocity and
acceleration constraints [2]. The fallback follows the state-lattice pattern
of encoding only dynamically feasible local connections [3].

### 5.1 Finite lattice

Each search node contains

```text
[a, e, a_dot, e_dot, time_step]
```

and its incoming azimuth and elevation accelerations. Acceleration is part of
the state key because the terminal acceleration can be constrained.

The default control set is the Cartesian product of normalized acceleration
levels `[-1, 0, 1]` on both axes. Each edge applies constant acceleration for
one lattice time step:

```text
q_next = q + v*dt + 0.5*u*dt^2
v_next = v + u*dt.
```

Position and velocity resolutions must be compatible with these primitives
so that every propagated state lands on the lattice. Wrapped azimuth must
also contain an integer number of position bins.

### 5.2 Edge validation

Each primitive is sampled at

```text
max(2, ceil(dt/CollisionCheckStepSeconds) + 1)
```

points. All samples are checked against coordinate limits and the packed
obstacles. The public wrapper sets the collision-check step to the requested
output `SampleTime_s` and uses one neighboring obstacle slice as temporal
padding.

### 5.3 Search costs and heuristics

For minimum time, every edge costs `dt`. The heuristic is the maximum of:

- A per-axis position/rate lower bound
- The time needed to change the current rates toward the goal rates
- Any wait required before the goal time window opens

For minimum coordinate distance, edge cost is

```text
integral ||v(t)||_2 dt
```

approximated by nine-point composite Simpson quadrature. The heuristic is the
straight wrapped coordinate distance remaining to the goal. A* uses

```text
f(n) = g(n) + w*h(n),
```

where `w = 1` is ordinary A* and `w > 1` is bounded weighted A*. The
foundational A* optimality conditions are described by Hart, Nilsson, and
Raphael [1]. Inflated heuristics and their solution-quality bounds are
discussed by Likhachev, Gordon, and Thrun [5].

### 5.4 Coarse planning strides

Long public requests do not immediately create one lattice layer per output
sample. The wrapper selects a coarse internal time step targeting roughly 30
search decisions, capped at 10 seconds, and then tries progressively finer
divisors of the output horizon. Collision checking and returned commands
still use the requested output sample time.

This policy reduces graph depth, but it also means lattice optimality applies
to the successful internal lattice, not to every finer lattice that could be
constructed.

## 6. Optimality and Certification

### 6.1 Exact straight-path result

**Proposition 1.** If a dynamically feasible, collision-free retiming of the
shortest wrapped straight segment exists, that segment globally minimizes the
azimuth-elevation coordinate-length objective.

**Reason.** Every continuous curve from `q0` to the selected unwrapped `qf`
satisfies

```text
J[q] >= ||qf - q0||_2
```

by the triangle inequality. The straight segment has length exactly
`||qf - q0||_2`, so no other feasible curve can be shorter. Retiming and
waiting do not change geometric length.

For this case the implementation reports:

```text
optimalGlobally = true
suboptimalityBound = 1
```

### 6.2 Waypoint-route bound

Let:

- `L` be the length of the returned feasible waypoint route
- `L*` be the unknown globally optimal feasible route length
- `L_lb = ||qf - q0||_2`

Every feasible route obeys

```text
L* >= L_lb.
```

Therefore

```text
L/L* <= L/L_lb.
```

The implementation reports

```text
suboptimalityBound = L/L_lb.
```

For example, a value of 1.052 proves that the returned route is no more than
5.2 percent longer than the global optimum under the same objective,
coordinate representation, obstacle discretization, and feasibility model.

This certificate does **not** prove that `L = L*`. It may be conservative
because the endpoint distance ignores obstacles and dynamics.

The certificate assumes `L_lb > 0` and that the returned trajectory is
feasible in the model being certified. With sampled collision tests,
"feasible" means no tested sample is occupied; it is not a continuous-time
collision proof.

### 6.3 Lattice optimality

With `HeuristicWeight = 1`, positive edge costs, an admissible heuristic, no
premature resource-limit termination, and the configured finite graph, A*
returns an optimal graph path [1]. This is:

- Exact on the configured lattice
- Relative to its motion primitives and collision samples
- Not an exact optimum over all continuous trajectories

For `HeuristicWeight = w > 1`, the reported factor `w` is the standard
weighted-A* graph bound under the corresponding heuristic assumptions [5].

For the angular-distance lattice objective, Simpson quadrature is a numerical
approximation to edge arc length. The code uses a fine fixed rule, but a
formal lattice-optimality proof would additionally need to establish that
quadrature error cannot invalidate heuristic admissibility. This caveat does
not affect the continuous waypoint certificate, whose segment lengths are
analytic.

## 7. Validation and Development Benchmark

### 7.1 Automated verification

At implementation commit `add1b89`, verification produced:

| Verification | Result |
|---|---:|
| Focused planner/workspace tests | 21 passed, 0 failed |
| Full MATLAB suite | 134 passed, 0 failed, 0 incomplete |
| MATLAB Code Analyzer | Clean for changed planner files |
| Standalone source comparison | Byte-identical to repository planner |
| Standalone path-isolation run | Passed |

The focused tests cover:

- Globally shortest unobstructed straight motion
- Polygon avoidance with a safety margin
- Multiple obstacles
- Azimuth wrapping across the -180/180 degree seam
- A moving gate that requires waiting
- Low-level minimum-distance A* cost
- Primitive-level collision checking between lattice nodes
- Synchronized 2-D and 3-D animation modes

### 7.2 Vietnam case

The development case used the following boundary conditions:

| Quantity | Value |
|---|---|
| Start time | 2700 s |
| Stop time | 3000 s |
| Start az/el | [-30, 0] deg |
| Stop az/el | [80, 80] deg |
| Boundary rates | [0, 0] deg/s |
| Boundary accelerations | [0, 0] deg/s^2 |
| Maximum rates | [1, 1] deg/s |
| Maximum accelerations | [3, 3] deg/s^2 |
| Output sample time | 0.1 s |
| Safety margin | 1 deg |
| Azimuth wrapping | Enabled |

Observed results on the development machine were:

| Metric | Result |
|---|---:|
| Previous route | 192.534 deg |
| Hybrid waypoint route | 143.092 deg |
| Reduction from previous route | 25.7 percent |
| Straight endpoint lower bound | 136.015 deg |
| Certified multiplicative bound | 1.0520 |
| Maximum excess over global optimum | 5.2 percent |
| Source-tree runtime | 19.773 s |
| Standalone-only runtime | 19.468 s |
| Returned command samples | 3001 |
| Occupied returned samples | 0 |
| Maximum observed per-axis rate | 1 deg/s |
| Maximum observed per-axis acceleration | 3 deg/s^2 |

The selected waypoint was approximately:

```text
time       = 2927.5 s
azimuth    = 8.60 deg
elevation  = 55.50 deg.
```

These figures are a reproducibility record for one development data set, not
a broad statistical performance claim.

## 8. Why the Method Is Fast

The method avoids a prohibitively fine search over the full state-time space
in its most common operating regime.

1. The straight segment is tested first because it has an immediate global
   optimality proof.
2. The fallback continuous family has only one spatial waypoint and one
   waypoint time.
3. Dynamic feasibility is computed analytically before collision testing.
4. Candidate profiles are evaluated in vectorized batches.
5. Obstacles are packed once and reused.
6. Bounding boxes reject most point-polygon tests.
7. Coarse search is followed by local refinement instead of uniform global
   refinement.
8. The high-dimensional A* lattice is used only when the simpler family
   cannot solve the request.

The dominant continuous-stage cost is approximately proportional to

```text
N_candidate * N_collision_time_samples,
```

after dynamic rejection. The batch size limits peak temporary-array growth,
while `MaxSearchTime_s` bounds wall-clock effort.

## 9. Limitations

### 9.1 No exact global proof for a blocked straight path

The one-waypoint search is not exhaustive over arbitrary curves, multiple
waypoints, or all waypoint coordinates and times. The returned ratio is a
global upper bound on relative path length, but the route itself is not
proved to equal the continuous optimum.

### 9.2 Flat az/el metric

The implemented objective is

```text
ds_flat^2 = da^2 + de^2.
```

For a physical boresight unit vector, the spherical line element is instead

```text
ds_sphere^2 = cos(e)^2 da^2 + de^2
```

when angles are expressed in radians. Near high elevation, a degree of
azimuth represents less physical rotation than it does near zero elevation.
Applications that truly minimize actuator rotation or unit-vector angle
should use the spherical metric or the actual gimbal kinematics.

### 9.3 Sampled collision checking

The final continuous profile is tested at `SampleTime_s`, with adjacent
obstacle slices included. A narrow obstacle or fast crossing between command
samples can be missed. Decreasing the sample interval and increasing safety
and temporal margins reduce this risk but do not create a mathematical
continuous-collision certificate.

### 9.4 Sampled obstacle motion

Obstacle polygons are selected by nearest time slice rather than continuously
interpolated. `TimePaddingSamples = 1` is conservative for many slowly
changing cases, but it is not equivalent to a swept polygon between slices.

### 9.5 One waypoint and rest at the waypoint

The continuous detour contains at most one waypoint and reaches zero velocity
there. A continuously curving trajectory could be shorter or faster. The
rest condition is valuable for maintainability and analytic feasibility, but
it restricts the candidate family.

### 9.6 Acceleration discontinuity and no jerk bound

Triangular and trapezoidal profiles switch acceleration instantaneously.
They satisfy acceleration magnitude limits but do not constrain jerk.
Commanding real hardware may require an S-curve or another jerk-limited
retiming stage followed by collision revalidation.

### 9.7 Geometry reduction

The default 64-vertex cap reduces storage and query cost but can modify a
high-detail boundary. Safety-critical use should retain sufficient geometry
or quantify the simplification error.

### 9.8 Search parameter coupling

The public `GridStep_deg` controls lattice construction. The continuous
waypoint stage currently uses its own fixed coarse and refinement spacings.
Exposing those values as explicit options would improve tuning and
reproducibility.

### 9.9 Deterministic known obstacles

The planner assumes obstacle geometry and timing are known. It does not model
ephemeris uncertainty, attitude error, latency, actuator tracking error, or
uncertain target motion except through user-selected margins.

## 10. Recommended Operational Use

For each planned command:

1. Choose `SampleTime_s` from obstacle motion, sensor control bandwidth, and
   acceptable miss distance, not only animation smoothness.
2. Set `SafetyMargin_deg` to cover polygon approximation, pointing error,
   timing uncertainty, and command tracking error.
3. Retain full obstacle geometry when boundary simplification is not
   justified.
4. Inspect `optimalGlobally`, `angularLowerBound_deg`, and
   `suboptimalityBound`; do not infer exact global optimality from a visually
   smooth path.
5. Independently recheck the final command on a denser time grid.
6. Convert az/el commands through the actual sensor mount model before
   commanding hardware.
7. Replan when the obstacle prediction or boundary conditions change.

## 11. Future Work

The following extensions would strengthen quality or guarantees:

- Adaptive collision subdivision based on relative path and obstacle motion
- Conservative swept-polygon construction between obstacle slices
- Multiple-waypoint branch-and-bound using the endpoint lower bound
- Ellipsoidal or obstacle-aware lower bounds tighter than endpoint distance
- Spherical boresight or actuator-space path-length objectives
- Jerk-limited S-curve motion profiles
- Anytime refinement that preserves the best feasible path at every stage
- ARA*-style reuse between decreasing heuristic weights [5]
- Asymptotically optimal sampling-based planning such as RRT* [7]
- Direct trajectory optimization initialized by the current waypoint route
- Formal interval collision checks and validated numerical quadrature
- MEX or native-code acceleration for very large candidate sets

RRT* and related methods converge toward the optimum under their stated
assumptions [7], but asymptotic optimality is not finite-time proof of having
reached the exact optimum. For this application, the present analytic lower
bound remains useful even if the candidate generator is later replaced.

## 12. Implementation Map

The repository implementation is divided as follows:

| Responsibility | Source |
|---|---|
| Public planner and hybrid dispatch | [`src/analysis/planAzElAvoidance.m`](../src/analysis/planAzElAvoidance.m) |
| Continuous straight/waypoint search | [`src/analysis/planAzElMinimumDistance.m`](../src/analysis/planAzElMinimumDistance.m) |
| Kinodynamic A* lattice | [`src/analysis/planAzElKinodynamicAStar.m`](../src/analysis/planAzElKinodynamicAStar.m) |
| Packed obstacle workspace | [`src/analysis/buildAzElTimeObstacleWorkspace.m`](../src/analysis/buildAzElTimeObstacleWorkspace.m) |
| Collision query | [`src/analysis/queryAzElTimeObstacle.m`](../src/analysis/queryAzElTimeObstacle.m) |
| Public planner tests | [`src/tests/testPlanAzElAvoidance.m`](../src/tests/testPlanAzElAvoidance.m) |
| Lattice tests | [`src/tests/testAzElKinodynamicAStar.m`](../src/tests/testAzElKinodynamicAStar.m) |
| Orekit-independent package | [`standalone/azElAvoidance`](../standalone/azElAvoidance) |

## References

[1] P. E. Hart, N. J. Nilsson, and B. Raphael, "A Formal Basis for the
Heuristic Determination of Minimum Cost Paths," *IEEE Transactions on Systems
Science and Cybernetics*, vol. 4, no. 2, pp. 100-107, 1968.
[doi:10.1109/TSSC.1968.300136](https://doi.org/10.1109/TSSC.1968.300136)

[2] B. Donald, P. Xavier, J. Canny, and J. Reif, "Kinodynamic Motion
Planning," *Journal of the ACM*, vol. 40, no. 5, pp. 1048-1066, 1993.
[doi:10.1145/174147.174150](https://doi.org/10.1145/174147.174150)

[3] M. Pivtoraiko and A. Kelly, "Efficient Constrained Path Planning via
Search in State Lattices," *Proceedings of the 8th International Symposium on
Artificial Intelligence, Robotics and Automation in Space*, 2005.
[Carnegie Mellon Robotics Institute publication](https://publications.ri.cmu.edu/efficient-constrained-path-planning-via-search-in-state-lattices)

[4] S. M. LaValle, *Planning Algorithms*. Cambridge University Press, 2006,
especially Chapters 2, 7, 13, and 14.
[Author-hosted electronic edition](https://lavalle.pl/planning/)

[5] M. Likhachev, G. Gordon, and S. Thrun, "ARA*: Anytime A* Search with
Provable Bounds on Sub-Optimality," *Advances in Neural Information Processing
Systems 16*, 2003.
[Author publication page](https://robots.stanford.edu/papers/Likhachev03b.html)

[6] J. Reif and M. Sharir, "Motion Planning in the Presence of Moving
Obstacles," *Journal of the ACM*, vol. 41, no. 4, pp. 764-790, 1994.
[doi:10.1145/179812.179911](https://doi.org/10.1145/179812.179911)

[7] S. Karaman and E. Frazzoli, "Sampling-based Algorithms for Optimal
Motion Planning," *The International Journal of Robotics Research*, vol. 30,
no. 7, pp. 846-894, 2011.
[doi:10.1177/0278364911406761](https://doi.org/10.1177/0278364911406761)
