import * as THREE from "three";

// Pictorial close-view glyph, authored in display units, not spacecraft
// dimensions. Local +Y is zenith; the payload gimbal mounts on the -Y face.
export function createSatelliteModel({ hasSensor = false } = {}) {
  const root = new THREE.Group();
  const wings = [];
  const materials = [];
  const material = (parameters) => {
    const result = new THREE.MeshStandardMaterial({
      roughness: 0.42,
      metalness: 0.5,
      transparent: true,
      ...parameters,
    });
    materials.push(result);
    return result;
  };
  const silver = material({ color: 0xc4cdd5 });
  const frame = material({ color: 0x657482, metalness: 0.7 });
  const gold = material({ color: 0xd0a449, roughness: 0.58, metalness: 0.55 });
  const dark = material({ color: 0x17212d, metalness: 0.3 });
  const cells = material({ color: 0x17437c, roughness: 0.27, metalness: 0.4 });
  const lens = material({ color: 0x274d65, roughness: 0.1, metalness: 0.7 });
  const addMesh = (geometry, surface, position, parent = root) => {
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };
  const box = (size, surface, position, parent = root) =>
    addMesh(new THREE.BoxGeometry(...size), surface, position, parent);

  box([1.05, 1.28, 0.9], silver, [0, 0, 0]);
  box([0.91, 1.08, 0.025], gold, [0, 0, 0.463]);
  box([0.91, 1.08, 0.025], gold, [0, 0, -0.463]);
  for (const side of [-1, 1]) {
    box([0.025, 1.08, 0.74], gold, [side * 0.538, 0, 0]);
    for (const edge of [-1, 1]) {
      box([0.08, 1.4, 0.08], frame, [side * 0.5, 0, edge * 0.45]);
    }
    box([0.18, 0.24, 0.45], frame, [side * 0.64, 0.12, 0]);
    const mount = box([0.46, 0.065, 0.12], silver, [side * 0.81, 0.12, 0]);
    mount.name = "solar-wing-mount";
    // The fixed strut ends at the hinge. Rotation about local X changes
    // panel incidence without changing the cross-track span or bus pose.
    const wing = new THREE.Group();
    wing.name = side < 0 ? "solar-wing-left" : "solar-wing-right";
    wing.position.set(side * 1.04, 0.12, 0);
    root.add(wing);
    wings.push(wing);
    // Six framed panels; visible cell gaps read even when the model is small.
    for (let panel = 0; panel < 3; panel++) {
      const center = side * (0.34 + panel * 0.93);
      const panelFrame = box([0.91, 0.055, 1.62], silver, [center, 0, 0], wing);
      panelFrame.name = "solar-panel-frame";
      box([0.85, 0.065, 1.54], dark, [center, 0, 0], wing);
      for (let row = 0; row < 4; row++) {
        for (let column = 0; column < 3; column++) {
          const frontCell = box([0.258, 0.009, 0.353], cells,
            [center + (column - 1) * 0.275, 0.038, (row - 1.5) * 0.373], wing);
          frontCell.name = "solar-cell-front";
          box([0.258, 0.009, 0.353], cells,
            [center + (column - 1) * 0.275, -0.038, (row - 1.5) * 0.373], wing);
        }
      }
    }
  }
  box([0.8, 0.035, 0.66], dark, [0, 0.66, 0]);
  for (let fin = 0; fin < 6; fin++) {
    box([0.65, 0.065, 0.022], silver, [0, 0.705, (fin - 2.5) * 0.085]);
  }
  const antenna = new THREE.Group();
  antenna.name = "earth-facing-antenna";
  // Both the dish opening and its feed face local +Y. Mount that axis
  // Earthward (-Y of the bus), clear of the central optical payload.
  antenna.position.set(-0.78, -0.57, 0.16);
  antenna.rotation.z = Math.PI;
  box([0.4, 0.1, 0.12], frame, [-0.59, -0.57, 0.16]);
  root.add(antenna);
  addMesh(new THREE.CylinderGeometry(0.025, 0.035, 0.4, 10), frame, [0, 0.2, 0], antenna);
  // Concave paraboloid: the rim lies ahead of the center along the feed
  // direction, unlike a convex spherical dome that reads as facing back.
  const dishProfile = [];
  for (let i = 0; i <= 12; i++) {
    const fraction = i / 12;
    dishProfile.push(new THREE.Vector2(0.32 * fraction, 0.095 * fraction * fraction));
  }
  const dish = addMesh(new THREE.LatheGeometry(dishProfile, 32),
    material({ color: 0xc4cdd5, side: THREE.DoubleSide }), [0, 0.28, 0], antenna);
  dish.name = "antenna-reflector";
  const dishRim = addMesh(new THREE.TorusGeometry(0.32, 0.009, 8, 32),
    frame, [0, 0.375, 0], antenna);
  dishRim.rotation.x = Math.PI / 2;
  addMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), dark, [0, 0.43, 0], antenna);
  const feed = addMesh(new THREE.SphereGeometry(0.036, 10, 8), silver, [0, 0.6, 0], antenna);
  feed.name = "antenna-feed";

  let payload = null;
  let aperture = null;
  if (hasSensor) {
    addMesh(new THREE.SphereGeometry(0.24, 20, 14), frame, [0, -0.73, 0]);
    payload = new THREE.Group();
    payload.position.set(0, -0.79, 0);
    // The viewer may steer this gimbal, but its initial pose is already
    // Earthward before the first pointing update.
    payload.rotation.z = Math.PI;
    root.add(payload);
    addMesh(new THREE.CylinderGeometry(0.17, 0.23, 0.43, 24), silver, [0, 0.2, 0], payload);
    addMesh(new THREE.CylinderGeometry(0.21, 0.2, 0.11, 24), dark, [0, 0.47, 0], payload);
    addMesh(new THREE.CylinderGeometry(0.166, 0.166, 0.018, 24), lens, [0, 0.534, 0], payload);
    const ring = addMesh(new THREE.TorusGeometry(0.182, 0.017, 8, 32), silver, [0, 0.54, 0], payload);
    ring.rotation.x = Math.PI / 2;
    aperture = new THREE.Object3D();
    aperture.name = "sensor-aperture";
    aperture.position.set(0, 0.55, 0);
    payload.add(aperture);
  }
  return {
    root,
    payload,
    aperture,
    trackSun(localSunDirection) {
      // A single-axis hinge can face only the Sun's YZ projection. If the
      // Sun lies along the hinge, every angle is equivalent; retain the
      // preceding pose instead of choosing an undefined, noisy direction.
      const length = Math.hypot(localSunDirection.x, localSunDirection.y, localSunDirection.z);
      if (!(length > 0) || !Number.isFinite(length)) return;
      const y = localSunDirection.y / length;
      const z = localSunDirection.z / length;
      if (Math.hypot(y, z) <= 1e-8) return;
      const angle = Math.atan2(z, y);
      for (const wing of wings) wing.rotation.x = angle;
    },
    setOpacity(opacity) {
      root.visible = opacity > 0.002;
      for (const surface of materials) {
        surface.opacity = opacity;
        surface.depthWrite = opacity > 0.95;
      }
    },
  };
}
