import { useEffect, useRef, useState } from "react";
import { clock } from "../lib/clock.js";
import { makeSlewRequest, slewMatchesScene, validateSlewResult } from "../lib/slewPlanning.js";
import { runAvoidanceRequest } from "../lib/avoidanceClient.js";

function download(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SlewPlannerControls({ scenario, name, viewerRef, onShowGlobe }) {
  const points = scenario.groundPoints.filter((point) => !point.area);
  const areas = scenario.areaOutlines ?? [];
  const [from, setFrom] = useState(points[0]?.name ?? "");
  const [to, setTo] = useState(points[1]?.name ?? "");
  const [obstacle, setObstacle] = useState(areas[0]?.name ?? "");
  const [duration, setDuration] = useState(30), [clearance, setClearance] = useState(1);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [plan, setPlan] = useState(() => viewerRef.current?.getSlewPlan() ?? null);
  const [directory, setDirectory] = useState("");
  const current = useRef(scenario); current.current = scenario;
  const alive = useRef(true), abort = useRef(null), fileRef = useRef(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; abort.current?.abort(); }; }, []);
  useEffect(() => {
    if (plan && !slewMatchesScene(plan.request, scenario)) { setPlan(null); setMessage("Scenario changed. Export a fresh plan."); }
  }, [scenario, plan]);
  const importPlan = (request, result) => {
    const prepared = validateSlewResult(request, result, current.current);
    viewerRef.current?.setSlewPlan(prepared); setPlan(prepared);
    setMessage(`Ready · ${result.time_s.length} checked samples · ${result.angularPathLength_deg?.toFixed(1) ?? "—"}° travel`);
  };
  async function run() {
    setBusy(true); setMessage("Exporting moving Earth-region Az/El…"); setDirectory("");
    clock.setPlaying(false);
    const controller = new AbortController(); abort.current = controller;
    try {
      const request = makeSlewRequest(current.current, { platform: name, from, to, obstacle,
        startSec: clock.getSnapshot().tSec, durationSec: Number(duration), clearanceDeg: Number(clearance) });
      const job = await runAvoidanceRequest(request, { signal: controller.signal, onProgress: (phase, status) => {
        if (status) setDirectory(status.directory);
        setMessage(phase === "planning" ? "MATLAB is planning around the moving keep-out boundary…" : phase === "importing" ? "Checking the returned Earth-region clearance…" : "Exporting moving Earth-region Az/El…");
      } });
      if (alive.current) importPlan(request, job.result);
    } catch (err) { if (alive.current && err.name !== "AbortError") setMessage(err.message); }
    finally { if (alive.current) setBusy(false); }
  }
  return <details className="slew-planner"><summary>Obstacle avoidance <span>Export · MATLAB · Replay</span></summary>
    <div className="slew-planner-body">
      <div className="slew-fields">
        <label>Start object<select value={from} onChange={(e) => setFrom(e.target.value)} disabled={busy}>{points.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>
        <label>Destination<select value={to} onChange={(e) => setTo(e.target.value)} disabled={busy}>{points.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>
        <label>Earth keep-out area<select value={obstacle} onChange={(e) => setObstacle(e.target.value)} disabled={busy}>{areas.map((p) => <option key={p.name}>{p.name}</option>)}</select></label>
        <label>Duration (s)<input type="number" min="5" max="180" value={duration} onChange={(e) => setDuration(e.target.value)} disabled={busy} /></label>
        <label>Boresight clearance (°)<input type="number" min="0.1" max="15" step="0.1" value={clearance} onChange={(e) => setClearance(e.target.value)} disabled={busy} /></label>
      </div>
      <div className="slew-actions"><button className="btn" disabled={busy || points.length < 2 || !areas.length} onClick={run}>{busy ? "Planning…" : "Export & plan"}</button>
        <button className="btn" disabled={!plan || busy || plan.request.context.platform !== name} onClick={() => viewerRef.current?.replaySlewPlan()}>Replay slew</button>
        {plan && <><button className="btn" onClick={() => { viewerRef.current?.focusSlewPlan(); onShowGlobe(); }}>Show on globe</button>
          <button className="btn" onClick={() => download({ request: plan.request, result: plan.result }, "orbit-slew.json")}>Save round trip</button>
          <button className="btn" onClick={() => { viewerRef.current?.clearSlewPlan(); setPlan(null); setMessage(""); }}>Clear</button></>}
        <button className="btn" disabled={busy} onClick={() => fileRef.current?.click()}>Import result</button>
        <input ref={fileRef} type="file" accept=".json" hidden aria-label="Import avoidance result" onChange={async (e) => {
          const file = e.target.files[0]; e.target.value = ""; if (!file) return;
          try {
            if (file.size > 8e6) throw new Error("Result file exceeds 8 MB.");
            const value = JSON.parse(await file.text());
            importPlan(value.request ?? plan?.request, value.result ?? value);
          } catch (err) { setMessage(`Import failed: ${err.message}`); }
        }} />
      </div>
      {message && <p role="status" className="slew-status">{message}</p>}
      {directory && <p className="slew-export-path" title={directory}>Export folder: {directory}</p>}
      <p className="sensor-view-note">Red: Earth keep-out. Green: planned ground trace. Uses nadir/velocity reference Az/El and 2°/s² axis acceleration. Clearance applies to the boresight, not the full beam. Add two ground objects and an area target to plan.</p>
    </div>
  </details>;
}
