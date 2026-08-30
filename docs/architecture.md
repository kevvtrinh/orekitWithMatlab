# Architecture

## 1. Design objective

Provide a MATLAB-native mission-analysis environment that can gradually cover most
common STK workflows while using Orekit as the astrodynamics engine. The goal is
functional breadth, not API-level imitation of STK.

The architecture is a collection of independently testable and distributable
modules. A full mission-analysis product composes them, but no module is assumed to
exist merely because it is in this repository. Orekit is one optional integration,
not a transitive dependency of the entire system.

## 2. Dependency direction

```text
products / apps / user scripts
              |
              v
 optional orchestration modules
              |
              v
 independently removable domain modules
              |
              v
 minimal contracts and value modules

 integrations/orekit -> implements selected contracts -> Orekit Java API
```

Dependencies flow toward smaller contracts. Domain modules may depend only on the
modules listed in their manifest. They must not depend on products, plotting,
examples, hidden global state, or a concrete engine where a contract is sufficient.

## 3. Source tree

Public MATLAB code uses the descriptive `scenario` namespace (`+scenario`). Each module
has its own source, tests, README, and dependency manifest. MATLAB composes namespace
portions from installed module paths while each module remains physically separable.

```text
modules/
|-- contracts/         tiny interfaces shared across boundaries
|-- core/              errors, units and validation
|-- time/              engine-neutral epochs and time spans
|-- frames/            frame identifiers and transform contracts
|-- state/             state and trajectory values
|-- bodies/            Earth, Sun, Moon and generic body definitions
|-- environment/       illumination, occultation and environment queries
|-- geometry/          regions and pure geometric algorithms
|-- geospatial/        countries, borders and Earth-surface features
|-- intervals/         events and Boolean interval algebra
|-- platforms/         satellites, aircraft, ships, facilities and mounts
|-- targets/           passive point, line, area and moving targets
|-- sensors/           sensor, FOV and detection abstractions
|-- access/            provider-neutral access and constraint composition
|-- propagation/       contracts and simple MATLAB propagators
|-- attitude/          attitude laws and pointing contracts
|-- maneuvers/         maneuver definitions and sequences
|-- coverage/          grids, revisit and dwell aggregation
|-- communications/    link budgets and RF component models
|-- conjunction/       screening and collision probability workflows
|-- estimation/        measurements, covariance and estimation workflows
|-- optimization/      targeting and design searches
|-- analysis/          reports, statistics and trade studies
|-- visualization/     optional plotting and animation
|-- io-ccsds/          optional CCSDS file support
`-- scenario/          optional orchestration facade

integrations/
|-- orekit/            optional Orekit-backed implementations
|-- spice/             optional SPICE-backed implementations
|-- geodata/           optional Natural Earth/GeoJSON catalog providers
|-- terrain/           optional terrain/elevation providers
`-- threejs/           optional Three.js renderer driven only by MATLAB

products/
|-- full/              broad STK-style module selection
|-- orbit-analysis/    smaller orbit-analysis distribution
`-- tracking/          sensors, access and tracking distribution
```

Not every module should be implemented immediately. Removing a module directory and
its product-manifest entry must not require changes to unrelated modules.

### Module contract

Every module contains:

```text
module-name/
|-- module.json        version, public packages, required/optional modules
|-- README.md          purpose, public API and dependency explanation
|-- src/+scenario/...   implementation
`-- tests/             tests using only declared requirements
```

Dependency rules:

1. Dependencies are declared and acyclic.
2. Cross-module calls use public contracts, never another module's internals.
3. Optional dependencies use explicit composition, never silent MATLAB-path probing.
4. Providers are passed through constructors or requests; modules do not locate
   Orekit, SPICE, terrain, graphics, or databases themselves.
5. MATLAB values or contract objects cross boundaries; Orekit Java objects do not.
6. Every module is tested alone as well as in relevant product bundles.

### MATLAB and MathWorks toolbox reuse

Use maintained MATLAB or MathWorks toolbox functions when they already implement the
required operation and convention. For example, the frames module should use
`lla2ecef` and `ecef2lla` for WGS84 geodetic/ECEF conversion when Aerospace Toolbox
is the declared provider. Do not maintain duplicate geodetic conversion mathematics
without a documented portability or fidelity requirement.

