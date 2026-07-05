import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import {
  accessesForObject,
  satEciAt,
  satLlaAt,
  windowStateAt,
} from "../lib/scenarioUtils.js";
import { formatDuration } from "../lib/time.js";
import MatlabPanel from "./MatlabPanel.jsx";

const SOURCE_LABEL = {
  matlab: { text: "MATLAB/Orekit", className: "badge--matlab" },
  preview: { text: "browser preview", className: "badge--preview" },
  pending: { text: "awaiting MATLAB run", className: "badge--pending" },
};

function SatelliteDetails({ sat, tSec }) {
  const src = SOURCE_LABEL[sat.source];
  const lla = sat.ephemeris ? satLlaAt(sat, tSec) : null;
  const eci = sat.ephemeris ? satEciAt(sat, tSec) : null;
  return (
    <>
      <dl className="kv">
        <dt>Type</dt>
        <dd>Satellite - {sat.propagatorType}</dd>
        <dt>Ephemeris</dt>
        <dd>
          <span className={`badge ${src.className}`}>{src.text}</span>
        </dd>
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

function GroundDetails({ gp }) {
  return (
    <dl className="kv">
      <dt>Type</dt>
      <dd>{gp.kind === "target" ? "Point Target" : "Ground Station"}</dd>
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
        {sat && <SatelliteDetails sat={sat} tSec={tSec} />}
        {gp && <GroundDetails gp={gp} />}
      </div>

      {selection && (
        <div className="panel-section">
          <div className="panel-header">Access windows</div>
          <AccessWindows accesses={related} tSec={tSec} />
        </div>
      )}

      <div className="panel-section" style={{ borderBottom: "none" }}>
        <div className="panel-header">MATLAB bridge</div>
        <MatlabPanel job={job} onRunMatlab={onRunMatlab} dirty={scenario?.dirty} />
      </div>
    </aside>
  );
}
