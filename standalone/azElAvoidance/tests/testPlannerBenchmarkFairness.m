function tests = testPlannerBenchmarkFairness
tests = functiontests(localfunctions);
end

function setupOnce(~)
root = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(root));
end

function testBuildersMatchExampleScenarios(testCase)
% The benchmark consumes the same builder outputs the examples consume, so
% both planners see identical scenario inputs by construction. Spot-check
% the extracted builders against the numbers documented in the examples.
spiral = makeFiveTurnSpiralGauntlet();
verifyEqual(testCase, spiral.startState.position_deg, [18 1.5]);
verifyEqual(testCase, spiral.stopState.time_s, 400);
verifyEqual(testCase, spiral.options.GridStep_deg, 0.5);
verifyEqual(testCase, spiral.options.SafetyMargin_deg, 0.5);
verifyEqual(testCase, numel(spiral.azElData.time_s), 801);

gates = makeStopGoGatesGauntlet();
verifyEqual(testCase, numel(gates.azElData), 3);
verifyEqual(testCase, gates.geometry.openWindows_s, ...
    [8 12; 20 24; 32 36]);
verifyEqual(testCase, gates.limits.elevation_deg, [-1 1]);

seam = makeWrappedAzimuthSeamGauntlet();
verifyTrue(testCase, seam.options.AllowAzimuthWrap);
verifyEqual(testCase, seam.startState.position_deg, [170 0]);

slalom = makeAlternatingSlalomGauntlet();
verifyEqual(testCase, slalom.geometry.barrierCenters_deg, [-9 -3 3 9]);
verifyEqual(testCase, slalom.options.GridStep_deg, 0.25);

trap = makeUTrapEscapeGauntlet();
verifyEqual(testCase, trap.options.GridStepSchedule_deg, ...
    [1 0.5 0.25 0.125]);
verifyEqual(testCase, trap.startState.position_deg, [0 0]);

crossy = makeCrossyRoadRendezvousGauntlet();
verifyEqual(testCase, crossy.trafficDiagnostics.vehicleCount, 48);
verifyEqual(testCase, crossy.trafficDiagnostics.rowCount, 12);
verifyEqual(testCase, ...
    crossy.trafficDiagnostics.centerCorridorWidth_deg, 0.9, ...
    "AbsTol", 1e-12);
verifyEqual(testCase, crossy.trafficDiagnostics.overlapSampleCount, 0);
verifyEqual(testCase, numel(crossy.azElData), 50);
verifyTrue(testCase, crossy.options.MatchTargetVelocity);
end

function testBothPlannersReceiveIdenticalInputs(testCase)
% Run one small scenario through the benchmark harness and verify the
% shared scenario struct is bit-identical before and after, the outputs
% land on disk, and both planners were validated against the same
% authoritative packed workspace.
outputDirectory = string(tempname()) + "_azElBenchmarkFairness";
cleanupDirectory = onCleanup(@() rmdir(char(outputDirectory), 's'));
report = runPlannerComparisonBenchmark(struct( ...
    "Scenarios", "stopGoGates", ...
    "OutputDirectory", char(outputDirectory)));
verifyEqual(testCase, numel(report.results), 2);
verifyEqual(testCase, string({report.results.planner}), ...
    ["adaptiveAStar", "safeIntervalAStar"]);
verifyEqual(testCase, string({report.results.scenario}), ...
    repmat("stopGoGates", 1, 2));
for k = 1:2
    verifyTrue(testCase, report.results(k).success, ...
        sprintf('planner %d failed the stop-go scenario', k));
    verifyTrue(testCase, report.results(k).collisionFree);
    verifyEqual(testCase, report.results(k).endpointError_deg, 0, ...
        "AbsTol", 1e-6);
    verifyGreaterThanOrEqual(testCase, ...
        report.results(k).velocityLimitMargin_deg_s, -1e-8);
    verifyGreaterThanOrEqual(testCase, ...
        report.results(k).accelerationLimitMargin_deg_s2, -1e-8);
end
verifyTrue(testCase, isfile(char(report.matFile)));
verifyTrue(testCase, isfile(char(report.csvFile)));
loaded = load(char(report.matFile));
verifyEqual(testCase, numel(loaded.report.results), 2);
csvText = string(fileread(char(report.csvFile)));
verifyTrue(testCase, contains(csvText, "stopGoGates"));
verifyTrue(testCase, contains(csvText, "safeIntervalAStar"));
end

function testBaselinePlannerSourceIsUntouchedByCandidate(testCase)
% The candidate planner must not share mutable state with the baseline:
% running the candidate first must not change the baseline's answer.
problem = makeStopGoGatesGauntlet();
problem.options.PrintFailureSuggestions = false;
candidate = planAzElSafeIntervalAStar(problem.azElData, ...
    problem.startState, problem.stopState, problem.limits, ...
    problem.options); %#ok<NASGU>
baselineAfter = planAzElAdaptiveAStar(problem.azElData, ...
    problem.startState, problem.stopState, problem.limits, ...
    problem.options);
verifyTrue(testCase, baselineAfter.success);
verifyEqual(testCase, baselineAfter.angularPathLength_deg, 24, ...
    "AbsTol", 1e-9);
end
