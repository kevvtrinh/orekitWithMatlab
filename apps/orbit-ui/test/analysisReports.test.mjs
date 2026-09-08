import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildReport, chartSegments, reportCsv } from "../src/lib/analysisReports.js";
import { buildRenderScenario } from "../src/lib/renderScenario.js";
import { groundStationTemplate, keplerianSatelliteTemplate, targetTemplate } from "../src/lib/spec.js";
import { lightingStateAt } from "../src/lib/sun.js";

// Deliberately different from the insertion orbit: these represent stored
// post-propagation samples, including a change after an impulsive maneuver.
function fixture() {
  const spec = {
    version: 1,
    rev: 0,
    meta: {
      name: "Report integrity",
      epochUtc: "2026-09-07T23:59:30Z",
      durationSeconds: 120,
      stepSeconds: 60,
    },
    objects: [keplerianSatelliteTemplate("Orbiter"), groundStationTemplate("Station"), targetTemplate("Target")],
    tasks: [],
  };
  const history = {
    satellite: "Orbiter",
    frame: "GCRF",
    tOffsetSec: [0, 60, 120],
    orbitalElements: {
      semiMajorAxisKm: [7100, 7200, 7300],
      eccentricity: [0.01, 0.02, 0.03],
      inclinationDeg: [52, 53, 54],
      raanDeg: [359, 1, 2],
      argPerigeeDeg: [70, 71, 72],
      trueAnomalyDeg: [350, 20, 60],
      periodMinutes: [99.2, 101.3, 103.4],
      apogeeAltKm: [792.863, 965.863, 1140.863],
      perigeeAltKm: [650.863, 677.863, 702.863],
      angleConvention: ["Classical", "Classical", "Classical"],
    },
    betaAngleDeg: [-12, 0, 20],
    errors: {},
  };
  const raw = {
    spec: structuredClone(spec),
    satellites: [{ name: "Orbiter", ephemeris: {
      tOffsetSec: [0, 60, 120],
      eciKm: [[7029, 0, 0], [7000, 300, 300], [6980, 600, 600]],
      llaDeg: [[0, 0, 650.863], [2, 2, 660], [4, 4, 670]],
    } }],
    analysis: { satellites: [history] },
    sun: {
      ephemeris: { tOffsetSec: [0, 60, 120], eciKm: [[1.5e8, 0, 0], [1.5e8, 1, 0], [1.5e8, 2, 0]] },
      eclipses: [{ satellite: "Orbiter", sunlitFractionPercent: 50, windows: [
        { type: "Umbra", startUtc: "2026-09-08T00:01:10Z", stopUtc: "2026-09-08T00:01:10Z", durationSeconds: 0 },
        { type: "Umbra", startUtc: "2026-09-07T23:59:50Z", stopUtc: "2026-09-08T00:00:50Z", durationSeconds: 60 },
        { type: "Penumbra", startUtc: "2026-09-07T23:59:30Z", stopUtc: "2026-09-07T23:59:40Z", durationSeconds: 10 },
      ] }],
      groundLighting: [],
    },
  };
  return { spec, raw, history };
}

function reportsFor(spec, raw) {
  const scenario = buildRenderScenario(spec, raw);
  return { scenario, elements: buildReport(scenario, "Orbiter", "elements"),
    beta: buildReport(scenario, "Orbiter", "beta"), lighting: buildReport(scenario, "Orbiter", "lighting") };
}

test("fresh reports display authoritative histories, rather than repeating insertion elements", () => {
  const { spec, raw } = fixture();
  const { scenario, elements, beta, lighting } = reportsFor(spec, raw);
  assert.equal(scenario.satellites[0].source, "matlab");
  assert.equal(scenario.satellites[0].elements.semiMajorAxisKm, 7000);
  assert.equal(elements.status, "ready");
  assert.deepEqual(elements.rows.map((row) => [row.tSec, row.semiMajorAxisKm, row.raanDeg]),
    [[0, 7100, 359], [60, 7200, 1], [120, 7300, 2]]);
  assert.equal(elements.frame, "GCRF");
  assert.deepEqual(beta.rows.map((row) => row.betaAngleDeg), [-12, 0, 20]);
  assert.equal(lighting.status, "ready");
  assert.deepEqual(lighting.rows.map((row) => row.startSec), [0, 20, 100]);
});

