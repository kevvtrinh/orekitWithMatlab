import { useEffect, useId, useMemo, useRef, useState } from "react";
import Modal from "../Modal.jsx";
import ConsoleIcon from "../ConsoleIcon.jsx";
import { downloadText } from "../../lib/api.js";
import { REPORT_TYPES, ELEMENT_COLUMNS, buildReport, reportCsv, chartSegments } from "../../lib/analysisReports.js";
import "./reports.css";

const PAGE_SIZE = 100;
const ANGLE_KEYS = new Set(["raanDeg", "argPerigeeDeg", "trueAnomalyDeg"]);
const formatNumber = (value, significantDigits = 8) => Number.isFinite(value)
  ? Number(value.toPrecision(significantDigits)).toLocaleString("en-US", { maximumSignificantDigits: significantDigits, useGrouping: false }) : "—";
const utcAt = (epochMs, seconds) => Number.isFinite(epochMs) && Number.isFinite(seconds)
  ? new Date(epochMs + seconds * 1000).toISOString() : "";
const timeToPlotX = (time, startSec, endSec) => endSec > startSec
  ? 86 + 728 * (time - startSec) / (endSec - startSec) : 450;
const timeTickFractions = (startSec, endSec) => endSec > startSec ? [0, 0.25, 0.5, 0.75, 1] : [0.5];

// Keep extrema and endpoints when drawing dense histories. CSV and the table
// retain every filtered MATLAB sample; the graph is only a visual overview.
function overviewPoints(points, budget) {
  if (points.length <= budget) return points;
  const stride = Math.max(1, Math.ceil(points.length / Math.max(1, (budget - 2) / 2)));
  const output = [points[0]];
  for (let index = 1; index < points.length - 1; index += stride) {
    const stop = Math.min(points.length - 1, index + stride);
    let low = index, high = index;
    for (let sample = index + 1; sample < stop; sample++) {
      if (points[sample].value < points[low].value) low = sample;
      if (points[sample].value > points[high].value) high = sample;
    }
    for (const sample of [...new Set([low, high])].sort((a, b) => a - b)) output.push(points[sample]);
  }
  output.push(points[points.length - 1]);
  return output;
}

function NumericChart({ rows, column, startSec, endSec }) {
  const id = useId();
  const chart = useMemo(() => {
    const runs = chartSegments(rows, column.key, { wrapDegrees: ANGLE_KEYS.has(column.key) });
    let min = Infinity, max = -Infinity, count = 0;
    for (const run of runs) for (const point of run) {
      min = Math.min(min, point.value); max = Math.max(max, point.value); count++;
    }
    if (!count) return null;
    const padding = Math.max((max - min) * 0.1, Math.max(Math.abs(min), Math.abs(max)) * 1e-8, 1e-9);
    const bottom = min - padding, top = max + padding;
    const x = (time) => timeToPlotX(time, startSec, endSec);
    const y = (value) => 184 - 150 * (value - bottom) / (top - bottom);
    const path = runs.map((run) => {
      const points = overviewPoints(run, Math.max(4, Math.round(1400 * run.length / count)));
      if (points.length === 1) return `M${x(points[0].tSec).toFixed(2)} ${y(points[0].value).toFixed(2)}h.01`;
      return points.map((point, index) => `${index ? "L" : "M"}${x(point.tSec).toFixed(2)} ${y(point.value).toFixed(2)}`).join(" ");
    }).join(" ");
    return { min, max, count, bottom, top, path, y };
  }, [rows, column.key, startSec, endSec]);

  if (!chart) return <div className="report-chart-empty">No finite values for this metric in the selected interval.</div>;
  return <>
    <div className="report-plot-scroll" tabIndex="0" role="region" aria-label="History graph, scroll horizontally on narrow screens">
    <svg className="report-chart" viewBox="0 0 850 234" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{`${column.label} history${column.unit ? ` (${column.unit})` : ""}`}</title>
      <desc id={`${id}-desc`}>{chart.count} samples from {formatNumber(startSec)} to {formatNumber(endSec)} seconds.
        Minimum {formatNumber(chart.min)}, maximum {formatNumber(chart.max)}. Exact samples are available in the table below.</desc>
      {[0, 0.5, 1].map((fraction) => {
        const value = chart.bottom + fraction * (chart.top - chart.bottom), y = chart.y(value);
        return <g key={fraction}>
          <path className="report-chart-grid" d={`M86 ${y}H814`} />
          <text x="76" y={y + 4} textAnchor="end">{formatNumber(value, 10)}</text>
        </g>;
      })}
      {timeTickFractions(startSec, endSec).map((fraction) => {
        const value = startSec + fraction * (endSec - startSec), x = 86 + 728 * fraction;
        return <g key={fraction}>
          <path className="report-chart-grid" d={`M${x} 34V184`} />
          <text x={x} y="205" textAnchor="middle">{formatNumber(value)}</text>
        </g>;
      })}
      <path className="report-chart-line" d={chart.path} />
      <text className="report-chart-axis-title" x="450" y="229" textAnchor="middle">Seconds from scenario epoch</text>
      <text className="report-chart-axis-title" x="86" y="18">{column.unit || "Dimensionless"}</text>
    </svg>
    </div>
    <div className="report-chart-stats"><span>Minimum <strong>{formatNumber(chart.min)} {column.unit}</strong></span>
      <span>Maximum <strong>{formatNumber(chart.max)} {column.unit}</strong></span>
      <span>{chart.count.toLocaleString()} valid samples</span>
    </div>
  </>;
}

