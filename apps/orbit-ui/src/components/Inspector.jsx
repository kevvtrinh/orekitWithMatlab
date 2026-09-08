import { useSyncExternalStore } from "react";
import { clock } from "../lib/clock.js";
import { accessesForObject, satEciAt, satLlaAt, windowStateAt } from "../lib/scenarioUtils.js";
import { pointingStateAt, scheduleForObject, scheduleForPlatform, sensorAccessesForObject } from "../lib/schedule.js";
import { daylightAt, lightingStateAt } from "../lib/sun.js";
import { formatDuration } from "../lib/time.js";
import { AccessWindows, ScheduleList, SensorAccessList } from "./AnalysisResults.jsx";
import MatlabPanel from "./MatlabPanel.jsx";
import ConsoleIcon from "./ConsoleIcon.jsx";
import "./inspector-polish.css";

const SOURCE_LABEL = {
  matlab: { text: "MATLAB / Orekit", className: "badge--matlab" },
  preview: { text: "Browser preview", className: "badge--preview" },
  pending: { text: "Awaiting computation", className: "badge--pending" },
};
const LIGHTING_LABEL = {
  Sunlit: { text: "Sunlit", className: "badge--sunlit" },
  Penumbra: { text: "Penumbra", className: "badge--eclipse" },
  Umbra: { text: "Eclipse · umbra", className: "badge--eclipse" },
};
const numeric = (value, digits = 0) => Number.isFinite(value) ? value.toFixed(digits) : "—";

function InspectorSectionTitle({ children, count, icon }) {
  return <div className="panel-header inspector-section-title">
    <span>{icon && <ConsoleIcon name={icon} size={13} />}{children}</span>
    {count !== undefined && <span className="inspector-section-count">{count}</span>}
  </div>;
}

