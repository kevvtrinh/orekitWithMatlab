import * as THREE from "three";
import { configureSensorCamera, projectSensorPoint } from "./sensorFrame.js";
import { polygonContains } from "../lib/countryAreas.js";

function surfacePoint(lat, lon, altitude = 0) {
  const p = lat * Math.PI / 180, l = lon * Math.PI / 180, r = 1 + altitude / 6371000;
  return new THREE.Vector3(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
}

function contains(area, lon, lat) {
  if (area.boundaryPolygons) return area.boundaryPolygons.some((polygon) => polygonContains(polygon, lon, lat));
  const longitudeDelta = ((lon - area.centerLonDeg + 540) % 360) - 180;
  return Math.abs(lat - area.centerLatDeg) <= area.heightKm / (2 * 111.32) &&
    Math.abs(longitudeDelta) <= area.widthKm / (2 * 111.32 * Math.max(0.05, Math.cos(area.centerLatDeg * Math.PI / 180)));
}

export function createSensorViewRenderer({ container, scene, getFrame, onChange, getMode }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute("aria-label", "View through the selected sensor");
  container.prepend(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.000001, 1000);
  let width = 1, height = 1, lastDraw = -Infinity, disposed = false;
  const resize = () => {
    width = Math.max(1, container.clientWidth); height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height);
    lastDraw = -Infinity;
  };
  const observer = new ResizeObserver(resize); observer.observe(container); resize();

  return {
    render(now) {
      // Share the scene clock; a second view must never advance mission time.
      if (disposed || now - lastDraw < 65) return;
      lastDraw = now;
      const frame = getFrame();
      if (!frame) { renderer.clear(); onChange({ unavailable: true, markers: [] }); return; }
      const { content, satellite, position, direction, velocity, halfAngleDeg, earthQuaternion } = frame;
      const display = configureSensorCamera(camera, position, direction, velocity, halfAngleDeg, width / height);
      const mode = getMode?.() ?? "camera";
      renderer.domElement.style.visibility = mode === "camera" ? "visible" : "hidden";
      const project = (point) => projectSensorPoint(point, camera, halfAngleDeg, { clipViewport: mode === "camera" });
      const markers = [];
      const traces = [];
      for (const station of content.stations) {
        const gp = station.data;
        if (gp.area) continue;
        const projection = project(surfacePoint(gp.latitudeDeg, gp.longitudeDeg, gp.altitudeM ?? 0).applyQuaternion(earthQuaternion));
        if (projection) markers.push({ ...projection, name: gp.name, kind: gp.kind === "target" ? "target" : "ground" });
      }
      const centerHit = new THREE.Ray(position, direction.clone().normalize())
        .intersectSphere(new THREE.Sphere(new THREE.Vector3(), 1), new THREE.Vector3());
      const earthHit = centerHit?.clone().applyQuaternion(earthQuaternion.clone().invert());
      const hitLat = earthHit ? Math.asin(earthHit.y) * 180 / Math.PI : 0;
      const hitLon = earthHit ? Math.atan2(-earthHit.z, earthHit.x) * 180 / Math.PI : 0;
      for (const entry of content.areaOutlines) {
        const area = entry.area;
        if (mode !== "camera") for (const boundary of entry.boundaries) {
          const points = [];
          for (let i = 0; i < boundary.length; i += 3) {
            const point = new THREE.Vector3(boundary[i], boundary[i + 1], boundary[i + 2]).normalize().applyQuaternion(earthQuaternion);
            points.push(projectSensorPoint(point, camera, halfAngleDeg, { clipViewport: false, clipFov: false }));
          }
          traces.push({ name: area.name, points });
        }
        let projection = project(surfacePoint(area.centerLatDeg, area.centerLonDeg).applyQuaternion(earthQuaternion));
        if (!projection && centerHit && contains(area, hitLon, hitLat)) projection = project(centerHit);
        if (!projection) {
          for (const boundary of entry.boundaries) {
            for (let i = 0; i < boundary.length; i += 3) {
              const point = new THREE.Vector3(boundary[i], boundary[i + 1], boundary[i + 2]).normalize().applyQuaternion(earthQuaternion);
              projection = project(point);
              if (projection) break;
            }
            if (projection) break;
          }
        }
        if (projection) markers.push({ ...projection, name: area.name, kind: "area" });
      }
      // Render only scene geography. Orbit paths, pictorial spacecraft, FOV
      // volumes, and main-view billboards must not obstruct the sensor camera.
      const hidden = [content.group, ...content.sats.map((satellite) => satellite.groundTrack),
        ...content.stations.flatMap((station) => [station.marker, station.ring]),
        ...scene.children.filter((child) => child.userData.orbitEditor)].filter(Boolean);
      const visibility = hidden.map((object) => object.visible);
      const lines = content.areaOutlines.flatMap((area) => area.lines);
      const resolutions = lines.map((line) => line.material.resolution.clone());
      try {
        hidden.forEach((object) => { object.visible = false; });
        lines.forEach((line) => line.material.resolution.set(width, height));
        if (mode === "camera") renderer.render(scene, camera);
      } finally {
        hidden.forEach((object, i) => { object.visible = visibility[i]; });
        lines.forEach((line, i) => line.material.resolution.copy(resolutions[i]));
      }
      onChange({ ...display, markers, traces, width, height, halfAngleDeg, phase: satellite.sensor.viewPhase,
        source: satellite.sensor.viewSource, tSec: frame.tSec, epochMs: frame.epochMs });
    },
    dispose() { if (disposed) return; disposed = true; observer.disconnect(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); },
  };
}
