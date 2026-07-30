function report = runPlannerComparisonBenchmark(benchmarkOptions)
%RUNPLANNERCOMPARISONBENCHMARK Compare both planners on identical scenarios.
%
% report = runPlannerComparisonBenchmark()
% report = runPlannerComparisonBenchmark(struct("ChessboardSeeds", 1:3))
%
% Runs planAzElAdaptiveAStar (baseline) and planAzElSafeIntervalAStar
% (candidate) on every registered scenario with byte-identical azElData,
% boundary states, limits, and options, then validates every returned
% command against a workspace packed directly from the original polygons.
% Scenario definitions are the same builder functions the numbered examples
% call, so the benchmark cannot drift from the examples.
%
% Options:
%   ChessboardSeeds   Declared seeds for the randomized blinking chessboard
%                     (default [20260701 20260702 20260703 20260704
%                     20260705]). Every seed is reported; none are filtered.
%   SearchTimeScale   Multiplies every MaxSearchTime_s and
%                     PerAttemptMaxSearchTime_s identically for both
%                     planners (default 1). Use > 1 on slow interpreters so
%                     wall-clock budgets do not decide the comparison.
%   OutputDirectory   Where the MAT and CSV results are written
%                     (default fullfile(tempdir, "azElPlannerBenchmark")).
%   Scenarios         String array of scenario names to run, or "all".
%
% The report struct contains one row per scenario x planner with success,
% wall time, expanded/generated states, angular length, arrival and motion
% completion times, endpoint error, kinematic peaks, exact collision
% validity, minimum clearance, and graph/workspace size.

if nargin < 1
    benchmarkOptions = struct();
end
defaults = struct( ...
    "ChessboardSeeds", [20260701 20260702 20260703 20260704 20260705], ...
    "SearchTimeScale", 1, ...
    "OutputDirectory", char(fullfile(tempdir, 'azElPlannerBenchmark')), ...
    "Scenarios", "all");
optionNames = fieldnames(defaults);
for k = 1:numel(optionNames)
    if ~isfield(benchmarkOptions, optionNames{k}) || ...
            isempty(benchmarkOptions.(optionNames{k}))
        benchmarkOptions.(optionNames{k}) = defaults.(optionNames{k});
    end
