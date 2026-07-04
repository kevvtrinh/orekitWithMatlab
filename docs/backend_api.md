# Backend API

Minimal headless flow:

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

## Constellations

Walker Delta and Walker Star constellations are created with `ConstellationFactory`:

```matlab
sats = ConstellationFactory.walkerDelta("WD", 12, 3, 1, 7000e3, 53.0);
scenario = ConstellationFactory.addToScenario(scenario, sats);
scenario = scenario.propagate();
```

The Walker arguments are `prefix`, total satellites `t`, planes `p`, phasing `f`, semi-major axis in meters, and inclination in degrees.

Optional name-value parameters:

- `Eccentricity`
- `RAANOffsetDeg`
- `ArgPerigeeDeg`
- `TrueAnomalyOffsetDeg`
- `MassKg`
- `Color`

`walkerDelta` spreads RAANs over 360 degrees. `walkerStar` spreads RAANs over 180 degrees. Generated satellite names use `Prefix-P##-S##`, for example `WD-P02-S03`.

## Sensors And Targets

Sensors attach to parent objects and compute access through backend functions:

```matlab
sat = scenario.getObject("Sat-1");
sensor = SensorObject.simpleConic("NadirCam", "Sat-1", 20);
sensor.PointingMode = "Nadir";
sensor.MaxRangeKm = 2500;
sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);

target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);
scenario = scenario.addObject(target);
scenario = scenario.propagate();

result = computeSensorAccess(scenario, "Sat-1", "NadirCam", "Denver Target");
```

Supported MVP sensor modes:

- `SensorObject.simpleConic`
- `SensorObject.conical`
- `SensorObject.rectangular`
- `SensorObject.fixedVector`
- `SensorObject.targeted`

Supported MVP access paths:

- Satellite sensor to place/target/ground station
- Ground/place/facility sensor to satellite
- Area target centroid placeholder

Useful outputs:

- `result.AccessLogical`
- `result.AccessWindows`
- `result.ConstraintStatus`
- `result.RangeKm`
- `result.ElevationDeg`
- `result.OffBoresightAngleDeg`

Useful plotting/export functions:

```matlab
plotSensorAccessTimeline(result);
plotOffBoresightAngle(result);
plotSensorRange(result);
exportSensorAccessReport(result, "sensor_access_report.csv");
exportSensorConstraintStatus(result, "sensor_constraint_status.csv");
exportSensorDefinitions(scenario, "sensor_definitions.csv");
```
