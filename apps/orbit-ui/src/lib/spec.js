// Scenario spec: the editable, MATLAB-independent description of a scenario.
// This module is pure ESM with no browser or Node dependencies so it is shared
// by the React frontend and the Express bridge server (validation must agree).
//
// A spec is what the user edits in the web UI; MATLAB/Orekit remains the
// authority for propagation. The bridge hands the spec JSON to
// src/ui/orbitUiRunScenario.m, which rebuilds the same objects with the
// MATLAB mission classes and writes back the propagated scenario payload.

export const SPEC_VERSION = 1;

export const OBJECT_KINDS = ["satellite", "groundStation", "target"];

export const PROPAGATORS = ["Keplerian", "EcksteinHechler", "Numerical", "TLE"];

export const MAX_OBJECTS = 300;
export const MAX_SATELLITES = 200;
export const MAX_DURATION_SECONDS = 30 * 86400;
export const MAX_TASKS = 24;
export const MAX_ACCESS_REQUESTS = 80;

const EARTH_RADIUS_KM = 6378.137;

// ---------------------------------------------------------------------------
// Templates (mirror the defaults of the MATLAB insert dialogs)
// ---------------------------------------------------------------------------

export function keplerianSatelliteTemplate(name) {
  return {
    kind: "satellite",
    name,
    color: "",
    propagator: "Keplerian",
    massKg: 1000,
    orbit: {
      type: "keplerian",
      semiMajorAxisKm: 7000,
      eccentricity: 0.001,
      inclinationDeg: 51.6,
      raanDeg: 0,
      argPerigeeDeg: 0,
      trueAnomalyDeg: 0,
    },
  };
}

export function tleSatelliteTemplate(name) {
  return {
    kind: "satellite",
    name,
    color: "",
    propagator: "TLE",
    massKg: 1000,
    orbit: {
      type: "tle",
      line1:
        "1 25544U 98067A   24183.51782528  .00016717  00000+0  30403-3 0  9995",
      line2:
        "2 25544  51.6416 197.2432 0007782 103.9422 356.9484 15.49376197459965",
    },
  };
}

export function groundStationTemplate(name) {
  return {
    kind: "groundStation",
    name,
    color: "",
    latitudeDeg: 38.8339,
    longitudeDeg: -104.8214,
    altitudeM: 1840,
    minElevationDeg: 5,
  };
}

export function targetTemplate(name) {
  return {
    kind: "target",
    name,
    color: "",
    latitudeDeg: 39.7392,
    longitudeDeg: -104.9903,
    altitudeM: 1609,
    priority: 5,
  };
}

// Nadir-pointing conic imaging sensor attached to a satellite. The cone
// half-angle is the instantaneous beam (FOV); the field of regard is how far
// the sensor can slew off nadir when tasked.
export function sensorTemplate() {
  return {
    coneHalfAngleDeg: 20,
    fieldOfRegardDeg: 60,
    slewRateDegPerSec: 2,
  };
}

// Point-target imaging task for the sensor scheduler. satelliteName "" means
// any satellite sensor may perform it.
export function taskTemplate(spec) {
  const target = (spec?.objects ?? []).find((o) => o.kind === "target");
  return {
    id: nextTaskId(spec),
    name: "",
    satelliteName: "",
    targetName: target?.name ?? "",
    priority: 5,
    dwellSeconds: 60,
  };
}

