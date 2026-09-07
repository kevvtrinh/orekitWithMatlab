// Merge the editable scenario spec (source of truth for what exists) with the
// most recent MATLAB/Orekit payload (source of truth for propagation).
//
// Every satellite in the render scenario carries a `source` tag:
//   "matlab"  - the MATLAB result is fresh for this object (definition and
//               scenario timing unchanged since the run) -> authoritative.
//   "preview" - the object changed (or was never run); the browser shows an
//               instant two-body preview until the next MATLAB run.
//   "pending" - no preview possible (TLE orbits need the backend's SGP4);
//               the object is listed but not drawn until MATLAB runs.
//
// Access results only ever come from MATLAB. Pairs whose endpoints (or the
// scenario timing) changed since the run are flagged stale so the UI can dim
// them instead of silently showing wrong windows.

import { buildPreviewEphemeris } from "./preview.js";
import { prepareSchedule, prepareSensorAccesses } from "./schedule.js";
import { collectAreaOutlines, deepEqual, parseEpochMs, normalizeAreaDefinitions } from "./spec.js";
import { prepareSun } from "./sun.js";
import {
  prepareAccesses,
  prepareEphemeris,
  SAT_PALETTE,
} from "./scenarioUtils.js";

const GROUND_KINDS = { groundStation: "GroundStation", target: "Target" };

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function pickColor(specColor, index, seen) {
  let color = specColor;
  if (!color || seen.has(color)) {
    color = SAT_PALETTE[index % SAT_PALETTE.length];
  }
  seen.add(color);
  return color;
}

