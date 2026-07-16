# Orbit Console Static UI

The no-Node Orbit Console: plain HTML, CSS, classic JavaScript, a WebGL
globe with a Canvas-2D fallback, and a small MATLAB-hosted localhost bridge.
There is no `npm install`, Vite server, or Node bridge, and the runtime
never touches the network.

The console edits a scenario spec (scenario settings, Keplerian and TLE
satellites, Walker constellations - optionally sensor-equipped, ground
stations, point targets, area target grids, satellite sensors, access
requests, sensor tasks incl. area scans, and impulsive maneuvers), saves it
through the bridge, and re-runs it in MATLAB. Access/visibility windows, the
sensor-task schedule, the Sun/eclipse/daylight geometry, the Earth
orientation, and the time-tagged sensor-pointing history are all computed by
MATLAB/Orekit on Re-run - the browser only interpolates exported samples.

Freshness is tracked per object: an edited Keplerian satellite instantly
shows a dimmed two-body *browser preview* orbit (`prev` badge) until the
next MATLAB run replaces it, a new TLE satellite shows as awaiting a run
(`RUN` badge, SGP4 lives on the backend), and access/schedule/visibility
entries whose endpoints changed dim individually instead of the whole
scenario greying out. Scheduled tasks appear as tree/inspector rows and
per-platform timeline lanes (slew lead-in, dwell, return-home). See
`FEATURE_PARITY.md` for the verified parity status against the React
console in `apps/orbit-ui`.

The **Sensor / Area** view adds a focused whole-area workflow: choose a
satellite sensor and an area target, add the access request, and Re-run. MATLAB
and Orekit compute the FOR/FOV windows plus the WGS-84-clipped area boundary in
the moving sensor az/el frame. The adjacent FOR pane shows the current boundary,
centroid command, FOV/FOR bands, and representative outlines across the pass.

## Run With MATLAB

From this repository root in MATLAB:

```matlab
startupOrekitSuite()
launchOrbitStaticUi()
```

Open the printed URL if the browser does not open automatically:

```text
http://127.0.0.1:8321/
```

The MATLAB command window hosts the bridge while it is running. Press `Ctrl+C`
in MATLAB to stop it.

## Run Offline

You can also open `apps/orbit-static-ui/index.html` directly in a browser.
In that mode the console uses the embedded sample scenario and disables the
MATLAB run buttons because browsers cannot safely launch MATLAB from a local
file. Editing, import, and export still work; edits stay in memory.

## Bridge Endpoints

The bridge is implemented by `src/ui/orbitStaticUiServe.m` and
`src/ui/orbitStaticUiRequest.m`.

```text
GET  /api/health
GET  /api/scenario
GET  /api/spec
PUT  /api/spec
POST /api/run-demo
POST /api/run-scenario
```

`/api/run-demo` reuses `orbitUiDemoScenario`. `/api/run-scenario` writes the
posted spec and reuses `orbitUiRunScenario`. Jobs are synchronous in this
prototype, so the browser waits while MATLAB propagates.

Live MATLAB output is written under `apps/orbit-static-ui/data/live/`, which
is ignored by Git.

## Files

```text
apps/orbit-static-ui/
  index.html
  FEATURE_PARITY.md
  assets/earth-natural-2048.jpg      (2D basemap - Natural Earth)
  assets/earth_atmos_2048.jpg        (3D day texture - NASA Blue Marble)
  assets/earth_lights_2048.png       (3D night lights - NASA Black Marble)
  assets/earth_specular_2048.jpg     (3D ocean mask)
  css/app.css
  js/*.js
  data/sample-scenario.json
  data/sample-scenario.js
  selftest.html
```

## Sun, Lighting, And Frames

Every lighting consumer - the day/night terminator, night-lights gating, the
sun glyph, the subsolar marker, SunPointing sensor boresights, and the HUD
SUN line - reads one shared source: the Orekit-computed samples exported by
`src/ui/exportSunViz.m` (`sun.ephemeris` with time-tagged ECI and ECEF unit
vectors plus the geodetic subsolar track, and `earthOrientation` with the
true ITRF->GCRF prime-meridian angle). The browser only interpolates and
renormalizes; it never re-derives frames. A documented analytic fallback
(Astronomical Almanac low-precision sun + IAU-1982 GMST in `js/data.js`)
covers offline sample mode and payloads that predate these fields, and the
HUD tags it "(approx)" when it is in effect.

The 3D globe offers two display frames from the View menu: **Earth fixed
(ECEF)** - geography stationary, the Sun and inertial orbit lines sweep with
scenario time - and **Inertial (GCRF)** - the star background and orbit
ellipses stay fixed while the Earth rotates by the exported orientation
angle. Deep links: `?t=<sec>`, `?view=2d|3d`, `?frame=ecef|eci`.

## Basemap Rendering

