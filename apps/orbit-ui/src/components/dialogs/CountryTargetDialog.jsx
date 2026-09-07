import { useEffect, useMemo, useState } from "react";
import Modal, { FormRow, NumberInput, TextInput } from "../Modal.jsx";
import ConsoleIcon from "../ConsoleIcon.jsx";
import { MAX_OBJECTS } from "../../lib/spec.js";
import { countryPolygons, ringBounds, sampleCountryArea } from "../../lib/countryAreas.js";

function BoundaryPreview({ country }) {
  const polygons = countryPolygons(country);
  const polygonBounds = polygons.map((polygon) => ringBounds(polygon.outer));
  const main = [...polygonBounds].sort((a, b) =>
    (b.east - b.west) * (b.north - b.south) - (a.east - a.west) * (a.north - a.south))[0];
  const reference = (main.west + main.east) / 2;
  // Keep date-line islands together in this planar preview. Each polygon and
  // its holes move by one common longitude revolution, preserving topology.
  const rings = polygons.flatMap((polygon, index) => {
    const bounds = polygonBounds[index];
    const shift = 360 * Math.round((reference - (bounds.west + bounds.east) / 2) / 360);
    return [polygon.outer, ...polygon.holes.map((hole) => hole.ring)]
      .map((ring) => ring.map(([lon, lat]) => [lon + shift, lat]));
  });
  const bounds = rings.map(ringBounds);
  const west = Math.min(...bounds.map((b) => b.west)), east = Math.max(...bounds.map((b) => b.east));
  const south = Math.min(...bounds.map((b) => b.south)), north = Math.max(...bounds.map((b) => b.north));
  const pad = Math.max(east - west, north - south) * 0.05;
  return <svg className="country-outline" viewBox={`${west - pad} ${-north - pad} ${east - west + 2 * pad} ${north - south + 2 * pad}`}
    role="img" aria-label={`${country.name} boundary preview`}>
    <path d={rings.map((ring) => `M${ring.map(([x, y]) => `${x},${-y}`).join("L")}Z`).join("")}
      fillRule="evenodd" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export default function CountryTargetDialog({ spec, onSubmit, onClose }) {
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState(null);
  const [name, setName] = useState("");
  const [spacingKm, setSpacingKm] = useState(500);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/geography/countries.json", { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Country boundaries could not be loaded. Reload the console to try again.");
      return response.json();
    }).then(setCatalog).catch((err) => { if (err.name !== "AbortError") setLoadError(err.message); });
    return () => controller.abort();
  }, []);
  const country = catalog?.countries.find((item) => item.code === selectedCode);
  const matches = (catalog?.countries ?? []).filter((item) =>
    `${item.name} ${item.adminName} ${item.code} ${item.continent}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  const preview = useMemo(() => {
    if (!country) return null;
    try {
      if (spec.objects.some((object) => object.name === name.trim() || object.group === name.trim()))
        throw new Error("An object or area already uses that name. Choose a different name.");
      return sampleCountryArea(country, { name, spacingKm, limit: MAX_OBJECTS - spec.objects.length });
    } catch (err) { return { error: err.message }; }
  }, [country, name, spacingKm, spec]);
  const submit = async () => {
    if (!preview || preview.error || pending) return;
    setPending(true); setError(null);
    try {
      const result = await onSubmit(preview);
      if (result?.errors) setError(result.errors.join(" ")); else onClose();
    } catch (err) { setError(err.message); }
    finally { setPending(false); }
  };
  return <Modal title="Add country area target" width={660} onClose={pending ? () => {} : onClose}
    footer={<>
      {(error || preview?.error) && <div className="error-text" role="alert">{error || preview.error}</div>}
      <div className="modal-actions"><button className="btn" disabled={pending} onClick={onClose}>Cancel</button>
        <button className="btn btn--primary" disabled={!preview || Boolean(preview.error) || pending} onClick={submit}>
          {pending ? "Adding…" : "Add area target"}</button></div>
    </>}>
    <p className="dialog-intro">Find a country or territory. Its boundary becomes one area target, including islands and interior exclusions.</p>
    <div className="country-picker">
      <div className="country-browser">
        <label className="country-search"><ConsoleIcon name="search" size={16} />
          <input type="search" aria-label="Find a country" placeholder="Country, code, or continent…"
            value={query} onChange={(event) => setQuery(event.target.value)} disabled={pending} /></label>
        <div className="country-list" aria-label="Country search results">
          {loadError ? <p className="error-text" role="alert">{loadError}</p> : !catalog
            ? <p className="result-empty" role="status">Loading boundaries…</p>
            : matches.length === 0 ? <p className="result-empty">No matching countries.</p>
            : matches.map((item) => <button key={item.code} className="country-option" disabled={pending}
              aria-pressed={selectedCode === item.code} onClick={() => { setSelectedCode(item.code); setName(item.name); setError(null); }}>
              <span>{item.name}<small>{item.continent}</small></span><span>{item.code}</span>
            </button>)}
        </div>
        {catalog && <span className="country-count">{matches.length} of {catalog.countries.length} boundaries</span>}
      </div>
      <div className="country-selection">
        {country ? <>
          <BoundaryPreview country={country} />
          <h3>{country.name}</h3>
          <FormRow label="Area name"><TextInput value={name} onChange={setName} disabled={pending} /></FormRow>
          <FormRow label="Grid spacing (km)"><NumberInput value={spacingKm} onChange={setSpacingKm} min={10} max={5000} step={50} disabled={pending} /></FormRow>
          <div className="country-sampling">{preview?.targets ? `${preview.targets.length} analysis sample points` : "Choose a coarser grid to reduce point count."}</div>
          <p className="hint-text">Grid spacing controls analysis sampling. The full boundary is retained at every spacing.</p>
        </> : <div className="country-placeholder"><ConsoleIcon name="globe" size={30} /><p>Select a country to preview its boundary.</p></div>}
      </div>
    </div>
    <p className="country-credit">Natural Earth · 1:50m · Countries and territories</p>
  </Modal>;
}
