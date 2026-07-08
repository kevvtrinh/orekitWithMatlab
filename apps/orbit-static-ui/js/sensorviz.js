// Orbit.sensorviz - pure ECEF geometry for sensor boresight pointing and FOV/
// FOR footprints, shared by the 2D map and 3D globe so both views agree on
// where a sensor is looking and what it can see. Mirrors the intent of
// apps/orbit-ui/src/three/sensorGeometry.js and its pointing math in
// three/viewer.js, adapted to plain vector math (no three.js) and to a
// canvas that also needs ground-projected footprints, not just 3D volumes.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;

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
  function lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
  }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // Nearest positive-distance intersection of a ray (origin + t*dir, t > 0)
  // with a sphere of the given radius centered at the world origin. NaN when
  // the ray starts inside-out, is degenerate, or points away from the sphere.
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

  // Boresight direction (unit ECEF) at tSec: home pointing when idle or when
  // there is no fresh schedule for this platform, otherwise interpolated
  // through the active slew/track/return phase toward/away from the
  // scheduled entry's target - the same phases Orbit.data.pointingStateAt
  // reports for the timeline and inspector.
  function boresightAt(opts) {
    var sat = opts.sat, sensor = opts.sensor, scn = opts.scn, tSec = opts.tSec;
    var satPosEcef = opts.satPosEcef, entries = opts.entries || [];
    var sunDir = Orbit.data.sunDirEcef(scn.epochMs + tSec * 1000);
    var velDir = Orbit.data.sampleVelocityDirEcef(sat, tSec, 1);
    var fixedVec = Array.isArray(sensor.boresight)
      ? { x: sensor.boresight[0], y: sensor.boresight[1], z: sensor.boresight[2] }
      : null;
    var home = homeBoresight(sensor.pointing || "Nadir", satPosEcef, velDir, sunDir, fixedVec);
    var pointing = Orbit.data.pointingStateAt(entries, tSec);

    function targetDir(name) {
      var gp = findGroundPoint(scn, name, opts.spec);
      if (!gp) return null;
      var tp = Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, (gp.altM || 0) / 1000);
      return unit(sub(tp, satPosEcef));
    }

    var dir = home;
    if (pointing.phase === "track") {
      dir = targetDir(pointing.entry.target) || home;
    } else if (pointing.phase === "slew") {
      var to = targetDir(pointing.entry.target) || home;
      var from = pointing.fromTarget ? (targetDir(pointing.fromTarget) || home) : home;
      dir = unit(lerp(from, to, clamp01(pointing.progress)));
    } else if (pointing.phase === "return") {
      var back = targetDir(pointing.entry.target) || home;
      dir = unit(lerp(back, home, clamp01(pointing.progress)));
    }
    return { dir: dir, home: home, pointing: pointing };
  }

  // Ground footprint of a cone (half-angle around dir, apex at satPosEcef)
  // against a sphere of earthRadiusKm: one ECEF point per azimuth sample, or
  // null at that azimuth when the ray misses the sphere entirely (the cone
  // straddles the horizon or points off-planet). Returns null outright when
  // every sample misses (nothing to draw).
  function footprintRing(satPosEcef, dir, halfAngleDeg, earthRadiusKm, segments) {
    var n = segments || 40;
    var half = Math.min(Math.max(halfAngleDeg, 0.05), 89.5) * DEG;
    var basis = perpBasis(dir);
    var ring = new Array(n);
    var anyHit = false;
    for (var i = 0; i < n; i++) {
      var az = (i / n) * 2 * Math.PI;
      var ray = coneRay(dir, basis, half, az);
      var d = raySphere(satPosEcef, ray, earthRadiusKm);
      if (isFinite(d)) {
        ring[i] = add(satPosEcef, scale(ray, d));
        anyHit = true;
      } else {
        ring[i] = null;
      }
    }
    return anyHit ? ring : null;
  }

  Orbit.sensorviz = {
    raySphere: raySphere,
    homeBoresight: homeBoresight,
    findGroundPoint: findGroundPoint,
    boresightAt: boresightAt,
    footprintRing: footprintRing,
  };
})();