The 3D globe renders on the GPU (`js/globe3d.js`): a WebGL fragment-shader
sphere with the bundled NASA-derived day/night/specular textures,
sun-driven diffuse lighting with a soft geographically correct terminator,
city night lights only on the dark side, ocean-weighted specular, an
atmospheric limb glow, and a deterministic world-anchored starfield. The
globe deliberately renders a cloud-free Earth so geography stays readable.
When WebGL or texture loading is unavailable (very old machines, some
`file://` contexts) it falls back automatically to the original per-pixel
Canvas-2D shader over the procedural/Natural Earth basemap - the same
scene, reduced fidelity.

The 2D map uses the color-graded 2048x1024 Natural Earth shaded-relief
raster (`js/earthtex.js`) with vector coastlines/lakes from `js/world.js`,
plus a solar-altitude day/night raster (civil/nautical/astronomical twilight
bands), the terminator line, night city lights, and the subsolar marker -
all positioned from the same exported Sun samples as the 3D view.

Texture provenance: `earth-natural-2048.jpg` is public-domain Natural Earth
data (naturalearthdata.com); `earth_atmos_2048.jpg`,
`earth_lights_2048.png`, and `earth_specular_2048.jpg` are NASA Blue/Black
Marble derivatives bundled from the three.js example assets (MIT-packaged,
NASA imagery is public domain). The runtime UI does not fetch from the
network or need Node.

## Viewport Controls And Sensor Visualization

The topbar's View menu toggles Labels, Orbit tracks (inertial ECI paths),
Ground tracks, Access lines, Sensor FOV, Sensor FOR, and Sun rendering in
both the 2D map and 3D globe, plus the 3D frame selector. Area targets draw
as a dashed rectangle outline with one label, in addition to their
grid-point markers.

Sensor geometry (`js/sensorviz.js`) runs against the same WGS84 ellipsoid as
the Orekit backend. The **FOV** is the instantaneous cone around the current
boresight, drawn as a translucent filled footprint with a cone silhouette
and a ground-clipped boresight line; the **FOR** is the full region
reachable within the gimbal limit around the *home* boresight (it does not
swing with an active slew), drawn dashed. Footprints clip cleanly at the
Earth horizon (rays past the limb clamp to the tangent circle), cones that
miss the Earth draw nothing, and antimeridian crossings split instead of
smearing across the 2D map.

The boresight itself follows the backend's exported time-tagged pointing
history (`src/ui/exportPointingViz.m` - the authoritative
slew/track/area-scan/return phases, including the serpentine scan sweep with
a live aim-point marker). When results are stale or a satellite is a browser
preview, the client-side phase model over the schedule entries takes over,
and the inspector labels the pointing source ("MATLAB (authoritative)" vs
"schedule estimate"). Satellite eclipse state and ground-site daylight dim
the markers and show in the inspector and HUD. The 3D globe adds
double-click-to-recenter and a Reset View button alongside drag-to-rotate
and wheel-zoom.

`selftest.html` is a browser-only test page (75+ checks, open from disk or
through the bridge): spec authoring/validation, rename/delete reference
pruning, Sun vectors and subsolar points at equinox/solstice dates,
ECI<->ECEF consistency, texture longitude orientation, nadir/limb/miss/FOR
footprint geometry, antimeridian wrapping, the pointing timeline
(slew->track->return, area-scan sweep, moving-target tracking), preview
propagation physics, the per-object freshness merge, tree/inspector/timeline
rendering, and renderer smoke tests across every view-toggle combination in
both frames.

The top view tabs are 2D Map (`1`), 3D Globe (`2`), and Sensor / Area (`3`).

## Operational Polish

A **Log** button next to the bridge pill opens a worker/status panel: the
worker's state (idle / running / succeeded / failed / offline), whether the
MATLAB session behind the bridge is connected ("warm" - it is the same
long-lived process for the whole session, so there is no per-run cold start),
the last run's finish time and duration, and a capped history of recent
status-bar messages so a run/refresh failure stays visible after the status
line moves on. Bridge calls classify failures by kind - a request that timed
out, one the browser could not reach at all, a non-2xx HTTP status, or a 2xx
response whose body was not valid JSON - so messages say why a call failed
instead of one generic string; busy and stale state are already visible via
the pulsing status message and the EDITED/STALE pills.

The File menu adds two commands:

- **Export Ephemeris CSV** downloads the propagated position samples (time
  offset, UTC time, lat/lon/altitude, ECI XYZ, eclipse state where available)
  for the selected satellite, or every propagated satellite if none is
  selected, as a single CSV with one header row.
- **Reset Demo Spec** (confirmation required) restores the shipped demo
  scenario's editable spec through the same derive/validate/save path as any
  other edit. It does not propagate - the result is flagged stale (like any
  edit) until Run Demo or Re-run.

Keyboard shortcuts, layered onto the existing Space play/pause: Left/Right
arrow steps the clock by one time step, Home rewinds to the scenario start,
1/2/3 switch between the 2D map, 3D globe, and Sensor / Area view; Delete removes the current
selection (with the existing confirmation dialogs), R reloads scenario data,
and Escape closes an open menu. All of them are skipped while a dialog is
open or while typing in a text/number/select field, and the buttons/rows that
expose these commands spell the shortcut out in their tooltip.
