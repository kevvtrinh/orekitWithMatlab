import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { orientSatelliteBody } from "../src/three/satelliteAttitude.js";

test("solar-panel span stays perpendicular to flight while payload stays Earthward", () => {
  // Equatorial, polar, and inclined/eccentric examples, in a common world frame.
  for (const [p, v] of [
    [[1.1, 0, 0], [0, 0, -0.001]],
    [[0, 1.1, 0], [0.001, 0, 0]],
    [[0.7, -0.5, 0.8], [-0.0008, 0.0004, 0.0009]],
  ]) {
    const position = new THREE.Vector3(...p);
    const velocity = new THREE.Vector3(...v);
    const q = orientSatelliteBody(new THREE.Quaternion(), position, velocity);
    const panelSpan = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const payloadDirection = new THREE.Vector3(0, -1, 0).applyQuaternion(q);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    assert.ok(Math.abs(panelSpan.dot(velocity.clone().normalize())) < 1e-12);
    assert.ok(Math.abs(panelSpan.dot(position.clone().normalize())) < 1e-12);
    assert.ok(payloadDirection.dot(position.clone().normalize()) < -1 + 1e-12);
    assert.ok(forward.dot(velocity) > 0);
    assert.ok(Math.abs(new THREE.Matrix4().makeRotationFromQuaternion(q).determinant() - 1) < 1e-12);
  }
});

test("missing tangential motion still gives a finite Earth-facing attitude at the poles", () => {
  for (const p of [[1, 0, 0], [0, 1, 0], [0, -1, 0], [0.3, 0.7, -0.4]]) {
    const position = new THREE.Vector3(...p);
    for (const velocity of [new THREE.Vector3(), position.clone().multiplyScalar(0.002)]) {
      const q = orientSatelliteBody(new THREE.Quaternion(), position, velocity);
      assert.ok(q.toArray().every(Number.isFinite));
      assert.ok(Math.abs(q.length() - 1) < 1e-12);
      const payloadDirection = new THREE.Vector3(0, -1, 0).applyQuaternion(q);
      assert.ok(payloadDirection.dot(position.clone().normalize()) < -1 + 1e-12);
    }
  }
});
