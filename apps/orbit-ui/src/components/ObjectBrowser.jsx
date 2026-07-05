// Scenario tree: spec-driven, so objects appear the moment they are added,
// before any MATLAB run. Badges mark satellites whose displayed ephemeris is
// a browser preview ("prev") or that are waiting on the backend ("run").
const SOURCE_BADGE = {
  preview: { text: "prev", title: "Two-body browser preview - run MATLAB for authoritative ephemeris" },
  pending: { text: "run", title: "Requires a MATLAB run (SGP4 propagates on the backend)" },
};

function SatelliteRow({ sat, selected, onSelect, onEditSensor, onRemoveSensor }) {
  const badge = SOURCE_BADGE[sat.source];
  return (
    <div>
      <button
        className={`tree-item ${selected ? "selected" : ""}`}
        onClick={() => onSelect(sat.name)}
      >
        <span className="dot" style={{ background: sat.color }} />
        {sat.name}
        {badge && (
          <span className={`badge badge--${sat.source}`} title={badge.title}>
            {badge.text}
          </span>
        )}
        <span className="meta">{sat.propagatorType}</span>
      </button>
      {sat.sensor && (
        // Child row, STK object-browser style. Selecting it selects the
        // parent platform (the sensor has no standalone identity in the
        // spec); the inspector then shows the sensor details.
        <div
          className={`tree-item tree-item--child ${selected ? "selected" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(sat.name)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(sat.name);
          }}
          title={`Imaging sensor on ${sat.name}`}
        >
          <span className="branch">&#9492;</span>
          <span className="sensor-glyph" />
          Sensor
          <span className="tree-actions">
            <button
              className="tree-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEditSensor(sat.name);
              }}
              title="Edit this sensor"
            >
              edit
            </button>
            <button
              className="tree-action-btn tree-action-btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSensor(sat.name);
              }}
              title="Remove this sensor from the satellite"
            >
              del
            </button>
          </span>
          <span className="meta">
            {sat.sensor.coneHalfAngleDeg}/{sat.sensor.fieldOfRegardDeg} deg
          </span>
        </div>
      )}
    </div>
  );
}

export default function ObjectBrowser({
  scenario,
  selection,
  onSelect,
  onEditSensor,
  onRemoveSensor,
}) {
  if (!scenario) {
    return (
      <aside className="panel panel--left">
        <div className="panel-header">Scenario</div>
        <div className="empty-note">Loading scenario...</div>
      </aside>
    );
  }

  // Constellation members carry a group tag; render them under a sub-header.
  const ungrouped = scenario.satellites.filter((s) => !s.group);
  const groups = new Map();
  for (const sat of scenario.satellites) {
    if (!sat.group) continue;
    if (!groups.has(sat.group)) groups.set(sat.group, []);
    groups.get(sat.group).push(sat);
  }

  const stations = scenario.groundPoints.filter((g) => g.kind === "groundStation");
  const targets = scenario.groundPoints.filter((g) => g.kind === "target");

  return (
    <aside className="panel panel--left">
      <div className="panel-section" style={{ flex: "none" }}>
        <div className="panel-header">Scenario</div>
        <div className="kv" style={{ paddingTop: 0 }}>
          <dt>Name</dt>
          <dd>{scenario.meta.name}</dd>
          <dt>Epoch</dt>
          <dd>{scenario.meta.epochUtc.replace("T", " ").replace(/(\.\d+)?Z$/, "")}Z</dd>
          <dt>Span</dt>
          <dd>{(scenario.meta.durationSeconds / 3600).toFixed(1)} h @ {scenario.meta.stepSeconds}s</dd>
        </div>
      </div>

      <div className="tree" style={{ flex: 1 }}>
        <div className="tree-group">
          <div className="tree-group-label">Satellites ({scenario.satellites.length})</div>
          {ungrouped.map((sat) => (
            <SatelliteRow
              key={sat.name}
              sat={sat}
              selected={selection === sat.name}
              onSelect={onSelect}
              onEditSensor={onEditSensor}
              onRemoveSensor={onRemoveSensor}
            />
          ))}
          {[...groups.entries()].map(([group, sats]) => (
            <div key={group}>
              <div className="tree-subgroup-label" title={group}>
                {group}
              </div>
              {sats.map((sat) => (
                <SatelliteRow
                  key={sat.name}
                  sat={sat}
                  selected={selection === sat.name}
                  onSelect={onSelect}
                  onEditSensor={onEditSensor}
                  onRemoveSensor={onRemoveSensor}
                />
              ))}
            </div>
          ))}
          {scenario.satellites.length === 0 && (
            <div className="empty-note">Insert &gt; Satellite to add one.</div>
          )}
        </div>

        <div className="tree-group">
          <div className="tree-group-label">Ground stations ({stations.length})</div>
          {stations.map((gp) => (
            <button
              key={gp.name}
              className={`tree-item ${selection === gp.name ? "selected" : ""}`}
              onClick={() => onSelect(gp.name)}
            >
              <span className="shape" style={{ background: gp.color }} />
              {gp.name}
              <span className="meta">GS</span>
            </button>
          ))}
        </div>

        {targets.length > 0 && (
          <div className="tree-group">
            <div className="tree-group-label">Targets ({targets.length})</div>
            {targets.map((gp) => (
              <button
                key={gp.name}
                className={`tree-item ${selection === gp.name ? "selected" : ""}`}
                onClick={() => onSelect(gp.name)}
              >
                <span className="shape" style={{ background: gp.color }} />
                {gp.name}
                <span className="meta">P{gp.priority ?? 1}</span>
              </button>
            ))}
          </div>
        )}

        <div className="tree-group">
          <div className="tree-group-label">Access pairs ({scenario.accesses.length})</div>
          {scenario.accesses.map((a) => (
            <button
              key={`${a.source}->${a.target}`}
              className={`tree-item ${a.stale ? "tree-item--stale" : ""}`}
              onClick={() => onSelect(a.source)}
              title={a.stale ? "Stale: scenario edited since this was computed" : `Select ${a.source}`}
            >
              <span
                className="dot"
                style={{
                  background: a.stale
                    ? "var(--text-faint)"
                    : a.windows.length
                      ? "var(--ok)"
                      : "var(--text-faint)",
                }}
              />
              {a.source}
              {" -> "}
              {a.target}
              <span className="meta">{a.stale ? "stale" : `${a.windows.length}w`}</span>
            </button>
          ))}
          {scenario.accesses.length === 0 && (
            <div className="empty-note">Run MATLAB to compute access windows.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
