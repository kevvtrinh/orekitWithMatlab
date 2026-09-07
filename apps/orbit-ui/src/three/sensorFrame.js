import * as THREE from "three";

const DEG = Math.PI / 180;
export function configureSensorCamera(camera, position, direction, velocity, halfAngleDeg, aspect) {
  const forward = direction.clone().normalize();
  const up = velocity.clone().addScaledVector(forward, -velocity.dot(forward));
  if (up.lengthSq() < 1e-16) {
    up.set(0, 1, 0).addScaledVector(forward, -forward.y);
    if (up.lengthSq() < 1e-16) up.set(1, 0, 0).addScaledVector(forward, -forward.x);
  }
  // A rectilinear camera cannot represent a 180-degree field. Explicitly
  // report the crop for very wide sensors rather than changing their spec.
  const displayHalfAngle = Math.min(85, halfAngleDeg);
  camera.aspect = aspect;
  camera.fov = 2 * Math.atan(Math.tan(displayHalfAngle * DEG) * 1.08 / Math.min(1, aspect)) / DEG;
  camera.position.copy(position);
  camera.up.copy(up).normalize();
  camera.lookAt(position.clone().add(forward));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return { cropped: halfAngleDeg > 85, reticleFraction: 1 / 1.08 };
}

// Unit-Earth geometric visibility for display annotations. This deliberately
// does not claim terrain visibility, detection, or access-constraint validity.
export function projectSensorPoint(point, camera, halfAngleDeg, { clipViewport = true, clipFov = true } = {}) {
  const delta = point.clone().sub(camera.position);
  const distance = delta.length();
  if (distance < 1e-12) return null;
  const local = delta.clone().applyQuaternion(camera.quaternion.clone().invert());
  if ((clipFov && -local.z / distance < Math.cos(halfAngleDeg * DEG) - 1e-10) || local.z >= 0) return null;
  const ray = new THREE.Ray(camera.position, delta.divideScalar(distance));
  const hit = ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(), 1), new THREE.Vector3());
  if (hit && hit.distanceTo(camera.position) < distance - 1e-7) return null;
  const projected = point.clone().project(camera);
  if (clipViewport && (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1)) return null;
  return { x: (projected.x + 1) / 2, y: (1 - projected.y) / 2, rangeKm: distance * 6371,
    azDeg: Math.atan2(local.x, -local.z) / DEG,
    elDeg: Math.atan2(local.y, Math.hypot(local.x, local.z)) / DEG,
    offBoresightDeg: Math.acos(THREE.MathUtils.clamp(-local.z / distance, -1, 1)) / DEG,
    bearingDeg: (Math.atan2(local.x, local.y) / DEG + 360) % 360 };
}

export function sensorFovBoundary(halfAngleDeg, samples = 128) {
  const half = halfAngleDeg * DEG;
  return Array.from({ length: samples + 1 }, (_, i) => {
    const bearing = 2 * Math.PI * i / samples;
    return { azDeg: Math.atan2(Math.sin(half) * Math.sin(bearing), Math.cos(half)) / DEG,
      elDeg: Math.asin(Math.sin(half) * Math.cos(bearing)) / DEG,
      offBoresightDeg: halfAngleDeg, bearingDeg: bearing / DEG };
  });
}
