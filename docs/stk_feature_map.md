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
| Orbit Wizard (SSO, GEO, Molniya, repeat track) | `OrbitDesigner` |
| Deck access / catalog import | `loadTLEFile`, `computeDeckAccess` |
| Ephemeris file import/export (CCSDS OEM) | `exportOEM`, `loadOEMFile`, `SatelliteObject.fromEphemeris` |
| Sun exclusion access constraint | `computeAccess(..., struct("SunExclusionAngleDeg", ...))` |
| Access (basic) | `computeAccess`, `scenario.computeAccess` |
| Access constraints (elevation, range, lighting) | `computeAccess(..., struct("MinElevationDeg",...,"MinRangeKm",...,"MaxRangeKm",...,"GroundLighting",...,"SatelliteLighting",...))` |
| AER report | `computeAzElRange`, `exportAccessReport` |
| Eclipse / lighting times | `computeEclipse`, `plotEclipseTimeline`; Orbit Console **Analysis → Reports & Graphs → Lighting intervals** |
| Solar beta angle | `computeBetaAngle`; Orbit Console **Reports & Graphs → Solar beta angle** |
| Sun elevation at a site | `computeSunElevation` |
| Sensors (conic, rectangular), FOV/FOR | `SensorObject`, `computeSensorAccess`, `plotSensorFOV`, `plotSensorFOR` |
| Sensor footprint / swath on the map | `computeSensorFootprint`, View-ribbon "Sensor FOV"/"Sensor FOR" toggles in the UI |
| Sensor tasking / scheduling | `src/scheduling` (`SensorTask`, greedy + MILP schedulers) |
| Coverage definition + grid | `CoverageGrid.globalGrid` / `regionGrid` |
| Coverage figures of merit (percent covered, revisit) | `computeCoverage`, `plotCoverageMap`, `exportCoverageReport` |
| Sensor-constrained coverage (nadir imager cone) | `computeCoverage(..., struct("MaxOffNadirDeg", ...))` |
| Orbital element report / graphs | `computeOrbitalElements`, `plotOrbitalElements`; Orbit Console **Reports & Graphs → Orbital elements**, with time filtering, paginated tables, CSV, and jumps to simulation time |
| Communications link budget | `computeLinkBudget` |
| Chains (multi-hop access) | `computeChainAccess` |
| Facility az/el terrain masks | `GroundStationObject.AzElMask` (applied automatically in access) |
| Contact plans / reports | `buildContactPlan`, `exportContactPlan`, `exportEphemeris` |
| 2D/3D graphics + animation | `plotGroundTrack`, `plotOrbit3D`, `animateScenario`, MATLAB UI (`launchOrekitSatelliteUI`), web console (`launchOrbitHtmlUI`) |

## Remaining gaps

- Attitude profiles beyond nadir/default pointing
- Finite (non-impulsive) maneuvers and targeting/differential correction
- Web workflows for backend coverage, chains, communications link budgets,
  and catalog/OEM import are not yet exposed in Orbit Console.

The report workflow follows the [STK Report & Graph Manager](https://help.agi.com/stk/Content/stk/report.htm)
pattern. The suite reports its own MATLAB/Orekit results in GCRF; it does not
claim identical output to every STK propagator or report style. Eclipse
boundaries are sampled rather than refined event crossings.