Toolbox reuse remains explicit and removable:

- the owning module manifest declares the required MathWorks product;
- public documentation states units, ordering, reference surface, and conventions;
- tests validate the wrapped result against independent reference cases;
- missing required products produce actionable errors;
- no silent fallback changes precision or physical meaning;
- higher-level modules depend on the frame API, not directly on `lla2ecef`.

### Bodies, environment, and geospatial data

Separate what an object *is* from where an external engine says it is:

```text
modules/bodies
|-- Body                 identity, physical constants and frame identifiers
|-- Earth                ellipsoid/geoid configuration and fixed frame
|-- Sun                  common Sun definition
|-- Moon                 common Moon definition
`-- BodyCatalog          common definitions; no ephemeris engine required

modules/contracts
|-- EphemerisProvider    body state at an epoch and in a requested frame
|-- TransformProvider    transform between frame identifiers
`-- SurfaceDataProvider  named boundaries and surface features

modules/environment
|-- direction            direction from an observer/frame to a body
|-- illumination         sunlight direction, incidence and shadow state
|-- occultation          body obstruction and limb-clearance calculations
`-- lightingIntervals    sunlight, eclipse, dawn/dusk and local solar time

modules/geospatial
|-- Country              named surface region with metadata
|-- SurfaceRegion        polygons/multipolygons on a body
|-- Border               line geometry on a body surface
|-- GeoCatalog           provider-neutral named-feature lookup
`-- GeoJsonAdapter       optional plain GeoJSON import/export
```

`Earth`, `Sun`, and `Moon` are lightweight engine-neutral definitions. Asking for a
Sun or Moon position requires an `EphemerisProvider`; the Orekit and SPICE
integrations may each implement that contract. WGS84 conversion and polygon handling
can remain pure MATLAB and should not require Orekit.

Illustrative API:

```matlab
earth = scenario.bodies.Earth.wgs84();
sun   = scenario.bodies.Sun.standard();
moon  = scenario.bodies.Moon.standard();

environment = scenario.environment.Environment( ...
    Ephemeris=ephemerisProvider, Transforms=transformProvider);

sunVector = environment.directionTo(sun, observer, epoch, ...
    OutputFrame=sensor.frame());
lighting = environment.illumination(observer, epoch);
eclipses = environment.eclipseIntervals(satellite, timeSpan);

countries = scenario.geospatial.GeoCatalog(surfaceDataProvider, earth);
canada = countries.country("Canada");
```

Countries are geometric `SurfaceRegion` objects, not hard-coded targets. They can be
used directly for plotting and coverage, or adapted into an `AreaTarget` when the
target module is installed:

```matlab
canadaTarget = scenario.target.AreaTarget("Canada", canada.Region);
```

Plotting a country in a sensor frame follows an explicit transform pipeline:

```text
country geodetic boundary
        -> Earth-fixed Cartesian geometry
        -> inertial or platform frame
        -> sensor mount/frame
        -> sensor angular/image-plane projection
```

```matlab
view = scenario.geometry.project(canada.Region, ...
    FromFrame=earth.FixedFrame, ...
    ToFrame=sensor.frame(), ...
    Epoch=epoch, ...
    Transforms=transformProvider, ...
    Projection=sensor.FieldOfView.projection());
```

The geometry module performs transformations and clipping but does not plot. The
optional visualization module consumes the transformed geometry. This allows the
same result to drive a MATLAB plot, coverage calculation, image simulation, or an
external viewer without coupling those uses together.

### Three.js visualization through MATLAB

Three.js is a required visualization option, but it remains an optional integration
so headless analysis and nonvisual deployments do not install it. The supported
control path is strictly:

```text
user MATLAB code
      -> scenario.visualization public API
      -> renderer contract
      -> integrations/threejs MATLAB bridge
      -> embedded/local Three.js renderer
```

The browser/JavaScript side is a renderer, not a second mission engine. It must not:

