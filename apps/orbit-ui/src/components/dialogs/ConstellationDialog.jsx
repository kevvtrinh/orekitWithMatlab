import { useMemo, useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  constellationTemplate,
  expandWalker,
  nextObjectName,
  sensorTemplate,
} from "../../lib/spec.js";

const PROPAGATOR_CHOICES = [
  ["Keplerian", "Keplerian (two-body)"],
  ["EcksteinHechler", "Eckstein-Hechler (J2-J6)"],
  ["Numerical", "Numerical (HPOP)"],
];

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
  const setSensor = (field, value) =>
    setParams((p) => ({ ...p, sensor: { ...p.sensor, [field]: value } }));

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
      <FormRow
        label="Propagator"
        hint="Applied to every member; each remains individually editable after insert"
      >
        <select
          className="input"
          value={params.propagator}
          onChange={(e) => set("propagator", e.target.value)}
        >
          {PROPAGATOR_CHOICES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow
        label="Imaging sensor"
        hint="Equip every member with an identical nadir-pointing conic sensor"
      >
        <input
          type="checkbox"
          checked={Boolean(params.sensor)}
          onChange={(e) =>
            set("sensor", e.target.checked ? sensorTemplate() : undefined)
          }
        />
      </FormRow>
      {params.sensor && (
        <>
          <FormRow
            label="FOV half-angle (deg)"
            hint="Instantaneous beam: half-angle of the sensor cone"
          >
            <NumberInput
              value={params.sensor.coneHalfAngleDeg}
              onChange={(v) => setSensor("coneHalfAngleDeg", v)}
              min={0.1}
              max={90}
            />
          </FormRow>
          <FormRow
            label="FOR half-angle (deg)"
            hint="Field of regard: how far the sensor can slew off nadir"
          >
            <NumberInput
              value={params.sensor.fieldOfRegardDeg}
              onChange={(v) => setSensor("fieldOfRegardDeg", v)}
              min={0.1}
              max={180}
            />
          </FormRow>
          <FormRow label="Slew rate (deg/s)">
            <NumberInput
              value={params.sensor.slewRateDegPerSec}
              onChange={(v) => setSensor("slewRateDegPerSec", v)}
              min={0.01}
              max={60}
            />
          </FormRow>
        </>
      )}
    </Modal>
  );
}
