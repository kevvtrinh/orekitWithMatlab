# Scenario Frames

Explicit coordinate and reference-frame conversions. Version 0.1.0 provides WGS84
geodetic latitude/longitude/altitude conversions to and from Earth-Centered,
Earth-Fixed Cartesian coordinates.

## Public API

```matlab
position_m = scenario.frames.convertGeodeticToEarthFixed(geodetic_lla);
geodetic_lla = scenario.frames.convertEarthFixedToGeodetic(position_m);
```

Rows of `geodetic_lla` contain `[latitude_deg, longitude_deg, altitude_m]`. Rows of
`position_m` contain `[x_m, y_m, z_m]` in ECEF.

## Dependencies

- MATLAB
- Aerospace Toolbox (`lla2ecef` and `ecef2lla`)

This module intentionally uses the maintained MathWorks implementations rather than
duplicating WGS84 conversion mathematics.

## Known limitations

- WGS84 is the only supported reference ellipsoid.
- Inertial frames, Earth orientation, epoch-dependent transforms, velocities, and
  covariances are not implemented.
- A missing Aerospace Toolbox is an explicit error; no lower-fidelity fallback is
  used.

