import { useEffect, useMemo, useState } from "react";

// Scenario tree: spec-driven, so objects appear the moment they are added,
// before any MATLAB run. Badges mark satellites whose displayed ephemeris is
// a browser preview ("prev") or that are waiting on the backend ("run").
const SOURCE_BADGE = {
  preview: { text: "prev", title: "Two-body browser preview - run MATLAB for authoritative ephemeris" },
  pending: { text: "run", title: "Requires a MATLAB run (SGP4 propagates on the backend)" },
};

function childSummary({ accessRows, taskRows, sensorAccessRows }) {
  const parts = [];
  if (accessRows.length > 0) {
    parts.push(`${accessRows.length} access`);
  }
  if (taskRows.length > 0) {
    parts.push(`${taskRows.length} task${taskRows.length === 1 ? "" : "s"}`);
  }
  if (sensorAccessRows.length > 0) {
    parts.push(`${sensorAccessRows.length} sensor view`);
  }
  return parts.join(" / ");
}

function otherEndpoint(pair, satName) {
  return pair.source === satName ? pair.target : pair.source;
}

function SatelliteRow({
  sat,
  selected,
  expanded,
  onToggleExpanded,
  onSelect,
  onEditSensor,
  onRemoveSensor,
  accessRows,
  taskRows,
  sensorAccessRows,
}) {
  const badge = SOURCE_BADGE[sat.source];
  const sensorName = sat.sensor?.name || "Sensor";
  const hasChildren =
    Boolean(sat.sensor) ||
    accessRows.length > 0 ||
    taskRows.length > 0 ||
    sensorAccessRows.length > 0;
  const summary = childSummary({ accessRows, taskRows, sensorAccessRows });

  return (
    <div className={`tree-node ${expanded ? "tree-node--open" : ""}`}>
      <div className="tree-node-row">
        <button
          className="tree-disclosure"
          onClick={() => hasChildren && onToggleExpanded(sat.name)}
          disabled={!hasChildren}
          aria-expanded={hasChildren ? expanded : undefined}
          title={
            hasChildren
              ? expanded
                ? `Collapse ${sat.name}`
                : `Expand ${sat.name}`
              : "No child objects"
          }
        >
          {hasChildren ? (expanded ? "v" : ">") : ""}
        </button>
        <button
          className={`tree-item tree-item--satellite ${selected ? "selected" : ""}`}
          onClick={() => onSelect(sat.name)}
          title={summary || undefined}
        >
          <span className="dot" style={{ background: sat.color }} />
          <span className="tree-item-name">{sat.name}</span>
          {badge && (
            <span className={`badge badge--${sat.source}`} title={badge.title}>
              {badge.text}
            </span>
          )}
          <span className="meta">{sat.propagatorType}</span>
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="tree-children">
          {/* Selecting the sensor selects its parent platform; the spec has no standalone sensor object id. */}
          {sat.sensor && (
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
              <span className="branch">|</span>
              <span className="sensor-glyph" />
              <span className="tree-item-name">{sensorName}</span>
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

          {accessRows.map((a) => (
            <button
              key={`access:${a.source}->${a.target}`}
              className={`tree-item tree-item--child ${a.stale ? "tree-item--stale" : ""}`}
              onClick={() => onSelect(otherEndpoint(a, sat.name))}
              title={
                a.stale
                  ? "Stale access result - run MATLAB again"
                  : `${a.source} -> ${a.target}`
              }
            >
              <span className="branch">|</span>
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
              <span className="tree-item-name">
                Access to {otherEndpoint(a, sat.name)}
              </span>
              <span className="meta">{a.stale ? "stale" : `${a.windows.length}w`}</span>
            </button>
          ))}

          {taskRows.map((entry) => (
            <button
              key={`task:${entry.taskId}:${entry.startUtc}`}
              className={`tree-item tree-item--child ${entry.stale ? "tree-item--stale" : ""}`}
              onClick={() => onSelect(entry.targetName)}
              title={`${entry.taskName}: ${entry.sensorName} -> ${entry.targetName}`}
            >
              <span className="branch">|</span>
              <span className="task-glyph" />
              <span className="tree-item-name">{entry.taskName}</span>
              <span className="meta">{entry.targetName}</span>
            </button>
          ))}

          {sensorAccessRows.map((pair) => (
            <button
              key={`sensor-access:${pair.sensor}->${pair.target}`}
              className={`tree-item tree-item--child ${pair.stale ? "tree-item--stale" : ""}`}
              onClick={() => onSelect(pair.target)}
              title={`${pair.sensor} visibility to ${pair.target}`}
            >
              <span className="branch">|</span>
              <span className="sensor-access-glyph" />
              <span className="tree-item-name">{pair.sensor} to {pair.target}</span>
              <span className="meta">
                FOR {pair.forWindows.length} / FOV {pair.fovWindows.length}
              </span>
            </button>
          ))}
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
  const [expandedSatellites, setExpandedSatellites] = useState(() => new Set());
  const satelliteNames = useMemo(
    () => new Set((scenario?.satellites ?? []).map((sat) => sat.name)),
    [scenario?.satellites],
  );
  const selectedSatellite = satelliteNames.has(selection) ? selection : null;

  useEffect(() => {
    setExpandedSatellites((current) => {
      let changed = false;
      const next = new Set();
      for (const name of current) {
        if (satelliteNames.has(name)) {
          next.add(name);
        } else {
          changed = true;
        }
      }
      if (selectedSatellite && !next.has(selectedSatellite)) {
        next.add(selectedSatellite);
        changed = true;
      }
      return changed ? next : current;
    });
  }, [satelliteNames, selectedSatellite]);

  if (!scenario) {
    return (
      <aside className="panel panel--left">
        <div className="panel-header">Scenario</div>
        <div className="empty-note">Loading scenario...</div>
      </aside>
    );
  }

  const toggleSatellite = (name) => {
    setExpandedSatellites((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const rowContext = (sat) => ({
    accessRows: scenario.accesses.filter(
      (a) => a.source === sat.name || a.target === sat.name,
    ),
    taskRows: scenario.schedule.filter((entry) => entry.platformName === sat.name),
    sensorAccessRows: scenario.sensorAccesses.filter(
      (pair) => pair.platform === sat.name,
    ),
  });

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
              expanded={expandedSatellites.has(sat.name)}
              onToggleExpanded={toggleSatellite}
              onSelect={onSelect}
              onEditSensor={onEditSensor}
              onRemoveSensor={onRemoveSensor}
              {...rowContext(sat)}
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
                  expanded={expandedSatellites.has(sat.name)}
                  onToggleExpanded={toggleSatellite}
                  onSelect={onSelect}
                  onEditSensor={onEditSensor}
                  onRemoveSensor={onRemoveSensor}
                  {...rowContext(sat)}
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
