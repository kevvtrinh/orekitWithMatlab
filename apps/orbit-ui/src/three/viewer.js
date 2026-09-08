import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { makeAreaGeometry } from "./areaGeometry.js";
import { createOrbitEditor } from "./orbitEditor.js";
import { createSensorViewRenderer } from "./sensorViewRenderer.js";
import { slewDirectionAt, slewMatchesScene } from "../lib/slewPlanning.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { gmstRad, sunDirectionEci } from "../lib/time.js";
import { satEciAt, windowStateAt } from "../lib/scenarioUtils.js";
import { pointingStateAt, scheduleForPlatform } from "../lib/schedule.js";
import { lightingStateAt, sunDirectionAt } from "../lib/sun.js";
import { clock } from "../lib/clock.js";
import { earthRotationSpeed, OVERVIEW_ROTATE_SPEED } from "./cameraNavigation.js";
import { buildOrbitFramePositions } from "./orbitFrames.js";
import { createSatelliteModel } from "./satelliteModel.js";
import { orientSatelliteBody } from "./satelliteAttitude.js";
import {
  fovLengthToEarth,
  makeForFootprintGeometry,
  makeFovConeGeometry,
  orientBoresight,
} from "./sensorGeometry.js";

// World scale: 1 scene unit = Earth radius (6371 km).
const EARTH_RADIUS_KM = 6371;
const KM = 1 / EARTH_RADIUS_KM;
const DEG = Math.PI / 180;
const FOR_SURFACE_RADIUS = 1.006;
const FOR_RADIUS_UPDATE_EPS = 0.001;
const FOV_EARTH_OVERSHOOT = 0.03;
// Deliberately pictorial: the close-view glyph is not a physical bus-size
// model. Its maximum extent stays well below the satellite's Earth clearance.
const SATELLITE_DISPLAY_SCALE = 0.0025;
const SATELLITE_MODEL_SPAN = 6.2;
const SATELLITE_DETAIL_FADE_PX = 12;
const SATELLITE_DETAIL_FULL_PX = 30;
const SATELLITE_FOCUS_DISTANCE = 15;

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