test("the bundled MATLAB scenario opens with fresh, aligned reports for both satellites", () => {
  // Read the delivered payload unchanged: replacing its spec or adding report
  // data here would hide a broken first-run experience in the actual app.
  const raw = JSON.parse(readFileSync(new URL("../public/sample-scenario.json", import.meta.url), "utf8"));
  assert.equal(raw.meta.generator, "matlab");
  assert.ok(raw.spec, "The sample must preserve the exact spec used by MATLAB");
  const scenario = buildRenderScenario(raw.spec, raw);
  assert.equal(scenario.dirty, false);
  assert.deepEqual(scenario.satellites.map((satellite) => satellite.name).sort(), ["ISS-Demo", "SSO-Imager"]);
  const expectedTimes = Array.from({ length: 361 }, (_, index) => index * 30);

  for (const satellite of scenario.satellites) {
    assert.equal(satellite.source, "matlab", satellite.name);
    const elements = buildReport(scenario, satellite.name, "elements");
    const beta = buildReport(scenario, satellite.name, "beta");
    const lighting = buildReport(scenario, satellite.name, "lighting");
    assert.deepEqual([elements.status, beta.status, lighting.status], ["ready", "ready", "ready"]);
    assert.equal(elements.frame, "GCRF");
    assert.equal(elements.rows.length, 361);
    assert.equal(beta.rows.length, 361);
    assert.deepEqual(elements.rows.map((row) => row.tSec), expectedTimes);
    assert.deepEqual(beta.rows.map((row) => row.tSec), expectedTimes);
    assert.deepEqual(Array.from(satellite.ephemeris.t), expectedTimes);

    for (const row of elements.rows) {
      for (const key of ["semiMajorAxisKm", "eccentricity", "inclinationDeg", "raanDeg", "argPerigeeDeg", "trueAnomalyDeg", "periodMinutes", "apogeeAltKm", "perigeeAltKm"]) {
        assert.ok(Number.isFinite(row[key]), `${satellite.name}: ${key} at ${row.tSec}s must be defined for these bound orbits`);
      }
      assert.ok(row.eccentricity >= 0 && row.eccentricity < 1);
      assert.ok(row.periodMinutes > 0);
      assert.ok(row.perigeeAltKm > 0);
      assert.equal(row.angleConvention, satellite.name === "SSO-Imager" ? "CircularInclined" : "Classical");
    }
    assert.ok(beta.rows.every((row) => Number.isFinite(row.betaAngleDeg) && Math.abs(row.betaAngleDeg) <= 90));

    const eclipse = scenario.sun.eclipses.find((entry) => entry.satellite === satellite.name);
    assert.ok(eclipse, `Missing lighting history for ${satellite.name}`);
    assert.equal(eclipse.lightingState.length, expectedTimes.length);
    assert.deepEqual(eclipse.tOffsetSec, expectedTimes);
    assert.ok(eclipse.lightingState.every((state) => ["Sunlit", "Penumbra", "Umbra"].includes(state)));
    assert.ok(lighting.rows.every((row) => Number.isFinite(row.durationSeconds) && row.durationSeconds === row.stopSec - row.startSec));
    // Exercise the same lookup the viewer uses against every exported sample.
    for (let index = 0; index < expectedTimes.length; index++) {
      assert.equal(lightingStateAt(scenario.sun, satellite.name, expectedTimes[index]), eclipse.lightingState[index]);
    }
  }
});

