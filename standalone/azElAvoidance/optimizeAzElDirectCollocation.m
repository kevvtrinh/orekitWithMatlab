function [winningCandidate, diagnostics] = ...
        optimizeAzElDirectCollocation( ...
        seedCandidate, candidateEvaluator, initialTime_s, ...
        hasTerminalDynamics, options)
%% Section 0: Header & Readme
% SYNTAX
%   [winningCandidate, diagnostics] = ...
%       optimizeAzElDirectCollocation( ...
%       seedCandidate, candidateEvaluator, initialTime_s, ...
%       hasTerminalDynamics, options)
%**************************************************************************
% PURPOSE
%   - Improve one verified piecewise-quintic seed by moving important
%     interior position knots and refining its common clock.
%   - Keep optimization policy separate from planner-specific physics and
%     collision checks so each concern can evolve independently.
%   - Provide deterministic direct collocation without requiring an
%     optimization toolbox.
%**************************************************************************
% INPUTS
%   - seedCandidate (scalar struct)
%       Verified knot times, positions, derivatives, and Pareto measures.
%   - candidateEvaluator (scalar function handle)
%       Planner-owned function that densely verifies and measures a proposal.
%   - initialTime_s (finite scalar)
%       Absolute time at the first collocation knot.
%   - hasTerminalDynamics (logical scalar)
%       True when clock scaling would corrupt a nonzero terminal state.
%   - options (scalar struct)
%       Coordinate pass, candidate budget, move fraction, and clock limits.
%**************************************************************************
% OUTPUTS
%   - winningCandidate (scalar struct)
%       Best verified candidate, or the unchanged seed when none improves it.
%   - diagnostics (scalar struct)
%       Tested/feasible candidate counts and completed coordinate passes.
%**************************************************************************
% UNITS
%   - Knot positions are degrees and knot times are seconds.

%% Section 1: Move The Most Curved Interior Knots
% Each neighboring state pair already owns one exact quintic. The search
% therefore changes only explicit collocation variables; it never repairs
% inconsistent position, velocity, and acceleration columns after the fact.
diagnostics = struct( ...
    "CandidateCount", 0, ...
    "FeasibleCandidateCount", 0, ...
    "PassCount", 0);
winningCandidate = seedCandidate;
candidateBudget = options.ParetoRefinementCandidateBudget;
moveFractions = options.ParetoRefinementCoordinateMoveFractions;
targetCount = 2;

for passIndex = 1:options.ParetoRefinementCoordinatePassCount
    remainingBudget = candidateBudget - diagnostics.CandidateCount;
    if remainingBudget <= 0
        break
    end
    diagnostics.PassCount = passIndex;
    knotPriority = collocationKnotPriority( ...
        winningCandidate.Position_deg, winningCandidate.NodeTime_s);
    [~, priorityOrder] = sort(knotPriority, "descend");
    proposalCountPerKnot = targetCount * numel(moveFractions);
    knotTrialCount = min(numel(priorityOrder), ...
        floor(remainingBudget / proposalCountPerKnot));
    passImproved = false;

    for priorityIndex = 1:knotTrialCount
        knotIndex = priorityOrder(priorityIndex) + 1;
        for targetIndex = 1:targetCount
            targetPosition_deg = collocationMoveTarget( ...
                winningCandidate, knotIndex, targetIndex);
            for moveIndex = 1:numel(moveFractions)
                candidate = winningCandidate;
                moveFraction = moveFractions(moveIndex);
                candidate.Position_deg(knotIndex, :) = ...
                    (1 - moveFraction) * ...
                    winningCandidate.Position_deg(knotIndex, :) + ...
                    moveFraction * targetPosition_deg;
                candidate.Blend = NaN;
                diagnostics.CandidateCount = ...
                    diagnostics.CandidateCount + 1;
                [candidateIsSafe, candidate] = candidateEvaluator(candidate);
                if ~candidateIsSafe
                    continue
                end
                diagnostics.FeasibleCandidateCount = ...
                    diagnostics.FeasibleCandidateCount + 1;
                if collocationCandidateShouldWin( ...
                        candidate, winningCandidate)
                    winningCandidate = candidate;
                    passImproved = true;
                end
            end
        end
    end
    if ~passImproved
        break
    end
end

