import { useId } from "react";
import { sensorFovBoundary } from "../three/sensorFrame.js";
import { layoutFrameLabels } from "../lib/frameLabels.js";

export default function SensorAnglePlot({ frame, mode, showLabels, onSelect }) {
  const clipId = useId();
  const half = frame.halfAngleDeg, radius = 135, cx = 300, cy = 170;
  const point = (item) => mode === "polar"
    ? [cx + radius * item.offBoresightDeg / half * Math.sin(item.bearingDeg * Math.PI / 180),
      cy - radius * item.offBoresightDeg / half * Math.cos(item.bearingDeg * Math.PI / 180)]
    : [cx + radius * item.azDeg / half, cy - radius * item.elDeg / half];
  const path = (points) => {
    let drawing = false;
    return points.map((item) => {
      if (!item) { drawing = false; return ""; }
      const [x, y] = point(item), command = drawing ? "L" : "M"; drawing = true;
      return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ");
  };
  const fov = `${path(sensorFovBoundary(half))}Z`;
  const labeled = layoutFrameLabels(frame.markers.map((marker) => {
    const [x, y] = point(marker); return { ...marker, x, y };
  }), 600, 340);
  return <svg className="sensor-angle-plot" viewBox="0 0 600 340" role="img"
    aria-label={mode === "polar" ? "Polar sensor frame: radius is off-boresight angle; bearing is clockwise from image up" : "Sensor-frame azimuth and elevation in degrees"}>
    <defs><clipPath id={clipId}><path d={fov} /></clipPath></defs>
    {mode === "polar" ? <>
      {[1 / 3, 2 / 3, 1].map((fraction) => <g key={fraction}><circle className="sensor-plot-grid" cx={cx} cy={cy} r={radius * fraction} />
        <text x={cx + 6} y={cy - radius * fraction + 12}>{(half * fraction).toFixed(1)}°</text></g>)}
      <text x={cx} y="20" textAnchor="middle">0° · image up</text><text x="450" y={cy + 4}>90°</text>
      <text x={cx} y="328" textAnchor="middle">180°</text><text x="150" y={cy + 4} textAnchor="end">270°</text>
    </> : <>
      {[-1, -0.5, 0, 0.5, 1].map((fraction) => <g key={fraction}>
        <path className="sensor-plot-grid" d={`M${cx + radius * fraction} ${cy - radius}v${2 * radius} M${cx - radius} ${cy + radius * fraction}h${2 * radius}`} />
        <text x={cx + radius * fraction} y="321" textAnchor="middle">{(half * fraction).toFixed(1)}°</text>
        <text x="154" y={cy - radius * fraction + 4} textAnchor="end">{(half * fraction).toFixed(1)}°</text>
      </g>)}
      <text x="300" y="18" textAnchor="middle">Azimuth / elevation relative to boresight</text>
      <text x="490" y="172">+Az</text><text x="300" y="31" textAnchor="middle">+El</text>
    </>}
    <path className="sensor-plot-axis" d={`M${cx - radius} ${cy}h${2 * radius} M${cx} ${cy - radius}v${2 * radius}`} />
    <path className="sensor-plot-fov" d={fov} />
    <g clipPath={`url(#${clipId})`}>{(frame.traces ?? []).map((trace, index) => <path className="sensor-plot-area" key={`${trace.name}-${index}`} d={path(trace.points)}><title>{trace.name}</title></path>)}</g>
    {labeled.map((marker) => {
      const { x, y } = marker;
      return <g key={marker.name} className={`sensor-plot-marker sensor-plot-marker--${marker.kind}`} role="button" tabIndex="0"
        aria-label={`Select ${marker.name}`} onClick={() => onSelect(marker.name)} onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(marker.name); }
        }}>
        <title>{`${marker.name}: az ${marker.azDeg.toFixed(2)}°, el ${marker.elDeg.toFixed(2)}°, off-boresight ${marker.offBoresightDeg.toFixed(2)}°`}</title>
        <circle cx={x} cy={y} r="4" />{showLabels && <>
          <path className="sensor-plot-leader" d={`M${x} ${y}L${marker.labelX} ${marker.labelY + 8}`} />
          <text x={marker.labelX} y={marker.labelY + 11}>{marker.name}</text></>}
      </g>;
    })}
    <circle className="sensor-plot-origin" cx={cx} cy={cy} r="2.5" />
  </svg>;
}
