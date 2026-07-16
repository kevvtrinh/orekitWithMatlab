// Orbit.merge - merge the editable spec (source of truth for what exists)
// with the most recent MATLAB payload (source of truth for propagation) into
// one render scenario with per-object freshness. Port of
// apps/orbit-ui/src/lib/renderScenario.js to the static console's shapes.
//
// Every satellite carries a `source` tag:
//   "matlab"  - the MATLAB result is fresh for this object (definition and
//               scenario timing unchanged since the run) -> authoritative.
//   "preview" - the object changed (or was never run); the browser shows an
//               instant two-body preview until the next MATLAB run.
//   "pending" - no preview possible (TLE orbits need the backend's SGP4);
//               the object is listed but not drawn until MATLAB runs.
//
// Access/schedule/sensor-access results only ever come from MATLAB. Entries
// whose endpoints were deleted are pruned; entries whose endpoints (or the
// scenario timing / task list) changed are flagged `stale` so the UI dims
// them instead of silently showing wrong windows. Sun, Earth-orientation,
// and pointing data are timing-dependent and gated on `metaFresh`.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  function asArray(value) {
    return Orbit.spec.asArray(value);
  }

  // Freshness comparison must ignore cosmetic-only jsondecode reshaping in
  // the echoed spec; stripEmptyFields + deepEqual mirror matchesScenario.
  function objectFresh(specObj, runObj) {
    if (!specObj || !runObj) return false;
    return Orbit.spec.deepEqual(
      Orbit.spec.stripEmptyFields({ version: 1, meta: {}, objects: [specObj] }).objects[0],
      Orbit.spec.stripEmptyFields({ version: 1, meta: {}, objects: [runObj] }).objects[0]);
  }

  // spec + parsed payload scenario (Orbit.data.parseScenario output) ->
  // render scenario in the same shape, with freshness. scn may be null.
  function buildRenderScenario(spec, scn) {
    if (!spec) return scn;
    var meta = spec.meta || {};
    var epochMs = Orbit.spec.parseEpochMs(meta.epochUtc);
    var raw = scn ? scn.raw : null;
    var runSpec = raw && raw.spec ? Orbit.spec.normalizeSpecShape(raw.spec) : null;
    var metaFresh = !!runSpec && Orbit.spec.deepEqual(meta, runSpec.meta);

    var runObjectByName = {};
    var runObjects = runSpec ? asArray(runSpec.objects) : [];
    runObjects.forEach(function (o) { if (o && o.name) runObjectByName[o.name] = o; });
    var scnSatByName = {};
    ((scn && scn.sats) || []).forEach(function (s) { scnSatByName[s.name] = s; });

    var freshNames = {};
    var specNames = {};
    var sats = [];
    var previewCount = 0;
    var pendingCount = 0;
    var satIndex = 0;

    (spec.objects || []).forEach(function (obj) {
      specNames[obj.name] = true;
      if (obj.kind !== "satellite") {
        // Ground objects are fully defined by the spec; MATLAB adds nothing
        // to their display state. They are "fresh" (for result gating) only
        // when the run knew this exact definition.
        if (objectFresh(obj, runObjectByName[obj.name])) freshNames[obj.name] = true;
        return;
      }
      var payloadSat = scnSatByName[obj.name];
      var fresh = metaFresh && !!payloadSat &&
        objectFresh(obj, runObjectByName[obj.name]);
      var source, t, lla, eci;
      if (fresh) {
        source = "matlab";
        t = payloadSat.t;
        lla = payloadSat.lla;
        eci = payloadSat.eci;
        freshNames[obj.name] = true;
      } else {
        var previewEph = Orbit.preview.previewEphemeris(obj, meta);
        if (previewEph) {
          source = "preview";
          previewCount++;
          t = previewEph.t;
          lla = previewEph.lla;
          eci = previewEph.eci;
        } else {
          source = "pending";
          pendingCount++;
          t = [];
          lla = [];
          eci = [];
        }
      }
      sats.push({
        kind: "satellite",
        name: obj.name,
        color: Orbit.spec.satColor(obj, satIndex++),
        group: obj.group || null,
        propagatorType: obj.propagator || "",
        orbitDefinitionType: obj.orbit && obj.orbit.type === "tle" ? "TLE" : "Keplerian",
        elements: obj.orbit && obj.orbit.type === "keplerian" ? obj.orbit : null,
        source: source,
        t: t,
        lla: lla,
        eci: eci,
      });
    });

    function endpointStale(a, b) {
      return !metaFresh || !freshNames[a] || !freshNames[b];
    }

    var accesses = ((scn && scn.accesses) || [])
      .filter(function (a) { return specNames[a.source] && specNames[a.target]; })
      .map(function (a) {
        a.stale = endpointStale(a.source, a.target);
        return a;
      });

    // A schedule entry is stale as soon as either endpoint or the task list
    // changed; the whole schedule is recomputed on the next run anyway.
    var tasksFresh = metaFresh && !!runSpec &&
      Orbit.spec.deepEqual(asArray(spec.tasks), asArray(runSpec.tasks));
    var schedule = ((scn && scn.schedule) || [])
      .filter(function (e) {
        // ScanAreaTarget rows name the area group, which is not a spec object
        // itself; resolve it through its grid points' group tag.
        var targetKnown = specNames[e.target] || (spec.objects || []).some(
          function (o) { return o.kind === "target" && o.group === e.target; });
        return specNames[e.platform] && targetKnown;
      })
      .map(function (e) {
        var targetFresh = freshNames[e.target] || areaFresh(spec, runSpec, e.target);
        e.stale = !tasksFresh || !freshNames[e.platform] || !targetFresh;
        return e;
      });
    function targetKnown(targetName) {
      return !!specNames[targetName] || !!Orbit.spec.areaGroup(spec, targetName);
    }

    function targetFresh(targetName) {
      return !!freshNames[targetName] || areaFresh(spec, runSpec, targetName);
    }

    var sensorAccesses = ((scn && scn.sensorAccesses) || [])
      .filter(function (a) { return specNames[a.platform] && targetKnown(a.target); })
      .map(function (a) {
        a.stale = !metaFresh || !freshNames[a.platform] || !targetFresh(a.target);
        return a;
      });
    var areaSensorAccesses = ((scn && scn.areaSensorAccesses) || [])
      .filter(function (a) {
        return specNames[a.platform] && !!Orbit.spec.areaGroup(spec, a.target);
      })
      .map(function (a) {
        a.stale = !metaFresh || !freshNames[a.platform] || !areaFresh(spec, runSpec, a.target);
        return a;
      });

    // Sun/orientation depend only on scenario timing; per-satellite eclipses
    // and per-site daylight additionally require that object to be fresh.
    var sun = null;
    if (metaFresh && scn && scn.sun) {
      sun = {
        ephemeris: scn.sun.ephemeris || null,
        eclipses: (scn.sun.eclipses || []).filter(function (e) {
          return freshNames[e.satellite];
        }),
        groundLighting: (scn.sun.groundLighting || []).filter(function (g) {
          return freshNames[g.name];
        }),
      };
    }
    var earthOrientation = metaFresh && scn ? scn.earthOrientation || null : null;
    // The exported pointing history bakes in every task's aim points, so a
    // platform's series is only authoritative while the task list, the
    // platform, AND every one of its scheduled targets are unchanged - a
    // moved target must not keep replaying old boresights.
    var stalePlatforms = {};
    schedule.forEach(function (e) {
      if (e.stale) stalePlatforms[e.platform] = true;
    });
    var pointing = ((scn && scn.pointing) || []).filter(function (p) {
      return tasksFresh && freshNames[p.platform] && !stalePlatforms[p.platform];
    });

    var dirty = !runSpec || !metaFresh || !tasksFresh ||
      (spec.objects || []).some(function (o) { return !freshNames[o.name]; }) ||
      (spec.objects || []).length !== runObjects.length;

    return {
      raw: raw,
      name: meta.name || (scn ? scn.name : "Untitled Scenario"),
      generator: scn ? scn.generator : "spec",
      generatedAtUtc: scn ? scn.generatedAtUtc : null,
      epochMs: isFinite(epochMs) ? epochMs : (scn ? scn.epochMs : 0),
      durationSec: meta.durationSeconds != null ? meta.durationSeconds
        : (scn ? scn.durationSec : 7200),
      stepSec: meta.stepSeconds != null ? meta.stepSeconds
        : (scn ? scn.stepSec : 60),
      sats: sats,
      grounds: Orbit.spec.displayGrounds(spec),
      accesses: accesses,
      sensorAccesses: sensorAccesses,
      areaSensorAccesses: areaSensorAccesses,
      schedule: schedule,
      hasSchedule: !!(scn && scn.hasSchedule),
      sun: sun,
      earthOrientation: earthOrientation,
      pointing: pointing,
      metaFresh: metaFresh,
      tasksFresh: tasksFresh,
      previewCount: previewCount,
      pendingCount: pendingCount,
      dirty: dirty,
    };
  }

  // A ScanAreaTarget entry's target (the area group) is fresh when every
  // grid point of that group is fresh in both specs.
  function areaFresh(spec, runSpec, groupName) {
    if (!runSpec) return false;
    var specPoints = (spec.objects || []).filter(function (o) {
      return o.kind === "target" && o.group === groupName;
    });
    if (specPoints.length === 0) return false;
    var runByName = {};
    Orbit.spec.asArray(runSpec.objects).forEach(function (o) {
      if (o && o.name) runByName[o.name] = o;
    });
    return specPoints.every(function (p) {
      return objectFresh(p, runByName[p.name]);
    });
  }

  Orbit.merge = {
    buildRenderScenario: buildRenderScenario,
  };
})();
