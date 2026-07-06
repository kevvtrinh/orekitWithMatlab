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
import AreaTargetDialog from "./components/dialogs/AreaTargetDialog.jsx";
import AccessDialog from "./components/dialogs/AccessDialog.jsx";
import * as api from "./lib/api.js";
import { buildRenderScenario } from "./lib/renderScenario.js";
import { satLlaAt } from "./lib/scenarioUtils.js";
import {
  deriveSpecFromScenario,
  stripEmptyFields,
  validateSpec,
} from "./lib/spec.js";
import { clock } from "./lib/clock.js";

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
  const [viewOptions, setViewOptions] = useState({
    labels: true,
    groundTracks: true,
    accessLines: true,
    sensorFov: true,
    sensorFor: false,
    sun: true,
  });
  const jobStateRef = useRef("idle");
  const urlTimeApplied = useRef(false);
  const importInputRef = useRef(null);

  const scenario = useMemo(
    () => (spec ? buildRenderScenario(spec, matlabRaw) : null),
    [spec, matlabRaw],
  );

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
        scenario.groundPoints.some((g) => g.name === sel))
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
          if (err.errors) return { errors: err.errors };
          // Bridge went away mid-session: keep editing locally.
          setSpecMode("local");
          setSpecError(
            "Web bridge unreachable - edits are not persisted. Restart `npm run dev` in apps/orbit-ui and reload.",
          );
        }
      }
      return { ok: true };
    },
    [specMode],
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

  // Fly the camera-side selection to a satellite's current subpoint is out of
  // scope; selection from either panel or the 3D picker is by name.
  const openDialog = useCallback(
    (request) => {
      if (request?.type === "sensor" && !request.satellite) {
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

  return (
    <div className="app">
      <TopBar
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
      />
      <div className="main">
        <ObjectBrowser
          scenario={scenario}
          selection={selection}
          onSelect={setSelection}
          onEditSensor={(name) => {
            setSelection(name);
            openDialog({ type: "sensor", satellite: name });
          }}
          onRemoveSensor={removeSensor}
        />
        <div className="viewport-wrap">
          <Viewport3D
            scenario={scenario}
            selection={selection}
            viewOptions={viewOptions}
            onSelect={setSelection}
          />
          <TimelineBar scenario={scenario} />
        </div>
        <Inspector
          scenario={scenario}
          selection={selection}
          job={job}
          onRunMatlab={() => runAccessRequests(null)}
          onOpenDialog={openDialog}
          onDeleteObject={deleteObject}
        />
      </div>
      <StatusBar scenario={scenario} source={source} job={job} specError={specError} />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={onImportFile}
      />

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
            if (result.ok && targets.length > 0) setSelection(targets[0].name);
            return result;
          }}
        />
      )}
    </div>
  );
}

// (satLlaAt imported for potential camera-follow feature; keep tree-shaken)
void satLlaAt;
