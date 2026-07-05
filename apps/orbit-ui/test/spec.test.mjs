// Unit tests for the shared scenario-spec logic and the preview/merge layers.
//   npm test   (node --test test/)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  deepEqual,
  deriveSpecFromScenario,
  expandWalker,
  groundStationTemplate,
  keplerianSatelliteTemplate,
  nextObjectName,
  stripEmptyFields,
  targetTemplate,
  tleSatelliteTemplate,
  validateSpec,
} from "../src/lib/spec.js";
import { buildPreviewEphemeris } from "../src/lib/preview.js";
import { buildRenderScenario } from "../src/lib/renderScenario.js";
import { defaultSpec, loadSpec } from "../server/scenarioStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(
  readFileSync(path.join(__dirname, "..", "public", "sample-scenario.json")),
);

function specWith(objects, metaOverrides = {}) {
  return {
    version: 1,
    rev: 0,
    meta: {
      name: "Test",
      epochUtc: "2026-07-05T00:00:00Z",
      durationSeconds: 5400,
      stepSeconds: 60,
      ...metaOverrides,
    },
    objects,
  };
}

test("templates produce valid specs", () => {
  const spec = specWith([
    keplerianSatelliteTemplate("Sat-1"),
    tleSatelliteTemplate("ISS"),
    groundStationTemplate("GS-1"),
    targetTemplate("Target-1"),
  ]);
  assert.deepEqual(validateSpec(stripEmptyFields(spec)), []);
});

test("validateSpec rejects bad values", () => {
  const dupes = specWith([
    keplerianSatelliteTemplate("Same"),
    groundStationTemplate("Same"),
  ]);
  assert.ok(validateSpec(dupes).some((e) => e.includes("duplicate")));

  const subsurface = specWith([
    {
      ...keplerianSatelliteTemplate("Low"),
      orbit: {
        ...keplerianSatelliteTemplate("Low").orbit,
        semiMajorAxisKm: 6000,
      },
    },
  ]);
  assert.ok(validateSpec(subsurface).some((e) => e.includes("semi-major")));

  const badEpoch = specWith([], { epochUtc: "yesterday" });
  assert.ok(validateSpec(badEpoch).some((e) => e.includes("Epoch")));

  const badTle = specWith([
    { ...tleSatelliteTemplate("Bad"), orbit: { type: "tle", line1: "x", line2: "y" } },
  ]);
  assert.ok(validateSpec(badTle).some((e) => e.includes("TLE line 1")));

  const kepWithTleProp = specWith([
    { ...keplerianSatelliteTemplate("Mix"), propagator: "TLE" },
  ]);
  assert.ok(validateSpec(kepWithTleProp).some((e) => e.includes("TLE")));
});

test("nextObjectName skips taken names", () => {
  const spec = specWith([
    keplerianSatelliteTemplate("Satellite-1"),
    keplerianSatelliteTemplate("Satellite-2"),
  ]);
  assert.equal(nextObjectName(spec, "Satellite"), "Satellite-3");
  assert.equal(nextObjectName(spec, "Place"), "Place-1");
});

test("expandWalker matches ConstellationFactory semantics", () => {
  const sats = expandWalker({
    pattern: "delta",
    prefix: "W",
    totalSatellites: 6,
    planes: 3,
    phasing: 1,
    semiMajorAxisKm: 7000,
    eccentricity: 0.001,
    inclinationDeg: 53,
    raanOffsetDeg: 10,
    argPerigeeDeg: 0,
    trueAnomalyOffsetDeg: 0,
  });
  assert.equal(sats.length, 6);
  assert.equal(sats[0].name, "W-P01-S01");
  assert.equal(sats[5].name, "W-P03-S02");
  // Delta: RAAN spread over 360/planes; phasing 360*f/total per plane.
  assert.equal(sats[0].orbit.raanDeg, 10);
  assert.equal(sats[2].orbit.raanDeg, 130);
  assert.equal(sats[2].orbit.trueAnomalyDeg, 60); // plane 2: 1*360/6
  assert.equal(sats[3].orbit.trueAnomalyDeg, 240); // + in-plane 180

  const star = expandWalker({
    pattern: "star",
    prefix: "S",
    totalSatellites: 4,
    planes: 2,
    phasing: 0,
    semiMajorAxisKm: 7200,
    eccentricity: 0,
    inclinationDeg: 86,
    raanOffsetDeg: 0,
    argPerigeeDeg: 0,
    trueAnomalyOffsetDeg: 0,
  });
  assert.equal(star[2].orbit.raanDeg, 90); // 180-deg spread over 2 planes

  assert.throws(() =>
    expandWalker({
      pattern: "delta",
      prefix: "X",
      totalSatellites: 7,
      planes: 3,
      phasing: 0,
      semiMajorAxisKm: 7000,
      eccentricity: 0,
      inclinationDeg: 50,
      raanOffsetDeg: 0,
      argPerigeeDeg: 0,
      trueAnomalyOffsetDeg: 0,
    }),
  );
});

