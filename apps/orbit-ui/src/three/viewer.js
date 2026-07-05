import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { gmstRad, sunDirectionEci } from "../lib/time.js";
import { satEciAt, windowStateAt } from "../lib/scenarioUtils.js";
import { pointingStateAt, scheduleForPlatform } from "../lib/schedule.js";
import { lightingStateAt, sunDirectionAt } from "../lib/sun.js";
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

// Soft radial glow sprite for the Sun.
function sunSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,248,224,1)");
  grad.addColorStop(0.25, "rgba(255,236,170,0.85)");
  grad.addColorStop(0.6, "rgba(255,214,110,0.25)");
  grad.addColorStop(1, "rgba(255,200,80,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarfield() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // Random directions, pushed far out so panning never reaches them.
    v.randomDirection().multiplyScalar(120);
    positions.set([v.x, v.y, v.z], i * 3);
    // Mostly faint stars with a handful of bright standouts.
    const mag = Math.random();
    const brightness = mag > 0.96 ? 1.0 : 0.3 + 0.45 * mag * mag;
    const warmth = 0.92 + Math.random() * 0.08;
    colors.set([brightness * warmth, brightness * warmth, brightness], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

// STK-style Earth shading: sun-driven soft terminator, dimmed-but-readable
// night side, ocean-only specular, and a thin blue fresnel rim at the limb.
const EARTH_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const EARTH_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D dayMap;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 texel = texture2D(dayMap, vUv).rgb;

    float ndl = dot(normal, sunDir);
    float dayFactor = smoothstep(-0.14, 0.22, ndl);
    vec3 dayColor = texel * (0.3 + 1.0 * max(ndl, 0.0));
    // Night hemisphere: cooled and dimmed so surface detail stays readable.
    vec3 nightColor = texel * vec3(0.10, 0.13, 0.20);
    vec3 color = mix(nightColor, dayColor, dayFactor);

    // Specular restricted to blue-dominant texels so land stays matte.
    float ocean = smoothstep(0.02, 0.12, texel.b - max(texel.r, texel.g));
    vec3 halfDir = normalize(sunDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 40.0);
    color += vec3(0.5, 0.58, 0.62) * spec * ocean * dayFactor * 0.5;

    // Thin blue rim where the surface curves away toward the limb.
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
    color += vec3(0.24, 0.45, 0.8) * fresnel * (0.2 + 0.8 * dayFactor);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// Additive fresnel shell just outside the surface for the atmospheric glow.
const ATMOSPHERE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vWorldNormal;
  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 sunDir;
  varying vec3 vViewNormal;
  varying vec3 vWorldNormal;
  void main() {
    // Back-side shell: glow peaks at the occluded limb and fades outward.
    float rim = pow(0.55 - dot(normalize(vViewNormal), vec3(0.0, 0.0, 1.0)), 3.0);
    float lit = clamp(dot(normalize(vWorldNormal), sunDir) * 2.0 + 0.6, 0.12, 1.0);
    vec3 color = vec3(0.3, 0.55, 1.0) * rim * lit;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createViewer(container, { onSelect } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "viewport-labels";
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
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

  // Sun direction (world space, unit) drives the Earth/atmosphere shaders;
  // the shared Vector3 instance keeps both materials in sync.
  const sunDirWorld = new THREE.Vector3(1, 0, 0);

  // Visible Sun marker along the light direction (far out, past the stars).
  const sunSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: sunSpriteTexture(),
      transparent: true,
      depthWrite: false,
    }),
  );
  sunSprite.scale.setScalar(14);
  scene.add(sunSprite);

  // --- Earth (rotates with GMST; ground objects are children) ---
  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: proceduralEarthTexture() },
      sunDir: { value: sunDirWorld },
    },
    vertexShader: EARTH_VERTEX_SHADER,
    fragmentShader: EARTH_FRAGMENT_SHADER,
  });
  new THREE.TextureLoader().load("/textures/earth_atmos_2048.jpg", (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMaterial.uniforms.dayMap.value = tex;
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), earthMaterial);
  earthGroup.add(earth);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: sunDirWorld } },
      vertexShader: ATMOSPHERE_VERTEX_SHADER,
      fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  earthGroup.add(atmosphere);

  // --- Dynamic content, rebuilt on setScenario ---
  let scenarioContent = null; // { group, groundGroup, sats, stations, accessGroup }
  let options = {
    labels: true,
    groundTracks: true,
    accessLines: true,
    sensorFov: true,
    sensorFor: false,
    sun: true,
  };
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
      const baseOpacity = sat.source === "preview" ? 0.55 : 0.85;
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
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }),
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

      // Sensor visuals: instantaneous FOV cone, field-of-regard dome around
      // nadir, and a boresight line to the tracked target while a scheduled
      // task (or the slew into it) is in progress.
      let sensor = null;
      if (sat.sensor) {
        const fovGeometry = new THREE.ConeGeometry(1, 1, 48, 1, true);
        fovGeometry.translate(0, -0.5, 0); // apex at the satellite
        const fovCone = new THREE.Mesh(
          fovGeometry,
          new THREE.MeshBasicMaterial({
            color: 0x7fb4d8,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        fovCone.frustumCulled = false;
        group.add(fovCone);

        const forDeg = Math.min(sat.sensor.fieldOfRegardDeg ?? 60, 179);
        const forDome = new THREE.Mesh(
          new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, forDeg * DEG),
          new THREE.MeshBasicMaterial({
            color: 0xd8a75a,
            transparent: true,
            opacity: 0.09,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        forDome.frustumCulled = false;
        group.add(forDome);

        const trackGeometry = new THREE.BufferGeometry();
        trackGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(6), 3),
        );
        const trackLine = new THREE.Line(
          trackGeometry,
          new THREE.LineBasicMaterial({
            color: 0xe8a33d,
            transparent: true,
            opacity: 0.9,
          }),
        );
        trackLine.frustumCulled = false;
        group.add(trackLine);

        sensor = {
          fovCone,
          forDome,
          trackLine,
          halfAngleRad: (sat.sensor.coneHalfAngleDeg ?? 20) * DEG,
          entries: scheduleForPlatform(data.schedule, sat.name),
        };
      }

      return {
        data: sat,
        path,
        groundTrack,
        marker,
        label,
        color,
        baseOpacity,
        sensor,
      };
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

    const stationByName = new Map(stations.map((st) => [st.data.name, st]));
    const sensorAccessByKey = new Map(
      (data.sensorAccesses ?? []).map((a) => [`${a.platform}|${a.target}`, a]),
    );

    scenarioContent = {
      group,
      groundGroup,
      data,
      sats,
      stations,
      accessLines,
      stationByName,
      sensorAccessByKey,
    };
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

  // --- Sensor pointing / FOV / FOR ---
  const NEG_Y = new THREE.Vector3(0, -1, 0);
  const POS_Y = new THREE.Vector3(0, 1, 0);
  const tmpNadir = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpFrom = new THREE.Vector3();
  const tmpTo = new THREE.Vector3();
  const tmpTarget = new THREE.Vector3();
  const SENSOR_IDLE = 0x7fb4d8;
  const SENSOR_FOR_ONLY = 0xe8a33d; // reachable (FOR-valid), not in the beam
  const SENSOR_FOV_IN_VIEW = 0x5fc98f; // target inside the instantaneous FOV

  // Distance along unit direction `dir` from `origin` to the unit-sphere
  // Earth; NaN when the ray misses (beam pointing past the limb).
  function rayEarthDistance(origin, dir) {
    const b = origin.dot(dir);
    const disc = b * b - (origin.lengthSq() - 1);
    if (disc <= 0 || b >= 0) return NaN;
    return -b - Math.sqrt(disc);
  }

  function isFovActive(platformName, targetName, tSec) {
    const pair = scenarioContent.sensorAccessByKey.get(
      `${platformName}|${targetName}`,
    );
    return Boolean(pair && windowStateAt(pair.fovWindows, tSec).active);
  }

  function updateSensorViz(s, tSec) {
    const viz = s.sensor;
    const p = s.marker.position;
    const r = p.length();
    if (r <= 1.02) {
      viz.fovCone.visible = false;
      viz.forDome.visible = false;
      viz.trackLine.visible = false;
      return;
    }
    tmpNadir.copy(p).multiplyScalar(-1 / r);

    // Boresight: nadir when idle, the task target while tracking, and an
    // interpolated direction while slewing into a task.
    const pointing = pointingStateAt(viz.entries, tSec);
    const dir = tmpDir.copy(tmpNadir);
    let targetPos = null;
    if (pointing.phase !== "idle") {
      const st = scenarioContent.stationByName.get(pointing.entry.targetName);
      if (st) {
        targetPos = st.marker.getWorldPosition(tmpTarget);
        tmpTo.subVectors(targetPos, p).normalize();
        if (pointing.phase === "track") {
          dir.copy(tmpTo);
        } else {
          tmpFrom.copy(tmpNadir);
          const prev = pointing.fromTarget
            ? scenarioContent.stationByName.get(pointing.fromTarget)
            : null;
          if (prev) {
            prev.marker.getWorldPosition(tmpVec2);
            tmpFrom.subVectors(tmpVec2, p).normalize();
          }
          dir
            .lerpVectors(tmpFrom, tmpTo, Math.min(pointing.progress, 1))
            .normalize();
        }
      }
    }

    const tracking = pointing.phase !== "idle" && targetPos;
    const fovActive = tracking
      ? isFovActive(s.data.name, pointing.entry.targetName, tSec)
      : false;

    viz.fovCone.visible = options.sensorFov;
    if (options.sensorFov) {
      let length =
        pointing.phase === "track" && targetPos
          ? p.distanceTo(targetPos)
          : rayEarthDistance(p, dir);
      if (!Number.isFinite(length) || length <= 0) length = r;
      const radius = length * Math.tan(viz.halfAngleRad);
      viz.fovCone.position.copy(p);
      viz.fovCone.quaternion.setFromUnitVectors(NEG_Y, dir);
      viz.fovCone.scale.set(radius, length, radius);
      viz.fovCone.material.color.setHex(
        pointing.phase === "idle"
          ? SENSOR_IDLE
          : fovActive
            ? SENSOR_FOV_IN_VIEW
            : SENSOR_FOR_ONLY,
      );
    }

    viz.forDome.visible = options.sensorFor;
    if (options.sensorFor) {
      viz.forDome.position.copy(p);
      viz.forDome.quaternion.setFromUnitVectors(POS_Y, tmpNadir);
      viz.forDome.scale.setScalar(Math.max((r - 1) * 0.85, 0.02));
    }

    viz.trackLine.visible = Boolean(tracking);
    if (tracking) {
      const attr = viz.trackLine.geometry.getAttribute("position");
      attr.setXYZ(0, p.x, p.y, p.z);
      attr.setXYZ(1, targetPos.x, targetPos.y, targetPos.z);
      attr.needsUpdate = true;
      viz.trackLine.material.color.setHex(
        fovActive ? SENSOR_FOV_IN_VIEW : SENSOR_FOR_ONLY,
      );
      viz.trackLine.material.opacity = pointing.phase === "slew" ? 0.45 : 0.9;
    }
  }

  // --- Frame loop ---
  const tmpVec = new THREE.Vector3();
  const tmpVec2 = new THREE.Vector3();
  const eciOut = [0, 0, 0];
  const sunOut = [0, 0, 0];
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
    // Sun direction: MATLAB/Orekit ephemeris when the payload provides it,
    // otherwise the low-precision analytic formula.
    const sunData = scenarioContent?.data?.sun ?? null;
    const sun = sunDirectionAt(sunData, tSec, sunOut) ?? sunDirectionEci(date);
    sunDirWorld.set(sun[0], sun[2], -sun[1]).normalize();
    sunSprite.position.set(sun[0] * 100, sun[2] * 100, -sun[1] * 100);
    sunSprite.visible = options.sun;

    if (scenarioContent) {
      for (const s of scenarioContent.sats) {
        satEciAt(s.data, tSec, eciOut);
        eciToThree(eciOut[0], eciOut[1], eciOut[2], s.marker.position);
        s.label.visible = options.labels && !isOccludedByEarth(s.marker.position);
        // Eclipse shading: dim the marker while the satellite is shadowed.
        if (sunData) {
          const lighting = lightingStateAt(sunData, s.data.name, tSec);
          const dim =
            lighting === "Umbra" ? 0.3 : lighting === "Penumbra" ? 0.65 : 1;
          s.marker.material.color.copy(s.color).multiplyScalar(dim);
        }
        if (s.sensor) updateSensorViz(s, tSec);
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
