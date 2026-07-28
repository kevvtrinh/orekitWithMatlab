# Unified Azimuth-Elevation Space-Time Funnel Planning

**Technical white paper**

Version 2.0

28 July 2026

OREKIT MATLAB Upgrade Project

## Abstract

This paper describes the unified planner implemented by
`planAzElSpaceTimeFunnel` for steering a sensor boresight through forbidden
regions in azimuth, elevation, and time. The planner accepts polygonal
obstacle slices, fixed boundary states, angular limits, actuator rate and
acceleration limits, and safety and discretization options. Its output is a
time-tagged azimuth/elevation command with corresponding rate, acceleration,
waiting, collision, search, and optimality metadata.

The method is deliberately hybrid, but it presents one planner entry point.
It first attempts a direct wait-and-slew trajectory whose angular length
equals the wrapped endpoint lower bound. Static obstacle volumes are then
compressed to one occupancy problem and solved by Theta*-style any-angle
topology search, optional multiresolution refinement, visibility
simplification, and analytic retiming. Dynamic volumes are handled by an
event-compressed Safe Interval Path Planning search whose states pair lazy
azimuth/elevation grid positions with run-length-compressed safe time
intervals. A widening space-time funnel can subsequently constrain an
Anytime Repairing A* search over a finite position, angular-rate, and time
lattice with constant-acceleration primitives. Moving endpoints are handled
by an interception wrapper that invokes the same planner at sampled feasible
catch times.

The strongest guarantee is intentionally narrow: a successful direct
certificate is a continuous-space global minimum for the wrapped
azimuth/elevation coordinate-path-length objective. A completed ARA* pass
provides its reported bound only on the configured finite lattice, and a
corridor pass only within that corridor. Static and safe-interval guide
solutions are feasible and densely validated but are not claimed to be
continuous global optima. This separation of guarantees is central to the
design.

## 1. Purpose and Scope

The planning problem is:

> Given one or more time-indexed forbidden regions in an
> azimuth/elevation workspace, compute a collision-free boresight command
> between prescribed boundary states while respecting mount limits.

This is a configuration-space motion-planning problem in a time-varying
environment [8, 9, 12].

The implementation is intended for:

- sensor scheduling and access studies;
- slew feasibility analysis;
- command prototyping;
- obstacle-avoidance algorithm evaluation;
- Orekit-independent work beginning with canonical `azElData`.

It is not, by itself, a flight-qualified guidance or collision-assurance
system. It assumes deterministic obstacle geometry and timing. Uncertainty
must currently be represented through margins, time padding, or external
robustification.

The principal design goals are:

1. Expose one high-level planner instead of requiring users to choose a
   search algorithm.
2. Avoid a full azimuth/elevation/rate/time lattice whenever a cheaper
   certificate or topology guide is sufficient.
3. Treat waiting as a first-class action for moving obstacles.
4. Support periodic azimuth without discontinuous commands.
5. Respect independent per-axis rate and acceleration limits.
6. Preserve an explicit best feasible result when optional refinement runs
   out of resources.
7. State the exact scope of every optimality and collision claim.

## 2. Problem Formulation

### 2.1 Configuration, state, and control

Let the unwrapped boresight configuration be

```math
q(t) =
\begin{bmatrix}
a(t) \\
e(t)
\end{bmatrix},
```

where `a` is azimuth in degrees and `e` is elevation in degrees. The
kinodynamic state and control are

```math
x(t) =
\begin{bmatrix}
q(t) \\
v(t)
\end{bmatrix},
\qquad
u(t) = \dot{v}(t).
```

The actuator model used by the planner is a pair of double integrators:

```math
\dot{q}(t) = v(t),
\qquad
\dot{v}(t) = u(t).
```

The componentwise limits are

```math
q_{\min} \le q(t) \le q_{\max},
\qquad
|v(t)| \le v_{\max},
\qquad
|u(t)| \le u_{\max}.
```

The public boundary state is

```matlab
state = struct( ...
    "time_s", t, ...
    "position_deg", [azimuth, elevation], ...
    "velocity_deg_s", [azimuthRate, elevationRate], ...
    "acceleration_deg_s2", [azimuthAcceleration, ...
                            elevationAcceleration]);
```

The current direct, static-topology, and safe-interval guide modes require
zero boundary velocity and acceleration. The kinodynamic lattice supports
nonzero boundary rates within its configured tolerances.

### 2.2 Periodic azimuth

When azimuth wrapping is enabled, the azimuth domain has span `S = 360 deg`.
The shortest signed displacement from `a_1` to `a_2` is

```math
\Delta_a =
\operatorname{mod}\left(a_2-a_1+\frac{S}{2}, S\right)-\frac{S}{2}.
```

Elevation remains bounded and nonperiodic. The planner stores both:

- `position_deg`, wrapped to the configured azimuth interval; and
- `positionUnwrapped_deg`, continuous across the seam.

### 2.3 Time-varying forbidden set

Obstacle `i` is supplied as polygon samples

```math
O_i(t_k) \subset \mathbb{R}^2.
```

The union of all forbidden regions at time `t` is

```math
O(t) = \bigcup_i O_i(t).
```

With safety margin `m`, feasibility requires

```math
\operatorname{dist}(q(t), O(t)) > m
```

under the repository's sampled-time collision semantics. A query may also
test adjacent obstacle slices, producing a conservative temporal padding
around the nearest input sample.

### 2.4 Objective functions

The default objective is azimuth/elevation coordinate-path length:

```math
J_L[q] = \int_{t_0}^{t_f} \|\dot{q}(t)\|_2\,dt.
```

The fixed endpoints provide a lower bound:

