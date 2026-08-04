# Guarantees and Limitations

Successful plans use quintic segments with analytic velocity, acceleration,
and jerk extrema checks. Segment joins preserve position, velocity, and
acceleration. Waiting begins and ends at a stationary state. Wrapped azimuth
is continuous internally.

Static straight quintic edges use exact polygon-segment intersection and
Euclidean margin distance. Other obstacle collision is not claimed exact
between checks. The planner samples the authoritative quintic law at a bounded
interval no larger than the lesser of `CollisionCheckStep_s` and the public
sample interval; every checked point uses nearest-source-slice geometry
with one-neighbor temporal padding and the declared Euclidean safety margin.
The achieved maximum unchecked interval is returned in `plan.validation`.

The finite lattice is resolution-complete only for its grid, primitive set,
and time step. Resource exhaustion is inconclusive, not proof of
infeasibility. A deadline shorter than the analytic obstacle-free minimum
maneuver time is reported as proven infeasible. Fixed resting goals also use
that rest-to-rest duration as a sound lower-bound prune during search.

When fixtures omit a jerk limit, the planner applies its documented uniform
default derived from acceleration limits. Callers can supply a positive
two-element `MaxJerk_deg_s3` override uniformly for any scenario.

The weighted workload-scaled topology heuristic, static visibility
refinement, rolling terminal refinement, and validated terminal-dwell
relocation do not prove a globally shortest path. A returned success is a
feasibility certificate; its objective cost is empirical within the finite
resolution and search budget.
