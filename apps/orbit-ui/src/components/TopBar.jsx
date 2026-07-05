import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatUtc } from "../lib/time.js";

const SPEEDS = [1, 10, 60, 300, 1000];

export default function TopBar({ scenario, source, viewOptions, onToggleOption }) {
  const { tSec, playing, speed } = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
  );
  const simDate = scenario ? new Date(scenario.epochMs + tSec * 1000) : null;

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">Orbit Console</span>
        <span className="brand-sub">Orekit / MATLAB mission suite</span>
      </div>

      <div className="scenario-chip" title="Active scenario">
        <span
          className={`status-dot status-dot--${source === "matlab" ? "matlab" : "sample"}`}
        />
        <span>{scenario ? scenario.meta.name : "No scenario"}</span>
        <span style={{ color: "var(--text-faint)" }}>
          {source === "matlab" ? "MATLAB data" : "sample data"}
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

      <div className="topbar-spacer" />

      <div className="topbar-group">
        <button
          className="btn btn--toggle"
          aria-pressed={viewOptions.labels}
          onClick={() => onToggleOption("labels")}
        >
          Labels
        </button>
        <button
          className="btn btn--toggle"
          aria-pressed={viewOptions.groundTracks}
          onClick={() => onToggleOption("groundTracks")}
        >
          Ground tracks
        </button>
        <button
          className="btn btn--toggle"
          aria-pressed={viewOptions.accessLines}
          onClick={() => onToggleOption("accessLines")}
        >
          Access
        </button>
      </div>
    </header>
  );
}