- instantiate or call Orekit;
- calculate authoritative propagation, access, frames, or sensor geometry;
- read module internals or scenario files directly;
- expose a separately supported JavaScript API to users;
- require users to run Node.js or call JavaScript themselves.

MATLAB owns the scenario, clock, coordinate transformations, visibility decisions,
sensor-frame projections, and playback state. It sends renderer-neutral scene
commands and time-tagged buffers to the Three.js bridge. JavaScript may perform only
display-local work such as interpolation between supplied samples, camera control,
selection, picking, labels, and GPU rendering. Interaction events return to MATLAB
through the bridge.

```matlab
viewer = scenario.visualization.Viewer( ...
    Renderer=scenario.integrations.threejs.Renderer());

viewer.addEarth(earth);
viewer.addPlatform(satellite);
viewer.addRegion(canada.Region);
viewer.addSensorFieldOfView(camera);
viewer.setReferenceFrame(sensor.frame());
viewer.setTime(epoch);
viewer.play(timeSpan, Rate=60);
```

The visualization module defines renderer-neutral objects such as `Scene`, `Layer`,
`Renderable`, `Camera`, `Timeline`, and `Renderer`. The Three.js integration maps
those contracts to browser primitives. This keeps the renderer replaceable by MATLAB
graphics or another viewer without changing analysis modules.

For scale, MATLAB may send typed arrays or compact binary buffers containing sampled
positions, attitudes, polylines, meshes, colors, and interval visibility flags. Each
payload declares epoch, frame, units, and interpolation policy. The renderer never
guesses any of them. Country geometry transformed into a sensor frame is therefore
computed by MATLAB modules first and delivered to Three.js as ready-to-render data.

### STK-familiar object vocabulary

Use familiar analysis terms where they improve discoverability, without attempting
to reproduce proprietary APIs or internal behavior exactly:

| Public term | Responsibility | Owning module |
|---|---|---|
| `Scenario` | analysis interval, object registry and composition root | scenario |
| `Satellite` | orbiting sensor-bearing platform | platforms |
| `Aircraft` | airborne sensor-bearing platform | platforms |
| `Ship` | maritime sensor-bearing platform | platforms |
| `GroundVehicle` | land-mobile sensor-bearing platform | platforms |
| `Facility` | fixed ground site; replaces the less specific GroundStation term | platforms |
| `Place` | passive named location or small region | targets |
| `Target` | passive point or area of interest | targets |
| `Sensor` | mounted field of view and sensing constraints | sensors |
| `Transmitter` / `Receiver` | mounted communications equipment | communications |
| `Constellation` | named collection of compatible objects | analysis |
| `Chain` | ordered multi-object access path | access |
| `CoverageDefinition` | grid, assets and coverage metrics | coverage |
| `Access` | constrained visibility/contact result | access |

The optional Scenario module provides convenient STK-like composition methods, but
does not own the underlying science. For example, `Scenario.addSatellite` delegates
to the independently usable platforms module and `Scenario.calculateAccess`
delegates to the access module.

```matlab
study = scenario.Scenario("Demo", startTime, stopTime);
satellite = study.addSatellite("LEO-1", initialOrbit);
facility = study.addFacility("Denver", latitude, longitude, altitude);
target = study.addTarget("Inspection Point", targetLocation);
sensor = satellite.addSensor("Camera", cameraDefinition, nadirMount);
access = study.calculateAccess(sensor, target);
```

### Platform, target, and sensor model

Use composition rather than creating separate sensor logic for every vehicle type:

```text
scenario.platform.Platform (abstract, sensor-bearing)
|-- Satellite
|-- Ship
|-- Aircraft
|-- GroundVehicle
`-- Facility
     |
     `-- 0..* SensorMount
              |
              `-- 1 Sensor

scenario.target.Target (not a Platform; cannot own SensorMount objects)
|-- PointTarget
|-- AreaTarget
|-- LineTarget
`-- MovingTarget
```

`Platform` owns identity, time-varying pose, physical properties, and a collection
of mounts. Each `SensorMount` defines the sensor's position and orientation relative
to its parent platform, plus optional steering constraints. A `Sensor` defines the
payload behavior and field of view. This supports one or many heterogeneous sensors
on the same platform without placing sensor code inside `Satellite`, `Ship`, etc.

