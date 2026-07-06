import { useMemo, useState } from "react";
import Modal, { FormRow } from "../Modal.jsx";
import { accessRequestOptions, accessRequestKey } from "../../lib/spec.js";

export default function AccessDialog({ spec, onSubmit, onClose }) {
  const options = useMemo(() => accessRequestOptions(spec), [spec]);
  const initialKey =
    (spec.accessRequests ?? [])
      .map(accessRequestKey)
      .find((key) => options.some((o) => o.key === key)) ??
    options[0]?.key ??
    "";
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [error, setError] = useState(null);
  const selected = options.find((o) => o.key === selectedKey);

  const submit = async (requests) => {
    const result = await onSubmit(requests);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Calculate Access"
      onClose={onClose}
      width={520}
      footer={
        <>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn"
              onClick={() => submit(null)}
              title="Compute the default capped set of satellite/ground-station access pairs"
            >
              Calculate all
            </button>
            <button
              className="btn btn--primary"
              onClick={() => selected && submit([selected.request])}
              disabled={!selected}
            >
              Calculate selected
            </button>
          </div>
        </>
      }
    >
      {options.length === 0 ? (
        <div className="empty-note">
          Add a satellite and a ground station, another satellite, or a
          satellite sensor plus a point target before calculating access.
        </div>
      ) : (
        <>
          <FormRow
            label="Access pair"
            hint="Only the selected pair is sent to MATLAB/Orekit by default"
          >
            <select
              className="input"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} - {option.meta}
                </option>
              ))}
            </select>
          </FormRow>
          <div className="hint-text">
            Selected access avoids spending MATLAB/Orekit time on unrelated
            pairs. Sensor pairs export both FOR-valid and FOV-in-view windows.
            Use Calculate all only when you want the default capped
            satellite/ground-station sweep.
          </div>
        </>
      )}
    </Modal>
  );
}
