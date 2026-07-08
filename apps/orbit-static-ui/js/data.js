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

    return scn;
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
    samplePosition: samplePosition,
    llaToEcef: llaToEcef,
    subsolarPoint: subsolarPoint,
    fmtUtc: fmtUtc,
    fmtHms: fmtHms,
    fmtDuration: fmtDuration,
    fmtDeg: fmtDeg,
  };
})();
