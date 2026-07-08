// Orbit.earthtex - local, offline Earth texture service. The preferred layer
// is a checked-in Natural Earth shaded-relief raster color-graded for the dark
// mission console. A deterministic procedural texture is built immediately as
// a fallback, so file:// and slow-image-load cases still render. The returned
// object is stable; when the raster image finishes loading its canvas/pixels
// are replaced in place and the normal animation loop picks up the upgrade.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var W = 2048, H = 1024;
  var RASTER_URL = "assets/earth-natural-2048.jpg";
  var cache = null;

  // ---- deterministic value noise -------------------------------------------

  // Integer lattice hash -> [0, 1). Fixed constants, no Math.random anywhere.
  function hash(ix, iy, salt) {
    var h = (ix | 0) * 374761393 + (iy | 0) * 668265263 + (salt | 0) * 2246822519;
    h = (h ^ (h >>> 13)) | 0;
    h = (h * 1274126177) | 0;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  }

  // Smoothed value noise; x wraps with period `freq` so the texture is
  // seamless across the dateline (u in [0,1) spans the full 360 deg).
  function noise(u, v, freq, salt) {
    var xf = u * freq, yf = v * freq;
    var x0 = Math.floor(xf), y0 = Math.floor(yf);
    var tx = xf - x0, ty = yf - y0;
    var sx = tx * tx * (3 - 2 * tx);
    var sy = ty * ty * (3 - 2 * ty);
    var xa = ((x0 % freq) + freq) % freq;
    var xb = (xa + 1) % freq;
    var a = hash(xa, y0, salt), b = hash(xb, y0, salt);
    var c = hash(xa, y0 + 1, salt), d = hash(xb, y0 + 1, salt);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  function fbm(u, v, octaves, baseFreq, salt) {
    var sum = 0, amp = 0.5, freq = baseFreq;
    for (var i = 0; i < octaves; i++) {
      sum += amp * noise(u, v, freq, salt + i * 101);
      amp *= 0.5;
      freq *= 2;
    }
    return sum; // ~[0, 1)
  }

  // ---- mask rasterization ----------------------------------------------------

  function polyPath(ctx, rings) {
    ctx.beginPath();
    rings.forEach(function (ring) {
      ring.forEach(function (pt, i) {
        var x = ((pt[0] + 180) / 360) * W;
        var y = ((90 - pt[1]) / 180) * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
    });
  }

  // Returns Uint8Array W*H: 255 on land, 0 on ocean/lake.
  function rasterizeLandMask() {
    var cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    polyPath(ctx, Orbit.world.landPolygons);
    ctx.fill();
    ctx.fillStyle = "#000";
    polyPath(ctx, Orbit.world.waterPolygons);
    ctx.fill();
    var data = ctx.getImageData(0, 0, W, H).data;
    var mask = new Uint8Array(W * H);
    for (var i = 0; i < W * H; i++) mask[i] = data[i * 4] > 127 ? 255 : 0;
    return mask;
  }

  // Separable box blur with horizontal wrap (the map is periodic in x).
  // src is Uint8Array/Float32Array; returns Float32Array in [0, 255].
  function boxBlur(src, radius, passes) {
    var a = new Float32Array(src);
    var b = new Float32Array(W * H);
    var span = 2 * radius + 1;
    for (var p = 0; p < passes; p++) {
      // horizontal (wrapped)
      for (var y = 0; y < H; y++) {
        var row = y * W;
        var sum = 0, x;
        for (x = -radius; x <= radius; x++) sum += a[row + ((x + W) % W)];
        for (x = 0; x < W; x++) {
          b[row + x] = sum / span;
          sum += a[row + ((x + radius + 1) % W)] - a[row + ((x - radius + W) % W)];
        }
      }
      // vertical (clamped)
      for (var x2 = 0; x2 < W; x2++) {
        var sum2 = 0, y2;
        for (y2 = -radius; y2 <= radius; y2++) {
          sum2 += b[Math.min(H - 1, Math.max(0, y2)) * W + x2];
        }
        for (y2 = 0; y2 < H; y2++) {
          a[y2 * W + x2] = sum2 / span;
          var yAdd = Math.min(H - 1, y2 + radius + 1);
          var ySub = Math.max(0, y2 - radius);
          sum2 += b[yAdd * W + x2] - b[ySub * W + x2];
        }
      }
    }
    return a;
  }

  // ---- color composition -----------------------------------------------------

  function mix(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function clamp255(v) {
    return v < 0 ? 0 : v > 255 ? 255 : v | 0;
  }

  function colorGradeNaturalEarth(img, target) {
    var px = img.data;
    var land = target.land;
    var shelf = target.shelf;
    var coast = target.coastNear;
    var rgb = [0, 0, 0];

    for (var y = 0; y < H; y++) {
      var lat = 90 - ((y + 0.5) / H) * 180;
      var latAbs = Math.abs(lat);
      var polar = clamp01((latAbs - 48) / 42);
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        var k = i * 4;
        var r = px[k], g = px[k + 1], b = px[k + 2];
        var lum = r * 0.299 + g * 0.587 + b * 0.114;

        if (land[i]) {
          // Use the real shaded-relief color as the base, then pull it toward
          // the restrained contrast of an operations display.
          var contrast = 1.12;
          r = (r - 118) * contrast + 118;
          g = (g - 118) * contrast + 118;
          b = (b - 118) * contrast + 118;
          r = mix(22, r, 0.90);
          g = mix(28, g, 0.91);
          b = mix(24, b, 0.88);

          // Keep high latitude ice readable without turning the globe flat.
          if (latAbs > 62 && lum > 150) {
            var ice = clamp01((latAbs - 62) / 18) * clamp01((lum - 145) / 70);
            r = mix(r, 226, ice * 0.55);
            g = mix(g, 232, ice * 0.55);
            b = mix(b, 236, ice * 0.55);
          }

          // Slight wet coastal edge, but far less cartoonish than the old band.
          var edge = 1 - coast[i] / 255;
          if (edge > 0.25) {
            var wet = clamp01((edge - 0.25) / 0.6) * 0.22;
            r = mix(r, 112, wet);
            g = mix(g, 126, wet);
            b = mix(b, 106, wet);
          }
        } else {
          // Natural Earth II focuses on land cover. Rebuild the water layer
          // with a dark ocean, shelf gradient, and slight relief inherited
          // from the source luma so coastlines have depth.
          var depth = clamp01(shelf[i] / 255 * 2.4);
          var src = clamp01((lum - 70) / 150);
          r = mix(mix(4, 8, polar), 28, depth) + src * 5;
          g = mix(mix(28, 24, polar), 78, depth) + src * 7;
          b = mix(mix(62, 54, polar), 120, depth) + src * 10;
          if (lat > 73 + src * 4) {
            var pack = clamp01((lat - 72) / 9);
            r = mix(r, 218, pack);
            g = mix(g, 228, pack);
            b = mix(b, 234, pack);
          }
        }

        rgb[0] = r; rgb[1] = g; rgb[2] = b;
        px[k] = clamp255(rgb[0]);
        px[k + 1] = clamp255(rgb[1]);
        px[k + 2] = clamp255(rgb[2]);
        px[k + 3] = 255;
      }
    }
  }

  function loadNaturalEarth(target) {
    if (target.loadingRaster || target.naturalRaster) return;
    target.loadingRaster = true;
    var img = new Image();
    img.onload = function () {
      try {
        var cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        var c = cv.getContext("2d");
        c.drawImage(img, 0, 0, W, H);
        var imageData = c.getImageData(0, 0, W, H);
        colorGradeNaturalEarth(imageData, target);
        target.canvas.getContext("2d").putImageData(imageData, 0, 0);
        target.imageData = imageData;
        target.pixels = new Uint32Array(imageData.data.buffer);
        target.naturalRaster = true;
      } catch (e) {
        target.rasterError = e && e.message ? e.message : String(e);
      }
    };
    img.onerror = function () {
      target.rasterError = "Could not load " + RASTER_URL;
    };
    img.src = RASTER_URL;
  }

  // Land color by "climate latitude" (latitude jittered by a moisture field)
  // plus elevation. Bands, poleward: tropics, savanna, subtropic desert belt,
  // temperate, boreal, tundra, snow.
  function landColor(latAbs, moisture, elev, out) {
    var latj = latAbs + (moisture - 0.5) * 14;
    var r, g, b;
    if (latj < 10) {          // tropical rainforest
      r = 44; g = 86; b = 40;
    } else if (latj < 20) {   // savanna transition
      var t0 = (latj - 10) / 10;
      r = mix(44, 128, t0); g = mix(86, 116, t0); b = mix(40, 62, t0);
    } else if (latj < 34) {   // subtropical desert belt vs scrub
      if (moisture < 0.52) { r = 196; g = 170; b = 118; }
      else { r = 122; g = 118; b = 66; }
    } else if (latj < 50) {   // temperate
      var t1 = (latj - 34) / 16;
      r = mix(92, 74, t1); g = mix(112, 96, t1); b = mix(58, 56, t1);
    } else if (latj < 62) {   // boreal forest
      r = 58; g = 80; b = 54;
    } else if (latj < 71) {   // tundra
      var t2 = (latj - 62) / 9;
      r = mix(112, 150, t2); g = mix(104, 146, t2); b = mix(84, 134, t2);
    } else {                  // permanent snow
      r = 228; g = 232; b = 236;
    }
    // Elevation: highlands go rocky, high peaks outside the tropics go white.
    if (elev > 0.58) {
      var rock = clamp01((elev - 0.58) / 0.2);
      r = mix(r, 128, rock); g = mix(g, 116, rock); b = mix(b, 104, rock);
    }
    if (elev > 0.72 && latAbs > 20) {
      var snow = clamp01((elev - 0.72) / 0.12);
      r = mix(r, 232, snow); g = mix(g, 236, snow); b = mix(b, 240, snow);
    }
    out[0] = r; out[1] = g; out[2] = b;
  }

  function build() {
    if (cache) return cache;

    var land = rasterizeLandMask();
    // Narrow blur: coastal blending. Wide blur: continental-shelf rim.
    var coastNear = boxBlur(land, 2, 2);
    var shelf = boxBlur(land, 7, 2);

    var elev = new Float32Array(W * H);
    var moist = new Float32Array(W * H);
    var cloud = new Uint8Array(W * H);
    var i, x, y, u, v;

    for (y = 0; y < H; y++) {
      v = (y + 0.5) / H;
      for (x = 0; x < W; x++) {
        i = y * W + x;
        u = (x + 0.5) / W;
        elev[i] = fbm(u, v, 6, 10, 7);
        moist[i] = fbm(u, v, 4, 6, 91);
        var c = fbm(u, v, 5, 8, 173);
        var stormTrack = clamp01(1 - Math.abs(Math.abs(90 - v * 180) - 45) / 30);
        cloud[i] = Math.round(clamp01((c - 0.57) * 2.7) * 255 * (0.45 + stormTrack * 0.55));
      }
    }

    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(W, H);
    var px = img.data;
    var rgb = [0, 0, 0];

    for (y = 0; y < H; y++) {
      var lat = 90 - ((y + 0.5) / H) * 180;
      var latAbs = Math.abs(lat);
      for (x = 0; x < W; x++) {
        i = y * W + x;
        var e = elev[i];
        var m = moist[i];
        var r, g, b;

        if (land[i]) {
          landColor(latAbs, m, e, rgb);
          r = rgb[0]; g = rgb[1]; b = rgb[2];
          // Relief: hillshade from the elevation gradient, lit from the NW.
          var gx = elev[y * W + ((x + 2) % W)] - elev[y * W + ((x - 2 + W) % W)];
          var gy = elev[Math.min(H - 1, y + 2) * W + x] - elev[Math.max(0, y - 2) * W + x];
          var shade = clamp01(0.5 + (gx + gy) * 3.2);
          var lit = mix(1.14, 0.72, shade);
          r *= lit; g *= lit; b *= lit;
          // Blend the immediate coastline toward wet sand.
          var edge = 1 - coastNear[i] / 255;
          if (edge > 0.25) {
            var t = clamp01((edge - 0.25) / 0.5) * 0.4;
            r = mix(r, 140, t); g = mix(g, 138, t); b = mix(b, 110, t);
          }
        } else {
          // Ocean: deep basin -> shelf rim near coasts, cooler toward poles.
          var depth = clamp01(shelf[i] / 255 * 2.2);       // 0 deep, 1 coast
          var polar = clamp01((latAbs - 35) / 55);
          r = mix(mix(9, 6, polar), 26, depth);
          g = mix(mix(30, 24, polar), 74, depth);
          b = mix(mix(58, 48, polar), 104, depth);
          // Bathymetry texture: faint large-scale variation.
          var bath = (e - 0.5) * 14;
          g += bath; b += bath * 1.4;
          // Arctic pack ice with a noisy margin (Antarctica is land-filled).
          var iceLat = 74 + (m - 0.5) * 8;
          if (lat > iceLat) {
            var ice = clamp01((lat - iceLat) / 4);
            r = mix(r, 218, ice); g = mix(g, 226, ice); b = mix(b, 232, ice);
          }
        }

        var k = i * 4;
        px[k] = Math.max(0, Math.min(255, r | 0));
        px[k + 1] = Math.max(0, Math.min(255, g | 0));
        px[k + 2] = Math.max(0, Math.min(255, b | 0));
        px[k + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    cache = {
      width: W,
      height: H,
      canvas: canvas,
      // Uint32 view over the same RGBA bytes (little-endian ABGR packing),
      // for fast per-pixel sampling by the 3D globe shader.
      pixels: new Uint32Array(img.data.buffer),
      land: land,
      cloud: cloud,
      shelf: shelf,
      coastNear: coastNear,
      naturalRaster: false,
      rasterError: null,
    };
    loadNaturalEarth(cache);
    return cache;
  }

  Orbit.earthtex = { build: build };
})();