```math
L_{\mathrm{lb}} =
\sqrt{\Delta_a^2 + (e_f-e_0)^2}.
```

Every feasible curve between the endpoints has length at least
`L_lb`. The low-level lattice planner also supports a minimum-time
objective:

```math
J_T = t_{\mathrm{arrival}} - t_0.
```

That objective is meaningful when the low-level goal supplies an arrival
window. The unified API fixes `stopState.time_s`; its safe-interval guide
still favors early arrival before terminal waiting, but a lattice trajectory
constrained to that exact terminal time has constant elapsed-time cost. The
examples therefore use the angular-distance objective unless their behavior
is specifically temporal.

## 3. Data and Workspace Representation

### 3.1 Canonical obstacle input

Each independent obstacle is represented by:

```matlab
azElData = struct( ...
    "targetName", "Obstacle name", ...
    "time_s", time_s, ...
    "az_deg", {azimuthPolygonByTime}, ...
    "el_deg", {elevationPolygonByTime}, ...
    "status", status);
```

Multiple obstacles may be passed as a struct array, a cell array, or the
output of `combineAzElObstacles`.

### 3.2 Packed workspace

`buildAzElTimeObstacleWorkspace` converts every obstacle into contiguous
arrays:

- sample times;
- slice offsets;
- packed polygon vertices;
- packed polygon edges;
- per-slice bounding boxes;
- edge offsets;
- uniform-time metadata.

This structure avoids repeatedly traversing MATLAB cell arrays during large
collision-query batches. Broad-phase bounding-box rejection precedes exact
point-in-polygon and edge-distance tests.

The workspace can be reused across many planning calls. One limitation of
the current unified implementation is that automatic static-volume
acceleration requires raw `azElData`; a prebuilt workspace currently takes
the dynamic guide path because the static branch rebuilds topology from the
raw obstacle collection.

## 4. Unified Planner Architecture

The high-level control flow is:

```text
normalize inputs
pack or reuse obstacle workspace
compute wrapped endpoint lower bound

if zero boundary rate/acceleration:
    if raw obstacle volume is exactly static:
        try direct certificate with a one-expansion probe
        if direct certificate fails:
            run static any-angle topology acceleration
            return if successful
    else:
        run event-compressed safe-interval guide

retain the guide as the best feasible trajectory

if enabled, a guide exists, and the direct path is not certified:
    run ARA* inside progressively wider space-time funnels

if global fallback is enabled, resources remain, and no ARA* result was
selected (or AlwaysTryGlobalSearch is true):
    run unrestricted kinodynamic ARA*

return the best densely validated trajectory
```

### 4.1 Consolidated pseudocode

```text
ALGORITHM UnifiedSpaceTimeFunnel(data, start, stop, limits, options)
    options   <- Normalize(options)
    workspace <- PackOrReuse(data)
    lowerBound <- WrappedEndpointDistance(start, stop)

    guide <- FAILURE

    if BoundaryDerivativesAreZero(start, stop) then
        if RawDataAvailable(data)
           and IsExactlyStatic(workspace, start.time, stop.time)
           and options.objective = angularDistance then

            guide <- SafeIntervalSearch(maxExpansions = 1)

            if not guide.hasGlobalDirectCertificate then
                staticPlan <- StaticTopologyMode(
                    data, start, stop, limits, options)

                if staticPlan.success then
                    return staticPlan
                end if

                guide <- SafeIntervalSearch(fullBudget)
            end if
        else
            guide <- SafeIntervalSearch(fullBudget)
        end if
    end if

    best <- guide if guide.success else FAILURE

    if options.enableARA
       and guide.success
       and not guide.hasGlobalDirectCertificate then
        for radius in options.corridorRadiusSchedule do
            corridor <- BuildTimeIndexedTube(guide, radius)
            candidate <- KinodynamicARAStar(workspace, corridor)
            best <- BetterValidated(best, candidate)
        end for
    end if

    if options.globalFallback
       and ResourcesRemain()
       and (not SelectedARAResult() or options.alwaysTryGlobal) then
        candidate <- KinodynamicARAStar(workspace, noCorridor)
        best <- BetterValidated(best, candidate)
    end if

    return best
END
```

## 5. Direct Wait-and-Slew Certificate

### 5.1 Normalized segment motion

For a segment displacement

```math
d = q_1-q_0,
```

the guide uses one scalar progress variable `s(t)`:

```math
q(t) = q_0 + d\,s(t),
\qquad
s(0)=0,
\qquad
s(T)=1.
```

All active axes therefore start, cruise, and stop synchronously. Define the
normalized rate and acceleration limits

```math
r = \min_{j:|d_j|>0}\frac{v_{\max,j}}{|d_j|},
\qquad
\alpha = \min_{j:|d_j|>0}\frac{u_{\max,j}}{|d_j|}.
```

If

```math
\frac{r^2}{\alpha} \ge 1,
```

the profile is triangular:

```math
t_a = \sqrt{\frac{1}{\alpha}},
\qquad
\dot{s}_{\mathrm{peak}} = \sqrt{\alpha},
\qquad
T = 2t_a.
```

Otherwise the profile is trapezoidal:

```math
t_a = \frac{r}{\alpha},
\qquad
t_c = \frac{1-\alpha t_a^2}{r},
\qquad
T = 2t_a+t_c.
```

During the accelerating interval,

```math
s(\tau) = \frac{1}{2}\alpha\tau^2.
```

The cruise interval is linear, and the deceleration interval is its
time-reversed counterpart:

```math
s(\tau) =
1-\frac{1}{2}\alpha(T-\tau)^2.
```

The construction is the two-axis rest-to-rest specialization of
rate/acceleration-bounded path timing; related general path-retiming methods
are developed in [10, 11].

