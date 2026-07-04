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
- [ ] `src/analysis/computeOrbitalElements.m` + `plotOrbitalElements` —
      osculating elements from ephemeris (pure MATLAB rv->coe), period,
      apogee/perigee altitude.
- [ ] `src/analysis/computeLinkBudget.m` — FSPL/EIRP/C-N0/Eb-N0/margin from an
      access result + link params struct.
- [ ] Tests in `src/tests/`: testManeuverPlanner (pure math), testTLECatalog
      (parser, temp file), testLinkBudget (pure math), testOrbitalElements,
      testForceModels (numerical vs keplerian sanity, needs jars),
      testEclipseLighting, testCoverage, testAccessConstraints.
- [ ] Examples: example_09_hpopPropagation, example_10_eclipseLighting,
      example_11_coverageRevisit, example_12_maneuvers, example_13_tleCatalog,
      example_14_linkBudget.
- [ ] README: new sections for propagators/maneuvers/eclipse/coverage/
      constraints/TLE catalog/link budget.
- [ ] `docs/stk_feature_map.md` — STK module -> suite function mapping table.
- [ ] Commit + push to `claude/stk-tool-replacement-lzbn46`.

## Phase 2 — future sessions (not started)

- UI ribbon exposure of new backend features (propagator picker, force model
  panel, maneuver editor, coverage tab). UI file: `matlab/launchOrekitSatelliteUI.m`.
- Chains/deck access (multi-hop access, satellite-to-relay-to-ground).
- Attitude profiles beyond "Default"/Nadir (sun-pointing, target-pointing tie-in
  with existing sensor pointing).
- Ephemeris file import/export (CCSDS OEM via Orekit writers).
- Ground station az/el masks already have an `AzElMask` property — wire it into
  access constraints.
- Interpolation in `getPosition`/`getECEF` (currently nearest-sample).
- Numerical propagator performance: use Orekit ephemeris-mode batch propagation
  instead of per-sample `propagate()` calls.

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
