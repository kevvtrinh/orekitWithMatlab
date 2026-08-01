function report = runSimpleDijkstraExampleCompatibility( ...
        stateBudgetScale, caseIndices)
%% Section 0: Header & Readme
% SYNTAX
%   report = runSimpleDijkstraExampleCompatibility()
%   report = runSimpleDijkstraExampleCompatibility( ...
%       stateBudgetScale, caseIndices)
%**************************************************************************
% PURPOSE
%   - Run every standalone azimuth/elevation example dataset through only
%     the simple kinodynamic Dijkstra planner.
%   - Record all outcomes without stopping after the first failure.
%**************************************************************************
% INPUTS
%   - stateBudgetScale (positive numeric scalar)
%       Multiplier applied to each case's generated and expanded-state cap.
%       Default is 1.
%   - caseIndices (numeric vector of integers from 1 through 16)
%       Cases to run. Default is every case.
%**************************************************************************
% OUTPUTS
%   - report (table)
%       One row per example with success, state counts, time, and message.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.

%% Section 1: Build Example-Compatible Inputs
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(plannerRoot));
compatibilityCases = buildSimpleDijkstraCompatibilityCases();
if nargin < 1 || isempty(stateBudgetScale)
    stateBudgetScale = 1;
end
if nargin < 2 || isempty(caseIndices)
    caseIndices = 1:numel(compatibilityCases);
