# Scenario Frames

Explicit coordinate and reference-frame conversions. The module provides WGS84
geodetic conversions and epoch-dependent IAU-2000/2006 ECEF/ECI rotations.

## Public API

```matlab
position_m = scenario.frames.convertGeodeticToEarthFixed(geodetic_lla);
geodetic_lla = scenario.frames.convertEarthFixedToGeodetic(position_m);
rotations = scenario.frames.calculateEarthFixedToInertialRotation(epochUtc);
positionsEci_m = scenario.frames.convertEarthFixedToInertial( ...
    epochUtc, positionsEcef_m);
positionsEcef_m = scenario.frames.convertInertialToEarthFixed( ...
    epochUtc, positionsEci_m);
```

Rows of `geodetic_lla` contain `[latitude_deg, longitude_deg, altitude_m]`. Rows of
`position_m` contain `[x_m, y_m, z_m]` in ECEF. A vector of M UTC epochs
produces a 3-by-3-by-M ECEF-to-ECI rotation history in one Aerospace Toolbox
call. Position conversions reuse one rotation for every position at a shared
scalar epoch.

## Dependencies

- MATLAB
- Aerospace Toolbox (`lla2ecef`, `ecef2lla`, and `dcmeci2ecef`)

This module intentionally uses the maintained MathWorks implementations rather than
duplicating WGS84 conversion mathematics.

## Known limitations

- WGS84 is the only supported reference ellipsoid.
- Earth-orientation corrections use the Aerospace Toolbox defaults. External
  UT1, polar-motion, leap-second, and celestial-pole corrections cannot yet be
  injected.
- Velocity, acceleration, and covariance transformations are not implemented.
- A missing Aerospace Toolbox is an explicit error; no lower-fidelity fallback is
  used.