test("orbital edits invalidate every satellite report and prevent CSV export", () => {
  const { spec, raw } = fixture();
  spec.objects[0].orbit.semiMajorAxisKm += 100;
  const { scenario, elements, beta, lighting } = reportsFor(spec, raw);
  assert.equal(scenario.satellites[0].source, "preview");
  assert.equal(scenario.analysisReports[0].stale, true);
  for (const report of [elements, beta, lighting]) {
    assert.equal(report.status, "stale");
    assert.deepEqual(report.rows, []);
    assert.throws(() => reportCsv(report, scenario.epochMs), /current MATLAB/);
  }
});

test("epoch, duration, and sampling changes independently invalidate histories", async (t) => {
  for (const [key, value] of [
    ["epochUtc", "2026-09-08T00:00:00Z"], ["durationSeconds", 180], ["stepSeconds", 30],
  ]) {
    await t.test(key, () => {
      const { spec, raw } = fixture();
      spec.meta[key] = value;
      const { elements, beta, lighting } = reportsFor(spec, raw);
      assert.deepEqual([elements.status, beta.status, lighting.status], ["stale", "stale", "stale"]);
      for (const report of [elements, beta, lighting]) assert.deepEqual(report.rows, []);
    });
  }
});

test("unrelated ground and task edits leave the satellite reports authoritative", async (t) => {
  for (const edit of ["ground", "task"]) {
    await t.test(edit, () => {
      const { spec, raw } = fixture();
      if (edit === "ground") spec.objects[1].longitudeDeg += 10;
      else spec.tasks.push({ id: "new-task", satelliteName: "Orbiter", targetName: "Target", taskType: "TrackPointTarget", dwellSeconds: 30, priority: 5 });
      const { scenario, elements, beta, lighting } = reportsFor(spec, raw);
      assert.equal(scenario.dirty, true);
      assert.equal(scenario.satellites[0].source, "matlab");
      assert.deepEqual([elements.status, beta.status, lighting.status], ["ready", "ready", "ready"]);
      assert.equal(elements.rows[1].semiMajorAxisKm, 7200);
    });
  }
});

test("deleted satellites cannot retain reports from the previous run", () => {
  const { spec, raw } = fixture();
  spec.objects = spec.objects.filter((object) => object.name !== "Orbiter");
  const { scenario, elements, beta, lighting } = reportsFor(spec, raw);
  assert.deepEqual(scenario.analysisReports, []);
  assert.deepEqual(scenario.sun.eclipses, []);
  for (const report of [elements, beta, lighting]) {
    assert.equal(report.status, "missing");
    assert.deepEqual(report.rows, []);
  }
});

test("older backend payloads without analysis remain usable and do not invent reports", () => {
  const { spec, raw } = fixture();
  delete raw.analysis;
  const { scenario, elements, beta, lighting } = reportsFor(spec, raw);
  assert.equal(scenario.satellites[0].source, "matlab");
  assert.equal(elements.status, "missing");
  assert.equal(beta.status, "missing");
  assert.equal(lighting.status, "ready");
  assert.deepEqual(elements.rows, []);
  assert.deepEqual(beta.rows, []);
  assert.throws(() => reportCsv(elements, scenario.epochMs), /current MATLAB/);
});

test("scenarios without a backend result cannot export preview elements", () => {
  const { spec } = fixture();
  const { scenario, elements, beta, lighting } = reportsFor(spec, null);
  assert.equal(scenario.satellites[0].source, "preview");
  for (const report of [elements, beta, lighting]) {
    assert.equal(report.status, "stale");
    assert.deepEqual(report.rows, []);
    assert.throws(() => reportCsv(report, scenario.epochMs), /current MATLAB/);
  }
});

test("MATLAB singleton analysis structs and scalar sample columns normalize to one row", () => {
  const { spec, raw, history } = fixture();
  history.tOffsetSec = 60;
  history.betaAngleDeg = -12;
  for (const key of Object.keys(history.orbitalElements)) history.orbitalElements[key] = history.orbitalElements[key][1];
  raw.analysis.satellites = history;
  const { elements, beta } = reportsFor(spec, raw);
  assert.equal(elements.status, "ready");
  assert.equal(elements.rows.length, 1);
  assert.equal(elements.rows[0].tSec, 60);
  assert.equal(elements.rows[0].semiMajorAxisKm, 7200);
  assert.equal(elements.rows[0].angleConvention, "Classical");
  assert.deepEqual(beta.rows, [{ tSec: 60, betaAngleDeg: -12 }]);
});