end
validateattributes(stateBudgetScale, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(caseIndices, {'numeric'}, ...
    {'vector', 'real', 'finite', 'integer', '>=', 1, ...
    '<=', numel(compatibilityCases)});
compatibilityCases = compatibilityCases(caseIndices);
caseCount = numel(compatibilityCases);

%% Section 2: Run Only The Simple Planner
exampleName = strings(caseCount, 1);
passed = false(caseCount, 1);
plannerSuccess = false(caseCount, 1);
elapsed_s = nan(caseCount, 1);
expandedStateCount = nan(caseCount, 1);
generatedStateCount = nan(caseCount, 1);
message = strings(caseCount, 1);
configuredStateBudget = nan(caseCount, 1);

for caseIndex = 1:caseCount
    compatibilityCase = compatibilityCases{caseIndex};
    configuredStateBudget(caseIndex) = round( ...
        compatibilityCase.Options.maximumGeneratedStates * ...
        stateBudgetScale);
    compatibilityCase.Options.maximumGeneratedStates = ...
        configuredStateBudget(caseIndex);
    compatibilityCase.Options.maximumExpandedStates = ...
        configuredStateBudget(caseIndex);
    exampleName(caseIndex) = compatibilityCase.Name;
    fprintf("\n[%d/%d] %s\n", ...
        caseIndex, caseCount, compatibilityCase.Name);
    caseTimer = tic;
    try
        plan = planSimpleAzElTimeKinodynamicDijkstra( ...
            compatibilityCase.AzElData, ...
            compatibilityCase.InitialState, ...
            compatibilityCase.DestinationState, ...
            compatibilityCase.Limits, ...
            compatibilityCase.Options);
        elapsed_s(caseIndex) = toc(caseTimer);
        plannerSuccess(caseIndex) = plan.success;
        expandedStateCount(caseIndex) = plan.expandedStateCount;
        generatedStateCount(caseIndex) = plan.generatedStateCount;
        message(caseIndex) = plan.message;
        passed(caseIndex) = plan.success && ...
            plan.sampledCollisionValidated;
    catch exception
        elapsed_s(caseIndex) = toc(caseTimer);
        message(caseIndex) = string(exception.identifier) + ": " + ...
            string(exception.message);
    end
    fprintf("  passed=%d, expanded=%.0f, generated=%.0f, %.2f s\n", ...
        passed(caseIndex), expandedStateCount(caseIndex), ...
        generatedStateCount(caseIndex), elapsed_s(caseIndex));
    fprintf("  %s\n", message(caseIndex));
end

%% Section 3: Package The Complete Report
report = table( ...
    exampleName, passed, plannerSuccess, configuredStateBudget, elapsed_s, ...
    expandedStateCount, generatedStateCount, message, ...
    'VariableNames', { ...
        'Example', 'Passed', 'PlannerSuccess', 'StateBudget', 'Elapsed_s', ...
        'ExpandedStates', 'GeneratedStates', 'Message'});
fprintf("\nSimple Dijkstra example compatibility: %d/%d passed.\n", ...
    nnz(report.Passed), height(report));
disp(report);
end

function compatibilityCases = buildSimpleDijkstraCompatibilityCases()
%% Section 0: Header & Readme
% SYNTAX
%   compatibilityCases = buildSimpleDijkstraCompatibilityCases()
%**************************************************************************
% PURPOSE
%   - Reproduce or extract only azElData, endpoints, and physical limits
%     from every standalone example.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - compatibilityCases (cell column of scalar structs)
%       Direct inputs and bounded simple-planner options for every example.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
compatibilityCases = cell(16, 1);

% Example 01 accepts caller-supplied azElData. Use the canonical empty case
% so this row tests its documented endpoint and limit configuration.
time_s = (2700:5:3000).';
emptyBoundary_deg = repmat({zeros(0, 1)}, numel(time_s), 1);
azElData = makeAzElObstacleData( ...
    "Example 01 empty caller input", time_s, ...
    emptyBoundary_deg, emptyBoundary_deg);
initialState = compatibilityEndpoint(2700, [-30, 0]);
destinationState = compatibilityEndpoint(3000, [80, 80]);
limits = compatibilityLimits( ...
    [-180, 180], [-90, 90], [1, 1], [3, 3], [0.04, 0.04]);
options = compatibilityOptions( ...
    5, [2, 2], [0.5, 0.5], [0.2, 0.2], true, 10000);
options.equalCostTieBreaker = "staticTopology";
compatibilityCases{1} = compatibilityCase( ...
    "01 plan from azElData", azElData, initialState, ...
    destinationState, limits, options);

% Example 02 country outlines use the same local projection as the example.
countryTime_s = (2700:5:3000).';
vietnamBoundary = loadCountryBoundaryLatLon("Vietnam");
chinaBoundary = loadCountryBoundaryLatLon("China");
vietnamAzElData = geographicCompatibilityObstacle( ...
    vietnamBoundary, countryTime_s);
chinaAzElData = geographicCompatibilityObstacle( ...
    chinaBoundary, countryTime_s);
azElData = combineAzElObstacles(vietnamAzElData, chinaAzElData);
compatibilityCases{2} = compatibilityCase( ...
    "02 Vietnam-China avoidance", azElData, initialState, ...
    destinationState, limits, options);

% Example 03 static central blocker.
time_s = (0:40).';
azElData = makeAzElObstacleData( ...
    "Central blocker", time_s, [-1; 1; 1; -1; -1], ...
    [43; 43; 47; 47; 43]);
initialState = compatibilityEndpoint(0, [-6, 45]);
destinationState = compatibilityEndpoint(40, [6, 45]);
limits = compatibilityLimits( ...
    [-180, 180], [40, 50], [2, 2], [1, 1], [0.25, 0.25]);
options = compatibilityOptions( ...
    2, [1, 1], [0.5, 0.5], [0.5, 0.5], false, 10000);
options.equalCostTieBreaker = "staticTopology";
compatibilityCases{3} = compatibilityCase( ...
    "03 kinodynamic detour", azElData, initialState, ...
    destinationState, limits, options);

% Example 04 two time-varying walls.
time_s = (0:30).';
wallAzimuth_deg = cell(numel(time_s), 1);
wallElevation_deg = cell(numel(time_s), 1);
lowerAzimuth_deg = cell(numel(time_s), 1);
lowerElevation_deg = cell(numel(time_s), 1);
for timeIndex = 1:numel(time_s)
    wallAzimuth_deg{timeIndex} = [-1; 1; 1; -1; -1];
    wallElevation_deg{timeIndex} = ...
        0.45 * sin(time_s(timeIndex) / 4) + [-2; -2; 2; 2; -2];
    lowerAzimuth_deg{timeIndex} = [2; 4; 4; 2; 2];
    lowerElevation_deg{timeIndex} = ...
        -3.2 + 0.35 * cos(time_s(timeIndex) / 5) + ...
        [-1; -1; 1; 1; -1];
end
azElData = { ...
    makeAzElObstacleData("Oscillating center wall", time_s, ...
        wallAzimuth_deg, wallElevation_deg), ...
    makeAzElObstacleData("Moving lower wall", time_s, ...
        lowerAzimuth_deg, lowerElevation_deg)};
initialState = compatibilityEndpoint(0, [-6, 0]);
destinationState = compatibilityEndpoint(30, [6, 0]);
limits = compatibilityLimits( ...
    [-12, 12], [-6, 6], [2, 2], [1, 1], [0.25, 0.25]);
options = compatibilityOptions( ...
    2, [1, 1], [0.5, 0.5], [0.5, 0.5], false, 10000);
compatibilityCases{4} = compatibilityCase( ...
    "04 dynamic safe intervals", azElData, initialState, ...
    destinationState, limits, options);

% Example 05 five-turn static spiral.
time_s = (0:0.5:400).';
[spiralAzimuth_deg, spiralElevation_deg] = ...
    fiveTurnCompatibilitySpiral();
azElData = makeAzElObstacleData( ...
    "Five-turn spiral wall", time_s, ...
    spiralAzimuth_deg, spiralElevation_deg);
initialState = compatibilityEndpoint(0, [18, 1.5]);
destinationState = compatibilityEndpoint(400, [0, 0]);
limits = compatibilityLimits( ...
    [-20, 20], [-20, 20], [3, 3], [3, 3], [0.125, 0.125]);
options = compatibilityOptions( ...
    4, [1, 1], [0.25, 0.25], [0.25, 0.25], false, 30000);
options.equalCostTieBreaker = "staticTopology";
options.timeStepSchedule_s = [4, 2];
compatibilityCases{5} = compatibilityCase( ...
    "05 five-turn spiral", azElData, initialState, ...
    destinationState, limits, options);

% Example 06 stop-go gates.
time_s = (0:0.5:45).';
gateCenters_deg = [-6, 0, 6];
openWindows_s = [8, 12; 20, 24; 32, 36];
gateObstacles = cell(3, 1);
for gateIndex = 1:3
    gateAzimuth_deg = cell(numel(time_s), 1);
    gateElevation_deg = cell(numel(time_s), 1);
    for timeIndex = 1:numel(time_s)
        gateIsOpen = time_s(timeIndex) >= openWindows_s(gateIndex, 1) && ...
            time_s(timeIndex) <= openWindows_s(gateIndex, 2);
        if gateIsOpen
            gateAzimuth_deg{timeIndex} = zeros(0, 1);
            gateElevation_deg{timeIndex} = zeros(0, 1);
        else
            gateAzimuth_deg{timeIndex} = gateCenters_deg(gateIndex) + ...
                0.75 * [-1; 1; 1; -1; -1];
            gateElevation_deg{timeIndex} = [-2; -2; 2; 2; -2];
        end
    end
    gateObstacles{gateIndex} = makeAzElObstacleData( ...
        "Gate " + gateIndex, time_s, ...
        gateAzimuth_deg, gateElevation_deg);
end
azElData = combineAzElObstacles(gateObstacles);
initialState = compatibilityEndpoint(0, [-12, 0]);
destinationState = compatibilityEndpoint(45, [12, 0]);
limits = compatibilityLimits( ...
    [-14, 14], [-1, 1], [2, 2], [2, 2], [1, 1]);
options = compatibilityOptions( ...
    1, [0.5, 0.5], [0.5, 0.5], [1, 1], false, 20000);
compatibilityCases{6} = compatibilityCase( ...
    "06 stop-go gates", azElData, initialState, ...
    destinationState, limits, options);

% Example 07 wrapped seam blocker.
time_s = (0:0.5:30).';
positiveRegion_deg = [ ...
    174, -5; 180, -5; 180, 5; 174, 5; 174, -5];
negativeRegion_deg = [ ...
    -180, -5; -174, -5; -174, 5; -180, 5; -180, -5];
seamBoundary_deg = [positiveRegion_deg; NaN, NaN; negativeRegion_deg];
azElData = makeAzElObstacleData( ...
    "Wrapped seam blocker", time_s, ...
    seamBoundary_deg(:, 1), seamBoundary_deg(:, 2));
initialState = compatibilityEndpoint(0, [170, 0]);
destinationState = compatibilityEndpoint(30, [-170, 0]);
limits = compatibilityLimits( ...
    [-180, 180], [-20, 20], [2, 2], [2, 2], [1, 1]);
options = compatibilityOptions( ...
    1, [1, 1], [0.5, 0.5], [1, 1], true, 20000);
options.equalCostTieBreaker = "staticTopology";
compatibilityCases{7} = compatibilityCase( ...
    "07 wrapped azimuth seam", azElData, initialState, ...
    destinationState, limits, options);

% Example 08 four alternating slalom barriers.
time_s = (0:0.5:60).';
slalomCenters_deg = [-9, -3, 3, 9];
passAbove = [true, false, true, false];
slalomObstacles = cell(numel(slalomCenters_deg), 1);
for obstacleIndex = 1:numel(slalomCenters_deg)
    slalomAzimuth_deg = slalomCenters_deg(obstacleIndex) + ...
        1.25 * [-1; 1; 1; -1; -1];
    if passAbove(obstacleIndex)
        slalomElevation_deg = [-7; -7; 1; 1; -7];
    else
        slalomElevation_deg = [-1; -1; 7; 7; -1];
    end
    slalomObstacles{obstacleIndex} = makeAzElObstacleData( ...
        "Slalom " + obstacleIndex, time_s, ...
        slalomAzimuth_deg, slalomElevation_deg);
end
azElData = combineAzElObstacles(slalomObstacles);
initialState = compatibilityEndpoint(0, [-15, 0]);
destinationState = compatibilityEndpoint(60, [15, 0]);
limits = compatibilityLimits( ...
    [-17, 17], [-7, 7], [3, 3], [3, 3], [0.25, 0.25]);
options = compatibilityOptions( ...
    2, [1, 1], [0.5, 0.5], [0.5, 0.5], false, 30000);
options.equalCostTieBreaker = "staticTopology";
compatibilityCases{8} = compatibilityCase( ...
    "08 alternating slalom", azElData, initialState, ...
    destinationState, limits, options);

% Example 09 U-shaped trap.
time_s = (0:0.5:60).';
trapRegions_deg = { ...
    [3, -6; 6, -6; 6, 6; 3, 6; 3, -6], ...
    [-6, 5; 6, 5; 6, 6; -6, 6; -6, 5], ...
    [-6, -6; 6, -6; 6, -5; -6, -5; -6, -6]};
[trapAzimuth_deg, trapElevation_deg] = ...
    joinCompatibilityRegions(trapRegions_deg);
azElData = makeAzElObstacleData( ...
    "U-shaped trap", time_s, trapAzimuth_deg, trapElevation_deg);
initialState = compatibilityEndpoint(0, [0, 0]);
destinationState = compatibilityEndpoint(60, [15, 0]);
limits = compatibilityLimits( ...
    [-10, 18], [-10, 10], [3, 3], [3, 3], [0.25, 0.25]);
options = compatibilityOptions( ...
    2, [1, 1], [0.5, 0.5], [0.5, 0.5], false, 30000);
options.equalCostTieBreaker = "staticTopology";
compatibilityCases{9} = compatibilityCase( ...
    "09 U-trap escape", azElData, initialState, ...
    destinationState, limits, options);

% Examples 10-13 and 15 publish standalone data factories. Extract only
% their canonical data, endpoint states, and physical limits.
legacyProblem = makeRotatingSlotGauntlet();
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.125, 0.125];
options = compatibilityOptions( ...
    2, [1, 1], [0.25, 0.25], [0.25, 0.25], false, 30000);