// Access requests tell the MATLAB/Orekit run which expensive access products
// to compute. Without this field, the backend keeps the legacy default
// (satellite x ground-station access, capped). With it, only these requests
// are computed, plus any scheduled task sensor windows.
export function accessRequestOptions(spec) {
  const objects = spec?.objects ?? [];
  const satellites = objects.filter((o) => o.kind === "satellite");
  const groundStations = objects.filter((o) => o.kind === "groundStation");
  const targets = objects.filter((o) => o.kind === "target");
  const options = [];

  for (const sat of satellites) {
    for (const ground of groundStations) {
      options.push({
        key: accessRequestKey({
          type: "access",
          sourceName: sat.name,
          targetName: ground.name,
        }),
        label: `${sat.name} -> ${ground.name}`,
        meta: "satellite / ground access",
        request: {
          type: "access",
          sourceName: sat.name,
          targetName: ground.name,
        },
      });
    }
  }

  for (let i = 0; i < satellites.length; i += 1) {
    for (let j = i + 1; j < satellites.length; j += 1) {
      options.push({
        key: accessRequestKey({
          type: "access",
          sourceName: satellites[i].name,
          targetName: satellites[j].name,
        }),
        label: `${satellites[i].name} -> ${satellites[j].name}`,
        meta: "satellite / satellite line of sight",
        request: {
          type: "access",
          sourceName: satellites[i].name,
          targetName: satellites[j].name,
        },
      });
    }
  }

  for (const sat of satellites.filter((o) => o.sensor)) {
    const sensorName = sat.sensor?.name || `${sat.name} Sensor`;
    for (const target of targets) {
      options.push({
        key: accessRequestKey({
          type: "sensor",
          platformName: sat.name,
          sensorName,
          targetName: target.name,
        }),
        label: `${sensorName} -> ${target.name}`,
        meta: "sensor FOR / FOV visibility",
        request: {
          type: "sensor",
          platformName: sat.name,
          sensorName,
          targetName: target.name,
        },
      });
    }
  }

  return options;
}

export function accessRequestKey(request) {
  if ((request?.type ?? "access") === "sensor") {
    return [
      "sensor",
      request.platformName ?? request.sourceName ?? "",
      request.sensorName ?? "",
      request.targetName ?? "",
    ].join("|");
  }
  return [
    "access",
    request?.sourceName ?? "",
    request?.targetName ?? "",
  ].join("|");
}

export function nextTaskId(spec) {
  const ids = new Set((spec?.tasks ?? []).map((t) => t.id));
  for (let i = 1; ; i++) {
    const candidate = `task-${i}`;
    if (!ids.has(candidate)) return candidate;
  }
}

