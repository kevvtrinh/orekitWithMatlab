import { useMemo, useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  constellationTemplate,
  expandWalker,
  nextObjectName,
} from "../../lib/spec.js";

// Insert a Walker Delta/Star constellation. The pattern expands into
// individual Keplerian satellites at insert time (same behaviour and naming
// as the MATLAB UI's ConstellationFactory) so every member remains
// individually editable afterwards.
export default function ConstellationDialog({ spec, onSubmit, onClose }) {
  const [params, setParams] = useState(() =>
    constellationTemplate(nextObjectName(spec, "Walker")),
  );
  const [error, setError] = useState(null);
  const set = (field, value) => setParams((p) => ({ ...p, [field]: value }));

  const previewCount = useMemo(() => {
    try {
      return expandWalker(params).length;
    } catch {
      return null;
    }
  }, [params]);

  const submit = async () => {
    let satellites;
    try {
      satellites = expandWalker(params);
    } catch (err) {
      setError(err.message);
      return;
    }
    const result = await onSubmit(satellites);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Insert Constellation"
      onClose={onClose}
      width={460}
      footer={
        <>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <span className="hint-text">
              {previewCount != null ? `${previewCount} satellites will be inserted` : ""}
            </span>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={submit}>
              Insert Constellation
            </button>
          </div>
        </>
      }
    >
      <FormRow label="Pattern">
        <select
          className="input"
          value={params.pattern}
          onChange={(e) => set("pattern", e.target.value)}
        >
          <option value="delta">Walker Delta</option>
          <option value="star">Walker Star</option>
        </select>
      </FormRow>
      <FormRow label="Name prefix">
        <TextInput value={params.prefix} onChange={(v) => set("prefix", v)} />
      </FormRow>
      <FormRow label="Total satellites">
        <NumberInput
          value={params.totalSatellites}
          onChange={(v) => set("totalSatellites", v)}
          min={1}
          step={1}
        />
      </FormRow>
      <FormRow label="Planes">
        <NumberInput value={params.planes} onChange={(v) => set("planes", v)} min={1} step={1} />
      </FormRow>
      <FormRow label="Phasing" hint="Walker phasing factor F (0..planes-1)">
        <NumberInput value={params.phasing} onChange={(v) => set("phasing", v)} min={0} step={1} />
      </FormRow>
      <FormRow label="Semi-major axis (km)">
        <NumberInput
          value={params.semiMajorAxisKm}
          onChange={(v) => set("semiMajorAxisKm", v)}
          min={6379}
        />
      </FormRow>
      <FormRow label="Eccentricity">
        <NumberInput
          value={params.eccentricity}
          onChange={(v) => set("eccentricity", v)}
          min={0}
          max={0.999999}
          step={0.0001}
        />
      </FormRow>
      <FormRow label="Inclination (deg)">
        <NumberInput value={params.inclinationDeg} onChange={(v) => set("inclinationDeg", v)} />
      </FormRow>
      <FormRow label="RAAN offset (deg)">
        <NumberInput value={params.raanOffsetDeg} onChange={(v) => set("raanOffsetDeg", v)} />
      </FormRow>
      <FormRow label="Arg. of perigee (deg)">
        <NumberInput value={params.argPerigeeDeg} onChange={(v) => set("argPerigeeDeg", v)} />
      </FormRow>
      <FormRow label="Anomaly offset (deg)">
        <NumberInput
          value={params.trueAnomalyOffsetDeg}
          onChange={(v) => set("trueAnomalyOffsetDeg", v)}
        />
      </FormRow>
    </Modal>
  );
}
