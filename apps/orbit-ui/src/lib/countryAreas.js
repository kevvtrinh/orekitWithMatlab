const DEG = Math.PI / 180;
const wrapLon = (lon) => ((lon + 180) % 360 + 360) % 360 - 180;

export function unwrapRing(ring) {
  // Polar caps in the source explicitly close along the pole across 360°.
  // Preserve that closure; ordinary date-line crossings use shortest edges.
  if (ring.some((point) => Math.abs(point[1]) >= 89.999) &&
      Math.max(...ring.map((p) => p[0])) - Math.min(...ring.map((p) => p[0])) > 359) return ring;
  const output = [ring[0].slice()];
  for (let i = 1; i < ring.length; i++) output.push([
    output[i - 1][0] + wrapLon(ring[i][0] - ring[i - 1][0]), ring[i][1],
  ]);
  return output;
}

export function ringContains(ring, longitude, latitude) {
  const bounds = ringBounds(ring);
  const reference = (bounds.west + bounds.east) / 2;
  const x = reference + wrapLon(longitude - reference);
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const cross = (x - xi) * (yj - yi) - (latitude - yi) * (xj - xi);
    if (Math.abs(cross) < 1e-10 && x >= Math.min(xi, xj) - 1e-10 && x <= Math.max(xi, xj) + 1e-10 &&
        latitude >= Math.min(yi, yj) - 1e-10 && latitude <= Math.max(yi, yj) + 1e-10) return true;
    if ((yi > latitude) !== (yj > latitude) && x < (xj - xi) * (latitude - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function polygonContains(polygon, longitude, latitude) {
  return ringContains(polygon.outer, longitude, latitude) &&
    !(polygon.holes ?? []).some((hole) => ringContains(hole.ring, longitude, latitude));
}

export function ringBounds(ring) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const [lon, lat] of ring) { west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, lat); north = Math.max(north, lat); }
  return { west, east, south, north };
}

export function countryPolygons(country) {
  const coordinates = country.geometry.type === "Polygon" ? [country.geometry.coordinates] : country.geometry.coordinates;
  return coordinates.map((rings) => {
    const outer = unwrapRing(rings[0]);
    const bounds = ringBounds(outer), reference = (bounds.west + bounds.east) / 2;
    const holes = rings.slice(1).map((ring) => {
      const unwrapped = unwrapRing(ring), holeBounds = ringBounds(unwrapped);
      const shift = 360 * Math.round((reference - (holeBounds.west + holeBounds.east) / 2) / 360);
      return { ring: unwrapped.map(([lon, lat]) => [lon + shift, lat]) };
    });
    return { outer, holes };
  });
}

export function sampleCountryArea(country, { name = country.name, spacingKm = 500, priority = 5, limit = 250 } = {}) {
  if (!name.trim()) throw new Error("Enter a name for the area target.");
  if (!Number.isFinite(spacingKm) || spacingKm < 10 || spacingKm > 5000) throw new Error("Grid spacing must be between 10 and 5,000 km.");
  const polygons = countryPolygons(country);
  const samples = [];
  let examined = 0;
  const add = (lon, lat) => {
    samples.push([wrapLon(lon), lat]);
    if (samples.length > limit) throw new Error(`This grid needs more than ${limit} available points. Increase the grid spacing or remove other objects.`);
  };
  for (const polygon of polygons) {
    const bounds = ringBounds(polygon.outer);
    const rows = Math.max(1, Math.ceil((bounds.north - bounds.south) * 111.32 / spacingKm));
    const before = samples.length;
    for (let row = 0; row < rows; row++) {
      const latitude = bounds.south + (row + 0.5) * (bounds.north - bounds.south) / rows;
      const cols = Math.max(1, Math.ceil((bounds.east - bounds.west) * 111.32 * Math.cos(latitude * DEG) / spacingKm));
      for (let col = 0; col < cols; col++) {
        if (++examined > 200000) throw new Error("The requested grid is too dense. Increase the grid spacing.");
        const longitude = bounds.west + (col + 0.5) * (bounds.east - bounds.west) / cols;
        if (polygonContains(polygon, longitude, latitude)) add(longitude, latitude);
      }
    }
    // Keep an island represented even when it is smaller than one grid cell.
    if (samples.length === before) {
      const point = polygon.outer.find(([lon, lat]) => polygonContains(polygon, lon, lat));
      if (point) add(...point);
    }
  }
  if (!samples.length) throw new Error("This boundary did not produce any usable sample points.");
  const largest = [...polygons].sort((a, b) => {
    const size = (p) => { const r = ringBounds(p.outer); return (r.east - r.west) * (r.north - r.south) * Math.cos((r.north + r.south) / 2 * DEG); };
    return size(b) - size(a);
  })[0];
  const bounds = ringBounds(largest.outer);
  const centerLon = (bounds.west + bounds.east) / 2, centerLat = (bounds.north + bounds.south) / 2;
  const center = polygonContains(largest, centerLon, centerLat) ? [wrapLon(centerLon), centerLat]
    : samples.find(([lon, lat]) => polygonContains(largest, lon, lat)) ?? samples[0];
  const metadata = { name: name.trim(), type: "country", countryCode: country.code, countryName: country.name,
    centerLatDeg: center[1], centerLonDeg: center[0], spacingKm,
    widthKm: (bounds.east - bounds.west) * 111.32 * Math.cos(center[1] * DEG), heightKm: (bounds.north - bounds.south) * 111.32 };
  const targets = samples.map(([lon, lat], i) => ({ kind: "target", name: `${metadata.name}-GP${String(i + 1).padStart(3, "0")}`,
    group: metadata.name, area: { ...metadata }, latitudeDeg: lat, longitudeDeg: lon, altitudeM: 0, priority }));
  return { targets, area: { ...metadata, boundaryPolygons: polygons, source: "Natural Earth 1:50m, v5.1.1" } };
}
