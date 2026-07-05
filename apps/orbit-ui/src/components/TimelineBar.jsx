import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { formatDuration } from "../lib/time.js";

export default function TimelineBar({ scenario }) {
  const { tSec, durationSec } = useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
  );

  const windows = [];
  if (scenario && durationSec > 0) {
    for (const a of scenario.accesses) {
      for (const w of a.windows) {
        windows.push({
          left: (w.startSec / durationSec) * 100,
          width: Math.max(((w.stopSec - w.startSec) / durationSec) * 100, 0.3),
          title: `${a.source} -> ${a.target}`,
        });
      }
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