export function constellationTemplate(prefix) {
  return {
    pattern: "delta", // "delta" | "star"
    prefix,
    totalSatellites: 12,
    planes: 3,
    phasing: 1,
    semiMajorAxisKm: 7000,
    eccentricity: 0.001,
    inclinationDeg: 53,
    raanOffsetDeg: 0,
    argPerigeeDeg: 0,
    trueAnomalyOffsetDeg: 0,
    propagator: "Keplerian",
  };
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

export function objectNames(spec) {
  return (spec?.objects ?? []).map((o) => o.name);
}

// Next free "<base>-N" name, like the MATLAB UI's nextObjectName.
export function nextObjectName(spec, base) {
  const names = new Set(objectNames(spec));
  for (let i = 1; ; i++) {
    const candidate = `${base}-${i}`;
    if (!names.has(candidate)) return candidate;
  }
}

// ---------------------------------------------------------------------------
// Walker constellations
// ---------------------------------------------------------------------------

function wrapDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

const pad2 = (n) => String(n).padStart(2, "0");

// Expand a Walker pattern into individual Keplerian satellite spec objects.
// Formulas and generated names mirror src/objects/ConstellationFactory.m so a
// constellation inserted here matches one inserted from the MATLAB UI.
export function expandWalker(params) {
  const {
    pattern,
    prefix,
    totalSatellites,
    planes,
    phasing,
    semiMajorAxisKm,
    eccentricity,
    inclinationDeg,
    raanOffsetDeg,
    argPerigeeDeg,
    trueAnomalyOffsetDeg,
    propagator = "Keplerian",
  } = params;

  if (!Number.isInteger(totalSatellites) || totalSatellites < 1) {
    throw new Error("Total satellite count must be a positive integer.");
  }
  if (!Number.isInteger(planes) || planes < 1) {
    throw new Error("Plane count must be a positive integer.");
  }
  if (totalSatellites % planes !== 0) {
    throw new Error("Total satellite count must be divisible by plane count.");
  }
  if (!Number.isInteger(phasing) || phasing < 0) {
    throw new Error("Walker phasing must be a nonnegative integer.");
  }

  const raanSpreadDeg = pattern === "star" ? 180 : 360;
  const satsPerPlane = totalSatellites / planes;
  const raanSpacingDeg = raanSpreadDeg / planes;
  const inPlaneSpacingDeg = 360 / satsPerPlane;
  const phaseSpacingDeg = (phasing * 360) / totalSatellites;
  const group = `Walker ${pattern === "star" ? "Star" : "Delta"} ${totalSatellites}/${planes}/${phasing}`;

  const satellites = [];
  for (let p = 0; p < planes; p++) {
    const raanDeg = wrapDegrees(raanOffsetDeg + p * raanSpacingDeg);
    const planePhaseDeg = p * phaseSpacingDeg;
    for (let s = 0; s < satsPerPlane; s++) {
      satellites.push({
        kind: "satellite",
        name: `${prefix}-P${pad2(p + 1)}-S${pad2(s + 1)}`,
        color: "",
        propagator,
        massKg: 1000,
        group,
        orbit: {
          type: "keplerian",
          semiMajorAxisKm,
          eccentricity,
          inclinationDeg,
          raanDeg,
          argPerigeeDeg,
          trueAnomalyDeg: wrapDegrees(
            trueAnomalyOffsetDeg + s * inPlaneSpacingDeg + planePhaseDeg,
          ),
        },
      });
    }
  }
  return satellites;
}

// ---------------------------------------------------------------------------
// Area targets
// ---------------------------------------------------------------------------

export const MAX_AREA_GRID_POINTS = 100;

export function areaTargetTemplate(name) {
  return {
    name,
    centerLatDeg: 39.0,
    centerLonDeg: -105.5,
    altitudeM: 0,
    widthKm: 100,
    heightKm: 100,
    spacingKm: 50,
    priority: 5,
  };
}

// Expand a rectangular area target into a grid of point targets, mirroring
// the MATLAB UI's AreaTargetObject "Generate Grid" workflow. The MATLAB
// backend schedules/computes access per point, so an area is represented in
// the spec as its grid points (kind "target", grouped by name prefix).
export function expandAreaGrid(params) {
  const {
    name,
    centerLatDeg,
    centerLonDeg,
    altitudeM = 0,
    widthKm,
    heightKm,
    spacingKm,
    priority = 5,
  } = params;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Area target name cannot be empty.");
  }
  for (const [label, v, lo, hi] of [
    ["Center latitude", centerLatDeg, -90, 90],
    ["Center longitude", centerLonDeg, -180, 180],
    ["Width", widthKm, 1, 5000],
    ["Height", heightKm, 1, 5000],
    ["Grid spacing", spacingKm, 1, 5000],
  ]) {
    if (!(typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi)) {
      throw new Error(`${label} must be a number between ${lo} and ${hi}.`);
    }
  }

  const rows = Math.max(1, Math.floor(heightKm / spacingKm) + 1);
  const cols = Math.max(1, Math.floor(widthKm / spacingKm) + 1);
  if (rows * cols > MAX_AREA_GRID_POINTS) {
    throw new Error(
      `Grid would have ${rows * cols} points (max ${MAX_AREA_GRID_POINTS}). ` +
        "Increase the spacing or shrink the area.",
    );
  }

  // Small-area approximation: 1 deg latitude ~ 111.32 km; longitude scaled by
  // cos(latitude). Adequate for imaging-area grids well away from the poles.
  const kmPerDegLat = 111.32;
  const dLat = spacingKm / kmPerDegLat;
  const cosLat = Math.cos((centerLatDeg * Math.PI) / 180);
  if (cosLat < 0.05) {
    throw new Error("Area grids are not supported within ~87 deg of a pole.");
  }
  const dLon = spacingKm / (kmPerDegLat * cosLat);

  const targets = [];
  for (let r = 0; r < rows; r++) {
    const lat = centerLatDeg + (r - (rows - 1) / 2) * dLat;
    if (lat < -90 || lat > 90) {
      throw new Error("Area grid extends beyond a pole - shrink the height.");
    }
    for (let c = 0; c < cols; c++) {
      let lon = centerLonDeg + (c - (cols - 1) / 2) * dLon;
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;
      targets.push({
        kind: "target",
        name: `${name}-R${pad2(r + 1)}C${pad2(c + 1)}`,
        color: "",
        group: name,
        latitudeDeg: lat,
        longitudeDeg: lon,
        altitudeM,
        priority,
      });
    }
  }
  return targets;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);

