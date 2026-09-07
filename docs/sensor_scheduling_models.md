# Sensor scheduling models and limits

Candidate feasibility checks the requested dwell and minimum duration after
applying task maximum duration and sensor maximum dwell. A task requiring N
sensors uses N distinct `(PlatformName, SensorName)` pairs. Simultaneous tasks
must fit each sensor's dwell into the common interval; reported dwell, data,
power, pointing endpoints and area estimates use that clipped interval.
Asynchronous cooperative members retain separate occupied intervals.

`SlewTimeSeconds` remains a nominal-pointing acquisition estimate for scoring
and display. It is not used as the transition between two scheduled targets.
Generated candidate tables additionally contain `SlewTransitionData`, a JSON
string that survives CSV export. It records each sensor's identity, occupied
interval in Unix seconds, start/stop unit pointing vectors in `ParentBody`,
rate and acceleration limits, settling time, and whether endpoints are known.
Limits use strings (including `"Inf"`) to survive JSON round trips.

For scalar limits, the transition follows the shortest angular separation
between the earlier target's stop direction and the later target's start
direction. The minimum rest-to-rest duration is

$$T=2\sqrt{\theta/a}\quad(\theta\le v^2/a),\qquad
T=\theta/v+v/a\quad(\theta>v^2/a).$$

Angles are degrees, rates degrees per second, and accelerations degrees per
second squared. Infinite limits remove their respective constraint. When
finite azimuth/elevation axis limits are supplied, the scheduler reserves a
conservative two-leg azimuth-then-elevation motion, stopping between legs;
each leg respects both scalar and axis limits. This can reject gaps that a
more sophisticated simultaneous-axis trajectory could use. Settling is added
once after the transition.

Parent coordinates use the existing `SensorObject.bodyVectorToECEF`
convention: the modeled orbital basis for satellites and local ENU for fixed
sites. No moving-parent attitude is inferred. Area scan estimates do not
define executable scan endpoints. Such resources keep occupancy metadata but
mark their slew geometry unknown.

With `EnforceSlew=true`, a shared-sensor transition lacking geometry reports
`UnknownSlewGeometry`; legacy nominal-angle estimates are never substituted.
Older tables without the metadata column remain readable. Explicitly set
`EnforceSlew=false` for occupancy-only scheduling or validation of those rows.
The same sensor name on different platforms denotes different resources.

These are endpoint rest-to-rest transition and occupancy checks, not complete
trajectory validation. They do not certify tracking rate continuity, moving
targets' tracking dynamics, jerk, slew-path obstacles, or initial acquisition
and final parking. Access remains sampled. Area coverage remains the existing
swath/dwell estimate; cooperative coverage uses the largest member estimate
as a conservative union bound instead of adding possibly duplicate points.
Candidate selection remains greedy and does not promise an optimal schedule.

Run the focused independent regressions with
`runtests('src/tests/testSchedulingMathematics.m')`. They use fixed geometry
and do not require Orekit JARs or data.
