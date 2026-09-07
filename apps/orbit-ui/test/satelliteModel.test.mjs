import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createSatelliteModel } from "../src/three/satelliteModel.js";
import { orientSatelliteBody } from "../src/three/satelliteAttitude.js";

const EPS = 1e-6;
const UP = new THREE.Vector3(0, 1, 0);
const RADIALS = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-2, 1, 3).normalize(),
];

function placeModel(model, radial) {
  model.root.position.copy(radial).multiplyScalar(1.1);
  model.root.scale.setScalar(0.0025);
  model.root.quaternion.setFromUnitVectors(UP, radial);
  model.root.updateMatrixWorld(true);
}

test("default antenna reflector opens toward Earth with its feed in front", () => {
  const model = createSatelliteModel();
  assert.equal(model.payload, null, "a visual antenna does not create a sensor");
  const reflector = model.root.getObjectByName("antenna-reflector");
  const feed = model.root.getObjectByName("antenna-feed");
  for (const radial of RADIALS) {
    placeModel(model, radial);
    const nadir = radial.clone().negate();
    const center = reflector.getWorldPosition(new THREE.Vector3());
    const feedPosition = feed.getWorldPosition(new THREE.Vector3());
    const opening = UP.clone().applyQuaternion(reflector.getWorldQuaternion(new THREE.Quaternion()));
    assert.ok(opening.dot(nadir) > 1 - EPS, "dish opening points toward Earth");
    assert.ok(center.clone().sub(model.root.position).dot(nadir) > 0, "reflector is on the Earth-facing side");
    assert.ok(feedPosition.clone().sub(center).normalize().dot(nadir) > 1 - EPS,
      "feed is in front of the reflector, toward Earth");
    const vertices = reflector.geometry.getAttribute("position");
    let rimAhead = false;
    for (let i = 0; i < vertices.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(vertices, i);
      const towardEarth = reflector.localToWorld(vertex).sub(center).dot(nadir);
      assert.ok(towardEarth >= -EPS, "concave surface opens toward the feed");
      rimAhead ||= towardEarth > EPS;
    }
    assert.ok(rimAhead, "dish rim is ahead of its center");
  }
});

test("optional sensor aperture starts Earthward before a viewer pointing update", () => {
  const model = createSatelliteModel({ hasSensor: true });
  for (const radial of RADIALS) {
    placeModel(model, radial);
    const nadir = radial.clone().negate();
    const pivot = model.payload.getWorldPosition(new THREE.Vector3());
    const aperture = model.aperture.getWorldPosition(new THREE.Vector3());
    const boresight = aperture.clone().sub(pivot).normalize();
    assert.ok(boresight.dot(nadir) > 1 - EPS, "optics look toward Earth");
    assert.ok(aperture.length() < pivot.length(), "aperture is closer to Earth than its gimbal");
    assert.ok(aperture.length() > 1, "display model stays above the surface");
  }
});

function namedObjects(model, name) {
  const objects = [];
  model.root.traverse((object) => {
    if (object.name === name) objects.push(object);
  });
  return objects;
}

function frontFaceNormal(cell) {
  const normals = cell.geometry.getAttribute("normal");
  for (let i = 0; i < normals.count; i++) {
    const normal = new THREE.Vector3().fromBufferAttribute(normals, i);
    if (normal.y > 1 - EPS) {
      return normal.applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(cell.matrixWorld));
    }
  }
  assert.fail("front cell has a +Y face");
}

