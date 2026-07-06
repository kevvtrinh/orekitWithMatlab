import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

import {
  APP_ROOT,
  DATA_DIR,
  LIVE_SCENARIO_FILE,
  REPO_ROOT,
  SAMPLE_SCENARIO_FILE,
} from "./paths.js";
import { makeRequest, quoteForMatlab } from "./workerProtocol.js";
import { runWorkerJob, warmWorkerEnabled, workerStatus } from "./matlabWorker.js";

export { APP_ROOT, DATA_DIR, LIVE_SCENARIO_FILE, REPO_ROOT, SAMPLE_SCENARIO_FILE };

const MATLAB_EXE = process.env.MATLAB_EXE || "matlab";
const JOB_TIMEOUT_MS = Number(process.env.MATLAB_TIMEOUT_MS || 10 * 60 * 1000);
const MAX_LOG_LINES = 400;

// Single-slot job model: MATLAB runs are heavyweight, so we never run two
// bridge jobs concurrently. State is in-memory; a server restart forgets a
// finished job but the JSON output on disk survives.
//
// Two execution paths per job:
//  - warm (default): the job is handed to the persistent MATLAB worker
//    (matlabWorker.js), which paid MATLAB + JVM + Orekit startup once.
//  - cold (MATLAB_WARM_WORKER=0): a fresh `matlab -batch` per run.
const job = {
  state: "idle", // idle | running | succeeded | failed
  label: null, // "demo" | "scenario"
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  error: null,
  log: [],
  child: null,
};

function pushLog(text) {
  for (const line of String(text).split(/\r?\n/)) {
    if (line.trim().length === 0) continue;
    job.log.push(line);
  }
  if (job.log.length > MAX_LOG_LINES) {
    job.log.splice(0, job.log.length - MAX_LOG_LINES);
  }
}

export function jobStatus() {
  return {
    state: job.state,
    label: job.label,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    exitCode: job.exitCode,
    error: job.error,
    log: job.log.slice(-60),
    worker: workerStatus(),
  };
}

export function readScenario() {
  if (existsSync(LIVE_SCENARIO_FILE)) {
    return {
      source: "matlab",
      file: LIVE_SCENARIO_FILE,
      scenario: JSON.parse(readFileSync(LIVE_SCENARIO_FILE, "utf8")),
    };
  }
  if (existsSync(SAMPLE_SCENARIO_FILE)) {
    return {
      source: "sample",
      file: SAMPLE_SCENARIO_FILE,
      scenario: JSON.parse(readFileSync(SAMPLE_SCENARIO_FILE, "utf8")),
    };
  }
  return { source: "none", file: null, scenario: null };
}

// Demo job kept for the CLI smoke test (npm run bridge:demo): builds the
// hard-coded demo scenario in MATLAB.
export function startDemoJob({ onDone } = {}) {
  const output = LIVE_SCENARIO_FILE;
  return startJob({
    label: "demo",
    batchCommand: `startupOrekitSuite(); orbitUiDemoScenario('${quoteForMatlab(output)}');`,
    request: () => makeRequest("demo", { outputFile: output }),
    onDone,
  });
}

// Spec job: hand the browser-authored scenario spec to MATLAB, which builds,
// propagates, and exports the scenario with Orekit as the authority.
export function startSpecJob(specFile, { onDone } = {}) {
  const spec = quoteForMatlab(specFile);
  const output = quoteForMatlab(LIVE_SCENARIO_FILE);
  return startJob({
    label: "scenario",
    batchCommand: `startupOrekitSuite(); orbitUiRunScenario('${spec}', '${output}');`,
    request: () =>
      makeRequest("scenario", { specFile, outputFile: LIVE_SCENARIO_FILE }),
    onDone,
  });
}

function startJob({ label, batchCommand, request, onDone }) {
  if (job.state === "running") {
    return { ok: false, reason: "A MATLAB job is already running." };
  }

  mkdirSync(DATA_DIR, { recursive: true });

  job.state = "running";
  job.label = label;
  job.startedAt = new Date().toISOString();
  job.finishedAt = null;
  job.exitCode = null;
  job.error = null;
  job.log = [];

  if (warmWorkerEnabled()) {
    return startWarmJob({ request: request(), onDone });
  }
  return startColdJob({ batchCommand, onDone });
}

// Shared job epilogue: a run counts as succeeded only when MATLAB reported
// success AND the output file exists and parses as JSON.
function finishJob({ ok, error, exitCode = null, onDone }) {
  job.exitCode = exitCode;
  job.finishedAt = new Date().toISOString();
  if (ok && existsSync(LIVE_SCENARIO_FILE)) {
    try {
      JSON.parse(readFileSync(LIVE_SCENARIO_FILE, "utf8"));
      job.state = "succeeded";
    } catch (err) {
      job.state = "failed";
      job.error = `MATLAB reported success but output JSON is invalid: ${err.message}`;
    }
  } else {
    job.state = "failed";
    job.error = ok
      ? "MATLAB reported success but produced no output file."
      : error;
  }
  onDone?.(jobStatus());
}

// Warm path: run on the persistent MATLAB worker. The worker's stdout
// (including startup output when this job triggered the spawn) streams into
// this job's log.
function startWarmJob({ request, onDone }) {
  pushLog(`> warm worker job: ${request.kind}`);
  runWorkerJob(request, { timeoutMs: JOB_TIMEOUT_MS, onLog: pushLog })
    .then((done) =>
      finishJob({
        ok: done.ok,
        error: done.error ? `MATLAB job failed: ${done.error}` : done.error,
        onDone,
      }),
    )
    .catch((err) => {
      pushLog(`! ${err.message}`);
      finishJob({ ok: false, error: err.message, onDone });
    });
  return { ok: true, status: jobStatus() };
}

// Cold path: fresh `matlab -batch` per run (MATLAB_WARM_WORKER=0).
function startColdJob({ batchCommand, onDone }) {
  pushLog(`> ${MATLAB_EXE} -batch "${batchCommand}"`);
  pushLog(`> cwd: ${REPO_ROOT}`);

  let child;
  try {
    child = spawn(MATLAB_EXE, ["-batch", batchCommand], {
      cwd: REPO_ROOT,
      windowsHide: true,
    });
  } catch (err) {
    job.state = "failed";
    job.finishedAt = new Date().toISOString();
    job.error = `Failed to spawn MATLAB: ${err.message}`;
    return { ok: false, reason: job.error };
  }
  job.child = child;

  const timeout = setTimeout(() => {
    pushLog(`! Timed out after ${JOB_TIMEOUT_MS / 1000}s, killing MATLAB.`);
    child.kill();
  }, JOB_TIMEOUT_MS);

  child.stdout.on("data", (d) => pushLog(d));
  child.stderr.on("data", (d) => pushLog(d));
  child.on("error", (err) => {
    clearTimeout(timeout);
    job.state = "failed";
    job.finishedAt = new Date().toISOString();
    job.error = `MATLAB process error: ${err.message}. Is MATLAB on PATH (or set MATLAB_EXE)?`;
    job.child = null;
    onDone?.(jobStatus());
  });
  child.on("close", (code) => {
    clearTimeout(timeout);
    job.child = null;
    finishJob({
      ok: code === 0,
      error: `MATLAB exited with code ${code}.`,
      exitCode: code,
      onDone,
    });
  });

  return { ok: true, status: jobStatus() };
}
