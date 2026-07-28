function result = exampleRotatingSlotGauntlet(viewOptions)
%EXAMPLEROTATINGSLOTGAUNTLET Plan and animate four timed slot crossings.
%
% result = exampleRotatingSlotGauntlet()
% result = exampleRotatingSlotGauntlet(viewOptions)
%
% Four independently rotating C-shaped barriers surround the goal. The
% boresight waits in the safe annular chambers until each moving slot offers
% a valid rate- and acceleration-limited passage. With no viewOptions, the
% combined animation is visible and plays at a smooth interactive pace.

if nargin < 1
    viewOptions = struct();
end
viewOptions = applyDefaults(viewOptions, struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 450, ...
    "MaximumDisplayedSlices", 120, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.06, ...
    "FigureVisible", "on"));

problem = makeRotatingSlotGauntlet();
plan = planAzElSpaceTimeFunnel( ...
    problem.azElData, problem.startState, problem.stopState, ...
    problem.limits, problem.options);
if ~plan.success
    error("exampleRotatingSlotGauntlet:NoPath", ...
        "Planner failed: %s", plan.message);
end
diagnostics = analyzeRotatingSlotGauntlet(problem, plan);
if diagnostics.blockedSampleCount > 0
    error("exampleRotatingSlotGauntlet:Collision", ...
        "The planned command contains %d blocked samples.", ...
        diagnostics.blockedSampleCount);
end
if any(~isfinite(diagnostics.crossingTime_s)) || ...
        any(diff(diagnostics.crossingTime_s) <= 0)
    error("exampleRotatingSlotGauntlet:MissingCrossing", ...
        "The plan did not cross all four rings in outward-to-inward order.");
end
maximumSlotError = problem.geometry.slotWidth_deg / 2 + 8;
if any(diagnostics.slotCenterError_deg > maximumSlotError)
    error("exampleRotatingSlotGauntlet:SlotMisalignment", ...
        "A ring crossing occurred outside its rotating slot.");
end
if nnz(diagnostics.chamberWait_s >= 10) < 2
    error("exampleRotatingSlotGauntlet:MissingChamberWait", ...
        "The plan did not wait in at least two safe chambers.");
end

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

function output = applyDefaults(input, defaults)
output = input;
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(output, names{k}) || isempty(output.(names{k}))
        output.(names{k}) = defaults.(names{k});
    end
end
end
