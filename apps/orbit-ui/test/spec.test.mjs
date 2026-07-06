// Unit tests for the shared scenario-spec logic and the preview/merge layers.
//   npm test   (node --test test/)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  accessRequestOptions,
  areaOutlinePoints,
  collectAreaOutlines,
  deepEqual,
  deriveSpecFromScenario,
  expandAreaGrid,
  expandWalker,
  groundStationTemplate,
  keplerianSatelliteTemplate,
  nextObjectName,
  sensorTemplate,
  stripEmptyFields,
  targetTemplate,
  taskTemplate,
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

test("expandAreaGrid produces a valid centered grid of point targets", () => {
  const targets = expandAreaGrid({
    name: "Basin",
    centerLatDeg: 39,
    centerLonDeg: -105,
    altitudeM: 1600,
    widthKm: 100,
    heightKm: 100,
    spacingKm: 50,
    priority: 7,
  });
  // 100 km / 50 km spacing -> 2x2 equal cells sampled at their centers.
  assert.equal(targets.length, 4);
  assert.equal(targets[0].name, "Basin-R01C01");
  assert.equal(targets[3].name, "Basin-R02C02");
  assert.ok(targets.every((t) => t.kind === "target" && t.priority === 7));
  // Every point carries the parent-area metadata for outline rendering.
  assert.ok(
    targets.every(
      (t) =>
        t.group === "Basin" &&
        t.area.name === "Basin" &&
        t.area.centerLatDeg === 39 &&
        t.area.centerLonDeg === -105 &&
        t.area.widthKm === 100 &&
        t.area.heightKm === 100,
    ),
  );
  // Cell centers sit strictly inside the area, symmetric about the center.
  const kmPerDeg = 111.32;
  const halfLatDeg = 50 / kmPerDeg;
  assert.ok(
    targets.every((t) => Math.abs(t.latitudeDeg - 39) < halfLatDeg),
  );
  assert.ok(Math.abs(targets[0].latitudeDeg - (39 - 25 / kmPerDeg)) < 1e-9);
  assert.ok(Math.abs(targets[3].latitudeDeg - (39 + 25 / kmPerDeg)) < 1e-9);
  const dLon = 25 / (kmPerDeg * Math.cos((39 * Math.PI) / 180));
  assert.ok(Math.abs(targets[0].longitudeDeg - (-105 - dLon)) < 1e-9);
  // The whole grid drops into a spec as ordinary point targets.
  const spec = specWith(targets);
  assert.deepEqual(validateSpec(stripEmptyFields(spec)), []);

  // Single point when the area is smaller than the spacing.
  const single = expandAreaGrid({
    name: "Spot",
    centerLatDeg: 0,
    centerLonDeg: 10,
    widthKm: 10,
    heightKm: 10,
    spacingKm: 50,
  });
  assert.equal(single.length, 1);
  assert.equal(single[0].latitudeDeg, 0);

  // Guardrails: oversized grids, polar centers, bad numbers.
  assert.throws(
    () =>
      expandAreaGrid({
        name: "Huge",
        centerLatDeg: 0,
        centerLonDeg: 0,
        widthKm: 5000,
        heightKm: 5000,
        spacingKm: 50,
      }),
    /max/i,
  );
  assert.throws(
    () =>
      expandAreaGrid({
        name: "Polar",
        centerLatDeg: 89.9,
        centerLonDeg: 0,
        widthKm: 100,
        heightKm: 100,
        spacingKm: 50,
      }),
    /pole/i,
  );
  assert.throws(
    () =>
      expandAreaGrid({
        name: "Bad",
        centerLatDeg: 0,
        centerLonDeg: 0,
        widthKm: NaN,
        heightKm: 100,
        spacingKm: 50,
      }),
    /Width/,
  );
});

