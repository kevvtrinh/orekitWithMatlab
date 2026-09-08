import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import ObjectBrowser from "./components/ObjectBrowser.jsx";
import Viewport3D from "./components/Viewport3D.jsx";
import Inspector from "./components/Inspector.jsx";
import TimelineBar from "./components/TimelineBar.jsx";
import StatusBar from "./components/StatusBar.jsx";
import SatelliteDialog from "./components/dialogs/SatelliteDialog.jsx";
import ConstellationDialog from "./components/dialogs/ConstellationDialog.jsx";
import GroundDialog from "./components/dialogs/GroundDialog.jsx";
import ScenarioSettingsDialog from "./components/dialogs/ScenarioSettingsDialog.jsx";
import TasksDialog from "./components/dialogs/TasksDialog.jsx";
import SensorDialog from "./components/dialogs/SensorDialog.jsx";
import ManeuverDialog from "./components/dialogs/ManeuverDialog.jsx";
import AreaTargetDialog from "./components/dialogs/AreaTargetDialog.jsx";
import AccessDialog from "./components/dialogs/AccessDialog.jsx";
import CountryTargetDialog from "./components/dialogs/CountryTargetDialog.jsx";
import ReportsDialog from "./components/dialogs/ReportsDialog.jsx";
import * as api from "./lib/api.js";
import { buildRenderScenario } from "./lib/renderScenario.js";
import {
  deriveSpecFromScenario,
  removeTargetGroup,
  stripEmptyFields,
  validateSpec,
} from "./lib/spec.js";
import { clock } from "./lib/clock.js";
import { avoidanceSpec, VIETNAM_COUNTRY_CODE } from "./lib/avoidanceDemo.js";
import { makeSlewRequest, validateSlewResult } from "./lib/slewPlanning.js";
import { runAvoidanceRequest } from "./lib/avoidanceClient.js";
import CommandPalette from "./components/CommandPalette.jsx";
import ShortcutGuide from "./components/ShortcutGuide.jsx";
import ConsoleIcon from "./components/ConsoleIcon.jsx";

const JOB_POLL_MS = 2500;

