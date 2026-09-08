import Modal from "./Modal.jsx";
import ConsoleIcon from "./ConsoleIcon.jsx";

export default function ShortcutGuide({ onClose }) {
  return <Modal title="Make yourself at home" onClose={onClose} width={480}>
    <div className="shortcut-intro"><ConsoleIcon name="orbit" size={36} /><p>Your mission, at your fingertips.<br /><span>A few shortcuts to keep you in the flow.</span></p></div>
    <div className="shortcut-list">
      {[["Find commands and objects", "Ctrl / ⌘", "K"], ["Play or pause time", "Space"], ["Focus workspace", "F"],
        ["Show keyboard shortcuts", "?"], ["Dismiss a dialog or focus mode", "Esc"]].map(([label, ...keys]) =>
        <div key={label}><span>{label}</span><span>{keys.map((key) => <kbd key={key}>{key}</kbd>)}</span></div>)}
    </div>
    <p className="shortcut-note">Drag to orbit · Scroll to zoom · Right-drag to pan<br />Double-click a satellite to follow it. Use the timeline to move through your scenario.</p>
  </Modal>;
}
