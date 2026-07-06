import { useEffect, useRef, useState } from "react";

// Menu-bar style dropdown (Insert / Scenario), closes on outside click or Esc.
export default function Menu({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        className={`btn menu-trigger ${open ? "menu-trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <span className="menu-caret" aria-hidden="true">
          v
        </span>
      </button>
      {open && (
        <div className="menu-list" role="menu">
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
