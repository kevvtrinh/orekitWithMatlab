// Orbit.globe3d - orthographic Earth-fixed globe on a 2D canvas: starfield,
// wireframe graticule, land outlines, orbit tracks with altitude, markers.
// Drag to rotate, scroll to zoom. No WebGL so it works everywhere MATLAB's
// help browser or any desktop browser does.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var R = 6371.0; // km, display sphere

  var view = { lonDeg: -95, latDeg: 28, zoom: 1 };

  // Deterministic starfield in unit viewport coordinates.
  var stars = (function () {
    var out = [], seed = 42;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 160; i++) {
      out.push({ x: rnd(), y: rnd(), r: 0.3 + rnd() * 0.9, a: 0.15 + rnd() * 0.5 });
    }
    return out;
  })();

  // Camera basis for the current view; returns projector closures.
  function makeCamera(w, h) {
    var lat0 = view.latDeg * DEG, lon0 = view.lonDeg * DEG;
    var east = [-Math.sin(lon0), Math.cos(lon0), 0];
    var north = [-Math.sin(lat0) * Math.cos(lon0), -Math.sin(lat0) * Math.sin(lon0), Math.cos(lat0)];
    var fwd = [Math.cos(lat0) * Math.cos(lon0), Math.cos(lat0) * Math.sin(lon0), Math.sin(lat0)];
    var cx = w / 2, cy = h / 2;
    var scale = (Math.min(w, h) / 2) * 0.62 * view.zoom / R;
    return {
      radiusPx: R * scale,
      cx: cx,
      cy: cy,
      // p: {x, y, z} km ECEF -> {x, y, depth} screen px; depth > 0 faces us.
      project: function (p) {
        return {
          x: cx + (p.x * east[0] + p.y * east[1]) * scale,
          y: cy - (p.x * north[0] + p.y * north[1] + p.z * north[2]) * scale,
          depth: p.x * fwd[0] + p.y * fwd[1] + p.z * fwd[2],
        };
      },
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

    var cam = makeCamera(w, h);

    var scn = state.scn;
    var dateMs = scn ? scn.epochMs + state.simSec * 1000 : null;

    drawSpace(ctx, w, h);
    drawDisc(ctx, cam);
    drawLand(ctx, cam);
    drawNightShade(ctx, cam, dateMs);
    drawGraticule(ctx, cam);
    drawAtmosphere(ctx, cam);
    drawSun(ctx, cam, dateMs);

    if (!scn) return;

    scn.grounds.forEach(function (gp) {
      drawGroundMarker(ctx, cam, gp, state.selection === gp.name);
    });
    scn.sats.forEach(function (sat) {
      drawOrbitTrack(ctx, cam, sat);
    });
    scn.sats.forEach(function (sat) {
      drawSatMarker(ctx, cam, sat, state.simSec, state.selection === sat.name);
    });
  }

  function drawSpace(ctx, w, h) {
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#05080d");
    bg.addColorStop(0.55, "#080d15");
    bg.addColorStop(1, "#03060a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#e8ecf4";
    stars.forEach(function (s) {
      ctx.globalAlpha = s.a;
      ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
    });
    ctx.globalAlpha = 1;
  }

  function drawDisc(ctx, cam) {
    var grad = ctx.createRadialGradient(
      cam.cx - cam.radiusPx * 0.35, cam.cy - cam.radiusPx * 0.35, cam.radiusPx * 0.1,
      cam.cx, cam.cy, cam.radiusPx);
    grad.addColorStop(0, "#17415a");
    grad.addColorStop(0.45, "#0c3144");
    grad.addColorStop(0.82, "#0a1d2c");
    grad.addColorStop(1, "#06101a");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx, 0, 2 * Math.PI);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx, 0, 2 * Math.PI);
    ctx.clip();
    ctx.strokeStyle = "rgba(125, 190, 204, 0.065)";
    ctx.lineWidth = 1;
    for (var y = cam.cy - cam.radiusPx; y <= cam.cy + cam.radiusPx; y += 15) {
      ctx.beginPath();
      ctx.moveTo(cam.cx - cam.radiusPx, y);
      ctx.bezierCurveTo(cam.cx - cam.radiusPx * 0.35, y - 6,
        cam.cx + cam.radiusPx * 0.35, y + 6, cam.cx + cam.radiusPx, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Stroke an array of ECEF points as a polyline, breaking wherever the
  // segment crosses to the far hemisphere (depth <= 0).
  function strokeFront(ctx, cam, points, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i < points.length; i++) {
      var p = cam.project(points[i]);
      if (p.depth <= 0) { started = false; continue; }
      if (started) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
  }

  function drawGraticule(ctx, cam) {
    var style = "rgba(141, 148, 160, 0.16)";
    var lat, lon, pts;
    for (lat = -60; lat <= 60; lat += 30) {
      pts = [];
      for (lon = -180; lon <= 180; lon += 6) pts.push(Orbit.data.llaToEcef(lat, lon, 0));
      strokeFront(ctx, cam, pts, lat === 0 ? "rgba(141, 148, 160, 0.28)" : style, 1);
    }
    for (lon = -180; lon < 180; lon += 30) {
      pts = [];
      for (lat = -90; lat <= 90; lat += 6) pts.push(Orbit.data.llaToEcef(lat, lon, 0));
      strokeFront(ctx, cam, pts, lon === 0 ? "rgba(141, 148, 160, 0.28)" : style, 1);
    }
  }

  function drawLand(ctx, cam) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx, 0, 2 * Math.PI);
    ctx.clip();

    var land = ctx.createLinearGradient(
      cam.cx - cam.radiusPx * 0.5, cam.cy - cam.radiusPx * 0.6,
      cam.cx + cam.radiusPx * 0.45, cam.cy + cam.radiusPx * 0.65);
    land.addColorStop(0, "#d8e1d7");
    land.addColorStop(0.2, "#7a865e");
    land.addColorStop(0.43, "#b0905a");
    land.addColorStop(0.62, "#4f7e5c");
    land.addColorStop(0.82, "#8a8057");
    land.addColorStop(1, "#d7dddc");

    Orbit.world.landPolygons.forEach(function (ring) {
      drawFrontLandSegments(ctx, cam, ring, land);
    });
    ctx.restore();

    Orbit.world.landPolygons.forEach(function (ring) {
      var pts = ring.map(function (pt) { return Orbit.data.llaToEcef(pt[1], pt[0], 0.5); });
      pts.push(pts[0]);
      strokeFront(ctx, cam, pts, "rgba(14, 25, 20, 0.65)", 2.4);
      strokeFront(ctx, cam, pts, "rgba(169, 212, 193, 0.58)", 0.9);
    });
  }

  function drawFrontLandSegments(ctx, cam, ring, fillStyle) {
    var segment = [];
    for (var i = 0; i <= ring.length; i++) {
      var pt = ring[i % ring.length];
      var p = cam.project(Orbit.data.llaToEcef(pt[1], pt[0], 0.8));
      if (p.depth > 0) {
        segment.push(p);
      } else {
        flushLandSegment(ctx, segment, fillStyle);
        segment = [];
      }
    }
    flushLandSegment(ctx, segment, fillStyle);
  }

  function flushLandSegment(ctx, segment, fillStyle) {
    if (segment.length < 2) return;
    ctx.beginPath();
    segment.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    if (segment.length >= 3) {
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
  }

  function drawNightShade(ctx, cam, dateMs) {
    if (!dateMs) return;
    var sun = Orbit.data.subsolarPoint(dateMs);
    var sunVec = Orbit.data.llaToEcef(sun.latDeg, sun.lonDeg, 0);
    var sunProj = cam.project(sunVec);
    var dx = sunProj.x - cam.cx;
    var dy = sunProj.y - cam.cy;
    var len = Math.hypot(dx, dy);
    if (len < 1) { dx = -0.6; dy = -0.4; len = 1; }
    var ux = dx / len, uy = dy / len;
    var dark = sunProj.depth >= 0 ? 0.5 : 0.68;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx, 0, 2 * Math.PI);
    ctx.clip();
    var shade = ctx.createLinearGradient(
      cam.cx + ux * cam.radiusPx, cam.cy + uy * cam.radiusPx,
      cam.cx - ux * cam.radiusPx, cam.cy - uy * cam.radiusPx);
    shade.addColorStop(0, "rgba(0, 0, 0, 0)");
    shade.addColorStop(0.55, "rgba(0, 0, 0, 0.08)");
    shade.addColorStop(1, "rgba(0, 0, 0, " + dark + ")");
    ctx.fillStyle = shade;
    ctx.fillRect(cam.cx - cam.radiusPx, cam.cy - cam.radiusPx,
      cam.radiusPx * 2, cam.radiusPx * 2);

    var limb = ctx.createRadialGradient(cam.cx, cam.cy, cam.radiusPx * 0.62,
      cam.cx, cam.cy, cam.radiusPx);
    limb.addColorStop(0, "rgba(0, 0, 0, 0)");
    limb.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    ctx.fillStyle = limb;
    ctx.fillRect(cam.cx - cam.radiusPx, cam.cy - cam.radiusPx,
      cam.radiusPx * 2, cam.radiusPx * 2);
    ctx.restore();
  }

  function drawAtmosphere(ctx, cam) {
    ctx.strokeStyle = "rgba(117, 207, 232, 0.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx + 0.5, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(117, 207, 232, 0.11)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cam.cx, cam.cy, cam.radiusPx + 1.5, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function drawSun(ctx, cam, dateMs) {
    if (!dateMs) return;
    var sun = Orbit.data.subsolarPoint(dateMs);
    var sunProj = cam.project(Orbit.data.llaToEcef(sun.latDeg, sun.lonDeg, 0));
    var dx = sunProj.x - cam.cx;
    var dy = sunProj.y - cam.cy;
    var len = Math.hypot(dx, dy);
    if (len < 1) { dx = -0.6; dy = -0.4; len = 1; }
    var ux = dx / len, uy = dy / len;
    var limbX = cam.cx + ux * (cam.radiusPx + 5);
    var limbY = cam.cy + uy * (cam.radiusPx + 5);
    var sx = cam.cx + ux * (cam.radiusPx + 42);
    var sy = cam.cy + uy * (cam.radiusPx + 42);
    var alpha = sunProj.depth >= 0 ? 1 : 0.55;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(244, 203, 95, 0.42)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(limbX, limbY);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.setLineDash([]);

    var glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 22);
    glow.addColorStop(0, "rgba(244, 203, 95, 0.42)");
    glow.addColorStop(1, "rgba(244, 203, 95, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, 22, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#f4cb5f";
    ctx.strokeStyle = "rgba(24, 18, 6, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(10, 12, 16, 0.72)";
    ctx.fillRect(sx + 10, sy - 7, 26, 14);
    ctx.fillStyle = "#f4cb5f";
    ctx.font = "10px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("SUN", sx + 13, sy);
    ctx.restore();
  }

  function drawOrbitTrack(ctx, cam, sat) {
    if (sat.t.length === 0) return;
    var pts = sat.lla.map(function (row) {
      return Orbit.data.llaToEcef(row[0], row[1], row[2]);
    });
    // Far-side portion first, faint, so the front pass draws over it.
    strokeBack(ctx, cam, pts, hexA(sat.color, 0.16), 1);
    strokeFront(ctx, cam, pts, hexA(sat.color, 0.85), 1.4);
  }

  function strokeBack(ctx, cam, points, style, width) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i < points.length; i++) {
      var p = cam.project(points[i]);
      // Hide the part of the far side that the globe disc occludes.
      var rho = Math.hypot(p.x - cam.cx, p.y - cam.cy);
      if (p.depth > 0 || rho < cam.radiusPx) { started = false; continue; }
      if (started) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
  }

  function drawSatMarker(ctx, cam, sat, simSec, selected) {
    var pos = Orbit.data.samplePosition(sat, simSec);
    if (!pos) return;
    var p = cam.project(Orbit.data.llaToEcef(pos.latDeg, pos.lonDeg, pos.altKm));
    var front = p.depth > 0;
    if (!front && Math.hypot(p.x - cam.cx, p.y - cam.cy) < cam.radiusPx) return;

    ctx.fillStyle = hexA(sat.color, front ? 1 : 0.35);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 5);
    ctx.lineTo(p.x + 5, p.y);
    ctx.lineTo(p.x, p.y + 5);
    ctx.lineTo(p.x - 5, p.y);
    ctx.closePath();
    ctx.fill();
    if (front) {
      ctx.fillStyle = hexA(sat.color, 0.18);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      label(ctx, p, sat.name, sat.color);
    }
    if (selected) {
      ctx.strokeStyle = "#4fb8d1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  function drawGroundMarker(ctx, cam, gp, selected) {
    var p = cam.project(Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, gp.altM / 1000));
    if (p.depth <= 0) return;
    ctx.fillStyle = gp.color;
    ctx.beginPath();
    if (gp.kind === "target") {
      ctx.rect(p.x - 3, p.y - 3, 6, 6);
    } else {
      ctx.moveTo(p.x, p.y - 4.5);
      ctx.lineTo(p.x + 4.5, p.y + 3.5);
      ctx.lineTo(p.x - 4.5, p.y + 3.5);
      ctx.closePath();
    }
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = "#4fb8d1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    }
    label(ctx, p, gp.name, "#aeb6c2");
  }

  function label(ctx, p, text, color) {
    ctx.font = "10px Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(10, 12, 16, 0.7)";
    var tw = ctx.measureText(text).width;
    ctx.fillRect(p.x + 8, p.y - 6, tw + 4, 12);
    ctx.fillStyle = color;
    ctx.fillText(text, p.x + 10, p.y);
  }

  function hexA(hex, alpha) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "rgba(224, 164, 60, " + alpha + ")";
    var v = parseInt(m[1], 16);
    return "rgba(" + (v >> 16) + ", " + ((v >> 8) & 255) + ", " + (v & 255) + ", " + alpha + ")";
  }

  // Nearest front-facing object within 14 px, or null.
  function hitTest(canvas, x, y, state) {
    var scn = state.scn;
    if (!scn) return null;
    var cam = makeCamera(canvas.clientWidth, canvas.clientHeight);
    var best = null, bestD = 14;
    scn.sats.forEach(function (sat) {
      var pos = Orbit.data.samplePosition(sat, state.simSec);
      if (!pos) return;
      var p = cam.project(Orbit.data.llaToEcef(pos.latDeg, pos.lonDeg, pos.altKm));
      if (p.depth <= 0) return;
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = sat; bestD = d; }
    });
    scn.grounds.forEach(function (gp) {
      var p = cam.project(Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, 0));
      if (p.depth <= 0) return;
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = gp; bestD = d; }
    });
    return best;
  }

  // Drag-to-rotate / wheel-to-zoom. Suppresses the click-select that follows
  // a real drag via the returned wasDragged() check.
  function attach(canvas) {
    var dragging = false, moved = false, lastX = 0, lastY = 0;
    canvas.addEventListener("mousedown", function (ev) {
      dragging = true;
      moved = false;
      lastX = ev.clientX;
      lastY = ev.clientY;
      canvas.classList.add("is-dragging");
    });
    window.addEventListener("mousemove", function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - lastX, dy = ev.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
      view.lonDeg -= dx * 0.45 / view.zoom;
      view.latDeg = Math.max(-85, Math.min(85, view.latDeg + dy * 0.35 / view.zoom));
    });
    window.addEventListener("mouseup", function () {
      dragging = false;
      canvas.classList.remove("is-dragging");
    });
    canvas.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      view.zoom = Math.max(0.55, Math.min(3.2, view.zoom * Math.exp(-ev.deltaY * 0.0012)));
    }, { passive: false });
    return { wasDragged: function () { return moved; } };
  }

  Orbit.globe3d = { draw: draw, hitTest: hitTest, attach: attach, view: view };
})();