function inRange(v, lo, hi) {
  return isFiniteNumber(v) && v >= lo && v <= hi;
}

export function parseEpochMs(epochUtc) {
  if (typeof epochUtc !== "string") return NaN;
  // Require an explicit UTC ISO timestamp so MATLAB and JS agree.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(epochUtc)) {
    return NaN;
  }
  return new Date(epochUtc).getTime();
}

function validateSensor(sensor, errors, where) {
  if (typeof sensor !== "object" || sensor === null) {
    errors.push(`${where}: sensor must be an object.`);
    return;
  }
  if (!inRange(sensor.coneHalfAngleDeg, 0.1, 90)) {
    errors.push(`${where}: sensor cone half-angle must be in (0, 90] deg.`);
  }
  if (
    !inRange(sensor.fieldOfRegardDeg, 0.1, 180) ||
    (isFiniteNumber(sensor.coneHalfAngleDeg) &&
      sensor.fieldOfRegardDeg < sensor.coneHalfAngleDeg)
  ) {
    errors.push(
      `${where}: field of regard must be in [cone half-angle, 180] deg.`,
    );
  }
  if (
    sensor.slewRateDegPerSec !== undefined &&
    !inRange(sensor.slewRateDegPerSec, 0.01, 60)
  ) {
    errors.push(`${where}: slew rate must be in (0, 60] deg/s.`);
  }
}

function validateTasks(spec, errors) {
  const tasks = spec.tasks;
  if (tasks === undefined) return;
  if (!Array.isArray(tasks)) {
    errors.push("Spec tasks must be an array.");
    return;
  }
  if (tasks.length > MAX_TASKS) {
    errors.push(`At most ${MAX_TASKS} sensor tasks are supported.`);
  }
  const byName = new Map((spec.objects ?? []).map((o) => [o.name, o]));
  const seenIds = new Set();
  tasks.forEach((task, i) => {
    const where = `tasks[${i}] (${task?.id ?? "?"})`;
    if (!task || typeof task !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }
    if (typeof task.id !== "string" || task.id.trim().length === 0) {
      errors.push(`${where}: task id cannot be empty.`);
    } else if (seenIds.has(task.id)) {
      errors.push(`${where}: duplicate task id '${task.id}'.`);
    } else {
      seenIds.add(task.id);
    }
    const target = byName.get(task.targetName);
    if (!target || target.kind !== "target") {
      errors.push(
        `${where}: targetName must reference a point target in the scenario.`,
      );
    }
    if (task.satelliteName) {
      const sat = byName.get(task.satelliteName);
      if (!sat || sat.kind !== "satellite" || !sat.sensor) {
        errors.push(
          `${where}: satelliteName must reference a satellite with a sensor.`,
        );
      }
    }
    if (task.priority !== undefined && !inRange(task.priority, 0, 1e6)) {
      errors.push(`${where}: priority must be a nonnegative number.`);
    }
    if (
      task.dwellSeconds !== undefined &&
      !inRange(task.dwellSeconds, 10, 86400)
    ) {
      errors.push(`${where}: dwell must be between 10 and 86400 seconds.`);
    }
  });
}

