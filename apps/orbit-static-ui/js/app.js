// Orbit console bootstrap: owns the app state, the simulation clock, and the
// render loop; wires the toolbar, viewport, and timeline together.
(function () {
  "use strict";

  var state = {
    raw: null,        // payload as served (for spec derivation)
    scn: null,        // normalized scenario (Orbit.data.parseScenario)
    source: "",       // "sample" | "matlab" | ...
    bridge: null,     // /api/health payload or null
    simSec: 0,
    playing: true,
    speed: 60,
    view: "2d",
    selection: null,
    busy: false,
  };

  var els = {};
  ["scenario-chip", "utc-readout", "btn-refresh", "btn-run-demo", "btn-run-scenario",
    "bridge-pill", "btn-view-2d", "btn-view-3d", "canvas-2d", "canvas-3d",
    "viewport-hud", "viewport-frame-tag", "object-tree", "inspector",
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
    if (state.scn) {
      els.statusCounts.textContent = state.scn.sats.length + " sat - " +
        state.scn.grounds.length + " ground - " + state.scn.accesses.length + " access";
      els.statusSource.textContent = "data: " + state.source;
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
    els.btnRunScenario.title = "Re-propagate the current objects with MATLAB / Orekit" + why;
    refreshStatusBar();
  }

  // ---- scenario loading --------------------------------------------------------

  function setScenario(raw, source) {
    state.raw = raw;
    state.source = source;
    state.scn = Orbit.data.parseScenario(raw);
    state.simSec = Math.min(state.simSec, state.scn.durationSec) || 0;
    if (state.selection && !Orbit.panels.findSelected(state.scn, state.selection)) {
      state.selection = null;
    }
    els.scenarioChip.textContent = state.scn.name;
    els.scenarioChip.title = "Epoch " + Orbit.data.fmtUtc(state.scn.epochMs) +
      " UTC - " + Orbit.data.fmtDuration(state.scn.durationSec) +
      " @ " + state.scn.stepSec + " s";
    Orbit.panels.buildTimeline(els.timelineLanes, state, seek);
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
    if (message) setMessage(message, busy ? "busy" : "ok");
  }

  function runJob(promise, doneMessage) {
    setBusy(true, "MATLAB is propagating with Orekit - the console stays live on current data...");
    promise.then(function (res) {
      if (res && res.scenario) {
        setScenario(res.scenario, res.source || "matlab");
      }
      setBusy(false);
      setMessage(doneMessage, "ok");
    }).catch(function (err) {
      setBusy(false);
      setMessage("MATLAB run failed: " + err.message, "error");
    });
  }

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
    Orbit.panels.renderInspector(els.inspector, state, seek);
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
    lines.push(pad("CONTACTS", 10) + (liveCount > 0 ? liveCount + " ACTIVE" : "none"));
    var sel = state.selection && Orbit.panels.findSelected(scn, state.selection);
    if (sel && sel.kind === "satellite") {
      var pos = Orbit.data.samplePosition(sel, state.simSec);
      if (pos) {
        lines.push(pad(sel.name.toUpperCase().slice(0, 10), 10) +
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

  els.btnRefresh.addEventListener("click", function () {
    Orbit.api.detectBridge().then(function (health) {
      setBridge(health);
      return loadScenario("Refreshing scenario...");
    });
  });

  els.btnRunDemo.addEventListener("click", function () {
    runJob(Orbit.api.runDemo(), "Demo scenario propagated by MATLAB / Orekit.");
  });

  els.btnRunScenario.addEventListener("click", function () {
    if (!state.raw) return;
    var spec = Orbit.data.deriveSpec(state.raw);
    if (spec.objects.length === 0) {
      setMessage("Nothing to re-run: no reconstructable objects in this payload.", "error");
      return;
    }
    runJob(Orbit.api.runScenario(spec), "Scenario re-propagated by MATLAB / Orekit.");
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
    if (ev.code === "Space" && ev.target === document.body) {
      ev.preventDefault();
      setPlaying(!state.playing);
    }
  });

  // ---- boot ----------------------------------------------------------------------

  setView("2d");
  setPlaying(true);
  setMessage("Looking for the MATLAB bridge...");
  Orbit.api.detectBridge().then(function (health) {
    setBridge(health);
    return loadScenario();
  }).then(function () {
    requestAnimationFrame(frame);
  });
})();
