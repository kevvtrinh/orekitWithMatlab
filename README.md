# OREKIT-Matlab

A maintainable MATLAB interface and mission-analysis toolkit built incrementally on
top of the Orekit Java engine.

The project is organized as independently removable MATLAB modules rather than one
large wrapper. Small public contracts connect modules without forcing unrelated
dependencies. Orekit is an optional provider used only where its astrodynamics
capabilities are needed.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the proposed module map,
dependency rules, and phased implementation plan.

## First runnable slice

The basic product can create a scenario containing an engine-neutral satellite and
an Earth-fixed point target:

```matlab
setupScenario();
addpath(fullfile(pwd, "examples", "01_foundations"));
study = createOhioScenario();
```

This slice intentionally performs no propagation, access calculation, or
visualization.

## MATLAB-hosted Three.js viewer

```matlab
setupScenario("threejs");
addpath(fullfile(pwd, "examples", "01_foundations"));
viewer = openOhioScenarioViewer();
```

The default viewer contains one ITRF satellite snapshot and one WGS84 place in Ohio.
The **Add Satellite** and **Add Place** buttons route changes through MATLAB before a
new renderer snapshot is sent to Three.js. Three.js is vendored with the integration,
so the viewer runs offline.

## Top-level layout

```text
OREKIT-Matlab/
|-- modules/             Independently usable MATLAB modules
|-- integrations/        Optional Orekit and other engine adapters
|-- products/            Curated module bundles and applications
|-- config/              Versioned configuration templates
|-- data/                 Local runtime data (large files are ignored)
|-- examples/             Small executable workflows
|-- tests/                Unit, integration, validation, and regression tests
|-- benchmarks/           Performance and scale measurements
|-- tools/                Setup, packaging, and developer utilities
|-- docs/                 Architecture, API, guides, and decisions
`-- third_party/          Dependency manifests, notices, and local JAR location
```

## Architectural rule

Only `integrations/orekit` may directly call Orekit Java objects. Core domain modules
must run without Orekit installed. Modules communicate through explicitly declared
contracts and may be removed without editing unrelated modules.
