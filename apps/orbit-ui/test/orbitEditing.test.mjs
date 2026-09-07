import test from "node:test";
import assert from "node:assert/strict";
import { orbitAxes, orbitCurve, orbitRadii, changeApsis, ORBIT_EARTH_KM } from "../src/three/orbitEditing.js";
import { buildPreviewEphemeris } from "../src/lib/preview.js";
const orbit = { type: "keplerian", semiMajorAxisKm: 9000, eccentricity: 0.2, inclinationDeg: 63, raanDeg: 41, argPerigeeDeg: 70, trueAnomalyDeg: 0 };
test("orbit handles and path agree with propagated initial apsides and orientation", () => {
  const radii = orbitRadii(orbit), axes = orbitAxes(orbit), path = orbitCurve(orbit);
  assert.ok(Math.abs(axes.p.dot(axes.q)) < 1e-12);
  for (const anomaly of [0, 180]) {
    const result = buildPreviewEphemeris({ ...orbit, trueAnomalyDeg: anomaly }, { epochUtc: "2026-01-01T00:00:00Z", durationSeconds: 60, stepSeconds: 30 });
    const index = anomaly === 0 ? 0 : 128 * 3;
    const expected = [result.eci[0], result.eci[2], -result.eci[1]].map((value) => value / 6371);
    expected.forEach((value, j) => assert.ok(Math.abs(path[index + j] - value) < 1e-10));
  }
  assert.equal(radii.perigee, 7200); assert.equal(radii.apogee, 10800);
});
test("dragging an apsis preserves the other apsis and keeps a valid above-Earth ellipse", () => {
  const raised = changeApsis(orbit, "apogee", 13000);
  assert.ok(Math.abs(orbitRadii(raised).perigee - 7200) < 1e-9);
  assert.ok(Math.abs(orbitRadii(raised).apogee - 13000) < 1e-9);
  for (const [kind, radius] of [["perigee", 0], ["perigee", 90000], ["apogee", 0], ["apogee", 1e10]]) {
    const next = changeApsis(orbit, kind, radius), bounds = orbitRadii(next);
    assert.ok(bounds.perigee >= ORBIT_EARTH_KM + 90);
    assert.ok(bounds.apogee >= bounds.perigee);
    assert.ok(next.eccentricity >= 0 && next.eccentricity < 1);
    assert.ok(next.semiMajorAxisKm <= 2e6);
    assert.equal(next.inclinationDeg, orbit.inclinationDeg);
  }
});
