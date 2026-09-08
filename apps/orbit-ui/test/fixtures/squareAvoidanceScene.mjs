// Keep the original square request paired with its recorded legacy result.
import { buildRenderScenario } from "../../src/lib/renderScenario.js";
import { expandAreaGrid } from "../../src/lib/spec.js";
import { gmstRad } from "../../src/lib/time.js";

export function squareAvoidanceScene() {
  const epochUtc = "2026-07-05T00:00:00Z";
  const raanDeg = (gmstRad(new Date(epochUtc))*180/Math.PI + 107 - 90 + 360) % 360;
  return buildRenderScenario({ version: 1, rev: 1,
    meta: { name: "Earth keep-out slew demo", epochUtc, durationSeconds: 180, stepSeconds: 1 },
    objects: [
      { kind: "satellite", name: "Slew Demo", color: "#e8a33d", propagator: "Keplerian", massKg: 1000,
        orbit: { type: "keplerian", semiMajorAxisKm: 7000, eccentricity: 0, inclinationDeg: 16, raanDeg, argPerigeeDeg: 0, trueAnomalyDeg: 90 },
        sensor: { coneHalfAngleDeg: 2, fieldOfRegardDeg: 60, slewRateDegPerSec: 2, pointing: "Nadir" } },
      { kind: "target", name: "South Target", latitudeDeg: 15, longitudeDeg: 107, altitudeM: 0, priority: 5 },
      { kind: "groundStation", name: "North Station", latitudeDeg: 17, longitudeDeg: 107, altitudeM: 0, minElevationDeg: 10 },
      ...expandAreaGrid({ name: "Vietnam keep-out", centerLatDeg: 16, centerLonDeg: 107, widthKm: 80, heightKm: 80, spacingKm: 50, priority: 5 }),
    ], tasks: [], accessRequests: [],
  }, null);
}
