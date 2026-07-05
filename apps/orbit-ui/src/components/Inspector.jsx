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

function SatelliteDetails({ sat, tSec }) {
  const lla = satLlaAt(sat, tSec);
  const eci = satEciAt(sat, tSec);
  return (
    <>
      <dl className="kv">
        <dt>Type</dt>
        <dd>Satellite - {sat.propagatorType}</dd>
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
          </>
        )}
      </dl>
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
  );
}

function GroundDetails({ gp }) {
  return (
    <dl className="kv">
      <dt>Type</dt>
      <dd>{gp.type}</dd>
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
        const active = tSec >= w.startSec && tSec <= w.stopSec;
        return (
          <li key={i} className={`window-item ${active ? "active" : ""}`}>
            <span className="pair" title={`${pair.source} -> ${pair.target}`}>
              {w.startUtc.slice(11, 19)}Z
            </span>
            <span>{formatDuration(w.durationSeconds)}</span>
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

export default function Inspector({ scenario, selection, job, onRunMatlab }) {
  const { tSec } = useSyncExternalStore(clock.subscribe, clock.getSnapshot);

  const sat = scenario?.satellites.find((s) => s.name === selection);
  const gp = scenario?.groundPoints.find((g) => g.name === selection);
  const related = scenario ? accessesForObject(scenario.accesses, selection) : [];

  // Count currently-active windows across the scenario for the header badge.
  const activeCount = scenario
    ? scenario.accesses.reduce(
        (n, a) => n + (windowStateAt(a.windows, tSec).active ? 1 : 0),
        0,
      )
    : 0;

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
          <div className="panel-header" style={{ paddingTop: 0, textTransform: "none", fontSize: 13, color: "var(--text)" }}>
            {selection}
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
        <MatlabPanel job={job} onRunMatlab={onRunMatlab} />
      </div>
    </aside>
  );
}
