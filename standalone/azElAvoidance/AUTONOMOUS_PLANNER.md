# Autonomous Corridor Planner

## Purpose

`planAzElAutonomousCorridor` solves static azimuth/elevation topology before
solving the steering dynamics. This avoids expanding a five-dimensional
position/rate/time lattice merely to discover that a route must wind around
a wall.

No route, guide path, or homotopy label is supplied by the caller.

## Algorithm stack

1. **Static-slice proof**

   Every packed polygon slice is compared with the first slice. The topology
   path is used only when geometry is identical over the complete maneuver
   interval.

2. **Inflated occupancy raster**

   One polygon raster is evaluated with `SafetyMargin_deg`. Wrapped azimuth
   grids divide exactly into the configured 360-degree interval.

3. **Any-angle A***

   `searchAzElAnyAngleAStar` expands an eight-connected grid while relaxing
   successors through the current node's parent whenever grid line of sight
   permits. Improved closed states are reopened.

4. **Optional homotopy-tube refinement**

   `refineAzElTopologyCorridor` constructs a finer grid only near the coarse
   route. Treating every cell outside the tube as occupied concentrates the
   search around the discovered corridor and avoids full-domain polygon
   queries. A wide or self-overlapping tube can still contain more than one
   route family.

5. **Sampled visibility shortcutting**

   `simplifyAzElRouteVisibility` removes waypoint stops only after densely
   sampling the replacement chord against the original packed polygons.

6. **Kinodynamic retiming**

   Every retained segment receives a synchronized rest-to-rest trapezoidal
   or triangular motion profile. Rate and acceleration limits are enforced
   per axis. Collision sampling automatically becomes finer than output
   sampling when the grid and maximum slew rate require it.

7. **Dense sampled validation or fallback**

   The final command is queried against the time-indexed workspace. Dynamic
   geometry, minimum-time objectives, and unsupported boundary states use
   the existing planner unless fallback is disabled.

## Spiral benchmark

The standalone five-turn-wall gauntlet uses no `GuidePath_deg` and disables
fallback.

| Mode | Angular route | Motion complete | Typical planner time |
|---|---:|---:|---:|
| Old hand-guided route | about 260 deg | about 180 s | under 1 s |
| Autonomous balanced, 0.5-deg grid | about 242 deg | 127 s | about 5 s |
| Autonomous refined, 0.25-deg tube | about 236 deg | about 146 s | about 8 s |

Runtime varies by machine and MATLAB session. Balanced mode is the default
because it minimizes computation and waypoint-stop overhead. Refinement is
available when angular path length is the stronger objective.

## Guarantees and limitations

- Every returned profile satisfies the configured sampled collision,
  position, rate, and acceleration checks.
- Static geometry is verified rather than assumed.
- The topology search is complete on its finite occupancy grid when its
  heuristic weight is one and resource limits are not reached.
- Theta-style parent relaxation and continuous shortcutting improve the
  route but do not claim continuous global optimality.
- Grid resolution and polygon safety inflation remain modeling choices.
- The current retimer stops at retained waypoints. A future continuous-path
  time-parameterization could reduce maneuver time further.
