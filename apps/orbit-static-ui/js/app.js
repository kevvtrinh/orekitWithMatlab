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
    scn: null,        // normalized scenario (Orbit.data.parseScenario)
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
    busy: false,
  };

  var els = {};
  ["scenario-chip", "utc-readout", "btn-refresh", "btn-run-demo", "btn-run-scenario",
    "bridge-pill", "dirty-pill", "btn-view-2d", "btn-view-3d", "canvas-2d", "canvas-3d",
    "viewport-hud", "viewport-frame-tag", "object-tree", "inspector",
    "btn-settings", "btn-file-menu", "file-menu", "menu-import-spec",
    "menu-export-spec", "menu-export-scenario", "import-spec-input",
    "btn-add-sat", "btn-add-station", "btn-add-target",
    "btn-rewind", "btn-play", "speed-select", "sim-offset", "timeline-lanes",
    "status-message", "status-counts", "status-source", "status-bridge",
  ].forEach(function (id) { els[id.replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); })] = document.getElementById(id); });

  var globeDrag = Orbit.globe3d.attach(els.canvas3d);

  // ---- status helpers --------------------------------------------------------

  function setMessage(text, tone) {
    els.statusMessage.textContent = text;
    els.statusMessage.className = "status-item" +
      (tone ? " is-" + tone : "");
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
      els.statusCounts.textContent = counts.sats + " sat - " + counts.grounds +
        " ground - " + (state.scn ? state.scn.accesses.length : 0) + " access";
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
  }

  function updateDirtyUi() {
    els.dirtyPill.hidden = !state.dirty;
    els.timelineLanes.classList.toggle("is-stale", state.dirty);
  }

  function updateEditButtons() {
    var disabled = state.busy || !state.spec;
    [els.btnSettings, els.btnAddSat, els.btnAddStation, els.btnAddTarget]
      .forEach(function (btn) { btn.disabled = disabled; });
    els.menuImportSpec.disabled = state.busy;
  }

  // ---- spec state ------------------------------------------------------------

  function recomputeDirty() {
    state.dirty = !!state.spec &&
      (!state.raw || !Orbit.spec.matchesScenario(state.spec, state.raw));
  }

  // Ground objects are fully defined by the spec; feed them to the renderers
  // directly so inserts/edits/deletes are visible before any MATLAB run.
  // Satellites keep the payload ephemerides (there is no browser propagator
  // at this level), flagged stale via state.dirty.
  function applySpecToView() {
    if (state.scn && state.spec) {
      state.scn.grounds = Orbit.spec.displayGrounds(state.spec);
    }
  }

  function setSpecState(spec) {
    state.spec = spec;
    recomputeDirty();
    applySpecToView();
    if (state.selection && !Orbit.panels.findSelected(state, state.selection)) {
      state.selection = null;
    }
    updateDirtyUi();
    updateEditButtons();
    renderPanels();
    refreshStatusBar();
  }

  function deriveLocalSpec() {
    return state.raw ? Orbit.spec.deriveSpecFromScenario(state.raw) : null;
  }

  function saveSpecToBridge() {
    if (state.specMode !== "server" || !state.bridge || !state.spec) return;
    Orbit.api.saveSpec(state.spec).catch(function (err) {
      Orbit.api.detectBridge().then(function (health) {
        setBridge(health);
        if (health) {
          setMessage("Spec save failed: " + err.message, "error");
        } else {
          state.specMode = "local";
          setMessage("MATLAB bridge unreachable - edits stay local until it returns.", "error");
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
    var objects;
    if (originalName) {
      objects = state.spec.objects.map(function (o) {
        return o.name === originalName ? obj : o;
      });
    } else {
      objects = state.spec.objects.concat([obj]);
    }
    return applySpec(specWith({ objects: objects })).then(function (result) {
      if (result.ok) {
        state.selection = obj.name;
        renderPanels();
      }
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
    state.scn = Orbit.data.parseScenario(raw);
    recomputeDirty();
    applySpecToView();
    state.simSec = Math.min(state.simSec, state.scn.durationSec) || 0;
    if (state.selection && !Orbit.panels.findSelected(state, state.selection)) {
      state.selection = null;
    }
    els.scenarioChip.textContent = state.scn.name;
    els.scenarioChip.title = "Epoch " + Orbit.data.fmtUtc(state.scn.epochMs) +
      " UTC - " + Orbit.data.fmtDuration(state.scn.durationSec) +
      " @ " + state.scn.stepSec + " s";
    Orbit.panels.buildTimeline(els.timelineLanes, state, seek);
    updateDirtyUi();
    renderPanels();
    refreshStatusBar();
  }

  function loadScenario(message) {
    setMessage(message || "Loading scenario...");
    return Orbit.api.loadScenario(!!state.bridge).then(function (res) {
      setScenario(res.scenario, res.source);
      setMessage("Scenario loaded (" + res.source + ").", "ok");
    }).catch(function (err) {
      setMessage("Load failed: " + err.message, "error");
    });
  }

  function setBusy(busy, message) {
    state.busy = busy;
    els.btnRefresh.disabled = busy;
    setBridge(state.bridge); // recompute run-button state
    updateEditButtons();
    if (message) setMessage(message, busy ? "busy" : "ok");
  }

  function runJob(promise, doneMessage, adoptSpecFromPayload) {
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
      setBusy(false);
      setMessage(doneMessage, "ok");
    }).catch(function (err) {
      setBusy(false);
      setMessage("MATLAB run failed: " + err.message, "error");
    });
  }

  // ---- editing dialogs -----------------------------------------------------------

  var KEP_PROPAGATORS = [
    ["Keplerian", "Keplerian (two-body)"],
    ["EcksteinHechler", "Eckstein-Hechler (J2-J6)"],
    ["Numerical", "Numerical (HPOP)"],
  ];

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
      ],
      onSubmit: function (v) {
        return upsertObject({
          kind: "satellite",
          name: v.name,
          color: tpl.color || "",
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
        }, editing ? initial.name : null);
      },
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
        var obj = {
          kind: isTarget ? "target" : "groundStation",
          name: v.name,
          color: tpl.color || "",
          latitudeDeg: v.latitudeDeg,
          longitudeDeg: v.longitudeDeg,
          altitudeM: v.altitudeM,
        };
        if (isTarget) obj.priority = v.priority;
        else obj.minElevationDeg = v.minElevationDeg;
        return upsertObject(obj, editing ? initial.name : null);
      },
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
    var obj = null;
    state.spec.objects.forEach(function (o) { if (o.name === name) obj = o; });
    if (!obj) return;
    if (obj.kind === "satellite") openSatelliteDialog(obj);
    else openGroundDialog(obj.kind, obj);
  }

  function deleteObject(name) {
    if (!window.confirm("Delete '" + name + "' from the scenario?")) return;
    var objects = state.spec.objects.filter(function (o) { return o.name !== name; });
    applySpec(specWith({ objects: objects })).then(function (result) {
      if (result.errors) setMessage(result.errors.join(" "), "error");
      else setMessage("Deleted '" + name + "'.", "ok");
    });
  }

  // ---- import / export --------------------------------------------------------

  function toggleFileMenu(open) {
    els.fileMenu.hidden = open === undefined ? !els.fileMenu.hidden : !open;
  }

  els.btnFileMenu.addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleFileMenu();
  });
  document.addEventListener("click", function () { toggleFileMenu(false); });

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
      if (state.simSec > state.scn.durationSec) state.simSec = 0; // loop playback
    }
    lastFrameMs = nowMs;

    if (state.view === "2d") Orbit.map2d.draw(els.canvas2d, state);
    else Orbit.globe3d.draw(els.canvas3d, state);

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
    Orbit.panels.renderTree(els.objectTree, state, select);
    Orbit.panels.renderInspector(els.inspector, state, {
      onSeek: seek,
      onEdit: editObject,
      onDelete: deleteObject,
    });
  }

  function updateHud() {
    var lines = [];
    var scn = state.scn;
    var liveCount = 0;
    scn.accesses.forEach(function (acc) {
      acc.windows.forEach(function (w) {
        if (state.simSec >= w.startSec && state.simSec <= w.stopSec) liveCount++;
      });
    });
    lines.push(pad("CONTACTS", 10) +
      (liveCount > 0 ? liveCount + " ACTIVE" : "none") +
      (state.dirty ? " (STALE)" : ""));
    var sel = state.selection && Orbit.panels.findSelected(state, state.selection);
    var scnSat = sel && (sel.scnSat || null);
    if (scnSat) {
      var pos = Orbit.data.samplePosition(scnSat, state.simSec);
      if (pos) {
        lines.push(pad(scnSat.name.toUpperCase().slice(0, 10), 10) +
          pos.latDeg.toFixed(2) + "  " + pos.lonDeg.toFixed(2) + "  " +
          pos.altKm.toFixed(0) + " KM");
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
    renderPanels();
  }

  function setView(view) {
    state.view = view;
    els.canvas2d.hidden = view !== "2d";
    els.canvas3d.hidden = view !== "3d";
    els.btnView2d.classList.toggle("is-active", view === "2d");
    els.btnView3d.classList.toggle("is-active", view === "3d");
    els.viewportFrameTag.textContent = view === "2d"
      ? "EARTH FIXED - EQUIRECTANGULAR"
      : "EARTH FIXED - ORTHOGRAPHIC - DRAG TO ROTATE";
  }

  function setPlaying(playing) {
    state.playing = playing;
    els.btnPlay.innerHTML = playing ? "&#9208;" : "&#9654;";
    els.btnPlay.classList.toggle("is-active", playing);
  }

  els.btnView2d.addEventListener("click", function () { setView("2d"); });
  els.btnView3d.addEventListener("click", function () { setView("3d"); });
  els.btnPlay.addEventListener("click", function () { setPlaying(!state.playing); });
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
  els.btnAddStation.addEventListener("click", function () {
    if (state.spec) openGroundDialog("groundStation", null);
  });
  els.btnAddTarget.addEventListener("click", function () {
    if (state.spec) openGroundDialog("target", null);
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

  window.addEventListener("keydown", function (ev) {
    if (ev.code === "Space" && ev.target === document.body && !Orbit.modal.isOpen()) {
      ev.preventDefault();
      setPlaying(!state.playing);
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
    requestAnimationFrame(frame);
  });
})();
