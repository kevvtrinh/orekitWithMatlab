import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatUtc } from "../lib/time.js";
import Menu from "./Menu.jsx";

const SPEEDS = [1, 10, 60, 300, 1000];

export default function TopBar({
  scenario,
  source,
  job,
  viewOptions,
  onToggleOption,
  onOpenDialog,
  onResetSpec,
  onExport,
  onImportSpec,
  onRunMatlab,
}) {
  const { tSec, playing, speed } = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
  );
  const simDate = scenario ? new Date(scenario.epochMs + tSec * 1000) : null;
  const hasMatlabData = source === "matlab";

  const scenarioItems = [
    {
      label: "Scenario Settings...",
      onClick: () => onOpenDialog({ type: "settings" }),
    },
    "---",
    {
      label: "Import Spec JSON...",
      hint: "Load a scenario spec file exported from this UI",
      onClick: onImportSpec,
    },
    {
      label: "Export Spec JSON",
      hint: "The editable scenario definition",
      onClick: () => onExport("spec"),
    },
    {
      label: "Export Scenario JSON",
      hint: "Last propagated payload (ephemerides + access)",
      onClick: () => onExport("scenario"),
    },
    {
      label: "Export Ephemeris CSV",
      hint: "Ephemeris of the selected satellite",
      onClick: () => onExport("csv"),
    },
    "---",
    {
      label: "Reset to Demo Scenario",
      hint: "Restore the bundled two-satellite demo spec",
      onClick: onResetSpec,
    },
  ];

  const insertItems = [
    {
      label: "Satellite...",
      meta: "Keplerian / TLE",
      onClick: () => onOpenDialog({ type: "satellite" }),
    },
    {
      label: "Constellation...",
      meta: "Walker",
      onClick: () => onOpenDialog({ type: "constellation" }),
    },
    "---",
    {
      label: "Sensor...",
      hint: "Add or edit the imaging sensor on a satellite",
      onClick: () => onOpenDialog({ type: "sensor" }),
    },
    "---",
    {
      label: "Ground Station...",
      onClick: () => onOpenDialog({ type: "ground", kind: "groundStation" }),
    },
    {
      label: "Point Target...",
      onClick: () => onOpenDialog({ type: "ground", kind: "target" }),
    },
    {
      label: "Area Target...",
      hint: "Rectangular area sampled as a grid of point targets",
      onClick: () => onOpenDialog({ type: "areaTarget" }),
    },
    "---",
    {
      label: "Sensor Tasks...",
      hint: "Schedule imaging tasks for satellite sensors",
      onClick: () => onOpenDialog({ type: "tasks" }),
    },
  ];

  const analysisItems = [
    {
      label: "Calculate Access...",
      hint: "Choose the exact object pair to send to MATLAB/Orekit",
      onClick: () => onOpenDialog({ type: "access" }),
    },
    {
      label: "Run Full Scenario",
      hint: "Run the current scenario spec through MATLAB/Orekit",
      disabled: job?.state === "running",
      onClick: onRunMatlab,
      meta: job?.state === "running" ? "running" : undefined,
    },
    "---",
    {
      label: "Sensor Tasks...",
      hint: "Schedule imaging tasks for satellite sensors",
      onClick: () => onOpenDialog({ type: "tasks" }),
    },
  ];

  const viewItems = [
    ["Labels", "labels"],
    ["Ground tracks", "groundTracks"],
    ["Access lines", "accessLines"],
    ["Sensor FOV", "sensorFov"],
    ["Sensor FOR", "sensorFor"],
    ["Sun", "sun"],
  ].map(([label, key]) => ({
    label,
    meta: viewOptions[key] ? "on" : "off",
    onClick: () => onToggleOption(key),
  }));

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">Orbit Console</span>
        <span className="brand-sub">Orekit / MATLAB mission suite</span>
      </div>

      <div className="topbar-group">
        <Menu label="Scenario" items={scenarioItems} />
        <Menu label="Insert" items={insertItems} />
        <Menu label="Analysis" items={analysisItems} />
        <Menu label="View" items={viewItems} />
      </div>

      <div className="scenario-chip" title="Active scenario">
        <span
          className={`status-dot status-dot--${hasMatlabData ? "matlab" : "sample"}`}
        />
        <span>{scenario ? scenario.meta.name : "No scenario"}</span>
        <span style={{ color: "var(--text-faint)" }}>
          {scenario?.dirty ? "edited" : hasMatlabData ? "MATLAB data" : "sample data"}
        </span>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-group">
        <button
          className="btn btn--icon"
          onClick={() => clock.setTime(0)}
          title="Jump to scenario epoch"
        >
          T0
        </button>
        <button
          className="btn btn--icon"
          style={{ minWidth: 64 }}
          onClick={() => clock.setPlaying(!playing)}
          disabled={!scenario}
          title="Play / pause scenario animation"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <select
          className="control"
          value={speed}
          onChange={(e) => clock.setSpeed(Number(e.target.value))}
          title="Animation speed (simulated seconds per wall second)"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
        <div className="utc-readout">
          {simDate ? formatUtc(simDate) : "--"}
        </div>
      </div>

    </header>
  );
}
