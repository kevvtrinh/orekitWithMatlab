export default function ObjectBrowser({ scenario, selection, onSelect }) {
  if (!scenario) {
    return (
      <aside className="panel panel--left">
        <div className="panel-header">Scenario</div>
        <div className="empty-note">Loading scenario...</div>
      </aside>
    );
  }

  return (
    <aside className="panel panel--left">
      <div className="panel-section" style={{ flex: "none" }}>
        <div className="panel-header">Scenario</div>
        <div className="kv" style={{ paddingTop: 0 }}>
          <dt>Name</dt>
          <dd>{scenario.meta.name}</dd>
          <dt>Epoch</dt>
          <dd>{scenario.meta.epochUtc.replace("T", " ").slice(0, 19)}Z</dd>
          <dt>Span</dt>
          <dd>{(scenario.meta.durationSeconds / 3600).toFixed(1)} h @ {scenario.meta.stepSeconds}s</dd>
        </div>
      </div>

      <div className="tree" style={{ flex: 1 }}>
        <div className="tree-group">
          <div className="tree-group-label">Satellites ({scenario.satellites.length})</div>
          {scenario.satellites.map((sat) => (
            <button
              key={sat.name}
              className={`tree-item ${selection === sat.name ? "selected" : ""}`}
              onClick={() => onSelect(sat.name)}
            >
              <span className="dot" style={{ background: sat.color }} />
              {sat.name}
              <span className="meta">{sat.propagatorType}</span>
            </button>
          ))}
        </div>

        <div className="tree-group">
          <div className="tree-group-label">
            Ground sites ({scenario.groundPoints.length})
          </div>
          {scenario.groundPoints.map((gp) => (
            <button
              key={gp.name}
              className={`tree-item ${selection === gp.name ? "selected" : ""}`}
              onClick={() => onSelect(gp.name)}
            >
              <span className="shape" style={{ background: gp.color }} />
              {gp.name}
              <span className="meta">{gp.type === "GroundStation" ? "GS" : gp.type}</span>
            </button>
          ))}
        </div>

        <div className="tree-group">
          <div className="tree-group-label">Access pairs ({scenario.accesses.length})</div>
          {scenario.accesses.map((a) => (
            <button
              key={`${a.source}->${a.target}`}
              className="tree-item"
              onClick={() => onSelect(a.source)}
              title={`Select ${a.source}`}
            >
              <span className="dot" style={{ background: a.windows.length ? "var(--ok)" : "var(--text-faint)" }} />
              {a.source}
              {" -> "}
              {a.target}
              <span className="meta">{a.windows.length}w</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
