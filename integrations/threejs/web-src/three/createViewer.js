import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const EARTH_RADIUS_M = 6378137;

export function createViewer(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090d);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
  camera.position.set(2.6, 1.5, 2.4);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = "viewport-labels";
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.55;
  controls.minDistance = 1.2;
  controls.maxDistance = 40;
  controls.zoomSpeed = 0.9;
  controls.enablePan = false;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  const scenarioLayer = new THREE.Group();
  const earthLayer = new THREE.Group();
  scene.add(scenarioLayer);
  scene.add(earthLayer);
  const sunlight = addLighting(scene);
  const sunSprite = createSunSprite();
  scene.add(sunSprite);
  addStars(scene);
  addEarth(earthLayer, renderer);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  let currentSceneData = null;
  let currentReferenceFrame = null;
  let satelliteMarkers = [];
  let placeMarkers = [];
  let animationFrame;
  animate();

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    labelRenderer.setSize(width, height);
  }

  function animate() {
    renderScene();
    animationFrame = requestAnimationFrame(animate);
  }

  function renderScene() {
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  function update(sceneData, referenceFrame, sampleIndex = 0) {
    const shouldRebuild = sceneData !== currentSceneData ||
      referenceFrame !== currentReferenceFrame;
    if (shouldRebuild) {
      rebuildScenario(sceneData, referenceFrame);
      currentSceneData = sceneData;
      currentReferenceFrame = referenceFrame;
    }
    updateTimeSample(sceneData, referenceFrame, sampleIndex);
    renderScene();
  }

  function rebuildScenario(sceneData, referenceFrame) {
    clearLayer(scenarioLayer);
    satelliteMarkers = [];
    placeMarkers = [];
    const radius_m = Number(sceneData.earthRadius_m) || EARTH_RADIUS_M;
    normalizeArray(sceneData.satellites).forEach((satellite) => {
      addOrbitPath(scenarioLayer, satellite, referenceFrame, radius_m);
      const marker = addSatelliteMarker(scenarioLayer, satellite.name);
      satelliteMarkers.push({ marker, satellite });
    });
    normalizeArray(sceneData.places).forEach((place) => {
      const handles = addPlaceMarker(scenarioLayer, place.name);
      placeMarkers.push({ ...handles, place });
    });
  }

  function updateTimeSample(sceneData, referenceFrame, requestedPosition) {
    const timeSamples = normalizeArray(sceneData.timeSamples);
    const bounds = calculateSampleBounds(requestedPosition, timeSamples.length);
    const radius_m = Number(sceneData.earthRadius_m) || EARTH_RADIUS_M;
    satelliteMarkers.forEach(({ marker, satellite }) => {
      const positionM = readSamplePosition(satellite, referenceFrame, bounds);
      setSatellitePosition(marker, positionM, radius_m);
    });
    placeMarkers.forEach(({ marker, ring, place }) => {
      const positionM = readSamplePosition(place, referenceFrame, bounds);
      setPlacePosition(marker, ring, positionM, radius_m);
    });
    updateEarthOrientation(
      earthLayer,
      timeSamples[bounds.lowerIndex]?.ecefToEciMatrix,
      timeSamples[bounds.upperIndex]?.ecefToEciMatrix,
      bounds.fraction,
      referenceFrame,
    );
    const sunField = referenceFrame === "ECI"
      ? "sunDirectionEci"
      : "sunDirectionEcef";
    const sunDirection = interpolateVector(
      timeSamples[bounds.lowerIndex]?.[sunField],
      timeSamples[bounds.upperIndex]?.[sunField],
      bounds.fraction,
    );
    updateSun(sunSprite, sunlight, sunDirection);
  }

  function dispose() {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    controls.dispose();
    clearLayer(scenarioLayer);
    sunSprite.material.map.dispose();
    sunSprite.material.dispose();
    renderer.dispose();
    labelRenderer.domElement.remove();
    renderer.domElement.remove();
  }

  return { update, dispose };
}

function addLighting(scene) {
  scene.add(new THREE.AmbientLight(0x30343c, 1.6));
  const sunlight = new THREE.DirectionalLight(0xfff4e0, 2.4);
  scene.add(sunlight);
  return sunlight;
}

function createSunSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,248,224,1)");
  gradient.addColorStop(0.25, "rgba(255,236,170,0.85)");
  gradient.addColorStop(0.6, "rgba(255,214,110,0.25)");
  gradient.addColorStop(1, "rgba(255,200,80,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  }));
  sprite.scale.setScalar(14);
  return sprite;
}

function addEarth(scene, renderer) {
  const geometry = new THREE.SphereGeometry(1, 128, 80);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: new THREE.Color(0x202830),
    shininess: 12,
  });
  new THREE.TextureLoader().load("/textures/earth_atmos_2048.jpg", (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    material.map = texture;
    material.needsUpdate = true;
  });
  scene.add(new THREE.Mesh(geometry, material));

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.018, 96, 64),
    new THREE.MeshBasicMaterial({
      color: 0x46a8ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    }),
  );
  scene.add(atmosphere);
}

function addStars(scene) {
  const positions = [];
  for (let index = 0; index < 1200; index += 1) {
    const theta = index * 2.399963;
    const z = 1 - (2 * index) / 1199;
    const radius = Math.sqrt(1 - z * z);
    positions.push(45 * radius * Math.cos(theta), 45 * z, 45 * radius * Math.sin(theta));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0xb8d8ff,
    size: 0.035,
    transparent: true,
    opacity: 0.65,
  })));
}

function addSatelliteMarker(layer, name) {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xd8b25a }),
  );
  marker.add(createLabel(name, "object-label object-label--satellite"));
  layer.add(marker);
  return marker;
}

