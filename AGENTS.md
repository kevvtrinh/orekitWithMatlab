# Repository Instructions

## Purpose

These instructions apply to every file in this repository unless a more specific
`AGENTS.md` exists in a subdirectory.

Develop this repository slowly, one module at a time. Finish, document, test, and
validate the active module before beginning another. Prefer independently removable
modules, stable public contracts, explicit dependencies, and general behavior over
scenario-specific shortcuts.

## Priority Order

When requirements compete, use this order:

1. Correctness and physical validity.
2. General behavior across unseen scenarios.
3. Clear diagnostics and reproducibility.
4. Module independence and replaceability.
5. A small, stable public interface.
6. Maintainability and readability.
7. Runtime and memory efficiency.
8. Visual polish.

Never hide a limit, violation, fallback, substitution, approximation, or unfavorable
result. Do not claim verification that was not performed.

## Module Development

- Work on only the module requested by the user and its strictly necessary contracts.
- Do not preimplement neighboring modules merely because the architecture mentions
  them.
- Each module must be usable and testable with only its declared required modules.
- Required and optional dependencies must be explicit and acyclic.
- Cross-module calls use public contracts. Never call another module's internal code.
- Optional providers are passed explicitly through constructors, requests, or factory
  composition. Do not silently discover them from the MATLAB path.
- Removing a module must not break modules that do not declare it as a dependency.
- Orekit Java calls and objects are confined to `integrations/orekit`.
- Three.js is confined to `integrations/threejs` and performs rendering, not
  authoritative mission analysis.
- Analysis modules must not depend on visualization modules.
- Public module boundaries exchange MATLAB values or documented contract objects,
  never Orekit Java objects or renderer-specific objects.

A module is complete when its applicable public API, tests, example, README,
dependency manifest, validation evidence, and known limitations are present.

## Design Style

- Prefer pure functions for calculations, transforms, validation, conversion, and
  provider-neutral algorithms.
- Use value classes for domain values that must preserve invariants, such as epochs,
  frames, intervals, states, and regions.
- Use handle classes only where identity, ownership, or mutable lifecycle is
  essential, such as `Scenario`, viewer sessions, or managed platform collections.
- Favor composition over deep inheritance. Sensors attach to platforms through
  mounts; targets do not become platforms merely to reuse behavior.
- Keep public classes small. Delegate scientific work to independently testable
  functions or services.
- Do not add an option unless it represents a meaningful user choice.
- Do not infer frames, epochs, time scales, coordinate ordering, or units.
- Keep propagation, geometry, access, validation, and visualization separate.
- Prefer maintained MATLAB and installed MathWorks toolbox functions over custom
  reimplementations when they provide the required convention and fidelity. Examples
  include `lla2ecef`, `ecef2lla`, `datetime`, and documented coordinate transforms.
- Before using a toolbox function, verify its documented units, coordinate ordering,
  frame convention, reference ellipsoid, release availability, and edge behavior.
- Declare required MathWorks products in the owning module manifest and report an
  actionable error when a required toolbox is unavailable. Do not silently switch to
  a lower-fidelity custom implementation.
- Wrap toolbox calls at the module boundary when a stable project convention or
  future provider replacement is needed. Do not wrap functions merely to rename them.

## MATLAB Files

- Keep one public function or one public class per file. Match the filename exactly.
- Put reusable public functions in the appropriate `+scenario` package.
- Put implementation details in a module-local `+internal` or `private` location.
- Keep the main operation in execution order. Retain a local helper only when it
  centralizes a nontrivial invariant or materially improves readability.
- Put local functions after the primary implementation.
- Avoid global state and implicit current scenarios, frames, epochs, or providers.

## Public Function Headers

Every public MATLAB function begins immediately after its complete declaration with:

```matlab
%% Section 0: Header & Readme
```

Document supported call forms under `SYNTAX`, followed by these blocks in this exact
order:

1. `PURPOSE`
2. `INPUTS`
3. `OUTPUTS`
4. `UNITS`

Separate blocks with `%` followed by 74 asterisks:

```matlab
function result = calculateThing(requiredInput, optionOverrides)
%% Section 0: Header & Readme
% SYNTAX
%   result = calculateThing(requiredInput)
%   result = calculateThing(requiredInput, optionOverrides)
%**************************************************************************
% PURPOSE
%   - Describe one behavior-oriented responsibility.
%**************************************************************************
% INPUTS
%   - requiredInput (type and shape)
%       Describe its meaning, ordering, constraints, and reference frame.
%   - optionOverrides (scalar struct, optional; default struct())
%       Describe each accepted field and default.
%**************************************************************************
% OUTPUTS
%   - result (type and shape)
%       Describe fields, empty behavior, and expected failure behavior.
%**************************************************************************
% UNITS
%   - State every physical unit and array ordering used by the interface.
%**************************************************************************
```

List only call forms the function implements. Include a zero-input defaults call only
when it exists. Document optional and empty behavior, coordinate ordering, frames,
time scales, units, and important cross-field constraints beside the affected input.

