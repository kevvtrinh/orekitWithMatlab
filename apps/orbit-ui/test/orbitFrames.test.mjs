import test from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { buildOrbitFramePositions } from "../src/three/orbitFrames.js";
import { gmstRad } from "../src/lib/time.js";

const epochMs = Date.UTC(2026, 6, 5);
const earthAxis = new Vector3(0, 1, 0);
const scale = 6371;

function syntheticEphemeris(times, positionAt) {
  const eci = new Float64Array(times.length * 3);
  times.forEach((time, i) => eci.set(positionAt(time), i * 3));
  return { n: times.length, t: Float64Array.from(times), eci };
}

test("geostationary history is an inertial orbit but a fixed Earth-relative point", () => {
  const times = [-2100, 0, 110, 4500, 11000, 28000, 86000];
  const longitude = -1.23, radius = 42164;
  const ephemeris = syntheticEphemeris(times, (time) => {
    const angle = gmstRad(new Date(epochMs + time * 1000)) + longitude;
    return [radius * Math.cos(angle), radius * Math.sin(angle), 0];
  });
  const paths = buildOrbitFramePositions(ephemeris, epochMs);
  const fixedPoint = new Vector3(radius / scale * Math.cos(longitude), 0, -radius / scale * Math.sin(longitude));
  for (let i = 0; i < times.length; i++) {
    const actual = new Vector3().fromArray(paths.ECEF, i * 3);
    assert.ok(actual.distanceTo(fixedPoint) < 1e-6, `Earth-fixed sample ${i} drifted`);
  }
  assert.ok(new Vector3().fromArray(paths.ECI, 0).distanceTo(new Vector3().fromArray(paths.ECI, 15)) > 5,
    "The ECI history should retain the geostationary orbit arc");
});

test("Earth-fixed history meets the live inertial position at each irregularly sampled instant", () => {
  const times = [-950, 0, 17, 450, 6120, 24000, 89000];
  const ephemeris = syntheticEphemeris(times, (time) => [
    7000 * Math.cos(time / 1000), 5200 * Math.sin(time / 1000), 3800 * Math.sin(time / 1000),
  ]);
  const paths = buildOrbitFramePositions(ephemeris, epochMs);
  for (let i = 0; i < times.length; i++) {
    const earthFixedWorld = new Vector3().fromArray(paths.ECEF, i * 3)
      .applyAxisAngle(earthAxis, gmstRad(new Date(epochMs + times[i] * 1000)));
    const inertialWorld = new Vector3().fromArray(paths.ECI, i * 3);
    assert.ok(earthFixedWorld.distanceTo(inertialWorld) < 3e-7, `Mismatch at sample ${i}`);
    assert.ok(Math.abs(inertialWorld.length() - earthFixedWorld.length()) < 3e-7);
  }
});

test("epoch changes rotate Earth-fixed paths without changing their inertial positions", () => {
  const ephemeris = syntheticEphemeris([0, 60, 1000], () => [7000, 3000, 1200]);
  const first = buildOrbitFramePositions(ephemeris, epochMs);
  const second = buildOrbitFramePositions(ephemeris, epochMs + 6 * 3600 * 1000);
  assert.deepEqual(first.ECI, second.ECI);
  assert.ok(new Vector3().fromArray(first.ECEF).distanceTo(new Vector3().fromArray(second.ECEF)) > 1);
});

test("frame histories support empty and singleton ephemerides without modifying source data", () => {
  assert.equal(buildOrbitFramePositions(syntheticEphemeris([], () => []), epochMs).ECEF.length, 0);
  const ephemeris = syntheticEphemeris([123], () => [6500, -1300, 2800]);
  const before = Array.from(ephemeris.eci);
  const paths = buildOrbitFramePositions(ephemeris, epochMs);
  assert.equal(paths.ECI.length, 3);
  assert.ok(Array.from(paths.ECEF).every(Number.isFinite));
  assert.deepEqual(Array.from(ephemeris.eci), before);
});
