import { parseIsoUtc } from "./time.js";

// Normalize the raw bridge/sample JSON into a render-friendly shape:
// typed arrays for ephemerides, access windows converted to epoch offsets.
const SAT_PALETTE = ["#e8a33d", "#4fb8d1", "#b58ae6", "#5fc98f", "#e0705c", "#d1c25a"];

export function prepareScenario(raw) {
  const epochMs = parseIsoUtc(raw.meta.epochUtc).getTime();

  // Fall back to a distinct palette when colors are missing or collide
  // (MATLAB objects default to the same red).
  const seenColors = new Set();
  const satellites = raw.satellites.map((sat, index) => {
    let color = sat.color;
    if (!color || seenColors.has(color)) {
      color = SAT_PALETTE[index % SAT_PALETTE.length];
    }
    seenColors.add(color);
    sat = { ...sat, color };
    const n = sat.ephemeris.tOffsetSec.length;
    const t = Float64Array.from(sat.ephemeris.tOffsetSec);
    const eci = new Float64Array(n * 3);
    const lla = new Float64Array(n * 3);
    for (let i = 0; i < n; i++) {
      const p = sat.ephemeris.eciKm[i];
      eci[i * 3] = p[0];
      eci[i * 3 + 1] = p[1];
      eci[i * 3 + 2] = p[2];
      const g = sat.ephemeris.llaDeg[i];
      lla[i * 3] = g[0];
      lla[i * 3 + 1] = g[1];
      lla[i * 3 + 2] = g[2]; // altitude km
    }
    return { ...sat, ephemeris: { n, t, eci, lla } };
  });

  const accesses = raw.accesses.map((a) => ({
    ...a,
    windows: a.windows.map((w) => ({
      ...w,
      startSec: (parseIsoUtc(w.startUtc).getTime() - epochMs) / 1000,
      stopSec: (parseIsoUtc(w.stopUtc).getTime() - epochMs) / 1000,
    })),
  }));

  return {
    meta: raw.meta,
    epochMs,
    satellites,
    groundPoints: raw.groundPoints,
    accesses,
  };
}

function readVec(array, index, out) {
  out[0] = array[index * 3];
  out[1] = array[index * 3 + 1];
  out[2] = array[index * 3 + 2];
  return out;
}

// Linear interpolation of a satellite ECI position (km) at t seconds past epoch.
export function satEciAt(sat, tSec, out = [0, 0, 0]) {
  const { t, eci, n } = sat.ephemeris;
  if (n === 0) return out;
  if (tSec <= t[0]) return readVec(eci, 0, out);
  if (tSec >= t[n - 1]) return readVec(eci, n - 1, out);
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t[mid] <= tSec) lo = mid;
    else hi = mid;
  }
  const f = (tSec - t[lo]) / (t[hi] - t[lo]);
  for (let k = 0; k < 3; k++) {
    out[k] = eci[lo * 3 + k] + f * (eci[hi * 3 + k] - eci[lo * 3 + k]);
  }
  return out;
}

export function satLlaAt(sat, tSec, out = [0, 0, 0]) {
  const { t, lla, n } = sat.ephemeris;
  if (n === 0) return out;
  let lo = 0;
  let hi = n - 1;
  if (tSec <= t[0]) hi = 1;
  else if (tSec >= t[n - 1]) lo = n - 2;
  else {
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (t[mid] <= tSec) lo = mid;
      else hi = mid;
    }
  }
  const f = Math.max(0, Math.min(1, (tSec - t[lo]) / (t[hi] - t[lo])));
  out[0] = lla[lo * 3] + f * (lla[hi * 3] - lla[lo * 3]);
  // Longitude can wrap across the +/-180 seam; don't interpolate across it.
  const lon0 = lla[lo * 3 + 1];
  const lon1 = lla[hi * 3 + 1];
  out[1] = Math.abs(lon1 - lon0) > 180 ? lon0 : lon0 + f * (lon1 - lon0);
  out[2] = lla[lo * 3 + 2] + f * (lla[hi * 3 + 2] - lla[lo * 3 + 2]);
  return out;
}

// Access windows for a pair active/upcoming relative to tSec.
export function windowStateAt(windows, tSec) {
  let active = null;
  let next = null;
  for (const w of windows) {
    if (tSec >= w.startSec && tSec <= w.stopSec) active = w;
    else if (w.startSec > tSec && (next === null || w.startSec < next.startSec)) {
      next = w;
    }
  }
  return { active, next };
}

export function accessesForObject(accesses, name) {
  return accesses.filter((a) => a.source === name || a.target === name);
}
