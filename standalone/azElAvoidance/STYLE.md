# Standalone Az/El Avoidance Style

This folder remains function-oriented. Packed obstacle data and planner results
are structures; no class definitions or handle wrappers belong in this folder.
Keep the main algorithm inline and in execution order. Retain a local helper
only when several call sites share a nontrivial invariant or when folding it
into the caller would obscure the main algorithm.

## 1. Function headers

Every function begins immediately after its declaration with:

```matlab
%% Section 0: Header & Readme
```

The help block lists every supported call form under `SYNTAX`, followed by the
four required sections in this order: `PURPOSE`, `INPUTS`, `OUTPUTS`, and
`UNITS`. The separator is `%` followed by 74 asterisks. Purpose entries use
`%   -` bullets. Arguments use `%   - name (type)`, with descriptions on the
next line and structure fields nested one level deeper. Put caveats beside the
argument or field they govern rather than in a separate notes section.

## 2. Executable sections

Top-level sections use numbered, title-cased headings in execution order:

```matlab
%% Section 1: Validate Inputs & Apply Defaults
%% Section 2: Build The Search Representation
%% Section 3: Run Dijkstra
%% Section 4: Assemble The Output
%% Section 5: Local Functions
```

Do not place `%%` sections inside loops or conditionals. Use dashed comments
for internal stages:

```matlab
% --- Broad-Phase Reject Box ---------------------------------------
```

A short helper that reads as one idea needs no executable sections.

## 3. Naming and units

Spell words out. Use `maximumVertices`, not `maxVerts`, and
`neighborElevationIndex`, not `nbrElIdx`. Physical quantities carry unit
suffixes:

| Suffix | Meaning |
| --- | --- |
| `_deg` | degrees |
| `_s` | seconds |
| `_deg_s` | degrees per second |
| `_deg_s2` | degrees per second squared |
| `_deg2` | degrees squared |
| `_1_deg` | per degree |
| `_rad` | radians |
| `_rad_s` | radians per second |

Dimensionless values have no suffix. Boolean names read as assertions, such as
`isUniformTime`, `edgeHasLength`, and `terminalDynamicsAreInsideLimits`.

The packed container is `obstacleField`, with plural members such as
`obstacleField.Obstacles`. Public planner fields use lower camel case. Packed
records and diagnostic records use Pascal case.

Error and warning identifiers use the emitting function and a Pascal-case
problem name:

```matlab
error("buildAzElTimeObstacleField:BoundaryCountMismatch", ...)
warning("smoothAzElPlan:PathLengthIncreased", ...)
```

## 4. Options structures

A public function with argument-independent defaults supports a zero-argument
call that returns a fully populated options structure. One local defaults
function is the only source of truth. Partial structures remain valid; omitted
or empty fields receive defaults. Unknown fields warn once and are ignored.
Echo resolved options on the returned record.

When defaults depend on an argument, support an explicit defaults request:

```matlab
options = planAzElDijkstra(limits, "defaults");
```

## 5. Validation

Validate conditions whose failure would otherwise be silent or appear far
downstream: required fields, structural types, strictly increasing time,
algorithm-dependent domains, and bounds that would silently discard data.
Use `validateattributes` for numeric arguments and explicit identified errors
for structural failures. Include the affected index and actual counts or values
when useful.

Do not duplicate expensive validation already performed naturally by the main
packing or search loop. State deliberate tolerance of ragged or nonfinite input
where the behavior is not obvious.

## 6. Warnings

Warn when geometry, samples, or requested behavior are silently reduced,
dropped, or ignored and the return value alone would not reveal it. Accumulate
counts inside loops and warn once per obstacle or result. State the consequence,
not merely the event. Distinguish an expected tradeoff from an implementation
defect.

## 7. Comments

Comments explain why, the invariant being protected, or the consequence of a
choice. Do not narrate code that already states what it does. Explain every
non-obvious tolerance, magic constant, and deliberate asymmetry at the point of
use. A shared helper states which invariant would diverge if duplicated.

## 8. Return schemas

Every exit path returns the same public fields. Construct failures and empty
results from one template helper. Preallocate record arrays from the same
template. When final size is unknown, grow storage geometrically and trim once.

## 9. Layout

Target about 78 characters per line. Continue long expressions with `...` and
indent continuations four spaces. Replace long multi-line conditions with named
intermediate assertions when that improves debugging and readability.

Do not end a line with an assignment or comparison operator followed only by
`...`. Put the first meaningful term on that line or name an intermediate
quantity. This keeps the operation visible when scanning vertically.

Do not use `cellfun` or `arrayfun` in this folder. Prefer a vectorized operation
when it remains readable; otherwise use an explicit loop with a diagnostic
index name such as `sampleIndex`, `obstacleIndex`, or `regionIndex`.

## 10. Renaming and migration

A public rename keeps the previous spelling for one release. New plans expose
`plan.obstacleField`; deprecated `plan.workspace` remains a compatibility alias.
`buildAzElTimeObstacleWorkspace` forwards to
`buildAzElTimeObstacleField`. Collision queries accept both the preferred and
legacy packed-format tags. Mark every shim with `deprecated` so cleanup is one
search.

Automated replacement does not understand compatibility branches. Review diffs
containing `isfield`, format-tag checks, and fallbacks by hand after every
public rename.

## 11. Data structures, not classes

Keep packed obstacles and planner results as structures. Hoist packed arrays
into local variables before inner loops rather than repeatedly dereferencing
structure fields. Visualization consumes the same packed obstacle field used by
collision checking so displayed geometry and collision geometry cannot diverge.

## 12. Examples, benchmarks, and tests

Numbered examples follow one visible progression: construct canonical data,
define the planning request, run the maintained planner, independently validate
the command, then animate and report. Fold one-call state/default constructors
into this progression. Retain a geometry helper only when its vertex-level
details would obscure the scenario flow, and state that reason beside it.

Randomized generators preserve seeded draw order during readability changes.
Never regenerate a case because planning failed. Benchmarks report both the
seed or input scale and the evidence needed to reproduce a result.

Test entry points use the same Section 0 contract. Individual local test cases
remain ordinary function-based tests; descriptive test names are their header.
