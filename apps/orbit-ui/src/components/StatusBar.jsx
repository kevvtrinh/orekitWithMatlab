import ConsoleIcon from "./ConsoleIcon.jsx";

export default function StatusBar({ scenario, source, job, specError }) {
  const freshWindows = scenario
    ? (scenario.accesses ?? []).reduce(
        (n, a) => n + (a.stale ? 0 : a.windows.length),
        0,
      )
    : 0;
  const previewCount = scenario
    ? (scenario.satellites ?? []).filter((s) => s.source !== "matlab").length
    : 0;
  const bridgeState = job?.state ?? "idle";
  const bridgeLabel = bridgeState === "unreachable" ? "Offline" :
    bridgeState.charAt(0).toUpperCase() + bridgeState.slice(1);

  return (
    <footer className="statusbar mission-status" aria-label="Workspace status">
      <span className="mission-status-source" title={scenario?.meta?.generatedAtUtc ? `Last computed: ${scenario.meta.generatedAtUtc}` : undefined}>
        <span
          className={`status-dot status-dot--${source === "matlab" ? "matlab" : "sample"}`}
        />
        {!scenario ? "No scenario loaded" : source === "matlab"
          ? "Computed results"
          : source === "sample-static"
            ? "Sample · offline"
            : "Sample scenario"}
      </span>
      {scenario && (
        <span className="mission-status-counts">
          {scenario.satellites.length} satellites · {scenario.groundPoints.filter((point) => !point.area).length}{" "}
          sites{scenario.areaOutlines.length > 0 ? ` · ${scenario.areaOutlines.length} ${scenario.areaOutlines.length === 1 ? "area" : "areas"}` : ""} · {freshWindows} access windows
        </span>
      )}
      {scenario?.dirty && (
        <span className="mission-status-pending" role="status">
          {previewCount > 0
            ? `${previewCount} object${previewCount > 1 ? "s" : ""} in preview · computation pending`
            : "Changes awaiting computation"}
        </span>
      )}
      {specError && <span className="error-text" role="alert">{specError}</span>}
      <span className="grow" />
      <span
        className={`mission-status-bridge mission-status-bridge--${bridgeState}`}
        title={
          job?.state === "unreachable"
            ? "The web bridge/dev server is unavailable - not a MATLAB failure. Restart `npm run dev` in apps/orbit-ui."
            : undefined
        }
      >
        <ConsoleIcon name="activity" size={13} />
        <span>MATLAB bridge</span>
        <span className="mission-status-bridge-label">{bridgeLabel}</span>
      </span>
    </footer>
  );
}
