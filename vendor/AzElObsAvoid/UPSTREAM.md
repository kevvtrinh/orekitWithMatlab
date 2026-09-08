# Vendored planner

Copied without source changes from https://github.com/kevvtrinh/AzElObsAvoid
branch `bmtp-cleanup-codex`, commit
`a28ae6425bf4e6e5ff6bde20050b1b3e51f35922`, on 2026-09-07.

Included: `+obstacleAvoidance`, `trajectory` (BMTP and Ruckig engines), upstream
README and obstacle history contract. Examples, results, development tooling,
and repository metadata are excluded. The source repository has no LICENSE file.

Orbit Console's adapter is `standalone/azElAvoidance/planOrbitUiSlew.m`.
Add only this folder and its `trajectory` child to the MATLAB path. The adapter
maps the UI's azimuth/elevation degree fields to the upstream generic x/y unit
contract, uses fixed arrival, a 0.05-second sample interval and 4 deg/s^3 axis
jerk limits, then maps the result back after calling the public independent
validator. Optimization Toolbox is required by the upstream BMTP solver.

This revision caches timed visibility collision queries while preserving the
complete search time grid, protected geometry, and independent validation.

The legacy standalone planner remains available for its existing MATLAB
examples; Orbit Console uses this pinned upstream copy for new solves.
