# UI Design

The MATLAB UI lives at `matlab/launchOrekitSatelliteUI.m`.

It is a front end only. Scenario state, objects, propagation, access, save/load, and exports are owned by the backend classes and functions under `src/`.

Current layout:

- Scenario
- Insert
- View
- Sensors / Payloads

Main window:

- Left: Object Browser with the active scenario, satellites, and places.
- Center: Default 2D and 3D graphics tabs.
- Right: Object properties, access controls, export buttons, and status.

Scenario controls:

- Scenario name
- Scenario epoch UTC
- Duration and derived stop UTC
- Propagation time step
- Current scenario UTC plus time slider

View controls:

- 2D and 3D graphics tabs
- 3D frame selector for ECEF and ECI
- Start, Stop, and Reset scenario animation controls
- Step Back and Step Forward controls for manual scenario-time stepping

Sensor controls:

- Select a parent object.
- Add a Simple Conic, Rectangular, Fixed Vector, or Targeted sensor.
- Delete an attached sensor.
- Select a target object.
- Compute sensor access through `computeSensorAccess`.
- Plot sensor access timeline, off-boresight angle, and range.
- Export a sensor access report.

Insert behavior:

- Satellite insertion creates a `SatelliteObject`, adds it to the active `MissionScenario`, propagates the scenario, and draws the full scenario ground track/orbit in 2D/3D.
- Constellation insertion calls `ConstellationFactory.walkerDelta` or `ConstellationFactory.walkerStar`, adds all generated satellites to the active `MissionScenario`, propagates the scenario, and draws every member in 2D/3D.
- Place insertion creates a `GroundStationObject` and adds it to the active `MissionScenario`.
- Save and load call `saveScenario` and `loadScenario` so the same model round-trips between scripts and the UI.
- In ECI 3D view, Earth-fixed coastlines and places rotate according to the current scenario time while propagated satellite ephemerides are drawn in the inertial frame.
- Long-running UI actions use progress dialogs and the status label. This includes inserting satellites, places, constellations, propagating, computing access, saving, loading, and exporting ephemerides.
- Sensor UI callbacks call `SensorObject`, `addSensorToObject`, `removeSensorFromObject`, `computeSensorAccess`, and sensor plotting/export functions. Sensor geometry and FOV checks stay in the backend.

Callback rule:

```matlab
% Good
app.Scenario = app.Scenario.propagate();
result = computeAccess(app.Scenario, sourceName, targetName);

% Avoid
% Raw Java/Orekit calls or access loops inside UI callbacks.
```

Use `UIAdapters` to convert UI values into `ScenarioConfig`, `SatelliteObject`, and `GroundStationObject` instances.
