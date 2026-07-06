import { useMemo, useState } from "react";
import Modal, { FormRow, NumberInput } from "../Modal.jsx";
import { SENSOR_POINTING_MODES, sensorTemplate } from "../../lib/spec.js";

const POINTING_LABELS = {
  Nadir: "Nadir (straight down)",
  VelocityVector: "Velocity vector (along-track)",
  SunPointing: "Sun pointing",
  FixedVector: "Fixed vector (ECEF)",
};

// Top-level add/edit flow for a satellite's imaging sensor, so sensors are
// not buried inside the satellite dialog. Picks a satellite, edits (or
// removes) its sensor, and submits the updated satellite object.
export default function SensorDialog({ spec, initialSatellite, onSubmit, onClose }) {
  const satellites = useMemo(
    () => spec.objects.filter((o) => o.kind === "satellite"),
    [spec],
  );
  const [satName, setSatName] = useState(
    initialSatellite ??
      satellites.find((s) => !s.sensor)?.name ??
      satellites[0]?.name ??
      "",
  );
  const selected = satellites.find((s) => s.name === satName);
  const [sensor, setSensor] = useState(() =>
    selected?.sensor ? structuredClone(selected.sensor) : sensorTemplate(),
  );
  // Opening the dialog means the user wants a sensor; default to equipped.
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(null);

  const pickSatellite = (name) => {
    setSatName(name);
    const sat = satellites.find((s) => s.name === name);
    setSensor(sat?.sensor ? structuredClone(sat.sensor) : sensorTemplate());
    setEnabled(true);
  };

  const setField = (field, value) =>
    setSensor((s) => ({ ...s, [field]: value }));

  const setPointing = (mode) =>
    setSensor((s) => {
      const { boresight, ...rest } = s;
      if (mode !== "FixedVector") return { ...rest, pointing: mode };
      return { ...rest, pointing: mode, boresight: boresight ?? [1, 0, 0] };
    });

  const setBoresightAxis = (axis, value) =>
    setSensor((s) => {
      const boresight = [...(s.boresight ?? [0, 0, 0])];
      boresight[axis] = value;
      return { ...s, boresight };
    });

  const submit = async () => {
    if (!selected) return;
    const updated = { ...selected, sensor: enabled ? sensor : undefined };
    const result = await onSubmit(selected.name, updated);
    if (result?.errors) setError(result.errors.join(" "));
    else onClose();
  };

  return (
    <Modal
      title="Sensor"
      onClose={onClose}
      width={440}
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
          Insert a satellite first (Insert &gt; Satellite) - sensors mount on
          satellites.
        </div>
      ) : (
        <>
          <FormRow label="Satellite" hint="The platform this sensor mounts on">
            <select
              className="input"
              value={satName}
              onChange={(e) => pickSatellite(e.target.value)}
            >
              {satellites.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                  {s.sensor ? " (has sensor)" : ""}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow
            label="Sensor equipped"
            hint="Uncheck to remove this satellite's sensor"
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </FormRow>
          {enabled && (
            <>
              <FormRow
                label="FOV half-angle (deg)"
                hint="Instantaneous beam: half-angle of the sensor cone"
              >
                <NumberInput
                  value={sensor.coneHalfAngleDeg}
                  onChange={(v) => setField("coneHalfAngleDeg", v)}
                  min={0.1}
                  max={90}
                />
              </FormRow>
              <FormRow
                label="FOR half-angle (deg)"
                hint="Field of regard: how far the sensor can slew off nadir"
              >
                <NumberInput
                  value={sensor.fieldOfRegardDeg}
                  onChange={(v) => setField("fieldOfRegardDeg", v)}
                  min={0.1}
                  max={180}
                />
              </FormRow>
              <FormRow label="Slew rate (deg/s)">
                <NumberInput
                  value={sensor.slewRateDegPerSec}
                  onChange={(v) => setField("slewRateDegPerSec", v)}
                  min={0.01}
                  max={60}
                />
              </FormRow>
              <FormRow
                label="Pointing"
                hint="Nominal boresight; the field of regard slews around it"
              >
                <select
                  className="input"
                  value={sensor.pointing ?? "Nadir"}
                  onChange={(e) => setPointing(e.target.value)}
                >
                  {SENSOR_POINTING_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {POINTING_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </FormRow>
              {(sensor.pointing ?? "Nadir") === "FixedVector" && (
                <FormRow
                  label="Boresight XYZ"
                  hint="Constant Earth-fixed (ECEF) direction; magnitude is ignored"
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2].map((axis) => (
                      <NumberInput
                        key={axis}
                        value={(sensor.boresight ?? [0, 0, 0])[axis]}
                        onChange={(v) => setBoresightAxis(axis, v)}
                      />
                    ))}
                  </div>
                </FormRow>
              )}
            </>
          )}
          <div className="hint-text" style={{ paddingTop: 6 }}>
            The scheduler tasks sensors against point targets (Insert &gt;
            Sensor Tasks). FOV/FOR cones appear in the 3D view; access uses
            the field of regard.
          </div>
        </>
      )}
    </Modal>
  );
}
