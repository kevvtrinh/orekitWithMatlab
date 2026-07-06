// Unit tests for the sensor-schedule and Sun/lighting helper layers.
import assert from "node:assert/strict";
import test from "node:test";

import {
  pointingStateAt,
  prepareSchedule,
  prepareSensorAccesses,
  scheduleForObject,
  scheduleForPlatform,
} from "../src/lib/schedule.js";
import {
  daylightAt,
  lightingStateAt,
  prepareSun,
  sunDirectionAt,
} from "../src/lib/sun.js";

const EPOCH_MS = Date.parse("2026-07-05T00:00:00Z");

const iso = (sec) => new Date(EPOCH_MS + sec * 1000).toISOString();

test("prepareSchedule converts to epoch offsets with slew lead-in", () => {
  const schedule = prepareSchedule(
    [
      {
        taskId: "task-2",
        taskName: "B",
        platformName: "Sat-1",
        sensorName: "Cam",
        targetName: "T2",
        startUtc: iso(2000),
        stopUtc: iso(2100),
        slewTimeSeconds: 40,
      },
      {
        taskId: "task-1",
        taskName: "A",
        platformName: "Sat-1",
        sensorName: "Cam",
        targetName: "T1",
        startUtc: iso(600),
        stopUtc: iso(720),
        slewTimeSeconds: 30,
      },
    ],
    EPOCH_MS,
  );
  // Sorted by start time regardless of input order.
  assert.equal(schedule[0].taskId, "task-1");
  assert.equal(schedule[0].startSec, 600);
  assert.equal(schedule[0].stopSec, 720);
  assert.equal(schedule[0].slewStartSec, 570);
  assert.equal(schedule[1].slewStartSec, 1960);
  // Return-home slew defaults to the lead-in slew duration.
  assert.equal(schedule[0].returnEndSec, 750);
  assert.equal(schedule[1].returnEndSec, 2140);
});

test("prepareSchedule prefers returnSlewTimeSeconds for the slew-out", () => {
  const [entry] = prepareSchedule(
    [
      {
        taskId: "task-1",
        platformName: "Sat-1",
        targetName: "T1",
        startUtc: iso(600),
        stopUtc: iso(720),
        slewTimeSeconds: 30,
        returnSlewTimeSeconds: 90,
      },
    ],
    EPOCH_MS,
  );
  assert.equal(entry.returnEndSec, 810);
});

test("pointingStateAt walks idle -> slew -> track -> return -> idle", () => {
  const entries = prepareSchedule(
    [
      {
        taskId: "t1",
        platformName: "Sat-1",
        targetName: "T1",
        startUtc: iso(600),
        stopUtc: iso(720),
        slewTimeSeconds: 30,
      },
      {
        taskId: "t2",
        platformName: "Sat-1",
        targetName: "T2",
        startUtc: iso(2000),
        stopUtc: iso(2100),
        slewTimeSeconds: 40,
      },
    ],
    EPOCH_MS,
  );

  assert.equal(pointingStateAt(entries, 100).phase, "idle");

  const slewing = pointingStateAt(entries, 585);
  assert.equal(slewing.phase, "slew");
  assert.equal(slewing.entry.targetName, "T1");
  assert.equal(slewing.fromTarget, null); // first task slews from nadir
  assert.ok(Math.abs(slewing.progress - 0.5) < 1e-9);

  const tracking = pointingStateAt(entries, 700);
  assert.equal(tracking.phase, "track");
  assert.equal(tracking.entry.targetName, "T1");
  // Still tracking at the very end of the window.
  assert.equal(pointingStateAt(entries, 720).phase, "track");

  // After stopSec the sensor slews home (nadir) instead of snapping: t1
  // stops at 720 with a 30 s return, so t=735 is halfway home.
  const returning = pointingStateAt(entries, 735);
  assert.equal(returning.phase, "return");
  assert.equal(returning.entry.targetName, "T1");
  assert.equal(returning.fromTarget, "T1");
  assert.ok(Math.abs(returning.progress - 0.5) < 1e-9);

  // Once the return finishes (t=750) the sensor is idle at home, so the
  // slew into task 2 starts from nadir, not from T1.
  assert.equal(pointingStateAt(entries, 1500).phase, "idle");
  const secondSlew = pointingStateAt(entries, 1980);
  assert.equal(secondSlew.phase, "slew");
  assert.equal(secondSlew.entry.targetName, "T2");
  assert.equal(secondSlew.fromTarget, null);

  // Idle again after task 2's return-home completes (2100 + 40 = 2140).
  assert.equal(pointingStateAt(entries, 2120).phase, "return");
  assert.equal(pointingStateAt(entries, 5000).phase, "idle");
  assert.equal(pointingStateAt([], 100).phase, "idle");
});

