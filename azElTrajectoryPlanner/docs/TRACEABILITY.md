# Requirement Traceability

| ID | Requirement | Authoritative code | Tests | Diagnostics | Benchmark evidence |
|---|---|---|---|---|---|
| REQ-IO | Validate neutral input and return identical fields on every exit | `planAzElTrajectory`, Sections 1 and 6 | `testStableSchemaOnSuccessAndFailure` | `failureAssessment`, `validation` | `results/full_benchmark.mat` |
| REQ-STATIC | Avoid arbitrary static polygon regions with margin | Sections 2, 3, 5; static-subset topology field and shared collision invariant | translated/reflected perturbations | collision query/rejection counters | examples 01–03, 05, 07–09, 15 |
| REQ-DYNAMIC | Apply nearest-slice plus neighbor-padding policy without extrapolation | Sections 2, 3, 5 | frozen dynamic integration rows | polygon queries, collision rejections | examples 04, 06, 10–15 |
| REQ-TIME | Strict forward time and legal stationary holds | Sections 3 and 4; validated terminal-dwell relocation | impossible-deadline and gate integration tests | wait mask, terminal-hold relocation flag | examples 06, 10, 11, 15 |
| REQ-WRAP | Maintain continuous internal azimuth and one wrap convention | Sections 1-5 | `testWrappedAzimuthUsesContinuousInternalCoordinate` | unwrapped output and wrap flag | wrapped fixture row |
| REQ-KINEMATICS | Enforce component velocity, acceleration, jerk, and C2 joins | quintic law and analytic extrema in Sections 3-5 | `testNonzeroBoundaryDerivativesAndAnalyticLimits` | maxima and rejected-edge counters | every successful row |
| REQ-BOUNDARY | Support nonzero initial and terminal derivatives | boundary connectors in Sections 3-4 | `testNonzeroBoundaryDerivativesAndAnalyticLimits` | boundary errors | moving-match rows |
| REQ-GOAL | Handle fixed, intercept, and tracking terminals through one core search | terminal-candidate layer in Section 3 | fixed and frozen moving-goal tests | candidate attempts/rejections | fixtures 13-14 |
| REQ-FAILURE | Separate proven deadline infeasibility from inconclusive exhaustion | Sections 1, 3, and 6 | `testImpossibleDeadlineIsProven`, `testBudgetExhaustionIsInconclusive` | `failureAssessment` | regression failures |
| REQ-RUNTIME | Enforce time/state budgets, analytic deadline pruning, and expose counters/timing | Sections 1, 3, and 6 | budget exhaustion | timing breakdown, deadline rejections, live-state estimate | 15 rows in 81.452 s; maximum row 30.515 s |
| REQ-MAINTAINABILITY | One core method, one segment law, no scenario recognition | full source and source scan | `runSourceAudit`; Code Analyzer | method and options | source findings 0; Code Analyzer messages 0 |

The checked-in evidence was produced by a successful fresh
`runFullBenchmark` on 2026-08-03: 15/15 planner calls, independent validations,
behavioral assertions, and overall rows passed. Low-level tests passed 5/5 and
translation/reflection/retiming perturbations passed 3/3.