function addPlaceMarker(layer, name) {
  const marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.012),
    new THREE.MeshBasicMaterial({ color: 0xd9dee6 }),
  );
  marker.add(createLabel(name, "object-label object-label--place"));
  layer.add(marker);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.02, 0.028, 32),
    new THREE.MeshBasicMaterial({
      color: 0x5aa0d8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),
  );
  layer.add(ring);
  return { marker, ring };
}

function setSatellitePosition(marker, positionM, earthRadiusM) {
  marker.visible = isPosition(positionM);
  if (!marker.visible) return;
  marker.position.copy(positionToRender(positionM, earthRadiusM));
}

function setPlacePosition(marker, ring, positionM, earthRadiusM) {
  const isVisible = isPosition(positionM);
  marker.visible = isVisible;
  ring.visible = isVisible;
  if (!isVisible) return;
  const position = positionToRender(positionM, earthRadiusM)
    .normalize()
    .multiplyScalar(1.006);
  marker.position.copy(position);
  ring.position.copy(position);
  ring.lookAt(position.clone().multiplyScalar(2));
}

function addOrbitPath(layer, satellite, referenceFrame, earthRadiusM) {
  const field = referenceFrame === "ECI" ? "orbitPathEci_m" : "orbitPathEcef_m";
  const samples = satellite[field];
  if (!Array.isArray(samples) || samples.length < 2) return;
  const points = samples.map((positionM) => positionToRender(positionM, earthRadiusM));
  const path = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color: 0xd8b25a,
      transparent: true,
      opacity: 0.55,
    }),
  );
  layer.add(path);
}

function createLabel(text, className) {
  const element = document.createElement("div");
  element.className = className;
  element.textContent = text;
  const label = new CSS2DObject(element);
  label.center.set(-0.08, 1.2);
  return label;
}

function positionToRender(positionM, earthRadiusM) {
  return new THREE.Vector3(
    positionM[0] / earthRadiusM,
    positionM[2] / earthRadiusM,
    -positionM[1] / earthRadiusM,
  );
}

function readSamplePosition(object, referenceFrame, bounds) {
  const historyField = referenceFrame === "ECI"
    ? "positionSamplesEci_m"
    : "positionSamplesEcef_m";
  const snapshotField = referenceFrame === "ECI"
    ? "positionEci_m"
    : "positionEcef_m";
  const history = object[historyField];
  if (!Array.isArray(history?.[bounds.lowerIndex])) {
    return object[snapshotField];
  }
  return interpolateVector(
    history[bounds.lowerIndex],
    history[bounds.upperIndex],
    bounds.fraction,
  );
}

function calculateSampleBounds(samplePosition, sampleCount) {
  const maximumIndex = Math.max(sampleCount - 1, 0);
  const position = Math.min(
    Math.max(Number(samplePosition) || 0, 0),
    maximumIndex,
  );
  const lowerIndex = Math.floor(position);
  return {
    lowerIndex,
    upperIndex: Math.min(lowerIndex + 1, maximumIndex),
    fraction: position - lowerIndex,
  };
}

function interpolateVector(lowerValue, upperValue, fraction) {
  if (!isPosition(lowerValue) || !isPosition(upperValue)) return lowerValue;
  return lowerValue.map((component, componentIndex) => (
    component + fraction * (upperValue[componentIndex] - component)
  ));
}

function isPosition(value) {
  return Array.isArray(value) && value.length === 3;
}

function updateSun(sprite, sunlight, directionValue) {
  const isValid = Array.isArray(directionValue) && directionValue.length === 3;
  sprite.visible = isValid;
  sunlight.visible = isValid;
  if (!isValid) return;
  const directionPhysical = new THREE.Vector3(...directionValue);
  const direction = physicalToRender(directionPhysical).normalize();
  sunlight.position.copy(direction).multiplyScalar(50);
  sprite.position.copy(direction.multiplyScalar(100));
}

function updateEarthOrientation(
  earthLayer,
  lowerMatrix,
  upperMatrix,
  fraction,
  referenceFrame,
) {
  earthLayer.matrixAutoUpdate = true;
  earthLayer.quaternion.identity();
  if (referenceFrame !== "ECI" || !Array.isArray(lowerMatrix)) return;
  const lowerOrientation = orientationFromPhysicalMatrix(lowerMatrix);
  const upperOrientation = Array.isArray(upperMatrix)
    ? orientationFromPhysicalMatrix(upperMatrix)
    : lowerOrientation;
  earthLayer.quaternion.copy(lowerOrientation).slerp(upperOrientation, fraction);
}

function orientationFromPhysicalMatrix(matrix) {
  const transformPhysical = (vector) => new THREE.Vector3(
    matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z,
  );
  const basisX = physicalToRender(transformPhysical(new THREE.Vector3(1, 0, 0)));
  const basisY = physicalToRender(transformPhysical(new THREE.Vector3(0, 0, 1)));
  const basisZ = physicalToRender(transformPhysical(new THREE.Vector3(0, -1, 0)));
  const rotation = new THREE.Matrix4().makeBasis(basisX, basisY, basisZ);
  return new THREE.Quaternion().setFromRotationMatrix(rotation);
}

function physicalToRender(vector) {
  return new THREE.Vector3(vector.x, vector.z, -vector.y);
}

function clearLayer(layer) {
  while (layer.children.length > 0) {
    const object = layer.children.pop();
    object.traverse((child) => {
      if (child.isCSS2DObject) child.element.remove();
      child.geometry?.dispose();
      child.material?.dispose();
    });
  }
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
