// Orbit.panels - DOM rendering for the object tree, inspector, and timeline.
// Pure functions of the app state; app.js decides when to re-render.
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

  // ---- object tree -----------------------------------------------------------

  function renderTree(el, state, onSelect) {
    var scn = state.scn;
    if (!scn) {
      el.innerHTML = '<div class="tree-empty">No scenario loaded.</div>';
      return;
    }
    var html = "";

    html += '<div class="tree-group-label">SATELLITES (' + scn.sats.length + ")</div>";
    scn.sats.forEach(function (sat) {
      var altKm = sat.elements ?
        Math.round(sat.elements.semiMajorAxisKm - Orbit.data.EARTH_RADIUS_KM) : null;
      var meta = sat.elements ?
        sat.elements.inclinationDeg.toFixed(1) + " deg - " + altKm + " km" :
        sat.propagatorType;
      html += row(sat.name, state.selection, sat.color, false, meta, "");
    });

    html += '<div class="tree-group-label">GROUND (' + scn.grounds.length + ")</div>";
    scn.grounds.forEach(function (gp) {
      var meta = gp.latDeg.toFixed(1) + " deg, " + gp.lonDeg.toFixed(1) + " deg";
      html += row(gp.name, state.selection, gp.color, gp.kind === "target", meta, "");
    });

    html += '<div class="tree-group-label">ACCESS (' + scn.accesses.length + ")</div>";
    if (scn.accesses.length === 0) {
      html += '<div class="tree-empty">No access pairs computed.</div>';
    }
    scn.accesses.forEach(function (acc) {
      var live = isLive(acc, state.simSec);
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

  function findSelected(scn, name) {
    var pools = [scn.sats, scn.grounds, scn.accesses];
    for (var i = 0; i < pools.length; i++) {
      for (var j = 0; j < pools[i].length; j++) {
        if (pools[i][j].name === name) return pools[i][j];
      }
    }
    return null;
  }

  function renderInspector(el, state, onSeek) {
    var scn = state.scn;
    var obj = scn && state.selection ? findSelected(scn, state.selection) : null;
    if (!scn || !obj) {
      el.innerHTML = '<div class="insp-hint">Select a satellite, ground object, ' +
        "or access pair to see its details.<br><br>Click objects in the tree or " +
        "directly in the mission view.</div>";
      return;
    }
    if (obj.kind === "satellite") el.innerHTML = satelliteHtml(obj, state);
    else if (obj.kind === "access") el.innerHTML = accessHtml(obj, state);
    else el.innerHTML = groundHtml(obj);

    el.querySelectorAll(".window-row").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onSeek(parseFloat(btn.dataset.seek));
      });
    });
  }

  function kv(pairs) {
    var html = '<dl class="insp-kv">';
    pairs.forEach(function (p) {
      html += "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
    });
    return html + "</dl>";
  }

  function satelliteHtml(sat, state) {
    var d = fmt();
    var html = '<div class="insp-section">' +
      '<div class="insp-title"><span class="tree-dot" style="background:' +
      esc(sat.color) + '"></span>' + esc(sat.name) + "</div>" +
      '<div class="insp-subtitle">Satellite - ' + esc(sat.propagatorType || "?") +
      " - " + esc(sat.orbitDefinitionType || "?") + "</div>";

    var pos = d.samplePosition(sat, state.simSec);
    if (pos) {
      html += '<div class="insp-caption">LIVE STATE (T+' + d.fmtHms(state.simSec) + ")</div>" +
        kv([
          ["Latitude", d.fmtDeg(pos.latDeg, 3)],
          ["Longitude", d.fmtDeg(pos.lonDeg, 3)],
          ["Altitude", pos.altKm.toFixed(1) + " km"],
        ]);
    }
    if (sat.elements) {
      var el = sat.elements;
      html += '<hr class="insp-divider"><div class="insp-caption">KEPLERIAN ELEMENTS</div>' +
        kv([
          ["Semi-major axis", el.semiMajorAxisKm.toFixed(1) + " km"],
          ["Eccentricity", el.eccentricity.toFixed(5)],
          ["Inclination", d.fmtDeg(el.inclinationDeg)],
          ["RAAN", d.fmtDeg(el.raanDeg)],
          ["Arg. of perigee", d.fmtDeg(el.argPerigeeDeg)],
          ["True anomaly", d.fmtDeg(el.trueAnomalyDeg)],
        ]);
    }
    html += '<hr class="insp-divider"><div class="insp-caption">EPHEMERIS</div>' +
      kv([["Samples", String(sat.t.length)],
          ["Span", d.fmtDuration(sat.t.length ? sat.t[sat.t.length - 1] - sat.t[0] : 0)]]);
    return html + "</div>";
  }

  function groundHtml(gp) {
    var d = fmt();
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
      kv(pairs) + "</div>";
  }

  function accessHtml(acc, state) {
    var d = fmt();
    var live = isLive(acc, state.simSec);
    var html = '<div class="insp-section">' +
      '<div class="insp-title">' + esc(acc.name) +
      (live ? ' <span class="tree-live">LIVE</span>' : "") + "</div>" +
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
