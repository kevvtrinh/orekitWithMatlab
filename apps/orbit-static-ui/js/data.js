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
      areaSensorAccesses: [],
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

    // Whole-area boundary projections in the sensor az/el frame. MATLAB
    // exports finite line segments, so the browser never has to reconstruct
    // WGS-84 horizon crossings or the moving sensor attitude.
    (raw.areaSensorAccesses || []).forEach(function (entry) {
      var projectionWindows = (entry.projectionWindows || []).map(function (window) {
        var startMs = Date.parse(window.startUtc);
        var stopMs = Date.parse(window.stopUtc);
        return {
          startSec: (startMs - scn.epochMs) / 1000,
          stopSec: (stopMs - scn.epochMs) / 1000,
          samples: (window.samples || []).map(function (sample) {
            return {
              tSec: num(sample.tOffsetSec, 0),
              boundarySegments: (sample.boundarySegments || []).map(function (segment) {
                return (segment || []).map(function (point) {
                  return [num(point[0], 0), num(point[1], 0)];
                });
              }),
              commandAzimuthDeg: num(sample.commandAzimuthDeg, null),
              commandElevationDeg: num(sample.commandElevationDeg, null),
              commandInsideFor: !!sample.commandInsideFor,
              status: sample.status || "",
            };
          }),
        };
      });
      scn.areaSensorAccesses.push({
        kind: "areaSensorAccess",
        platform: entry.platform || "",
        sensor: entry.sensor || "",
        target: entry.target || "",
        fieldOfRegardDeg: num(entry.fieldOfRegardDeg, 180),
        coneHalfAngleDeg: num(entry.coneHalfAngleDeg, 0),
        projectionWindows: projectionWindows,
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
      // Authoritative Orekit Sun samples (exportSunViz.m): ECI positions,
      // ECI/ECEF unit directions, and the geodetic subsolar track, all on
      // the scenario grid. Older payloads may only carry tOffsetSec+eciKm.
      ephemeris: parseSunEphemeris(raw.sun.ephemeris),
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

    // Orekit ITRF<->GCRF orientation (continuous/unwrapped prime-meridian
    // angle) so the ECI view spins the Earth exactly like the backend.
    scn.earthOrientation = raw.earthOrientation &&
      Array.isArray(raw.earthOrientation.tOffsetSec) &&
      Array.isArray(raw.earthOrientation.gmstRad) &&
      raw.earthOrientation.tOffsetSec.length > 0
      ? { t: raw.earthOrientation.tOffsetSec, gmstRad: raw.earthOrientation.gmstRad }
      : null;

    // Time-tagged sensor pointing history (exportPointingViz.m): the
    // backend's own slew/track/scan/return boresights, one series per
    // (platform, sensor).
    scn.pointing = (raw.pointing || []).map(function (p) {
      return {
        platform: p.platform || "",
        sensor: p.sensor || "",
        t: p.tOffsetSec || [],
        boresightEcef: p.boresightEcef || [],
        phase: p.phase || [],
        targetName: p.targetName || [],
        aimLatDeg: p.aimLatDeg || [],
        aimLonDeg: p.aimLonDeg || [],
      };
    }).filter(function (p) { return p.t.length > 0 && p.boresightEcef.length === p.t.length; });

    return scn;
  }

  function parseSunEphemeris(raw) {
    if (!raw || !Array.isArray(raw.tOffsetSec) || raw.tOffsetSec.length === 0) {
      return null;
    }
    var n = raw.tOffsetSec.length;
    function rows(field) {
      return Array.isArray(raw[field]) && raw[field].length === n ? raw[field] : null;
    }
    return {
      t: raw.tOffsetSec,
      eciKm: rows("eciKm"),
      eciUnit: rows("eciUnit"),
      ecefUnit: rows("ecefUnit"),
      subsolarLatDeg: rows("subsolarLatDeg"),
      subsolarLonDeg: rows("subsolarLonDeg"),
    };
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

  // Linear interpolation of the satellite's ECI position (km) at tSec, from
  // the payload's eciKm rows. Returns null when no ECI samples exist.
  function sampleEci(sat, tSec) {
    var t = sat.t, eci = sat.eci;
    if (!eci || eci.length === 0 || eci.length !== t.length) return null;
    var b = bracket(t, tSec);
    if (!b) return null;
    var a = eci[b.lo], c = eci[b.hi];
    return {
      x: a[0] + (c[0] - a[0]) * b.f,
      y: a[1] + (c[1] - a[1]) * b.f,
      z: a[2] + (c[2] - a[2]) * b.f,
    };
  }

  // ---- WGS84 geodetic conversions ---------------------------------------------
  //
  // The display sphere (llaToEcef/ecefToLla above, radius 6371 km) is only a
  // rendering surface. Physical geometry - sensor cone/Earth intersections,
  // boresight rays - uses the same WGS84 ellipsoid as the Orekit backend so
  // footprint latitudes/longitudes agree with MATLAB results.

  var WGS84_A_KM = 6378.137;
  var WGS84_F = 1 / 298.257223563;
  var WGS84_E2 = WGS84_F * (2 - WGS84_F);
  var WGS84_B_KM = WGS84_A_KM * (1 - WGS84_F);

  function llaToEcefWgs84(latDeg, lonDeg, altKm) {
    var lat = latDeg * DEG, lon = lonDeg * DEG;
    var sinLat = Math.sin(lat), cosLat = Math.cos(lat);
    var N = WGS84_A_KM / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
    var h = altKm || 0;
    return {
      x: (N + h) * cosLat * Math.cos(lon),
      y: (N + h) * cosLat * Math.sin(lon),
      z: (N * (1 - WGS84_E2) + h) * sinLat,
    };
  }

  // ECEF km -> geodetic (Bowring's closed form, same as js/preview.js).
  function ecefToLlaWgs84(x, y, z) {
    var p = Math.sqrt(x * x + y * y);
    var ePrime2 = (WGS84_A_KM * WGS84_A_KM - WGS84_B_KM * WGS84_B_KM) /
      (WGS84_B_KM * WGS84_B_KM);
    var theta = Math.atan2(z * WGS84_A_KM, p * WGS84_B_KM);
    var st = Math.sin(theta), ct = Math.cos(theta);
    var lat = Math.atan2(
      z + ePrime2 * WGS84_B_KM * st * st * st,
      p - WGS84_E2 * WGS84_A_KM * ct * ct * ct);
    var sinLat = Math.sin(lat);
    var N = WGS84_A_KM / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
    var alt = Math.abs(lat) < Math.PI / 4
      ? p / Math.cos(lat) - N
      : z / sinLat - N * (1 - WGS84_E2);
    return { latDeg: lat / DEG, lonDeg: Math.atan2(y, x) / DEG, altKm: alt };
  }

  // ---- sun geometry ---------------------------------------------------------
  //
  // Preferred source: the Orekit-computed samples in scn.sun.ephemeris
  // (ECI/ECEF unit vectors + geodetic subsolar track) and
  // scn.earthOrientation (true ITRF->GCRF prime-meridian angle), exported by
  // exportSunViz.m on the scenario grid. The analytic formulas below are the
  // DOCUMENTED FALLBACK ONLY, for offline sample mode and payloads predating
  // those fields; every scenario-aware helper (sunDirEcefAt, sunDirEciAt,
  // subsolarAt, gmstAt) prefers the backend samples and tags its output with
  // source: "matlab" | "analytic".

  function daysSinceJ2000(dateMs) {
    return dateMs / 86400000 - 10957.5;
  }

  // Greenwich Mean Sidereal Time (radians, [0, 2pi)) - IAU 1982-style linear
  // approximation, same formula as apps/orbit-ui/src/lib/time.js gmstRad.
  function gmstRad(dateMs) {
    var d = daysSinceJ2000(dateMs);
    var deg = (280.46061837 + 360.98564736629 * d) % 360;
    if (deg < 0) deg += 360;
    return deg * DEG;
  }

  // Approximate unit Sun direction in ECI (Astronomical Almanac low-precision
  // formula, ~0.01 deg) - fallback for payloads without sun samples.
  function sunDirectionEci(dateMs) {
    var n = daysSinceJ2000(dateMs);
    var L = (280.46 + 0.9856474 * n) * DEG;
    var g = (357.528 + 0.9856003 * n) * DEG;
    var lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
    var eps = (23.439 - 0.0000004 * n) * DEG;
    return [Math.cos(lambda), Math.cos(eps) * Math.sin(lambda),
      Math.sin(eps) * Math.sin(lambda)];
  }

  // Analytic subsolar point (deg) - fallback for the day/night terminator.
  function subsolarPoint(dateMs) {
    var s = sunDirectionEci(dateMs);
    var dec = Math.asin(Math.max(-1, Math.min(1, s[2])));
    var ra = Math.atan2(s[1], s[0]);
    var lon = (ra - gmstRad(dateMs)) / DEG;
    lon = ((lon % 360) + 540) % 360 - 180;
    return { latDeg: dec / DEG, lonDeg: lon };
  }

  // Analytic unit Sun direction in ECEF - fallback shared by the day/night
  // shading, sun glyphs, and SunPointing sensors when no backend samples
  // exist, so all fallback consumers still agree with each other.
  function sunDirEcef(dateMs) {
    var sp = subsolarPoint(dateMs);
    var lat = sp.latDeg * DEG, lon = sp.lonDeg * DEG;
    var c = Math.cos(lat);
    return { x: c * Math.cos(lon), y: c * Math.sin(lon), z: Math.sin(lat),
      latDeg: sp.latDeg, lonDeg: sp.lonDeg };
  }

  // ---- backend-sample interpolation ------------------------------------------

  // Index of the sample interval containing tSec: returns {lo, hi, f} with
  // endpoint clamping (no extrapolation), or null for empty/1-sample series.
  function bracket(t, tSec) {
    var n = t.length;
    if (n === 0) return null;
    if (n === 1) return { lo: 0, hi: 0, f: 0 };
    var lo = 0, hi = n - 1;
    if (tSec <= t[0]) hi = 1;
    else if (tSec >= t[n - 1]) lo = n - 2;
    else {
      while (hi - lo > 1) {
        var mid = (lo + hi) >> 1;
        if (t[mid] <= tSec) lo = mid; else hi = mid;
      }
    }
    var span = t[hi] - t[lo];
    var f = span > 0 ? (tSec - t[lo]) / span : 0;
    return { lo: lo, hi: hi, f: Math.max(0, Math.min(1, f)) };
  }

  // Interpolate a row-array of 3-vectors and renormalize to unit length.
  // Returns null when the series is missing or degenerate at that time.
  function interpUnitRow(t, rows, tSec) {
    if (!rows) return null;
    var b = bracket(t, tSec);
    if (!b) return null;
    var a = rows[b.lo], c = rows[b.hi];
    if (!a || !c) return null;
    var x = a[0] + (c[0] - a[0]) * b.f;
    var y = a[1] + (c[1] - a[1]) * b.f;
    var z = a[2] + (c[2] - a[2]) * b.f;
    var m = Math.sqrt(x * x + y * y + z * z);
    if (!(m > 1e-9)) return null;
    return { x: x / m, y: y / m, z: z / m };
  }

  function interpScalar(t, values, tSec) {
    var b = bracket(t, tSec);
    if (!b || !values) return null;
    return values[b.lo] + (values[b.hi] - values[b.lo]) * b.f;
  }

  // Wrap-aware longitude interpolation (degrees, short way around).
  function interpLonDeg(t, values, tSec) {
    var b = bracket(t, tSec);
    if (!b || !values) return null;
    var a = values[b.lo], c = values[b.hi];
    var d = c - a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    var lon = a + d * b.f;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    return lon;
  }

  // Unit Sun direction in ECEF at tSec: Orekit samples when the payload has
  // them, else the analytic fallback. Result carries .source for the UI.
  function sunDirEcefAt(scn, tSec) {
    var eph = scn && scn.sun && scn.sun.ephemeris;
    if (eph && eph.ecefUnit) {
      var v = interpUnitRow(eph.t, eph.ecefUnit, tSec);
      if (v) { v.source = "matlab"; return v; }
    }
    var fallback = sunDirEcef((scn ? scn.epochMs : 0) + tSec * 1000);
    fallback.source = "analytic";
    return fallback;
  }

  // Unit Sun direction in ECI (GCRF) at tSec, same preference order.
  function sunDirEciAt(scn, tSec) {
    var eph = scn && scn.sun && scn.sun.ephemeris;
    if (eph) {
      var v = interpUnitRow(eph.t, eph.eciUnit || eph.eciKm, tSec);
      if (v) { v.source = "matlab"; return v; }
    }
    var s = sunDirectionEci((scn ? scn.epochMs : 0) + tSec * 1000);
    return { x: s[0], y: s[1], z: s[2], source: "analytic" };
  }

  // Geodetic subsolar point at tSec (Orekit WGS84 when available).
  function subsolarAt(scn, tSec) {
    var eph = scn && scn.sun && scn.sun.ephemeris;
    if (eph && eph.subsolarLatDeg && eph.subsolarLonDeg) {
      var lat = interpScalar(eph.t, eph.subsolarLatDeg, tSec);
      var lon = interpLonDeg(eph.t, eph.subsolarLonDeg, tSec);
      if (lat != null && lon != null) {
        return { latDeg: lat, lonDeg: lon, source: "matlab" };
      }
    }
    var sp = subsolarPoint((scn ? scn.epochMs : 0) + tSec * 1000);
    sp.source = "analytic";
    return sp;
  }

  // Earth rotation angle (prime-meridian right ascension, radians) at tSec:
  // interpolated from the Orekit ITRF->GCRF samples when present (they are
  // exported unwrapped, so plain linear interpolation is safe), else GMST.
  function gmstAt(scn, tSec) {
    var eo = scn && scn.earthOrientation;
    if (eo) {
      var v = interpScalar(eo.t, eo.gmstRad, tSec);
      if (v != null) return v;
    }
    return gmstRad((scn ? scn.epochMs : 0) + tSec * 1000);
  }

  // ---- sensor pointing samples -------------------------------------------------

  // Backend pointing series for one platform (+ optional sensor name).
  function pointingSeries(scn, platformName, sensorName) {
    var series = null;
    ((scn && scn.pointing) || []).forEach(function (p) {
      if (p.platform !== platformName) return;
      if (sensorName && p.sensor && p.sensor !== sensorName) return;
      if (!series) series = p;
    });
    return series;
  }

  // Authoritative pointing state at tSec from the exported samples:
  // { dir: {x,y,z} unit ECEF, phase, targetName, aimLatDeg, aimLonDeg,
  //   source: "matlab" } or null when the payload has no series for this
  // platform (caller falls back to the client-side phase model).
  function pointingAt(scn, platformName, sensorName, tSec) {
    var series = pointingSeries(scn, platformName, sensorName);
    if (!series) return null;
    var dir = interpUnitRow(series.t, series.boresightEcef, tSec);
    if (!dir) return null;
    var b = bracket(series.t, tSec);
    // Phase boundaries carry exact samples, so the earlier sample's phase is
    // correct inside any interval; clamp to the nearer end outside the span.
    var idx = tSec >= series.t[series.t.length - 1] ? series.t.length - 1 : b.lo;
    var aimLat = null, aimLon = null;
    var la = series.aimLatDeg[b.lo], lc = series.aimLatDeg[b.hi];
    if (isFiniteNum(la) && isFiniteNum(lc)) {
      aimLat = la + (lc - la) * b.f;
      aimLon = interpLonDeg(series.t, series.aimLonDeg, tSec);
    } else if (isFiniteNum(la) || isFiniteNum(lc)) {
      var near = b.f < 0.5 ? b.lo : b.hi;
      if (isFiniteNum(series.aimLatDeg[near])) {
        aimLat = series.aimLatDeg[near];
        aimLon = series.aimLonDeg[near];
      }
    }
    return {
      dir: dir,
      phase: series.phase[idx] || "idle",
      targetName: series.targetName[idx] || "",
      aimLatDeg: aimLat,
      aimLonDeg: aimLon,
      source: "matlab",
    };
  }

  function isFiniteNum(v) {
    return typeof v === "number" && isFinite(v);
  }

  // ---- CSV export ------------------------------------------------------------

  function csvField(value) {
    var s = value == null ? "" : String(value);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  // One CSV table of a scenario's propagated ephemeris samples: satNames
  // (optional) restricts the rows to those satellites, else every satellite
  // that has samples. LightingState is blank when the payload carries no
  // sun/eclipse block (see Orbit.data.lightingStateAt).
  var EPHEMERIS_CSV_HEADER = ["Satellite", "TimeOffsetSec", "UtcTime",
    "LatitudeDeg", "LongitudeDeg", "AltitudeKm", "EciXKm", "EciYKm", "EciZKm",
    "LightingState"];

  function ephemerisCsv(scn, satNames) {
    var wanted = null;
    if (satNames && satNames.length > 0) {
      wanted = {};
      satNames.forEach(function (n) { wanted[n] = true; });
    }
    var lines = [EPHEMERIS_CSV_HEADER.join(",")];
    (scn && scn.sats || []).forEach(function (sat) {
      if (wanted && !wanted[sat.name]) return;
      var n = Math.min(sat.t.length, sat.lla.length);
      for (var i = 0; i < n; i++) {
        var lla = sat.lla[i] || [];
        var eci = sat.eci[i] || [];
        var lighting = lightingStateAt(scn, sat.name, sat.t[i]);
        lines.push([
          csvField(sat.name),
          sat.t[i],
          fmtUtc(scn.epochMs + sat.t[i] * 1000).replace(" ", "T") + "Z",
          lla[0], lla[1], lla[2],
          eci[0], eci[1], eci[2],
          lighting || "",
        ].join(","));
      }
    });
    return lines.join("\r\n") + "\r\n";
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
    sampleEci: sampleEci,
    sampleVelocityDirEcef: sampleVelocityDirEcef,
    llaToEcef: llaToEcef,
    ecefToLla: ecefToLla,
    llaToEcefWgs84: llaToEcefWgs84,
    ecefToLlaWgs84: ecefToLlaWgs84,
    // Analytic fallbacks (documented: offline sample mode / old payloads).
    gmstRad: gmstRad,
    sunDirectionEci: sunDirectionEci,
    subsolarPoint: subsolarPoint,
    sunDirEcef: sunDirEcef,
    // Backend-first scenario-aware accessors (preferred everywhere).
    sunDirEcefAt: sunDirEcefAt,
    sunDirEciAt: sunDirEciAt,
    subsolarAt: subsolarAt,
    gmstAt: gmstAt,
    pointingSeries: pointingSeries,
    pointingAt: pointingAt,
    lightingStateAt: lightingStateAt,
    groundDaylightAt: groundDaylightAt,
    ephemerisCsv: ephemerisCsv,
    fmtUtc: fmtUtc,
    fmtHms: fmtHms,
    fmtDuration: fmtDuration,
    fmtDeg: fmtDeg,
  };
})();
