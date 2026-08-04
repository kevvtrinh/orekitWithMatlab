# Traceability

| ID | Contract | Authoritative source | Verification and evidence |
| --- | --- | --- | --- |
| REQ-IO | Validate neutral scenarios; preserve one result schema on every exit. | `planAzElTrajectory`, Sections 1, 7, 8 | schema, invalid-input, deadline, exhaustion, and success tests; full example report |
| REQ-STATIC | Avoid static polygon interiors and configured margin. | segment collision evaluator and independent validation | static wall, deep detour, corner, U-trap, and translated-layout tests |
| REQ-DYNAMIC | Use the same time-indexed obstacle policy in search and validation. | obstacle preparation and segment collision evaluator | event-time, moving polygon, safe-wait, and examples 04, 06, 10-15 |
| REQ-TIME | Time strictly increases; waits are stationary zero-jerk edges. | forward A* transitions and segment sampler | legal/illegal wait tests and stopped-interval examples |
| REQ-WRAP | Maintain unwrapped internal azimuth and one geometry/API wrap. | grid construction, collision boundary, sampler | bidirectional seam tests and example 07 |
| REQ-KINEMATICS | Enforce continuous velocity, acceleration, jerk, and position bounds. | constant-jerk evaluator and extrema checker | propagation/extrema/bounds tests and independent example validator |
| REQ-BOUNDARY | Preserve nonzero initial and requested terminal derivatives. | exact three-phase boundary connectors | nonzero start/terminal and join-continuity tests |
| REQ-GOAL | Use one predicate for fixed goals, intercepts, and tracking. | terminal-candidate builder and connector evaluation | fixed/moving predicate tests and examples 13-14 |
| REQ-REVERSE-DIJKSTRA | Build the spatial relaxation, multi-source seeds, and deterministic reverse heap. | `planAzElTrajectory`, Sections 2-3 | known-graph, stale-entry, multi-source, and projection-coverage tests |
| REQ-HEURISTIC | Match objective units and never overestimate finite-graph remaining cost. | reverse field lookup and objective conversion | exhaustive admissibility audit, consistency audit, and `h=0` comparison |
| REQ-FORWARD-ASTAR | Include future-relevant identity, reopen improvements, and terminate on the incumbent/open bound. | `planAzElTrajectory`, Section 4 | tiny-graph brute-force equality, reopen, tie, goal-bound, and repeatability tests |
| REQ-UNIFIED | Execute reverse Dijkstra and one forward A*; no legacy or fallback search. | core plus two translation-only facades | source scan and call-trace test for all examples |
| REQ-FAILURE | Distinguish invalid, deadline, finite-resolution, resource, and validation failures. | stable failure assessment | one test for each failure classification |
| REQ-RUNTIME | Enforce general resource budgets and expose phase/counter/memory evidence. | diagnostic assembly | full benchmark and profiler report |
| REQ-MAINTAINABILITY | Follow `STYLE.md`, centralize invariants, and remove dead algorithm paths. | all changed production files | Code Analyzer, source audit, dependency-before/after evidence |

The final acceptance report fills in exact test names, diagnostic columns, and
per-example rows after implementation. Requirements are not marked complete
merely because a source section exists.
