import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./paths.js";
import { quoteForMatlab } from "./workerProtocol.js";

const folder = path.join(REPO_ROOT, "standalone", "azElAvoidance");
const jobs = new Map();
let child = null;
export const avoidanceBusy = () => child !== null;
export function avoidanceStatus(id) { return jobs.get(id) ?? null; }
export function validateAvoidanceRequest(r) {
  const pair = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  if (r?.version !== 1 || !r.context || typeof r.context.signature !== "string") throw new Error("Invalid slew request context.");
  for (const state of [r.initialState, r.goalState]) {
    if (!Number.isFinite(state?.time_s) || !pair(state.position_deg) || !pair(state.velocity_deg_s) || !pair(state.acceleration_deg_s2)) throw new Error("Invalid slew endpoint.");
    if ([...state.velocity_deg_s, ...state.acceleration_deg_s2].some((v) => v !== 0)) throw new Error("This bridge requires resting endpoint states.");
  }
  const duration = r.goalState.time_s - r.initialState.time_s;
  if (duration < 5 || duration > 180) throw new Error("Slew duration must be 5–180 seconds.");
  for (const key of ["azimuth_deg", "elevation_deg", "maxVelocity_deg_s", "maxAcceleration_deg_s2"]) {
    if (!pair(r.limits?.[key])) throw new Error("Invalid axis limits.");
  }
  for (const key of ["azimuth_deg", "elevation_deg"]) {
    if (r.limits[key][0] >= r.limits[key][1] || r.limits[key].some((v) => Math.abs(v) > 75)) throw new Error("Planning axes must stay within ±75 degrees.");
  }
  if ([...r.limits.maxVelocity_deg_s, ...r.limits.maxAcceleration_deg_s2].some((v) => v <= 0 || v > 30)) throw new Error("Axis rate and acceleration limits must be positive and at most 30.");
  if (!Number.isFinite(r.options?.SafetyMargin_deg) || r.options.SafetyMargin_deg < 0.1 || r.options.SafetyMargin_deg > 15) throw new Error("Invalid boresight clearance.");
  if (!Array.isArray(r.obstacles) || !r.obstacles.length || r.obstacles.length > 100) throw new Error("Invalid obstacle collection.");
  let vertices = 0;
  for (const obstacle of r.obstacles) {
    const times = obstacle.time_s;
    if (typeof obstacle.targetName !== "string" || !Array.isArray(times) || times.length < 2 || times.length > 181 || !Array.isArray(obstacle.slices) || times.length !== obstacle.slices.length ||
        times.some((t, i) => !Number.isFinite(t) || (i && (t <= times[i-1] || t-times[i-1] > 1.001))) ||
        Math.abs(times[0]-r.initialState.time_s)>1e-6 || Math.abs(times.at(-1)-r.goalState.time_s)>1e-6) throw new Error("Obstacle times must span the slew with samples at most one second apart.");
    for (const slice of obstacle.slices) {
      if (!Array.isArray(slice.az_deg) || !Array.isArray(slice.el_deg) || slice.az_deg.length < 4 || slice.az_deg.length !== slice.el_deg.length ||
          [...slice.az_deg, ...slice.el_deg].some((v) => !Number.isFinite(v) || Math.abs(v)>90)) throw new Error("Invalid obstacle polygon.");
      vertices += slice.az_deg.length;
      if (vertices > 80000) throw new Error("Obstacle export exceeds 80,000 vertices.");
    }
  }
  // Only the clearance is caller-controlled; bound computational options here.
  return { ...r, limits: { ...r.limits, maxJerk_deg_s3: [4, 4] },
    options: { SampleTime_s: 0.05, GoalTimeMode: "fixedArrival", SafetyMargin_deg: r.options.SafetyMargin_deg, AllowAzimuthWrapping: false } };
}
export function startAvoidance(request) {
  if (child) throw new Error("An avoidance planner job is already running.");
  const input = validateAvoidanceRequest(request);
  const id = randomUUID(), directory = path.join(folder, "exports", "orbit-ui", id);
  mkdirSync(directory, { recursive: true });
  const requestFile = path.join(directory, "request.json"), resultFile = path.join(directory, "plan.json");
  writeFileSync(requestFile, JSON.stringify(input));
  const job = { id, state: "running", directory, requestFile, resultFile, log: "" };
  jobs.set(id, job);
  // Bound memory while preserving every export on disk.
  if (jobs.size > 20) jobs.delete(jobs.keys().next().value);
  const command = `addpath('${quoteForMatlab(folder)}'); planOrbitUiSlew('${quoteForMatlab(requestFile)}','${quoteForMatlab(resultFile)}');`;
  const processHandle = spawn(process.env.MATLAB_EXE || "matlab", ["-batch", command], { cwd: folder, windowsHide: true });
  child = processHandle;
  const timer = setTimeout(() => { job.error = "MATLAB planner exceeded the 150-second job limit."; processHandle.kill(); }, 150000);
  const log = (data) => { job.log = (job.log + data.toString()).slice(-6000); };
  processHandle.stdout.on("data", log); processHandle.stderr.on("data", log);
  const finish = (error) => {
    clearTimeout(timer); if (child === processHandle) child = null;
    if (job.state !== "running") return;
    try {
      if (error || job.error) throw new Error(job.error || error);
      job.result = JSON.parse(readFileSync(resultFile, "utf8"));
      if (!job.result.success) throw new Error(job.result.message || "No feasible avoidance route found.");
      writeFileSync(path.join(directory, "orbit-slew.json"), JSON.stringify({ request: input, result: job.result }));
      job.state = "succeeded";
    } catch (err) { job.state = "failed"; job.error = err.message; }
  };
  processHandle.on("error", (err) => finish(err.message));
  processHandle.on("close", (code) => finish(code ? `MATLAB exited with code ${code}. ${job.log.slice(-1500)}` : null));
  return job;
}
process.once("exit", () => child?.kill());
