import { useEffect, useMemo, useRef } from "react";
import { createViewer } from "../three/viewer.js";

export default function Viewport3D({ scenario, selection, viewOptions, onSelect }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
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
      schedule: scenario.schedule.filter((e) => !e.stale),
      sensorAccesses: scenario.sensorAccesses.filter((a) => !a.stale),
    };
  }, [scenario]);

  useEffect(() => {
    const viewer = createViewer(containerRef.current, {
      onSelect: (name) => onSelectRef.current?.(name),
    });
    viewerRef.current = viewer;
    return () => {
      viewer.dispose();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setScenario(drawable);
  }, [drawable]);

  useEffect(() => {
    viewerRef.current?.setSelection(selection);
  }, [selection, drawable]);

  useEffect(() => {
    viewerRef.current?.setOptions(viewOptions);
  }, [viewOptions, drawable]);

  return (
    <div className="viewport" ref={containerRef}>
      <div className="viewport-hud">
        <span className="hud-chip">ECI - J2000</span>
        <span className="hud-chip">drag rotate - wheel zoom - right-drag pan</span>
      </div>
      <div className="viewport-toolbar">
        <button
          className="btn btn--icon"
          title="Reset camera"
          onClick={() => viewerRef.current?.resetCamera()}
        >
          Home
        </button>
      </div>
    </div>
  );
}
