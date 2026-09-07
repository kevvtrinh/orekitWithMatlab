// Exercise the real managed bridge lifecycle without starting MATLAB or
// calling routes that write scenario/job files. Each child owns a free port.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const serverFile = fileURLToPath(new URL("../server/index.js", import.meta.url));

async function within(promise, milliseconds, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function managedBridge(context) {
  const child = spawn(process.execPath, [serverFile], {
    cwd: appRoot,
    env: {
      ...process.env,
      ORBIT_UI_PORT: "0",
      ORBIT_UI_MANAGED: "1",
      MATLAB_WARM_WORKER: "0",
    },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });
  let output = "";
  let errors = "";
  const exited = new Promise((resolve) => {
    child.once("error", (error) => resolve({ error }));
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  // Always reap the child, including when startup, health, or exit assertions
  // fail. Explicit shutdown/EOF must succeed without this fallback killing it.
  context.after(async () => {
    child.stdin.destroy();
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    await within(exited, 3000, "Failed to reap managed bridge child");
  });
  child.stderr.on("data", (chunk) => { errors += chunk.toString(); });
  const ready = new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      const match = output.match(/listening on (http:\/\/127\.0\.0\.1:(\d+))/);
      if (match && Number(match[2]) > 0) resolve(match[1]);
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      reject(new Error(`Bridge exited before readiness (${code}, ${signal}): ${errors}`));
    });
  });
  const url = await within(ready, 5000, "Managed bridge did not announce its bound port");
  const get = async (route) => {
    const response = await fetch(`${url}${route}`, {
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(2000),
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  assert.equal((await get("/api/health")).ok, true);
  const { worker } = await get("/api/matlab/worker");
  assert.equal(worker.enabled, false);
  assert.equal(worker.state, "off");
  assert.equal(worker.pid, null);
  assert.equal(worker.jobsRun, 0);
  return { child, exited, url };
}

for (const stopMethod of ["shutdown command", "stdin EOF"]) {
  test(`managed bridge starts and exits cleanly on ${stopMethod}`, { timeout: 15000 }, async (context) => {
    const { child, exited, url } = await managedBridge(context);
    if (stopMethod === "shutdown command") child.stdin.write("shutdown\n");
    else child.stdin.end();
    const exit = await within(exited, 5000, `Managed bridge ignored ${stopMethod}`);
    assert.deepEqual(exit, { code: 0, signal: null });
    await assert.rejects(fetch(`${url}/api/health`, {
      headers: { Connection: "close" },
      signal: AbortSignal.timeout(1000),
    }));
  });
}
