// Sun/lighting helpers: pure ESM shared by the viewer, components, and tests.
// MATLAB/Orekit is authoritative when its data is present and fresh; the
// analytic sunDirectionEci fallback (lib/time.js) covers everything else.

import { parseIsoUtc } from "./time.js";

const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];

function windowSeconds(w, epochMs) {
  return {
    ...w,
    startSec: (parseIsoUtc(w.startUtc).getTime() - epochMs) / 1000,
    stopSec: (parseIsoUtc(w.stopUtc).getTime() - epochMs) / 1000,
  };
}

function prepareEclipse(entry, epochMs) {
  const times = asArray(entry.tOffsetSec);
  const states = asArray(entry.lightingState);
  const validHistory = times.length === states.length && times.every((time, index) =>
    Number.isFinite(time) && (index === 0 || time > times[index - 1]) &&
    ["Sunlit", "Penumbra", "Umbra"].includes(states[index]));
  return { ...entry, tOffsetSec: validHistory ? times : [], lightingState: validHistory ? states : [],
    windows: asArray(entry.windows).map((window) => windowSeconds(window, epochMs)) };
}

// Raw payload sun block (MATLAB exportSunViz) -> render-friendly shape with
// typed ephemeris arrays and epoch-offset windows.
export function prepareSun(rawSun, epochMs) {
  if (!rawSun?.ephemeris) return null;
  const n = rawSun.ephemeris.tOffsetSec.length;
  const t = Float64Array.from(rawSun.ephemeris.tOffsetSec);
  const eci = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = rawSun.ephemeris.eciKm[i];
    eci[i * 3] = p[0];
    eci[i * 3 + 1] = p[1];
    eci[i * 3 + 2] = p[2];
  }
  return {
    ephemeris: { n, t, eci },
    eclipses: asArray(rawSun.eclipses).map((entry) => prepareEclipse(entry, epochMs)),
    groundLighting: asArray(rawSun.groundLighting).map((g) => ({
      ...g,
      daylightWindows: asArray(g.daylightWindows).map((w) =>
        windowSeconds(w, epochMs),
      ),
    })),
  };
}

// Unit Sun direction in ECI at tSec, interpolated from the MATLAB ephemeris.
// Returns null when no data (caller falls back to the analytic formula).
export function sunDirectionAt(sun, tSec, out = [0, 0, 0]) {
  const eph = sun?.ephemeris;
  if (!eph || eph.n === 0) return null;
  const { t, eci, n } = eph;
  let lo = 0;
  let hi = n - 1;
  if (tSec <= t[0]) hi = Math.min(1, n - 1);
  else if (tSec >= t[n - 1]) lo = Math.max(n - 2, 0);
  else {
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (t[mid] <= tSec) lo = mid;
      else hi = mid;
    }
  }
  const f =
    hi === lo ? 0 : Math.max(0, Math.min(1, (tSec - t[lo]) / (t[hi] - t[lo])));
  for (let k = 0; k < 3; k++) {
    out[k] = eci[lo * 3 + k] + f * (eci[hi * 3 + k] - eci[lo * 3 + k]);
  }
  const mag = Math.hypot(out[0], out[1], out[2]);
  if (mag === 0) return null;
  for (let k = 0; k < 3; k++) out[k] /= mag;
  return out;
}

// Satellite lighting state at tSec: "Umbra" | "Penumbra" | "Sunlit", or null
// when there is no eclipse data for that satellite.
export function lightingStateAt(sun, satelliteName, tSec) {
  const entry = sun?.eclipses?.find((e) => e.satellite === satelliteName);
  if (!entry) return null;
  // Hold the preceding computed sample between ephemeris instants. Interval
  // endpoints are sampled too, so their gaps cannot establish sunlight.
  const times = entry.tOffsetSec;
  if (times?.length && tSec >= times[0] && tSec <= times[times.length - 1]) {
    let lo = 0, hi = times.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (times[mid] <= tSec) lo = mid;
      else hi = mid - 1;
    }
    return entry.lightingState[lo];
  }
  let state = "Sunlit";
  for (const w of entry.windows) {
    if (tSec >= w.startSec && tSec <= w.stopSec) {
      if (w.type === "Umbra") return "Umbra";
      state = "Penumbra";
    }
  }
  return state;
}

// Ground-site lighting at tSec: true (daylight), false (night), or null when
// there is no data for that site.
export function daylightAt(sun, siteName, tSec) {
  const entry = sun?.groundLighting?.find((g) => g.name === siteName);
  if (!entry) return null;
  return entry.daylightWindows.some(
    (w) => tSec >= w.startSec && tSec <= w.stopSec,
  );
}
