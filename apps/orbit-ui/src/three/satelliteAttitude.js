import * as THREE from "three";

const crossTrack = new THREE.Vector3();
const zenith = new THREE.Vector3();
const alongTrack = new THREE.Vector3();
const basis = new THREE.Matrix4();

// Illustrative nadir attitude: the sensor mounts on -Y, the solar-panel
// span is X (normal to the orbital plane), and +Z follows tangential motion.
// Position and velocity must be in the same world frame.
export function orientSatelliteBody(quaternion, position, velocity) {
  if (position.lengthSq() === 0) return quaternion.identity();
  zenith.copy(position).normalize();
  alongTrack.copy(velocity).addScaledVector(zenith, -velocity.dot(zenith));
  if (alongTrack.lengthSq() < 1e-16) {
    // A single/static sample has no flight direction. Choose a stable
    // perpendicular axis while preserving the Earth-facing payload.
    alongTrack.set(0, Math.abs(zenith.y) > 0.9 ? 0 : 1, Math.abs(zenith.y) > 0.9 ? 1 : 0);
    alongTrack.addScaledVector(zenith, -alongTrack.dot(zenith));
  }
  alongTrack.normalize();
  crossTrack.crossVectors(zenith, alongTrack).normalize();
  alongTrack.crossVectors(crossTrack, zenith).normalize();
  basis.makeBasis(crossTrack, zenith, alongTrack);
  return quaternion.setFromRotationMatrix(basis);
}
