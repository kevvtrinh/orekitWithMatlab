import { useEffect, useMemo, useRef, useState } from "react";
import { createViewer } from "../three/viewer.js";
import ConsoleIcon from "./ConsoleIcon.jsx";
import OrbitEditPanel from "./OrbitEditPanel.jsx";

export default function Viewport3D({ scenario, selection, viewOptions, onSelect, onToggleOption, onSetReferenceFrame, onOrbitCommit, focusRequest }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [focusedName, setFocusedName] = useState(null);
  const [orbitEdit, setOrbitEdit] = useState(null);
  const [orbitError, setOrbitError] = useState(null);
  const onOrbitCommitRef = useRef(onOrbitCommit);
  onOrbitCommitRef.current = onOrbitCommit;
  const selectedSatellite = scenario?.satellites.find((sat) => sat.name === selection);
  const selectedArea = scenario?.areaOutlines.find((area) => area.name === selection);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // The viewer draws only what has geometry: satellites without an ephemeris
  // (TLE objects awaiting a MATLAB run) and stale access/schedule data are
  // dropped.
  const drawable = useMemo(() => {
    if (!scenario) return null;
    return {
      ...scenario,
      satellites: scenario.satellites.filter((s) => s.ephemeris),
      accesses: scenario.accesses.filter((a) => !a.stale),
      schedule: (scenario.schedule ?? []).filter((e) => !e.stale),
      sensorAccesses: (scenario.sensorAccesses ?? []).filter((a) => !a.stale),
    };
  }, [scenario]);

  useEffect(() => {
    const viewer = createViewer(containerRef.current, {
      onSelect: (name) => onSelectRef.current?.(name),
      onFocusChange: setFocusedName,
      onOrbitEditChange: setOrbitEdit,
      onOrbitCommit: async (name, orbit) => {
        setOrbitError(null);
        try {
          const result = await onOrbitCommitRef.current?.(name, orbit);
          if (result?.errors) setOrbitError(result.errors.join(" "));
          return result;
        } catch (error) {
          setOrbitError(error.message);
          return { errors: [error.message] };
        }
      },
    });
    viewerRef.current = viewer;
    return () => {
      viewer.dispose();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setScenario(drawable);
    setFocusedName(viewerRef.current?.getFocusedSatellite?.() ?? null);
  }, [drawable]);

  useEffect(() => {
    viewerRef.current?.setSelection(selection);
  }, [selection, drawable]);

  useEffect(() => {
    viewerRef.current?.setOptions(viewOptions);
  }, [viewOptions, drawable]);

  useEffect(() => {
    if (focusRequest?.kind === "area") {
      viewerRef.current?.focusArea(focusRequest.name);
      setFocusedName(null);
    } else if (focusRequest && viewerRef.current?.focusSatellite(focusRequest.name)) {
      setFocusedName(focusRequest.name);
    }
  }, [focusRequest]);

  return (
    <div className="viewport" ref={containerRef} role="region" aria-label="Three-dimensional orbital view">
      <div className="viewport-hud">
        <h1 className="viewport-title">{focusedName ?? "Orbital view"}</h1>
        <span className="viewport-frame">{focusedName ? "TRACKING · " : ""}{viewOptions.referenceFrame === "ECEF" ? "EARTH FIXED" : "INERTIAL · J2000"}</span>
        <div className="viewport-legend" aria-label="Rendered objects">
          <span><ConsoleIcon name="satellite" size={14} />
            {drawable?.satellites.length ?? 0} satellites</span>
          <span><ConsoleIcon name="ground" size={14} />
            {drawable?.groundPoints.filter((point) => !point.area).length ?? 0} ground sites</span>
          {Boolean(drawable?.areaOutlines.length) && <span><ConsoleIcon name="globe" size={14} />
            {drawable.areaOutlines.length} {drawable.areaOutlines.length === 1 ? "area" : "areas"}</span>}
        </div>
        {focusedName && <div className="model-note">Illustrative spacecraft model · not to scale</div>}
      </div>
      <div className="viewport-toolbar">
        <div className="frame-switch" role="group" aria-label="View reference frame">
          {["ECI", "ECEF"].map((frame) => <button key={frame}
            aria-pressed={viewOptions.referenceFrame === frame}
            title={frame === "ECI" ? "Earth-centered inertial view" : "Earth-centered Earth-fixed view"}
            onClick={() => onSetReferenceFrame(frame)}>{frame}</button>)}
        </div>
        <button
          className="btn btn--icon"
          title="Reset camera"
          aria-label="Reset camera"
          onClick={() => { viewerRef.current?.resetCamera(); setFocusedName(null); }}
        >
          <ConsoleIcon name="crosshair" size={19} />
        </button>
      </div>
      <div className="viewport-layers" role="group" aria-label="Display layers">
        {[["groundTracks", "Ground tracks", "orbit"], ["accessLines", "Access lines", "activity"],
          ["sensorFov", "Sensor field of view", "sensor"], ["labels", "Object labels", "file"]].map(([key, label, icon]) => (
          <button key={key} className="btn btn--icon btn--toggle" title={label}
            aria-label={label} aria-pressed={viewOptions[key]} onClick={() => onToggleOption(key)}>
            <ConsoleIcon name={icon} size={17} />
          </button>
        ))}
      </div>
      {selectedSatellite && !orbitEdit && <button className="btn viewport-edit-orbit"
        disabled={selectedSatellite.spec?.orbit?.type !== "keplerian"}
        title={selectedSatellite.spec?.orbit?.type === "keplerian" ? "Drag handles to reshape or rotate this orbit" : "Direct editing requires a Keplerian orbit definition"}
        onClick={() => { setOrbitError(null); viewerRef.current?.startOrbitEditing(selection); }}>
        <ConsoleIcon name="orbit" size={15} /> Edit orbit
      </button>}
      {selectedArea && <button className="btn viewport-edit-orbit" onClick={() => viewerRef.current?.focusArea(selection)}>
        <ConsoleIcon name="crosshair" size={15} /> View area</button>}
      {orbitEdit && <OrbitEditPanel edit={orbitEdit} error={orbitError}
        onClose={() => viewerRef.current?.finishOrbitEditing()}
        onCommit={(orbit) => viewerRef.current?.commitOrbit(orbit)} />}
      <div className="viewport-hint" aria-hidden="true">
        Drag to orbit {focusedName ? "satellite" : ""} <span>·</span> Scroll to zoom
        {!focusedName && <><span>·</span> Right-drag to pan</>}
      </div>
    </div>
  );
}
