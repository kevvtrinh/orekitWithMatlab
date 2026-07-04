# MATLAB Orekit Mission Suite

This workspace is a MATLAB-first mission analysis suite that uses Orekit as the astrodynamics backend.

The important design rule is backend first: scripts, tests, and future UI callbacks all call the same classes and functions under `src/`. App Designer/UI code should not contain propagation, access, export, or raw Orekit Java logic.

## Quick start

From PowerShell:

```powershell
.\scripts\fetch-orekit-runtime.ps1
```

If you also want the sample Orekit data bundle downloaded and unzipped:

```powershell
.\scripts\fetch-orekit-runtime.ps1 -WithData
```

Then in MATLAB, from this repository root:

```matlab
startupOrekitSuite()
run("examples/example_03_groundStationAccess.m")
```

## Headless API

```matlab
startupOrekitSuite();

cfg = ScenarioConfig();
cfg.Name = "Demo Scenario";
cfg.Epoch = datetime(2026,1,1,0,0,0,"TimeZone","UTC");
cfg.Duration = hours(24);
cfg.TimeStep = seconds(30);

scenario = MissionScenario(cfg);

sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
gs = GroundStationObject("Denver GS", 39.7392, -104.9903, 1609, 10);

scenario = scenario.addObject(sat);
scenario = scenario.addObject(gs);
scenario = scenario.propagate();

accessResult = computeAccess(scenario, "Sat-1", "Denver GS");

plotGroundTrack(scenario, "Sat-1");
plotAccessTimeline(accessResult);
exportContactPlan(accessResult, "contactPlan.csv");
```

Keplerian angles are in degrees. Semi-major axis is in meters.

Walker constellations can be created from scripts:

```matlab
sats = ConstellationFactory.walkerDelta("WD", 12, 3, 1, 7000e3, 53.0);
scenario = ConstellationFactory.addToScenario(scenario, sats);
scenario = scenario.propagate();
```

Use `walkerStar` for the half-RAAN-span Walker Star pattern. See `examples/example_07_walkerConstellation.m`.

Sensors/payloads can also be created from scripts:

```matlab
sat = scenario.getObject("Sat-1");
sensor = SensorObject.simpleConic("NadirCam", "Sat-1", 20);
sensor.PointingMode = "Nadir";
sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);

target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);
scenario = scenario.addObject(target);
scenario = scenario.propagate();

result = computeSensorAccess(scenario, "Sat-1", "NadirCam", "Denver Target");
plotSensorAccessTimeline(result);
exportSensorAccessReport(result, "sensor_access_report.csv");
```

See `examples/example_08_sensorAccess.m` and `examples/headless/sensors/script_219_sensorFullDemo.m`.

## Structure

```text
src/core            ScenarioConfig, MissionScenario, clocks/controllers
src/objects         SatelliteObject, GroundStationObject, SensorObject, PlaceObject, targets, ConstellationFactory
src/orekit          OrekitInitializer, time/frame/orbit/propagation wrappers
src/analysis        propagation, access, az/el/range, contact plans
src/visualization   plots and script-mode animation
src/io              save/load/export functions
src/ui              UI adapter helpers for MATLAB UI callbacks
src/tests           UI-independent backend tests
examples            headless examples
docs                architecture and API notes
```

## Current UI

The STK-style MATLAB UI launcher is:

```matlab
addpath(fullfile(pwd, "matlab"))
launchOrekitSatelliteUI
```

You can also launch it through:

```matlab
run("examples/example_05_uiLaunch.m")
```

The UI has a top ribbon with `Scenario`, `Insert`, `View`, and `Sensors / Payloads` tabs, an object browser on the left, and default 2D/3D graphics windows in the center. The `Scenario` tab owns the scenario epoch, stop time, time step, and current scenario time. When you insert a satellite or constellation, the app creates backend `SatelliteObject` instances, adds them to the active `MissionScenario`, propagates them across the scenario time span, and draws the full ground track/orbit in 2D and 3D.

The `View` tab includes 3D frame selection for `ECEF` and `ECI`. `Start` animates from the scenario epoch to the scenario stop time, updating object positions and rotating the Earth-fixed geography in the ECI view.

`Save Scenario` and `Load Scenario` call the backend `saveScenario` and `loadScenario` functions, so objects, scenario timing, ephemerides, access results, and metadata round-trip through the same model used by scripts and tests.

## Tests

```matlab
startupOrekitSuite()
results = runtests(fullfile(pwd, "src", "tests"));
assertSuccess(results)
```

## MATLAB class path notes

`OrekitInitializer` uses `javaaddpath` so you can iterate quickly while developing. For a production app, prefer putting the JAR paths in MATLAB's `javaclasspath.txt` and restarting MATLAB. That avoids dynamic class-path surprises and version collisions.

If MATLAB has already loaded an incompatible Java class, restart MATLAB after changing the JAR set.

## Current runtime

The downloader targets Orekit `13.1.6` and Hipparchus `4.0.3`. Edit `scripts\fetch-orekit-runtime.ps1` if you need to pin a different Orekit release.