### 5.2 Departure-time search

The planner identifies intervals during which the start and stop positions
are safe. It searches candidate departure events that permit:

1. safe waiting at the start;
2. a collision-free synchronized slew;
3. safe waiting at the stop until the prescribed terminal time.

### 5.3 Global angular-distance proof

The direct path has length

```math
L_{\mathrm{direct}} = L_{\mathrm{lb}}.
```

Because no curve joining the same endpoints can have length less than the
Euclidean wrapped endpoint distance,

```math
L^* \ge L_{\mathrm{lb}},
```

and therefore

```math
L_{\mathrm{direct}} = L^*.
```

This is the only continuous-space global-optimality certificate currently
reported by the planner. It applies to the coordinate-path-length objective,
not necessarily to spherical pointing angle, energy, jerk, or elapsed time.

### 5.4 Direct-certificate pseudocode

```text
ALGORITHM DirectCertificate(start, stop, safeStart, safeStop)
    delta <- WrappedDifference(start.position, stop.position)
    motion <- MinimumRestToRestProfile(delta, limits)

    for departure in RelevantSafeEvents() do
        arrival <- departure + motion.duration

        if departure lies in safeStart
           and arrival lies in safeStop
           and SegmentIsCollisionFree(departure, motion) then
            return CERTIFIED_GLOBAL_PATH
        end if
    end for

    return NO_CERTIFICATE
END
```

## 6. Static-Topology Mode

The dynamic safe-interval search is intentionally not forced to solve a
large number of identical time slices. If every obstacle polygon is exactly
unchanged over the requested interval, the unified planner invokes a static
topology accelerator.

### 6.1 Exact static-volume detection

For each obstacle, the detector verifies:

1. its sample interval covers `[t_0,t_f]`;
2. every slice contains the same packed vertex count;
3. every azimuth vertex equals the first slice;
4. every elevation vertex equals the first slice.

This is an exact equality test on the packed single-precision geometry. It
does not classify approximately static motion as static.

### 6.2 Inflated occupancy raster

One time slice is sampled on an azimuth/elevation grid. Grid node `c` is
occupied when its sampled coordinate lies inside an obstacle or within the
configured safety margin:

```math
\operatorname{occupied}(c) =
\mathbf{1}\left[
c \in O \;\lor\;
\operatorname{dist}(c,\partial O)\le m
\right].
```

When azimuth wraps, grid adjacency also wraps between the first and last
azimuth columns.

### 6.3 Theta*-style any-angle topology search

The search combines A* [1] with the parent line-of-sight relaxation used by
Theta*-family any-angle planning [2, 3]. It expands an eight-connected grid.
Let `p(s)` be the parent of state `s`. For neighbor `s'`, it compares:

```math
g(s)+c(s,s')
```

with

```math
g(p(s))+c(p(s),s')
```

when the segment from `p(s)` to `s'` has line of sight. This allows headings
that are not restricted to the eight grid directions and substantially
reduces staircase artifacts.

The heuristic is wrapped Euclidean endpoint distance. The production static
mode uses heuristic weight one for route quality.

### 6.4 Multiresolution refinement

An optional second search creates a finer grid only inside a tube around the
coarse route:

```math
\mathcal{C}_\rho =
\{q:\operatorname{dist}(q,P_{\mathrm{coarse}})\le\rho\}.
```

Cells outside the tube are treated as occupied. This concentrates the fine
search on the discovered homotopy class and is used by the U-trap example.

### 6.5 Visibility simplification

Starting from each retained waypoint, the simplifier tests progressively
farther waypoints. A chord replaces the intervening route only when dense
samples along that chord clear the original polygons with the requested
margin. This removes unnecessary waypoint stops without changing the
discovered topology.

### 6.6 Dynamic retiming

Every simplified segment receives the synchronized triangular or
trapezoidal profile from Section 5, and the segments run contiguously.
Their durations are summed, then a common route-start offset is sampled over
the available horizon slack. This allows waiting before the first segment
and leaves any remaining slack as waiting at the final state. Each offset
candidate is collision-checked.

### 6.7 Static-mode pseudocode

```text
ALGORITHM StaticTopologyMode(data, start, stop, limits, options)
    occupancy <- RasterizeAndInflate(data.firstSlice)

    coarse <- AnyAngleAStar(
        occupancy, start.position, stop.position)
    if not coarse.success then return FAILURE

    route <- coarse.route

    if options.enableTopologyRefinement then
        tube <- TubeAround(route, options.refinementRadius)
        fine <- AnyAngleAStar(FineGridInside(tube), start, stop)
        if fine.success then route <- fine.route
    end if

    route <- VisibilitySimplify(route, originalPolygons)
    profile <- RetimeRestToRest(route, limits, start.time, stop.time)

    if DenseValidate(profile, originalPolygons) then
        return SUCCESS(profile, method = staticTopology)
    end if

    return FAILURE
END
```

## 7. Event-Compressed Safe-Interval Mode

Moving obstacle volumes require explicit timing decisions, a broader problem
studied through both global space-time planning and local velocity-obstacle
methods [12, 13]. A conventional time-expanded grid can create one waiting
state for every spatial point and time sample. The implementation instead
follows the Safe Interval Path Planning idea of representing maximal
collision-free time intervals at each visited spatial state [4].

### 7.1 Safe intervals

For a guide position `q`, define

```math
\mathcal{S}(q) =
\{[l_1,u_1], [l_2,u_2], \ldots\}
```

as the maximal sampled-time intervals during which `q` is free. These
intervals are computed lazily and cached by snapped position.

