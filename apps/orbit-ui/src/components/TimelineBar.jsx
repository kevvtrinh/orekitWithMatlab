import { useMemo, useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatDuration, formatUtc } from "../lib/time.js";
import ConsoleIcon from "./ConsoleIcon.jsx";

const SPEEDS = [1, 10, 60, 300, 1000];
const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1];

function elapsedTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  return [Math.floor(value / 3600), Math.floor((value % 3600) / 60), value % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export default function TimelineBar({ scenario }) {
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
    const block = (start, stop, title, slew = false) => {
      if (!Number.isFinite(start) || !Number.isFinite(stop) || stop < 0 || start > durationSec) return null;
      const left = 100 * Math.max(0, start) / durationSec;
      const right = 100 * Math.min(durationSec, Math.max(start, stop)) / durationSec;
      return { left, width: Math.min(100 - left, Math.max(right - left, 0.15)), title, slew };
    };
    for (const entry of scenario.accesses ?? []) {
      if (entry.stale) continue;
      for (const window of entry.windows) {
        const item = block(window.startSec, window.stopSec,
          `${entry.source} / ${entry.target} · T+ ${elapsedTime(window.startSec)}–${elapsedTime(window.stopSec)}`);
        if (item) access.push(item);
      }
    }
    for (const entry of scenario.schedule ?? []) {
      if (entry.stale) continue;
      const add = (start, stop, label, slew = false) => {
        const item = block(start, stop, `${entry.taskName}: ${label} (${entry.sensorName})`, slew);
        if (item) tasks.push(item);
      };
      if (entry.startSec > entry.slewStartSec) add(entry.slewStartSec, entry.startSec, "slew", true);
      add(entry.startSec, entry.stopSec, entry.targetName);
      if ((entry.returnEndSec ?? entry.stopSec) > entry.stopSec) {
        add(entry.stopSec, entry.returnEndSec, "return to nadir", true);
      }
    }
    return { windows: access, taskBlocks: tasks };
  }, [scenario, durationSec]);
  const accessEmpty = !scenario ? "Load a scenario to view access" :
    scenario.accesses?.some((entry) => entry.stale) ? "Run scenario to update access" :
      "No access windows in current results";
  const tasksEmpty = !scenario ? "Load a scenario to view tasks" :
    scenario.schedule?.some((entry) => entry.stale) ? "Run scenario to update tasks" :
      "No scheduled sensor tasks";

  return (
    <section className="timeline" aria-label="Mission timeline">
      <div className="timeline-controls">
        <span className="timeline-title">Mission time</span>
        <div className="timeline-clock">
          {simDate ? <time className="timeline-utc" dateTime={simDate.toISOString()}>
            {formatUtc(simDate)}
          </time> : <span className="timeline-utc">No scenario loaded</span>}
          <span className="timeline-elapsed">T+ {elapsedTime(tSec)}</span>
        </div>
        <div className="timeline-playback" role="group" aria-label="Playback controls">
          <button className="btn btn--icon" disabled={!hasSpan}
            onClick={() => clock.setTime(0)} aria-label="Jump to scenario epoch" title="Jump to epoch · T0">
            <ConsoleIcon name="reset" size={17} />
          </button>
          <button className="btn timeline-play" disabled={!hasSpan}
            onClick={() => clock.setPlaying(!playing)} aria-label={playing ? "Pause animation" : "Play animation"}
            aria-pressed={playing} title={playing ? "Pause animation" : "Play animation"}>
            <ConsoleIcon name={playing ? "pause" : "play"} size={17} />
          </button>
          <select className="control timeline-speed" value={speed}
            onChange={(event) => clock.setSpeed(Number(event.target.value))}
            aria-label="Animation speed" title="Simulated seconds per real second">
            {SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}
          </select>
        </div>
      </div>

      <div className="timeline-chart">
        <div className="timeline-chart-labels" aria-hidden="true">
          <span>Access</span><span>Tasks</span>
        </div>
        <div className="timeline-track">
          <div className="timeline-ruler" aria-hidden="true">
            {TICKS.map((fraction) => <span key={fraction}
              className={`timeline-tick${fraction === 0 ? " timeline-tick--first" : fraction === 1 ? " timeline-tick--last" : ""}`}
              style={{ left: `${fraction * 100}%` }}>
              {formatDuration(durationSec * fraction)}
            </span>)}
          </div>
          <div className="timeline-lane timeline-lane--access" aria-label="Access windows">
            {windows.length ? windows.map((window, index) => <div key={index}
              className="timeline-window" style={{ left: `${window.left}%`, width: `${window.width}%` }}
              title={window.title} role="img" aria-label={window.title} />) :
              <span className="timeline-empty">{accessEmpty}</span>}
          </div>
          <div className="timeline-lane timeline-lane--tasks" aria-label="Scheduled sensor tasks">
            {taskBlocks.length ? taskBlocks.map((item, index) => <div key={index}
              className={`timeline-task${item.slew ? " timeline-task--slew" : ""}`}
              style={{ left: `${item.left}%`, width: `${item.width}%` }}
              title={item.title} role="img" aria-label={item.title} />) :
              <span className="timeline-empty">{tasksEmpty}</span>}
          </div>
          <div className="timeline-playhead" style={{ left: `${percent(tSec)}%` }} aria-hidden="true" />
          <input className="timeline-scrubber" type="range" min={0} max={durationSec || 1}
            step={1} value={tSec} disabled={!hasSpan}
            onChange={(event) => clock.setTime(Number(event.target.value))}
            aria-label="Scenario time" aria-valuetext={simDate ? `${formatUtc(simDate)}, T+ ${elapsedTime(tSec)}` : "No scenario loaded"}
            aria-describedby="timeline-help" />
        </div>
      </div>
      <div className="timeline-footer">
        <div className="timeline-legend" id="timeline-help">
          <span className="timeline-legend-item"><i className="legend-swatch--access" />Access</span>
          <span className="timeline-legend-item"><i className="legend-swatch--task" />Collection</span>
          <span className="timeline-legend-item"><i className="legend-swatch--slew" />Slew</span>
        </div>
        <span className="timeline-span">{hasSpan ? `${formatDuration(durationSec)} scenario span` : "Awaiting scenario"}</span>
      </div>
    </section>
  );
}