%% Section 2: Refine The Common Clock Without Changing The Path
% Nonzero terminal rates have absolute physical meaning and cannot be scaled.
% Rest-to-rest commands can try a few shorter clocks; the evaluator still has
% the final word on derivative limits and moving-obstacle timing.
remainingBudget = candidateBudget - diagnostics.CandidateCount;
if hasTerminalDynamics || remainingBudget <= 0
    return
end
clockTrialCount = min(4, remainingBudget);
clockScale = linspace(max( ...
    options.ParetoRefinementMinimumTimeScale, 0.85), 0.99, ...
    clockTrialCount);
for clockIndex = 1:numel(clockScale)
    candidate = winningCandidate;
    scale = clockScale(clockIndex);
    candidate.NodeTime_s = initialTime_s + scale * ...
        (winningCandidate.NodeTime_s - initialTime_s);
    candidate.Velocity_deg_s = ...
        winningCandidate.Velocity_deg_s / scale;
    candidate.Acceleration_deg_s2 = ...
        winningCandidate.Acceleration_deg_s2 / scale^2;
    candidate.TimeScale = winningCandidate.TimeScale * scale;
    diagnostics.CandidateCount = diagnostics.CandidateCount + 1;
    [candidateIsSafe, candidate] = candidateEvaluator(candidate);
    if ~candidateIsSafe
        continue
    end
    diagnostics.FeasibleCandidateCount = ...
        diagnostics.FeasibleCandidateCount + 1;
    if collocationCandidateShouldWin(candidate, winningCandidate)
        winningCandidate = candidate;
    end
end
end

function candidateShouldWin = collocationCandidateShouldWin( ...
        candidate, currentWinner)
% Coordinate proposals can produce changes smaller than the numerical
% resolution of the dense path integral. Requiring a visible Pareto gain
% prevents that noise from replacing a smoother command. The small jerk
% allowance lets a genuinely shorter or faster candidate redistribute its
% control effort without turning bounded jerk into a secondary objective.
meaningfulParetoGain = candidate.CombinedRatio < ...
    currentWinner.CombinedRatio - 1e-5;
maximumAllowedJerkRatio = max( ...
    1.1 * currentWinner.MaximumJerkRatio, ...
    currentWinner.MaximumJerkRatio + 0.02);
jerkDoesNotRegress = ...
    candidate.MaximumJerkRatio <= maximumAllowedJerkRatio;
candidateShouldWin = meaningfulParetoGain && jerkDoesNotRegress;
end

function priority = collocationKnotPriority(position_deg, nodeTime_s)
interiorKnotCount = max(0, size(position_deg, 1) - 2);
priority = zeros(interiorKnotCount, 1);
for interiorIndex = 1:interiorKnotCount
    knotIndex = interiorIndex + 1;
    intervalDuration_s = nodeTime_s(knotIndex + 1) - ...
        nodeTime_s(knotIndex - 1);
    localFraction = (nodeTime_s(knotIndex) - ...
        nodeTime_s(knotIndex - 1)) / intervalDuration_s;
    chordPosition_deg = (1 - localFraction) * ...
        position_deg(knotIndex - 1, :) + localFraction * ...
        position_deg(knotIndex + 1, :);
    offset_deg = position_deg(knotIndex, :) - chordPosition_deg;
    priority(interiorIndex) = hypot(offset_deg(1), offset_deg(2));
end
end

function targetPosition_deg = collocationMoveTarget( ...
        candidate, knotIndex, targetIndex)
if targetIndex == 1
    intervalDuration_s = candidate.NodeTime_s(knotIndex + 1) - ...
        candidate.NodeTime_s(knotIndex - 1);
    localFraction = (candidate.NodeTime_s(knotIndex) - ...
        candidate.NodeTime_s(knotIndex - 1)) / intervalDuration_s;
    targetPosition_deg = (1 - localFraction) * ...
        candidate.Position_deg(knotIndex - 1, :) + localFraction * ...
        candidate.Position_deg(knotIndex + 1, :);
else
    totalDuration_s = candidate.NodeTime_s(end) - ...
        candidate.NodeTime_s(1);
    missionFraction = (candidate.NodeTime_s(knotIndex) - ...
        candidate.NodeTime_s(1)) / totalDuration_s;
    targetPosition_deg = (1 - missionFraction) * ...
        candidate.Position_deg(1, :) + missionFraction * ...
        candidate.Position_deg(end, :);
end
end
