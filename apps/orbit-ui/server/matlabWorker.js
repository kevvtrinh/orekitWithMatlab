// Warm MATLAB worker cache: keeps one MATLAB process alive between bridge
// runs so repeat runs skip MATLAB + JVM + Orekit startup (the dominant cost
// of a run — the computation itself is seconds). The worker is spawned
// lazily on the first job (or via POST /api/matlab/warmup), exits on its own
// after an idle timeout, and is respawned transparently on the next job.
//
// File protocol with src/ui/orbitUiWorker.m is defined in workerProtocol.js.
// Disable with MATLAB_WARM_WORKER=0 (every run then falls back to a fresh
// `matlab -batch`, the pre-cache behavior).

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { REPO_ROOT, WORKER_DIR } from "./paths.js";
import {
  DONE_FILE,
  READY_FILE,
  REQUEST_FILE,
  STOP_FILE,
  buildWorkerBatchCommand,
  parseDoneFile,
} from "./workerProtocol.js";

const MATLAB_EXE = process.env.MATLAB_EXE || "matlab";
const IDLE_TIMEOUT_S = Number(process.env.MATLAB_WORKER_IDLE_S || 15 * 60);
const POLL_MS = 200;
const MAX_WORKER_LOG_LINES = 100;

const requestFile = path.join(WORKER_DIR, REQUEST_FILE);
const doneFile = path.join(WORKER_DIR, DONE_FILE);
const readyFile = path.join(WORKER_DIR, READY_FILE);
const stopFile = path.join(WORKER_DIR, STOP_FILE);

// Read at call time (not module load) so runBridgeCli.js and tests can set
// the env var after import.
export function warmWorkerEnabled() {
  return process.env.MATLAB_WARM_WORKER !== "0";
}

const worker = {
  state: "off", // off | booting | warm
  child: null,
  pid: null,
  startedAt: null,
  jobsRun: 0,
  log: [], // rolling worker output, kept for status/diagnosis between jobs
};

// The bridge is single-slot, so at most one job waits on the worker.
let activeJob = null;

function routeLog(text) {
  for (const line of String(text).split(/\r?\n/)) {
    if (line.trim().length === 0) continue;
    worker.log.push(line);
    activeJob?.onLog?.(line);
  }
  if (worker.log.length > MAX_WORKER_LOG_LINES) {
    worker.log.splice(0, worker.log.length - MAX_WORKER_LOG_LINES);
  }
}

function resetWorker() {
  worker.state = "off";
  worker.child = null;
  worker.pid = null;
  rmSync(readyFile, { force: true });
}

// Spawn the worker if it is not already running. Returns { ok } or
// { ok: false, reason }. Safe to call repeatedly.
export function ensureWorker() {
  if (worker.child) return { ok: true };

  mkdirSync(WORKER_DIR, { recursive: true });
  // Clear leftovers from a previous worker so stale files cannot be mistaken
  // for live protocol traffic.
  for (const file of [requestFile, doneFile, readyFile, stopFile]) {
    rmSync(file, { force: true });
  }

  const batchCommand = buildWorkerBatchCommand(WORKER_DIR, IDLE_TIMEOUT_S);
  let child;
  try {
    child = spawn(MATLAB_EXE, ["-batch", batchCommand], {
      cwd: REPO_ROOT,
      windowsHide: true,
    });
  } catch (err) {
    return { ok: false, reason: `Failed to spawn MATLAB worker: ${err.message}` };
  }

  worker.state = "booting";
  worker.child = child;
  worker.pid = child.pid ?? null;
  worker.startedAt = new Date().toISOString();
  worker.log = [];
  routeLog(`> ${MATLAB_EXE} -batch "${batchCommand}"`);

  child.stdout.on("data", routeLog);
  child.stderr.on("data", routeLog);
  child.on("error", (err) => {
    resetWorker();
    failActiveJob(
      `MATLAB worker process error: ${err.message}. Is MATLAB on PATH (or set MATLAB_EXE)?`,
    );
  });
  child.on("close", (code) => {
    resetWorker();
    failActiveJob(`MATLAB worker exited (code ${code}) before finishing the job.`);
  });
  return { ok: true };
}

function failActiveJob(message) {
  const job = activeJob;
  if (!job) return;
  job.settle(() => job.reject(new Error(message)));
}

// Run one request on the warm worker. Resolves with { ok, error } from
// done.json; rejects on spawn failure, worker death, or timeout (the worker
// is killed on timeout — the next job respawns it).
export function runWorkerJob(request, { timeoutMs, onLog } = {}) {
  return new Promise((resolve, reject) => {
    if (activeJob) {
      reject(new Error("A worker job is already running."));
      return;
    }
    const started = ensureWorker();
    if (!started.ok) {
      reject(new Error(started.reason));
      return;
    }

    // Write the request atomically (tmp + rename) so the worker never
    // decodes a half-written file.
    rmSync(doneFile, { force: true });
    const tmp = requestFile + ".tmp";
    writeFileSync(tmp, JSON.stringify(request));
    rmSync(requestFile, { force: true });
    renameSync(tmp, requestFile);

    const job = {
      onLog,
      settled: false,
      reject,
      settle(finish) {
        if (job.settled) return;
        job.settled = true;
        clearInterval(poller);
        if (timer) clearTimeout(timer);
        activeJob = null;
        finish();
      },
    };
    activeJob = job;

    const poller = setInterval(() => {
      let text;
      try {
        text = readFileSync(doneFile, "utf8");
      } catch {
        return; // not written yet
      }
      const done = parseDoneFile(text, request);
      if (!done) return; // mid-write or stale file
      rmSync(doneFile, { force: true });
      worker.state = "warm";
      worker.jobsRun += 1;
      job.settle(() => resolve(done));
    }, POLL_MS);

    const timer = timeoutMs
      ? setTimeout(() => {
          job.settle(() =>
            reject(
              new Error(
                `Worker job timed out after ${timeoutMs / 1000}s; killing the MATLAB worker.`,
              ),
            ),
          );
          shutdownWorker();
        }, timeoutMs)
      : null;
  });
}

export function workerStatus() {
  // The worker announces warmth by writing ready.json; check lazily.
  if (worker.state === "booting" && existsSync(readyFile)) {
    worker.state = "warm";
  }
  return {
    enabled: warmWorkerEnabled(),
    state: worker.state,
    busy: activeJob != null,
    pid: worker.pid,
    startedAt: worker.startedAt,
    jobsRun: worker.jobsRun,
    log: worker.log.slice(-20),
  };
}

// Stop the worker process. The stop file is the graceful path (the loop
// exits on its next poll); kill() covers a wedged MATLAB.
export function shutdownWorker() {
  const child = worker.child;
  if (!child) return;
  try {
    writeFileSync(stopFile, "");
  } catch {
    // work dir may already be gone; kill() below still applies
  }
  child.kill();
}

// Never leave an orphaned MATLAB behind the server/CLI process. The MATLAB
// idle timeout is the backstop for exits that skip these handlers.
process.on("exit", () => shutdownWorker());
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdownWorker();
    process.exit(0);
  });
}
