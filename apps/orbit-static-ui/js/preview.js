// Orbit.preview - client-side two-body Keplerian preview propagation.
//
// When the user edits the spec, the console shows an instant preview orbit so
// the scenario reacts immediately. MATLAB/Orekit remains authoritative: once
// a bridge run completes, its ephemeris replaces the preview (the difference
// is J2+/drag/etc. for non-two-body propagators). TLE satellites are never
// previewed; they wait for the MATLAB run (SGP4 lives on the backend).
// Port of apps/orbit-ui/src/lib/preview.js to the static console's classic
// script + row-array conventions.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var MU_KM3_S2 = 398600.4418;
  var DEG = Math.PI / 180;

  // WGS84 ellipsoid, matching the Orekit backend's geodetic output closely
  // enough for display purposes.
  var WGS84_A_KM = 6378.137;
  var WGS84_F = 1 / 298.257223563;
  var WGS84_E2 = WGS84_F * (2 - WGS84_F);

  function solveKepler(meanAnomaly, e) {
    // Newton iteration; e < 1 guaranteed by spec validation.
    var E = e < 0.8 ? meanAnomaly : Math.PI;
    for (var i = 0; i < 12; i++) {
      var f = E - e * Math.sin(E) - meanAnomaly;
      var fp = 1 - e * Math.cos(E);
      var dE = f / fp;
      E -= dE;
      if (Math.abs(dE) < 1e-12) break;
    }
    return E;
  }

  // ECEF (km) -> geodetic lat/lon/alt (deg/deg/km), Bowring's closed form.
  function ecefToGeodetic(x, y, z, out) {
    var p = Math.sqrt(x * x + y * y);
    var b = WGS84_A_KM * (1 - WGS84_F);
    var ePrime2 = (WGS84_A_KM * WGS84_A_KM - b * b) / (b * b);
    var theta = Math.atan2(z * WGS84_A_KM, p * b);
    var st = Math.sin(theta);
    var ct = Math.cos(theta);
    var lat = Math.atan2(
      z + ePrime2 * b * st * st * st,
      p - WGS84_E2 * WGS84_A_KM * ct * ct * ct);
    var sinLat = Math.sin(lat);
    var N = WGS84_A_KM / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
    var alt = Math.abs(lat) < Math.PI / 4
      ? p / Math.cos(lat) - N
      : z / sinLat - N * (1 - WGS84_E2);
    out[0] = lat / DEG;
    out[1] = Math.atan2(y, x) / DEG;
    out[2] = alt;
    return out;
  }

  // Preview ephemeris for a Keplerian satellite spec object, in the same
  // row-array shape Orbit.data.parseScenario gives payload satellites:
  // { t: [sec], eci: [[xKm,yKm,zKm]], lla: [[latDeg,lonDeg,altKm]] }.
  // Returns null for TLE satellites or unusable elements.
  function previewEphemeris(specSat, meta) {
    if (!specSat || !specSat.orbit || specSat.orbit.type !== "keplerian") {
      return null;
    }
    var orbit = specSat.orbit;
    var a = orbit.semiMajorAxisKm;
    var e = orbit.eccentricity;
    if (!(isFinite(a) && a > 0 && isFinite(e) && e >= 0 && e < 1)) return null;
    var epochMs = Date.parse(meta.epochUtc);
    var stepSec = meta.stepSeconds;
    var durationSec = meta.durationSeconds;
    if (!(isFinite(epochMs) && stepSec > 0 && durationSec > 0)) return null;
    var n = Math.floor(durationSec / stepSec) + 1;

    var inc = orbit.inclinationDeg * DEG;
    var raan = orbit.raanDeg * DEG;
    var argp = orbit.argPerigeeDeg * DEG;
    var nu0 = orbit.trueAnomalyDeg * DEG;

    // Initial mean anomaly from the true anomaly at epoch.
    var E0 = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(nu0), e + Math.cos(nu0));
    var M0 = E0 - e * Math.sin(E0);
    var meanMotion = Math.sqrt(MU_KM3_S2 / (a * a * a)); // rad/s

    // Perifocal -> ECI rotation (3-1-3: raan, inc, argp).
    var cO = Math.cos(raan), sO = Math.sin(raan);
    var ci = Math.cos(inc), si = Math.sin(inc);
    var cw = Math.cos(argp), sw = Math.sin(argp);
    var r11 = cO * cw - sO * sw * ci, r12 = -cO * sw - sO * cw * ci;
    var r21 = sO * cw + cO * sw * ci, r22 = -sO * sw + cO * cw * ci;
    var r31 = sw * si, r32 = cw * si;

    var t = new Array(n);
    var eci = new Array(n);
    var lla = new Array(n);
    var geo = [0, 0, 0];

    for (var i = 0; i < n; i++) {
      var tSec = i * stepSec;
      t[i] = tSec;
      var E = solveKepler(M0 + meanMotion * tSec, e);
      var cE = Math.cos(E), sE = Math.sin(E);
      // Perifocal coordinates.
      var xp = a * (cE - e);
      var yp = a * Math.sqrt(1 - e * e) * sE;
      var x = r11 * xp + r12 * yp;
      var y = r21 * xp + r22 * yp;
      var z = r31 * xp + r32 * yp;
      eci[i] = [x, y, z];

      // Earth-fixed via GMST (same rotation model the renderers use when no
      // authoritative earthOrientation samples are available).
      var gmst = Orbit.data.gmstRad(epochMs + tSec * 1000);
      var cg = Math.cos(gmst), sg = Math.sin(gmst);
      ecefToGeodetic(cg * x + sg * y, -sg * x + cg * y, z, geo);
      lla[i] = [geo[0], geo[1], geo[2]];
    }

    return { t: t, eci: eci, lla: lla };
  }

  Orbit.preview = {
    previewEphemeris: previewEphemeris,
    solveKepler: solveKepler,
    ecefToGeodetic: ecefToGeodetic,
  };
})();
