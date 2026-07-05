export default function StatusBar({ scenario, source, job }) {
  const windowCount = scenario
    ? scenario.accesses.reduce((n, a) => n + a.windows.length, 0)
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
      {scenario && (
        <span>
          generated {scenario.meta.generatedAtUtc.replace("T", " ").slice(0, 16)}Z
        </span>
      )}
      {scenario && (
        <span>
          {scenario.satellites.length} satellites - {scenario.groundPoints.length}{" "}
          sites - {windowCount} access windows
        </span>
      )}
      <span className="grow" />
      <span>
        MATLAB bridge:{" "}
        {job?.state === "unreachable" ? "offline" : (job?.state ?? "idle")}
      </span>
    </footer>
  );
}
