# Architecture

The suite is backend-first. MATLAB scripts, tests, the MATLAB desktop UI,
and the web console use the mission analysis classes and functions under `src/`.

The main dependency direction is:

1. `core` owns scenario configuration and object containers.
2. `objects` owns satellites, ground objects, area targets, and sensors.
3. `orekit` owns the astrodynamics adapters that directly call Java/Orekit.
4. `analysis` calls `core`, `objects`, and `orekit` to propagate and compute access.
5. `visualization` and `io` consume backend results.
6. `scheduling` computes sensor task opportunities, conflicts, and schedules.
7. `ui` adapts UI values and JSON specifications to backend objects and
   exports results for display.

The MATLAB desktop entrypoint is `matlab/launchOrekitSatelliteUI.m`. Its
callbacks invoke backend propagation, access, scheduling, and export functions.
`UIAdapters` converts control values into backend objects.

The React/Three.js console lives in `apps/orbit-ui`. Its Node/Express server
persists the editable scenario specification and dispatches MATLAB jobs through
a reusable worker (`src/ui/orbitUiWorker.m`) or a batch process.
`buildScenarioFromSpec` builds the MATLAB scenario, and `exportScenarioJson`
provides the propagated payload consumed by the browser.
`matlab/launchOrbitHtmlUI.m` prepares and starts this console from MATLAB.

In the browser, the editable specification determines which objects exist.
MATLAB results supply propagated ephemerides and analysis data; the frontend
also provides Keplerian previews and marks results stale when edits invalidate
them. A bundled sample supports viewing and local editing without the bridge.

UI callbacks should delegate mission analysis to the backend. Runtime setup
and process management belong to the launchers; rendering and preview geometry
belong to the frontend. See [UI design](ui_design.md) for the two interfaces.

