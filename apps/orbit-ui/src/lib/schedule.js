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
// epoch offsets, the slew lead-in, and the return-home slew-out, sorted by
// start time. Home is the nominal nadir boresight; after stopSec the sensor
// slews back home over returnSlewTimeSeconds when the export provides it,
// otherwise over the lead-in slew duration.
export function prepareSchedule(rawSchedule, epochMs) {
  return (rawSchedule ?? [])
    .map((entry) => {
      const prepared = windowSeconds(entry, epochMs);
      const slewSec = Math.max(entry.slewTimeSeconds ?? 0, 0);
      const returnSlewSec = Math.max(
        entry.returnSlewTimeSeconds ?? entry.slewTimeSeconds ?? 0,
        0,
      );
      return {
        ...prepared,
        slewStartSec: prepared.startSec - slewSec,
        returnEndSec: prepared.stopSec + returnSlewSec,
      };
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
//   idle   - home (nadir) pointing, no task in progress
//   slew   - slewing from the previous pointing toward entry's target;
//            progress in [0, 1]
//   track  - boresight locked on entry's target
//   return - slewing from the finished entry's target back to the home
//            (nadir) boresight; progress in [0, 1]
// fromTarget is the pointing the phase starts from (a target name, or null
// for home/nadir), so the viewer can interpolate from the right direction.
// A slew starts from the previous task's target only when that task's
// return-home slew had not yet finished; a lead-in that begins during the
// return phase therefore wins over it, keeping the transition smooth.
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
      const fromPrev = prev && entry.slewStartSec <= prev.returnEndSec;
      return {
        phase: "slew",
        entry,
        fromTarget: fromPrev ? prev.targetName : null,
        progress: span > 0 ? (tSec - entry.slewStartSec) / span : 1,
      };
    }
    break;
  }
  if (prev && tSec <= prev.returnEndSec) {
    const span = prev.returnEndSec - prev.stopSec;
    return {
      phase: "return",
      entry: prev,
      fromTarget: prev.targetName,
      progress: span > 0 ? (tSec - prev.stopSec) / span : 1,
    };
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
