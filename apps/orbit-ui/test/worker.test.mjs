// Tests for the warm-worker protocol helpers (server/workerProtocol.js):
// request construction, the matlab -batch worker command, and done.json
// parsing. Pure logic only — no MATLAB process is involved.
//   npm test   (node --test test/)
import assert from "node:assert/strict";
import test from "node:test";

import {
  JOB_KINDS,
  buildWorkerBatchCommand,
  makeRequest,
  parseDoneFile,
  quoteForMatlab,
} from "../server/workerProtocol.js";

test("makeRequest builds a scenario request with unique ids", () => {
  const a = makeRequest("scenario", {
    specFile: "C:\\data\\spec.json",
    outputFile: "C:\\data\\scenario.json",
  });
  const b = makeRequest("scenario", { specFile: "x", outputFile: "y" });
  assert.equal(a.kind, "scenario");
  assert.equal(a.specFile, "C:\\data\\spec.json");
  assert.equal(a.outputFile, "C:\\data\\scenario.json");
  assert.ok(a.id.length > 0);
  assert.notEqual(a.id, b.id);
});

test("makeRequest defaults optional files to null (ping/demo)", () => {
  const ping = makeRequest("ping");
  assert.equal(ping.specFile, null);
  assert.equal(ping.outputFile, null);
  const demo = makeRequest("demo", { outputFile: "out.json" });
  assert.equal(demo.specFile, null);
  assert.equal(demo.outputFile, "out.json");
});

test("makeRequest rejects unknown job kinds", () => {
  assert.throws(() => makeRequest("reboot"), /unknown worker job kind/i);
  for (const kind of JOB_KINDS) {
    assert.equal(makeRequest(kind).kind, kind);
  }
});

test("buildWorkerBatchCommand boots the suite then enters the loop", () => {
  const cmd = buildWorkerBatchCommand("C:\\repo\\data\\worker", 900);
  assert.equal(
    cmd,
    "startupOrekitSuite(); orbitUiWorker('C:\\repo\\data\\worker', 900);",
  );
});

test("buildWorkerBatchCommand escapes single quotes in the work dir", () => {
  const cmd = buildWorkerBatchCommand("C:\\it's here\\worker", 60);
  assert.match(cmd, /orbitUiWorker\('C:\\it''s here\\worker', 60\);/);
});

test("buildWorkerBatchCommand rejects a non-positive idle timeout", () => {
  assert.throws(() => buildWorkerBatchCommand("d", 0), /idle timeout/i);
  assert.throws(() => buildWorkerBatchCommand("d", "soon"), /idle timeout/i);
});

test("quoteForMatlab doubles single quotes", () => {
  assert.equal(quoteForMatlab("it's a 'test'"), "it''s a ''test''");
  assert.equal(quoteForMatlab("plain"), "plain");
});

test("parseDoneFile accepts a matching success payload", () => {
  const request = makeRequest("ping");
  const done = parseDoneFile(
    JSON.stringify({ id: request.id, ok: true, error: "" }),
    request,
  );
  assert.deepEqual(done, { ok: true, error: null });
});

test("parseDoneFile surfaces the MATLAB error text on failure", () => {
  const request = makeRequest("scenario", { specFile: "s", outputFile: "o" });
  const done = parseDoneFile(
    JSON.stringify({ id: request.id, ok: false, error: "Unknown job kind 'x'." }),
    request,
  );
  assert.equal(done.ok, false);
  assert.match(done.error, /unknown job kind/i);
});

test("parseDoneFile ignores stale done files from another request", () => {
  const request = makeRequest("ping");
  const stale = JSON.stringify({ id: "someone-else", ok: true, error: "" });
  assert.equal(parseDoneFile(stale, request), null);
});

test("parseDoneFile ignores half-written or invalid JSON", () => {
  const request = makeRequest("ping");
  assert.equal(parseDoneFile('{"id":"' + request.id + '","ok":tr', request), null);
  assert.equal(parseDoneFile("", request), null);
  assert.equal(parseDoneFile("null", request), null);
});

test("parseDoneFile treats non-boolean ok as failure", () => {
  const request = makeRequest("ping");
  const done = parseDoneFile(
    JSON.stringify({ id: request.id, ok: "yes", error: "" }),
    request,
  );
  assert.equal(done.ok, false);
});
