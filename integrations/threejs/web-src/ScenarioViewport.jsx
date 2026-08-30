import React, { useEffect, useRef } from "react";
import { createViewer } from "./three/createViewer.js";

export function ScenarioViewport({ sceneData, referenceFrame, samplePosition }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    viewerRef.current = createViewer(containerRef.current);
    return () => viewerRef.current.dispose();
  }, []);

  useEffect(() => {
    if (sceneData && viewerRef.current) {
      viewerRef.current.update(sceneData, referenceFrame, samplePosition);
    }
  }, [sceneData, referenceFrame, samplePosition]);

  return <div className="viewport" ref={containerRef} />;
}
