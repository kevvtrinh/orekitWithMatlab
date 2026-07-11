# Static UI Feature Parity

Status of the no-Node static console against the React console in
`apps/orbit-ui`. The app stays plain HTML/CSS/classic JavaScript with the
MATLAB bridge (`src/ui/orbitStaticUiServe.m` / `orbitStaticUiRequest.m`) as
its only backend. Every level below is implemented and covered by
`selftest.html` (75+ browser checks) and `src/tests/testOrbitUiVizExports.m`
plus the pre-existing MATLAB suite (110 tests passing); the headline flows
were additionally exercised end-to-end against a live bridge.

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
- [x] **Level 5 - High-fidelity viewport parity**
  A View menu (Labels, Orbit tracks, Ground tracks, Access lines, Sensor
  FOV, Sensor FOR, Sun) toggles rendering in both the 2D map and 3D globe.
  Sensor FOV/FOR render as WGS84-correct ground footprints following the
  live boresight; area targets draw as dashed outlines with one centroid
  label; eclipse state dims satellite markers and shows in the inspector
  and HUD; ground-site daylight shows in the inspector. 3D interaction:
  drag-to-rotate, wheel zoom, double-click-to-recenter, Reset View.
- [x] **Level 6 - Operational polish**
  Worker/status Log panel (idle/running/succeeded/failed/offline, last-run
  duration) over a capped message history; bridge failures classified as
  timeout / network / http / malformed; Export Ephemeris CSV; Reset Demo
  Spec; keyboard shortcuts (Space, arrows, Home, 1/2, Delete, R, Escape)
  with typing/dialog guards and tooltips.
- [x] **Level 7 - Authoritative sun/pointing data, per-object freshness,
  and the WebGL globe** *(this step - closes the full parity audit)*
  - **Orekit-authoritative Sun and frames.** `exportSunViz.m` now exports
    time-tagged Sun ECI *and* ECEF unit vectors, the geodetic subsolar
    track, and the true ITRF->GCRF prime-meridian angle
    (`earthOrientation`), all validated against direct Orekit queries at
    equinox/solstice epochs. The terminator, night lights, sun glyph,
    subsolar marker, SunPointing boresights, and HUD all read these samples
    through `Orbit.data.sunDirEcefAt/sunDirEciAt/subsolarAt/gmstAt`; the
    analytic model is a documented fallback for offline sample mode only,
    tagged "(approx)" in the HUD.
  - **Authoritative pointing timeline.** `exportPointingViz.m` samples
    every sensor's real boresight (resolveSensorPointing) through
    idle/slew/track/scan/return phases - including the serpentine area-scan
    sweep with per-sample ground aim points - and `exportScheduleViz.m`
    exports the computed `returnSlewTimeSeconds`. The viewports and
    inspector replay these samples when fresh (labelled "MATLAB
    (authoritative)") and fall back to the client-side phase model over
    schedule entries when stale.
  - **Per-object freshness.** `js/merge.js` (a port of the React console's
    renderScenario) tags each satellite matlab/preview/pending, previews
    edited Keplerian satellites instantly with two-body ephemerides
    (`js/preview.js`), prunes results whose endpoints were deleted, dims
    stale entries individually (tree, inspector, timeline bands), and
    gates sun/orientation/pointing data on timing freshness. Run payloads
    and the bundled sample embed their spec, which the console adopts on
    load so fresh results stay authoritative.
  - **WebGL globe with ECI/ECEF frames.** GPU fragment-shader Earth with
    bundled NASA day/night/specular textures (cloud-free by design),
    sun-driven terminator, dark-side-only city lights, ocean specular,
    atmosphere rim, and a world-anchored starfield; automatic Canvas-2D
    fallback. The View menu
    selects Earth-fixed or Inertial (GCRF) display frames - inertial orbit
    ellipses stay fixed while the Earth rotates by the exported
    orientation angle. Deep links `?t=`, `?view=`, `?frame=`.
  - **Sensor geometry correctness.** FOV and FOR are distinct: the FOV is
    the instantaneous cone around the current boresight (filled footprint,
    cone silhouette, ground-clipped boresight line, FOV-in-view coloring
    from the backend's fovWindows); the FOR is the gimbal-limit region
    around the *home* boresight, drawn dashed. Ray/Earth intersections run
    against the WGS84 ellipsoid in scaled space; rays past the limb clamp
    to the horizon circle; cones that miss the Earth draw nothing;
    antimeridian crossings split cleanly in 2D.
  - **Tree/inspector/dialog parity.** Satellite rows expand into
    sensor/task/access/sensor-visibility children with prev/RUN source
    badges; sensor-visibility pairs are inspectable regardless of request
    origin; the satellite/TLE/Walker dialogs carry an inline imaging-sensor
    section; + Access offers "Calculate all" to restore the default sweep;
    the maneuver dialog preselects the current satellite; playback pauses
    pinned at the scenario end; unscheduled tasks explain why.

Known limitations (deliberate):

- One sensor per satellite (a spec-schema constraint shared with the React
  console and `buildScenarioFromSpec.m`).
- Edits are blocked while a synchronous MATLAB run is in flight (the
  static bridge has no async job queue; the React console's Node bridge
  does).
- The free-run browser preview is two-body only; SGP4/TLE satellites wait
  for the backend.
- The ECI view spins geography by the exported prime-meridian angle (a
  pure Z rotation); the ~0.3 deg precession/nutation pole tilt is not
  rendered - same approximation as the React console.
- 2D map has no pan/zoom (the React console has no 2D map at all).
