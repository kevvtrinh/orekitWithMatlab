// Orbit.panels - DOM rendering for the object tree, inspector, and timeline.
// Pure functions of the app state; app.js decides when to re-render. The
// tree and inspector are spec-driven (the editable spec says what exists);
// the propagated payload only contributes ephemerides and access windows,
// which are flagged stale while the spec has unpropagated edits.
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

  // ---- selection -------------------------------------------------------------

  // Resolve a selected name against the spec first, then the payload (an
  // access pair, or a satellite from the last run that is no longer in the
  // spec but still drawn in the viewport). Returns a descriptor or null.
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
    if (scn) {
      var acc = findByName(scn.accesses, name);
      if (acc) return { type: "access", access: acc };
      var scnSat = findByName(scn.sats, name);
      if (scnSat) return { type: "payload-satellite", scnSat: scnSat };
    }
    return null;
  }

  // ---- object tree -----------------------------------------------------------

  function renderTree(el, state, onSelect) {
    var scn = state.scn;
    var spec = state.spec;
    if (!scn && !spec) {
      el.innerHTML = '<div class="tree-empty">No scenario loaded.</div>';
      return;
    }
    var d = fmt();
    var html = "";

    var sats = spec ? specSatellites(spec) : scn.sats;
    html += '<div class="tree-group-label">SATELLITES (' + sats.length + ")</div>";
    sats.forEach(function (sat, i) {
      var meta, color;
      if (spec) {
        color = Orbit.spec.satColor(sat, i);
        meta = sat.orbit.inclinationDeg.toFixed(1) + " deg - " +
          Math.round(sat.orbit.semiMajorAxisKm - d.EARTH_RADIUS_KM) + " km";
      } else {
        color = sat.color;
        meta = sat.elements
          ? sat.elements.inclinationDeg.toFixed(1) + " deg - " +
            Math.round(sat.elements.semiMajorAxisKm - d.EARTH_RADIUS_KM) + " km"
          : sat.propagatorType;
      }
      html += row(sat.name, state.selection, color, false, meta, "");
    });

    var grounds = spec ? Orbit.spec.displayGrounds(spec) : scn.grounds;
    html += '<div class="tree-group-label">GROUND (' + grounds.length + ")</div>";
    grounds.forEach(function (gp) {
      var meta = gp.latDeg.toFixed(1) + " deg, " + gp.lonDeg.toFixed(1) + " deg";
      html += row(gp.name, state.selection, gp.color, gp.kind === "target", meta, "");
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
        live ? '<span class="tree-live">LIVE</span>' : "");
    });

    el.innerHTML = html;
    el.querySelectorAll(".tree-row").forEach(function (btn) {
      btn.addEventListener("click", function () { onSelect(btn.dataset.name); });
    });
  }

  function row(name, selection, color, square, meta, extra) {
    return '<button class="tree-row' + (selection === name ? " is-selected" : "") +
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
        "or access pair to see its details.<br><br>Click objects in the tree or " +
        "directly in the mission view.</div>";
      return;
    }
    if (sel.type === "satellite") el.innerHTML = specSatelliteHtml(sel, state);
    else if (sel.type === "ground") el.innerHTML = groundHtml(sel, state);
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
    var html = '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot" style="background:' +
      esc(sel.color) + '"></span>' + esc(sat.name) + "</div>" +
      '<div class="insp-subtitle">Satellite - Keplerian - ' +
      esc(sat.propagator || "?") + "</div>";

    if (sel.scnSat) html += liveStateHtml(d, sel.scnSat, state);

    html += '<hr class="insp-divider"><div class="insp-caption">KEPLERIAN ELEMENTS</div>' +
      elementsKv(d, sat.orbit);
    if (sat.massKg != null) html += kv([["Mass", sat.massKg + " kg"]]);

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
    return '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot dot-square" style="background:' +
      esc(gp.color) + '"></span>' + esc(gp.name) + "</div>" +
      '<div class="insp-subtitle">' +
      (gp.kind === "target" ? "Point target" : "Ground station") + "</div>" +
      kv(pairs) +
      (sel.spec ? actionsHtml(gp.name, state.busy) : "") + "</div>";
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
  };
})();
