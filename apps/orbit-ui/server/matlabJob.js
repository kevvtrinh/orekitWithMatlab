import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const APP_ROOT = path.resolve(__dirname, "..");
export const REPO_ROOT = path.resolve(APP_ROOT, "..", "..");
export const DATA_DIR = path.join(__dirname, "data");
export const LIVE_SCENARIO_FILE = path.join(DATA_DIR, "scenario.json");
export const SAMPLE_SCENARIO_FILE = path.join(
  APP_ROOT,
  "public",
  "sample-scenario.json",
);

const MATLAB_EXE = process.env.MATLAB_EXE || "matlab";
const JOB_TIMEOUT_MS = Number(process.env.MATLAB_TIMEOUT_MS || 10 * 60 * 1000);
const MAX_LOG_LINES = 400;

// Single-slot job model: MATLAB startup is expensive, so we never run two
// bridge jobs concurrently. State is in-memory; a server restart forgets a
// finished job but the JSON output on disk survives.
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

// MATLAB single-quoted string literal: escape ' by doubling it.
const quoteForMatlab = (text) => text.replace(/'/g, "''");

// Demo job kept for the CLI smoke test (npm run bridge:demo): builds the
// hard-coded demo scenario in MATLAB.
export function startDemoJob({ onDone } = {}) {
  const output = quoteForMatlab(LIVE_SCENARIO_FILE);
  return startJob({
    label: "demo",
    batchCommand: `startupOrekitSuite(); orbitUiDemoScenario('${output}');`,
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
    onDone,
  });
}

function startJob({ label, batchCommand, onDone }) {
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
    job.exitCode = code;
    job.finishedAt = new Date().toISOString();
    job.child = null;
    if (code === 0 && existsSync(LIVE_SCENARIO_FILE)) {
      try {
        JSON.parse(readFileSync(LIVE_SCENARIO_FILE, "utf8"));
        job.state = "succeeded";
      } catch (err) {
        job.state = "failed";
        job.error = `MATLAB exited 0 but output JSON is invalid: ${err.message}`;
      }
    } else {
      job.state = "failed";
      job.error =
        code === 0
          ? "MATLAB exited 0 but produced no output file."
          : `MATLAB exited with code ${code}.`;
    }
    onDone?.(jobStatus());
  });

  return { ok: true, status: jobStatus() };
}