test("singleton unbound trajectories preserve null period and apogee as blank cells", () => {
  const { spec, raw, history } = fixture();
  history.tOffsetSec = 60;
  history.betaAngleDeg = 0;
  for (const key of Object.keys(history.orbitalElements)) history.orbitalElements[key] = history.orbitalElements[key][1];
  Object.assign(history.orbitalElements, { semiMajorAxisKm: -12000, eccentricity: 1.5, periodMinutes: null, apogeeAltKm: null });
  raw.analysis.satellites = history;
  const { scenario, elements } = reportsFor(spec, raw);
  assert.equal(elements.status, "ready");
  assert.equal(elements.rows[0].periodMinutes, null);
  assert.equal(elements.rows[0].apogeeAltKm, null);
  assert.equal(elements.rows[0].semiMajorAxisKm, -12000);
  assert.match(reportCsv(elements, scenario.epochMs), /,-12000,1\.5,/);
  assert.doesNotMatch(reportCsv(elements, scenario.epochMs), /null|undefined|NaN/);
});

test("an omitted singleton element column is incomplete, while explicit null beta is a valid gap", () => {
  const { spec, raw, history } = fixture();
  history.tOffsetSec = 0;
  history.betaAngleDeg = null;
  for (const key of Object.keys(history.orbitalElements)) history.orbitalElements[key] = history.orbitalElements[key][0];
  delete history.orbitalElements.periodMinutes;
  raw.analysis.satellites = history;
  const { elements, beta } = reportsFor(spec, raw);
  assert.equal(elements.status, "error");
  assert.deepEqual(elements.rows, []);
  assert.equal(beta.status, "ready");
  assert.deepEqual(beta.rows, [{ tSec: 0, betaAngleDeg: null }]);
  assert.deepEqual(chartSegments(beta.rows, "betaAngleDeg"), []);
});

test("undefined or nonfinite samples remain gaps instead of becoming zero", () => {
  const { spec, raw, history } = fixture();
  history.orbitalElements.periodMinutes = [null, undefined, Infinity];
  history.orbitalElements.apogeeAltKm = [NaN, null, -Infinity];
  history.betaAngleDeg = [null, 0, undefined];
  const { scenario, elements, beta } = reportsFor(spec, raw);
  assert.equal(elements.status, "ready");
  assert.deepEqual(elements.rows.map((row) => row.periodMinutes), [null, null, null]);
  assert.deepEqual(elements.rows.map((row) => row.apogeeAltKm), [null, null, null]);
  assert.deepEqual(beta.rows.map((row) => row.betaAngleDeg), [null, 0, null]);
  assert.deepEqual(chartSegments(elements.rows, "periodMinutes"), []);
  assert.deepEqual(chartSegments(beta.rows, "betaAngleDeg"), [[{ tSec: 60, value: 0 }]]);
  assert.doesNotMatch(reportCsv(elements, scenario.epochMs), /null|undefined|NaN|Infinity/);
});

test("misaligned element, convention, and beta columns block only their affected report", async (t) => {
  for (const field of ["semiMajorAxisKm", "angleConvention", "betaAngleDeg"]) {
    await t.test(field, () => {
      const { spec, raw, history } = fixture();
      if (field === "betaAngleDeg") history.betaAngleDeg.pop();
      else history.orbitalElements[field].pop();
      const { scenario, elements, beta } = reportsFor(spec, raw);
      const invalid = field === "betaAngleDeg" ? beta : elements;
      const unaffected = field === "betaAngleDeg" ? elements : beta;
      assert.equal(invalid.status, "error");
      assert.deepEqual(invalid.rows, []);
      assert.throws(() => reportCsv(invalid, scenario.epochMs), /current MATLAB/);
      assert.equal(unaffected.status, "ready");
    });
  }
});

