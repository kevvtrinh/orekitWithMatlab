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

  // Diagnostic error kinds distinguish *why* a call failed, so the UI (status
  // messages, the worker/log panel) can say more than "something went wrong":
  //   "timeout"   - no response before the deadline (bridge likely hung/busy)
  //   "network"   - fetch itself failed (no bridge listening / CORS / file://)
  //   "http"      - the bridge answered with a non-2xx status
  //   "malformed" - a 2xx response whose body was not valid/expected JSON
  function taggedError(message, kind) {
    var err = new Error(message);
    err.kind = kind;
    return err;
  }

  function fetchJson(url, options, timeoutMs) {
    var ctrl = new AbortController();
    var timedOut = false;
    var timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, timeoutMs || 8000);
    var opts = Object.assign({ signal: ctrl.signal, cache: "no-store" }, options || {});
    return fetch(url, opts).then(function (res) {
      return res.text().then(function (text) {
        var body = null, parseFailed = false;
        try { body = text ? JSON.parse(text) : null; } catch (e) { parseFailed = true; }
        if (!res.ok) {
          var msg = (body && (body.error || body.message)) ||
            ("HTTP " + res.status + " from " + url);
          throw taggedError(msg, "http");
        }
        if (parseFailed) {
          throw taggedError("Malformed JSON response from " + url, "malformed");
        }
        return body;
      });
    }).catch(function (err) {
      if (err && err.kind) throw err; // already classified above
      if (err && err.name === "AbortError") {
        throw taggedError(
          (timedOut ? "Timed out waiting for " : "Request cancelled: ") + url, "timeout");
      }
      throw taggedError(
        "Cannot reach " + url + " (" + ((err && err.message) || err) + ")", "network");
    }).finally(function () { clearTimeout(timer); });
  }

  // Resolves to health info when the bridge answers, null when it doesn't.
  function detectBridge() {
    if (isFileMode) return Promise.resolve(null);
    return fetchJson(base + "/api/health", null, 2500)
      .then(function (health) { return health && health.ok ? health : null; })
      .catch(function () { return null; });
  }

  // Resolves to { source, scenario } from the bundled sample, trying (in
  // order) the embedded copy (file:// - fetch of local JSON is blocked), the
  // static JSON file, then falling back to the embedded copy if that fetch
  // fails for some other reason (e.g. a restrictive browser context).
  function loadSampleScenario() {
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
        throw taggedError(
          "No scenario data available (fetch blocked and no embedded sample).", "malformed");
      });
  }

  // Resolves to { source, scenario } using the fallback chain above.
  function loadScenario(bridgeAvailable) {
    if (bridgeAvailable) {
      return fetchJson(base + "/api/scenario").then(function (res) {
        if (!res || !res.scenario) {
          throw taggedError(
            "Malformed scenario payload from " + base + "/api/scenario", "malformed");
        }
        return { source: res.source || "matlab", scenario: res.scenario };
      });
    }
    return loadSampleScenario();
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

  // Browser-side file download of arbitrary text (works over file:// too).
  function downloadText(filename, text, mimeType) {
    var blob = new Blob([text], { type: mimeType || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson(filename, value) {
    downloadText(filename, JSON.stringify(value, null, 2), "application/json");
  }

  Orbit.api = {
    base: base,
    detectBridge: detectBridge,
    loadScenario: loadScenario,
    loadSampleScenario: loadSampleScenario,
    fetchSpec: fetchSpec,
    saveSpec: saveSpec,
    runDemo: runDemo,
    runScenario: runScenario,
    downloadJson: downloadJson,
    downloadText: downloadText,
  };
})();
