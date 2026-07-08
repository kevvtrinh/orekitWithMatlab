# Orbit Console Static UI

This is a no-Node prototype of the Orbit Console. It uses plain HTML, CSS,
classic JavaScript, canvas rendering, and a small MATLAB-hosted localhost
bridge. There is no `npm install`, Vite server, or Node bridge.

The console edits a scenario spec (scenario settings, Keplerian and TLE
satellites, Walker constellations, ground stations, point targets, area
target grids, satellite sensors, and access requests), saves it through the
bridge, and re-runs it in MATLAB. Access/visibility windows are computed by
MATLAB on Re-run; requested pairs show as pending until then, and everything
propagated is flagged stale while the spec has unpropagated edits. See
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
  css/app.css
  js/*.js
  data/sample-scenario.json
  data/sample-scenario.js
  selftest.html
```

`selftest.html` is a browser-only sanity check for the pure JavaScript data
and spec helpers, including Walker/TLE/area-grid authoring and the
sensor/access-request workflows. It can be opened directly from disk.
