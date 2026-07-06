// Shared filesystem locations for the bridge server. Kept in a leaf module so
// matlabJob.js and matlabWorker.js can both import them without a cycle.
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
export const WORKER_DIR = path.join(DATA_DIR, "worker");
