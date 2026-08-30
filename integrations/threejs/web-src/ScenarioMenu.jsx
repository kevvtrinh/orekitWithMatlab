import React, { useRef } from "react";

export function ScenarioMenu({
  isBusy,
  onNewScenario,
  onSaveScenario,
  onLoadScenario,
  onAddSatellite,
  onAddPlace,
}) {
  const fileInputRef = useRef(null);

  async function loadSelectedFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onLoadScenario(file);
  }

  return (
    <nav className="scenario-menu" aria-label="Scenario commands">
      <div className="menu-group">
        <span>Scenario</span>
        <button disabled={isBusy} onClick={onNewScenario}>New</button>
        <button disabled={isBusy} onClick={onSaveScenario}>Save</button>
        <button
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
        >
          Load
        </button>
        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept=".json,application/json"
          onChange={loadSelectedFile}
        />
      </div>
      <div className="menu-group">
        <span>Insert</span>
        <button disabled={isBusy} onClick={onAddSatellite}>Satellite</button>
        <button disabled={isBusy} onClick={onAddPlace}>Place</button>
      </div>
    </nav>
  );
}
