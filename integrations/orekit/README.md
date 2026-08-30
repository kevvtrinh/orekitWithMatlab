# Orekit integration

Optional Orekit-backed implementations of propagation, time, frame, event,
estimation, and related contracts. This is the only module allowed to call Orekit
Java APIs. Installing core mission modules does not require this integration.

The first implemented contract is an Orekit-backed geocentric Sun direction:

```matlab
setupScenario("threejs");
epochUtc = datetime(2026, 1, 1, "TimeZone", "UTC");
sun = scenario.integrations.orekit.calculateSunDirection(epochUtc);
```

Install the pinned Orekit 13.1.6 runtime, Hipparchus 4.0.3 dependencies, and
official `orekit-data` before first use:

```powershell
./integrations/orekit/tools/installOrekitRuntime.ps1
```

Runtime JARs and downloaded data are intentionally excluded from source control.
The adapter returns only MATLAB values; Orekit Java objects never cross the module
boundary. The current adapter calculates one epoch per call. Time-history export,
eclipse intervals, and ground daylight intervals are not implemented yet.
