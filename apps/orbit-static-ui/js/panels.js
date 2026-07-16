// Orbit.panels - DOM rendering for the object tree, inspector, and timeline.
// Pure functions of the app state; app.js decides when to re-render. The
// tree and inspector are spec-driven (the editable spec says what exists);
// the propagated payload only contributes ephemerides, access windows, and
// the sensor-task schedule, all flagged stale while the spec has
// unpropagated edits.
//
// Grouping: constellation members (spec `group` on satellites) and area
// target grids (spec `group` on targets) fold into collapsible tree nodes.
// Collapse state lives in app state (state.treeOpen); an area group row is
// selectable (selection key is the group name, which is not an object name).
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var fmt = function () { return Orbit.data; };

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function isLive(acc, simSec) {
    return acc.windows.some(function (w) {
      return simSec >= w.startSec && simSec <= w.stopSec;
    });
  }

  function staleTag(state) {
    return state.dirty ? '<span class="stale-tag">STALE</span>' : "";
  }

  // Per-entry staleness (Orbit.merge marks accesses/schedule/sensorAccesses
  // whose endpoints or timing changed); falls back to the global flag for
  // payloads that predate the merge.
  function entryStale(state, entry) {
    if (entry && entry.stale !== undefined) return !!entry.stale;
    return !!state.dirty;
  }

  function entryStaleTag(state, entry) {
    return entryStale(state, entry) ? '<span class="stale-tag">STALE</span>' : "";
  }

  // Satellite data-source badge: preview (client two-body estimate) or
  // pending (needs a MATLAB run - TLE), nothing when authoritative.
  function sourceBadge(scnSat) {
    if (!scnSat || !scnSat.source || scnSat.source === "matlab") return "";
    if (scnSat.source === "preview") {
      return '<span class="tree-badge tree-badge-preview" title="Two-body browser ' +
        'preview - run MATLAB for the authoritative orbit">prev</span>';
    }
    return '<span class="tree-pending" title="Awaiting a MATLAB run (SGP4 runs ' +
      'on the backend)">RUN</span>';
  }

  function findByName(list, name) {
    for (var i = 0; i < (list || []).length; i++) {
      if (list[i].name === name) return list[i];
    }
    return null;
  }

  function specSatellites(spec) {
    return ((spec && spec.objects) || []).filter(function (o) {
      return o.kind === "satellite";
    });
  }

  // ---- collapse state ---------------------------------------------------------

  // Group keys are namespaced so a constellation and an area can share a name.
  function satGroupKey(group) { return "sat:" + group; }
  function areaGroupKey(group) { return "area:" + group; }

  // Constellations start open, area grids start collapsed (grids can be 100
  // points); an explicit toggle always wins.
  function isOpen(state, key, defaultOpen) {
    var stored = (state.treeOpen || {})[key];
    return stored === undefined ? defaultOpen : stored;
  }

  // ---- access requests ---------------------------------------------------------

  // Selection keys for access requests are namespaced ("req:<key>") so they
  // can never collide with object names.
  function requestSelectionKey(request) {
    return "req:" + Orbit.spec.accessRequestKey(request);
  }

  // ---- sensor tasks --------------------------------------------------------------

  // Selection keys for sensor tasks ("task:<id>"), same namespacing idea.
  function taskSelectionKey(task) {
    return "task:" + ((task && task.id) || "");
  }

  // Schedule entries the last MATLAB run assigned to a spec task, if any.
  function findTaskEntries(state, task) {
    if (!state.scn || !task) return [];
    return state.scn.schedule.filter(function (e) {
      return e.taskId === task.id;
    });
  }

  // The propagated result matching a request, if the last MATLAB run
  // computed it: { access } for plain requests, { sensorAccess } for sensor
  // requests, else null.
  function findRequestResult(state, request) {
    var scn = state.scn;
    if (!scn || !request) return null;
    var type = request.type == null ? "access" : request.type;
    if (type === "sensor") {
      var platform = request.platformName != null
        ? request.platformName : request.sourceName;
      for (var i = 0; i < scn.sensorAccesses.length; i++) {
        var sa = scn.sensorAccesses[i];
        if (sa.platform === platform && sa.target === request.targetName &&
            (!request.sensorName || !sa.sensor || sa.sensor === request.sensorName)) {
          return { sensorAccess: sa };
        }
      }
      return null;
    }
    for (var j = 0; j < scn.accesses.length; j++) {
      var acc = scn.accesses[j];
      if ((acc.source === request.sourceName && acc.target === request.targetName) ||
          (acc.source === request.targetName && acc.target === request.sourceName)) {
        return { access: acc };
      }
    }
    return null;
  }

  // ---- selection -------------------------------------------------------------

  // Resolve a selected name against the spec first (objects, then area target
  // groups, then sensor tasks and access requests), then the payload (an
  // access pair, or a
  // satellite from the last run that is no longer in the spec but still
  // drawn in the viewport). Returns a descriptor or null.
  function findSelected(state, name) {
    var scn = state.scn;
    if (name && name.indexOf("task:") === 0 && state.spec) {
      var taskId = name.slice("task:".length);
      var tasks = Orbit.spec.asArray(state.spec.tasks);
      for (var ti = 0; ti < tasks.length; ti++) {
        if (tasks[ti] && tasks[ti].id === taskId) {
          return {
            type: "task",
            key: name,
            task: tasks[ti],
            entries: findTaskEntries(state, tasks[ti]),
          };
        }
      }
      return null;
    }
    if (name && name.indexOf("req:") === 0 && state.spec) {
      var requests = Orbit.spec.asArray(state.spec.accessRequests);
      for (var r = 0; r < requests.length; r++) {
        if (requests[r] && requestSelectionKey(requests[r]) === name) {
          return {
            type: "accessRequest",
            key: name,
            request: requests[r],
            result: findRequestResult(state, requests[r]),
          };
        }
      }
      return null;
    }
    var sats = specSatellites(state.spec);
    for (var i = 0; i < sats.length; i++) {
      if (sats[i].name === name) {
        return {
          type: "satellite",
          spec: sats[i],
          color: Orbit.spec.satColor(sats[i], i),
          scnSat: scn ? findByName(scn.sats, name) : null,
        };
      }
    }
    var grounds = state.spec
      ? Orbit.spec.displayGrounds(state.spec)
      : (scn ? scn.grounds : []);
    var ground = findByName(grounds, name);
    if (ground) {
      return {
        type: "ground",
        spec: state.spec ? findByName(state.spec.objects, name) : null,
        ground: ground,
      };
    }
    if (state.spec) {
      var group = Orbit.spec.areaGroup(state.spec, name);
      if (group) return { type: "areaGroup", name: name, points: group.points };
    }
    if (name && name.indexOf("vis:") === 0 && scn) {
      // Sensor visibility pair rows ("vis:<platform>|<target>") from the
      // satellite tree children; these exist per payload, not per request.
      var visKey = name.slice("vis:".length);
      for (var v = 0; v < scn.sensorAccesses.length; v++) {
        var sa2 = scn.sensorAccesses[v];
        if (sa2.platform + "|" + sa2.target === visKey) {
          return { type: "sensorAccess", key: name, sensorAccess: sa2 };
        }
      }
      return null;
    }
    if (scn) {
      var acc = findByName(scn.accesses, name);
      if (acc) return { type: "access", access: acc };
      var scnSat = findByName(scn.sats, name);
      if (scnSat) return { type: "payload-satellite", scnSat: scnSat };
    }
    return null;
  }

  function visSelectionKey(sensorAccess) {
    return "vis:" + sensorAccess.platform + "|" + sensorAccess.target;
  }

  // ---- object tree -----------------------------------------------------------

  function satMeta(sat, d) {
    if (sat.orbit && sat.orbit.type === "tle") return "TLE";
    if (sat.orbit && sat.orbit.type === "keplerian") {
      return sat.orbit.inclinationDeg.toFixed(1) + " deg - " +
        Math.round(sat.orbit.semiMajorAxisKm - d.EARTH_RADIUS_KM) + " km";
    }
    return sat.propagator || "?";
  }

  // Child rows nested under an expanded satellite: its sensor, the tasks it
  // may perform, its plain access pairs, and its sensor-visibility pairs -
  // mirroring the Node console's per-satellite disclosure.
  function satChildKey(name) { return "satx:" + name; }

  function satChildSelectionKeys(state, sat) {
    var keys = [];
    var scn = state.scn;
    Orbit.spec.asArray(state.spec && state.spec.tasks).forEach(function (t) {
      if (t && (!t.satelliteName || t.satelliteName === sat.name)) {
        keys.push(taskSelectionKey(t));
      }
    });
    if (scn) {
      scn.accesses.forEach(function (acc) {
        if (acc.source === sat.name || acc.target === sat.name) keys.push(acc.name);
      });
      scn.sensorAccesses.forEach(function (sa) {
        if (sa.platform === sat.name) keys.push(visSelectionKey(sa));
      });
    }
    return keys;
  }

  function satChildRows(state, sat, d) {
    var html = "";
    var scn = state.scn;
    if (sat.sensor) {
      var sensorName = Orbit.spec.sensorDisplayName(sat);
      var meta = "FOV " + (sat.sensor.coneHalfAngleDeg || 20) + " / FOR " +
        (sat.sensor.fieldOfRegardDeg || 60) + " deg";
      html += row2(sat.name, "Sensor: " + sensorName, state.selection,
        "#7fb4d8", false, meta, "", true);
    }
    Orbit.spec.asArray(state.spec && state.spec.tasks).forEach(function (t) {
      if (!t) return;
      if (t.satelliteName && t.satelliteName !== sat.name) return;
      var entries = findTaskEntries(state, t).filter(function (e) {
        return e.platform === sat.name;
      });
      var meta2 = entries.length > 0 ? entries.length + " sched"
        : t.satelliteName ? "pinned" : "any sat";
      html += row2(taskSelectionKey(t), "Task: " + Orbit.spec.taskLabel(t),
        state.selection, "#d1904f", true, meta2, "", true);
    });
    if (scn) {
      scn.accesses.forEach(function (acc) {
        if (acc.source !== sat.name && acc.target !== sat.name) return;
        var other = acc.source === sat.name ? acc.target : acc.source;
        var live = !entryStale(state, acc) && isLive(acc, state.simSec);
        html += row2(acc.name, "Access to " + other, state.selection, "#5fc98f",
          true, acc.windows.length + " win",
          live ? '<span class="tree-live">LIVE</span>' : "", true);
      });
      scn.sensorAccesses.forEach(function (sa) {
        if (sa.platform !== sat.name) return;
        html += row2(visSelectionKey(sa), "Vis: " + sa.target, state.selection,
          "#c77ddb", true,
          "FOR " + sa.forWindows.length + " / FOV " + sa.fovWindows.length,
          entryStaleTag(state, sa), true);
      });
    }
    return html;
  }

  function satRows(entries, state, d, child) {
    var html = "";
    entries.forEach(function (entry) {
      var sat = entry.sat;
      var scnSat = state.scn ? findByName(state.scn.sats, sat.name) : null;
      var childKeys = satChildSelectionKeys(state, sat);
      var hasChildren = !!sat.sensor || childKeys.length > 0;
      var key = satChildKey(sat.name);
      var open = hasChildren && (isOpen(state, key, false) ||
        childKeys.indexOf(state.selection) >= 0);
      if (hasChildren && !child) {
        var toggleAttrs = ' data-toggle="' + esc(key) + '" data-open="' +
          (open ? "1" : "0") + '"';
        html += '<div class="tree-subrow">' +
          '<button class="tree-disclosure"' + toggleAttrs +
          ' aria-expanded="' + (open ? "true" : "false") + '" title="' +
          (open ? "Collapse" : "Expand") + " " + esc(sat.name) + '">' +
          (open ? "v" : "&gt;") + "</button>" +
          satRowButton(sat, entry.index, state, scnSat, d) + "</div>";
        if (open) html += satChildRows(state, sat, d);
      } else {
        html += satRowButton(sat, entry.index, state, scnSat, d, child);
      }
    });
    return html;
  }

  function satRowButton(sat, index, state, scnSat, d, child) {
    return row2(sat.name, sat.name, state.selection,
      Orbit.spec.satColor(sat, index), false,
      satMeta(sat, d), sourceBadge(scnSat), !!child);
  }

  // groupRow: collapsible header line (chevron + label). `selectable` rows
  // (area groups) also select the group in the inspector. data-open carries
  // the effective rendered state so the toggle handler can flip it even when
  // a selected member forced the group open.
  function groupRow(key, label, open, meta, selection, selectable) {
    var toggleAttrs = ' data-toggle="' + esc(key) + '" data-open="' +
      (open ? "1" : "0") + '"';
    return '<div class="tree-subrow">' +
      '<button class="tree-disclosure"' + toggleAttrs +
      ' aria-expanded="' + (open ? "true" : "false") + '" title="' +
      (open ? "Collapse" : "Expand") + " " + esc(label) + '">' +
      (open ? "v" : "&gt;") + "</button>" +
      '<button class="tree-row tree-row-group' +
      (selection === label && selectable ? " is-selected" : "") + '"' +
      (selectable ? ' data-name="' + esc(label) + '"' : toggleAttrs) +
      '><span class="tree-name">' + esc(label) + "</span>" +
      '<span class="tree-meta">' + esc(meta) + "</span></button></div>";
  }

  function renderTree(el, state, onSelect, onToggle) {
    var scn = state.scn;
    var spec = state.spec;
    if (!scn && !spec) {
      el.innerHTML = '<div class="tree-empty">No scenario loaded.</div>';
      return;
    }
    var d = fmt();
    var html = "";

    // Satellites: ungrouped first, then one collapsible node per
    // constellation group (spec `group` tag from expandWalker).
    if (spec) {
      var sats = specSatellites(spec);
      var ungrouped = [];
      var groups = [];
      var groupsByName = {};
      sats.forEach(function (sat, i) {
        var entry = { sat: sat, index: i };
        if (sat.group) {
          if (!groupsByName[sat.group]) {
            groupsByName[sat.group] = { name: sat.group, members: [] };
            groups.push(groupsByName[sat.group]);
          }
          groupsByName[sat.group].members.push(entry);
        } else {
          ungrouped.push(entry);
        }
      });
      html += '<div class="tree-group-label">SATELLITES (' + sats.length + ")</div>";
      html += satRows(ungrouped, state, d, false);
      groups.forEach(function (g) {
        var key = satGroupKey(g.name);
        var open = isOpen(state, key, true) ||
          g.members.some(function (m) { return m.sat.name === state.selection; });
        html += groupRow(key, g.name, open, g.members.length + " sats",
          state.selection, false);
        if (open) html += satRows(g.members, state, d, true);
      });
    } else {
      html += '<div class="tree-group-label">SATELLITES (' + scn.sats.length + ")</div>";
      scn.sats.forEach(function (sat) {
        var meta = sat.elements
          ? sat.elements.inclinationDeg.toFixed(1) + " deg - " +
            Math.round(sat.elements.semiMajorAxisKm - d.EARTH_RADIUS_KM) + " km"
          : sat.propagatorType;
        html += row(sat.name, state.selection, sat.color, false, meta, "", false);
      });
    }

    // Ground stations and targets; area grids fold into their groups.
    var grounds = spec ? Orbit.spec.displayGrounds(spec) : scn.grounds;
    var stations = grounds.filter(function (gp) { return gp.kind !== "target"; });
    var targets = grounds.filter(function (gp) { return gp.kind === "target"; });
    var pointTargets = targets.filter(function (gp) { return !gp.group; });
    var areaGroups = [];
    var areasByName = {};
    targets.forEach(function (gp) {
      if (!gp.group) return;
      if (!areasByName[gp.group]) {
        areasByName[gp.group] = { name: gp.group, points: [] };
        areaGroups.push(areasByName[gp.group]);
      }
      areasByName[gp.group].points.push(gp);
    });

    html += '<div class="tree-group-label">GROUND STATIONS (' + stations.length + ")</div>";
    stations.forEach(function (gp) {
      var meta = gp.latDeg.toFixed(1) + " deg, " + gp.lonDeg.toFixed(1) + " deg";
      html += row(gp.name, state.selection, gp.color, false, meta, "", false);
    });

    // Each area counts as one target in the section header; its grid points
    // are implementation detail.
    html += '<div class="tree-group-label">TARGETS (' +
      (pointTargets.length + areaGroups.length) + ")</div>";
    pointTargets.forEach(function (gp) {
      var meta = gp.latDeg.toFixed(1) + " deg, " + gp.lonDeg.toFixed(1) + " deg";
      html += row(gp.name, state.selection, gp.color, true, meta, "", false);
    });
    areaGroups.forEach(function (g) {
      var key = areaGroupKey(g.name);
      var open = isOpen(state, key, false) ||
        g.points.some(function (p) { return p.name === state.selection; });
      html += groupRow(key, g.name, open, g.points.length + " pts",
        state.selection, true);
      if (open) {
        g.points.forEach(function (gp) {
          var meta = gp.latDeg.toFixed(1) + " deg, " + gp.lonDeg.toFixed(1) + " deg";
          html += row(gp.name, state.selection, gp.color, true, meta, "", true);
        });
      }
    });

    // Sensor tasks (spec.tasks). Rows show whether the last run scheduled
    // the task ("n sched"), decided it could not fit ("unsched"), or has not
    // seen it yet (RUN tag); the header carries the stale tag while the spec
    // has unpropagated edits.
    if (spec && spec.tasks !== undefined) {
      var tasks = Orbit.spec.asArray(spec.tasks);
      html += '<div class="tree-group-label">SENSOR TASKS (' + tasks.length +
        ")" + staleTag(state) + "</div>";
      if (tasks.length === 0) {
        html += '<div class="tree-empty">No sensor tasks. Use + Task to ' +
          "request point imaging or area scans.</div>";
      }
      tasks.forEach(function (task) {
        if (!task) return;
        var entries = findTaskEntries(state, task);
        var live = !state.dirty && entries.some(function (e) {
          return state.simSec >= e.startSec && state.simSec <= e.stopSec;
        });
        var meta = "";
        var extra = live ? '<span class="tree-live">LIVE</span>' : "";
        if (entries.length > 0) {
          meta = entries.length + " sched";
        } else if (!state.dirty && scn && scn.hasSchedule) {
          meta = "unsched";
        } else {
          extra += '<span class="tree-pending">RUN</span>';
        }
        html += row2(taskSelectionKey(task),
          Orbit.spec.taskLabel(task) + " -> " + (task.targetName || "?"),
          state.selection, "#d1904f", true, meta, extra, false);
      });
    }

    // Requested access products (spec.accessRequests). Rows show whether the
    // last run computed the pair; the header carries the stale tag when the
    // spec has unpropagated edits.
    if (spec && spec.accessRequests !== undefined) {
      var requests = Orbit.spec.asArray(spec.accessRequests);
      html += '<div class="tree-group-label">ACCESS REQUESTS (' + requests.length +
        ")" + staleTag(state) + "</div>";
      if (requests.length === 0) {
        html += '<div class="tree-empty">No pairs requested - the next Re-run ' +
          "computes no access windows. Use + Access to request pairs.</div>";
      }
      requests.forEach(function (req) {
        if (!req) return;
        var isSensor = (req.type == null ? "access" : req.type) === "sensor";
        var result = findRequestResult(state, req);
        var meta = "";
        var extra = "";
        if (result && result.access) {
          meta = result.access.windows.length + " win";
        } else if (result && result.sensorAccess) {
          meta = "FOR " + result.sensorAccess.forWindows.length +
            " / FOV " + result.sensorAccess.fovWindows.length;
        } else {
          extra = '<span class="tree-pending">RUN</span>';
        }
        html += row2(requestSelectionKey(req), Orbit.spec.accessRequestLabel(req),
          state.selection, isSensor ? "#c77ddb" : "#5fc98f", true, meta, extra, false);
      });
    }

    var accesses = scn ? scn.accesses : [];
    html += '<div class="tree-group-label">ACCESS (' + accesses.length + ")" +
      staleTag(state) + "</div>";
    if (accesses.length === 0) {
      html += '<div class="tree-empty">No access pairs computed.</div>';
    }
    accesses.forEach(function (acc) {
      var live = !state.dirty && isLive(acc, state.simSec);
      var meta = acc.windows.length + " win";
      html += row(acc.name, state.selection, "#5fc98f", true, meta,
        live ? '<span class="tree-live">LIVE</span>' : "", false);
    });

    el.innerHTML = html;
    el.querySelectorAll("[data-name]").forEach(function (btn) {
      btn.addEventListener("click", function () { onSelect(btn.dataset.name); });
    });
    el.querySelectorAll("[data-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onToggle(btn.dataset.toggle, btn.dataset.open === "1");
      });
    });
  }

  function row(name, selection, color, square, meta, extra, child) {
    return row2(name, name, selection, color, square, meta, extra, child);
  }

  // Like row() but the selection key and the visible label differ (access
  // request rows select "req:<key>" while showing the pair label).
  function row2(key, label, selection, color, square, meta, extra, child) {
    return '<button class="tree-row' + (child ? " tree-row-child" : "") +
      (selection === key ? " is-selected" : "") +
      '" data-name="' + esc(key) + '">' +
      '<span class="tree-dot' + (square ? " dot-square" : "") +
      '" style="background:' + esc(color) + '"></span>' +
      '<span class="tree-name">' + esc(label) + "</span>" + extra +
      '<span class="tree-meta">' + esc(meta) + "</span></button>";
  }

  // ---- inspector ---------------------------------------------------------------

  // handlers: { onSeek(sec), onEdit(name), onDelete(name),
  //   onSensor(satName), onRemoveSensor(satName),
  //   onManeuver(satName, indexOrNull), onRemoveManeuver(satName, index),
  //   onSensorArea(request) }
  function renderInspector(el, state, handlers) {
    var sel = state.selection ? findSelected(state, state.selection) : null;
    if (!sel) {
      el.innerHTML = '<div class="insp-hint">Select a satellite, ground object, ' +
        "area target, sensor task, access request, or access pair to see its " +
        "details.<br><br>" +
        "Click objects in the tree or directly in the mission view.</div>";
      return;
    }
    if (sel.type === "satellite") el.innerHTML = specSatelliteHtml(sel, state);
    else if (sel.type === "ground") el.innerHTML = groundHtml(sel, state);
    else if (sel.type === "areaGroup") el.innerHTML = areaGroupHtml(sel, state);
    else if (sel.type === "task") el.innerHTML = taskHtml(sel, state);
    else if (sel.type === "accessRequest") el.innerHTML = accessRequestHtml(sel, state);
    else if (sel.type === "sensorAccess") el.innerHTML = sensorAccessHtml(sel, state);
    else if (sel.type === "access") el.innerHTML = accessHtml(sel.access, state);
    else el.innerHTML = payloadSatelliteHtml(sel.scnSat, state);

    el.querySelectorAll(".window-row").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handlers.onSeek(parseFloat(btn.dataset.seek));
      });
    });
    var editBtn = el.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        handlers.onEdit(editBtn.dataset.name);
      });
    }
    var deleteBtn = el.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        handlers.onDelete(deleteBtn.dataset.name);
      });
    }
    var sensorBtn = el.querySelector('[data-action="sensor"]');
    if (sensorBtn) {
      sensorBtn.addEventListener("click", function () {
        handlers.onSensor(sensorBtn.dataset.name);
      });
    }
    var removeSensorBtn = el.querySelector('[data-action="remove-sensor"]');
    if (removeSensorBtn) {
      removeSensorBtn.addEventListener("click", function () {
        handlers.onRemoveSensor(removeSensorBtn.dataset.name);
      });
    }
    el.querySelectorAll('[data-action="maneuver-add"], [data-action="maneuver-edit"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          handlers.onManeuver(btn.dataset.name,
            btn.dataset.index === undefined ? null : parseInt(btn.dataset.index, 10));
        });
      });
    el.querySelectorAll('[data-action="maneuver-del"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        handlers.onRemoveManeuver(btn.dataset.name, parseInt(btn.dataset.index, 10));
      });
    });
    var sensorAreaBtn = el.querySelector('[data-action="sensor-area-view"]');
    if (sensorAreaBtn) {
      sensorAreaBtn.addEventListener("click", function () {
        var selected = state.selection ? findSelected(state, state.selection) : null;
        if (selected && selected.type === "accessRequest") {
          handlers.onSensorArea(selected.request);
        }
      });
    }
  }

  function kv(pairs) {
    var html = '<dl class="insp-kv">';
    pairs.forEach(function (p) {
      html += "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
    });
    return html + "</dl>";
  }

  function actionsHtml(name, disabled) {
    var dis = disabled ? " disabled" : "";
    return '<div class="insp-actions">' +
      '<button class="btn btn-small" data-action="edit" data-name="' +
      esc(name) + '"' + dis + ">Edit</button>" +
      '<button class="btn btn-small btn-danger" data-action="delete" data-name="' +
      esc(name) + '" title="Delete (Del)"' + dis + ">Delete</button></div>";
  }

  function elementsKv(d, orbit) {
    return kv([
      ["Semi-major axis", orbit.semiMajorAxisKm.toFixed(1) + " km"],
      ["Eccentricity", orbit.eccentricity.toFixed(5)],
      ["Inclination", d.fmtDeg(orbit.inclinationDeg)],
      ["RAAN", d.fmtDeg(orbit.raanDeg)],
      ["Arg. of perigee", d.fmtDeg(orbit.argPerigeeDeg)],
      ["True anomaly", d.fmtDeg(orbit.trueAnomalyDeg)],
    ]);
  }

  function liveStateHtml(d, scnSat, state) {
    var pos = d.samplePosition(scnSat, state.simSec);
    if (!pos) return "";
    var pairs = [
      ["Latitude", d.fmtDeg(pos.latDeg, 3)],
      ["Longitude", d.fmtDeg(pos.lonDeg, 3)],
      ["Altitude", pos.altKm.toFixed(1) + " km"],
    ];
    var eci = d.sampleEci(scnSat, state.simSec);
    if (eci) {
      pairs.push(["ECI position", "[" + eci.x.toFixed(0) + ", " +
        eci.y.toFixed(0) + ", " + eci.z.toFixed(0) + "] km"]);
    }
    var lighting = d.lightingStateAt(state.scn, scnSat.name, state.simSec);
    if (lighting) pairs.push(["Lighting", lighting]);
    var sourceNote = scnSat.source === "preview"
      ? '<span class="tree-badge tree-badge-preview">browser preview</span>'
      : "";
    return '<div class="insp-caption">LIVE STATE (T+' + d.fmtHms(state.simSec) +
      ")" + sourceNote + (scnSat.source === "matlab" ? "" : staleTag(state)) +
      "</div>" + kv(pairs);
  }

  // Sensor visibility pair (payload sensorAccesses entry): both gating modes
  // for one platform/target combination, whether or not a request exists.
  function sensorAccessHtml(sel, state) {
    var sa = sel.sensorAccess;
    return '<div class="insp-section">' +
      '<div class="insp-title">' + esc(sa.platform) + " sensor &#8594; " +
      esc(sa.target) + entryStaleTag(state, sa) + "</div>" +
      '<div class="insp-subtitle">Sensor visibility - computed by the last ' +
      "MATLAB run" + (sa.sensor ? " - " + esc(sa.sensor) : "") + "</div>" +
      kv([["Platform", sa.platform], ["Sensor", sa.sensor || "(default)"],
        ["Target", sa.target]]) +
      '<div class="insp-caption">FOR WINDOWS (SLEW-REACHABLE)' +
      entryStaleTag(state, sa) + "</div>" +
      windowListHtml(sa.forWindows, state) +
      '<div class="insp-caption">FOV WINDOWS (IN BEAM)' +
      entryStaleTag(state, sa) + "</div>" +
      windowListHtml(sa.fovWindows, state) + "</div>";
  }

  function specSatelliteHtml(sel, state) {
    var d = fmt();
    var sat = sel.spec;
    var isTle = sat.orbit && sat.orbit.type === "tle";
    var html = '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot" style="background:' +
      esc(sel.color) + '"></span>' + esc(sat.name) + "</div>" +
      '<div class="insp-subtitle">Satellite - ' + (isTle ? "TLE" : "Keplerian") +
      " - " + esc(sat.propagator || "?") +
      (sat.group ? " - " + esc(sat.group) : "") + "</div>";

    if (sel.scnSat) html += liveStateHtml(d, sel.scnSat, state);

    if (isTle) {
      html += '<hr class="insp-divider"><div class="insp-caption">TWO-LINE ELEMENTS</div>' +
        '<div class="insp-tle">' + esc(sat.orbit.line1 || "") + "\n" +
        esc(sat.orbit.line2 || "") + "</div>";
    } else {
      html += '<hr class="insp-divider"><div class="insp-caption">KEPLERIAN ELEMENTS</div>' +
        elementsKv(d, sat.orbit);
    }
    if (sat.massKg != null) html += kv([["Mass", sat.massKg + " kg"]]);

    html += sensorSectionHtml(sat, state);
    html += maneuverSectionHtml(sat, state);
    html += scheduledTasksSectionHtml(sat, state);

    html += '<hr class="insp-divider"><div class="insp-caption">EPHEMERIS' +
      staleTag(state) + "</div>";
    if (sel.scnSat && sel.scnSat.t.length > 0) {
      html += kv([
        ["Samples", String(sel.scnSat.t.length)],
        ["Span", d.fmtDuration(sel.scnSat.t[sel.scnSat.t.length - 1] - sel.scnSat.t[0])],
      ]);
    } else {
      html += '<div class="insp-hint">Not propagated yet - run the spec in MATLAB.</div>';
    }
    return html + actionsHtml(sat.name, state.busy) + "</div>";
  }

  // A satellite from the last MATLAB run that the spec no longer contains
  // (deleted or renamed since); read-only leftovers of the payload.
  function payloadSatelliteHtml(sat, state) {
    var d = fmt();
    var html = '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot" style="background:' +
      esc(sat.color) + '"></span>' + esc(sat.name) + "</div>" +
      '<div class="insp-subtitle">Satellite - ' + esc(sat.propagatorType || "?") +
      " - not in the current spec</div>" +
      liveStateHtml(d, sat, state);
    if (sat.elements) {
      html += '<hr class="insp-divider"><div class="insp-caption">KEPLERIAN ELEMENTS' +
        staleTag(state) + "</div>" + elementsKv(d, sat.elements);
    }
    return html + "</div>";
  }

  // Comma list of task labels targeting any of the given names ("" if none).
  function taskNamesForTargets(state, names) {
    var lookup = {};
    names.forEach(function (n) { lookup[n] = true; });
    var labels = [];
    Orbit.spec.asArray(state.spec && state.spec.tasks).forEach(function (t) {
      if (t && lookup[t.targetName]) labels.push(Orbit.spec.taskLabel(t));
    });
    return labels.join(", ");
  }

  function groundHtml(sel, state) {
    var d = fmt();
    var gp = sel.ground;
    var pairs = [
      ["Latitude", d.fmtDeg(gp.latDeg, 4)],
      ["Longitude", d.fmtDeg(gp.lonDeg, 4)],
      ["Altitude", gp.altM.toFixed(0) + " m"],
    ];
    if (gp.minElevationDeg != null) pairs.push(["Min elevation", d.fmtDeg(gp.minElevationDeg, 1)]);
    if (gp.priority != null) pairs.push(["Priority", String(gp.priority)]);
    if (gp.kind === "groundStation") {
      var daylight = d.groundDaylightAt(state.scn, gp.name, state.simSec);
      if (daylight != null) pairs.push(["Daylight", daylight ? "Yes" : "No (night)"]);
    }
    var member = sel.spec && sel.spec.group;
    if (gp.kind === "target") {
      // Tasks imaging this point directly, or scanning its parent area.
      var taskedBy = taskNamesForTargets(state,
        member ? [gp.name, member] : [gp.name]);
      if (taskedBy) pairs.push(["Tasked by", taskedBy]);
    }
    return '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot dot-square" style="background:' +
      esc(gp.color) + '"></span>' + esc(gp.name) + "</div>" +
      '<div class="insp-subtitle">' +
      (gp.kind === "target"
        ? (member ? "Grid point - area " + esc(member) : "Point target")
        : "Ground station") + "</div>" +
      kv(pairs) +
      (member
        ? '<div class="insp-hint">Part of area target \'' + esc(member) +
          "' - select the area group in the tree to edit or delete the whole grid.</div>"
        : "") +
      (sel.spec ? actionsHtml(gp.name, state.busy) : "") + "</div>";
  }

  function areaGroupHtml(sel, state) {
    var d = fmt();
    var points = sel.points;
    var area = null;
    for (var i = 0; i < points.length; i++) {
      var specObj = state.spec ? findByName(state.spec.objects, points[i].name) : null;
      if (specObj && specObj.area) { area = specObj.area; break; }
    }
    var pairs = [["Grid points", String(points.length)]];
    if (area) {
      pairs.push(
        ["Center", d.fmtDeg(area.centerLatDeg, 3) + ", " + d.fmtDeg(area.centerLonDeg, 3)],
        ["Size", area.widthKm + " x " + area.heightKm + " km"],
        ["Spacing", area.spacingKm + " km"]);
    }
    var priority = points.length > 0 ? points[0].priority : null;
    if (priority != null) pairs.push(["Priority", String(priority)]);
    // Tasks scanning the whole area or imaging one of its grid points.
    var taskedBy = taskNamesForTargets(state,
      [sel.name].concat(points.map(function (p) { return p.name; })));
    if (taskedBy) pairs.push(["Tasked by", taskedBy]);
    return '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot dot-square" ' +
      'style="background:#4fd1a3"></span>' + esc(sel.name) + "</div>" +
      '<div class="insp-subtitle">Area target - sampled as ' + points.length +
      " grid point" + (points.length === 1 ? "" : "s") + "</div>" +
      kv(pairs) +
      '<div class="insp-hint">Editing regenerates the grid from the area ' +
      "parameters; deleting removes every grid point.</div>" +
      actionsHtml(sel.name, state.busy) + "</div>";
  }

  // Satellite sensor block: parameters plus add/edit/remove controls. The
  // sensor lives on the satellite spec object; there is no standalone
  // sensor entry in the tree.
  function sensorSectionHtml(sat, state) {
    var d = fmt();
    var dis = state.busy ? " disabled" : "";
    var html = '<hr class="insp-divider"><div class="insp-caption">SENSOR</div>';
    if (!sat.sensor) {
      return html + '<div class="insp-hint">No sensor equipped.</div>' +
        '<div class="insp-actions">' +
        '<button class="btn btn-small" data-action="sensor" data-name="' +
        esc(sat.name) + '"' + dis + ">Add Sensor</button></div>";
    }
    var sensor = sat.sensor;
    var pairs = [
      ["Name", Orbit.spec.sensorDisplayName(sat)],
      ["FOV half-angle", d.fmtDeg(sensor.coneHalfAngleDeg, 1)],
      ["Field of regard", d.fmtDeg(sensor.fieldOfRegardDeg, 1)],
    ];
    if (sensor.slewRateDegPerSec != null) {
      pairs.push(["Slew rate", sensor.slewRateDegPerSec + " deg/s"]);
    }
    pairs.push(["Pointing", sensor.pointing || "Nadir"]);
    if ((sensor.pointing || "Nadir") === "FixedVector" &&
        Array.isArray(sensor.boresight)) {
      pairs.push(["Boresight", sensor.boresight.join(", ")]);
    }
    // Live pointing phase: the backend's exported pointing samples when the
    // schedule is fresh (authoritative, includes the real area-scan sweep),
    // else the client-side phase model over fresh schedule entries.
    var sampled = state.scn ? Orbit.data.pointingAt(state.scn, sat.name,
      sensor.name || null, state.simSec) : null;
    if (sampled) {
      var sampledText;
      if (sampled.phase === "track") {
        sampledText = "Tracking " + (sampled.targetName || "target");
      } else if (sampled.phase === "scan") {
        sampledText = "Scanning " + (sampled.targetName || "area");
        if (sampled.aimLatDeg != null) {
          sampledText += " @ " + sampled.aimLatDeg.toFixed(2) + ", " +
            sampled.aimLonDeg.toFixed(2);
        }
      } else if (sampled.phase === "slew") {
        sampledText = "Slewing to " + (sampled.targetName || "target");
      } else if (sampled.phase === "return") {
        sampledText = "Returning home from " + (sampled.targetName || "target");
      } else {
        sampledText = (sensor.pointing || "Nadir") + " (home)";
      }
      pairs.push(["Live pointing", sampledText]);
      pairs.push(["Pointing source", "MATLAB (authoritative)"]);
    } else if (state.scn && state.scn.hasSchedule) {
      var freshEntries = Orbit.data.scheduleForPlatform(state.scn.schedule, sat.name)
        .filter(function (e) { return !entryStale(state, e); });
      var pointing = Orbit.data.pointingStateAt(freshEntries, state.simSec);
      var pct = Math.round(pointing.progress * 100);
      var text;
      if (pointing.phase === "track") {
        text = "Tracking " + pointing.entry.target;
      } else if (pointing.phase === "slew") {
        text = "Slewing to " + pointing.entry.target + " (" + pct + "%)";
      } else if (pointing.phase === "return") {
        text = "Returning home from " + pointing.entry.target + " (" + pct + "%)";
      } else {
        text = (sensor.pointing || "Nadir") + " (home)";
      }
      pairs.push(["Live pointing", text]);
      pairs.push(["Pointing source",
        state.dirty ? "estimate (results stale - Re-run)" : "schedule estimate"]);
    }
    return html + kv(pairs) +
      '<div class="insp-actions">' +
      '<button class="btn btn-small" data-action="sensor" data-name="' +
      esc(sat.name) + '"' + dis + ">Edit Sensor</button>" +
      '<button class="btn btn-small btn-danger" data-action="remove-sensor" data-name="' +
      esc(sat.name) + '"' + dis + ">Remove Sensor</button></div>";
  }

  // Impulsive maneuvers on a satellite: each row seeks the clock to the burn
  // time; Edit / x act on the maneuver's list index. SGP4 satellites cannot
  // maneuver (buildScenarioFromSpec rejects them), so they only get a hint.
  function maneuverSectionHtml(sat, state) {
    var d = fmt();
    var dis = state.busy ? " disabled" : "";
    var isTle = sat.propagator === "TLE";
    var maneuvers = Orbit.spec.asArray(sat.maneuvers);
    var html = '<hr class="insp-divider"><div class="insp-caption">MANEUVERS</div>';
    if (isTle) {
      return html + '<div class="insp-hint">SGP4 satellites cannot maneuver - ' +
        "switch the propagator to Numerical to plan burns.</div>";
    }
    maneuvers.forEach(function (m, i) {
      var label = (m && m.name) || "Maneuver " + (i + 1);
      var offset = m && m.timeOffsetSec != null ? m.timeOffsetSec : 0;
      var dv = m && Array.isArray(m.deltaVmps) ? m.deltaVmps : [0, 0, 0];
      html += '<div class="maneuver-row">' +
        '<button class="window-row" data-seek="' + offset + '">' +
        '<span class="win-time">T+' + esc(d.fmtHms(offset)) + " " + esc(label) +
        "</span>" +
        '<span class="win-meta">' + esc((m && m.frame) || "TNW") + " [" +
        esc(dv.join(", ")) + "] m/s</span></button>" +
        '<button class="btn btn-small" data-action="maneuver-edit" data-name="' +
        esc(sat.name) + '" data-index="' + i + '"' + dis + ">Edit</button>" +
        '<button class="btn btn-small btn-danger" data-action="maneuver-del" data-name="' +
        esc(sat.name) + '" data-index="' + i + '"' + dis + ">&#10005;</button></div>";
    });
    if (maneuvers.length === 0) {
      html += '<div class="insp-hint">No maneuvers planned.</div>';
    }
    var full = maneuvers.length >= Orbit.spec.MAX_MANEUVERS_PER_SATELLITE;
    return html + '<div class="insp-actions">' +
      '<button class="btn btn-small" data-action="maneuver-add" data-name="' +
      esc(sat.name) + '"' + (state.busy || full ? " disabled" : "") +
      ">Add Maneuver</button></div>";
  }

  // Schedule entries assigned to this platform by the last MATLAB run.
  function scheduledTasksSectionHtml(sat, state) {
    var scn = state.scn;
    var entries = scn ? Orbit.data.scheduleForPlatform(scn.schedule, sat.name) : [];
    if (entries.length === 0 && !sat.sensor) return "";
    var html = '<hr class="insp-divider"><div class="insp-caption">SCHEDULED TASKS' +
      staleTag(state) + "</div>";
    if (entries.length > 0) {
      html += scheduleListHtml(entries, state, function (e) {
        return Orbit.spec.taskLabel({ id: e.taskId, name: e.taskName }) +
          " -> " + e.target;
      });
    } else if (scn && scn.hasSchedule && !state.dirty) {
      html += '<div class="insp-hint">No tasks scheduled on this sensor.</div>';
    } else {
      html += '<div class="insp-hint">Task assignments appear after a MATLAB ' +
        "run (+ Task, then Re-run).</div>";
    }
    return html;
  }

  // An authored sensor task (spec.tasks entry): what was asked for, whether
  // the last run scheduled it, and the assigned windows when it did.
  function taskHtml(sel, state) {
    var task = sel.task;
    var isArea = (task.taskType || "TrackPointTarget") === "ScanAreaTarget";
    var dis = state.busy ? " disabled" : "";
    var pairs = [
      ["Task ID", task.id || "?"],
      ["Type", isArea ? "ScanAreaTarget" : "TrackPointTarget"],
      ["Target", (task.targetName || "?") + (isArea ? " (area)" : "")],
      ["Satellite", task.satelliteName || "Any (scheduler picks)"],
    ];
    if (task.dwellSeconds != null) {
      pairs.push([isArea ? "Dwell per point" : "Dwell", task.dwellSeconds + " s"]);
    }
    if (isArea) {
      pairs.push(["Required coverage",
        (task.requiredCoveragePercent == null ? 70 : task.requiredCoveragePercent) + " %"]);
    }
    if (task.priority != null) pairs.push(["Priority", String(task.priority)]);

    var html = '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot dot-square" ' +
      'style="background:#d1904f"></span>' + esc(Orbit.spec.taskLabel(task)) +
      staleTag(state) + "</div>" +
      '<div class="insp-subtitle">Sensor task - ' +
      (isArea ? "scan an area target's grid" : "track a point target") + "</div>" +
      kv(pairs);

    html += '<div class="insp-caption">SCHEDULED WINDOWS - CLICK TO JUMP' +
      staleTag(state) + "</div>";
    if (sel.entries.length > 0) {
      html += scheduleListHtml(sel.entries, state, function (e) {
        var suffix = e.sensor || e.platform;
        if (e.qualityScore != null) suffix += " - q " + e.qualityScore.toFixed(2);
        return suffix;
      });
    } else if (!state.dirty && state.scn && state.scn.hasSchedule) {
      html += '<div class="insp-hint">The last run could not schedule this ' +
        "task: no candidate window satisfied its dwell/coverage constraints " +
        "within the sensor's field of regard (higher-priority tasks win " +
        "conflicts). Try a longer scenario, a wider FOR, or a lower dwell.</div>";
    } else {
      html += '<div class="insp-hint">Not scheduled yet - press Re-run to let ' +
        "the MATLAB scheduler assign it.</div>";
    }

    return html + '<div class="insp-actions">' +
      '<button class="btn btn-small" data-action="edit" data-name="' +
      esc(sel.key) + '"' + dis + ">Edit</button>" +
      '<button class="btn btn-small btn-danger" data-action="delete" data-name="' +
      esc(sel.key) + '" title="Delete (Del)"' + dis + ">Delete</button></div></div>";
  }

  // Scheduled dwell windows, one row per entry; clicking seeks to the start
  // of the slew lead-in. `describe` adds a per-row context suffix.
  function scheduleListHtml(entries, state, describe) {
    var d = fmt();
    var html = '<div class="window-list">';
    entries.forEach(function (e) {
      var nowIn = state.simSec >= e.slewStartSec && state.simSec <= e.stopSec;
      html += '<button class="window-row' +
        (nowIn && !state.dirty ? " is-live" : "") +
        '" data-seek="' + Math.max(e.slewStartSec, 0) + '">' +
        '<span class="win-time">' + esc(d.fmtUtc(e.startMs).slice(11)) + " -> " +
        esc(d.fmtUtc(e.stopMs).slice(11)) + "</span>" +
        '<span class="win-meta">' + esc(d.fmtDuration(e.durationSec)) +
        (e.slewSec > 0 ? " +" + Math.round(e.slewSec) + "s slew" : "") +
        (describe ? " - " + esc(describe(e)) : "") + "</span></button>";
    });
    return html + "</div>";
  }

  function windowListHtml(windows, state) {
    var d = fmt();
    var html = '<div class="window-list">';
    if (windows.length === 0) {
      html += '<div class="insp-hint">No visibility in this scenario span.</div>';
    }
    windows.forEach(function (w) {
      var nowIn = state.simSec >= w.startSec && state.simSec <= w.stopSec;
      html += '<button class="window-row' + (nowIn && !state.dirty ? " is-live" : "") +
        '" data-seek="' + w.startSec + '">' +
        '<span class="win-time">' + esc(d.fmtUtc(w.startMs).slice(11)) + " -> " +
        esc(d.fmtUtc(w.stopMs).slice(11)) + "</span>" +
        '<span class="win-meta">' + esc(d.fmtDuration(w.durationSec)) +
        (w.maxElevationDeg != null ? " - " + w.maxElevationDeg.toFixed(0) + " deg" : "") +
        "</span></button>";
    });
    return html + "</div>";
  }

  function accessHtml(acc, state) {
    var d = fmt();
    var live = !state.dirty && isLive(acc, state.simSec);
    return '<div class="insp-section">' +
      '<div class="insp-title">' + esc(acc.name) +
      (live ? ' <span class="tree-live">LIVE</span>' : "") + staleTag(state) + "</div>" +
      '<div class="insp-subtitle">Access - ' + acc.windows.length +
      " windows - total " + d.fmtDuration(acc.totalDurationSec) + "</div>" +
      '<div class="insp-caption">WINDOWS - CLICK TO JUMP</div>' +
      windowListHtml(acc.windows, state) + "</div>";
  }

  // An authored access request (spec.accessRequests entry): what was asked
  // for, whether the last run computed it, and the windows when it did.
  function accessRequestHtml(sel, state) {
    var req = sel.request;
    var isSensor = (req.type == null ? "access" : req.type) === "sensor";
    var platform = req.platformName != null ? req.platformName : req.sourceName;
    var isArea = isSensor && !!Orbit.spec.areaGroup(state.spec, req.targetName);
    var dis = state.busy ? " disabled" : "";
    var pairs = isSensor
      ? [["Platform", platform || "?"],
         ["Sensor", req.sensorName || ((platform || "?") + " Sensor")],
         ["Target", req.targetName || "?"]]
      : [["Source", req.sourceName || "?"],
         ["Target", req.targetName || "?"]];

    var html = '<div class="insp-section">' +
      '<div class="insp-title">' + esc(Orbit.spec.accessRequestLabel(req)) +
      staleTag(state) + "</div>" +
      '<div class="insp-subtitle">' +
      (isArea ? "Access request - area boundary in sensor FOR"
              : isSensor ? "Access request - sensor FOR / FOV visibility"
                : "Access request - line of sight / elevation") + "</div>" +
      kv(pairs);

    var result = sel.result;
    if (!result) {
      html += '<div class="insp-hint">Not computed yet - press Re-run to ' +
        "propagate this request with MATLAB / Orekit.</div>";
    } else if (result.access) {
      html += '<div class="insp-caption">WINDOWS - CLICK TO JUMP' +
        staleTag(state) + "</div>" +
        windowListHtml(result.access.windows, state);
    } else if (result.sensorAccess) {
      html += '<div class="insp-caption">FOR WINDOWS (SLEW-REACHABLE)' +
        staleTag(state) + "</div>" +
        windowListHtml(result.sensorAccess.forWindows, state) +
        '<div class="insp-caption">FOV WINDOWS (IN BEAM)' +
        staleTag(state) + "</div>" +
        windowListHtml(result.sensorAccess.fovWindows, state);
    }

    return html +
      '<div class="insp-actions">' +
      (isArea ? '<button class="btn btn-small" data-action="sensor-area-view">' +
        "Open FOR View</button>" : "") +
      '<button class="btn btn-small btn-danger" data-action="delete" data-name="' +
      esc(sel.key) + '" title="Delete (Del)"' + dis + ">Delete Request</button></div></div>";
  }

  // ---- timeline ------------------------------------------------------------------

  // One timeline band, positioned as a percentage of the scenario span.
  // Stale bands (their endpoints changed since the run) render dimmed.
  function laneBand(scn, startSec, stopSec, color, title, stale) {
    var left = (startSec / scn.durationSec) * 100;
    var width = ((stopSec - startSec) / scn.durationSec) * 100;
    return '<span class="lane-band' + (stale ? " is-stale-band" : "") +
      '" style="left:' + left.toFixed(3) +
      "%;width:" + Math.max(width, 0.15).toFixed(3) + "%;background:" + color +
      '" title="' + esc(title + (stale ? "\n(stale - re-run to refresh)" : "")) +
      '"></span>';
  }

  // Build the lane DOM once per scenario; the cursor is repositioned per frame.
  function buildTimeline(el, state, onSeek) {
    var scn = state.scn;
    if (!scn || (scn.accesses.length === 0 && scn.schedule.length === 0)) {
      el.innerHTML = '<div class="lanes-empty">No access windows or scheduled ' +
        "tasks to display. Run the MATLAB demo to compute contact windows.</div>";
      return;
    }
    var html = "";
    scn.accesses.forEach(function (acc) {
      var bands = "";
      var stale = entryStale(state, acc);
      acc.windows.forEach(function (w) {
        bands += laneBand(scn, w.startSec, w.stopSec, "#3f9e6f",
          acc.name + "\n" + Orbit.data.fmtUtc(w.startMs) + " -> " +
          Orbit.data.fmtUtc(w.stopMs).slice(11) + " UTC", stale);
      });
      html += '<div class="lane"><span class="lane-label" title="' + esc(acc.name) +
        '">' + esc(acc.name) + '</span><span class="lane-track" data-name="' +
        esc(acc.name) + '">' + bands + "</span></div>";
    });

    // One lane per platform with scheduled sensor tasks; the slew lead-in
    // and the return-home slew render dimmer around the on-target dwell.
    var platforms = [];
    var byPlatform = {};
    scn.schedule.forEach(function (e) {
      if (!byPlatform[e.platform]) {
        byPlatform[e.platform] = [];
        platforms.push(e.platform);
      }
      byPlatform[e.platform].push(e);
    });
    platforms.forEach(function (platform) {
      var bands = "";
      byPlatform[platform].forEach(function (e) {
        var stale = entryStale(state, e);
        if (e.slewStartSec < e.startSec) {
          bands += laneBand(scn, e.slewStartSec, e.startSec, "#63498a",
            e.taskName + ": slew (" + (e.sensor || platform) + ")", stale);
        }
        bands += laneBand(scn, e.startSec, e.stopSec, "#9a6bd1",
          e.taskName + ": " + (e.sensor || platform) + " -> " + e.target + "\n" +
          Orbit.data.fmtUtc(e.startMs) + " -> " +
          Orbit.data.fmtUtc(e.stopMs).slice(11) + " UTC", stale);
        if (e.returnEndSec > e.stopSec) {
          bands += laneBand(scn, e.stopSec, e.returnEndSec, "#63498a",
            e.taskName + ": return to home (" + (e.sensor || platform) + ")", stale);
        }
      });
      var label = platform + " - tasks";
      html += '<div class="lane"><span class="lane-label" title="Scheduled ' +
        'sensor tasks on ' + esc(platform) + '">' + esc(label) +
        '</span><span class="lane-track">' + bands + "</span></div>";
    });

    html += '<div class="timeline-cursor" id="timeline-cursor"></div>';
    el.innerHTML = html;

    // Click / drag on any lane track scrubs the clock.
    var scrub = function (ev) {
      var track = el.querySelector(".lane-track");
      if (!track) return;
      var r = track.getBoundingClientRect();
      var f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      onSeek(f * scn.durationSec);
    };
    var down = false;
    el.addEventListener("mousedown", function (ev) { down = true; scrub(ev); });
    window.addEventListener("mousemove", function (ev) { if (down) scrub(ev); });
    window.addEventListener("mouseup", function () { down = false; });
  }

  function updateTimelineCursor(el, state) {
    var cursor = el.querySelector("#timeline-cursor");
    var track = el.querySelector(".lane-track");
    if (!cursor || !track || !state.scn) return;
    var f = Math.max(0, Math.min(1, state.simSec / state.scn.durationSec));
    // Track offset relative to the lanes container (labels sit to the left).
    var left = track.offsetLeft + f * track.offsetWidth;
    cursor.style.left = left + "px";
  }

  Orbit.panels = {
    renderTree: renderTree,
    renderInspector: renderInspector,
    buildTimeline: buildTimeline,
    updateTimelineCursor: updateTimelineCursor,
    findSelected: findSelected,
    findRequestResult: findRequestResult,
    requestSelectionKey: requestSelectionKey,
    taskSelectionKey: taskSelectionKey,
    visSelectionKey: visSelectionKey,
    findTaskEntries: findTaskEntries,
    satGroupKey: satGroupKey,
    areaGroupKey: areaGroupKey,
    satChildKey: satChildKey,
  };
})();
