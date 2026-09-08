import { useEffect, useId, useRef } from "react";
import ConsoleIcon from "./ConsoleIcon.jsx";

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';
const EDITABLE = 'input:not([type="hidden"]):not([readonly]), select, textarea:not([readonly]), [contenteditable="true"]';

function visibleControls(panel, selector) {
  return [...panel.querySelectorAll(selector)].filter((element) =>
    element.tabIndex >= 0 && !element.matches(":disabled") &&
    !element.closest('[hidden], [inert], [aria-disabled="true"]') &&
    element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden",
  ).sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

// Modal dialog shell shared by the insert/edit dialogs: dark overlay, titled
// panel, Escape / overlay-click to dismiss.
export default function Modal({ title, onClose, children, footer, width = 460 }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const returnFocusRef = useRef(null);
  if (!returnFocusRef.current) {
    const element = document.activeElement;
    // A menu item can disappear in the same commit that opens the dialog.
    // Keep its persistent trigger as the logical return location.
    returnFocusRef.current = {
      element,
      menuTrigger: element?.closest(".menu")?.querySelector(".menu-trigger"),
    };
  }

  useEffect(() => {
    const panel = panelRef.current;
    const overlay = panel.parentElement;
    const siblings = [...overlay.parentElement.children].filter((element) => element !== overlay);
    const priorInert = siblings.map((element) => element.inert);
    siblings.forEach((element) => { element.inert = true; });
    const initial = visibleControls(panel, EDITABLE)[0] ??
      visibleControls(panel, FOCUSABLE)[0] ?? panel;
    initial.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const controls = visibleControls(panel, FOCUSABLE);
      const first = controls[0] ?? panel;
      const last = controls[controls.length - 1] ?? panel;
      const active = document.activeElement;
      if (!controls.length || !panel.contains(active) || active === panel ||
          (e.shiftKey ? active === first : active === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      siblings.forEach((element, index) => { element.inert = priorInert[index]; });
      const { element, menuTrigger } = returnFocusRef.current;
      const destination = element?.isConnected ? element : menuTrigger;
      if (destination?.isConnected) destination.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        ref={panelRef}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn btn--icon" onClick={onClose}
            aria-label="Close dialog" title="Close (Esc)">
            <ConsoleIcon name="close" size={18} />
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