test("area outlines derive from grid-point metadata", () => {
  const gridA = expandAreaGrid({
    name: "A",
    centerLatDeg: 10,
    centerLonDeg: 20,
    widthKm: 100,
    heightKm: 60,
    spacingKm: 25,
  });
  const gridB = expandAreaGrid({
    name: "B",
    centerLatDeg: -30,
    centerLonDeg: 40,
    widthKm: 50,
    heightKm: 50,
    spacingKm: 50,
  });
  const outlines = collectAreaOutlines([
    ...gridA,
    targetTemplate("Solo"),
    ...gridB,
  ]);
  // One outline per area; standalone targets contribute none.
  assert.deepEqual(
    outlines.map((o) => o.name),
    ["A", "B"],
  );

  const a = outlines[0];
  assert.equal(a.points.length, 32); // 4 edges x 8 segments, open ring
  const lats = a.points.map((p) => p.latDeg);
  const lons = a.points.map((p) => p.lonDeg);
  const kmPerDeg = 111.32;
  assert.ok(Math.abs(Math.max(...lats) - (10 + 30 / kmPerDeg)) < 1e-9);
  assert.ok(Math.abs(Math.min(...lats) - (10 - 30 / kmPerDeg)) < 1e-9);
  const halfLonDeg = 50 / (kmPerDeg * Math.cos((10 * Math.PI) / 180));
  assert.ok(Math.abs(Math.max(...lons) - (20 + halfLonDeg)) < 1e-9);
  assert.ok(Math.abs(Math.min(...lons) - (20 - halfLonDeg)) < 1e-9);
  // Grid points sit strictly inside the outline bounds.
  assert.ok(
    gridA.every(
      (t) =>
        t.latitudeDeg > Math.min(...lats) &&
        t.latitudeDeg < Math.max(...lats) &&
        t.longitudeDeg > Math.min(...lons) &&
        t.longitudeDeg < Math.max(...lons),
    ),
  );
  // Subdivision count is adjustable.
  assert.equal(areaOutlinePoints(outlines[1], 2).length, 8);

  // The render scenario exposes outlines and per-point area tags for the 3D
  // view while the spec still holds only plain point targets.
  const scenario = buildRenderScenario(stripEmptyFields(specWith(gridA)), null);
  assert.equal(scenario.areaOutlines.length, 1);
  assert.equal(scenario.areaOutlines[0].name, "A");
  assert.ok(scenario.groundPoints.every((gp) => gp.area?.name === "A"));
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

test("sensor and task validation", () => {
  const sat = { ...keplerianSatelliteTemplate("Imager"), sensor: sensorTemplate() };
  const withSensor = specWith([sat, targetTemplate("T1")]);
  withSensor.tasks = [
    {
      id: "task-1",
      satelliteName: "Imager",
      targetName: "T1",
      priority: 5,
      dwellSeconds: 60,
    },
  ];
  assert.deepEqual(validateSpec(stripEmptyFields(withSensor)), []);

  // taskTemplate picks the first target and validates.
  const templated = { ...withSensor, tasks: [taskTemplate(withSensor)] };
  assert.equal(templated.tasks[0].targetName, "T1");
  assert.deepEqual(validateSpec(stripEmptyFields(templated)), []);

  // FOV wider than FOR is rejected.
  const badSensor = structuredClone(withSensor);
  badSensor.objects[0].sensor = { coneHalfAngleDeg: 45, fieldOfRegardDeg: 30 };
  assert.ok(validateSpec(badSensor).some((e) => e.includes("field of regard")));

  // Task must reference an existing point target.
  const badTarget = structuredClone(withSensor);
  badTarget.tasks[0].targetName = "Nope";
  assert.ok(validateSpec(badTarget).some((e) => e.includes("targetName")));

  // Pinned satellite must exist and carry a sensor.
  const noSensorSat = structuredClone(withSensor);
  delete noSensorSat.objects[0].sensor;
  assert.ok(
    validateSpec(noSensorSat).some((e) => e.includes("satelliteName")),
  );

  // Duplicate task ids are rejected.
  const dupIds = structuredClone(withSensor);
  dupIds.tasks.push({ ...dupIds.tasks[0] });
  assert.ok(validateSpec(dupIds).some((e) => e.includes("duplicate task id")));
});

test("access requests validate and enumerate only supported pairs", () => {
  const sat = { ...keplerianSatelliteTemplate("Imager"), sensor: sensorTemplate() };
  const relay = keplerianSatelliteTemplate("Relay");
  const gs = groundStationTemplate("Denver GS");
  const target = targetTemplate("Denver Target");
  const spec = specWith([sat, relay, gs, target]);

  const options = accessRequestOptions(spec);
  assert.ok(
    options.some(
      (o) =>
        o.request.type === "access" &&
        o.request.sourceName === "Imager" &&
        o.request.targetName === "Denver GS",
    ),
  );
  assert.ok(
    options.some(
      (o) =>
        o.request.type === "access" &&
        o.request.sourceName === "Imager" &&
        o.request.targetName === "Relay",
    ),
  );
  assert.ok(
    options.some(
      (o) =>
        o.request.type === "sensor" &&
        o.request.platformName === "Imager" &&
        o.request.targetName === "Denver Target",
    ),
  );

  const selectedPlain = {
    ...spec,
    accessRequests: [
      { type: "access", sourceName: "Imager", targetName: "Denver GS" },
    ],
  };
  assert.deepEqual(validateSpec(stripEmptyFields(selectedPlain)), []);

  const selectedSensor = {
    ...spec,
    accessRequests: [
      {
        type: "sensor",
        platformName: "Imager",
        sensorName: "Imager Sensor",
        targetName: "Denver Target",
      },
    ],
  };
  assert.deepEqual(validateSpec(stripEmptyFields(selectedSensor)), []);

  const unsupported = {
    ...spec,
    accessRequests: [
      { type: "access", sourceName: "Denver Target", targetName: "Denver GS" },
    ],
  };
  assert.ok(validateSpec(unsupported).some((e) => e.includes("plain access")));

  const noSensor = structuredClone(spec);
  delete noSensor.objects[0].sensor;
  noSensor.accessRequests = [
    { type: "sensor", platformName: "Imager", targetName: "Denver Target" },
  ];
  assert.ok(
    validateSpec(noSensor).some((e) => e.includes("satellite with a sensor")),
  );
});

test("buildRenderScenario merges schedule, sensor accesses, and sun data", () => {
  const spec = deriveSpecFromScenario(sample);
  spec.objects.push(stripEmptyFields(targetTemplate("T1")));
  const sat = spec.objects.find((o) => o.kind === "satellite");
  sat.sensor = sensorTemplate();
  spec.tasks = [
    { id: "task-1", targetName: "T1", priority: 5, dwellSeconds: 60 },
  ];

  const epochIso = (sec) =>
    new Date(Date.parse(spec.meta.epochUtc) + sec * 1000).toISOString();
  const raw = {
    ...sample,
    spec: structuredClone(spec),
    sensors: [
      {
        name: `${sat.name} Sensor`,
        parent: sat.name,
        coneHalfAngleDeg: 20,
        fieldOfRegardDeg: 60,
      },
    ],
    schedule: [
      {
        taskId: "task-1",
        taskName: "task-1",
        platformName: sat.name,
        sensorName: `${sat.name} Sensor`,
        targetName: "T1",
        startUtc: epochIso(600),
        stopUtc: epochIso(700),
        slewTimeSeconds: 20,
      },
    ],
    sensorAccesses: [
      {
        platform: sat.name,
        sensor: `${sat.name} Sensor`,
        target: "T1",
        forWindows: [{ startUtc: epochIso(500), stopUtc: epochIso(800) }],
        fovWindows: [{ startUtc: epochIso(620), stopUtc: epochIso(680) }],
      },
    ],
    sun: {
      ephemeris: { tOffsetSec: [0], eciKm: [[1.5e8, 0, 0]] },
      eclipses: [{ satellite: sat.name, windows: [] }],
      groundLighting: [
        {
          name: "T1",
          daylightWindows: [{ startUtc: epochIso(0), stopUtc: epochIso(900) }],
        },
      ],
    },
  };

  // Fresh: schedule/sensor data authoritative, sun present.
  const fresh = buildRenderScenario(spec, raw);
  assert.equal(fresh.schedule.length, 1);
  assert.equal(fresh.schedule[0].stale, false);
  assert.equal(fresh.schedule[0].slewStartSec, 580);
  assert.equal(fresh.sensorAccesses[0].stale, false);
  assert.ok(fresh.sun);
  assert.equal(fresh.sun.groundLighting.length, 1);
  assert.equal(
    fresh.satellites.find((s) => s.name === sat.name).sensor.coneHalfAngleDeg,
    20,
  );
  assert.equal(fresh.dirty, false);

  // Editing the task list marks the schedule stale and the scenario dirty.
  const editedTasks = structuredClone(spec);
  editedTasks.tasks[0].priority = 9;
  const staleSchedule = buildRenderScenario(editedTasks, raw);
  assert.equal(staleSchedule.schedule[0].stale, true);
  assert.equal(staleSchedule.dirty, true);
  // Sensor accesses do not depend on tasks, so they stay fresh.
  assert.equal(staleSchedule.sensorAccesses[0].stale, false);

  // Editing the platform satellite stales its schedule + sensor accesses and
  // drops its eclipse data.
  const editedSat = structuredClone(spec);
  editedSat.objects.find((o) => o.name === sat.name).orbit.raanDeg += 1;
  const staleSat = buildRenderScenario(editedSat, raw);
  assert.equal(staleSat.schedule[0].stale, true);
  assert.equal(staleSat.sensorAccesses[0].stale, true);
  assert.equal(staleSat.sun.eclipses.length, 0);
  assert.equal(staleSat.sun.groundLighting.length, 1);

  // Deleting the target removes its schedule entries and access pairs.
  const deleted = structuredClone(spec);
  deleted.objects = deleted.objects.filter((o) => o.name !== "T1");
  deleted.tasks = [];
  const afterDelete = buildRenderScenario(deleted, raw);
  assert.equal(afterDelete.schedule.length, 0);
  assert.equal(afterDelete.sensorAccesses.length, 0);
});

test("deepEqual ignores key order but not values", () => {
  assert.ok(deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 2 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 1, c: 3 }));
});
