// Orbit console bootstrap: owns the app state, the simulation clock, and the
// render loop; wires the toolbar, editing dialogs, viewport, and timeline.
//
// Two sources of truth: the editable spec (what exists - Orbit.spec) and the
// propagated MATLAB payload (how it moves - Orbit.data). Edits validate
// locally, save to /api/spec while the bridge is up, and mark the propagated
// data dirty until the next /api/run-scenario refreshes it.
(function () {
  "use strict";

  var state = {
    raw: null,        // payload as served (authoritative propagation result)
    scnBase: null,    // parsed payload scenario (Orbit.data.parseScenario)
    scn: null,        // render scenario: payload merged with the spec, with
                      // per-object freshness (Orbit.merge.buildRenderScenario)
    source: "",       // "sample" | "matlab" | ...
    bridge: null,     // /api/health payload or null
    spec: null,       // editable scenario spec (Orbit.spec shape)
    // "server"   - bridge persists the spec (PUT /api/spec on every edit)
    // "local"    - no bridge (file:// or bridge lost); edits stay in memory
    // "detached" - the stored spec uses unsupported features; edit a local
    //              copy and never auto-save over the server's version
    specMode: "local",
    dirty: false,     // spec changed since the payload was propagated
    simSec: 0,
    playing: true,
    speed: 60,
    view: "2d",
    selection: null,
    treeOpen: {},     // collapse state of tree groups ("sat:<g>" / "area:<g>")
    busy: false,
    // Viewport display toggles (2D map + 3D globe read these every frame);
    // defaults mirror apps/orbit-ui's View menu, plus the orbit-track layer
    // and the 3D display frame ("ecef" | "eci").
    viewOptions: {
      labels: true,
      orbitTracks: true,
      groundTracks: true,
      accessLines: true,
      sensorFov: true,
      sensorFor: false,
      sun: true,
      frame3d: "ecef",
    },
    // Recent status-bar messages, newest last, capped (worker/log panel).
    log: [],
    // Outcome of the last MATLAB job this session: null | "succeeded" | "failed".
    lastRunOutcome: null,
    lastRunFinishedMs: null,
    lastRunDurationMs: null,
    sensorAreaPlatform: "",
    sensorAreaSensor: "",
    sensorAreaTarget: "",
    sensorAreaKey: "",
  };

  var VIEW_OPTIONS = [
    ["labels", "menu-toggle-labels"],
    ["orbitTracks", "menu-toggle-orbit-tracks"],
    ["groundTracks", "menu-toggle-ground-tracks"],
    ["accessLines", "menu-toggle-access-lines"],
    ["sensorFov", "menu-toggle-sensor-fov"],
    ["sensorFor", "menu-toggle-sensor-for"],
    ["sun", "menu-toggle-sun"],
  ];

  var els = {};
  ["scenario-chip", "utc-readout", "btn-refresh", "btn-run-demo", "btn-run-scenario",
    "bridge-pill", "dirty-pill", "btn-view-2d", "btn-view-3d", "btn-view-sensor-area",
    "canvas-2d", "canvas-3d", "canvas-sensor-for", "sensor-area-view",
    "sensor-area-sensor", "sensor-area-target", "btn-add-sensor-area-access",
    "sensor-area-note", "sensor-area-request-list", "sensor-for-title",
    "viewport-hud", "viewport-toolbar", "viewport-frame-tag", "btn-reset-view",
    "object-tree", "inspector",
    "btn-settings", "btn-file-menu", "file-menu", "menu-import-spec",
    "menu-export-spec", "menu-export-scenario", "menu-export-ephemeris",
    "menu-reset-demo", "import-spec-input",
    "btn-worker-log", "worker-panel", "worker-status-dot", "worker-status-text",
    "worker-status-detail", "worker-log-list",
    "btn-view-menu", "view-menu",
    "menu-toggle-labels", "menu-toggle-orbit-tracks", "menu-toggle-ground-tracks",
    "menu-toggle-access-lines",
    "menu-toggle-sensor-fov", "menu-toggle-sensor-for", "menu-toggle-sun",
    "menu-frame-ecef", "menu-frame-eci",
    "btn-add-sat", "btn-add-tle", "btn-add-walker", "btn-add-station",
    "btn-add-target", "btn-add-area", "btn-add-sensor", "btn-add-access",
    "btn-add-task", "btn-add-maneuver",
    "btn-rewind", "btn-play", "speed-select", "sim-offset", "timeline-lanes",
    "status-message", "status-counts", "status-source", "status-bridge",
  ].forEach(function (id) { els[id.replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); })] = document.getElementById(id); });

  var globeDrag = Orbit.globe3d.attach(els.canvas3d, function () { return state; });

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  // Diagnostic error kinds set by js/api.js (see taggedError there): a short
  // suffix so status messages/the log say *why* a call failed, not just that
  // it did (offline vs. timed out vs. a bad HTTP status vs. a malformed body).
  var ERROR_KIND_LABEL = {
    timeout: "timed out",
    network: "unreachable",
    http: "HTTP error",
    malformed: "malformed response",
  };

  function kindSuffix(err) {
    var label = err && err.kind && ERROR_KIND_LABEL[err.kind];
    return label ? " (" + label + ")" : "";
  }

  // ---- status helpers --------------------------------------------------------

  function setMessage(text, tone) {
    els.statusMessage.textContent = text;
    els.statusMessage.className = "status-item" +
      (tone ? " is-" + tone : "");
    logEvent(text, tone);
  }

  // Worker/log panel: a running history of status-bar messages so run/refresh
  // failures stay visible after the status line moves on. Capped so the
  // panel (and this array) cannot grow without bound in a long session.
  var LOG_LIMIT = 60;

  function logEvent(text, tone) {
    var now = new Date();
    state.log.push({
      timeText: now.toISOString().slice(11, 19) + "Z",
      tone: tone || "info",
      text: text,
    });
    if (state.log.length > LOG_LIMIT) state.log.shift();
    if (!els.workerPanel.hidden) renderWorkerPanel();
  }

  var WORKER_STATE_LABEL = {
    running: "Running",
    offline: "Offline - sample data",
    succeeded: "Succeeded",
    failed: "Failed",
    idle: "Idle",
  };

  // Derives the worker's displayed state from existing state (no separate
  // state machine to keep in sync): busy wins, then whether a bridge is
  // connected at all, then the outcome of the last job this session.
  function currentWorkerState() {
    if (state.busy) return "running";
    if (!state.bridge) return "offline";
    if (state.lastRunOutcome) return state.lastRunOutcome;
    return "idle";
  }

  function renderWorkerPanel() {
    var st = currentWorkerState();
    els.workerStatusDot.className = "status-dot status-dot-" + st;
    els.workerStatusText.textContent = WORKER_STATE_LABEL[st] || st;

    var detail = [];
    detail.push(state.bridge
      ? "MATLAB " + (state.bridge.matlabRelease || "") + " bridge connected - warm session"
      : "No MATLAB bridge - editing the bundled sample scenario");
    if (state.lastRunFinishedMs) {
      detail.push("Last run finished " + Orbit.data.fmtUtc(state.lastRunFinishedMs) + " UTC" +
        (state.lastRunDurationMs != null
          ? " (" + (state.lastRunDurationMs / 1000).toFixed(1) + "s)" : ""));
    }
    if (state.dirty) detail.push("Spec has unpropagated edits - results are stale.");
    els.workerStatusDetail.textContent = detail.join(" - ");

    els.workerLogList.innerHTML = state.log.length === 0
      ? '<div class="worker-log-empty">No activity yet.</div>'
      : state.log.slice().reverse().map(function (entry) {
          return '<div class="worker-log-row log-' + esc(entry.tone) + '">' +
            '<span class="worker-log-time">' + esc(entry.timeText) + '</span>' +
            '<span class="worker-log-text">' + esc(entry.text) + '</span></div>';
        }).join("");
  }

  function toggleWorkerPanel(open) {
    els.workerPanel.hidden = open === undefined ? !els.workerPanel.hidden : !open;
    if (!els.workerPanel.hidden) renderWorkerPanel();
  }

  function refreshStatusBar() {
    var counts = null;
    if (state.spec) {
      var sats = 0, grounds = 0;
      state.spec.objects.forEach(function (o) {
        if (o.kind === "satellite") sats++; else grounds++;
      });
      counts = { sats: sats, grounds: grounds };
    } else if (state.scn) {
      counts = { sats: state.scn.sats.length, grounds: state.scn.grounds.length };
    }
    if (counts) {
      var reqCount = state.spec && state.spec.accessRequests !== undefined
        ? Orbit.spec.asArray(state.spec.accessRequests).length
        : null;
      var taskCount = state.spec && state.spec.tasks !== undefined
        ? Orbit.spec.asArray(state.spec.tasks).length
        : null;
      var previewNote = "";
      if (state.scn && (state.scn.previewCount || state.scn.pendingCount)) {
        var bits = [];
        if (state.scn.previewCount) bits.push(state.scn.previewCount + " previewed");
        if (state.scn.pendingCount) bits.push(state.scn.pendingCount + " awaiting run");
        previewNote = " - " + bits.join(", ");
      }
      els.statusCounts.textContent = counts.sats + " sat - " + counts.grounds +
        " ground - " + (state.scn ? state.scn.accesses.length : 0) + " access" +
        (reqCount == null ? "" : " - " + reqCount + " req") +
        (taskCount == null ? "" : " - " + taskCount + " task") + previewNote;
    }
    if (state.source) {
      els.statusSource.textContent = "data: " + state.source +
        (state.dirty ? " (stale)" : "");
    }
    els.statusBridge.textContent = state.bridge
      ? "bridge: MATLAB " + (state.bridge.matlabRelease || "")
      : "bridge: offline";
  }

  function setBridge(health) {
    state.bridge = health;
    var pill = els.bridgePill;
    if (health) {
      pill.textContent = "MATLAB LINKED";
      pill.className = "pill pill-ok";
    } else {
      pill.textContent = "OFFLINE - SAMPLE";
      pill.className = "pill pill-off";
      pill.title = "No MATLAB bridge found. In MATLAB run:\n  startupOrekitSuite; launchOrbitStaticUi";
    }
    var canRun = !!health && !state.busy;
    els.btnRunDemo.disabled = !canRun;
    els.btnRunScenario.disabled = !canRun;
    var why = health ? "" : " (requires the MATLAB bridge: startupOrekitSuite; launchOrbitStaticUi)";
    els.btnRunDemo.title = "Propagate the demo scenario with MATLAB / Orekit" + why;
    els.btnRunScenario.title = "Propagate the current spec with MATLAB / Orekit" + why;
    refreshStatusBar();
    if (!els.workerPanel.hidden) renderWorkerPanel();
  }

  function updateDirtyUi() {
    els.dirtyPill.hidden = !state.dirty;
    els.timelineLanes.classList.toggle("is-stale", state.dirty);
    if (!els.workerPanel.hidden) renderWorkerPanel();
  }

  function updateEditButtons() {
    var disabled = state.busy || !state.spec;
    [els.btnSettings, els.btnAddSat, els.btnAddTle, els.btnAddWalker,
     els.btnAddStation, els.btnAddTarget, els.btnAddArea,
     els.btnAddSensor, els.btnAddAccess, els.btnAddTask, els.btnAddManeuver,
     els.btnAddSensorAreaAccess]
      .forEach(function (btn) { btn.disabled = disabled; });
    els.menuImportSpec.disabled = state.busy;
  }

  // ---- spec state ------------------------------------------------------------

  // Rebuild the render scenario: the spec says what exists, the payload says
  // how it moves, and Orbit.merge reconciles the two with per-object
  // freshness (matlab / preview / pending satellites, stale windows, gated
  // sun data). Falls back to the raw payload parse when no spec is loaded.
  function recomputeScenario() {
    if (state.spec) {
      state.scn = Orbit.merge.buildRenderScenario(state.spec, state.scnBase);
      state.dirty = !!state.scn.dirty;
    } else {
      state.scn = state.scnBase;
      state.dirty = false;
    }
    if (state.scn) {
      state.simSec = Math.min(state.simSec, state.scn.durationSec) || 0;
    }
  }

  function setSpecState(spec) {
    state.spec = spec;
    recomputeScenario();
    if (state.selection && !Orbit.panels.findSelected(state, state.selection)) {
      state.selection = null;
    }
    Orbit.panels.buildTimeline(els.timelineLanes, state, seek);
    updateDirtyUi();
    updateEditButtons();
    renderPanels();
    renderSensorAreaWorkspace();
    refreshStatusBar();
  }

  function deriveLocalSpec() {
    if (!state.raw) return null;
    // Payloads from run-scenario / the bundled sample embed the exact spec
    // they were built from; adopting it keeps the fresh payload authoritative
    // (a lossy re-derivation would mark everything edited/previewed).
    if (state.raw.spec) {
      var echoed = Orbit.spec.normalizeSpecShape(
        JSON.parse(JSON.stringify(state.raw.spec)));
      if (Orbit.spec.validateSpec(echoed).length === 0) return echoed;
    }
    return Orbit.spec.deriveSpecFromScenario(state.raw);
  }

  function saveSpecToBridge() {
    if (state.specMode !== "server" || !state.bridge || !state.spec) return;
    Orbit.api.saveSpec(state.spec).catch(function (err) {
      Orbit.api.detectBridge().then(function (health) {
        setBridge(health);
        if (health) {
          setMessage("Spec save failed" + kindSuffix(err) + ": " + err.message, "error");
        } else {
          state.specMode = "local";
          setMessage("MATLAB bridge unreachable (offline) - edits stay local until it returns.", "error");
        }
      });
    });
  }

  // Every mutation funnels through here: clean up, validate locally, apply,
  // persist. Returns a promise of { ok: true } or { errors: [...] } for the
  // dialogs to display.
  function applySpec(next) {
    if (state.busy) {
      return Promise.resolve({
        errors: ["MATLAB is propagating - try again when the run finishes."],
      });
    }
    var candidate = Orbit.spec.stripEmptyFields(next);
    var errors = Orbit.spec.validateSpec(candidate);
    if (errors.length > 0) return Promise.resolve({ errors: errors });
    setSpecState(candidate);
    saveSpecToBridge();
    return Promise.resolve({ ok: true });
  }

  function specWith(changes) {
    var next = {};
    Object.keys(state.spec).forEach(function (k) { next[k] = state.spec[k]; });
    Object.keys(changes).forEach(function (k) { next[k] = changes[k]; });
    return next;
  }

  function upsertObject(obj, originalName) {
    var changes = { objects: null };
    var renamedRefs = 0;
    if (originalName) {
      changes.objects = state.spec.objects.map(function (o) {
        return o.name === originalName ? obj : o;
      });
      if (obj.name !== originalName) {
        // Sensor tasks / access requests referencing the object follow the
        // rename instead of silently breaking.
        var renamed = Orbit.spec.renameReferences(state.spec, originalName, obj.name);
        Object.keys(renamed.changes).forEach(function (k) {
          changes[k] = renamed.changes[k];
        });
        renamedRefs = renamed.count;
        if (obj.kind === "satellite" && obj.sensor && !obj.sensor.name) {
          // The sensor uses the default "<satellite> Sensor" label, so the
          // satellite rename renames the sensor too; sensor requests carry
          // that name explicitly and must follow.
          var sensorRenamed = Orbit.spec.renameSensorRequests(
            specWith(changes), obj.name, obj.name + " Sensor");
          Object.keys(sensorRenamed.changes).forEach(function (k) {
            changes[k] = sensorRenamed.changes[k];
          });
          renamedRefs += sensorRenamed.count;
        }
      }
    } else {
      changes.objects = state.spec.objects.concat([obj]);
    }
    return applySpec(specWith(changes)).then(function (result) {
      if (result.ok) {
        state.selection = obj.name;
        renderPanels();
        if (renamedRefs > 0) {
          setMessage("Renamed '" + originalName + "' to '" + obj.name + "' and updated " +
            renamedRefs + " task/access reference(s).", "ok");
        }
      }
      return result;
    });
  }

  function insertObjects(objs, doneMessage) {
    return applySpec(specWith({ objects: state.spec.objects.concat(objs) }))
      .then(function (result) {
        if (result.ok && doneMessage) setMessage(doneMessage, "ok");
        return result;
      });
  }

  function loadSpec() {
    if (!state.bridge) {
      state.specMode = "local";
      setSpecState(deriveLocalSpec());
      return Promise.resolve();
    }
    return Orbit.api.fetchSpec().then(function (spec) {
      spec = Orbit.spec.normalizeSpecShape(spec);
      var errors = Orbit.spec.validateSpec(spec);
      if (errors.length > 0) {
        // The stored spec uses features this console cannot author yet;
        // leave it untouched on the server and edit a derived copy locally.
        state.specMode = "detached";
        setSpecState(deriveLocalSpec());
        setMessage("Stored spec is not editable here (" + errors[0] +
          ") - editing a copy derived from the payload.", "error");
        return;
      }
      state.specMode = "server";
      setSpecState(spec);
    }).catch(function () {
      // Nothing stored yet (404): derive from the payload and persist it.
      state.specMode = "server";
      setSpecState(deriveLocalSpec());
      saveSpecToBridge();
    });
  }

  // ---- scenario loading --------------------------------------------------------

  function setScenario(raw, source) {
    state.raw = raw;
    state.source = source;
    state.scnBase = Orbit.data.parseScenario(raw);
    recomputeScenario();
    if (state.selection && !Orbit.panels.findSelected(state, state.selection)) {
      state.selection = null;
    }
    els.scenarioChip.textContent = state.scn.name;
    els.scenarioChip.title = "Epoch " + Orbit.data.fmtUtc(state.scn.epochMs) +
      " UTC - " + Orbit.data.fmtDuration(state.scn.durationSec) +
      " @ " + state.scn.stepSec + " s" +
      (state.scnBase && state.scnBase.generatedAtUtc
        ? "\nGenerated " + state.scnBase.generatedAtUtc + " (" + source + ")"
        : "");
    Orbit.panels.buildTimeline(els.timelineLanes, state, seek);
    updateDirtyUi();
    renderPanels();
    renderSensorAreaWorkspace();
    refreshStatusBar();
  }

  function loadScenario(message) {
    setMessage(message || "Loading scenario...");
    return Orbit.api.loadScenario(!!state.bridge).then(function (res) {
      setScenario(res.scenario, res.source);
      setMessage("Scenario loaded (" + res.source + ").", "ok");
    }).catch(function (err) {
      setMessage("Load failed" + kindSuffix(err) + ": " + err.message, "error");
    });
  }

  function setBusy(busy, message) {
    state.busy = busy;
    els.btnRefresh.disabled = busy;
    setBridge(state.bridge); // recompute run-button state
    updateEditButtons();
    if (message) setMessage(message, busy ? "busy" : "ok");
    if (!els.workerPanel.hidden) renderWorkerPanel();
  }

  function runJob(promise, doneMessage, adoptSpecFromPayload) {
    var startedMs = Date.now();
    setBusy(true, "MATLAB is propagating with Orekit - the console stays live on current data...");
    promise.then(function (res) {
      if (res && res.scenario) {
        setScenario(res.scenario, res.source || "matlab");
        if (adoptSpecFromPayload) {
          // Run Demo replaces the mission wholesale; the spec follows it.
          setSpecState(deriveLocalSpec());
          if (state.specMode === "detached") state.specMode = "server";
          saveSpecToBridge();
        }
      }
      state.lastRunOutcome = "succeeded";
      state.lastRunFinishedMs = Date.now();
      state.lastRunDurationMs = state.lastRunFinishedMs - startedMs;
      setBusy(false);
      setMessage(doneMessage, "ok");
    }).catch(function (err) {
      state.lastRunOutcome = "failed";
      state.lastRunFinishedMs = Date.now();
      state.lastRunDurationMs = state.lastRunFinishedMs - startedMs;
      setBusy(false);
      var label = err && err.kind === "timeout" ? "MATLAB run timed out"
        : "MATLAB run failed" + kindSuffix(err);
      setMessage(label + ": " + err.message, "error");
    });
  }

  // ---- editing dialogs -----------------------------------------------------------

  var KEP_PROPAGATORS = [
    ["Keplerian", "Keplerian (two-body)"],
    ["EcksteinHechler", "Eckstein-Hechler (J2-J6)"],
    ["Numerical", "Numerical (HPOP)"],
  ];

  var TLE_PROPAGATORS = [
    ["TLE", "SGP4 (TLE)"],
    ["Numerical", "Numerical (HPOP)"],
  ];

  // Shallow copy of `base` with `changes` applied; edit dialogs build the
  // updated object this way so fields the dialog does not show (sensor,
  // maneuvers, group, area, color) survive a round trip unchanged.
  function copyWith(base, changes) {
    var out = {};
    Object.keys(base || {}).forEach(function (k) { out[k] = base[k]; });
    Object.keys(changes).forEach(function (k) { out[k] = changes[k]; });
    return out;
  }

  // Inline imaging-sensor section shared by the satellite / TLE /
  // constellation insert dialogs (the React console carries the same fields
  // on its satellite dialog). `tpl` is the existing sensor or null.
  function sensorSectionFields(tpl) {
    var sensor = tpl || Orbit.spec.sensorTemplate();
    var visible = function (v) { return !!v.sensorEnabled; };
    return [
      { key: "sensorEnabled", label: "Imaging sensor", type: "checkbox",
        value: !!tpl,
        hint: "Equip a conic imaging sensor (FOV cone + slewable field of regard)" },
      { key: "sensorConeHalfAngleDeg", label: "Sensor FOV half-angle (deg)",
        type: "number", value: sensor.coneHalfAngleDeg, min: 0.1, max: 90,
        visibleWhen: visible,
        hint: "Instantaneous beam: half-angle of the sensor cone" },
      { key: "sensorFieldOfRegardDeg", label: "Sensor FOR half-angle (deg)",
        type: "number", value: sensor.fieldOfRegardDeg, min: 0.1, max: 180,
        visibleWhen: visible,
        hint: "How far the sensor can slew off its nominal boresight" },
      { key: "sensorSlewRateDegPerSec", label: "Sensor slew rate (deg/s)",
        type: "number",
        value: sensor.slewRateDegPerSec == null ? 2 : sensor.slewRateDegPerSec,
        min: 0.01, max: 60, visibleWhen: visible },
    ];
  }

  // Apply the section's submitted values onto a satellite spec object.
  function applySensorSection(obj, existingSensor, v) {
    if (v.sensorEnabled) {
      obj.sensor = copyWith(existingSensor || {}, {
        coneHalfAngleDeg: v.sensorConeHalfAngleDeg,
        fieldOfRegardDeg: v.sensorFieldOfRegardDeg,
        slewRateDegPerSec: v.sensorSlewRateDegPerSec,
      });
      if (!obj.sensor.pointing) obj.sensor.pointing = "Nadir";
    } else {
      delete obj.sensor;
    }
    return obj;
  }

  function nextExpandedBase(base, generatedPrefix) {
    var objects = state.spec.objects || [];
    for (var i = 1; ; i++) {
      var candidate = base + "-" + i;
      var prefix = generatedPrefix(candidate);
      var used = objects.some(function (o) {
        return o.name === candidate || o.group === candidate ||
          o.name.indexOf(prefix) === 0;
      });
      if (!used) return candidate;
    }
  }

  function openSatelliteDialog(initial) {
    var editing = !!initial;
    var tpl = initial || Orbit.spec.keplerianSatelliteTemplate(
      Orbit.spec.nextObjectName(state.spec, "Satellite"));
    Orbit.modal.form({
      title: editing ? "Edit Satellite - " + initial.name : "Insert Satellite",
      submitLabel: editing ? "Apply" : "Insert",
      fields: [
        { key: "name", label: "Name", type: "text", value: tpl.name },
        { key: "semiMajorAxisKm", label: "Semi-major axis (km)", type: "number",
          value: tpl.orbit.semiMajorAxisKm,
          hint: "From Earth's center, not altitude (Earth radius is about 6378 km)" },
        { key: "eccentricity", label: "Eccentricity", type: "number",
          value: tpl.orbit.eccentricity, min: 0, max: 0.999999, step: 0.0001 },
        { key: "inclinationDeg", label: "Inclination (deg)", type: "number",
          value: tpl.orbit.inclinationDeg },
        { key: "raanDeg", label: "RAAN (deg)", type: "number",
          value: tpl.orbit.raanDeg, hint: "Right ascension of the ascending node" },
        { key: "argPerigeeDeg", label: "Arg. of perigee (deg)", type: "number",
          value: tpl.orbit.argPerigeeDeg },
        { key: "trueAnomalyDeg", label: "True anomaly (deg)", type: "number",
          value: tpl.orbit.trueAnomalyDeg,
          hint: "Position in the orbit at the scenario epoch" },
        { key: "massKg", label: "Mass (kg)", type: "number",
          value: tpl.massKg == null ? 1000 : tpl.massKg, min: 1 },
        { key: "propagator", label: "Propagator", type: "select",
          value: tpl.propagator, options: KEP_PROPAGATORS },
      ].concat(sensorSectionFields(tpl.sensor || null)),
      onSubmit: function (v) {
        var next = copyWith(tpl, {
          kind: "satellite",
          name: v.name,
          propagator: v.propagator,
          massKg: v.massKg,
          orbit: {
            type: "keplerian",
            semiMajorAxisKm: v.semiMajorAxisKm,
            eccentricity: v.eccentricity,
            inclinationDeg: v.inclinationDeg,
            raanDeg: v.raanDeg,
            argPerigeeDeg: v.argPerigeeDeg,
            trueAnomalyDeg: v.trueAnomalyDeg,
          },
        });
        applySensorSection(next, tpl.sensor || null, v);
        return upsertObject(next, editing ? initial.name : null);
      },
    });
  }

  function openTleDialog(initial) {
    var editing = !!initial;
    var tpl = initial || Orbit.spec.tleSatelliteTemplate(
      Orbit.spec.nextObjectName(state.spec, "TLE-Sat"));
    Orbit.modal.form({
      title: editing ? "Edit TLE Satellite - " + initial.name : "Insert TLE Satellite",
      submitLabel: editing ? "Apply" : "Insert",
      fields: [
        { key: "name", label: "Name", type: "text", value: tpl.name },
        { key: "line1", label: "TLE line 1", type: "text", mono: true,
          value: tpl.orbit.line1,
          hint: "69-column line starting with '1 ' from a TLE source like CelesTrak" },
        { key: "line2", label: "TLE line 2", type: "text", mono: true,
          value: tpl.orbit.line2,
          hint: "69-column line starting with '2 '" },
        { key: "massKg", label: "Mass (kg)", type: "number",
          value: tpl.massKg == null ? 1000 : tpl.massKg, min: 1 },
        { key: "propagator", label: "Propagator", type: "select",
          value: tpl.propagator, options: TLE_PROPAGATORS,
          hint: "SGP4 propagates the TLE directly; Numerical seeds HPOP from it" },
      ].concat(sensorSectionFields(tpl.sensor || null)),
      onSubmit: function (v) {
        var next = copyWith(tpl, {
          kind: "satellite",
          name: v.name,
          propagator: v.propagator,
          massKg: v.massKg,
          orbit: { type: "tle", line1: v.line1.trim(), line2: v.line2.trim() },
        });
        applySensorSection(next, tpl.sensor || null, v);
        return upsertObject(next, editing ? initial.name : null);
      },
    });
  }

  function openConstellationDialog() {
    var tpl = Orbit.spec.constellationTemplate(nextExpandedBase(
      "Walker", function (candidate) { return candidate + "-P"; }));
    Orbit.modal.form({
      title: "Insert Constellation",
      submitLabel: "Insert",
      fields: [
        { key: "pattern", label: "Pattern", type: "select", value: tpl.pattern,
          options: [["delta", "Walker Delta"], ["star", "Walker Star"]] },
        { key: "prefix", label: "Name prefix", type: "text", value: tpl.prefix,
          hint: "Members are named <prefix>-P01-S01 etc." },
        { key: "totalSatellites", label: "Total satellites", type: "number",
          value: tpl.totalSatellites, min: 1, step: 1 },
        { key: "planes", label: "Planes", type: "number",
          value: tpl.planes, min: 1, step: 1 },
        { key: "phasing", label: "Phasing", type: "number",
          value: tpl.phasing, min: 0, step: 1,
          hint: "Walker phasing factor F (0..planes-1)" },
        { key: "semiMajorAxisKm", label: "Semi-major axis (km)", type: "number",
          value: tpl.semiMajorAxisKm, min: 6379 },
        { key: "eccentricity", label: "Eccentricity", type: "number",
          value: tpl.eccentricity, min: 0, max: 0.999999, step: 0.0001 },
        { key: "inclinationDeg", label: "Inclination (deg)", type: "number",
          value: tpl.inclinationDeg },
        { key: "raanOffsetDeg", label: "RAAN offset (deg)", type: "number",
          value: tpl.raanOffsetDeg },
        { key: "argPerigeeDeg", label: "Arg. of perigee (deg)", type: "number",
          value: tpl.argPerigeeDeg },
        { key: "trueAnomalyOffsetDeg", label: "Anomaly offset (deg)", type: "number",
          value: tpl.trueAnomalyOffsetDeg },
        { key: "propagator", label: "Propagator", type: "select",
          value: tpl.propagator, options: KEP_PROPAGATORS,
          hint: "Applied to every member; each remains individually editable after insert" },
      ].concat(sensorSectionFields(null)),
      preview: function (v) {
        var sats = Orbit.spec.expandWalker(v);
        return sats.length + " satellites will be inserted" +
          (v.sensorEnabled ? ", each with an imaging sensor" : "");
      },
      onSubmit: function (v) {
        var sats;
        try {
          sats = Orbit.spec.expandWalker(v);
        } catch (err) {
          return { errors: [err.message] };
        }
        if (v.sensorEnabled) {
          // Every member gets its own copy so later edits stay independent.
          sats = sats.map(function (s) {
            return applySensorSection(copyWith(s, {}), null, v);
          });
        }
        return insertObjects(sats, "Inserted " + sats.length +
          " satellites (" + sats[0].group + ")" +
          (v.sensorEnabled ? " with sensors." : "."));
      },
    });
  }

  function openAreaDialog(groupName) {
    var editing = !!groupName;
    var group = editing ? Orbit.spec.areaGroup(state.spec, groupName) : null;
    var first = group && group.points.length > 0 ? group.points[0] : null;
    var tpl;
    if (first && first.area) {
      tpl = copyWith(first.area, {
        altitudeM: first.altitudeM == null ? 0 : first.altitudeM,
        priority: first.priority == null ? 5 : first.priority,
      });
    } else {
      tpl = Orbit.spec.areaTargetTemplate(nextExpandedBase(
        "Area", function (candidate) { return candidate + "-R"; }));
    }
    Orbit.modal.form({
      title: editing ? "Edit Area Target - " + groupName : "Insert Area Target",
      submitLabel: editing ? "Regenerate Grid" : "Insert",
      fields: [
        { key: "name", label: "Name", type: "text", value: tpl.name,
          hint: "Grid points are named <Name>-R01C01 etc." },
        { key: "centerLatDeg", label: "Center latitude (deg)", type: "number",
          value: tpl.centerLatDeg, min: -90, max: 90 },
        { key: "centerLonDeg", label: "Center longitude (deg)", type: "number",
          value: tpl.centerLonDeg, min: -180, max: 180 },
        { key: "altitudeM", label: "Altitude (m)", type: "number",
          value: tpl.altitudeM, min: -500, max: 100000 },
        { key: "widthKm", label: "Width (km)", type: "number",
          value: tpl.widthKm, min: 1, hint: "East-west extent" },
        { key: "heightKm", label: "Height (km)", type: "number",
          value: tpl.heightKm, min: 1, hint: "North-south extent" },
        { key: "spacingKm", label: "Grid spacing (km)", type: "number",
          value: tpl.spacingKm, min: 1,
          hint: "Points sample equal cells inside the area" },
        { key: "priority", label: "Priority", type: "number",
          value: tpl.priority, min: 0, hint: "Applied to every grid point" },
      ],
      preview: function (v) {
        var points = Orbit.spec.expandAreaGrid(v);
        return points.length + " grid points will be " +
          (editing ? "regenerated" : "inserted");
      },
      onSubmit: function (v) {
        var points;
        try {
          points = Orbit.spec.expandAreaGrid(v);
        } catch (err) {
          return { errors: [err.message] };
        }
        if (!editing) {
          return insertObjects(points, "Inserted area '" + v.name + "' as " +
            points.length + " grid points.").then(function (result) {
              if (result.ok) {
                state.selection = v.name;
                renderPanels();
              }
              return result;
            });
        }
        return replaceAreaGroup(groupName, v.name, points);
      },
    });
  }

  // Swap an area's grid points for a regenerated set (in place, keeping
  // object order). Carries ScanAreaTarget references along on rename and
  // prunes references to grid points that no longer exist, with a warning.
  function replaceAreaGroup(oldName, newName, points) {
    var members = {};
    var firstIndex = -1;
    state.spec.objects.forEach(function (o, i) {
      if (o.kind === "target" && o.group === oldName) {
        members[o.name] = true;
        if (firstIndex < 0) firstIndex = i;
      }
    });
    var newNames = {};
    points.forEach(function (p) { newNames[p.name] = true; });
    var removedNames = Object.keys(members).filter(function (n) { return !newNames[n]; });

    var objects = [];
    state.spec.objects.forEach(function (o, i) {
      if (i === firstIndex) {
        objects = objects.concat(points);
        return;
      }
      if (!(o.kind === "target" && o.group === oldName)) objects.push(o);
    });
    if (firstIndex < 0) objects = objects.concat(points);

    var changes = { objects: objects };
    var renamedRefs = 0;
    if (newName !== oldName) {
      // ScanAreaTarget tasks reference the area by its group name.
      var renamed = Orbit.spec.renameReferences(
        specWith(changes), oldName, newName);
      Object.keys(renamed.changes).forEach(function (k) {
        changes[k] = renamed.changes[k];
      });
      renamedRefs = renamed.count;
    }
    var pruned = Orbit.spec.pruneReferences(specWith(changes), removedNames);
    Object.keys(pruned.changes).forEach(function (k) {
      changes[k] = pruned.changes[k];
    });
    var droppedRefs = pruned.removed.tasks + pruned.removed.accessRequests;

    return applySpec(specWith(changes)).then(function (result) {
      if (result.ok) {
        state.selection = newName;
        renderPanels();
        var note = "Area '" + newName + "' regenerated as " + points.length +
          " grid points.";
        if (renamedRefs > 0) note += " Updated " + renamedRefs + " reference(s).";
        if (droppedRefs > 0) {
          note += " Removed " + droppedRefs +
            " task/access reference(s) to dropped grid points.";
        }
        setMessage(note, droppedRefs > 0 ? "error" : "ok");
      }
      return result;
    });
  }

  function openGroundDialog(kind, initial) {
    var editing = !!initial;
    var isTarget = kind === "target";
    var noun = isTarget ? "Point Target" : "Ground Station";
    var tpl = initial || (isTarget
      ? Orbit.spec.targetTemplate(Orbit.spec.nextObjectName(state.spec, "Target"))
      : Orbit.spec.groundStationTemplate(Orbit.spec.nextObjectName(state.spec, "Place")));
    var fields = [
      { key: "name", label: "Name", type: "text", value: tpl.name },
      { key: "latitudeDeg", label: "Latitude (deg)", type: "number",
        value: tpl.latitudeDeg, min: -90, max: 90 },
      { key: "longitudeDeg", label: "Longitude (deg)", type: "number",
        value: tpl.longitudeDeg, min: -180, max: 180 },
      { key: "altitudeM", label: "Altitude (m)", type: "number", value: tpl.altitudeM },
    ];
    fields.push(isTarget
      ? { key: "priority", label: "Priority", type: "number",
          value: tpl.priority == null ? 5 : tpl.priority, min: 0,
          hint: "Used by the tasking/scheduling workflows" }
      : { key: "minElevationDeg", label: "Min elevation (deg)", type: "number",
          value: tpl.minElevationDeg == null ? 5 : tpl.minElevationDeg,
          min: -90, max: 90,
          hint: "Access requires the satellite above this elevation" });
    Orbit.modal.form({
      title: editing ? "Edit " + noun + " - " + initial.name : "Insert " + noun,
      submitLabel: editing ? "Apply" : "Insert",
      fields: fields,
      onSubmit: function (v) {
        var obj = copyWith(tpl, {
          kind: isTarget ? "target" : "groundStation",
          name: v.name,
          latitudeDeg: v.latitudeDeg,
          longitudeDeg: v.longitudeDeg,
          altitudeM: v.altitudeM,
        });
        if (isTarget) obj.priority = v.priority;
        else obj.minElevationDeg = v.minElevationDeg;
        return upsertObject(obj, editing ? initial.name : null);
      },
    });
  }

  // ---- sensors ---------------------------------------------------------------

  var POINTING_OPTIONS = [
    ["Nadir", "Nadir (straight down)"],
    ["VelocityVector", "Velocity vector (along-track)"],
    ["SunPointing", "Sun pointing"],
    ["FixedVector", "Fixed vector (ECEF)"],
  ];

  function satelliteByName(name) {
    var found = null;
    state.spec.objects.forEach(function (o) {
      if (o.kind === "satellite" && o.name === name) found = o;
    });
    return found;
  }

  // Attach/replace (sensor object) or remove (null) a satellite's sensor,
  // keeping the rest of the spec consistent: a renamed sensor carries its
  // access requests along; a removed sensor drops its sensor requests and
  // unpins tasks so they fall back to "any sensor".
  function applySensor(satName, sensor) {
    var sat = satelliteByName(satName);
    if (!sat) return Promise.resolve({ errors: ["Satellite no longer exists."] });
    var next = copyWith(sat, {});
    if (sensor) next.sensor = sensor;
    else delete next.sensor;
    var changes = {
      objects: state.spec.objects.map(function (o) {
        return o.name === satName ? next : o;
      }),
    };
    var note;
    if (sensor) {
      var effective = sensor.name || satName + " Sensor";
      var renamed = Orbit.spec.renameSensorRequests(specWith(changes), satName, effective);
      Object.keys(renamed.changes).forEach(function (k) {
        changes[k] = renamed.changes[k];
      });
      note = (sat.sensor ? "Updated" : "Added") + " sensor '" + effective +
        "' on '" + satName + "'." +
        (renamed.count > 0 ? " Updated " + renamed.count + " access request(s)." : "");
    } else {
      var detached = Orbit.spec.detachSensorReferences(specWith(changes), satName);
      Object.keys(detached.changes).forEach(function (k) {
        changes[k] = detached.changes[k];
      });
      note = "Removed the sensor from '" + satName + "'.";
      if (detached.removedRequests > 0) {
        note += " Removed " + detached.removedRequests + " sensor access request(s).";
      }
      if (detached.retargetedTasks > 0) {
        note += " " + detached.retargetedTasks + " task(s) now accept any sensor.";
      }
    }
    return applySpec(specWith(changes)).then(function (result) {
      if (result.ok) {
        state.selection = satName;
        renderPanels();
        setMessage(note, "ok");
      }
      return result;
    });
  }

  // satName pins the dialog to one satellite (inspector Add/Edit Sensor);
  // null shows a platform picker (toolbar + Sensor).
  function openSensorDialog(satName) {
    var sats = state.spec.objects.filter(function (o) {
      return o.kind === "satellite";
    });
    if (sats.length === 0) {
      setMessage("Insert a satellite first - sensors mount on satellites.", "error");
      return;
    }
    var pinned = satName ? satelliteByName(satName) : null;
    if (satName && !pinned) return;
    var initialSat = pinned;
    if (!initialSat) {
      // Prefer a satellite without a sensor, like the React console.
      sats.forEach(function (s) { if (!initialSat && !s.sensor) initialSat = s; });
      if (!initialSat) initialSat = sats[0];
    }
    var tpl = initialSat.sensor || Orbit.spec.sensorTemplate();
    var boresight = Array.isArray(tpl.boresight) ? tpl.boresight : [1, 0, 0];
    var boresightVisible = function (v) { return v.pointing === "FixedVector"; };

    var fields = [];
    if (!pinned) {
      fields.push({ key: "satellite", label: "Satellite", type: "select",
        value: initialSat.name,
        options: sats.map(function (s) {
          return [s.name, s.name + (s.sensor ? " (has sensor)" : "")];
        }),
        hint: "The platform this sensor mounts on" });
    }
    fields.push(
      { key: "name", label: "Sensor name", type: "text", value: tpl.name || "",
        hint: "Shown in the tree and access requests; blank uses '<satellite> Sensor'" },
      { key: "coneHalfAngleDeg", label: "FOV half-angle (deg)", type: "number",
        value: tpl.coneHalfAngleDeg, min: 0.1, max: 90,
        hint: "Instantaneous beam: half-angle of the sensor cone" },
      { key: "fieldOfRegardDeg", label: "FOR half-angle (deg)", type: "number",
        value: tpl.fieldOfRegardDeg, min: 0.1, max: 180,
        hint: "Field of regard: how far the sensor can slew off its boresight" },
      { key: "slewRateDegPerSec", label: "Slew rate (deg/s)", type: "number",
        value: tpl.slewRateDegPerSec == null ? 2 : tpl.slewRateDegPerSec,
        min: 0.01, max: 60 },
      { key: "pointing", label: "Pointing", type: "select",
        value: tpl.pointing || "Nadir", options: POINTING_OPTIONS,
        hint: "Nominal boresight; the field of regard slews around it" },
      { key: "boresightX", label: "Boresight X", type: "number",
        value: boresight[0], visibleWhen: boresightVisible,
        hint: "Constant Earth-fixed (ECEF) direction; magnitude is ignored" },
      { key: "boresightY", label: "Boresight Y", type: "number",
        value: boresight[1], visibleWhen: boresightVisible },
      { key: "boresightZ", label: "Boresight Z", type: "number",
        value: boresight[2], visibleWhen: boresightVisible });

    Orbit.modal.form({
      title: pinned
        ? (pinned.sensor ? "Edit Sensor - " : "Add Sensor - ") + pinned.name
        : "Sensor",
      submitLabel: "Apply",
      fields: fields,
      // The form keeps its values when the platform changes; warn when
      // Apply would replace an existing sensor on the picked satellite.
      preview: pinned ? null : function (v) {
        var sat = satelliteByName(v.satellite);
        return sat && sat.sensor
          ? "'" + v.satellite + "' already has a sensor - Apply replaces it."
          : "The sensor will be attached to '" + v.satellite + "'.";
      },
      onSubmit: function (v) {
        var target = pinned || satelliteByName(v.satellite);
        if (!target) return { errors: ["Satellite no longer exists."] };
        // Copy the existing sensor first so unknown fields survive edits.
        var sensor = copyWith(target.sensor || {}, {
          name: v.name,
          coneHalfAngleDeg: v.coneHalfAngleDeg,
          fieldOfRegardDeg: v.fieldOfRegardDeg,
          slewRateDegPerSec: v.slewRateDegPerSec,
          pointing: v.pointing,
        });
        if (!v.name) delete sensor.name;
        if (v.pointing === "FixedVector") {
          sensor.boresight = [v.boresightX, v.boresightY, v.boresightZ];
        } else {
          delete sensor.boresight;
        }
        return applySensor(target.name, sensor);
      },
    });
  }

  function removeSensor(satName) {
    var sat = satelliteByName(satName);
    if (!sat || !sat.sensor) return;
    // Preview the fallout before confirming (pure helper, nothing applied).
    var detached = Orbit.spec.detachSensorReferences(state.spec, satName);
    var parts = [];
    if (detached.removedRequests > 0) {
      parts.push("removes " + detached.removedRequests + " sensor access request(s)");
    }
    if (detached.retargetedTasks > 0) {
      parts.push("re-points " + detached.retargetedTasks + " task(s) at any sensor");
    }
    var warning = parts.length > 0 ? "\n\nThis also " + parts.join(" and ") + "." : "";
    if (!window.confirm("Remove the sensor from '" + satName + "'?" + warning)) return;
    applySensor(satName, null).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
    });
  }

  // ---- access requests ---------------------------------------------------------

  function openAccessDialog() {
    var current = Orbit.spec.asArray(state.spec.accessRequests);
    var existing = {};
    current.forEach(function (r) {
      if (r) existing[Orbit.spec.accessRequestKey(r)] = true;
    });
    var options = Orbit.spec.accessRequestOptions(state.spec).filter(function (o) {
      return !existing[o.key];
    });
    var DEFAULT_SWEEP = "__default_sweep__";
    var selectOptions = options.map(function (o) {
      return [o.key, o.label + " - " + o.meta];
    });
    if (state.spec.accessRequests !== undefined) {
      // Once requests exist, offer the way back to the backend's default
      // satellite x ground-station sweep (removes the accessRequests key).
      selectOptions.push([DEFAULT_SWEEP,
        "Calculate all (drop requests, restore default sat x station sweep)"]);
    }
    if (selectOptions.length === 0) {
      setMessage("Add a satellite plus a ground station, a second satellite, " +
        "or a sensor and a point or area target before requesting access.", "error");
      return;
    }
    Orbit.modal.form({
      title: "Request Access",
      submitLabel: "Apply",
      fields: [
        { key: "key", label: "Access pair", type: "select",
          value: selectOptions[0][0],
          options: selectOptions,
          hint: "Only requested pairs are computed on Re-run" },
      ],
      preview: function (v) {
        if (v.key === DEFAULT_SWEEP) {
          return "Removes every request: the next Re-run computes the " +
            "default satellite x ground-station sweep.";
        }
        if (state.spec.accessRequests === undefined) {
          return "First request: Re-run will compute only requested pairs " +
            "instead of the default satellite/ground sweep.";
        }
        return current.length + " request(s) already in the spec (max " +
          Orbit.spec.MAX_ACCESS_REQUESTS + ").";
      },
      onSubmit: function (v) {
        if (v.key === DEFAULT_SWEEP) {
          var next = specWith({});
          delete next.accessRequests;
          return applySpec(next).then(function (result) {
            if (result.ok) {
              setMessage("Cleared access requests - Re-run computes the " +
                "default satellite x ground-station sweep.", "ok");
            }
            return result;
          });
        }
        var option = null;
        options.forEach(function (o) { if (o.key === v.key) option = o; });
        if (!option) return { errors: ["Pick an access pair."] };
        var requests = Orbit.spec.asArray(state.spec.accessRequests)
          .concat([option.request]);
        return applySpec(specWith({ accessRequests: requests }))
          .then(function (result) {
            if (result.ok) {
              state.selection = Orbit.panels.requestSelectionKey(option.request);
              renderPanels();
              setMessage("Requested " + option.label +
                " - press Re-run to compute it.", "ok");
            }
            return result;
          });
      },
    });
  }

  function deleteAccessRequest(selectionKey) {
    var key = selectionKey.slice("req:".length);
    var target = null;
    var remaining = Orbit.spec.asArray(state.spec.accessRequests)
      .filter(function (r) {
        var hit = !!r && Orbit.spec.accessRequestKey(r) === key;
        if (hit && !target) target = r;
        return !hit;
      });
    if (!target) return;
    var label = Orbit.spec.accessRequestLabel(target);
    if (!window.confirm("Remove the access request '" + label + "'?" +
        (remaining.length === 0
          ? "\n\nNo requests will remain - the next Re-run computes no access windows."
          : ""))) {
      return;
    }
    applySpec(specWith({ accessRequests: remaining })).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
      else setMessage("Removed access request '" + label + "'.", "ok");
    });
  }

  // ---- sensor / area workspace -----------------------------------------------

  function areaAccessRequests() {
    if (!state.spec) return [];
    return Orbit.spec.asArray(state.spec.accessRequests).filter(function (request) {
      return request && request.type === "sensor" &&
        !!Orbit.spec.areaGroup(state.spec, request.targetName);
    });
  }

  function sensorAreaRequestByKey(key) {
    var requests = areaAccessRequests();
    for (var i = 0; i < requests.length; i++) {
      if (Orbit.spec.accessRequestKey(requests[i]) === key) return requests[i];
    }
    return null;
  }

  function sensorAreaDraftRequest() {
    if (!state.sensorAreaPlatform || !state.sensorAreaTarget) return null;
    return {
      type: "sensor",
      platformName: state.sensorAreaPlatform,
      sensorName: state.sensorAreaSensor,
      targetName: state.sensorAreaTarget,
    };
  }

  function activeSensorAreaRequest() {
    var selected = sensorAreaRequestByKey(state.sensorAreaKey);
    if (selected) return selected;
    var draft = sensorAreaDraftRequest();
    return draft ? sensorAreaRequestByKey(Orbit.spec.accessRequestKey(draft)) : null;
  }

  function selectSensorAreaRequest(request, openView) {
    if (!request) return;
    state.sensorAreaPlatform = request.platformName != null
      ? request.platformName : request.sourceName;
    state.sensorAreaSensor = request.sensorName || "";
    state.sensorAreaTarget = request.targetName || "";
    state.sensorAreaKey = Orbit.spec.accessRequestKey(request);
    state.selection = Orbit.panels.requestSelectionKey(request);
    renderPanels();
    renderSensorAreaWorkspace();
    if (openView) setView("sensorArea");
  }

  function sensorAreaChoiceData() {
    var combinations = state.spec
      ? Orbit.spec.sensorAreaAccessOptions(state.spec) : [];
    var sensors = [], areas = [], sensorSeen = {}, areaSeen = {};
    combinations.forEach(function (option) {
      var request = option.request;
      var sensorKey = encodeURIComponent(request.platformName) + "|" +
        encodeURIComponent(request.sensorName);
      if (!sensorSeen[sensorKey]) {
        sensorSeen[sensorKey] = true;
        sensors.push({ key: sensorKey, platform: request.platformName,
          sensor: request.sensorName, label: request.sensorName + " / " + request.platformName });
      }
      if (!areaSeen[request.targetName]) {
        areaSeen[request.targetName] = true;
        areas.push(request.targetName);
      }
    });
    return { sensors: sensors, areas: areas };
  }

  function renderSensorAreaWorkspace() {
    if (!els.sensorAreaSensor || !state.spec) return;
    var choices = sensorAreaChoiceData();
    var hasChoices = choices.sensors.length > 0 && choices.areas.length > 0;

    if (!choices.sensors.some(function (s) {
      return s.platform === state.sensorAreaPlatform && s.sensor === state.sensorAreaSensor;
    }) && choices.sensors.length > 0) {
      state.sensorAreaPlatform = choices.sensors[0].platform;
      state.sensorAreaSensor = choices.sensors[0].sensor;
    }
    if (choices.areas.indexOf(state.sensorAreaTarget) < 0 && choices.areas.length > 0) {
      state.sensorAreaTarget = choices.areas[0];
    }

    els.sensorAreaSensor.innerHTML = choices.sensors.length
      ? choices.sensors.map(function (sensor) {
          var selected = sensor.platform === state.sensorAreaPlatform &&
            sensor.sensor === state.sensorAreaSensor ? " selected" : "";
          return '<option value="' + esc(sensor.key) + '"' + selected + '>' +
            esc(sensor.label) + "</option>";
        }).join("")
      : '<option value="">No mounted sensors</option>';
    els.sensorAreaTarget.innerHTML = choices.areas.length
      ? choices.areas.map(function (area) {
          return '<option value="' + esc(area) + '"' +
            (area === state.sensorAreaTarget ? " selected" : "") + '>' +
            esc(area) + "</option>";
        }).join("")
      : '<option value="">No area targets</option>';

    var draft = sensorAreaDraftRequest();
    var draftKey = draft ? Orbit.spec.accessRequestKey(draft) : "";
    var existing = sensorAreaRequestByKey(draftKey);
    els.btnAddSensorAreaAccess.disabled = state.busy || !hasChoices;
    els.btnAddSensorAreaAccess.textContent = existing ? "Open Access" : "Add Access";

    var requests = areaAccessRequests();
    els.sensorAreaRequestList.innerHTML = requests.length === 0
      ? '<div class="sensor-area-request-label">NO AREA REQUESTS YET</div>'
      : '<div class="sensor-area-request-label">AREA ACCESS REQUESTS</div>' +
        requests.map(function (request) {
          var key = Orbit.spec.accessRequestKey(request);
          return '<button class="sensor-area-request' +
            (key === state.sensorAreaKey ? " is-active" : "") +
            '" data-area-request="' + esc(key) + '">' +
            esc(Orbit.spec.accessRequestLabel(request)) + "</button>";
        }).join("");

    els.sensorAreaRequestList.querySelectorAll("[data-area-request]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          selectSensorAreaRequest(sensorAreaRequestByKey(button.dataset.areaRequest), false);
        });
      });

    var active = activeSensorAreaRequest();
    var projection = Orbit.sensorfor.findProjection(state.scn, active);
    if (!hasChoices) {
      els.sensorAreaNote.textContent = choices.sensors.length === 0
        ? "Add a sensor to a satellite first."
        : "Add an area target first.";
      els.sensorAreaNote.className = "sensor-area-note is-warn";
    } else if (!existing) {
      els.sensorAreaNote.textContent = "This pair is not requested yet.";
      els.sensorAreaNote.className = "sensor-area-note";
    } else if (!projection || projection.stale) {
      els.sensorAreaNote.textContent = "Request saved. Re-run to calculate its FOR projection.";
      els.sensorAreaNote.className = "sensor-area-note is-warn";
    } else {
      els.sensorAreaNote.textContent = projection.projectionWindows.length +
        " projected FOR pass" + (projection.projectionWindows.length === 1 ? "" : "es") + ".";
      els.sensorAreaNote.className = "sensor-area-note is-ok";
    }
    els.sensorForTitle.textContent = active
      ? (active.sensorName || "Sensor") + " -> " + active.targetName
      : "Field-of-regard view";
  }

  function addOrOpenSensorAreaAccess() {
    var request = sensorAreaDraftRequest();
    if (!request) return;
    var key = Orbit.spec.accessRequestKey(request);
    var existing = sensorAreaRequestByKey(key);
    if (existing) {
      selectSensorAreaRequest(existing, false);
      return;
    }
    var requests = Orbit.spec.asArray(state.spec.accessRequests).concat([request]);
    applySpec(specWith({ accessRequests: requests })).then(function (result) {
      if (!result.ok) {
        setMessage((result.errors || ["Could not add area access."]).join(" "), "error");
        return;
      }
      selectSensorAreaRequest(request, false);
      setMessage("Requested " + Orbit.spec.accessRequestLabel(request) +
        " - press Re-run to compute the FOR projection.", "ok");
    });
  }

  // ---- sensor tasks --------------------------------------------------------------

  // initial pins the dialog to an existing task (inspector Edit); null
  // inserts a new one (toolbar + Task). The target select folds each area
  // group in as a whole-area entry; picking one makes the task a
  // ScanAreaTarget, anything else a TrackPointTarget.
  function openTaskDialog(initial) {
    var editing = !!initial;
    var options = Orbit.spec.taskTargetOptions(state.spec);
    if (options.length === 0) {
      setMessage("Insert a point or area target first - tasks image targets.", "error");
      return;
    }
    var tasks = Orbit.spec.asArray(state.spec.tasks);
    if (!editing && tasks.length >= Orbit.spec.MAX_TASKS) {
      setMessage("At most " + Orbit.spec.MAX_TASKS +
        " sensor tasks are supported.", "error");
      return;
    }
    var sensorSats = state.spec.objects.filter(function (o) {
      return o.kind === "satellite" && o.sensor;
    });
    var tpl = initial || Orbit.spec.taskTemplate(state.spec);
    var isAreaTarget = function (name) {
      return Orbit.spec.taskTypeForTarget(state.spec, name) === "ScanAreaTarget";
    };
    Orbit.modal.form({
      title: editing ? "Edit Sensor Task - " + tpl.id : "Insert Sensor Task",
      submitLabel: editing ? "Apply" : "Insert",
      fields: [
        { key: "name", label: "Name", type: "text", value: tpl.name || "",
          placeholder: tpl.id,
          hint: "Shown on schedule rows; blank uses the task id" },
        { key: "targetName", label: "Target", type: "select",
          value: tpl.targetName || options[0].value,
          options: options.map(function (o) { return [o.value, o.label]; }),
          hint: "Whole-area entries schedule a grid scan (ScanAreaTarget)" },
        { key: "satelliteName", label: "Satellite", type: "select",
          value: tpl.satelliteName || "",
          options: [["", "Any (scheduler picks)"]].concat(
            sensorSats.map(function (s) { return [s.name, s.name]; })),
          hint: "Which satellite's sensor must perform the task" },
        { key: "dwellSeconds", label: "Dwell (s)", type: "number",
          value: tpl.dwellSeconds == null ? 60 : tpl.dwellSeconds,
          min: 10, max: 86400,
          hint: "Point: required time on target; area: minimum time per covered grid point" },
        { key: "requiredCoveragePercent", label: "Coverage (%)", type: "number",
          value: tpl.requiredCoveragePercent == null ? 70 : tpl.requiredCoveragePercent,
          min: 0, max: 100,
          visibleWhen: function (v) { return isAreaTarget(v.targetName); },
          hint: "Minimum grid-point coverage to accept a scan window" },
        { key: "priority", label: "Priority", type: "number",
          value: tpl.priority == null ? 5 : tpl.priority, min: 0,
          hint: "Higher wins scheduling conflicts" },
      ],
      preview: function (v) {
        if (sensorSats.length === 0) {
          return "No satellite has a sensor yet - add one (+ Sensor) or the " +
            "scheduler has nothing to task.";
        }
        return isAreaTarget(v.targetName)
          ? "Area scan: MATLAB schedules passes that cover the grid."
          : "Point imaging: MATLAB picks a window inside the sensor's field of regard.";
      },
      onSubmit: function (v) {
        var isArea = isAreaTarget(v.targetName);
        var task = copyWith(tpl, {
          id: tpl.id,
          name: v.name,
          targetName: v.targetName,
          taskType: isArea ? "ScanAreaTarget" : "TrackPointTarget",
          satelliteName: v.satelliteName,
          dwellSeconds: v.dwellSeconds,
          priority: v.priority,
        });
        if (!v.name) delete task.name;
        if (!v.satelliteName) delete task.satelliteName;
        if (isArea) task.requiredCoveragePercent = v.requiredCoveragePercent;
        else delete task.requiredCoveragePercent;
        var next = editing
          ? tasks.map(function (t) { return t && t.id === tpl.id ? task : t; })
          : tasks.concat([task]);
        return applySpec(specWith({ tasks: next })).then(function (result) {
          if (result.ok) {
            state.selection = Orbit.panels.taskSelectionKey(task);
            renderPanels();
            setMessage((editing ? "Updated" : "Added") + " task '" +
              Orbit.spec.taskLabel(task) + "' - press Re-run to schedule it.", "ok");
          }
          return result;
        });
      },
    });
  }

  function deleteTask(selectionKey) {
    var id = selectionKey.slice("task:".length);
    var target = null;
    var remaining = Orbit.spec.asArray(state.spec.tasks).filter(function (t) {
      var hit = !!t && t.id === id;
      if (hit && !target) target = t;
      return !hit;
    });
    if (!target) return;
    if (!window.confirm("Delete the sensor task '" +
        Orbit.spec.taskLabel(target) + "'?")) {
      return;
    }
    applySpec(specWith({ tasks: remaining })).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
      else setMessage("Deleted task '" + Orbit.spec.taskLabel(target) + "'.", "ok");
    });
  }

  // ---- impulsive maneuvers --------------------------------------------------------

  var FRAME_OPTIONS = [
    ["TNW", "TNW (along-track, normal, cross-track)"],
    ["Inertial", "Inertial (GCRF)"],
  ];

  // Replace a satellite's maneuver list wholesale; an empty list removes the
  // field so the spec stays clean.
  function applyManeuverList(satName, maneuvers, note) {
    var sat = satelliteByName(satName);
    if (!sat) return Promise.resolve({ errors: ["Satellite no longer exists."] });
    var next = copyWith(sat, {});
    if (maneuvers.length > 0) next.maneuvers = maneuvers;
    else delete next.maneuvers;
    return applySpec(specWith({
      objects: state.spec.objects.map(function (o) {
        return o.name === satName ? next : o;
      }),
    })).then(function (result) {
      if (result.ok) {
        state.selection = satName;
        renderPanels();
        setMessage(note, "ok");
      }
      return result;
    });
  }

  // satName + index edits one existing burn (inspector Edit); satName alone
  // adds one to that satellite (inspector Add Maneuver); null shows a
  // satellite picker (toolbar + Mnvr).
  function openManeuverDialog(satName, index) {
    var sats = state.spec.objects.filter(function (o) {
      return o.kind === "satellite";
    });
    if (sats.length === 0) {
      setMessage("Insert a satellite first - maneuvers apply to satellites.", "error");
      return;
    }
    var pinned = satName ? satelliteByName(satName) : null;
    if (satName && !pinned) return;
    var editing = !!pinned && index != null &&
      Orbit.spec.asArray(pinned.maneuvers)[index] != null;
    var tpl = editing
      ? Orbit.spec.asArray(pinned.maneuvers)[index]
      : Orbit.spec.maneuverTemplate();
    var dv = Array.isArray(tpl.deltaVmps) ? tpl.deltaVmps : [10, 0, 0];
    var initialSat = pinned;
    if (!initialSat && state.selection) {
      // Prefer the currently selected satellite when it can maneuver.
      sats.forEach(function (s) {
        if (!initialSat && s.name === state.selection && s.propagator !== "TLE") {
          initialSat = s;
        }
      });
    }
    if (!initialSat) {
      // Else any satellite that can actually maneuver (not SGP4).
      sats.forEach(function (s) {
        if (!initialSat && s.propagator !== "TLE") initialSat = s;
      });
      if (!initialSat) initialSat = sats[0];
    }

    var fields = [];
    if (!pinned) {
      fields.push({ key: "satellite", label: "Satellite", type: "select",
        value: initialSat.name,
        options: sats.map(function (s) {
          var count = Orbit.spec.asArray(s.maneuvers).length;
          var suffix = s.propagator === "TLE" ? " (SGP4 - cannot maneuver)"
            : count > 0 ? " (" + count + ")" : "";
          return [s.name, s.name + suffix];
        }),
        hint: "The satellite performing the burn" });
    }
    fields.push(
      { key: "name", label: "Name", type: "text", value: tpl.name || "",
        hint: "Optional label for the burn" },
      { key: "timeOffsetSec", label: "Time offset (s)", type: "number",
        value: tpl.timeOffsetSec == null ? 1800 : tpl.timeOffsetSec,
        min: 0, max: state.spec.meta.durationSeconds,
        hint: "Seconds after the scenario epoch" },
      { key: "frame", label: "Frame", type: "select",
        value: tpl.frame || "TNW", options: FRAME_OPTIONS,
        hint: "TNW: [along-track, in-plane normal, cross-track]; Inertial: GCRF" },
      { key: "dvX", label: "Delta-V X (m/s)", type: "number", value: dv[0],
        hint: "TNW: along-track - a prograde burn ([dV, 0, 0]) raises the orbit" },
      { key: "dvY", label: "Delta-V Y (m/s)", type: "number", value: dv[1] },
      { key: "dvZ", label: "Delta-V Z (m/s)", type: "number", value: dv[2] });

    Orbit.modal.form({
      title: editing ? "Edit Maneuver - " + pinned.name
        : pinned ? "Add Maneuver - " + pinned.name : "Impulsive Maneuver",
      submitLabel: editing ? "Apply" : "Add",
      fields: fields,
      preview: function (v) {
        var target = pinned || satelliteByName(v.satellite);
        if (!target) return "";
        if (target.propagator === "TLE") {
          return "'" + target.name + "' uses SGP4, which cannot maneuver - " +
            "switch its propagator to Numerical first.";
        }
        var count = Orbit.spec.asArray(target.maneuvers).length;
        if (!editing && count >= Orbit.spec.MAX_MANEUVERS_PER_SATELLITE) {
          return "'" + target.name + "' already has the maximum of " +
            Orbit.spec.MAX_MANEUVERS_PER_SATELLITE + " maneuvers.";
        }
        var magnitude = Math.sqrt(v.dvX * v.dvX + v.dvY * v.dvY + v.dvZ * v.dvZ);
        return isFinite(magnitude)
          ? "Burn magnitude " + magnitude.toFixed(1) +
            " m/s; propagation is piecewise across burns."
          : "";
      },
      onSubmit: function (v) {
        var target = pinned || satelliteByName(v.satellite);
        if (!target) return { errors: ["Satellite no longer exists."] };
        var maneuver = copyWith(tpl, {
          name: v.name,
          timeOffsetSec: v.timeOffsetSec,
          frame: v.frame,
          deltaVmps: [v.dvX, v.dvY, v.dvZ],
        });
        if (!v.name) delete maneuver.name;
        var maneuvers = Orbit.spec.asArray(target.maneuvers).slice();
        if (editing) maneuvers[index] = maneuver;
        else maneuvers.push(maneuver);
        return applyManeuverList(target.name, maneuvers,
          (editing ? "Updated" : "Added") + " maneuver on '" + target.name +
          "' - press Re-run to propagate the burn.");
      },
    });
  }

  function deleteManeuver(satName, index) {
    var sat = satelliteByName(satName);
    var maneuvers = sat ? Orbit.spec.asArray(sat.maneuvers) : [];
    var target = maneuvers[index];
    if (!target) return;
    var label = target.name || "Maneuver " + (index + 1);
    if (!window.confirm("Remove '" + label + "' from '" + satName + "'?")) return;
    applyManeuverList(satName,
      maneuvers.filter(function (_, i) { return i !== index; }),
      "Removed maneuver '" + label + "' from '" + satName + "'."
    ).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
    });
  }

  function openSettingsDialog() {
    var meta = state.spec.meta;
    Orbit.modal.form({
      title: "Scenario Settings",
      submitLabel: "Apply",
      fields: [
        { key: "name", label: "Name", type: "text", value: meta.name },
        // datetime-local wants "YYYY-MM-DDTHH:mm:ss" (no zone); treated as UTC.
        { key: "epochUtc", label: "Epoch (UTC)", type: "datetime", mono: true,
          value: meta.epochUtc.replace(/(\.\d+)?Z$/, "") },
        { key: "durationHours", label: "Duration (hours)", type: "number",
          value: meta.durationSeconds / 3600, min: 0.1, step: 0.5 },
        { key: "stepSeconds", label: "Time step (s)", type: "number",
          value: meta.stepSeconds, min: 1, max: 3600, step: 1 },
      ],
      onSubmit: function (v) {
        var epochUtc = Orbit.spec.normalizeEpochUtc(v.epochUtc + "Z");
        if (!epochUtc) {
          return { errors: ["Epoch must be a valid UTC date/time."] };
        }
        return applySpec(specWith({
          meta: {
            name: v.name,
            epochUtc: epochUtc,
            durationSeconds: Math.round(v.durationHours * 3600),
            stepSeconds: v.stepSeconds,
          },
        }));
      },
    });
  }

  function editObject(name) {
    if (name.indexOf("task:") === 0) {
      // The inspector's edit button on a sensor task row.
      var taskId = name.slice("task:".length);
      var task = null;
      Orbit.spec.asArray(state.spec.tasks).forEach(function (t) {
        if (t && t.id === taskId) task = t;
      });
      if (task) openTaskDialog(task);
      return;
    }
    var obj = null;
    state.spec.objects.forEach(function (o) { if (o.name === name) obj = o; });
    if (!obj) {
      // Not an object name: an area target group selected in the tree.
      if (Orbit.spec.areaGroup(state.spec, name)) openAreaDialog(name);
      return;
    }
    if (obj.kind === "satellite") {
      if (obj.orbit && obj.orbit.type === "tle") openTleDialog(obj);
      else openSatelliteDialog(obj);
    } else {
      openGroundDialog(obj.kind, obj);
    }
  }

  function referenceWarning(refs) {
    if (refs.total === 0) return "";
    var parts = [];
    if (refs.tasks > 0) parts.push(refs.tasks + " sensor task(s)");
    if (refs.accessRequests > 0) parts.push(refs.accessRequests + " access request(s)");
    return "\n\nThis also removes " + parts.join(" and ") + " referencing it.";
  }

  function deleteObject(name) {
    if (name.indexOf("req:") === 0) {
      // The inspector's delete button on an access request row.
      deleteAccessRequest(name);
      return;
    }
    if (name.indexOf("task:") === 0) {
      deleteTask(name);
      return;
    }
    var exists = state.spec.objects.some(function (o) { return o.name === name; });
    if (!exists) {
      // Area target groups are deleted as a whole.
      if (Orbit.spec.areaGroup(state.spec, name)) deleteArea(name);
      return;
    }
    var refs = Orbit.spec.countReferences(state.spec, [name]);
    if (!window.confirm("Delete '" + name + "' from the scenario?" +
        referenceWarning(refs))) {
      return;
    }
    var changes = {
      objects: state.spec.objects.filter(function (o) { return o.name !== name; }),
    };
    var pruned = Orbit.spec.pruneReferences(state.spec, [name]);
    Object.keys(pruned.changes).forEach(function (k) { changes[k] = pruned.changes[k]; });
    applySpec(specWith(changes)).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
      else {
        setMessage("Deleted '" + name + "'" +
          (refs.total > 0 ? " and " + refs.total + " reference(s)" : "") + ".", "ok");
      }
    });
  }

  function deleteArea(group) {
    var members = Orbit.spec.areaGroup(state.spec, group);
    if (!members || members.points.length === 0) return;
    var names = members.points.map(function (p) { return p.name; });
    // ScanAreaTarget tasks reference the area by its group name.
    names.push(group);
    var refs = Orbit.spec.countReferences(state.spec, names);
    if (!window.confirm("Delete area '" + group + "' and its " +
        members.points.length + " grid points from the scenario?" +
        referenceWarning(refs))) {
      return;
    }
    var changes = {
      objects: state.spec.objects.filter(function (o) {
        return !(o.kind === "target" && o.group === group);
      }),
    };
    var pruned = Orbit.spec.pruneReferences(state.spec, names);
    Object.keys(pruned.changes).forEach(function (k) { changes[k] = pruned.changes[k]; });
    applySpec(specWith(changes)).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
      else {
        setMessage("Deleted area '" + group + "' (" + members.points.length +
          " grid points" +
          (refs.total > 0 ? ", " + refs.total + " reference(s)" : "") + ").", "ok");
      }
    });
  }

  // ---- import / export --------------------------------------------------------

  function toggleFileMenu(open) {
    els.fileMenu.hidden = open === undefined ? !els.fileMenu.hidden : !open;
  }

  els.btnFileMenu.addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleViewMenu(false);
    toggleWorkerPanel(false);
    toggleFileMenu();
  });
  els.btnWorkerLog.addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleFileMenu(false);
    toggleViewMenu(false);
    toggleWorkerPanel();
  });
  document.addEventListener("click", function () {
    toggleFileMenu(false);
    toggleViewMenu(false);
    toggleWorkerPanel(false);
  });

  // ---- view menu (labels / ground tracks / access lines / sensor FOV+FOR / sun) --

  function toggleViewMenu(open) {
    els.viewMenu.hidden = open === undefined ? !els.viewMenu.hidden : !open;
  }

  function refreshViewMenu() {
    VIEW_OPTIONS.forEach(function (pair) {
      var el = els[pair[1].replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); })];
      el.classList.toggle("is-on", !!state.viewOptions[pair[0]]);
    });
    var eci = state.viewOptions.frame3d === "eci";
    els.menuFrameEcef.classList.toggle("is-on", !eci);
    els.menuFrameEci.classList.toggle("is-on", eci);
  }

  function setFrame3d(frame) {
    state.viewOptions.frame3d = frame;
    refreshViewMenu();
    updateFrameTag();
  }

  function updateFrameTag() {
    var eci = state.viewOptions.frame3d === "eci";
    els.viewportFrameTag.textContent = state.view === "sensorArea"
      ? "SENSOR AZIMUTH / ELEVATION"
      : state.view === "2d"
      ? "EARTH FIXED - EQUIRECTANGULAR"
      : (eci ? "INERTIAL (GCRF) - EARTH ROTATES" : "EARTH FIXED (ECEF)") +
        " - ORTHOGRAPHIC - DRAG TO ROTATE / DOUBLE-CLICK TO RECENTER";
  }

  els.btnViewMenu.addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleFileMenu(false);
    toggleWorkerPanel(false);
    toggleViewMenu();
  });

  VIEW_OPTIONS.forEach(function (pair) {
    var key = pair[0];
    var el = els[pair[1].replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); })];
    el.addEventListener("click", function (ev) {
      ev.stopPropagation(); // stay open - toggling several options in a row is normal
      state.viewOptions[key] = !state.viewOptions[key];
      refreshViewMenu();
    });
  });
  els.menuFrameEcef.addEventListener("click", function (ev) {
    ev.stopPropagation();
    setFrame3d("ecef");
  });
  els.menuFrameEci.addEventListener("click", function (ev) {
    ev.stopPropagation();
    setFrame3d("eci");
  });
  refreshViewMenu();

  els.btnResetView.addEventListener("click", function () {
    Orbit.globe3d.resetView();
  });

  els.menuImportSpec.addEventListener("click", function () {
    toggleFileMenu(false);
    els.importSpecInput.click();
  });

  els.menuExportSpec.addEventListener("click", function () {
    toggleFileMenu(false);
    if (state.spec) Orbit.api.downloadJson("scenario-spec.json", state.spec);
    else setMessage("No spec loaded to export.", "error");
  });

  els.menuExportScenario.addEventListener("click", function () {
    toggleFileMenu(false);
    if (state.raw) Orbit.api.downloadJson("scenario.json", state.raw);
    else setMessage("No propagated scenario to export yet.", "error");
  });

  // Exports the selected satellite's propagated samples, or every satellite
  // with samples when nothing satellite-shaped is selected.
  els.menuExportEphemeris.addEventListener("click", function () {
    toggleFileMenu(false);
    if (!state.scn) {
      setMessage("No propagated scenario to export yet.", "error");
      return;
    }
    var sel = state.selection && Orbit.panels.findSelected(state, state.selection);
    var isSatSelection = sel && (sel.type === "satellite" || sel.type === "payload-satellite");
    if (isSatSelection && !sel.scnSat) {
      setMessage("'" + state.selection + "' has no propagated ephemeris yet - " +
        "Re-run to compute it.", "error");
      return;
    }
    var sats = isSatSelection ? [sel.scnSat] : state.scn.sats.filter(function (s) {
      return s.t.length > 0;
    });
    if (sats.length === 0) {
      setMessage("No propagated satellite ephemeris to export - Run Demo or " +
        "Re-run first.", "error");
      return;
    }
    var names = sats.map(function (s) { return s.name; });
    var csv = Orbit.data.ephemerisCsv(state.scn, names);
    var filename = (isSatSelection
      ? sats[0].name.replace(/[^\w.-]+/g, "_")
      : "all-satellites") + "-ephemeris.csv";
    Orbit.api.downloadText(filename, csv, "text/csv");
    setMessage("Exported ephemeris CSV for " + sats.length + " satellite(s).", "ok");
  });

  // Restores the shipped demo's editable spec without propagating it - the
  // dirty pill flags the result stale until Run Demo / Re-run, same as any
  // other spec edit.
  els.menuResetDemo.addEventListener("click", function () {
    toggleFileMenu(false);
    if (state.busy) {
      setMessage("MATLAB is propagating - try again when the run finishes.", "error");
      return;
    }
    var hasObjects = !!(state.spec && state.spec.objects && state.spec.objects.length > 0);
    if (!window.confirm("Reset to the shipped demo spec?" + (hasObjects
        ? "\n\nThis replaces the current objects, tasks, and access requests. " +
          "It does not propagate - press Run Demo or Re-run afterward."
        : ""))) {
      return;
    }
    Orbit.api.loadSampleScenario().then(function (res) {
      var demoSpec = Orbit.spec.deriveSpecFromScenario(res.scenario);
      return applySpec(demoSpec);
    }).then(function (result) {
      if (result.errors) {
        setMessage("Reset failed: " + result.errors.join(" "), "error");
      } else {
        setMessage("Reset to the shipped demo spec - press Run Demo or " +
          "Re-run to propagate it.", "ok");
      }
    }).catch(function (err) {
      setMessage("Reset failed" + kindSuffix(err) + ": " + err.message, "error");
    });
  });

  els.importSpecInput.addEventListener("change", function () {
    var file = els.importSpecInput.files[0];
    els.importSpecInput.value = "";
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var imported;
      try {
        imported = JSON.parse(reader.result);
      } catch (e) {
        setMessage("Import failed: not a valid JSON file.", "error");
        return;
      }
      // Accept either a bare spec document or a {"spec": ...} wrapper.
      if (imported && typeof imported === "object" && imported.spec) {
        imported = imported.spec;
      }
      applySpec(Orbit.spec.normalizeSpecShape(imported)).then(function (result) {
        if (result.errors) {
          setMessage("Import rejected: " + result.errors.join(" "), "error");
        } else {
          setMessage("Spec imported from " + file.name + ".", "ok");
        }
      });
    };
    reader.onerror = function () {
      setMessage("Import failed: could not read the file.", "error");
    };
    reader.readAsText(file);
  });

  // ---- clock / render loop --------------------------------------------------------

  function seek(sec) {
    if (!state.scn) return;
    state.simSec = Math.max(0, Math.min(state.scn.durationSec, sec));
    renderPanels();
  }

  var lastFrameMs = null;
  var lastPanelMs = 0;

  function frame(nowMs) {
    if (lastFrameMs != null && state.playing && state.scn) {
      state.simSec += ((nowMs - lastFrameMs) / 1000) * state.speed;
      if (state.simSec >= state.scn.durationSec) {
        // Pause pinned at the end (like the Node console); pressing Play
        // again restarts from the beginning (see the play button handler).
        state.simSec = state.scn.durationSec;
        setPlaying(false);
      }
    }
    lastFrameMs = nowMs;

    if (state.view === "2d") {
      Orbit.map2d.draw(els.canvas2d, state);
    } else if (state.view === "3d") {
      Orbit.globe3d.draw(els.canvas3d, state);
    } else {
      var areaProjection = Orbit.sensorfor.findProjection(
        state.scn, activeSensorAreaRequest());
      Orbit.sensorfor.draw(els.canvasSensorFor, areaProjection,
        state.simSec, !areaProjection || !!areaProjection.stale);
    }

    if (state.scn) {
      els.utcReadout.textContent =
        Orbit.data.fmtUtc(state.scn.epochMs + state.simSec * 1000) + " UTC";
      els.simOffset.textContent = "T+" + Orbit.data.fmtHms(state.simSec);
      Orbit.panels.updateTimelineCursor(els.timelineLanes, state);
      updateHud();
    }

    // Live badges / live state values change with the clock; refresh at ~3 Hz.
    if (nowMs - lastPanelMs > 350) {
      lastPanelMs = nowMs;
      renderPanels();
    }
    requestAnimationFrame(frame);
  }

  function renderPanels() {
    Orbit.panels.renderTree(els.objectTree, state, select, toggleTreeGroup);
    Orbit.panels.renderInspector(els.inspector, state, {
      onSeek: seek,
      onEdit: editObject,
      onDelete: deleteObject,
      onSensor: openSensorDialog,
      onRemoveSensor: removeSensor,
      onManeuver: openManeuverDialog,
      onRemoveManeuver: deleteManeuver,
      onSensorArea: function (request) { selectSensorAreaRequest(request, true); },
    });
  }

  function updateHud() {
    var lines = [];
    var scn = state.scn;
    var liveCount = 0;
    scn.accesses.forEach(function (acc) {
      if (acc.stale) return;
      acc.windows.forEach(function (w) {
        if (state.simSec >= w.startSec && state.simSec <= w.stopSec) liveCount++;
      });
    });
    lines.push(pad("CONTACTS", 10) +
      (liveCount > 0 ? liveCount + " ACTIVE" : "none") +
      (state.dirty ? " (STALE)" : ""));
    // Subsolar point: Orekit samples when present, analytic fallback tagged.
    var sun = Orbit.data.subsolarAt(scn, state.simSec);
    lines.push(pad("SUN", 10) +
      sun.latDeg.toFixed(2) + "  " + sun.lonDeg.toFixed(2) + " SUBSOLAR" +
      (sun.source === "analytic" ? " (approx)" : ""));
    if (state.view === "3d") {
      lines.push(pad("FRAME", 10) +
        (state.viewOptions.frame3d === "eci" ? "INERTIAL GCRF" : "EARTH FIXED"));
    }
    var sel = state.selection && Orbit.panels.findSelected(state, state.selection);
    var scnSat = sel && (sel.scnSat || null);
    if (scnSat) {
      var pos = Orbit.data.samplePosition(scnSat, state.simSec);
      if (pos) {
        lines.push(pad(scnSat.name.toUpperCase().slice(0, 10), 10) +
          pos.latDeg.toFixed(2) + "  " + pos.lonDeg.toFixed(2) + "  " +
          pos.altKm.toFixed(0) + " KM" +
          (scnSat.source === "preview" ? " (PREVIEW)" : ""));
      }
      var lighting = Orbit.data.lightingStateAt(scn, scnSat.name, state.simSec);
      if (lighting) lines.push(pad("LIGHTING", 10) + lighting.toUpperCase());
      // Live sensor phase for the selected platform, when it has pointing.
      var sampled = Orbit.data.pointingAt(scn, scnSat.name, null, state.simSec);
      if (sampled && sampled.phase !== "idle") {
        lines.push(pad("SENSOR", 10) + sampled.phase.toUpperCase() +
          (sampled.targetName ? " " + sampled.targetName.toUpperCase() : ""));
      }
    }
    els.viewportHud.textContent = lines.join("\n");
  }

  function pad(text, n) {
    while (text.length < n) text += " ";
    return text + " ";
  }

  // ---- interaction --------------------------------------------------------------

  function select(name) {
    state.selection = state.selection === name ? null : name;
    if (state.selection && state.selection.indexOf("req:") === 0) {
      var selected = Orbit.panels.findSelected(state, state.selection);
      if (selected && selected.type === "accessRequest" &&
          Orbit.spec.areaGroup(state.spec, selected.request.targetName)) {
        state.sensorAreaKey = Orbit.spec.accessRequestKey(selected.request);
        state.sensorAreaPlatform = selected.request.platformName || selected.request.sourceName || "";
        state.sensorAreaSensor = selected.request.sensorName || "";
        state.sensorAreaTarget = selected.request.targetName || "";
        renderSensorAreaWorkspace();
      }
    }
    renderPanels();
  }

  function toggleTreeGroup(key, wasOpen) {
    state.treeOpen[key] = !wasOpen;
    renderPanels();
  }

  function setView(view) {
    state.view = view;
    els.canvas2d.hidden = view !== "2d";
    els.canvas3d.hidden = view !== "3d";
    els.sensorAreaView.hidden = view !== "sensorArea";
    els.btnView2d.classList.toggle("is-active", view === "2d");
    els.btnView3d.classList.toggle("is-active", view === "3d");
    els.btnViewSensorArea.classList.toggle("is-active", view === "sensorArea");
    els.viewportHud.hidden = view === "sensorArea";
    els.viewportToolbar.hidden = view === "sensorArea";
    els.viewportFrameTag.hidden = view === "sensorArea";
    updateFrameTag();
    els.btnResetView.hidden = view !== "3d";
    if (view === "sensorArea") renderSensorAreaWorkspace();
  }

  function setPlaying(playing) {
    state.playing = playing;
    els.btnPlay.innerHTML = playing ? "&#9208;" : "&#9654;";
    els.btnPlay.classList.toggle("is-active", playing);
  }

  els.btnView2d.addEventListener("click", function () { setView("2d"); });
  els.btnView3d.addEventListener("click", function () { setView("3d"); });
  els.btnViewSensorArea.addEventListener("click", function () { setView("sensorArea"); });
  els.btnPlay.addEventListener("click", function () {
    // Play at the pinned end restarts from the scenario start.
    if (!state.playing && state.scn && state.simSec >= state.scn.durationSec) {
      state.simSec = 0;
    }
    setPlaying(!state.playing);
  });
  els.btnRewind.addEventListener("click", function () { seek(0); });
  els.speedSelect.addEventListener("change", function () {
    state.speed = parseFloat(els.speedSelect.value);
  });

  els.btnSettings.addEventListener("click", function () {
    if (state.spec) openSettingsDialog();
  });
  els.btnAddSat.addEventListener("click", function () {
    if (state.spec) openSatelliteDialog(null);
  });
  els.btnAddTle.addEventListener("click", function () {
    if (state.spec) openTleDialog(null);
  });
  els.btnAddWalker.addEventListener("click", function () {
    if (state.spec) openConstellationDialog();
  });
  els.btnAddStation.addEventListener("click", function () {
    if (state.spec) openGroundDialog("groundStation", null);
  });
  els.btnAddTarget.addEventListener("click", function () {
    if (state.spec) openGroundDialog("target", null);
  });
  els.btnAddArea.addEventListener("click", function () {
    if (state.spec) openAreaDialog(null);
  });
  els.btnAddSensor.addEventListener("click", function () {
    if (state.spec) openSensorDialog(null);
  });
  els.btnAddAccess.addEventListener("click", function () {
    if (state.spec) openAccessDialog();
  });
  els.btnAddSensorAreaAccess.addEventListener("click", function () {
    if (state.spec) addOrOpenSensorAreaAccess();
  });
  els.sensorAreaSensor.addEventListener("change", function () {
    var parts = els.sensorAreaSensor.value.split("|");
    state.sensorAreaPlatform = decodeURIComponent(parts[0] || "");
    state.sensorAreaSensor = decodeURIComponent(parts[1] || "");
    var request = sensorAreaDraftRequest();
    state.sensorAreaKey = request && sensorAreaRequestByKey(
      Orbit.spec.accessRequestKey(request)) ? Orbit.spec.accessRequestKey(request) : "";
    renderSensorAreaWorkspace();
  });
  els.sensorAreaTarget.addEventListener("change", function () {
    state.sensorAreaTarget = els.sensorAreaTarget.value;
    var request = sensorAreaDraftRequest();
    state.sensorAreaKey = request && sensorAreaRequestByKey(
      Orbit.spec.accessRequestKey(request)) ? Orbit.spec.accessRequestKey(request) : "";
    renderSensorAreaWorkspace();
  });
  els.btnAddTask.addEventListener("click", function () {
    if (state.spec) openTaskDialog(null);
  });
  els.btnAddManeuver.addEventListener("click", function () {
    if (state.spec) openManeuverDialog(null, null);
  });

  els.btnRefresh.addEventListener("click", function () {
    Orbit.api.detectBridge().then(function (health) {
      setBridge(health);
      return loadScenario("Refreshing scenario...");
    }).then(function () {
      if (!state.spec) return loadSpec();
      // Keep local edits across refreshes and resync them to the bridge
      // when it is reachable. "detached" specs stay local on purpose: they
      // shadow a stored spec this console cannot represent.
      if (state.bridge && state.specMode !== "detached") {
        state.specMode = "server";
        saveSpecToBridge();
      }
    });
  });

  els.btnRunDemo.addEventListener("click", function () {
    if (state.dirty &&
        !window.confirm("Run Demo replaces the current objects with the demo scenario. Discard unpropagated edits?")) {
      return;
    }
    runJob(Orbit.api.runDemo(), "Demo scenario propagated by MATLAB / Orekit.", true);
  });

  els.btnRunScenario.addEventListener("click", function () {
    if (!state.spec) return;
    var candidate = Orbit.spec.stripEmptyFields(state.spec);
    var errors = Orbit.spec.validateSpec(candidate);
    if (errors.length > 0) {
      setMessage("Spec invalid: " + errors[0], "error");
      return;
    }
    if (candidate.objects.length === 0) {
      setMessage("Nothing to run: the spec has no objects.", "error");
      return;
    }
    runJob(Orbit.api.runScenario(candidate), "Scenario propagated by MATLAB / Orekit.");
  });

  els.canvas2d.addEventListener("click", function (ev) {
    var r = els.canvas2d.getBoundingClientRect();
    var hit = Orbit.map2d.hitTest(els.canvas2d, ev.clientX - r.left, ev.clientY - r.top, state);
    if (hit) select(hit.name);
  });

  els.canvas3d.addEventListener("click", function (ev) {
    if (globeDrag.wasDragged()) return;
    var r = els.canvas3d.getBoundingClientRect();
    var hit = Orbit.globe3d.hitTest(els.canvas3d, ev.clientX - r.left, ev.clientY - r.top, state);
    if (hit) select(hit.name);
  });

  // Typing/select/contenteditable targets (spec form fields live inside a
  // modal, which owns its own key handling below) never see these shortcuts,
  // so plain text entry is never hijacked.
  function isTypingTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!el.isContentEditable;
  }

  window.addEventListener("keydown", function (ev) {
    if (Orbit.modal.isOpen()) return; // js/modal.js owns Escape/Enter while a dialog is open

    if (ev.code === "Space" && ev.target === document.body) {
      ev.preventDefault();
      setPlaying(!state.playing);
      return;
    }
    if (isTypingTarget(ev.target)) return;

    if (ev.key === "Escape") {
      toggleFileMenu(false);
      toggleViewMenu(false);
      toggleWorkerPanel(false);
      return;
    }
    if (ev.key === "1") { setView("2d"); return; }
    if (ev.key === "2") { setView("3d"); return; }
    if (ev.key === "3") { setView("sensorArea"); return; }
    if ((ev.key === "r" || ev.key === "R") && !ev.metaKey && !ev.ctrlKey && !els.btnRefresh.disabled) {
      ev.preventDefault();
      els.btnRefresh.click();
      return;
    }
    if (!state.scn) return; // remaining shortcuts act on the loaded scenario/selection

    if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
      ev.preventDefault();
      var stepSec = state.scn.stepSec || 60;
      seek(state.simSec + (ev.key === "ArrowRight" ? stepSec : -stepSec));
      return;
    }
    if (ev.key === "Home") {
      ev.preventDefault();
      seek(0);
      return;
    }
    if (ev.key === "Delete" && state.spec && state.selection && !state.busy) {
      ev.preventDefault();
      deleteObject(state.selection);
    }
  });

  // ---- boot ----------------------------------------------------------------------

  setView("2d");
  setPlaying(true);
  updateEditButtons();
  setMessage("Looking for the MATLAB bridge...");
  Orbit.api.detectBridge().then(function (health) {
    setBridge(health);
    return loadScenario();
  }).then(function () {
    return loadSpec();
  }).then(function () {
    // Deep links, applied once: ?t=<seconds past epoch>, ?view=2d|3d,
    // ?frame=ecef|eci (3D display frame).
    var search = window.location.search;
    var tMatch = /[?&]t=([0-9.]+)/.exec(search);
    if (tMatch && state.scn) {
      seek(parseFloat(tMatch[1]));
      setPlaying(false);
    }
    var viewMatch = /[?&]view=(2d|3d)/.exec(search);
    if (viewMatch) setView(viewMatch[1]);
    var frameMatch = /[?&]frame=(ecef|eci)/.exec(search);
    if (frameMatch) setFrame3d(frameMatch[1]);
    requestAnimationFrame(frame);
  });
})();
