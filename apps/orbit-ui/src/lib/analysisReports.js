// Report adapters display backend results; no orbital analysis is computed here.
export const REPORT_TYPES = [
  { id: "elements", label: "Orbital elements" },
  { id: "beta", label: "Solar beta angle" },
  { id: "lighting", label: "Lighting intervals" },
];

export const ELEMENT_COLUMNS = [
  { key: "semiMajorAxisKm", label: "Semi-major axis", unit: "km" },
  { key: "eccentricity", label: "Eccentricity", unit: "" },
  { key: "inclinationDeg", label: "Inclination", unit: "deg" },
  { key: "raanDeg", label: "RAAN", unit: "deg" },
  { key: "argPerigeeDeg", label: "Argument of periapsis", unit: "deg" },
  { key: "trueAnomalyDeg", label: "True anomaly", unit: "deg" },
  { key: "periodMinutes", label: "Period", unit: "min" },
  { key: "apogeeAltKm", label: "Apogee altitude", unit: "km" },
  { key: "perigeeAltKm", label: "Perigee altitude", unit: "km" },
];
const CONVENTION_COLUMN = { key: "angleConvention", label: "Angle convention", unit: "" };
const BETA_COLUMNS = [{ key: "betaAngleDeg", label: "Solar beta angle", unit: "deg" }];
const LIGHTING_COLUMNS = [
  { key: "type", label: "Shadow type", unit: "" },
  { key: "startSec", label: "Start offset", unit: "s" },
  { key: "stopSec", label: "Stop offset", unit: "s" },
  { key: "durationSeconds", label: "Sampled duration", unit: "s" },
];
const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const numberOrNull = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function prepareAnalysisReports(rawAnalysis, satellites) {
  const platforms = new Map(satellites.map((satellite) => [satellite.name, satellite]));
  return asArray(rawAnalysis?.satellites).filter((entry) => entry && platforms.has(entry.satellite)).map((entry) => {
    const times = asArray(entry.tOffsetSec);
    const errors = { ...entry.errors };
    const validTimes = times.length > 0 && times.every((time, index) =>
      numberOrNull(time) !== null && (index === 0 || time >= times[index - 1]));
    const columns = entry.orbitalElements ?? {};
    const orbitalElements = {};
    if (Object.keys(columns).length) {
      for (const { key } of ELEMENT_COLUMNS) {
        const values = columns[key] === null && times.length === 1 ? [null] : asArray(columns[key]);
        if (values.length !== times.length) errors.orbitalElements = "The orbital report has incomplete sample columns. Run the scenario again.";
        orbitalElements[key] = values.map(numberOrNull);
      }
      const conventions = asArray(columns.angleConvention);
      if (conventions.length !== times.length) errors.orbitalElements = "The orbital report is missing angle conventions. Run the scenario again.";
      orbitalElements.angleConvention = conventions.map((value) => typeof value === "string" ? value : "Unavailable");
    }
    const betaAngleDeg = (entry.betaAngleDeg === null && times.length === 1 ? [null] : asArray(entry.betaAngleDeg)).map(numberOrNull);
    if (betaAngleDeg.length && betaAngleDeg.length !== times.length) errors.betaAngle = "The beta-angle report has incomplete samples. Run the scenario again.";
    if (!validTimes) {
      errors.orbitalElements ||= "The orbital report has no valid time grid. Run the scenario again.";
      errors.betaAngle ||= "The beta-angle report has no valid time grid. Run the scenario again.";
    }
    if (entry.frame !== "GCRF") {
      errors.orbitalElements = "This report has an unsupported reference frame. Run the scenario again.";
      errors.betaAngle = "This report has an unsupported reference frame. Run the scenario again.";
    }
    return { satellite: entry.satellite, frame: entry.frame, tOffsetSec: times,
      orbitalElements, betaAngleDeg, errors, stale: platforms.get(entry.satellite).source !== "matlab" };
  });
}

