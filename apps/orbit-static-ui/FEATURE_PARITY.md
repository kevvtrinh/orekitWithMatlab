# Static UI Feature Parity Plan

Rollout plan for bringing the no-Node static console (this app) to feature
parity with the React console in `apps/orbit-ui`. The app stays plain
HTML/CSS/classic JavaScript with the MATLAB bridge
(`src/ui/orbitStaticUiServe.m` / `orbitStaticUiRequest.m`) as its only backend.

- [x] **Level 1 - Core scenario authoring and spec lifecycle**
  Load/save the editable spec through the MATLAB bridge, import/export
  spec/scenario JSON, scenario settings, add/edit/delete basic satellites,
  ground stations, and point targets, local validation, dirty marking of
  propagated data, and re-running the current spec.
- [x] **Level 2 - Expanded object creation**
  Walker constellations, TLE satellites, area targets as grouped grids,
  object tree grouping/collapse, and edit/delete flows that preserve task
  references.
- [x] **Level 3 - Sensors and access workflows** *(this step)*
  Add/edit/remove sensors, sensor pointing modes (incl. FixedVector
  boresight), selected access-pair requests via `spec.accessRequests`
  (satellite/ground, satellite/satellite line of sight, sensor FOR/FOV
  visibility), request rows in the tree/inspector with computed-vs-pending
  status, and clear display of stale access results. Sensor removal prunes
  its visibility requests and unpins tasks; renames carry requests along.
- [ ] **Level 4 - Tasking and maneuvers**
  Sensor task manager, area scan tasks, scheduling results/timeline rows,
  impulsive maneuver editor, and task-aware inspector details.
- [ ] **Level 5 - High-fidelity viewport parity**
  View toggles, labels/ground tracks/access lines/sun/FOV/FOR controls,
  richer 3D interaction, lighting/eclipse state, area outlines, and sensor
  beam/track visualization.
- [ ] **Level 6 - Operational polish**
  Warm worker/status/log panels, better stale-bridge diagnostics, export
  ephemeris CSV, reset demo spec, keyboard polish, and self-tests for more
  browser workflows.
