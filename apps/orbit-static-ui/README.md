# Orbit Console Static UI

This is a no-Node prototype of the Orbit Console. It uses plain HTML, CSS,
classic JavaScript, canvas rendering, and a small MATLAB-hosted localhost
bridge. There is no `npm install`, Vite server, or Node bridge.

The console edits a scenario spec (scenario settings, Keplerian and TLE
satellites, Walker constellations, ground stations, point targets, area
target grids, satellite sensors, access requests, sensor tasks incl. area
scans, and impulsive maneuvers), saves it through the bridge, and re-runs it
in MATLAB. Access/visibility windows and the sensor-task schedule are
computed by MATLAB on Re-run; requested pairs and tasks show as pending
until then, and everything propagated is flagged stale while the spec has
unpropagated edits. Scheduled tasks appear as tree/inspector rows and
per-platform timeline lanes (slew lead-in, dwell, return-home). See
`FEATURE_PARITY.md` for the parity roadmap against the React console in
`apps/orbit-ui`.

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
  assets/earth-natural-2048.jpg
  css/app.css
  js/*.js
  data/sample-scenario.json
  data/sample-scenario.js
  selftest.html
```

## Basemap Rendering

The 2D map and 3D globe share a local 2048x1024 Natural Earth shaded-relief
texture (`assets/earth-natural-2048.jpg`) loaded by `js/earthtex.js`. The
image is color-graded at runtime for the dark mission-console view and paired
with vector coastlines/lakes/city-light points from `js/world.js`. A
deterministic procedural fallback is built immediately, so the viewport still
renders before the image finishes decoding or if the file is opened in a
restricted browser context.

The Natural Earth source is public domain map data from
`https://www.naturalearthdata.com/`. The runtime UI does not fetch from the
network or need Node.

The 2D map layers a solar-altitude day/night raster
(civil/nautical/astronomical twilight bands), terminator lines, night city
lights, and a subsolar marker over the basemap. The 3D globe shades the sphere
per pixel with sun-aligned lighting, ocean glint, a subtle cloud deck,
front-side coastlines, city lights, an atmosphere rim, and a visible sun-vector
source outside the globe.

## Viewport Controls And Sensor Visualization

The topbar's View menu toggles Labels, Ground tracks, Access lines, Sensor
FOV, Sensor FOR, and Sun rendering in both the 2D map and 3D globe. Area
targets draw as a dashed rectangle outline with one label, in addition to
their grid-point markers. A satellite with a sensor shows its instantaneous
field-of-view and field-of-regard as ground footprints (`js/sensorviz.js`):
the boresight follows the active scheduled slew/track/return phase when a
fresh schedule exists for that platform, otherwise the sensor's home
pointing mode (Nadir, velocity vector, Sun pointing, or a fixed ECEF
vector). Satellite eclipse state and ground-site daylight, when the payload
carries `sun.eclipses` / `sun.groundLighting`, dim the satellite marker and
show in the inspector and viewport HUD. The 3D globe adds double-click to
recenter under the clicked point and a Reset View button alongside
drag-to-rotate and wheel-zoom.

`selftest.html` is a browser-only sanity check for the pure JavaScript data
and spec helpers, including Walker/TLE/area-grid authoring, the
sensor/access-request workflows, sensor task and maneuver validation,
schedule/pointing normalization, and the Level 5 sun/eclipse parsing and
sensor pointing/footprint geometry. It can be opened directly from disk.
