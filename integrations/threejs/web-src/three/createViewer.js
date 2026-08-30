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
  controls.enablePan = true;

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
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  }

  function update(sceneData, referenceFrame) {
    clearLayer(scenarioLayer);
    const radius_m = Number(sceneData.earthRadius_m) || EARTH_RADIUS_M;
    const positionField = referenceFrame === "ECI" ? "positionEci_m" : "positionEcef_m";
    normalizeArray(sceneData.satellites).forEach((satellite) => {
      addOrbitPath(scenarioLayer, satellite, referenceFrame, radius_m);
      addSatelliteMarker(
        scenarioLayer,
        satellite.name,
        satellite[positionField],
        radius_m,
      );
    });
    normalizeArray(sceneData.places).forEach((place) => {
      addPlaceMarker(
        scenarioLayer,
        place.name,
        place[positionField],
        radius_m,
      );
    });
    updateEarthOrientation(earthLayer, sceneData.ecefToEciMatrix, referenceFrame);
    const sunField = referenceFrame === "ECI" ? "unitDirectionEci" : "unitDirectionEcef";
    updateSun(sunSprite, sunlight, sceneData.sun?.[sunField]);
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

function addSatelliteMarker(layer, name, positionM, earthRadiusM) {
  if (!Array.isArray(positionM) || positionM.length !== 3) return;
  const position = positionToRender(positionM, earthRadiusM);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xd8b25a }),
  );
  marker.position.copy(position);
  marker.add(createLabel(name, "object-label object-label--satellite"));
  layer.add(marker);
}

function addPlaceMarker(layer, name, positionM, earthRadiusM) {
  if (!Array.isArray(positionM) || positionM.length !== 3) return;
  const position = positionToRender(positionM, earthRadiusM).normalize().multiplyScalar(1.006);
  const marker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.012),
    new THREE.MeshBasicMaterial({ color: 0xd9dee6 }),
  );
  marker.position.copy(position);
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
  ring.position.copy(position);
  ring.lookAt(position.clone().multiplyScalar(2));
  layer.add(ring);
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

function updateEarthOrientation(earthLayer, matrix, referenceFrame) {
  earthLayer.matrixAutoUpdate = true;
  earthLayer.quaternion.identity();
  if (referenceFrame !== "ECI" || !Array.isArray(matrix)) return;
  const transformPhysical = (vector) => new THREE.Vector3(
    matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z,
  );
  const basisX = physicalToRender(transformPhysical(new THREE.Vector3(1, 0, 0)));
  const basisY = physicalToRender(transformPhysical(new THREE.Vector3(0, 0, 1)));
  const basisZ = physicalToRender(transformPhysical(new THREE.Vector3(0, -1, 0)));
  const rotation = new THREE.Matrix4().makeBasis(basisX, basisY, basisZ);
  earthLayer.quaternion.setFromRotationMatrix(rotation);
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
