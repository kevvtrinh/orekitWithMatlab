import { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import ObjectBrowser from "./components/ObjectBrowser.jsx";
import Viewport3D from "./components/Viewport3D.jsx";
import Inspector from "./components/Inspector.jsx";
import TimelineBar from "./components/TimelineBar.jsx";
import StatusBar from "./components/StatusBar.jsx";
import { prepareScenario } from "./lib/scenarioUtils.js";
import { clock } from "./lib/clock.js";

const JOB_POLL_MS = 2500;

export default function App() {
  const [scenario, setScenario] = useState(null);
  const [source, setSource] = useState("sample");
  const [selection, setSelection] = useState(null);
  const [job, setJob] = useState({ state: "idle" });
  const [viewOptions, setViewOptions] = useState({
    labels: true,
    groundTracks: true,
    accessLines: true,
  });
  const jobStateRef = useRef("idle");
  const urlTimeApplied = useRef(false);

  const applyScenario = useCallback((raw, src) => {
    const prepared = prepareScenario(raw);
    setScenario(prepared);
    setSource(src);
    clock.configure(prepared.meta.durationSeconds);
    // Optional deep link: ?t=<seconds past epoch> positions the clock on load.
    if (!urlTimeApplied.current) {
      urlTimeApplied.current = true;
      const t = Number(new URLSearchParams(window.location.search).get("t"));
      if (Number.isFinite(t) && t > 0) clock.setTime(t);
    }
    setSelection((sel) =>
      sel &&
      (prepared.satellites.some((s) => s.name === sel) ||
        prepared.groundPoints.some((g) => g.name === sel))
        ? sel
        : (prepared.satellites[0]?.name ?? null),
    );
  }, []);

  const loadScenario = useCallback(async () => {
    // Preferred path: the bridge server (proxied under /api). Fallback: the
    // bundled sample JSON served statically, so the UI works with no backend.
    try {
      const res = await fetch("/api/scenario");
      if (res.ok) {
        const body = await res.json();
        applyScenario(body.scenario, body.source);
        return;
      }
    } catch {
      /* bridge server not running */
    }
    try {
      const res = await fetch("/sample-scenario.json");
      if (res.ok) {
        applyScenario(await res.json(), "sample-static");
      }
    } catch (err) {
      console.error("No scenario data available", err);
    }
  }, [applyScenario]);

  const pollJob = useCallback(async () => {
    try {
      const res = await fetch("/api/matlab/job");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const status = await res.json();
      const previous = jobStateRef.current;
      jobStateRef.current = status.state;
      setJob(status);
      if (previous === "running" && status.state === "succeeded") {
        loadScenario();
      }
      return status.state;
    } catch {
      jobStateRef.current = "unreachable";
      setJob({ state: "unreachable" });
      return "unreachable";
    }
  }, [loadScenario]);

  useEffect(() => {
    loadScenario();
    pollJob();
  }, [loadScenario, pollJob]);

  // Poll the job endpoint while a run is in flight.
  useEffect(() => {
    if (job.state !== "running") return undefined;
    const id = setInterval(pollJob, JOB_POLL_MS);
    return () => clearInterval(id);
  }, [job.state, pollJob]);

  const runMatlab = useCallback(async () => {
    try {
      const res = await fetch("/api/matlab/run-demo", { method: "POST" });
      const body = await res.json();
      if (res.ok || res.status === 409) {
        jobStateRef.current = "running";
        setJob(body.job ?? { state: "running" });
      } else {
        setJob({ state: "failed", error: body.error ?? `HTTP ${res.status}` });
      }
    } catch {
      setJob({
        state: "unreachable",
        error:
          "Bridge server is not reachable. Start it with `npm run dev` (or `npm run dev:server`) in apps/orbit-ui.",
      });
    }
  }, []);

  const toggleOption = useCallback((key) => {
    setViewOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="app">
      <TopBar
        scenario={scenario}
        source={source}
        viewOptions={viewOptions}
        onToggleOption={toggleOption}
      />
      <div className="main">
        <ObjectBrowser
          scenario={scenario}
          selection={selection}
          onSelect={setSelection}
        />
        <div className="viewport-wrap">
          <Viewport3D
            scenario={scenario}
            selection={selection}
            viewOptions={viewOptions}
            onSelect={setSelection}
          />
          <TimelineBar scenario={scenario} />
        </div>
        <Inspector
          scenario={scenario}
          selection={selection}
          job={job}
          onRunMatlab={runMatlab}
        />
      </div>
      <StatusBar scenario={scenario} source={source} job={job} />
    </div>
  );
}