test("deriveSpecFromScenario round-trips the bundled sample", () => {
  const spec = deriveSpecFromScenario(sample);
  assert.deepEqual(validateSpec(spec), []);
  assert.equal(spec.objects.filter((o) => o.kind === "satellite").length, 2);
  assert.equal(spec.objects.filter((o) => o.kind === "groundStation").length, 2);
  const iss = spec.objects.find((o) => o.name === "ISS-Demo");
  assert.equal(iss.orbit.semiMajorAxisKm, 6778);
});

test("defaultSpec and loadSpec return valid specs", () => {
  assert.deepEqual(validateSpec(defaultSpec()), []);
  assert.deepEqual(validateSpec(loadSpec()), []);
});

test("buildPreviewEphemeris produces a plausible circular LEO", () => {
  const eph = buildPreviewEphemeris(
    {
      type: "keplerian",
      semiMajorAxisKm: 7000,
      eccentricity: 0,
      inclinationDeg: 51.6,
      raanDeg: 40,
      argPerigeeDeg: 0,
      trueAnomalyDeg: 10,
    },
    { epochUtc: "2026-07-05T00:00:00Z", durationSeconds: 5400, stepSeconds: 60 },
  );
  assert.equal(eph.n, 91);
  for (let i = 0; i < eph.n; i++) {
    const r = Math.hypot(eph.eci[i * 3], eph.eci[i * 3 + 1], eph.eci[i * 3 + 2]);
    assert.ok(Math.abs(r - 7000) < 1, `radius stays 7000 km (got ${r})`);
    const altKm = eph.lla[i * 3 + 2];
    assert.ok(altKm > 550 && altKm < 650, `altitude ~622 km (got ${altKm})`);
    // Geodetic latitude can exceed the geocentric bound (inclination) by the
    // ellipsoid correction (~0.2 deg at this latitude).
    assert.ok(Math.abs(eph.lla[i * 3]) <= 51.9, "latitude bounded by inclination");
  }
});

test("buildRenderScenario merges MATLAB results with spec edits", () => {
  const spec = deriveSpecFromScenario(sample);
  const withSnapshot = { ...sample, spec };

  // Untouched spec: everything is authoritative MATLAB data.
  const fresh = buildRenderScenario(spec, withSnapshot);
  assert.ok(fresh.satellites.every((s) => s.source === "matlab"));
  assert.ok(fresh.accesses.every((a) => !a.stale));
  assert.equal(fresh.dirty, false);

  // Edit one satellite: it flips to preview, its accesses go stale.
  const edited = structuredClone(spec);
  const sat = edited.objects.find((o) => o.name === "ISS-Demo");
  sat.orbit.inclinationDeg = 60;
  const merged = buildRenderScenario(edited, withSnapshot);
  assert.equal(merged.satellites.find((s) => s.name === "ISS-Demo").source, "preview");
  assert.equal(merged.satellites.find((s) => s.name === "SSO-Imager").source, "matlab");
  assert.ok(
    merged.accesses
      .filter((a) => a.source === "ISS-Demo")
      .every((a) => a.stale),
  );
  assert.ok(
    merged.accesses
      .filter((a) => a.source === "SSO-Imager")
      .every((a) => !a.stale),
  );
  assert.equal(merged.dirty, true);

  // Delete a ground station: its access pairs disappear entirely.
  const deleted = structuredClone(spec);
  deleted.objects = deleted.objects.filter((o) => o.name !== "Denver GS");
  const afterDelete = buildRenderScenario(deleted, withSnapshot);
  assert.ok(afterDelete.accesses.every((a) => a.target !== "Denver GS"));
  assert.equal(afterDelete.dirty, true);

  // New TLE satellite: listed as pending (no client-side SGP4).
  const added = structuredClone(spec);
  added.objects.push(stripEmptyFields(tleSatelliteTemplate("New-TLE")));
  const withPending = buildRenderScenario(added, withSnapshot);
  assert.equal(
    withPending.satellites.find((s) => s.name === "New-TLE").source,
    "pending",
  );

  // No MATLAB data at all: Keplerian sats preview, nothing is stale-fresh.
  const previewOnly = buildRenderScenario(spec, null);
  assert.ok(previewOnly.satellites.every((s) => s.source === "preview"));
  assert.equal(previewOnly.accesses.length, 0);
});

test("deepEqual ignores key order but not values", () => {
  assert.ok(deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 2 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 1, c: 3 }));
});