The event grid is assembled from obstacle sample times and the two planning
horizon endpoints, then capped by `MaximumSafeIntervalSamples`. Safe
interval boundaries are derived from occupancy changes on that grid. Long
periods with unchanged occupancy do not generate one search node per time
sample.

### 7.2 Search state

A guide state is

```math
y = (q_g, k),
```

where `q_g` is a snapped azimuth/elevation grid point and `k` identifies one
safe interval at that point. The node stores its earliest known arrival time,
parent, departure time, and analytic segment duration.

### 7.3 Spatial successors

Successors are generated from symmetric direction angles and one or more
primitive radii. The default direction spacing is 45 degrees; no example
provides a preferred direction. A direct goal primitive is considered in
addition to grid moves.

### 7.4 Feasible transition window

Suppose the current safe interval is `[l_c,u_c]`, the successor interval is
`[l_n,u_n]`, and the analytic motion duration is `T`. A candidate departure
must satisfy:

```math
t_d \ge \max(t_{\mathrm{arrival}}, l_n-T)
```

and

```math
t_d \le \min(u_c, u_n-T).
```

Within this interval, the implementation tests batches of relevant event
times and checks the complete rest-to-rest segment on a dense collision
grid.

### 7.5 Search ordering

The guide orders nodes by earliest arrival time plus a configurable
inflation of the obstacle-free minimum segment duration to the goal:

```math
f(y) = t_{\mathrm{arrival}}(y) +
w_h T_{\min}(q_y,q_f).
```

This ordering is used for both public objectives because the guide's job is
to find a useful feasible space-time topology. Angular path length is
evaluated when the unified planner compares complete candidates. With the
default `w_h = 1.25`, finite spatial primitives, event capping, and finite
departure trials, the guide is not an optimal angular-distance or
earliest-arrival search.

### 7.6 Safe-interval pseudocode

```text
ALGORITHM SafeIntervalGuide(workspace, start, stop)
    events <- CompressRelevantTimes(workspace)
    startIntervals <- SafeIntervals(start.position, events)
    goalIntervals  <- SafeIntervals(stop.position, events)

    if start.time not in startIntervals then return FAILURE
    if stop.time not in goalIntervals then return FAILURE

    direct <- DirectCertificate(...)
    if objective = angularDistance and direct.certified then return direct

    OPEN <- earliest-arrival start interval

    while OPEN not empty and resources remain do
        current <- PopBest(OPEN)

        for nextPosition in SymmetricSuccessors(current.position) do
            nextIntervals <- CachedSafeIntervals(nextPosition)
            motion <- MinimumRestToRestProfile(
                nextPosition-current.position)

            for nextInterval in nextIntervals do
                window <- FeasibleDepartureWindow(
                    current.interval, nextInterval, motion.duration)

                departure <- FirstCollisionFreeEvent(window, motion)
                if departure exists then
                    Relax(nextPosition, nextInterval,
                          departure + motion.duration)
                end if
            end for
        end for
    end while

    return ReconstructEarliestFeasibleGuide()
END
```

## 8. Widening Kinodynamic ARA* Funnel

The safe-interval guide is dynamically feasible but consists of
rest-to-rest segments. Optional refinement searches a finite lattice whose
key is:

```math
z_k =
(a_k,e_k,\dot{a}_k,\dot{e}_k,k,u^-_{a,k},u^-_{e,k}).
```

The first five entries are position, angular rate, and discrete time.
The final two entries record the acceleration used on the incoming
primitive so a requested terminal acceleration can be represented exactly
on the configured control set. They do not impose a jerk limit: the next
primitive may select any configured acceleration action. This follows the
state-lattice view of encoding dynamically feasible local motions in a
finite search graph [6, 7].

### 8.1 Constant-acceleration primitive

For decision interval `h` and acceleration action `u_k`,

```math
q_{k+1} = q_k + v_k h + \frac{1}{2}u_k h^2,
```

```math
v_{k+1} = v_k + u_k h.
```

Positions and rates are snapped to configured resolutions. Every primitive
is collision-checked at a finer interval than `h`.

### 8.2 Primitive cost

For minimum time:

```math
c_k = h.
```

For angular distance:

```math
c_k =
\int_0^h \|v_k+u_k\tau\|_2\,d\tau.
```

The implementation estimates this integral using nine-point Simpson
quadrature and takes the maximum of that estimate and the primitive endpoint
displacement. Consequently, the graph edge cost never falls below its
straight endpoint chord, which preserves the admissibility of the wrapped
Euclidean angular-distance heuristic.

### 8.3 Admissible lower bounds

The angular-distance heuristic is wrapped Euclidean distance to the goal
tolerance. The minimum-time lower bound is the maximum of:

```math
\frac{|\Delta_a|}{v_{\max,a}},
\qquad
\frac{|\Delta_e|}{v_{\max,e}},
```

and the time required to remove excess terminal-rate error under the
acceleration limits. These bounds ignore obstacles and are therefore lower
bounds on the corresponding lattice objective.

### 8.4 Space-time corridor

Let the guide be `q_g(t)`. A funnel of radius `rho` retains states satisfying

```math
\|q_k-q_g(t_k)\|_2
\le
\rho+\delta_{\mathrm{snap}},
```

where `delta_snap` covers half the diagonal of one angular lattice cell.

The planner evaluates an increasing radius schedule such as

```text
[2, 4, 8] deg.
```

A narrow pass is cheaper. Wider passes recover alternatives excluded by the
first corridor. An unrestricted pass is optional.

### 8.5 ARA* repair

ARA* [5] begins with heuristic inflation `epsilon > 1` and reuses state
costs, OPEN, CLOSED, and INCONS while reducing epsilon. After a completed
pass:

