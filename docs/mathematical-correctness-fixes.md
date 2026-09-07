# Mathematical correctness corrections

These changes address the counterexamples found in the audit of `main` at
`6b8ee4551a0f5f578a34dfa3c0e251450a679fc3`. The React/Three.js frontend remains
in `apps/orbit-ui`. A subsequent cleanup removes the separate static UI and
provides `launchOrbitHtmlUI` as the MATLAB entrypoint to the React console.

## Corrected behavior

| Area | Result |
| --- | --- |
| Maneuver states | Numeric continuous arcs retain both sides of each impulse. A future burn does not contaminate earlier interpolated states. |
| Access queries | Mixed on-grid/off-grid requests use the same time-specific history, including after native scenario reload. |
| STK export | Quaternions use the Shuster reference-to-body convention. Both spacecraft attitude and sensor-pointing files receive the correction. |
| OEM import | Required center/frame/time metadata is validated. TAI instants become UTC; EME2000/J2000 position and velocity become GCRF. |
| Orbital elements | Circular and equatorial orbits retain phase and orientation, including retrograde cases. `AngleConvention` identifies the substitute angles. |
| Moving targets | Cartesian and geodetic queries use the moving trajectory rather than the constructor's fixed location. |
| Velocity pointing | Public pointing and sensor access use the same Earth-relative velocity, obtained from a full GCRF-to-ITRF state transform at the query time. |
| Rectangular FOV | Rear-hemisphere look directions are rejected. The rectangular bounding cone encloses its corners. |
| Footprints | A sensor cone that misses Earth returns empty coordinates. Partial intersections use actual cone and limb arcs. |
| Coverage | Durations use the actual sample intervals and scenario endpoints; a ten-minute scenario cannot acquire an extra minute from the inclusive final sample. |
| Geographic polygons | Containment, centroid, area approximation, and grids share the shortest-edge longitude convention across the dateline. |
| Slew duration | Rest-to-rest triangular and trapezoidal motion includes both acceleration ramps. A 36-degree slew at 3 degrees/s and 1 degree/s² takes 15 seconds. |
| Scheduling transitions | Each shared sensor's actual terminal/initial pointing geometry determines its transition requirement. Platform identity distinguishes identically named sensors. |
| Cooperative scheduling | Candidates contain the requested number of distinct sensors and revalidate dwell on their common time interval. |
| Dwell caps | Task/sensor duration caps are applied before final feasibility is accepted. |

## Time and frame interchange

`loadOEMFile` reads the first Earth-centered state segment in km and km/s.
`CENTER_NAME`, `REF_FRAME`, and `TIME_SYSTEM` are mandatory. Supported time
systems are UTC and TAI; unsupported systems are rejected explicitly. Supported
axes are GCRF, Earth-centered ICRF, EME2000, and J2000 (EME2000). Returned state
columns always contain GCRF meters and meters/second with UTC datetimes. Input
metadata is retained in `SourceEphemeris.Properties.UserData`.

UTC leap-second instants cannot be represented by the suite's MATLAB UTC
datetime contract, so those instants raise an identified error rather than
being collapsed into the following second. Optional OEM acceleration and
covariance data are not imported; later segments remain outside this loader's
contract.

The STK quaternion conversion follows the published
[STK Shuster convention](https://help.agi.com/stkEngineOnUNIX/Content/stk/sn-orientation.htm).
Tests independently construct passive axis-angle rotations and check the
actual exported attitude/pointing matrices. An installed STK application is
not required for these tests; an application-level STK import was not performed.

## Singular orbital elements

`computeOrbitalElements` preserves the existing element columns and adds
`AngleConvention`:

- `Classical`: ordinary nonsingular elements.
- `CircularInclined`: argument of periapsis is zero and `TrueAnomalyDeg`
  contains argument of latitude.
- `Equatorial`: RAAN is zero and argument of periapsis contains the directed
  longitude of periapsis.
- `CircularEquatorial`: RAAN and argument of periapsis are zero and
  `TrueAnomalyDeg` contains directed true longitude.

Angles increase about the angular-momentum direction, so retrograde cases
retain their physical state. A dimensionless `1e-12` tolerance identifies
unresolved eccentricity and sine of inclination. Unbound states have infinite
period/apogee; radial states with undefined orbital plane are rejected.

## Compatibility and remaining model limits

- [Maneuver state history](maneuver-state-history.md) describes numeric arc
  persistence, right-continuous burn samples, and interpolation. Legacy saves
  without one-sided states require repropagation for queries that cross a burn.
  Ordinary single-segment CSV/OEM tables do not preserve impulse boundaries.
- [Geometry conventions](geometry_correctness.md) describe nearest-sample
  moving targets, midpoint coverage transitions, spherical footprints, the
  rectangular bounding-cone approximation, and unsupported winding polygons.
- [Scheduling models](sensor_scheduling_models.md) describe the rest-to-rest
  slew model and serialized endpoint metadata. With `EnforceSlew=true`, shared
  sensor transitions without known endpoint geometry report
  `UnknownSlewGeometry`. Regenerate old candidates to obtain the metadata, or
  explicitly set `EnforceSlew=false` for occupancy-only checks. This includes
  area-scan and moving-parent commands whose endpoint pointing is not known.
  Finite axis limits use a conservative executable serial azimuth/elevation
  path. Track-rate matching, jerk limits, and obstacle checks during the slew
  are not claimed.

## Verification

Before the static UI cleanup, the complete backend suite passed on MATLAB
R2024b with Orekit 13.1.6 and
Hipparchus 4.0.3: **186 passed, 0 failed, 0 incomplete**, in 120.9 seconds.
This includes 46 new regression tests across the five files below, as well
as the existing propagation, sensor, scheduling, export, and UI bridge tests.
`git diff --check` also passed.

The regression files below independently exercise the audit counterexamples:

```matlab
startupOrekitSuite();
names = ["testManeuverStateHistory", "testGeometryCorrectnessRegressions", ...
    "testVelocityPointingCorrectness", "testSchedulingMathematics", ...
    "testInterchangeMathCorrectness"];
for name = names
    assertSuccess(runtests(fullfile("src", "tests", name + ".m")));
end
```

The STK export tests now decode the external convention independently rather
than repeating the former inverse convention. Broader verification uses
`runtests(fullfile(pwd,"src","tests"))`. The standalone az/el planner is
unchanged and retains its documented sampling-dependent collision guarantees.