test("empty, descending, or nonnumeric time grids cannot be labeled authoritative reports", async (t) => {
  for (const times of [[], [0, 120, 60], [0, "60", 120], [0, NaN, 120], [0, Infinity, 120]]) {
    await t.test(String(times), () => {
      const { spec, raw, history } = fixture();
      history.tOffsetSec = times;
      const { elements, beta } = reportsFor(spec, raw);
      assert.equal(elements.status, "error");
      assert.equal(beta.status, "error");
      assert.deepEqual(elements.rows, []);
      assert.deepEqual(beta.rows, []);
    });
  }
});

test("the GCRF contract rejects other or missing reference frames", async (t) => {
  for (const frame of ["TEME", "ITRF", undefined]) {
    await t.test(String(frame), () => {
      const { spec, raw, history } = fixture();
      history.frame = frame;
      const { elements, beta } = reportsFor(spec, raw);
      assert.equal(elements.status, "error");
      assert.equal(beta.status, "error");
      assert.match(elements.message, /reference frame/);
      assert.deepEqual(elements.rows, []);
    });
  }
});

test("backend failures remain visible without concealing an independent successful report", () => {
  const { spec, raw, history } = fixture();
  history.errors.betaAngle = "Sun ephemeris unavailable";
  const { elements, beta } = reportsFor(spec, raw);
  assert.equal(elements.status, "ready");
  assert.equal(beta.status, "error");
  assert.equal(beta.message, "Sun ephemeris unavailable");
  assert.deepEqual(beta.rows, []);
});

test("sample filters include endpoints and never interpolate absent report samples", () => {
  const { spec, raw } = fixture();
  const scenario = buildRenderScenario(spec, raw);
  const instant = buildReport(scenario, "Orbiter", "elements", { startSec: 60, endSec: 60 });
  assert.equal(instant.status, "ready");
  assert.deepEqual(instant.rows.map((row) => row.tSec), [60]);
  assert.equal(instant.rows[0].semiMajorAxisKm, 7200);
  const gap = buildReport(scenario, "Orbiter", "beta", { startSec: 10, endSec: 50 });
  assert.equal(gap.status, "ready");
  assert.deepEqual(gap.rows, []);
  assert.match(gap.message, /No samples/);
});

test("report intervals must stay finite, ordered, and within the scenario", () => {
  const { spec, raw } = fixture();
  const scenario = buildRenderScenario(spec, raw);
  for (const [startSec, endSec] of [[-1, 60], [60, 59], [0, 121], [NaN, 60], [0, Infinity]]) {
    const report = buildReport(scenario, "Orbiter", "elements", { startSec, endSec });
    assert.equal(report.status, "error");
    assert.deepEqual(report.rows, []);
  }
});

test("lighting filters keep overlapping intervals in full and retain a single shadow sample", () => {
  const { spec, raw } = fixture();
  const scenario = buildRenderScenario(spec, raw);
  const overlap = buildReport(scenario, "Orbiter", "lighting", { startSec: 45, endSec: 60 });
  assert.equal(overlap.status, "ready");
  assert.deepEqual(overlap.rows, [{ tSec: 20, type: "Umbra", startSec: 20, stopSec: 80, durationSeconds: 60 }]);
  assert.ok(overlap.notes.some((note) => /not clipped/.test(note)));
  assert.ok(overlap.notes.some((note) => /sample fraction/.test(note)));
  const instant = buildReport(scenario, "Orbiter", "lighting", { startSec: 100, endSec: 100 });
  assert.deepEqual(instant.rows, [{ tSec: 100, type: "Umbra", startSec: 100, stopSec: 100, durationSeconds: 0 }]);
  const gap = buildReport(scenario, "Orbiter", "lighting", { startSec: 81, endSec: 99 });
  assert.equal(gap.status, "ready");
  assert.deepEqual(gap.rows, []);
});

