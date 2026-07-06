import { useMemo, useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import {
  MANEUVER_FRAMES,
  MAX_MANEUVERS_PER_SATELLITE,
  maneuverTemplate,
} from "../../lib/spec.js";

// Top-level add/edit flow for a satellite's impulsive maneuvers, mirroring
// the SensorDialog pattern: pick a satellite, edit its maneuver list, and
// submit the updated satellite object. MATLAB applies each burn during
// propagation (SatelliteObject.propagateWithManeuvers).
export default function ManeuverDialog({ spec, initialSatellite, onSubmit, onClose }) {
  const satellites = useMemo(
    () => spec.objects.filter((o) => o.kind === "satellite"),
    [spec],
  );
  const [satName, setSatName] = useState(
    initialSatellite ??
      satellites.find((s) => s.maneuvers?.length)?.name ??
      satellites[0]?.name ??
      "",
  );
  const selected = satellites.find((s) => s.name === satName);
  const [maneuvers, setManeuvers] = useState(() =>
    structuredClone(selected?.maneuvers ?? []),
  );
  const [error, setError] = useState(null);

  const pickSatellite = (name) => {
    setSatName(name);
    const sat = satellites.find((s) => s.name === name);
    setManeuvers(structuredClone(sat?.maneuvers ?? []));
    setError(null);
  };

  const setField = (index, field, value) =>
    setManeuvers((list) =>
      list.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );

  const setDeltaVAxis = (index, axis, value) =>
    setManeuvers((list) =>
      list.map((m, i) => {
        if (i !== index) return m;
        const deltaVmps = [...(m.deltaVmps ?? [0, 0, 0])];
        deltaVmps[axis] = value;
        return { ...m, deltaVmps };
      }),
    );

  const addManeuver = () => setManeuvers((list) => [...list, maneuverTemplate()]);

  const removeManeuver = (index) =>
    setManeuvers((list) => list.filter((_, i) => i !== index));

  const submit = async () => {
    if (!selected) return;
    const updated = {
      ...selected,
      maneuvers: maneuvers.length > 0 ? maneuvers : undefined,
    };
    const result = await onSubmit(selected.name, updated);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  const sgp4 = selected?.propagator === "TLE";

  return (
    <Modal
      title="Impulsive Maneuvers"
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
              className="btn btn--primary"
              onClick={submit}
              disabled={!selected}
            >
              Apply
            </button>
          </div>
        </>
      }
    >
      {satellites.length === 0 ? (
        <div className="empty-note">
          Insert a satellite first (Insert &gt; Satellite) - maneuvers apply to
          satellites.
        </div>
      ) : (
        <>
          <FormRow label="Satellite" hint="The satellite performing the burns">
            <select
              className="input"
              value={satName}
              onChange={(e) => pickSatellite(e.target.value)}
            >
              {satellites.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                  {s.maneuvers?.length ? ` (${s.maneuvers.length})` : ""}
                </option>
              ))}
            </select>
          </FormRow>
          {sgp4 && (
            <div className="hint-text" style={{ paddingBottom: 6 }}>
              SGP4 satellites cannot maneuver - switch this satellite's
              propagator to Numerical first (Insert &gt; Satellite).
            </div>
          )}
          {maneuvers.map((m, i) => (
            <div
              key={i}
              style={{
                border: "1px solid rgba(128,128,128,0.35)",
                borderRadius: 4,
                padding: "6px 8px",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 4,
                }}
              >
                <span className="form-label">Maneuver {i + 1}</span>
                <button
                  className="btn btn--icon"
                  onClick={() => removeManeuver(i)}
                  title="Remove this maneuver"
                >
                  x
                </button>
              </div>
              <FormRow label="Name">
                <TextInput
                  value={m.name ?? ""}
                  onChange={(v) => setField(i, "name", v)}
                  placeholder={`Maneuver ${i + 1}`}
                />
              </FormRow>
              <FormRow
                label="Time offset (s)"
                hint="Seconds after the scenario epoch"
              >
                <NumberInput
                  value={m.timeOffsetSec}
                  onChange={(v) => setField(i, "timeOffsetSec", v)}
                  min={0}
                  max={spec.meta?.durationSeconds}
                />
              </FormRow>
              <FormRow
                label="Frame"
                hint="TNW: [along-track, in-plane normal, cross-track]; Inertial: GCRF"
              >
                <select
                  className="input"
                  value={m.frame ?? "TNW"}
                  onChange={(e) => setField(i, "frame", e.target.value)}
                >
                  {MANEUVER_FRAMES.map((frame) => (
                    <option key={frame} value={frame}>
                      {frame}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Delta-V (m/s)">
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((axis) => (
                    <NumberInput
                      key={axis}
                      value={(m.deltaVmps ?? [0, 0, 0])[axis]}
                      onChange={(v) => setDeltaVAxis(i, axis, v)}
                    />
                  ))}
                </div>
              </FormRow>
            </div>
          ))}
          <button
            className="btn"
            onClick={addManeuver}
            disabled={maneuvers.length >= MAX_MANEUVERS_PER_SATELLITE}
          >
            Add Maneuver
          </button>
          <div className="hint-text" style={{ paddingTop: 6 }}>
            Burns are instantaneous delta-V; propagation is piecewise across
            them. A prograde TNW burn ([dV, 0, 0]) raises the orbit.
          </div>
        </>
      )}
    </Modal>
  );
}
