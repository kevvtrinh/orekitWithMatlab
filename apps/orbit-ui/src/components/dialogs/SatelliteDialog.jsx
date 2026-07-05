import { useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  keplerianSatelliteTemplate,
  nextObjectName,
  PROPAGATORS,
  sensorTemplate,
  tleSatelliteTemplate,
} from "../../lib/spec.js";

const KEP_PROPAGATORS = [
  ["Keplerian", "Keplerian (two-body)"],
  ["EcksteinHechler", "Eckstein-Hechler (J2-J6)"],
  ["Numerical", "Numerical (HPOP)"],
];

const TLE_PROPAGATORS = [
  ["TLE", "SGP4 (TLE)"],
  ["Numerical", "Numerical (HPOP, seeded from TLE)"],
];

// Insert / edit dialog for a satellite, mirroring the MATLAB UI's
// Keplerian and TLE tabs. `initial` is a spec object when editing.
export default function SatelliteDialog({ spec, initial, onSubmit, onClose }) {
  const editing = Boolean(initial);
  const [tab, setTab] = useState(initial?.orbit.type === "tle" ? "tle" : "keplerian");
  const [error, setError] = useState(null);

  const [kep, setKep] = useState(() =>
    initial?.orbit.type !== "tle" && initial
      ? structuredClone(initial)
      : keplerianSatelliteTemplate(nextObjectName(spec, "Satellite")),
  );
  const [tle, setTle] = useState(() =>
    initial?.orbit.type === "tle"
      ? structuredClone(initial)
      : tleSatelliteTemplate(nextObjectName(spec, "Satellite")),
  );

  const active = tab === "tle" ? tle : kep;
  const setActive = tab === "tle" ? setTle : setKep;
  const setField = (field, value) => setActive((s) => ({ ...s, [field]: value }));
  const setOrbit = (field, value) =>
    setActive((s) => ({ ...s, orbit: { ...s.orbit, [field]: value } }));
  const setSensor = (field, value) =>
    setActive((s) => ({ ...s, sensor: { ...s.sensor, [field]: value } }));

  const submit = async () => {
    const result = await onSubmit(active, initial?.name);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title={editing ? `Edit Satellite - ${initial.name}` : "Insert Satellite"}
      onClose={onClose}
      width={480}
      footer={
        <>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={submit}>
              {editing ? "Apply" : "Insert Satellite"}
            </button>
          </div>
        </>
      }
    >
      {!editing && (
        <div className="tab-strip">
          <button
            className={`tab ${tab === "keplerian" ? "active" : ""}`}
            onClick={() => setTab("keplerian")}
          >
            Keplerian
          </button>
          <button
            className={`tab ${tab === "tle" ? "active" : ""}`}
            onClick={() => setTab("tle")}
          >
            TLE
          </button>
        </div>
      )}

      <FormRow label="Name">
        <TextInput value={active.name} onChange={(v) => setField("name", v)} />
      </FormRow>

      {tab === "keplerian" ? (
        <>
          <FormRow
            label="Semi-major axis (km)"
            hint="From Earth's center, not altitude (Earth radius is about 6378 km)"
          >
            <NumberInput
              value={kep.orbit.semiMajorAxisKm}
              onChange={(v) => setOrbit("semiMajorAxisKm", v)}
              min={6379}
            />
          </FormRow>
          <FormRow label="Eccentricity">
            <NumberInput
              value={kep.orbit.eccentricity}
              onChange={(v) => setOrbit("eccentricity", v)}
              min={0}
              max={0.999999}
              step={0.0001}
            />
          </FormRow>
          <FormRow label="Inclination (deg)">
            <NumberInput
              value={kep.orbit.inclinationDeg}
              onChange={(v) => setOrbit("inclinationDeg", v)}
            />
          </FormRow>
          <FormRow label="RAAN (deg)" hint="Right ascension of the ascending node">
            <NumberInput
              value={kep.orbit.raanDeg}
              onChange={(v) => setOrbit("raanDeg", v)}
            />
          </FormRow>
          <FormRow label="Arg. of perigee (deg)">
            <NumberInput
              value={kep.orbit.argPerigeeDeg}
              onChange={(v) => setOrbit("argPerigeeDeg", v)}
            />
          </FormRow>
          <FormRow
            label="True anomaly (deg)"
            hint="Position in the orbit at the scenario epoch"
          >
            <NumberInput
              value={kep.orbit.trueAnomalyDeg}
              onChange={(v) => setOrbit("trueAnomalyDeg", v)}
            />
          </FormRow>
          <FormRow label="Mass (kg)">
            <NumberInput
              value={kep.massKg}
              onChange={(v) => setField("massKg", v)}
              min={1}
            />
          </FormRow>
          <FormRow
            label="Propagator"
            hint="Force-model fidelity: two-body analytic, zonal-harmonic analytic, or numerical integration"
          >
            <select
              className="input"
              value={kep.propagator}
              onChange={(e) => setField("propagator", e.target.value)}
            >
              {KEP_PROPAGATORS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormRow>
        </>
      ) : (
        <>
          <FormRow label="Line 1">
            <textarea
              className="input input--mono"
              rows={2}
              value={tle.orbit.line1}
              onChange={(e) => setOrbit("line1", e.target.value)}
              spellCheck={false}
            />
          </FormRow>
          <FormRow label="Line 2">
            <textarea
              className="input input--mono"
              rows={2}
              value={tle.orbit.line2}
              onChange={(e) => setOrbit("line2", e.target.value)}
              spellCheck={false}
            />
          </FormRow>
          <FormRow
            label="Propagator"
            hint="The TLE carries its own epoch; the state is evaluated over the scenario span"
          >
            <select
              className="input"
              value={tle.propagator}
              onChange={(e) => setField("propagator", e.target.value)}
            >
              {TLE_PROPAGATORS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormRow>
          <div className="hint-text" style={{ padding: "2px 0 0" }}>
            TLE orbits propagate on the MATLAB/Orekit backend (SGP4); the
            satellite appears in the 3D view after the next MATLAB run.
          </div>
        </>
      )}
      {PROPAGATORS.includes(active.propagator) ? null : (
        <div className="error-text">Unknown propagator.</div>
      )}

      <FormRow
        label="Imaging sensor"
        hint="Nadir-pointing conic sensor the scheduler can task against point targets"
      >
        <input
          type="checkbox"
          checked={Boolean(active.sensor)}
          onChange={(e) =>
            setField("sensor", e.target.checked ? sensorTemplate() : undefined)
          }
        />
      </FormRow>
      {active.sensor && (
        <>
          <FormRow
            label="FOV half-angle (deg)"
            hint="Instantaneous beam: half-angle of the sensor cone"
          >
            <NumberInput
              value={active.sensor.coneHalfAngleDeg}
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
              value={active.sensor.fieldOfRegardDeg}
              onChange={(v) => setSensor("fieldOfRegardDeg", v)}
              min={0.1}
              max={180}
            />
          </FormRow>
          <FormRow label="Slew rate (deg/s)">
            <NumberInput
              value={active.sensor.slewRateDegPerSec}
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
