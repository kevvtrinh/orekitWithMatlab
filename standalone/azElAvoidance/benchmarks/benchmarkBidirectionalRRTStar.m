function report = benchmarkBidirectionalRRTStar(randomSeeds)
%BENCHMARKBIDIRECTIONALRRTSTAR Compare RRT* and Dijkstra on rotating slots.
%
% report = benchmarkBidirectionalRRTStar()
% report = benchmarkBidirectionalRRTStar([7 19 31])
%
% Dijkstra is deterministic and runs once. RRT* runs every supplied seed.
% All routes use the same geometry, dynamics, safety margin, and final
% 0.1-second polygon validation. RRT* stops at its first exact trajectory.

if nargin < 1
    randomSeeds = [7 19 31];
end
validateattributes(randomSeeds, {'numeric'}, ...
    {'vector', 'integer', 'nonnegative'});
randomSeeds = double(randomSeeds(:));

problem = makeRotatingSlotGauntlet();
workspace = buildAzElTimeObstacleWorkspace(problem.azElData);

dijkstraPlan = planAzElDijkstra(workspace, ...
    problem.startState, problem.stopState, ...
    problem.limits, problem.options);
dijkstraDiagnostics = analyzeRotatingSlotGauntlet( ...
    problem, dijkstraPlan);

runCount = numel(randomSeeds) + 1;
planner = strings(runCount, 1);
seed = nan(runCount, 1);
success = false(runCount, 1);
searchTime_s = nan(runCount, 1);
firstSolutionTime_s = nan(runCount, 1);
pathLength_deg = nan(runCount, 1);
generatedNodes = nan(runCount, 1);
blockedSamples = nan(runCount, 1);
crossingTimes_s = strings(runCount, 1);

planner(1) = "Dijkstra";
success(1) = dijkstraPlan.success;
searchTime_s(1) = dijkstraPlan.searchElapsed_s;
firstSolutionTime_s(1) = dijkstraPlan.searchElapsed_s;
pathLength_deg(1) = dijkstraPlan.angularPathLength_deg;
generatedNodes(1) = dijkstraPlan.generatedNodeCount;
blockedSamples(1) = dijkstraDiagnostics.blockedSampleCount;
crossingTimes_s(1) = string(mat2str( ...
    dijkstraDiagnostics.crossingTime_s, 5));

rrtOptions = struct( ...
    "SampleTime_s", 0.2, ...
    "ValidationStep_s", 0.1, ...
    "CollisionCheckStep_s", 0.25, ...
    "SafetyMargin_deg", problem.options.SafetyMargin_deg, ...
    "TimePaddingSamples", 1, ...
    "StepSize_deg", 4, ...
    "RewireRadius_deg", 7, ...
    "ConnectionRadius_deg", 10, ...
    "MaxIterations", 10000, ...
    "IterationsAfterFirstSolution", 0, ...
    "MaxSearchTime_s", 45);

for seedIndex = 1:numel(randomSeeds)
    row = seedIndex + 1;
    planner(row) = "Bidirectional RRT*";
    seed(row) = randomSeeds(seedIndex);
    rrtOptions.RandomSeed = randomSeeds(seedIndex);
    rrtPlan = planAzElBidirectionalKinodynamicRRTStar( ...
        workspace, problem.startState, problem.stopState, ...
        problem.limits, rrtOptions);
    success(row) = rrtPlan.success;
    searchTime_s(row) = rrtPlan.searchElapsed_s;
    firstSolutionTime_s(row) = rrtPlan.firstSolutionElapsed_s;
    generatedNodes(row) = rrtPlan.generatedNodeCount;
    if ~rrtPlan.success
        continue;
    end
    rrtDiagnostics = analyzeRotatingSlotGauntlet(problem, rrtPlan);
    pathLength_deg(row) = rrtPlan.angularPathLength_deg;
    blockedSamples(row) = rrtDiagnostics.blockedSampleCount;
    crossingTimes_s(row) = string(mat2str( ...
        rrtDiagnostics.crossingTime_s, 5));
end

results = table(planner, seed, success, searchTime_s, ...
    firstSolutionTime_s, pathLength_deg, generatedNodes, ...
    blockedSamples, crossingTimes_s);
disp(results);
rrtRows = results.planner == "Bidirectional RRT*";
successfulRrtRows = rrtRows & results.success;
report = struct( ...
    "problem", problem, ...
    "results", results, ...
    "dijkstraPlan", dijkstraPlan, ...
    "rrtSuccessRate", nnz(successfulRrtRows) / nnz(rrtRows), ...
    "rrtMedianFirstSolutionTime_s", median( ...
    results.firstSolutionTime_s(successfulRrtRows)), ...
    "rrtMedianPathLength_deg", median( ...
    results.pathLength_deg(successfulRrtRows)));
end
