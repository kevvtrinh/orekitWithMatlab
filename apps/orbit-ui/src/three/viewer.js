import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { gmstRad, sunDirectionEci } from "../lib/time.js";
import { satEciAt, windowStateAt } from "../lib/scenarioUtils.js";
import { clock } from "../lib/clock.js";

// World scale: 1 scene unit = Earth radius (6371 km).
const EARTH_RADIUS_KM = 6371;
const KM = 1 / EARTH_RADIUS_KM;
const DEG = Math.PI / 180;

// ECI (right-handed, Z up) -> three.js (right-handed, Y up).
// A rotation by GMST about ECI +Z becomes rotation.y = gmst in three.js.
function eciToThree(x, y, z, target) {
  return target.set(x * KM, z * KM, -y * KM);
}

function latLonToVec3(latDeg, lonDeg, radius, target) {
  const lat = latDeg * DEG;
  const lon = lonDeg * DEG;
  const c = Math.cos(lat);
  // Earth-fixed frame in three coords (Greenwich along +X when rotation.y = 0).
  return target.set(
    radius * c * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * c * Math.sin(lon),
  );
}

function makeLabel(text, className) {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  const label = new CSS2DObject(el);
  label.center.set(-0.08, 1.2);
  return label;
}

// Fallback texture if the bundled earth image fails to load: dark ocean with
// a graticule so the globe is still readable.
function proceduralEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#0d2436");
  grad.addColorStop(0.5, "#123049");
  grad.addColorStop(1, "#0d2436");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = "rgba(140,170,190,0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo((i * 1024) / 12, 0);
    ctx.lineTo((i * 1024) / 12, 512);
    ctx.stroke();
  }
  for (let i = 0; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i * 512) / 6);
    ctx.lineTo(1024, (i * 512) / 6);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarfield() {
  const count = 1600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Random directions, pushed far out so panning never reaches them.
    const v = new THREE.Vector3().randomDirection().multiplyScalar(120);
    positions.set([v.x, v.y, v.z], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9aa4b5,
    size: 0.35,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  });
  return new THREE.Points(geometry, material);
}

