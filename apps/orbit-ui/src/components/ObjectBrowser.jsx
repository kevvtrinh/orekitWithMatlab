import { useEffect, useMemo, useState } from "react";
import { groupTargets } from "../lib/spec.js";
import ConsoleIcon from "./ConsoleIcon.jsx";

// Scenario tree: spec-driven, so objects appear the moment they are added,
// before any MATLAB run. Badges mark satellites whose displayed ephemeris is
// a browser preview ("prev") or that are waiting on the backend ("run").
const SOURCE_BADGE = {
  preview: { text: "preview", title: "Two-body browser preview - run MATLAB for authoritative ephemeris" },
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

function matchesSearch(query, ...values) {
  return !query || values.some((value) => String(value ?? "").toLowerCase().includes(query));
}

function SatelliteRow({
  sat,
  selected,
  expanded,
  onToggleExpanded,
  onSelect,
  onFocusSatellite,
  onEditSensor,
  onRemoveSensor,
  accessRows,
  taskRows,
  sensorAccessRows,
  showSensor = true,
}) {
  const badge = SOURCE_BADGE[sat.source];
  // Match the backend's default sensor name so the tree, schedule rows, and
  // access requests all refer to the sensor by the same label.
  const sensorName = sat.sensor?.name || `${sat.name} Sensor`;
  const hasChildren =
    Boolean(sat.sensor && showSensor) ||
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
          {hasChildren ? (expanded ? "⌄" : "›") : ""}
        </button>
        <button
          className={`tree-item tree-item--satellite ${selected ? "selected" : ""}`}
          onClick={() => onSelect(sat.name)}
          onDoubleClick={() => onFocusSatellite?.(sat.name)}
          title={summary || undefined}
        >
          <span className="dot" style={{ background: sat.color }} />
          <span className="tree-item-name">{sat.name}</span>
          {badge && (
            <span className={`badge badge--${sat.source}`} title={badge.title}>
              {badge.text}
            </span>
          )}
        </button>
      </div>

      {expanded && hasChildren && (
        <div className="tree-children">
          {/* Selecting the sensor selects its parent platform; the spec has no standalone sensor object id. */}
          {sat.sensor && showSensor && (
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
                  : `Access between ${a.source} and ${a.target}`
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
  onDeleteArea,
  onAddSatellite,
  onFocusSatellite,
}) {
  const [expandedSatellites, setExpandedSatellites] = useState(() => new Set());
  const [expandedAreas, setExpandedAreas] = useState(() => new Set());
  const [searchText, setSearchText] = useState("");
  const [searchCollapsed, setSearchCollapsed] = useState(() => ({
    satellites: new Set(), areas: new Set(),
  }));
  const query = searchText.trim().toLowerCase();
  const satelliteNames = useMemo(
    () => new Set((scenario?.satellites ?? []).map((sat) => sat.name)),
    [scenario?.satellites],
  );
  const selectedSatellite = satelliteNames.has(selection) ? selection : null;

  // Area grid points share a group tag; fold each area into one collapsible
  // node instead of listing up to 100 point rows.
  const targetTree = useMemo(
    () => groupTargets(scenario?.groundPoints ?? []),
    [scenario?.groundPoints],
  );
  const areaNames = useMemo(
    () => new Set(targetTree.areas.keys()),
    [targetTree],
  );
  // Selecting a grid point (e.g. by clicking its marker in the 3D view)
  // auto-expands the area that contains it.
  const selectedArea =
    (scenario?.groundPoints ?? []).find((g) => g.name === selection)?.group ??
    null;

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

  useEffect(() => {
    setExpandedAreas((current) => {
      let changed = false;
      const next = new Set();
      for (const name of current) {
        if (areaNames.has(name)) {
          next.add(name);
        } else {
          changed = true;
        }
      }
      if (selectedArea && !next.has(selectedArea)) {
        next.add(selectedArea);
        changed = true;
      }
      return changed ? next : current;
    });
  }, [areaNames, selectedArea]);

  useEffect(() => {
    // Search starts expanded, without changing the user's ordinary tree state.
    setSearchCollapsed({ satellites: new Set(), areas: new Set() });
  }, [query]);

  if (!scenario) {
    return (
      <aside className="panel panel--left">
        <div className="panel-header">Scenario</div>
        <div className="empty-note">Loading scenario...</div>
      </aside>
    );
  }

  const toggleSatellite = (name) => {
    if (query) {
      setSearchCollapsed((current) => {
        const satellites = new Set(current.satellites);
        if (satellites.has(name)) satellites.delete(name);
        else satellites.add(name);
        return { ...current, satellites };
      });
      return;
    }
    setExpandedSatellites((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleArea = (name) => {
    if (query) {
      setSearchCollapsed((current) => {
        const areas = new Set(current.areas);
        if (areas.has(name)) areas.delete(name);
        else areas.add(name);
        return { ...current, areas };
      });
      return;
    }
    setExpandedAreas((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const satelliteContexts = new Map();
  const visibleSatellites = scenario.satellites.filter((sat) => {
    const ownMatch = matchesSearch(query, sat.name, "satellite", sat.kind, sat.type,
      sat.orbit?.type, sat.propagatorType, sat.orbitDefinitionType,
      sat.group, sat.group ? "constellation" : "");
    const childQuery = ownMatch ? "" : query;
    const context = {
      onFocusSatellite,
      accessRows: scenario.accesses.filter((pair) =>
        (pair.source === sat.name || pair.target === sat.name) &&
        matchesSearch(childQuery, pair.source, pair.target, "access")),
      taskRows: scenario.schedule.filter((entry) => entry.platformName === sat.name &&
        matchesSearch(childQuery, entry.taskName, entry.targetName, entry.sensorName,
          entry.taskType, "task")),
      sensorAccessRows: scenario.sensorAccesses.filter((pair) => pair.platform === sat.name &&
        matchesSearch(childQuery, pair.sensor, pair.target, "sensor access")),
      showSensor: Boolean(sat.sensor) && matchesSearch(childQuery,
        sat.sensor?.name || `${sat.name} Sensor`, "sensor", sat.sensor?.type),
    };
    satelliteContexts.set(sat.name, context);
    return ownMatch || context.showSensor || context.accessRows.length > 0 ||
      context.taskRows.length > 0 || context.sensorAccessRows.length > 0;
  });

  // Constellation members carry a group tag; render them under a sub-header.
  const ungrouped = visibleSatellites.filter((s) => !s.group);
  const groups = new Map();
  for (const sat of visibleSatellites) {
    if (!sat.group) continue;
    if (!groups.has(sat.group)) groups.set(sat.group, []);
    groups.get(sat.group).push(sat);
  }

  const allStations = scenario.groundPoints.filter((g) => g.kind === "groundStation");
  const stations = allStations.filter((point) => matchesSearch(query,
    point.name, point.kind, "ground station"));
  const pointMatches = (point) => matchesSearch(query, point.name, point.kind, "point target");
  const areaMatches = (group) => matchesSearch(query, group, "area target");
  const pointTargets = targetTree.points.filter(pointMatches);
  const areaGroups = new Map([...targetTree.areas].filter(([group, points]) =>
    areaMatches(group) || points.some(pointMatches)));
  const accessPairs = scenario.accesses.filter((pair) =>
    matchesSearch(query, pair.source, pair.target, "access"));
  const accessSources = new Map();
  for (const pair of accessPairs) {
    if (!accessSources.has(pair.source)) accessSources.set(pair.source, []);
    accessSources.get(pair.source).push(pair);
  }
  // Areas count as one object each in the section header; their grid points
  // are implementation detail, not scenario objects the user reasons about.
  const targetCount = pointTargets.length + areaGroups.size;
  const totalTargets = targetTree.points.length + targetTree.areas.size;
  const noMatches = query && visibleSatellites.length + stations.length +
    targetCount + accessPairs.length === 0;
  const sectionCount = (visible, total) => query ? `${visible} / ${total}` : total;

  return (
    <aside className="panel panel--left" aria-label="Mission objects">
      <div className="panel-heading">
        <h2>Mission objects</h2>
        <button className="btn btn--icon add-object" onClick={onAddSatellite}
          aria-label="Add satellite" title="Add satellite">+</button>
      </div>
      <div className="mission-summary">
        <div className="eyebrow">Active scenario</div>
        <div className="mission-name">{scenario.meta.name}</div>
        <div className="mission-epoch">{scenario.meta.epochUtc.replace("T", " ").replace(/(\.\d+)?Z$/, "")} UTC</div>
        <div className="mission-metrics">
          <div><strong>{(scenario.meta.durationSeconds / 3600).toFixed(1)}<small> h</small></strong><span>Duration</span></div>
          <div><strong>{scenario.meta.stepSeconds}<small> s</small></strong><span>Time step</span></div>
        </div>
      </div>

      <div className="object-search">
        <ConsoleIcon name="search" size={16} />
        <input type="search" placeholder="Find objects…" aria-label="Find mission objects"
          value={searchText} onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchText("");
          }} />
        {searchText && (
          <button type="button" className="object-search-clear" onClick={() => setSearchText("")}
            aria-label="Clear object search" title="Clear search">
            <ConsoleIcon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="tree" style={{ flex: 1 }}>
        {noMatches && (
          <div className="tree-search-empty" role="status">
            <ConsoleIcon name="search" size={24} />
            <strong>No objects found</strong>
            <p>No object name or type matches “{searchText.trim()}”.</p>
            <button type="button" className="btn tree-search-reset" onClick={() => setSearchText("")}>
              Clear search
            </button>
          </div>
        )}
        {(!query || visibleSatellites.length > 0) && <div className="tree-group">
          <div className="tree-group-label">Satellites ({sectionCount(visibleSatellites.length, scenario.satellites.length)})</div>
          {ungrouped.map((sat) => (
            <SatelliteRow
              key={sat.name}
              sat={sat}
              selected={selection === sat.name}
              expanded={query ? !searchCollapsed.satellites.has(sat.name) : expandedSatellites.has(sat.name)}
              onToggleExpanded={toggleSatellite}
              onSelect={onSelect}
              onEditSensor={onEditSensor}
              onRemoveSensor={onRemoveSensor}
              {...satelliteContexts.get(sat.name)}
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
                  expanded={query ? !searchCollapsed.satellites.has(sat.name) : expandedSatellites.has(sat.name)}
                  onToggleExpanded={toggleSatellite}
                  onSelect={onSelect}
                  onEditSensor={onEditSensor}
                  onRemoveSensor={onRemoveSensor}
                  {...satelliteContexts.get(sat.name)}
                />
              ))}
            </div>
          ))}
          {scenario.satellites.length === 0 && (
            <div className="empty-note">Insert &gt; Satellite to add one.</div>
          )}
        </div>}

        {(!query || stations.length > 0) && <div className="tree-group">
          <div className="tree-group-label">Ground stations ({sectionCount(stations.length, allStations.length)})</div>
          {stations.map((gp) => (
            <button
              key={gp.name}
              className={`tree-item ${selection === gp.name ? "selected" : ""}`}
              onClick={() => onSelect(gp.name)}
            >
              <span className="station-symbol"><ConsoleIcon name="ground" size={16} /></span>
              {gp.name}
              <span className="meta">GS</span>
            </button>
          ))}
        </div>}

        {targetCount > 0 && (
          <div className="tree-group">
            <div className="tree-group-label">Targets ({sectionCount(targetCount, totalTargets)})</div>
            {pointTargets.map((gp) => (
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
            {[...areaGroups.entries()].map(([group, points]) => {
              const expanded = query ? !searchCollapsed.areas.has(group) : expandedAreas.has(group);
              const visiblePoints = areaMatches(group) ? points : points.filter(pointMatches);
              const area = points[0]?.area;
              return (
                <div
                  key={group}
                  className={`tree-node ${expanded ? "tree-node--open" : ""}`}
                >
                  <div className="tree-node-row">
                    <button
                      className="tree-disclosure"
                      onClick={() => toggleArea(group)}
                      aria-expanded={expanded}
                      title={
                        expanded
                          ? `Collapse ${group}`
                          : `Expand ${group} (${points.length} grid points)`
                      }
                    >
                      {expanded ? "v" : ">"}
                    </button>
                    {/* The area itself is not a spec object (only its grid
                        points are), so the row toggles instead of selecting. */}
                    <div
                      className={`tree-item tree-item--area ${selection === group ? "selected" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(group)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(group); }
                      }}
                      title={
                        area
                          ? `${group}: ${area.widthKm} x ${area.heightKm} km area sampled by ${points.length} grid points`
                          : group
                      }
                    >
                      <span className="area-glyph" />
                      <span className="tree-item-name">{group}</span>
                      {onDeleteArea && (
                        <span className="tree-actions">
                          <button
                            className="tree-action-btn tree-action-btn--danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteArea(group);
                            }}
                            title={`Delete this area and its ${points.length} grid points`}
                          >
                            del
                          </button>
                        </span>
                      )}
                      <span className="meta">{points.length} pts</span>
                    </div>
                  </div>
                  {expanded && (
                    <div className="tree-children">
                      {visiblePoints.map((gp) => (
                        <button
                          key={gp.name}
                          className={`tree-item tree-item--child ${selection === gp.name ? "selected" : ""}`}
                          onClick={() => onSelect(gp.name)}
                        >
                          <span className="branch">|</span>
                          <span className="shape" style={{ background: gp.color }} />
                          <span className="tree-item-name">{gp.name}</span>
                          <span className="meta">P{gp.priority ?? 1}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(!query || accessPairs.length > 0) && <div className="tree-group">
          <div className="tree-group-label">Access results ({sectionCount(accessPairs.length, scenario.accesses.length)})</div>
          {[...accessSources.entries()].map(([source, pairs]) => (
            <div key={source} className="tree-access-source">
              <div className="tree-access-source-heading" title={source}>{source}</div>
              {pairs.map((a) => (
                <button
                  key={a.target}
                  className={`tree-item tree-access-destination ${a.stale ? "tree-item--stale" : ""}`}
                  onClick={() => onSelect(a.source)}
                  title={`Access between ${a.source} and ${a.target}`}
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
                  <span className="tree-item-name">{a.target}</span>
                  <span className="meta tree-access-status">
                    {a.stale ? "Outdated" : `${a.windows.length} window${a.windows.length === 1 ? "" : "s"}`}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {scenario.accesses.length === 0 && (
            <div className="empty-note">Run MATLAB to compute access windows.</div>
          )}
        </div>}
      </div>
    </aside>
  );
}
