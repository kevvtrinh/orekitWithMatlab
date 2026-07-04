# STK-replacement upgrade plan

Working branch: `claude/stk-tool-replacement-lzbn46`. This file tracks the
multi-session effort to close the gaps between this suite and STK. Update the
checklists as work lands so a fresh session can resume without re-reading the
whole codebase.

## Goal

Make the MATLAB + Orekit suite an "almost STK" replacement. Existing before
this effort: Keplerian/TLE propagation, ground-station + sensor access,
sensor tasking/scheduling, 2D/3D visualization + animation, save/load,
CSV exports, App Designer UI (`matlab/launchOrekitSatelliteUI.m`).

## Architecture rules (do not break)

- Backend-first: all capability lives under `src/`; UI only adapts.
- `src/orekit` is the only layer allowed to call Java/Orekit (`javaObject`/`javaMethod`).
- Analysis functions take a `MissionScenario` and object names; results are
  structs with tables, exported via `src/io`, plotted via `src/visualization`.
- Objects are value classes with `toStruct`/`fromStruct` for save/load.
- Tests use `functiontests(localfunctions)` with `setupOnce` calling
  `startupOrekitSuite()` (needs Orekit jars under `vendor/orekit/`).

## Phase 1 — core STK-parity features (this session)

- [x] `src/core/ForceModelOptions.m` — gravity degree/order, sun/moon, drag,
      SRP toggles, integrator settings. `GravityDegree=0` means point mass.
- [x] `src/orekit/OrekitBodies.m` — sun/moon position tables (GCRF/ECEF),
      uses `getPVCoordinates` for cross-version safety.
- [x] `src/orekit/OrekitPropagatorFactory.m` rewrite — PropagatorType:
      `Keplerian`, `TLE` (SGP4), `EcksteinHechler` (J2..J6 analytical),
      `Numerical`/`HPOP` (DormandPrince853 + HolmesFeatherstone + third-body
      + Harris-Priester drag + SRP). TLE-defined sats can seed Numerical.
      `propagateWithManeuvers` does piecewise propagation across impulses.
- [x] `src/objects/ImpulsiveManeuver.m` — Name/Time/Frame(TNW|Inertial)/DeltaVmps.
- [x] `SatelliteObject` — new props: DragAreaM2, DragCoefficient, SRPAreaM2,
      ReflectivityCoefficient, ForceModel, Maneuvers; addManeuver/clearManeuvers/
      listManeuvers; propagate() now routes through propagateWithManeuvers;
      fromStruct rehydrates ForceModel + Maneuvers structs.
- [x] `src/analysis/ManeuverPlanner.m` — hohmann, planeChange, hohmannManeuvers.
- [x] `src/analysis/enuAzElRange.m` — vectorized site->ECEF az/el/range.
- [x] Eclipse/lighting: `computeEclipse` (conical umbra/penumbra + windows +
      sunlit fraction), `computeBetaAngle`, `computeSunElevation`,
      `plotEclipseTimeline`.
- [x] Access constraints in `computeAccessCore` options: MinElevationDeg,
      Min/MaxRangeKm, GroundLighting (Any|Sunlit|Dark), SatelliteLighting
      (Any|Sunlit|Eclipsed). `OrekitAccessEngine.azElRange` now prefers stored
      ephemeris (correct after maneuvers) with propagator fallback.
- [x] Coverage: `CoverageGrid` (globalGrid/regionGrid), `computeCoverage`
      (coverage %, passes, revisit gaps, area-weighted summary),
      `plotCoverageMap`, `exportCoverageReport`.
- [x] `src/io/loadTLEFile.m` — 2/3-line catalog loader with name filter.
- [x] `src/analysis/computeOrbitalElements.m` + `plotOrbitalElements` —
      osculating elements from ephemeris (pure MATLAB rv->coe), period,
      apogee/perigee altitude.
- [x] `src/analysis/computeLinkBudget.m` — FSPL/EIRP/C-N0/Eb-N0/margin from an
      access result + link params struct.
- [x] Tests in `src/tests/`: testAdvancedPropagation (numerical vs keplerian,
      HPOP, EH, burn raises SMA, element recovery), testEclipseLighting,
      testCoverage, testMissionUtilities (Hohmann math, TLE parsing,
      link budget, access constraints).
- [x] Examples: example_09_hpopPropagation, example_10_eclipseLighting,
      example_11_coverageRevisit, example_12_maneuvers, example_13_tleCatalog,
      example_14_linkBudget.