```math
C_{\mathrm{returned}}
\le
\epsilon C^*_{\mathrm{lattice}}.
```

For a corridor-restricted pass, `C^*` is the optimum inside that corridor.
Only an unrestricted epsilon-one pass can report exact optimality on the
configured global finite lattice.

### 8.6 Funnel-refinement pseudocode

```text
ALGORITHM RefineGuideWithARAStar(guide, radiusSchedule)
    best <- guide

    for radius in radiusSchedule do
        corridor <- TimeIndexedTube(guide, radius)
        candidate <- ARAStar(
            key = [az, el, azRate, elRate, time,
                   incomingAzAccel, incomingElAccel],
            actions = constantAccelerationPrimitives,
            constraint = corridor)

        if candidate.valid and candidate.objective < best.objective then
            best <- candidate
        end if

        if candidate.certified
           and candidate.nearEndpointLowerBound then
            break
        end if
    end for

    if globalFallbackEnabled and resources remain then
        candidate <- ARAStar(constraint = none)
        best <- BetterValidated(best, candidate)
    end if

    return best
END
```

## 9. Moving-Target Interception

`planAzElMovingTargetIntercept` is a goal-time wrapper around the unified
funnel. It does not use a separate path planner.

For target trajectory `g(t)`, candidate times are sampled over
`[t_min,t_max]`. A candidate is discarded when:

1. `g(t)` lies outside the angular limits;
2. `g(t)` is occupied at that time;
3. a conservative kinematic lower bound exceeds `t-t_0`.

The current permissive pruning lower bound uses

```math
T_v =
\max_j \frac{|g_j(t)-q_{0,j}|}{v_{\max,j}},
```

```math
T_u =
\max_j
\sqrt{\frac{2|g_j(t)-q_{0,j}|}{u_{\max,j}}},
```

and requires

```math
\max(T_v,T_u) \le t-t_0.
```

Eligible times are attempted from earliest to latest. When too many are
eligible, the configured maximum number is selected uniformly over the
eligible index range. Every attempt calls `planAzElSpaceTimeFunnel`.

Because this filter ignores the terminal rest condition and obstacles, it
can admit a candidate that later proves unreachable. Its purpose is only to
discard obviously impossible catch times before invoking the full planner.

```text
ALGORITHM MovingTargetIntercept(data, start, target)
    times <- SampleCandidateInterceptTimes()
    eligible <- []

    for t in times do
        goal <- Interpolate(target, t)
        if InBounds(goal)
           and IsFree(goal, t)
           and KinematicallyReachable(start, goal, t) then
            eligible.append(t)
        end if
    end for

    for t in EarliestToLatest(DecimateIfNeeded(eligible)) do
        stop <- RestState(target(t), t)
        candidate <- UnifiedSpaceTimeFunnel(data, start, stop)
        if candidate.success and CatchError(candidate, target) <= tolerance
            return candidate
        end if
    end for

    return FAILURE
END
```

The interception-time sampling means this wrapper can miss a feasible catch
between candidate times. It does not claim continuous-time interception
completeness.

## 10. Collision Detection and Validation

### 10.1 Time semantics

For query time `t`, the collision engine selects the nearest obstacle sample.
For nonuniform input times, nearest-neighbor interpolation is used on the
sample index. With `TimePaddingSamples = p`, it also tests `p` neighboring
slices on each side.

This is conservative with respect to sampled slices but does not reconstruct
continuous swept polygons between samples.

### 10.2 Spatial broad and narrow phases

For every obstacle:

1. Reject points outside the slice bounding box enlarged by margins.
2. Apply a packed-edge point-in-polygon test.
3. When `SafetyMarginDeg > 0`, compute point-to-segment distance for packed
   polygon edges and reject points within the margin.

NaN-separated regions are packed as separate closed edge loops and evaluated
with one combined even-odd crossing rule for that obstacle slice. Separate
top-level obstacle structs are combined by logical union.

### 10.3 Multiple validation scales

The planner checks:

- guide primitives at `GuideCollisionCheckStep_s`;
- lattice primitives at `CollisionCheckStepSeconds`;
- the requested output grid at `SampleTime_s`;
- a final dense validation grid at `ValidationStep_s`;
- neighboring obstacle slices when time padding is enabled.

Display decimation in the 2-D/3-D animator never changes collision queries.

### 10.4 Safety interpretation

A successful result means no checked sample lies inside or within the
configured margin of any checked obstacle slice. It is not a formal
continuous-time collision proof unless the input sampling, time padding, and
validation spacing are themselves conservative for the physical problem.

## 11. Returned Plan and Diagnostics

A successful high-level plan includes the following core fields.
Mode-specific diagnostic fields can be absent or empty when their
corresponding stage did not run:

| Field | Meaning |
|---|---|
| `time_s` | Output command times |
| `position_deg` | Wrapped azimuth/elevation command |
| `positionUnwrapped_deg` | Continuous azimuth/elevation command |
| `velocity_deg_s` | Per-axis angular rates |
| `acceleration_deg_s2` | Per-axis angular accelerations |
| `isWaiting` | Samples with zero rate and acceleration |
| `method` | Selected unified-planner mode |
| `angularPathLength_deg` | Returned coordinate-path length |
| `angularLowerBound_deg` | Wrapped endpoint lower bound |
| `suboptimalityBound` | `L/L_lb`, when finite and meaningful |
| `optimalGlobally` | True only for the direct certificate |
| `optimalOnLattice` | Exactness on the selected finite lattice |
| `optimalOnUnrestrictedLattice` | Lattice exactness without a funnel |
| `safeIntervalGuide` | Dynamic guide diagnostics |
| `staticTopologySearch` | Static-mode search diagnostics |
| `corridorAttempts` | ARA* radius and result history |
| `workspace` | Reusable packed obstacle data |

