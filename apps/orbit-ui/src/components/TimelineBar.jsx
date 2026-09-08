import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatDuration, formatUtc } from "../lib/time.js";
import ConsoleIcon from "./ConsoleIcon.jsx";
import "./timeline-polish.css";

const SPEEDS = [1, 10, 30, 60, 300, 1000];
const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const MINOR_TICKS = Array.from({ length: 41 }, (_, index) => index / 40);

function elapsedTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return [Math.floor(value / 3600), Math.floor((value % 3600) / 60), value % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export default function TimelineBar({ scenario, selection }) {
  const [compact, setCompact] = useState(false);
  const detailsId = useId();
  const footerId = useId();
  const helpId = useId();
  const { tSec, durationSec, playing, speed } = useSyncExternalStore(
    clock.subscribe, clock.getSnapshot,
  );
  const hasSpan = Boolean(scenario && durationSec > 0);
  const simDate = scenario ? new Date(scenario.epochMs + tSec * 1000) : null;
  const percent = (seconds) => durationSec > 0 ? 100 * seconds / durationSec : 0;
  const { windows, taskBlocks } = useMemo(() => {
    const access = [];
    const tasks = [];
    if (!scenario || durationSec <= 0) return { windows: access, taskBlocks: tasks };
    const block = (start, stop, title, slew = false, selected = false) => {
      if (!Number.isFinite(start) || !Number.isFinite(stop) || stop < 0 || start > durationSec) return null;
      const left = 100 * Math.max(0, start) / durationSec;
      const right = 100 * Math.min(durationSec, Math.max(start, stop)) / durationSec;
      return { left, width: Math.min(100 - left, Math.max(right - left, 0.15)), title, slew, selected, startSec: start, stopSec: stop };
    };
    for (const entry of scenario.accesses ?? []) {
      if (entry.stale) continue;
      for (const window of entry.windows) {
        const item = block(window.startSec, window.stopSec,
          `${entry.source} / ${entry.target} · T+ ${elapsedTime(window.startSec)}–${elapsedTime(window.stopSec)}`,
          false, Boolean(selection && (entry.source === selection || entry.target === selection)));
        if (item) access.push(item);
      }
    }
    for (const entry of scenario.schedule ?? []) {
      if (entry.stale) continue;
      const add = (start, stop, label, slew = false) => {
        const selected = Boolean(selection && [entry.platformName, entry.targetName, entry.sensorName, entry.taskName].includes(selection));
        const item = block(start, stop, `${entry.taskName}: ${label} (${entry.sensorName})`, slew, selected);
        if (item) tasks.push(item);
      };
      if (entry.startSec > entry.slewStartSec) add(entry.slewStartSec, entry.startSec, "slew", true);
      add(entry.startSec, entry.stopSec, entry.targetName);
      if ((entry.returnEndSec ?? entry.stopSec) > entry.stopSec) {
        add(entry.stopSec, entry.returnEndSec, "return to nadir", true);
      }
    }
    return { windows: access, taskBlocks: tasks };
  }, [scenario, durationSec, selection]);
  const contextWindows = useMemo(() => selection ? windows.filter((window) => window.selected) : windows, [windows, selection]);
  let activeCount = 0;
  let nextWindow = null;
  for (const window of contextWindows) {
    if (tSec >= window.startSec && tSec <= window.stopSec) activeCount += 1;
    if (window.startSec > tSec && (!nextWindow || window.startSec < nextWindow.startSec)) nextWindow = window;
  }
  const formattedTime = simDate ? formatUtc(simDate) : null;
  const accessEmpty = !scenario ? "Load a scenario to view access" :
    scenario.accesses?.some((entry) => entry.stale) ? "Run scenario to update access" :
      "No access windows in current results";
  const tasksEmpty = !scenario ? "Load a scenario to view tasks" :
    scenario.schedule?.some((entry) => entry.stale) ? "Run scenario to update tasks" :
      "No scheduled sensor tasks";

  return (
    <section className={`timeline mission-timeline${compact ? " mission-timeline--compact" : ""}`} aria-label="Mission timeline">
      <div className="timeline-controls">
        <div className="timeline-heading">
          <span className="timeline-title">Mission timeline</span>
          <span className={`timeline-state${playing ? " timeline-state--playing" : ""}`}>
            <i aria-hidden="true" />{!hasSpan ? "Awaiting scenario" : playing ? "Playing" : "Paused"}
          </span>
        </div>
        <div className="timeline-clock">
          {simDate ? <time className="timeline-utc" dateTime={simDate.toISOString()}>
            <span className="timeline-time-digits">{formattedTime.slice(11, 19)}</span>
            <span className="timeline-time-zone">UTC</span>
          </time> : <span className="timeline-utc">No scenario loaded</span>}
          <span className="timeline-elapsed">{formattedTime && <span className="timeline-date">{formattedTime.slice(0, 10)}<i aria-hidden="true">·</i></span>}T+ {elapsedTime(tSec)}</span>
        </div>
        <div className="timeline-playback" role="group" aria-label="Playback controls">
          <button className="btn btn--icon" disabled={!hasSpan}
            onClick={() => clock.setTime(0)} aria-label="Jump to scenario epoch" title="Jump to epoch · T0">
            <ConsoleIcon name="reset" size={17} />
          </button>
          <button className="btn btn--icon timeline-step timeline-step--back" disabled={!hasSpan || tSec <= 0}
            onClick={() => clock.setTime(tSec - 30)} aria-label="Back 30 simulation seconds" title="Back 30 seconds">
            <ConsoleIcon name="chevronRight" size={17} />
          </button>
          <button className="btn timeline-play" disabled={!hasSpan}
            onClick={() => clock.setPlaying(!playing)} aria-label={playing ? "Pause animation" : "Play animation"}
            aria-pressed={playing} title={playing ? "Pause animation" : "Play animation"}>
            <ConsoleIcon name={playing ? "pause" : "play"} size={17} />
          </button>
          <button className="btn btn--icon timeline-step" disabled={!hasSpan || tSec >= durationSec}
            onClick={() => clock.setTime(tSec + 30)} aria-label="Forward 30 simulation seconds" title="Forward 30 seconds">
            <ConsoleIcon name="chevronRight" size={17} />
          </button>
          <select className="control timeline-speed" value={speed}
            disabled={!hasSpan}
            onChange={(event) => clock.setSpeed(Number(event.target.value))}
            aria-label="Animation speed" title="Simulated seconds per real second">
            {SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}
          </select>
        </div>
        <button className="timeline-density-toggle" type="button"
          onClick={() => setCompact((value) => !value)}
          aria-expanded={!compact} aria-controls={`${detailsId} ${footerId}`}
          aria-label={compact ? "Expand mission timeline" : "Collapse mission timeline"}
          title={compact ? "Expand access and task lanes" : "Collapse timeline for more globe space"}>
          <ConsoleIcon name="chevronDown" size={16} />
          <span>{compact ? "Expand" : "Collapse"}</span>
        </button>
      </div>

      <div className="timeline-chart">
        <div className="timeline-chart-labels" aria-hidden="true" hidden={compact}>
          <span>Access</span><span>Tasks</span>
        </div>
        <div className="timeline-track">
          <div id={detailsId} hidden={compact}>
            <div className="timeline-ruler" aria-hidden="true">
              {MINOR_TICKS.map((fraction, index) => <i key={`mark-${index}`}
                className={`timeline-ruler-mark${index % 8 === 0 ? " timeline-ruler-mark--major" : ""}`}
                style={{ left: `${fraction * 100}%` }} />)}
              {TICKS.map((fraction) => <span key={fraction}
                className={`timeline-tick${fraction === 0 ? " timeline-tick--first" : fraction === 1 ? " timeline-tick--last" : ""}`}
                style={{ left: `${fraction * 100}%` }}>
                {formatDuration(durationSec * fraction)}
              </span>)}
            </div>
            <div className="timeline-lane timeline-lane--access" aria-label="Access windows">
              {windows.length ? windows.map((window, index) => <div key={index}
                className={`timeline-window${window.selected ? " timeline-window--selected" : ""}`}
                style={{ left: `${window.left}%`, width: `${window.width}%` }}
                title={window.title} role="img" aria-label={window.title} />) :
                <span className="timeline-empty">{accessEmpty}</span>}
            </div>
            <div className="timeline-lane timeline-lane--tasks" aria-label="Scheduled sensor tasks">
              {taskBlocks.length ? taskBlocks.map((item, index) => <div key={index}
                className={`timeline-task${item.slew ? " timeline-task--slew" : ""}${item.selected ? " timeline-task--selected" : ""}`}
                style={{ left: `${item.left}%`, width: `${item.width}%` }}
                title={item.title} role="img" aria-label={item.title} />) :
                <span className="timeline-empty">{tasksEmpty}</span>}
            </div>
            <div className="timeline-playhead" style={{ left: `${percent(tSec)}%` }} aria-hidden="true" />
          </div>
          <input className="timeline-scrubber" type="range" min={0} max={durationSec || 1}
            step={1} value={tSec} disabled={!hasSpan}
            style={{ "--timeline-progress": `${Math.max(0, Math.min(100, percent(tSec)))}%` }}
            onChange={(event) => clock.setTime(Number(event.target.value))}
            aria-label="Scenario time" aria-valuetext={simDate ? `${formatUtc(simDate)}, T+ ${elapsedTime(tSec)}` : "No scenario loaded"}
            aria-describedby={helpId} />
        </div>
        {compact && <span className="timeline-compact-duration" title="Scenario duration" aria-hidden="true">{hasSpan ? formatDuration(durationSec) : "—"}</span>}
      </div>
      <div className="timeline-footer" id={footerId} hidden={compact}>
        <div className="timeline-context" title={selection || "All scenario objects"}>
          <ConsoleIcon name={selection ? "crosshair" : "layers"} size={12} />
          <span className="timeline-context-name">{selection || "All objects"}</span>
          <span className={`timeline-context-access${activeCount ? " timeline-context-access--active" : ""}`}>
            {activeCount ? `${activeCount} in access` : `${contextWindows.length} windows`}
          </span>
        </div>
        {nextWindow && <button className="timeline-next-access" onClick={() => clock.setTime(nextWindow.startSec)}
          title={`Jump to next access: ${nextWindow.title}`}>
          Next access<ConsoleIcon name="arrowRight" size={12} />
        </button>}
        <div className="timeline-legend">
          <span className="timeline-legend-item"><i className="legend-swatch--access" />Access</span>
          <span className="timeline-legend-item"><i className="legend-swatch--task" />Collection</span>
          <span className="timeline-legend-item"><i className="legend-swatch--slew" />Slew</span>
        </div>
        <span className="timeline-span">{hasSpan ? formatDuration(durationSec) : "—"}</span>
      </div>
      <span className="timeline-sr-only" id={helpId}>Drag to scrub. Use the left and right arrow keys to adjust time by one second, or Home and End to jump to the beginning and end.</span>
    </section>
  );
}