Public class files must provide a class help block describing purpose, construction,
ownership semantics, and units. Public methods require concise MATLAB help text with
inputs, outputs, units, frames, and failure behavior. Use the full function template
for substantial static computational methods when it improves generated help.

Local functions require one to five concise comment lines immediately below their
declarations rather than the complete public header.

## Executable Sections

Use numbered, title-cased sections in execution order for substantial public
functions and scripts:

```matlab
%% Section 1: Validate Inputs & Apply Defaults
%% Section 2: Prepare The Calculation
%% Section 3: Perform The Calculation
%% Section 4: Validate The Result
%% Section 5: Assemble The Output
%% Section 6: Local Functions
```

Use operation-specific titles rather than vague names such as `Process` or
`Miscellaneous`. Do not place `%%` sections inside loops or conditionals. For visible
internal stages, use a descriptive divider comment:

```matlab
% --- Transform Boundary Into Sensor Frame ------------------------
```

Renumber sections whenever execution order changes.

## Naming

- Use descriptive lower-camel-case names for functions and local variables.
- Use PascalCase for classes, enumerations, and documented status/result fields.
- Use `create` as the construction verb. Do not alternate among `build`, `make`, and
  `generate` for equivalent operations.
- Retain precise verbs such as `calculate`, `convert`, `evaluate`, `query`,
  `propagate`, `transform`, and `validate` where they describe different operations.
- Spell words out. Prefer `maximumSampleCount` to `maxSampCnt`.
- Use singular names for one value and plural names for collections.
- End indices with `Index`, counts with `Count`, and graphics handles with `Handle` or
  `Handles`.
- Boolean names read as assertions or controls: `isVisible`, `hasEphemeris`,
  `showSensorVolume`, and `allowInterpolation`.
- Give constants and tolerances descriptive names. Do not leave unexplained magic
  numbers in scientific code.
- Use familiar scenario-analysis terms consistently: `Scenario`, `Satellite`,
  `Aircraft`, `Ship`, `GroundVehicle`, `Facility`, `Place`, `Target`, `Sensor`,
  `Access`, `Chain`, `Constellation`, and `CoverageDefinition`.

## Units, Time, Frames, and Shapes

- State units in every public interface and plot label.
- Numeric physical quantities use readable suffixes where ambiguity is possible:
  `_m`, `_km`, `_s`, `_m_s`, `_m_s2`, `_deg`, `_rad`, `_deg_s`, and `_rad_s`.
- Extend the same pattern for compound units. Dimensionless quantities have no unit
  suffix.
- Every state and trajectory identifies its epoch, time scale, reference frame, and
  coordinate ordering.
- Normalize row/column orientation at public boundaries.
- Document history orientation, for example N-by-3 Cartesian positions.
- Use explicit empty shapes such as `zeros(0, 3)` where column meaning matters.
- Never convert units, frames, or time scales implicitly merely to make inputs fit.

## Options

- Resolve defaults in exactly one place.
- A public function with argument-independent defaults may support a zero-input call
  returning the complete defaults structure.
- Accept omission and `[]` consistently for optional override inputs.
- Partial option structures are valid when documented. Empty fields receive defaults.
- Warn once per call about unknown fields, list them, and ignore them.
- Normalize and validate options before the main calculation.
- Echo resolved options in a result when they materially affect reproducibility.
- Normalize scalar text to MATLAB strings unless an API requires character vectors.

## Validation, Errors, and Warnings

- Validate public numeric type, shape, finiteness, orientation, bounds, and related
  array sizes before the main calculation.
- Use `validateattributes` for straightforward numeric checks and identified errors
  for structural or cross-field failures.
- Errors and warnings use the emitting function or class plus a PascalCase problem:

```matlab
error("calculateAccess:FrameMismatch", ...)
warning("propagateState:UnknownOptions", ...)
```

- Messages identify the affected input, expected form, relevant unit or frame, and
  observed value when useful.
- Expected analytical outcomes such as no access or an empty interval set are values,
  not errors.
- Reserve errors for invalid inputs, unsupported configurations, unavailable required
  providers, or corrupt internal state.
- Warn when requested samples, geometry, fidelity, or behavior are reduced, dropped,
  approximated, or ignored and the returned value alone would not reveal it.
- Do not clip or alter an invalid scientific result and then report success.

## Results and Diagnostics

- Keep public result fields stable on success, failure, and empty outcomes.
- Use documented empty values rather than omitting fields conditionally.
- Include provenance needed to reproduce scientific results: resolved inputs,
  providers, model configuration, data versions, frames, epochs, tolerances, and
  elapsed time where applicable.
- Return diagnostics sufficient to understand an unavailable or empty result without
  rerunning the calculation.
- Distinguish calculation validity, scientific validation, and software execution
  status.

## Comments

- Comments explain why, the protected invariant, an approximation, or the consequence
  of a choice. Do not narrate obvious code.