## 12. Correctness and Optimality Statements

### 12.1 Feasibility

Every returned plan has passed the planner's final sampled collision and
limit checks. This is the primary invariant.

### 12.2 Direct global optimum

When `optimalGlobally` is true, the returned route reaches the continuous
wrapped endpoint-distance lower bound. It is globally shortest for
`J_L` under the coordinate metric.

### 12.3 A posteriori angular-length ratio

For any returned route of length `L`,

```math
L^* \ge L_{\mathrm{lb}}.
```

Therefore, when `L_lb > 0`,

```math
\frac{L}{L^*}
\le
\frac{L}{L_{\mathrm{lb}}}.
```

The reported `L/L_lb` is a valid upper bound on multiplicative
suboptimality for the same angular coordinate-length objective. It may be
loose because the lower bound ignores obstacles and dynamics.

### 12.4 Static search

The any-angle topology stage is not claimed to be globally shortest in
continuous free space. Grid resolution, obstacle inflation, line-of-sight
sampling, optional refinement, and visibility simplification define the
candidate set.

### 12.5 Safe-interval guide

The event-compressed guide is a feasibility-oriented search. Heuristic
inflation, event capping, finite spatial primitives, departure trials, and
wall-clock limits prevent a general optimality claim.

### 12.6 ARA* bound

The ARA* epsilon bound applies only after a completed repair pass and only
to the finite lattice searched. A corridor pass does not certify the global
lattice outside that corridor.

### 12.7 Completeness

All nondirect modes are resolution-complete at best, subject to resource
limits. None is complete in the unconstrained continuous
azimuth/elevation/rate/time space.

## 13. Complexity and Performance Model

Let:

- `T` be the number of obstacle time samples;
- `P` be the total packed polygon vertices;
- `N` be static occupancy-grid cells;
- `V` be lazily visited dynamic guide positions;
- `I` be the average number of safe intervals per visited position;
- `B` be the average number of tested departure events per transition;
- `K` be the number of kinodynamic lattice states in a funnel.

Workspace construction is approximately:

```math
O(P)
```

in time and storage.

Static topology search is approximately:

```math
O(N\log N)
```

for heap-based search, plus line-of-sight and polygon-query costs. Fine
refinement replaces a global fine grid with the subset inside the route
tube.

The safe-interval guide stores approximately:

```math
O(VI)
```

state and cached-interval information. Its practical transition cost also
depends on `B` and collision samples per analytic primitive. Event
compression prevents long waits from automatically becoming `O(T)` states
at every visited position.

Kinodynamic ARA* is approximately:

```math
O(K\log K)
```

per repair structure in the usual heap model, with collision checking often
dominating. Funnel radius, angular and rate resolution, control levels, and
decision time step determine `K`.

No single asymptotic expression predicts wall time well because polygon
complexity, safe-window density, and collision-query rejection rates vary
strongly by scenario.

## 14. Development Examples

All numbered examples now use `planAzElSpaceTimeFunnel` directly, through
`runAzElGauntletCase`, or through the moving-target wrapper that calls the
same funnel.

The following values are illustrative development-machine observations, not
portable performance guarantees:

| Example | Selected mode | Observed result |
|---:|---|---|
| 01 custom input | Direct certificate | 136.015 deg on the empty-input verification |
| 02 Vietnam and China [15] | Static topology | 138.111 deg, at most 1.015 times endpoint lower bound |
| 03 static blocker | Static topology | 13.447 deg, 39 topology expansions |
| 04 moving walls | Safe interval plus ARA* | 15.076 deg, 68 combined expansions |
| 05 five-turn spiral | Static topology | 241.860 deg, 4.06 net turns |
| 06 stop-go gates | Safe interval plus ARA* | 24.000 deg, goal settled at 36.5 s |
| 07 wrapped seam | Static topology | 26.892 deg, continuous unwrapped azimuth |
| 08 alternating slalom | Static topology | 33.982 deg with all four required crossing signs |
| 09 U-trap | Refined static topology | 32.778 deg compact wall-hugging escape |
| 10 rotating slots | Safe intervals | 17.971 deg with planner-selected chamber waits |
| 11 pursued boresight | Safe intervals | Goal opened at 72.0 s and reached at 73.6 s |
| 12 synchronized windmills | Safe intervals | 67.657 deg and 110.5 deg maximum following angle |
| 13 blinking interception | Interception wrapper | Previously failing fixed batch 5/5; subsequent fresh batch 5/5 |

The randomized results are regression observations, not an estimated
population success probability. The runner retains every generated seed and
never replaces a failed case.

## 15. Verification Strategy

The standalone verification covers:

- direct wait-and-slew certification;
- moving-volume safe-interval detours;
- multiple obstacle unions;
- wrapped azimuth;
- static spiral topology with no guide path;
- static seam and multiresolution refinement;
- rotating slots and waiting chambers;
- pursued-boresight behavior;
- synchronized windmill traversal;
- stochastic blinking-board reproducibility and unfiltered batches;
- moving-target rendering in both 2-D and 3-D;
- collision-free output samples;
- rate and acceleration limits;
- consecutive numbered examples;
- enforcement that every example uses the unified funnel;
- enforcement that examples inject no route, state corridor, or preferred
  direction.

At Version 2.0 preparation, MATLAB Code Analyzer reported zero findings
across the 50 standalone `.m` files. The deterministic focused suites passed.
The exact randomized batch that exposed an invalid initial-state generator
case passed 5/5 after the generator was corrected to keep the start safe
through its first transfer window; a new unfiltered batch also passed 5/5.

