import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  fovLengthToEarth,
  makeForFootprintGeometry,
  makeForSectorGeometry,
  makeFovConeGeometry,
  orientBoresight,
  raySphereDistanceFromPoint,
} from "../src/three/sensorGeometry.js";

const EPS = 1e-6;

function vertices(geometry) {
  const attr = geometry.getAttribute("position");
  const out = [];
  for (let i = 0; i < attr.count; i++) {
    out.push(new THREE.Vector3().fromBufferAttribute(attr, i));
  }
  return out;
}

// Angle off the +Y boresight axis, in degrees; 0 for the apex itself.
function offBoresightDeg(v) {
  const len = v.length();
  if (len < EPS) return 0;
  return (Math.acos(THREE.MathUtils.clamp(v.y / len, -1, 1)) * 180) / Math.PI;
}

test("FOV cone opens along +Y with its apex at the origin", () => {
  const verts = vertices(makeFovConeGeometry());
  assert.ok(verts.some((v) => v.length() < EPS), "apex vertex at the origin");
  for (const v of verts) {
    assert.ok(v.y > -EPS && v.y < 1 + EPS, `vertex y in [0, 1], got ${v.y}`);
    // Straight wall: radius grows linearly with distance along the boresight.
    const radial = Math.hypot(v.x, v.z);
    assert.ok(Math.abs(radial - v.y) < 1e-4, "unit cone wall (radius == y)");
  }
});

test("FOV beam length reaches the Earth instead of lifted target markers", () => {
  const satellite = new THREE.Vector3(1.08, 0, 0);
  const liftedTargetMarker = new THREE.Vector3(1.006, 0, 0);
  const dir = liftedTargetMarker.clone().sub(satellite).normalize();
  const markerDistance = satellite.distanceTo(liftedTargetMarker);
  const surfaceDistance = raySphereDistanceFromPoint(satellite, dir, 1);
  const beamLength = fovLengthToEarth(satellite, dir, 1, 0.03);

  assert.ok(surfaceDistance > markerDistance);
  assert.ok(beamLength > surfaceDistance);
  assert.ok(
    beamLength > markerDistance,
    "FOV should pass through the lifted marker and cross the globe",
  );
});

test("FOR sector is a unit-radius volume within the half-angle of +Y", () => {
  const half = 60;
  const verts = vertices(makeForSectorGeometry(half));
  assert.ok(verts.some((v) => v.length() < EPS), "apex vertex at the origin");
  let capVerts = 0;
  for (const v of verts) {
    assert.ok(v.length() < 1 + EPS, "no vertex beyond the slew reach");
    assert.ok(
      offBoresightDeg(v) < half + 1e-3,
      `vertex within ${half} deg of boresight, got ${offBoresightDeg(v)}`,
    );
    if (Math.abs(v.length() - 1) < 1e-3) capVerts++;
  }
  assert.ok(capVerts > 0, "spherical cap closes the sector at unit radius");
});

test("FOR footprint casts each reachable ray down to Earth", () => {
  const satRadius = 1.12;
  const earthRadius = 1;
  const half = 60;
  const verts = vertices(makeForFootprintGeometry(half, satRadius, earthRadius));
  const earthCenter = new THREE.Vector3(0, satRadius, 0);
  assert.ok(verts.some((v) => v.length() < EPS), "apex vertex at the sensor");

  let surfaceVerts = 0;
  let maxReach = 0;
  for (const v of verts) {
    if (v.length() < EPS) continue;
    surfaceVerts++;
    maxReach = Math.max(maxReach, v.length());
    assert.ok(
      Math.abs(v.distanceTo(earthCenter) - earthRadius) < 1e-4,
      "FOR footprint vertex lies on the Earth surface",
    );
    assert.ok(
      offBoresightDeg(v) < half + 1e-3,
      `vertex within ${half} deg of boresight`,
    );
  }

  assert.ok(surfaceVerts > 0, "footprint has surface vertices");
  assert.ok(
    maxReach > satRadius - earthRadius,
    "off-nadir footprint reaches farther than the nadir subpoint distance",
  );
});

// Regression for the mirrored field-of-regard report: with the satellite at
// an arbitrary ECI-ish position and both volumes oriented through
// orientBoresight, every FOV and FOR vertex must land on the nadir (Earth)
// side of the satellite - never behind it on the zenith side.
test("FOV cone and FOR sector sit on the same nadir side of the satellite", () => {
  const positions = [
    new THREE.Vector3(1.08, 0, 0),
    new THREE.Vector3(-0.4, 0.9, -0.5).normalize().multiplyScalar(1.2),
    new THREE.Vector3(0, -1.05, 0.3),
  ];
  for (const p of positions) {
    const nadir = p.clone().normalize().negate();
    const scale = p.length() - 1;
    for (const geometry of [makeFovConeGeometry(), makeForSectorGeometry(80)]) {
      const q = orientBoresight(new THREE.Quaternion(), nadir);
      for (const v of vertices(geometry)) {
        const world = v.multiplyScalar(scale).applyQuaternion(q).add(p);
        const towardNadir = world.clone().sub(p).dot(nadir);
        assert.ok(
          towardNadir > -EPS,
          `vertex on the nadir side (dot=${towardNadir}) for sat at ${p.toArray()}`,
        );
      }
    }
  }
});

test("orientBoresight maps local +Y onto the requested world direction", () => {
  const dirs = [
    new THREE.Vector3(0, -1, 0), // nadir over the pole (antiparallel case)
    new THREE.Vector3(1, 2, -3).normalize(),
    new THREE.Vector3(0, 1, 0),
  ];
  for (const dir of dirs) {
    const q = orientBoresight(new THREE.Quaternion(), dir);
    const mapped = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    assert.ok(mapped.distanceTo(dir) < 1e-6, `boresight mapped onto ${dir.toArray()}`);
  }
});