compatibilityCases{10} = compatibilityCase( ...
    "10 rotating slots", legacyProblem.azElData, ...
    legacyProblem.startState, legacyProblem.stopState, limits, options);

legacyProblem = makeChasedBoresightGauntlet();
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.5, 0.5];
options = compatibilityOptions( ...
    2, [1, 1], [0.5, 0.5], [0.5, 0.5], false, 30000);
options.timeStepSchedule_s = [2, 1];
compatibilityCases{11} = compatibilityCase( ...
    "11 chased boresight", legacyProblem.azElData, ...
    legacyProblem.startState, legacyProblem.stopState, limits, options);

legacyProblem = makeWorldsHardestWindmillGauntlet();
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.25, 0.25];
options = compatibilityOptions( ...
    2, [1, 1], [0.25, 0.25], [0.25, 0.25], false, 30000);
options.timeStepSchedule_s = [2, 1];
compatibilityCases{12} = compatibilityCase( ...
    "12 synchronized windmills", legacyProblem.azElData, ...
    legacyProblem.startState, legacyProblem.stopState, limits, options);

legacyProblem = makeRandomBlinkingChessboardGauntlet(1041788057);
targetIndex = find(legacyProblem.target.time_s == 16, 1);
destinationState = struct( ...
    "time_s", legacyProblem.target.time_s(targetIndex), ...
    "position_deg", legacyProblem.target.position_deg(targetIndex, :), ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.5, 0.5];
