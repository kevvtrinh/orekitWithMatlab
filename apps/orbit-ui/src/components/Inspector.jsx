import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import {
  accessesForObject,
  satEciAt,
  satLlaAt,
  windowStateAt,
} from "../lib/scenarioUtils.js";
import {
  pointingStateAt,
  scheduleForObject,
  scheduleForPlatform,
  sensorAccessesForObject,
} from "../lib/schedule.js";
import { daylightAt, lightingStateAt } from "../lib/sun.js";
import { formatDuration } from "../lib/time.js";
import MatlabPanel from "./MatlabPanel.jsx";

const SOURCE_LABEL = {
  matlab: { text: "MATLAB/Orekit", className: "badge--matlab" },
  preview: { text: "browser preview", className: "badge--preview" },
  pending: { text: "awaiting MATLAB run", className: "badge--pending" },
};

const LIGHTING_LABEL = {
  Sunlit: { text: "Sunlit", className: "badge--sunlit" },
  Penumbra: { text: "Penumbra", className: "badge--eclipse" },
  Umbra: { text: "Eclipse (umbra)", className: "badge--eclipse" },
};

function SatelliteDetails({ sat, tSec, sun, schedule }) {
  const src = SOURCE_LABEL[sat.source];
  const lla = sat.ephemeris ? satLlaAt(sat, tSec) : null;
  const eci = sat.ephemeris ? satEciAt(sat, tSec) : null;
  const lighting = sun ? lightingStateAt(sun, sat.name, tSec) : null;
  const pointing = sat.sensor
    ? pointingStateAt(
        scheduleForPlatform(schedule, sat.name).filter((e) => !e.stale),
        tSec,
      )
    : null;
  return (
    <>
      <dl className="kv">
        <dt>Type</dt>
        <dd>Satellite - {sat.propagatorType}</dd>
        <dt>Ephemeris</dt>
        <dd>
          <span className={`badge ${src.className}`}>{src.text}</span>
        </dd>
        {lighting && (
          <>
            <dt>Lighting</dt>
            <dd>
              <span className={`badge ${LIGHTING_LABEL[lighting].className}`}>
                {LIGHTING_LABEL[lighting].text}
              </span>
            </dd>
          </>
        )}
        {sat.sensor && (
          <>
            <dt>Sensor</dt>
            <dd>
              FOV {sat.sensor.coneHalfAngleDeg} deg / FOR{" "}
              {sat.sensor.fieldOfRegardDeg} deg
            </dd>
            <dt>Pointing</dt>
            <dd>
              {pointing.phase === "idle" && "Nadir (home)"}
              {pointing.phase === "slew" &&
                `Slewing to ${pointing.entry.targetName} (${Math.round(
                  pointing.progress * 100,
                )}%)`}
              {pointing.phase === "track" &&
                `Tracking ${pointing.entry.targetName}`}
              {pointing.phase === "return" &&
                `Returning to nadir (home) from ${
                  pointing.entry.targetName
                } (${Math.round(pointing.progress * 100)}%)`}
            </dd>
          </>
        )}
        {sat.elements && (
          <>
            <dt>a</dt>
            <dd>{sat.elements.semiMajorAxisKm.toFixed(1)} km</dd>
            <dt>e</dt>
            <dd>{sat.elements.eccentricity.toFixed(5)}</dd>
            <dt>i</dt>
            <dd>{sat.elements.inclinationDeg.toFixed(2)} deg</dd>
            <dt>RAAN</dt>
            <dd>{sat.elements.raanDeg.toFixed(2)} deg</dd>
            <dt>argp</dt>
            <dd>{sat.elements.argPerigeeDeg.toFixed(2)} deg</dd>
            <dt>TA</dt>
            <dd>{sat.elements.trueAnomalyDeg.toFixed(2)} deg</dd>
          </>
        )}
        {sat.tle && (
          <>
            <dt>TLE</dt>
            <dd style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 10 }}>
              {sat.tle.line1}
              {"\n"}
              {sat.tle.line2}
            </dd>
          </>
        )}
      </dl>
      {lla && (
        <>
          <div className="panel-header">Current state</div>
          <dl className="kv">
            <dt>Latitude</dt>
            <dd>{lla[0].toFixed(3)} deg</dd>
            <dt>Longitude</dt>
            <dd>{lla[1].toFixed(3)} deg</dd>
            <dt>Altitude</dt>
            <dd>{lla[2].toFixed(1)} km</dd>
            <dt>ECI position</dt>
            <dd>
              [{eci.map((v) => v.toFixed(0)).join(", ")}] km
            </dd>
          </dl>
        </>
      )}
      {!lla && (
        <div className="empty-note">
          No ephemeris yet - run MATLAB to propagate this satellite.
        </div>
      )}
    </>
  );
}

