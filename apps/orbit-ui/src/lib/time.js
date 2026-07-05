// Time and low-precision astronomy helpers for the 3D view.

const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const DEG = Math.PI / 180;

export function daysSinceJ2000(date) {
  return (date.getTime() - J2000_MS) / 86400000;
}

// Greenwich Mean Sidereal Time in radians (IAU 1982-style linear approximation,
// plenty for visualization).
export function gmstRad(date) {
  const d = daysSinceJ2000(date);
  const gmstDeg = 280.46061837 + 360.98564736629 * d;
  return ((gmstDeg % 360) + 360) % 360 * DEG;
}

// Approximate Sun direction (unit vector) in ECI, Astronomical Almanac
// low-precision formula. Good to ~0.01 deg over decades.
export function sunDirectionEci(date) {
  const n = daysSinceJ2000(date);
  const L = (280.46 + 0.9856474 * n) * DEG;
  const g = (357.528 + 0.9856003 * n) * DEG;
  const lambda = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = (23.439 - 0.0000004 * n) * DEG;
  return [
    Math.cos(lambda),
    Math.cos(eps) * Math.sin(lambda),
    Math.sin(eps) * Math.sin(lambda),
  ];
}

export function parseIsoUtc(text) {
  return new Date(text);
}

export function formatUtc(date, { seconds = true } = {}) {
  const pad = (n) => String(n).padStart(2, "0");
  const base = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  return seconds ? `${base}:${pad(date.getUTCSeconds())} UTC` : `${base} UTC`;
}

export function formatDuration(totalSeconds) {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}