test("MATLAB singleton eclipse windows survive the render adapter", () => {
  const { spec, raw } = fixture();
  raw.sun.eclipses[0].windows = raw.sun.eclipses[0].windows[0];
  raw.sun.eclipses = raw.sun.eclipses[0];
  const { lighting } = reportsFor(spec, raw);
  assert.equal(lighting.status, "ready");
  assert.deepEqual(lighting.rows, [{ tSec: 100, type: "Umbra", startSec: 100, stopSec: 100, durationSeconds: 0 }]);
});

test("viewer lighting holds the prior exported sample and switches exactly at the next sample", () => {
  const { spec, raw } = fixture();
  Object.assign(raw.sun.eclipses[0], {
    tOffsetSec: [0, 60, 120], lightingState: ["Umbra", "Penumbra", "Sunlit"],
  });
  const { sun } = buildRenderScenario(spec, raw);
  // Windows deliberately disagree at t=0 and t=60. Samples are the more
  // precise source for sampled viewer state; no crossing time is inferred.
  for (const [time, expected] of [[0, "Umbra"], [59.999, "Umbra"], [60, "Penumbra"], [119.999, "Penumbra"], [120, "Sunlit"]]) {
    assert.equal(lightingStateAt(sun, "Orbiter", time), expected, `lighting at ${time}s`);
  }
});

test("an all-Sunlit sample history is a known lighting result even without shadow intervals", () => {
  const { spec, raw } = fixture();
  Object.assign(raw.sun.eclipses[0], {
    tOffsetSec: [0, 60, 120], lightingState: ["Sunlit", "Sunlit", "Sunlit"], windows: [], sunlitFractionPercent: 100,
  });
  const { scenario, lighting } = reportsFor(spec, raw);
  for (const time of [0, 30, 60, 119.999, 120]) assert.equal(lightingStateAt(scenario.sun, "Orbiter", time), "Sunlit");
  assert.equal(lighting.status, "ready");
  assert.deepEqual(lighting.rows, []);
  assert.equal(lightingStateAt(scenario.sun, "Unknown satellite", 60), null);
});

test("invalid lighting histories fall back to legacy shadow windows as a whole", async (t) => {
  const malformed = [
    ["unequal lengths", [0, 60, 120], ["Sunlit", "Sunlit"]],
    ["descending times", [0, 120, 60], ["Sunlit", "Sunlit", "Sunlit"]],
    ["duplicate times", [0, 60, 60], ["Sunlit", "Sunlit", "Sunlit"]],
    ["numeric strings", [0, "60", 120], ["Sunlit", "Sunlit", "Sunlit"]],
    ["nonfinite time", [0, Infinity, 120], ["Sunlit", "Sunlit", "Sunlit"]],
    ["undefined time", [0, undefined, 120], ["Sunlit", "Sunlit", "Sunlit"]],
    ["unknown state", [0, 60, 120], ["Sunlit", "Unknown", "Sunlit"]],
    ["null state", [0, 60, 120], ["Sunlit", null, "Sunlit"]],
    ["empty history", [], []],
  ];
  for (const [name, times, states] of malformed) {
    await t.test(name, () => {
      const { spec, raw } = fixture();
      Object.assign(raw.sun.eclipses[0], { tOffsetSec: times, lightingState: states });
      const { sun } = buildRenderScenario(spec, raw);
      // These expect the complete legacy window history, including an early
      // sample whose own malformed-history element might appear valid.
      assert.equal(lightingStateAt(sun, "Orbiter", 0), "Penumbra");
      assert.equal(lightingStateAt(sun, "Orbiter", 60), "Umbra");
      assert.equal(lightingStateAt(sun, "Orbiter", 90), "Sunlit");
    });
  }
});

test("a scalar lighting sample applies at its instant and does not extrapolate outside coverage", () => {
  const { spec, raw } = fixture();
  Object.assign(raw.sun.eclipses[0], { tOffsetSec: 60, lightingState: "Penumbra" });
  const { sun } = buildRenderScenario(spec, raw);
  assert.equal(lightingStateAt(sun, "Orbiter", 60), "Penumbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 59.999), "Umbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 60.001), "Umbra");
});

