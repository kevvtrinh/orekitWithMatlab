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

## Sensor-access "no windows" investigation (2026-07, fixed)

User report: 30-day scenario, nadir conic sensor, ground place, zero access
windows despite overpasses. Root cause: TEMPORAL ALIASING — LEO sensor passes
last ~60-90 s but long scenarios use coarse TimeSteps, so every pass fell
between access samples; nearest-sample getECEF also quantized geometry to the
propagation grid. Fixes:
- `computeSensorAccess` options.TimeStepSeconds — dense access sampling
  independent of the scenario grid.
- `SatelliteObject.getECEF`/`getECEFMatrix` — slerp direction + linear radius
  interpolation between ephemeris samples (chord-free, exact at samples).
- `computeSensorAccess` fully vectorized (was O(n^2) nearest-neighbor per
  step; 30-day runs took minutes, now seconds). Identical result fields.
- Bug fix: VelocityVector pointing used GCRF velocity in ECEF math; now uses
  the Earth-fixed track velocity. Bug fix: sat-to-sat sensor access was always
  false because NaN elevation failed the elevation gate; NaN now passes (LOS
  gate still applies). SunPointing vectorized via OrekitBodies.
- `computeSensorAccess:NoWindows` warning reports closest off-boresight
  approach + aliasing hint. Repro/diagnostic script at repo root:
  `debug_sensor_access_no_windows.m`. Test: testSensorAccessSampling.

## Sensor tasking FOV->FOR fix (2026-07)

Tasking/scheduling opportunity search called computeSensorAccess with no
options, so it gated on the narrow fixed-beam FOV and the coarse scenario
grid — inconsistent with the rest of the scheduler, which already models
slew time separately and scores quality against FieldOfRegardDeg. A target
inside the FOR (reachable by slewing) produced zero opportunities. Fix:
- computeSensorAccess option UseFieldOfRegard (gate on FieldOfRegardDeg
  around nominal pointing); result carries FieldOfViewMode + FovLimitDeg.
- SchedulerOptions.UseFieldOfRegardForTasking (default true) and
  AccessTimeStepSeconds (default 10) -> taskAccessOptions helper.
- computePointTargetTrackOpportunities + computeAreaScanOpportunities pass
  taskAccessOptions into computeSensorAccess (multi-sensor delegates to
  these). Slew time / off-nadir quality already model the pointing cost.
- Tests: testTaskingFieldOfRegard (FOR finds more than FOV, respects FOR
  limit, coarse-step still finds short passes, area scan, greedy end-to-end).
NOTE: branch rebuilt from origin/main (Kevin merged reworked ECI/mount
commit 937ea4e with OrekitFrameTransform); pre-merge branch backup patches
in scratchpad/mybackup.

## Scheduled-beam visualization re-applied on main (2026-07)

The beam-tracking/scanning viz was lost when the branch was rebuilt from
merged main; re-applied on top of main's reworked UI:
- resolveSensorPointing.m + testScheduledPointing.m restored (new files).
- computeSensorFootprint: FOV footprint follows resolveSensorPointing
  (tracks target / sweeps area during an active scheduled task); FOR stays
  on the nominal axis.
- UI collectSensorFootprints attaches .Pointing to FOV footprints;
  drawSensorFootprints2D/3D draw a red beam line + star at the aim point
  and thicken/brighten the footprint during active tasks. Uses main's
  satellitePositionKmAtTime apex + earthFixedToViewFrame.

## Web UI satellite/sensor create flow (2026-07)

- ConstellationDialog: propagator picker (Keplerian/EH/Numerical) and an
  "Imaging sensor" section that equips every Walker member via a new
  `sensor` param on `expandWalker` (per-member copy, no aliasing).
- Sensor names: optional `sensor.name` now editable in SensorDialog and
  SatelliteDialog (blank -> backend default "<sat> Sensor", already
  supported by buildScenarioFromSpec.m); validateSpec rejects empty/
  non-string names; ObjectBrowser tree fallback label now matches the
  backend default instead of the bare "Sensor".
- Tests: spec.test.mjs covers walker sensor expansion + name validation.

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