- Explain every non-obvious tolerance, constant, deliberate asymmetry, and numerical
  approximation at its point of use.
- If a helper centralizes an invariant, explain what could diverge if callers
  duplicated it.
- Keep `%#ok<...>` suppressions local and explain non-obvious suppressions.

## Formatting

- Target approximately 78 characters per line. Treat 100 characters as a hard limit
  except for an unbreakable identifier or URL.
- Indent block bodies four spaces. Do not use tabs or trailing whitespace.
- Put one statement on each line with spaces after commas and around binary operators.
- Continue long expressions with `...` and indent continuations consistently.
- Prefer named intermediate assertions over long compound conditions.
- In multiline `struct(...)` calls, normally use one field/value pair per line.
- Use double-quoted strings for semantic text, identifiers, enumerations, and field or
  property names. Use character vectors only where required by a MATLAB API.
- Do not use `cellfun` or `arrayfun`. Prefer clear vectorization or an explicit loop
  with a descriptive index.
- Avoid broad formatting changes and unrelated refactors in focused work.

## Cyclomatic Complexity

- Keep cyclomatic complexity as low as practical in every function and method.
- Target a cyclomatic complexity of 10 or less. Treat a higher value as a design
  warning that requires either refactoring or a documented justification.
- Prefer early validation and guard clauses over deeply nested conditionals.
- Keep nesting shallow. Refactor when a function regularly exceeds three nested
  control-flow levels.
- Replace repeated condition trees with data-driven tables, strategy functions, or
  polymorphic providers when those forms remain clearer.
- Separate validation, normalization, calculation, and result assembly instead of
  interleaving their branches.
- Extract a helper only when it gives a branch group one coherent responsibility or
  centralizes an invariant. Do not scatter a readable calculation among trivial
  one-line helpers merely to improve a metric.
- Avoid boolean control arguments that create multiple unrelated execution paths.
  Prefer explicit options, strategies, or separate public operations when behavior is
  semantically distinct.
- Do not reduce measured complexity by hiding branching in anonymous functions,
  callbacks, duplicated code, or undocumented dynamic dispatch.
- When modifying an already complex function, do not increase its complexity unless
  the change requires it and the reason is reported. Prefer leaving it simpler than
  it was found.
- Review available complexity or Code Analyzer results for modified MATLAB files and
  report any remaining high-complexity functions in the verification summary.

## Visualization

- Visualization consumes analysis results; it does not rerun propagation, access, or
  coordinate transformations.
- Pass axes and viewer handles explicitly. Do not rely on `gca` or hidden global
  graphics state.
- Use `figureHandle`, `axesHandle`, and plural `Handles` consistently.
- Put units and frames in axes labels or visible annotations.
- Set `hold`, `grid`, `box`, and spatial scaling explicitly where relevant.
- Respect figure visibility and animation controls. Hidden figures do not pause merely
  to simulate animation.
- MATLAB owns authoritative scenario data. Three.js receives ready-to-render,
  time-tagged data and returns display interaction events only.

## Tests and Examples

- Tests are deterministic. Set and report random seeds when randomness is used.
- Test nominal, empty, boundary, invalid-input, and unavailable-provider behavior as
  applicable.
- Independently validate scientific results rather than trusting a success flag.
- Verify units, epochs, time scales, frames, tolerances, and array shapes.
- Test modules without optional dependencies installed or added to the MATLAB path.
- Test integration adapters against their declared external-engine versions.
- Runnable examples call public production APIs and visibly define their important
  inputs, providers, options, and expected behavior.
- Examples may define a specific scenario; reusable helpers remain scenario-neutral.
- Visualization consumes returned results and must not contain hidden analytical
  knowledge required for correctness.

## Verification and Change Discipline

Before considering a change complete:

1. Inspect existing interfaces and call sites before editing.
2. Run available MATLAB syntax/static checks for modified files.
3. Run focused tests for the active module.
4. Run its maintained examples headlessly when practical.
5. Run scientific validation cases affected by the change.
6. Test with optional integrations absent when the module claims independence.
7. Report commands run, passes, failures, environment limits, and untested items.

Do not weaken assertions, enlarge tolerances, lower model fidelity, or alter expected
results merely to obtain a passing run. Preserve user changes and avoid unrelated
edits. Keep generated files, downloaded datasets, temporary output, and runtime
artifacts out of source control.

## Completion Checklist

A change is complete only when all applicable answers are yes:

- Is it confined to the active module and necessary contracts?
- Is the implementation general rather than tailored to a named example?
- Are dependencies explicit, minimal, and acyclic?
- Can unrelated modules run with this module absent?
- Are units, frames, epochs, time scales, shapes, and tolerances explicit?
- Are expected empty and failure outcomes honest and diagnosable?
- Do tests cover the relevant success, empty, boundary, and invalid cases?
- Was scientific behavior independently validated where applicable?
- Are documentation and examples consistent with the public API?
- Were verification limits and untested cases reported honestly?
