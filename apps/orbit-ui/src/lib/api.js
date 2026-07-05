// Thin client for the bridge server API. Every call can fail when the app is
// served statically without the Node bridge; callers handle the fallback
// (local in-memory spec, bundled sample payload).

async function json(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      body.errors?.join(" ") ?? body.error ?? `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = body.errors;
    throw err;
  }
  return body;
}

export async function fetchSpec() {
  return json(await fetch("/api/spec"));
}

export async function saveSpec(spec) {
  return json(
    await fetch("/api/spec", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec }),
    }),
  );
}

export async function resetSpec() {
  return json(await fetch("/api/spec/reset", { method: "POST" }));
}

export async function fetchScenario() {
  return json(await fetch("/api/scenario"));
}

export async function fetchJob() {
  return json(await fetch("/api/matlab/job"));
}

// Save the given spec and start a MATLAB run in one request.
export async function runScenario(spec) {
  return json(
    await fetch("/api/matlab/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec }),
    }),
  );
}

// Where the Node bridge listens when it is not behind the Vite proxy. Used
// only for diagnosis (a health probe), never for data traffic.
export const BRIDGE_DIRECT_URL = "http://127.0.0.1:5175";

// "ok" if the URL answers 2xx, "missing" on 404 (server up, route absent),
// "down" if unreachable or erroring.
async function probeHealth(url, fetchImpl) {
  try {
    const res = await fetchImpl(url);
    if (res.ok) return "ok";
    return res.status === 404 ? "missing" : "down";
  } catch {
    return "down";
  }
}

// Turn a failed bridge call into a job-style state and a message that says
// what actually broke. The common trap: a dev server started before an /api
// route existed returns HTTP 404, which looks like a MATLAB failure but is
// purely a web-plumbing problem. Probe /api/health (same-origin, then the
// bridge port directly) to tell the cases apart.
export async function classifyBridgeError(err, fetchImpl = (url) => fetch(url)) {
  // Non-404 HTTP statuses are real answers from the bridge (validation
  // errors, busy, MATLAB run failures) - report them as-is.
  if (err?.status && err.status !== 404) {
    return { state: "failed", message: err.message };
  }

  const sameOrigin = await probeHealth("/api/health", fetchImpl);
  if (sameOrigin === "ok") {
    if (err?.status === 404) {
      return {
        state: "unreachable",
        message:
          "The bridge answered, but this API route is missing - it is running " +
          "old code. Restart `npm run dev` in apps/orbit-ui and reload this " +
          "page. (MATLAB was never started, so it did not fail.)",
      };
    }
    return { state: "failed", message: err?.message ?? "Request failed." };
  }

  const direct = await probeHealth(`${BRIDGE_DIRECT_URL}/api/health`, fetchImpl);
  if (direct === "ok") {
    return {
      state: "unreachable",
      message:
        "The MATLAB bridge (port 5175) is up, but this page's dev server is " +
        "not proxying /api - it is stale. Restart `npm run dev` in " +
        "apps/orbit-ui and reload this page. (MATLAB was never started, so " +
        "it did not fail.)",
    };
  }
  return {
    state: "unreachable",
    message:
      "Web bridge offline. Start it with `npm run dev` in apps/orbit-ui " +
      "(Vite on 5174 + Node bridge on 5175). (MATLAB was never started, so " +
      "it did not fail.)",
  };
}

// Browser-side file download of a JSON-able value.
export function downloadJson(filename, value) {
  downloadBlob(
    filename,
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
}

export function downloadText(filename, text, type = "text/csv") {
  downloadBlob(filename, new Blob([text], { type }));
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
