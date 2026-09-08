import { useEffect, useId, useRef, useState } from "react";
import ConsoleIcon from "./ConsoleIcon.jsx";

// Menu-bar style dropdown (Insert / Scenario), closes on outside click or Esc.
export default function Menu({ label, items, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    ref.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.defaultPrevented) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { setOpen(false); return; }
      if (!ref.current?.contains(e.target)) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        ref.current?.querySelector(".menu-trigger")?.focus();
      }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
        const entries = [...ref.current.querySelectorAll('[role="menuitem"]:not(:disabled)')];
        if (!entries.length) return;
        e.preventDefault();
        const index = entries.indexOf(document.activeElement);
        const next = e.key === "Home" ? 0 : e.key === "End" ? entries.length - 1 :
          (index + (e.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length;
        entries[next].focus();
      }
    };
    const onFocus = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        className={`btn menu-trigger ${open ? "menu-trigger--open" : ""}`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
      >
        {label}
        <ConsoleIcon name="chevronDown" size={12} className="menu-caret" />
      </button>
      {open && (
        <div className="menu-list" role="menu" id={menuId} aria-label={label}>
          {items.map((item, i) =>
            item === "---" ? (
              <div key={i} className="menu-separator" />
            ) : (
              <button
                key={item.label}
                className="menu-item"
                role="menuitem"
                disabled={item.disabled}
                title={item.hint}
                onClick={() => {
                  // Restore focus before an action removes the menu or opens a dialog.
                  ref.current?.querySelector(".menu-trigger")?.focus({ preventScroll: true });
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
                {item.meta && <span className="menu-meta">{item.meta}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