Initial sensor families should be capability-oriented:

```text
scenario.sensors.Sensor (abstract)
|-- OpticalSensor
|-- RadarSensor
|-- RfSensor
`-- CustomSensor

scenario.sensors.fov.FieldOfView (abstract)
|-- ConicalFieldOfView
|-- RectangularFieldOfView
|-- PolygonalFieldOfView
`-- OmnidirectionalFieldOfView
```

A sensor type and its field of view are separate concepts. For example, radar and
optical sensors can both use a conical field of view while applying different range,
lighting, detection, and measurement models. Targets deliberately do not implement
the platform/mount interface, so attaching a sensor to a target is invalid by design.

Illustrative public API:

```matlab
satellite = scenario.platform.Satellite("LEO-1", initialOrbit);
camera = scenario.sensors.OpticalSensor("Nadir Camera", ...
    scenario.sensors.fov.ConicalFieldOfView(deg2rad(12)));
radar = scenario.sensors.RadarSensor("SAR", radarModel);

satellite.attachSensor(camera, scenario.platform.SensorMount.nadirPointing());
satellite.attachSensor(radar, scenario.platform.SensorMount("Port", portTransform));

site = scenario.platform.Facility("Denver", latitude, longitude, altitude);
site.attachSensor(scenario.sensors.RfSensor("S-band", antennaModel), ...
    scenario.platform.SensorMount.azElGimbal(azLimits, elLimits));

target = scenario.target.PointTarget("Inspection Point", targetLocation);
```

### Access and visibility API

Access is an analysis result between participants, not state stored on either object.
Keep the calculation in `scenario.access` so platform and target classes remain small.

```text
scenario.access/
|-- AccessCalculator        general constrained access calculation
|-- GeometricAccess         unobstructed line-of-sight calculation
|-- AccessRequest           participants, interval, constraints, sampling policy
|-- AccessResult            intervals, event times, metadata, optional samples
|-- AccessGeometry          range, range rate, az/el, look angles, phase angle
|-- AccessConstraint        abstract constraint contract
`-- constraints/
    |-- LineOfSightConstraint
    |-- FieldOfViewConstraint
    |-- RangeConstraint
    |-- ElevationConstraint
    |-- LightingConstraint
    |-- OccultationConstraint
    |-- TerrainMaskConstraint
    |-- PointingConstraint
    |-- LinkMarginConstraint
    `-- CustomConstraint
```

The initial convenience methods should be:

```matlab
% Pure visibility between object origins; ignores payload capabilities.
geometric = scenario.access.calculateGeometricAccess(observer, target, timeSpan);

% Sensor-to-target access automatically applies line of sight, mount pointing,
% field of view, and the sensor's configured operating constraints.
access = scenario.access.calculateAccess(camera, target, timeSpan);

% Crosslink or communications access between mounted RF sensors.
link = scenario.access.calculateAccess(txSensor, rxSensor, timeSpan, ...
    Constraints=[minElevation, positiveLinkMargin]);

% Geometry can be evaluated at an epoch or sampled over access intervals.
geometry = scenario.access.calculateGeometry(observer, target, epoch);
samples = access.sample(seconds(10), ...
    Fields=["Range", "RangeRate", "Azimuth", "Elevation"]);
```

`calculateGeometricAccess` answers only whether an unobstructed geometric path exists.
`calculateAccess` answers whether the requested mission interaction is possible after
all applicable constraints are combined. The distinction prevents an optical camera
from reporting usable access merely because its platform can see the target.

Useful access variants built from the same constraint engine include:

- platform-to-platform line of sight and relative geometry;
- platform-to-target visibility;
- sensor-to-target detection opportunity;
- sensor-to-sensor crosslink or communications opportunity;
- facility contact with elevation masks;
- eclipse, sunlight, occultation, and limb-clearance windows;
- range, range-rate, azimuth/elevation, and look-angle limits;
- overlapping access among multiple participants;
- chains such as satellite -> relay satellite -> facility;
- revisit time, response time, dwell time, and access-duration statistics.

