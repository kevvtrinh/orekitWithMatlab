import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { countryPolygons, polygonContains, sampleCountryArea } from "../src/lib/countryAreas.js";
import { makeAreaGeometry } from "../src/three/areaGeometry.js";
import { defaultSpec } from "../server/scenarioStore.js";
import { validateSpec, removeTargetGroup, sensorTemplate } from "../src/lib/spec.js";
import { buildRenderScenario } from "../src/lib/renderScenario.js";
const catalog = JSON.parse(readFileSync(new URL("../public/geography/countries.json", import.meta.url)));
const country = (code) => catalog.countries.find((item) => item.code === code);

test("country catalog preserves valid shapefile parts, holes, and unique searchable codes", () => {
  assert.equal(catalog.countries.length, 242);
  assert.equal(new Set(catalog.countries.map((item) => item.code)).size, 242);
  for (const item of catalog.countries) for (const field of ["code", "name", "adminName", "continent"]) {
    assert.equal(item[field], item[field].trim());
    assert.ok(!/[\x00-\x1f]/.test(item[field]), `${item.code}: ${field} contains no DBF padding`);
  }
  assert.ok(country("USA")); assert.ok(country("FJI")); assert.ok(country("ATA"));
  const southAfrica = countryPolygons(country("ZAF"));
  assert.ok(southAfrica.some((polygon) => polygonContains(polygon, 18.42, -33.93)), "Cape Town is included");
  assert.ok(!southAfrica.some((polygon) => polygonContains(polygon, 28.2, -29.5)), "Lesotho enclave is excluded");
  assert.ok(countryPolygons(country("USA")).some((polygon) => polygonContains(polygon, -149.9, 61.22)), "Alaska is retained");
});

test("country targets preserve full boundaries and constrain sampling to their region", () => {
  for (const code of ["USA", "ZAF", "FJI", "ATA", "FRA"]) {
    const result = sampleCountryArea(country(code), { spacingKm: 1000, limit: 296 });
    assert.ok(result.targets.length > 0);
    for (const point of result.targets) assert.ok(result.area.boundaryPolygons.some((polygon) =>
      polygonContains(polygon, point.longitudeDeg, point.latitudeDeg)), `${code}: sample inside country`);
    const base = defaultSpec();
    const spec = { ...base, objects: [...base.objects, ...result.targets], areas: [result.area] };
    assert.deepEqual(validateSpec(spec), []);
    const removed = removeTargetGroup(spec, result.area.name);
    assert.deepEqual(removed.areas, []);
    assert.deepEqual(removed.objects, base.objects);
  }
  assert.throws(() => sampleCountryArea(country("USA"), { spacingKm: 10, limit: 10 }), /grid|points/i);
});

test("country fill is draped above Earth and does not fill an enclave", () => {
  const area = sampleCountryArea(country("ZAF"), { spacingKm: 1000, limit: 296 }).area;
  const { surface, boundaries } = makeAreaGeometry(area);
  assert.ok(boundaries.length > 1);
  const positions = surface.getAttribute("position");
  for (let i = 0; i < positions.count; i += 3) {
    const center = new THREE.Vector3();
    for (let j = 0; j < 3; j++) center.add(new THREE.Vector3().fromBufferAttribute(positions, i + j));
    assert.ok(center.divideScalar(3).length() > 1, "triangle does not cut through Earth");
  }
  const mesh = new THREE.Mesh(surface, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  mesh.updateMatrixWorld();
  const intersects = (lon, lat) => {
    const l = lon * Math.PI / 180, p = lat * Math.PI / 180;
    const radial = new THREE.Vector3(Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l));
    return new THREE.Raycaster(radial.clone().multiplyScalar(2), radial.clone().negate()).intersectObject(mesh).length > 0;
  };
  assert.ok(intersects(18.42, -33.93));
  assert.ok(!intersects(28.2, -29.5));
  surface.dispose(); mesh.material.dispose();
});

test("country scan results survive MATLAB singleton encoding and become stale when the boundary changes", () => {
  const sample = JSON.parse(readFileSync(new URL("../public/sample-scenario.json", import.meta.url)));
  const spec = defaultSpec();
  const platform = spec.objects.find((item) => item.kind === "satellite");
  platform.sensor = sensorTemplate();
  const result = sampleCountryArea(country("ZAF"), { spacingKm: 1000 });
  spec.objects.push(...result.targets);
  spec.areas = [result.area];
  spec.tasks = [{ id: "country-scan", taskType: "ScanAreaTarget", targetName: result.area.name, dwellSeconds: 60 }];
  const series = { platform: platform.name, sensor: `${platform.name} Sensor`, tOffsetSec: [0, 60],
    boresightEcef: [[1, 0, 0], [0, 1, 0]], phase: ["idle", "scan"], targetName: ["", result.area.name] };
  const raw = { ...sample, spec: structuredClone(spec), pointing: [series], schedule: [{
    platformName: platform.name, sensorName: series.sensor, targetName: result.area.name,
    startUtc: spec.meta.epochUtc, stopUtc: "2026-07-05T00:01:00Z", taskId: "country-scan",
  }] };
  raw.spec.areas = raw.spec.areas[0];
  for (const polygon of raw.spec.areas.boundaryPolygons) if (polygon.holes.length === 1) polygon.holes = polygon.holes[0];
  const fresh = buildRenderScenario(spec, raw);
  assert.equal(fresh.dirty, false);
  assert.equal(fresh.schedule.length, 1);
  assert.equal(fresh.schedule[0].stale, false);
  assert.deepEqual(fresh.pointing, [series]);
  const edited = structuredClone(spec);
  edited.areas[0].boundaryPolygons[0].outer[1][0] += 0.1;
  const stale = buildRenderScenario(edited, raw);
  assert.equal(stale.dirty, true);
  assert.equal(stale.schedule[0].stale, true);
  assert.deepEqual(stale.pointing, []);
});
