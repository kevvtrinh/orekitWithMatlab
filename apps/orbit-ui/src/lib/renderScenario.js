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
import { deepEqual, parseEpochMs } from "./spec.js";
import {
  prepareAccesses,
  prepareEphemeris,
  SAT_PALETTE,
} from "./scenarioUtils.js";

const GROUND_KINDS = { groundStation: "GroundStation", target: "Target" };

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

  const runObjectByName = new Map(
    (runSpec?.objects ?? []).map((o) => [o.name, o]),
  );
  const matlabSatByName = new Map(
    (matlabRaw?.satellites ?? []).map((s) => [s.name, s]),
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
    (matlabRaw?.accesses ?? []).filter(
      (a) => specNames.has(a.source) && specNames.has(a.target),
    ),
    Number.isNaN(epochMs) ? 0 : epochMs,
  ).map((a) => ({
    ...a,
    stale:
      !metaFresh || !freshNames.has(a.source) || !freshNames.has(a.target),
  }));

  const dirty =
    !runSpec ||
    !metaFresh ||
    spec.objects.some((o) => !freshNames.has(o.name)) ||
    spec.objects.length !== (runSpec.objects?.length ?? 0);

  return {
    meta: {
      ...spec.meta,
      generatedAtUtc: matlabRaw?.meta?.generatedAtUtc ?? null,
    },
    epochMs,
    satellites,
    groundPoints,
    accesses,
    dirty, // true when a MATLAB run is needed for authoritative results
  };
}
