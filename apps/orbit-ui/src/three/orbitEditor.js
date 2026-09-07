import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { changeApsis, orbitAxes, orbitCurve, orbitRadii, ORBIT_EARTH_KM } from "./orbitEditing.js";

const LABELS = { perigee: "Perigee", apogee: "Apogee", inclination: "Inclination", raan: "RAAN", argp: "Periapsis angle" };
const DEG = Math.PI / 180;
const wrap = (radians) => Math.atan2(Math.sin(radians), Math.cos(radians));

export function createOrbitEditor({ scene, camera, controls, element, onChange, onCommit, isOccluded }) {
  const root = new THREE.Group();
  root.userData.orbitEditor = true;
  scene.add(root);
  root.visible = false;
  const path = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xb3e8d2 }));
  root.add(path);
  const handles = Object.keys(LABELS).map((kind) => {
    const handle = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),
      new THREE.MeshBasicMaterial({ color: kind === "perigee" || kind === "apogee" ? 0xf0ce8d : 0xb3e8d2 }));
    handle.userData.kind = kind;
    const label = document.createElement("div");
    label.className = "orbit-handle-label";
    const annotation = new CSS2DObject(label);
    annotation.center.set(0.5, -0.7);
    handle.add(annotation);
    root.add(handle);
    return { handle, annotation, label, kind };
  });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let name = null, orbit = null, drag = null, busy = false;

  function update() {
    if (!orbit) return;
    const axes = orbitAxes(orbit), radii = orbitRadii(orbit);
    const outer = radii.apogee / 6371;
    path.geometry.dispose();
    path.geometry = new THREE.BufferGeometry();
    path.geometry.setAttribute("position", new THREE.Float32BufferAttribute(orbitCurve(orbit), 3));
    for (const { kind, handle, label } of handles) {
      if (kind === "perigee") handle.position.copy(axes.p).multiplyScalar(radii.perigee / 6371);
      if (kind === "apogee") handle.position.copy(axes.p).multiplyScalar(-outer);
      if (kind === "raan") handle.position.copy(axes.node).multiplyScalar(outer * 1.18);
      if (kind === "inclination") handle.position.copy(axes.quadrature).multiplyScalar(outer * 1.18);
      if (kind === "argp") handle.position.copy(axes.p).multiplyScalar(outer * 1.4);
      const value = kind === "perigee" || kind === "apogee"
        ? `${(radii[kind] - ORBIT_EARTH_KM).toFixed(0)} km`
        : `${(kind === "raan" ? orbit.raanDeg : kind === "inclination" ? orbit.inclinationDeg : orbit.argPerigeeDeg).toFixed(1)}°`;
      label.textContent = `${LABELS[kind]} · ${value}`;
    }
    root.updateMatrixWorld(true);
    onChange?.(name ? { name, orbit: { ...orbit }, busy } : null);
  }

  function ray(event) {
    const rect = element.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray;
  }

  function angleAt(kind, position, axes) {
    if (kind === "raan") return Math.atan2(-position.z, position.x);
    if (kind === "inclination") return Math.atan2(position.y, position.dot(axes.equatorialCross));
    return Math.atan2(position.dot(axes.q), position.dot(axes.p));
  }

  function down(event) {
    if (!name || busy || event.button !== 0) return;
    ray(event);
    const hit = raycaster.intersectObjects(handles.map((item) => item.handle), false)
      .find((entry) => !isOccluded(entry.point));
    if (!hit) return;
    const kind = hit.object.userData.kind;
    const axes = orbitAxes(orbit);
    const cameraNormal = camera.getWorldDirection(new THREE.Vector3());
    const planeNormal = kind === "raan" ? new THREE.Vector3(0, 1, 0)
      : kind === "inclination" ? axes.node : kind === "argp" ? axes.normal : cameraNormal;
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal,
      kind === "perigee" || kind === "apogee" ? hit.object.position : new THREE.Vector3());
    const start = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (!start) return;
    event.preventDefault(); event.stopImmediatePropagation();
    controls.enabled = false;
    const axis = axes.p.clone().multiplyScalar(kind === "apogee" ? -1 : 1);
    drag = { kind, axes, axis, plane, start, original: { ...orbit }, pointerId: event.pointerId,
      projectedLengthSq: Math.max(0.04, 1 - axis.dot(cameraNormal) ** 2),
      angle: angleAt(kind, start, axes) };
    element.setPointerCapture(event.pointerId);
    element.style.cursor = "grabbing";
  }

  function move(event) {
    if (!drag) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const hit = ray(event).intersectPlane(drag.plane, new THREE.Vector3());
    if (!hit) return;
    if (drag.kind === "perigee" || drag.kind === "apogee") {
      const deltaKm = hit.sub(drag.start).dot(drag.axis) * 6371 / drag.projectedLengthSq;
      orbit = changeApsis(drag.original, drag.kind, orbitRadii(drag.original)[drag.kind] + deltaKm);
    } else {
      const delta = wrap(angleAt(drag.kind, hit, drag.axes) - drag.angle) / DEG;
      const field = drag.kind === "raan" ? "raanDeg" : drag.kind === "inclination" ? "inclinationDeg" : "argPerigeeDeg";
      const value = drag.original[field] + delta;
      orbit = { ...drag.original, [field]: drag.kind === "inclination"
        ? Math.max(-180, Math.min(180, value)) : (value % 360 + 360) % 360 };
    }
    update();
  }

  async function commit(next) {
    if (busy || !name) return;
    const previous = orbit;
    orbit = { ...next }; busy = true; update();
    try {
      const result = await onCommit?.(name, orbit);
      if (result?.errors) orbit = previous;
    } finally { busy = false; if (name) update(); }
  }

  function end(event, cancel = false) {
    if (!drag) return;
    const original = drag.original;
    const pointerId = drag.pointerId;
    drag = null;
    controls.enabled = true;
    element.style.cursor = "";
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    if (event) { event.preventDefault(); event.stopImmediatePropagation(); }
    if (cancel) { orbit = original; update(); }
    else {
      const next = orbit;
      orbit = original;
      void commit(next);
    }
  }
  const up = (event) => end(event);
  const cancel = (event) => end(event, true);
  const key = (event) => { if (event.key === "Escape" && drag) cancel(event); };
  element.addEventListener("pointerdown", down, true);
  element.addEventListener("pointermove", move, true);
  element.addEventListener("pointerup", up, true);
  element.addEventListener("pointercancel", cancel, true);
  element.addEventListener("lostpointercapture", cancel, true);
  window.addEventListener("keydown", key, true);

  return {
    get name() { return name; },
    get busy() { return busy; },
    setOrbit(nextName, nextOrbit) {
      if (drag || busy) return;
      name = nextName; orbit = nextOrbit ? { ...nextOrbit } : null;
      root.visible = Boolean(name && orbit);
      if (root.visible) update(); else onChange?.(null);
    },
    commit,
    updateFrame(height) {
      if (!name) return;
      for (const { handle, annotation } of handles) {
        const scale = camera.position.distanceTo(handle.position) * Math.tan(camera.fov * DEG / 2) * 10 / Math.max(height, 1);
        handle.scale.setScalar(scale);
        annotation.visible = !isOccluded(handle.position);
      }
    },
    dispose() {
      end(null, true);
      element.removeEventListener("pointerdown", down, true);
      element.removeEventListener("pointermove", move, true);
      element.removeEventListener("pointerup", up, true);
      element.removeEventListener("pointercancel", cancel, true);
      element.removeEventListener("lostpointercapture", cancel, true);
      window.removeEventListener("keydown", key, true);
      root.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); object.element?.remove(); });
      root.removeFromParent();
    },
  };
}