export function createViewer(container, { onSelect } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "viewport-labels";
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090d);
  scene.add(makeStarfield());

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
  camera.position.set(2.6, 1.5, 2.4);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.55;
  controls.minDistance = 1.2;
  controls.maxDistance = 40;
  controls.zoomSpeed = 0.9;
  controls.enablePan = true;

  scene.add(new THREE.AmbientLight(0x30343c, 1.6));
  const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.4);
  scene.add(sunLight);

  // --- Earth (rotates with GMST; ground objects are children) ---
  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: proceduralEarthTexture(),
    specular: new THREE.Color(0x202830),
    shininess: 12,
  });
  new THREE.TextureLoader().load("/textures/earth_atmos_2048.jpg", (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMaterial.map = tex;
    earthMaterial.needsUpdate = true;
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), earthMaterial);
  earthGroup.add(earth);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.018, 64, 48),
    new THREE.MeshBasicMaterial({
      color: 0x5580a8,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  earthGroup.add(atmosphere);

  // --- Dynamic content, rebuilt on setScenario ---
  let scenarioContent = null; // { group, groundGroup, sats, stations, accessGroup }
  let options = { labels: true, groundTracks: true, accessLines: true };
  let selectedName = null;
  const pickables = [];

  function disposeObject(root) {
    root.traverse((obj) => {
      if (obj.isCSS2DObject) obj.element.remove();
      obj.geometry?.dispose?.();
      if (obj.material) {
        for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) {
          m.dispose?.();
        }
      }
    });
    root.parent?.remove(root);
  }

  function setScenario(data) {
    if (scenarioContent) {
      disposeObject(scenarioContent.group);
      disposeObject(scenarioContent.groundGroup);
      scenarioContent = null;
    }
    pickables.length = 0;
    if (!data) return;

    const group = new THREE.Group(); // inertial content
    scene.add(group);
    const groundGroup = new THREE.Group(); // earth-fixed content
    earthGroup.add(groundGroup);

    const sats = data.satellites.map((sat) => {
      const color = new THREE.Color(sat.color || "#d8b25a");

      // Orbit path from the ECI ephemeris.
      const positions = new Float32Array(sat.ephemeris.n * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < sat.ephemeris.n; i++) {
        eciToThree(
          sat.ephemeris.eci[i * 3],
          sat.ephemeris.eci[i * 3 + 1],
          sat.ephemeris.eci[i * 3 + 2],
          v,
        );
        positions.set([v.x, v.y, v.z], i * 3);
      }
      // Browser-preview orbits render dimmer than authoritative MATLAB ones.
      const baseOpacity = sat.source === "preview" ? 0.38 : 0.55;
      const pathGeometry = new THREE.BufferGeometry();
      pathGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const path = new THREE.Line(
        pathGeometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: baseOpacity }),
      );
      group.add(path);

      // Ground track (earth-fixed, slightly above the surface).
      const gtPositions = new Float32Array(sat.ephemeris.n * 3);
      for (let i = 0; i < sat.ephemeris.n; i++) {
        latLonToVec3(
          sat.ephemeris.lla[i * 3],
          sat.ephemeris.lla[i * 3 + 1],
          1.004,
          v,
        );
        gtPositions.set([v.x, v.y, v.z], i * 3);
      }
      const gtGeometry = new THREE.BufferGeometry();
      gtGeometry.setAttribute("position", new THREE.BufferAttribute(gtPositions, 3));
      const groundTrack = new THREE.Line(
        gtGeometry,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.28 }),
      );
      groundGroup.add(groundTrack);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 20, 14),
        new THREE.MeshBasicMaterial({ color }),
      );
      marker.userData.objectName = sat.name;
      group.add(marker);
      pickables.push(marker);

      const label = makeLabel(sat.name, "obj-label obj-label--sat");
      marker.add(label);

      return { data: sat, path, groundTrack, marker, label, color, baseOpacity };
    });

    const stations = data.groundPoints.map((gp) => {
      const color = new THREE.Color(gp.color || "#5aa0d8");
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.012),
        new THREE.MeshBasicMaterial({ color: 0xd9dee6 }),
      );
      latLonToVec3(gp.latitudeDeg, gp.longitudeDeg, 1.006, marker.position);
      marker.userData.objectName = gp.name;
      groundGroup.add(marker);
      pickables.push(marker);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.028, 32),
        new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        }),
      );
      ring.position.copy(marker.position);
      ring.lookAt(marker.position.clone().multiplyScalar(2));
      groundGroup.add(ring);

      const label = makeLabel(gp.name, "obj-label obj-label--gs");
      marker.add(label);

      return { data: gp, marker, ring, label };
    });

    // Access lines: one segment per access pair, shown only inside a window.
    const accessGeometry = new THREE.BufferGeometry();
    accessGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(data.accesses.length * 6), 3),
    );
    const accessLines = new THREE.LineSegments(
      accessGeometry,
      new THREE.LineBasicMaterial({ color: 0x5fc98f, transparent: true, opacity: 0.9 }),
    );
    accessLines.frustumCulled = false;
    group.add(accessLines);

    scenarioContent = { group, groundGroup, data, sats, stations, accessLines };
    applyOptions();
    applySelection();
  }

  function applyOptions() {
    if (!scenarioContent) return;
    for (const s of scenarioContent.sats) {
      s.groundTrack.visible = options.groundTracks;
    }
    scenarioContent.accessLines.visible = options.accessLines;
    // Label visibility is finalized per-frame (occlusion by the Earth).
  }

  // True when the unit-sphere Earth blocks the segment from the camera to
  // worldPos (r slightly below 1 so surface markers at the limb stay visible).
  const occlusionRay = new THREE.Vector3();
  function isOccludedByEarth(worldPos) {
    const cam = camera.position;
    occlusionRay.subVectors(worldPos, cam);
    const a = occlusionRay.lengthSq();
    const b = 2 * cam.dot(occlusionRay);
    const c = cam.lengthSq() - 0.9604; // r = 0.98
    const disc = b * b - 4 * a * c;
    if (disc <= 0) return false;
    const t = (-b - Math.sqrt(disc)) / (2 * a);
    return t > 0 && t < 1;
  }

  function applySelection() {
    if (!scenarioContent) return;
    for (const s of scenarioContent.sats) {
      const selected = s.data.name === selectedName;
      s.marker.scale.setScalar(selected ? 1.7 : 1);
      s.path.material.opacity = selected ? 1.0 : s.baseOpacity;
      s.label.element.classList.toggle("obj-label--selected", selected);
    }
    for (const st of scenarioContent.stations) {
      const selected = st.data.name === selectedName;
      st.marker.scale.setScalar(selected ? 1.6 : 1);
      st.label.element.classList.toggle("obj-label--selected", selected);
    }
  }

  // --- Picking ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downAt = null;
  labelRenderer.domElement.addEventListener("pointerdown", (e) => {
    downAt = [e.clientX, e.clientY];
  });
  labelRenderer.domElement.addEventListener("pointerup", (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
    downAt = null;
    if (moved > 4) return; // it was a drag, not a click
    const rect = labelRenderer.domElement.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    raycaster.params.Points = { threshold: 0.05 };
    const hits = raycaster.intersectObjects(pickables, false);
    if (hits.length > 0) {
      onSelect?.(hits[0].object.userData.objectName);
    }
  });

  // --- Frame loop ---
  const tmpVec = new THREE.Vector3();
  const tmpVec2 = new THREE.Vector3();
  const eciOut = [0, 0, 0];
  let lastWall = performance.now();
  let epochMs = 0;
  let raf = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - lastWall) / 1000, 0.25);
    lastWall = now;
    clock.tick(dt);

    const { tSec } = clock.getSnapshot();
    const date = new Date(epochMs + tSec * 1000);

    earthGroup.rotation.y = gmstRad(date);
    earthGroup.updateMatrixWorld();
    const sun = sunDirectionEci(date);
    sunLight.position.set(sun[0] * 50, sun[2] * 50, -sun[1] * 50);

    if (scenarioContent) {
      for (const s of scenarioContent.sats) {
        satEciAt(s.data, tSec, eciOut);
        eciToThree(eciOut[0], eciOut[1], eciOut[2], s.marker.position);
        s.label.visible = options.labels && !isOccludedByEarth(s.marker.position);
      }
      for (const st of scenarioContent.stations) {
        st.marker.getWorldPosition(tmpVec);
        st.label.visible = options.labels && !isOccludedByEarth(tmpVec);
      }
      const posAttr = scenarioContent.accessLines.geometry.getAttribute("position");
      scenarioContent.data.accesses.forEach((a, i) => {
        const { active } = windowStateAt(a.windows, tSec);
        const sat = scenarioContent.sats.find(
          (s) => s.data.name === a.source || s.data.name === a.target,
        );
        const st = scenarioContent.stations.find(
          (s) => s.data.name === a.source || s.data.name === a.target,
        );
        if (active && sat && st) {
          sat.marker.getWorldPosition(tmpVec);
          st.marker.getWorldPosition(tmpVec2);
          posAttr.setXYZ(i * 2, tmpVec.x, tmpVec.y, tmpVec.z);
          posAttr.setXYZ(i * 2 + 1, tmpVec2.x, tmpVec2.y, tmpVec2.z);
        } else {
          posAttr.setXYZ(i * 2, 0, 0, 0);
          posAttr.setXYZ(i * 2 + 1, 0, 0, 0);
        }
      });
      posAttr.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    setScenario(data) {
      epochMs = data?.epochMs ?? 0;
      setScenario(data);
    },
    setOptions(next) {
      options = { ...options, ...next };
      applyOptions();
    },
    setSelection(name) {
      selectedName = name;
      applySelection();
    },
    resetCamera() {
      controls.target.set(0, 0, 0);
      camera.position.set(2.6, 1.5, 2.4);
    },
    dispose() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      setScenario(null);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    },
  };
}
