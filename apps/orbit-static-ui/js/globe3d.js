// Orbit.globe3d - orthographic 3D Earth view on a stacked WebGL + 2D canvas.
//
// The sphere surface renders on the GPU (fragment-shader ray/sphere: bundled
// NASA-derived day/night/specular textures, sun-driven terminator, night
// lights only on the dark side, ocean-weighted specular, atmosphere rim)
// with the original per-pixel Canvas-2D shader kept as an automatic
// fallback when WebGL or texture loading is unavailable (file:// mode, old
// machines). The globe deliberately renders a cloud-free Earth. Overlays -
// orbit/ground tracks, markers, sensor volumes, labels - draw on the 2D
// canvas above it.
//
// Two display frames, toggled from the View menu (state.viewOptions.frame3d):
//   "ecef" - Earth-fixed: geography is stationary, the Sun and inertial
//            orbit lines sweep with scenario time.
//   "eci"  - inertial (GCRF): the star background and orbit lines are fixed,
//            the Earth rotates under them by the backend's exported
//            ITRF->GCRF angle (Orbit.data.gmstAt).
// The same sun vector (Orbit.data.sunDirEcefAt / sunDirEciAt - Orekit
// samples first, analytic fallback) drives the terminator, night lights,
// sun glyph, and subsolar marker, so they can never disagree by a frame.
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

  // Deterministic world-anchored starfield: unit directions in the inertial
  // frame, so stars stay fixed in ECI mode and wheel overhead in ECEF mode.
  var stars = (function () {
    var out = [], seed = 42;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 420; i++) {
      var z = rnd() * 2 - 1;
      var az = rnd() * 2 * Math.PI;
      var c = Math.sqrt(Math.max(0, 1 - z * z));
      out.push({
        x: c * Math.cos(az), y: c * Math.sin(az), z: z,
        r: 0.4 + rnd() * 1.0,
        a: 0.14 + rnd() * 0.5,
      });
    }
    return out;
  })();

  // ---- frames ------------------------------------------------------------------

  function frameMode(state) {
    var opts = state && state.viewOptions;
    return opts && opts.frame3d === "eci" ? "eci" : "ecef";
  }

  // Earth rotation angle (display <-> ECEF) for the current frame/time:
  // 0 in ECEF mode; the true prime-meridian angle in ECI mode.
  function earthRotation(state) {
    if (frameMode(state) !== "eci" || !state.scn) return 0;
    return Orbit.data.gmstAt(state.scn, state.simSec);
  }

  // ECEF -> display-frame (rotate by +rot about z).
  function ecefToDisplay(v, rot) {
    if (rot === 0) return v;
    var c = Math.cos(rot), s = Math.sin(rot);
    return { x: c * v.x - s * v.y, y: s * v.x + c * v.y, z: v.z };
  }

  // ECI/GCRF -> display-frame (identity in ECI mode; rotate by -rotEcef in
  // ECEF mode where rotEcef is the prime-meridian angle).
  function eciToDisplay(v, state) {
    if (frameMode(state) === "eci") return v;
    var rot = state.scn ? -Orbit.data.gmstAt(state.scn, state.simSec) : 0;
    return ecefToDisplay(v, rot);
  }

  // Camera basis for the current view; returns projector closures plus the
  // basis vectors so the surface shaders can invert the projection.
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
      // p: {x, y, z} km in the DISPLAY frame -> {x, y, depth} screen px.
      project: function (p) {
        return {
          x: cx + (p.x * east[0] + p.y * east[1]) * scale,
          y: cy - (p.x * north[0] + p.y * north[1] + p.z * north[2]) * scale,
          depth: p.x * fwd[0] + p.y * fwd[1] + p.z * fwd[2],
        };
      },
    };
  }

  // View toggles (Orbit.app keeps the authoritative copy on
  // state.viewOptions); missing keys read as "on" except sensorFor/frame3d.
  function optOn(state, key) {
    var opts = state.viewOptions;
    return !opts || opts[key] !== false;
  }

  // Display position of a satellite at simSec, or null. In ECI mode fresh
  // MATLAB/preview ECI samples are used directly; in ECEF mode geodetic
  // samples map onto the display sphere.
  function satDisplayPosition(sat, state) {
    if (frameMode(state) === "eci") {
      var eci = Orbit.data.sampleEci(sat, state.simSec);
      if (eci) return eci;
    }
    var pos = Orbit.data.samplePosition(sat, state.simSec);
    if (!pos) return null;
    var ecef = Orbit.data.llaToEcef(pos.latDeg, pos.lonDeg, pos.altKm);
    return ecefToDisplay(ecef, earthRotation(state));
  }

  // Sun direction in the display frame (unit) at the current time.
  function sunDisplayDir(state) {
    if (!state.scn) {
      var fallback = Orbit.data.sunDirEcef(FALLBACK_MS);
      return { x: fallback.x, y: fallback.y, z: fallback.z, source: "analytic" };
    }
    if (frameMode(state) === "eci") {
      return Orbit.data.sunDirEciAt(state.scn, state.simSec);
    }
    return Orbit.data.sunDirEcefAt(state.scn, state.simSec);
  }

  // ---- top-level draw -------------------------------------------------------------

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
    var rot = earthRotation(state);
    var sun = sunDisplayDir(state);

    drawSpace(ctx, w, h, cam, state);
    drawAtmosphereHalo(ctx, cam, sun);
    drawEarth(ctx, cam, sun, rot, dpr, state);
    drawCoastlines(ctx, cam, rot);
    drawGraticule(ctx, cam, rot);
    drawCityLights(ctx, cam, sun, rot);
    if (optOn(state, "sun")) drawSunIndicator(ctx, cam, sun, state, rot);

    if (!scn) return;

    drawAreaOutlines(ctx, cam, state, rot);
    scn.grounds.forEach(function (gp) {
      drawGroundMarker(ctx, cam, gp, state, state.selection === gp.name, rot);
    });
    if (optOn(state, "orbitTracks")) {
      scn.sats.forEach(function (sat) { drawOrbitTrack(ctx, cam, sat, state); });
    }
    if (optOn(state, "groundTracks")) {
      scn.sats.forEach(function (sat) { drawGroundTrack(ctx, cam, sat, state, rot); });
    }
    if (optOn(state, "accessLines")) drawAccessLines(ctx, cam, scn, state, rot);
    scn.sats.forEach(function (sat) {
      drawSensorViz(ctx, cam, sat, state, rot);
    });
    scn.sats.forEach(function (sat) {
      drawSatMarker(ctx, cam, sat, state, state.selection === sat.name);
    });
  }

  function drawSpace(ctx, w, h, cam, state) {
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#04070c");
    bg.addColorStop(0.55, "#070c13");
    bg.addColorStop(1, "#030509");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // World-anchored stars: inertial directions, hidden behind the globe.
    ctx.fillStyle = "#e8ecf4";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var d = eciToDisplay(s, state);
      var p = cam.project({ x: d.x * R * 30, y: d.y * R * 30, z: d.z * R * 30 });
      if (p.depth <= 0) continue;
      if (Math.hypot(p.x - cam.cx, p.y - cam.cy) < cam.radiusPx + 2) continue;
      if (p.x < 0 || p.y < 0 || p.x > w || p.y > h) continue;
      ctx.globalAlpha = s.a;
      ctx.fillRect(p.x, p.y, s.r, s.r);
    }
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

  // ---- WebGL surface renderer -----------------------------------------------------

  var TEXTURE_FILES = {
    day: "assets/earth_atmos_2048.jpg",
    night: "assets/earth_lights_2048.png",
    spec: "assets/earth_specular_2048.jpg",
  };

  var VERT_SRC = [
    "attribute vec2 aPos;",
    "varying vec2 vPos;",
    "void main() {",
    "  vPos = aPos;",
    "  gl_Position = vec4(aPos, 0.0, 1.0);",
    "}"].join("\n");

  // Ray-traced orthographic sphere: vPos is the screen-space offset from the
  // disc center in units of the disc radius. Reconstruct the display-frame
  // surface normal, rotate into ECEF for the texture lookup, and shade with
  // the shared sun direction.
  var FRAG_SRC = [
    "precision mediump float;",
    "varying vec2 vPos;",
    "uniform vec3 uEast;",
    "uniform vec3 uNorth;",
    "uniform vec3 uFwd;",
    "uniform vec3 uSunDir;",
    "uniform float uRot;",       // display -> ECEF angle about +Z
    "uniform float uRadiusPx;",
    "uniform sampler2D uDay;",
    "uniform sampler2D uNight;",
    "uniform sampler2D uSpec;",
    "uniform float uHasNight;",
    "uniform float uHasSpec;",
    "const float TWO_PI = 6.28318530718;",
    "const float PI = 3.14159265359;",
    "void main() {",
    "  float d2 = dot(vPos, vPos);",
    "  float aa = clamp((1.0 - d2) * uRadiusPx * 0.5, 0.0, 1.0);",
    "  if (aa <= 0.0) { gl_FragColor = vec4(0.0); return; }",
    "  float nz = sqrt(max(1.0 - d2, 0.0));",
    "  vec3 normal = normalize(uEast * vPos.x + uNorth * vPos.y + uFwd * nz);",
    "  float cr = cos(uRot); float sr = sin(uRot);",
    "  vec3 ecef = vec3(cr * normal.x + sr * normal.y, -sr * normal.x + cr * normal.y, normal.z);",
    "  float lat = asin(clamp(ecef.z, -1.0, 1.0));",
    "  float lon = atan(ecef.y, ecef.x);",
    "  vec2 uv = vec2(lon / TWO_PI + 0.5, 0.5 - lat / PI);",
    "  vec3 day = texture2D(uDay, uv).rgb;",
    "  float ndl = dot(normal, uSunDir);",
    "  float dayF = smoothstep(-0.12, 0.18, ndl);",
    "  float direct = sqrt(max(ndl, 0.0));",
    "  vec3 lit = day * (0.32 + 0.98 * direct);",
    "  vec3 nightSide = day * vec3(0.07, 0.10, 0.17);",
    "  vec3 color = mix(nightSide, lit, dayF);",
    "  if (uHasNight > 0.5) {",
    "    vec3 lights = texture2D(uNight, uv).rgb;",
    "    color += lights * vec3(1.0, 0.86, 0.62) * (1.0 - dayF);",
    "  }",
    "  if (uHasSpec > 0.5) {",
    "    float ocean = texture2D(uSpec, uv).r;",
    "    vec3 halfDir = normalize(uSunDir + uFwd);",
    "    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);",
    "    color += vec3(0.42, 0.48, 0.52) * spec * ocean * dayF * 0.7;",
    "  }",
    "  float fresnel = pow(1.0 - nz, 2.4);",
    "  color += vec3(0.22, 0.40, 0.72) * fresnel * (0.22 + 0.78 * dayF);",
    "  gl_FragColor = vec4(color * aa, aa);", // premultiplied
    "}"].join("\n");

  // gl: null = untried, false = unavailable (software fallback), object = live.
  var gl = null;
  var glState = null;

  function initWebgl() {
    if (gl !== null) return gl;
    try {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        depth: false,
        stencil: false,
      });
      if (!context) { gl = false; return gl; }

      function compile(type, src) {
        var sh = context.createShader(type);
        context.shaderSource(sh, src);
        context.compileShader(sh);
        if (!context.getShaderParameter(sh, context.COMPILE_STATUS)) {
          throw new Error(context.getShaderInfoLog(sh) || "shader compile failed");
        }
        return sh;
      }
      var prog = context.createProgram();
      context.attachShader(prog, compile(context.VERTEX_SHADER, VERT_SRC));
      context.attachShader(prog, compile(context.FRAGMENT_SHADER, FRAG_SRC));
      context.linkProgram(prog);
      if (!context.getProgramParameter(prog, context.LINK_STATUS)) {
        throw new Error(context.getProgramInfoLog(prog) || "program link failed");
      }
      context.useProgram(prog);

      var quad = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, quad);
      context.bufferData(context.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW);
      var aPos = context.getAttribLocation(prog, "aPos");
      context.enableVertexAttribArray(aPos);
      context.vertexAttribPointer(aPos, 2, context.FLOAT, false, 0, 0);

      glState = {
        canvas: canvas,
        prog: prog,
        uniforms: {},
        textures: {},   // key -> WebGLTexture
        ready: {},      // key -> bool (real image uploaded)
        failed: 0,
      };
      ["uEast", "uNorth", "uFwd", "uSunDir", "uRot", "uRadiusPx", "uDay",
        "uNight", "uSpec", "uHasNight", "uHasSpec"]
        .forEach(function (name) {
          glState.uniforms[name] = context.getUniformLocation(prog, name);
        });

      // Placeholder day texture from the procedural basemap so the globe is
      // never black while images stream in.
      glState.textures.day = makeTexture(context, Orbit.earthtex.build().canvas);
      ["night", "spec"].forEach(function (key) {
        glState.textures[key] = makeTexture(context, null);
      });
      loadImages(context);
      gl = context;
    } catch (e) {
      gl = false;
    }
    return gl;
  }

  function makeTexture(context, source) {
    var tex = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, tex);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
    if (source) {
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA,
        context.UNSIGNED_BYTE, source);
    } else {
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, 1, 1, 0,
        context.RGBA, context.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    }
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.REPEAT);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    return tex;
  }

  function loadImages(context) {
    Object.keys(TEXTURE_FILES).forEach(function (key) {
      var img = new Image();
      img.onload = function () {
        try {
          context.bindTexture(context.TEXTURE_2D, glState.textures[key]);
          context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA,
            context.UNSIGNED_BYTE, img);
          // Power-of-two sources: mipmap for clean minification.
          context.generateMipmap(context.TEXTURE_2D);
          context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER,
            context.LINEAR_MIPMAP_LINEAR);
          glState.ready[key] = true;
        } catch (e) {
          // Tainted (file:// security) or driver failure: count it; the day
          // layer keeps the procedural fallback, extras stay disabled.
          glState.failed++;
        }
      };
      img.onerror = function () { glState.failed++; };
      img.src = TEXTURE_FILES[key];
    });
  }

  function drawEarthWebgl(ctx, cam, sun, rot, dpr) {
    var context = initWebgl();
    if (!context) return false;
    var S = Math.max(64, Math.round(cam.radiusPx * 2 * dpr));
    if (glState.canvas.width !== S || glState.canvas.height !== S) {
      glState.canvas.width = S;
      glState.canvas.height = S;
      context.viewport(0, 0, S, S);
    }

    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);
    var u = glState.uniforms;
    context.uniform3f(u.uEast, cam.east[0], cam.east[1], cam.east[2]);
    context.uniform3f(u.uNorth, cam.north[0], cam.north[1], cam.north[2]);
    context.uniform3f(u.uFwd, cam.fwd[0], cam.fwd[1], cam.fwd[2]);
    context.uniform3f(u.uSunDir, sun.x, sun.y, sun.z);
    context.uniform1f(u.uRot, rot);
    context.uniform1f(u.uRadiusPx, cam.radiusPx * dpr);
    context.uniform1f(u.uHasNight, glState.ready.night ? 1 : 0);
    context.uniform1f(u.uHasSpec, glState.ready.spec ? 1 : 0);

    var bindings = [["day", u.uDay], ["night", u.uNight], ["spec", u.uSpec]];
    for (var i = 0; i < bindings.length; i++) {
      context.activeTexture(context.TEXTURE0 + i);
      context.bindTexture(context.TEXTURE_2D, glState.textures[bindings[i][0]]);
      context.uniform1i(bindings[i][1], i);
    }
    context.drawArrays(context.TRIANGLE_STRIP, 0, 4);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(glState.canvas,
      cam.cx - cam.radiusPx, cam.cy - cam.radiusPx,
      cam.radiusPx * 2, cam.radiusPx * 2);
    ctx.restore();
    return true;
  }

  function drawEarth(ctx, cam, sun, rot, dpr, state) {
    if (drawEarthWebgl(ctx, cam, sun, rot, dpr)) return;
    drawSurfaceSoftware(ctx, cam, sun, rot, dpr);
  }

  // ---- Canvas-2D software fallback (documented: no-WebGL / file:// mode) ---------

  var surf = { size: 0, canvas: null, ctx: null, img: null, buf: null, key: "" };

  function drawSurfaceSoftware(ctx, cam, sun, rot, dpr) {
    var tex = Orbit.earthtex.build();
    var S = Math.max(64, Math.min(900, Math.round(cam.radiusPx * 2 * dpr)));
    // Re-shade only when an input actually changed; repeat frames blit the
    // cached sphere (keeps pauses and menu interactions at zero shade cost).
    var key = S + "|" + sun.x.toFixed(4) + "," + sun.y.toFixed(4) + "," +
      sun.z.toFixed(4) + "|" + rot.toFixed(4) + "|" + view.lonDeg.toFixed(2) +
      "," + view.latDeg.toFixed(2) + "|" + (tex.naturalRaster ? "ne" : "pr");
    if (surf.size !== S) {
      surf.size = S;
      surf.canvas = surf.canvas || document.createElement("canvas");
      surf.canvas.width = S;
      surf.canvas.height = S;
      surf.ctx = surf.canvas.getContext("2d");
      surf.img = surf.ctx.createImageData(S, S);
      surf.buf = new Uint32Array(surf.img.data.buffer);
      surf.key = "";
    }
    if (surf.key !== key) {
      surf.key = key;
      shadeSurface(cam, sun, rot, tex, S);
      surf.ctx.putImageData(surf.img, 0, 0);
    }
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(surf.canvas,
      cam.cx - cam.radiusPx, cam.cy - cam.radiusPx,
      cam.radiusPx * 2, cam.radiusPx * 2);
    ctx.restore();
  }

  function shadeSurface(cam, sun, rot, tex, S) {
    var buf = surf.buf;
    var e = cam.east, n = cam.north, f = cam.fwd;
    var sx = sun.x, sy = sun.y, sz = sun.z;
    var hx = sx + f[0], hy = sy + f[1], hz = sz + f[2];
    var hl = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
    hx /= hl; hy /= hl; hz /= hl;
    var cr = Math.cos(rot), sr = Math.sin(rot);

    var TW = tex.width, TH = tex.height;
    var tp = tex.pixels, landM = tex.land;
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

        // Screen pixel -> display-frame surface normal.
        var ex = nx * e[0] + ny * n[0] + nz * f[0];
        var ey = nx * e[1] + ny * n[1] + nz * f[1];
        var ez = ny * n[2] + nz * f[2]; // east has no z component
        // Display -> ECEF for the texture lookup (identity in ECEF mode).
        var wx = cr * ex + sr * ey;
        var wy = -sr * ex + cr * ey;

        var lat = Math.asin(ez > 1 ? 1 : ez < -1 ? -1 : ez);
        var lon = Math.atan2(wy, wx);
        var tx = ((lon * INV_2PI + 0.5) * TW) | 0;
        if (tx < 0) tx = 0; else if (tx >= TW) tx = TW - 1;
        var ty = ((0.5 - lat * INV_PI) * TH) | 0;
        if (ty < 0) ty = 0; else if (ty >= TH) ty = TH - 1;
        var ti = ty * TW + tx;

        var c = tp[ti];
        var r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;

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
  }

  // ---- vector overlays -------------------------------------------------------------

  // Stroke an array of display-frame points as a polyline, breaking wherever
  // the segment crosses to the far hemisphere (depth <= 0).
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

  function rotateRing(ring, rot) {
    if (rot === 0) return ring;
    return ring.map(function (p) { return ecefToDisplay(p, rot); });
  }

  function drawCoastlines(ctx, cam, rot) {
    ctx.save();
    ctx.lineJoin = "round";
    coastlineRings().forEach(function (ring) {
      var displayRing = rotateRing(ring, rot);
      strokeFront(ctx, cam, displayRing, "rgba(3, 7, 10, 0.45)", 1.2);
      strokeFront(ctx, cam, displayRing, "rgba(200, 226, 232, 0.18)", 0.55);
    });
    ctx.restore();
  }

  function drawGraticule(ctx, cam, rot) {
    var style = "rgba(190, 205, 220, 0.10)";
    var strong = "rgba(190, 205, 220, 0.18)";
    var lat, lon, pts;
    for (lat = -60; lat <= 60; lat += 30) {
      pts = [];
      for (lon = -180; lon <= 180; lon += 6) {
        pts.push(ecefToDisplay(Orbit.data.llaToEcef(lat, lon, 0), rot));
      }
      strokeFront(ctx, cam, pts, lat === 0 ? strong : style, 1);
    }
    for (lon = -180; lon < 180; lon += 30) {
      pts = [];
      for (lat = -90; lat <= 90; lat += 6) {
        pts.push(ecefToDisplay(Orbit.data.llaToEcef(lat, lon, 0), rot));
      }
      strokeFront(ctx, cam, pts, lon === 0 ? strong : style, 1);
    }
  }

  // Warm glows where cities sit on the visible night side. The bundled night
  // texture already carries real city lights; these sprite glows reinforce
  // the largest cities and are the only night lights in fallback mode.
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

  function drawCityLights(ctx, cam, sun, rot) {
    // The GPU night-lights layer covers this when it is live.
    if (gl && glState && glState.ready.night) return;
    var sprite = ensureCitySprite();
    var size = Math.max(4, Math.min(10, cam.radiusPx * 0.032));
    Orbit.world.cities.forEach(function (city) {
      var v = Orbit.data.llaToEcef(city[1], city[0], 0);
      var d = (v.x * ecefSunX(sun, rot) + v.y * ecefSunY(sun, rot) + v.z * sun.z) / R;
      if (d >= -0.05) return; // in daylight or twilight
      var p = cam.project(ecefToDisplay(v, rot));
      if (p.depth <= 0) return;
      var dark = Math.min(1, (-d - 0.05) / 0.15);
      var limbFade = Math.min(1, (p.depth / R) * 3);
      ctx.globalAlpha = dark * limbFade * (0.35 + 0.65 * city[2]);
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;
  }

  // Sun direction expressed in ECEF given the display-frame sun and the
  // display->ECEF rotation (used for lat/lon-space lighting tests).
  function ecefSunX(sun, rot) {
    return Math.cos(rot) * sun.x + Math.sin(rot) * sun.y;
  }
  function ecefSunY(sun, rot) {
    return -Math.sin(rot) * sun.x + Math.cos(rot) * sun.y;
  }

  // Place a display-scaled Sun near the outer viewport in its true projected
  // direction. A literal 1-AU scene would make the body unusably small in an
  // Earth-centered view, so (like STK model scaling) distance and radius are
  // exaggerated while the Orekit direction, lighting, and subsolar point stay
  // authoritative.
  function sunIndicatorLayout(cam, sun, w, h) {
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
    var diskRadius = Math.max(30, Math.min(54, cam.radiusPx * 0.17));
    var glowRadius = diskRadius * 2.45;
    var margin = glowRadius + 8;
    var maxDistance = Infinity;
    if (Math.abs(ux) > 1e-6) {
      maxDistance = Math.min(maxDistance, ux > 0
        ? (w - margin - cam.cx) / ux : (margin - cam.cx) / ux);
    }
    if (Math.abs(uy) > 1e-6) {
      maxDistance = Math.min(maxDistance, uy > 0
        ? (h - margin - cam.cy) / uy : (margin - cam.cy) / uy);
    }
    var preferredDistance = Math.max(cam.radiusPx * 2.15, Math.min(w, h) * 0.43);
    var distance = Math.max(0, Math.min(preferredDistance, maxDistance));
    return {
      x: cam.cx + ux * distance,
      y: cam.cy + uy * distance,
      ux: ux,
      uy: uy,
      distance: distance,
      diskRadius: diskRadius,
      glowRadius: glowRadius,
      frontDot: frontDot,
    };
  }

  // STK-style scaled celestial body plus a subsolar surface marker when the
  // lit point faces the camera. The subsolar location comes from the same
  // source as the shading (backend samples when available).
  function drawSunIndicator(ctx, cam, sun, state, rot) {
    var sp = cam.project({ x: sun.x * R, y: sun.y * R, z: sun.z * R });
    var w = ctx.canvas.clientWidth || ctx.canvas.width;
    var h = ctx.canvas.clientHeight || ctx.canvas.height;
    var layout = sunIndicatorLayout(cam, sun, w, h);
    var sunX = layout.x, sunY = layout.y;
    var ux = layout.ux, uy = layout.uy;
    var diskRadius = layout.diskRadius;
    var glowRadius = layout.glowRadius;
    var frontDot = layout.frontDot;
    var rayAlpha = frontDot >= 0 ? 0.24 : 0.11;
    var diskAlpha = frontDot >= 0 ? 1 : 0.68;

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 218, 135, " + rayAlpha + ")";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(sunX - ux * (diskRadius + 8), sunY - uy * (diskRadius + 8));
    ctx.lineTo(cam.cx + ux * (cam.radiusPx + 10),
      cam.cy + uy * (cam.radiusPx + 10));
    ctx.stroke();
    ctx.setLineDash([]);

    // Broad corona and radial rays make the scaled body read as a distant
    // Sun rather than a map marker.
    for (var ray = 0; ray < 16; ray++) {
      var angle = ray * Math.PI / 8;
      var inner = diskRadius * 1.15;
      var outer = diskRadius * (ray % 2 === 0 ? 1.65 : 1.42);
      ctx.strokeStyle = "rgba(255, 213, 120, " + (0.28 * diskAlpha) + ")";
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * inner, sunY + Math.sin(angle) * inner);
      ctx.lineTo(sunX + Math.cos(angle) * outer, sunY + Math.sin(angle) * outer);
      ctx.stroke();
    }

    var glow = ctx.createRadialGradient(sunX, sunY, diskRadius * 0.15,
      sunX, sunY, glowRadius);
    glow.addColorStop(0, "rgba(255, 232, 165, " + (0.46 * diskAlpha) + ")");
    glow.addColorStop(0.38, "rgba(255, 181, 74, " + (0.22 * diskAlpha) + ")");
    glow.addColorStop(1, "rgba(255, 181, 74, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, glowRadius, 0, 2 * Math.PI);
    ctx.fill();

    var disk = ctx.createRadialGradient(sunX - diskRadius * 0.28,
      sunY - diskRadius * 0.28, diskRadius * 0.05,
      sunX, sunY, diskRadius);
    disk.addColorStop(0, "rgba(255, 248, 208, " + diskAlpha + ")");
    disk.addColorStop(0.7, "rgba(255, 204, 105, " + diskAlpha + ")");
    disk.addColorStop(1, "rgba(224, 126, 47, " + (0.95 * diskAlpha) + ")");
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(sunX, sunY, diskRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 224, 150, " + (0.85 * diskAlpha) + ")";
    ctx.font = "bold 10px Consolas, monospace";
    ctx.textAlign = ux >= 0 ? "right" : "left";
    ctx.textBaseline = "middle";
    var labelX = sunX + (ux >= 0 ? -(diskRadius + 12) : diskRadius + 12);
    ctx.fillText("SUN", labelX, sunY - 5);
    ctx.font = "8px Consolas, monospace";
    ctx.fillStyle = "rgba(255, 224, 150, " + (0.62 * diskAlpha) + ")";
    ctx.fillText("149.6M km  DISPLAY SCALE", labelX, sunY + 8);
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

  // Inertial orbit path from the ECI ephemeris (an ellipse in ECI mode; the
  // same curve swept into the rotating frame at the current instant in ECEF
  // mode). Preview satellites draw dimmer than authoritative ones.
  function drawOrbitTrack(ctx, cam, sat, state) {
    if (!sat.eci || sat.eci.length === 0) return;
    var pts = sat.eci.map(function (row) {
      return eciToDisplay({ x: row[0], y: row[1], z: row[2] }, state);
    });
    var alpha = sat.source === "preview" ? 0.45 : 0.8;
    strokeBack(ctx, cam, pts, hexA(sat.color, 0.14), 1);
    strokeFront(ctx, cam, pts, hexA(sat.color, alpha), 1.3);
  }

  // Ground track: the sub-satellite path, always Earth-fixed content.
  function drawGroundTrack(ctx, cam, sat, state, rot) {
    if (sat.t.length === 0) return;
    var pts = sat.lla.map(function (row) {
      return ecefToDisplay(Orbit.data.llaToEcef(row[0], row[1], 6), rot);
    });
    var alpha = sat.source === "preview" ? 0.3 : 0.5;
    strokeFront(ctx, cam, pts, hexA(sat.color, alpha), 1);
  }

  // Sunlit -> 1, Penumbra -> 0.65, Umbra -> 0.3, no eclipse data -> 1 (same
  // ramp apps/orbit-ui/src/three/viewer.js uses for its satellite markers).
  function eclipseDim(state, satName) {
    var lighting = Orbit.data.lightingStateAt(state.scn, satName, state.simSec);
    if (lighting === "Umbra") return 0.3;
    if (lighting === "Penumbra") return 0.65;
    return 1;
  }

  function drawSatMarker(ctx, cam, sat, state, selected) {
    var pos = satDisplayPosition(sat, state);
    if (!pos) return;
    var p = cam.project(pos);
    var front = p.depth > 0;
    if (!front && Math.hypot(p.x - cam.cx, p.y - cam.cy) < cam.radiusPx) return;
    var dim = eclipseDim(state, sat.name);
    if (sat.source === "preview") dim *= 0.75;

    ctx.fillStyle = hexA(sat.color, front ? dim : 0.35 * dim);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 5);
    ctx.lineTo(p.x + 5, p.y);
    ctx.lineTo(p.x, p.y + 5);
    ctx.lineTo(p.x - 5, p.y);
    ctx.closePath();
    ctx.fill();
    if (front) {
      ctx.fillStyle = hexA(sat.color, 0.18 * dim);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      if (optOn(state, "labels")) {
        label(ctx, p, sat.name + (sat.source === "preview" ? " (preview)" : ""),
          sat.color);
      }
    }
    if (selected) {
      ctx.strokeStyle = "#4fb8d1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  function drawGroundMarker(ctx, cam, gp, state, selected, rot) {
    var p = cam.project(ecefToDisplay(
      Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, gp.altM / 1000), rot));
    if (p.depth <= 0) return;
    var isAreaPoint = !!gp.group;
    ctx.fillStyle = gp.color;
    ctx.beginPath();
    if (isAreaPoint) {
      ctx.rect(p.x - 1.5, p.y - 1.5, 3, 3);
    } else if (gp.kind === "target") {
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
    // Area grid points are identified by their outline's label, not their
    // own - one label per point would bury the map.
    if (!isAreaPoint && optOn(state, "labels")) label(ctx, p, gp.name, "#aeb6c2");
  }

  // Area target rectangles: a dashed outline plus a centroid label, draped
  // just above the surface so the whole footprint reads as one object
  // instead of only its grid-point markers.
  function drawAreaOutlines(ctx, cam, state, rot) {
    if (!state.spec) return;
    var areas = Orbit.spec.groupTargets(state.spec.objects).areas;
    areas.forEach(function (group) {
      var areaMeta = group.points.length > 0 ? group.points[0].area : null;
      if (!areaMeta) return;
      var ring = Orbit.spec.areaRectRing(areaMeta).map(function (pt) {
        return ecefToDisplay(Orbit.data.llaToEcef(pt[1], pt[0], 0.4), rot);
      });
      var selected = state.selection === group.name;
      ctx.save();
      ctx.setLineDash([5, 4]);
      strokeFront(ctx, cam, ring, selected ? "rgba(79, 184, 209, 0.9)" : "rgba(95, 201, 143, 0.55)",
        selected ? 1.6 : 1.1);
      ctx.restore();
      var c = ecefToDisplay(Orbit.data.llaToEcef(
        areaMeta.centerLatDeg, areaMeta.centerLonDeg, 0.4), rot);
      var cp = cam.project(c);
      if (cp.depth > 0 && optOn(state, "labels")) label(ctx, cp, group.name, "#5fc98f");
    });
  }

  var SENSOR_IDLE = "#7fb4d8";
  var SENSOR_FOR = "#d8a75a";
  var SENSOR_TRACK = "#5fc98f";

  // True while the target is inside the instantaneous beam per the backend's
  // FOV windows (matches the Node console's cone coloring).
  function isFovActive(scn, platformName, targetName, tSec) {
    var hit = false;
    (scn.sensorAccesses || []).forEach(function (a) {
      if (hit || a.platform !== platformName || a.target !== targetName) return;
      hit = (a.fovWindows || []).some(function (w) {
        return tSec >= w.startSec && tSec <= w.stopSec;
      });
    });
    return hit;
  }

  // Sensor visuals for one satellite: instantaneous FOV footprint + cone
  // silhouette, home-anchored FOR envelope, and a boresight line clipped at
  // the ground. Follows the backend pointing samples when fresh, else the
  // client-side phase model (Orbit.sensorviz.boresightAt handles both).
  function drawSensorViz(ctx, cam, sat, state, rot) {
    if (!state.spec) return;
    var wantFov = optOn(state, "sensorFov");
    var wantFor = state.viewOptions && state.viewOptions.sensorFor === true;
    if (!wantFov && !wantFor) return;
    var specSat = null;
    state.spec.objects.forEach(function (o) {
      if (o.kind === "satellite" && o.name === sat.name) specSat = o;
    });
    if (!specSat || !specSat.sensor) return;
    var pos = Orbit.data.samplePosition(sat, state.simSec);
    if (!pos) return;
    // Physical geometry runs in true WGS84 ECEF kilometers.
    var satPos = Orbit.data.llaToEcefWgs84(pos.latDeg, pos.lonDeg, pos.altKm);
    var entries = Orbit.data.scheduleForPlatform(state.scn.schedule, sat.name)
      .filter(function (e) { return !e.stale; });
    var bore = Orbit.sensorviz.boresightAt({
      sat: sat, sensor: specSat.sensor, scn: state.scn, tSec: state.simSec,
      satPosEcef: satPos, entries: entries, spec: state.spec,
    });
    var satDisplay = satDisplayPosition(sat, state);

    if (wantFor) {
      // Field of regard: everything reachable within the gimbal limit around
      // the HOME boresight - deliberately not re-anchored on the live slew.
      var forRing = Orbit.sensorviz.footprintRing(
        satPos, bore.home, specSat.sensor.fieldOfRegardDeg || 60, 56);
      if (forRing) {
        paintFootprint(ctx, cam, forRing, rot, hexA2(SENSOR_FOR, 0.08),
          hexA2(SENSOR_FOR, 0.5), 1, [4, 4]);
      }
    }
    if (wantFov) {
      var phase = bore.pointing.phase;
      var targetName = bore.pointing.targetName ||
        (bore.pointing.entry ? bore.pointing.entry.target : "");
      var active = phase === "track" || phase === "scan";
      var fovActive = active && targetName &&
        isFovActive(state.scn, sat.name, targetName, state.simSec);
      // Idle: blue. Green only while the target is inside the instantaneous
      // beam (backend fovWindows); otherwise amber - slewing, returning, or
      // on-target but the beam has not swept it yet. Area scans have no
      // per-point fovWindows, so an active scan reads as in-view.
      var inView = fovActive || phase === "scan";
      var color = phase === "idle" ? SENSOR_IDLE
        : inView ? SENSOR_TRACK : SENSOR_FOR;
      var fovRing = Orbit.sensorviz.footprintRing(
        satPos, bore.dir, specSat.sensor.coneHalfAngleDeg || 20, 44);
      if (fovRing) {
        paintFootprint(ctx, cam, fovRing, rot, hexA2(color, 0.13),
          hexA2(color, 0.85), 1.3, null);
        drawConeSilhouette(ctx, cam, satDisplay, fovRing, rot, hexA2(color, 0.35));
      }
      // Boresight cue, clipped at the ground so it never spears the planet.
      var groundHit = Orbit.sensorviz.boresightGroundPoint(satPos, bore.dir);
      if (groundHit && satDisplay) {
        var lla = Orbit.data.ecefToLlaWgs84(groundHit.x, groundHit.y, groundHit.z);
        var end = ecefToDisplay(Orbit.data.llaToEcef(lla.latDeg, lla.lonDeg, 2), rot);
        var pa = cam.project(satDisplay);
        var pb = cam.project(end);
        if (pa.depth > 0 && pb.depth > 0) {
          ctx.save();
          ctx.strokeStyle = hexA2(color, phase === "slew" || phase === "return" ? 0.4 : 0.85);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // Physical WGS84 footprint -> display-sphere polygon: filled front-facing
  // region plus an outline; the horizon-clamped portion draws dashed.
  function paintFootprint(ctx, cam, ring, rot, fillStyle, strokeStyle, width, dash) {
    var display = ring.points.map(function (pt) {
      var lla = Orbit.data.ecefToLlaWgs84(pt.x, pt.y, pt.z);
      return cam.project(ecefToDisplay(
        Orbit.data.llaToEcef(lla.latDeg, lla.lonDeg, 3), rot));
    });
    // Fill only when every vertex is front-facing (avoids wrap-around fills).
    var allFront = display.every(function (p) { return p.depth > 0; });
    if (allFront && fillStyle) {
      ctx.save();
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      display.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    if (dash) ctx.setLineDash(dash);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = width;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i <= display.length; i++) {
      var p = display[i % display.length];
      if (p.depth <= 0) { started = false; continue; }
      if (started) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      started = true;
    }
    ctx.stroke();
    ctx.restore();
  }

  // Two silhouette edges from the satellite to the footprint's extreme
  // screen-space vertices - reads as a translucent cone without WebGL volume
  // rendering, and never crosses the planet because the rim points are on
  // the near-side ground.
  function drawConeSilhouette(ctx, cam, satDisplay, ring, rot, style) {
    if (!satDisplay) return;
    var apex = cam.project(satDisplay);
    if (apex.depth <= 0) return;
    var best = null, bestAngle = -1;
    var pts = [];
    ring.points.forEach(function (pt) {
      var lla = Orbit.data.ecefToLlaWgs84(pt.x, pt.y, pt.z);
      var p = cam.project(ecefToDisplay(
        Orbit.data.llaToEcef(lla.latDeg, lla.lonDeg, 3), rot));
      if (p.depth > 0) pts.push(p);
    });
    if (pts.length < 2) return;
    // The two rim points spanning the widest screen angle from the apex.
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var a1 = Math.atan2(pts[i].y - apex.y, pts[i].x - apex.x);
        var a2 = Math.atan2(pts[j].y - apex.y, pts[j].x - apex.x);
        var da = Math.abs(a1 - a2);
        if (da > Math.PI) da = 2 * Math.PI - da;
        if (da > bestAngle) { bestAngle = da; best = [pts[i], pts[j]]; }
      }
    }
    if (!best) return;
    ctx.save();
    ctx.strokeStyle = style;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(apex.x, apex.y);
    ctx.lineTo(best[0].x, best[0].y);
    ctx.moveTo(apex.x, apex.y);
    ctx.lineTo(best[1].x, best[1].y);
    ctx.stroke();
    ctx.restore();
  }

  // Dashed sat->ground lines for accesses active at the current time; stale
  // pairs draw dimmer so edited scenarios do not present old geometry as
  // current truth.
  function drawAccessLines(ctx, cam, scn, state, rot) {
    scn.accesses.forEach(function (acc) {
      var live = acc.windows.some(function (win) {
        return state.simSec >= win.startSec && state.simSec <= win.stopSec;
      });
      if (!live) return;
      var sat = findByName(scn.sats, acc.source) || findByName(scn.sats, acc.target);
      var gp = findByName(scn.grounds, acc.target) || findByName(scn.grounds, acc.source);
      if (!sat || !gp) return;
      var a = satDisplayPosition(sat, state);
      if (!a) return;
      var b = ecefToDisplay(Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, gp.altM / 1000), rot);
      var pa = cam.project(a), pb = cam.project(b);
      if (pa.depth <= 0 || pb.depth <= 0) return;
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = acc.stale ? "rgba(95, 201, 143, 0.3)" : "rgba(95, 201, 143, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
      ctx.restore();
    });
  }

  function findByName(list, name) {
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i];
    return null;
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

  // hexA that also accepts the sensor palette constants.
  function hexA2(hex, alpha) { return hexA(hex, alpha); }

  // Screen pixel -> lat/lon on the visible sphere surface, or null when the
  // point falls outside the globe disc. Powers double-click-to-recenter.
  // The returned lat/lon are Earth-fixed (geographic) in both frame modes.
  function screenToLatLon(canvas, x, y, state) {
    var cam = makeCamera(canvas.clientWidth, canvas.clientHeight);
    var nx = (x - cam.cx) / cam.radiusPx;
    var ny = -(y - cam.cy) / cam.radiusPx;
    var d2 = nx * nx + ny * ny;
    if (d2 > 1) return null;
    var nz = Math.sqrt(1 - d2);
    var e = cam.east, n = cam.north, f = cam.fwd;
    var ex = nx * e[0] + ny * n[0] + nz * f[0];
    var ey = nx * e[1] + ny * n[1] + nz * f[1];
    var ez = ny * n[2] + nz * f[2];
    var rot = state ? earthRotation(state) : 0;
    var ecef = ecefToDisplay({ x: ex, y: ey, z: ez }, -rot);
    return Orbit.data.ecefToLla(ecef.x, ecef.y, ecef.z);
  }

  var DEFAULT_VIEW = { lonDeg: -95, latDeg: 28, zoom: 1 };

  function resetView() {
    view.lonDeg = DEFAULT_VIEW.lonDeg;
    view.latDeg = DEFAULT_VIEW.latDeg;
    view.zoom = DEFAULT_VIEW.zoom;
  }

  // Recenter the view under a lat/lon without changing zoom (double-click
  // interaction; also used by "look at" from the inspector/tree later).
  function lookAt(latDeg, lonDeg) {
    view.lonDeg = lonDeg;
    view.latDeg = Math.max(-85, Math.min(85, latDeg));
  }

  // Nearest front-facing object within 14 px, or null.
  function hitTest(canvas, x, y, state) {
    var scn = state.scn;
    if (!scn) return null;
    var cam = makeCamera(canvas.clientWidth, canvas.clientHeight);
    var rot = earthRotation(state);
    var best = null, bestD = 14;
    scn.sats.forEach(function (sat) {
      var pos = satDisplayPosition(sat, state);
      if (!pos) return;
      var p = cam.project(pos);
      if (p.depth <= 0) return;
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = sat; bestD = d; }
    });
    scn.grounds.forEach(function (gp) {
      var p = cam.project(ecefToDisplay(
        Orbit.data.llaToEcef(gp.latDeg, gp.lonDeg, 0), rot));
      if (p.depth <= 0) return;
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { best = gp; bestD = d; }
    });
    return best;
  }

  // Drag-to-rotate / wheel-to-zoom. Suppresses the click-select that follows
  // a real drag via the returned wasDragged() check.
  function attach(canvas, getState) {
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
      view.zoom = Math.max(0.45, Math.min(8, view.zoom * Math.exp(-ev.deltaY * 0.0012)));
    }, { passive: false });
    // Double-click any point on the globe to recenter the view under it.
    canvas.addEventListener("dblclick", function (ev) {
      var r = canvas.getBoundingClientRect();
      var ll = screenToLatLon(canvas, ev.clientX - r.left, ev.clientY - r.top,
        getState ? getState() : null);
      if (ll) lookAt(ll.latDeg, ll.lonDeg);
    });
    return { wasDragged: function () { return moved; } };
  }

  Orbit.globe3d = {
    draw: draw,
    hitTest: hitTest,
    attach: attach,
    view: view,
    resetView: resetView,
    lookAt: lookAt,
    screenToLatLon: screenToLatLon,
    // exposed for the self tests
    frameMode: frameMode,
    earthRotation: earthRotation,
    sunIndicatorLayout: sunIndicatorLayout,
    webglAvailable: function () { return !!initWebgl(); },
  };
})();
