// The Earth has radius 1 in the scene. Scale angular input by clearance
// above the surface so a close-up drag stays precise instead of sweeping
// across whole continents. The overview keeps the chosen default speed.
export const OVERVIEW_ROTATE_SPEED = 0.4;
const OVERVIEW_CLEARANCE = Math.hypot(2.6, 1.5, 2.4) - 1;
const SURFACE_ROTATE_SPEED = 0.025;

export function earthRotationSpeed(cameraRadius) {
  if (!Number.isFinite(cameraRadius)) return OVERVIEW_ROTATE_SPEED;
  const zoomFraction = Math.max(0, Math.min(1, (cameraRadius - 1) / OVERVIEW_CLEARANCE));
  return SURFACE_ROTATE_SPEED + (OVERVIEW_ROTATE_SPEED - SURFACE_ROTATE_SPEED) * zoomFraction ** 0.8;
}
