const icons = {
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6h14M5 18h14" /></>,
  orbit: <><circle cx="12" cy="12" r="3.1" /><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-35 12 12)" /><circle cx="19.8" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></>,
  play: <path d="m9 5 11 7-11 7Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  reset: <><path d="M7 5v14M19 5 8 12l11 7Z" /></>,
  crosshair: <><circle cx="12" cy="12" r="6" /><path d="M12 2v5m0 10v5M2 12h5m10 0h5" /></>,
  chevronDown: <path d="m7 10 5 5 5-5" />,
  chevronRight: <path d="m10 7 5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  satellite: <><path d="m9 7 8 8-4 4-8-8Zm6-5 7 7-4 4-7-7ZM2 15l7 7 4-4-7-7" /><path d="m14 10 4-4M5 3l2 2" /></>,
  ground: <><path d="M5 5C1 14 10 23 19 19L5 5ZM12 12l6-6M11 19l-2 4m6-3 2 3M6 23h14" /><circle cx="18" cy="6" r="1.5" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
  sensor: <><path d="m12 4 8 16H4Z" /><circle cx="12" cy="7" r="2" /></>,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill="var(--bg-panel, #151719)" /><circle cx="16" cy="12" r="2" fill="var(--bg-panel, #151719)" /><circle cx="8" cy="18" r="2" fill="var(--bg-panel, #151719)" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15" /></>,
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  layers: <><path d="m3 8 9-5 9 5-9 5Zm0 5 9 5 9-5m-18 5 9 5 9-5" /></>,
  folder: <path d="M3 6h7l2 3h9v11H3Z" />,
  file: <><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v5h4M9 12h6m-6 4h6" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" /></>,
  download: <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />,
  upload: <path d="M12 15V3M8 7l4-4 4 4M4 16v5h16v-5" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
};

export default function ConsoleIcon({ name, size = 18, className = "" }) {
  return (
    <svg className={`console-icon ${className}`} width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {icons[name] ?? icons.orbit}
    </svg>
  );
}
