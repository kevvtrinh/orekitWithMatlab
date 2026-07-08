// Orbit.spec - the editable scenario spec: templates, validation, cleanup,
// and derivation from a propagated payload. Level 1 subset of
// apps/orbit-ui/src/lib/spec.js: meta, Keplerian satellites, ground stations,
// and point targets only. Content this console cannot author yet (TLE orbits,
// sensors, tasks, ...) is rejected with a clear message instead of silently
// dropped. Validation must agree with the MATLAB side
// (src/ui/buildScenarioFromSpec.m), which stays authoritative.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var SPEC_VERSION = 1;
  var OBJECT_KINDS = ["satellite", "groundStation", "target"];
  // Level 1 propagators; "TLE" arrives with TLE satellites in Level 2.
  var PROPAGATORS = ["Keplerian", "EcksteinHechler", "Numerical"];
  var MAX_OBJECTS = 300;
  var MAX_SATELLITES = 200;
  var MAX_DURATION_SECONDS = 30 * 86400;
  var EARTH_RADIUS_KM = 6378.137;

  // Same fallback palettes as Orbit.data so spec-driven objects keep the
  // colors the payload-driven renderers would have picked.
  var SAT_COLORS = ["#e8a33d", "#4fb8d1", "#5fc98f", "#c77ddb", "#e0705c", "#7d92db"];
  var GROUND_COLORS = ["#4f6fd1", "#d1904f", "#4fd1a3", "#d14f8a"];

  // ---- templates (defaults mirror the React console's insert dialogs) ------

  function keplerianSatelliteTemplate(name) {
    return {
      kind: "satellite",
      name: name,
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

  function groundStationTemplate(name) {
    return {
      kind: "groundStation",
      name: name,
      color: "",
      latitudeDeg: 38.8339,
      longitudeDeg: -104.8214,
      altitudeM: 1840,
      minElevationDeg: 5,
    };
  }

  function targetTemplate(name) {
    return {
      kind: "target",
      name: name,
      color: "",
      latitudeDeg: 39.7392,
      longitudeDeg: -104.9903,
      altitudeM: 1609,
      priority: 5,
    };
  }

  // ---- naming ---------------------------------------------------------------

  function objectNames(spec) {
    return ((spec && spec.objects) || []).map(function (o) { return o.name; });
  }

  // Next free "<base>-N" name, like the MATLAB UI's nextObjectName.
  function nextObjectName(spec, base) {
    var names = {};
    objectNames(spec).forEach(function (n) { names[n] = true; });
    for (var i = 1; ; i++) {
      var candidate = base + "-" + i;
      if (!names[candidate]) return candidate;
    }
  }

  // ---- time -------------------------------------------------------------------

  function parseEpochMs(epochUtc) {
    if (typeof epochUtc !== "string") return NaN;
    // Require an explicit UTC ISO timestamp so MATLAB and JS agree.
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(epochUtc)) {
      return NaN;
    }
    return new Date(epochUtc).getTime();
  }

  function normalizeEpochUtc(epochUtc) {
    var ms = Date.parse(epochUtc || "");
    if (!isFinite(ms)) return null;
    var iso = new Date(ms).toISOString(); // 2026-07-05T00:00:00.000Z
    return iso.slice(-5) === ".000Z" ? iso.slice(0, 19) + "Z" : iso;
  }

  // ---- validation ---------------------------------------------------------------

  function isFiniteNumber(v) {
    return typeof v === "number" && isFinite(v);
  }

  function inRange(v, lo, hi) {
    return isFiniteNumber(v) && v >= lo && v <= hi;
  }

  function validateSatellite(obj, errors, where) {
    if (obj.orbit && obj.orbit.type === "tle") {
      errors.push(where + ": TLE satellites are not supported in this console yet.");
      return;
    }
    if (PROPAGATORS.indexOf(obj.propagator) < 0) {
      errors.push(where + ": unknown propagator '" + obj.propagator + "'.");
    }
    if (obj.sensor !== undefined) {
      errors.push(where + ": sensors are not supported in this console yet.");
    }
    if (obj.maneuvers !== undefined && !(Array.isArray(obj.maneuvers) && obj.maneuvers.length === 0)) {
      errors.push(where + ": maneuvers are not supported in this console yet.");
    }
    if (obj.massKg !== undefined && !inRange(obj.massKg, 0.1, 1e7)) {
      errors.push(where + ": mass must be a positive number of kg.");
    }
    var orbit = obj.orbit;
    if (!orbit || typeof orbit !== "object") {
      errors.push(where + ": satellite needs an orbit definition.");
      return;
    }
    if (orbit.type !== "keplerian") {
      errors.push(where + ": unknown orbit type '" + (orbit && orbit.type) + "'.");
      return;
    }
    if (!inRange(orbit.semiMajorAxisKm, EARTH_RADIUS_KM + 1, 2e6)) {
      errors.push(where + ": semi-major axis must be above Earth's radius (" +
        EARTH_RADIUS_KM + " km).");
    }
    if (!inRange(orbit.eccentricity, 0, 0.999999)) {
      errors.push(where + ": eccentricity must be in [0, 1).");
    }
    if (inRange(orbit.semiMajorAxisKm, EARTH_RADIUS_KM + 1, 2e6) &&
        inRange(orbit.eccentricity, 0, 0.999999) &&
        orbit.semiMajorAxisKm * (1 - orbit.eccentricity) < EARTH_RADIUS_KM + 90) {
      errors.push(where + ": perigee is below ~90 km altitude.");
    }
    [["inclinationDeg", -180, 180],
     ["raanDeg", -360, 360],
     ["argPerigeeDeg", -360, 360],
     ["trueAnomalyDeg", -360, 360]].forEach(function (spec3) {
      var field = spec3[0], lo = spec3[1], hi = spec3[2];
      if (!inRange(orbit[field], lo, hi)) {
        errors.push(where + ": " + field + " must be a number in [" + lo + ", " + hi + "].");
      }
    });
  }

  function validateGroundGeodetics(obj, errors, where) {
    if (!inRange(obj.latitudeDeg, -90, 90)) {
      errors.push(where + ": latitude must be in [-90, 90] deg.");
    }
    if (!inRange(obj.longitudeDeg, -180, 180)) {
      errors.push(where + ": longitude must be in [-180, 180] deg.");
    }
    if (!inRange(obj.altitudeM, -500, 100000)) {
      errors.push(where + ": altitude must be in [-500, 100000] m.");
    }
  }

  // Returns a list of human-readable problems; empty means the spec is valid.
  function validateSpec(spec) {
    var errors = [];
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      return ["Spec must be an object."];
    }
    if (spec.version !== SPEC_VERSION) {
      errors.push("Spec version must be " + SPEC_VERSION + ".");
    }

    var meta = spec.meta;
    if (!meta || typeof meta !== "object") {
      errors.push("Spec is missing meta.");
    } else {
      if (typeof meta.name !== "string" || meta.name.trim().length === 0) {
        errors.push("Scenario name cannot be empty.");
      }
      if (isNaN(parseEpochMs(meta.epochUtc))) {
        errors.push("Epoch must be an ISO UTC timestamp like 2026-07-05T00:00:00Z.");
      }
      if (!inRange(meta.durationSeconds, 60, MAX_DURATION_SECONDS)) {
        errors.push("Duration must be between 60 s and " +
          (MAX_DURATION_SECONDS / 86400) + " days.");
      }
      if (!inRange(meta.stepSeconds, 1, 3600)) {
        errors.push("Time step must be between 1 and 3600 seconds.");
      } else if (isFiniteNumber(meta.durationSeconds) &&
                 meta.durationSeconds / meta.stepSeconds > 50000) {
        errors.push("Duration / step yields more than 50000 samples per object.");
      }
    }

    if (spec.tasks !== undefined && !(Array.isArray(spec.tasks) && spec.tasks.length === 0)) {
      errors.push("Sensor tasks are not supported in this console yet.");
    }
    if (spec.accessRequests !== undefined &&
        !(Array.isArray(spec.accessRequests) && spec.accessRequests.length === 0)) {
      errors.push("Access requests are not supported in this console yet.");
    }

    if (!Array.isArray(spec.objects)) {
      errors.push("Spec objects must be an array.");
      return errors;
    }
    if (spec.objects.length > MAX_OBJECTS) {
      errors.push("At most " + MAX_OBJECTS + " objects are supported.");
    }

    var seen = {};
    var satCount = 0;
    spec.objects.forEach(function (obj, i) {
      var where = "objects[" + i + "] (" + ((obj && obj.name) || "?") + ")";
      if (!obj || typeof obj !== "object") {
        errors.push(where + ": must be an object.");
        return;
      }
      if (OBJECT_KINDS.indexOf(obj.kind) < 0) {
        errors.push(where + ": unknown kind '" + obj.kind + "'.");
        return;
      }
      if (typeof obj.name !== "string" || obj.name.trim().length === 0) {
        errors.push(where + ": name cannot be empty.");
      } else if (seen[obj.name]) {
        errors.push(where + ": duplicate object name '" + obj.name + "'.");
      } else {
        seen[obj.name] = true;
      }
      if (obj.color && !/^#[0-9a-fA-F]{6}$/.test(obj.color)) {
        errors.push(where + ": color must be a #rrggbb hex string.");
      }

      if (obj.kind === "satellite") {
        satCount += 1;
        validateSatellite(obj, errors, where);
      } else if (obj.kind === "groundStation") {
        validateGroundGeodetics(obj, errors, where);
        if (obj.minElevationDeg !== undefined && !inRange(obj.minElevationDeg, -90, 90)) {
          errors.push(where + ": min elevation must be in [-90, 90] deg.");
        }
      } else if (obj.kind === "target") {
        validateGroundGeodetics(obj, errors, where);
        if (obj.priority !== undefined && !inRange(obj.priority, 0, 1e6)) {
          errors.push(where + ": priority must be a nonnegative number.");
        }
      }
    });
    if (satCount > MAX_SATELLITES) {
      errors.push("At most " + MAX_SATELLITES + " satellites are supported.");
    }

    return errors;
  }

  // ---- cleanup / comparison ------------------------------------------------------

  // Remove undefined/null/"" fields so specs survive MATLAB's
  // jsondecode/jsonencode round trip unchanged (MATLAB turns null into []
  // which would break equality).
  function stripEmptyFields(value) {
    if (Array.isArray(value)) return value.map(stripEmptyFields);
    if (value && typeof value === "object") {
      var out = {};
      Object.keys(value).forEach(function (k) {
        var v = value[k];
        if (v === undefined || v === null || v === "") return;
        out[k] = stripEmptyFields(v);
      });
      return out;
    }
    return value;
  }

  // Structural deep-equality over JSON-safe values; key order is irrelevant.
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      return a.every(function (v, i) { return deepEqual(v, b[i]); });
    }
    if (typeof a === "object") {
      var keys = Object.keys(a).filter(function (k) { return a[k] !== undefined; });
      var keysB = Object.keys(b).filter(function (k) { return b[k] !== undefined; });
      if (keys.length !== keysB.length) return false;
      return keys.every(function (k) { return deepEqual(a[k], b[k]); });
    }
    return false;
  }

  // MATLAB's jsonencode flattens 1-element arrays to scalars; undo that for
  // the fields we care about so comparisons and iteration stay uniform.
  function asArray(v) {
    if (v === undefined || v === null) return [];
    return Array.isArray(v) ? v : [v];
  }

  function normalizeSpecShape(spec) {
    if (!spec || typeof spec !== "object") return spec;
    var out = {};
    Object.keys(spec).forEach(function (k) { out[k] = spec[k]; });
    out.objects = asArray(spec.objects);
    if (spec.tasks !== undefined) out.tasks = asArray(spec.tasks);
    if (spec.accessRequests !== undefined) out.accessRequests = asArray(spec.accessRequests);
    return out;
  }

  // ---- derivation from a propagated payload ---------------------------------------

  // Build an editable spec from a propagated scenario payload (the bundled
  // sample or a MATLAB result). Keplerian satellites keep their elements;
  // other definition types cannot be reconstructed and are skipped.
  function deriveSpecFromScenario(raw) {
    var objects = [];
    asArray(raw && raw.satellites).forEach(function (sat) {
      if (!sat.elements) return;
      objects.push(stripEmptyFields({
        kind: "satellite",
        name: sat.name,
        color: sat.color || "",
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
      }));
    });
    asArray(raw && raw.groundPoints).forEach(function (gp) {
      if (gp.type === "Target") {
        objects.push(stripEmptyFields({
          kind: "target",
          name: gp.name,
          color: gp.color || "",
          latitudeDeg: gp.latitudeDeg,
          longitudeDeg: gp.longitudeDeg,
          altitudeM: gp.altitudeM || 0,
          priority: gp.priority == null ? 1 : gp.priority,
        }));
      } else {
        objects.push(stripEmptyFields({
          kind: "groundStation",
          name: gp.name,
          color: gp.color || "",
          latitudeDeg: gp.latitudeDeg,
          longitudeDeg: gp.longitudeDeg,
          altitudeM: gp.altitudeM || 0,
          minElevationDeg: gp.minElevationDeg == null ? 5 : gp.minElevationDeg,
        }));
      }
    });
    var meta = (raw && raw.meta) || {};
    return {
      version: SPEC_VERSION,
      rev: 0,
      meta: {
        name: meta.name || "Untitled Scenario",
        epochUtc: normalizeEpochUtc(meta.epochUtc) || "2026-01-01T00:00:00Z",
        durationSeconds: isFiniteNumber(meta.durationSeconds) ? meta.durationSeconds : 86400,
        stepSeconds: isFiniteNumber(meta.stepSeconds) ? meta.stepSeconds : 60,
      },
      objects: objects,
    };
  }

  // ---- freshness -------------------------------------------------------------------

  // "rev" is a save counter, not scenario content; ignore it when comparing.
  function compareForm(spec) {
    var stripped = stripEmptyFields(normalizeSpecShape(spec));
    delete stripped.rev;
    return stripped;
  }

  // True when the propagated payload still reflects this spec. Payloads from
  // /api/run-scenario embed the spec they were built from; demo/sample
  // payloads do not, so those are compared against their own derivation.
  function matchesScenario(spec, raw) {
    if (!spec || !raw) return false;
    var reference = raw.spec ? raw.spec : deriveSpecFromScenario(raw);
    return deepEqual(compareForm(spec), compareForm(reference));
  }

  // ---- display helpers ----------------------------------------------------------------

  // Ground objects are fully defined by the spec; project them into the shape
  // the 2D/3D renderers and hit testing expect (Orbit.data.parseScenario's
  // ground rows) so inserts/edits/deletes show up before any MATLAB run.
  function displayGrounds(spec) {
    var grounds = [];
    ((spec && spec.objects) || []).forEach(function (obj) {
      if (obj.kind !== "groundStation" && obj.kind !== "target") return;
      grounds.push({
        kind: obj.kind === "target" ? "target" : "groundStation",
        name: obj.name,
        color: obj.color || GROUND_COLORS[grounds.length % GROUND_COLORS.length],
        latDeg: obj.latitudeDeg,
        lonDeg: obj.longitudeDeg,
        altM: obj.altitudeM || 0,
        minElevationDeg: obj.minElevationDeg == null ? null : obj.minElevationDeg,
        priority: obj.priority == null ? null : obj.priority,
      });
    });
    return grounds;
  }

  function satColor(obj, index) {
    return obj.color || SAT_COLORS[index % SAT_COLORS.length];
  }

  Orbit.spec = {
    SPEC_VERSION: SPEC_VERSION,
    OBJECT_KINDS: OBJECT_KINDS,
    PROPAGATORS: PROPAGATORS,
    MAX_OBJECTS: MAX_OBJECTS,
    MAX_SATELLITES: MAX_SATELLITES,
    MAX_DURATION_SECONDS: MAX_DURATION_SECONDS,
    EARTH_RADIUS_KM: EARTH_RADIUS_KM,
    keplerianSatelliteTemplate: keplerianSatelliteTemplate,
    groundStationTemplate: groundStationTemplate,
    targetTemplate: targetTemplate,
    objectNames: objectNames,
    nextObjectName: nextObjectName,
    parseEpochMs: parseEpochMs,
    normalizeEpochUtc: normalizeEpochUtc,
    validateSpec: validateSpec,
    stripEmptyFields: stripEmptyFields,
    deepEqual: deepEqual,
    asArray: asArray,
    normalizeSpecShape: normalizeSpecShape,
    deriveSpecFromScenario: deriveSpecFromScenario,
    matchesScenario: matchesScenario,
    displayGrounds: displayGrounds,
    satColor: satColor,
  };
})();