export default function App() {
  // The editable spec is the source of truth for what exists; the MATLAB
  // payload is the source of truth for propagation. `specMode` is "server"
  // when the bridge persists the spec, "local" for static hosting.
  const [spec, setSpec] = useState(null);
  const [specMode, setSpecMode] = useState("server");
  const [specError, setSpecError] = useState(null);
  const [matlabRaw, setMatlabRaw] = useState(null);
  const [source, setSource] = useState("sample");
  const [selection, setSelection] = useState(null);
  const [job, setJob] = useState({ state: "idle" });
  const [dialog, setDialog] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("view");
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [loadState, setLoadState] = useState("loading");
  const [focusRequest, setFocusRequest] = useState(null);
  const [sensorViewName, setSensorViewName] = useState(null);
  const [avoidanceDemo, setAvoidanceDemo] = useState(null);
  const [slewPlaybackRequest, setSlewPlaybackRequest] = useState(null);
  const demoBackup = useRef(null), demoAbort = useRef(null);
  useEffect(() => () => demoAbort.current?.abort(), []);
  const openSensorView = useCallback((name) => {
    setSelection(name); setMobilePanel("view"); setSensorViewName(name);
  }, []);
  useEffect(() => {
    if (sensorViewName && spec && !spec.objects.some((object) => object.name === sensorViewName && object.sensor)) setSensorViewName(null);
  }, [spec, sensorViewName]);
  const focusSatellite = useCallback((name) => {
    setSelection(name);
    setMobilePanel("view");
    setFocusRequest((previous) => ({ name, revision: (previous?.revision ?? 0) + 1 }));
  }, []);
  const [viewOptions, setViewOptions] = useState({
    labels: true,
    groundTracks: true,
    accessLines: true,
    sensorFov: true,
    sensorFor: false,
    sun: true,
    referenceFrame: "ECI",
    areaGrid: false,
  });
  const jobStateRef = useRef("idle");
  const urlTimeApplied = useRef(false);
  const importInputRef = useRef(null);

  const scenario = useMemo(
    () => (spec ? buildRenderScenario(spec, matlabRaw) : null),
    [spec, matlabRaw],
  );
  const scenarioRef = useRef(scenario); scenarioRef.current = scenario;

  async function startAvoidanceDemo() {
    if (!spec || job.state === "running" || demoAbort.current) return;
    if (!demoBackup.current) demoBackup.current = { spec, specMode, matlabRaw, source, selection, viewOptions, time: clock.getSnapshot() };
    const controller = new AbortController(); demoAbort.current = controller;
    setAvoidanceDemo({ phase: "exporting", message: "Loading the Vietnam country boundary…" });
    try {
      const response = await fetch("/geography/countries.json", { signal: controller.signal });
      if (!response.ok) throw new Error("The Vietnam country boundary could not be loaded.");
      const catalog = await response.json();
      const vietnam = catalog?.countries?.find((country) => country.code === VIETNAM_COUNTRY_CODE);
      const demo = avoidanceSpec(vietnam), demoScene = buildRenderScenario(demo, null);
      setDialog(null); setSensorViewName(null); setSpecError(null); setSlewPlaybackRequest(null);
      setSpecMode("local"); setSpec(demo); setMatlabRaw(null); setSource("avoidance-demo");
      setSelection("Slew Demo"); setMobilePanel("view");
      setViewOptions((prev) => ({ ...prev, sensorFov: true, sensorFor: false, labels: true, groundTracks: false, referenceFrame: "ECEF" }));
      setFocusRequest((prev) => ({ kind: "area", name: "Vietnam keep-out", revision: (prev?.revision ?? 0)+1 }));
      clock.setPlaying(false); clock.configure(demo.meta.durationSeconds); clock.setTime(0);
      setAvoidanceDemo({ phase: "exporting", message: "Projecting Vietnam into Az/El…" });
      const request = makeSlewRequest(demoScene, { platform: "Slew Demo", from: "West Target", to: "East Station",
        obstacle: "Vietnam keep-out", startSec: 0, durationSec: 30, clearanceDeg: 1 });
      const result = await runAvoidanceRequest(request, { signal: controller.signal, onProgress: (phase, status) => {
        setAvoidanceDemo({ phase, directory: status?.directory, message: phase === "exporting" ? "Exporting geographic Az/El boundaries…" :
          phase === "planning" ? "MATLAB is solving with the copied AzElObsAvoid planner…" : "Importing the result and checking Earth clearance…" });
      } });
      const plan = validateSlewResult(request, result.result, scenarioRef.current);
      setSlewPlaybackRequest({ id: result.id, plan });
      setAvoidanceDemo({ phase: "ready", directory: result.directory, message: `${result.result.time_s.length} checked samples · ${result.result.method} · auto replay` });
    } catch (err) {
      if (err.name !== "AbortError") setAvoidanceDemo((previous) => ({ ...previous, phase: "failed", message: err.message }));
    } finally { if (demoAbort.current === controller) demoAbort.current = null; }
  }

  function leaveAvoidanceDemo() {
    demoAbort.current?.abort(); demoAbort.current = null;
    const previous = demoBackup.current; demoBackup.current = null;
    setAvoidanceDemo(null); setSlewPlaybackRequest(null); setSensorViewName(null); setDialog(null); setSpecError(null);
    if (!previous) return;
    setSpec(previous.spec); setSpecMode(previous.specMode); setMatlabRaw(previous.matlabRaw); setSource(previous.source);
    setSelection(previous.selection); setViewOptions(previous.viewOptions); setFocusRequest(null);
    clock.setPlaying(false); clock.configure(previous.time.durationSec); clock.setTime(previous.time.tSec); clock.setSpeed(previous.time.speed);
  }

  // Keep the clock span in sync and apply the optional ?t= deep link once.
  useEffect(() => {
    if (!scenario) return;
    clock.configure(scenario.meta.durationSeconds);
    if (!urlTimeApplied.current) {
      urlTimeApplied.current = true;
      const t = Number(new URLSearchParams(window.location.search).get("t"));
      if (Number.isFinite(t) && t > 0) clock.setTime(t);
    }
  }, [scenario]);

  // Keep the selection valid as objects come and go.
  useEffect(() => {
    if (!scenario) return;
    setSelection((sel) =>
      sel &&
      (scenario.satellites.some((s) => s.name === sel) ||
          scenario.groundPoints.some((g) => g.name === sel) ||
          scenario.areaOutlines.some((area) => area.name === sel))
        ? sel
        : (scenario.satellites[0]?.name ?? scenario.groundPoints[0]?.name ?? null),
    );
  }, [scenario]);

  const loadScenario = useCallback(async () => {
    // Preferred path: the bridge server (proxied under /api). Fallback: the
    // bundled sample JSON served statically, so the UI works with no backend.
    try {
      const body = await api.fetchScenario();
      setMatlabRaw(body.scenario);
      setSource(body.source);
      return body.scenario;
    } catch {
      /* bridge server not running */
    }
    try {
      const res = await fetch("/sample-scenario.json");
      if (res.ok) {
        const raw = await res.json();
        setMatlabRaw(raw);
        setSource("sample-static");
        return raw;
      }
    } catch (err) {
      console.error("No scenario data available", err);
    }
    return null;
  }, []);

  const loadSpec = useCallback(
    async (scenarioRaw) => {
      try {
        const body = await api.fetchSpec();
        setSpec(body.spec);
        setSpecMode("server");
      } catch {
        // Static hosting: edit an in-memory spec derived from the sample.
        setSpecMode("local");
        if (scenarioRaw) setSpec(deriveSpecFromScenario(scenarioRaw));
      }
    },
    [],
  );

  const pollJob = useCallback(async () => {
    try {
      const status = await api.fetchJob();
      const previous = jobStateRef.current;
      jobStateRef.current = status.state;
      setJob(status);
      if (previous === "running" && status.state === "succeeded") {
        loadScenario();
      }
      return status.state;
    } catch (err) {
      // Distinguish "bridge offline" from "stale dev server/bridge" so the
      // panel never blames MATLAB for a web-plumbing problem.
      const { state, message } = await api.classifyBridgeError(err);
      jobStateRef.current = state;
      setJob({ state, error: message });
      return state;
    }
  }, [loadScenario]);

  useEffect(() => {
    (async () => {
      const raw = await loadScenario();
      await loadSpec(raw);
      setLoadState(raw ? "ready" : "failed");
      pollJob();
    })();
  }, [loadScenario, loadSpec, pollJob]);

  // Poll the job endpoint while a run is in flight.
  useEffect(() => {
    if (job.state !== "running") return undefined;
    const id = setInterval(pollJob, JOB_POLL_MS);
    return () => clearInterval(id);
  }, [job.state, pollJob]);

  // ---------------------------------------------------------------------
  // Spec editing. All mutations funnel through applySpec: validate locally,
  // apply optimistically, persist to the bridge (authoritative validation).
  // ---------------------------------------------------------------------

  const applySpec = useCallback(
    async (nextSpec) => {
      const candidate = stripEmptyFields(nextSpec);
      const errors = validateSpec(candidate);
      if (errors.length > 0) return { errors };
      setSpecError(null);
      setSpec(candidate);
      if (specMode === "server") {
        try {
          const body = await api.saveSpec(candidate);
          setSpec(body.spec);
        } catch (err) {
            if (err.errors) { setSpec(spec); return { errors: err.errors }; }
          // Bridge went away mid-session: keep editing locally.
          setSpecMode("local");
          setSpecError(
            "Web bridge unreachable - edits are not persisted. Restart `npm run dev` in apps/orbit-ui and reload.",
          );
        }
      }
      return { ok: true };
    },
      [specMode, spec],
  );

  const insertObjects = useCallback(
    (objects) => applySpec({ ...spec, objects: [...spec.objects, ...objects] }),
    [applySpec, spec],
  );

  const replaceObject = useCallback(
    (originalName, object) =>
      // Renames carry sensor tasks that reference the object along.
      applySpec({
        ...spec,
        objects: spec.objects.map((o) => (o.name === originalName ? object : o)),
        tasks: (spec.tasks ?? []).map((t) => {
          const satelliteName =
            t.satelliteName === originalName ? object.name : t.satelliteName;
          return {
            ...t,
            targetName:
              t.targetName === originalName ? object.name : t.targetName,
            // A task pinned to a satellite whose sensor was removed falls
            // back to "any sensor" instead of failing validation.
            satelliteName:
              satelliteName === object.name && !object.sensor
                ? ""
                : satelliteName,
          };
        }),
      }),
    [applySpec, spec],
  );

  const deleteObject = useCallback(
    (name) => {
      if (!window.confirm(`Delete '${name}' from the scenario?`)) return;
      // Sensor tasks referencing the deleted object go with it.
      applySpec({
        ...spec,
        objects: spec.objects.filter((o) => o.name !== name),
        tasks: (spec.tasks ?? []).filter(
          (t) => t.targetName !== name && t.satelliteName !== name,
        ),
      }).then((result) => {
        if (result.errors) setSpecError(result.errors.join(" "));
      });
    },
    [applySpec, spec],
  );

  const deleteArea = useCallback(
    (group) => {
      const count = spec.objects.filter(
        (o) => o.kind === "target" && o.group === group,
      ).length;
      if (count === 0) return;
      if (
        !window.confirm(
          `Delete area '${group}' and its ${count} grid points from the scenario?`,
        )
      ) {
        return;
      }
      applySpec(removeTargetGroup(spec, group)).then((result) => {
        if (result.errors) setSpecError(result.errors.join(" "));
      });
    },
    [applySpec, spec],
  );

  const removeSensor = useCallback(
    (name) => {
      const obj = spec?.objects.find((o) => o.name === name);
      if (!obj?.sensor) return;
      if (!window.confirm(`Remove the sensor from '${name}'?`)) return;
      const { sensor: _sensor, ...rest } = obj;
      // replaceObject already re-points tasks pinned to this satellite at
      // "any sensor" once the sensor is gone.
      replaceObject(name, rest).then((result) => {
        if (result.errors) setSpecError(result.errors.join(" "));
      });
    },
    [spec, replaceObject],
  );

  const updateMeta = useCallback(
    (meta) => applySpec({ ...spec, meta }),
    [applySpec, spec],
  );

  const updateTasks = useCallback(
    (tasks) => applySpec({ ...spec, tasks }),
    [applySpec, spec],
  );

  const resetSpec = useCallback(async () => {
    if (!window.confirm("Reset to the demo scenario? This discards all edits.")) {
      return;
    }
    if (specMode === "server") {
      try {
        const body = await api.resetSpec();
        setSpec(body.spec);
        return;
      } catch {
        /* fall through to local reset */
      }
    }
    if (matlabRaw) setSpec(deriveSpecFromScenario(matlabRaw));
  }, [specMode, matlabRaw]);

  // ---------------------------------------------------------------------
  // MATLAB run / import / export
  // ---------------------------------------------------------------------

  const runMatlab = useCallback(async (runSpec) => {
    if (demoBackup.current) return { errors: ["Return to your scenario before running the full MATLAB scenario."] };
    try {
      const specForRun =
        runSpec !== undefined ? runSpec : specMode === "server" ? spec : undefined;
      const body = await api.runScenario(specForRun);
      jobStateRef.current = "running";
      setJob(body.job ?? { state: "running" });
      return { ok: true };
    } catch (err) {
      if (err.status === 409) {
        jobStateRef.current = "running";
        pollJob();
        return { ok: true };
      }
      const { state, message } = await api.classifyBridgeError(err);
      jobStateRef.current = state;
      setJob({ state, error: message });
      return { errors: [message] };
    }
  }, [spec, specMode, pollJob]);

  const runAccessRequests = useCallback(
    async (requests) => {
      if (!spec) return { errors: ["No scenario spec is loaded."] };
      const nextSpec =
        requests === null
          ? (() => {
              const { accessRequests: _accessRequests, ...rest } = spec;
              return rest;
            })()
          : { ...spec, accessRequests: requests };
      const candidate = stripEmptyFields(nextSpec);
      const errors = validateSpec(candidate);
      if (errors.length > 0) return { errors };
      setSpecError(null);
      setSpec(candidate);
      return runMatlab(candidate);
    },
    [spec, runMatlab],
  );

  const handleExport = useCallback(
    (what) => {
      if (what === "spec" && spec) {
        api.downloadJson("scenario-spec.json", spec);
      } else if (what === "scenario") {
        if (matlabRaw) api.downloadJson("scenario.json", matlabRaw);
        else setSpecError("No propagated scenario to export yet.");
      } else if (what === "csv") {
        const sat = scenario?.satellites.find(
          (s) => s.name === selection && s.ephemeris,
        );
        if (!sat) {
          setSpecError("Select a satellite with an ephemeris to export CSV.");
          return;
        }
        const rows = ["tOffsetSec,xEciKm,yEciKm,zEciKm,latDeg,lonDeg,altKm"];
        const { n, t, eci, lla } = sat.ephemeris;
        for (let i = 0; i < n; i++) {
          rows.push(
            [
              t[i],
              eci[i * 3].toFixed(4),
              eci[i * 3 + 1].toFixed(4),
              eci[i * 3 + 2].toFixed(4),
              lla[i * 3].toFixed(5),
              lla[i * 3 + 1].toFixed(5),
              lla[i * 3 + 2].toFixed(5),
            ].join(","),
          );
        }
        api.downloadText(
          `${sat.name.replace(/[^\w-]+/g, "_")}_ephemeris.csv`,
          rows.join("\n"),
        );
      }
    },
    [spec, matlabRaw, scenario, selection],
  );

  const handleImportSpec = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const onImportFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        const result = await applySpec(imported);
        if (result.errors) {
          setSpecError(`Import rejected: ${result.errors.join(" ")}`);
        }
      } catch {
        setSpecError("Import failed: not a valid JSON file.");
      }
    },
    [applySpec],
  );

  const toggleOption = useCallback((key) => {
    setViewOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const openDialog = useCallback(
    (request) => {
      if (!spec) return;
      if (
        (request?.type === "sensor" || request?.type === "maneuvers") &&
        !request.satellite
      ) {
        const selectedSatellite = spec?.objects.find(
          (o) => o.kind === "satellite" && o.name === selection,
        );
        if (selectedSatellite) {
          setDialog({ ...request, satellite: selectedSatellite.name });
          return;
        }
      }
      setDialog(request);
    },
    [selection, spec],
  );
  const closeDialog = useCallback(() => setDialog(null), []);

  const toggleFocusMode = useCallback(() => {
    setMobilePanel("view");
    setFocusMode((value) => !value);
  }, []);

  useEffect(() => {
    function handleKey(event) {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!dialog && !shortcutsOpen) setCommandOpen((open) => !open);
        return;
      }
      if (event.key === "Escape" && focusMode && !dialog && !commandOpen && !shortcutsOpen) {
        event.preventDefault(); setFocusMode(false); return;
      }
      if (event.target.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"]')) return;
      if (dialog || commandOpen || shortcutsOpen || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.code === "Space" && !event.target.closest?.('button, a, summary, [role="button"], [role="option"]')) {
        if (scenario?.meta.durationSeconds > 0) { event.preventDefault(); clock.setPlaying(!clock.getSnapshot().playing); }
      }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); toggleFocusMode(); }
      if (event.key === "?") { event.preventDefault(); setShortcutsOpen(true); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dialog, commandOpen, shortcutsOpen, focusMode, toggleFocusMode, scenario]);

  const commands = [
    { id: "reports", group: "Create & analyze", label: "Reports & graphs", detail: "Orbital elements, solar beta angle, lighting intervals, and CSV reports", icon: "activity", disabled: !spec, action: () => openDialog({ type: "reports" }) },
    { id: "satellite", group: "Create & analyze", label: "Add satellite", detail: "Keplerian elements or a two-line element set", icon: "satellite", disabled: !spec, action: () => openDialog({ type: "satellite" }) },
    { id: "constellation", group: "Create & analyze", label: "Build a constellation", detail: "Design a Walker Delta or Star constellation", icon: "orbit", disabled: !spec, action: () => openDialog({ type: "constellation" }) },
    { id: "ground", group: "Create & analyze", label: "Add ground station", icon: "ground", disabled: !spec, action: () => openDialog({ type: "ground", kind: "groundStation" }) },
    { id: "country", group: "Create & analyze", label: "Add country area target", icon: "globe", disabled: !spec, action: () => openDialog({ type: "countryTarget" }) },
    { id: "access", group: "Create & analyze", label: "Calculate access", detail: "Find visibility windows between mission objects", icon: "activity", disabled: !spec, action: () => openDialog({ type: "access" }) },
    { id: "tasks", group: "Create & analyze", label: "Schedule sensor tasks", icon: "sensor", disabled: !spec, action: () => openDialog({ type: "tasks" }) },
    ...(scenario?.satellites ?? []).map((satellite) => ({ id: `sat-${satellite.name}`, group: "Mission objects", label: satellite.name, detail: "Satellite · select and follow in 3D", icon: "satellite", action: () => focusSatellite(satellite.name) })),
    ...(scenario?.groundPoints ?? []).filter((point) => !point.area).map((point) => ({ id: `point-${point.name}`, group: "Mission objects", label: point.name, detail: "Ground object · inspect details", icon: "ground", action: () => { setSelection(point.name); setFocusMode(false); setMobilePanel("details"); } })),
    ...(scenario?.areaOutlines ?? []).map((area) => ({ id: `area-${area.name}`, group: "Mission objects", label: area.name, detail: "Area target · locate on Earth", icon: "globe", action: () => { setSelection(area.name); setMobilePanel("view"); setFocusRequest((previous) => ({ name: area.name, kind: "area", revision: (previous?.revision ?? 0) + 1 })); } })),
    { id: "focus", group: "Workspace", label: focusMode ? "Exit focus mode" : "Enter focus mode", detail: "Give the orbital view the whole workspace", icon: "expand", shortcut: "F", action: toggleFocusMode },
    ...[["labels", "Object labels"], ["groundTracks", "Ground tracks"], ["accessLines", "Access lines"], ["sensorFov", "Sensor field of view"]].map(([key, label]) => ({ id: key, group: "Workspace", label: `${viewOptions[key] ? "Hide" : "Show"} ${label.toLowerCase()}`, icon: "layers", action: () => toggleOption(key) })),
    { id: "settings", group: "Scenario", label: "Scenario settings", detail: "Epoch, duration, and propagation time step", icon: "settings", disabled: !spec, action: () => openDialog({ type: "settings" }) },
    { id: "export", group: "Scenario", label: "Export scenario definition", detail: "Download an editable JSON file", icon: "download", disabled: !spec, action: () => handleExport("spec") },
    { id: "import", group: "Scenario", label: "Import scenario definition", icon: "upload", action: handleImportSpec },
    { id: "shortcuts", group: "Help", label: "Keyboard shortcuts", icon: "keyboard", shortcut: "?", action: () => setShortcutsOpen(true) },
  ];

  return (
    <div className={`app${focusMode ? " app--focus" : ""}`}>
      <TopBar
        avoidanceDemo={avoidanceDemo}
        onAvoidanceDemo={startAvoidanceDemo}
        onLeaveAvoidanceDemo={leaveAvoidanceDemo}
        scenario={scenario}
        source={source}
        job={job}
        viewOptions={viewOptions}
        onToggleOption={toggleOption}
        onOpenDialog={openDialog}
        onResetSpec={resetSpec}
        onExport={handleExport}
        onImportSpec={handleImportSpec}
        onRunMatlab={() => runAccessRequests(null)}
        onOpenCommands={() => setCommandOpen(true)}
      />
      <div className="workspace-heading">
        <div className="workspace-breadcrumb"><ConsoleIcon name="layers" size={15} /><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>{scenario?.meta.name ?? "Preparing your mission"}</strong><span className="workspace-tag">ORBITAL ANALYSIS</span></div>
        <div className="workspace-actions">
          <button onClick={() => setShortcutsOpen(true)} title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts"><ConsoleIcon name="keyboard" size={16} /></button>
          <button onClick={toggleFocusMode} aria-pressed={focusMode} title="Toggle focus mode (F)"><ConsoleIcon name={focusMode ? "collapse" : "expand"} size={15} /><span>{focusMode ? "Exit focus" : "Focus mode"}</span></button>
        </div>
      </div>
      <nav className="workspace-tabs" aria-label="Workspace panels">
        {[["objects", "Objects"], ["view", "Orbital view"], ["details", "Details"]].map(([panel, label]) => (
          <button key={panel} aria-pressed={mobilePanel === panel}
            onClick={() => setMobilePanel(panel)}>{label}</button>
        ))}
      </nav>
      <main className="main" data-mobile-panel={mobilePanel}>
        <ObjectBrowser
          onOpenSensorView={openSensorView}
          scenario={scenario}
          selection={selection}
          onSelect={setSelection}
          onEditSensor={(name) => {
            setSelection(name);
            openDialog({ type: "sensor", satellite: name });
          }}
          onRemoveSensor={removeSensor}
          onDeleteArea={deleteArea}
          onAddSatellite={() => openDialog({ type: "satellite" })}
          onFocusSatellite={focusSatellite}
        />
        <div className="viewport-wrap">
          <Viewport3D
            slewPlaybackRequest={slewPlaybackRequest}
            avoidanceDemo={avoidanceDemo}
            loadState={loadState}
            sensorViewName={sensorViewName}
            onOpenSensorView={openSensorView}
            onCloseSensorView={() => setSensorViewName(null)}
            scenario={scenario}
            selection={selection}
            viewOptions={viewOptions}
            onSelect={setSelection}
            onToggleOption={toggleOption}
            focusRequest={focusRequest}
            onSetReferenceFrame={(referenceFrame) => setViewOptions((prev) => ({ ...prev, referenceFrame }))}
            onOrbitCommit={(name, orbit) => {
              const object = spec.objects.find((item) => item.name === name);
              return object ? replaceObject(name, { ...object, orbit }) : { errors: ["This satellite is no longer in the scenario."] };
            }}
          />
          <TimelineBar scenario={scenario} selection={selection} />
        </div>
        <Inspector
          onOpenSensorView={openSensorView}
          scenario={scenario}
          selection={selection}
          job={job}
          onRunMatlab={() => runAccessRequests(null)}
          onOpenDialog={openDialog}
          onDeleteObject={deleteObject}
          onFocusSatellite={focusSatellite}
        />
      </main>
      <StatusBar scenario={scenario} source={source} job={job} specError={specError} />
      {commandOpen && <CommandPalette commands={commands} onClose={() => setCommandOpen(false)} />}
      {shortcutsOpen && <ShortcutGuide onClose={() => setShortcutsOpen(false)} />}

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={onImportFile}
      />

      {dialog?.type === "reports" && scenario && <ReportsDialog
        scenario={scenario} selection={dialog.satellite ?? selection} job={job}
        onRunMatlab={avoidanceDemo ? undefined : () => runMatlab(spec)}
        onClose={closeDialog}
        onJumpToTime={(time, satelliteName) => {
          clock.setPlaying(false); clock.setTime(time);
          if (satelliteName) setSelection(satelliteName);
          setMobilePanel("view"); closeDialog();
        }} />}
      {dialog?.type === "satellite" && spec && (
        <SatelliteDialog
          spec={spec}
          initial={dialog.initial ?? null}
          onClose={closeDialog}
          onSubmit={async (obj, originalName) => {
            const result = originalName
              ? await replaceObject(originalName, obj)
              : await insertObjects([obj]);
            if (result.ok && !originalName) setSelection(obj.name);
            return result;
          }}
        />
      )}
      {dialog?.type === "constellation" && spec && (
        <ConstellationDialog
          spec={spec}
          onClose={closeDialog}
          onSubmit={async (sats) => {
            const result = await insertObjects(sats);
            if (result.ok && sats.length > 0) setSelection(sats[0].name);
            return result;
          }}
        />
      )}
      {dialog?.type === "ground" && spec && (
        <GroundDialog
          spec={spec}
          kind={dialog.kind}
          initial={dialog.initial ?? null}
          onClose={closeDialog}
          onSubmit={async (obj, originalName) => {
            const result = originalName
              ? await replaceObject(originalName, obj)
              : await insertObjects([obj]);
            if (result.ok && !originalName) setSelection(obj.name);
            return result;
          }}
        />
      )}
      {dialog?.type === "settings" && spec && (
        <ScenarioSettingsDialog
          meta={spec.meta}
          onClose={closeDialog}
          onSubmit={updateMeta}
        />
      )}
      {dialog?.type === "tasks" && spec && (
        <TasksDialog spec={spec} onClose={closeDialog} onSubmit={updateTasks} />
      )}
      {dialog?.type === "access" && spec && (
        <AccessDialog
          spec={spec}
          onClose={closeDialog}
          onSubmit={runAccessRequests}
        />
      )}
      {dialog?.type === "sensor" && spec && (
        <SensorDialog
          spec={spec}
          initialSatellite={dialog.satellite ?? null}
          onClose={closeDialog}
          onSubmit={async (originalName, obj) => {
            const result = await replaceObject(originalName, obj);
            if (result.ok) openSensorView(obj.name);
            return result;
          }}
        />
      )}
      {dialog?.type === "maneuvers" && spec && (
        <ManeuverDialog
          spec={spec}
          initialSatellite={dialog.satellite ?? null}
          onClose={closeDialog}
          onSubmit={async (originalName, obj) => {
            const result = await replaceObject(originalName, obj);
            if (result.ok) setSelection(obj.name);
            return result;
          }}
        />
      )}
      {dialog?.type === "areaTarget" && spec && (
        <AreaTargetDialog
          spec={spec}
          onClose={closeDialog}
          onSubmit={async (targets) => {
            const result = await insertObjects(targets);
            // Don't select a grid point: ObjectBrowser auto-expands the area
            // containing the current selection, which would blow the new
            // area open to all its points instead of showing it collapsed.
            return result;
          }}
        />
      )}
      {dialog?.type === "countryTarget" && spec && <CountryTargetDialog spec={spec} onClose={closeDialog}
        onSubmit={async ({ targets, area }) => {
          const result = await applySpec({ ...spec, objects: [...spec.objects, ...targets], areas: [...(spec.areas ?? []), area] });
            if (result.ok) {
              setSelection(area.name);
              setMobilePanel("view");
              setFocusRequest((previous) => ({ name: area.name, kind: "area", revision: (previous?.revision ?? 0) + 1 }));
            }
          return result;
        }} />}
    </div>
  );
}
