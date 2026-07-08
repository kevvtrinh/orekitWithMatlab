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
- [x] **Level 3 - Sensors and access workflows**
  Add/edit/remove sensors, sensor pointing modes (incl. FixedVector
  boresight), selected access-pair requests via `spec.accessRequests`
  (satellite/ground, satellite/satellite line of sight, sensor FOR/FOV
  visibility), request rows in the tree/inspector with computed-vs-pending
  status, and clear display of stale access results. Sensor removal prunes
  its visibility requests and unpins tasks; renames carry requests along.
- [x] **Level 4 - Tasking and maneuvers**
  Sensor tasks via `spec.tasks` (+ Task): point tracking and whole-area
  scan tasks (dwell, coverage, priority, optional pinned satellite), task
  rows in the tree with scheduled/unscheduled/pending state, schedule
  results from the payload (`schedule` entries with slew lead-in and
  return-home windows) as timeline lanes per platform, task/satellite/
  target inspector details incl. live sensor pointing phase, and an
  impulsive maneuver editor (+ Mnvr and per-satellite inspector rows;
  TNW/Inertial burns, blocked for SGP4).
- [x] **Level 5 - High-fidelity viewport parity** *(this step)*
  A View menu (Labels, Ground tracks, Access lines, Sensor FOV, Sensor FOR,
  Sun) toggles rendering in both the 2D map and 3D globe, matching
  `apps/orbit-ui`'s View menu one-for-one. Sensor FOV/FOR render as ground
  footprints (`js/sensorviz.js`, shared ECEF ray/cone geometry) that follow
  the satellite's live boresight: the active scheduled slew/track/return
  phase when a fresh schedule exists for that platform, else the sensor's
  home pointing mode (Nadir, VelocityVector via finite-difference ground
  track, SunPointing via the shared subsolar direction, or a fixed ECEF
  vector). Area targets draw as a dashed rectangle outline plus one
  centroid label instead of only their grid-point markers. Satellite
  eclipse state (Umbra/Penumbra/Sunlit, from the payload's `sun.eclipses`)
  dims the satellite marker and shows in the inspector and viewport HUD;
  ground-site daylight (`sun.groundLighting`) shows in the inspector. 3D
  interaction adds double-click-to-recenter and a Reset View control
  alongside the existing drag-to-rotate/wheel-zoom. 2D/3D access lines and
  ground-track visibility are both toggle-gated; the Natural Earth
  map/globe/sun rendering from the prior step is unchanged.
- [ ] **Level 6 - Operational polish**
  Warm worker/status/log panels, better stale-bridge diagnostics, export
  ephemeris CSV, reset demo spec, keyboard polish, and self-tests for more
  browser workflows.
