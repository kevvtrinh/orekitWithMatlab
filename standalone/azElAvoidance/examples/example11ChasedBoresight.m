function result = example11ChasedBoresight(viewOptions)
%% Section 0: Header & Readme
% SYNTAX
%   result = example11ChasedBoresight()
%   result = example11ChasedBoresight(viewOptions)
%**************************************************************************
% PURPOSE
%   - Plan sustained evasive steering until a late goal opens.
%**************************************************************************
% INPUTS
%   - viewOptions (scalar struct, optional)
%       Partial animation options.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Generated problem, successful plan, diagnostics, and view handles.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; temporal quantities are seconds.

%% Section 1: Resolve The Animation & Generate The Problem
if nargin < 1
    viewOptions = struct();
end
viewOptions = defaultAzElAnimationOptions(viewOptions, struct( ...
    "MaximumAnimationFrames", 500, ...
    "MaximumDisplayedSlices", 120, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.05));

problem = makeChasedBoresightGauntlet();

%% Section 2: Plan & Verify Pursuit Behavior
plan = planAzElDijkstra( ...
    problem.azElData, problem.startState, problem.stopState, ...
    problem.limits, problem.options);
if ~plan.success
    error("example11ChasedBoresight:NoPath", ...
        "Planner failed: %s", plan.message);
end
diagnostics = analyzeChasedBoresightGauntlet(problem, plan);
if diagnostics.blockedSampleCount > 0
    error("example11ChasedBoresight:Collision", ...
        "The planned command contains %d blocked samples.", ...
        diagnostics.blockedSampleCount);
end
if diagnostics.goalArrivalTime_s < ...
        problem.geometry.goalOpenTime_s - 1e-9
    error("example11ChasedBoresight:EarlyGoalArrival", ...
        "The boresight reached the sealed goal too early.");
end
if diagnostics.movingFractionBeforeGoalOpen < 0.8
    error("example11ChasedBoresight:InsufficientMotion", ...
        "The boresight did not keep steering while pursued.");
end
if diagnostics.longestWaitBeforeGoalOpen_s > 12
    error("example11ChasedBoresight:WaitedTooLong", ...
        "The pursued boresight stopped long enough to invalidate the test.");
end
if diagnostics.angularPathLength_deg < 120
    error("example11ChasedBoresight:ShortPath", ...
        "The route did not complete the expected defensive loop.");
end

%% Section 3: Animate, Package & Report The Result
view = animateAzElAvoidancePlan( ...
    problem.azElData, plan, viewOptions);
result = problem;
result.plan = plan;
result.diagnostics = diagnostics;
result.view = view;
fprintf(['Chased-boresight gauntlet: %.3f deg, %.3f s search, ' ...
    'goal opened at %.1f s and reached at %.1f s.\n'], ...
    plan.angularPathLength_deg, plan.searchElapsed_s, ...
    diagnostics.goalOpenTime_s, diagnostics.goalArrivalTime_s);
end
