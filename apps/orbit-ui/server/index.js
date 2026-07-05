import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  APP_ROOT,
  REPO_ROOT,
  jobStatus,
  readScenario,
  startDemoJob,
  startSpecJob,
} from "./matlabJob.js";
import { loadSpec, resetSpec, saveSpec, writeRunSpec } from "./scenarioStore.js";

const PORT = Number(process.env.ORBIT_UI_PORT || 5175);
const app = express();
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, repoRoot: REPO_ROOT });
});

// Latest scenario data: MATLAB bridge output if present, bundled sample otherwise.
app.get("/api/scenario", (_req, res) => {
  const result = readScenario();
  if (!result.scenario) {
    res.status(404).json({ error: "No scenario data available." });
    return;
  }
  res.json({ source: result.source, scenario: result.scenario });
});

// Editable scenario spec (what the user builds in the browser).
app.get("/api/spec", (_req, res) => {
  res.json({ spec: loadSpec() });
});

app.put("/api/spec", (req, res) => {
  const result = saveSpec(req.body?.spec ?? req.body);
  if (result.errors) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.json({ spec: result.spec });
});

app.post("/api/spec/reset", (_req, res) => {
  res.json({ spec: resetSpec() });
});

app.get("/api/matlab/job", (_req, res) => {
  res.json(jobStatus());
});

// Propagate the current spec through MATLAB/Orekit (single job at a time).
app.post("/api/matlab/run", (req, res) => {
  let spec;
  if (req.body && req.body.spec) {
    // Convenience: save-and-run in one request.
    const saved = saveSpec(req.body.spec);
    if (saved.errors) {
      res.status(400).json({ errors: saved.errors });
      return;
    }
    spec = saved.spec;
  } else {
    spec = loadSpec();
  }
  const specFile = writeRunSpec(spec);
  const result = startSpecJob(specFile, {
    onDone: (status) =>
      console.log(`[matlab] scenario job finished: ${status.state}`, status.error ?? ""),
  });
  if (!result.ok) {
    res.status(409).json({ error: result.reason, job: jobStatus() });
    return;
  }
  console.log(`[matlab] scenario job started (spec rev ${spec.rev})`);
  res.status(202).json({ job: result.status });
});

// Kick off the demo bridge run (matlab -batch, single job at a time).
app.post("/api/matlab/run-demo", (_req, res) => {
  const result = startDemoJob({
    onDone: (status) =>
      console.log(`[matlab] job finished: ${status.state}`, status.error ?? ""),
  });
  if (!result.ok) {
    res.status(409).json({ error: result.reason, job: jobStatus() });
    return;
  }
  console.log("[matlab] job started");
  res.status(202).json({ job: result.status });
});

// Serve the built frontend when it exists (production mode: npm run build && npm start).
const distDir = path.join(APP_ROOT, "dist");
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
} else {
  // In dev the Vite server (5174) owns the frontend; still serve /textures and
  // sample data so the API port is self-sufficient for testing.
  app.use(express.static(path.join(APP_ROOT, "public")));
}

app.listen(PORT, () => {
  console.log(`orbit-ui bridge server listening on http://127.0.0.1:${PORT}`);
  console.log(`repo root: ${REPO_ROOT}`);
});