function SatelliteDetails({ sat, tSec, playing, sun, schedule }) {
  const mode = String(sat.sensor?.pointing ?? sat.sensor?.pointingMode ?? "Nadir");
  const homePointing = ({ nadir: "Nadir", velocityvector: "Velocity vector", fixedvector: "Fixed vector", target: "Configured target" })[mode.toLowerCase()] ?? mode;
  const src = SOURCE_LABEL[sat.source] ?? { text: "Source unavailable", className: "badge--pending" };
  const hasEphemeris = sat.ephemeris?.n > 0;
  const lla = hasEphemeris
    ? sat.ephemeris.n === 1 ? Array.from(sat.ephemeris.lla.slice(0, 3)) : satLlaAt(sat, tSec)
    : null;
  const eci = hasEphemeris ? satEciAt(sat, tSec) : null;
  const lighting = sun ? LIGHTING_LABEL[lightingStateAt(sun, sat.name, tSec)] : null;
  const pointing = sat.sensor
    ? pointingStateAt(scheduleForPlatform(schedule, sat.name).filter((entry) => !entry.stale), tSec)
    : null;
  const pointingText = pointing?.phase === "track"
    ? `Tracking ${pointing.entry.targetName}`
    : pointing?.phase === "slew"
      ? `Slewing to ${pointing.entry.targetName}`
      : pointing?.phase === "return"
        ? `Returning from ${pointing.entry.targetName}`
        : `${homePointing} · home`;

  return <>
    <div className="inspector-badges">
      <span className={`badge ${src.className}`}>{src.text}</span>
      {lighting && <span className={`badge ${lighting.className}`}>
        <ConsoleIcon name={lighting.text === "Sunlit" ? "sun" : "orbit"} size={11} />{lighting.text}
      </span>}
    </div>
    {lla ? <div className="inspector-telemetry">
      <div className="inspector-telemetry-heading">
        <span>Position at simulation time</span>
        <span className={`inspector-simulation-state${playing ? " is-playing" : ""}`} title={playing ? "Simulation running" : "Simulation paused"}>
          <i />{playing ? "Running" : "Paused"}
        </span>
      </div>
      <div className="inspector-altitude">
        <span>Altitude</span><strong>{numeric(lla[2], 1)}<small>km</small></strong>
      </div>
      <div className="inspector-coordinates">
        <div><span>Latitude</span><strong>{numeric(lla[0], 2)}<small>°</small></strong></div>
        <div><span>Longitude</span><strong>{numeric(lla[1], 2)}<small>°</small></strong></div>
      </div>
    </div> : <div className="inspector-pending">
      <ConsoleIcon name="orbit" size={20} />
      <div><strong>Orbit ready to compute</strong><p>Run the scenario to propagate this satellite and see its position.</p></div>
    </div>}
    {sat.sensor && <div className="inspector-sensor-card">
      <div className="inspector-sensor-title"><ConsoleIcon name="sensor" size={15} /><span>Sensor pointing</span>
        <span className={`inspector-phase${pointing.phase === "track" ? " is-tracking" : ""}`}>
          {({ idle: "Home", slew: "Slewing", track: "Tracking", return: "Returning" })[pointing.phase]}
        </span>
      </div>
      <strong className="inspector-pointing-target">{pointingText}</strong>
      {(pointing.phase === "slew" || pointing.phase === "return") && <div className="inspector-slew-progress"
        role="progressbar" aria-label={pointing.phase === "return" ? `Returning to ${homePointing}` : pointingText}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pointing.progress * 100)}>
        <span style={{ width: `${Math.max(0, Math.min(100, pointing.progress * 100))}%` }} />
      </div>}
      <div className="inspector-sensor-limits"><span title="Sensor cone half-angle">FOV <b>{sat.sensor.coneHalfAngleDeg}°</b></span>
        <span title="Sensor field of regard">FOR <b>{sat.sensor.fieldOfRegardDeg}°</b></span>
        {pointing.phase === "return" && <span>Home: <b>{homePointing}</b></span>}
      </div>
    </div>}
    <details className="inspector-disclosure">
      <summary><span><ConsoleIcon name="orbit" size={13} />Orbit definition</span><ConsoleIcon name="chevronDown" size={13} /></summary>
      <dl className="kv inspector-definition">
        <dt>Propagator</dt><dd>{sat.propagatorType || "Not specified"}</dd>
        {sat.elements && <>
          <dt>Semi-major axis</dt><dd>{numeric(sat.elements.semiMajorAxisKm, 1)} km</dd>
          <dt>Eccentricity</dt><dd>{numeric(sat.elements.eccentricity, 5)}</dd>
          <dt>Inclination</dt><dd>{numeric(sat.elements.inclinationDeg, 2)}°</dd>
          <dt>RAAN</dt><dd>{numeric(sat.elements.raanDeg, 2)}°</dd>
          <dt>Arg. of periapsis</dt><dd>{numeric(sat.elements.argPerigeeDeg, 2)}°</dd>
          <dt>True anomaly</dt><dd>{numeric(sat.elements.trueAnomalyDeg, 2)}°</dd>
        </>}
        {eci && <><dt>ECI position</dt><dd className="inspector-vector">[{eci.map((value) => numeric(value)).join(", ")}] km</dd></>}
      </dl>
      {sat.tle && <div className="inspector-tle"><span>Two-line elements</span><pre>{sat.tle.line1}{"\n"}{sat.tle.line2}</pre></div>}
    </details>
  </>;
}

function GroundDetails({ gp, tSec, sun }) {
  const daylight = sun ? daylightAt(sun, gp.name, tSec) : null;
  return <>
    {daylight !== null && <div className="inspector-badges"><span className={`badge ${daylight ? "badge--sunlit" : "badge--eclipse"}`}>
      <ConsoleIcon name={daylight ? "sun" : "orbit"} size={11} />{daylight ? "Local daylight" : "Local night"}
    </span></div>}
    <div className="inspector-telemetry inspector-telemetry--ground">
      <div className="inspector-telemetry-heading"><span>Ground position</span><ConsoleIcon name="globe" size={13} /></div>
      <div className="inspector-coordinates">
        <div><span>Latitude</span><strong>{numeric(gp.latitudeDeg, 4)}<small>°</small></strong></div>
        <div><span>Longitude</span><strong>{numeric(gp.longitudeDeg, 4)}<small>°</small></strong></div>
      </div>
      <div className="inspector-ground-altitude"><span>Altitude</span><strong>{numeric(gp.altitudeM)} <small>m</small></strong></div>
    </div>
    <dl className="kv inspector-definition">
      {gp.area && <><dt>Area</dt><dd>{gp.area.name}{gp.area.type !== "country" && ` (${gp.area.widthKm} × ${gp.area.heightKm} km)`}</dd></>}
      {gp.minElevationDeg !== undefined && <><dt>Min elevation</dt><dd>{numeric(gp.minElevationDeg, 1)}°</dd></>}
      {gp.priority !== undefined && <><dt>Priority</dt><dd>{gp.priority}</dd></>}
    </dl>
  </>;
}

