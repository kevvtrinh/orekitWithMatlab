# Changelog

## 0.3.0

- Added batched IAU-2000/2006 ECEF-to-ECI direction cosine matrices.
- Reused one calculated rotation for every position at a shared epoch.

## 0.2.0

- Added Aerospace Toolbox ECEF-to-ECI and ECI-to-ECEF position conversions.

## 0.1.0

- Added WGS84 geodetic-to-ECEF conversion using `lla2ecef`.
- Added ECEF-to-WGS84 geodetic conversion using `ecef2lla`.
