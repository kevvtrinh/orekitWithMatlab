// Tests for the bridge failure diagnosis (stale dev server / stale routes /
// offline detection) and the dev-scoped CORS gate on the Node bridge.
//   npm test   (node --test test/)
import assert from "node:assert/strict";
import test from "node:test";

import { BRIDGE_DIRECT_URL, classifyBridgeError } from "../src/lib/api.js";
import { isLocalOrigin } from "../server/cors.js";

// fetch stub: map of url -> status ("ok" | 404 | "down").
function fetchStub(routes) {
  return async (url) => {
    const behavior = routes[url];
    if (behavior === undefined || behavior === "down") {
      throw new TypeError("fetch failed");
    }
    if (behavior === "ok") return { ok: true, status: 200 };
    return { ok: false, status: behavior };
  };
}

function http404() {
  const err = new Error("HTTP 404");
  err.status = 404;
  return err;
}

function http500() {
  const err = new Error("HTTP 500");
  err.status = 500;
  return err;
}

test("404 with healthy same-origin bridge means stale routes, not MATLAB", async () => {
  const result = await classifyBridgeError(
    http404(),
    fetchStub({ "/api/health": "ok" }),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /running\s+old code/i);
  assert.match(result.message, /npm run dev/);
  assert.match(result.message, /did not fail/i);
});

test("404 with only the direct bridge alive means stale dev server", async () => {
  const result = await classifyBridgeError(
    http404(),
    fetchStub({
      "/api/health": 404,
      [`${BRIDGE_DIRECT_URL}/api/health`]: "ok",
    }),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /dev server/i);
  assert.match(result.message, /npm run dev/);
});

test("network failure with direct bridge alive means stale dev server", async () => {
  const result = await classifyBridgeError(
    new TypeError("fetch failed"),
    fetchStub({
      "/api/health": "down",
      [`${BRIDGE_DIRECT_URL}/api/health`]: "ok",
    }),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /dev server/i);
});

test("Vite proxy 500 with direct bridge alive means stale dev server", async () => {
  const result = await classifyBridgeError(
    http500(),
    fetchStub({
      "/api/health": 500,
      [`${BRIDGE_DIRECT_URL}/api/health`]: "ok",
    }),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /dev server/i);
  assert.match(result.message, /did not fail/i);
});

test("Vite proxy 500 with bridge down means bridge offline", async () => {
  const result = await classifyBridgeError(
    http500(),
    fetchStub({ "/api/health": 500 }),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /offline/i);
});

test("everything down means the web bridge is offline", async () => {
  const result = await classifyBridgeError(
    new TypeError("fetch failed"),
    fetchStub({}),
  );
  assert.equal(result.state, "unreachable");
  assert.match(result.message, /offline/i);
  assert.match(result.message, /npm run dev/);
  assert.match(result.message, /did not fail/i);
});

test("non-404 HTTP errors are real bridge answers and pass through", async () => {
  const err = new Error("Spec validation failed: bad epoch");
  err.status = 400;
  const result = await classifyBridgeError(err, fetchStub({}));
  assert.equal(result.state, "failed");
  assert.equal(result.message, "Spec validation failed: bad epoch");
});

test("HTTP 500 with healthy same-origin bridge passes through", async () => {
  const result = await classifyBridgeError(
    http500(),
    fetchStub({ "/api/health": "ok" }),
  );
  assert.equal(result.state, "failed");
  assert.equal(result.message, "HTTP 500");
});

test("network failure with same-origin health ok reports the original error", async () => {
  const result = await classifyBridgeError(
    new TypeError("fetch failed"),
    fetchStub({ "/api/health": "ok" }),
  );
  assert.equal(result.state, "failed");
  assert.equal(result.message, "fetch failed");
});

test("isLocalOrigin only admits local dev origins", () => {
  assert.ok(isLocalOrigin("http://localhost:5174"));
  assert.ok(isLocalOrigin("http://127.0.0.1:5174"));
  assert.ok(isLocalOrigin("http://localhost"));
  assert.ok(isLocalOrigin("https://localhost:8443"));
  assert.ok(!isLocalOrigin("http://example.com"));
  assert.ok(!isLocalOrigin("http://localhost.evil.com"));
  assert.ok(!isLocalOrigin("http://192.168.1.10:5174"));
  assert.ok(!isLocalOrigin(undefined));
  assert.ok(!isLocalOrigin(""));
});
