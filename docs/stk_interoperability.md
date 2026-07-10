# STK interoperability bundles

`saveScenario` preserves the complete mission in its native MAT representation
and, by default, calls `exportStkScenario` to create a sibling STK bundle. The
bundle deliberately uses documented interchange formats instead of attempting
to hand-author STK's private scenario and object-file grammars.

## Artifact mapping

| Suite data | STK artifact | Frame and units |
| --- | --- | --- |
| Satellite ephemeris | `.e`, `EphemerisTimePosVel` | ICRF-aligned GCRF, meters and m/s, epoch seconds |
| Suite satellite body frame | `.a`, `AttitudeTimeQuaternions` | ICRF reference axes; STK vector-first/scalar-last quaternion |
| Resolved sensor pointing | `.sp`, `AttitudeTimeQuaternions` | Earth Fixed reference axes; sensor +Z is boresight |
| Custom sensor boundary | `.pattern` | Az/el or half-angle/azimuth boundary |
| Ground horizon mask | `.aem` | Degrees, normalized from 0 through 360 degrees |
| Facilities, places, targets, areas, and sensor shapes | Connect commands | Geodetic meters/degrees and native sensor definitions |

Sensor pointing is sampled at the propagated/configured time grid plus exact
scheduled task start and stop times. It uses `resolveSensorPointing`, so point
tracking and area-scan tasking are represented in the `.sp` history. Specifying
`CoordinateAxes Fixed` keeps that pointing independent of the parent attitude.

## Attitude provenance

`SatelliteObject.Attitude` is currently descriptive; the suite does not store
a commanded or measured quaternion history. The exported `.a` is therefore
explicitly marked as synthesized. It reproduces the body frame currently used
by `SensorObject.bodyVectorToECEF`:

- +Z is radial outward;
- +X follows Earth-fixed ground-track motion; and
- +Y completes the right-handed frame.

This convention preserves the suite's mounted-sensor behavior, where the
default sensor boresight is body -Z. It should not be presented as flight
attitude telemetry.

## Creating an STK scenario and VDF

The bundle's `loadStkBundle.m` is standalone. It attaches to or starts STK
Desktop, refuses to overwrite an already-open scenario, resolves portable
bundle paths, executes the generated Connect file, and asks STK to save an
editable `.sc`. By default it then saves a Viewer-compatible `.vdf` through
the STK object model's documented `SaveAs` call:

```matlab
loadStkBundle(pwd)
```

Use `loadStkBundle(pwd, "CreateVdf", false)` when only the editable STK
scenario is wanted. `DryRun=true` resolves and returns the Connect command
stream without starting STK.

The free STK Viewer accepts VDF packages, not loose external data files. An
installed STK runtime is therefore required once to author the VDF. This is an
STK product constraint, not a limitation that can be bypassed by renaming or
zipping the interchange files.

## Partial scenarios

Saving never mutates or propagates the caller's scenario. An unpropagated
satellite is included in the manifest and Connect object tree, but it has no
`.e`, `.a`, or satellite-attached `.sp` files; the manifest records a warning.
Propagate before saving when the STK copy must contain trajectories.

Moving `TargetObject` trajectories are not equivalent to fixed STK Target
objects. They currently export at their stored geodetic location; use a
satellite/vehicle ephemeris workflow when moving-target fidelity is required.

## Format references

- [STK ephemeris files](https://help.agi.com/stk/Content/stk/importfiles-02.htm)
- [STK attitude files](https://help.agi.com/stk/Content/stk/importfiles-01.htm)
- [STK sensor pointing files](https://help.agi.com/stk/Content/stk/importfiles-07.htm)
- [STK custom sensor patterns](https://help.agi.com/stk/Content/stk/sncustom-03.htm)
- [STK azimuth/elevation masks](https://help.agi.com/stk/Content/stk/importfiles-06.htm)
- [STK VDF authoring](https://help.agi.com/stk/Content/stk/author.htm)
