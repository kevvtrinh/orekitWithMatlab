const STATE_LABEL = {
  idle: "Idle",
  running: "Running...",
  succeeded: "Succeeded",
  failed: "MATLAB run failed",
  // "unreachable" means the web bridge/dev server, never MATLAB itself.
  unreachable: "Web bridge unavailable (not a MATLAB failure)",
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
        className="btn btn--primary"
        onClick={onRunMatlab}
        disabled={running}
      >
        {running
          ? "MATLAB running..."
          : state === "unreachable"
            ? "Retry MATLAB run"
            : dirty
              ? "Run scenario in MATLAB (edits pending)"
              : "Run scenario in MATLAB"}
      </button>

      <div className="hint-text">
        Sends the scenario spec to <code>matlab -batch</code>, which rebuilds
        it with the mission classes, propagates with Orekit, computes access,
        and reloads this view with authoritative results. First run takes a
        minute or two while MATLAB starts.
      </div>

      {state === "unreachable" && !job?.error && (
        <div className="error-text">
          Web bridge offline. Restart `npm run dev` in apps/orbit-ui and
          reload this page - MATLAB was never started, so it did not fail.
        </div>
      )}
      {job?.error && <div className="error-text">{job.error}</div>}

      {job?.log?.length > 0 && (
        <pre className="matlab-log">{job.log.join("\n")}</pre>
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
