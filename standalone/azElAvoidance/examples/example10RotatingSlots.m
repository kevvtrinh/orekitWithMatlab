function result = example10RotatingSlots(viewOptions)
%% Section 0: Header & Readme
% SYNTAX
%   result = example10RotatingSlots()
%   result = example10RotatingSlots(viewOptions)
%**************************************************************************
% PURPOSE
%   - Plan and animate four timed slot crossings with chamber waiting.
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
    "MaximumAnimationFrames", 450, ...
    "MaximumDisplayedSlices", 120, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.06));

problem = makeRotatingSlotGauntlet();

%% Section 2: Plan & Verify Ring Crossings
plan = planAzElDijkstra( ...
    problem.azElData, problem.startState, problem.stopState, ...
    problem.limits, problem.options);
if ~plan.success
    error("example10RotatingSlots:NoPath", ...
        "Planner failed: %s", plan.message);
end
diagnostics = analyzeRotatingSlotGauntlet(problem, plan);
if diagnostics.blockedSampleCount > 0
    error("example10RotatingSlots:Collision", ...
        "The planned command contains %d blocked samples.", ...
        diagnostics.blockedSampleCount);
end
if any(~isfinite(diagnostics.crossingTime_s)) || ...
        any(diff(diagnostics.crossingTime_s) <= 0)
    error("example10RotatingSlots:MissingCrossing", ...
        "The plan did not cross all four rings in outward-to-inward order.");
end
maximumSlotError = problem.geometry.slotWidth_deg / 2 + 8;
if any(diagnostics.slotCenterError_deg > maximumSlotError)
    error("example10RotatingSlots:SlotMisalignment", ...
        "A ring crossing occurred outside its rotating slot.");
end
if nnz(diagnostics.chamberWait_s >= 10) < 2
    error("example10RotatingSlots:MissingChamberWait", ...
        "The plan did not wait in at least two safe chambers.");
end

%% Section 3: Animate, Package & Report The Result
view = animateAzElAvoidancePlan( ...
    problem.azElData, plan, viewOptions);
result = problem;
result.plan = plan;
result.diagnostics = diagnostics;
result.view = view;
fprintf(['Rotating-slot gauntlet: %.3f deg, %.3f s search, ' ...
    '%d expansions, crossings at %s s.\n'], ...
    plan.angularPathLength_deg, plan.searchElapsed_s, ...
    plan.expandedNodeCount, ...
    mat2str(diagnostics.crossingTime_s, 4));
end