function LightingChart({ rows, startSec, endSec }) {
  const id = useId();
  const x = (time) => timeToPlotX(Math.min(endSec, Math.max(startSec, time)), startSec, endSec);
  return <div className="report-plot-scroll" tabIndex="0" role="region" aria-label="Shadow interval graph, scroll horizontally on narrow screens">
    <svg className="report-chart report-chart--lighting" viewBox="0 0 850 158" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>Sampled shadow intervals</title>
    <desc id={`${id}-desc`}>{rows.length} umbra and penumbra intervals. Interval boundaries follow propagation samples; exact rows are listed below.</desc>
    {["Umbra", "Penumbra"].map((type, lane) => <g key={type}>
      <text x="76" y={45 + lane * 40} textAnchor="end">{type}</text>
      <rect className="report-lighting-lane" x="86" y={27 + lane * 40} width="728" height="28" rx="4" />
      {rows.filter((row) => row.type === type && Number.isFinite(row.startSec) && Number.isFinite(row.stopSec)).map((row, index) =>
        <rect key={`${row.startSec}:${index}`} className={`report-lighting-interval report-lighting-interval--${type.toLowerCase()}`}
          x={Math.min(812, x(row.startSec))} y={31 + lane * 40} width={Math.max(2, x(row.stopSec) - x(row.startSec))} height="20" rx="2">
          <title>{`${type}: ${formatNumber(row.startSec)}–${formatNumber(row.stopSec)} s · ${formatNumber(row.durationSeconds)} s duration`}</title>
        </rect>)}
    </g>)}
    {timeTickFractions(startSec, endSec).map((fraction) => <text key={fraction} x={86 + 728 * fraction} y="118" textAnchor="middle">
      {formatNumber(startSec + fraction * (endSec - startSec))}
    </text>)}
    <text className="report-chart-axis-title" x="450" y="145" textAnchor="middle">Seconds from scenario epoch</text>
  </svg></div>;
}