function AccessSummary({ accesses, selection, tSec }) {
  let firstActive = null;
  let firstNext = null;
  for (const pair of accesses) {
    if (pair.stale) continue;
    const state = windowStateAt(pair.windows, tSec);
    const partner = pair.source === selection ? pair.target : pair.source;
    if (state.active && (!firstActive || state.active.stopSec < firstActive.window.stopSec)) firstActive = { window: state.active, partner };
    if (state.next && (!firstNext || state.next.startSec < firstNext.window.startSec)) firstNext = { window: state.next, partner };
  }
  const upcoming = firstActive ?? firstNext;
  if (!upcoming) return null;
  return <div className={`inspector-access-summary${firstActive ? " is-active" : ""}`}>
    <div className="inspector-access-symbol"><ConsoleIcon name="activity" size={16} /></div>
    <div className="inspector-access-copy">
      <span>{firstActive ? "In contact" : "Next access"}</span>
      <strong title={upcoming.partner}>{upcoming.partner}</strong>
      <small>{firstActive ? `${formatDuration(Math.max(0, upcoming.window.stopSec - tSec))} remaining` : `In ${formatDuration(upcoming.window.startSec - tSec)}`}</small>
    </div>
    {!firstActive && <button className="inspector-access-jump" onClick={() => clock.setTime(upcoming.window.startSec)}
      title={`Go to access with ${upcoming.partner}`} aria-label={`Go to next access with ${upcoming.partner}`}>
      <ConsoleIcon name="arrowRight" size={16} />
    </button>}
  </div>;
}

