import { buildRenderScenario } from "./renderScenario.js";
import { sampleCountryArea } from "./countryAreas.js";
import { gmstRad } from "./time.js";

export const VIETNAM_COUNTRY_CODE = "VNM";

export function avoidanceSpec(vietnam) {
  if (vietnam?.code !== VIETNAM_COUNTRY_CODE) throw new Error("The avoidance demo needs the Vietnam country boundary.");
  const epochUtc = "2026-07-05T00:00:00Z";
  // Place the spacecraft just west of Vietnam. The complete country remains
  // above the horizon while the two endpoint sightlines cross the mainland.
  const raanDeg = (gmstRad(new Date(epochUtc))*180/Math.PI + 95 - 90 + 360) % 360;
  const keepout = sampleCountryArea(vietnam, { name: "Vietnam keep-out", spacingKm: 250, priority: 5 });
  return { version: 1, rev: 1, meta: { name: "Earth keep-out slew demo", epochUtc, durationSeconds: 180, stepSeconds: 1 },
    objects: [
      { kind: "satellite", name: "Slew Demo", color: "#e8a33d", propagator: "Keplerian", massKg: 1000,
        orbit: { type: "keplerian", semiMajorAxisKm: 15000, eccentricity: 0, inclinationDeg: 16, raanDeg, argPerigeeDeg: 0, trueAnomalyDeg: 90 },
        sensor: { coneHalfAngleDeg: 2, fieldOfRegardDeg: 60, slewRateDegPerSec: 2, pointing: "Nadir" } },
      { kind: "target", name: "West Target", latitudeDeg: 16, longitudeDeg: 100, altitudeM: 0, priority: 5 },
      { kind: "groundStation", name: "East Station", latitudeDeg: 16, longitudeDeg: 115, altitudeM: 0, minElevationDeg: 10 },
      ...keepout.targets,
    ], areas: [keepout.area], tasks: [], accessRequests: [] };
}
export const avoidanceScene = (vietnam) => buildRenderScenario(avoidanceSpec(vietnam), null);
