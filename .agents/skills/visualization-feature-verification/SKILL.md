---
name: visualization-feature-verification
description: Verify new or changed interactive visualization features in this repository by exercising their controls and confirming MATLAB-backed outcomes, not appearance alone.
---

# Visualization Feature Verification

Use this skill whenever implementing, changing, or reviewing an interactive feature
in the MATLAB-hosted React and Three.js viewer.

Follow the repository `AGENTS.md` first. Keep MATLAB authoritative and run validation
in an isolated `matlab -batch` process so an existing MATLAB session is not altered.

## Required Evidence

Build the offline browser bundle, start the MATLAB localhost viewer, and exercise each
new or modified user control. For every control:

1. Trigger the control through the rendered interface.
2. Enter a representative valid value when the control accepts input.
3. Submit or complete the action.
4. Confirm the intended observable result, such as updated scenario name, interval,
   object count, object data, playback state, downloaded definition, or loaded scene.
5. Inspect browser diagnostics and the MATLAB host for errors.

For a related group of controls, verify the complete workflow as a user would. For
example, Save and Load require a round trip; opening both dialogs is not sufficient.

A screenshot or visual inspection is useful for layout and rendering quality, but it
does not count as functional verification. Do not report a feature as working merely
because its button or dialog is visible.

## Failure Handling

If an action is slow, ensure the interface gives visible busy feedback and wait long
enough for the authoritative MATLAB calculation. Distinguish slow completion from a
failed command.

When browser interaction cannot be performed, add or run the closest MATLAB and
transport integration tests, state exactly which UI action remains untested, and do
not claim end-to-end verification.

Record the actions exercised, observed results, failures, environment limits, and
anything not tested in the final verification summary.
