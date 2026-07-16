// Orbit.spec - the editable scenario spec: templates, validation, cleanup,
// and derivation from a propagated payload. Level 4 subset of
// apps/orbit-ui/src/lib/spec.js: meta, Keplerian and TLE satellites, Walker
// constellations, ground stations, point targets, area targets (grouped
// grids), satellite sensors, access requests, sensor tasks (point tracking
// and area scans), and impulsive maneuvers. Validation must agree with the
// MATLAB side (src/ui/buildScenarioFromSpec.m), which stays authoritative.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var SPEC_VERSION = 1;
  var OBJECT_KINDS = ["satellite", "groundStation", "target"];
  var PROPAGATORS = ["Keplerian", "EcksteinHechler", "Numerical", "TLE"];
  var MAX_OBJECTS = 300;
  var MAX_SATELLITES = 200;
  var MAX_DURATION_SECONDS = 30 * 86400;
  var EARTH_RADIUS_KM = 6378.137;

  var SENSOR_POINTING_MODES = ["Nadir", "VelocityVector", "SunPointing", "FixedVector"];
  var TASK_TYPES = ["TrackPointTarget", "ScanAreaTarget"];
  var MAX_TASKS = 24;
  var MAX_ACCESS_REQUESTS = 80;
  var MANEUVER_FRAMES = ["TNW", "Inertial"];
  var MAX_MANEUVERS_PER_SATELLITE = 8;
  var MAX_MANEUVER_DELTA_V_MPS = 10000;

  var MAX_AREA_GRID_POINTS = 100;

  // Approximate km->deg conversion used for area grids.
  // 1 deg latitude ~ 111.32 km; longitude scaled by cos(latitude).
  var KM_PER_DEG_LAT = 111.32;

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

  function tleSatelliteTemplate(name) {
    return {
      kind: "satellite",
      name: name,
      color: "",
      propagator: "TLE",
      massKg: 1000,
      orbit: {
        type: "tle",
        line1: "1 25544U 98067A   24183.51782528  .00016717  00000+0  30403-3 0  9995",
        line2: "2 25544  51.6416 197.2432 0007782 103.9422 356.9484 15.49376197459965",
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

  function constellationTemplate(prefix) {
    return {
      pattern: "delta", // "delta" | "star"
      prefix: prefix,
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

  function areaTargetTemplate(name) {
    return {
      name: name,
      centerLatDeg: 39.0,
      centerLonDeg: -105.5,
      altitudeM: 0,
      widthKm: 100,
      heightKm: 100,
      spacingKm: 50,
      priority: 5,
    };
  }

  // Conic imaging sensor attached to a satellite. The cone half-angle is the
  // instantaneous beam (FOV); the field of regard is how far the sensor can
  // slew off its nominal boresight when tasked. Defaults mirror
  // apps/orbit-ui/src/lib/spec.js sensorTemplate.
  function sensorTemplate() {
    return {
      coneHalfAngleDeg: 20,
      fieldOfRegardDeg: 60,
      slewRateDegPerSec: 2,
      pointing: "Nadir",
    };
  }

  // Effective sensor label: an explicit sensor name, else the backend's
  // default "<satellite> Sensor" (buildScenarioFromSpec.m uses the same
  // fallback, so tree rows and access requests agree with MATLAB).
  function sensorDisplayName(sat) {
    if (sat && sat.sensor && sat.sensor.name) return sat.sensor.name;
    return ((sat && sat.name) || "?") + " Sensor";
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

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // ---- Walker constellations --------------------------------------------------

  function wrapDegrees(deg) {
    var w = deg % 360;
    return w < 0 ? w + 360 : w;
  }

  // Expand a Walker pattern into individual Keplerian satellite spec objects.
  // Formulas and generated names mirror src/objects/ConstellationFactory.m and
  // apps/orbit-ui/src/lib/spec.js expandWalker, so a constellation inserted
  // here matches one inserted from the MATLAB or React UIs. Throws on invalid
  // pattern parameters.
  function expandWalker(params) {
    var totalSatellites = params.totalSatellites;
    var planes = params.planes;
    var phasing = params.phasing;

    if (typeof totalSatellites !== "number" || totalSatellites % 1 !== 0 ||
        totalSatellites < 1) {
      throw new Error("Total satellite count must be a positive integer.");
    }
    if (typeof planes !== "number" || planes % 1 !== 0 || planes < 1) {
      throw new Error("Plane count must be a positive integer.");
    }
    if (totalSatellites % planes !== 0) {
      throw new Error("Total satellite count must be divisible by plane count.");
    }
    if (typeof phasing !== "number" || phasing % 1 !== 0 || phasing < 0) {
      throw new Error("Walker phasing must be a nonnegative integer.");
    }

    var raanSpreadDeg = params.pattern === "star" ? 180 : 360;
    var satsPerPlane = totalSatellites / planes;
    var raanSpacingDeg = raanSpreadDeg / planes;
    var inPlaneSpacingDeg = 360 / satsPerPlane;
    var phaseSpacingDeg = (phasing * 360) / totalSatellites;
    var group = "Walker " + (params.pattern === "star" ? "Star" : "Delta") + " " +
      totalSatellites + "/" + planes + "/" + phasing;

    var satellites = [];
    for (var p = 0; p < planes; p++) {
      var raanDeg = wrapDegrees(params.raanOffsetDeg + p * raanSpacingDeg);
      var planePhaseDeg = p * phaseSpacingDeg;
      for (var s = 0; s < satsPerPlane; s++) {
        satellites.push({
          kind: "satellite",
          name: params.prefix + "-P" + pad2(p + 1) + "-S" + pad2(s + 1),
          color: "",
          propagator: params.propagator || "Keplerian",
          massKg: 1000,
          group: group,
          orbit: {
            type: "keplerian",
            semiMajorAxisKm: params.semiMajorAxisKm,
            eccentricity: params.eccentricity,
            inclinationDeg: params.inclinationDeg,
            raanDeg: raanDeg,
            argPerigeeDeg: params.argPerigeeDeg,
            trueAnomalyDeg: wrapDegrees(
              params.trueAnomalyOffsetDeg + s * inPlaneSpacingDeg + planePhaseDeg),
          },
        });
      }
    }
    return satellites;
  }

  // ---- area targets -------------------------------------------------------------

  // Expand a rectangular area target into a grid of point targets, mirroring
  // apps/orbit-ui/src/lib/spec.js expandAreaGrid. Each point carries a
  // `group` tag (the area's name) and an `area` block describing the parent
  // rectangle; MATLAB rebuilds one AreaTargetObject per group from these and
  // otherwise sees ordinary point targets. The rectangle is split into equal
  // cells no larger than the requested spacing, one point per cell center.
  // Throws on invalid parameters.
  function expandAreaGrid(params) {
    var name = params.name;
    var altitudeM = params.altitudeM == null ? 0 : params.altitudeM;
    var priority = params.priority == null ? 5 : params.priority;

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error("Area target name cannot be empty.");
    }
    [["Center latitude", params.centerLatDeg, -90, 90],
     ["Center longitude", params.centerLonDeg, -180, 180],
     ["Width", params.widthKm, 1, 5000],
     ["Height", params.heightKm, 1, 5000],
     ["Grid spacing", params.spacingKm, 1, 5000]].forEach(function (rule) {
      var v = rule[1];
      if (!(typeof v === "number" && isFinite(v) && v >= rule[2] && v <= rule[3])) {
        throw new Error(rule[0] + " must be a number between " + rule[2] +
          " and " + rule[3] + ".");
      }
    });

    var rows = Math.max(1, Math.ceil(params.heightKm / params.spacingKm));
    var cols = Math.max(1, Math.ceil(params.widthKm / params.spacingKm));
    if (rows * cols > MAX_AREA_GRID_POINTS) {
      throw new Error("Grid would have " + (rows * cols) + " points (max " +
        MAX_AREA_GRID_POINTS + "). Increase the spacing or shrink the area.");
    }

    var cosLat = Math.cos((params.centerLatDeg * Math.PI) / 180);
    if (cosLat < 0.05) {
      throw new Error("Area grids are not supported within ~87 deg of a pole.");
    }
    var heightDeg = params.heightKm / KM_PER_DEG_LAT;
    var widthDeg = params.widthKm / (KM_PER_DEG_LAT * cosLat);
    if (params.centerLatDeg + heightDeg / 2 > 90 ||
        params.centerLatDeg - heightDeg / 2 < -90) {
      throw new Error("Area grid extends beyond a pole - shrink the height.");
    }

    var area = {
      name: name,
      centerLatDeg: params.centerLatDeg,
      centerLonDeg: params.centerLonDeg,
      widthKm: params.widthKm,
      heightKm: params.heightKm,
      spacingKm: params.spacingKm,
    };
    var targets = [];
    for (var r = 0; r < rows; r++) {
      var lat = params.centerLatDeg + ((r + 0.5) / rows - 0.5) * heightDeg;
      for (var c = 0; c < cols; c++) {
        var lon = params.centerLonDeg + ((c + 0.5) / cols - 0.5) * widthDeg;
        if (lon > 180) lon -= 360;
        if (lon < -180) lon += 360;
        var copy = {};
        Object.keys(area).forEach(function (k) { copy[k] = area[k]; });
        targets.push({
          kind: "target",
          name: name + "-R" + pad2(r + 1) + "C" + pad2(c + 1),
          color: "",
          group: name,
          area: copy,
          latitudeDeg: lat,
          longitudeDeg: lon,
          altitudeM: altitudeM,
          priority: priority,
        });
      }
    }
    return targets;
  }

  // Split point targets into standalone points and per-area grid groups
  // (insertion order preserved). areas is an ordered array of
  // { name, points } so callers can render the groups deterministically.
  function groupTargets(objects) {
    var points = [];
    var areas = [];
    var byName = {};
    (objects || []).forEach(function (obj) {
      if (!obj || obj.kind !== "target") return;
      if (obj.group) {
        if (!byName[obj.group]) {
          byName[obj.group] = { name: obj.group, points: [] };
          areas.push(byName[obj.group]);
        }
        byName[obj.group].points.push(obj);
      } else {
        points.push(obj);
      }
    });
    return { points: points, areas: areas };
  }

  function areaGroup(spec, groupName) {
    var groups = groupTargets((spec && spec.objects) || []).areas;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === groupName) return groups[i];
    }
    return null;
  }

  // Lat/lon corners of an area's rectangle as a closed ring of [lonDeg,
  // latDeg] pairs (NW -> NE -> SE -> SW -> NW), matching the equirectangular
  // approximation expandAreaGrid used to lay out the grid so the outline
  // frames exactly the points it was generated from.
  function areaRectRing(area) {
    var cosLat = Math.cos((area.centerLatDeg * Math.PI) / 180);
    if (cosLat < 0.05) cosLat = 0.05;
    var heightDeg = area.heightKm / KM_PER_DEG_LAT;
    var widthDeg = area.widthKm / (KM_PER_DEG_LAT * cosLat);
    var n = Math.min(90, area.centerLatDeg + heightDeg / 2);
    var s = Math.max(-90, area.centerLatDeg - heightDeg / 2);
    var w = area.centerLonDeg - widthDeg / 2;
    var e = area.centerLonDeg + widthDeg / 2;
    return [[w, n], [e, n], [e, s], [w, s], [w, n]];
  }

  // ---- sensor tasks & maneuvers -------------------------------------------------

  function nextTaskId(spec) {
    var ids = {};
    asArray(spec && spec.tasks).forEach(function (t) { if (t) ids[t.id] = true; });
    for (var i = 1; ; i++) {
      var candidate = "task-" + i;
      if (!ids[candidate]) return candidate;
    }
  }

  // Point-target imaging task for the sensor scheduler. satelliteName ""
  // means any satellite sensor may perform it. Defaults mirror
  // apps/orbit-ui/src/lib/spec.js taskTemplate.
  function taskTemplate(spec) {
    var target = null;
    ((spec && spec.objects) || []).forEach(function (o) {
      if (!target && o && o.kind === "target") target = o;
    });
    return {
      id: nextTaskId(spec),
      name: "",
      satelliteName: "",
      taskType: "TrackPointTarget",
      targetName: target ? target.name : "",
      priority: 5,
      dwellSeconds: 60,
    };
  }

  // Impulsive delta-V applied to a satellite during propagation
  // (src/objects/ImpulsiveManeuver.m). timeOffsetSec is seconds after the
  // scenario epoch; deltaVmps is a 3-vector in `frame` (TNW components are
  // [along-track, in-plane normal, cross-track] m/s; Inertial is GCRF).
  function maneuverTemplate() {
    return {
      name: "",
      timeOffsetSec: 1800,
      frame: "TNW",
      deltaVmps: [10, 0, 0],
    };
  }

  // Display label for a task row: the explicit name, else the id.
  function taskLabel(task) {
    return (task && (task.name || task.id)) || "?";
  }

  // Every target a task could image: standalone point targets and grid
  // points individually, plus each area group as a whole (a ScanAreaTarget
  // against the group name). Returns [{ value, label, area }].
  function taskTargetOptions(spec) {
    var grouped = groupTargets((spec && spec.objects) || []);
    var options = [];
    grouped.points.forEach(function (t) {
      options.push({ value: t.name, label: t.name, area: false });
    });
    grouped.areas.forEach(function (g) {
      options.push({
        value: g.name,
        label: g.name + " - scan whole area (" + g.points.length + " pts)",
        area: true,
      });
      g.points.forEach(function (t) {
        options.push({ value: t.name, label: t.name, area: false });
      });
    });
    return options;
  }

  // Task type implied by a target selection: an area group name means a
  // whole-area scan, anything else tracks a point target. Mirrors the React
  // console, where an area group wins a name collision.
  function taskTypeForTarget(spec, targetName) {
    return areaGroup(spec, targetName) ? "ScanAreaTarget" : "TrackPointTarget";
  }

  // ---- task / access-request references ---------------------------------------

  function taskRefersTo(task, names) {
    return names[task.targetName] === true || names[task.satelliteName] === true;
  }

  function requestRefersTo(req, names) {
    return names[req.sourceName] === true || names[req.targetName] === true ||
      names[req.platformName] === true;
  }

  function nameLookup(nameList) {
    var names = {};
    (nameList || []).forEach(function (n) { names[n] = true; });
    return names;
  }

  // Count tasks and access requests referencing any of the given names.
  function countReferences(spec, nameList) {
    var names = nameLookup(nameList);
    var tasks = asArray(spec && spec.tasks).filter(function (t) {
      return t && taskRefersTo(t, names);
    }).length;
    var requests = asArray(spec && spec.accessRequests).filter(function (r) {
      return r && requestRefersTo(r, names);
    }).length;
    return { tasks: tasks, accessRequests: requests, total: tasks + requests };
  }

  // Tasks/access requests with references renamed from oldName to newName.
  // Returns { changes, count }; `changes` only carries the keys the spec had.
  function renameReferences(spec, oldName, newName) {
    var count = 0;
    var changes = {};
    if (spec.tasks !== undefined) {
      changes.tasks = asArray(spec.tasks).map(function (t) {
        if (!t || !taskRefersTo(t, nameLookup([oldName]))) return t;
        count++;
        var next = {};
        Object.keys(t).forEach(function (k) { next[k] = t[k]; });
        if (next.targetName === oldName) next.targetName = newName;
        if (next.satelliteName === oldName) next.satelliteName = newName;
        return next;
      });
    }
    if (spec.accessRequests !== undefined) {
      changes.accessRequests = asArray(spec.accessRequests).map(function (r) {
        if (!r || !requestRefersTo(r, nameLookup([oldName]))) return r;
        count++;
        var next = {};
        Object.keys(r).forEach(function (k) { next[k] = r[k]; });
        if (next.sourceName === oldName) next.sourceName = newName;
        if (next.targetName === oldName) next.targetName = newName;
        if (next.platformName === oldName) next.platformName = newName;
        return next;
      });
    }
    return { changes: changes, count: count };
  }

  // Tasks/access requests with references to any of the names removed.
  // Returns { changes, removed: { tasks, accessRequests } }.
  function pruneReferences(spec, nameList) {
    var names = nameLookup(nameList);
    var removed = { tasks: 0, accessRequests: 0 };
    var changes = {};
    if (spec.tasks !== undefined) {
      changes.tasks = asArray(spec.tasks).filter(function (t) {
        var hit = t && taskRefersTo(t, names);
        if (hit) removed.tasks++;
        return !hit;
      });
    }
    if (spec.accessRequests !== undefined) {
      changes.accessRequests = asArray(spec.accessRequests).filter(function (r) {
        var hit = r && requestRefersTo(r, names);
        if (hit) removed.accessRequests++;
        return !hit;
      });
    }
    return { changes: changes, removed: removed };
  }

  // ---- sensors & access requests -----------------------------------------------

  function isSensorRequest(req) {
    return !!req && (req.type == null ? "access" : req.type) === "sensor";
  }

  function sensorRequestPlatform(req) {
    return req.platformName != null ? req.platformName : req.sourceName;
  }

  // Human-readable "A -> B" label for a request (sensor requests lead with
  // the sensor name, matching the tree rows the React console renders).
  function accessRequestLabel(req) {
    if (isSensorRequest(req)) {
      var sensor = req.sensorName || ((sensorRequestPlatform(req) || "?") + " Sensor");
      return sensor + " -> " + (req.targetName || "?");
    }
    return (req.sourceName || "?") + " -> " + (req.targetName || "?");
  }

  // Every access pair the current spec could request: satellite/ground
  // access, satellite/satellite line of sight, and sensor/target FOR-FOV
  // visibility. Mirrors apps/orbit-ui/src/lib/spec.js accessRequestOptions.
  // Returns [{ key, label, meta, request }].
  function accessRequestOptions(spec) {
    var objects = (spec && spec.objects) || [];
    var satellites = objects.filter(function (o) { return o && o.kind === "satellite"; });
    var stations = objects.filter(function (o) { return o && o.kind === "groundStation"; });
    var targets = objects.filter(function (o) { return o && o.kind === "target"; });
    var areas = groupTargets(objects).areas;
    var options = [];

    satellites.forEach(function (sat) {
      stations.forEach(function (ground) {
        var request = { type: "access", sourceName: sat.name, targetName: ground.name };
        options.push({
          key: accessRequestKey(request),
          label: sat.name + " -> " + ground.name,
          meta: "satellite / ground access",
          request: request,
        });
      });
    });

    for (var i = 0; i < satellites.length; i++) {
      for (var j = i + 1; j < satellites.length; j++) {
        var losRequest = {
          type: "access",
          sourceName: satellites[i].name,
          targetName: satellites[j].name,
        };
        options.push({
          key: accessRequestKey(losRequest),
          label: satellites[i].name + " -> " + satellites[j].name,
          meta: "satellite / satellite line of sight",
          request: losRequest,
        });
      }
    }

    satellites.filter(function (s) { return !!s.sensor; }).forEach(function (sat) {
      var sensorName = sensorDisplayName(sat);
      targets.forEach(function (target) {
        var sensorRequest = {
          type: "sensor",
          platformName: sat.name,
          sensorName: sensorName,
          targetName: target.name,
        };
        options.push({
          key: accessRequestKey(sensorRequest),
          label: sensorName + " -> " + target.name,
          meta: "sensor FOR / FOV visibility",
          request: sensorRequest,
        });
      });
      areas.forEach(function (area) {
        var areaRequest = {
          type: "sensor",
          platformName: sat.name,
          sensorName: sensorName,
          targetName: area.name,
        };
        options.push({
          key: accessRequestKey(areaRequest),
          label: sensorName + " -> " + area.name,
          meta: "sensor / area FOR projection",
          request: areaRequest,
        });
      });
    });

    return options;
  }

  // Whole-area sensor requests only. Used by the dedicated Sensor / Area
  // workspace so its selectors never list point targets or area grid points.
  function sensorAreaAccessOptions(spec) {
    return accessRequestOptions(spec).filter(function (option) {
      return option.request.type === "sensor" &&
        !!areaGroup(spec, option.request.targetName);
    });
  }

  // Sensor requests on a platform carry the sensor name explicitly; keep
  // them in sync when the sensor (or its satellite, when the sensor uses
  // the default "<satellite> Sensor" name) is renamed.
  // Returns { changes, count }; `changes` only carries accessRequests when
  // the spec had the key.
  function renameSensorRequests(spec, satName, newSensorName) {
    var count = 0;
    var changes = {};
    if (spec.accessRequests !== undefined) {
      changes.accessRequests = asArray(spec.accessRequests).map(function (r) {
        if (!isSensorRequest(r) || sensorRequestPlatform(r) !== satName ||
            r.sensorName === newSensorName) {
          return r;
        }
        count++;
        var next = {};
        Object.keys(r).forEach(function (k) { next[k] = r[k]; });
        next.sensorName = newSensorName;
        return next;
      });
    }
    return { changes: changes, count: count };
  }

  // When a satellite loses its sensor: drop the sensor visibility requests
  // that need it and unpin tasks so they fall back to "any sensor" instead
  // of failing validation (same behavior as the React console).
  // Returns { changes, removedRequests, retargetedTasks }.
  function detachSensorReferences(spec, satName) {
    var removedRequests = 0;
    var retargetedTasks = 0;
    var changes = {};
    if (spec.accessRequests !== undefined) {
      changes.accessRequests = asArray(spec.accessRequests).filter(function (r) {
        var hit = isSensorRequest(r) && sensorRequestPlatform(r) === satName;
        if (hit) removedRequests++;
        return !hit;
      });
    }
    if (spec.tasks !== undefined) {
      changes.tasks = asArray(spec.tasks).map(function (t) {
        if (!t || t.satelliteName !== satName) return t;
        retargetedTasks++;
        var next = {};
        Object.keys(t).forEach(function (k) { next[k] = t[k]; });
        delete next.satelliteName;
        return next;
      });
    }
    return {
      changes: changes,
      removedRequests: removedRequests,
      retargetedTasks: retargetedTasks,
    };
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

  function isVector3(v) {
    return Array.isArray(v) && v.length === 3 && v.every(isFiniteNumber);
  }

  function vectorNorm(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  function validateSensor(sensor, errors, where) {
    if (typeof sensor !== "object" || sensor === null) {
      errors.push(where + ": sensor must be an object.");
      return;
    }
    if (sensor.name !== undefined &&
        (typeof sensor.name !== "string" || sensor.name.trim().length === 0)) {
      errors.push(where + ": sensor name must be a non-empty string.");
    }
    if (!inRange(sensor.coneHalfAngleDeg, 0.1, 90)) {
      errors.push(where + ": sensor cone half-angle must be in (0, 90] deg.");
    }
    if (!inRange(sensor.fieldOfRegardDeg, 0.1, 180) ||
        (isFiniteNumber(sensor.coneHalfAngleDeg) &&
         sensor.fieldOfRegardDeg < sensor.coneHalfAngleDeg)) {
      errors.push(where + ": field of regard must be in [cone half-angle, 180] deg.");
    }
    if (sensor.slewRateDegPerSec !== undefined &&
        !inRange(sensor.slewRateDegPerSec, 0.01, 60)) {
      errors.push(where + ": slew rate must be in (0, 60] deg/s.");
    }
    var pointing = sensor.pointing == null ? "Nadir" : sensor.pointing;
    if (SENSOR_POINTING_MODES.indexOf(pointing) < 0) {
      errors.push(where + ": sensor pointing must be one of " +
        SENSOR_POINTING_MODES.join(", ") + ".");
    } else if (pointing === "FixedVector") {
      if (!isVector3(sensor.boresight)) {
        errors.push(where + ": FixedVector pointing needs a finite boresight [x, y, z].");
      } else if (vectorNorm(sensor.boresight) < 1e-9) {
        errors.push(where + ": boresight vector cannot be zero.");
      }
    }
  }

  function validateManeuvers(obj, errors, where, meta) {
    var maneuvers = obj.maneuvers;
    if (maneuvers === undefined) return;
    if (!Array.isArray(maneuvers)) {
      errors.push(where + ": maneuvers must be an array.");
      return;
    }
    if (maneuvers.length > MAX_MANEUVERS_PER_SATELLITE) {
      errors.push(where + ": at most " + MAX_MANEUVERS_PER_SATELLITE +
        " maneuvers per satellite.");
    }
    if (maneuvers.length > 0 && obj.propagator === "TLE") {
      errors.push(where +
        ": SGP4 satellites cannot maneuver - switch the propagator to Numerical.");
    }
    var maxOffset = meta && isFiniteNumber(meta.durationSeconds)
      ? meta.durationSeconds
      : MAX_DURATION_SECONDS;
    maneuvers.forEach(function (m, i) {
      var at = where + " maneuvers[" + i + "]";
      if (!m || typeof m !== "object") {
        errors.push(at + ": must be an object.");
        return;
      }
      if (!inRange(m.timeOffsetSec, 0, maxOffset)) {
        errors.push(at + ": time offset must be within the scenario span [0, " +
          maxOffset + "] s.");
      }
      if (m.frame !== undefined && MANEUVER_FRAMES.indexOf(m.frame) < 0) {
        errors.push(at + ": frame must be one of " + MANEUVER_FRAMES.join(", ") + ".");
      }
      if (!isVector3(m.deltaVmps)) {
        errors.push(at + ": delta-V must be a finite [x, y, z] in m/s.");
      } else {
        var magnitude = vectorNorm(m.deltaVmps);
        if (magnitude <= 0 || magnitude > MAX_MANEUVER_DELTA_V_MPS) {
          errors.push(at + ": delta-V magnitude must be in (0, " +
            MAX_MANEUVER_DELTA_V_MPS + "] m/s.");
        }
      }
    });
  }

  function validateTasks(spec, errors) {
    var tasks = spec.tasks;
    if (tasks === undefined) return;
    if (!Array.isArray(tasks)) {
      errors.push("Spec tasks must be an array.");
      return;
    }
    if (tasks.length > MAX_TASKS) {
      errors.push("At most " + MAX_TASKS + " sensor tasks are supported.");
    }
    var byName = {};
    (spec.objects || []).forEach(function (o) { if (o) byName[o.name] = o; });
    var areaNames = {};
    groupTargets(spec.objects || []).areas.forEach(function (g) {
      areaNames[g.name] = true;
    });
    var seenIds = {};
    tasks.forEach(function (task, i) {
      var where = "tasks[" + i + "] (" + ((task && task.id) || "?") + ")";
      if (!task || typeof task !== "object") {
        errors.push(where + ": must be an object.");
        return;
      }
      if (typeof task.id !== "string" || task.id.trim().length === 0) {
        errors.push(where + ": task id cannot be empty.");
      } else if (seenIds[task.id]) {
        errors.push(where + ": duplicate task id '" + task.id + "'.");
      } else {
        seenIds[task.id] = true;
      }
      var taskType = task.taskType == null ? "TrackPointTarget" : task.taskType;
      if (TASK_TYPES.indexOf(taskType) < 0) {
        errors.push(where + ": unknown taskType '" + taskType + "'.");
      }
      if (taskType === "ScanAreaTarget") {
        if (!areaNames[task.targetName]) {
          errors.push(where + ": targetName must reference an area target.");
        }
        if (task.requiredCoveragePercent !== undefined &&
            !inRange(task.requiredCoveragePercent, 0, 100)) {
          errors.push(where + ": requiredCoveragePercent must be between 0 and 100.");
        }
      } else {
        var target = byName[task.targetName];
        if (!target || target.kind !== "target") {
          errors.push(where +
            ": targetName must reference a point target in the scenario.");
        }
      }
      if (task.satelliteName) {
        var sat = byName[task.satelliteName];
        if (!sat || sat.kind !== "satellite" || !sat.sensor) {
          errors.push(where +
            ": satelliteName must reference a satellite with a sensor.");
        }
      }
      if (task.priority !== undefined && !inRange(task.priority, 0, 1e6)) {
        errors.push(where + ": priority must be a nonnegative number.");
      }
      if (task.dwellSeconds !== undefined && !inRange(task.dwellSeconds, 10, 86400)) {
        errors.push(where + ": dwell must be between 10 and 86400 seconds.");
      }
    });
  }

  function accessRequestKey(request) {
    var type = (request && request.type) || "access";
    if (type === "sensor") {
      return ["sensor",
        (request.platformName != null ? request.platformName : request.sourceName) || "",
        request.sensorName || "",
        request.targetName || ""].join("|");
    }
    return ["access",
      (request && request.sourceName) || "",
      (request && request.targetName) || ""].join("|");
  }

  function validateAccessRequests(spec, errors) {
    var requests = spec.accessRequests;
    if (requests === undefined) return;
    if (!Array.isArray(requests)) {
      errors.push("Spec accessRequests must be an array.");
      return;
    }
    if (requests.length > MAX_ACCESS_REQUESTS) {
      errors.push("At most " + MAX_ACCESS_REQUESTS + " access requests are supported.");
    }
    var byName = {};
    (spec.objects || []).forEach(function (o) { if (o) byName[o.name] = o; });
    var seen = {};
    requests.forEach(function (request, i) {
      var where = "accessRequests[" + i + "]";
      if (!request || typeof request !== "object") {
        errors.push(where + ": must be an object.");
        return;
      }
      var type = request.type == null ? "access" : request.type;
      if (type !== "access" && type !== "sensor") {
        errors.push(where + ": type must be 'access' or 'sensor'.");
        return;
      }
      var key = accessRequestKey(request);
      if (seen[key]) {
        errors.push(where + ": duplicate access request.");
      }
      seen[key] = true;

      if (type === "access") {
        var source = byName[request.sourceName];
        var target = byName[request.targetName];
        if (!source) errors.push(where + ": sourceName must reference an object.");
        if (!target) errors.push(where + ": targetName must reference an object.");
        if (source && target) {
          var supported =
            (source.kind === "satellite" && target.kind === "satellite") ||
            (source.kind === "satellite" && target.kind === "groundStation") ||
            (source.kind === "groundStation" && target.kind === "satellite");
          if (!supported) {
            errors.push(where +
              ": plain access supports satellite/ground-station or satellite/satellite pairs.");
          }
        }
        return;
      }

      var platformName = request.platformName != null
        ? request.platformName : request.sourceName;
      var platform = byName[platformName];
      var sensorTarget = byName[request.targetName];
      var sensorArea = areaGroup(spec, request.targetName);
      if (!platform || platform.kind !== "satellite" || !platform.sensor) {
        errors.push(where + ": platformName must reference a satellite with a sensor.");
      }
      if ((!sensorTarget || sensorTarget.kind !== "target") && !sensorArea) {
        errors.push(where + ": targetName must reference a point or area target.");
      }
    });
  }

  function validateSatellite(obj, errors, where, meta) {
    if (PROPAGATORS.indexOf(obj.propagator) < 0) {
      errors.push(where + ": unknown propagator '" + obj.propagator + "'.");
    }
    if (obj.sensor !== undefined) {
      validateSensor(obj.sensor, errors, where);
    }
    validateManeuvers(obj, errors, where, meta);
    if (obj.massKg !== undefined && !inRange(obj.massKg, 0.1, 1e7)) {
      errors.push(where + ": mass must be a positive number of kg.");
    }
    var orbit = obj.orbit;
    if (!orbit || typeof orbit !== "object") {
      errors.push(where + ": satellite needs an orbit definition.");
      return;
    }
    if (orbit.type === "keplerian") {
      if (obj.propagator === "TLE") {
        errors.push(where + ": the TLE propagator requires a TLE orbit.");
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
    } else if (orbit.type === "tle") {
      var l1 = typeof orbit.line1 === "string" ? orbit.line1.trim() : "";
      var l2 = typeof orbit.line2 === "string" ? orbit.line2.trim() : "";
      if (l1.indexOf("1 ") !== 0 || l1.length < 60) {
        errors.push(where + ": TLE line 1 must start with '1 ' (69 columns).");
      }
      if (l2.indexOf("2 ") !== 0 || l2.length < 60) {
        errors.push(where + ": TLE line 2 must start with '2 ' (69 columns).");
      }
      if (obj.propagator !== "TLE" && obj.propagator !== "Numerical") {
        errors.push(where + ": TLE orbits support the SGP4 or Numerical propagators.");
      }
    } else {
      errors.push(where + ": unknown orbit type '" + (orbit && orbit.type) + "'.");
    }
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
        validateSatellite(obj, errors, where, spec.meta);
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

    validateTasks(spec, errors);
    validateAccessRequests(spec, errors);

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
    out.objects = asArray(spec.objects).map(function (o) {
      // A satellite's 1-element maneuver list collapses too.
      if (o && typeof o === "object" && o.maneuvers !== undefined &&
          !Array.isArray(o.maneuvers)) {
        var copy = {};
        Object.keys(o).forEach(function (k) { copy[k] = o[k]; });
        copy.maneuvers = asArray(o.maneuvers);
        return copy;
      }
      return o;
    });
    if (spec.tasks !== undefined) out.tasks = asArray(spec.tasks);
    if (spec.accessRequests !== undefined) out.accessRequests = asArray(spec.accessRequests);
    return out;
  }

  // ---- derivation from a propagated payload ---------------------------------------

  // Build an editable spec from a propagated scenario payload (the bundled
  // sample or a MATLAB result). Keplerian satellites keep their elements;
  // other definition types cannot be reconstructed and are skipped. Targets
  // keep their area grouping so grids fold back into their groups.
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
          group: gp.group || undefined,
          area: gp.area || undefined,
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
        group: obj.group || null,
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
    MAX_AREA_GRID_POINTS: MAX_AREA_GRID_POINTS,
    MAX_ACCESS_REQUESTS: MAX_ACCESS_REQUESTS,
    MAX_TASKS: MAX_TASKS,
    TASK_TYPES: TASK_TYPES,
    MANEUVER_FRAMES: MANEUVER_FRAMES,
    MAX_MANEUVERS_PER_SATELLITE: MAX_MANEUVERS_PER_SATELLITE,
    MAX_MANEUVER_DELTA_V_MPS: MAX_MANEUVER_DELTA_V_MPS,
    SENSOR_POINTING_MODES: SENSOR_POINTING_MODES,
    EARTH_RADIUS_KM: EARTH_RADIUS_KM,
    keplerianSatelliteTemplate: keplerianSatelliteTemplate,
    tleSatelliteTemplate: tleSatelliteTemplate,
    groundStationTemplate: groundStationTemplate,
    targetTemplate: targetTemplate,
    constellationTemplate: constellationTemplate,
    areaTargetTemplate: areaTargetTemplate,
    expandWalker: expandWalker,
    expandAreaGrid: expandAreaGrid,
    groupTargets: groupTargets,
    areaGroup: areaGroup,
    areaRectRing: areaRectRing,
    sensorTemplate: sensorTemplate,
    sensorDisplayName: sensorDisplayName,
    nextTaskId: nextTaskId,
    taskTemplate: taskTemplate,
    maneuverTemplate: maneuverTemplate,
    taskLabel: taskLabel,
    taskTargetOptions: taskTargetOptions,
    taskTypeForTarget: taskTypeForTarget,
    accessRequestKey: accessRequestKey,
    accessRequestLabel: accessRequestLabel,
    accessRequestOptions: accessRequestOptions,
    sensorAreaAccessOptions: sensorAreaAccessOptions,
    renameSensorRequests: renameSensorRequests,
    detachSensorReferences: detachSensorReferences,
    countReferences: countReferences,
    renameReferences: renameReferences,
    pruneReferences: pruneReferences,
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
