// Orbit.data - pure scenario/time math shared by the renderers and panels.
// Parses the payload written by exportScenarioJson.m (or the bundled sample)
// into a normalized shape and interpolates ephemerides. The editable spec
// side of the world lives in Orbit.spec (js/spec.js).
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var EARTH_RADIUS_KM = 6371.0;
  var DEG = Math.PI / 180;

  // Fallback palette when objects carry no color (indexes cycle).
  var SAT_COLORS = ["#e8a33d", "#4fb8d1", "#5fc98f", "#c77ddb", "#e0705c", "#7d92db"];
  var GROUND_COLORS = ["#4f6fd1", "#d1904f", "#4fd1a3", "#d14f8a"];

  function num(v, fallback) {
    return typeof v === "number" && isFinite(v) ? v : fallback;
  }

  // ---- payload -> normalized scenario -------------------------------------

  function parseScenario(raw) {
    var meta = raw.meta || {};
    var epochMs = Date.parse(meta.epochUtc || "");
    var scn = {
      raw: raw,
      name: meta.name || "Untitled Scenario",
      generator: meta.generator || "unknown",
      generatedAtUtc: meta.generatedAtUtc || null,
      epochMs: isFinite(epochMs) ? epochMs : Date.parse("2026-01-01T00:00:00Z"),
      durationSec: num(meta.durationSeconds, 7200),
      stepSec: num(meta.stepSeconds, 60),
      sats: [],
      grounds: [],
      accesses: [],
      sensorAccesses: [],
      schedule: [],
      // Distinguishes "the last run scheduled nothing" (schedule present but
      // empty) from "the payload predates tasking" (no schedule field).
      hasSchedule: raw.schedule !== undefined && raw.schedule !== null,
    };

    function parseWindows(list) {
      return (list || []).map(function (w) {
        var startMs = Date.parse(w.startUtc);
        var stopMs = Date.parse(w.stopUtc);
        return {
          startMs: startMs,
          stopMs: stopMs,
          startSec: (startMs - scn.epochMs) / 1000,
          stopSec: (stopMs - scn.epochMs) / 1000,
          durationSec: num(w.durationSeconds, (stopMs - startMs) / 1000),
          maxElevationDeg: num(w.maxElevationDeg, null),
          minRangeKm: num(w.minRangeKm, null),
        };
      });
    }

    (raw.satellites || []).forEach(function (sat, i) {
      var eph = sat.ephemeris || {};
      scn.sats.push({
        kind: "satellite",
        name: sat.name || "Sat-" + (i + 1),
        color: sat.color || SAT_COLORS[i % SAT_COLORS.length],
        propagatorType: sat.propagatorType || "",
        orbitDefinitionType: sat.orbitDefinitionType || "",
        elements: sat.elements || null,
        t: eph.tOffsetSec || [],
        lla: eph.llaDeg || [],   // rows: [latDeg, lonDeg, altKm]
        eci: eph.eciKm || [],
      });
    });

    (raw.groundPoints || []).forEach(function (gp, i) {
      scn.grounds.push({
        kind: gp.type === "Target" ? "target" : "groundStation",
        name: gp.name || "Ground-" + (i + 1),
        color: gp.color || GROUND_COLORS[i % GROUND_COLORS.length],
        latDeg: num(gp.latitudeDeg, 0),
        lonDeg: num(gp.longitudeDeg, 0),
        altM: num(gp.altitudeM, 0),
        minElevationDeg: num(gp.minElevationDeg, null),
        priority: num(gp.priority, null),
      });
    });

    (raw.accesses || []).forEach(function (acc) {
      scn.accesses.push({
        kind: "access",
        name: acc.source + " -> " + acc.target,
        source: acc.source,
        target: acc.target,
        totalDurationSec: num(acc.totalDurationSeconds, 0),
        windows: parseWindows(acc.windows),
      });
    });

    // Sensor FOR/FOV visibility per sensor/target pair (exportScheduleViz.m):
    // forWindows = the sensor could slew to see the target, fovWindows = the
    // target crossed the instantaneous beam.
    (raw.sensorAccesses || []).forEach(function (sa) {
      scn.sensorAccesses.push({
        kind: "sensorAccess",
        platform: sa.platform || "",
        sensor: sa.sensor || "",
        target: sa.target || "",
        forWindows: parseWindows(sa.forWindows),
        fovWindows: parseWindows(sa.fovWindows),
      });
    });

    // Scheduled sensor tasks (exportScheduleViz.m): dwell windows the MATLAB
    // scheduler assigned. The slew lead-in runs slewStartSec..startSec and
    // the return-home slew runs stopSec..returnEndSec (falling back to the
    // lead-in duration when the export has no explicit return slew).
    (raw.schedule || []).forEach(function (e) {
      var startMs = Date.parse(e.startUtc);
      var stopMs = Date.parse(e.stopUtc);
      var startSec = (startMs - scn.epochMs) / 1000;
      var stopSec = (stopMs - scn.epochMs) / 1000;
      var slewSec = Math.max(num(e.slewTimeSeconds, 0), 0);
      var returnSlewSec = Math.max(
        num(e.returnSlewTimeSeconds, num(e.slewTimeSeconds, 0)), 0);
      scn.schedule.push({
        kind: "scheduleEntry",
        taskId: e.taskId || "",
        taskName: e.taskName || e.taskId || "",
        taskType: e.taskType || "TrackPointTarget",
        sensor: e.sensorName || "",
        platform: e.platformName || "",
        target: e.targetName || "",
        startMs: startMs,
        stopMs: stopMs,
        startSec: startSec,
        stopSec: stopSec,
        durationSec: num(e.durationSeconds, (stopMs - startMs) / 1000),
        slewSec: slewSec,
        slewStartSec: startSec - slewSec,
        returnEndSec: stopSec + returnSlewSec,
        priority: num(e.priority, null),
        qualityScore: num(e.qualityScore, null),
      });
    });
    scn.schedule.sort(function (a, b) { return a.startSec - b.startSec; });

    // Sun/eclipse block (exportSunViz.m): per-satellite umbra/penumbra
    // windows and per-site daylight windows. Absent on payloads predating
    // Level 5 or when the scenario has no satellites/ground points yet.
    function parseTimeWindow(w) {
      var startMs = Date.parse(w.startUtc);
      var stopMs = Date.parse(w.stopUtc);
      return {
        type: w.type || null,
        startMs: startMs,
        stopMs: stopMs,
        startSec: (startMs - scn.epochMs) / 1000,
        stopSec: (stopMs - scn.epochMs) / 1000,
        durationSec: num(w.durationSeconds, (stopMs - startMs) / 1000),
      };
    }
    scn.sun = raw.sun ? {
      eclipses: (raw.sun.eclipses || []).map(function (e) {
        return {
          satellite: e.satellite || "",
          sunlitFractionPercent: num(e.sunlitFractionPercent, null),
          windows: (e.windows || []).map(parseTimeWindow),
        };
      }),
      groundLighting: (raw.sun.groundLighting || []).map(function (g) {
        return {
          name: g.name || "",
          daylightWindows: (g.daylightWindows || []).map(parseTimeWindow),
        };
      }),
    } : null;

    return scn;
  }

  // Satellite lighting state at tSec: "Umbra" | "Penumbra" | "Sunlit", or
  // null when the payload carries no eclipse data for that satellite (older
  // payload, or the satellite has not been propagated yet).
  function lightingStateAt(scn, satelliteName, tSec) {
    var sun = scn && scn.sun;
    if (!sun) return null;
    var entry = null;
    sun.eclipses.forEach(function (e) { if (e.satellite === satelliteName) entry = e; });
    if (!entry) return null;
    var state = "Sunlit";
    entry.windows.forEach(function (w) {
      if (tSec >= w.startSec && tSec <= w.stopSec) {
        if (w.type === "Umbra") state = "Umbra";
        else if (state !== "Umbra") state = "Penumbra";
      }
    });
    return state;
  }

  // Ground-site daylight at tSec: true/false, or null when there is no
  // lighting data for that site.
  function groundDaylightAt(scn, siteName, tSec) {
    var sun = scn && scn.sun;
    if (!sun) return null;
    var entry = null;
    sun.groundLighting.forEach(function (g) { if (g.name === siteName) entry = g; });
    if (!entry) return null;
    return entry.daylightWindows.some(function (w) {
      return tSec >= w.startSec && tSec <= w.stopSec;
    });
  }

  // ---- sensor schedule -------------------------------------------------------

  function scheduleForPlatform(schedule, platformName) {
    return (schedule || []).filter(function (e) {
      return e.platform === platformName;
    });
  }

  // Schedule entries touching an object, as performer or as target.
  function scheduleForObject(schedule, name) {
    return (schedule || []).filter(function (e) {
      return e.platform === name || e.target === name;
    });
  }

  // Pointing state of one platform's sensor at tSec, given that platform's
  // schedule entries (sorted by startSec). Port of apps/orbit-ui
  // lib/schedule.js pointingStateAt:
  //   idle   - home (nadir) pointing, no task in progress
  //   slew   - slewing toward entry's target; progress in [0, 1]
  //   track  - boresight locked on entry's target
  //   return - slewing back to the home boresight; progress in [0, 1]
  // fromTarget is the pointing the phase starts from (a target name, or null
  // for home): a lead-in that begins during the previous entry's return slew
  // starts from that entry's target, keeping the transition continuous.
  function pointingStateAt(entries, tSec) {
    var prev = null;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (tSec > entry.stopSec) {
        prev = entry;
        continue;
      }
      if (tSec >= entry.startSec) {
        return { phase: "track", entry: entry, fromTarget: null, progress: 1 };
      }
      if (tSec >= entry.slewStartSec) {
        var span = entry.startSec - entry.slewStartSec;
        var fromPrev = prev && entry.slewStartSec <= prev.returnEndSec;
        return {
          phase: "slew",
          entry: entry,
          fromTarget: fromPrev ? prev.target : null,
          progress: span > 0 ? (tSec - entry.slewStartSec) / span : 1,
        };
      }
      break;
    }
    if (prev && tSec <= prev.returnEndSec) {
      var returnSpan = prev.returnEndSec - prev.stopSec;
      return {
        phase: "return",
        entry: prev,
        fromTarget: prev.target,
        progress: returnSpan > 0 ? (tSec - prev.stopSec) / returnSpan : 1,
      };
    }
    return { phase: "idle", entry: null, fromTarget: null, progress: 0 };
  }

  // ---- ephemeris sampling --------------------------------------------------

  // Linear interpolation over the tOffsetSec grid; longitude takes the short
  // way around the dateline. Returns null when the satellite has no samples.
  function samplePosition(sat, tSec) {
    var t = sat.t, lla = sat.lla;
    var n = t.length;
    if (n === 0 || lla.length !== n) return null;
    if (tSec <= t[0]) return rowToLla(lla[0]);
    if (tSec >= t[n - 1]) return rowToLla(lla[n - 1]);

    var lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (t[mid] <= tSec) lo = mid; else hi = mid;
    }
    var f = (tSec - t[lo]) / (t[hi] - t[lo]);
    var a = lla[lo], b = lla[hi];
    var dLon = b[1] - a[1];
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    var lon = a[1] + f * dLon;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    return {
      latDeg: a[0] + f * (b[0] - a[0]),
      lonDeg: lon,
      altKm: a[2] + f * (b[2] - a[2]),
    };
  }

  function rowToLla(row) {
    return { latDeg: row[0], lonDeg: row[1], altKm: row[2] };
  }

  // Geodetic -> Earth-fixed cartesian on a spherical Earth (display only).
  function llaToEcef(latDeg, lonDeg, altKm) {
    var r = EARTH_RADIUS_KM + (altKm || 0);
    var lat = latDeg * DEG, lon = lonDeg * DEG;
    var c = Math.cos(lat);
    return {
      x: r * c * Math.cos(lon),
      y: r * c * Math.sin(lon),
      z: r * Math.sin(lat),
    };
  }

  // Inverse of llaToEcef on the same spherical Earth: cartesian -> lat/lon
  // (altitude is not recovered; callers that need it already have it).
  function ecefToLla(x, y, z) {
    var r = Math.sqrt(x * x + y * y + z * z) || 1;
    var s = z / r;
    if (s > 1) s = 1; else if (s < -1) s = -1;
    return { latDeg: Math.asin(s) / DEG, lonDeg: Math.atan2(y, x) / DEG };
  }

  // Earth-fixed velocity direction (unit vector, ECEF) at tSec, from a
  // central difference of the sampled ephemeris a second apart either side.
  // Approximate (ground-track direction in the rotating frame, not the true
  // inertial velocity) but adequate for orienting a VelocityVector sensor.
  // Returns null when the satellite has no samples spanning tSec.
  function sampleVelocityDirEcef(sat, tSec, dtSec) {
    var dt = dtSec || 1;
    var a = samplePosition(sat, tSec - dt);
    var b = samplePosition(sat, tSec + dt);
    if (!a || !b) return null;
    var pa = llaToEcef(a.latDeg, a.lonDeg, a.altKm);
    var pb = llaToEcef(b.latDeg, b.lonDeg, b.altKm);
    var dx = pb.x - pa.x, dy = pb.y - pa.y, dz = pb.z - pa.z;
    var m = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return m > 1e-9 ? { x: dx / m, y: dy / m, z: dz / m } : null;
  }

  // ---- sun geometry ---------------------------------------------------------

  // Subsolar point (deg) from a low-precision solar ephemeris (NOAA-style,
  // good to ~0.3 deg) - drives the day/night terminator shading.
  function subsolarPoint(dateMs) {
    var d = (dateMs / 86400000) - 10957.5; // days since J2000.0
    var g = (357.529 + 0.98560028 * d) * DEG;             // mean anomaly
    var q = 280.459 + 0.98564736 * d;                     // mean longitude
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
    var e = (23.439 - 0.00000036 * d) * DEG;              // obliquity
    var dec = Math.asin(Math.sin(e) * Math.sin(L));
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
    // Greenwich mean sidereal time, degrees.
    var gmst = (280.46061837 + 360.98564736629 * d) % 360;
    if (gmst < 0) gmst += 360;
    var lon = ra / DEG - gmst;
    lon = ((lon % 360) + 540) % 360 - 180;
    return { latDeg: dec / DEG, lonDeg: lon };
  }

  // Unit Sun direction in the Earth-fixed (ECEF) display frame at dateMs,
  // shared by the day/night shading, the 3D sun glyph, and SunPointing
  // sensors so they all agree on where the sun is.
  function sunDirEcef(dateMs) {
    var sp = subsolarPoint(dateMs);
    var v = llaToEcef(sp.latDeg, sp.lonDeg, 0);
    var r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
    return { x: v.x / r, y: v.y / r, z: v.z / r, latDeg: sp.latDeg, lonDeg: sp.lonDeg };
  }

  // ---- formatting ------------------------------------------------------------

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function fmtUtc(ms) {
    var d = new Date(ms);
    if (isNaN(d.getTime())) return "--";
    return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" +
      pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours()) + ":" +
      pad2(d.getUTCMinutes()) + ":" + pad2(d.getUTCSeconds());
  }

  function fmtHms(totalSec) {
    var s = Math.max(0, Math.round(totalSec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s % 60);
  }

  function fmtDuration(totalSec) {
    var s = Math.max(0, Math.round(totalSec));
    if (s < 90) return s + " s";
    if (s < 5400) return Math.round(s / 6) / 10 + " min";
    return Math.round(s / 360) / 10 + " h";
  }

  function fmtDeg(v, digits) {
    return v == null ? "--" : v.toFixed(digits == null ? 2 : digits) + " deg";
  }

  Orbit.data = {
    EARTH_RADIUS_KM: EARTH_RADIUS_KM,
    parseScenario: parseScenario,
    scheduleForPlatform: scheduleForPlatform,
    scheduleForObject: scheduleForObject,
    pointingStateAt: pointingStateAt,
    samplePosition: samplePosition,
    sampleVelocityDirEcef: sampleVelocityDirEcef,
    llaToEcef: llaToEcef,
    ecefToLla: ecefToLla,
    subsolarPoint: subsolarPoint,
    sunDirEcef: sunDirEcef,
    lightingStateAt: lightingStateAt,
    groundDaylightAt: groundDaylightAt,
    fmtUtc: fmtUtc,
    fmtHms: fmtHms,
    fmtDuration: fmtDuration,
    fmtDeg: fmtDeg,
  };
})();
