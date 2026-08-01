function result = example13RandomBlinkingIntercept( ...
        seed, viewOptions)
%% Section 0: Header & Readme
% SYNTAX
%   result = example13RandomBlinkingIntercept()
%   result = example13RandomBlinkingIntercept(seed)
%   result = example13RandomBlinkingIntercept(seed, viewOptions)
%**************************************************************************
% PURPOSE
%   - Intercept a moving target on one stochastic blinking board.
%   - Preserve the printed seed for exact failure replay.
%**************************************************************************
% INPUTS
%   - seed (positive integer or empty, optional)
%       Empty generates a fresh case.
%   - viewOptions (scalar struct, optional)
%       Partial animation options.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Generated problem, successful intercept, diagnostics, and view.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; temporal quantities are seconds.

%% Section 1: Resolve Inputs & Generate The Board
if nargin < 1
    seed = [];
end
if nargin < 2
    viewOptions = struct();
end
problem = makeRandomBlinkingChessboardGauntlet(seed);

%% Section 2: Plan & Verify The Interception
plan = planAzElMovingTargetIntercept( ...
    problem.azElData, problem.startState, problem.target, ...
    problem.limits, problem.options);
if ~plan.success
    error("example13RandomBlinkingIntercept:NoIntercept", ...
        "Seed %u failed: %s", uint32(problem.seed), plan.message);
end
diagnostics = analyzeBlinkingChessboardIntercept(problem, plan);
if diagnostics.blockedBoresightSampleCount > 0
    error("example13RandomBlinkingIntercept:Collision", ...
        "Seed %u returned %d blocked boresight samples.", ...
        uint32(problem.seed), ...
        diagnostics.blockedBoresightSampleCount);
end
if diagnostics.catchError_deg > ...
        problem.options.CatchTolerance_deg
    error("example13RandomBlinkingIntercept:MissedTarget", ...
        "Seed %u missed the moving endpoint by %.3f deg.", ...
        uint32(problem.seed), diagnostics.catchError_deg);
end
if diagnostics.cellTransferCount < 2
    error("example13RandomBlinkingIntercept:NoBoardTraversal", ...
        "Seed %u did not require multiple cell transfers.", ...
        uint32(problem.seed));
end

%% Section 3: Animate, Package & Report The Result
viewOptions = defaultAzElAnimationOptions(viewOptions, struct( ...
    "MaximumAnimationFrames", 260, ...
    "MaximumDisplayedSlices", 20, ...
    "PauseSeconds", 0.015, ...
    "ObstacleFaceAlpha", 0.035, ...
    "MovingTarget", problem.target));
view = animateAzElAvoidancePlan( ...
    problem.azElData, plan, viewOptions);
result = problem;
result.plan = plan;
result.diagnostics = diagnostics;
result.view = view;
fprintf([ ...
    'Blinking chessboard seed %u: catch at %.1f s, ' ...
    '%d transfers, %d attempts, %.2f s search, %.3f deg error.\n'], ...
    uint32(problem.seed), diagnostics.interceptTime_s, ...
    diagnostics.cellTransferCount, diagnostics.attemptCount, ...
    diagnostics.searchElapsed_s, diagnostics.catchError_deg);
end
