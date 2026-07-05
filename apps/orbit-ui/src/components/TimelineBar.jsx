import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatDuration } from "../lib/time.js";

export default function TimelineBar({ scenario }) {
  const { tSec, durationSec } = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
  );

  const pct = (sec) => (sec / durationSec) * 100;
  const windows = [];
  const taskBlocks = [];
  if (scenario && durationSec > 0) {
    for (const a of scenario.accesses) {
      if (a.stale) continue; // computed against an older scenario definition
      for (const w of a.windows) {
        windows.push({
          left: pct(w.startSec),
          width: Math.max(pct(w.stopSec - w.startSec), 0.3),
          title: `${a.source} -> ${a.target}`,
        });
      }
    }
    // Scheduled sensor tasks get their own lane; the slew lead-in renders as
    // a lighter block in front of the on-target dwell.
    for (const e of scenario.schedule ?? []) {
      if (e.stale) continue;
      if (e.startSec > e.slewStartSec) {
        taskBlocks.push({
          left: pct(e.slewStartSec),
          width: Math.max(pct(e.startSec - e.slewStartSec), 0.15),
          slew: true,
          title: `${e.taskName}: slew (${e.sensorName})`,
        });
      }
      taskBlocks.push({
        left: pct(e.startSec),
        width: Math.max(pct(e.stopSec - e.startSec), 0.3),
        slew: false,
        title: `${e.taskName}: ${e.sensorName} -> ${e.targetName}`,
      });
    }
  }

  return (
    <div className="timeline">
      <span className="timeline-label">T+{formatDuration(tSec)}</span>
      <div className="timeline-track">
        <div className="timeline-windows">
          {windows.map((w, i) => (
            <div
              key={i}
              className="timeline-window"
              style={{ left: `${w.left}%`, width: `${w.width}%` }}
              title={w.title}
            />
          ))}
          {taskBlocks.map((b, i) => (
            <div
              key={`task-${i}`}
              className={`timeline-task ${b.slew ? "timeline-task--slew" : ""}`}
              style={{ left: `${b.left}%`, width: `${b.width}%` }}
              title={b.title}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={durationSec || 1}
          step={1}
          value={tSec}
          disabled={!scenario}
          onChange={(e) => clock.setTime(Number(e.target.value))}
          aria-label="Scenario time"
        />
      </div>
      <span className="timeline-label" style={{ textAlign: "right" }}>
        {formatDuration(durationSec)}
      </span>
    </div>
  );
}
