import * as THREE from "three";
import { satEciAt } from "./scenarioUtils.js";
import { gmstRad } from "./time.js";
import { configureSensorCamera, projectSensorPoint } from "../three/sensorFrame.js";
import { ringContains } from "./countryAreas.js";

const DEG = Math.PI / 180;
const WORLD_RADIUS_KM = 6371;
function worldPosition(satellite, t) {
  const p = satEciAt(satellite, t);
  return new THREE.Vector3(p[0], p[2], -p[1]).divideScalar(WORLD_RADIUS_KM);
}
export function planningCameraAt(satellite, t) {
  const position = worldPosition(satellite, t);
  const before = Math.max(satellite.ephemeris.t[0], t - 0.5);
  const after = Math.min(satellite.ephemeris.t.at(-1), t + 0.5);
  const velocity = worldPosition(satellite, after).sub(worldPosition(satellite, before));
  const camera = new THREE.PerspectiveCamera(60, 1, 1e-6, 1000);
  configureSensorCamera(camera, position, position.clone().normalize().negate(), velocity, 40, 1);
  return camera;
}
function groundPosition(lat, lon, altitude, epochMs, t) {
  const p = lat * DEG, l = (lon * DEG) + gmstRad(new Date(epochMs + t * 1000));
  const r = 1 + (altitude ?? 0) / (WORLD_RADIUS_KM * 1000);
  return new THREE.Vector3(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
}
function project(camera, point) {
  const value = projectSensorPoint(point, camera, 90, { clipViewport: false, clipFov: false });
  return value ? [value.azDeg, value.elDeg] : null;
}
function segmentDistance(point, a, b) {
  const dx = b[0]-a[0], dy = b[1]-a[1], lengthSquared = dx*dx+dy*dy;
  const fraction = lengthSquared ? Math.max(0, Math.min(1, ((point[0]-a[0])*dx+(point[1]-a[1])*dy)/lengthSquared)) : 0;
  return Math.hypot(point[0]-a[0]-fraction*dx, point[1]-a[1]-fraction*dy);
}
function simplifyOpen(points, tolerance) {
  if (points.length <= 2) return points;
  let index = -1, distance = 0;
  for (let i = 1; i < points.length-1; i++) {
    const candidate = segmentDistance(points[i], points[0], points.at(-1));
    if (candidate > distance) { distance = candidate; index = i; }
  }
  if (distance <= tolerance) return [points[0], points.at(-1)];
  const before = simplifyOpen(points.slice(0, index+1), tolerance);
  const after = simplifyOpen(points.slice(index), tolerance);
  return [...before.slice(0, -1), ...after];
}
function simplifyClosedRing(ring, tolerance = 0.3) {
  if (ring.length < 6) return ring;
  let split = 1, farthest = 0;
  for (let i = 1; i < ring.length-1; i++) {
    const distance = Math.hypot(ring[i][0]-ring[0][0], ring[i][1]-ring[0][1]);
    if (distance > farthest) { farthest = distance; split = i; }
  }
  const reordered = [...ring.slice(split, -1), ...ring.slice(0, split+1)];
  const closed = simplifyOpen(reordered, tolerance);
  if (closed.length >= 4) return closed;
  const longitude = ring.map((point) => point[0]), latitude = ring.map((point) => point[1]);
  const west = Math.min(...longitude), east = Math.max(...longitude);
  const south = Math.min(...latitude), north = Math.max(...latitude);
  return [[west, south], [east, south], [east, north], [west, north], [west, south]];
}
export function obstacleRings(area) {
  let rings = area.boundaryPolygons?.map((polygon) => polygon.outer);
  if (!rings) {
    const dy = area.heightKm / (2 * 111.32), dx = area.widthKm / (2 * 111.32 * Math.max(0.05, Math.cos(area.centerLatDeg * DEG)));
    const x = area.centerLonDeg, y = area.centerLatDeg;
    rings = [[[x-dx,y-dy],[x+dx,y-dy],[x+dx,y+dy],[x-dx,y+dy],[x-dx,y-dy]]];
  }
  // Natural Earth boundaries are retained in the scene. The planner gets a
  // bounded-complexity copy so a country outline can move through every time
  // slice without exhausting the bridge job limit.
  return rings.map((sourceRing) => {
    const ring = area.boundaryPolygons ? simplifyClosedRing(sourceRing) : sourceRing;
    const output = [];
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i], b = ring[i + 1];
      const count = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2));
      for (let j = 0; j < count; j++) output.push([a[0] + (b[0] - a[0]) * j / count, a[1] + (b[1] - a[1]) * j / count]);
    }
    output.push(output[0]); return output;
  });
}
function contextFor(scene, platform, from, to, obstacle) {
  const satellite = scene.satellites.find((item) => item.name === platform);
  let hash = 2166136261;
  for (const values of [satellite?.ephemeris?.t, satellite?.ephemeris?.eci]) {
    if (!values) continue;
    for (const byte of new Uint8Array(values.buffer, values.byteOffset, values.byteLength)) hash = Math.imul(hash ^ byte, 16777619);
  }
  return JSON.stringify({ epochMs: scene.epochMs, duration: scene.meta.durationSeconds,
    satellite: satellite?.spec, ephemerisHash: hash, source: satellite?.source,
    from: scene.groundPoints.find((item) => item.name === from)?.spec,
    to: scene.groundPoints.find((item) => item.name === to)?.spec,
    obstacle: scene.areaOutlines.find((item) => item.name === obstacle) });
}
export function makeSlewRequest(scene, { platform, from, to, obstacle, startSec, durationSec = 60, clearanceDeg = 1, accelerationDegS2 = 2 }) {
  const satellite = scene.satellites.find((item) => item.name === platform);
  const start = scene.groundPoints.find((item) => item.name === from);
  const goal = scene.groundPoints.find((item) => item.name === to);
  const area = scene.areaOutlines.find((item) => item.name === obstacle);
  if (!satellite?.sensor || !satellite.ephemeris || !start || !goal || !area) throw new Error("Select a propagated sensor, two ground objects, and a keep-out area.");
  if (from === to) throw new Error("Choose different start and destination objects.");
  if (!Number.isFinite(durationSec) || durationSec < 5 || durationSec > 180) throw new Error("Slew duration must be 5–180 seconds.");
  if (!Number.isFinite(startSec) || startSec < satellite.ephemeris.t[0] || startSec + durationSec > satellite.ephemeris.t.at(-1)) throw new Error("The entire slew must fit inside the satellite ephemeris. Move the timeline earlier or shorten the slew.");
  if (!Number.isFinite(clearanceDeg) || clearanceDeg < 0.1 || clearanceDeg > 15) throw new Error("Boresight clearance must be 0.1–15 degrees.");
  if (!Number.isFinite(accelerationDegS2) || accelerationDegS2 < 0.01 || accelerationDegS2 > 30) throw new Error("Axis acceleration must be 0.01–30 degrees/s².");
  const rings = obstacleRings(area);
  const count = Math.ceil(durationSec) + 1;
  if (rings.reduce((sum, ring) => sum + ring.length, 0) * count > 80000) throw new Error("This keep-out boundary is too large for the selected interval. Use a smaller area or shorter slew.");
  const time_s = Array.from({ length: count }, (_, i) => startSec + durationSec * i / (count - 1));
  const obstacles = rings.map((_, i) => ({ targetName: `${obstacle} / region ${i+1}`, time_s, slices: [] }));
  for (const t of time_s) {
    const camera = planningCameraAt(satellite, t);
    rings.forEach((ring, index) => {
      const points = ring.map(([lon, lat]) => project(camera, groundPosition(lat, lon, 0, scene.epochMs, t)));
      if (points.some((point) => !point)) throw new Error("The keep-out boundary crosses the Earth horizon during this interval. Choose a nearer area or shorter slew.");
      obstacles[index].slices.push({ az_deg: points.map((point) => point[0]), el_deg: points.map((point) => point[1]) });
    });
  }
  const endpoint = (object, t) => {
    const p = project(planningCameraAt(satellite, t), groundPosition(object.latitudeDeg, object.longitudeDeg, object.altitudeM, scene.epochMs, t));
    if (!p) throw new Error(`${object.name} is behind the Earth at its slew endpoint.`);
    return { time_s: t, position_deg: p, velocity_deg_s: [0, 0], acceleration_deg_s2: [0, 0] };
  };
  const axisLimit = Math.min(75, satellite.sensor.fieldOfRegardDeg / Math.sqrt(2));
  // ds² = cos(el)² daz² + del². This box bounds total boresight speed
  // by the sensor's scalar slew rate even when both axes move together.
  const rate = (satellite.sensor.slewRateDegPerSec ?? 2) / Math.sqrt(2);
  const initialState = endpoint(start, startSec), goalState = endpoint(goal, startSec + durationSec);
  if ([...initialState.position_deg, ...goalState.position_deg].some((v) => Math.abs(v) > axisLimit)) throw new Error("An endpoint lies outside the conservative planning bounds for this sensor's field of regard. Change the time, duration, or sensor limits.");
  return { version: 1, context: { platform, from, to, obstacle, epochMs: scene.epochMs, earthRadiusKm: WORLD_RADIUS_KM,
      frame: "Nadir reference; projected inertial velocity up", ephemerisSource: satellite.source,
      signature: contextFor(scene, platform, from, to, obstacle) },
    initialState, goalState, obstacles,
    limits: { azimuth_deg: [-axisLimit, axisLimit], elevation_deg: [-axisLimit, axisLimit], maxVelocity_deg_s: [rate, rate], maxAcceleration_deg_s2: [accelerationDegS2, accelerationDegS2], maxJerk_deg_s3: [4, 4] },
    options: { SampleTime_s: 0.05, GoalTimeMode: "fixedArrival", SafetyMargin_deg: clearanceDeg, AllowAzimuthWrapping: false } };
}
export function slewMatchesScene(request, scene) {
  const c = request?.context;
  if (!c || !scene) return false;
  return c.signature === contextFor(scene, c.platform, c.from, c.to, c.obstacle);
}
export function slewAnglesAt(result, t) {
  const times = result.time_s;
  if (t < times[0] || t > times.at(-1)) return null;
  let low = 0, high = times.length - 1;
  while (high - low > 1) { const middle = (low + high) >> 1; if (times[middle] <= t) low = middle; else high = middle; }
  const fraction = (t - times[low]) / (times[high] - times[low]);
  return result.position_deg[low].map((value, axis) => value + (result.position_deg[high][axis] - value) * fraction);
}
export function slewDirectionAt(satellite, result, t) {
  const angles = slewAnglesAt(result, t); if (!angles) return null;
  const [az, el] = angles.map((angle) => angle * DEG);
  return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az))
    .applyQuaternion(planningCameraAt(satellite, t).quaternion);
}
function edgeDistance(point, a, b) {
  const dx = b[0]-a[0], dy = b[1]-a[1];
  const fraction = Math.max(0, Math.min(1, ((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy || 1)));
  return Math.hypot(point[0]-a[0]-fraction*dx, point[1]-a[1]-fraction*dy);
}
export function validateSlewResult(request, result, scene) {
  if (!slewMatchesScene(request, scene)) throw new Error("The scenario changed after export. Replan against the current geometry.");
  if (result?.success !== true || result.exactCollisionValidated !== true) throw new Error(result?.message || "The planner did not return a collision-validated path.");
  const platform = scene.satellites.find((sat) => sat.name === request.context.platform);
  const canonical = makeSlewRequest(scene, { ...request.context, startSec: request.initialState?.time_s,
    durationSec: request.goalState?.time_s-request.initialState?.time_s, clearanceDeg: request.options?.SafetyMargin_deg });
  for (const key of ["initialState", "goalState"]) {
    if (!Array.isArray(request[key]?.position_deg) || request[key].position_deg.length !== 2 ||
        request[key].position_deg.some((v,axis)=>!Number.isFinite(v) || Math.abs(v-canonical[key].position_deg[axis])>1e-5)) throw new Error("The imported endpoints do not point at the selected ground objects.");
  }
  const rateBound = (platform.sensor.slewRateDegPerSec ?? 2)/Math.sqrt(2);
  const angleBound = Math.min(75, platform.sensor.fieldOfRegardDeg/Math.sqrt(2));
  for (const key of ["azimuth_deg","elevation_deg","maxVelocity_deg_s","maxAcceleration_deg_s2"]) {
    if (!Array.isArray(request.limits?.[key]) || request.limits[key].length !== 2 || !request.limits[key].every(Number.isFinite)) throw new Error("The imported request has invalid axis limits.");
  }
  if (request.limits.maxAcceleration_deg_s2.some((v)=>v<=0 || v>30)) throw new Error("The imported acceleration limits are invalid.");
  if (!Number.isFinite(request.options?.SafetyMargin_deg) || request.options.SafetyMargin_deg < 0.1 || request.options.SafetyMargin_deg > 15 ||
      request.limits?.maxVelocity_deg_s?.some((rate)=>!Number.isFinite(rate) || rate <= 0 || rate > rateBound+1e-8) ||
      [...request.limits.azimuth_deg,...request.limits.elevation_deg].some((angle)=>!Number.isFinite(angle) || Math.abs(angle)>angleBound+1e-8)) throw new Error("The imported request exceeds this sensor's planning limits. Export a fresh plan.");
  const times = result.time_s, positions = result.position_deg;
  if (!Array.isArray(times) || times.length < 2 || times.length > 20000 || !Array.isArray(positions) || positions.length !== times.length ||
      times.some((t, i) => !Number.isFinite(t) || (i && (t <= times[i-1] || t-times[i-1] > 0.051))) ||
      positions.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) throw new Error("The returned trajectory has invalid or insufficiently sampled coordinates.");
  if (Math.abs(times[0]-request.initialState.time_s)>1e-6 || Math.abs(times.at(-1)-request.goalState.time_s)>1e-6 ||
      positions[0].some((v,i)=>Math.abs(v-request.initialState.position_deg[i])>1e-5) || positions.at(-1).some((v,i)=>Math.abs(v-request.goalState.position_deg[i])>1e-5)) throw new Error("The returned path does not reach both requested endpoints at their specified times.");
  for (const [field, limits] of [["velocity_deg_s", request.limits.maxVelocity_deg_s], ["acceleration_deg_s2", request.limits.maxAcceleration_deg_s2]]) {
    const values = result[field];
    if (!Array.isArray(values) || values.length !== times.length || values.some((p) => !Array.isArray(p) || p.length !== 2 || p.some((v, axis) => !Number.isFinite(v) || Math.abs(v) > limits[axis]+1e-5))) throw new Error("The returned path violates the axis rate or acceleration limits.");
  }
  for (let i = 1; i < times.length; i++) {
    const dt = times[i]-times[i-1];
    if (positions[i].some((v, axis) => Math.abs(v-positions[i-1][axis])/dt > request.limits.maxVelocity_deg_s[axis]+1e-4) ||
        result.velocity_deg_s[i].some((v, axis) => Math.abs(v-result.velocity_deg_s[i-1][axis])/dt > request.limits.maxAcceleration_deg_s2[axis]+1e-4)) throw new Error("The returned trajectory samples violate the slew kinematics.");
  }
  const satellite = scene.satellites.find((sat) => sat.name === request.context.platform);
  const rings = obstacleRings(scene.areaOutlines.find((area) => area.name === request.context.obstacle));
  const groundTrace = [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i], p = positions[i], camera = planningCameraAt(satellite, t);
    if (p.some((v, axis) => v < request.limits[axis ? "elevation_deg" : "azimuth_deg"][0]-1e-6 || v > request.limits[axis ? "elevation_deg" : "azimuth_deg"][1]+1e-6)) throw new Error("The returned path leaves the sensor planning bounds.");
    for (const ring of rings) {
      const polygon = ring.map(([lon,lat]) => project(camera, groundPosition(lat,lon,0,scene.epochMs,t)));
      if (polygon.some((point)=>!point) || ringContains(polygon,p[0],p[1]) || polygon.slice(1).some((point,j)=>edgeDistance(p,polygon[j],point)<request.options.SafetyMargin_deg-1e-5)) throw new Error("The returned slew fails the moving Earth-region clearance check. Increase clearance or shorten the planning interval.");
    }
    const direction = slewDirectionAt(satellite,result,t);
    const hit = new THREE.Ray(camera.position,direction).intersectSphere(new THREE.Sphere(new THREE.Vector3(),1),new THREE.Vector3());
    if (hit) hit.applyAxisAngle(new THREE.Vector3(0,1,0),-gmstRad(new Date(scene.epochMs+t*1000))).multiplyScalar(1.004);
    groundTrace.push(hit ? hit.toArray() : null);
  }
  return { request, result, groundTrace };
}
