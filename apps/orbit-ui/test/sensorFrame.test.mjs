import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { configureSensorCamera, projectSensorPoint, sensorFovBoundary } from "../src/three/sensorFrame.js";

function fixture() {
  const camera = new THREE.PerspectiveCamera(40, 1, 1e-6, 1000);
  const position = new THREE.Vector3(0, 0, 1.1), direction = new THREE.Vector3(0, 0, -1);
  configureSensorCamera(camera, position, direction, new THREE.Vector3(0, 1, 0), 20, 1.6);
  return camera;
}
test("sensor camera centers boresight, keeps velocity up, and preserves circular FOV across aspect ratios", () => {
  for (const aspect of [0.5, 1, 1.6]) {
    const camera = fixture();
    configureSensorCamera(camera, camera.position, new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), 20, aspect);
    const center = projectSensorPoint(new THREE.Vector3(0, 0, 1), camera, 20);
    assert.ok(Math.abs(center.x - 0.5) < 1e-12 && Math.abs(center.y - 0.5) < 1e-12);
    const y = 0.01;
    const up = projectSensorPoint(new THREE.Vector3(0, y, Math.sqrt(1 - y * y)), camera, 20);
    assert.ok(up.y < 0.5 && up.elDeg > 0);
    const right = projectSensorPoint(new THREE.Vector3(y, 0, Math.sqrt(1 - y * y)), camera, 20);
    assert.ok(right.x > 0.5 && right.azDeg > 0);
    assert.ok(Math.abs((right.x - 0.5) * aspect - (0.5 - up.y)) < 1e-12);
    assert.ok(Math.abs(up.bearingDeg) < 1e-10);
    assert.ok(Math.abs(right.bearingDeg - 90) < 1e-10);
    assert.ok(Math.abs(up.offBoresightDeg - right.offBoresightDeg) < 1e-10);
  }
});
test("sensor frame excludes far-side Earth objects, rear targets, and points outside the cone", () => {
  const camera = fixture();
  assert.equal(projectSensorPoint(new THREE.Vector3(0, 0, -1), camera, 20), null);
  assert.equal(projectSensorPoint(new THREE.Vector3(0, 0, 1.2), camera, 20), null);
  assert.equal(projectSensorPoint(new THREE.Vector3(0.2, 0, 1.05), camera, 20), null);
  assert.ok(projectSensorPoint(new THREE.Vector3(0, 0, 1), camera, 20), "surface endpoint is not self-occluded");
});
test("sensor coordinates are invariant under a common ECI/ECEF rotation", () => {
  const camera = fixture(), point = new THREE.Vector3(0.01, 0.01, Math.sqrt(1 - 0.0002));
  const before = projectSensorPoint(point, camera, 20);
  const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 2);
  const position = camera.position.clone().applyQuaternion(rotation);
  configureSensorCamera(camera, position, new THREE.Vector3(0, 0, -1).applyQuaternion(rotation),
    new THREE.Vector3(0, 1, 0).applyQuaternion(rotation), 20, 1.6);
  const after = projectSensorPoint(point.applyQuaternion(rotation), camera, 20);
  for (const key of ["azDeg", "elDeg", "offBoresightDeg", "bearingDeg", "rangeKm"]) assert.ok(Math.abs(before[key] - after[key]) < 1e-8);
});
test("polar FOV uses constant angular radius and the az/el boundary represents the same cone", () => {
  for (const half of [0.1, 20, 60, 90]) for (const point of sensorFovBoundary(half)) {
    assert.equal(point.offBoresightDeg, half);
    const cosSeparation = Math.cos(point.azDeg * Math.PI / 180) * Math.cos(point.elDeg * Math.PI / 180);
    assert.ok(Math.abs(cosSeparation - Math.cos(half * Math.PI / 180)) < 1e-12);
  }
});
test("velocity parallel to boresight remains finite and wide-angle cropping is explicit", () => {
  const camera = fixture();
  const result = configureSensorCamera(camera, new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0), 90, 0.5);
  assert.ok(result.cropped && camera.fov < 180);
  assert.ok(camera.matrixWorld.elements.every(Number.isFinite));
});