## 16. Practical Configuration

### 16.1 Spatial resolution

Choose `GuideGridStep_deg` smaller than the narrowest passage that must be
resolved, while allowing for safety margin. Reducing it quadratically
increases the potential number of 2-D positions.

### 16.2 Temporal validation

Choose `ValidationStep_s` so the fastest legal boresight cannot cross a thin
forbidden region between checks:

```math
\Delta t_{\mathrm{validation}}
\ll
\frac{w_{\min}}{\|v_{\max}\|_2},
```

where `w_min` is the smallest relevant angular obstacle thickness or
clearance.

### 16.3 Safety margin

`SafetyMargin_deg` should cover:

- obstacle polygon approximation;
- sensor pointing error;
- mount tracking error;
- ephemeris and attitude uncertainty;
- timing latency;
- command interpolation error.

These terms should not be assumed statistically independent without an
explicit uncertainty model.

### 16.4 Funnel refinement

Start with a modest increasing corridor schedule. Disable ARA* refinement
when the rest-to-rest guide is operationally sufficient. Include epsilon one
only when exactness on the selected finite lattice is worth the additional
search.

### 16.5 Rapidly changing obstacles

Raise `MaximumSafeIntervalSamples`, reduce collision-check spacing, and
increase temporal padding when brief windows are operationally important.

## 17. Limitations

1. The objective is planar azimuth/elevation coordinate length, not
   great-circle boresight angle, energy, torque, or wear.
2. The actuator model is acceleration-limited but not jerk-limited.
3. Obstacle motion between input slices is not reconstructed as a continuous
   swept volume.
4. Static acceleration currently requires raw `azElData`, not only a prebuilt
   workspace.
5. Static and safe-interval guide modes currently require zero boundary rate
   and acceleration.
6. The moving-target wrapper samples interception times.
7. Search budgets can return failure even when a resolution-feasible route
   exists.
8. Static equality is exact; small numerical geometry changes select dynamic
   mode.
9. A safety margin is deterministic and does not replace a probabilistic
   uncertainty model.
10. No nondirect mode proves a continuous global optimum.
11. The unified fixed-terminal-time API does not expose the full
    arrival-window semantics of the low-level minimum-time lattice planner.

## 18. Recommended Operational Workflow

1. Generate obstacle slices at a rate justified by obstacle motion.
2. Inflate them with a margin justified by physical and estimation errors.
3. Run the unified planner.
4. Inspect `method`, `optimalGlobally`, lattice bounds, lower bounds, and
   search termination fields.
5. Independently validate the returned command on a denser time grid.
6. Transform azimuth/elevation through the actual mount convention and check
   singularities, cable wraps, and structural limits.
7. Replan when the predicted obstacles, target, or boundary state changes.
8. Retain the scenario seed and complete planner options for reproducibility.

## 19. Future Work

- continuous swept-polygon collision bounds between obstacle samples;
- adaptive collision subdivision based on relative angular velocity;
- jerk-limited synchronized S-curve primitives;
- static detection directly from a prebuilt workspace;
- incremental replanning when only late obstacle slices change;
- tighter obstacle-aware lower bounds;
- continuous interception-time optimization;
- robust or chance-constrained planning under uncertainty;
- explicit mount kinematics, singularities, and cable-wrap state;
- native-code acceleration of packed polygon queries;
- formal benchmark distributions over randomized scenarios;
- trajectory optimization initialized by the funnel result;
- asymptotically optimal sampling-based refinement where appropriate [14].

## 20. Implementation Map

| Responsibility | Source |
|---|---|
| Unified public planner | [`standalone/azElAvoidance/planAzElSpaceTimeFunnel.m`](../standalone/azElAvoidance/planAzElSpaceTimeFunnel.m) |
| Moving-target wrapper | [`standalone/azElAvoidance/planAzElMovingTargetIntercept.m`](../standalone/azElAvoidance/planAzElMovingTargetIntercept.m) |
| Packed workspace | [`standalone/azElAvoidance/buildAzElTimeObstacleWorkspace.m`](../standalone/azElAvoidance/buildAzElTimeObstacleWorkspace.m) |
| Collision query | [`standalone/azElAvoidance/queryAzElTimeObstacle.m`](../standalone/azElAvoidance/queryAzElTimeObstacle.m) |
| Static topology component | [`standalone/azElAvoidance/planAzElAutonomousCorridor.m`](../standalone/azElAvoidance/planAzElAutonomousCorridor.m) |
| Static-volume detector | [`standalone/azElAvoidance/private/isAzElTimeObstacleWorkspaceStatic.m`](../standalone/azElAvoidance/private/isAzElTimeObstacleWorkspaceStatic.m) |
| Any-angle search | [`standalone/azElAvoidance/private/searchAzElAnyAngleAStar.m`](../standalone/azElAvoidance/private/searchAzElAnyAngleAStar.m) |
| Static refinement | [`standalone/azElAvoidance/private/refineAzElTopologyCorridor.m`](../standalone/azElAvoidance/private/refineAzElTopologyCorridor.m) |
| Visibility simplification | [`standalone/azElAvoidance/private/simplifyAzElRouteVisibility.m`](../standalone/azElAvoidance/private/simplifyAzElRouteVisibility.m) |
| Analytic route retiming | [`standalone/azElAvoidance/private/planAzElGuidedRoute.m`](../standalone/azElAvoidance/private/planAzElGuidedRoute.m) |
| Dynamic safe-interval guide | [`standalone/azElAvoidance/private/searchAzElSafeIntervalGuide.m`](../standalone/azElAvoidance/private/searchAzElSafeIntervalGuide.m) |
| Kinodynamic ARA* | [`standalone/azElAvoidance/planAzElKinodynamicARAStar.m`](../standalone/azElAvoidance/planAzElKinodynamicARAStar.m) |
| Kinodynamic A* baseline | [`standalone/azElAvoidance/planAzElKinodynamicAStar.m`](../standalone/azElAvoidance/planAzElKinodynamicAStar.m) |
| Combined animation | [`standalone/azElAvoidance/animateAzElAvoidancePlan.m`](../standalone/azElAvoidance/animateAzElAvoidancePlan.m) |
| Numbered examples | [`standalone/azElAvoidance/examples`](../standalone/azElAvoidance/examples) |
| Focused tests | [`standalone/azElAvoidance/tests`](../standalone/azElAvoidance/tests) |
| Short design note | [`standalone/azElAvoidance/docs/SPACE_TIME_FUNNEL.md`](../standalone/azElAvoidance/docs/SPACE_TIME_FUNNEL.md) |

