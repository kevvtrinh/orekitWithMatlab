import * as THREE from "three";

// Shared sensor-frame convention: every sensor volume is authored with its
// apex at the origin and its boresight along +Y. orientBoresight is the only
// place local +Y is mapped onto a world direction, so the FOV cone, the FOR
// volume, and anything added later can never end up on opposite sides of the
// satellite.
const POS_Y = new THREE.Vector3(0, 1, 0);

export function orientBoresight(quaternion, worldDir) {
  return quaternion.setFromUnitVectors(POS_Y, worldDir);
}

// Instantaneous FOV: open unit cone (apex at origin, base circle of radius 1
// at y = 1). The caller scales x/z by tan(halfAngle)*length and y by length.
export function makeFovConeGeometry(radialSegments = 48) {
  const geometry = new THREE.ConeGeometry(1, 1, radialSegments, 1, true);
  geometry.rotateX(Math.PI); // ConeGeometry tapers toward +Y; open toward +Y
  geometry.translate(0, 0.5, 0); // apex at the origin, base circle at y = 1
  return geometry;
}

// Field of regard: spherical sector of unit radius around +Y - straight cone
// wall from the apex out to the rim, closed by the spherical cap the sensor
// sweeps by slewing up to halfAngleDeg off boresight. Solid and anchored at
// the sensor, unlike a floating shell cap, so the reachable side is
// unambiguous.
export function makeForSectorGeometry(
  halfAngleDeg,
  radialSegments = 48,
  capSegments = 16,
) {
  const half = THREE.MathUtils.degToRad(
    Math.min(Math.max(halfAngleDeg, 0.1), 179),
  );
  const profile = [new THREE.Vector2(0, 0)]; // apex
  for (let i = 0; i <= capSegments; i++) {
    const phi = half * (1 - i / capSegments); // rim -> boresight
    profile.push(new THREE.Vector2(Math.sin(phi), Math.cos(phi)));
  }
  return new THREE.LatheGeometry(profile, radialSegments);
}

function raySphereDistance(satelliteRadius, earthRadius, offBoresightRad) {
  const cos = Math.cos(offBoresightRad);
  const sin = Math.sin(offBoresightRad);
  const disc =
    earthRadius * earthRadius - satelliteRadius * satelliteRadius * sin * sin;
  if (disc < 0) return NaN;
  return satelliteRadius * cos - Math.sqrt(disc);
}

// Field of regard footprint: like makeForSectorGeometry, but the swept cap is
// not a unit sphere around the sensor. Each profile vertex is placed where
// that off-nadir ray intersects the Earth sphere, so the FOR visibly reaches
// the ground all the way out to the reachable limb.
export function makeForFootprintGeometry(
  halfAngleDeg,
  satelliteRadius,
  earthRadius = 1,
  radialSegments = 48,
  capSegments = 18,
) {
  const r = Math.max(satelliteRadius, earthRadius + 1e-4);
  const half = THREE.MathUtils.degToRad(
    Math.min(Math.max(halfAngleDeg, 0.1), 179),
  );
  const horizon = Math.asin(Math.min(earthRadius / r, 0.999999));
  const maxPhi = Math.min(half, horizon - 1e-4);
  const profile = [new THREE.Vector2(0, 0)]; // apex at the sensor

  for (let i = 0; i <= capSegments; i++) {
    const phi = maxPhi * (1 - i / capSegments); // limb/rim -> boresight
    const distance = raySphereDistance(r, earthRadius, phi);
    profile.push(
      new THREE.Vector2(distance * Math.sin(phi), distance * Math.cos(phi)),
    );
  }

  return new THREE.LatheGeometry(profile, radialSegments);
}
