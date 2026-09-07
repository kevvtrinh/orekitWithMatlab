import * as THREE from "three";

// Use the same unwrapped latitude/longitude rectangle as the sampled area.
// Subdivision drapes every triangle over the globe, including the date line.
export function makeAreaGeometry(area) {
  if (area.boundaryPolygons) return makePolygonGeometry(area.boundaryPolygons);
  const halfLat = area.heightKm / (2 * 111.32);
  const halfLon = area.widthKm / (2 * 111.32 * Math.max(Math.cos(area.centerLatDeg * Math.PI / 180), 0.05));
  const rows = Math.max(2, Math.min(256, Math.ceil(2 * halfLat / 0.75)));
  const cols = Math.max(2, Math.min(512, Math.ceil(2 * halfLon / 0.75)));
  const vertices = [];
  const indices = [];
  function point(row, col, radius = 1.002) {
    const lat = (area.centerLatDeg - halfLat + 2 * halfLat * row / rows) * Math.PI / 180;
    const lon = (area.centerLonDeg - halfLon + 2 * halfLon * col / cols) * Math.PI / 180;
    return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)];
  }
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
    vertices.push(...point(row, col));
    if (row < rows && col < cols) {
      const a = row * (cols + 1) + col;
      indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
    }
  }
  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  surface.setIndex(indices);
  const boundary = [];
  for (let col = 0; col < cols; col++) boundary.push(...point(0, col, 1.003));
  for (let row = 0; row < rows; row++) boundary.push(...point(row, cols, 1.003));
  for (let col = cols; col > 0; col--) boundary.push(...point(rows, col, 1.003));
  for (let row = rows; row >= 0; row--) boundary.push(...point(row, 0, 1.003));
  return { surface, boundaries: [boundary] };
}

function globePoint(point, radius) {
  const lon = point.x * Math.PI / 180, lat = point.y * Math.PI / 180;
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)];
}

function makePolygonGeometry(polygons) {
  const positions = [], boundaries = [];
  for (const polygon of polygons) {
    const rings = [polygon.outer, ...(polygon.holes ?? []).map((hole) => hole.ring)]
      .map((ring) => ring.map(([lon, lat]) => new THREE.Vector2(lon, lat)));
    for (const ring of rings) {
      const boundary = [];
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i], b = ring[(i + 1) % ring.length];
        const steps = Math.max(1, Math.ceil(a.distanceTo(b) / 0.75));
        for (let step = 0; step < steps; step++) boundary.push(...globePoint(a.clone().lerp(b, step / steps), 1.003));
      }
      boundary.push(...globePoint(ring[0], 1.003));
      boundaries.push(boundary);
    }
    // Earcut removes the closing vertex, so concatenate after triangulation.
    const triangles = THREE.ShapeUtils.triangulateShape(rings[0], rings.slice(1));
    const points = rings.flat();
    const pending = triangles.map((triangle) => triangle.map((index) => points[index]));
    while (pending.length) {
      const triangle = pending.pop();
      const lengths = triangle.map((p, i) => p.distanceToSquared(triangle[(i + 1) % 3]));
      const longest = lengths.indexOf(Math.max(...lengths));
      if (lengths[longest] > 1.5 ** 2) {
        const a = triangle[longest], b = triangle[(longest + 1) % 3], c = triangle[(longest + 2) % 3];
        const middle = a.clone().lerp(b, 0.5);
        pending.push([a, middle, c], [middle, b, c]);
      } else for (const point of triangle) positions.push(...globePoint(point, 1.002));
    }
  }
  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return { surface, boundaries };
}