function validateAccessRequests(spec, errors) {
  const requests = spec.accessRequests;
  if (requests === undefined) return;
  if (!Array.isArray(requests)) {
    errors.push("Spec accessRequests must be an array.");
    return;
  }
  if (requests.length > MAX_ACCESS_REQUESTS) {
    errors.push(`At most ${MAX_ACCESS_REQUESTS} access requests are supported.`);
  }

  const byName = new Map((spec.objects ?? []).map((o) => [o.name, o]));
  const seen = new Set();
  requests.forEach((request, i) => {
    const where = `accessRequests[${i}]`;
    if (!request || typeof request !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }
    const type = request.type ?? "access";
    if (type !== "access" && type !== "sensor") {
      errors.push(`${where}: type must be 'access' or 'sensor'.`);
      return;
    }
    const key = accessRequestKey(request);
    if (seen.has(key)) {
      errors.push(`${where}: duplicate access request.`);
    }
    seen.add(key);

    if (type === "access") {
      const source = byName.get(request.sourceName);
      const target = byName.get(request.targetName);
      if (!source) errors.push(`${where}: sourceName must reference an object.`);
      if (!target) errors.push(`${where}: targetName must reference an object.`);
      if (source && target) {
        const kinds = new Set([source.kind, target.kind]);
        const supported =
          (source.kind === "satellite" && target.kind === "satellite") ||
          (kinds.has("satellite") && kinds.has("groundStation"));
        if (!supported) {
          errors.push(
            `${where}: plain access supports satellite/ground-station or satellite/satellite pairs.`,
          );
        }
      }
      return;
    }

    const platformName = request.platformName ?? request.sourceName;
    const platform = byName.get(platformName);
    const target = byName.get(request.targetName);
    if (!platform || platform.kind !== "satellite" || !platform.sensor) {
      errors.push(
        `${where}: platformName must reference a satellite with a sensor.`,
      );
    }
    if (!target || target.kind !== "target") {
      errors.push(`${where}: targetName must reference a point target.`);
    }
  });
}

function validateSatellite(obj, errors, where) {
  if (!PROPAGATORS.includes(obj.propagator)) {
    errors.push(`${where}: unknown propagator '${obj.propagator}'.`);
  }
  if (obj.sensor !== undefined) {
    validateSensor(obj.sensor, errors, where);
  }
  if (obj.massKg !== undefined && !inRange(obj.massKg, 0.1, 1e7)) {
    errors.push(`${where}: mass must be a positive number of kg.`);
  }
  const orbit = obj.orbit;
  if (!orbit || typeof orbit !== "object") {
    errors.push(`${where}: satellite needs an orbit definition.`);
    return;
  }
  if (orbit.type === "keplerian") {
    if (obj.propagator === "TLE") {
      errors.push(`${where}: the TLE propagator requires a TLE orbit.`);
    }
    if (!inRange(orbit.semiMajorAxisKm, EARTH_RADIUS_KM + 1, 2e6)) {
      errors.push(
        `${where}: semi-major axis must be above Earth's radius (${EARTH_RADIUS_KM} km).`,
      );
    }
    if (!inRange(orbit.eccentricity, 0, 0.999999)) {
      errors.push(`${where}: eccentricity must be in [0, 1).`);
    }
    if (
      inRange(orbit.semiMajorAxisKm, EARTH_RADIUS_KM + 1, 2e6) &&
      inRange(orbit.eccentricity, 0, 0.999999) &&
      orbit.semiMajorAxisKm * (1 - orbit.eccentricity) < EARTH_RADIUS_KM + 90
    ) {
      errors.push(`${where}: perigee is below ~90 km altitude.`);
    }
    for (const [field, lo, hi] of [
      ["inclinationDeg", -180, 180],
      ["raanDeg", -360, 360],
      ["argPerigeeDeg", -360, 360],
      ["trueAnomalyDeg", -360, 360],
    ]) {
      if (!inRange(orbit[field], lo, hi)) {
        errors.push(`${where}: ${field} must be a number in [${lo}, ${hi}].`);
      }
    }
  } else if (orbit.type === "tle") {
    const l1 = typeof orbit.line1 === "string" ? orbit.line1.trim() : "";
    const l2 = typeof orbit.line2 === "string" ? orbit.line2.trim() : "";
    if (!l1.startsWith("1 ") || l1.length < 60) {
      errors.push(`${where}: TLE line 1 must start with '1 ' (69 columns).`);
    }
    if (!l2.startsWith("2 ") || l2.length < 60) {
      errors.push(`${where}: TLE line 2 must start with '2 ' (69 columns).`);
    }
    if (obj.propagator !== "TLE" && obj.propagator !== "Numerical") {
      errors.push(
        `${where}: TLE orbits support the SGP4 or Numerical propagators.`,
      );
    }
  } else {
    errors.push(`${where}: unknown orbit type '${orbit?.type}'.`);
  }
}