function groundDishTexture() {
  // A compact antenna silhouette, not a volume-scaled white site block.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const stroke = () => {
    ctx.strokeStyle = "#10202d";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = "#dce7ec";
    ctx.lineWidth = 2.2;
    ctx.stroke();
  };
  ctx.beginPath();
  ctx.moveTo(30, 32);
  ctx.lineTo(30, 51);
  ctx.moveTo(21, 55);
  ctx.lineTo(30, 44);
  ctx.lineTo(39, 55);
  ctx.moveTo(16, 56);
  ctx.lineTo(45, 56);
  stroke();
  ctx.beginPath();
  ctx.moveTo(9, 20);
  ctx.quadraticCurveTo(21, 51, 49, 16);
  ctx.quadraticCurveTo(27, 31, 9, 20);
  ctx.fillStyle = "#8c9da8";
  ctx.fill();
  stroke();
  ctx.beginPath();
  ctx.moveTo(29, 30);
  ctx.lineTo(39, 9);
  ctx.lineTo(45, 10);
  stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function satelliteIconTexture() {
  // A screen-sized overview glyph. Keeping the transparent silhouette in a
  // square texture lets the marker retain a recognizable spacecraft shape
  // without growing into a world-scaled sphere in low-altitude views.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = "#dceaff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.fillRect(9, 43, 38, 42);
  ctx.strokeRect(9, 43, 38, 42);
  ctx.fillRect(81, 43, 38, 42);
  ctx.strokeRect(81, 43, 38, 42);
  ctx.lineWidth = 3;
  for (const x of [21, 34, 94, 107]) {
    ctx.beginPath(); ctx.moveTo(x, 45); ctx.lineTo(x, 83); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(11, 64); ctx.lineTo(45, 64); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(83, 64); ctx.lineTo(117, 64); ctx.stroke();
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(45, 64); ctx.lineTo(53, 64); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(75, 64); ctx.lineTo(83, 64); ctx.stroke();
  ctx.fillStyle = "#fff1c8";
  ctx.lineWidth = 5;
  ctx.fillRect(51, 35, 26, 58);
  ctx.strokeRect(51, 35, 26, 58);
  ctx.beginPath();
  ctx.moveTo(58, 35); ctx.lineTo(64, 25); ctx.lineTo(70, 35); ctx.stroke();
  ctx.beginPath();
  ctx.arc(64, 97, 9, Math.PI, 0); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarfield() {
  const count = 700;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // Random directions, pushed far out so panning never reaches them.
    v.randomDirection().multiplyScalar(120);
    positions.set([v.x, v.y, v.z], i * 3);
    // Mostly faint stars with a handful of bright standouts.
    const mag = Math.random();
    const brightness = mag > 0.98 ? 0.85 : 0.18 + 0.32 * mag * mag;
    const warmth = 0.92 + Math.random() * 0.08;
    colors.set([brightness * warmth, brightness * warmth, brightness], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
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
    // Keep a faint night silhouette without making unlit terrain luminous.
    vec3 nightColor = texel * vec3(0.025, 0.0325, 0.05);
    vec3 color = mix(nightColor, dayColor, dayFactor);

    // Specular restricted to blue-dominant texels so land stays matte.
    float ocean = smoothstep(0.02, 0.12, texel.b - max(texel.r, texel.g));
    vec3 halfDir = normalize(sunDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 40.0);
    color += vec3(0.5, 0.58, 0.62) * spec * ocean * dayFactor * 0.5;

    // Retain the daylight rim, with only a trace along the unlit silhouette.
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
    color += vec3(0.24, 0.45, 0.8) * fresnel * (0.03 + 0.97 * dayFactor);

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
    float lit = clamp(dot(normalize(vWorldNormal), sunDir) * 2.0 + 0.6, 0.018, 1.0);
    vec3 color = vec3(0.3, 0.55, 1.0) * rim * lit;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createViewer(container, { onSelect, onFocusChange, onOrbitEditChange, onOrbitCommit, onSlewPlanChange, onReferenceFrameChange } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "viewport-labels";
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a12);
  scene.add(makeStarfield());
  // Standard materials are used only by the pictorial spacecraft; Earth
  // retains its own Sun-driven shader and existing day/night coefficients.
  scene.add(new THREE.HemisphereLight(0xdce9ff, 0x2b3541, 1.15));
  const spacecraftSun = new THREE.DirectionalLight(0xfff2da, 3.2);
  scene.add(spacecraftSun);
  const stationIconTexture = groundDishTexture();
  const satelliteMarkerTexture = satelliteIconTexture();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
  camera.position.set(2.6, 1.5, 2.4);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = OVERVIEW_ROTATE_SPEED;
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
  const applyEarthTexture = (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    earthMaterial.uniforms.dayMap.value = tex;
  };
  new THREE.TextureLoader().load("/textures/earth_daymap_8k.png", applyEarthTexture,
    undefined, () => new THREE.TextureLoader().load("/textures/earth_atmos_2048.jpg", applyEarthTexture));
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
  let sensorView = null;
  let slewPlan = null, slewTrace = null, replayEnd = null;
  function clearSlewPlan() {
    if (slewTrace) disposeObject(slewTrace);
    slewTrace = null; slewPlan = null; replayEnd = null;
    onSlewPlanChange?.(null);
    applySelection();
  }
  function setSlewPlan(plan) {
    clearSlewPlan(); slewPlan = plan;
    const vertices = [];
    for (let i = 1; i < plan.groundTrace.length; i++) {
      if (plan.groundTrace[i-1] && plan.groundTrace[i]) vertices.push(...plan.groundTrace[i-1], ...plan.groundTrace[i]);
    }
    slewTrace = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)),
      new THREE.LineBasicMaterial({ color: 0x87e6bd, transparent: true, opacity: 0.95 }));
    earthGroup.add(slewTrace); applySelection();
    onSlewPlanChange?.(plan.request.context);
    clock.setPlaying(false); clock.setTime(plan.request.initialState.time_s);
  }
  let options = {
    referenceFrame: "ECI",
    labels: true,
    groundTracks: true,
    accessLines: true,
    sensorFov: true,
    sensorFor: false,
    sun: true,
  };
  let selectedName = null;
  let focusedSatelliteName = null;
  const lastFocusPosition = new THREE.Vector3();
  const focusDelta = new THREE.Vector3();
  const focusRadial = new THREE.Vector3();
  const focusSide = new THREE.Vector3();
  const pickables = [];
  const orbitEditor = createOrbitEditor({ scene, camera, controls, element: labelRenderer.domElement,
    onChange: onOrbitEditChange, onCommit: onOrbitCommit, isOccluded: isOccludedByEarth });

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
    if (slewPlan && (!data || !slewMatchesScene(slewPlan.request, data))) clearSlewPlan();
    if (scenarioContent) {
      for (const satellite of scenarioContent.sats) {
        // The attached geometry is disposed with its scene parent below.
        for (const geometry of Object.values(satellite.pathGeometries)) {
          if (geometry !== satellite.path.geometry) geometry.dispose();
        }
      }
      disposeObject(scenarioContent.group);
      disposeObject(scenarioContent.groundGroup);
      scenarioContent = null;
    }
    pickables.length = 0;
    if (!data) {
      resetCamera();
      return;
    }

    const group = new THREE.Group(); // inertial content
    scene.add(group);
    const groundGroup = new THREE.Group(); // earth-fixed content
    earthGroup.add(groundGroup);

    const sats = data.satellites.map((sat) => {
      const color = new THREE.Color(sat.color || "#d8b25a");

      const framePositions = buildOrbitFramePositions(sat.ephemeris, data.epochMs);
      const pathGeometries = Object.fromEntries(Object.entries(framePositions).map(([frame, positions]) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();
        return [frame, geometry];
      }));
      const v = new THREE.Vector3();
      // Browser-preview orbits render dimmer than authoritative MATLAB ones.
      const baseOpacity = sat.source === "preview" ? 0.55 : 0.85;
      const path = new THREE.Line(
        pathGeometries.ECI,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: baseOpacity }),
      );
      group.add(path);
      path.userData.objectName = sat.name;
      path.userData.orbitPath = true;
      pickables.push(path);

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

      const marker = new THREE.Sprite(new THREE.SpriteMaterial({
        map: satelliteMarkerTexture,
        color,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: false,
      }));
      marker.userData.objectName = sat.name;
      group.add(marker);
      pickables.push(marker);

      const label = makeLabel(sat.name, "obj-label obj-label--sat");
      const labelAnchor = new THREE.Group();
      group.add(labelAnchor);
      labelAnchor.add(label);

      // Sensor visuals: instantaneous FOV cone, field-of-regard footprint
      // down to Earth, and a boresight line to the tracked target while a
      // scheduled task (or the slew into it) is in progress. Both volumes are
      // authored apex-at-origin along +Y (see sensorGeometry.js) so they
      // always sit on the same boresight side of the satellite.
      let sensor = null;
      if (sat.sensor) {
        const fovCone = new THREE.Mesh(
          makeFovConeGeometry(),
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

        const forHalfAngleDeg = sat.sensor.fieldOfRegardDeg ?? 60;
        const forDome = new THREE.Mesh(
          makeForFootprintGeometry(forHalfAngleDeg, 1.1, FOR_SURFACE_RADIUS),
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
          forHalfAngleDeg,
          forRadius: null,
          entries: scheduleForPlatform(data.schedule, sat.name),
          pointingSeries: (data.pointing ?? []).find((entry) =>
            entry.platform === sat.name && (!sat.sensor.name || entry.sensor === sat.sensor.name)),
        };
      }

      return {
        data: sat,
        path,
        pathGeometries,
        groundTrack,
        marker,
        label,
        labelAnchor,
        detail: null,
        detailWeight: 0,
        displayScale: SATELLITE_DISPLAY_SCALE,
        color,
        baseOpacity,
        sensor,
      };
    });

    const stations = data.groundPoints.map((gp) => {
      const color = new THREE.Color(gp.color || "#5aa0d8");
      // Area grid points render as small unlabeled dots; the parent area's
      // outline and label (below) identify them. Standalone ground points
      // keep the full-size marker + ring + label treatment.
      const isAreaPoint = Boolean(gp.area);
      const isDish = !isAreaPoint && (gp.kind === "groundStation" || gp.type === "GroundStation");
      const marker = isDish
        ? new THREE.Sprite(new THREE.SpriteMaterial({
          map: stationIconTexture, transparent: true, depthWrite: false, sizeAttenuation: false,
        }))
        : new THREE.Mesh(
          new THREE.OctahedronGeometry(isAreaPoint ? 0.004 : 0.012),
          new THREE.MeshBasicMaterial({ color: isAreaPoint ? color : 0xd9dee6 }),
        );
      latLonToVec3(gp.latitudeDeg, gp.longitudeDeg, 1.0007 + (gp.altitudeM ?? 0) / 6371000, marker.position);
      marker.userData.objectName = gp.name;
      if (isAreaPoint) marker.visible = Boolean(options.areaGrid);
      groundGroup.add(marker);
      pickables.push(marker);

      let ring = null;
      let label = null;
      if (!isAreaPoint && !isDish) {
        ring = new THREE.Mesh(
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

      }
      if (!isAreaPoint) {
        label = makeLabel(gp.name, "obj-label obj-label--gs");
        marker.add(label);
      }

      return { data: gp, marker, ring, label, isDish };
    });

    // Area target outlines: one subtle ring per area, draped just above the
    // surface to avoid z-fighting, with a single label at the area center.
    const areaOutlines = (data.areaOutlines ?? []).map((area) => {
      const { surface, boundaries } = makeAreaGeometry(area);
      const fill = new THREE.Mesh(surface, new THREE.MeshBasicMaterial({
        color: 0xe4bd72, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false,
      }));
      fill.userData.objectName = area.name;
      groundGroup.add(fill);
      pickables.push(fill);
      const lines = boundaries.map((boundary) => new Line2(new LineGeometry().setPositions(boundary), new LineMaterial({
        color: 0xe4bd72, linewidth: 1.6, transparent: true, opacity: 0.9, depthWrite: false,
        resolution: new THREE.Vector2(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1)),
      })));
      groundGroup.add(...lines);

      const anchor = new THREE.Object3D();
      latLonToVec3(area.centerLatDeg, area.centerLonDeg, 1.006, anchor.position);
      groundGroup.add(anchor);
      const label = makeLabel(area.name, "obj-label obj-label--area");
      anchor.add(label);

      return { area, lines, fill, anchor, label, boundaries };
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
    // A ScanAreaTarget task's targetName is the area's group name, which has
    // no per-point marker; point the boresight at the area's centroid anchor
    // instead of falling back to idle/nadir while a scan task is active.
    for (const ao of areaOutlines) {
      stationByName.set(ao.area.name, { marker: ao.anchor });
    }
    const sensorAccessByKey = new Map(
      (data.sensorAccesses ?? []).map((a) => [`${a.platform}|${a.target}`, a]),
    );

    scenarioContent = {
      group,
      groundGroup,
      data,
      sats,
      stations,
      areaOutlines,
      accessLines,
      stationByName,
      sensorAccessByKey,
    };
    applyOptions();
    applySelection();
    if (orbitEditor.name) {
      const editing = sats.find((sat) => sat.data.name === orbitEditor.name);
      if (editing?.data.spec?.orbit?.type === "keplerian") orbitEditor.setOrbit(editing.data.name, editing.data.spec.orbit);
      else finishOrbitEditing();
    }
    if (focusedSatelliteName && !sats.some((sat) => sat.data.name === focusedSatelliteName)) {
      resetCamera();
    }
  }

  function applyOptions() {
    if (!scenarioContent) return;
    for (const s of scenarioContent.sats) {
      const earthFixed = options.referenceFrame === "ECEF";
      const parent = earthFixed ? scenarioContent.groundGroup : scenarioContent.group;
      s.path.geometry = s.pathGeometries[earthFixed ? "ECEF" : "ECI"];
      if (s.path.parent !== parent) parent.add(s.path);
      s.path.updateMatrixWorld(true);
      s.groundTrack.visible = options.groundTracks;
    }
    scenarioContent.accessLines.visible = options.accessLines;
    for (const station of scenarioContent.stations) {
      if (station.data.area) station.marker.visible = Boolean(options.areaGrid) || station.data.name === selectedName;
    }
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
      s.path.material.opacity = selected ? 1.0 : s.baseOpacity;
      s.path.visible = s.data.name !== orbitEditor.name;
      s.label.element.classList.toggle("obj-label--selected", selected);
    }
    for (const st of scenarioContent.stations) {
      const selected = st.data.name === selectedName;
      if (st.data.area) st.marker.visible = Boolean(options.areaGrid) || selected;
      // Area grid points have no label; grow them more so selection reads.
      if (!st.isDish) st.marker.scale.setScalar(selected ? (st.label ? 1.6 : 2.6) : 1);
      st.label?.element.classList.toggle("obj-label--selected", selected);
    }
    for (const area of scenarioContent.areaOutlines) {
      const keepOut = area.area.name === slewPlan?.request.context.obstacle;
      const selected = area.area.name === selectedName || scenarioContent.stations.some((st) =>
        st.data.name === selectedName && st.data.area?.name === area.area.name);
      for (const line of area.lines) {
        line.material.color.setHex(keepOut ? 0xff796e : selected ? 0xb3e8d2 : 0xe4bd72);
        line.material.linewidth = selected ? 2.4 : 1.6;
      }
      area.fill.material.color.setHex(keepOut ? 0xff796e : selected ? 0xb3e8d2 : 0xe4bd72);
      area.fill.material.opacity = keepOut ? 0.32 : selected ? 0.24 : 0.14;
      area.label.element.classList.toggle("obj-label--selected", selected);
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
    raycaster.params.Line.threshold = camera.position.length() * 0.004;
    const hits = raycaster.intersectObjects(pickables, true).filter((hit) => {
      for (let object = hit.object; object; object = object.parent) {
        if (!object.visible) return false;
      }
      return !isOccludedByEarth(hit.point);
    });
    if (hits.length > 0) {
      onSelect?.(hits[0].object.userData.objectName);
      if (hits[0].object.userData.orbitPath && options.referenceFrame !== "ECEF") startOrbitEditing(hits[0].object.userData.objectName);
    }
  });
  labelRenderer.domElement.addEventListener("dblclick", (event) => {
    const rect = labelRenderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, true)
      .find((entry) => scenarioContent?.sats.some((sat) => sat.data.name === entry.object.userData.objectName));
    if (hit) focusSatellite(hit.object.userData.objectName);
  });

  // --- Sensor pointing / FOV / FOR ---
  const tmpNadir = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpFrom = new THREE.Vector3();
  const tmpTo = new THREE.Vector3();
  const tmpTarget = new THREE.Vector3();
  const tmpNominal = new THREE.Vector3();
  const tmpSensorOrigin = new THREE.Vector3();
  const tmpLocalDirection = new THREE.Vector3();
  const tmpInverseBody = new THREE.Quaternion();
  const tmpLocalSun = new THREE.Vector3();
  const sampledDirection = new THREE.Vector3();
  const trackBefore = [0, 0, 0];
  const trackAfter = [0, 0, 0];
  const bodyVelocity = new THREE.Vector3();
  const SENSOR_IDLE = 0x7fb4d8;
  const SENSOR_FOR_ONLY = 0xe8a33d; // reachable (FOR-valid), not in the beam
  const SENSOR_FOV_IN_VIEW = 0x5fc98f; // target inside the instantaneous FOV

  function trackVelocity(s, tSec, result) {
    // Display orientation only: differentiate the existing sampled track;
    // no propagation or mission-analysis results are computed in this view.
    const times = s.data.ephemeris.t;
    const before = Math.max(times[0], tSec - 0.5);
    const after = Math.min(times[times.length - 1], tSec + 0.5);
    if (after <= before) return result.set(0, 0, 0);
    satEciAt(s.data, before, trackBefore);
    satEciAt(s.data, after, trackAfter);
    return result.set(trackAfter[0] - trackBefore[0], trackAfter[2] - trackBefore[2],
      -(trackAfter[1] - trackBefore[1])).multiplyScalar(KM / (after - before));
  }

  function updateSatelliteDetail(s, tSec) {
    const p = s.marker.position;
    const distance = camera.position.distanceTo(p);
    s.displayScale = Math.max(0, Math.min(SATELLITE_DISPLAY_SCALE, (p.length() - 1) * 0.035));
    const projectedSpanPx = distance > 0
      ? s.displayScale * SATELLITE_MODEL_SPAN * container.clientHeight /
        (2 * distance * Math.tan(camera.fov * DEG / 2))
      : SATELLITE_DETAIL_FULL_PX;
    s.detailWeight = s.displayScale > 0
      ? THREE.MathUtils.smoothstep(projectedSpanPx, SATELLITE_DETAIL_FADE_PX, SATELLITE_DETAIL_FULL_PX)
      : 0;
    s.marker.material.opacity = 1 - s.detailWeight;
    s.marker.visible = s.detailWeight < 0.998;
    const markerPixels = s.data.name === selectedName ? 38 : 28;
    const markerScale = markerPixels * 2 * Math.tan(camera.fov * DEG / 2) /
      Math.max(container.clientHeight, 1);
    s.marker.scale.setScalar(markerScale);
    s.labelAnchor.position.copy(p);
    s.label.position.set(0, s.detailWeight * s.displayScale * 1.6, 0);
    // Large constellations allocate detailed geometry only for spacecraft
    // approached by the camera, rather than hundreds of unseen bus models.
    if (!s.detail && s.detailWeight > 0.002) {
      s.detail = createSatelliteModel({ hasSensor: Boolean(s.data.sensor) });
      s.detail.root.traverse((object) => { object.userData.objectName = s.data.name; });
      scenarioContent.group.add(s.detail.root);
      pickables.push(s.detail.root);
    }
    if (!s.detail) return;
    s.detail.root.position.copy(p);
    s.detail.root.scale.setScalar(s.displayScale);
    trackVelocity(s, tSec, bodyVelocity);
    orientSatelliteBody(s.detail.root.quaternion, p, bodyVelocity);
    // The body stays nadir-pointing; only the arrays rotate about their
    // cross-track hinges to follow the same Sun that lights the scene.
    tmpInverseBody.copy(s.detail.root.quaternion).invert();
    tmpLocalSun.copy(sunDirWorld).applyQuaternion(tmpInverseBody);
    s.detail.trackSun(tmpLocalSun);
    s.detail.setOpacity(s.detailWeight);
  }

  function nominalSensorDirection(s, tSec, result) {
    const config = s.data.sensor;
    const mode = String(config.pointing ?? config.pointingMode ?? "Nadir").toLowerCase();
    if (mode === "fixedvector" && Array.isArray(config.boresight)) {
      result.set(config.boresight[0], config.boresight[2], -config.boresight[1]);
      return result.applyQuaternion(earthGroup.quaternion).normalize();
    }
    if (mode === "sunpointing") return result.copy(sunDirWorld);
    if (mode === "velocityvector") {
      trackVelocity(s, tSec, result);
      // Earth-relative derivative for preview-only display. Authoritative
      // exported boresight samples below always take precedence when present.
      const omega = 7.292115e-5;
      result.x -= omega * s.marker.position.z;
      result.z += omega * s.marker.position.x;
      if (result.lengthSq() > 1e-18) return result.normalize();
    }
    return result.copy(s.marker.position).normalize().negate();
  }

  function exportedPointingAt(series, tSec, direction) {
    const times = series?.tOffsetSec;
    const vectors = series?.boresightEcef;
    if (!times?.length || vectors?.length !== times.length) return null;
    let low = 0;
    let high = times.length - 1;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (times[middle] <= tSec) low = middle;
      else high = middle;
    }
    if (tSec <= times[0]) high = low = 0;
    if (tSec >= times[times.length - 1]) high = low = times.length - 1;
    const fraction = high === low ? 0 : (tSec - times[low]) / (times[high] - times[low]);
    const a = vectors[low];
    const b = vectors[high];
    direction.set(a[0], a[2], -a[1]);
    sampledDirection.set(b[0], b[2], -b[1]);
    direction.lerp(sampledDirection, fraction);
    if (direction.lengthSq() < 1e-12) direction.set(a[0], a[2], -a[1]);
    direction.normalize().applyQuaternion(earthGroup.quaternion);
    const index = fraction < 0.5 ? low : high;
    return {
      phase: series.phase?.[index] ?? "idle",
      targetName: series.targetName?.[index] ?? "",
      aimLatitude: series.aimLatDeg?.[index],
      aimLongitude: series.aimLonDeg?.[index],
    };
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
    if (r <= 1.000001) {
      viz.viewDirection = null;
      viz.fovCone.visible = false;
      viz.forDome.visible = false;
      viz.trackLine.visible = false;
      return;
    }
    tmpNadir.copy(p).multiplyScalar(-1 / r);

    // Boresight: home (nadir) when idle, the task target while tracking, an
    // interpolated direction while slewing into a task, and an interpolation
    // from the finished target back to nadir during the return-home phase.
    const pointing = pointingStateAt(viz.entries, tSec);
    const nominal = nominalSensorDirection(s, tSec, tmpNominal);
    const dir = tmpDir.copy(nominal);
    let targetPos = null;
    if (pointing.phase !== "idle") {
      const st = scenarioContent.stationByName.get(pointing.entry.targetName);
      if (st) {
        targetPos = st.marker.getWorldPosition(tmpTarget);
        tmpTo.subVectors(targetPos, p).normalize();
        if (pointing.phase === "track") {
          dir.copy(tmpTo);
        } else if (pointing.phase === "return") {
          dir
            .lerpVectors(tmpTo, nominal, Math.min(pointing.progress, 1))
            .normalize();
        } else {
          tmpFrom.copy(nominal);
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
    const exported = exportedPointingAt(viz.pointingSeries, tSec, dir);
    const plannedDirection = slewPlan?.request.context.platform === s.data.name ? slewDirectionAt(s.data, slewPlan.result, tSec) : null;
    if (plannedDirection) dir.copy(plannedDirection);
    const phase = plannedDirection ? "slew" : exported?.phase ?? pointing.phase;
    viz.viewDirection ??= new THREE.Vector3();
    viz.viewDirection.copy(dir);
    viz.viewPhase = phase;
    viz.viewSource = plannedDirection ? "MATLAB avoidance" : exported ? "MATLAB pointing" : "Preview pointing";
    const targetName = exported?.targetName ?? pointing.entry?.targetName;
    if (exported && targetName) {
      const target = scenarioContent.stationByName.get(targetName);
      if (target) targetPos = target.marker.getWorldPosition(tmpTarget);
      if (Number.isFinite(exported.aimLatitude) && Number.isFinite(exported.aimLongitude)) {
        latLonToVec3(exported.aimLatitude, exported.aimLongitude, 1.001, tmpTarget)
          .applyQuaternion(earthGroup.quaternion);
        targetPos = tmpTarget;
      }
    }
    if (plannedDirection) targetPos = new THREE.Ray(p, dir).intersectSphere(new THREE.Sphere(new THREE.Vector3(), 1.001), tmpTarget);
    if (s.detail?.payload) {
      tmpInverseBody.copy(s.detail.root.quaternion).invert();
      tmpLocalDirection.copy(dir).applyQuaternion(tmpInverseBody);
      orientBoresight(s.detail.payload.quaternion, tmpLocalDirection);
      s.detail.root.updateMatrixWorld(true);
      s.detail.aperture.getWorldPosition(tmpSensorOrigin);
      tmpSensorOrigin.lerpVectors(p, tmpSensorOrigin, s.detailWeight);
    } else tmpSensorOrigin.copy(p);

    // The tracking line only makes sense while pointing at (or toward) the
    // upcoming/active target; the return-home slew has no target to show.
    const tracking =
      phase !== "idle" && phase !== "return" && targetPos;
    const fovActive = tracking
      ? isFovActive(s.data.name, targetName, tSec)
      : false;

    viz.fovCone.visible = options.sensorFov;
    if (options.sensorFov) {
      let length = fovLengthToEarth(tmpSensorOrigin, dir, 1, FOV_EARTH_OVERSHOOT);
      if (!Number.isFinite(length) || length <= 0) length = r;
      const radius = length * Math.tan(viz.halfAngleRad);
      viz.fovCone.position.copy(tmpSensorOrigin);
      orientBoresight(viz.fovCone.quaternion, dir);
      viz.fovCone.scale.set(radius, length, radius);
      viz.fovCone.material.color.setHex(
        phase === "idle"
          ? SENSOR_IDLE
          : fovActive
            ? SENSOR_FOV_IN_VIEW
            : SENSOR_FOR_ONLY,
      );
    }

    viz.forDome.visible = options.sensorFor;
    if (options.sensorFor) {
      if (
        viz.forRadius === null ||
        Math.abs(viz.forRadius - r) > FOR_RADIUS_UPDATE_EPS
      ) {
        viz.forDome.geometry.dispose();
        viz.forDome.geometry = makeForFootprintGeometry(
          viz.forHalfAngleDeg,
          r,
          FOR_SURFACE_RADIUS,
        );
        viz.forRadius = r;
      }
      // Apex at the sensor, with each off-nadir ray cast to the Earth
      // surface. The footprint is generated in scene units, so it does not
      // use the old uniform "altitude only" scale that made the FOR float.
      viz.forDome.position.copy(p);
      orientBoresight(viz.forDome.quaternion, tmpNadir);
      viz.forDome.scale.set(1, 1, 1);
    }

    viz.trackLine.visible = Boolean(tracking);
    if (tracking) {
      const attr = viz.trackLine.geometry.getAttribute("position");
      attr.setXYZ(0, tmpSensorOrigin.x, tmpSensorOrigin.y, tmpSensorOrigin.z);
      attr.setXYZ(1, targetPos.x, targetPos.y, targetPos.z);
      attr.needsUpdate = true;
      viz.trackLine.material.color.setHex(
        fovActive ? SENSOR_FOV_IN_VIEW : SENSOR_FOR_ONLY,
      );
      viz.trackLine.material.opacity = phase === "slew" ? 0.45 : 0.9;
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
  let lastEarthAngle = null;
  const earthAxis = new THREE.Vector3(0, 1, 0);

  function resetCamera() {
    const wasFocused = focusedSatelliteName !== null;
    focusedSatelliteName = null;
    controls.enablePan = true;
    controls.minDistance = 1.2;
    controls.maxDistance = 40;
    controls.target.set(0, 0, 0);
    camera.position.set(2.6, 1.5, 2.4);
    camera.near = 0.01;
    camera.updateProjectionMatrix();
    controls.update();
    if (wasFocused) onFocusChange?.(null);
  }

  function focusArea(name) {
    const entry = scenarioContent?.areaOutlines.find((item) => item.area.name === name);
    if (!entry) return false;
    finishOrbitEditing();
    resetCamera();
    const area = entry.area;
    const direction = latLonToVec3(area.centerLatDeg, area.centerLonDeg, 1, new THREE.Vector3());
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), gmstRad(new Date(epochMs + clock.getSnapshot().tSec * 1000)));
    const span = Math.max(area.widthKm, area.heightKm) / 6371;
    const distance = Math.min(5, Math.max(1.45, 1 + span / (2 * Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect))));
    camera.position.copy(direction).multiplyScalar(distance);
    controls.update();
    return true;
  }

  function focusSlewPlan() {
    if (!slewPlan) return;
    const area = scenarioContent.areaOutlines.find((entry) => entry.area.name === slewPlan.request.context.obstacle)?.area;
    if (!area) return;
    finishOrbitEditing(); resetCamera();
    const radial = latLonToVec3(area.centerLatDeg, area.centerLonDeg, 1, new THREE.Vector3()).applyQuaternion(earthGroup.quaternion);
    const side = new THREE.Vector3(0, 1, 0).cross(radial).normalize();
    const span = Math.max(0.16, Math.max(area.widthKm, area.heightKm) / 6371 * 4);
    controls.target.copy(radial);
    camera.position.copy(radial).addScaledVector(radial, span).addScaledVector(side, span * 0.65);
    controls.minDistance = 0.015; camera.near = 0.0001; camera.updateProjectionMatrix(); controls.update();
  }

  function focusSatellite(name) {
    finishOrbitEditing();
    const satellite = scenarioContent?.sats.find((entry) => entry.data.name === name);
    if (!satellite?.data.ephemeris?.n) return false;
    const { tSec } = clock.getSnapshot();
    satEciAt(satellite.data, tSec, eciOut);
    eciToThree(eciOut[0], eciOut[1], eciOut[2], satellite.marker.position);
    const p = satellite.marker.position;
    if (!Number.isFinite(p.lengthSq()) || p.length() <= 1) return false;
    satellite.displayScale = Math.min(SATELLITE_DISPLAY_SCALE, (p.length() - 1) * 0.035);
    focusedSatelliteName = name;
    lastFocusPosition.copy(p);
    focusRadial.copy(p).normalize();
    focusSide.set(Math.abs(focusRadial.y) > 0.9 ? 1 : 0, Math.abs(focusRadial.y) > 0.9 ? 0 : 1, 0);
    focusSide.cross(focusRadial).normalize();
    const distance = satellite.displayScale * SATELLITE_FOCUS_DISTANCE;
    camera.position.copy(p).addScaledVector(focusRadial, distance * 0.52)
      .addScaledVector(focusSide, distance * 0.85);
    controls.target.copy(p);
    controls.minDistance = satellite.displayScale * 3.2;
    controls.maxDistance = 40;
    controls.enablePan = false;
    controls.update();
    onFocusChange?.(name);
    return true;
  }

  function startOrbitEditing(name) {
    const satellite = scenarioContent?.sats.find((entry) => entry.data.name === name);
    const orbit = satellite?.data.spec?.orbit;
    if (orbit?.type !== "keplerian" || orbitEditor.busy) return false;
    // Keplerian element handles describe a fixed inertial ellipse, so make
    // that frame explicit before entering the editor from an Earth-fixed view.
    if (options.referenceFrame !== "ECI") {
      options.referenceFrame = "ECI";
      applyOptions();
      onReferenceFrameChange?.("ECI");
    }
    clock.setPlaying(false);
    if (focusedSatelliteName) resetCamera();
    controls.enableDamping = false;
    controls.target.set(0, 0, 0);
    const radius = orbit.semiMajorAxisKm * (1 + orbit.eccentricity) / 6371;
    const distance = radius * 1.55 / Math.sin(camera.fov * DEG / 2 * Math.min(camera.aspect, 1));
    if (camera.position.length() < distance) camera.position.setLength(distance);
    controls.maxDistance = Math.max(40, distance * 3);
    controls.update();
    orbitEditor.setOrbit(name, orbit);
    applySelection();
    return true;
  }

  function finishOrbitEditing() {
    if (orbitEditor.busy) return;
    orbitEditor.setOrbit(null, null);
    controls.enableDamping = true;
    applySelection();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - lastWall) / 1000, 0.25);
    lastWall = now;
    clock.tick(dt);
    if (replayEnd !== null && clock.getSnapshot().tSec >= replayEnd) {
      clock.setTime(replayEnd); clock.setPlaying(false); replayEnd = null;
    }

    const { tSec } = clock.getSnapshot();
    const date = new Date(epochMs + tSec * 1000);

    const earthAngle = gmstRad(date);
    if (options.referenceFrame === "ECEF" && lastEarthAngle !== null) {
      const rotation = earthAngle - lastEarthAngle;
      camera.position.applyAxisAngle(earthAxis, rotation);
      controls.target.applyAxisAngle(earthAxis, rotation);
      lastFocusPosition.applyAxisAngle(earthAxis, rotation);
    }
    lastEarthAngle = earthAngle;
    earthGroup.rotation.y = earthAngle;
    earthGroup.updateMatrixWorld();
    // Sun direction: MATLAB/Orekit ephemeris when the payload provides it,
    // otherwise the low-precision analytic formula.
    const sunData = scenarioContent?.data?.sun ?? null;
    const sun = sunDirectionAt(sunData, tSec, sunOut) ?? sunDirectionEci(date);
    sunDirWorld.set(sun[0], sun[2], -sun[1]).normalize();
    spacecraftSun.position.copy(sunDirWorld).multiplyScalar(20);
    sunSprite.position.set(sun[0] * 100, sun[2] * 100, -sun[1] * 100);
    sunSprite.visible = options.sun;

    if (scenarioContent) {
      for (const s of scenarioContent.sats) {
        satEciAt(s.data, tSec, eciOut);
        eciToThree(eciOut[0], eciOut[1], eciOut[2], s.marker.position);
      }
      if (focusedSatelliteName) {
        const focused = scenarioContent.sats.find((sat) => sat.data.name === focusedSatelliteName);
        if (focused) {
          focusDelta.subVectors(focused.marker.position, lastFocusPosition);
          camera.position.add(focusDelta);
          controls.target.copy(focused.marker.position);
          lastFocusPosition.copy(focused.marker.position);
        } else resetCamera();
      }
      for (const s of scenarioContent.sats) {
        updateSatelliteDetail(s, tSec);
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
        if (st.isDish) {
          const pixels = st.data.name === selectedName ? 31 : 24;
          const scale = pixels * 2 * Math.tan(camera.fov * DEG / 2) / Math.max(container.clientHeight, 1);
          st.marker.scale.setScalar(scale);
        } else {
          st.marker.getWorldPosition(tmpVec);
          const pixels = st.data.area ? (st.data.name === selectedName ? 8 : 4) : (st.data.name === selectedName ? 15 : 11);
          const perPixel = 2 * camera.position.distanceTo(tmpVec) * Math.tan(camera.fov * DEG / 2) / Math.max(container.clientHeight, 1);
          st.marker.scale.setScalar(pixels * perPixel / (st.data.area ? 0.008 : 0.024));
          if (st.ring) st.ring.scale.setScalar((pixels + 10) * perPixel / 0.056);
        }
        if (!st.label) continue;
        st.marker.getWorldPosition(tmpVec);
        st.label.visible = options.labels && !isOccludedByEarth(tmpVec);
      }
      for (const ao of scenarioContent.areaOutlines) {
        ao.anchor.getWorldPosition(tmpVec);
        ao.label.visible = options.labels && !isOccludedByEarth(tmpVec);
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

    controls.rotateSpeed = focusedSatelliteName
      ? OVERVIEW_ROTATE_SPEED
      : earthRotationSpeed(camera.position.length());
    controls.update();
    orbitEditor.updateFrame(container.clientHeight);
    // Ordinary perspective depth remains compatible with the custom Earth
    // shader. A local near plane permits close viewing without log-depth.
    const near = focusedSatelliteName
      ? Math.max(0.000002, Math.min(0.01, camera.position.distanceTo(controls.target) * 0.004))
      : 0.01;
    if (Math.abs(camera.near - near) > near * 0.05) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    sensorView?.render(now);
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
    for (const area of scenarioContent?.areaOutlines ?? []) for (const line of area.lines) line.material.resolution.set(w, h);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  raf = requestAnimationFrame(frame);

  return {
    setSlewPlan, clearSlewPlan, focusSlewPlan,
    getSlewPlan() { return slewPlan; },
    replaySlewPlan() {
      if (!slewPlan) return;
      clock.setTime(slewPlan.request.initialState.time_s);
      clock.setSpeed(1); replayEnd = slewPlan.request.goalState.time_s; clock.setPlaying(true);
    },
    attachSensorView(container, name, onChange, getMode) {
      sensorView?.dispose();
      const view = createSensorViewRenderer({ container, scene, onChange, getMode, getFrame: () => {
        const satellite = scenarioContent?.sats.find((entry) => entry.data.name === name);
        if (!satellite?.sensor?.viewDirection) return null;
        return { content: scenarioContent, satellite, position: satellite.marker.position,
          direction: satellite.sensor.viewDirection, velocity: trackVelocity(satellite, clock.getSnapshot().tSec, new THREE.Vector3()),
          halfAngleDeg: satellite.data.sensor.coneHalfAngleDeg, earthQuaternion: earthGroup.quaternion,
          tSec: clock.getSnapshot().tSec, epochMs };
      } });
      sensorView = view;
      return () => { view.dispose(); if (sensorView === view) sensorView = null; };
    },
    setScenario(data) {
      if (epochMs !== (data?.epochMs ?? 0)) lastEarthAngle = null;
      epochMs = data?.epochMs ?? 0;
      setScenario(data);
    },
    setOptions(next) {
      options = { ...options, ...next };
      applyOptions();
    },
    setSelection(name) {
      selectedName = name;
      if (orbitEditor.name && orbitEditor.name !== name) finishOrbitEditing();
      applySelection();
    },
    focusSatellite,
    focusArea,
    startOrbitEditing,
    finishOrbitEditing,
    commitOrbit(orbit) { return orbitEditor.commit(orbit); },
    getFocusedSatellite() { return focusedSatelliteName; },
    resetCamera,
    dispose() {
      cancelAnimationFrame(raf);
      sensorView?.dispose(); sensorView = null;
      resizeObserver.disconnect();
      orbitEditor.dispose();
      setScenario(null);
      controls.dispose();
      stationIconTexture.dispose();
      satelliteMarkerTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    },
  };
}
