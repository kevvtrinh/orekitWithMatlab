// Orbit.sensorviz - sensor pointing and FOV/FOR footprint geometry shared by
// the 2D map and 3D globe so both views agree on where a sensor is looking
// and what it can see.
//
// Frames and shapes:
//   * All physical geometry runs in ECEF kilometers against the same WGS84
//     ellipsoid the Orekit backend uses (Orbit.data.llaToEcefWgs84), via a
//     scaled space in which the ellipsoid is the unit sphere - so ray hits,
//     horizon tangency, and footprint latitudes match MATLAB results.
//   * The boresight itself prefers the backend's exported time-tagged
//     pointing samples (exportPointingViz.m -> Orbit.data.pointingAt): the
//     authoritative slew/track/area-scan/return history. The client-side
//     phase model (Orbit.data.pointingStateAt + home pointing modes) is the
//     fallback for stale schedules and preview satellites.
//   * The FOV is the instantaneous cone around the CURRENT boresight. The
//     FOR is the region reachable within the gimbal limit around the HOME
//     (nominal) boresight - it does not swing around with an active slew.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var WGS84_A_KM = 6378.137;
  var WGS84_B_KM = 6378.137 * (1 - 1 / 298.257223563);
  // Draw the horizon-clamped rim a hair inside true tangency so the ray
  // still intersects after floating-point noise.
  var HORIZON_EPS_RAD = 2e-4;

  function unit(v) {
    var m = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (!(m > 1e-12)) return { x: 0, y: 0, z: 1 };
    return { x: v.x / m, y: v.y / m, z: v.z / m };
  }
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
  function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
  function scale(a, s) { return { x: a.x * s, y: a.y * s, z: a.z * s }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Spherical interpolation between unit vectors (constant angular rate,
  // matching the backend's slew blending in exportPointingViz.m).
  function slerpUnit(a, b, t) {
    var d = Math.max(-1, Math.min(1, dot(a, b)));
    var angle = Math.acos(d);
    var s = Math.sin(angle);
    if (s < 1e-9) {
      return unit({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      });
    }
    var ka = Math.sin((1 - t) * angle) / s;
    var kb = Math.sin(t * angle) / s;
    return unit({
      x: ka * a.x + kb * b.x,
      y: ka * a.y + kb * b.y,
      z: ka * a.z + kb * b.z,
    });
  }

  // Nearest positive-distance intersection of a ray (origin + t*dir, t > 0)
  // with a sphere of the given radius centered at the world origin. NaN when
  // the ray misses or points away.
  function raySphere(origin, dir, radius) {
    var a = dot(dir, dir);
    if (!(a > 0)) return NaN;
    var b = dot(origin, dir);
    var c = dot(origin, origin) - radius * radius;
    var disc = b * b - a * c;
    if (disc < 0) return NaN;
    var root = Math.sqrt(disc);
    var near = (-b - root) / a;
    if (near > 1e-6) return near;
    var far = (-b + root) / a;
    return far > 1e-6 ? far : NaN;
  }

  // ---- WGS84 scaled space -------------------------------------------------------
  // In coordinates scaled by (1/a, 1/a, 1/b) the ellipsoid is the unit
  // sphere: intersections and horizon tangency computed there are exact for
  // the ellipsoid after mapping back.

  function toScaled(v) {
    return { x: v.x / WGS84_A_KM, y: v.y / WGS84_A_KM, z: v.z / WGS84_B_KM };
  }
  function fromScaled(v) {
    return { x: v.x * WGS84_A_KM, y: v.y * WGS84_A_KM, z: v.z * WGS84_B_KM };
  }

  // Ray/WGS84-ellipsoid intersection: origin (ECEF km) + t*dir. Returns the
  // ECEF km surface point, or null when the ray misses.
  function rayEllipsoid(originKm, dir) {
    var o = toScaled(originKm);
    var d = toScaled(dir); // direction scales the same way (affine map)
    var t = raySphere(o, d, 1);
    if (!isFinite(t)) return null;
    return fromScaled(add(o, scale(d, t)));
  }

  // ---- pointing --------------------------------------------------------------

  // Nominal (home) boresight direction for a sensor's pointing mode, with no
  // scheduled task in progress. Falls back to nadir when a mode-specific
  // input (velocity/sun direction, fixed vector) is unavailable.
  function homeBoresight(pointingMode, satPosEcef, velDirEcef, sunDirEcef, fixedVectorEcef) {
    var nadir = unit(scale(satPosEcef, -1));
    switch (pointingMode) {
      case "VelocityVector": return velDirEcef ? unit(velDirEcef) : nadir;
      case "SunPointing": return sunDirEcef ? unit(sunDirEcef) : nadir;
      case "FixedVector": return fixedVectorEcef ? unit(fixedVectorEcef) : nadir;
      case "Nadir":
      default: return nadir;
    }
  }

  // A ground point (from scn.grounds) or the centroid of an area group's
  // members, by name - either can be a schedule entry's target.
  function findGroundPoint(scn, name, spec) {
    if (!scn) return null;
    var hit = null;
    scn.grounds.forEach(function (g) { if (g.name === name) hit = g; });
    if (hit) return hit;
    var area = Orbit.spec.areaGroup(spec, name);
    if (area && area.points.length > 0) {
      var areaLat = 0, areaCx = 0, areaCy = 0, areaAlt = 0;
      area.points.forEach(function (p) {
        areaLat += p.latitudeDeg;
        areaCx += Math.cos(p.longitudeDeg * DEG);
        areaCy += Math.sin(p.longitudeDeg * DEG);
        areaAlt += p.altitudeM || 0;
      });
      return {
        latDeg: areaLat / area.points.length,
        lonDeg: Math.atan2(areaCy, areaCx) / DEG,
        altM: areaAlt / area.points.length,
      };
    }
    var members = scn.grounds.filter(function (g) { return g.group === name; });
    if (members.length === 0) return null;
    var lat = 0, cx = 0, cy = 0;
    members.forEach(function (p) {
      lat += p.latDeg;
      cx += Math.cos(p.lonDeg * DEG);
      cy += Math.sin(p.lonDeg * DEG);
    });
    return {
      latDeg: lat / members.length,
      lonDeg: Math.atan2(cy, cx) / DEG,
      altM: 0,
    };
  }

  // Boresight direction (unit ECEF) at tSec.
  //
  // Preference order:
  //   1. The backend's exported pointing samples (Orbit.data.pointingAt) -
  //      already stale-gated by Orbit.merge, and the only source that knows
  //      the real area-scan sweep.
  //   2. Client-side phase model over the prepared schedule entries (slew /
  //      track / return via spherical interpolation), aimed with the same
  //      target resolution the backend uses at window boundaries.
  //   3. The sensor's home pointing mode.
  //
  // Returns { dir, home, pointing: {phase, entry, progress}, aim, source }.
  function boresightAt(opts) {
    var sat = opts.sat, sensor = opts.sensor, scn = opts.scn, tSec = opts.tSec;
    var satPosEcef = opts.satPosEcef, entries = opts.entries || [];
    var sunDir = Orbit.data.sunDirEcefAt(scn, tSec);
    var velDir = Orbit.data.sampleVelocityDirEcef(sat, tSec, 1);
    var fixedVec = Array.isArray(sensor.boresight)
      ? { x: sensor.boresight[0], y: sensor.boresight[1], z: sensor.boresight[2] }
      : null;
    var home = homeBoresight(sensor.pointing || "Nadir", satPosEcef, velDir, sunDir, fixedVec);

    // 1. Authoritative backend samples.
    var sampled = Orbit.data.pointingAt(scn, sat.name, sensor.name || null, tSec);
    if (sampled) {
      return {
        dir: sampled.dir,
        home: home,
        pointing: {
          phase: sampled.phase,
          entry: activeEntry(entries, tSec),
          fromTarget: null,
          progress: 1,
          targetName: sampled.targetName,
        },
        aimLatDeg: sampled.aimLatDeg,
        aimLonDeg: sampled.aimLonDeg,
        source: "matlab",
      };
    }

    // 2./3. Client-side phase model over home pointing.
    var pointing = Orbit.data.pointingStateAt(entries, tSec);
    pointing.targetName = pointing.entry ? pointing.entry.target : "";

    function targetDir(name) {
      var gp = findGroundPoint(scn, name, opts.spec);
      if (!gp) return null;
      var tp = Orbit.data.llaToEcefWgs84(gp.latDeg, gp.lonDeg, (gp.altM || 0) / 1000);
      return unit(sub(tp, satPosEcef));
    }

    var dir = home;
    var aim = null;
    if (pointing.phase === "track") {
      var tracked = targetDir(pointing.entry.target);
      if (tracked) {
        dir = tracked;
        aim = findGroundPoint(scn, pointing.entry.target, opts.spec);
      }
    } else if (pointing.phase === "slew") {
      var to = targetDir(pointing.entry.target) || home;
      var from = pointing.fromTarget ? (targetDir(pointing.fromTarget) || home) : home;
      dir = slerpUnit(from, to, clamp01(pointing.progress));
    } else if (pointing.phase === "return") {
      var back = targetDir(pointing.entry.target) || home;
      dir = slerpUnit(back, home, clamp01(pointing.progress));
    }
    return {
      dir: dir,
      home: home,
      pointing: pointing,
      aimLatDeg: aim ? aim.latDeg : null,
      aimLonDeg: aim ? aim.lonDeg : null,
      source: "client",
    };
  }

  function activeEntry(entries, tSec) {
    for (var i = 0; i < entries.length; i++) {
      if (tSec >= entries[i].slewStartSec && tSec <= entries[i].returnEndSec) {
        return entries[i];
      }
    }
    return null;
  }

  // ---- footprints ----------------------------------------------------------------

  // Two unit vectors perpendicular to dir (and to each other), spanning the
  // plane a cone around dir is swept in.
  function perpBasis(dir) {
    var ref = Math.abs(dir.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    var u = unit(cross(ref, dir));
    var v = cross(dir, u);
    return { u: u, v: v };
  }

  // Direction of one ray on the surface of a cone of half-angle around dir,
  // at azimuth (radians) around the boresight.
  function coneRay(dir, basis, halfAngleRad, azimuthRad) {
    var ct = Math.cos(halfAngleRad), st = Math.sin(halfAngleRad);
    var cu = Math.cos(azimuthRad) * st, cv = Math.sin(azimuthRad) * st;
    return unit({
      x: dir.x * ct + basis.u.x * cu + basis.v.x * cv,
      y: dir.y * ct + basis.u.y * cu + basis.v.y * cv,
      z: dir.z * ct + basis.u.z * cu + basis.v.z * cv,
    });
  }

  // Ground footprint of a cone (half-angle around dir, apex at satPosEcef km)
  // against the WGS84 ellipsoid, cleanly clipped at the horizon:
  //
  //   * Rays that hit the ellipsoid contribute their true surface point.
  //   * Rays that would miss are clamped - in the scaled space where the
  //     ellipsoid is the unit sphere - to the horizon tangent direction in
  //     the same plane, so the boundary follows the visible limb instead of
  //     leaving gaps, inverted lobes, or NaNs.
  //
  // Returns { points: [{x,y,z} km...], clamped: [bool...], anyClamped, allClamped }
  // (a closed ring; index i pairs with clamped[i]), or null when the whole
  // cone misses the Earth (nothing to draw).
  function footprintRing(satPosEcef, dir, halfAngleDeg, segments) {
    var n = segments || 48;
    var half = Math.min(Math.max(halfAngleDeg, 0.05), 179.9) * DEG;

    // Scaled space: ellipsoid -> unit sphere.
    var o = toScaled(satPosEcef);
    var r = Math.sqrt(dot(o, o));
    if (!(r > 1.0005)) return null; // at/inside the surface: nothing sensible
    var nadir = unit(scale(o, -1));
    var horizon = Math.asin(Math.min(1 / r, 1)) - HORIZON_EPS_RAD;
    var d = unit(toScaled(dir));
    var offNadir = Math.acos(Math.max(-1, Math.min(1, dot(d, nadir))));

    // Entire cone beyond the limb: nothing visible.
    if (offNadir - half > Math.asin(Math.min(1 / r, 1))) return null;

    var basis = perpBasis(d);
    var points = new Array(n);
    var clampedFlags = new Array(n);
    var anyClamped = false;
    var allClamped = true;
    for (var i = 0; i < n; i++) {
      var az = (i / n) * 2 * Math.PI;
      var ray = coneRay(d, basis, half, az);
      var clamped = false;
      var t = raySphere(o, ray, 1);
      if (!isFinite(t)) {
        // Rotate the ray toward nadir (in their common plane) until it sits
        // exactly on the horizon cone, then intersect - the limb point in
        // this azimuthal plane.
        ray = clampToHorizon(ray, nadir, horizon);
        t = raySphere(o, ray, 1);
        clamped = true;
        if (!isFinite(t)) { points[i] = null; clampedFlags[i] = true; continue; }
      }
      points[i] = fromScaled(add(o, scale(ray, t)));
      clampedFlags[i] = clamped;
      anyClamped = anyClamped || clamped;
      allClamped = allClamped && clamped;
    }
    // Degenerate numeric failures only; treat as a miss.
    if (points.some(function (p) { return !p; })) return null;
    return { points: points, clamped: clampedFlags,
      anyClamped: anyClamped, allClamped: allClamped };
  }

  // Rotate ray toward nadir (within their common plane) so its angle from
  // nadir equals horizonRad. Inputs/outputs are unit vectors in scaled space.
  function clampToHorizon(ray, nadir, horizonRad) {
    var c = dot(ray, nadir);
    var axis = sub(ray, scale(nadir, c));
    var m = Math.sqrt(dot(axis, axis));
    if (m < 1e-12) return nadir; // ray parallel to nadir: any azimuth works
    axis = scale(axis, 1 / m);
    return unit(add(scale(nadir, Math.cos(horizonRad)),
      scale(axis, Math.sin(horizonRad))));
  }

  // Boresight ground intersection (ECEF km on the WGS84 ellipsoid), or null
  // when the boresight misses Earth - used to clip target/boresight lines at
  // the surface instead of drawing them through the planet.
  function boresightGroundPoint(satPosEcef, dir) {
    return rayEllipsoid(satPosEcef, dir);
  }

  // True when no part of the cone can see the Earth from this position.
  function coneMissesEarth(satPosEcef, dir, halfAngleDeg) {
    var o = toScaled(satPosEcef);
    var r = Math.sqrt(dot(o, o));
    if (!(r > 1)) return false;
    var nadir = unit(scale(o, -1));
    var d = unit(toScaled(dir));
    var offNadir = Math.acos(Math.max(-1, Math.min(1, dot(d, nadir))));
    return offNadir - halfAngleDeg * DEG > Math.asin(Math.min(1 / r, 1));
  }

  Orbit.sensorviz = {
    raySphere: raySphere,
    rayEllipsoid: rayEllipsoid,
    slerpUnit: slerpUnit,
    homeBoresight: homeBoresight,
    findGroundPoint: findGroundPoint,
    boresightAt: boresightAt,
    footprintRing: footprintRing,
    boresightGroundPoint: boresightGroundPoint,
    coneMissesEarth: coneMissesEarth,
  };
})();