test("solar cell faces follow the attainable Sun direction while the span and mounts stay fixed", () => {
  const model = createSatelliteModel({ hasSensor: true });
  // A rotated bus makes this a check of actual transformed cell geometry.
  model.root.quaternion.setFromEuler(new THREE.Euler(0.3, -0.7, 0.2));
  model.root.updateMatrixWorld(true);
  const panels = namedObjects(model, "solar-panel-frame");
  const fronts = namedObjects(model, "solar-cell-front");
  const fixed = model.root.children.filter((child) => !child.name.startsWith("solar-wing-") || child.name === "solar-wing-mount");
  const panelCenters = panels.map((panel) => panel.getWorldPosition(new THREE.Vector3()));
  const fixedTransforms = fixed.map((object) => object.matrixWorld.clone());
  const localSuns = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(7, -2, 3),
    new THREE.Vector3(-4, 3, -2),
  ];
  for (const sun of localSuns) {
    model.trackSun(sun);
    model.root.updateMatrixWorld(true);
    const projectedSun = new THREE.Vector3(0, sun.y, sun.z).normalize()
      .applyQuaternion(model.root.quaternion);
    const worldSun = sun.clone().normalize().applyQuaternion(model.root.quaternion);
    const maximumIncidence = Math.hypot(sun.y, sun.z) / sun.length();
    for (const cell of fronts) {
      const normal = frontFaceNormal(cell);
      assert.ok(normal.dot(projectedSun) > 1 - EPS, "actual front plane faces the projected Sun");
      assert.ok(Math.abs(normal.dot(worldSun) - maximumIncidence) < EPS,
        "single-axis orientation maximizes attainable incidence");
    }
    panels.forEach((panel, i) => {
      assert.ok(panel.getWorldPosition(new THREE.Vector3()).distanceTo(panelCenters[i]) < EPS,
        "panel centers retain their cross-track span along the hinge");
    });
    fixed.forEach((object, i) => {
      object.matrixWorld.elements.forEach((value, j) => {
        assert.ok(Math.abs(value - fixedTransforms[i].elements[j]) < EPS,
          "mounts, bus, and payload are unaffected by array articulation");
      });
    });
  }
});

test("hinge-parallel Sun retains a finite prior array pose", () => {
  const model = createSatelliteModel();
  model.trackSun(new THREE.Vector3(2, -3, 4));
  model.root.updateMatrixWorld(true);
  const fronts = namedObjects(model, "solar-cell-front");
  const previousNormals = fronts.map(frontFaceNormal);
  for (const sun of [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(1, 1e-12, -1e-12),
    new THREE.Vector3(0, 0, 0),
  ]) {
    model.trackSun(sun);
    model.root.updateMatrixWorld(true);
    fronts.forEach((cell, i) => {
      const normal = frontFaceNormal(cell);
      assert.ok(normal.toArray().every(Number.isFinite), "no undefined rotation");
      assert.ok(normal.distanceTo(previousNormals[i]) < EPS, "prior angle remains stable");
    });
  }
  model.trackSun(new THREE.Vector3(0, 1, 0));
  model.trackSun(new THREE.Vector3(2, -3, 4));
  model.root.updateMatrixWorld(true);
  fronts.forEach((cell, i) => {
    assert.ok(frontFaceNormal(cell).distanceTo(previousNormals[i]) < EPS,
      "ordinary Sun directions give the same pose regardless of frame history");
  });
});

test("articulated panels track a world Sun throughout an inclined orbit", () => {
  const model = createSatelliteModel();
  model.root.scale.setScalar(0.0025);
  const panels = namedObjects(model, "solar-panel-frame");
  const fronts = namedObjects(model, "solar-cell-front");
  const worldSun = new THREE.Vector3(0.3, -0.7, 0.64).normalize();
  const inclination = 1.1;
  for (let sample = 0; sample <= 24; sample++) {
    const anomaly = sample * Math.PI / 12;
    const position = new THREE.Vector3(Math.cos(anomaly),
      Math.sin(anomaly) * Math.cos(inclination),
      Math.sin(anomaly) * Math.sin(inclination)).multiplyScalar(1.1);
    const velocity = new THREE.Vector3(-Math.sin(anomaly),
      Math.cos(anomaly) * Math.cos(inclination),
      Math.cos(anomaly) * Math.sin(inclination));
    model.root.position.copy(position);
    orientSatelliteBody(model.root.quaternion, position, velocity);
    model.trackSun(worldSun.clone().applyQuaternion(model.root.quaternion.clone().invert()));
    model.root.updateMatrixWorld(true);
    // Derive the span from actual separated panel centers, independently
    // of the model's hinge Euler angle or the attitude helper's basis.
    const span = panels[panels.length - 1].getWorldPosition(new THREE.Vector3())
      .sub(panels[0].getWorldPosition(new THREE.Vector3())).normalize();
    assert.ok(Math.abs(span.dot(velocity)) < EPS, "array span remains perpendicular to flight");
    const bestIncidence = Math.sqrt(Math.max(0, 1 - worldSun.dot(span) ** 2));
    for (const cell of fronts) {
      const normal = frontFaceNormal(cell);
      assert.ok(Math.abs(normal.dot(span)) < EPS, "panel normal stays perpendicular to the hinge");
      assert.ok(Math.abs(normal.dot(worldSun) - bestIncidence) < EPS,
        "actual cell surface maximizes Sun exposure at every orbit sample");
    }
  }
});
