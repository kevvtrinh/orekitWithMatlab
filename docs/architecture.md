# Architecture

The suite is backend-first. MATLAB scripts, tests, and future UI callbacks all call the same backend classes and functions under `src/`.

The main dependency direction is:

1. `core` owns scenario configuration and object containers.
2. `objects` owns satellites, ground stations, and future sensors.
3. `orekit` is the only layer that directly calls Java/Orekit.
4. `analysis` calls `core`, `objects`, and `orekit` to propagate and compute access.
5. `visualization` and `io` consume backend results.
6. `ui` should only adapt control values to backend objects and display backend outputs.

No propagation, access, export, or Orekit Java calls should live in UI callbacks.

