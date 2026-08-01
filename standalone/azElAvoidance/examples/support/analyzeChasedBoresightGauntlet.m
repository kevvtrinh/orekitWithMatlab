function diagnostics = analyzeChasedBoresightGauntlet(problem, plan)
%% Section 0: Header & Readme
% SYNTAX
%   diagnostics = analyzeChasedBoresightGauntlet(problem, plan)
%**************************************************************************
% PURPOSE
%   - Measure pursuit motion, waiting, goal timing, and exact safety.
%**************************************************************************
% INPUTS
%   - problem (scalar struct)
%       Chaser scenario, planner options, and goal-opening metadata.
%   - plan (scalar struct)
%       Successful Dijkstra plan for the scenario.
%**************************************************************************
% OUTPUTS
%   - diagnostics (scalar struct)
%       Goal, motion, waiting, path-length, and collision metrics.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; times are seconds.

%% Section 1: Validate The Successful Plan
if ~isstruct(plan) || ~isfield(plan, "success") || ~plan.success
    error("analyzeChasedBoresightGauntlet:InvalidPlan", ...
        "plan must be a successful chased-boresight plan.");
end

%% Section 2: Measure Goal Arrival & Pre-Opening Motion
sampleStep_s = median(diff(plan.time_s));
goalDistance_deg = hypot( ...
    plan.position_deg(:, 1) - problem.stopState.position_deg(1), ...
    plan.position_deg(:, 2) - problem.stopState.position_deg(2));
goalArrivalSample = find(goalDistance_deg <= 0.15, 1);
if isempty(goalArrivalSample)
    goalArrivalTime_s = NaN;
else
    goalArrivalTime_s = plan.time_s(goalArrivalSample);
end
isBeforeGoalOpening = plan.time_s < problem.geometry.goalOpenTime_s;
isMovingBeforeOpening = isBeforeGoalOpening & ~plan.isWaiting;
movingFractionBeforeOpening = nnz(isMovingBeforeOpening) / ...
    max(1, nnz(isBeforeGoalOpening));
longestWaitBeforeOpening_s = longestTrueRun( ...
    plan.isWaiting & isBeforeGoalOpening) * sampleStep_s;

%% Section 3: Recheck Exact Polygon Safety
blockedSamples = queryAzElTimeObstacle(plan.obstacleField, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct( ...
    "SafetyMarginDeg", problem.options.SafetyMargin_deg, ...
        "TimePaddingSamples", plan.options.TimePaddingSamples));

%% Section 4: Assemble Diagnostics
diagnostics = struct( ...
    "goalArrivalTime_s", goalArrivalTime_s, ...
    "goalOpenTime_s", problem.geometry.goalOpenTime_s, ...
    "movingFractionBeforeGoalOpen", movingFractionBeforeOpening, ...
    "longestWaitBeforeGoalOpen_s", longestWaitBeforeOpening_s, ...
    "totalMovingTime_s", sampleStep_s * nnz(~plan.isWaiting), ...
    "totalWaitingTime_s", sampleStep_s * nnz(plan.isWaiting), ...
    "angularPathLength_deg", plan.angularPathLength_deg, ...
    "blockedSampleCount", nnz(blockedSamples));
end

%% Section 5: Local Functions
function longestRunLength = longestTrueRun(logicalMask)
%% Section 0: Header & Readme
% Sentinels turn runs touching either endpoint into ordinary transitions.
transitions = diff([false; logicalMask(:); false]);
runFirstSample = find(transitions == 1);
runLastSample = find(transitions == -1) - 1;
if isempty(runFirstSample)
    longestRunLength = 0;
else
    longestRunLength = max(runLastSample - runFirstSample + 1);
end
end