options = compatibilityOptions( ...
    2, [2, 2], [0.5, 0.5], [0.5, 0.5], false, 30000);
options.timeStepSchedule_s = [2, 1];
options.positionTolerance_deg = [1, 1];
options.velocityTolerance_deg_s = [0.5, 0.5];
options.accelerationTolerance_deg_s2 = [0.5, 0.5];
compatibilityCases{13} = compatibilityCase( ...
    "13 random blinking intercept", legacyProblem.azElData, ...
    legacyProblem.startState, destinationState, limits, options);

% Example 14 has local-only traffic builders. Reproduce only that azElData
% and convert the moving target sample at 56 seconds to an exact-time state.
[azElData, initialState, destinationState, limits] = ...
    movingRendezvousCompatibilityInputs();
options = compatibilityOptions( ...
    2, [1, 1], [0.2, 0.2], [0.2, 0.2], false, 30000);
options.positionTolerance_deg = [0.5, 0.5];
options.velocityTolerance_deg_s = [0.1, 0.1];
options.accelerationTolerance_deg_s2 = [0.1, 0.1];
compatibilityCases{14} = compatibilityCase( ...
    "14 moving rendezvous", azElData, initialState, ...
    destinationState, limits, options);

legacyProblem = makeSpinningRodSpiralGauntlet();
limits = legacyProblem.limits;
limits.maxJerk_deg_s3 = [0.2, 0.2];
options = compatibilityOptions( ...
    2, [1, 1], [0.2, 0.2], [0.4, 0.4], false, 30000);
