export default function StatusBar({ scenario, source, job, specError }) {
  const freshWindows = scenario
    ? scenario.accesses.reduce(
        (n, a) => n + (a.stale ? 0 : a.windows.length),
        0,
      )
    : 0;
  const previewCount = scenario
    ? scenario.satellites.filter((s) => s.source !== "matlab").length
    : 0;

  return (
    <footer className="statusbar">
      <span title={scenario?.meta.generatedAtUtc ? `Last computed: ${scenario.meta.generatedAtUtc}` : undefined}>
        <span
          className={`status-dot status-dot--${source === "matlab" ? "matlab" : "sample"}`}
        />
        {source === "matlab"
          ? "Computed results"
          : source === "sample-static"
            ? "Sample · offline"
            : "Sample scenario"}
      </span>
      {scenario && (
        <span>
          {scenario.satellites.length} satellites · {scenario.groundPoints.filter((point) => !point.area).length}{" "}
          sites{scenario.areaOutlines.length > 0 ? ` · ${scenario.areaOutlines.length} ${scenario.areaOutlines.length === 1 ? "area" : "areas"}` : ""} · {freshWindows} access windows
        </span>
      )}
      {scenario?.dirty && (
        <span style={{ color: "var(--warn)" }}>
          {previewCount > 0
            ? `${previewCount} object${previewCount > 1 ? "s" : ""} in preview · computation pending`
            : "Changes awaiting computation"}
        </span>
      )}
      {specError && <span className="error-text">{specError}</span>}
      <span className="grow" />
      <span
        title={
          job?.state === "unreachable"
            ? "The web bridge/dev server is unavailable - not a MATLAB failure. Restart `npm run dev` in apps/orbit-ui."
            : undefined
        }
      >
        MATLAB bridge:{" "}
        {job?.state === "unreachable" ? "web bridge offline" : (job?.state ?? "idle")}
      </span>
    </footer>
  );
}
