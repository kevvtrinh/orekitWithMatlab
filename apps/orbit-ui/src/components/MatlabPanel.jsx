const STATE_LABEL = {
  idle: "Idle",
  running: "Running...",
  succeeded: "Succeeded",
  failed: "Failed",
  unreachable: "Bridge server offline",
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
        disabled={running || state === "unreachable"}
      >
        {running
          ? "MATLAB running..."
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
