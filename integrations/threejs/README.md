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
viewer = openOhioScenarioViewer();
```

The browser controls use same-origin HTTP requests. MATLAB changes the `Scenario`
and sends a complete renderer-neutral snapshot back to React and Three.js.
The viewer keeps an explicit MATLAB-owned calculation cache between refreshes.
Scenario-wide epochs, Sun directions, and frame rotations are reused when the
interval and providers are unchanged. Each satellite trajectory is reused only
while its name and complete initial state match. Adding another satellite therefore
calculates that satellite without propagating the unchanged collection again.

The top menu provides New, Save, Load, Add Satellite, and Add Place commands. Saved
files use the provider-neutral scenario-definition JSON contract. The satellite form
accepts epoch, semimajor-axis altitude, eccentricity, inclination, RAAN, argument of
perigee, and true anomaly. When the product composition supplies the Orekit
satellite-state provider, MATLAB converts those elements to the authoritative ITRF
Cartesian state before adding the satellite. JavaScript performs no orbital
conversion or propagation.

## Dependencies

- MATLAB with its bundled Java runtime and timer support
- Scenario platforms, targets, composition, and frames modules
- Aerospace Toolbox for MATLAB-side WGS84-to-ECEF conversion
- React 18.3.1 and Three.js 0.170.0, compiled into `dist`

The viewer displays MATLAB-provided snapshots. When composition supplies a
trajectory provider, MATLAB publishes time-tagged ECI/ECEF histories and the
browser enables timeline playback. Without that optional provider, the viewer
remains an honest non-playable snapshot and does not invent orbital motion. The
viewer runs offline and does not fetch scripts, textures, or other assets at
runtime.

The viewport provides ECEF and mean-equator/mean-equinox ECI display modes. MATLAB
supplies both object positions, Earth orientation, and the Sun direction at the
scenario epoch. Orekit controls the physical directional light. The Sun uses the
reference React viewer's radial sprite, warm light, scale, and placement 100 Earth
radii along the calculated direction. As in that viewer, it can be outside the
camera field of view or behind Earth.

The default Ohio example composes the Orekit Keplerian trajectory provider. Its
six-hour scenario is sampled every 60 seconds and defaults to 240 scenario
seconds per real second. The viewer interpolates the MATLAB-supplied samples at
the browser refresh rate and offers playback speeds from 60x through 2400x. ECI
playback rotates Earth beneath the inertial orbit. ECEF
playback keeps Earth fixed and shows the corresponding ground-relative path.
Both frame modes render their MATLAB-supplied orbit histories. Left and right
drag both rotate the view around Earth; panning is intentionally disabled.

Visualization sampling defaults to 60 seconds. For intervals longer than 12 hours,
the MATLAB payload increases the cadence in whole-minute increments to remain at or
below 721 samples and reports that reduction in `warnings`. A 24-hour scenario uses
120-second samples. Browser-frame interpolation remains continuous between those
authoritative samples.

The Earth uses the local NASA Blue Marble texture carried by the reference React
viewer. Satellite and place markers, CSS labels, camera controls, atmosphere, and
starfield follow the same visual conventions. An orbit path is rendered only when
the MATLAB payload contains time-tagged ephemeris samples. Snapshot-only satellites
explicitly report `hasEphemeris = false`, so the renderer does not invent an orbit.

The localhost server is serviced by a MATLAB timer. Browser requests wait while the
owning MATLAB process is executing a long, uninterrupted foreground calculation.
Scene refreshes use batched Aerospace Toolbox direction cosine matrices to avoid
three scalar frame conversions at every playback epoch.

## Rebuilding the browser bundle

Run `pnpm install` followed by `pnpm run build` in this directory. The checked-in
`dist` directory is the offline runtime artifact. The `web-src` directory contains
all editable React and Three.js source code.
