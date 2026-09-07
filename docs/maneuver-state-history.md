# Maneuver state queries

Satellite propagation retains two related numeric histories:

- `Ephemeris` contains exactly the requested sampling grid. A sample at an
  impulsive maneuver time contains the state after all maneuvers at that time.
- `EphemerisSegments` contains continuous arcs. Each arc includes its boundary
  times, even when a maneuver falls between requested samples. Adjacent arcs
  retain separate preburn and postburn velocities at their shared time.

`getState` selects the applicable arc before applying cubic Hermite
interpolation. It never blends a postburn velocity into the preceding arc.
The same rule applies to satellite ECEF position queries and azimuth,
elevation, and range calculations. Adding an off-grid time to an access query
does not change the answers for other times in that query.

Interpolation remains a cubic approximation within each continuous arc; its
accuracy depends on the ephemeris sample spacing and motion. Numeric history
does not provide exact propagation between samples. `getState` and
`getECEFMatrix` retain their documented clamping outside the sampled span;
access calculations reject out-of-span times.

Native MAT scenario saves retain `EphemerisSegments` and omit Java propagator
handles. Reloaded scenarios therefore preserve the same interpolated motion
and one-sided event states. Older saves with maneuvers but no segment history
can still answer exact sample queries. Interpolation through a maneuver in
such a save produces `SatelliteObject:MissingManeuverHistory`, requesting
propagation again instead of inventing the missing boundary states.

An ordinary external ephemeris table does not encode maneuver boundaries.
Adding new maneuvers to an imported ephemeris satellite is rejected; use a
propagatable orbit definition to apply them. Single-table CSV or OEM exports
are not a lossless replacement for the native segmented history.

Run `runtests("src/tests/testManeuverStateHistory.m")` after
`startupOrekitSuite` to check causality before burns, mixed access queries,
off-grid and simultaneous maneuvers, endpoint impulses, and native save/load.
