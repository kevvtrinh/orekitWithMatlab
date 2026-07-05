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
      <span>
        <span
          className={`status-dot status-dot--${source === "matlab" ? "matlab" : "sample"}`}
        />
        {source === "matlab"
          ? "Live MATLAB/Orekit data"
          : source === "sample-static"
            ? "Bundled sample data (bridge server offline)"
            : "Bundled sample data"}
      </span>
      {scenario?.meta.generatedAtUtc && (
        <span>
          generated {scenario.meta.generatedAtUtc.replace("T", " ").slice(0, 16)}Z
        </span>
      )}
      {scenario && (
        <span>
          {scenario.satellites.length} satellites - {scenario.groundPoints.length}{" "}
          sites - {freshWindows} access windows
        </span>
      )}
      {scenario?.dirty && (
        <span style={{ color: "var(--warn)" }}>
          {previewCount > 0
            ? `${previewCount} object${previewCount > 1 ? "s" : ""} previewed - run MATLAB for authoritative results`
            : "edited since last MATLAB run"}
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