function validateGroundGeodetics(obj, errors, where) {
  if (!inRange(obj.latitudeDeg, -90, 90)) {
    errors.push(`${where}: latitude must be in [-90, 90] deg.`);
  }
  if (!inRange(obj.longitudeDeg, -180, 180)) {
    errors.push(`${where}: longitude must be in [-180, 180] deg.`);
  }
  if (!inRange(obj.altitudeM, -500, 100000)) {
    errors.push(`${where}: altitude must be in [-500, 100000] m.`);
  }
}

// Returns a list of human-readable problems; empty means the spec is valid.
export function validateSpec(spec) {
  const errors = [];
  if (!spec || typeof spec !== "object") return ["Spec must be an object."];
  if (spec.version !== SPEC_VERSION) {
    errors.push(`Spec version must be ${SPEC_VERSION}.`);
  }

  const meta = spec.meta;
  if (!meta || typeof meta !== "object") {
    errors.push("Spec is missing meta.");
  } else {
    if (typeof meta.name !== "string" || meta.name.trim().length === 0) {
      errors.push("Scenario name cannot be empty.");
    }
    if (Number.isNaN(parseEpochMs(meta.epochUtc))) {
      errors.push(
        "Epoch must be an ISO UTC timestamp like 2026-07-05T00:00:00Z.",
      );
    }
    if (!inRange(meta.durationSeconds, 60, MAX_DURATION_SECONDS)) {
      errors.push(
        `Duration must be between 60 s and ${MAX_DURATION_SECONDS / 86400} days.`,
      );
    }
    if (!inRange(meta.stepSeconds, 1, 3600)) {
      errors.push("Time step must be between 1 and 3600 seconds.");
    } else if (
      isFiniteNumber(meta.durationSeconds) &&
      meta.durationSeconds / meta.stepSeconds > 50000
    ) {
      errors.push("Duration / step yields more than 50000 samples per object.");
    }
  }

  if (!Array.isArray(spec.objects)) {
    errors.push("Spec objects must be an array.");
    return errors;
  }
  if (spec.objects.length > MAX_OBJECTS) {
    errors.push(`At most ${MAX_OBJECTS} objects are supported.`);
  }

  const seen = new Set();
  let satCount = 0;
  spec.objects.forEach((obj, i) => {
    const where = `objects[${i}] (${obj?.name ?? "?"})`;
    if (!obj || typeof obj !== "object") {
      errors.push(`${where}: must be an object.`);
      return;
    }
    if (!OBJECT_KINDS.includes(obj.kind)) {
      errors.push(`${where}: unknown kind '${obj.kind}'.`);
      return;
    }
    if (typeof obj.name !== "string" || obj.name.trim().length === 0) {
      errors.push(`${where}: name cannot be empty.`);
    } else if (seen.has(obj.name)) {
      errors.push(`${where}: duplicate object name '${obj.name}'.`);
    } else {
      seen.add(obj.name);
    }
    if (obj.color && !/^#[0-9a-fA-F]{6}$/.test(obj.color)) {
      errors.push(`${where}: color must be a #rrggbb hex string.`);
    }

    if (obj.kind === "satellite") {
      satCount += 1;
      validateSatellite(obj, errors, where);
    } else if (obj.kind === "groundStation") {
      validateGroundGeodetics(obj, errors, where);
      if (
        obj.minElevationDeg !== undefined &&
        !inRange(obj.minElevationDeg, -90, 90)
      ) {
        errors.push(`${where}: min elevation must be in [-90, 90] deg.`);
      }
    } else if (obj.kind === "target") {
      validateGroundGeodetics(obj, errors, where);
      if (obj.priority !== undefined && !inRange(obj.priority, 0, 1e6)) {
        errors.push(`${where}: priority must be a nonnegative number.`);
      }
    }
  });
  if (satCount > MAX_SATELLITES) {
    errors.push(`At most ${MAX_SATELLITES} satellites are supported.`);
  }

  validateTasks(spec, errors);
  validateAccessRequests(spec, errors);

  return errors;
}