options.collisionCheckStep_s = 0.08;
options.collisionQueryOptions.SafetyMarginDeg = 0.2;
compatibilityCases{15} = compatibilityCase( ...
    "15 spinning-rod spiral", legacyProblem.azElData, ...
    legacyProblem.startState, legacyProblem.stopState, limits, options);

% The new simple example is included as the sixteenth standalone example.
time_s = (0:8).';
gateAzimuth_deg = cell(numel(time_s), 1);
gateElevation_deg = cell(numel(time_s), 1);
for timeIndex = 1:numel(time_s)
    if time_s(timeIndex) <= 2
        gateAzimuth_deg{timeIndex} = [0.5; 1.5; 1.5; 0.5; 0.5];
        gateElevation_deg{timeIndex} = [-2; -2; 2; 2; -2];
    else
        gateAzimuth_deg{timeIndex} = zeros(0, 1);
        gateElevation_deg{timeIndex} = zeros(0, 1);
    end
end
azElData = makeAzElObstacleData( ...
    "Gate clears after two seconds", time_s, ...
    gateAzimuth_deg, gateElevation_deg);
initialState = compatibilityEndpoint(0, [0, 0]);
destinationState = compatibilityEndpoint(6, [2, 0]);
limits = compatibilityLimits( ...
    [-180, 180], [-2, 2], [2, 2], [1, 1], [1, 1]);
options = compatibilityOptions( ...
    1, [0.5, 0.5], [0.5, 0.5], [1, 1], true, 50000);
compatibilityCases{16} = compatibilityCase( ...
    "simple moving gate", azElData, initialState, ...
    destinationState, limits, options);
end

function outputCase = compatibilityCase( ...
        name, azElData, initialState, destinationState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   outputCase = compatibilityCase(name, azElData, initialState, ...
%       destinationState, limits, options)
%**************************************************************************
% PURPOSE
%   - Package one direct simple-planner compatibility case.
%**************************************************************************
% INPUTS
%   - name (text scalar)
%       Example label.
%   - azElData, initialState, destinationState, limits, options
%       Inputs accepted by the simple planner.
%**************************************************************************
% OUTPUTS
%   - outputCase (scalar struct)
%       Named compatibility inputs.
%**************************************************************************
% UNITS
%   - Field suffixes state their physical units.
outputCase = struct( ...
    "Name", string(name), ...
    "AzElData", {azElData}, ...
    "InitialState", initialState, ...
    "DestinationState", destinationState, ...
    "Limits", limits, ...
    "Options", options);
end

function endpointState = compatibilityEndpoint(time_s, position_deg)
%% Section 0: Header & Readme
% SYNTAX
%   endpointState = compatibilityEndpoint(time_s, position_deg)
%**************************************************************************
% PURPOSE
%   - Build one rest endpoint used by a legacy example.
%**************************************************************************
% INPUTS
%   - time_s (numeric scalar)
%       Exact endpoint time.
%   - position_deg (1-by-2 numeric row)
%       Azimuth and elevation position.
%**************************************************************************
% OUTPUTS
%   - endpointState (scalar struct)
%       Complete zero-dynamics endpoint.
%**************************************************************************
% UNITS
%   - Position is degrees and time is seconds.
endpointState = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0, 0], ...
    "acceleration_deg_s2", [0, 0]);
end

function limits = compatibilityLimits( ...
        azimuthLimits_deg, elevationLimits_deg, maximumVelocity_deg_s, ...
        maximumAcceleration_deg_s2, maximumJerk_deg_s3)
