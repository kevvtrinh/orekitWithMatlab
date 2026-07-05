import { useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  groundStationTemplate,
  nextObjectName,
  targetTemplate,
} from "../../lib/spec.js";

// Insert / edit dialog for ground objects. `kind` selects the variant:
//   groundStation -> MATLAB UI "Place" (lat/lon/alt + min elevation)
//   target        -> MATLAB UI "Point Target" (lat/lon/alt + priority)
export default function GroundDialog({ spec, kind, initial, onSubmit, onClose }) {
  const editing = Boolean(initial);
  const isTarget = (initial?.kind ?? kind) === "target";
  const [obj, setObj] = useState(() =>
    initial
      ? structuredClone(initial)
      : isTarget
        ? targetTemplate(nextObjectName(spec, "Target"))
        : groundStationTemplate(nextObjectName(spec, "Place")),
  );
  const [error, setError] = useState(null);
  const set = (field, value) => setObj((o) => ({ ...o, [field]: value }));

  const noun = isTarget ? "Point Target" : "Ground Station";

  const submit = async () => {
    const result = await onSubmit(obj, initial?.name);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title={editing ? `Edit ${noun} - ${initial.name}` : `Insert ${noun}`}
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
              {editing ? "Apply" : `Insert ${noun}`}
            </button>
          </div>
        </>
      }
    >
      <FormRow label="Name">
        <TextInput value={obj.name} onChange={(v) => set("name", v)} />
      </FormRow>
      <FormRow label="Latitude (deg)">
        <NumberInput
          value={obj.latitudeDeg}
          onChange={(v) => set("latitudeDeg", v)}
          min={-90}
          max={90}
        />
      </FormRow>
      <FormRow label="Longitude (deg)">
        <NumberInput
          value={obj.longitudeDeg}
          onChange={(v) => set("longitudeDeg", v)}
          min={-180}
          max={180}
        />
      </FormRow>
      <FormRow label="Altitude (m)">
        <NumberInput value={obj.altitudeM} onChange={(v) => set("altitudeM", v)} />
      </FormRow>
      {isTarget ? (
        <FormRow label="Priority" hint="Used by the tasking/scheduling workflows">
          <NumberInput value={obj.priority} onChange={(v) => set("priority", v)} min={0} />
        </FormRow>
      ) : (
        <FormRow
          label="Min elevation (deg)"
          hint="Access requires the satellite above this elevation"
        >
          <NumberInput
            value={obj.minElevationDeg}
            onChange={(v) => set("minElevationDeg", v)}
            min={-90}
            max={90}
          />
        </FormRow>
      )}
      {isTarget && (
        <div className="hint-text" style={{ padding: "2px 0 0" }}>
          Targets render in the scene and are editable; automatic access
          reports currently pair satellites with ground stations (sensor
          access to targets is a backend workflow not yet exposed here).
        </div>
      )}
    </Modal>
  );
}
