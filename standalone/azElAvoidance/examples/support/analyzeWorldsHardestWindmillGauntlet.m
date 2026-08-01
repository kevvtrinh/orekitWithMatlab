function diagnostics = analyzeWorldsHardestWindmillGauntlet(problem, plan)
%% Section 0: Header & Readme
% SYNTAX
%   diagnostics = analyzeWorldsHardestWindmillGauntlet(problem, plan)
%**************************************************************************
% PURPOSE
%   - Measure corridor traversal and angular following near each windmill.
%**************************************************************************
% INPUTS
%   - problem (scalar struct)
%       Windmill centers, obstacle geometry, and planner options.
%   - plan (scalar struct)
%       Successful Dijkstra plan through the corridor.
%**************************************************************************
% OUTPUTS
%   - diagnostics (scalar struct)
%       Corridor coverage, encounter duration, following, and safety data.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees; encounter durations are seconds.

%% Section 1: Validate The Successful Plan
if ~isstruct(plan) || ~isfield(plan, "success") || ~plan.success
    error("analyzeWorldsHardestWindmillGauntlet:InvalidPlan", ...
        "plan must be a successful windmill-gauntlet plan.");
end

%% Section 2: Measure Encounters With Each Windmill
windmillCenters_deg = problem.geometry.centers_deg;
followAngle_deg = zeros(1, size(windmillCenters_deg, 1));
encounterDuration_s = zeros(1, size(windmillCenters_deg, 1));
sampleStep_s = median(diff(plan.time_s));
for windmillIndex = 1:size(windmillCenters_deg, 1)
    relativePosition_deg = plan.position_deg - ...
        windmillCenters_deg(windmillIndex, :);
    centerDistance_deg = hypot( ...
        relativePosition_deg(:, 1), relativePosition_deg(:, 2));
    isNearWindmill = centerDistance_deg <= 3.1;
    encounterDuration_s(windmillIndex) = sampleStep_s * ...
        nnz(isNearWindmill);
    if nnz(isNearWindmill) >= 2
        relativeAngle_rad = unwrap(atan2( ...
            relativePosition_deg(isNearWindmill, 2), ...
            relativePosition_deg(isNearWindmill, 1)));
        followAngle_deg(windmillIndex) = rad2deg( ...
            max(relativeAngle_rad) - min(relativeAngle_rad));
    end
end

%% Section 3: Recheck Exact Polygon Safety
blockedSamples = queryAzElTimeObstacle(plan.obstacleField, ...
    plan.position_deg(:, 1), plan.position_deg(:, 2), plan.time_s, ...
    struct( ...
    "SafetyMarginDeg", problem.options.SafetyMargin_deg, ...
        "TimePaddingSamples", plan.options.TimePaddingSamples));

%% Section 4: Assemble Diagnostics
diagnostics = struct( ...
    "maximumAzimuth_deg", max(plan.position_deg(:, 1)), ...
    "visitedUpperCorridor", any(plan.position_deg(:, 2) >= 3), ...
    "visitedLowerCorridor", any(plan.position_deg(:, 2) <= -3), ...
    "followAngle_deg", followAngle_deg, ...
    "encounterDuration_s", encounterDuration_s, ...
    "maximumFollowAngle_deg", max(followAngle_deg), ...
    "maximumEncounterDuration_s", max(encounterDuration_s), ...
    "blockedSampleCount", nnz(blockedSamples));
end
