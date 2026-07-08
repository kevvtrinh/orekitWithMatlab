// Orbit.map2d - equirectangular mission map on a 2D canvas: graticule, land
// outlines, day/night terminator, ground tracks, live markers, access lines.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var TRAIL_SEC = 45 * 60; // bright "recent history" portion of each track

  // Map rectangle: largest 2:1 area that fits the canvas with a margin.
  function mapRect(w, h) {
    var pad = 18;
    var availW = w - 2 * pad, availH = h - 2 * pad;
    var mw = Math.min(availW, availH * 2);
    var mh = mw / 2;
    return { x: (w - mw) / 2, y: (h - mh) / 2, w: mw, h: mh };
  }

  function project(rect, latDeg, lonDeg) {
    return {
      x: rect.x + ((lonDeg + 180) / 360) * rect.w,
      y: rect.y + ((90 - latDeg) / 180) * rect.h,
    };
  }

  function draw(canvas, state) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var rect = mapRect(w, h);
    var scn = state.scn;

    drawBase(ctx, rect);
    drawLand(ctx, rect);
    if (scn) drawNight(ctx, rect, scn.epochMs + state.simSec * 1000);
    drawGraticule(ctx, rect);
    frame(ctx, rect);
    if (!scn) return;

    scn.sats.forEach(function (sat) { drawGroundTrack(ctx, rect, sat, state.simSec); });
    drawAccessLines(ctx, rect, scn, state.simSec);
    scn.grounds.forEach(function (gp) {
      drawGroundMarker(ctx, rect, gp, state.selection === gp.name);
    });
    scn.sats.forEach(function (sat) {
      drawSatMarker(ctx, rect, sat, state.simSec, state.selection === sat.name);
    });
  }

  function drawBase(ctx, rect) {
    var grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    grad.addColorStop(0, "#071724");
    grad.addColorStop(0.22, "#0a2636");
    grad.addColorStop(0.5, "#0a3342");
    grad.addColorStop(0.78, "#0a2636");
    grad.addColorStop(1, "#071724");
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    drawBathymetry(ctx, rect);
    drawPolarIce(ctx, rect);
  }

  function drawBathymetry(ctx, rect) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.strokeStyle = "rgba(118, 172, 187, 0.075)";
    ctx.lineWidth = 1;
    for (var lat = -75; lat <= 75; lat += 15) {
      ctx.beginPath();
      for (var lon = -180; lon <= 180; lon += 6) {
        var p = project(rect, lat, lon);
        var wobble = Math.sin((lon * 1.7 + lat * 2.1) * DEG) * 1.7 +
          Math.sin((lon * 0.6 - lat * 1.3) * DEG) * 0.9;
        if (lon === -180) ctx.moveTo(p.x, p.y + wobble);
        else ctx.lineTo(p.x, p.y + wobble);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPolarIce(ctx, rect) {
    var north = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h * 0.2);
    north.addColorStop(0, "rgba(220, 232, 232, 0.23)");
    north.addColorStop(1, "rgba(220, 232, 232, 0)");
    ctx.fillStyle = north;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h * 0.2);

    var south = ctx.createLinearGradient(0, rect.y + rect.h, 0, rect.y + rect.h * 0.78);
    south.addColorStop(0, "rgba(220, 232, 232, 0.26)");
    south.addColorStop(1, "rgba(220, 232, 232, 0)");
    ctx.fillStyle = south;
    ctx.fillRect(rect.x, rect.y + rect.h * 0.78, rect.w, rect.h * 0.22);
  }

  function frame(ctx, rect) {
    ctx.strokeStyle = "#2e333b";
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
  }

  function drawGraticule(ctx, rect) {
    ctx.strokeStyle = "rgba(141, 148, 160, 0.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var lon = -150; lon <= 150; lon += 30) {
      var p = project(rect, 0, lon);
      ctx.moveTo(p.x, rect.y);
      ctx.lineTo(p.x, rect.y + rect.h);
    }
    for (var lat = -60; lat <= 60; lat += 30) {
      var q = project(rect, lat, 0);
      ctx.moveTo(rect.x, q.y);
      ctx.lineTo(rect.x + rect.w, q.y);
    }
    ctx.stroke();
    // Equator and prime meridian slightly stronger.
    ctx.strokeStyle = "rgba(141, 148, 160, 0.22)";
    ctx.beginPath();
    var eq = project(rect, 0, 0);
    ctx.moveTo(rect.x, eq.y);
    ctx.lineTo(rect.x + rect.w, eq.y);
    ctx.moveTo(eq.x, rect.y);
    ctx.lineTo(eq.x, rect.y + rect.h);
    ctx.stroke();

    ctx.fillStyle = "rgba(141, 148, 160, 0.4)";
    ctx.font = "9px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (var glon = -120; glon <= 120; glon += 60) {
      var gp = project(rect, 0, glon);
      ctx.fillText((glon > 0 ? glon + "E" : glon < 0 ? -glon + "W" : "0"),
        gp.x + 3, rect.y + 3);
    }
  }

  function drawLand(ctx, rect) {
    ctx.save();
    beginLandPath(ctx, rect);
    ctx.clip();
    var land = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    land.addColorStop(0, "#d9e3dd");
    land.addColorStop(0.16, "#6d8062");
    land.addColorStop(0.32, "#a48756");
    land.addColorStop(0.5, "#4e7d5c");
    land.addColorStop(0.68, "#a08355");
    land.addColorStop(0.84, "#66785b");
    land.addColorStop(1, "#d8dedf");
    ctx.fillStyle = land;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    drawLandRelief(ctx, rect);
    ctx.restore();

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    beginLandPath(ctx, rect);
    ctx.strokeStyle = "rgba(3, 9, 12, 0.55)";
    ctx.lineWidth = 3;
    ctx.stroke();
    beginLandPath(ctx, rect);
    ctx.strokeStyle = "rgba(164, 205, 190, 0.58)";
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  }

  function beginLandPath(ctx, rect) {
    ctx.beginPath();
    Orbit.world.landPolygons.forEach(function (ring) {
      ring.forEach(function (pt, i) {
        var p = project(rect, pt[1], pt[0]);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
    });
  }

  function drawLandRelief(ctx, rect) {
    ctx.strokeStyle = "rgba(248, 241, 211, 0.055)";
    ctx.lineWidth = 1;
    for (var y = rect.y + 8; y < rect.y + rect.h; y += 10) {
      ctx.beginPath();
      for (var x = rect.x; x <= rect.x + rect.w; x += 10) {
        var yy = y + Math.sin((x * 0.055 + y * 0.023)) * 2.4;
        if (x === rect.x) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(12, 24, 16, 0.075)";
    for (var y2 = rect.y + 5; y2 < rect.y + rect.h; y2 += 13) {
      ctx.beginPath();
      for (var x2 = rect.x; x2 <= rect.x + rect.w; x2 += 12) {
        var yy2 = y2 + Math.sin((x2 * 0.04 - y2 * 0.031)) * 1.8;
        if (x2 === rect.x) ctx.moveTo(x2, yy2); else ctx.lineTo(x2, yy2);
      }
      ctx.stroke();
    }
  }

  // Night-side shading bounded by the solar terminator.
  function drawNight(ctx, rect, dateMs) {
    var sun = Orbit.data.subsolarPoint(dateMs);
    var tanDec = Math.tan(sun.latDeg * DEG);
    if (Math.abs(tanDec) < 1e-6) tanDec = 1e-6;

    ctx.beginPath();
    for (var lon = -180; lon <= 180; lon += 3) {
      var h = (lon - sun.lonDeg) * DEG;
      var lat = Math.atan(-Math.cos(h) / tanDec) / DEG;
      var p = project(rect, lat, lon);
      if (lon === -180) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    // Close around whichever pole is in darkness.
    var darkPoleY = sun.latDeg >= 0 ? rect.y + rect.h : rect.y;
    ctx.lineTo(rect.x + rect.w, darkPoleY);
    ctx.lineTo(rect.x, darkPoleY);
    ctx.closePath();
    ctx.fillStyle = "rgba(2, 6, 12, 0.42)";
    ctx.fill();

    drawSunMarker(ctx, rect, sun);
  }

  function drawSunMarker(ctx, rect, sun) {
    var sp = project(rect, sun.latDeg, sun.lonDeg);
    var glow = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, 36);
    glow.addColorStop(0, "rgba(244, 203, 95, 0.34)");
    glow.addColorStop(1, "rgba(244, 203, 95, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 36, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(244, 203, 95, 0.82)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 6, 0, 2 * Math.PI);
    ctx.moveTo(sp.x - 11, sp.y); ctx.lineTo(sp.x + 11, sp.y);
    ctx.moveTo(sp.x, sp.y - 11); ctx.lineTo(sp.x, sp.y + 11);
    ctx.stroke();

    ctx.fillStyle = "#f4cb5f";
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    label(ctx, sp, "SUN", "#f4cb5f", -13);
  }

  // Full track faint + recent trail bright, split at the dateline.
  function drawGroundTrack(ctx, rect, sat, simSec) {
    strokeTrack(ctx, rect, sat, 0, Infinity, hexA(sat.color, 0.28), 1);
    strokeTrack(ctx, rect, sat, simSec - TRAIL_SEC, simSec, hexA(sat.color, 0.95), 1.6);
  }

  function strokeTrack(ctx, rect, sat, fromSec, toSec, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    var started = false, prevLon = null;
    for (var i = 0; i < sat.t.length; i++) {
      if (sat.t[i] < fromSec || sat.t[i] > toSec) { started = false; continue; }
      var lat = sat.lla[i][0], lon = sat.lla[i][1];
      if (started && Math.abs(lon - prevLon) > 180) started = false;
      var p = project(rect, lat, lon);
      if (started) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      started = true;
      prevLon = lon;
    }
    ctx.stroke();
  }

  function drawSatMarker(ctx, rect, sat, simSec, selected) {
    var pos = Orbit.data.samplePosition(sat, simSec);
    if (!pos) return;
    var p = project(rect, pos.latDeg, pos.lonDeg);

    ctx.fillStyle = hexA(sat.color, 0.18);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = sat.color;
    ctx.beginPath(); // diamond
    ctx.moveTo(p.x, p.y - 5);
    ctx.lineTo(p.x + 5, p.y);
    ctx.lineTo(p.x, p.y + 5);
    ctx.lineTo(p.x - 5, p.y);
    ctx.closePath();
    ctx.fill();

    if (selected) selectionRing(ctx, p);
    label(ctx, p, sat.name, sat.color, -10);
  }

  function drawGroundMarker(ctx, rect, gp, selected) {
    var p = project(rect, gp.latDeg, gp.lonDeg);
    ctx.fillStyle = gp.color;
    ctx.strokeStyle = "rgba(16, 18, 21, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (gp.kind === "target") { // small square
      ctx.rect(p.x - 3.5, p.y - 3.5, 7, 7);
    } else { // ground station triangle
      ctx.moveTo(p.x, p.y - 5);
      ctx.lineTo(p.x + 5, p.y + 4);
      ctx.lineTo(p.x - 5, p.y + 4);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    if (selected) selectionRing(ctx, p);
    label(ctx, p, gp.name, "#aeb6c2", 9, true);
  }

  // Dashed sat->station lines for accesses active at the current time.
  function drawAccessLines(ctx, rect, scn, simSec) {
    scn.accesses.forEach(function (acc) {
      var live = acc.windows.some(function (win) {
        return simSec >= win.startSec && simSec <= win.stopSec;
      });
      if (!live) return;
      var sat = findByName(scn.sats, acc.source) || findByName(scn.sats, acc.target);
      var gp = findByName(scn.grounds, acc.target) || findByName(scn.grounds, acc.source);
      if (!sat || !gp) return;
      var pos = Orbit.data.samplePosition(sat, simSec);
      if (!pos) return;
      if (Math.abs(pos.lonDeg - gp.lonDeg) > 180) return; // skip wrap-around lines
      var a = project(rect, pos.latDeg, pos.lonDeg);
      var b = project(rect, gp.latDeg, gp.lonDeg);
      ctx.strokeStyle = "rgba(95, 201, 143, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(95, 201, 143, 0.6)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, 2 * Math.PI);
      ctx.stroke();
    });
  }

  function selectionRing(ctx, p) {
    ctx.strokeStyle = "#4fb8d1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 11, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function label(ctx, p, text, color, dy, below) {
    ctx.font = "10px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = below ? "top" : "bottom";
    ctx.fillStyle = "rgba(16, 18, 21, 0.75)";
    var tw = ctx.measureText(text).width;
    ctx.fillRect(p.x - tw / 2 - 2, below ? p.y + dy - 1 : p.y + dy - 10, tw + 4, 12);
    ctx.fillStyle = color;
    ctx.fillText(text, p.x, p.y + dy);
  }

  function findByName(list, name) {
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i];
    return null;
  }

  function hexA(hex, alpha) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "rgba(224, 164, 60, " + alpha + ")";
    var v = parseInt(m[1], 16);
    return "rgba(" + (v >> 16) + ", " + ((v >> 8) & 255) + ", " + (v & 255) + ", " + alpha + ")";
  }

  // Returns the scenario object under (x, y) in CSS pixels, or null.
  function hitTest(canvas, x, y, state) {
    var scn = state.scn;
    if (!scn) return null;
    var rect = mapRect(canvas.clientWidth, canvas.clientHeight);
    var best = null, bestD = 12;
    scn.sats.forEach(function (sat) {
      var pos = Orbit.data.samplePosition(sat, state.simSec);
      if (!pos) return;
      var p = project(rect, pos.latDeg, pos.lonDeg);
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = sat; bestD = d; }
    });
    scn.grounds.forEach(function (gp) {
      var p = project(rect, gp.latDeg, gp.lonDeg);
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = gp; bestD = d; }
    });
    return best;
  }

  Orbit.map2d = { draw: draw, hitTest: hitTest };
})();