%% Section 0: Header & Readme
% SYNTAX
%   limits = compatibilityLimits(azimuthLimits_deg, ...
%       elevationLimits_deg, maximumVelocity_deg_s, ...
%       maximumAcceleration_deg_s2, maximumJerk_deg_s3)
%**************************************************************************
% PURPOSE
%   - Add an explicit simple-planner jerk limit to legacy physical limits.
%**************************************************************************
% INPUTS
%   - azimuthLimits_deg, elevationLimits_deg (1-by-2 numeric rows)
%       Position limits.
%   - maximumVelocity_deg_s, maximumAcceleration_deg_s2,
%     maximumJerk_deg_s3 (1-by-2 numeric rows)
%       Symmetric dynamic magnitudes.
%**************************************************************************
% OUTPUTS
%   - limits (scalar struct)
%       Complete simple-planner physical limits.
%**************************************************************************
% UNITS
%   - Field suffixes state their physical units.
limits = struct( ...
    "azimuth_deg", azimuthLimits_deg, ...
    "elevation_deg", elevationLimits_deg, ...
    "maxVelocity_deg_s", maximumVelocity_deg_s, ...
    "maxAcceleration_deg_s2", maximumAcceleration_deg_s2, ...
    "maxJerk_deg_s3", maximumJerk_deg_s3);
end

function options = compatibilityOptions( ...
        timeStep_s, positionStep_deg, velocityStep_deg_s, ...
        accelerationStep_deg_s2, allowAzimuthWrap, maximumStateCount)
%% Section 0: Header & Readme
% SYNTAX
%   options = compatibilityOptions(timeStep_s, positionStep_deg, ...
%       velocityStep_deg_s, accelerationStep_deg_s2, ...
%       allowAzimuthWrap, maximumStateCount)
%**************************************************************************
% PURPOSE
%   - Define bounded unguided options shared by compatibility scenarios.
%**************************************************************************
% INPUTS
%   - timeStep_s (positive numeric scalar)
%       Uniform search time step.
%   - positionStep_deg, velocityStep_deg_s,
%     accelerationStep_deg_s2 (1-by-2 numeric rows)
%       Uniform state-lattice spacing.
%   - allowAzimuthWrap (logical scalar)
%       Whether the complete azimuth domain wraps.
%   - maximumStateCount (positive integer scalar)
%       Generated and expanded search cap.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Simple-planner options containing no mature-planner machinery.
%**************************************************************************
% UNITS
%   - Field suffixes state their physical units.
options = struct( ...
    "timeStep_s", timeStep_s, ...
    "positionStep_deg", positionStep_deg, ...
    "velocityStep_deg_s", velocityStep_deg_s, ...
    "accelerationStep_deg_s2", accelerationStep_deg_s2, ...
    "allowAzimuthWrap", allowAzimuthWrap, ...
    "frontierMethod", "scan", ...
    "equalCostTieBreaker", "stateIndex", ...
    "jerkCommandMode", "latticeCompatible", ...
    "pruneNonterminalFinalStates", true, ...
    "pruneDynamicallyUnreachableStates", true, ...
    "collisionCheckStep_s", min(0.25, timeStep_s / 4), ...
    "collisionQueryOptions", struct( ...
        "CollisionMode", "polygon", ...
        "TimePaddingSamples", 0, ...
        "BoundsMarginDeg", [0, 0], ...
        "SafetyMarginDeg", 0), ...
    "positionTolerance_deg", positionStep_deg / 2, ...
    "velocityTolerance_deg_s", velocityStep_deg_s / 2, ...
    "accelerationTolerance_deg_s2", accelerationStep_deg_s2 / 2, ...
    "maximumGeneratedStates", maximumStateCount, ...
    "maximumExpandedStates", maximumStateCount, ...
    "maximumObstacleVerticesPerRegion", Inf);
end

function azElData = geographicCompatibilityObstacle(boundary, time_s)
%% Section 0: Header & Readme
% SYNTAX
%   azElData = geographicCompatibilityObstacle(boundary, time_s)
%**************************************************************************
% PURPOSE
%   - Apply Example 02's translation-only country projection.
%**************************************************************************
% INPUTS
%   - boundary (scalar struct)
%       Country latitude/longitude boundary.
%   - time_s (numeric column)
%       Obstacle sample times.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Static projected country outline in canonical form.
%**************************************************************************
% UNITS
%   - Longitude, latitude, azimuth, and elevation are degrees.
sampleCount = numel(time_s);
azimuthBoundary_deg = boundary.longitude_deg - 110;
elevationBoundary_deg = boundary.latitude_deg;
azElData = makeAzElObstacleData( ...
    boundary.name, time_s, ...
    repmat({azimuthBoundary_deg}, sampleCount, 1), ...
    repmat({elevationBoundary_deg}, sampleCount, 1));
end

