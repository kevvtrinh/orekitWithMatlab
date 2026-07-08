// Orbit.globe3d - orthographic Earth-fixed globe on a 2D canvas, no WebGL.
// The sphere is shaded per pixel from the procedural Orbit.earthtex raster:
// texture lookup, sun-driven Lambert lighting aligned with the subsolar
// point (soft twilight across the terminator), ocean sun glint, a light
// cloud layer, night-side city lights, and an atmosphere rim. Orbit tracks,
// markers, drag-to-rotate, wheel zoom, and hit-testing keep the original
// ECEF camera math.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var R = 6371.0; // km, display sphere
  var FALLBACK_MS = Date.parse("2026-01-01T12:00:00Z"); // no-scenario sun

  var view = { lonDeg: -95, latDeg: 28, zoom: 1 };

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function smoothstep(a, b, v) {
    var t = clamp01((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  // Deterministic starfield in unit viewport coordinates.
  var stars = (function () {
    var out = [], seed = 42;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 160; i++) {
      out.push({ x: rnd(), y: rnd(), r: 0.3 + rnd() * 0.9, a: 0.15 + rnd() * 0.5 });
    }
    return out;
  })();

  // Camera basis for the current view; returns projector closures plus the
  // basis vectors so the surface shader can invert the projection.
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
      east: east,
      north: north,
      fwd: fwd,
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
    var dateMs = scn ? scn.epochMs + state.simSec * 1000 : FALLBACK_MS;
    var sun = sunVector(dateMs);

    drawSpace(ctx, w, h);
    drawAtmosphereHalo(ctx, cam, sun);
    drawSurface(ctx, cam, sun, dpr);
    drawCoastlines(ctx, cam);
    drawGraticule(ctx, cam);
    drawCityLights(ctx, cam, sun);
    drawSunIndicator(ctx, cam, sun);

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

  // Unit ECEF vector toward the sun (from the subsolar point).
  function sunVector(dateMs) {
    var sp = Orbit.data.subsolarPoint(dateMs);
    var v = Orbit.data.llaToEcef(sp.latDeg, sp.lonDeg, 0);
    return { x: v.x / R, y: v.y / R, z: v.z / R, latDeg: sp.latDeg, lonDeg: sp.lonDeg };
  }

  function drawSpace(ctx, w, h) {
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#04070c");
    bg.addColorStop(0.55, "#070c13");
    bg.addColorStop(1, "#030509");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#e8ecf4";
    stars.forEach(function (s) {
      ctx.globalAlpha = s.a;
      ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
    });
    ctx.globalAlpha = 1;
  }

  // Soft scattered-light ring just outside the limb, brighter sunward.
  function drawAtmosphereHalo(ctx, cam, sun) {
    var sp = cam.project({ x: sun.x * R, y: sun.y * R, z: sun.z * R });
    var dx = sp.x - cam.cx, dy = sp.y - cam.cy;
    var len = Math.hypot(dx, dy) || 1;
    var offX = (dx / len) * cam.radiusPx * 0.18;
    var offY = (dy / len) * cam.radiusPx * 0.18;
    var sunFront = sp.depth >= 0 ? 1 : 0.45;

    var halo = ctx.createRadialGradient(
      cam.cx + offX, cam.cy + offY, cam.radiusPx * 0.92,
      cam.cx + offX, cam.cy + offY, cam.radiusPx * 1.16);
    halo.addColorStop(0, "rgba(88, 150, 210, " + (0.30 * sunFront) + ")");
    halo.addColorStop(0.55, "rgba(70, 120, 185, " + (0.12 * sunFront) + ")");
    halo.addColorStop(1, "rgba(60, 105, 170, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cam.cx + offX, cam.cy + offY, cam.radiusPx * 1.2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // ---- per-pixel sphere shading -----------------------------------------------

  var surf = { size: 0, canvas: null, ctx: null, img: null, buf: null };

  function drawSurface(ctx, cam, sun, dpr) {
    var tex = Orbit.earthtex.build();
    var S = Math.max(64, Math.min(900, Math.round(cam.radiusPx * 2 * dpr)));
    if (surf.size !== S) {
      surf.size = S;
      surf.canvas = surf.canvas || document.createElement("canvas");
      surf.canvas.width = S;
      surf.canvas.height = S;
      surf.ctx = surf.canvas.getContext("2d");
      surf.img = surf.ctx.createImageData(S, S);
      surf.buf = new Uint32Array(surf.img.data.buffer);
    }

    var buf = surf.buf;
    var e = cam.east, n = cam.north, f = cam.fwd;
    var sx = sun.x, sy = sun.y, sz = sun.z;
    // Half vector for the ocean glint (viewer direction is +fwd, constant
    // under orthographic projection).
    var hx = sx + f[0], hy = sy + f[1], hz = sz + f[2];
    var hl = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
    hx /= hl; hy /= hl; hz /= hl;

    var TW = tex.width, TH = tex.height;
    var tp = tex.pixels, landM = tex.land, cloudM = tex.cloud;
    var INV_2PI = 1 / (2 * Math.PI), INV_PI = 1 / Math.PI;
    var inv = 2 / S;

    for (var py = 0; py < S; py++) {
      var ny = 1 - (py + 0.5) * inv;
      var row = py * S;
      var ny2 = ny * ny;
      for (var px = 0; px < S; px++) {
        var nx = (px + 0.5) * inv - 1;
        var d2 = nx * nx + ny2;
        if (d2 >= 1) { buf[row + px] = 0; continue; }
        var nz = Math.sqrt(1 - d2);

        // Screen pixel -> unit ECEF surface normal.
        var ex = nx * e[0] + ny * n[0] + nz * f[0];
        var ey = nx * e[1] + ny * n[1] + nz * f[1];
        var ez = ny * n[2] + nz * f[2]; // east has no z component

        var lat = Math.asin(ez > 1 ? 1 : ez < -1 ? -1 : ez);
        var lon = Math.atan2(ey, ex);
        var tx = ((lon * INV_2PI + 0.5) * TW) | 0;
        if (tx < 0) tx = 0; else if (tx >= TW) tx = TW - 1;
        var ty = ((0.5 - lat * INV_PI) * TH) | 0;
        if (ty < 0) ty = 0; else if (ty >= TH) ty = TH - 1;
        var ti = ty * TW + tx;

        var c = tp[ti];
        var r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;

        // Thin cloud deck, slightly stronger toward the limb.
        var cl = cloudM[ti] * 0.0010 * (0.65 + 0.5 * (1 - nz));
        r += (255 - r) * cl; g += (255 - g) * cl; b += (255 - b) * cl;

        // Sun-driven Lambert shading with a soft twilight ramp.
        var d = ex * sx + ey * sy + ez * sz;
        var t = smoothstep(-0.10, 0.18, d);
        var direct = Math.sqrt(d > 0 ? d : 0);
        var light = 0.10 + t * (0.46 + 0.48 * direct);
        if (light > 1) light = 1;
        r *= light; g *= light; b *= light;

        // Faint blue ambience keeps the night side from becoming a hole.
        var nightF = 1 - t;
        r += 5 * nightF; g += 9 * nightF; b += 22 * nightF;

        // Ocean sun glint (day side only).
        if (!landM[ti] && t > 0.2) {
          var hdot = ex * hx + ey * hy + ez * hz;
          if (hdot > 0) {
            var v2 = hdot * hdot;      // ^2
            v2 *= v2; v2 *= v2; v2 *= v2; v2 *= v2; v2 *= v2; // ^64
            var glint = v2 * 105 * t;
            r += glint; g += glint * 0.95; b += glint * 0.8;
          }
        }

        // Atmospheric scattering toward the limb.
        var fr = (1 - nz) * (1 - nz);
        var atm = fr * (0.20 + 0.80 * t);
        r += 60 * atm; g += 95 * atm; b += 150 * atm;

        // Anti-aliased limb.
        var aa = (1 - d2) * S * 0.25;
        if (aa > 1) aa = 1;

        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        buf[row + px] = ((aa * 255) << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0);
      }
    }

    surf.ctx.putImageData(surf.img, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(surf.canvas,
      cam.cx - cam.radiusPx, cam.cy - cam.radiusPx,
      cam.radiusPx * 2, cam.radiusPx * 2);
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

  var coastEcef = null;

  function coastlineRings() {
    if (!coastEcef) {
      coastEcef = Orbit.world.landPolygons.map(function (ring) {
        return ring.map(function (pt) {
          return Orbit.data.llaToEcef(pt[1], pt[0], 0.8);
        });
      });
    }
    return coastEcef;
  }

  function drawCoastlines(ctx, cam) {
    ctx.save();
    ctx.lineJoin = "round";
    coastlineRings().forEach(function (ring) {
      strokeFront(ctx, cam, ring, "rgba(3, 7, 10, 0.45)", 1.2);
      strokeFront(ctx, cam, ring, "rgba(200, 226, 232, 0.18)", 0.55);
    });
    ctx.restore();
  }

  function drawGraticule(ctx, cam) {
    var style = "rgba(190, 205, 220, 0.10)";
    var strong = "rgba(190, 205, 220, 0.18)";
    var lat, lon, pts;
    for (lat = -60; lat <= 60; lat += 30) {
      pts = [];
      for (lon = -180; lon <= 180; lon += 6) pts.push(Orbit.data.llaToEcef(lat, lon, 0));
      strokeFront(ctx, cam, pts, lat === 0 ? strong : style, 1);
    }
    for (lon = -180; lon < 180; lon += 30) {
      pts = [];
      for (lat = -90; lat <= 90; lat += 6) pts.push(Orbit.data.llaToEcef(lat, lon, 0));
      strokeFront(ctx, cam, pts, lon === 0 ? strong : style, 1);
    }
  }

  // Warm glows where cities sit on the visible night side.
  var citySprite = null;

  function ensureCitySprite() {
    if (citySprite) return citySprite;
    citySprite = document.createElement("canvas");
    citySprite.width = 16;
    citySprite.height = 16;
    var c = citySprite.getContext("2d");
    var g = c.createRadialGradient(8, 8, 0.5, 8, 8, 7);
    g.addColorStop(0, "rgba(255, 226, 168, 0.95)");
    g.addColorStop(0.3, "rgba(255, 196, 120, 0.4)");
    g.addColorStop(1, "rgba(255, 180, 90, 0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
    return citySprite;
  }

  function drawCityLights(ctx, cam, sun) {
    var sprite = ensureCitySprite();
    var size = Math.max(4, Math.min(10, cam.radiusPx * 0.032));
    Orbit.world.cities.forEach(function (city) {
      var v = Orbit.data.llaToEcef(city[1], city[0], 0);
      var d = (v.x * sun.x + v.y * sun.y + v.z * sun.z) / R;
      if (d >= -0.05) return; // in daylight or twilight
      var p = cam.project(v);
      if (p.depth <= 0) return;
      var dark = Math.min(1, (-d - 0.05) / 0.15);
      var limbFade = Math.min(1, (p.depth / R) * 3);
      ctx.globalAlpha = dark * limbFade * (0.35 + 0.65 * city[2]);
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
  }

  // Sun cue: a real source glyph outside the globe plus a subsolar surface
  // marker when the lit point faces the camera.
  function drawSunIndicator(ctx, cam, sun) {
    var sp = cam.project({ x: sun.x * R, y: sun.y * R, z: sun.z * R });
    var sx = sun.x * cam.east[0] + sun.y * cam.east[1] + sun.z * cam.east[2];
    var sy = -(sun.x * cam.north[0] + sun.y * cam.north[1] + sun.z * cam.north[2]);
    var len = Math.hypot(sx, sy);
    var frontDot = sun.x * cam.fwd[0] + sun.y * cam.fwd[1] + sun.z * cam.fwd[2];
    if (len < 0.08) {
      sx = frontDot >= 0 ? -0.82 : 0.82;
      sy = frontDot >= 0 ? -0.48 : 0.48;
      len = Math.hypot(sx, sy);
    }
    var ux = sx / len, uy = sy / len;
    var outer = Math.max(42, Math.min(76, cam.radiusPx * 0.18));
    var sunX = cam.cx + ux * (cam.radiusPx + outer);
    var sunY = cam.cy + uy * (cam.radiusPx + outer);
    var w = ctx.canvas.clientWidth || ctx.canvas.width;
    var h = ctx.canvas.clientHeight || ctx.canvas.height;
    var margin = 24;
    sunX = Math.max(margin, Math.min(w - margin, sunX));
    sunY = Math.max(margin, Math.min(h - margin, sunY));
    var rayAlpha = frontDot >= 0 ? 0.24 : 0.11;
    var diskAlpha = frontDot >= 0 ? 1 : 0.58;

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 218, 135, " + rayAlpha + ")";
    ctx.lineWidth = 1;
    var tx = -uy, ty = ux;
    for (var r = -1; r <= 1; r++) {
      var off = r * 9;
      ctx.beginPath();
      ctx.moveTo(sunX - ux * 16 + tx * off, sunY - uy * 16 + ty * off);
      ctx.lineTo(cam.cx + ux * cam.radiusPx * 0.90 + tx * off,
        cam.cy + uy * cam.radiusPx * 0.90 + ty * off);
      ctx.stroke();
    }

    var glow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 44);
    glow.addColorStop(0, "rgba(255, 232, 165, " + (0.46 * diskAlpha) + ")");
    glow.addColorStop(0.38, "rgba(255, 181, 74, " + (0.22 * diskAlpha) + ")");
    glow.addColorStop(1, "rgba(255, 181, 74, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 44, 0, 2 * Math.PI);
    ctx.fill();

    var disk = ctx.createRadialGradient(sunX - 3, sunY - 3, 1, sunX, sunY, 11);
    disk.addColorStop(0, "rgba(255, 248, 208, " + diskAlpha + ")");
    disk.addColorStop(0.7, "rgba(255, 204, 105, " + diskAlpha + ")");
    disk.addColorStop(1, "rgba(224, 126, 47, " + (0.95 * diskAlpha) + ")");
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 11, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 224, 150, " + (0.85 * diskAlpha) + ")";
    ctx.font = "9px Consolas, monospace";
    ctx.textAlign = ux >= 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText("SUN", sunX + (ux >= 0 ? 16 : -16), sunY);
    ctx.restore();

    if (sp.depth > 0) {
      // Subsolar point is on the visible hemisphere: mark it on the surface.
      var sub = ctx.createRadialGradient(sp.x, sp.y, 1, sp.x, sp.y, 24);
      sub.addColorStop(0, "rgba(255, 224, 150, 0.30)");
      sub.addColorStop(1, "rgba(255, 224, 150, 0)");
      ctx.fillStyle = sub;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 24, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 224, 150, 0.86)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 5, 0, 2 * Math.PI);
      ctx.moveTo(sp.x - 12, sp.y);
      ctx.lineTo(sp.x - 7, sp.y);
      ctx.moveTo(sp.x + 7, sp.y);
      ctx.lineTo(sp.x + 12, sp.y);
      ctx.moveTo(sp.x, sp.y - 12);
      ctx.lineTo(sp.x, sp.y - 7);
      ctx.moveTo(sp.x, sp.y + 7);
      ctx.lineTo(sp.x, sp.y + 12);
      ctx.stroke();
    }
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
