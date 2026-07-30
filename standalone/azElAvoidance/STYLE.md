# Standalone Library Style

Apply these rules to planner, workspace, collision, visualization, example,
and test code in this folder.

1. Keep the core algorithm inline in its main function and in execution
   order. Use section comments to mark substantial stages.
2. Fold a local helper into its caller when it has one call site. Fold a
   single-caller file into its caller unless that file is a public API.
3. Keep a helper only when multiple call sites share a nontrivial invariant
   and duplicating it would create a fix-one-copy risk. State that reason in
   a short comment near the helper.
4. Use variable names that identify the represented quantity and units.
   Avoid generic names such as `k`, `n`, `start`, `stop`, and `length` when
   a diagnostic name is available.
5. Do not end an assignment or comparison with `= ...`, `<= ...`, or a
   similar operator followed by a continuation line. Keep the assigned
   expression on that line or introduce a meaningful intermediate value.
6. Do not use `cellfun` or `arrayfun`. Prefer explicit loops or direct
   vectorized operations.
7. Comments explain reasons, invariants, legitimate empty cases, diagnostic
   meaning, and proof limitations. Do not narrate obvious assignments.
8. Display decimation must never alter planner state, collision data, or
   validation. Label visualization-only reductions where they occur.

Public entry points may remain separate even when one internal caller uses
them because their file boundary is part of the supported library API.