## References

[1] P. E. Hart, N. J. Nilsson, and B. Raphael, "A Formal Basis for the
Heuristic Determination of Minimum Cost Paths," *IEEE Transactions on
Systems Science and Cybernetics*, vol. 4, no. 2, pp. 100-107, 1968.
[doi:10.1109/TSSC.1968.300136](https://doi.org/10.1109/TSSC.1968.300136)

[2] A. Nash, K. Daniel, S. Koenig, and A. Felner, "Theta*: Any-Angle Path
Planning on Grids," *Proceedings of the Twenty-Second AAAI Conference on
Artificial Intelligence*, pp. 1177-1183, 2007.
[AAAI publication page](https://ocs.aaai.org/Library/AAAI/2007/aaai07-187.php)

[3] K. Daniel, A. Nash, S. Koenig, and A. Felner, "Theta*: Any-Angle Path
Planning on Grids," *Journal of Artificial Intelligence Research*, vol. 39,
pp. 533-579, 2010.
[JAIR volume record](https://auld.aaai.org/Press/Journals/jairvol39.php)

[4] M. Phillips and M. Likhachev, "SIPP: Safe Interval Path Planning for
Dynamic Environments," *Proceedings of the IEEE International Conference on
Robotics and Automation*, pp. 5628-5635, 2011.
[doi:10.1109/ICRA.2011.5980306](https://doi.org/10.1109/ICRA.2011.5980306)

[5] M. Likhachev, G. Gordon, and S. Thrun, "ARA*: Anytime A* with
Provable Bounds on Sub-Optimality," *Advances in Neural Information
Processing Systems 16*, 2003.
[NeurIPS publication page](https://proceedings.neurips.cc/paper/2003/hash/ee8fe9093fbbb687bef15a38facc44d2-Abstract.html)

[6] M. Pivtoraiko and A. Kelly, "Efficient Constrained Path Planning via
Search in State Lattices," *Proceedings of the 8th International Symposium
on Artificial Intelligence, Robotics and Automation in Space*, 2005.
[Carnegie Mellon Robotics Institute publication](https://publications.ri.cmu.edu/efficient-constrained-path-planning-via-search-in-state-lattices)

[7] B. Donald, P. Xavier, J. Canny, and J. Reif, "Kinodynamic Motion
Planning," *Journal of the ACM*, vol. 40, no. 5, pp. 1048-1066, 1993.
[doi:10.1145/174147.174150](https://doi.org/10.1145/174147.174150)

[8] S. M. LaValle, *Planning Algorithms*. Cambridge University Press, 2006.
[Author-hosted electronic edition](https://lavalle.pl/planning/)

[9] T. Lozano-Perez, "Spatial Planning: A Configuration Space Approach,"
*IEEE Transactions on Computers*, vol. C-32, no. 2, pp. 108-120, 1983.
[doi:10.1109/TC.1983.1676196](https://doi.org/10.1109/TC.1983.1676196)

[10] J. E. Bobrow, S. Dubowsky, and J. S. Gibson, "Time-Optimal Control of
Robotic Manipulators Along Specified Paths," *The International Journal of
Robotics Research*, vol. 4, no. 3, pp. 3-17, 1985.
[doi:10.1177/027836498500400301](https://doi.org/10.1177/027836498500400301)

[11] T. Kunz and M. Stilman, "Time-Optimal Trajectory Generation for Path
Following with Bounded Acceleration and Velocity," *Proceedings of Robotics:
Science and Systems VIII*, 2012.
[doi:10.15607/RSS.2012.VIII.027](https://doi.org/10.15607/RSS.2012.VIII.027)

[12] J. Reif and M. Sharir, "Motion Planning in the Presence of Moving
Obstacles," *Journal of the ACM*, vol. 41, no. 4, pp. 764-790, 1994.
[doi:10.1145/179812.179911](https://doi.org/10.1145/179812.179911)

[13] P. Fiorini and Z. Shiller, "Motion Planning in Dynamic Environments
Using Velocity Obstacles," *The International Journal of Robotics Research*,
vol. 17, no. 7, pp. 760-772, 1998.
[doi:10.1177/027836499801700706](https://doi.org/10.1177/027836499801700706)

[14] S. Karaman and E. Frazzoli, "Sampling-based Algorithms for Optimal
Motion Planning," *The International Journal of Robotics Research*, vol. 30,
no. 7, pp. 846-894, 2011.
[doi:10.1177/0278364911406761](https://doi.org/10.1177/0278364911406761)

[15] D. Runfola et al., "geoBoundaries: A Global Database of Political
Administrative Boundaries," *PLOS ONE*, vol. 15, no. 4, e0231866, 2020.
[doi:10.1371/journal.pone.0231866](https://doi.org/10.1371/journal.pone.0231866)
