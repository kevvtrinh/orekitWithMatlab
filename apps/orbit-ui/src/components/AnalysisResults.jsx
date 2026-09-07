import { useState } from "react";
import { clock } from "../lib/clock.js";
import { formatDuration } from "../lib/time.js";
import ConsoleIcon from "./ConsoleIcon.jsx";

function ResultStatus({ stale, count }) {
  return <span className={`access-freshness${stale ? " outdated" : ""}`}
    title={stale ? "Run the scenario to update these results." : "Computed results"}>
    {stale ? "Needs update" : `${count} ${count === 1 ? "window" : "windows"}`}
  </span>;
}

function WindowTable({ windows, stale, label, tSec }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...windows].sort((a, b) => a.startSec - b.startSec);
  const visible = expanded ? sorted : sorted.slice(0, 5);
  if (!windows.length) return <p className="result-empty">
    {stale ? "Run the scenario to update these results." : "No windows found for this pair."}
  </p>;
  return <>
    <table className="access-table" aria-label={label}>
      <thead><tr><th>Start UTC</th><th>Duration</th><th><span className="sr-only">Go to window</span></th></tr></thead>
      {visible.map((window, index) => <tbody key={`${window.startUtc}:${index}`}>
        {(index === 0 || window.startUtc.slice(0, 10) !== visible[index - 1].startUtc.slice(0, 10)) &&
          <tr className="result-date"><th colSpan={3}>{window.startUtc.slice(0, 10)} <span>UTC</span></th></tr>}
        <tr className={!stale && tSec >= window.startSec && tSec <= window.stopSec ? "active" : ""}
          title={Number.isFinite(window.maxElevationDeg) ? `Peak elevation ${window.maxElevationDeg.toFixed(1)}°` : undefined}>
          <td><time dateTime={window.startUtc}>{window.startUtc.slice(11, 19)}</time></td>
          <td>{formatDuration(window.durationSeconds)}</td>
          <td><button className="window-jump" onClick={() => clock.setTime(window.startSec)}
            aria-label={`Go to ${label}, ${window.startUtc}`} title="Go to window">
            <ConsoleIcon name="play" size={12} />
          </button></td>
        </tr>
      </tbody>)}
    </table>
    {windows.length > 5 && <button className="result-expand" onClick={() => setExpanded(!expanded)}
      aria-expanded={expanded}>{expanded ? "Show fewer windows" : `Show all ${windows.length} windows`}
      <ConsoleIcon name="chevronDown" size={12} />
    </button>}
  </>;
}

export function AccessWindows({ accesses, tSec, objectName }) {
  if (!accesses.length) return <div className="empty-note">No access results for this object yet.</div>;
  return <div className="access-window-groups">
    {accesses.map((pair) => {
      const label = pair.source === objectName ? pair.target : pair.source;
      return <section className="access-window-group" key={JSON.stringify([pair.source, pair.target])}>
        <div className="access-window-heading"><strong title={label}>{label}</strong>
          <ResultStatus stale={pair.stale} count={pair.windows.length} />
        </div>
        <WindowTable windows={pair.windows} stale={pair.stale} label={`Access with ${label}`} tSec={tSec} />
      </section>;
    })}
  </div>;
}

function SensorWindows({ pair, tSec }) {
  const [mode, setMode] = useState("fov");
  const windows = mode === "fov" ? pair.fovWindows : pair.forWindows;
  return <section className="access-window-group">
    <div className="access-window-heading"><strong title={pair.target}>{pair.target}</strong>
      <ResultStatus stale={pair.stale} count={windows.length} />
    </div>
    <div className="result-subtitle" title={pair.sensor}>{pair.sensor}</div>
    <div className="result-modes" role="group" aria-label={`Visibility type for ${pair.sensor} and ${pair.target}`}>
      <button aria-pressed={mode === "fov"} onClick={() => setMode("fov")}>In view <span>{pair.fovWindows.length}</span></button>
      <button aria-pressed={mode === "for"} onClick={() => setMode("for")}>Reachable <span>{pair.forWindows.length}</span></button>
    </div>
    <WindowTable key={mode} windows={windows} stale={pair.stale} tSec={tSec}
      label={`${mode === "fov" ? "In-view" : "Reachable"} windows for ${pair.target}`} />
  </section>;
}

export function SensorAccessList({ pairs, tSec }) {
  if (!pairs.length) return <div className="empty-note">No sensor visibility results yet.</div>;
  return <div className="access-window-groups">{pairs.map((pair) =>
    <SensorWindows key={JSON.stringify([pair.platform, pair.sensor, pair.target])} pair={pair} tSec={tSec} />)}
  </div>;
}

export function ScheduleList({ entries, tSec }) {
  const [expanded, setExpanded] = useState(false);
  if (!entries.length) return <div className="empty-note">
    No scheduled tasks. Add sensor tasks from the Insert menu, then run the scenario.
  </div>;
  const sorted = [...entries].sort((a, b) => a.startSec - b.startSec);
  return <div className="schedule-results">
    {(expanded ? sorted : sorted.slice(0, 5)).map((entry, i) => {
      const collecting = !entry.stale && tSec >= entry.startSec && tSec <= entry.stopSec;
      const slewing = !entry.stale && tSec >= entry.slewStartSec && tSec < entry.startSec;
      return <article className={`schedule-result${collecting || slewing ? " active" : ""}`} key={`${entry.taskId}:${entry.startUtc}:${i}`}>
        <div className="schedule-result-heading"><strong>{entry.taskName}</strong>
          <span className={`access-freshness${entry.stale ? " outdated" : ""}`}>
            {entry.stale ? "Needs update" : collecting ? "Collecting" : slewing ? "Slewing" : "Scheduled"}
          </span>
        </div>
        <dl className="schedule-context"><dt>Target</dt><dd>{entry.targetName}</dd><dt>Sensor</dt><dd>{entry.sensorName}</dd></dl>
        <div className="schedule-timing"><time dateTime={entry.startUtc} title={entry.startUtc}>
          <span>{entry.startUtc.slice(0, 10)}</span>{entry.startUtc.slice(11, 19)} UTC</time>
          <div><strong>{formatDuration(entry.durationSeconds)}</strong>
            {entry.slewTimeSeconds > 0 && <span>{formatDuration(entry.slewTimeSeconds)} slew</span>}</div>
          <button className="window-jump" onClick={() => clock.setTime(Math.max(entry.slewStartSec, 0))}
            aria-label={`Go to ${entry.taskName} at ${entry.startUtc}`} title="Go to task">
            <ConsoleIcon name="play" size={12} />
          </button>
        </div>
      </article>;
    })}
    {entries.length > 5 && <button className="result-expand" aria-expanded={expanded}
      onClick={() => setExpanded(!expanded)}>{expanded ? "Show fewer tasks" : `Show all ${entries.length} tasks`}</button>}
  </div>;
}
