# Results

`runFullBenchmark` writes `full_benchmark.csv`, `planner_diagnostics.csv`, and
`full_benchmark.mat` here. The runner asserts all independent validation and
behavioral columns; a partial or failing run is never promoted as final
evidence.

Latest fresh run: 15 of 15 rows passed. Every row reports `PlannerCalled=1`,
`ValidationPassed=1`, `AssertionsPassed=1`, and `Success=1`. Total reported
fixture time was 81.452 seconds; the maximum row was example 06 at 30.515
seconds. Across all rows the planner expanded 1,469 states, generated 10,249,
and issued 349,654 collision-point queries. Maximum peak live states were
1,575 and maximum estimated packed state storage was 34,860 bytes. The run
completed on 2026-08-03 and all machine-readable files were written by the
asserting harness.