end
validateattributes(benchmarkOptions.SearchTimeScale, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(benchmarkOptions.ChessboardSeeds, {'numeric'}, ...
    {'vector', 'integer', 'positive'});

planners = struct( ...
    "name", {"adaptiveAStar", "safeIntervalAStar"}, ...
    "fcn", {@planAzElAdaptiveAStar, @planAzElSafeIntervalAStar});
scenarios = scenarioRegistry(benchmarkOptions.ChessboardSeeds);
if ~(isscalar(string(benchmarkOptions.Scenarios)) && ...
        string(benchmarkOptions.Scenarios) == "all")
    requested = string(benchmarkOptions.Scenarios);
    keep = false(size(scenarios));
    for k = 1:numel(scenarios)
        keep(k) = any(scenarios(k).name == requested);
    end
    scenarios = scenarios(keep);
end

rows = repmat(emptyResultRow(), 2 * numel(scenarios), 1);
rowCount = 0;
for scenarioIndex = 1:numel(scenarios)
    scenario = scenarios(scenarioIndex);
    problem = scenario.builder();
    problem.options.PrintFailureSuggestions = false;
    problem.options.MaxSearchTime_s = benchmarkOptions.SearchTimeScale * ...
        problem.options.MaxSearchTime_s;
    if isfield(problem.options, "PerAttemptMaxSearchTime_s")
        problem.options.PerAttemptMaxSearchTime_s = ...
            benchmarkOptions.SearchTimeScale * ...
            problem.options.PerAttemptMaxSearchTime_s;
    end
    % One authoritative workspace per scenario, packed straight from the
    % original polygons, shared by the validation of both planners.
    authoritativeWorkspace = buildAzElTimeObstacleWorkspace( ...
        problem.azElData, struct("MaximumVerticesPerRegion", ...
        fieldOr(problem.options, "MaximumVerticesPerRegion", 500)));
    problemSnapshot = problem;
    for plannerIndex = 1:numel(planners)
        fprintf("[%s] %s ...\n", planners(plannerIndex).name, ...
            scenario.name);
        row = runOneCase(scenario, problem, planners(plannerIndex), ...
            authoritativeWorkspace);
        rowCount = rowCount + 1;
        rows(rowCount) = row;
        fprintf(['[%s] %s: success=%d collisionFree=%d wall=%.1f s ' ...
            'length=%.2f deg\n'], planners(plannerIndex).name, ...
            scenario.name, row.success, row.collisionFree, ...
            row.wallTime_s, row.angularPathLength_deg);
    end
    if ~isequaln(problemSnapshot, problem)
        error("runPlannerComparisonBenchmark:ScenarioMutated", ...
            "Scenario inputs changed between planner runs.");
    end
end
rows = rows(1:rowCount);

report = struct( ...
    "generated", "runPlannerComparisonBenchmark", ...
    "benchmarkOptions", benchmarkOptions, ...
    "plannerNames", {{'adaptiveAStar', 'safeIntervalAStar'}}, ...
    "results", rows);
if ~exist(benchmarkOptions.OutputDirectory, 'dir')
    mkdir(benchmarkOptions.OutputDirectory);
end
matFile = fullfile(benchmarkOptions.OutputDirectory, ...
    "plannerComparisonBenchmark.mat");
csvFile = fullfile(benchmarkOptions.OutputDirectory, ...
    "plannerComparisonBenchmark.csv");
% Store text fields as chars so the MAT file loads identically in MATLAB
% and Octave regardless of which produced it.
for rowIndex = 1:numel(report.results)
    report.results(rowIndex).scenario = ...
        char(string(report.results(rowIndex).scenario));
    report.results(rowIndex).planner = ...
        char(string(report.results(rowIndex).planner));
    report.results(rowIndex).message = ...
        char(string(report.results(rowIndex).message));
end
save(char(matFile), 'report', '-v7');
writeResultCsv(char(csvFile), rows);
report.matFile = string(matFile);
report.csvFile = string(csvFile);
printSummaryTable(rows);
end

function scenarios = scenarioRegistry(chessboardSeeds)
% Fixed-goal scenarios reuse the example builders verbatim; intercept
% scenarios carry the moving-target endpoint instead of a stop state.
scenarios = [ ...
    fixedGoalScenario("fiveTurnSpiral", @makeFiveTurnSpiralGauntlet)
    fixedGoalScenario("stopGoGates", @makeStopGoGatesGauntlet)
    fixedGoalScenario("wrappedAzimuthSeam", @makeWrappedAzimuthSeamGauntlet)
    fixedGoalScenario("alternatingSlalom", @makeAlternatingSlalomGauntlet)
    fixedGoalScenario("uTrapEscape", @makeUTrapEscapeGauntlet)
    fixedGoalScenario("rotatingSlots", @makeRotatingSlotGauntlet)
    fixedGoalScenario("chasedBoresight", @makeChasedBoresightGauntlet)
    fixedGoalScenario("synchronizedWindmills", ...
        @makeWorldsHardestWindmillGauntlet)
    fixedGoalScenario("spinningRodSpiral", @makeSpinningRodSpiralGauntlet)
    interceptScenario("crossyRoadRendezvous", ...
        @makeCrossyRoadRendezvousGauntlet)];
for seedIndex = 1:numel(chessboardSeeds)
    seed = chessboardSeeds(seedIndex);
    scenarios(end + 1, 1) = interceptScenario( ...
        "blinkingChessboard_" + seed, ...
        @() makeRandomBlinkingChessboardGauntlet(seed)); %#ok<AGROW>
end
end

function scenario = fixedGoalScenario(name, builder)
scenario = struct("name", string(name), "kind", "fixedGoal", ...
    "builder", builder);
end

function scenario = interceptScenario(name, builder)
scenario = struct("name", string(name), "kind", "intercept", ...
    "builder", builder);
end

function row = runOneCase(scenario, problem, planner, ...
        authoritativeWorkspace)
row = emptyResultRow();
row.scenario = scenario.name;
row.planner = planner.name;
caseTimer = tic;
try
    if scenario.kind == "fixedGoal"
        plan = planner.fcn(problem.azElData, problem.startState, ...
            problem.stopState, problem.limits, problem.options);
    else
        interceptOptions = problem.options;
        interceptOptions.PlannerFcn = planner.fcn;
        plan = planAzElMovingTargetIntercept(problem.azElData, ...
            problem.startState, problem.target, problem.limits, ...
            interceptOptions);
    end
    row.wallTime_s = toc(caseTimer);
catch caseError
    row.wallTime_s = toc(caseTimer);
    row.message = string(caseError.message);
    return;
end

row.success = plan.success;
row.message = string(plan.message);
if isfield(plan, "expandedNodeCount")
    row.expandedNodeCount = plan.expandedNodeCount;
    row.generatedNodeCount = plan.generatedNodeCount;
end
if isfield(plan, "searchElapsed_s")
    row.searchElapsed_s = plan.searchElapsed_s;
end
row.workspaceBytes = authoritativeWorkspace.EstimatedStorageBytes;
if ~plan.success
    return;
end

safetyMargin_deg = fieldOr(problem.options, "SafetyMargin_deg", 0);
blocked = queryAzElTimeObstacle(authoritativeWorkspace, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct("SafetyMarginDeg", safetyMargin_deg, "TimePaddingSamples", 1));
row.blockedSampleCount = nnz(blocked);
row.collisionFree = ~any(blocked);
row.angularPathLength_deg = plan.angularPathLength_deg;
if isfield(plan, "angularLowerBound_deg")
    row.angularLowerBound_deg = plan.angularLowerBound_deg;
end
row.planEndTime_s = plan.time_s(end);
lastMovingSample = find(~plan.isWaiting, 1, "last");
if isempty(lastMovingSample)
    row.motionCompletionTime_s = plan.time_s(1);
else
    row.motionCompletionTime_s = plan.time_s(lastMovingSample);
end
row.maxVelocity_deg_s = max(abs(plan.velocity_deg_s(:)));
row.maxAcceleration_deg_s2 = max(abs(plan.acceleration_deg_s2(:)));
row.velocityLimitMargin_deg_s = min(reshape( ...
    problem.limits.maxVelocity_deg_s - ...
    max(abs(plan.velocity_deg_s), [], 1), [], 1));
row.accelerationLimitMargin_deg_s2 = min(reshape( ...
    problem.limits.maxAcceleration_deg_s2 - ...
    max(abs(plan.acceleration_deg_s2), [], 1), [], 1));
row.minimumClearance_deg = minimumClearanceByBisection( ...
    authoritativeWorkspace, plan, safetyMargin_deg);

if scenario.kind == "fixedGoal"
    endpointDelta = plan.position_deg(end, :) - ...
        problem.stopState.position_deg;
    if fieldOr(problem.options, "AllowAzimuthWrap", false)
        span = diff(problem.limits.azimuth_deg);
        endpointDelta(1) = mod(endpointDelta(1) + span / 2, span) - ...
            span / 2;
    end
    row.endpointError_deg = hypot(endpointDelta(1), endpointDelta(2));
else
    row.endpointError_deg = plan.catchError_deg;
    row.interceptTime_s = plan.interceptTime_s;
    if isfield(plan, "catchVelocityError_deg_s")
        row.catchVelocityError_deg_s = plan.catchVelocityError_deg_s;
    end
    if isfield(plan, "trackingEndTime_s")
        row.trackingDuration_s = plan.trackingEndTime_s - ...
            plan.interceptTime_s;
    end
end
end

function clearance_deg = minimumClearanceByBisection(workspace, plan, ...
        plannedMargin_deg)
% blocked(margin) is monotone in the query margin, so the smallest extra
% margin that blocks any command sample bounds the minimum clearance of
% the whole returned trajectory above the planned margin.
low_deg = 0;
high_deg = 5;
blockedAtHigh = any(queryAzElTimeObstacle(workspace, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct("SafetyMarginDeg", plannedMargin_deg + high_deg, ...
    "TimePaddingSamples", 1)));
if ~blockedAtHigh
    clearance_deg = plannedMargin_deg + high_deg;
    return;
end
for iteration = 1:9
    middle_deg = (low_deg + high_deg) / 2;
    blockedAtMiddle = any(queryAzElTimeObstacle(workspace, ...
        plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
        struct("SafetyMarginDeg", plannedMargin_deg + middle_deg, ...
        "TimePaddingSamples", 1)));
    if blockedAtMiddle
        high_deg = middle_deg;
    else
        low_deg = middle_deg;
    end
end
clearance_deg = plannedMargin_deg + low_deg;
end

function row = emptyResultRow()
row = struct( ...
    "scenario", "", ...
    "planner", "", ...
    "success", false, ...
    "collisionFree", false, ...
    "blockedSampleCount", NaN, ...
    "wallTime_s", NaN, ...
    "searchElapsed_s", NaN, ...
    "expandedNodeCount", NaN, ...
    "generatedNodeCount", NaN, ...
    "angularPathLength_deg", NaN, ...
    "angularLowerBound_deg", NaN, ...
    "planEndTime_s", NaN, ...
    "motionCompletionTime_s", NaN, ...
    "endpointError_deg", NaN, ...
    "interceptTime_s", NaN, ...
    "catchVelocityError_deg_s", NaN, ...
    "trackingDuration_s", NaN, ...
    "maxVelocity_deg_s", NaN, ...
    "maxAcceleration_deg_s2", NaN, ...
    "velocityLimitMargin_deg_s", NaN, ...
    "accelerationLimitMargin_deg_s2", NaN, ...
    "minimumClearance_deg", NaN, ...
    "workspaceBytes", NaN, ...
    "message", "");
end

function writeResultCsv(csvFile, rows)
fid = fopen(csvFile, 'w');
if fid < 0
    error("runPlannerComparisonBenchmark:CsvOpenFailed", ...
        "Cannot open %s for writing.", csvFile);
end
closeGuard = onCleanup(@() fclose(fid));
names = fieldnames(emptyResultRow());
fprintf(fid, '%s\n', strjoin(names, ','));
for rowIndex = 1:numel(rows)
    parts = cell(1, numel(names));
    for nameIndex = 1:numel(names)
        value = rows(rowIndex).(names{nameIndex});
        if isstring(value) || ischar(value)
            parts{nameIndex} = char(string(value));
            parts{nameIndex} = strrep(parts{nameIndex}, ',', ';');
        elseif islogical(value)
            parts{nameIndex} = sprintf('%d', value);
        else
            parts{nameIndex} = sprintf('%.9g', value);
        end
    end
    fprintf(fid, '%s\n', strjoin(parts, ','));
end
end

function printSummaryTable(rows)
fprintf("\n%-28s %-18s %4s %5s %9s %10s %9s %9s\n", "scenario", ...
    "planner", "ok", "free", "wall_s", "length_deg", "endErr", "clear");
for rowIndex = 1:numel(rows)
    row = rows(rowIndex);
    fprintf("%-28s %-18s %4d %5d %9.2f %10.3f %9.4f %9.3f\n", ...
        char(row.scenario), char(row.planner), row.success, ...
        row.collisionFree, row.wallTime_s, row.angularPathLength_deg, ...
        row.endpointError_deg, row.minimumClearance_deg);
end
end

function value = fieldOr(input, name, fallback)
if isstruct(input) && isfield(input, name) && ~isempty(input.(name))
    value = input.(name);
else
    value = fallback;
end
end
