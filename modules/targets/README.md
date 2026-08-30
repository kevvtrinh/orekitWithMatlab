# Scenario Targets

Engine-neutral passive targets and places. The first release provides Earth-fixed
point objects using WGS84 geodetic latitude, longitude, and ellipsoidal altitude.

## Public API

```matlab
target = scenario.target.PointTarget(name, latitude_deg, longitude_deg, altitude_m);
place = scenario.target.Place(name, latitude_deg, longitude_deg, altitude_m);
```

## Dependencies

None beyond MATLAB. Targets cannot carry sensors.

## Known limitations

- Only Earth-fixed WGS84 point targets and places are implemented.
- No terrain height, country lookup, or coordinate transformation is performed.
