# Orekit integration

Optional Orekit-backed implementations of propagation, time, frame, event,
estimation, and related contracts. This is the only module allowed to call Orekit
Java APIs. Installing core mission modules does not require this integration.

Implemented contracts include a geocentric Sun direction and two-body Cartesian
satellite propagation. The integration also converts classical orbital elements to
the engine-neutral ITRF initial-state contract used by scenario composition:

```matlab
setupScenario("threejs");
epochUtc = datetime(2026, 1, 1, "TimeZone", "UTC");
sun = scenario.integrations.orekit.calculateSunDirection(epochUtc);

initialState = struct( ...
    "epoch", epochUtc, ...
    "frame", "ITRF", ...
    "position_m", [7000000, 0, 0], ...
    "velocity_m_s", [0, 7546, 0]);
sampleEpochsUtc = epochUtc + seconds((0:30:3600)');
trajectory = ...
    scenario.integrations.orekit.propagateSatelliteTrajectory( ...
        initialState, sampleEpochsUtc);

elements = struct( ...
    "EpochUtc", epochUtc, ...
    "Altitude_m", 500000, ...
    "Eccentricity", 0.001, ...
    "Inclination_deg", 51.6, ...
    "Raan_deg", 0, ...
    "ArgumentOfPerigee_deg", 0, ...
    "TrueAnomaly_deg", 0);
initialState = ...
    scenario.integrations.orekit.createSatelliteStateFromKeplerian(elements);
```

Install the pinned Orekit 13.1.6 runtime, Hipparchus 4.0.3 dependencies, and
official `orekit-data` before first use:

```powershell
./integrations/orekit/tools/installOrekitRuntime.ps1
```

Runtime JARs and downloaded data are intentionally excluded from source control.
The adapter returns only MATLAB values; Orekit Java objects never cross the module
boundary. The trajectory adapter uses Orekit's Keplerian propagator and transforms
the complete initial ITRF position and rotating-frame velocity into GCRF. It does
not yet include perturbations, maneuvers, drag, eclipse intervals, or ground
daylight intervals. Those higher-fidelity models must be added as explicit
providers rather than hidden substitutions.
