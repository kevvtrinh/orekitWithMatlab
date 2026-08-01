function diagnostics = analyzeRotatingSlotGauntlet(problem, plan)
%% Section 0: Header & Readme
% SYNTAX
%   diagnostics = analyzeRotatingSlotGauntlet(problem, plan)
%**************************************************************************
% PURPOSE
%   - Measure ring crossings, chamber waits, slot alignment, and safety.
%**************************************************************************
% INPUTS
%   - problem (scalar struct)
%       Rotating-slot geometry and planner options.
%   - plan (scalar struct)
%       Successful Dijkstra plan through the rings.
%**************************************************************************
% OUTPUTS
%   - diagnostics (scalar struct)
%       Per-ring crossing/alignment data and aggregate waiting metrics.
%**************************************************************************
% UNITS
%   - Positions and slot errors are degrees; times are seconds.

%% Section 1: Validate The Successful Plan
if ~isstruct(plan) || ~isfield(plan, "success") || ~plan.success
    error("analyzeRotatingSlotGauntlet:InvalidPlan", ...
        "plan must be a successful rotating-slot gauntlet plan.");
end

%% Section 2: Locate Ring Crossings
boresightRadius_deg = hypot( ...
    plan.position_deg(:, 1), plan.position_deg(:, 2));
geometry = problem.geometry;
ringCount = numel(geometry.innerRadius_deg);
crossingTime_s = nan(1, ringCount);
slotCenterError_deg = nan(1, ringCount);
crossingSampleIndex = zeros(1, ringCount);
for ringIndex = 1:ringCount
    ringCrossingRadius_deg = geometry.innerRadius_deg(ringIndex) - ...
        problem.options.SafetyMargin_deg;
    crossingSample = find(boresightRadius_deg <= ringCrossingRadius_deg, 1);
    if isempty(crossingSample)
        continue;
    end
    crossingSampleIndex(ringIndex) = crossingSample;
    crossingTime_s(ringIndex) = plan.time_s(crossingSample);
    boresightAngle_deg = atan2d( ...
        plan.position_deg(crossingSample, 2), ...
        plan.position_deg(crossingSample, 1));
    slotCenter_deg = geometry.phase_deg(ringIndex) + ...
        geometry.angularRate_deg_s(ringIndex) * ...
        crossingTime_s(ringIndex);
    slotCenterError_deg(ringIndex) = abs( ...
        wrapAngle(boresightAngle_deg - slotCenter_deg));
end

%% Section 3: Measure Waiting Between Adjacent Rings
chamberCount = ringCount - 1;
chamberWait_s = zeros(1, chamberCount);
sampleStep_s = median(diff(plan.time_s));
for chamberIndex = 1:chamberCount
    isInsideOuterRing = boresightRadius_deg < ...
        geometry.innerRadius_deg(chamberIndex) - ...
        problem.options.SafetyMargin_deg;
    isOutsideInnerRing = boresightRadius_deg > ...
        geometry.outerRadius_deg(chamberIndex + 1) + ...
        problem.options.SafetyMargin_deg;
    chamberWait_s(chamberIndex) = sampleStep_s * nnz( ...
        plan.isWaiting & isInsideOuterRing & isOutsideInnerRing);
end

%% Section 4: Recheck Exact Polygon Safety & Assemble Diagnostics
blockedSamples = queryAzElTimeObstacle(plan.obstacleField, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct( ...
    "SafetyMarginDeg", problem.options.SafetyMargin_deg, ...
    "TimePaddingSamples", plan.options.TimePaddingSamples));
diagnostics = struct( ...
    "radius_deg", boresightRadius_deg, ...
    "crossingIndex", crossingSampleIndex, ...
    "crossingTime_s", crossingTime_s, ...
    "slotCenterError_deg", slotCenterError_deg, ...
    "chamberWait_s", chamberWait_s, ...
    "totalWaiting_s", sampleStep_s * nnz(plan.isWaiting), ...
    "blockedSampleCount", nnz(blockedSamples));
end

%% Section 5: Local Functions
function wrappedAngle_deg = wrapAngle(angle_deg)
%% Section 0: Header & Readme
% Canonicalizing the diagnostic error prevents a slot near -180 degrees
% from appearing far from an equivalent path angle near +180 degrees.
wrappedAngle_deg = mod(angle_deg + 180, 360) - 180;
end
