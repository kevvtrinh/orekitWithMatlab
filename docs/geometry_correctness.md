# Geometry conventions and regression cases

The regression suite `src/tests/testGeometryCorrectnessRegressions.m` uses
prescribed ECEF positions and analytic counterexamples. It does not require
propagation, Sun data, or a Java runtime. Run it in MATLAB with:

```matlab
results = runtests("src/tests/testGeometryCorrectnessRegressions.m");
assert(all([results.Passed]));
```

Moving `TargetObject` positions now follow `Trajectory` through both `getPosition`
and `getECEF`, including callers such as sensor access and target pointing.
Cartesian trajectories are ECEF meters. Geodetic trajectories are WGS84 latitude
and longitude in degrees, and altitude in meters. The existing nearest-sample
policy is retained: motion between samples is not reconstructed, and requests
outside the history select its nearest endpoint. Only ECEF positions are supported.
`getLLA` converts Cartesian moving samples back to WGS84 through Orekit instead
of returning the object's original fixed location.

`VelocityVector` sensor pointing means velocity relative to rotating ITRF,
expressed in ECEF axes. The shared per-time implementation transforms the full
GCRF position/velocity state, including frame rotation, so changing an access
query's sampling grid does not change pointing at its shared timestamps. A
numerically zero Earth-relative velocity raises `SensorObject:UndefinedVelocityPointing`.
The native checks in `src/tests/testVelocityPointingCorrectness.m` compare against
both a prescribed Earth-fixed velocity and a finite difference of transformed
positions; they also test the moving Cartesian target's WGS84 conversion.

Sensor access between objects without a fixed ground endpoint uses a line-segment
intersection against the WGS84 ellipsoid. Touching the ellipsoid at a ground
endpoint is allowed; passing through its interior is blocked. This permits moving
surface targets at high latitude. Azimuth and elevation remain unavailable for
these pairs because a moving local frame is not part of the access contract.

Rectangular FOV angles retain the sign of their forward projection. Rearward
directions therefore cannot appear at the rectangle's center. Rectangular angular
half-widths must lie in `[0, 90)` degrees. The enclosing circular cone uses
`atan(hypot(tan(halfWidthX), tan(halfWidthY)))`, so its boundary includes the corners.

Coverage durations use a midpoint estimate for transitions between samples.
The first and last sample cells end at the scenario endpoints, and all cells use
actual timestamp differences. Continuous coverage or a continuous gap over 125
seconds therefore lasts exactly 125 seconds, even with a 60-second configured
step and a 5-second final interval. This remains a sampled estimate; unresolved
events between adjacent samples are not detected.

Sensor footprints use a spherical Earth of radius 6,378,137 meters. The boundary
consists of actual cone-circle arcs inside the apparent Earth disk and Earth-limb
arcs inside the cone. Their crossings are analytic; the arcs are sampled according
to `NumPoints`. A beam pointing away from Earth returns `zeros(0,3)` ECEF points
and empty latitude/longitude columns. Cones wider than 90 degrees may produce two
boundary rings, separated by NaN rows. A rectangular sensor's footprint remains
an enclosing-cone approximation, rather than an exact rectangular projection.
Footprint latitude is spherical/geocentric, not WGS84 geodetic latitude.

Area-target containment, centroid, area, and generated grids share one unwrapped
longitude polygon. Each edge uses the shortest longitude change, consistently
with area azimuth/elevation projection. A two-degree polygon crossing 180 degrees
is therefore a small dateline region, not a 358-degree region centered at zero.
The centroid is the planar area centroid and is unchanged by repeating the closing
vertex or subdividing a straight edge. Generated longitudes use `[-180,180)`.
Containment is planar in latitude/longitude, and reported square kilometers use
the existing local equirectangular approximation. Pole-enclosing and longitude-
winding polygons are explicitly unsupported.
