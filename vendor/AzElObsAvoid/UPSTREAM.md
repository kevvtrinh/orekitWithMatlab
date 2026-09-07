# Vendored planner

Copied without source changes from https://github.com/kevvtrinh/AzElObsAvoid
branch `main`, commit `b22e7bb5cd7e2e6028822a5bd8b4d55a49e71ddc`, on 2026-09-07.

Included: `+obstacleAvoidance`, `trajectory` (BMTP and Ruckig engines), upstream
README and obstacle history contract. Examples, results, development tooling,
and repository metadata are excluded. The source repository has no LICENSE file.

Orbit Console's adapter is `standalone/azElAvoidance/planOrbitUiSlew.m`.
Add only this folder and its `trajectory` child to the MATLAB path. The adapter
uses fixed arrival, a 0.05-second sample interval and 4 deg/s^3 axis jerk limits,
then calls the public independent validator before returning a successful path.
Optimization Toolbox is required by the upstream BMTP solver.

The legacy standalone planner remains available for its existing MATLAB
examples; Orbit Console uses this pinned upstream copy for new solves.