test("next task's slew lead-in wins over an unfinished return home", () => {
  const entries = prepareSchedule(
    [
      {
        taskId: "t1",
        platformName: "Sat-1",
        targetName: "T1",
        startUtc: iso(600),
        stopUtc: iso(720),
        slewTimeSeconds: 60,
      },
      {
        // Lead-in starts at 740, while t1 is still returning home (720-780).
        taskId: "t2",
        platformName: "Sat-1",
        targetName: "T2",
        startUtc: iso(800),
        stopUtc: iso(900),
        slewTimeSeconds: 60,
      },
    ],
    EPOCH_MS,
  );

  // Return home runs until the next lead-in takes over.
  assert.equal(pointingStateAt(entries, 730).phase, "return");
  const handoff = pointingStateAt(entries, 750);
  assert.equal(handoff.phase, "slew");
  assert.equal(handoff.entry.targetName, "T2");
  // The interrupted return means the slew starts from T1, not from nadir.
  assert.equal(handoff.fromTarget, "T1");
});

test("zero-length return slew goes straight back to idle", () => {
  const entries = prepareSchedule(
    [
      {
        taskId: "t1",
        platformName: "Sat-1",
        targetName: "T1",
        startUtc: iso(600),
        stopUtc: iso(720),
        slewTimeSeconds: 30,
        returnSlewTimeSeconds: 0,
      },
    ],
    EPOCH_MS,
  );
  assert.equal(pointingStateAt(entries, 720).phase, "track");
  assert.equal(pointingStateAt(entries, 720.001).phase, "idle");
});

test("prepareSensorAccesses converts both window sets", () => {
  const [pair] = prepareSensorAccesses(
    [
      {
        platform: "Sat-1",
        sensor: "Cam",
        target: "T1",
        forWindows: [
          { startUtc: iso(100), stopUtc: iso(400), durationSeconds: 300 },
        ],
        fovWindows: [
          { startUtc: iso(200), stopUtc: iso(260), durationSeconds: 60 },
        ],
      },
    ],
    EPOCH_MS,
  );
  assert.equal(pair.forWindows[0].startSec, 100);
  assert.equal(pair.fovWindows[0].stopSec, 260);
  // FOV windows are a subset of FOR windows by construction.
  assert.ok(pair.fovWindows[0].startSec >= pair.forWindows[0].startSec);
  assert.ok(pair.fovWindows[0].stopSec <= pair.forWindows[0].stopSec);
});

test("schedule filters by platform and by either endpoint", () => {
  const schedule = [
    { platformName: "Sat-1", targetName: "T1" },
    { platformName: "Sat-2", targetName: "T1" },
    { platformName: "Sat-2", targetName: "T2" },
  ];
  assert.equal(scheduleForPlatform(schedule, "Sat-2").length, 2);
  assert.equal(scheduleForObject(schedule, "T1").length, 2);
  assert.equal(scheduleForObject(schedule, "Sat-1").length, 1);
});

test("prepareSun + lighting/daylight/direction helpers", () => {
  const sun = prepareSun(
    {
      ephemeris: {
        tOffsetSec: [0, 600],
        eciKm: [
          [1.5e8, 0, 0],
          [0, 1.5e8, 0],
        ],
      },
      eclipses: [
        {
          satellite: "Sat-1",
          sunlitFractionPercent: 60,
          windows: [
            { type: "Penumbra", startUtc: iso(90), stopUtc: iso(110) },
            { type: "Umbra", startUtc: iso(100), stopUtc: iso(200) },
          ],
        },
      ],
      groundLighting: [
        {
          name: "GS-1",
          daylightWindows: [{ startUtc: iso(0), stopUtc: iso(300) }],
        },
      ],
    },
    EPOCH_MS,
  );

  assert.equal(lightingStateAt(sun, "Sat-1", 50), "Sunlit");
  assert.equal(lightingStateAt(sun, "Sat-1", 95), "Penumbra");
  assert.equal(lightingStateAt(sun, "Sat-1", 150), "Umbra");
  assert.equal(lightingStateAt(sun, "Nope", 150), null);

  assert.equal(daylightAt(sun, "GS-1", 100), true);
  assert.equal(daylightAt(sun, "GS-1", 400), false);
  assert.equal(daylightAt(sun, "Nope", 100), null);

  // Direction interpolates between samples and is unit length.
  const mid = sunDirectionAt(sun, 300);
  assert.ok(Math.abs(Math.hypot(...mid) - 1) < 1e-12);
  assert.ok(Math.abs(mid[0] - mid[1]) < 1e-12); // halfway between +X and +Y
  const start = sunDirectionAt(sun, 0);
  assert.ok(Math.abs(start[0] - 1) < 1e-12);
  assert.equal(sunDirectionAt(null, 0), null);
});