export function buildReport(scenario, satelliteName, type, { startSec = 0, endSec = scenario?.meta.durationSeconds ?? 0 } = {}) {
  const kind = REPORT_TYPES.find((entry) => entry.id === type);
  const satellite = scenario?.satellites.find((entry) => entry.name === satelliteName);
  const report = {
    title: kind?.label ?? "Report", status: "missing", message: "Run the scenario in MATLAB to compute this report.",
    columns: type === "lighting" ? LIGHTING_COLUMNS : type === "beta" ? BETA_COLUMNS : [...ELEMENT_COLUMNS, CONVENTION_COLUMN],
    rows: [], frame: "GCRF", notes: [],
    filename: `${String(satelliteName ?? "satellite").replace(/[^\w-]+/g, "_")}_${type}.csv`,
  };
  if (!kind || !satellite) return { ...report, message: "Select a satellite to view its reports." };
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || startSec < 0 || endSec < startSec || endSec > scenario.meta.durationSeconds) {
    return { ...report, status: "error", message: "Choose a time interval within the scenario, with the end at or after the start." };
  }
  const history = scenario.analysisReports?.find((entry) => entry.satellite === satelliteName);
  if (satellite.source !== "matlab" || (type !== "lighting" && history?.stale)) {
    return { ...report, status: "stale", message: "Results need an update. Run the scenario to report on the current satellite and analysis period." };
  }
  if (type === "lighting") {
    const lighting = scenario.sun?.eclipses?.find((entry) => entry.satellite === satelliteName);
    if (!lighting) return report;
    report.notes = [
      "Earth-shadow intervals use the conical shadow model and sampled ephemeris times. Boundaries are limited by the scenario time step; a single shadow sample has zero sampled duration.",
      "Intervals overlapping the filter are shown in full; their endpoints and durations are not clipped. An empty table means no sampled shadow interval overlaps this range.",
    ];
    if (Number.isFinite(lighting.sunlitFractionPercent)) report.notes.push(`${lighting.sunlitFractionPercent.toFixed(1)}% of samples in the full scenario are sunlit (a sample fraction, not a time-weighted duration).`);
    report.rows = lighting.windows.filter((window) =>
      Number.isFinite(window.startSec) && Number.isFinite(window.stopSec) &&
      window.stopSec >= window.startSec && window.startSec <= endSec && window.stopSec >= startSec,
    ).map((window) => ({ tSec: window.startSec, type: window.type, startSec: window.startSec,
      stopSec: window.stopSec, durationSeconds: window.durationSeconds })).sort((a, b) => a.tSec - b.tSec);
  } else {
    if (!history) return report;
    const error = history.errors?.[type === "elements" ? "orbitalElements" : "betaAngle"];
    if (error) return { ...report, status: "error", message: error };
    const values = type === "elements" ? history.orbitalElements : { betaAngleDeg: history.betaAngleDeg };
    if (!history.tOffsetSec.length || !(type === "elements" ? values.semiMajorAxisKm?.length : values.betaAngleDeg?.length)) return report;
    report.rows = history.tOffsetSec.flatMap((time, index) => time >= startSec && time <= endSec
      ? [{ tSec: time, ...Object.fromEntries(report.columns.map(({ key }) => [key, values[key]?.[index] ?? null])) }] : []);
    report.notes = type === "elements" ? [
      "Osculating elements computed from stored GCRF position and velocity, including maneuver effects. These are not the insertion elements or TLE mean elements.",
      "Circular orbits use argument of latitude with argument of periapsis zero. Equatorial orbits use RAAN zero; circular equatorial orbits use true longitude. See the angle convention column for each sample.",
      "Blank values are undefined or nonfinite, including period and apogee for unbound trajectories. Altitudes use the backend Earth radius of 6378.137 km.",
    ] : ["Solar beta is the signed angle of the geocentric Sun direction above the orbit plane; positive is toward the angular-momentum vector."];
  }
  return { ...report, status: "ready", message: report.rows.length ? "MATLAB / Orekit results" : "No samples or intervals in this time range." };
}

function csvCell(value) {
  if (value == null || (typeof value === "number" && !Number.isFinite(value))) return "";
  if (typeof value === "number") return String(value);
  // Keep imported text inert when opening the report in a spreadsheet.
  const text = String(value).replace(/^([\s]*[=+@-])/, "'$1");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function reportCsv(report, epochMs) {
  if (report.status !== "ready") throw new Error("Only current MATLAB reports can be exported.");
  if (!Number.isFinite(epochMs)) throw new Error("The report needs a valid scenario epoch.");
  const headings = ["Time UTC", "Offset (s)", ...report.columns.map(({ label, unit }) => `${label}${unit ? ` (${unit})` : ""}`)];
  return [headings, ...report.rows.map((row) => [new Date(epochMs + row.tSec * 1000).toISOString(), row.tSec,
    ...report.columns.map(({ key }) => row[key])])].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

// Split undefined samples and 360-degree angle seams so plots never imply a
// physical transition through missing data or across a wrapped angle.
export function chartSegments(rows, key, { wrapDegrees = false } = {}) {
  const segments = [];
  let segment = [];
  for (const row of rows) {
    const value = row[key];
    if (!Number.isFinite(value) || !Number.isFinite(row.tSec)) {
      if (segment.length) segments.push(segment);
      segment = [];
      continue;
    }
    if (wrapDegrees && segment.length && Math.abs(value - segment[segment.length - 1].value) > 180) {
      segments.push(segment); segment = [];
    }
    segment.push({ tSec: row.tSec, value });
  }
  if (segment.length) segments.push(segment);
  return segments;
}