function GroundDetails({ gp, tSec, sun }) {
  const daylight = sun ? daylightAt(sun, gp.name, tSec) : null;
  return (
    <dl className="kv">
      <dt>Type</dt>
      <dd>
        {gp.kind !== "target"
          ? "Ground Station"
          : gp.area
            ? "Area Grid Point"
            : "Point Target"}
      </dd>
      {gp.area && (
        <>
          <dt>Area</dt>
          <dd>
            {gp.area.name} ({gp.area.widthKm} x {gp.area.heightKm} km)
          </dd>
        </>
      )}
      {daylight !== null && (
        <>
          <dt>Local sun</dt>
          <dd>
            <span
              className={`badge ${daylight ? "badge--sunlit" : "badge--eclipse"}`}
            >
              {daylight ? "Daylight" : "Night"}
            </span>
          </dd>
        </>
      )}
      <dt>Latitude</dt>
      <dd>{gp.latitudeDeg.toFixed(4)} deg</dd>
      <dt>Longitude</dt>
      <dd>{gp.longitudeDeg.toFixed(4)} deg</dd>
      <dt>Altitude</dt>
      <dd>{gp.altitudeM.toFixed(0)} m</dd>
      {gp.minElevationDeg !== undefined && (
        <>
          <dt>Min elevation</dt>
          <dd>{gp.minElevationDeg.toFixed(1)} deg</dd>
        </>
      )}
      {gp.priority !== undefined && (
        <>
          <dt>Priority</dt>
          <dd>{gp.priority}</dd>
        </>
      )}
    </dl>
  );
}

