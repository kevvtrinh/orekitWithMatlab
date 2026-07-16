// Orbit.sensorfor - sensor/area access projection helpers and az/el canvas.
// Projection samples come from MATLAB/Orekit; this module only selects the
// current sample and renders the sensor field-of-regard coordinate view.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  function findProjection(scn, request) {
    if (!scn || !request) return null;
    var platform = request.platformName != null
      ? request.platformName : request.sourceName;
    for (var i = 0; i < scn.areaSensorAccesses.length; i++) {
      var entry = scn.areaSensorAccesses[i];
      if (entry.platform === platform && entry.target === request.targetName &&
          (!request.sensorName || !entry.sensor || entry.sensor === request.sensorName)) {
        return entry;
      }
    }
    return null;
  }

  function nearestSample(samples, simSec) {
    if (!samples || samples.length === 0) return null;
    var best = samples[0];
    var distance = Math.abs(best.tSec - simSec);
    for (var i = 1; i < samples.length; i++) {
      var candidateDistance = Math.abs(samples[i].tSec - simSec);
      if (candidateDistance < distance) {
        best = samples[i];
        distance = candidateDistance;
      }
    }
    return best;
  }

  function viewModel(entry, simSec) {
    if (!entry || !entry.projectionWindows || entry.projectionWindows.length === 0) {
      return { entry: entry || null, window: null, sample: null, active: false,
        windowIndex: -1 };
    }
    var bestWindow = entry.projectionWindows[0];
    var bestIndex = 0;
    var bestDistance = Infinity;
    var active = false;
    entry.projectionWindows.forEach(function (window, index) {
      var distance = simSec < window.startSec
        ? window.startSec - simSec
        : (simSec > window.stopSec ? simSec - window.stopSec : 0);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestWindow = window;
        bestIndex = index;
        active = distance === 0;
      }
    });
    return {
      entry: entry,
      window: bestWindow,
      sample: nearestSample(bestWindow.samples, simSec),
      active: active,
      windowIndex: bestIndex,
    };
  }

  function fitCanvas(canvas) {
    var dpr = Math.max(window.devicePixelRatio || 1, 1);
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width * dpr));
    var height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: rect.width, height: rect.height };
  }

  function draw(canvas, entry, simSec, dirty) {
    if (!canvas) return;
    var fitted = fitCanvas(canvas);
    var ctx = fitted.ctx, width = fitted.width, height = fitted.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#101215";
    ctx.fillRect(0, 0, width, height);

    var model = viewModel(entry, simSec);
    var margin = { left: 58, right: 22, top: 30, bottom: 44 };
    var plotW = Math.max(width - margin.left - margin.right, 1);
    var plotH = Math.max(height - margin.top - margin.bottom, 1);
    function x(az) { return margin.left + ((az + 180) / 360) * plotW; }
    function y(el) { return margin.top + ((90 - el) / 90) * plotH; }

    var forDeg = entry ? Math.max(0, Math.min(180, entry.fieldOfRegardDeg)) : 0;
    var fovDeg = entry ? Math.max(0, Math.min(90, entry.coneHalfAngleDeg)) : 0;
    var forFloor = Math.max(0, 90 - forDeg);
    var fovFloor = Math.max(0, 90 - fovDeg);

    // Reachable FOR and instantaneous FOV bands around +Z / elevation 90.
    if (entry) {
      ctx.fillStyle = "rgba(199, 125, 219, 0.09)";
      ctx.fillRect(margin.left, y(90), plotW, y(forFloor) - y(90));
      ctx.fillStyle = "rgba(79, 184, 209, 0.08)";
      ctx.fillRect(margin.left, y(90), plotW, y(fovFloor) - y(90));
    }

    ctx.font = '10px "Cascadia Code", Consolas, monospace';
    ctx.lineWidth = 1;
    for (var az = -180; az <= 180; az += 30) {
      ctx.strokeStyle = az === 0 ? "#46505d" : "#272c33";
      ctx.beginPath(); ctx.moveTo(x(az), margin.top); ctx.lineTo(x(az), y(0)); ctx.stroke();
      ctx.fillStyle = "#737b87";
      ctx.textAlign = "center";
      ctx.fillText(String(az), x(az), height - 23);
    }
    for (var el = 0; el <= 90; el += 10) {
      ctx.strokeStyle = el === forFloor || el === fovFloor ? "#3d4651" : "#272c33";
      ctx.beginPath(); ctx.moveTo(margin.left, y(el)); ctx.lineTo(width - margin.right, y(el));
      ctx.stroke();
      ctx.fillStyle = "#737b87";
      ctx.textAlign = "right";
      ctx.fillText(String(el), margin.left - 8, y(el) + 3);
    }
    ctx.strokeStyle = "#4b535f";
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);
    ctx.fillStyle = "#8d94a0";
    ctx.textAlign = "center";
    ctx.fillText("SENSOR AZIMUTH (DEG)", margin.left + plotW / 2, height - 7);
    ctx.save();
    ctx.translate(13, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("SENSOR ELEVATION (DEG)", 0, 0);
    ctx.restore();

    if (!entry) {
      centerMessage(ctx, width, height, "Choose a sensor / area access request.");
      return;
    }
    if (!model.sample) {
      centerMessage(ctx, width, height,
        dirty ? "Re-run MATLAB / Orekit to project this edited request."
              : "No FOR access window was found for this sensor and area.");
      return;
    }

    // Representative outlines reveal the total angular sweep for this pass.
    var samples = model.window.samples || [];
    var stride = Math.max(1, Math.ceil(samples.length / 24));
    ctx.strokeStyle = "rgba(224, 112, 92, 0.18)";
    ctx.lineWidth = 1;
    for (var si = 0; si < samples.length; si += stride) {
      drawSegments(ctx, samples[si].boundarySegments, x, y, false);
    }

    ctx.fillStyle = "rgba(224, 112, 92, 0.25)";
    ctx.strokeStyle = "#ef7d68";
    ctx.lineWidth = 2;
    drawSegments(ctx, model.sample.boundarySegments, x, y, true);

    if (model.sample.commandAzimuthDeg != null &&
        model.sample.commandElevationDeg != null) {
      var cx = x(model.sample.commandAzimuthDeg);
      var cy = y(model.sample.commandElevationDeg);
      ctx.strokeStyle = model.sample.commandInsideFor ? "#4fb8d1" : "#e0a43c";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke();
    }

    ctx.textAlign = "left";
    ctx.font = '11px "Cascadia Code", Consolas, monospace';
    ctx.fillStyle = model.active ? "#5fc98f" : "#e0a43c";
    ctx.fillText((model.active ? "LIVE PASS" : "NEAREST PASS") +
      "  " + (model.windowIndex + 1) + "/" + entry.projectionWindows.length,
      margin.left + 8, margin.top + 16);
    if (dirty) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#e0a43c";
      ctx.fillText("STALE - RE-RUN", width - margin.right - 8, margin.top + 16);
    }
  }

  function drawSegments(ctx, segments, x, y, fill) {
    (segments || []).forEach(function (segment) {
      if (!segment || segment.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(x(segment[0][0]), y(segment[0][1]));
      for (var i = 1; i < segment.length; i++) {
        ctx.lineTo(x(segment[i][0]), y(segment[i][1]));
      }
      if (fill && segment.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
    });
  }

  function centerMessage(ctx, width, height, message) {
    ctx.fillStyle = "#8d94a0";
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(message, width / 2, height / 2);
  }

  Orbit.sensorfor = {
    findProjection: findProjection,
    nearestSample: nearestSample,
    viewModel: viewModel,
    draw: draw,
  };
})();
