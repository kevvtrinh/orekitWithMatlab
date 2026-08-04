# Guarantees and limitations

## Guaranteed for a successful returned plan

- Every sample is reconstructed from stored piecewise-constant-jerk segments.
- Segment endpoint position, velocity, and acceleration match to the reported
  numerical tolerance.
- Componentwise acceleration and jerk limits are checked on every phase;
  velocity and position extrema are checked at analytic interior candidates.
- Segment joins preserve position, velocity, and acceleration.
- Time is strictly increasing and waits are stationary zero-jerk segments.
- Static and moving obstacle checks use one documented nearest-slice,
  no-extrapolation policy in both search and independent validation.
- Reverse Dijkstra and forward A* both execute and publish diagnostics.
- Successful plans use the stable method name
  `reverseDijkstraForwardKinodynamicAStar`.

## Finite-graph guarantee

The reverse field is an admissible lower bound for the implemented finite
forward primitive graph. Forward search supports reopening and terminates with
a finite-graph optimality certificate only when the minimum open lower bound
cannot improve the best validated goal. The result reports whether that
condition was reached.

## Resolution-dependent limits

- The search is complete only for the selected position grid, time step,
  stationary-endpoint macro primitive set, exact boundary connectors, and
  resource budget.
- It is not a proof of continuous-space feasibility or infeasibility.
- Moving-obstacle collision freedom is conservatively subdivided. The maximum
  unchecked time and motion bound are reported; no unconstrained sample check
  is described as exact.
- Target interpolation is linear between supplied samples. Obstacles are
  piecewise constant at their nearest supplied slices with configured adjacent
  temporal padding.
- The compatibility default jerk limit is finite and derived uniformly from
  the supplied acceleration limit when legacy callers omit jerk. Callers that
  need a physical jerk contract should supply `limits.maxJerk_deg_s3` or the
  documented override explicitly.
- Tracking is accepted only over checked constant-jerk target intervals and
  may stop before the requested end when an interval becomes unsafe.

Resource or finite-resolution exhaustion is reported as inconclusive unless a
separate obstacle-free deadline lower bound proves the requested deadline
impossible.