function AccessWindows({ accesses, tSec }) {
  const rows = [];
  for (const a of accesses) {
    for (const w of a.windows) {
      rows.push({ pair: a, w });
    }
  }
  rows.sort((r1, r2) => r1.w.startSec - r2.w.startSec);

  if (rows.length === 0) {
    return <div className="empty-note">No access windows for this object.</div>;
  }
  return (
    <ul className="window-list">
      {rows.map(({ pair, w }, i) => {
        const active = !pair.stale && tSec >= w.startSec && tSec <= w.stopSec;
        return (
          <li
            key={i}
            className={`window-item ${active ? "active" : ""} ${pair.stale ? "stale" : ""}`}
            title={
              pair.stale
                ? `${pair.source} -> ${pair.target} (stale: scenario edited since MATLAB run)`
                : `${pair.source} -> ${pair.target}`
            }
          >
            <span className="pair">
              {w.startUtc.slice(11, 19)}Z
            </span>
            <span>{formatDuration(w.durationSeconds)}</span>
            {pair.stale && <span className="badge badge--pending">stale</span>}
            <span className="grow" />
            <span title="Max elevation">el {w.maxElevationDeg.toFixed(0)} deg</span>
            <button
              className="btn btn--icon"
              style={{ padding: "1px 7px", fontSize: 10.5 }}
              onClick={() => clock.setTime(w.startSec)}
              title="Jump scenario time to window start"
            >
              go
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Scheduled sensor tasks touching the selected object.
function ScheduleList({ entries, tSec }) {
  if (entries.length === 0) {
    return (
      <div className="empty-note">
        No scheduled tasks for this object. Add tasks under Insert &gt; Sensor
        Tasks, then run MATLAB.
      </div>
    );
  }
  return (
    <ul className="window-list">
      {entries.map((e, i) => {
        const active = !e.stale && tSec >= e.slewStartSec && tSec <= e.stopSec;
        return (
          <li
            key={i}
            className={`window-item ${active ? "active" : ""} ${e.stale ? "stale" : ""}`}
            title={`${e.taskName}: ${e.sensorName} (${e.platformName}) -> ${e.targetName}`}
          >
            <span className="pair">{e.startUtc.slice(11, 19)}Z</span>
            <span>{e.taskName}</span>
            {e.stale && <span className="badge badge--pending">stale</span>}
            <span className="grow" />
            <span title="Dwell duration (plus slew lead-in)">
              {formatDuration(e.durationSeconds)}
              {e.slewTimeSeconds > 0 &&
                ` (+${Math.round(e.slewTimeSeconds)}s slew)`}
            </span>
            <button
              className="btn btn--icon"
              style={{ padding: "1px 7px", fontSize: 10.5 }}
              onClick={() => clock.setTime(Math.max(e.slewStartSec, 0))}
              title="Jump scenario time to the start of the slew"
            >
              go
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// FOR-reachable vs FOV-in-view windows for sensor/target pairs touching the
// selected object.
function SensorAccessList({ pairs, tSec }) {
  const rows = [];
  for (const pair of pairs) {
    for (const w of pair.forWindows) rows.push({ pair, w, mode: "FOR" });
    for (const w of pair.fovWindows) rows.push({ pair, w, mode: "FOV" });
  }
  rows.sort((a, b) => a.w.startSec - b.w.startSec);
  if (rows.length === 0) {
    return (
      <div className="empty-note">
        No sensor-target visibility. FOR windows appear when a target is
        reachable by slewing; FOV windows when it is inside the beam.
      </div>
    );
  }
  return (
    <ul className="window-list">
      {rows.map(({ pair, w, mode }, i) => {
        const active = !pair.stale && tSec >= w.startSec && tSec <= w.stopSec;
        return (
          <li
            key={i}
            className={`window-item ${active ? "active" : ""} ${pair.stale ? "stale" : ""}`}
            title={
              mode === "FOR"
                ? `${pair.sensor} can slew to see ${pair.target}`
                : `${pair.target} inside ${pair.sensor}'s instantaneous beam`
            }
          >
            <span
              className={`badge ${mode === "FOR" ? "badge--for" : "badge--fov"}`}
            >
              {mode}
            </span>
            <span className="pair">{w.startUtc.slice(11, 19)}Z</span>
            <span>
              {pair.sensor} &gt; {pair.target}
            </span>
            {pair.stale && <span className="badge badge--pending">stale</span>}
            <span className="grow" />
            <span>{formatDuration(w.durationSeconds)}</span>
            <button
              className="btn btn--icon"
              style={{ padding: "1px 7px", fontSize: 10.5 }}
              onClick={() => clock.setTime(w.startSec)}
              title="Jump scenario time to window start"
            >
              go
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function Inspector({
  scenario,
  selection,
  job,
  onRunMatlab,
  onOpenDialog,
  onDeleteObject,
}) {
  const { tSec } = useSyncExternalStore(clock.subscribe, clock.getSnapshot);

  const sat = scenario?.satellites.find((s) => s.name === selection);
  const gp = scenario?.groundPoints.find((g) => g.name === selection);
  const related = scenario ? accessesForObject(scenario.accesses, selection) : [];
  const relatedSchedule = scenario
    ? scheduleForObject(scenario.schedule, selection)
    : [];
  const relatedSensorAccesses = scenario
    ? sensorAccessesForObject(scenario.sensorAccesses, selection)
    : [];

  const activeCount = scenario
    ? scenario.accesses.reduce(
        (n, a) =>
          n + (!a.stale && windowStateAt(a.windows, tSec).active ? 1 : 0),
        0,
      )
    : 0;

  const selectedSpec = sat?.spec ?? gp?.spec;

  return (
    <aside className="panel panel--right">
      <div className="panel-section">
        <div className="panel-header">
          <span>Inspector</span>
          <span style={{ textTransform: "none", fontWeight: 400 }}>
            {activeCount > 0 ? `${activeCount} link${activeCount > 1 ? "s" : ""} active` : ""}
          </span>
        </div>
        {!selection && (
          <div className="empty-note">
            Select an object in the browser or click a marker in the 3D view.
          </div>
        )}
        {selection && (
          <div
            className="panel-header"
            style={{ paddingTop: 0, textTransform: "none", fontSize: 13, color: "var(--text)" }}
          >
            <span>{selection}</span>
            {selectedSpec && (
              <span className="inspector-actions">
                <button
                  className="btn btn--icon"
                  onClick={() =>
                    onOpenDialog(
                      sat
                        ? { type: "satellite", initial: selectedSpec }
                        : { type: "ground", initial: selectedSpec },
                    )
                  }
                  title="Edit this object's definition"
                >
                  Edit
                </button>
                <button
                  className="btn btn--icon btn--danger"
                  onClick={() => onDeleteObject(selection)}
                  title="Delete this object from the scenario"
                >
                  Del
                </button>
              </span>
            )}
          </div>
        )}
        {sat && (
          <SatelliteDetails
            sat={sat}
            tSec={tSec}
            sun={scenario?.sun}
            schedule={scenario?.schedule ?? []}
          />
        )}
        {gp && <GroundDetails gp={gp} tSec={tSec} sun={scenario?.sun} />}
      </div>

      {selection && (
        <div className="panel-section">
          <div className="panel-header">Access windows</div>
          <AccessWindows accesses={related} tSec={tSec} />
        </div>
      )}

      {selection && (sat?.sensor || relatedSchedule.length > 0) && (
        <div className="panel-section">
          <div className="panel-header">Scheduled tasks</div>
          <ScheduleList entries={relatedSchedule} tSec={tSec} />
        </div>
      )}

      {selection && relatedSensorAccesses.length > 0 && (
        <div className="panel-section">
          <div className="panel-header">Sensor visibility (FOR / FOV)</div>
          <SensorAccessList pairs={relatedSensorAccesses} tSec={tSec} />
        </div>
      )}

      <div className="panel-section" style={{ borderBottom: "none" }}>
        <div className="panel-header">MATLAB bridge</div>
        <MatlabPanel job={job} onRunMatlab={onRunMatlab} dirty={scenario?.dirty} />
      </div>
    </aside>
  );
}
