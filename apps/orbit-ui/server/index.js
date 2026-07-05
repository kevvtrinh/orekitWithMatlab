import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  APP_ROOT,
  REPO_ROOT,
  jobStatus,
  readScenario,
  startDemoJob,
} from "./matlabJob.js";

const PORT = Number(process.env.ORBIT_UI_PORT || 5175);
const app = express();
app.use(express.json());

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

app.get("/api/matlab/job", (_req, res) => {
  res.json(jobStatus());
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
