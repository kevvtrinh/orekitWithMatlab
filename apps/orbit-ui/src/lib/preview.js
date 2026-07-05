// Client-side two-body Keplerian preview propagation.
//
// When the user edits the spec, the browser shows an instant preview orbit so
// the scenario reacts immediately. MATLAB/Orekit remains authoritative: once
// a bridge run completes, its ephemeris replaces the preview (the difference
// is J2+/drag/etc. for non-two-body propagators). TLE satellites are never
// previewed; they wait for the MATLAB run (SGP4 lives on the backend).

import { parseEpochMs } from "./spec.js";
import { gmstRad } from "./time.js";

const MU_KM3_S2 = 398600.4418;
const DEG = Math.PI / 180;

// WGS84 ellipsoid, matching the Orekit backend's geodetic output closely
// enough for display purposes.
const WGS84_A_KM = 6378.137;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);

function solveKepler(meanAnomaly, e) {
  // Newton iteration; e < 1 guaranteed by spec validation.
  let E = e < 0.8 ? meanAnomaly : Math.PI;
  for (let i = 0; i < 12; i++) {
    const f = E - e * Math.sin(E) - meanAnomaly;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

// ECEF (km) -> geodetic lat/lon/alt (deg/deg/km), Bowring's closed form.
function ecefToGeodetic(x, y, z, out) {
  const p = Math.hypot(x, y);
  const b = WGS84_A_KM * (1 - WGS84_F);
  const ePrime2 = (WGS84_A_KM * WGS84_A_KM - b * b) / (b * b);
  const theta = Math.atan2(z * WGS84_A_KM, p * b);
  const st = Math.sin(theta);
  const ct = Math.cos(theta);
  const lat = Math.atan2(
    z + ePrime2 * b * st * st * st,
    p - WGS84_E2 * WGS84_A_KM * ct * ct * ct,
  );
  const sinLat = Math.sin(lat);
  const N = WGS84_A_KM / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  const alt =
    Math.abs(lat) < Math.PI / 4
      ? p / Math.cos(lat) - N
      : z / sinLat - N * (1 - WGS84_E2);
  out[0] = lat / DEG;
  out[1] = Math.atan2(y, x) / DEG;
  out[2] = alt;
  return out;
}

// Build a preview ephemeris for a Keplerian satellite spec object in the same
// prepared shape the MATLAB payload is converted to: { n, t, eci, lla }.
export function buildPreviewEphemeris(orbit, meta) {
  const epochMs = parseEpochMs(meta.epochUtc);
  const stepSec = meta.stepSeconds;
  const n = Math.floor(meta.durationSeconds / stepSec) + 1;

  const a = orbit.semiMajorAxisKm;
  const e = orbit.eccentricity;
  const inc = orbit.inclinationDeg * DEG;
  const raan = orbit.raanDeg * DEG;
  const argp = orbit.argPerigeeDeg * DEG;
  const nu0 = orbit.trueAnomalyDeg * DEG;

  // Initial mean anomaly from the true anomaly at epoch.
  const E0 = Math.atan2(
    Math.sqrt(1 - e * e) * Math.sin(nu0),
    e + Math.cos(nu0),
  );
  const M0 = E0 - e * Math.sin(E0);
  const meanMotion = Math.sqrt(MU_KM3_S2 / (a * a * a)); // rad/s

  // Perifocal -> ECI rotation (3-1-3: raan, inc, argp).
  const cO = Math.cos(raan);
  const sO = Math.sin(raan);
  const ci = Math.cos(inc);
  const si = Math.sin(inc);
  const cw = Math.cos(argp);
  const sw = Math.sin(argp);
  const r11 = cO * cw - sO * sw * ci;
  const r12 = -cO * sw - sO * cw * ci;
  const r21 = sO * cw + cO * sw * ci;
  const r22 = -sO * sw + cO * cw * ci;
  const r31 = sw * si;
  const r32 = cw * si;

  const t = new Float64Array(n);
  const eci = new Float64Array(n * 3);
  const lla = new Float64Array(n * 3);
  const geo = [0, 0, 0];

  for (let i = 0; i < n; i++) {
    const tSec = i * stepSec;
    t[i] = tSec;
    const E = solveKepler(M0 + meanMotion * tSec, e);
    const cE = Math.cos(E);
    const sE = Math.sin(E);
    // Perifocal coordinates.
    const xp = a * (cE - e);
    const yp = a * Math.sqrt(1 - e * e) * sE;
    const x = r11 * xp + r12 * yp;
    const y = r21 * xp + r22 * yp;
    const z = r31 * xp + r32 * yp;
    eci[i * 3] = x;
    eci[i * 3 + 1] = y;
    eci[i * 3 + 2] = z;

    // Earth-fixed via GMST (same model the viewer uses to spin the globe).
    const gmst = gmstRad(new Date(epochMs + tSec * 1000));
    const cg = Math.cos(gmst);
    const sg = Math.sin(gmst);
    ecefToGeodetic(cg * x + sg * y, -sg * x + cg * y, z, geo);
    lla[i * 3] = geo[0];
    lla[i * 3 + 1] = geo[1];
    lla[i * 3 + 2] = geo[2];
  }

  return { n, t, eci, lla };
}
