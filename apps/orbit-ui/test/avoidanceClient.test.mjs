import test from "node:test";
import assert from "node:assert/strict";
import { runAvoidanceRequest } from "../src/lib/avoidanceClient.js";

const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
test("each demo invocation exports a fresh request, polls its own job and imports only success", async () => {
  const calls = [], phases = [];
  let jobs = 0;
  const fetchImpl = async (url, init) => {
    calls.push([url, init]);
    if (init?.method === "POST") return response({ id: `run-${++jobs}`, state: "running" }, 202);
    return response({ id: `run-${jobs}`, state: "succeeded", result: { success: true } });
  };
  for (let i=0; i<2; i++) {
    const result = await runAvoidanceRequest({ version:1 }, { fetchImpl, wait: async()=>{}, onProgress:(phase)=>phases.push(phase) });
    assert.equal(result.id,`run-${i+1}`);
  }
  assert.equal(calls.filter(([,init])=>init.method === "POST").length,2);
  assert.deepEqual(calls.map(([url])=>url),["/api/avoidance/plan","/api/avoidance/plan/run-1","/api/avoidance/plan","/api/avoidance/plan/run-2"]);
  assert.deepEqual(phases,["exporting","planning","importing","exporting","planning","importing"]);
});
test("solver failure and bridge conflict never proceed to import", async () => {
  for (const reply of [response({error:"MATLAB already running"},409),response({id:"job",state:"failed",error:"No validated trajectory"})]) {
    const phases=[];
    await assert.rejects(runAvoidanceRequest({}, { fetchImpl:async()=>reply, onProgress:(phase)=>phases.push(phase) }),/running|trajectory/);
    assert.ok(!phases.includes("importing"));
  }
});
test("leaving a demo aborts polling before a late result can start playback", async () => {
  const controller=new AbortController(), phases=[];
  let calls=0;
  await assert.rejects(runAvoidanceRequest({}, { signal:controller.signal,
    fetchImpl:async()=>{calls++;return response({id:"job",state:"running"});},
    wait:async()=>controller.abort(), onProgress:(phase)=>phases.push(phase) }),{name:"AbortError"});
  assert.equal(calls,1); assert.ok(!phases.includes("importing"));
});
