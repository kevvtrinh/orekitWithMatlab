import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { avoidanceScene } from "./fixtures/avoidanceScene.mjs";
import { squareAvoidanceScene } from "./fixtures/squareAvoidanceScene.mjs";
import { makeSlewRequest, planningCameraAt, slewAnglesAt, slewDirectionAt, slewMatchesScene, validateSlewResult } from "../src/lib/slewPlanning.js";
import { validateAvoidanceRequest } from "../server/avoidanceJob.js";
import { ringContains } from "../src/lib/countryAreas.js";
import { readFileSync } from "node:fs";
const options = { platform: "Slew Demo", from: "West Target", to: "East Station", obstacle: "Vietnam keep-out", startSec: 0, durationSec: 30 };

test("Earth region export moves with the satellite and a direct slew crosses it", () => {
  const scene = avoidanceScene(), request = makeSlewRequest(scene, options);
  assert.equal(scene.areaOutlines[0].type, "country");
  assert.equal(scene.areaOutlines[0].countryCode, "VNM");
  assert.equal(scene.areaOutlines[0].boundaryPolygons.length, 8);
  assert.equal(request.obstacles[0].slices.length, 31);
  assert.ok(request.obstacles.reduce((count, obstacle) => count+obstacle.slices[0].az_deg.length, 0) < 100);
  assert.notDeepEqual(request.obstacles[0].slices[0], request.obstacles[0].slices.at(-1));
  let collisions = 0;
  request.obstacles.forEach((obstacle) => obstacle.slices.forEach((slice, i) => {
    const p = request.initialState.position_deg.map((a, axis) => a+(request.goalState.position_deg[axis]-a)*i/30);
    if (ringContains(slice.az_deg.map((az,j)=>[az,slice.el_deg[j]]),p[0],p[1])) collisions++;
  }));
  assert.ok(collisions > 0, "the demonstration must require an actual detour");
  assert.deepEqual(validateAvoidanceRequest(request).initialState, request.initialState);
  assert.ok(Math.hypot(...request.limits.maxVelocity_deg_s) <= 2+1e-12);
});
test("planner home frame and replay direction round trip across both angular axes", () => {
  const scene = avoidanceScene(), satellite = scene.satellites[0];
  const result = { time_s: [0, 30], position_deg: [[10, 5], [-10, -5]] };
  assert.deepEqual(slewAnglesAt(result, 15), [0,0]);
  assert.equal(slewAnglesAt(result, -1), null);
  for (const t of [0, 9, 30]) {
    const local = slewDirectionAt(satellite,result,t).applyQuaternion(planningCameraAt(satellite,t).quaternion.clone().invert());
    const az = THREE.MathUtils.radToDeg(Math.atan2(local.x,-local.z));
    const el = THREE.MathUtils.radToDeg(Math.atan2(local.y,Math.hypot(local.x,local.z)));
    const expected = slewAnglesAt(result,t);
    assert.ok(Math.abs(az-expected[0])<1e-10 && Math.abs(el-expected[1])<1e-10);
  }
});
test("changed ground geometry, ephemeris, or missing result context cannot replay a stale path", () => {
  const scene = avoidanceScene(), request = makeSlewRequest(scene, options);
  assert.equal(slewMatchesScene(request,scene),true);
  scene.satellites[0].ephemeris.eci[10] += 0.1;
  assert.equal(slewMatchesScene(request,scene),false);
  assert.equal(slewMatchesScene(undefined,scene),false);
  assert.throws(()=>validateSlewResult(request,{},scene),/scenario changed/i);
});
test("rejects hidden Earth obstacles, invalid time spans and unsafe bridge inputs", () => {
  const scene = avoidanceScene();
  assert.throws(()=>makeSlewRequest(scene,{...options,startSec:170}),/ephemeris/i);
  assert.throws(()=>makeSlewRequest(scene,{...options,to:options.from}),/different/i);
  const request = makeSlewRequest(scene,options);
  assert.throws(()=>validateAvoidanceRequest({...request,limits:{...request.limits,maxVelocity_deg_s:[-1,2]}}),/positive/);
  assert.throws(()=>validateAvoidanceRequest({...request,obstacles:[{...request.obstacles[0],time_s:[0,30]}]}),/times/);
  scene.areaOutlines[0].boundaryPolygons.forEach((polygon) => polygon.outer.forEach((point) => { point[0] -= 180; }));
  assert.throws(()=>makeSlewRequest(scene,options),/horizon/);
});

test("legacy MATLAB detour clears its original square Earth region and stays under the sensor rate", () => {
  const scene = squareAvoidanceScene();
  const request = makeSlewRequest(scene, { ...options, from: "South Target", to: "North Station" });
  const result = JSON.parse(readFileSync(new URL("fixtures/avoidancePlan.json",import.meta.url),"utf8"));
  const checked = validateSlewResult(request,result,scene);
  assert.equal(checked.groundTrace.length,601);
  assert.ok(checked.groundTrace.every(Boolean));
  assert.ok(Math.max(...result.velocity_deg_s.map((v,i)=>Math.hypot(v[0]*Math.cos(result.position_deg[i][1]*Math.PI/180),v[1]))) <= 2);
  const direct = { ...result, position_deg: result.time_s.map((t)=>request.initialState.position_deg.map((v,axis)=>v+(request.goalState.position_deg[axis]-v)*t/30)),
    velocity_deg_s: result.time_s.map(()=>[0,0]), acceleration_deg_s2: result.time_s.map(()=>[0,0]) };
  assert.throws(()=>validateSlewResult(request,direct,scene),/clearance/);
  const fast = structuredClone(result); fast.velocity_deg_s[1] = [3,3];
  assert.throws(()=>validateSlewResult(request,fast,scene),/rate/);
  const wrongTarget = structuredClone(request); wrongTarget.goalState.position_deg[0] += 1;
  assert.throws(()=>validateSlewResult(wrongTarget,result,scene),/endpoints/);
});

test("vendored bmtp-cleanup-codex result passes independent motion validation and the moving Earth check", () => {
  const scene=avoidanceScene(), request=makeSlewRequest(scene,options);
  const result=JSON.parse(readFileSync(new URL("fixtures/bmtpAvoidancePlan.json",import.meta.url),"utf8"));
  assert.equal(result.method,"AzElObsAvoid / BMTP");
  assert.equal(result.plannerRevision,"a28ae6425bf4e6e5ff6bde20050b1b3e51f35922");
  for (const key of ["Passed","CollisionFree","CollisionResolved","VelocityWithinLimits","AccelerationWithinLimits","JerkWithinLimits","TerminalStateMatched"]) assert.equal(result.validation[key],true,key);
  const checked=validateSlewResult(request,result,scene);
  assert.equal(checked.groundTrace.length,result.time_s.length); assert.ok(checked.groundTrace.every(Boolean));
  assert.equal(result.time_s.at(-1),30);
});
