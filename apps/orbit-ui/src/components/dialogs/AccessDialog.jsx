import { useMemo, useState } from "react";
import Modal, { FormRow } from "../Modal.jsx";
import ConsoleIcon from "../ConsoleIcon.jsx";
import { accessRequestOptions, accessRequestKey } from "../../lib/spec.js";

const sourceKey = ({ request }) => JSON.stringify(request.type === "sensor"
  ? ["sensor", request.platformName, request.sensorName]
  : ["access", request.sourceName]);

export default function AccessDialog({ spec, onSubmit, onClose }) {
  const options = useMemo(() => accessRequestOptions(spec), [spec]);
  const initial = options.find((option) => (spec.accessRequests ?? [])
    .some((request) => accessRequestKey(request) === option.key)) ?? options[0];
  const [selectedSource, setSelectedSource] = useState(initial ? sourceKey(initial) : "");
  const [targetName, setTargetName] = useState(initial?.request.targetName ?? "");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const sources = [...new Map(options.map((option) => [sourceKey(option), option])).entries()];
  const destinations = options.filter((option) => sourceKey(option) === selectedSource);
  const selected = destinations.find((option) => option.request.targetName === targetName) ?? destinations[0];
  const sensorMode = selected?.request.type === "sensor";

  const submit = async (requests) => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await onSubmit(requests);
      if (result?.errors) setError(result.errors.join(" "));
      else onClose();
    } catch (err) {
      setError(err.message || "The calculation could not be started. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal title="Calculate access" onClose={pending ? () => {} : onClose} width={520}
      footer={<>
        {error && <div className="error-text" role="alert">{error}</div>}
        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={pending}>Cancel</button>
          <button className="btn btn--primary" disabled={!selected || pending}
            aria-busy={pending} onClick={() => selected && submit([selected.request])}>
            <ConsoleIcon name={pending ? "refresh" : "play"} size={14} />
            {pending ? "Starting…" : "Calculate access"}
          </button>
        </div>
      </>}>
      <p className="dialog-intro">Choose the two objects to analyze.</p>
      {options.length === 0 ? <div className="empty-note">
        Add a satellite and a ground station, another satellite, or a sensor
        and point target to calculate access.
      </div> : <div className="access-endpoints">
        <FormRow label="Source">
          <select className="input" value={selectedSource} disabled={pending}
            onChange={(event) => { setSelectedSource(event.target.value); setError(null); }}>
            {sources.map(([key, option]) => <option key={key} value={key}>
              {option.request.type === "sensor"
                ? `${option.request.sensorName} · ${option.request.platformName}` : option.request.sourceName}
            </option>)}
          </select>
        </FormRow>
        <FormRow label="Destination">
          <select className="input" value={selected?.request.targetName ?? ""} disabled={pending}
            onChange={(event) => { setTargetName(event.target.value); setError(null); }}>
            {destinations.map((option) => <option key={option.key} value={option.request.targetName}>
              {option.request.targetName}
            </option>)}
          </select>
        </FormRow>
        <div className="analysis-summary">
          <ConsoleIcon name={sensorMode ? "sensor" : "activity"} size={18} />
          <div><strong>{sensorMode ? "Sensor visibility" : "Line of sight"}</strong>
            <p>{sensorMode ? "Reports reachable targets and windows inside the sensor's field of view."
              : "Reports when the objects can see each other, using the configured access constraints."}</p>
          </div>
        </div>
      </div>}
      <details className="analysis-batch">
        <summary>Calculate ground-station access in bulk</summary>
        <p>Uses the scenario's default satellite and ground-station pairs, subject to its pair limit.</p>
        <button className="btn" disabled={pending || !spec.objects.some((o) => o.kind === "satellite") ||
          !spec.objects.some((o) => o.kind === "groundStation")} onClick={() => submit(null)}>
          Calculate ground-station pairs
        </button>
      </details>
    </Modal>
  );
}
