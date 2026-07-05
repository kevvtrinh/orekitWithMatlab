import { useMemo, useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  areaTargetTemplate,
  expandAreaGrid,
  nextObjectName,
} from "../../lib/spec.js";

// Insert an area target as a grid of point targets, mirroring the MATLAB
// UI's Area Targets > Generate Grid workflow. Each grid point is a normal
// point target the MATLAB access/scheduling pipeline already understands.
export default function AreaTargetDialog({ spec, onSubmit, onClose }) {
  const [params, setParams] = useState(() =>
    areaTargetTemplate(nextObjectName(spec, "Area")),
  );
  const [error, setError] = useState(null);

  const setField = (field, value) =>
    setParams((p) => ({ ...p, [field]: value }));

  // Live preview of the grid so the user sees the point count before insert.
  const preview = useMemo(() => {
    try {
      return { targets: expandAreaGrid(params) };
    } catch (err) {
      return { error: err.message };
    }
  }, [params]);

  const submit = async () => {
    if (preview.error) {
      setError(preview.error);
      return;
    }
    const result = await onSubmit(preview.targets);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Insert Area Target"
      onClose={onClose}
      width={460}
      footer={
        <>
          {(error || preview.error) && (
            <div className="error-text">{error ?? preview.error}</div>
          )}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={submit}
              disabled={Boolean(preview.error)}
            >
              Insert {preview.targets ? `${preview.targets.length} grid points` : ""}
            </button>
          </div>
        </>
      }
    >
      <FormRow label="Name" hint="Grid points are named <Name>-R01C01 etc.">
        <TextInput value={params.name} onChange={(v) => setField("name", v)} />
      </FormRow>
      <FormRow label="Center latitude (deg)">
        <NumberInput
          value={params.centerLatDeg}
          onChange={(v) => setField("centerLatDeg", v)}
          min={-90}
          max={90}
        />
      </FormRow>
      <FormRow label="Center longitude (deg)">
        <NumberInput
          value={params.centerLonDeg}
          onChange={(v) => setField("centerLonDeg", v)}
          min={-180}
          max={180}
        />
      </FormRow>
      <FormRow label="Altitude (m)">
        <NumberInput
          value={params.altitudeM}
          onChange={(v) => setField("altitudeM", v)}
          min={-500}
          max={100000}
        />
      </FormRow>
      <FormRow label="Width (km)" hint="East-west extent">
        <NumberInput
          value={params.widthKm}
          onChange={(v) => setField("widthKm", v)}
          min={1}
        />
      </FormRow>
      <FormRow label="Height (km)" hint="North-south extent">
        <NumberInput
          value={params.heightKm}
          onChange={(v) => setField("heightKm", v)}
          min={1}
        />
      </FormRow>
      <FormRow label="Grid spacing (km)">
        <NumberInput
          value={params.spacingKm}
          onChange={(v) => setField("spacingKm", v)}
          min={1}
        />
      </FormRow>
      <FormRow label="Priority" hint="Applied to every grid point">
        <NumberInput
          value={params.priority}
          onChange={(v) => setField("priority", v)}
          min={0}
        />
      </FormRow>
      <div className="hint-text" style={{ paddingTop: 6 }}>
        The area is sampled as point targets so MATLAB computes access and
        schedules imaging per grid point - the same decomposition the MATLAB
        UI's Generate Grid button performs.
      </div>
    </Modal>
  );
}