// ---------------------------------------------------------------------------
// Derivation from a propagated payload (default spec / static fallback)
// ---------------------------------------------------------------------------

// Build an editable spec from a propagated scenario payload (the bundled
// sample or a MATLAB result). Keplerian satellites keep their elements; other
// definition types cannot be reconstructed and are skipped.
export function deriveSpecFromScenario(raw) {
  const objects = [];
  for (const sat of raw.satellites ?? []) {
    if (!sat.elements) continue;
    objects.push({
      kind: "satellite",
      name: sat.name,
      color: sat.color ?? "",
      propagator: sat.propagatorType || "Keplerian",
      massKg: 1000,
      orbit: {
        type: "keplerian",
        semiMajorAxisKm: sat.elements.semiMajorAxisKm,
        eccentricity: sat.elements.eccentricity,
        inclinationDeg: sat.elements.inclinationDeg,
        raanDeg: sat.elements.raanDeg,
        argPerigeeDeg: sat.elements.argPerigeeDeg,
        trueAnomalyDeg: sat.elements.trueAnomalyDeg,
      },
    });
  }
  for (const gp of raw.groundPoints ?? []) {
    if (gp.type === "Target") {
      objects.push({
        kind: "target",
        name: gp.name,
        color: gp.color ?? "",
        latitudeDeg: gp.latitudeDeg,
        longitudeDeg: gp.longitudeDeg,
        altitudeM: gp.altitudeM,
        priority: gp.priority ?? 1,
      });
    } else {
      objects.push({
        kind: "groundStation",
        name: gp.name,
        color: gp.color ?? "",
        latitudeDeg: gp.latitudeDeg,
        longitudeDeg: gp.longitudeDeg,
        altitudeM: gp.altitudeM,
        minElevationDeg: gp.minElevationDeg ?? 5,
      });
    }
  }
  return {
    version: SPEC_VERSION,
    rev: 0,
    meta: {
      name: raw.meta?.name ?? "Untitled Scenario",
      epochUtc: normalizeEpochUtc(raw.meta?.epochUtc) ?? "2026-01-01T00:00:00Z",
      durationSeconds: raw.meta?.durationSeconds ?? 86400,
      stepSeconds: raw.meta?.stepSeconds ?? 60,
    },
    objects,
  };
}

export function normalizeEpochUtc(epochUtc) {
  const ms = new Date(epochUtc ?? NaN).getTime();
  if (Number.isNaN(ms)) return null;
  const iso = new Date(ms).toISOString(); // 2026-07-05T00:00:00.000Z
  return iso.endsWith(".000Z") ? `${iso.slice(0, 19)}Z` : iso;
}

// ---------------------------------------------------------------------------
// Comparison helpers (freshness of MATLAB results against the current spec)
// ---------------------------------------------------------------------------

// Structural deep-equality over JSON-safe values. Key order is irrelevant and
// numbers must match exactly (both sides round-trip through JSON).
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object") {
    const keys = Object.keys(a).filter((k) => a[k] !== undefined);
    const keysB = Object.keys(b).filter((k) => b[k] !== undefined);
    if (keys.length !== keysB.length) return false;
    return keys.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

// Remove undefined/null fields so specs survive MATLAB's jsondecode/jsonencode
// round trip unchanged (MATLAB turns null into [] which would break equality).
export function stripEmptyFields(value) {
  if (Array.isArray(value)) return value.map(stripEmptyFields);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === null || v === "") continue;
      out[k] = stripEmptyFields(v);
    }
    return out;
  }
  return value;
}
