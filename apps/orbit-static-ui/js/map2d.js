// Orbit.map2d - equirectangular mission map on a 2D canvas. The basemap is
// the procedural Orbit.earthtex raster (cached per canvas size) with vector
// coastlines and a quiet STK-style graticule on top. Per frame it composites
// a physically-derived day/night overlay (civil/nautical/astronomical
// twilight bands from solar altitude), the terminator line, city lights, the
// subsolar marker, then the mission overlays: ground tracks, live markers,
// and access lines. Hit-testing is unchanged from the object positions.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var TRAIL_SEC = 45 * 60; // bright "recent history" portion of each track
  var R = Orbit.data.EARTH_RADIUS_KM;

  // View toggles (Orbit.app keeps the authoritative copy on state.viewOptions
  // and defaults every key true except sensorFor); missing keys read as "on".
  function optOn(state, key) {
    var opts = state.viewOptions;
    return !opts || opts[key] !== false;
  }

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

    drawBasemap(ctx, rect, w, h, dpr);
    if (scn) {
      var dateMs = scn.epochMs + state.simSec * 1000;
      var sun = Orbit.data.subsolarPoint(dateMs);
      drawNightOverlay(ctx, rect, sun);
      drawCityLights(ctx, rect, sun);
      drawTerminatorLine(ctx, rect, sun);
      if (optOn(state, "sun")) drawSunMarker(ctx, rect, sun);
    }
    if (!scn) return;

    drawAreaOutlines(ctx, rect, state);
    if (optOn(state, "groundTracks")) {
      scn.sats.forEach(function (sat) { drawGroundTrack(ctx, rect, sat, state.simSec); });
    }
    if (optOn(state, "accessLines")) drawAccessLines(ctx, rect, scn, state.simSec);
    scn.sats.forEach(function (sat) { drawSensorViz(ctx, rect, sat, state); });
    scn.grounds.forEach(function (gp) {
      drawGroundMarker(ctx, rect, gp, state, state.selection === gp.name);
    });
    scn.sats.forEach(function (sat) {
      drawSatMarker(ctx, rect, sat, state, state.selection === sat.name);
    });
  }

  // ---- static basemap (cached per size) --------------------------------------

  var base = { key: "", canvas: null };

  function drawBasemap(ctx, rect, w, h, dpr) {
    var tex = Orbit.earthtex.build();
    var key = w + "x" + h + "@" + dpr + "#" + (tex.naturalRaster ? "ne" : "fallback");
    if (base.key !== key) {
      base.key = key;
      base.canvas = base.canvas || document.createElement("canvas");
      base.canvas.width = Math.max(1, Math.round(w * dpr));
      base.canvas.height = Math.max(1, Math.round(h * dpr));
      var bc = base.canvas.getContext("2d");
      bc.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderBase(bc, rect, w, h, tex);
    }
    ctx.drawImage(base.canvas, 0, 0, w, h);
  }

  function renderBase(ctx, rect, w, h, tex) {
    ctx.clearRect(0, 0, w, h);

    var bg = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    bg.addColorStop(0, "#07111d");
    bg.addColorStop(0.5, "#061019");
    bg.addColorStop(1, "#040b12");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#050a10";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tex.canvas, rect.x, rect.y, rect.w, rect.h);

    // Vector coastlines for crisp edges over the raster.
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.lineJoin = "round";
    beginLandPath(ctx, rect);
    ctx.strokeStyle = "rgba(6, 14, 20, 0.5)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    beginLandPath(ctx, rect);
    ctx.strokeStyle = "rgba(205, 228, 234, 0.32)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();

    drawGraticule(ctx, rect);

    ctx.strokeStyle = "#2e333b";
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
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

  // Quiet STK-like graticule: thin 30-deg grid, labels along the frame edges.
  function drawGraticule(ctx, rect) {
    ctx.strokeStyle = "rgba(170, 190, 205, 0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    var lon, lat, p, q;
    for (lon = -150; lon <= 150; lon += 30) {
      p = project(rect, 0, lon);
      ctx.moveTo(p.x, rect.y);
      ctx.lineTo(p.x, rect.y + rect.h);
    }
    for (lat = -60; lat <= 60; lat += 30) {
      q = project(rect, lat, 0);
      ctx.moveTo(rect.x, q.y);
      ctx.lineTo(rect.x + rect.w, q.y);
    }
    ctx.stroke();

    // Equator and prime meridian slightly stronger.
    ctx.strokeStyle = "rgba(170, 190, 205, 0.18)";
    ctx.beginPath();
    var eq = project(rect, 0, 0);
    ctx.moveTo(rect.x, eq.y);
    ctx.lineTo(rect.x + rect.w, eq.y);
    ctx.moveTo(eq.x, rect.y);
    ctx.lineTo(eq.x, rect.y + rect.h);
    ctx.stroke();

    ctx.fillStyle = "rgba(150, 168, 184, 0.5)";
    ctx.font = "9px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (lon = -120; lon <= 120; lon += 60) {
      p = project(rect, -90, lon);
      ctx.fillText(lonLabel(lon), p.x, rect.y + rect.h + 3);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (lat = -60; lat <= 60; lat += 30) {
      q = project(rect, lat, -180);
      ctx.fillText(latLabel(lat), rect.x - 4, q.y);
    }
  }

  function lonLabel(lon) {
    return lon === 0 ? "0" : Math.abs(lon) + (lon < 0 ? "W" : "E");
  }

  function latLabel(lat) {
    return lat === 0 ? "0" : Math.abs(lat) + (lat < 0 ? "S" : "N");
  }

  // ---- day/night shading ------------------------------------------------------

  // Low-res solar-altitude raster, recomputed each frame and scaled onto the
  // map. Alpha ramps through the civil (-6), nautical (-12), and astronomical
  // (-18 deg) twilight bands with small steps so the banding reads.
  var NW = 288, NH = 144;
  var night = { canvas: null, ctx: null, img: null, cosH: new Float32Array(NW) };

  function nightAlpha(sinAlt) {
    var S6 = -0.10453, S12 = -0.20791, S18 = -0.30902;
    if (sinAlt >= 0) return 0;
    if (sinAlt > S6) return 0.34 * (sinAlt / S6);
    if (sinAlt > S12) return 0.39 + 0.13 * ((sinAlt - S6) / (S12 - S6));
    if (sinAlt > S18) return 0.56 + 0.10 * ((sinAlt - S12) / (S18 - S12));
    return 0.74;
  }

  function drawNightOverlay(ctx, rect, sun) {
    if (!night.canvas) {
      night.canvas = document.createElement("canvas");
      night.canvas.width = NW;
      night.canvas.height = NH;
      night.ctx = night.canvas.getContext("2d");
      night.img = night.ctx.createImageData(NW, NH);
    }
    var buf = new Uint32Array(night.img.data.buffer);
    var sinD = Math.sin(sun.latDeg * DEG), cosD = Math.cos(sun.latDeg * DEG);
    var i, j;
    for (i = 0; i < NW; i++) {
      var lon = -180 + ((i + 0.5) / NW) * 360;
      night.cosH[i] = Math.cos((lon - sun.lonDeg) * DEG);
    }
    for (j = 0; j < NH; j++) {
      var lat = (90 - ((j + 0.5) / NH) * 180) * DEG;
      var sinLat = Math.sin(lat) * sinD;
      var cosLat = Math.cos(lat) * cosD;
      var row = j * NW;
      for (i = 0; i < NW; i++) {
        var a = nightAlpha(sinLat + cosLat * night.cosH[i]);
        // ABGR little-endian: deep blue-black night tint.
        buf[row + i] = ((a * 255) << 24) | (35 << 16) | (15 << 8) | 5;
      }
    }
    night.ctx.putImageData(night.img, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(night.canvas, rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  // Thin explicit terminator (solar altitude = 0) curve.
  function drawTerminatorLine(ctx, rect, sun) {
    var tanDec = Math.tan(sun.latDeg * DEG);
    ctx.strokeStyle = "rgba(255, 232, 190, 0.22)";
    ctx.lineWidth = 1;

    if (Math.abs(tanDec) < 1e-5) {
      drawMeridian(ctx, rect, wrapLon(sun.lonDeg - 90));
      drawMeridian(ctx, rect, wrapLon(sun.lonDeg + 90));
      return;
    }

    strokeTerminatorBranch(ctx, rect, sun, tanDec, -1);
    strokeTerminatorBranch(ctx, rect, sun, tanDec, 1);
  }

  function strokeTerminatorBranch(ctx, rect, sun, tanDec, sign) {
    ctx.beginPath();
    var started = false, prevLon = null;
    for (var lat = -89.5; lat <= 89.5; lat += 1) {
      var arg = -Math.tan(lat * DEG) * tanDec;
      if (arg < -1 || arg > 1) {
        started = false;
        continue;
      }
      var h = Math.acos(arg) / DEG;
      var lon = wrapLon(sun.lonDeg + sign * h);
      var p = project(rect, lat, lon);
      if (!started || (prevLon != null && Math.abs(lon - prevLon) > 180)) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
      started = true;
      prevLon = lon;
    }
    ctx.stroke();
  }

  function drawMeridian(ctx, rect, lon) {
    var p = project(rect, 0, lon);
    ctx.beginPath();
    ctx.moveTo(p.x, rect.y);
    ctx.lineTo(p.x, rect.y + rect.h);
    ctx.stroke();
  }

  function wrapLon(lon) {
    return ((lon % 360) + 540) % 360 - 180;
  }

  // Warm point glows where cities sit in darkness (pre-rendered sprite).
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

  function cityDarkness(city, sun) {
    var sinAlt = Math.sin(city[1] * DEG) * Math.sin(sun.latDeg * DEG) +
      Math.cos(city[1] * DEG) * Math.cos(sun.latDeg * DEG) *
      Math.cos((city[0] - sun.lonDeg) * DEG);
    if (sinAlt >= -0.05) return 0;
    return Math.min(1, (-sinAlt - 0.05) / 0.15);
  }

  function drawCityLights(ctx, rect, sun) {
    var sprite = ensureCitySprite();
    var scale = rect.w / 1200; // keep the glow size sane on small panels
    var size = Math.max(5, Math.min(11, 9 * scale + 4));
    Orbit.world.cities.forEach(function (city) {
      var dark = cityDarkness(city, sun);
      if (dark <= 0) return;
      var p = project(rect, city[1], city[0]);
      ctx.globalAlpha = dark * (0.35 + 0.65 * city[2]);
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
  }

  function drawSunMarker(ctx, rect, sun) {
    var sp = project(rect, sun.latDeg, sun.lonDeg);
    var glow = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, 42);
    glow.addColorStop(0, "rgba(255, 218, 130, 0.36)");
    glow.addColorStop(0.35, "rgba(255, 183, 82, 0.14)");
    glow.addColorStop(1, "rgba(255, 214, 120, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 42, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 224, 150, 0.95)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 6.5, 0, 2 * Math.PI);
    ctx.moveTo(sp.x - 15, sp.y);
    ctx.lineTo(sp.x - 8, sp.y);
    ctx.moveTo(sp.x + 8, sp.y);
    ctx.lineTo(sp.x + 15, sp.y);
    ctx.moveTo(sp.x, sp.y - 15);
    ctx.lineTo(sp.x, sp.y - 8);
    ctx.moveTo(sp.x, sp.y + 8);
    ctx.lineTo(sp.x, sp.y + 15);
    ctx.stroke();

    ctx.fillStyle = "#ffe096";
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    label(ctx, sp, "SUBSOLAR", "#ffe096", -17);
  }

  // ---- mission overlays ---------------------------------------------------------

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

  // Sunlit -> 1, Penumbra -> 0.65, Umbra -> 0.3, no eclipse data -> 1 (same
  // ramp apps/orbit-ui/src/three/viewer.js uses for its satellite markers).
  function eclipseDim(scn, satName, simSec) {
    var lighting = Orbit.data.lightingStateAt(scn, satName, simSec);
    if (lighting === "Umbra") return 0.3;
    if (lighting === "Penumbra") return 0.65;
    return 1;
  }

  function drawSatMarker(ctx, rect, sat, state, selected) {
    var pos = Orbit.data.samplePosition(sat, state.simSec);
    if (!pos) return;
    var p = project(rect, pos.latDeg, pos.lonDeg);
    var dim = eclipseDim(state.scn, sat.name, state.simSec);

    ctx.fillStyle = hexA(sat.color, 0.18 * dim);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = hexA(sat.color, dim);
    ctx.beginPath(); // diamond
    ctx.moveTo(p.x, p.y - 5);
    ctx.lineTo(p.x + 5, p.y);
    ctx.lineTo(p.x, p.y + 5);
    ctx.lineTo(p.x - 5, p.y);
    ctx.closePath();
    ctx.fill();

    if (selected) selectionRing(ctx, p);
    if (optOn(state, "labels")) label(ctx, p, sat.name, sat.color, -10);
  }

  function drawGroundMarker(ctx, rect, gp, state, selected) {
    var p = project(rect, gp.latDeg, gp.lonDeg);
    var specPoint = null;
    if (state.spec) {
      state.spec.objects.forEach(function (o) {
        if (o.kind === "target" && o.name === gp.name) specPoint = o;
      });
    }
    var isAreaPoint = !!(specPoint && specPoint.group);
    ctx.fillStyle = gp.color;
    ctx.strokeStyle = "rgba(16, 18, 21, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isAreaPoint) { // tiny square; the area outline carries the label
      ctx.rect(p.x - 2, p.y - 2, 4, 4);
    } else if (gp.kind === "target") { // small square
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
    if (!isAreaPoint && optOn(state, "labels")) label(ctx, p, gp.name, "#aeb6c2", 9, true);
  }

  // Area target rectangles: a dashed outline plus a centroid label, so the
  // whole footprint reads as one object instead of only its grid points.
  function drawAreaOutlines(ctx, rect, state) {
    if (!state.spec) return;
    var areas = Orbit.spec.groupTargets(state.spec.objects).areas;
    areas.forEach(function (group) {
      var areaMeta = group.points.length > 0 ? group.points[0].area : null;
      if (!areaMeta) return;
      var ring = Orbit.spec.areaRectRing(areaMeta);
      var selected = state.selection === group.name;
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = selected ? "rgba(79, 184, 209, 0.9)" : "rgba(95, 201, 143, 0.55)";
      ctx.lineWidth = selected ? 1.6 : 1.1;
      ctx.beginPath();
      ring.forEach(function (pt, i) {
        var p = project(rect, pt[1], pt[0]);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
      if (optOn(state, "labels")) {
        var c = project(rect, areaMeta.centerLatDeg, areaMeta.centerLonDeg);
        label(ctx, c, group.name, "#5fc98f", 0, false);
      }
    });
  }

  var SENSOR_IDLE = "#7fb4d8";
  var SENSOR_FOR = "rgba(216, 167, 90, 0.55)";
  var SENSOR_TRACK = "#5fc98f";

  // Instantaneous FOV footprint and FOR reachable envelope for one
  // satellite's sensor, ground-projected via Orbit.sensorviz.footprintRing.
  // Follows the active scheduled pointing when a fresh schedule exists for
  // this platform, else the sensor's home pointing mode.
  function drawSensorViz(ctx, rect, sat, state) {
    if (!state.spec) return;
    var specSat = null;
    state.spec.objects.forEach(function (o) {
      if (o.kind === "satellite" && o.name === sat.name) specSat = o;
    });
    if (!specSat || !specSat.sensor) return;
    var pos = Orbit.data.samplePosition(sat, state.simSec);
    if (!pos) return;
    var satPos = Orbit.data.llaToEcef(pos.latDeg, pos.lonDeg, pos.altKm);
    var entries = state.dirty ? []
      : Orbit.data.scheduleForPlatform(state.scn.schedule, sat.name);
    var bore = Orbit.sensorviz.boresightAt({
      sat: sat, sensor: specSat.sensor, scn: state.scn, tSec: state.simSec,
      satPosEcef: satPos, entries: entries, spec: state.spec,
    });

    if (optOn(state, "sensorFor")) {
      var forRing = Orbit.sensorviz.footprintRing(
        satPos, bore.dir, specSat.sensor.fieldOfRegardDeg || 60, R, 40);
      strokeFootprint(ctx, rect, forRing, SENSOR_FOR, 1);
    }
    if (optOn(state, "sensorFov")) {
      var fovRing = Orbit.sensorviz.footprintRing(
        satPos, bore.dir, specSat.sensor.coneHalfAngleDeg || 20, R, 32);
      var color = bore.pointing.phase === "track" ? SENSOR_TRACK
        : bore.pointing.phase === "idle" ? SENSOR_IDLE : SENSOR_FOR;
      strokeFootprint(ctx, rect, fovRing, color, 1.3);
    }
  }

  // Stroke a footprint ring (array of ECEF points or null gaps from
  // Orbit.sensorviz.footprintRing) on the equirectangular map, breaking
  // wherever a sample missed the globe or the ring crosses the antimeridian.
  function strokeFootprint(ctx, rect, ring, style, width) {
    if (!ring) return;
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    var started = false, prevLon = null;
    for (var i = 0; i < ring.length; i++) {
      var pt = ring[i];
      if (!pt) { started = false; prevLon = null; continue; }
      var ll = Orbit.data.ecefToLla(pt.x, pt.y, pt.z);
      if (started && prevLon != null && Math.abs(ll.lonDeg - prevLon) > 180) started = false;
      var p = project(rect, ll.latDeg, ll.lonDeg);
      if (started) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      started = true;
      prevLon = ll.lonDeg;
    }
    ctx.stroke();
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
