# Changelog

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
