# Environment module

Provider-neutral sunlight, illumination, eclipse, and occultation calculations.

The first slice uses MathWorks `planetEphemeris` with JPL DE430 when the official
ephemeris data package is installed. If it is unavailable, the function emits a
warning and returns a clearly identified low-precision analytical direction for
visualization. That fallback must not be used for high-fidelity analysis.
