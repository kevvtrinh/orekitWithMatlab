import { useEffect, useId, useMemo, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import ConsoleIcon from "./ConsoleIcon.jsx";

export default function CommandPalette({ commands, onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef(null);
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return commands.filter((command) => !command.disabled && terms.every((term) =>
      `${command.label} ${command.detail ?? ""} ${command.group}`.toLowerCase().includes(term)));
  }, [commands, query]);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, query]);
  function execute(command) {
    if (!command) return;
    onClose();
    // Let the dialog restore focus before an action opens another dialog.
    requestAnimationFrame(() => command.action());
  }
  return (
    <Modal title="Mission command" onClose={onClose} width={600}>
      <div className="command-palette">
        <div className="command-search">
          <ConsoleIcon name="search" size={22} />
          <input autoComplete="off" spellCheck="false" role="combobox" aria-label="Search commands and objects"
            aria-expanded="true" aria-controls={listId} aria-autocomplete="list"
            aria-activedescendant={results.length ? `${listId}-${activeIndex}` : undefined}
            placeholder="Where would you like to go?" value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={(event) => {
              // IME keys confirm or cancel text composition, not commands.
              if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
                event.stopPropagation();
                return;
              }
              if (["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) event.preventDefault();
              if (event.key === "ArrowDown") setActive((activeIndex + 1) % Math.max(1, results.length));
              if (event.key === "ArrowUp") setActive((activeIndex - 1 + results.length) % Math.max(1, results.length));
              if (event.key === "Enter") execute(results[activeIndex]);
            }} />
          <kbd>esc</kbd>
        </div>
        <div className="command-results" ref={listRef} id={listId} role="listbox" aria-label="Commands">
          {results.map((command, index) => (
            <div key={command.id}>
              {(index === 0 || command.group !== results[index - 1].group) && <div className="command-group" role="presentation">{command.group}</div>}
              <div role="option" id={`${listId}-${index}`} aria-selected={index === activeIndex}
                className="command-result" onPointerMove={() => setActive(index)} onClick={() => execute(command)}>
                <span className="command-result-icon"><ConsoleIcon name={command.icon ?? "arrowRight"} size={18} /></span>
                <span className="command-result-copy"><strong>{command.label}</strong>{command.detail && <small>{command.detail}</small>}</span>
                {command.shortcut ? <kbd>{command.shortcut}</kbd> : <ConsoleIcon className="command-result-arrow" name="arrowRight" size={15} />}
              </div>
            </div>
          ))}
          {!results.length && <div className="command-empty"><ConsoleIcon name="search" size={28} /><strong>No results for “{query}”</strong><span>Try an object name, “satellite”, or “view”.</span></div>}
        </div>
        <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span>{results.length} results</span></div>
      </div>
    </Modal>
  );
}
