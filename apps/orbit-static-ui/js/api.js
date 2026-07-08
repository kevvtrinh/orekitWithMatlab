// Orbit.api - talks to the MATLAB bridge (launchOrbitStaticUi) when one is
// serving this page, and falls back to bundled sample data when there isn't:
//   1. GET  {base}/api/scenario       - live or sample payload from MATLAB
//   2. GET  data/sample-scenario.json - static hosting without the bridge
//   3. window.ORBIT_SAMPLE_SCENARIO   - file:// (fetch blocked entirely)
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  // Same-origin when served over http (the MATLAB bridge serves both the
  // files and /api). Direct file:// opens intentionally stay offline:
  // browser CORS rules block file pages from using the localhost bridge.
  var isFileMode = window.location.protocol === "file:";
  var base = "";

  function fetchJson(url, options, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 8000);
    var opts = Object.assign({ signal: ctrl.signal, cache: "no-store" }, options || {});
    return fetch(url, opts).then(function (res) {
      return res.text().then(function (text) {
        var body = null;
        try { body = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON */ }
        if (!res.ok) {
          var msg = (body && (body.error || body.message)) ||
            ("HTTP " + res.status + " from " + url);
          throw new Error(msg);
        }
        return body;
      });
    }).finally(function () { clearTimeout(timer); });
  }

  // Resolves to health info when the bridge answers, null when it doesn't.
  function detectBridge() {
    if (isFileMode) return Promise.resolve(null);
    return fetchJson(base + "/api/health", null, 2500)
      .then(function (health) { return health && health.ok ? health : null; })
      .catch(function () { return null; });
  }

  // Resolves to { source, scenario } using the fallback chain above.
  function loadScenario(bridgeAvailable) {
    if (bridgeAvailable) {
      return fetchJson(base + "/api/scenario").then(function (res) {
        return { source: res.source || "matlab", scenario: res.scenario };
      });
    }
    if (isFileMode && window.ORBIT_SAMPLE_SCENARIO) {
      return Promise.resolve({
        source: "sample (embedded)",
        scenario: window.ORBIT_SAMPLE_SCENARIO,
      });
    }
    return fetchJson("data/sample-scenario.json", null, 4000)
      .then(function (scenario) {
        return { source: "sample", scenario: scenario };
      })
      .catch(function () {
        if (window.ORBIT_SAMPLE_SCENARIO) {
          return { source: "sample (embedded)", scenario: window.ORBIT_SAMPLE_SCENARIO };
        }
        throw new Error("No scenario data available (fetch blocked and no embedded sample).");
      });
  }

  // Resolves to the stored editable spec; rejects when none is stored yet
  // (404 until the first PUT or run).
  function fetchSpec() {
    return fetchJson(base + "/api/spec").then(function (res) {
      return res && res.spec ? res.spec : null;
    });
  }

  // The body is the bare spec document (no {"spec": ...} wrapper): the MATLAB
  // bridge stores bare documents verbatim, so the JSON survives without a
  // jsondecode/jsonencode round trip reshaping arrays.
  function saveSpec(spec) {
    return fetchJson(base + "/api/spec", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    });
  }

  // Synchronous MATLAB jobs: the response arrives when propagation finishes,
  // so give these calls a generous timeout (Orekit init can take a while).
  var RUN_TIMEOUT_MS = 10 * 60 * 1000;

  function runDemo() {
    return fetchJson(base + "/api/run-demo", { method: "POST" }, RUN_TIMEOUT_MS);
  }

  function runScenario(spec) {
    return fetchJson(base + "/api/run-scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    }, RUN_TIMEOUT_MS);
  }

  // Browser-side file download of a JSON-able value (works over file:// too).
  function downloadJson(filename, value) {
    var blob = new Blob([JSON.stringify(value, null, 2)],
      { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  Orbit.api = {
    base: base,
    detectBridge: detectBridge,
    loadScenario: loadScenario,
    fetchSpec: fetchSpec,
    saveSpec: saveSpec,
    runDemo: runDemo,
    runScenario: runScenario,
    downloadJson: downloadJson,
  };
})();
