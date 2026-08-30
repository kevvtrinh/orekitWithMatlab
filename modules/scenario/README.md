# Scenario Composition

A small composition root for an analysis interval and its objects. It provides
convenient STK-familiar creation methods while delegating object definitions to their
own modules.

## Public API

```matlab
study = scenario.Scenario(name, startTime, stopTime);
satellite = study.addSatellite(name, initialState);
target = study.addTarget(name, latitude_deg, longitude_deg, altitude_m);
place = study.addPlace(name, latitude_deg, longitude_deg, altitude_m);
```

## Dependencies

- `scenario-platforms` 0.1.0
- `scenario-targets` 0.1.0

## Known limitations

- Only satellites and Earth-fixed point targets/places are supported.
- Object removal, persistence, propagation, access, and visualization are not yet
  implemented.