export default function Inspector({ scenario, selection, job, onRunMatlab, onOpenDialog, onDeleteObject, onFocusSatellite, onOpenSensorView }) {
  const { tSec, playing } = useSyncExternalStore(clock.subscribe, clock.getSnapshot);
  const sat = scenario?.satellites.find((object) => object.name === selection);
  const gp = scenario?.groundPoints.find((object) => object.name === selection);
  const area = scenario?.areaOutlines?.find((object) => object.name === selection);
  const related = scenario ? accessesForObject(scenario.accesses, selection) : [];
  const relatedSchedule = scheduleForObject(scenario?.schedule, selection);
  const relatedSensorAccesses = sensorAccessesForObject(scenario?.sensorAccesses, selection);
  const selectedSpec = sat?.spec ?? gp?.spec;
  const selectedKind = sat ? "Satellite" : area ? "Area target" : gp?.kind === "target" ? gp.area ? "Area grid point" : "Point target" : gp ? "Ground station" : "Mission object";
  const selectedIcon = sat ? "satellite" : area || gp?.kind === "target" ? "target" : "ground";
  const relatedActiveCount = related.filter((pair) => !pair.stale && windowStateAt(pair.windows, tSec).active).length;

  return <aside className="panel panel--right mission-inspector" aria-label="Object details">
    <div className="panel-heading inspector-topbar">
      <h2><ConsoleIcon name="settings" size={14} />Inspector</h2>
      <span className="inspector-topbar-state">{selection ? "Object details" : "Mission overview"}</span>
    </div>
    <div className="panel-section inspector-object-section">
      {!selection && <div className="inspector-empty-state">
        <div className="inspector-empty-orbit" aria-hidden="true"><ConsoleIcon name="orbit" size={39} /><i /></div>
        <span className="inspector-eyebrow">Explore your mission</span>
        <h3>Every object.<br />A closer look.</h3>
        <p>Select a satellite, station, or target in the browser or 3D view to inspect its state and access windows.</p>
        <div className="inspector-empty-guide"><ConsoleIcon name="crosshair" size={15} /><span>Select an object to begin</span></div>
        {scenario && <div className="inspector-overview-counts">
          <div><strong>{scenario.satellites.length}</strong><span>Satellites</span></div>
          <div><strong>{scenario.groundPoints.length}</strong><span>Ground objects</span></div>
        </div>}
      </div>}
      {selection && <>
        <div className="inspector-object-identity">
          <div className="inspector-object-type"><span className="inspector-object-glyph" style={{ "--object-color": sat?.color ?? "var(--accent)" }}>
            <ConsoleIcon name={selectedIcon} size={16} /></span><span>{selectedKind}</span>
            {relatedActiveCount > 0 && <span className="inspector-contact-count"><i />{relatedActiveCount} active</span>}
          </div>
          <h3>{selection}</h3>
          {sat?.propagatorType && <p className="inspector-object-subtitle">{sat.propagatorType} propagation{sat.sensor ? " · Sensor equipped" : ""}</p>}
        </div>
        {selectedSpec && <div className="inspector-actions">
          {sat && <button className="btn inspector-focus-btn" disabled={!sat.ephemeris?.n}
            onClick={() => onFocusSatellite(sat.name)} title="Track this satellite in 3D"><ConsoleIcon name="crosshair" size={13} />Focus</button>}
          {sat?.sensor && <button className="btn" onClick={() => onOpenSensorView(sat.name)}><ConsoleIcon name="sensor" size={13} />Sensor view</button>}
          <button className="btn" onClick={() => onOpenDialog(sat ? { type: "satellite", initial: selectedSpec } : { type: "ground", initial: selectedSpec })}
            title="Edit this object's definition"><ConsoleIcon name="settings" size={12} />Edit</button>
          <button className="btn btn--danger inspector-delete-btn" onClick={() => onDeleteObject(selection)}
            aria-label={`Delete ${selection}`} title="Delete this object from the scenario"><ConsoleIcon name="trash" size={13} /></button>
        </div>}
      </>}
      {sat && <SatelliteDetails sat={sat} tSec={tSec} playing={playing} sun={scenario?.sun} schedule={scenario?.schedule ?? []} />}
      {gp && <GroundDetails gp={gp} tSec={tSec} sun={scenario?.sun} />}
      {area && <>
        <div className="inspector-telemetry inspector-telemetry--ground">
          <div className="inspector-telemetry-heading"><span>Area center</span><ConsoleIcon name="target" size={13} /></div>
          <div className="inspector-coordinates">
            <div><span>Latitude</span><strong>{numeric(area.centerLatDeg, 4)}<small>°</small></strong></div>
            <div><span>Longitude</span><strong>{numeric(area.centerLonDeg, 4)}<small>°</small></strong></div>
          </div>
        </div>
        <dl className="kv inspector-definition">
          {area.type === "country" ? <><dt>Country</dt><dd>{area.countryName} ({area.countryCode})</dd><dt>Boundary source</dt><dd>{area.source}</dd></>
            : <><dt>Dimensions</dt><dd>{area.widthKm} × {area.heightKm} km</dd></>}
          <dt>Grid spacing</dt><dd>{area.spacingKm} km</dd>
          <dt>Sample points</dt><dd>{scenario.groundPoints.filter((point) => point.area?.name === area.name).length}</dd>
        </dl>
      </>}
    </div>
    {selection && <div className="panel-section inspector-results-section">
      <InspectorSectionTitle icon="activity" count={related.reduce((total, pair) => total + pair.windows.length, 0)}>Access windows</InspectorSectionTitle>
      <AccessSummary accesses={related} selection={selection} tSec={tSec} />
      <AccessWindows key={selection} accesses={related} tSec={tSec} objectName={selection} />
    </div>}
    {selection && (sat?.sensor || relatedSchedule.length > 0) && <div className="panel-section inspector-results-section">
      <InspectorSectionTitle icon="layers" count={relatedSchedule.length}>Scheduled tasks</InspectorSectionTitle>
      <ScheduleList key={selection} entries={relatedSchedule} tSec={tSec} />
    </div>}
    {selection && relatedSensorAccesses.length > 0 && <div className="panel-section inspector-results-section">
      <InspectorSectionTitle icon="sensor" count={relatedSensorAccesses.length}>Sensor visibility</InspectorSectionTitle>
      <SensorAccessList key={selection} pairs={relatedSensorAccesses} tSec={tSec} />
    </div>}
    <div className="panel-section inspector-engine-section">
      <InspectorSectionTitle icon="activity">Analysis engine</InspectorSectionTitle>
      <MatlabPanel job={job} onRunMatlab={onRunMatlab} dirty={scenario?.dirty} />
    </div>
  </aside>;
}
