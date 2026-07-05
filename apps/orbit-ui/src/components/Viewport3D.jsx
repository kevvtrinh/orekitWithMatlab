import { useEffect, useRef } from "react";
import { createViewer } from "../three/viewer.js";

export default function Viewport3D({ scenario, selection, viewOptions, onSelect }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

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
    viewerRef.current?.setScenario(scenario);
  }, [scenario]);

  useEffect(() => {
    viewerRef.current?.setSelection(selection);
  }, [selection, scenario]);

  useEffect(() => {
    viewerRef.current?.setOptions(viewOptions);
  }, [viewOptions, scenario]);

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
