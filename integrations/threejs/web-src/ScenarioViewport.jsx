import React, { useEffect, useRef } from "react";
import { createViewer } from "./three/createViewer.js";

export function ScenarioViewport({ sceneData, referenceFrame }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    viewerRef.current = createViewer(containerRef.current);
    return () => viewerRef.current.dispose();
  }, []);

  useEffect(() => {
    if (sceneData && viewerRef.current) {
      viewerRef.current.update(sceneData, referenceFrame);
    }
  }, [sceneData, referenceFrame]);

  return <div className="viewport" ref={containerRef} />;
}
