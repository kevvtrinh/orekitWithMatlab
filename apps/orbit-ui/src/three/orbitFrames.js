import { gmstRad } from "../lib/time.js";

const EARTH_RADIUS_KM = 6371;

// Both arrays use Three.js axes (X, Z, -Y), in Earth radii. The Earth-fixed
// history transforms EVERY sample at its own timestamp. Rotating the whole
// inertial ellipse at the current time is not an Earth-fixed trajectory.
// This uses the same display-level sidereal rotation as the Earth renderer;
// authoritative mission frame transformations remain in MATLAB/Orekit.
export function buildOrbitFramePositions(ephemeris, epochMs) {
  const ECI = new Float32Array(ephemeris.n * 3);
  const ECEF = new Float32Array(ephemeris.n * 3);
  for (let i = 0; i < ephemeris.n; i++) {
    const j = i * 3;
    const x = ephemeris.eci[j] / EARTH_RADIUS_KM;
    const y = ephemeris.eci[j + 1] / EARTH_RADIUS_KM;
    const z = ephemeris.eci[j + 2] / EARTH_RADIUS_KM;
    const angle = gmstRad(new Date(epochMs + ephemeris.t[i] * 1000));
    const c = Math.cos(angle), s = Math.sin(angle);
    ECI.set([x, z, -y], j);
    ECEF.set([c * x + s * y, z, s * x - c * y], j);
  }
  return { ECI, ECEF };
}
