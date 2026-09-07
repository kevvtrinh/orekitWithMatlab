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
import { AccessWindows, ScheduleList, SensorAccessList } from "./AnalysisResults.jsx";
import MatlabPanel from "./MatlabPanel.jsx";
import ConsoleIcon from "./ConsoleIcon.jsx";

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
  const mode = String(sat.sensor?.pointing ?? sat.sensor?.pointingMode ?? "Nadir");
  const homePointing = ({ nadir: "Nadir", velocityvector: "Velocity vector", fixedvector: "Fixed vector", target: "Configured target" })[mode.toLowerCase()] ?? mode;
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
              {pointing.phase === "idle" && `${homePointing} (home)`}
              {pointing.phase === "slew" &&
                `Slewing to ${pointing.entry.targetName} (${Math.round(
                  pointing.progress * 100,
                )}%)`}
              {pointing.phase === "track" &&
                `Tracking ${pointing.entry.targetName}`}
              {pointing.phase === "return" &&
                `Returning to ${homePointing.toLowerCase()} (home) from ${
                  pointing.entry.targetName
                } (${Math.round(pointing.progress * 100)}%)`}
            </dd>
          </>
        )}
        {sat.elements && (
          <>
            <dt>Semi-major axis</dt>
            <dd>{sat.elements.semiMajorAxisKm.toFixed(1)} km</dd>
            <dt>Eccentricity</dt>
            <dd>{sat.elements.eccentricity.toFixed(5)}</dd>
            <dt>Inclination</dt>
            <dd>{sat.elements.inclinationDeg.toFixed(2)} deg</dd>
            <dt>RAAN</dt>
            <dd>{sat.elements.raanDeg.toFixed(2)} deg</dd>
            <dt>Arg. of periapsis</dt>
            <dd>{sat.elements.argPerigeeDeg.toFixed(2)} deg</dd>
            <dt>True anomaly</dt>
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
          <div className="state-metrics">
            <div><span>Altitude</span><strong>{lla[2].toFixed(1)}<small> km</small></strong></div>
            <div><span>Latitude</span><strong>{lla[0].toFixed(2)}<small>°</small></strong></div>
            <div><span>Longitude</span><strong>{lla[1].toFixed(2)}<small>°</small></strong></div>
          </div>
          <dl className="kv">
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
            {gp.area.name}{gp.area.type !== "country" && ` (${gp.area.widthKm} × ${gp.area.heightKm} km)`}
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

export default function Inspector({
  scenario,
  selection,
  job,
  onRunMatlab,
  onOpenDialog,
  onDeleteObject,
  onFocusSatellite,
  onOpenSensorView,
}) {
  const { tSec } = useSyncExternalStore(clock.subscribe, clock.getSnapshot);

  const sat = scenario?.satellites.find((s) => s.name === selection);
  const gp = scenario?.groundPoints.find((g) => g.name === selection);
  const area = scenario?.areaOutlines.find((item) => item.name === selection);
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
    <aside className="panel panel--right" aria-label="Object details">
      <div className="panel-section">
        <div className="panel-heading">
          <h2>Object details</h2>
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
            className="selection-heading"
          >
            <h3>{selection}</h3>
            {selectedSpec && (
              <span className="inspector-actions">
                  {sat && <button className="btn btn--icon" disabled={!sat.ephemeris}
                  onClick={() => onFocusSatellite(sat.name)} title="Track this satellite in 3D">
                  <ConsoleIcon name="crosshair" size={12} /> Focus
                  </button>}
                  {sat?.sensor && <button className="btn btn--icon" onClick={() => onOpenSensorView(sat.name)}>
                    <ConsoleIcon name="sensor" size={12} /> Sensor view</button>}
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
                  Delete
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
        {area && <dl className="kv">
          <dt>Type</dt><dd>Area target</dd>
          <dt>Center latitude</dt><dd>{area.centerLatDeg.toFixed(4)}°</dd>
          <dt>Center longitude</dt><dd>{area.centerLonDeg.toFixed(4)}°</dd>
            {area.type === "country" ? <><dt>Country</dt><dd>{area.countryName} ({area.countryCode})</dd>
              <dt>Boundary source</dt><dd>{area.source}</dd></> : <><dt>Dimensions</dt><dd>{area.widthKm} × {area.heightKm} km</dd></>}
          <dt>Grid spacing</dt><dd>{area.spacingKm} km</dd>
          <dt>Sample points</dt><dd>{scenario.groundPoints.filter((point) => point.area?.name === area.name).length}</dd>
        </dl>}
      </div>

      {selection && (
        <div className="panel-section">
          <div className="panel-header">Access windows</div>
          <AccessWindows accesses={related} tSec={tSec} objectName={selection} />
        </div>
      )}

      {selection && (sat?.sensor || relatedSchedule.length > 0) && (
        <div className="panel-section">
          <div className="panel-header">Scheduled tasks</div>
          <ScheduleList key={selection} entries={relatedSchedule} tSec={tSec} />
        </div>
      )}

      {selection && relatedSensorAccesses.length > 0 && (
        <div className="panel-section">
          <div className="panel-header">Sensor visibility (FOR / FOV)</div>
          <SensorAccessList pairs={relatedSensorAccesses} tSec={tSec} />
        </div>
      )}

      <div className="panel-section" style={{ borderBottom: "none" }}>
        <div className="panel-header">Analysis engine</div>
        <MatlabPanel job={job} onRunMatlab={onRunMatlab} dirty={scenario?.dirty} />
      </div>
    </aside>
  );
}
