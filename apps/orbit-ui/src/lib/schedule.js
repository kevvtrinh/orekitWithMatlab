// Sensor-schedule helpers: pure ESM shared by the React components, the 3D
// viewer, and the tests. All times are seconds past the scenario epoch.

import { parseIsoUtc } from "./time.js";

function windowSeconds(w, epochMs) {
  return {
    ...w,
    startSec: (parseIsoUtc(w.startUtc).getTime() - epochMs) / 1000,
    stopSec: (parseIsoUtc(w.stopUtc).getTime() - epochMs) / 1000,
  };
}

// Raw schedule entries (MATLAB exportScheduleViz) -> render entries with
// epoch offsets and the slew lead-in, sorted by start time.
export function prepareSchedule(rawSchedule, epochMs) {
  return (rawSchedule ?? [])
    .map((entry) => {
      const prepared = windowSeconds(entry, epochMs);
      const slewSec = Math.max(entry.slewTimeSeconds ?? 0, 0);
      return { ...prepared, slewStartSec: prepared.startSec - slewSec };
    })
    .sort((a, b) => a.startSec - b.startSec);
}

// Raw sensor access entries -> both window sets converted to epoch offsets.
export function prepareSensorAccesses(rawAccesses, epochMs) {
  return (rawAccesses ?? []).map((a) => ({
    ...a,
    forWindows: (a.forWindows ?? []).map((w) => windowSeconds(w, epochMs)),
    fovWindows: (a.fovWindows ?? []).map((w) => windowSeconds(w, epochMs)),
  }));
}

// Pointing state of one platform's sensor at tSec, given that platform's
// prepared schedule entries (sorted by startSec):
//   idle  - nominal (nadir) pointing, no task in progress
//   slew  - slewing from the previous pointing toward entry's target;
//           progress in [0, 1]
//   track - boresight locked on entry's target
// fromTarget is the previous task's target name (null means nadir), so the
// viewer can interpolate the slew from the right starting direction.
export function pointingStateAt(entries, tSec) {
  let prev = null;
  for (const entry of entries) {
    if (tSec > entry.stopSec) {
      prev = entry;
      continue;
    }
    if (tSec >= entry.startSec) {
      return { phase: "track", entry, fromTarget: null, progress: 1 };
    }
    if (tSec >= entry.slewStartSec) {
      const span = entry.startSec - entry.slewStartSec;
      return {
        phase: "slew",
        entry,
        fromTarget: prev?.targetName ?? null,
        progress: span > 0 ? (tSec - entry.slewStartSec) / span : 1,
      };
    }
    break;
  }
  return { phase: "idle", entry: null, fromTarget: null, progress: 0 };
}

export function scheduleForPlatform(schedule, platformName) {
  return (schedule ?? []).filter((e) => e.platformName === platformName);
}

export function scheduleForObject(schedule, name) {
  return (schedule ?? []).filter(
    (e) => e.platformName === name || e.targetName === name,
  );
}

export function sensorAccessesForObject(sensorAccesses, name) {
  return (sensorAccesses ?? []).filter(
    (a) => a.platform === name || a.target === name,
  );
}
