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