test("legacy lighting windows retain inclusive boundaries and Umbra precedence", () => {
  const { spec, raw } = fixture();
  raw.sun.eclipses[0].windows.push({ type: "Penumbra", startUtc: "2026-09-07T23:59:40Z", stopUtc: "2026-09-08T00:01:00Z", durationSeconds: 80 });
  const { sun } = buildRenderScenario(spec, raw);
  assert.equal(lightingStateAt(sun, "Orbiter", 0), "Penumbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 20), "Umbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 80), "Umbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 80.001), "Penumbra");
  assert.equal(lightingStateAt(sun, "Orbiter", 90.001), "Sunlit");
  assert.equal(lightingStateAt(sun, "Orbiter", 100), "Umbra");
  assert.equal(lightingStateAt(null, "Orbiter", 60), null);
});

test("CSV exports UTC timestamps across midnight and preserves signed numeric beta values", () => {
  const { spec, raw } = fixture();
  const { scenario, beta } = reportsFor(spec, raw);
  assert.equal(reportCsv(beta, scenario.epochMs),
    "Time UTC,Offset (s),Solar beta angle (deg)\r\n" +
    "2026-09-07T23:59:30.000Z,0,-12\r\n" +
    "2026-09-08T00:00:30.000Z,60,0\r\n" +
    "2026-09-08T00:01:30.000Z,120,20\r\n");
  assert.throws(() => reportCsv(beta, NaN), /valid scenario epoch/);
});

test("CSV escapes quotes, commas and newlines and keeps imported formula text inert", () => {
  const report = {
    status: "ready",
    columns: [{ key: "note", label: "Convention", unit: "" }],
    rows: [
      { tSec: 0, note: 'Circular, "equatorial"\nTrue longitude' },
      { tSec: 0, note: '=HYPERLINK("https://example.test")' },
      { tSec: 0, note: " +1+2" },
      { tSec: 0, note: "@SUM(A1)" },
      { tSec: 0, note: "-1+2" },
      { tSec: 0, note: null },
    ],
  };
  assert.equal(reportCsv(report, 0),
    "Time UTC,Offset (s),Convention\r\n" +
    '1970-01-01T00:00:00.000Z,0,"Circular, ""equatorial""\nTrue longitude"\r\n' +
    '1970-01-01T00:00:00.000Z,0,"\'=HYPERLINK(""https://example.test"")"\r\n' +
    "1970-01-01T00:00:00.000Z,0,' +1+2\r\n" +
    "1970-01-01T00:00:00.000Z,0,'@SUM(A1)\r\n" +
    "1970-01-01T00:00:00.000Z,0,'-1+2\r\n" +
    "1970-01-01T00:00:00.000Z,0,\r\n");
});

test("charts break at missing samples and angle seams without losing endpoints or zero", () => {
  const rows = [
    { tSec: 0, angle: 350 }, { tSec: 1, angle: 359 },
    { tSec: 2, angle: 0 }, { tSec: 3, angle: 10 },
    { tSec: 4, angle: null }, { tSec: 5, angle: 20 },
    { tSec: NaN, angle: 30 }, { tSec: 7, angle: 30 },
    { tSec: 8, angle: undefined }, { tSec: 9, angle: Infinity },
    { tSec: 10, angle: 40 },
  ];
  assert.deepEqual(chartSegments(rows, "angle", { wrapDegrees: true }), [
    [{ tSec: 0, value: 350 }, { tSec: 1, value: 359 }],
    [{ tSec: 2, value: 0 }, { tSec: 3, value: 10 }],
    [{ tSec: 5, value: 20 }], [{ tSec: 7, value: 30 }], [{ tSec: 10, value: 40 }],
  ]);
  assert.equal(chartSegments(rows, "angle")[0].length, 4);
  assert.deepEqual(chartSegments([], "angle"), []);
});
