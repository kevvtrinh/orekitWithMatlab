import { useEffect } from "react";

// Modal dialog shell shared by the insert/edit dialogs: dark overlay, titled
// panel, Escape / overlay-click to dismiss.
export default function Modal({ title, onClose, children, footer, width = 460 }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width }}
        role="dialog"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <span>{title}</span>
          <button className="btn btn--icon" onClick={onClose} title="Close (Esc)">
            x
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// Labeled form row: <FormRow label="..."><input/></FormRow>
export function FormRow({ label, hint, children }) {
  return (
    <label className="form-row" title={hint}>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

export function NumberInput({ value, onChange, step = "any", ...rest }) {
  return (
    <input
      className="input"
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
      {...rest}
    />
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
