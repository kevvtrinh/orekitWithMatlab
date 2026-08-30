import React, { useCallback, useEffect, useState } from "react";
import { ScenarioViewport } from "./ScenarioViewport.jsx";
import { loadScene, sendCommand } from "./api.js";

export function App() {
  const [scene, setScene] = useState(null);
  const [revision, setRevision] = useState(-1);
  const [status, setStatus] = useState("Connecting to MATLAB…");
  const [isBusy, setIsBusy] = useState(false);
  const [referenceFrame, setReferenceFrame] = useState("ECEF");

  const refresh = useCallback(async () => {
    try {
      const payload = await loadScene();
      if (payload.revision !== revision) {
        setScene(payload.scene);
        setRevision(payload.revision);
      }
      setStatus("MATLAB scenario synchronized");
    } catch (error) {
      setStatus(`MATLAB bridge unavailable: ${error.message}`);
    }
  }, [revision]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function execute(command) {
    setIsBusy(true);
    setStatus("Applying command in MATLAB…");
    try {
      await sendCommand(command);
      await refresh();
    } catch (error) {
      setStatus(`Command failed: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  }

  const satellites = normalizeArray(scene?.satellites);
  const places = normalizeArray(scene?.places);

  return (
    <main className="console">
      <header className="topbar">
        <div className="brand-mark">S</div>
        <div>
          <h1>{scene?.scenarioName ?? "Scenario Console"}</h1>
          <p>MATLAB · {referenceFrame} · metres</p>
        </div>
        <div className="connection"><span />{status}</div>
      </header>

      <aside className="object-browser panel">
        <h2>Object Browser</h2>
        <ObjectGroup label="Satellites" objects={satellites} symbol="◈" />
        <ObjectGroup label="Places" objects={places} symbol="⌖" />
        <ObjectGroup
          label="Celestial"
          objects={scene?.sun ? [scene.sun] : []}
          symbol="☀"
        />
      </aside>

      <section className="viewport-panel">
        <ScenarioViewport sceneData={scene} referenceFrame={referenceFrame} />
        <div className="frame-selector" aria-label="Reference frame">
          {['ECEF', 'ECI'].map((frame) => (
            <button
              className={referenceFrame === frame ? "active" : ""}
              key={frame}
              onClick={() => setReferenceFrame(frame)}
            >
              {frame}
            </button>
          ))}
        </div>
        <div className="viewport-badge">{referenceFrame}</div>
        <div className="viewport-help">Drag to orbit · Wheel to zoom</div>
      </section>

      <aside className="inspector panel">
        <h2>Scenario</h2>
        <dl>
          <dt>Epoch</dt><dd>{scene?.epoch ?? "—"}</dd>
          <dt>Satellites</dt><dd>{satellites.length}</dd>
          <dt>Places</dt><dd>{places.length}</dd>
          <dt>Sun model</dt><dd>{scene?.sun?.model ?? "—"}</dd>
        </dl>
        <h3>Create object</h3>
        <button disabled={isBusy} onClick={() => execute("addSatellite")}>
          Add satellite
        </button>
        <button disabled={isBusy} onClick={() => execute("addPlace")}>
          Add Ohio place
        </button>
        <p className="notice">Analysis remains authoritative in MATLAB.</p>
      </aside>

      <footer className="timeline">
        <button className="play" disabled>▶</button>
        <div className="track"><span /></div>
        <time>{scene?.epoch ?? "No epoch loaded"}</time>
      </footer>
    </main>
  );
}

function ObjectGroup({ label, objects, symbol }) {
  return (
    <section className="object-group">
      <h3>⌄ {label} <small>{objects.length}</small></h3>
      {objects.map((object) => (
        <div className="object-row" key={object.name}>
          <span>{symbol}</span>{object.name}
        </div>
      ))}
    </section>
  );
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
