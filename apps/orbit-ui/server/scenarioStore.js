// Persistent store for the editable scenario spec.
//
// The spec lives in server/data/scenario-spec.json. The browser edits it via
// PUT /api/spec; POST /api/matlab/run snapshots it for the MATLAB pipeline.
// Validation is shared with the frontend (src/lib/spec.js) so the browser and
// the bridge can never disagree about what a legal spec is.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  deriveSpecFromScenario,
  stripEmptyFields,
  validateSpec,
} from "../src/lib/spec.js";
import { DATA_DIR, SAMPLE_SCENARIO_FILE } from "./matlabJob.js";

export const SPEC_FILE = path.join(DATA_DIR, "scenario-spec.json");
export const RUN_SPEC_FILE = path.join(DATA_DIR, "scenario-spec-run.json");

// The out-of-the-box spec mirrors the bundled sample scenario so the default
// editable objects line up with the demo payload the UI ships with.
export function defaultSpec() {
  const sample = JSON.parse(readFileSync(SAMPLE_SCENARIO_FILE, "utf8"));
  return deriveSpecFromScenario(sample);
}

export function loadSpec() {
  if (existsSync(SPEC_FILE)) {
    try {
      const spec = JSON.parse(readFileSync(SPEC_FILE, "utf8"));
      if (validateSpec(spec).length === 0) return spec;
      console.warn("[spec] stored spec is invalid, falling back to default");
    } catch (err) {
      console.warn(`[spec] cannot read stored spec: ${err.message}`);
    }
  }
  return defaultSpec();
}

// Validates and persists a client-submitted spec. Returns { spec } on
// success or { errors } when the spec is rejected (nothing is written).
export function saveSpec(candidate) {
  const spec = stripEmptyFields(candidate);
  const errors = validateSpec(spec);
  if (errors.length > 0) return { errors };
  spec.rev = (loadSpec().rev ?? 0) + 1;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SPEC_FILE, JSON.stringify(spec, null, 2));
  return { spec };
}

export function resetSpec() {
  const spec = defaultSpec();
  spec.rev = (loadSpec().rev ?? 0) + 1;
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SPEC_FILE, JSON.stringify(spec, null, 2));
  return spec;
}

// Snapshot the current spec for a MATLAB run and return the snapshot path.
export function writeRunSpec(spec) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(RUN_SPEC_FILE, JSON.stringify(spec, null, 2));
  return RUN_SPEC_FILE;
}