export function buildRenderScenario(spec, matlabRaw) {
  const epochMs = parseEpochMs(spec.meta.epochUtc);
  const runSpec = matlabRaw?.spec ?? null;
  // Timing/meta freshness: everything MATLAB computed assumed this meta.
  const metaFresh = runSpec ? deepEqual(spec.meta, runSpec.meta) : false;

  const runObjects = asArray(runSpec?.objects);
  const runObjectByName = new Map(runObjects.map((o) => [o.name, o]));
  const matlabSatByName = new Map(
    asArray(matlabRaw?.satellites).map((s) => [s.name, s]),
  );

  const freshNames = new Set();
  const seenColors = new Set();
  let satIndex = 0;
  const satellites = [];
  const groundPoints = [];

  for (const obj of spec.objects) {
    if (obj.kind === "satellite") {
      const color = pickColor(obj.color, satIndex++, seenColors);
      const fresh =
        metaFresh &&
        matlabSatByName.has(obj.name) &&
        deepEqual(obj, runObjectByName.get(obj.name));
      let source;
      let ephemeris = null;
      if (fresh) {
        source = "matlab";
        ephemeris = prepareEphemeris(matlabSatByName.get(obj.name).ephemeris);
        freshNames.add(obj.name);
      } else if (obj.orbit.type === "keplerian") {
        source = "preview";
        ephemeris = buildPreviewEphemeris(obj.orbit, spec.meta);
      } else {
        source = "pending";
      }
      satellites.push({
        name: obj.name,
        color,
        kind: obj.kind,
        group: obj.group,
        propagatorType: obj.propagator,
        orbitDefinitionType: obj.orbit.type === "tle" ? "TLE" : "Keplerian",
        elements: obj.orbit.type === "keplerian" ? { ...obj.orbit } : null,
        tle: obj.orbit.type === "tle" ? { ...obj.orbit } : null,
        massKg: obj.massKg,
        sensor: obj.sensor ?? null,
        source,
        ephemeris,
        spec: obj,
      });
    } else {
      // Ground objects are fully defined by the spec; MATLAB adds nothing to
      // their display state, so they are always "fresh".
      const fresh = deepEqual(obj, runObjectByName.get(obj.name));
      if (fresh) freshNames.add(obj.name);
      groundPoints.push({
        name: obj.name,
        type: GROUND_KINDS[obj.kind],
        kind: obj.kind,
        color: obj.color || (obj.kind === "target" ? "#e0705c" : "#5aa0d8"),
        group: obj.group ?? null,
        area: obj.area ?? null,
        latitudeDeg: obj.latitudeDeg,
        longitudeDeg: obj.longitudeDeg,
        altitudeM: obj.altitudeM,
        minElevationDeg: obj.minElevationDeg,
        priority: obj.priority,
        spec: obj,
      });
    }
  }

  // Accesses: keep only pairs whose two endpoints still exist; flag staleness.
  const specNames = new Set(spec.objects.map((o) => o.name));
  const accesses = prepareAccesses(
    asArray(matlabRaw?.accesses).filter(
      (a) => specNames.has(a.source) && specNames.has(a.target),
    ),
    Number.isNaN(epochMs) ? 0 : epochMs,
  ).map((a) => ({
    ...a,
    stale:
      !metaFresh || !freshNames.has(a.source) || !freshNames.has(a.target),
  }));

  // Sensor schedule + FOR/FOV accesses: MATLAB-only, like plain accesses.
  // A schedule entry is stale as soon as either endpoint (or the task list)
  // changed; the whole schedule is recomputed on the next run anyway.
  const tasksFresh =
    metaFresh && deepEqual(asArray(spec.tasks), asArray(runSpec?.tasks));
  const areaNames = new Set(spec.objects.filter((object) => object.kind === "target" && object.group).map((object) => object.group));
  const rawSchedule = asArray(matlabRaw?.schedule);
  const schedule = prepareSchedule(
    rawSchedule.filter(
      (e) => specNames.has(e.platformName) && (specNames.has(e.targetName) || areaNames.has(e.targetName)),
    ),
    Number.isNaN(epochMs) ? 0 : epochMs,
  ).map((e) => ({
    ...e,
    stale:
      !tasksFresh ||
      !freshNames.has(e.platformName) ||
      !targetIsFresh(e.targetName),
  }));
  const sensorAccesses = prepareSensorAccesses(
    asArray(matlabRaw?.sensorAccesses).filter(
      (a) => specNames.has(a.platform) && specNames.has(a.target),
    ),
    Number.isNaN(epochMs) ? 0 : epochMs,
  ).map((a) => ({
    ...a,
    stale:
      !metaFresh || !freshNames.has(a.platform) || !freshNames.has(a.target),
  }));

  // Backend pointing is one continuous history per sensor. Never remove
  // individual stale samples: interpolation would then bridge across old
  // task directions. Even an idle history is stale after tasks change.
  const freshPlatforms = new Map(satellites
    .filter((satellite) => satellite.source === "matlab" && satellite.sensor)
    .map((satellite) => [satellite.name, satellite]));
  function targetIsFresh(name) {
    if (freshNames.has(name)) return true;
    // Area scans name a group, not one grid point. Every original member
    // must still exist unchanged, with no new or removed members.
    const current = spec.objects.filter((object) => object.kind === "target" && object.group === name);
    const previous = runObjects.filter((object) => object.kind === "target" && object.group === name);
    return current.length > 0 && current.length === previous.length &&
      deepEqual(normalizeAreaDefinitions(spec.areas).find((area) => area.name === name), normalizeAreaDefinitions(runSpec?.areas).find((area) => area.name === name)) &&
      current.every((object) => freshNames.has(object.name));
  }
  const pointing = metaFresh && tasksFresh ? asArray(matlabRaw?.pointing).filter((series) => {
    const platform = freshPlatforms.get(series?.platform);
    if (!platform || series.sensor !== (platform.sensor.name ?? `${platform.name} Sensor`)) return false;
    // Inspect unfiltered schedule rows so a deleted target cannot disappear
    // from the freshness check along with its displayed schedule entry.
    const scheduledTargets = rawSchedule
      .filter((entry) => entry.platformName === series.platform && entry.sensorName === series.sensor)
      .map((entry) => entry.targetName);
    const eligibleTargets = asArray(spec.tasks)
      .filter((task) => !task.satelliteName || task.satelliteName === series.platform)
      .map((task) => task.targetName);
    const targets = [...asArray(series.targetName), ...scheduledTargets, ...eligibleTargets];
    return targets.filter((name) => typeof name === "string" && name.length > 0).every(targetIsFresh);
  }) : [];

  // Sun data depends only on scenario timing; per-satellite eclipses and
  // per-site daylight additionally require that object to be fresh.
  const rawSun = metaFresh ? matlabRaw?.sun : null;
  const sun = rawSun
    ? prepareSun(
        {
          ...rawSun,
          eclipses: asArray(rawSun.eclipses).filter((e) =>
            freshNames.has(e.satellite),
          ),
          groundLighting: asArray(rawSun.groundLighting).filter((g) =>
            freshNames.has(g.name),
          ),
        },
        epochMs,
      )
    : null;

  const dirty =
    !runSpec ||
    !metaFresh ||
    !tasksFresh ||
    !deepEqual(normalizeAreaDefinitions(spec.areas), normalizeAreaDefinitions(runSpec?.areas)) ||
    spec.objects.some((o) => !freshNames.has(o.name)) ||
    spec.objects.length !== runObjects.length;

  return {
    meta: {
      ...spec.meta,
      generatedAtUtc: matlabRaw?.meta?.generatedAtUtc ?? null,
    },
    epochMs,
    satellites,
    groundPoints,
    areaOutlines: collectAreaOutlines(spec.objects, spec.areas),
    accesses,
    schedule,
    sensorAccesses,
    pointing,
    sun,
    dirty, // true when a MATLAB run is needed for authoritative results
  };
}
