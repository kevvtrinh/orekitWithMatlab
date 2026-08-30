# Scenario Platforms

Engine-neutral platform definitions. The first release provides `Satellite` with an
explicit Cartesian initial state. It stores state but does not propagate it.

## Public API

```matlab
satellite = scenario.platform.Satellite(name, initialState);
```

`initialState` contains `epoch`, `frame`, `position_m`, and `velocity_m_s`.

## Dependencies

None beyond MATLAB. Orekit is not required.

## Known limitations

- Only `Satellite` is implemented.
- No propagator, attitude, mass, force model, or ephemeris is attached.