- [x] README: new sections for propagators/maneuvers/eclipse/coverage/
      constraints/TLE catalog/link budget.
- [x] `docs/stk_feature_map.md` — STK module -> suite function mapping table.
- [ ] Commit + push to `claude/stk-tool-replacement-lzbn46`. First commit
      (5961993) is local; `git push` returned 403 from the local git proxy all
      session. NEXT SESSION: commit any pending changes, then retry
      `git push -u origin claude/stk-tool-replacement-lzbn46` before anything else.
- [ ] Not run: no MATLAB/Orekit here. Run `startupOrekitSuite(); runtests(fullfile(pwd,"src","tests"))`
      locally; fix anything that surfaces (most likely spots: Orekit 13 Java
      constructor signatures in OrekitPropagatorFactory/OrekitBodies).

## Phase 2 — future sessions (not started)

- [x] UI: "Analysis" ribbon tab (eclipse timeline, orbital elements, OEM
  export, deck access window table, global coverage map) with
  satellite/station dropdowns (refreshAnalysisDropdowns in refreshAll), and
  propagator pickers in the satellite insert dialog (Keplerian tab:
  Keplerian/EH/Numerical; TLE tab: SGP4/Numerical-seeded). NOT yet exposed in
  UI: force-model editor panel, maneuver editor — still backend/script only.
- [x] Chains: `computeChainAccess` (multi-hop AND of link accesses).
- [x] Sensor FOV/FOR on the main 2D/3D views: `computeSensorFootprint`
  (cone-Earth intersection, horizon-clamped, FOV or FOR) + "Sensor FOV"/
  "Sensor FOR" checkboxes in the View ribbon; 2D dateline-safe outlines,
  3D translucent cones cast onto the globe. Test: testSensorFootprint.
- [x] Sun-pointing sensors: PointingMode "SunPointing"/"Sun" in
  SensorObject.getBoresightVector (ECEF sun direction from OrekitBodies).
  Remaining attitude gap: whole-body attitude profiles (SatelliteObject.Attitude
  is still cosmetic).
- [x] Orbit design wizard: `OrbitDesigner` (sunSynchronousInclination,
  sunSynchronous with LTAN->RAAN, geostationary at a longitude, molniya,
  repeatGroundTrackSma). Tests: testOrbitDesign, example_16.
- [x] Sensor-cone coverage: `MaxOffNadirDeg` option in computeCoverage.
- [x] CCSDS OEM export/import: `exportOEM`, `loadOEMFile`,
  `SatelliteObject.fromEphemeris` ("Ephemeris" orbit type, Hermite resampling
  via `OrekitEphemeris.resample`). Tests: testEphemerisInterop, example_15.
- [x] Deck access: `computeDeckAccess` (all sats vs one target, merged windows).
- [x] Sun exclusion access constraint: `SunExclusionAngleDeg` option.
- [x] Ground station `AzElMask` wired into access (table columns AzimuthDeg
  ascending in [0,360), MinElevationDeg; linear interp with wraparound).
- [x] Interpolation in `MissionObject.getState`/`getPosition` (cubic Hermite
  with edge clamping; `getECEF`/`getLLA` still nearest-sample).
- PUSH POLICY: user said do NOT push to GitHub (session auth is broken anyway);
  commit locally only. GitHub connector needs re-auth by the user before any push.
- Numerical propagator performance: WON'T DO for now — Orekit numerical
  propagators integrate incrementally between successive propagate() calls, so
  per-sample calls do not re-integrate from epoch; remaining cost is
  MATLAB<->Java call overhead, which ephemeris-mode would not remove.

## Known caveats / decisions

- Harris-Priester drag: valid ~100–1000 km altitude; returns zero density above,
  throws below 100 km. Default ForceModelOptions enables drag+SRP+sun/moon+8x8.
- EcksteinHechler: near-circular orbits only (e < ~0.1); continuation after a
  maneuver treats the osculating state as mean elements (approximation).
- Maneuvers ignore mass change (pure impulsive delta-V).
- SGP4 satellites cannot maneuver unless PropagatorType="Numerical" (seeded
  from the SGP4 state at scenario epoch).
- SpacecraftState mass: tries `withMass` (Orekit 13) with constructor fallback
  (Orekit ≤12), since repo pins Orekit 13.1.6 but jars are user-fetched.
- No MATLAB/Orekit runtime in the dev container — code is written to the repo's
  established patterns but not executed here; run `runtests(fullfile(pwd,"src","tests"))`
  locally to validate.
