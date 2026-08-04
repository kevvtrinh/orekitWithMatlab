function report = benchmarkBidirectionalRRTStar(randomSeeds)
%% Section 0: Header & Readme
% SYNTAX
%   report = benchmarkBidirectionalRRTStar()
%   report = benchmarkBidirectionalRRTStar(randomSeeds)
%**************************************************************************
% PURPOSE
%   - Compare deterministic Dijkstra with repeatable RRT* runs on the same
%     rotating-slot problem, dynamics, margin, and polygon validator.
%   - Report every seed and the evidence needed to reproduce each result.
%**************************************************************************
% INPUTS
%   - randomSeeds (numeric vector, optional)
%       Nonnegative integer RRT* seeds. The default is [7 19 31].
%**************************************************************************
% OUTPUTS
%   - report (scalar struct)
%       Problem, per-run results, Dijkstra plan, and RRT* aggregates.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; temporal quantities are seconds.

%% Section 1: Validate Inputs & Build The Shared Problem
if nargin < 1
    randomSeeds = [7 19 31];
end
validateattributes(randomSeeds, {'numeric'}, ...
    {'vector', 'nonempty', 'integer', 'nonnegative'});
randomSeeds = double(randomSeeds(:));

problem = makeRotatingSlotGauntlet();
obstacleField = buildAzElTimeObstacleWorkspace(problem.azElData);

dijkstraPlan = planAzElDijkstra(obstacleField, ...
    problem.startState, problem.stopState, ...
    problem.limits, problem.options);
dijkstraDiagnostics = analyzeRotatingSlotGauntlet( ...
    problem, dijkstraPlan);

%% Section 2: Preallocate The Per-Run Evidence
runCount = numel(randomSeeds) + 1;
planner = strings(runCount, 1);
seed = nan(runCount, 1);
success = false(runCount, 1);
searchTime_s = nan(runCount, 1);
firstSolutionTime_s = nan(runCount, 1);
pathLength_deg = nan(runCount, 1);
generatedNodeCount = nan(runCount, 1);
blockedSampleCount = nan(runCount, 1);
crossingTimes_s = strings(runCount, 1);
message = strings(runCount, 1);

planner(1) = "Dijkstra";
success(1) = dijkstraPlan.success;
searchTime_s(1) = dijkstraPlan.searchElapsed_s;
firstSolutionTime_s(1) = dijkstraPlan.searchElapsed_s;
pathLength_deg(1) = dijkstraPlan.angularPathLength_deg;
generatedNodeCount(1) = dijkstraPlan.generatedNodeCount;
blockedSampleCount(1) = dijkstraDiagnostics.blockedSampleCount;
crossingTimes_s(1) = string(mat2str( ...
    dijkstraDiagnostics.crossingTime_s, 5));
message(1) = dijkstraPlan.message;

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

%% Section 3: Run Bidirectional RRT* For Every Seed
for seedIndex = 1:numel(randomSeeds)
    row = seedIndex + 1;
    planner(row) = "Bidirectional RRT*";
    seed(row) = randomSeeds(seedIndex);
    rrtOptions.RandomSeed = randomSeeds(seedIndex);
    rrtPlan = planAzElBidirectionalKinodynamicRRTStar( ...
        obstacleField, problem.startState, problem.stopState, ...
        problem.limits, rrtOptions);
    success(row) = rrtPlan.success;
    searchTime_s(row) = rrtPlan.searchElapsed_s;
    firstSolutionTime_s(row) = rrtPlan.firstSolutionElapsed_s;
    generatedNodeCount(row) = rrtPlan.generatedNodeCount;
    message(row) = rrtPlan.message;
    if ~rrtPlan.success
        continue;
    end
    rrtDiagnostics = analyzeRotatingSlotGauntlet(problem, rrtPlan);
    pathLength_deg(row) = rrtPlan.angularPathLength_deg;
    blockedSampleCount(row) = rrtDiagnostics.blockedSampleCount;
    crossingTimes_s(row) = string(mat2str( ...
        rrtDiagnostics.crossingTime_s, 5));
end

%% Section 4: Assemble & Display The Report
results = table(planner, seed, success, searchTime_s, ...
    firstSolutionTime_s, pathLength_deg, generatedNodeCount, ...
    blockedSampleCount, crossingTimes_s, message);
disp(results);
rrtRows = results.planner == "Bidirectional RRT*";
successfulRrtRows = rrtRows & results.success;
commonRrtOptions = rmfield(rrtOptions, "RandomSeed");
report = struct( ...
    "problem", problem, ...
    "randomSeeds", randomSeeds, ...
    "rrtOptions", commonRrtOptions, ...
    "results", results, ...
    "dijkstraPlan", dijkstraPlan, ...
    "rrtSuccessRate", nnz(successfulRrtRows) / nnz(rrtRows), ...
    "rrtMedianFirstSolutionTime_s", median( ...
    results.firstSolutionTime_s(successfulRrtRows)), ...
    "rrtMedianPathLength_deg", median( ...
    results.pathLength_deg(successfulRrtRows)));
end
