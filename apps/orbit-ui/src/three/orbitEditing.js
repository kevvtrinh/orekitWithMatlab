import * as THREE from "three";

export const ORBIT_EARTH_KM = 6378.137;
const DEG = Math.PI / 180;

// World-space axes from the same 3-1-3 convention used by preview.js.
export function orbitAxes(orbit) {
  const O = orbit.raanDeg * DEG, i = orbit.inclinationDeg * DEG, w = orbit.argPerigeeDeg * DEG;
  const cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(i), si = Math.sin(i), cw = Math.cos(w), sw = Math.sin(w);
  const p = new THREE.Vector3(cO * cw - sO * sw * ci, sw * si, -(sO * cw + cO * sw * ci));
  const q = new THREE.Vector3(-cO * sw - sO * cw * ci, cw * si, -(-sO * sw + cO * cw * ci));
  return { p, q, normal: new THREE.Vector3().crossVectors(p, q).normalize(),
    node: new THREE.Vector3(cO, 0, -sO),
    equatorialCross: new THREE.Vector3(-sO, 0, -cO),
    quadrature: new THREE.Vector3(-sO * ci, si, -cO * ci) };
}

export function orbitRadii(orbit) {
  return { perigee: orbit.semiMajorAxisKm * (1 - orbit.eccentricity),
    apogee: orbit.semiMajorAxisKm * (1 + orbit.eccentricity) };
}

export function changeApsis(orbit, kind, radiusKm) {
  const radii = orbitRadii(orbit);
  if (!Number.isFinite(radiusKm)) return orbit;
  if (kind === "perigee") radii.perigee = Math.max(ORBIT_EARTH_KM + 90.1, Math.min(radii.apogee, radiusKm));
  else radii.apogee = Math.max(radii.perigee, Math.min(4000000 - radii.perigee, radiusKm));
  return { ...orbit, semiMajorAxisKm: (radii.perigee + radii.apogee) / 2,
    eccentricity: (radii.apogee - radii.perigee) / (radii.apogee + radii.perigee) };
}

export function orbitCurve(orbit, samples = 256) {
  const { p, q } = orbitAxes(orbit);
  const positions = [];
  for (let j = 0; j <= samples; j++) {
    const angle = 2 * Math.PI * j / samples;
    const radius = orbit.semiMajorAxisKm * (1 - orbit.eccentricity ** 2) / (1 + orbit.eccentricity * Math.cos(angle));
    const point = p.clone().multiplyScalar(radius * Math.cos(angle) / 6371)
      .addScaledVector(q, radius * Math.sin(angle) / 6371);
    positions.push(point.x, point.y, point.z);
  }
  return positions;
}
