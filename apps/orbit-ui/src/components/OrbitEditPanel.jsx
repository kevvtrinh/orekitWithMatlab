import { useEffect, useState } from "react";
import { changeApsis, orbitRadii, ORBIT_EARTH_KM } from "../three/orbitEditing.js";

function ElementInput({ label, value, unit, disabled, onCommit }) {
  const [text, setText] = useState(value.toFixed(2));
  useEffect(() => { if (!disabled) setText(value.toFixed(2)); }, [value, disabled]);
  const commit = () => {
    const next = Number(text);
    if (text.trim() && Number.isFinite(next) && text !== value.toFixed(2) && next !== value) onCommit(next);
    else setText(value.toFixed(2));
  };
  return <label className="orbit-element"><span>{label}</span><span>
    <input type="number" value={text} disabled={disabled} step={unit === "km" ? 10 : 1}
      onChange={(event) => setText(event.target.value)} onBlur={commit}
      onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
    <small>{unit}</small></span></label>;
}

export default function OrbitEditPanel({ edit, error, onCommit, onClose }) {
  const radii = orbitRadii(edit.orbit);
  return <div className="orbit-edit-panel" role="region" aria-label="Direct orbit editor">
    <div className="orbit-edit-heading"><div><strong>Edit orbit</strong><span>{edit.name}</span></div>
      <button className="btn" disabled={edit.busy} onClick={onClose}>Done</button></div>
    <p>Drag an orbit handle. Release to apply. Esc cancels the current drag.</p>
    <details><summary>Numerical elements</summary>
      {["perigee", "apogee"].map((kind) => <ElementInput key={kind} label={kind === "perigee" ? "Perigee altitude" : "Apogee altitude"}
        value={radii[kind] - ORBIT_EARTH_KM} unit="km" disabled={edit.busy}
        onCommit={(alt) => onCommit(changeApsis(edit.orbit, kind, alt + ORBIT_EARTH_KM))} />)}
      {[["inclinationDeg", "Inclination"], ["raanDeg", "RAAN"], ["argPerigeeDeg", "Periapsis angle"]].map(([field, label]) =>
        <ElementInput key={field} label={label} value={edit.orbit[field]} unit="°" disabled={edit.busy}
          onCommit={(value) => onCommit({ ...edit.orbit, [field]: field === "inclinationDeg"
            ? Math.max(-180, Math.min(180, value)) : (value % 360 + 360) % 360 })} />)}
    </details>
    <div className="orbit-edit-status" role="status">{edit.busy ? "Applying orbit…" : "Initial orbit · Run scenario to recompute analysis"}</div>
    {error && <div className="error-text" role="alert">{error}</div>}
  </div>;
}
