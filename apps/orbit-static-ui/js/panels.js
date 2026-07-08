// Orbit.panels - DOM rendering for the object tree, inspector, and timeline.
// Pure functions of the app state; app.js decides when to re-render. The
// tree and inspector are spec-driven (the editable spec says what exists);
// the propagated payload only contributes ephemerides and access windows,
// which are flagged stale while the spec has unpropagated edits.
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

  // ---- selection -------------------------------------------------------------

  // Resolve a selected name against the spec first (objects, then area target
  // groups), then the payload (an access pair, or a satellite from the last
  // run that is no longer in the spec but still drawn in the viewport).
  // Returns a descriptor or null.
  function findSelected(state, name) {
    var scn = state.scn;
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
    if (scn) {
      var acc = findByName(scn.accesses, name);
      if (acc) return { type: "access", access: acc };
      var scnSat = findByName(scn.sats, name);
      if (scnSat) return { type: "payload-satellite", scnSat: scnSat };
    }
    return null;
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

  function satRows(entries, state, d, child) {
    var html = "";
    entries.forEach(function (entry) {
      html += row(entry.sat.name, state.selection,
        Orbit.spec.satColor(entry.sat, entry.index), false,
        satMeta(entry.sat, d), "", child);
    });
    return html;
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
    return '<button class="tree-row' + (child ? " tree-row-child" : "") +
      (selection === name ? " is-selected" : "") +
      '" data-name="' + esc(name) + '">' +
      '<span class="tree-dot' + (square ? " dot-square" : "") +
      '" style="background:' + esc(color) + '"></span>' +
      '<span class="tree-name">' + esc(name) + "</span>" + extra +
      '<span class="tree-meta">' + esc(meta) + "</span></button>";
  }

  // ---- inspector ---------------------------------------------------------------

  // handlers: { onSeek(sec), onEdit(name), onDelete(name) }
  function renderInspector(el, state, handlers) {
    var sel = state.selection ? findSelected(state, state.selection) : null;
    if (!sel) {
      el.innerHTML = '<div class="insp-hint">Select a satellite, ground object, ' +
        "area target, or access pair to see its details.<br><br>Click objects in " +
        "the tree or directly in the mission view.</div>";
      return;
    }
    if (sel.type === "satellite") el.innerHTML = specSatelliteHtml(sel, state);
    else if (sel.type === "ground") el.innerHTML = groundHtml(sel, state);
    else if (sel.type === "areaGroup") el.innerHTML = areaGroupHtml(sel, state);
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
      esc(name) + '"' + dis + ">Delete</button></div>";
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
    return '<div class="insp-caption">LIVE STATE (T+' + d.fmtHms(state.simSec) +
      ")" + staleTag(state) + "</div>" +
      kv([
        ["Latitude", d.fmtDeg(pos.latDeg, 3)],
        ["Longitude", d.fmtDeg(pos.lonDeg, 3)],
        ["Altitude", pos.altKm.toFixed(1) + " km"],
      ]);
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
    var extras = [];
    if (sat.massKg != null) extras.push(["Mass", sat.massKg + " kg"]);
    // Preserved Level 3+ content this console cannot edit yet.
    if (sat.sensor) {
      extras.push(["Sensor", (sat.sensor.name || "conic imager") + " (preserved)"]);
    }
    if (sat.maneuvers && sat.maneuvers.length > 0) {
      extras.push(["Maneuvers", sat.maneuvers.length + " (preserved)"]);
    }
    if (extras.length > 0) html += kv(extras);

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
    var member = sel.spec && sel.spec.group;
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

  function accessHtml(acc, state) {
    var d = fmt();
    var live = !state.dirty && isLive(acc, state.simSec);
    var html = '<div class="insp-section">' +
      '<div class="insp-title">' + esc(acc.name) +
      (live ? ' <span class="tree-live">LIVE</span>' : "") + staleTag(state) + "</div>" +
      '<div class="insp-subtitle">Access - ' + acc.windows.length +
      " windows - total " + d.fmtDuration(acc.totalDurationSec) + "</div>" +
      '<div class="insp-caption">WINDOWS - CLICK TO JUMP</div>' +
      '<div class="window-list">';
    if (acc.windows.length === 0) {
      html += '<div class="insp-hint">No visibility in this scenario span.</div>';
    }
    acc.windows.forEach(function (w) {
      var nowIn = state.simSec >= w.startSec && state.simSec <= w.stopSec;
      html += '<button class="window-row' + (nowIn ? " is-live" : "") +
        '" data-seek="' + w.startSec + '">' +
        '<span class="win-time">' + esc(d.fmtUtc(w.startMs).slice(11)) + " -> " +
        esc(d.fmtUtc(w.stopMs).slice(11)) + "</span>" +
        '<span class="win-meta">' + esc(d.fmtDuration(w.durationSec)) +
        (w.maxElevationDeg != null ? " - " + w.maxElevationDeg.toFixed(0) + " deg" : "") +
        "</span></button>";
    });
    return html + "</div></div>";
  }

  // ---- timeline ------------------------------------------------------------------

  // Build the lane DOM once per scenario; the cursor is repositioned per frame.
  function buildTimeline(el, state, onSeek) {
    var scn = state.scn;
    if (!scn || scn.accesses.length === 0) {
      el.innerHTML = '<div class="lanes-empty">No access windows to display. ' +
        "Run the MATLAB demo to compute contact windows.</div>";
      return;
    }
    var html = "";
    scn.accesses.forEach(function (acc) {
      var bands = "";
      acc.windows.forEach(function (w) {
        var left = (w.startSec / scn.durationSec) * 100;
        var width = ((w.stopSec - w.startSec) / scn.durationSec) * 100;
        bands += '<span class="lane-band" style="left:' + left.toFixed(3) +
          "%;width:" + Math.max(width, 0.15).toFixed(3) + "%;background:#3f9e6f" +
          '" title="' + esc(acc.name) + "\n" +
          esc(Orbit.data.fmtUtc(w.startMs)) + " -> " +
          esc(Orbit.data.fmtUtc(w.stopMs).slice(11)) + ' UTC"></span>';
      });
      html += '<div class="lane"><span class="lane-label" title="' + esc(acc.name) +
        '">' + esc(acc.name) + '</span><span class="lane-track" data-name="' +
        esc(acc.name) + '">' + bands + "</span></div>";
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
    satGroupKey: satGroupKey,
    areaGroupKey: areaGroupKey,
  };
})();
