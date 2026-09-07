const STATE_LABEL = {
  idle: "Ready to compute",
  running: "Running...",
  succeeded: "Succeeded",
  failed: "MATLAB run failed",
  // "unreachable" means the web bridge/dev server, never MATLAB itself.
  unreachable: "Connection unavailable",
};

export default function MatlabPanel({ job, onRunMatlab, dirty }) {
  const state = job?.state ?? "idle";
  const running = state === "running";

  return (
    <div className="matlab-panel">
      <div className="matlab-status">
        <span className={`status-dot status-dot--${dotClass(state)}`} />
        <span>{STATE_LABEL[state] ?? state}</span>
        {job?.finishedAt && !running && (
          <span style={{ color: "var(--text-faint)" }}>
            {new Date(job.finishedAt).toISOString().slice(11, 19)}Z
          </span>
        )}
      </div>

      <button
        className="btn"
        onClick={() => onRunMatlab?.()}
        disabled={running}
      >
        {running
          ? "MATLAB running..."
          : state === "unreachable"
            ? "Retry MATLAB run"
            : dirty
              ? "Compute pending changes"
              : "Recompute scenario"}
      </button>

      <div className="hint-text">
        {dirty ? "Preview data is shown. Run the scenario to update orbits and access with Orekit." :
          "Orbits and access are computed with MATLAB / Orekit."}
        {" "}The first run includes engine startup.
      </div>

      {state === "unreachable" && !job?.error && (
        <div className="error-text">
          Reopen the console with launchOrbitHtmlUI in MATLAB, then reload this page.
        </div>
      )}
      {job?.error && <div className="error-text">{job.error}</div>}

      {job?.log?.length > 0 && (
        <details className="engine-log"><summary>Execution log</summary>
          <pre className="matlab-log">{job.log.join("\n")}</pre>
        </details>
      )}
    </div>
  );
}

function dotClass(state) {
  switch (state) {
    case "running":
      return "running";
    case "succeeded":
      return "matlab";
    case "failed":
    case "unreachable":
      return "failed";
    default:
      return "idle";
  }
}
