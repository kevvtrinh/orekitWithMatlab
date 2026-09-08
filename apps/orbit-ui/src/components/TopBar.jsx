import Menu from "./Menu.jsx";
import ConsoleIcon from "./ConsoleIcon.jsx";

export default function TopBar({
  scenario,
  source,
  job,
  viewOptions,
  onToggleOption,
  onOpenDialog,
  onResetSpec,
  onExport,
  onImportSpec,
  onRunMatlab,
  onOpenCommands,
  avoidanceDemo, onAvoidanceDemo, onLeaveAvoidanceDemo,
}) {
  const hasMatlabData = source === "matlab";
  const running = job?.state === "running";
  const demoBusy = avoidanceDemo && !["ready", "failed"].includes(avoidanceDemo.phase);

  const scenarioItems = [
    { label: "Run Earth Avoidance Demo", hint: "Export Az/El, solve in MATLAB, import and replay automatically",
      onClick: onAvoidanceDemo, disabled: !scenario || running || demoBusy },
    "---",
    {
      label: "Scenario Settings...",
      disabled: !scenario,
      onClick: () => onOpenDialog({ type: "settings" }),
    },
    "---",
    {
      label: "Import Spec JSON...",
      hint: "Load a scenario spec file exported from this UI",
      onClick: onImportSpec,
    },
    {
      label: "Export Spec JSON",
      disabled: !scenario,
      hint: "The editable scenario definition",
      onClick: () => onExport("spec"),
    },
    {
      label: "Export Scenario JSON",
      disabled: !scenario,
      hint: "Last propagated payload (ephemerides + access)",
      onClick: () => onExport("scenario"),
    },
    {
      label: "Export Ephemeris CSV",
      disabled: !scenario,
      hint: "Ephemeris of the selected satellite",
      onClick: () => onExport("csv"),
    },
    "---",
    {
      label: "Reset to Demo Scenario",
      disabled: !scenario,
      hint: "Restore the bundled two-satellite demo spec",
      onClick: onResetSpec,
    },
  ];

  const insertItems = [
    {
      label: "Satellite...",
      meta: "Keplerian / TLE",
      onClick: () => onOpenDialog({ type: "satellite" }),
    },
    {
      label: "Constellation...",
      meta: "Walker",
      onClick: () => onOpenDialog({ type: "constellation" }),
    },
    "---",
    {
      label: "Sensor...",
      hint: "Add or edit the imaging sensor on a satellite",
      onClick: () => onOpenDialog({ type: "sensor" }),
    },
    {
      label: "Maneuvers...",
      meta: "Impulsive dV",
      hint: "Add or edit a satellite's impulsive maneuvers",
      onClick: () => onOpenDialog({ type: "maneuvers" }),
    },
    "---",
    {
      label: "Ground Station...",
      onClick: () => onOpenDialog({ type: "ground", kind: "groundStation" }),
    },
    {
      label: "Point Target...",
      onClick: () => onOpenDialog({ type: "ground", kind: "target" }),
    },
    {
      label: "Area Target...",
      hint: "Rectangular area sampled as a grid of point targets",
      onClick: () => onOpenDialog({ type: "areaTarget" }),
    },
    {
      label: "Country Area Target...",
      hint: "Search country boundaries and add an area target",
      onClick: () => onOpenDialog({ type: "countryTarget" }),
    },
    "---",
    {
      label: "Sensor Tasks...",
      hint: "Schedule imaging tasks for satellite sensors",
      onClick: () => onOpenDialog({ type: "tasks" }),
    },
  ];

  const analysisItems = [
    {
      label: "Reports & Graphs...",
      hint: "Explore orbital elements, solar beta angle, and lighting intervals",
      onClick: () => onOpenDialog({ type: "reports" }),
    },
    "---",
    {
      label: "Calculate Access...",
      hint: "Choose the exact object pair to send to MATLAB/Orekit",
      onClick: () => onOpenDialog({ type: "access" }),
    },
    {
      label: "Run Full Scenario",
      hint: "Run the current scenario spec through MATLAB/Orekit",
      disabled: job?.state === "running" || Boolean(avoidanceDemo),
      onClick: onRunMatlab,
      meta: job?.state === "running" ? "running" : undefined,
    },
    "---",
    {
      label: "Sensor Tasks...",
      hint: "Schedule imaging tasks for satellite sensors",
      onClick: () => onOpenDialog({ type: "tasks" }),
    },
  ];

  const viewItems = [
    ["Labels", "labels"],
    ["Ground tracks", "groundTracks"],
    ["Access lines", "accessLines"],
    ["Sensor FOV", "sensorFov"],
    ["Sensor FOR", "sensorFor"],
    ["Sun", "sun"],
    ["Area grid points", "areaGrid"],
  ].map(([label, key]) => ({
    label,
    meta: viewOptions[key] ? "on" : "off",
    onClick: () => onToggleOption(key),
  }));

  return (
    <header className="topbar">
      <div className="brand">
        <ConsoleIcon name="orbit" size={34} className="brand-mark" />
        <div className="brand-copy">
          <span className="brand-name">ORBIT</span>
          <span className="brand-sub">Mission console</span>
        </div>
      </div>

      <nav className="topbar-nav" aria-label="Mission menus">
        <Menu label="Scenario" items={scenarioItems} />
        <Menu label="Insert" items={insertItems} disabled={!scenario} />
        <Menu label="Analysis" items={analysisItems} disabled={!scenario} />
        <Menu label="View" items={viewItems} />
      </nav>

      <div className="topbar-spacer" />

      <button className="command-trigger" onClick={onOpenCommands} aria-label="Search commands and objects" aria-keyshortcuts="Control+k Meta+k">
        <ConsoleIcon name="search" size={15} /><span>Find anything…</span><kbd>Ctrl K</kbd>
      </button>
      <span className={`data-source-pill ${hasMatlabData && !scenario?.dirty ? "data-source-pill--live" : ""}`}>
        <i />{avoidanceDemo ? "Demo session" : scenario?.dirty ? "Preview" : hasMatlabData ? "MATLAB results" : "Sample data"}
      </span>
      {avoidanceDemo && <button className="btn" onClick={onLeaveAvoidanceDemo}>Return to scenario</button>}
      {!avoidanceDemo && <button className="btn btn--primary run-scenario-btn" onClick={onRunMatlab}
        disabled={!scenario || running} aria-busy={running}
        title="Run the active scenario">
        <ConsoleIcon name={running ? "refresh" : "play"} size={16}
          className={running ? "icon-spin" : ""} />
        {running ? "Running…" : "Run scenario"}
      </button>}
    </header>
  );
}
