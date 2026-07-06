// Protocol shared between the Node bridge and the warm MATLAB worker
// (src/ui/orbitUiWorker.m at the repo root). One persistent MATLAB process
// pays MATLAB + JVM + Orekit startup once, then exchanges jobs with Node
// through files inside a work directory:
//
//   request.json  Node -> worker: { id, kind, specFile, outputFile }
//   done.json     worker -> Node: { id, ok, error }
//   ready.json    worker announces startup is complete (worker is warm)
//   stop          Node asks the worker loop to exit
//
// Pure helpers only (no process/fs state) so they are unit-testable without
// MATLAB; the lifecycle lives in matlabWorker.js.

import { randomUUID } from "node:crypto";

export const REQUEST_FILE = "request.json";
export const DONE_FILE = "done.json";
export const READY_FILE = "ready.json";
export const STOP_FILE = "stop";

// Job kinds the MATLAB worker understands (orbitUiWorkerProcessJob.m).
export const JOB_KINDS = ["ping", "demo", "scenario"];

// MATLAB single-quoted string literal: escape ' by doubling it.
export const quoteForMatlab = (text) => String(text).replace(/'/g, "''");

export function makeRequest(kind, { specFile = null, outputFile = null } = {}) {
  if (!JOB_KINDS.includes(kind)) {
    throw new Error(`Unknown worker job kind: ${kind}`);
  }
  return { id: randomUUID(), kind, specFile, outputFile };
}

// matlab -batch command that boots the suite once and enters the worker loop.
export function buildWorkerBatchCommand(workDir, idleTimeoutSeconds) {
  const idle = Number(idleTimeoutSeconds);
  if (!Number.isFinite(idle) || idle <= 0) {
    throw new Error(`Invalid worker idle timeout: ${idleTimeoutSeconds}`);
  }
  return `startupOrekitSuite(); orbitUiWorker('${quoteForMatlab(workDir)}', ${idle});`;
}

// Parse done.json text for a specific request. Returns { ok, error } or null
// when the file is unreadable (mid-write) or belongs to another request.
export function parseDoneFile(text, request) {
  let done;
  try {
    done = JSON.parse(text);
  } catch {
    return null;
  }
  if (!done || done.id !== request.id) return null;
  return {
    ok: done.ok === true,
    error: done.error ? String(done.error) : null,
  };
}