function [azimuth_deg, elevation_deg] = fiveTurnCompatibilitySpiral()
%% Section 0: Header & Readme
% SYNTAX
%   [azimuth_deg, elevation_deg] = fiveTurnCompatibilitySpiral()
%**************************************************************************
% PURPOSE
%   - Reproduce Example 05's thick five-turn Archimedean spiral wall.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - azimuth_deg, elevation_deg (numeric columns)
%       Closed spiral-wall polygon.
%**************************************************************************
% UNITS
%   - Azimuth and elevation are degrees.
theta_rad = linspace(0, 10 * pi, 241).';
radius_deg = 2 + 3 * theta_rad / (2 * pi);
centerAzimuth_deg = radius_deg .* cos(theta_rad);
centerElevation_deg = radius_deg .* sin(theta_rad);
deltaAzimuth_deg = gradient(centerAzimuth_deg);
deltaElevation_deg = gradient(centerElevation_deg);
tangentMagnitude_deg = hypot(deltaAzimuth_deg, deltaElevation_deg);
normalAzimuth = -deltaElevation_deg ./ tangentMagnitude_deg;
normalElevation = deltaAzimuth_deg ./ tangentMagnitude_deg;
leftAzimuth_deg = centerAzimuth_deg + 0.4 * normalAzimuth;
leftElevation_deg = centerElevation_deg + 0.4 * normalElevation;
rightAzimuth_deg = centerAzimuth_deg - 0.4 * normalAzimuth;
rightElevation_deg = centerElevation_deg - 0.4 * normalElevation;
azimuth_deg = [leftAzimuth_deg; flipud(rightAzimuth_deg); ...
    leftAzimuth_deg(1)];
elevation_deg = [leftElevation_deg; flipud(rightElevation_deg); ...
    leftElevation_deg(1)];
end

function [azimuth_deg, elevation_deg] = ...
        joinCompatibilityRegions(regions_deg)
%% Section 0: Header & Readme
% SYNTAX
%   [azimuth_deg, elevation_deg] = ...
%       joinCompatibilityRegions(regions_deg)
%**************************************************************************
% PURPOSE
%   - Join polygon regions with NaN separators for canonical azElData.
%**************************************************************************
% INPUTS
%   - regions_deg (cell row of N-by-2 numeric arrays)
%       Closed polygon vertices.
%**************************************************************************
% OUTPUTS
%   - azimuth_deg, elevation_deg (numeric columns)
%       Joined multi-region boundary.
%**************************************************************************
% UNITS
%   - Coordinates are degrees.
rowCount = sum(cellfun(@(region) size(region, 1), regions_deg)) + ...
    numel(regions_deg) - 1;
joinedBoundary_deg = nan(rowCount, 2);
cursor = 1;
for regionIndex = 1:numel(regions_deg)
    region_deg = regions_deg{regionIndex};
    outputRows = cursor:cursor + size(region_deg, 1) - 1;
    joinedBoundary_deg(outputRows, :) = region_deg;
    cursor = outputRows(end) + 2;
end
azimuth_deg = joinedBoundary_deg(:, 1);
elevation_deg = joinedBoundary_deg(:, 2);
end

function [azElData, initialState, destinationState, limits] = ...
        movingRendezvousCompatibilityInputs()
%% Section 0: Header & Readme
% SYNTAX
%   [azElData, initialState, destinationState, limits] = ...
%       movingRendezvousCompatibilityInputs()
%**************************************************************************
% PURPOSE
%   - Reproduce Example 14's local-only traffic azElData and its target
%     state at the final advertised intercept time.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - azElData (canonical obstacle collection)
%       Forty-eight vehicles and two corridor walls.
%   - initialState, destinationState (scalar structs)
%       Initial rest state and target state at 56 seconds.
%   - limits (scalar struct)
%       Example physical limits plus a simple jerk limit.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
time_s = (0:0.5:76).';
rowElevation_deg = linspace(-5.6, 5.4, 12);
vehicleOffset_deg = [-5.50, -1.20, 1.20, 5.50];
rowCenterAzimuth_deg = zeros(numel(time_s), numel(rowElevation_deg));
rowAngularRate_rad_s = zeros(1, numel(rowElevation_deg));
rowPhase_rad = zeros(1, numel(rowElevation_deg));
movingRows = 9:12;
rowAngularRate_rad_s(movingRows) = [0.17, 0.18, 0.19, 0.20];
gateCrossingTimes_s = [55, 60, 63, 66];
gateCenterAtCrossing_deg = [0, 0.65, 0.95, 0];
for movingRowIndex = 1:numel(movingRows)
    rowIndex = movingRows(movingRowIndex);
    rowPhase_rad(rowIndex) = asin( ...
        gateCenterAtCrossing_deg(movingRowIndex) / 1.20) - ...
        rowAngularRate_rad_s(rowIndex) * ...
        gateCrossingTimes_s(movingRowIndex);