All window-producing analyses return `scenario.events.IntervalSet`. This enables
intersection, union, subtraction, complement, filtering by duration, and multi-hop
chain calculations without inventing a different result format for each subsystem.

Participant rules should be validated before propagation begins. A target can be an
access endpoint but cannot be an observing endpoint because it has no mounted sensor.
A bare platform may perform geometric access; sensor-specific access requires a
mounted sensor and uses the parent platform pose plus the mount transform.

## 4. Supporting tree

```text
config/
|-- defaults/          committed defaults
`-- schemas/           validation schemas for scenario/config files

data/
|-- orekit/            optional Orekit data cache; contents not committed
|-- spice/             optional SPICE kernel cache; contents not committed
`-- catalogs/          optional shared catalogs; contents not committed

tests/
|-- composition/       verify supported module combinations
|-- validation/        results checked against references/independent tools
|-- fixtures/          small, versioned test inputs
`-- helpers/           repository-level test utilities

Each module and integration owns its unit, regression, and integration tests. The
root test tree verifies composed products and scientific validation cases only.

examples/
|-- 01_foundations/    time, frames, states
|-- 02_propagation/    first complete orbit workflows
|-- 03_events_access/  rise/set, eclipse, access
|-- 04_mission_design/ maneuvers, targeting, constellations
`-- 05_operations/     estimation, conjunction, communications, coverage

docs/
|-- adr/               architecture decision records
|-- api/               generated/user-facing API reference
|-- guides/            task-oriented guides
|-- validation/        reference cases and accuracy evidence
`-- roadmap/           capability and release planning
```

## 5. Core contracts

Use a small set of MATLAB-native values across all public APIs:

- `scenario.time.Epoch` pairs an instant with an explicit time scale.
- `scenario.frames.Frame` identifies a frame without leaking an Orekit object.
- `scenario.state.CartesianState` and `scenario.state.OrbitState` carry state plus epoch/frame.
- `scenario.ephemeris.Trajectory` provides sampled/interpolated states.
- `scenario.events.Interval` and `IntervalSet` represent all window results.
- `scenario.Scenario` owns objects and analysis time span, but not global state.
- `scenario.core.Result` or typed exceptions provide consistent failure information.

Quantities must have an explicit unit policy. Recommended: accept documented SI
numeric values at low-level APIs and provide conversion helpers; use `duration` and
`datetime` only where their semantics are unambiguous. Never infer frames, time
scales, or angular units from raw arrays.

## 6. Orekit adapter boundary

`integrations/orekit` contains narrow adapters grouped by responsibility:

```text
integrations/orekit/src/+scenario/+integrations/+orekit/
|-- Runtime.m          JAR/classpath and supported-version checks
|-- DataContext.m      data-provider setup with no implicit global mutation
|-- TimeAdapter.m      Epoch <-> AbsoluteDate
|-- FrameAdapter.m     Frame <-> Orekit Frame and transforms
|-- StateAdapter.m     MATLAB states <-> PVCoordinates/Orbit/SpacecraftState
|-- PropagatorFactory.m
|-- ForceModelFactory.m
|-- EventAdapter.m
`-- ExceptionTranslator.m
```

The integration depends on relevant contracts and value modules, while those modules
do not depend on it. For example, `modules/propagation` defines a `Propagator`
contract and the Orekit integration supplies `OrekitPropagator`. Time conversion and
frame transformation follow the same provider pattern.

Do not make a generic one-to-one wrapper for every Orekit class. Wrap coherent user
workflows and expose Orekit escape hatches only under an explicitly unsupported
advanced API. This prevents Java implementation details from spreading throughout
the toolbox.

## 7. STK-like capability map

