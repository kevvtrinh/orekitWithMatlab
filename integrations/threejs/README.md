# React and Three.js integration

An optional Three.js renderer controlled exclusively through MATLAB APIs. MATLAB
owns scenario state, time, transforms, access results, and sensor projections. The
JavaScript component renders supplied scene data and returns interaction events; it
does not call Orekit or act as a separate analysis engine.

The production viewer is a compiled React application hosted by MATLAB at a
loopback-only HTTP address. It runs offline without Node.js, Python, a CDN, or
MATLAB `uihtml`. Node and Vite are build-time dependencies only.

## First viewer

```matlab
setupScenario("threejs");
addpath(fullfile(pwd, "examples", "01_foundations"));
study = createOhioScenario();
viewer = scenario.integrations.threejs.Viewer(study);
```

The browser controls use same-origin HTTP requests. MATLAB changes the `Scenario`
and sends a complete renderer-neutral snapshot back to React and Three.js.

## Dependencies

- MATLAB with its bundled Java runtime and timer support
- Scenario platforms, targets, composition, and frames modules
- Aerospace Toolbox for MATLAB-side WGS84-to-ECEF conversion
- React 18.3.1 and Three.js 0.185.1, compiled into `dist`

The first viewer displays a snapshot at the scenario start time. It does not yet
propagate satellites. The viewer runs offline and does not fetch scripts, textures,
or other assets at runtime.

The viewport provides ECEF and mean-equator/mean-equinox ECI display modes. MATLAB
supplies both object positions, Earth orientation, and the Sun direction at the
scenario epoch. Orekit controls the physical directional light. The labelled Sun
glow is a camera-fixed display proxy so it remains visible when the physical Sun is
behind the current view; its apparent position, size, and distance are not physical.

The Earth uses the local NASA Blue Marble texture carried by the reference React
viewer. Satellite and place markers, CSS labels, camera controls, atmosphere, and
starfield follow the same visual conventions. An orbit path is rendered only when
the MATLAB payload contains time-tagged ephemeris samples. Snapshot-only satellites
explicitly report `hasEphemeris = false`, so the renderer does not invent an orbit.

The localhost server is serviced by a MATLAB timer. Browser requests wait while the
owning MATLAB process is executing a long, uninterrupted foreground calculation.

## Rebuilding the browser bundle

Run `pnpm install` followed by `pnpm run build` in this directory. The checked-in
`dist` directory is the offline runtime artifact. The `web-src` directory contains
all editable React and Three.js source code.
