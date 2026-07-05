import { useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import { normalizeEpochUtc } from "../../lib/spec.js";

// Scenario-level settings (name / epoch / duration / step), the counterpart
// of the MATLAB UI's scenario panel. Changing timing invalidates MATLAB
// results; the merge layer downgrades satellites to preview automatically.
export default function ScenarioSettingsDialog({ meta, onSubmit, onClose }) {
  const [name, setName] = useState(meta.name);
  // datetime-local wants "YYYY-MM-DDTHH:mm:ss" (no zone); we treat it as UTC.
  const [epochLocal, setEpochLocal] = useState(meta.epochUtc.replace(/(\.\d+)?Z$/, ""));
  const [durationHours, setDurationHours] = useState(meta.durationSeconds / 3600);
  const [stepSeconds, setStepSeconds] = useState(meta.stepSeconds);
  const [error, setError] = useState(null);

  const submit = async () => {
    const epochUtc = normalizeEpochUtc(`${epochLocal}Z`);
    if (!epochUtc) {
      setError("Epoch must be a valid UTC date/time.");
      return;
    }
    const result = await onSubmit({
      name: name.trim(),
      epochUtc,
      durationSeconds: Math.round(durationHours * 3600),
      stepSeconds,
    });
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Scenario Settings"
      onClose={onClose}
      width={420}
      footer={
        <>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={submit}>
              Apply
            </button>
          </div>
        </>
      }
    >
      <FormRow label="Name">
        <TextInput value={name} onChange={setName} />
      </FormRow>
      <FormRow label="Epoch (UTC)">
        <input
          className="input input--mono"
          type="datetime-local"
          step={1}
          value={epochLocal}
          onChange={(e) => setEpochLocal(e.target.value)}
        />
      </FormRow>
      <FormRow label="Duration (hours)">
        <NumberInput value={durationHours} onChange={setDurationHours} min={0.1} step={0.5} />
      </FormRow>
      <FormRow label="Time step (s)">
        <NumberInput value={stepSeconds} onChange={setStepSeconds} min={1} max={3600} step={1} />
      </FormRow>
      <div className="hint-text" style={{ padding: "2px 0 0" }}>
        Changing timing marks all MATLAB results stale; Keplerian satellites
        fall back to the browser preview until the next MATLAB run.
      </div>
    </Modal>
  );
}
