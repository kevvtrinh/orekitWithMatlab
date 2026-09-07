import { useEffect, useRef, useState } from "react";
import ConsoleIcon from "./ConsoleIcon.jsx";
import { formatUtc } from "../lib/time.js";
import SensorAnglePlot from "./SensorAnglePlot.jsx";
import { layoutFrameLabels } from "../lib/frameLabels.js";
import SlewPlannerControls from "./SlewPlannerControls.jsx";

export default function SensorViewWindow({ viewerRef, scenario, name, onChangeSensor, onClose, onSelect }) {
  const stageRef = useRef(null);
  const closeRef = useRef(null);
  const [frame, setFrame] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("camera");
  const modeRef = useRef(mode); modeRef.current = mode;
  const sensors = scenario?.satellites.filter((satellite) => satellite.sensor) ?? [];
  useEffect(() => {
    setFrame(null); setError(null);
    try { return viewerRef.current?.attachSensorView(stageRef.current, name, setFrame, () => modeRef.current); }
    catch (err) { setError(`Sensor view could not be opened: ${err.message}`); }
  }, [viewerRef, name]);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const radius = Math.min(frame?.width ?? 1, frame?.height ?? 1) * (frame?.reticleFraction ?? 1) / 2;
  const markers = frame?.markers ?? [];
  const cameraLabels = layoutFrameLabels(markers.map((marker) => ({ ...marker,
    x: marker.x * frame.width, y: marker.y * frame.height })), frame?.width ?? 1, frame?.height ?? 1);
  return <section className={`sensor-view-window ${expanded ? "sensor-view-window--expanded" : ""}`}
    role="dialog" aria-modal="false" aria-label="Sensor view" onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
    <header className="sensor-view-header"><div><ConsoleIcon name="sensor" size={16} /><strong>Sensor view</strong></div>
      <div><button className="btn btn--icon" title={expanded ? "Restore sensor window" : "Expand sensor window"}
        aria-label={expanded ? "Restore sensor window" : "Expand sensor window"} onClick={() => setExpanded(!expanded)}><ConsoleIcon name="layers" size={15} /></button>
        <button ref={closeRef} className="btn btn--icon" aria-label="Close sensor view" onClick={onClose}><ConsoleIcon name="close" size={16} /></button></div></header>
    <div className="sensor-view-controls"><select aria-label="Sensor camera" value={name} onChange={(event) => onChangeSensor(event.target.value)}>
      {sensors.map((satellite) => <option key={satellite.name} value={satellite.name}>{satellite.sensor.name || `${satellite.name} Sensor`}</option>)}
    </select><button className="btn" aria-pressed={showLabels} onClick={() => setShowLabels(!showLabels)}>Labels</button></div>
    <div className="sensor-view-tabs" role="tablist" aria-label="Sensor view coordinates">
      {[["camera", "Camera"], ["azel", "Az/El"], ["polar", "Polar"]].map(([value, label]) =>
        <button key={value} id={`sensor-view-tab-${value}`} role="tab" aria-selected={mode === value}
          aria-controls="sensor-view-panel" tabIndex={mode === value ? 0 : -1} onClick={() => setMode(value)}
          onKeyDown={(event) => {
            const modes = ["camera", "azel", "polar"];
            const next = event.key === "ArrowRight" ? (modes.indexOf(mode) + 1) % 3 : event.key === "ArrowLeft" ? (modes.indexOf(mode) + 2) % 3
              : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
            if (next >= 0) { event.preventDefault(); setMode(modes[next]); document.getElementById(`sensor-view-tab-${modes[next]}`)?.focus(); }
          }}>{label}</button>)}
    </div>
    <div ref={stageRef} className="sensor-view-stage" id="sensor-view-panel" role="tabpanel" aria-labelledby={`sensor-view-tab-${mode}`}>
      {frame && !frame.unavailable && <>
        {mode !== "camera" && <SensorAnglePlot frame={frame} mode={mode} showLabels={showLabels} onSelect={onSelect} />}
        {mode === "camera" && <>
        <svg className="sensor-view-reticle" viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true">
          <path d={`M0 0H${frame.width}V${frame.height}H0Z M${frame.width / 2 - radius} ${frame.height / 2} a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 ${-radius * 2} 0Z`} fillRule="evenodd" fill="#02060988" />
          <circle cx={frame.width / 2} cy={frame.height / 2} r={radius} />
          <path d={`M${frame.width / 2 - 9} ${frame.height / 2}h18 M${frame.width / 2} ${frame.height / 2 - 9}v18`} />
        </svg>
        <div className="sensor-view-stamp">{formatUtc(new Date(frame.epochMs + frame.tSec * 1000))}<br />{frame.source} · {frame.phase}</div>
        {showLabels && cameraLabels.map((marker) => <button key={marker.name} className={`sensor-view-marker sensor-view-marker--${marker.kind}`}
          style={{ left: marker.x, top: marker.y }} onClick={() => onSelect(marker.name)}
          title={`${marker.name} · ${marker.rangeKm.toFixed(1)} km slant range`}>
          <ConsoleIcon name={marker.kind === "area" ? "globe" : marker.kind} size={14} /><span style={{ position: "absolute",
            left: marker.labelX - marker.x + 7, top: marker.labelY - marker.y + 7 }}>{marker.name}</span></button>)}
        </>}
      </>}
      {(error || frame?.unavailable || !frame) && <div className="sensor-view-empty" role="status">{error ||
        (frame?.unavailable ? "This sensor needs a propagated satellite. Run the scenario to generate its view." : "Opening sensor camera…")}</div>}
    </div>
    <div className="sensor-view-readout"><span>FOV {frame?.halfAngleDeg != null ? `${(frame.halfAngleDeg * 2).toFixed(1)}°` : "—"}</span>
      <span>{markers.length} labeled objects in frame</span><span>Velocity up</span></div>
    <div className="sensor-view-objects">{markers.length ? markers.map((marker) => <button key={marker.name} onClick={() => onSelect(marker.name)}>
      <ConsoleIcon name={marker.kind === "area" ? "globe" : marker.kind} size={13} />{marker.name}</button>) : <span>No target or station markers in this frame. Move the timeline to another pass.</span>}</div>
    <p className="sensor-view-note">{mode === "camera" && frame?.cropped ? "Camera cropped to 170°. " : ""}
      {mode === "polar" ? "Radius: off-boresight angle. Bearing: clockwise from image up. " : mode === "azel" ? "Azimuth right; elevation up; boresight at (0°, 0°). " : "Geometric view · no terrain occlusion or detection model. "}
      Use the mission timeline below.</p>
    <SlewPlannerControls key={name} scenario={scenario} name={name} viewerRef={viewerRef} onShowGlobe={onClose} />
  </section>;
}
