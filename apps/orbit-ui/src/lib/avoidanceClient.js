async function responseJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Avoidance bridge returned HTTP ${response.status}.`);
  return body;
}

function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    const abort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

// One shared round trip for the demo and the general sensor planner controls.
export async function runAvoidanceRequest(request, { signal, onProgress = () => {}, fetchImpl = fetch, wait = pause } = {}) {
  signal?.throwIfAborted();
  onProgress("exporting");
  let job = await responseJson(await fetchImpl("/api/avoidance/plan", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal }));
  onProgress("planning", job);
  while (job.state === "running") {
    await wait(1500, signal);
    signal?.throwIfAborted();
    job = await responseJson(await fetchImpl(`/api/avoidance/plan/${job.id}`, { signal }));
  }
  signal?.throwIfAborted();
  if (job.state !== "succeeded") throw new Error(job.error || "The planner did not find a validated route.");
  onProgress("importing", job);
  return job;
}