end

vehicleData = cell(48, 1);
vehicleIndex = 0;
for rowIndex = 1:numel(rowElevation_deg)
    if ismember(rowIndex, movingRows)
        rowCenterAzimuth_deg(:, rowIndex) = 1.20 * sin( ...
            rowAngularRate_rad_s(rowIndex) * time_s + ...
            rowPhase_rad(rowIndex));
    end
    for laneIndex = 1:numel(vehicleOffset_deg)
        vehicleIndex = vehicleIndex + 1;
        centerAzimuth_deg = rowCenterAzimuth_deg(:, rowIndex) + ...
            vehicleOffset_deg(laneIndex);
        centerElevation_deg = rowElevation_deg(rowIndex) + ...
            zeros(size(time_s));
        vehicleData{vehicleIndex} = rectangularCompatibilityObstacle( ...
            sprintf("Row %02d vehicle %d", rowIndex, laneIndex), ...
            time_s, centerAzimuth_deg, centerElevation_deg, 0.75, 0.36);
    end
end
centerElevation_deg = zeros(size(time_s));
wallData = { ...
    rectangularCompatibilityObstacle("Left corridor wall", time_s, ...
        -8.5 + zeros(size(time_s)), centerElevation_deg, 0.5, 9), ...
    rectangularCompatibilityObstacle("Right corridor wall", time_s, ...
        8.5 + zeros(size(time_s)), centerElevation_deg, 0.5, 9)};
azElData = combineAzElObstacles([vehicleData; wallData(:)]);

initialState = compatibilityEndpoint(0, [0, -8]);
destinationTime_s = 56;
targetPhaseAz_rad = 0.12 * destinationTime_s;
targetPhaseEl_rad = 0.11 * destinationTime_s - 0.40;
destinationState = struct( ...
    "time_s", destinationTime_s, ...
    "position_deg", [ ...
        -3.20 + 0.055 * destinationTime_s + ...
            0.75 * sin(targetPhaseAz_rad), ...
        -6 + 0.16 * destinationTime_s + ...
            1.40 * sin(targetPhaseEl_rad)], ...
    "velocity_deg_s", [ ...
        0.055 + 0.090 * cos(targetPhaseAz_rad), ...
        0.16 + 0.154 * cos(targetPhaseEl_rad)], ...
    "acceleration_deg_s2", [ ...
        -0.01080 * sin(targetPhaseAz_rad), ...
        -0.01694 * sin(targetPhaseEl_rad)]);
limits = compatibilityLimits( ...
    [-9, 9], [-9, 9], [2.2, 2.2], [1.2, 1.2], [0.1, 0.1]);
end

function azElData = rectangularCompatibilityObstacle( ...
        name, time_s, centerAzimuth_deg, centerElevation_deg, ...
        halfWidth_deg, halfHeight_deg)
%% Section 0: Header & Readme
% SYNTAX
%   azElData = rectangularCompatibilityObstacle(name, time_s, ...
%       centerAzimuth_deg, centerElevation_deg, ...
%       halfWidth_deg, halfHeight_deg)
%**************************************************************************
% PURPOSE
%   - Build one moving rectangular obstacle for Example 14's copied data.
%**************************************************************************
% INPUTS
%   - name (text scalar)
%       Obstacle name.
%   - time_s, centerAzimuth_deg, centerElevation_deg (numeric columns)
%       Sample times and rectangle centers.
%   - halfWidth_deg, halfHeight_deg (positive numeric scalars)
%       Rectangle half sizes.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Canonical moving rectangle.
%**************************************************************************
% UNITS
%   - Coordinates and dimensions are degrees; time is seconds.
azimuthBoundary_deg = cell(numel(time_s), 1);
elevationBoundary_deg = cell(numel(time_s), 1);
for timeIndex = 1:numel(time_s)
    azimuthBoundary_deg{timeIndex} = centerAzimuth_deg(timeIndex) + ...
        halfWidth_deg * [-1; 1; 1; -1; -1];
    elevationBoundary_deg{timeIndex} = centerElevation_deg(timeIndex) + ...
        halfHeight_deg * [-1; -1; 1; 1; -1];
end
azElData = makeAzElObstacleData( ...
    name, time_s, azimuthBoundary_deg, elevationBoundary_deg);
end
