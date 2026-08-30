# Changelog

## Unreleased

- Added MATLAB-backed New, Save, Load, Add Satellite, and Add Place authoring menus.
- Added classical-element satellite entry through an explicitly injected state
  provider and versioned provider-neutral scenario-definition persistence.

## 0.3.0

- Added optional MATLAB-owned, time-tagged trajectory playback.
- Added Orekit-backed ECI and ECEF satellite histories to the Ohio example.
- Added play, pause, epoch display, and timeline scrubbing controls.
- Added refresh-rate interpolation and selectable 60x-2400x playback speeds.
- Extended the default Ohio scenario from two hours to six hours.
- Added frame-specific orbit paths and time-varying Earth orientation.
- Mapped both left and right drag to globe-centered rotation and disabled pan.

## 0.2.0

- Replaced the embedded HTML viewer with a React and Three.js application.
- Added a MATLAB-owned, loopback-only Java HTTP server.
- Removed the temporary Python server and all runtime CDN requirements.
- Added a compiled offline production bundle and same-origin command API.
- Added ECEF and ECI display modes with MATLAB-supplied transforms.
- Added a frame-aware Sun direction, lighting source, and celestial object entry.
- Changed the Sun marker to a distant canvas-generated radial glow sprite.
- Ported the reference React viewer's Blue Marble Earth, markers, CSS labels,
  camera controls, atmosphere, and ephemeris-only orbit-path convention.

## 0.1.0

- Added a MATLAB-hosted Three.js Earth viewer.
- Added MATLAB-routed controls for creating satellites and Ohio places.
- Added MATLAB-side WGS84-to-ECEF conversion before renderer synchronization.
- Vendored Three.js 0.185.1 and its MIT license for offline operation.