function ReportTable({ report, epochMs, canJump, onJumpToTime, satelliteName }) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef(null);
  const pageCount = Math.max(1, Math.ceil(report.rows.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount - 1);
  const first = activePage * PAGE_SIZE;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activePage]);
  return <section className="report-table-section" aria-label="Report data">
    <div className="report-section-heading"><h3>Data table</h3><span>{report.rows.length.toLocaleString()} {report.rows.length === 1 ? "row" : "rows"}</span></div>
    <div className="report-table-scroll" ref={scrollRef} tabIndex="0" role="region" aria-label={`${report.title} table, scroll horizontally for all columns`}>
      <table className="report-table">
        <caption className="sr-only">{report.title}. Times are UTC; offsets are seconds from the scenario epoch.</caption>
        <thead><tr><th scope="col">Time UTC</th><th scope="col">Offset <small>s</small></th>
          {report.columns.map((column) => <th scope="col" key={column.key}>{column.label}{column.unit && <small>{column.unit}</small>}</th>)}
          <th scope="col"><span className="sr-only">Go to time</span></th></tr></thead>
        <tbody>{report.rows.slice(first, first + PAGE_SIZE).map((row, index) => {
          const utc = utcAt(epochMs, row.tSec);
          return <tr key={`${row.tSec}:${index}`}>
            <td className="report-table-time"><time dateTime={utc}><span>{utc.slice(0, 10)}</span>{utc.slice(11, 23)}</time></td>
            <td>{formatNumber(row.tSec)}</td>
            {report.columns.map((column) => <td key={column.key} className={column.key === "angleConvention" ? "report-table-convention" : undefined}>
              {typeof row[column.key] === "string" ? row[column.key] : formatNumber(row[column.key])}
            </td>)}
            <td><button className="btn btn--icon report-jump" disabled={!canJump || !Number.isFinite(row.tSec)}
              aria-label={`Go to ${utc || `offset ${row.tSec} seconds`}`} title="Go to this time in the scenario"
              onClick={() => onJumpToTime(row.tSec, satelliteName)}><ConsoleIcon name="play" size={12} /></button></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className="report-pagination"><span aria-live="polite">Rows {first + 1}–{Math.min(first + PAGE_SIZE, report.rows.length)} of {report.rows.length.toLocaleString()}</span>
      <div><button className="btn" disabled={activePage === 0} onClick={() => setPage(activePage - 1)}>Previous</button>
        <span>Page {activePage + 1} of {pageCount}</span>
        <button className="btn" disabled={activePage >= pageCount - 1} onClick={() => setPage(activePage + 1)}>Next</button></div>
    </div>
  </section>;
}

export default function ReportsDialog({ scenario, selection, job, onRunMatlab, onClose, onJumpToTime }) {
  const satellites = scenario?.satellites ?? [];
  const duration = scenario?.meta?.durationSeconds ?? 0;
  const epochMs = scenario?.epochMs ?? Date.parse(scenario?.meta?.epochUtc);
  const [chosenSatellite, setChosenSatellite] = useState(() => satellites.some((sat) => sat.name === selection) ? selection : satellites[0]?.name ?? "");
  const satelliteName = satellites.some((sat) => sat.name === chosenSatellite) ? chosenSatellite : satellites[0]?.name ?? "";
  const [type, setType] = useState("elements");
  const [metric, setMetric] = useState(ELEMENT_COLUMNS[0]?.key ?? "semiMajorAxisKm");
  const [from, setFrom] = useState("0");
  const [to, setTo] = useState(String(duration));
  const [starting, setStarting] = useState(false);
  const [runError, setRunError] = useState("");
  const startSec = Number(from), endSec = Number(to);
  const validRange = from.trim() !== "" && to.trim() !== "" && Number.isFinite(startSec) && Number.isFinite(endSec) &&
    startSec >= 0 && endSec >= startSec && endSec <= duration;
  const report = useMemo(() => buildReport(scenario, satelliteName, type, {
    startSec: validRange ? startSec : 0, endSec: validRange ? endSec : duration,
  }), [scenario, satelliteName, type, validRange, startSec, endSec, duration]);
  const metricColumn = type === "beta" ? report.columns.find((column) => column.key === "betaAngleDeg")
    : ELEMENT_COLUMNS.find((column) => column.key === metric) ?? ELEMENT_COLUMNS[0];
  const ready = report.status === "ready";
  const running = starting || job?.state === "running";
  const eclipse = scenario?.sun?.eclipses?.find((entry) => entry.satellite === satelliteName);
  const filterKey = `${satelliteName}:${type}:${from}:${to}`;

  async function runScenario() {
    setStarting(true); setRunError("");
    try {
      const result = await onRunMatlab();
      if (result?.errors) setRunError(result.errors.join(" "));
    } catch (error) { setRunError(error.message || "The scenario could not be started."); }
    finally { setStarting(false); }
  }

  return <Modal title="Reports & graphs" onClose={onClose} width={1080} footer={
    <div className="report-footer"><span><ConsoleIcon name="file" size={13} />CSV includes all rows in the selected interval.</span>
      <div><button className="btn" onClick={onClose}>Close</button>
        <button className="btn btn--primary" disabled={!ready || !validRange || !report.rows.length}
          onClick={() => downloadText(report.filename, reportCsv(report, epochMs))}><ConsoleIcon name="download" size={14} />Export CSV</button></div>
    </div>}>
    <div className="reports-workspace">
      <div className="report-intro"><div><span className="eyebrow">Mission analysis</span><p>Explore the satellite's propagated history.</p></div>
        <span className={`report-source${ready ? " report-source--ready" : ""}`}><i />{ready ? "MATLAB / Orekit" : report.status === "stale" ? "Needs update" : "Awaiting results"}</span>
      </div>
      <div className="report-selectors">
        <label><span>Satellite</span><select className="input" value={satelliteName} disabled={!satellites.length}
          onChange={(event) => { setChosenSatellite(event.target.value); setRunError(""); }}>
          {!satellites.length && <option value="">No satellites in this scenario</option>}
          {satellites.map((sat) => <option key={sat.name} value={sat.name}>{sat.name}</option>)}
        </select></label>
        <label><span>Report</span><select className="input" value={type} onChange={(event) => setType(event.target.value)}>
          {REPORT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select></label>
      </div>
      <div className="report-range"><div className="report-range-context"><ConsoleIcon name="activity" size={15} /><div><strong>Analysis interval</strong>
        <span>Seconds from {scenario?.meta?.epochUtc ?? "scenario epoch"}</span></div></div>
        <label><span>From (s)</span><input className="input" type="number" min="0" max={duration} step="any" value={from}
          aria-invalid={!validRange} aria-describedby={!validRange ? "report-range-error" : undefined} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span>To (s)</span><input className="input" type="number" min="0" max={duration} step="any" value={to}
          aria-invalid={!validRange} aria-describedby={!validRange ? "report-range-error" : undefined} onChange={(event) => setTo(event.target.value)} /></label>
        <button className="btn" onClick={() => { setFrom("0"); setTo(String(duration)); }}>Full period</button>
      </div>
      {!validRange && <p className="report-error" id="report-range-error" role="alert">Enter an interval from 0 to {duration.toLocaleString()} seconds, with the end at or after the start.</p>}
      {!ready && <div className={`report-status report-status--${report.status}`} role="status">
        <ConsoleIcon name={report.status === "stale" ? "refresh" : "activity"} size={22} />
        <div><strong>{report.status === "stale" ? "Run the scenario to refresh this report" : report.status === "error" ? "This report could not be computed" : "Compute your satellite's history"}</strong>
          <p>{report.message || "Run the scenario to generate MATLAB / Orekit analysis results."}</p>
          {!satellites.length && <p>Add a satellite to begin.</p>}
          {!onRunMatlab && <p>Return to your scenario to run MATLAB and generate reports.</p>}
        </div>
        {onRunMatlab && <button className="btn btn--primary" disabled={running || !satellites.length} aria-busy={running} onClick={runScenario}>
          <ConsoleIcon name={running ? "refresh" : "play"} size={13} />{running ? "Running…" : "Run scenario"}</button>}
      </div>}
      {runError && <p className="report-error" role="alert">{runError}</p>}
      {!starting && ["failed", "unreachable"].includes(job?.state) && <div className="report-error" role="alert">
        <strong>{job.state === "failed" ? "MATLAB run failed." : "The MATLAB bridge is unavailable."}</strong>{" "}
        {job.error || job.message || (job.state === "failed" ? "Try running the scenario again." : "Reopen the console with launchOrbitHtmlUI in MATLAB, then reload this page.")}
      </div>}
      {ready && validRange && <>
        <div className="report-result-heading"><div><h3>{report.title}</h3><span>{type === "elements" ? `${report.frame || "GCRF"} · Osculating elements` : type === "beta" ? `${report.frame || "GCRF"} · Sun angle to the orbital plane` : "Umbra and penumbra · Sampled boundaries"}</span></div>
          {type === "lighting" && Number.isFinite(eclipse?.sunlitFractionPercent) && <div className="report-sunlit"><ConsoleIcon name="sun" size={15} /><strong>{formatNumber(eclipse.sunlitFractionPercent)}%</strong><span>sunlit samples<br />full scenario</span></div>}
        </div>
        {report.rows.length > 0 ? <>
          <section className="report-graph-section" aria-label="Report graph">
            <div className="report-section-heading"><h3>{type === "lighting" ? "Shadow intervals" : "History graph"}</h3>
              {type === "elements" && <label className="report-metric"><span>Metric</span><select className="input" value={metric} onChange={(event) => setMetric(event.target.value)}>
                {ELEMENT_COLUMNS.map((column) => <option key={column.key} value={column.key}>{column.label}{column.unit ? ` (${column.unit})` : ""}</option>)}
              </select></label>}
            </div>
            {type === "lighting" ? <LightingChart rows={report.rows} startSec={startSec} endSec={endSec} />
              : metricColumn && <NumericChart rows={report.rows} column={metricColumn} startSec={startSec} endSec={endSec} />}
          </section>
          <ReportTable key={filterKey} report={report} epochMs={epochMs} canJump={ready && Boolean(onJumpToTime)} onJumpToTime={onJumpToTime} satelliteName={satelliteName} />
        </> : <div className="report-no-samples"><ConsoleIcon name="search" size={22} /><strong>{type === "lighting" ? "No shadow intervals in this interval" : "No samples in this interval"}</strong><span>Adjust the interval to explore another part of the scenario.</span></div>}
        {!!report.notes?.length && <div className="report-notes"><ConsoleIcon name="file" size={14} /><div>{report.notes.map((note, index) => <p key={index}>{note}</p>)}</div></div>}
      </>}
    </div>
  </Modal>;
}
