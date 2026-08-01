function result = example12SynchronizedWindmills(viewOptions)
%% Section 0: Header & Readme
% SYNTAX
%   result = example12SynchronizedWindmills()
%   result = example12SynchronizedWindmills(viewOptions)
%**************************************************************************
% PURPOSE
%   - Traverse an S corridor through eight synchronized dotted windmills.
%   - Verify gap timing and windmill-following without coin constraints.
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
    "MaximumDisplayedSlices", 140, ...
    "PauseSeconds", 0.01, ...
    "ObstacleFaceAlpha", 0.045));

problem = makeWorldsHardestWindmillGauntlet();

%% Section 2: Plan & Verify Corridor Traversal
plan = planAzElDijkstra( ...
    problem.azElData, problem.startState, problem.stopState, ...
    problem.limits, problem.options);
if ~plan.success
    error("example12SynchronizedWindmills:NoPath", ...
        "Planner failed: %s", plan.message);
end
diagnostics = analyzeWorldsHardestWindmillGauntlet(problem, plan);
if diagnostics.blockedSampleCount > 0
    error("example12SynchronizedWindmills:Collision", ...
        "The planned command contains %d blocked samples.", ...
        diagnostics.blockedSampleCount);
end
if diagnostics.maximumAzimuth_deg < ...
        problem.geometry.rightConnectorAzimuth_deg
    error("example12SynchronizedWindmills:MissedConnector", ...
        "The boresight did not traverse the right-side connector.");
end
if ~diagnostics.visitedUpperCorridor || ...
        ~diagnostics.visitedLowerCorridor
    error("example12SynchronizedWindmills:IncompleteTraversal", ...
        "The path did not traverse both windmill rows.");
end
if diagnostics.maximumFollowAngle_deg < 35
    error("example12SynchronizedWindmills:NoWindmillFollow", ...
        "The path did not follow any windmill long enough to find a gap.");
end

%% Section 3: Animate, Package & Report The Result
view = animateAzElAvoidancePlan( ...
    problem.azElData, plan, viewOptions);
result = problem;
result.plan = plan;
result.diagnostics = diagnostics;
result.view = view;
fprintf(['Windmill gauntlet: %.3f deg, %.3f s search, ' ...
    'maximum windmill-follow angle %.1f deg.\n'], ...
    plan.angularPathLength_deg, plan.searchElapsed_s, ...
    diagnostics.maximumFollowAngle_deg);
end