| STK-style area | Primary modules | Orekit role | Additional MATLAB work |
|---|---|---|---|
| Scenarios and objects | scenario, platforms, targets | dates, frames, propagation | registry, lifecycle, serialization |
| Satellites and trajectories | state, propagation, ephemeris | primary engine | builders, tables, caching |
| Facilities/targets/areas | bodies, geometry | geodetic transforms | object models, region tools |
| Sensors and visibility | sensors, access, events | event detection | FOV library, interval algebra |
| Coverage | coverage, sensors, access | repeated access geometry | grids, metrics, aggregation |
| Attitude | attitude, geometry | attitude providers | profiles, slew scheduling, visualization |
| Maneuver/targeting | maneuvers, optimization | propagation and events | solvers, constraints, workflows |
| Communications | communications, access | geometry, atmosphere inputs | RF/link-budget models |
| Conjunction analysis | conjunction, propagation | encounters, covariance tools | catalogs, screening pipeline, reports |
| Orbit determination | estimation | estimators and measurements | ingestion, diagnostics, workflows |
| Analysis Workbench | geometry, events, analysis | geometry and event primitives | calculation graph, interval logic |
| Reports and graphs | analysis, visualization | source data | report schemas, plotting, export |
| 2-D/3-D display | visualization | ephemerides/frames | MATLAB graphics or optional external viewer |

Some proprietary STK features have no direct Orekit equivalent. Communications,
high-end visualization, coverage UX, scheduling, databases, and report tooling will
be MATLAB-owned modules built on Orekit-derived geometry and dynamics.

## 8. Incremental delivery plan

### Phase 0 - Runtime foundation

- Pin one supported Orekit release and Java version.
- Load JARs and Orekit data deterministically.
- Implement `Epoch`, frame identifiers, state values, unit rules, and diagnostics.
- Establish unit/integration/reference tests and CI.

Exit condition: a clean checkout can transform one state between two frames and
reproduce a trusted answer.

### Phase 1 - Propagation vertical slice

- Initial orbit builders and Cartesian/Keplerian state conversion.
- Two-body, Keplerian, numerical, and TLE propagation.
- Earth gravity, drag, SRP, Sun/Moon perturbations.
- Ephemeris output, ground track, eclipse events, and plots.

Exit condition: one example defines, propagates, analyzes, and visualizes a satellite
without exposing Java objects.

### Phase 2 - Geometry and access

- Facilities, targets, areas, sensors, FOVs, lighting, occultation.
- Event-to-interval conversion and interval Boolean operations.
- Access reports and basic coverage/revisit metrics.

### Phase 3 - Mission design

- Attitude laws, impulsive and finite maneuvers, maneuver sequences.
- Targeting, differential correction, Lambert transfers, optimization adapters.
- Constellation generation and parameter sweeps.

### Phase 4 - Operations analysis

- Measurement ingestion and orbit determination.
- Covariance propagation, conjunction screening, encounter products.
- Communications/link budgets and scheduling interfaces.

### Phase 5 - Product maturity

- Scenario persistence and versioned schemas.
- Report/graph templates, richer 3-D animation, apps, packaging, documentation.
- Performance work: batching, parallel studies, caching, and optional Java extensions.

Each phase should deliver a thin end-to-end workflow before expanding breadth. Avoid
implementing all domain classes up front.

## 9. Test and validation policy

- Unit-test MATLAB value objects and interval logic without starting Java.
- Integration-test every adapter against the pinned Orekit version.
- Validate representative cases against published references, GMAT, STK exports, or
  independently computed truth; record source, tolerances, and environment.
- Use property tests for frame round trips, time conversions, and orbital invariants.
- Keep accuracy tolerances distinct from numerical regression tolerances.
- Benchmark long propagations, constellations, dense access searches, and parameter
  sweeps before optimizing.

## 10. Rules that preserve maintainability

1. No direct Orekit Java calls outside `integrations/orekit`.
2. No hidden mutable singleton scenario or implicit current epoch/frame.
3. Public inputs and outputs are MATLAB values, tables, timetables, or documented
   domain objects.
4. Every state and trajectory carries epoch, frame, and units by construction.
5. Optional modules degrade cleanly when external data or toolboxes are unavailable.
6. Cache keys include model configuration, data versions, frames, and time spans.
7. Public interfaces receive semantic versioning; adapters may change internally.
8. Add an ADR for decisions that affect multiple modules.
9. Removing a module must not break undeclared dependents because none may exist.
10. Integrations implement contracts; contracts never reference integrations.
