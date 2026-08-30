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
definition = scenario.createScenarioDefinition(study);
study = scenario.createScenarioFromDefinition(definition);
```

## Dependencies

- `scenario-platforms` 0.1.0
- `scenario-targets` 0.1.0

Scenario definitions are versioned, provider-neutral MATLAB structures suitable for
JSON persistence. They preserve the scenario interval, Cartesian satellite initial
states, places, and point targets. Runtime providers and derived analysis results are
intentionally excluded.

## Known limitations

- Only satellites and Earth-fixed point targets/places are supported.
- Object removal, propagation, access, and visualization are not implemented by this
  module. Persistence currently supports scenario-definition Version 1 only.
