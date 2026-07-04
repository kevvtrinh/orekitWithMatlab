# STK feature map

Where to find the STK-equivalent capability in this suite.

| STK capability | Suite equivalent |
| --- | --- |
| Scenario / analysis period | `ScenarioConfig`, `MissionScenario` |
| Satellite (two-body) | `SatelliteObject.fromKeplerian` / `fromCartesian`, `PropagatorType="Keplerian"` |
| Satellite (SGP4 from TLE) | `SatelliteObject.fromTLE`, `PropagatorType="TLE"` |
| J2 analytical propagator | `PropagatorType="EcksteinHechler"` (zonal J2–J6, near-circular orbits) |
| HPOP (numerical, force models) | `PropagatorType="Numerical"` + `ForceModelOptions` (gravity field degree/order, sun/moon third-body, Harris-Priester drag, SRP) |
| Astrogator (impulsive burns) | `ImpulsiveManeuver`, `SatelliteObject.addManeuver`, `ManeuverPlanner` (Hohmann, plane change) |
| Facility / Place / Target | `GroundStationObject`, `FacilityObject`, `PlaceObject`, `TargetObject`, `AreaTargetObject` |
| Constellations (Walker) | `ConstellationFactory.walkerDelta` / `walkerStar` |
| Deck access / catalog import | `loadTLEFile` |
| Access (basic) | `computeAccess`, `scenario.computeAccess` |
| Access constraints (elevation, range, lighting) | `computeAccess(..., struct("MinElevationDeg",...,"MinRangeKm",...,"MaxRangeKm",...,"GroundLighting",...,"SatelliteLighting",...))` |
| AER report | `computeAzElRange`, `exportAccessReport` |
| Eclipse / lighting times | `computeEclipse`, `plotEclipseTimeline` |
| Solar beta angle | `computeBetaAngle` |
| Sun elevation at a site | `computeSunElevation` |
| Sensors (conic, rectangular), FOV/FOR | `SensorObject`, `computeSensorAccess`, `plotSensorFOV`, `plotSensorFOR` |
| Sensor tasking / scheduling | `src/scheduling` (`SensorTask`, greedy + MILP schedulers) |
| Coverage definition + grid | `CoverageGrid.globalGrid` / `regionGrid` |
| Coverage figures of merit (percent covered, revisit) | `computeCoverage`, `plotCoverageMap`, `exportCoverageReport` |
| Orbital element report / graphs | `computeOrbitalElements`, `plotOrbitalElements` |
| Communications link budget | `computeLinkBudget` |
| Contact plans / reports | `buildContactPlan`, `exportContactPlan`, `exportEphemeris` |
| 2D/3D graphics + animation | `plotGroundTrack`, `plotOrbit3D`, `animateScenario`, UI (`launchOrekitSatelliteUI`) |

## Not covered yet (see plan.md phase 2)

- Access chains (multi-hop relays)
- Attitude profiles beyond nadir/default pointing
- CCSDS OEM/OMM ephemeris file import/export
- Ground station az/el masks in access constraints (property exists, not wired)
- Finite (non-impulsive) maneuvers and targeting/differential correction
