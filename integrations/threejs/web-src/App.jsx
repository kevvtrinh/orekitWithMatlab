import React, { useCallback, useEffect, useRef, useState } from "react";
import { AuthoringDialogs } from "./AuthoringDialogs.jsx";
import { ScenarioViewport } from "./ScenarioViewport.jsx";
import { ScenarioMenu } from "./ScenarioMenu.jsx";
import { loadScene, sendCommand } from "./api.js";

const PLAYBACK_SPEEDS = [60, 240, 600, 1200, 2400];

export function App() {
  const [scene, setScene] = useState(null);
  const [revision, setRevision] = useState(-1);
  const [status, setStatus] = useState("Connecting to MATLAB…");
  const [isBusy, setIsBusy] = useState(false);
  const [referenceFrame, setReferenceFrame] = useState("ECEF");
  const [samplePosition, setSamplePosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(240);
  const [dialog, setDialog] = useState(null);
  const previousFrameTimeRef = useRef(null);

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
    if (isBusy) return undefined;
    refresh();
    const timer = window.setInterval(refresh, 500);
    return () => window.clearInterval(timer);
  }, [isBusy, refresh]);

  useEffect(() => {
    setSamplePosition(0);
    setIsPlaying(false);
    setPlaybackRate(Number(scene?.playbackRate) || 240);
  }, [scene]);

  const timeSamples = normalizeArray(scene?.timeSamples);
  const sampleCount = timeSamples.length;
  const currentEpoch = formatEpoch(timeSamples, samplePosition, scene?.epoch);

  useEffect(() => {
    if (!isPlaying || sampleCount < 2) return undefined;
    previousFrameTimeRef.current = window.performance.now();
    let animationFrame;
    function advance(timestamp) {
      const previousTimestamp = previousFrameTimeRef.current;
      const elapsedRealSeconds = (timestamp - previousTimestamp) / 1000;
      previousFrameTimeRef.current = timestamp;
      const elapsedSamples = elapsedRealSeconds * playbackRate /
        Number(scene.sampleInterval_s);
      setSamplePosition((currentPosition) => {
        const nextPosition = currentPosition + elapsedSamples;
        if (nextPosition >= sampleCount - 1) {
          setIsPlaying(false);
          return sampleCount - 1;
        }
        return nextPosition;
      });
      animationFrame = window.requestAnimationFrame(advance);
    }
    animationFrame = window.requestAnimationFrame(advance);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, playbackRate, sampleCount, scene]);

  async function execute(command, payload = {}) {
    setIsBusy(true);
    setStatus("Applying command in MATLAB…");
    try {
      const response = await sendCommand(command, payload);
      await refresh();
      return response.result;
    } catch (error) {
      setStatus(`Command failed: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
    return null;
  }

  async function submitDialog(command, payload) {
    const result = await execute(command, payload);
    if (result) setDialog(null);
  }

  async function saveScenario() {
    const definition = await execute("saveScenario");
    if (!definition) return;
    downloadScenarioDefinition(definition);
    setStatus("Scenario definition saved");
  }

  async function loadScenario(file) {
    try {
      const definition = JSON.parse(await file.text());
      await execute("loadScenario", { Definition: definition });
    } catch (error) {
      setStatus(`Load failed: ${error.message}`);
    }
  }

  const satellites = normalizeArray(scene?.satellites);
  const places = normalizeArray(scene?.places);

  function togglePlayback() {
    if (samplePosition >= sampleCount - 1) setSamplePosition(0);
    setIsPlaying((currentValue) => !currentValue);
  }

  function scrubTimeline(event) {
    setIsPlaying(false);
    setSamplePosition(Number(event.target.value));
  }

  return (
    <main className="console">
      <header className="topbar">
        <div className="brand-mark">S</div>
        <div>
          <h1>{scene?.scenarioName ?? "Scenario Console"}</h1>
          <p>MATLAB · {referenceFrame} · metres</p>
        </div>
        <ScenarioMenu
          isBusy={isBusy}
          onNewScenario={() => setDialog("newScenario")}
          onSaveScenario={saveScenario}
          onLoadScenario={loadScenario}
          onAddSatellite={() => setDialog("addSatellite")}
          onAddPlace={() => setDialog("addPlace")}
        />
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
        <ScenarioViewport
          sceneData={scene}
          referenceFrame={referenceFrame}
          samplePosition={samplePosition}
        />
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
        <div className="viewport-help">
          Left drag: spin globe · Right drag: rotate view · Wheel: zoom
        </div>
      </section>

      <aside className="inspector panel">
        <h2>Scenario</h2>
        <dl>
          <dt>Epoch</dt><dd>{currentEpoch ?? "—"}</dd>
          <dt>Satellites</dt><dd>{satellites.length}</dd>
          <dt>Places</dt><dd>{places.length}</dd>
          <dt>Sun model</dt><dd>{scene?.sun?.model ?? "—"}</dd>
        </dl>
        <h3>Authoring</h3>
        <p className="inspector-copy">
          Use the Scenario and Insert menus above to edit this composition.
        </p>
        <p className="notice">Analysis remains authoritative in MATLAB.</p>
      </aside>

      <footer className="timeline">
        <button
          className="play"
          disabled={sampleCount < 2}
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause scenario" : "Play scenario"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <input
          className="timeline-range"
          type="range"
          min="0"
          max={Math.max(sampleCount - 1, 0)}
          step="0.01"
          value={Math.min(samplePosition, Math.max(sampleCount - 1, 0))}
          disabled={sampleCount < 2}
          onChange={scrubTimeline}
          aria-label="Scenario epoch"
        />
        <select
          className="playback-speed"
          value={playbackRate}
          onChange={(event) => setPlaybackRate(Number(event.target.value))}
          aria-label="Playback speed"
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>{speed}×</option>
          ))}
        </select>
        <time>{currentEpoch ?? "No epoch loaded"}</time>
      </footer>
      <AuthoringDialogs
        dialog={dialog}
        scene={scene}
        isBusy={isBusy}
        onClose={() => setDialog(null)}
        onSubmit={submitDialog}
      />
    </main>
  );
}

function downloadScenarioDefinition(definition) {
  const text = JSON.stringify(definition, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const download = document.createElement("a");
  download.href = objectUrl;
  download.download = `${safeFilename(definition.Name)}.scenario.json`;
  document.body.appendChild(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function safeFilename(value) {
  const normalized = String(value || "scenario")
    .trim()
    .replace(/[^a-z0-9_-]+/gi, "-");
  return normalized || "scenario";
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

function formatEpoch(timeSamples, samplePosition, fallbackEpoch) {
  if (timeSamples.length === 0) return fallbackEpoch;
  const lowerIndex = Math.min(Math.floor(samplePosition), timeSamples.length - 1);
  const upperIndex = Math.min(lowerIndex + 1, timeSamples.length - 1);
  const fraction = samplePosition - lowerIndex;
  const lowerSeconds = Number(timeSamples[lowerIndex].epochUnix_s);
  const upperSeconds = Number(timeSamples[upperIndex].epochUnix_s);
  const epochSeconds = lowerSeconds + fraction * (upperSeconds - lowerSeconds);
  if (!Number.isFinite(epochSeconds)) return timeSamples[lowerIndex].epoch;
  const isoEpoch = new Date(Math.round(epochSeconds) * 1000).toISOString();
  return `${isoEpoch.slice(0, 10)} ${isoEpoch.slice(11, 19)} UTC`;
}
