function plan = planAzElDijkstra( ...
        azElData, initialState, goalState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   options = planAzElDijkstra(limits, "defaults")
%   plan = planAzElDijkstra( ...
%       azElData, initialState, goalState, limits)
%   plan = planAzElDijkstra( ...
%       azElData, initialState, goalState, limits, options)
%**************************************************************************
% PURPOSE
%   - Plan one exact-checked azimuth/elevation/time trajectory with
%     goal-rooted Dijkstra for static geometry or safe-interval Dijkstra for
%     moving geometry.
%**************************************************************************
% INPUTS
%   - azElData (canonical obstacle data or packed obstacle field)
%       Obstacle geometry or a reusable preferred/legacy packed container.
%   - initialState (scalar struct)
%       time_s, position_deg, velocity_deg_s, and acceleration_deg_s2.
%   - goalState (scalar struct)
%       State schema matching initialState at a later time.
%   - limits (scalar struct)
%       azimuth_deg, elevation_deg, maxVelocity_deg_s, and
%       maxAcceleration_deg_s2 axis bounds.
%   - options (scalar struct)
%       Search, collision, objective, and output-diagnostic controls.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Stable success/failure schema with sampled commands, diagnostics,
%       resolved options, obstacleField, and deprecated workspace alias.
%       The explicit defaults call returns resolved argument-dependent
%       options instead.
%**************************************************************************
% UNITS
%   - Angular position is degrees. Time is seconds. Velocity is deg/s and
%     acceleration is deg/s^2.
%
% HOW TO READ THIS FILE
%   Think of this function as a planning report with seven chapters:
%   1. Restate the request in one predictable format.
%   2. Fill in every omitted option and reject contradictory settings.
%   3. Pack the obstacle polygons once so every later check sees the same
%      geometry.
%   4. Decide whether a simple static map is sufficient or time must be
%      part of the search.
%   5. Try complete grids from coarse to fine and keep the best route that
%      passes an independent polygon check.
%   6. Explain a failure or turn the winning route into sampled commands.
%   7. Return the same field layout on every exit path.
%
%   "Goal-rooted" means the static cost calculation starts at the goal and
%   spreads outward. "Safe interval" means a continuous span of time when
%   the boresight may wait at one position without touching an obstacle.
%   These names sound specialized, but both searches follow the same simple
%   rule: always process the cheapest known unfinished state next.

%% Section 1: Read The Request Into One Predictable Format
% Report question: What exactly did the caller ask the planner to do?
%
% MATLAB callers can omit optional fields, use row or column vectors, and
% request defaults without running a search. This section removes those
% harmless differences. After it finishes, the rest of the file can assume
% that both states, all limits, and every option have one known shape.
isDefaultsRequest = nargin == 2 && isstruct(azElData) && ...
    (ischar(initialState) || isstring(initialState)) && ...
    isscalar(string(initialState)) && ...
    strcmpi(strtrim(string(initialState)), "defaults");
if isDefaultsRequest
    limits = normalizePlannerLimits(azElData);
    plan = defaultAzElDijkstraOptions(limits);
    return;
end
plannerTimer = tic;
if nargin < 5 || isempty(options)
    options = struct();
end
explicitGraph = isstruct(options) && ...
    isfield(options, "GridStep_deg") && ...
    ~isempty(options.GridStep_deg) && ...
    isfield(options, "PrimitiveRadii_deg") && ...
    ~isempty(options.PrimitiveRadii_deg);
requiredStateFields = ["time_s", "position_deg", ...
    "velocity_deg_s", "acceleration_deg_s2"];
initialState = normalizeState( ...
    initialState, "initialState", requiredStateFields);
goalState = normalizeState(goalState, "goalState", requiredStateFields);
if goalState.time_s <= initialState.time_s
    error("planAzElDijkstra:InvalidTime", ...
        "goalState.time_s must follow initialState.time_s.");
end

limits = normalizePlannerLimits(limits);
defaultOptions = defaultAzElDijkstraOptions(limits);
if ~isstruct(options) || ~isscalar(options)
    error("planAzElDijkstra:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownOptionFields = setdiff( ...
    fieldnames(options), fieldnames(defaultOptions), "stable");
if ~isempty(unknownOptionFields)
    warning("planAzElDijkstra:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    options = rmfield(options, unknownOptionFields);
end
defaultOptionFields = fieldnames(defaultOptions);
for defaultOptionIndex = 1:numel(defaultOptionFields)
    defaultOptionField = defaultOptionFields{defaultOptionIndex};
    if ~isfield(options, defaultOptionField) || ...
            isempty(options.(defaultOptionField))
        options.(defaultOptionField) = defaultOptions.(defaultOptionField);
    end
end

%% Section 2: Turn Partial Options Into One Complete Search Plan
% Report question: Which grid sizes and safety checks will actually run?
%
% The caller usually supplies only the choices that matter to the mission.
% Here we make the remaining choices explicit, validate them, and record the
% resolved values in plan.options. This makes a completed run reproducible:
% a future engineer can inspect the returned options instead of guessing
% which defaults were active.
%
% The finest requested grid step also defines the default coarse-to-fine
% schedule. A deliberately supplied graph stays at one resolution because
% changing it would no longer be the graph the caller asked us to search.
finestGridStep_deg = options.GridStep_deg;
if isempty(options.GridStepSchedule_deg)
    if explicitGraph
        options.GridStepSchedule_deg = finestGridStep_deg;
    else
        options.GridStepSchedule_deg = unique( ...
            [4, 2, 1] * finestGridStep_deg, "stable");
    end
end
options.GridStepSchedule_deg = unique( ...
    double(options.GridStepSchedule_deg(:).'), "stable");
options.GridStepSchedule_deg = sort( ...
    options.GridStepSchedule_deg, "descend");
if isempty(options.ValidationStep_s)
    options.ValidationStep_s = min( ...
        options.SampleTime_s, finestGridStep_deg / ...
        max(limits.maxVelocity_deg_s) / 8);
end
if isempty(options.CollisionCheckStep_s)
    options.CollisionCheckStep_s = options.ValidationStep_s;
end

positiveOptionFields = ["SampleTime_s", "ValidationStep_s", ...
    "GridStep_deg", "CollisionCheckStep_s", ...
    "DirectionStep_deg", "MaxSearchTime_s", ...
    "RouteShortcutStep_deg", "KinematicTimeStep_s", ...
    "KinematicProgressStep_deg", "JointKinematicTimeStep_s", ...
    "JointKinematicPositionStep_deg"];
for positiveOptionField = positiveOptionFields
    validateattributes(options.(positiveOptionField), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'positive'});
end
validateattributes(options.GridStepSchedule_deg, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
validateattributes(options.PrimitiveRadiusMultipliers, {'numeric'}, ...
    {'vector', 'real', 'finite', 'positive'});
if ~isempty(options.PrimitiveRadii_deg)
    validateattributes(options.PrimitiveRadii_deg, {'numeric'}, ...
        {'vector', 'real', 'finite', 'positive'});
    options.PrimitiveRadii_deg = unique( ...
        double(options.PrimitiveRadii_deg(:).'));
end
positiveIntegerOptionFields = ["MaximumSafeIntervalSamples", ...
    "MaximumDepartureTrials", "DepartureBatchSize", ...
    "MaxExpansions", "InitialNodeCapacity", ...
    "KinematicMaximumLatticeStates"];
for positiveIntegerOptionField = positiveIntegerOptionFields
    validateattributes(options.(positiveIntegerOptionField), {'numeric'}, ...
        {'scalar', 'integer', 'positive'});
end
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.SafetyMargin_deg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.JointKinematicMaximumJerk_deg_s3, ...
    {'numeric'}, {'vector', 'real', 'finite', 'positive'});
if ~any(numel(options.JointKinematicMaximumJerk_deg_s3) == [1 2])
    error("planAzElDijkstra:InvalidJointJerkLimit", ...
        "JointKinematicMaximumJerk_deg_s3 must contain one or two values.");
end
if isempty(options.JointKinematicPositionStepSchedule_deg)
    options.JointKinematicPositionStepSchedule_deg = unique( ...
        [2 1] * options.JointKinematicPositionStep_deg, "stable");
else
    validateattributes(options.JointKinematicPositionStepSchedule_deg, ...
        {'numeric'}, {'vector', 'real', 'finite', 'positive'});
    options.JointKinematicPositionStepSchedule_deg = unique(sort( ...
        double(options.JointKinematicPositionStepSchedule_deg(:).'), ...
        "descend"), "stable");
end
options.JointKinematicMaximumJerk_deg_s3 = double( ...
    options.JointKinematicMaximumJerk_deg_s3(:).');
if isscalar(options.JointKinematicMaximumJerk_deg_s3)
    options.JointKinematicMaximumJerk_deg_s3 = repmat( ...
        options.JointKinematicMaximumJerk_deg_s3, 1, 2);
end
validateattributes(options.JointKinematicTimeWeight, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.JointKinematicDistanceWeight, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
jointWeightSum = options.JointKinematicTimeWeight + ...
    options.JointKinematicDistanceWeight;
if jointWeightSum <= 0
    error("planAzElDijkstra:InvalidJointObjectiveWeights", ...
        "At least one joint kinematic objective weight must be positive.");
end
options.JointKinematicTimeWeight = ...
    options.JointKinematicTimeWeight / jointWeightSum;
options.JointKinematicDistanceWeight = ...
    options.JointKinematicDistanceWeight / jointWeightSum;
validateattributes(options.AllowAzimuthWrap, ...
    {'logical', 'numeric'}, {'scalar'});
options.AllowAzimuthWrap = logical(options.AllowAzimuthWrap);
validateattributes(options.AllowNonzeroTerminalState, ...
    {'logical', 'numeric'}, {'scalar'});
options.AllowNonzeroTerminalState = logical(options.AllowNonzeroTerminalState);
validateattributes(options.PrintFailureSuggestions, ...
    {'logical', 'numeric'}, {'scalar'});
options.PrintFailureSuggestions = logical(options.PrintFailureSuggestions);
validateattributes(options.FallbackToProfile, ...
    {'logical', 'numeric'}, {'scalar'});
options.FallbackToProfile = logical(options.FallbackToProfile);
if options.AllowAzimuthWrap && ...
        abs(diff(limits.azimuth_deg) - 360) > 1e-6
    error("planAzElDijkstra:InvalidWrapLimits", ...
        "Wrapped azimuth limits must span exactly 360 degrees.");
end

objectiveName = lower(strtrim(string(options.Objective)));
if any(objectiveName == ["minimumangulardistance", ...
        "angulardistance", "distance"])
    options.Objective = "minimumAngularDistance";
elseif any(objectiveName == ["minimumtime", "time"])
    options.Objective = "minimumTime";
else
    error("planAzElDijkstra:InvalidObjective", ...
        "Objective must be minimumAngularDistance or minimumTime.");
end

% MotionMode controls how a time-varying scene is approached. "profile"
% keeps the established safe-interval search, which considers path timing
% while it searches. "pathFirstThenKinematic" first draws a spatial route
% and applies one global clock. "pathStateSpaceKinematic" instead searches
% progress, carried speed, time, and acceleration actions on that route.
% "jointStateSpaceKinematic" searches azimuth, elevation, both rates, both
% accelerations, time, and bounded-jerk actions together. Every experimental
% attempt checks its timed command against every moving obstacle before it is
% returned.
if ~(ischar(options.MotionMode) || ...
        (isstring(options.MotionMode) && isscalar(options.MotionMode)))
    error("planAzElDijkstra:InvalidMotionMode", ...
        "MotionMode must be scalar text.");
end
motionModeName = regexprep( ...
    lower(strtrim(string(options.MotionMode))), "[^a-z]", "");
if any(motionModeName == ["profile", "integratedprofile", ...
        "safeintervalprofile"])
    options.MotionMode = "profile";
elseif any(motionModeName == ["pathfirstthenkinematic", ...
        "pathfirstkinematic", "pathfirst"])
    options.MotionMode = "pathFirstThenKinematic";
elseif any(motionModeName == ["pathstatespacekinematic", ...
        "statespacekinematic", "physicalstatespace", ...
        "kinematicstatespace"])
    options.MotionMode = "pathStateSpaceKinematic";
elseif any(motionModeName == ["jointstatespacekinematic", ...
        "jointkinematic", "fullstatespacekinematic", ...
        "jerkstatespacekinematic"])
    options.MotionMode = "jointStateSpaceKinematic";
else
    error("planAzElDijkstra:InvalidMotionMode", ...
        ["MotionMode must be profile, pathFirstThenKinematic, " ...
        "pathStateSpaceKinematic, or jointStateSpaceKinematic."]);
end

% PathFirstTimeScaling changes only how a completed, corner-blended path is
% traversed. The established minimum-jerk clock remains the default. The
% minimum-time clock uses one acceleration/cruise/deceleration schedule for
% the whole path, so velocity stays continuous without adding waypoint
% stops merely to change direction.
if ~(ischar(options.PathFirstTimeScaling) || ...
        (isstring(options.PathFirstTimeScaling) && ...
        isscalar(options.PathFirstTimeScaling)))
    error("planAzElDijkstra:InvalidPathFirstTimeScaling", ...
        "PathFirstTimeScaling must be scalar text.");
end
timeScalingName = regexprep(lower(strtrim(string( ...
    options.PathFirstTimeScaling))), "[^a-z]", "");
if any(timeScalingName == ["minimumjerk", "gentle"])
    options.PathFirstTimeScaling = "minimumJerk";
elseif any(timeScalingName == ["minimumtime", "fastest"])
    options.PathFirstTimeScaling = "minimumTime";
else
    error("planAzElDijkstra:InvalidPathFirstTimeScaling", ...
        "PathFirstTimeScaling must be minimumJerk or minimumTime.");
end

if any(abs([initialState.velocity_deg_s, ...
        initialState.acceleration_deg_s2]) > 1e-12)
    error("planAzElDijkstra:NonzeroBoundaryDynamics", ...
        "The maintainable planner requires a rest initial state.");
end
hasTerminalDynamics = any(abs([goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2]) > 1e-12);
if hasTerminalDynamics && ~options.AllowNonzeroTerminalState
    error("planAzElDijkstra:NonzeroTerminalStateDisabled", ...
        "Set AllowNonzeroTerminalState to true for terminal capture.");
end

%% Section 3: Prepare One Authoritative Copy Of The Obstacles
% Report question: Which exact polygons will search and validation use?
%
% Packing the input once saves repeated parsing and, more importantly,
% prevents different parts of the planner from interpreting the same
% obstacle differently. Repeated planning calls may pass an already-packed
% field and skip this work.
isPrebuiltObstacleField = isstruct(azElData) && isscalar(azElData) && ...
    isfield(azElData, "Format") && ...
    any(string(azElData.Format) == [ ...
    "AzElTimeObstacleField", "AzElTimeObstacleWorkspace"]);
if isPrebuiltObstacleField
    obstacleField = azElData;
else
    obstacleField = buildAzElTimeObstacleField(azElData, struct( ...
        "MaximumVerticesPerRegion", options.MaximumVerticesPerRegion));
end

%% Section 4: Choose The Simplest Search That Can Answer The Request
% Report question: Can time be ignored while choosing the route?
%
% A truly unchanged obstacle field can be planned on a two-dimensional map.
% Moving polygons, a minimum-time objective, or a requested nonzero final
% rate require the time-aware search. We inspect the packed data rather than
% trusting a label from the caller, because choosing the wrong branch could
% turn a moving obstacle into a false safe passage.
gridStepSchedule_deg = options.GridStepSchedule_deg(:).';
obstacleFieldIsStatic = true;
for packedObstacle = reshape(obstacleField.Obstacles, 1, [])
    if packedObstacle.SampleCount == 0
        continue;
    end
    doesNotCoverPlanningInterval = packedObstacle.TimeSeconds(1) > ...
        initialState.time_s + 1e-9 || ...
        packedObstacle.TimeSeconds(end) < goalState.time_s - 1e-9;
    packedVertexCounts = double(diff(packedObstacle.SliceOffsets));
    if doesNotCoverPlanningInterval || ...
            any(packedVertexCounts ~= packedVertexCounts(1))
        obstacleFieldIsStatic = false;
        break;
    end
    firstVertexIndices = double(packedObstacle.SliceOffsets(1)): ...
        double(packedObstacle.SliceOffsets(2) - 1);
    firstAzimuth_deg = packedObstacle.AzimuthDeg(firstVertexIndices);
    firstElevation_deg = packedObstacle.ElevationDeg(firstVertexIndices);
    % We require every stored vertex to match in the same order. Two slices
    % that merely look alike might describe regions differently, so treating
    % them as static would be an unsafe shortcut.
    for obstacleSampleIndex = 2:packedObstacle.SampleCount
        sampleVertexIndices = double( ...
            packedObstacle.SliceOffsets(obstacleSampleIndex)): ...
            double(packedObstacle.SliceOffsets(obstacleSampleIndex + 1) - 1);
        sampleMatchesFirst = isequaln( ...
            packedObstacle.AzimuthDeg(sampleVertexIndices), ...
            firstAzimuth_deg) && isequaln( ...
            packedObstacle.ElevationDeg(sampleVertexIndices), ...
            firstElevation_deg);
        if ~sampleMatchesFirst
            obstacleFieldIsStatic = false;
            break;
        end
    end
    if ~obstacleFieldIsStatic
        break;
    end
end
staticSearchIsApplicable = ~hasTerminalDynamics && ...
    options.Objective == "minimumAngularDistance" && ...
    obstacleFieldIsStatic;
pathFirstModeRequested = any(options.MotionMode == [ ...
    "pathFirstThenKinematic", "pathStateSpaceKinematic"]);
stateSpaceModeRequested = ...
    options.MotionMode == "pathStateSpaceKinematic";
jointStateSpaceModeRequested = ...
    options.MotionMode == "jointStateSpaceKinematic";
pathFirstModeIsCompatible = ~hasTerminalDynamics && ...
    options.Objective == "minimumAngularDistance" && ...
    (~stateSpaceModeRequested || ~options.AllowAzimuthWrap);
if pathFirstModeRequested && ~pathFirstModeIsCompatible && ...
        ~options.FallbackToProfile
    error("planAzElDijkstra:IncompatibleMotionMode", ...
        "The requested path-based motion mode requires a rest-to-rest " + ...
        "minimumAngularDistance request unless FallbackToProfile is true.");
end
shouldAttemptPathFirst = staticSearchIsApplicable || ...
    (pathFirstModeRequested && pathFirstModeIsCompatible);
motionPlanning = struct( ...
    "RequestedMode", options.MotionMode, ...
    "SelectedMode", "", ...
    "FallbackEnabled", options.FallbackToProfile, ...
    "FallbackUsed", false, ...
    "PathFirstAttempted", false, ...
    "PathFirstSucceeded", false, ...
    "PathFirstMessage", "", ...
    "PathFirstResolutionAttempts", struct([]), ...
    "StateSpaceAttempted", false, ...
    "StateSpaceSucceeded", false, ...
    "StateSpaceMessage", "", ...
    "JointStateAttempted", false, ...
    "JointStateSucceeded", false, ...
    "JointStateMessage", "", ...
    "JointStateResolutionAttempts", struct([]));
if pathFirstModeRequested && ~pathFirstModeIsCompatible
    motionPlanning.PathFirstMessage = ...
        ["The requested path-based motion does not support this objective, " ...
        "terminal state, or wrapped state lattice."];
end

%% Section 4.1: Try A Joint Physical-State Search When Requested
% Report question: Can one search choose position, velocity, acceleration,
% timing, and topology together instead of committing to a route first?
%
% This experimental branch uses bounded constant-jerk actions. Its sparse
% A* frontier is ordered by a dimensionless blend of elapsed-time and path-
% length ratios. Fallback keeps the established planner available when the
% higher-dimensional lattice is too coarse or expensive for this request.
if jointStateSpaceModeRequested
    motionPlanning.StateSpaceAttempted = true;
    motionPlanning.JointStateAttempted = true;
    jointPhaseBudget_s = options.MaxSearchTime_s;
    if options.FallbackToProfile
        jointPhaseBudget_s = max(0.05, options.MaxSearchTime_s / 2);
    end
    jointPhaseTimer = tic;
    jointResolutionSchedule_deg = ...
        options.JointKinematicPositionStepSchedule_deg;
    jointAttemptTemplate = struct( ...
        "PositionStep_deg", NaN, ...
        "Success", false, ...
        "Message", "", ...
        "TerminationReason", "", ...
        "ExpandedNodeCount", 0, ...
        "GeneratedNodeCount", 0, ...
        "SearchElapsed_s", 0, ...
        "CombinedRatio", Inf, ...
        "Selected", false);
    jointAttempts = repmat(jointAttemptTemplate, ...
        numel(jointResolutionSchedule_deg), 1);
    bestJointSearch = struct();
    lastJointSearch = struct();
    bestJointRatio = Inf;
    bestJointAttemptIndex = 0;
    jointAttemptCount = 0;
    for jointResolutionIndex = 1:numel(jointResolutionSchedule_deg)
        remainingJointTime_s = jointPhaseBudget_s - toc(jointPhaseTimer);
        if remainingJointTime_s <= 0
            break;
        end
        remainingJointLevelCount = numel(jointResolutionSchedule_deg) - ...
            jointResolutionIndex + 1;
        jointOptions = options;
        jointOptions.JointKinematicPositionStep_deg = ...
            jointResolutionSchedule_deg(jointResolutionIndex);
        jointOptions.MaxSearchTime_s = max(0.05, ...
            remainingJointTime_s / remainingJointLevelCount);
        jointCandidate = searchJointAzElStateSpace( ...
            obstacleField, initialState, goalState, limits, jointOptions);
        jointAttemptCount = jointAttemptCount + 1;
        jointAttempts(jointAttemptCount) = struct( ...
            "PositionStep_deg", ...
                jointResolutionSchedule_deg(jointResolutionIndex), ...
            "Success", jointCandidate.Success, ...
            "Message", jointCandidate.Message, ...
            "TerminationReason", jointCandidate.TerminationReason, ...
            "ExpandedNodeCount", jointCandidate.ExpandedNodeCount, ...
            "GeneratedNodeCount", jointCandidate.GeneratedNodeCount, ...
            "SearchElapsed_s", jointCandidate.SearchElapsed_s, ...
            "CombinedRatio", jointCandidate.CombinedRatio, ...
            "Selected", false);
        lastJointSearch = jointCandidate;
        if jointCandidate.Success && ...
                jointCandidate.CombinedRatio < bestJointRatio
            bestJointSearch = jointCandidate;
            bestJointRatio = jointCandidate.CombinedRatio;
            bestJointAttemptIndex = jointAttemptCount;
        end
    end
    jointAttempts = jointAttempts(1:jointAttemptCount);
    jointSearch = lastJointSearch;
    if ~isempty(fieldnames(bestJointSearch))
        jointSearch = bestJointSearch;
        jointAttempts(bestJointAttemptIndex).Selected = true;
    end
    jointSearch.ResolutionAttempts = jointAttempts;
    motionPlanning.JointStateResolutionAttempts = jointAttempts;
    motionPlanning.StateSpaceMessage = jointSearch.Message;
    motionPlanning.JointStateMessage = jointSearch.Message;
    if jointSearch.Success
        motionPlanning.SelectedMode = "jointStateSpaceKinematic";
        motionPlanning.StateSpaceSucceeded = true;
        motionPlanning.JointStateSucceeded = true;
        plan = assembleJointStateSpacePlan( ...
            jointSearch, obstacleField, initialState, goalState, ...
            limits, options, motionPlanning, toc(plannerTimer));
        plan = normalizeAzElDijkstraPlanSchema(plan);
        return;
    end
    if ~options.FallbackToProfile
        plan = failedStaticPlan( ...
            "Joint physical-state search failed: " + jointSearch.Message, ...
            obstacleField, initialState, goalState, limits, options, ...
            emptyGoalDijkstraResult(options), toc(plannerTimer));
        plan.method = "jointStateSpaceKinematicAStar";
        plan.motionPlanning = motionPlanning;
        plan.retiming = failedRetiming( ...
            jointSearch.Message, jointSearch.SearchElapsed_s);
        plan.retiming.MotionStyle = "jointStateSpaceKinematic";
        plan.retiming.TimeScalingStyle = "boundedJerkStateSpaceAStar";
        plan.retiming.StateSpaceSearch = jointSearch;
        plan = finalizeAzElPlanFailure(plan);
        plan = normalizeAzElDijkstraPlanSchema(plan);
        return;
    end
    motionPlanning.FallbackUsed = true;
end

%% Section 5: Report The Static Search From Coarse To Fine
% Report question: Which complete static grid gives the best valid route?
%
% Coarse grids answer quickly but cannot represent narrow passages. Fine
% grids represent more detail but cost more time and memory. Each attempt is
% a complete search at its own resolution. We save one diagnostic row per
% attempt, keep the shortest independently validated route, and stop early
% only when the straight-line lower bound proves that no improvement exists.
if shouldAttemptPathFirst
    motionPlanning.PathFirstAttempted = true;
    motionPlanning.StateSpaceAttempted = ...
        motionPlanning.StateSpaceAttempted || stateSpaceModeRequested;
    pathFirstPhaseTimer = tic;
    pathFirstPhaseBudget_s = options.MaxSearchTime_s;
    if pathFirstModeRequested && options.FallbackToProfile
        % Reserve half of the public wall-time budget for the profile search.
        % A failed shortcut should not consume the time needed by its fallback.
        pathFirstPhaseBudget_s = max( ...
            0.05, options.MaxSearchTime_s / 2);
    end
    staticAttemptTemplate = struct( ...
        "GridStep_deg", NaN, ...
        "PrimitiveRadii_deg", zeros(1, 0), ...
        "Success", false, ...
        "Message", "", ...
        "ExpandedNodeCount", 0, ...
        "GeneratedNodeCount", 0, ...
        "SearchElapsed_s", 0, ...
        "TerminationReason", "", ...
        "ObjectiveCost", Inf, ...
        "CandidateTime_s", zeros(0, 1), ...
        "CandidatePosition_deg", zeros(0, 2), ...
        "Selected", false);
    staticAttempts = repmat( ...
        staticAttemptTemplate, numel(gridStepSchedule_deg), 1);
    staticAttemptCount = 0;
    bestStaticPlan = struct();
    lastStaticPlan = struct();
    bestStaticRouteDistance_deg = Inf;

    % A failed coarse grid says only that this rough drawing has no route.
    % It does not prove that the continuous problem is impossible, so the
    % report continues to the next, more detailed drawing.
    for staticGridLevel = 1:numel(gridStepSchedule_deg)
        remainingStaticTime_s = options.MaxSearchTime_s - toc(plannerTimer);
        if pathFirstModeRequested && options.FallbackToProfile
            remainingStaticTime_s = min(remainingStaticTime_s, ...
                pathFirstPhaseBudget_s - toc(pathFirstPhaseTimer));
        end
        if remainingStaticTime_s <= 0
            break;
        end
        staticOptions = options;
        staticOptions.GridStep_deg = gridStepSchedule_deg(staticGridLevel);
        staticOptions.PrintFailureSuggestions = false;
        remainingStaticLevelCount = numel(gridStepSchedule_deg) - ...
            staticGridLevel + 1;
        staticOptions.MaxSearchTime_s = remainingStaticTime_s / ...
            remainingStaticLevelCount;

        staticCandidate = solveStaticGoalDijkstra( ...
            obstacleField, initialState, goalState, limits, staticOptions);
        lastStaticPlan = staticCandidate;
        staticEndpointDelta_deg = wrappedDelta( ...
            initialState.position_deg, goalState.position_deg, ...
            limits, options);
        staticEndpointLowerBound_deg = hypot( ...
            staticEndpointDelta_deg(1), staticEndpointDelta_deg(2));
        if staticCandidate.success && abs( ...
                staticCandidate.angularPathLength_deg - ...
                staticEndpointLowerBound_deg) <= 1e-9
            staticCandidate.optimalGlobally = true;
            staticCandidate.suboptimalityBound = 1;
        end
        if staticCandidate.success
            staticCandidateTime_s = staticCandidate.time_s;
            staticCandidatePosition_deg = staticCandidate.position_deg;
            staticCandidateCost = staticCandidate.objectiveCost;
        else
            staticCandidateTime_s = zeros(0, 1);
            staticCandidatePosition_deg = zeros(0, 2);
            staticCandidateCost = Inf;
        end
        staticAttemptCount = staticAttemptCount + 1;
        staticAttempts(staticAttemptCount) = struct( ...
            "GridStep_deg", gridStepSchedule_deg(staticGridLevel), ...
            "PrimitiveRadii_deg", zeros(1, 0), ...
            "Success", staticCandidate.success, ...
            "Message", staticCandidate.message, ...
            "ExpandedNodeCount", staticCandidate.expandedNodeCount, ...
            "GeneratedNodeCount", staticCandidate.generatedNodeCount, ...
            "SearchElapsed_s", staticCandidate.searchElapsed_s, ...
            "TerminationReason", ...
            staticCandidate.topologySearch.TerminationReason, ...
            "ObjectiveCost", staticCandidateCost, ...
            "CandidateTime_s", staticCandidateTime_s, ...
            "CandidatePosition_deg", staticCandidatePosition_deg, ...
            "Selected", false);
        if staticCandidate.success && ...
                staticCandidate.objectiveCost < bestStaticRouteDistance_deg
            bestStaticPlan = staticCandidate;
            bestStaticRouteDistance_deg = staticCandidate.objectiveCost;
        end
        % No route can be shorter than the straight line between endpoints.
        % If a validated candidate reaches that length, finer grids cannot
        % improve it and the static chapter is complete.
        if staticCandidate.success && staticCandidate.optimalGlobally
            break;
        end
    end
    staticAttempts = staticAttempts(1:staticAttemptCount);

    if ~isempty(fieldnames(bestStaticPlan))
        selectedStaticAttempt = find([staticAttempts.Success] & ...
            abs([staticAttempts.ObjectiveCost] - ...
            bestStaticRouteDistance_deg) <= 1e-9, 1, "last");
        staticAttempts(selectedStaticAttempt).Selected = true;
        motionPlanning.PathFirstResolutionAttempts = staticAttempts;
        bestStaticPlan.message = "Goal-rooted Dijkstra found an exact-checked route.";
        bestStaticPlan.method = "adaptiveGoalRootedDijkstra";
        bestStaticPlan.exactCollisionValidated = true;
        bestStaticPlan.selectedGridStep_deg = bestStaticPlan.options.GridStep_deg;
        bestStaticPlan.resolutionAttempts = staticAttempts;
        bestStaticPlan.safeIntervalSearch = struct();
        bestStaticPlan.searchElapsed_s = toc(plannerTimer);
        bestStaticPlan.options = options;
        if jointStateSpaceModeRequested && motionPlanning.FallbackUsed
            motionPlanning.SelectedMode = "profile";
        else
            motionPlanning.SelectedMode = options.MotionMode;
        end
        motionPlanning.PathFirstSucceeded = true;
        motionPlanning.PathFirstMessage = ...
            "The spatial route accepted its applied kinematics and time-aware validation.";
        if stateSpaceModeRequested
            motionPlanning.StateSpaceSucceeded = true;
            motionPlanning.StateSpaceMessage = ...
                bestStaticPlan.retiming.StateSpaceSearch.Message;
        end
        bestStaticPlan.motionPlanning = motionPlanning;
        if options.MotionMode == "pathStateSpaceKinematic"
            bestStaticPlan.message = ...
                "Path-state Dijkstra found and validated a velocity-carrying trajectory.";
            bestStaticPlan.method = "pathStateSpaceKinematicDijkstra";
        elseif pathFirstModeRequested && ~obstacleFieldIsStatic
            bestStaticPlan.message = ...
                "Path-first Dijkstra route accepted applied kinematics and moving-obstacle validation.";
            bestStaticPlan.method = "pathFirstThenKinematicDijkstra";
        end
        plan = normalizeAzElDijkstraPlanSchema(bestStaticPlan);
        return;
    end

    motionPlanning.PathFirstResolutionAttempts = staticAttempts;
    if isempty(fieldnames(lastStaticPlan))
        motionPlanning.PathFirstMessage = ...
            "The path-first time budget expired before its first grid started.";
    else
        motionPlanning.PathFirstMessage = lastStaticPlan.message;
    end
    if stateSpaceModeRequested
        motionPlanning.StateSpaceMessage = motionPlanning.PathFirstMessage;
    end
    if pathFirstModeRequested && ~options.FallbackToProfile
        if isempty(fieldnames(lastStaticPlan))
            lastStaticPlan = failedStaticPlan( ...
                motionPlanning.PathFirstMessage, obstacleField, ...
                initialState, goalState, limits, options, ...
                emptyGoalDijkstraResult(options), toc(plannerTimer));
        end
        plan = lastStaticPlan;
        plan.success = false;
        plan.message = "Path-first motion failed and profile fallback is disabled. " + ...
            motionPlanning.PathFirstMessage;
        if options.MotionMode == "pathStateSpaceKinematic"
            plan.method = "pathStateSpaceKinematicDijkstra";
        else
            plan.method = "pathFirstThenKinematicDijkstra";
        end
        plan.searchElapsed_s = toc(plannerTimer);
        plan.options = options;
        plan.resolutionAttempts = staticAttempts;
        plan.motionPlanning = motionPlanning;
        plan = finalizeAzElPlanFailure(plan);
        plan = normalizeAzElDijkstraPlanSchema(plan);
        return;
    end
end

if pathFirstModeRequested
    motionPlanning.FallbackUsed = true;
end

%% Section 6: Report The Time-Aware Search From Coarse To Fine
% Report question: When may the boresight wait and move through this scene?
%
% The static chapter is skipped for moving scenes and is also allowed to
% hand off here when none of its grids produced a valid timed command. A
% dynamic state combines a position with one safe span of time. Its cost is
% simply the earliest proven arrival inside that span. As above, the report
% records every resolution and retains the best successful candidate.
dynamicAttemptTemplate = struct( ...
    "GridStep_deg", NaN, ...
    "PrimitiveRadii_deg", zeros(1, 0), ...
    "Success", false, ...
    "Message", "", ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "", ...
    "ObjectiveCost", Inf, ...
    "CandidateTime_s", zeros(0, 1), ...
    "CandidatePosition_deg", zeros(0, 2), ...
    "Selected", false);
dynamicAttempts = repmat( ...
    dynamicAttemptTemplate, numel(gridStepSchedule_deg), 1);
dynamicAttemptCount = 0;
lastDynamicSearchResult = struct();
bestDynamicSearchResult = struct();
bestObjectiveCost = Inf;
selectedGridStep_deg = NaN;
endpointDelta_deg = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
endpointLowerBound_deg = hypot( ...
    endpointDelta_deg(1), endpointDelta_deg(2));

% A coarse failure is evidence about that grid, not proof that the mission
% is impossible. Leave enough wall time for every requested resolution.
for gridLevelIndex = 1:numel(gridStepSchedule_deg)
    remainingSearchTime_s = options.MaxSearchTime_s - toc(plannerTimer);
    if remainingSearchTime_s <= 0
        break;
    end

    attemptOptions = options;
    attemptOptions.GridStep_deg = gridStepSchedule_deg(gridLevelIndex);
    if isempty(options.PrimitiveRadii_deg)
        attemptOptions.PrimitiveRadii_deg = unique( ...
            gridStepSchedule_deg(gridLevelIndex) * ...
            options.PrimitiveRadiusMultipliers);
    end
    remainingLevelCount = numel(gridStepSchedule_deg) - ...
        gridLevelIndex + 1;
    % Divide the remaining time fairly. Without this reservation, one rough
    % grid could consume the whole budget before a finer useful grid starts.
    attemptBudget_s = remainingSearchTime_s / remainingLevelCount;
    if gridLevelIndex == numel(gridStepSchedule_deg)
        attemptBudget_s = remainingSearchTime_s;
    end
    attemptOptions.MaxSearchTime_s = max( ...
        min(attemptBudget_s, options.MaxSearchTime_s), 0.05);

    searchCandidate = searchAzElSafeIntervalDijkstra(obstacleField, ...
        initialState, goalState, limits, attemptOptions);
    if searchCandidate.Success
        candidateTime_s = searchCandidate.Profile.time_s;
        candidatePosition_deg = searchCandidate.Profile.position_deg;
        if options.Objective == "minimumAngularDistance"
            candidateObjectiveCost = searchCandidate.Route.angularPathLength_deg;
        else
            candidateObjectiveCost = searchCandidate.Route.arrivalTime_s(end);
        end
    else
        candidateTime_s = zeros(0, 1);
        candidatePosition_deg = zeros(0, 2);
        candidateObjectiveCost = Inf;
    end
    dynamicAttemptCount = dynamicAttemptCount + 1;
    dynamicAttempts(dynamicAttemptCount, 1) = struct( ...
        "GridStep_deg", gridStepSchedule_deg(gridLevelIndex), ...
        "PrimitiveRadii_deg", ...
        attemptOptions.PrimitiveRadii_deg, ...
        "Success", searchCandidate.Success, ...
        "Message", searchCandidate.Message, ...
        "ExpandedNodeCount", searchCandidate.ExpandedNodeCount, ...
        "GeneratedNodeCount", searchCandidate.GeneratedNodeCount, ...
        "SearchElapsed_s", searchCandidate.SearchElapsed_s, ...
        "TerminationReason", searchCandidate.TerminationReason, ...
        "ObjectiveCost", candidateObjectiveCost, ...
        "CandidateTime_s", candidateTime_s, ...
        "CandidatePosition_deg", candidatePosition_deg, ...
        "Selected", false);
    % Preserve the latest explanation even when every attempt fails. If at
    % least one succeeds, bestDynamicSearchResult becomes the final report.
    lastDynamicSearchResult = searchCandidate;
    if searchCandidate.Success
        if ~hasTerminalDynamics && ...
                abs(searchCandidate.Route.angularPathLength_deg - ...
                endpointLowerBound_deg) <= 1e-9
            searchCandidate.GlobalAngularOptimal = true;
            lastDynamicSearchResult = searchCandidate;
        end
        if options.Objective == "minimumAngularDistance"
            candidateObjectiveCost = searchCandidate.Route.angularPathLength_deg;
        else
            candidateObjectiveCost = searchCandidate.Route.arrivalTime_s(end);
        end
        if candidateObjectiveCost < bestObjectiveCost
            bestDynamicSearchResult = searchCandidate;
            bestObjectiveCost = candidateObjectiveCost;
            selectedGridStep_deg = gridStepSchedule_deg(gridLevelIndex);
        end
        % A straight-line distance match is a proof of best possible angular
        % distance. Minimum-time mode returns its first proven arrival. In
        % every other case, keep comparing finer validated candidates.
        if searchCandidate.GlobalAngularOptimal || ...
                options.Objective == "minimumTime"
            break;
        end
    end
end

dynamicAttempts = dynamicAttempts(1:dynamicAttemptCount);
selectedDynamicSearchResult = lastDynamicSearchResult;
if ~isempty(fieldnames(bestDynamicSearchResult))
    selectedDynamicSearchResult = bestDynamicSearchResult;
    selectedDynamicAttemptIndex = find([dynamicAttempts.Success] & ...
        abs([dynamicAttempts.ObjectiveCost] - ...
        bestObjectiveCost) <= 1e-9, 1, "last");
    dynamicAttempts(selectedDynamicAttemptIndex).Selected = true;
end

%% Section 7: Write The Final Planning Report
% Report question: What happened, and what evidence should the caller keep?
%
% Success and failure use one public field layout. That consistency lets a
% caller log a run before checking plan.success. Failure records preserve
% every attempted grid and the final search explanation; success records add
% the uniformly sampled command that visualization and control code consume.
motionPlanning.SelectedMode = "profile";
if isempty(fieldnames(selectedDynamicSearchResult)) || ...
        ~selectedDynamicSearchResult.Success
    if isempty(fieldnames(selectedDynamicSearchResult))
        message = "The search time budget expired before Dijkstra started.";
    else
        message = selectedDynamicSearchResult.Message;
    end
    plan = struct( ...
        "success", false, ...
        "message", string(message), ...
        "method", "progressiveSafeIntervalDijkstra", ...
        "time_s", zeros(0, 1), ...
        "position_deg", zeros(0, 2), ...
        "positionUnwrapped_deg", zeros(0, 2), ...
        "velocity_deg_s", zeros(0, 2), ...
        "acceleration_deg_s2", zeros(0, 2), ...
        "isWaiting", false(0, 1), ...
        "cost_s", Inf, ...
        "objective", options.Objective, ...
        "objectiveCost", Inf, ...
        "objectiveCostUnits", "", ...
        "angularPathLength_deg", Inf, ...
        "angularLowerBound_deg", NaN, ...
        "suboptimalityBound", Inf, ...
        "optimalOnLattice", false, ...
        "optimalGlobally", false, ...
        "exactCollisionValidated", false, ...
        "expandedNodeCount", sum([dynamicAttempts.ExpandedNodeCount]), ...
        "generatedNodeCount", sum([dynamicAttempts.GeneratedNodeCount]), ...
        "searchElapsed_s", toc(plannerTimer), ...
        "selectedGridStep_deg", NaN, ...
        "startState", initialState, ...
        "stopState", goalState, ...
        "limits", limits, ...
        "options", options, ...
        "obstacleField", obstacleField, ...
        "workspace", obstacleField, ... % deprecated compatibility alias
        "resolutionAttempts", dynamicAttempts, ...
        "safeIntervalSearch", selectedDynamicSearchResult, ...
        "motionPlanning", motionPlanning);
    plan = finalizeAzElPlanFailure(plan);
    plan = normalizeAzElDijkstraPlanSchema(plan);
    return;
end

profile = selectedDynamicSearchResult.Profile;
route = selectedDynamicSearchResult.Route;
% Search nodes mark only the important wait/move decisions. The profile is
% the regularly sampled command history used by plots and downstream code.
finalEndpointDelta_deg = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, limits, options);
angularLowerBound_deg = hypot( ...
    finalEndpointDelta_deg(1), finalEndpointDelta_deg(2));
if options.Objective == "minimumAngularDistance"
    selectedObjectiveCost = route.angularPathLength_deg;
    selectedObjectiveUnits = "deg";
else
    selectedObjectiveCost = route.arrivalTime_s(end) - ...
        initialState.time_s;
    selectedObjectiveUnits = "s";
end

plan = struct( ...
    "success", true, ...
    "message", ...
    "Progressive safe-interval Dijkstra found an exact-checked trajectory.", ...
    "method", "progressiveSafeIntervalDijkstra", ...
    "time_s", profile.time_s, ...
    "position_deg", profile.position_deg, ...
    "positionUnwrapped_deg", profile.positionUnwrapped_deg, ...
    "velocity_deg_s", profile.velocity_deg_s, ...
    "acceleration_deg_s2", profile.acceleration_deg_s2, ...
    "isWaiting", profile.isWaiting, ...
    "cost_s", goalState.time_s - initialState.time_s, ...
    "objective", options.Objective, ...
    "objectiveCost", selectedObjectiveCost, ...
    "objectiveCostUnits", selectedObjectiveUnits, ...
    "angularPathLength_deg", route.angularPathLength_deg, ...
    "angularLowerBound_deg", angularLowerBound_deg, ...
    "suboptimalityBound", ...
    max(1, route.angularPathLength_deg / ...
        max(angularLowerBound_deg, eps)), ...
    "optimalOnLattice", false, ...
    "optimalGlobally", selectedDynamicSearchResult.GlobalAngularOptimal, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", sum([dynamicAttempts.ExpandedNodeCount]), ...
    "generatedNodeCount", sum([dynamicAttempts.GeneratedNodeCount]), ...
    "searchElapsed_s", toc(plannerTimer), ...
    "selectedGridStep_deg", selectedGridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", limits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "resolutionAttempts", dynamicAttempts, ...
    "safeIntervalSearch", selectedDynamicSearchResult, ...
    "motionPlanning", motionPlanning);
plan = normalizeAzElDijkstraPlanSchema(plan);
end

%% Section 8: Supporting Chapters Used By The Report Above
% The local functions appear in reading order:
%   - one complete static-grid search and its route cleanup/retiming;
%   - one complete moving-obstacle search and its safe-time bookkeeping;
%   - shared motion, wrapping, frontier, defaults, and schema helpers.
% Keeping them here makes the public workflow readable from top to bottom
% while keeping rules used in several places in one maintainable copy.
function plan = solveStaticGoalDijkstra( ...
        obstacleField, initialState, goalState, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   plan = solveStaticGoalDijkstra( ...
%       obstacleField, initialState, goalState, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Solve and retime one complete static goal-rooted Dijkstra graph.
%**************************************************************************
% INPUTS
%   - obstacleField, initialState, goalState, axisLimits, options (planner inputs)
%       Packed geometry, boundary states, limits, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Successful or failed static-plan record.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees and time quantities are seconds.
%
% PLAIN-LANGUAGE SUMMARY
%   This function answers one question at one grid resolution: "If the
%   obstacles do not move, what is the shortest safe line I can draw from
%   the exact start to the exact goal?" It first finds a route on the grid,
%   removes unnecessary corners, calculates how long each slew needs, and
%   finally checks the timed command against the original polygons.
%
%   Static and moving geometry need different kinds of search state. Keeping
%   this complete static story together prevents time-related cases from
%   being mixed into the much simpler map search.

%% Section 1: Confirm The Exact Endpoints Are Safe
% The nearest grid points are only search aids. The true start and goal are
% mission inputs, so check those exact coordinates before drawing a map.
staticTimer = tic;
topology = emptyGoalDijkstraResult(options);
endpointBlocked = queryAzElTimeObstacle(obstacleField, ...
    [initialState.position_deg(1); goalState.position_deg(1)], ...
    [initialState.position_deg(2); goalState.position_deg(2)], ...
    [initialState.time_s; goalState.time_s], struct( ...
    "CollisionMode", "polygon", ...
    "SafetyMarginDeg", options.SafetyMargin_deg));
if any(endpointBlocked)
    plan = failedStaticPlan( ...
        "The initial or goal state lies inside the inflated obstacle field.", ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end

%% Section 2: Draw The Map That Dijkstra Will Search
% The grid is a temporary square-paper drawing of the continuous field. Each
% grid point is marked free or blocked by querying the authoritative packed
% polygons. Wrapped azimuth omits the duplicated right edge because -180 and
% +180 degrees describe the same direction.
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    azimuthBinCount = ceil(azimuthSpan_deg / options.GridStep_deg);
    wrappedGridStep_deg = azimuthSpan_deg / azimuthBinCount;
    azimuthGrid_deg = axisLimits.azimuth_deg(1) + ...
        (0:azimuthBinCount - 1) * wrappedGridStep_deg;
else
    azimuthGrid_deg = inclusiveGrid( ...
        axisLimits.azimuth_deg, options.GridStep_deg);
end
elevationGrid_deg = inclusiveGrid( ...
    axisLimits.elevation_deg, options.GridStep_deg);
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
blockedNodeMask = queryAzElTimeObstacle(obstacleField, ...
    azimuthMesh_deg(:), elevationMesh_deg(:), initialState.time_s, ...
    struct("CollisionMode", "polygon", ...
    "SafetyMarginDeg", options.SafetyMargin_deg));
blockedNodeMask = reshape(blockedNodeMask, size(azimuthMesh_deg));

%% Section 3: Work Backward From The Goal Until The Start Is Reached
% The exact endpoints rarely fall on grid points, so first choose the nearest
% free grid point for each. Dijkstra then starts at the goal and writes the
% remaining angular distance onto progressively farther free points. Starting
% at the goal makes each saved successor naturally point toward the goal.
topologySearchTimer = tic;
blockedNodeMask = logical(blockedNodeMask);
elevationBinCount = numel(elevationGrid_deg);
azimuthBinCount = numel(azimuthGrid_deg);
gridStateCount = elevationBinCount * azimuthBinCount;
initialNodeIndex = nearestFreeGridNode(blockedNodeMask, ...
    azimuthGrid_deg, elevationGrid_deg, initialState.position_deg, ...
    options.AllowAzimuthWrap);
goalNodeIndex = nearestFreeGridNode(blockedNodeMask, ...
    azimuthGrid_deg, elevationGrid_deg, goalState.position_deg, ...
    options.AllowAzimuthWrap);
if initialNodeIndex == 0 || goalNodeIndex == 0
    topology = emptyGoalDijkstraResult(options);
    topology.Message = "No free grid state is available near an endpoint.";
    topology.SearchElapsed_s = toc(topologySearchTimer);
else
    costToGoal_deg = inf(gridStateCount, 1);
    successorNodeIndex = zeros(gridStateCount, 1, "uint32");
    settledNodeMask = false(gridStateCount, 1);
    costToGoal_deg(goalNodeIndex) = 0;
    successorNodeIndex(goalNodeIndex) = uint32(goalNodeIndex);
    frontierCapacity = options.InitialNodeCapacity;
    dijkstraFrontier = struct( ...
        "Node", zeros(frontierCapacity, 1, "uint32"), ...
        "Cost_deg", inf(frontierCapacity, 1), ...
        "Serial", zeros(frontierCapacity, 1, "uint64"), ...
        "Count", 0, ...
        "NextSerial", uint64(0));
    dijkstraFrontier = pushDijkstraFrontier( ...
        dijkstraFrontier, goalNodeIndex, 0);
    expandedGridStateCount = 0;
    generatedGridStateCount = 1;
    topologyTerminationReason = "";
    reachedInitialGridState = false;
    neighborElevationOffsets = [-1 -1 -1 0 0 1 1 1];
    neighborAzimuthOffsets = [-1 0 1 -1 1 -1 0 1];

    % --- Visit The Cheapest Unfinished Grid Point -----------------------
    % The frontier is the planner's to-do list, ordered by known distance to
    % the goal. When a better distance is found, a new to-do item is added
    % instead of editing the older one in place. An older item is harmless:
    % the comparison below recognizes and skips it when its turn arrives.
    while dijkstraFrontier.Count > 0
        if toc(topologySearchTimer) >= options.MaxSearchTime_s
            topologyTerminationReason = "wallTimeLimit";
            break;
        end
        if expandedGridStateCount >= options.MaxExpansions
            topologyTerminationReason = "expansionLimit";
            break;
        end
        [dijkstraFrontier, currentNodeIndex, queuedCost_deg] = popDijkstraFrontier( ...
            dijkstraFrontier);
        queuedLabelWasSuperseded = queuedCost_deg > ...
            costToGoal_deg(currentNodeIndex) + 1e-12;
        if settledNodeMask(currentNodeIndex) || queuedLabelWasSuperseded
            continue;
        end
        settledNodeMask(currentNodeIndex) = true;
        expandedGridStateCount = expandedGridStateCount + 1;
        if currentNodeIndex == initialNodeIndex
            reachedInitialGridState = true;
            topologyTerminationReason = "goalCostReachedInitialState";
            break;
        end

        [currentElevationIndex, currentAzimuthIndex] = ind2sub( ...
            [elevationBinCount azimuthBinCount], currentNodeIndex);
        % Check the eight surrounding squares. A neighbor is considered only
        % when it stays inside the field, is not blocked, and does not slip
        % diagonally between two blocked corners.
        for neighborDirectionIndex = 1:numel(neighborElevationOffsets)
            neighborElevationIndex = currentElevationIndex + ...
                neighborElevationOffsets(neighborDirectionIndex);
            neighborAzimuthIndex = currentAzimuthIndex + ...
                neighborAzimuthOffsets(neighborDirectionIndex);
            if neighborElevationIndex < 1 || ...
                    neighborElevationIndex > elevationBinCount
                continue;
            end
            if options.AllowAzimuthWrap
                neighborAzimuthIndex = mod( ...
                    neighborAzimuthIndex - 1, azimuthBinCount) + 1;
            elseif neighborAzimuthIndex < 1 || ...
                    neighborAzimuthIndex > azimuthBinCount
                continue;
            end
            if blockedNodeMask( ...
                    neighborElevationIndex, neighborAzimuthIndex)
                continue;
            end
            isDiagonalTransition = neighborElevationOffsets( ...
                neighborDirectionIndex) ~= 0 && ...
                neighborAzimuthOffsets(neighborDirectionIndex) ~= 0;
            if isDiagonalTransition
                % A diagonal between two touching blocked squares looks open
                % at their shared corner but has no real clearance. Reject it
                % so the grid cannot invent a route through solid geometry.
                diagonalCutsBlockedCorner = blockedNodeMask( ...
                    currentElevationIndex, neighborAzimuthIndex) || ...
                    blockedNodeMask(neighborElevationIndex, ...
                    currentAzimuthIndex);
                if diagonalCutsBlockedCorner
                    continue;
                end
            end

            neighborNodeIndex = sub2ind( ...
                [elevationBinCount azimuthBinCount], ...
                neighborElevationIndex, neighborAzimuthIndex);
            azimuthDifference_deg = azimuthGrid_deg(neighborAzimuthIndex) - ...
                azimuthGrid_deg(currentAzimuthIndex);
            if options.AllowAzimuthWrap
                azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
                azimuthDifference_deg = mod( ...
                    azimuthDifference_deg + azimuthSpan_deg / 2, ...
                    azimuthSpan_deg) - azimuthSpan_deg / 2;
            end
            elevationDifference_deg = elevationGrid_deg( ...
                neighborElevationIndex) - ...
                elevationGrid_deg(currentElevationIndex);
            transitionDistance_deg = hypot( ...
                azimuthDifference_deg, elevationDifference_deg);
            candidateCost_deg = costToGoal_deg(currentNodeIndex) + ...
                transitionDistance_deg;
            bestKnownNeighborCost_deg = costToGoal_deg( ...
                neighborNodeIndex) - 1e-12;
            candidateImprovesCost = candidateCost_deg < ...
                bestKnownNeighborCost_deg;
            if ~candidateImprovesCost
                continue;
            end

            % Plain-language relaxation rule: reaching the goal from this
            % neighbor via the current point costs "one step plus the current
            % point's remaining distance." Save it only when that is the best
            % explanation found so far. The current point becomes the arrow
            % that this neighbor will follow toward the goal.
            costToGoal_deg(neighborNodeIndex) = candidateCost_deg;
            successorNodeIndex(neighborNodeIndex) = uint32(currentNodeIndex);
            dijkstraFrontier = pushDijkstraFrontier( ...
                dijkstraFrontier, neighborNodeIndex, candidateCost_deg);
            generatedGridStateCount = generatedGridStateCount + 1;
        end
    end

    % --- Turn Saved Arrows Into A Start-To-Goal Route -------------------
    if ~reachedInitialGridState
        topology = emptyGoalDijkstraResult(options);
        if topologyTerminationReason == ""
            topologyTerminationReason = "noPath";
            topology.Message = "No lattice route connects the endpoints.";
        elseif topologyTerminationReason == "wallTimeLimit"
            topology.Message = "Dijkstra reached MaxSearchTime_s.";
        else
            topology.Message = "Dijkstra reached MaxExpansions.";
        end
        topology.ExpandedNodeCount = expandedGridStateCount;
        topology.GeneratedNodeCount = generatedGridStateCount;
        topology.SearchElapsed_s = toc(topologySearchTimer);
        topology.TerminationReason = topologyTerminationReason;
        topology.CostToGoal_deg = reshape( ...
            costToGoal_deg, size(blockedNodeMask));
        topology.SettledMask = reshape( ...
            settledNodeMask, size(blockedNodeMask));
    else
        % Start at the selected initial grid point and follow the saved arrow
        % at each point. Because every arrow was written toward a point with
        % less remaining cost, the chain must eventually reach the goal.
        gridNodePath = zeros(128, 1, "uint32");
        pathStateCount = 1;
        pathGridNode = uint32(initialNodeIndex);
        gridNodePath(pathStateCount) = pathGridNode;
        while pathGridNode ~= goalNodeIndex
            nextPathGridNode = successorNodeIndex(pathGridNode);
            if nextPathGridNode == 0
                error("planAzElDijkstra:BrokenDijkstraSuccessor", ...
                    "Dijkstra produced an incomplete successor chain.");
            end
            pathStateCount = pathStateCount + 1;
            if pathStateCount > numel(gridNodePath)
                gridNodePath(2 * numel(gridNodePath), 1) = 0;
            end
            gridNodePath(pathStateCount) = nextPathGridNode;
            pathGridNode = nextPathGridNode;
        end
        gridNodePath = gridNodePath(1:pathStateCount);
        [pathElevationIndices, pathAzimuthIndices] = ind2sub( ...
            [elevationBinCount azimuthBinCount], double(gridNodePath));
        gridPath_deg = [azimuthGrid_deg(pathAzimuthIndices).', ...
            elevationGrid_deg(pathElevationIndices).'];
        if options.AllowAzimuthWrap
            azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
            for pathStateIndex = 2:size(gridPath_deg, 1)
                azimuthStep_deg = mod( ...
                    gridPath_deg(pathStateIndex, 1) - ...
                    gridPath_deg(pathStateIndex - 1, 1) + ...
                    azimuthSpan_deg / 2, azimuthSpan_deg) - ...
                    azimuthSpan_deg / 2;
                gridPath_deg(pathStateIndex, 1) = gridPath_deg( ...
                    pathStateIndex - 1, 1) + azimuthStep_deg;
            end
        end
        routeStep_deg = diff(gridPath_deg, 1, 1);
        topology = struct( ...
            "Success", true, ...
            "Message", ...
            "Goal-rooted Dijkstra cost reached the initial state.", ...
            "Method", "goalRootedDijkstra", ...
            "Path_deg", gridPath_deg, ...
            "GridNodePath", gridNodePath, ...
            "LatticeDistance_deg", sum(hypot( ...
                routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
            "ExpandedNodeCount", expandedGridStateCount, ...
            "GeneratedNodeCount", generatedGridStateCount, ...
            "SearchElapsed_s", toc(topologySearchTimer), ...
            "TerminationReason", topologyTerminationReason, ...
            "CostToGoal_deg", reshape( ...
                costToGoal_deg, size(blockedNodeMask)), ...
            "SettledMask", reshape( ...
                settledNodeMask, size(blockedNodeMask)), ...
            "BlockedMask", blockedNodeMask, ...
            "AzimuthGrid_deg", azimuthGrid_deg, ...
            "ElevationGrid_deg", elevationGrid_deg, ...
            "InitialGridNode", initialNodeIndex, ...
            "GoalGridNode", goalNodeIndex, ...
            "Options", options);
    end
end

%% Section 4: Explain Why This Grid Did Not Produce A Route
% A failed grid attempt is returned to the coarse-to-fine caller as evidence,
% not thrown away. The caller may still try a finer drawing of the same scene.
if ~topology.Success
    plan = failedStaticPlan( ...
        "Goal-rooted Dijkstra failed: " + topology.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end

%% Section 5: Replace Grid Endpoints With The Exact Mission Endpoints
% The grid route begins and ends at nearby free grid points. Add the exact
% mission coordinates, unwrap seam crossings, and remove duplicate points.
% No real turn is removed here; that happens only after an exact visibility
% check in the next section.
routePositions_deg = [initialState.position_deg; ...
    topology.Path_deg; goalState.position_deg];
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    for routeWaypointIndex = 2:size(routePositions_deg, 1)
        azimuthStep_deg = mod( ...
            routePositions_deg(routeWaypointIndex, 1) - ...
            routePositions_deg(routeWaypointIndex - 1, 1) + ...
            azimuthSpan_deg / 2, azimuthSpan_deg) - azimuthSpan_deg / 2;
        routePositions_deg(routeWaypointIndex, 1) = routePositions_deg( ...
            routeWaypointIndex - 1, 1) + azimuthStep_deg;
    end
end
% Endpoint insertion can duplicate its nearest lattice state. Removing only
% zero-length steps preserves every genuine turn for exact shortcut checks.
keepRouteWaypoint = true(size(routePositions_deg, 1), 1);
keepRouteWaypoint(2:end) = hypot( ...
    diff(routePositions_deg(:, 1)), ...
    diff(routePositions_deg(:, 2))) > 1e-10;
routePositions_deg = routePositions_deg(keepRouteWaypoint, :);
unshortenedRoute_deg = routePositions_deg;

%% Section 6: Remove Corners That The Original Polygons Do Not Require
% Grid routes often look like staircases. From each retained point, test the
% farthest later point that can be reached by a straight collision-free line.
% This is not a guess based on grid occupancy: every replacement line is
% sampled against the packed polygons before an intermediate corner is lost.
shortcutTimer = tic;
inputWaypointCount = size(routePositions_deg, 1);
if inputWaypointCount <= 2
    shortcut = successfulShortcut( ...
        routePositions_deg, inputWaypointCount, 0, toc(shortcutTimer));
else
    retainedRoute_deg = zeros(size(routePositions_deg));
    retainedWaypointCount = 1;
    retainedRoute_deg(1, :) = routePositions_deg(1, :);
    currentWaypointIndex = 1;
    collisionCheckCount = 0;
    while currentWaypointIndex < inputWaypointCount
        farthestVisibleIndex = currentWaypointIndex;
        candidateWaypointIndex = currentWaypointIndex + 1;
        while candidateWaypointIndex <= inputWaypointCount
            collisionCheckCount = collisionCheckCount + 1;
            segmentInitialPosition_deg = routePositions_deg( ...
                currentWaypointIndex, :);
            segmentGoalPosition_deg = routePositions_deg( ...
                candidateWaypointIndex, :);
            segmentDisplacement_deg = segmentGoalPosition_deg - ...
                segmentInitialPosition_deg;
            segmentDistance_deg = hypot( ...
                segmentDisplacement_deg(1), segmentDisplacement_deg(2));
            segmentSampleCount = max(2, ceil( ...
                segmentDistance_deg / options.RouteShortcutStep_deg) + 1);
            segmentFraction = linspace(0, 1, segmentSampleCount).';
            queryPosition_deg = segmentInitialPosition_deg + ...
                segmentFraction .* segmentDisplacement_deg;
            if options.AllowAzimuthWrap
                azimuthSpan_deg = diff(axisLimits.azimuth_deg);
                queryPosition_deg(:, 1) = mod( ...
                    queryPosition_deg(:, 1) - ...
                    axisLimits.azimuth_deg(1), azimuthSpan_deg) + ...
                    axisLimits.azimuth_deg(1);
            end
            segmentBlocked = queryAzElTimeObstacle(obstacleField, ...
                queryPosition_deg(:, 1), queryPosition_deg(:, 2), ...
                initialState.time_s, struct( ...
                "CollisionMode", "polygon", ...
                "SafetyMarginDeg", options.SafetyMargin_deg));
            if any(segmentBlocked)
                break;
            end
            farthestVisibleIndex = candidateWaypointIndex;
            candidateWaypointIndex = candidateWaypointIndex + 1;
        end
        if farthestVisibleIndex == currentWaypointIndex
            shortcut = struct( ...
                "Success", false, ...
                "Message", ...
                "An adjacent lattice edge failed exact validation.", ...
                "Path_deg", zeros(0, 2), ...
                "RouteDistance_deg", Inf, ...
                "InputWaypointCount", inputWaypointCount, ...
                "OutputWaypointCount", 0, ...
                "CollisionCheckCount", collisionCheckCount, ...
                "Elapsed_s", toc(shortcutTimer));
            break;
        end
        retainedWaypointCount = retainedWaypointCount + 1;
        retainedRoute_deg(retainedWaypointCount, :) = routePositions_deg( ...
            farthestVisibleIndex, :);
        currentWaypointIndex = farthestVisibleIndex;
    end
    if farthestVisibleIndex ~= currentWaypointIndex || ...
            currentWaypointIndex == inputWaypointCount
        retainedRoute_deg = retainedRoute_deg(1:retainedWaypointCount, :);
        shortcut = successfulShortcut(retainedRoute_deg, ...
            inputWaypointCount, collisionCheckCount, toc(shortcutTimer));
    end
end
if ~shortcut.Success
    plan = failedStaticPlan( ...
        "Exact route shortcut validation failed: " + shortcut.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    return;
end
routePositions_deg = shortcut.Path_deg;

%% Section 7: Turn The Spatial Route Into A Timed Slew Command
% A safe line on a map is not yet a command. The established profile mode
% treats each retained line segment as a separate rest-to-rest maneuver.
% The path-first mode instead rounds the corners and time-scales one smooth
% start-to-finish motion, so it does not stop at every Dijkstra waypoint.
% Both choices still pass the same limit and packed-polygon checks below.
if options.MotionMode == "pathFirstThenKinematic"
    retimed = retimeStaticRouteContinuously( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options);
elseif options.MotionMode == "pathStateSpaceKinematic"
    retimed = retimeStaticRouteWithStateSpaceDijkstra( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options);
else
    retimed = retimeStaticRouteWithSegmentStops( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options);
end
if ~retimed.Success
    plan = failedStaticPlan( ...
        "Static route retiming failed: " + retimed.Message, ...
        obstacleField, initialState, goalState, axisLimits, options, ...
        topology, toc(staticTimer));
    plan.preShortcutRoute_deg = unshortenedRoute_deg;
    plan.routeShortcut = shortcut;
    return;
end

profile = retimed.Profile;
routeDistance_deg = retimed.RouteDistance_deg;
publishedRoute_deg = routePositions_deg;
if any(retimed.MotionStyle == [ ...
        "continuousCornerBlend", "pathStateSpaceKinematic"])
    % The shortcut report retains the raw polygonal route. The public
    % autonomous route should show what the command actually follows.
    publishedRoute_deg = retimed.SmoothedPath_deg;
end

%% Section 8: Write The Static Attempt Report
% The caller receives the command plus the evidence used to trust it: the
% searched map, the route before and after corner removal, timing details,
% node counts, and the packed obstacle field used for final validation.
endpointDelta_deg = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, axisLimits, options);
straightLineLowerBound_deg = hypot( ...
    endpointDelta_deg(1), endpointDelta_deg(2));
plan = struct( ...
    "success", true, ...
    "message", "Goal-rooted Dijkstra route found and retimed.", ...
    "method", "goalRootedDijkstra", ...
    "time_s", profile.time_s, ...
    "position_deg", profile.position_deg, ...
    "positionUnwrapped_deg", profile.positionUnwrapped_deg, ...
    "velocity_deg_s", profile.velocity_deg_s, ...
    "acceleration_deg_s2", profile.acceleration_deg_s2, ...
    "isWaiting", profile.isWaiting, ...
    "cost_s", goalState.time_s - initialState.time_s, ...
    "objective", "minimumAngularDistance", ...
    "objectiveCost", routeDistance_deg, ...
    "objectiveCostUnits", "deg", ...
    "angularPathLength_deg", routeDistance_deg, ...
    "angularLowerBound_deg", straightLineLowerBound_deg, ...
    "suboptimalityBound", max(1, routeDistance_deg / ...
        max(straightLineLowerBound_deg, eps)), ...
    "optimalOnLattice", false, ...
    "topologyOptimalOnLattice", true, ...
    "optimalGlobally", false, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", topology.ExpandedNodeCount, ...
    "generatedNodeCount", topology.GeneratedNodeCount, ...
    "searchElapsed_s", toc(staticTimer), ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", axisLimits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "topologySearch", topology, ...
    "preShortcutRoute_deg", unshortenedRoute_deg, ...
    "routeShortcut", shortcut, ...
    "autonomousRoute_deg", publishedRoute_deg, ...
    "retiming", retimed);
end

function gridValues = inclusiveGrid(gridLimits, gridStep)
%% Section 0: Header & Readme
% SYNTAX
%   gridValues = inclusiveGrid(gridLimits, gridStep)
%**************************************************************************
% PURPOSE
%   - Construct a grid that always includes both configured boundaries.
%**************************************************************************
% INPUTS
%   - gridLimits (numeric two-vector)
%       Inclusive axis limits.
%   - gridStep (positive numeric scalar)
%       Requested spacing.
%**************************************************************************
% OUTPUTS
%   - gridValues (double vector)
%       Inclusive grid.
%**************************************************************************
% UNITS
%   - All inputs and outputs share the caller's angular units.
% Both axes must include their upper boundary by the same rule even when
% the requested step does not divide the span exactly.
gridValues = gridLimits(1):gridStep:gridLimits(2);
if gridValues(end) < gridLimits(2) - 1e-9
    gridValues(end + 1) = gridLimits(2);
end
gridValues = double(gridValues);
end

function nodeIndex = nearestFreeGridNode( ...
        blockedNodeMask, azimuthGrid_deg, elevationGrid_deg, ...
        requestedPosition_deg, allowAzimuthWrap)
%% Section 0: Header & Readme
% SYNTAX
%   nodeIndex = nearestFreeGridNode( ...
%       blockedNodeMask, azimuthGrid_deg, elevationGrid_deg, ...
%       requestedPosition_deg, allowAzimuthWrap)
%**************************************************************************
% PURPOSE
%   - Attach a boundary state to its nearest free lattice node.
%**************************************************************************
% INPUTS
%   - blockedNodeMask (logical matrix)
%       Occupied lattice cells.
%   - azimuthGrid_deg, elevationGrid_deg, requestedPosition_deg (numeric)
%       Lattice axes and requested endpoint.
%   - allowAzimuthWrap (logical scalar)
%       Whether azimuth distance is periodic.
%**************************************************************************
% OUTPUTS
%   - nodeIndex (nonnegative integer)
%       Linear grid index, or zero when no free node exists.
%**************************************************************************
% UNITS
%   - Angular inputs are degrees.
% Initial and goal endpoints must use identical blocked-cell and azimuth-seam
% rules when they are attached to the lattice.
[azimuthMesh_deg, elevationMesh_deg] = meshgrid( ...
    azimuthGrid_deg, elevationGrid_deg);
azimuthDifference_deg = azimuthMesh_deg - requestedPosition_deg(1);
if allowAzimuthWrap
    azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg);
    azimuthDifference_deg = mod(azimuthDifference_deg + ...
        azimuthSpan_deg / 2, azimuthSpan_deg) - azimuthSpan_deg / 2;
end
distanceSquared_deg2 = azimuthDifference_deg.^2 + ...
    (elevationMesh_deg - requestedPosition_deg(2)).^2;
distanceSquared_deg2(blockedNodeMask) = Inf;
[nearestDistanceSquared_deg2, nodeIndex] = min(distanceSquared_deg2(:));
if ~isfinite(nearestDistanceSquared_deg2)
    nodeIndex = 0;
end
end

function azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg)
%% Section 0: Header & Readme
% SYNTAX
%   azimuthSpan_deg = wrappedGridSpan(azimuthGrid_deg)
%**************************************************************************
% PURPOSE
%   - Recover the periodic span from a grid without a duplicate endpoint.
%**************************************************************************
% INPUTS
%   - azimuthGrid_deg (numeric vector)
%       Uniform wrapped azimuth samples.
%**************************************************************************
% OUTPUTS
%   - azimuthSpan_deg (numeric scalar)
%       Inferred periodic span.
%**************************************************************************
% UNITS
%   - Input and output are degrees.
% Nearest-node selection, transition costs, and path unwrapping must infer
% the same periodic span from a grid that omits its duplicate endpoint.
azimuthSpan_deg = azimuthGrid_deg(end) - azimuthGrid_deg(1);
if numel(azimuthGrid_deg) > 1
    azimuthSpan_deg = azimuthSpan_deg + median(diff(azimuthGrid_deg));
end
end

function shortcut = successfulShortcut( ...
        routePositions_deg, inputWaypointCount, ...
        collisionCheckCount, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   shortcut = successfulShortcut( ...
%       routePositions_deg, inputWaypointCount, ...
%       collisionCheckCount, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared successful shortcut diagnostic schema.
%**************************************************************************
% INPUTS
%   - routePositions_deg (numeric N-by-2 matrix)
%       Retained route.
%   - inputWaypointCount, collisionCheckCount (nonnegative integers)
%       Input size and validation work.
%   - elapsed_s (nonnegative scalar)
%       Shortcut wall time.
%**************************************************************************
% OUTPUTS
%   - shortcut (scalar struct)
%       Successful shortcut diagnostics.
%**************************************************************************
% UNITS
%   - Route coordinates are degrees and elapsed_s is seconds.
% Both the trivial and searched shortcut paths return this exact schema;
% centralizing it keeps diagnostics consistent.
routeStep_deg = diff(routePositions_deg, 1, 1);
shortcut = struct( ...
    "Success", true, ...
    "Message", "Exact visibility shortcutting complete.", ...
    "Path_deg", routePositions_deg, ...
    "RouteDistance_deg", sum(hypot( ...
        routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
    "InputWaypointCount", inputWaypointCount, ...
    "OutputWaypointCount", size(routePositions_deg, 1), ...
    "CollisionCheckCount", collisionCheckCount, ...
    "Elapsed_s", elapsed_s);
end

function retimed = retimeStaticRouteWithSegmentStops( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   retimed = retimeStaticRouteWithSegmentStops( ...
%       obstacleField, initialState, goalState, routePositions_deg, ...
%       axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Preserve the established profile behavior: stop at every retained
%     waypoint, then start the next synchronized two-axis slew.
%**************************************************************************
% INPUTS
%   - obstacleField, initialState, goalState (planning context)
%       Packed polygons and requested time-bounded endpoint states.
%   - routePositions_deg (numeric N-by-2 matrix)
%       Exact-checked polygonal route.
%   - axisLimits, options (scalar structs)
%       Kinematic limits and resolved planner controls.
%**************************************************************************
% OUTPUTS
%   - retimed (scalar struct)
%       Sampled command or a stable failure explanation.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds.
% This remains the default because its exact per-segment motion law is the
% behavioral baseline. The continuous path-first mode below is opt-in.
retimingTimer = tic;
segmentDisplacement_deg = diff(routePositions_deg, 1, 1);
absoluteDisplacement_deg = abs(segmentDisplacement_deg.');
rateScaleCandidate = inf(size(absoluteDisplacement_deg));
accelerationScaleCandidate = inf(size(absoluteDisplacement_deg));
movingAxis = absoluteDisplacement_deg > 1e-12;
rateLimit_deg_s = axisLimits.maxVelocity_deg_s(:);
accelerationLimit_deg_s2 = axisLimits.maxAcceleration_deg_s2(:);
for axisIndex = 1:2
    activeSegment = movingAxis(axisIndex, :);
    rateScaleCandidate(axisIndex, activeSegment) = rateLimit_deg_s( ...
        axisIndex) ./ absoluteDisplacement_deg(axisIndex, activeSegment);
    accelerationScaleCandidate(axisIndex, activeSegment) = ...
        accelerationLimit_deg_s2(axisIndex) ./ ...
        absoluteDisplacement_deg(axisIndex, activeSegment);
end
normalizedRateLimit = min(rateScaleCandidate, [], 1);
normalizedAcceleration = min(accelerationScaleCandidate, [], 1);
stationarySegment = ~isfinite(normalizedRateLimit);
normalizedRateLimit(stationarySegment) = 0;
normalizedAcceleration(stationarySegment) = 1;

triangularProfile = normalizedRateLimit.^2 ./ normalizedAcceleration >= 1;
accelerationDuration_s = normalizedRateLimit ./ normalizedAcceleration;
accelerationDuration_s(triangularProfile) = sqrt( ...
    1 ./ normalizedAcceleration(triangularProfile));
normalizedPeakRate = normalizedAcceleration .* accelerationDuration_s;
accelerationDistance = normalizedAcceleration .* accelerationDuration_s.^2;
cruiseDuration_s = zeros(size(normalizedRateLimit));
cruisingProfile = ~triangularProfile & ~stationarySegment;
cruiseDuration_s(cruisingProfile) = (1 - ...
    accelerationDistance(cruisingProfile)) ./ ...
    normalizedPeakRate(cruisingProfile);
segmentDuration_s = 2 .* accelerationDuration_s + cruiseDuration_s;
segmentDuration_s(stationarySegment) = 0;

minimumManeuverTime_s = sum(segmentDuration_s);
availableManeuverTime_s = goalState.time_s - initialState.time_s;
if minimumManeuverTime_s > availableManeuverTime_s + 1e-9
    retimed = failedRetiming(sprintf( ...
        "Route needs %.3f s but only %.3f s is available.", ...
        minimumManeuverTime_s, availableManeuverTime_s), ...
        toc(retimingTimer));
    retimed.MotionStyle = "segmentStops";
    return;
end

segmentInitialTime_s = initialState.time_s + ...
    [0, cumsum(segmentDuration_s(1:end - 1))];
profile = makeStaticRouteProfile(initialState.time_s, ...
    goalState.time_s, routePositions_deg, segmentDisplacement_deg, ...
    segmentInitialTime_s, segmentDuration_s, normalizedPeakRate, ...
    normalizedAcceleration, options.SampleTime_s, axisLimits, options);
maximumRate_deg_s = max(axisLimits.maxVelocity_deg_s);
gridCollisionStep_s = options.GridStep_deg / maximumRate_deg_s / 4;
collisionSampleStep_s = min([options.SampleTime_s, ...
    options.CollisionCheckStep_s, gridCollisionStep_s]);
validationProfile = makeStaticRouteProfile( ...
    initialState.time_s, goalState.time_s, routePositions_deg, ...
    segmentDisplacement_deg, segmentInitialTime_s, ...
    segmentDuration_s, normalizedPeakRate, normalizedAcceleration, ...
    collisionSampleStep_s, axisLimits, options);
blockedRetimedSamples = queryAzElTimeObstacle(obstacleField, ...
    validationProfile.position_deg(:, 1), ...
    validationProfile.position_deg(:, 2), ...
    validationProfile.time_s, struct( ...
    "SafetyMarginDeg", options.SafetyMargin_deg, ...
    "TimePaddingSamples", 1));
if any(blockedRetimedSamples)
    retimed = failedRetiming( ...
        "The retimed route intersects the exact packed obstacle field.", ...
        toc(retimingTimer));
    retimed.MotionStyle = "segmentStops";
    return;
end

routeStep_deg = diff(routePositions_deg, 1, 1);
retimed = struct( ...
    "Success", true, ...
    "Message", "Static route satisfies timing and exact collision checks.", ...
    "MotionStyle", "segmentStops", ...
    "TimeScalingStyle", "segmentStops", ...
    "Profile", profile, ...
    "RouteDistance_deg", sum(hypot( ...
        routeStep_deg(:, 1), routeStep_deg(:, 2))), ...
    "MinimumManeuverTime_s", minimumManeuverTime_s, ...
    "SegmentDuration_s", segmentDuration_s, ...
    "SegmentInitialTime_s", segmentInitialTime_s, ...
    "RoutePositions_deg", routePositions_deg, ...
    "SmoothedPath_deg", zeros(0, 2), ...
    "StateSpaceSearch", struct(), ...
    "SearchElapsed_s", toc(retimingTimer));
end

function retimed = retimeStaticRouteContinuously( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   retimed = retimeStaticRouteContinuously( ...
%       obstacleField, initialState, goalState, routePositions_deg, ...
%       axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Round a path's corners and apply one continuous start-to-finish
%     kinematic schedule without stopping at intermediate waypoints.
%**************************************************************************
% INPUTS
%   - obstacleField, initialState, goalState (planning context)
%       Packed moving polygons and requested endpoint states.
%   - routePositions_deg (numeric N-by-2 matrix)
%       Exact-checked polygonal path found before kinematics are applied.
%   - axisLimits, options (scalar structs)
%       Kinematic limits, sampling controls, and collision margins.
%**************************************************************************
% OUTPUTS
%   - retimed (scalar struct)
%       Continuous command or a failure eligible for profile fallback.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds.
% The smooth route is only an attempt. It must fit the deadline, remain
% inside both axis limits, and pass the same dense polygon query as the
% established profile. A failure is allowed to trigger profile fallback.
retimingTimer = tic;
cornerBlendedPath_deg = makeCornerBlendedPath(routePositions_deg, options);
[pathModel, smoothedPath_deg, smoothedDistance_deg] = ...
    makeContinuousPathModel(cornerBlendedPath_deg, options);
timeScaling = makeContinuousTimeScaling(pathModel, axisLimits, options);
minimumManeuverTime_s = timeScaling.Duration_s;
availableManeuverTime_s = goalState.time_s - initialState.time_s;
if minimumManeuverTime_s > availableManeuverTime_s + 1e-9
    retimed = failedRetiming(sprintf( ...
        "Continuous route needs %.3f s but only %.3f s is available.", ...
        minimumManeuverTime_s, availableManeuverTime_s), ...
        toc(retimingTimer));
    retimed.MotionStyle = "continuousCornerBlend";
    retimed.TimeScalingStyle = timeScaling.Style;
    retimed.SmoothedPath_deg = smoothedPath_deg;
    return;
end

profile = makeContinuousPathProfile(pathModel, initialState.time_s, ...
    goalState.time_s, timeScaling, options.SampleTime_s, ...
    axisLimits, options);
maximumRate_deg_s = max(axisLimits.maxVelocity_deg_s);
gridCollisionStep_s = options.GridStep_deg / maximumRate_deg_s / 4;
collisionSampleStep_s = min([options.SampleTime_s, ...
    options.CollisionCheckStep_s, gridCollisionStep_s]);
validationProfile = makeContinuousPathProfile(pathModel, ...
    initialState.time_s, goalState.time_s, timeScaling, ...
    collisionSampleStep_s, axisLimits, options);

rateLimitExceeded = any(max(abs( ...
    validationProfile.velocity_deg_s), [], 1) > ...
    axisLimits.maxVelocity_deg_s + 1e-8);
accelerationLimitExceeded = any(max(abs( ...
    validationProfile.acceleration_deg_s2), [], 1) > ...
    axisLimits.maxAcceleration_deg_s2 + 1e-8);
if rateLimitExceeded || accelerationLimitExceeded
    retimed = failedRetiming( ...
        "Continuous route exceeds a velocity or acceleration limit.", ...
        toc(retimingTimer));
    retimed.MotionStyle = "continuousCornerBlend";
    retimed.TimeScalingStyle = timeScaling.Style;
    retimed.SmoothedPath_deg = smoothedPath_deg;
    return;
end

blockedRetimedSamples = queryAzElTimeObstacle(obstacleField, ...
    validationProfile.position_deg(:, 1), ...
    validationProfile.position_deg(:, 2), ...
    validationProfile.time_s, struct( ...
    "SafetyMarginDeg", options.SafetyMargin_deg, ...
    "TimePaddingSamples", 1));
if any(blockedRetimedSamples)
    retimed = failedRetiming( ...
        "The continuous route intersects the exact packed obstacle field.", ...
        toc(retimingTimer));
    retimed.MotionStyle = "continuousCornerBlend";
    retimed.TimeScalingStyle = timeScaling.Style;
    retimed.SmoothedPath_deg = smoothedPath_deg;
    return;
end

retimed = struct( ...
    "Success", true, ...
    "Message", ...
    "Corner-blended route satisfies timing and exact collision checks.", ...
    "MotionStyle", "continuousCornerBlend", ...
    "TimeScalingStyle", timeScaling.Style, ...
    "Profile", profile, ...
    "RouteDistance_deg", smoothedDistance_deg, ...
    "MinimumManeuverTime_s", minimumManeuverTime_s, ...
    "SegmentDuration_s", minimumManeuverTime_s, ...
    "SegmentInitialTime_s", initialState.time_s, ...
    "RoutePositions_deg", routePositions_deg, ...
    "SmoothedPath_deg", smoothedPath_deg, ...
    "StateSpaceSearch", struct(), ...
    "SearchElapsed_s", toc(retimingTimer));
end

function retimed = retimeStaticRouteWithStateSpaceDijkstra( ...
        obstacleField, initialState, goalState, routePositions_deg, ...
        axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   retimed = retimeStaticRouteWithStateSpaceDijkstra( ...
%       obstacleField, initialState, goalState, routePositions_deg, ...
%       axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Carry speed through a corner-blended route by searching physical
%     progress, velocity, time, and acceleration actions with Dijkstra.
%**************************************************************************
% INPUTS
%   - obstacleField, initialState, goalState (planning context)
%       Packed moving polygons and rest-to-rest endpoint states.
%   - routePositions_deg (numeric N-by-2 matrix)
%       Exact-checked polygonal route found by spatial Dijkstra.
%   - axisLimits, options (scalar structs)
%       Kinematic limits, state-lattice spacing, and validation controls.
%**************************************************************************
% OUTPUTS
%   - retimed (scalar struct)
%       Velocity-carrying command or a stable failure explanation.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds.
retimingTimer = tic;
cornerBlendedPath_deg = makeCornerBlendedPath(routePositions_deg, options);
[pathModel, smoothedPath_deg, smoothedDistance_deg] = ...
    makeContinuousPathModel(cornerBlendedPath_deg, options);
stateSearch = searchPathStateSpaceDijkstra(pathModel, ...
    smoothedDistance_deg, obstacleField, initialState, goalState, ...
    axisLimits, options);
if ~stateSearch.Success
    retimed = failedRetiming(stateSearch.Message, toc(retimingTimer));
    retimed.MotionStyle = "pathStateSpaceKinematic";
    retimed.TimeScalingStyle = "stateSpaceDijkstra";
    retimed.SmoothedPath_deg = smoothedPath_deg;
    retimed.StateSpaceSearch = stateSearch;
    return;
end

profile = makePathStateSpaceProfile(pathModel, stateSearch, ...
    initialState.time_s, goalState.time_s, options.SampleTime_s, ...
    axisLimits, options);
validationProfile = makePathStateSpaceProfile(pathModel, stateSearch, ...
    initialState.time_s, goalState.time_s, options.ValidationStep_s, ...
    axisLimits, options);
maximumVelocity_deg_s = max(abs( ...
    validationProfile.velocity_deg_s), [], 1);
maximumAcceleration_deg_s2 = max(abs( ...
    validationProfile.acceleration_deg_s2), [], 1);
limitsAreSatisfied = all(maximumVelocity_deg_s <= ...
    axisLimits.maxVelocity_deg_s + 1e-8) && ...
    all(maximumAcceleration_deg_s2 <= ...
    axisLimits.maxAcceleration_deg_s2 + 1e-8);
blocked = queryAzElTimeObstacle(obstacleField, ...
    [validationProfile.position_deg(:, 1); profile.position_deg(:, 1)], ...
    [validationProfile.position_deg(:, 2); profile.position_deg(:, 2)], ...
    [validationProfile.time_s; profile.time_s], collisionOptions(options));
if ~limitsAreSatisfied || any(blocked)
    retimed = failedRetiming( ...
        "The state-space command failed final limit or polygon validation.", ...
        toc(retimingTimer));
    retimed.MotionStyle = "pathStateSpaceKinematic";
    retimed.TimeScalingStyle = "stateSpaceDijkstra";
    retimed.SmoothedPath_deg = smoothedPath_deg;
    retimed.StateSpaceSearch = stateSearch;
    return;
end

actionCount = numel(stateSearch.AccelerationCommand_deg_s2);
retimed = struct( ...
    "Success", true, ...
    "Message", ...
        "Velocity-state Dijkstra command satisfies exact physical checks.", ...
    "MotionStyle", "pathStateSpaceKinematic", ...
    "TimeScalingStyle", "stateSpaceDijkstra", ...
    "Profile", profile, ...
    "RouteDistance_deg", smoothedDistance_deg, ...
    "MinimumManeuverTime_s", stateSearch.CompletionTime_s - ...
        initialState.time_s, ...
    "SegmentDuration_s", repmat( ...
        stateSearch.TimeStep_s, 1, actionCount), ...
    "SegmentInitialTime_s", initialState.time_s + ...
        (0:actionCount - 1) * stateSearch.TimeStep_s, ...
    "RoutePositions_deg", routePositions_deg, ...
    "SmoothedPath_deg", smoothedPath_deg, ...
    "StateSpaceSearch", stateSearch, ...
    "SearchElapsed_s", toc(retimingTimer));
end

function result = searchPathStateSpaceDijkstra( ...
        pathModel, pathDistance_deg, obstacleField, initialState, ...
        goalState, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = searchPathStateSpaceDijkstra( ...
%       pathModel, pathDistance_deg, obstacleField, initialState, ...
%       goalState, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Find the earliest safe rest-to-rest traversal while retaining velocity
%     as part of every searched state instead of resetting it at waypoints.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Continuous two-axis route and analytic derivatives.
%   - pathDistance_deg (positive scalar)
%       Arc-length estimate represented by path progress.
%   - obstacleField, initialState, goalState, axisLimits, options
%       Packed geometry, mission states, hardware limits, and study controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Search outcome, winning physical states, actions, and diagnostics.
%**************************************************************************
% UNITS
%   - Progress is degrees along the path; speed and acceleration are deg/s
%     and deg/s^2 along that path. Mapped states use az/el axis units.
searchTimer = tic;
result = struct( ...
    "Success", false, ...
    "Message", "The path-state search did not start.", ...
    "Method", "pathStateSpaceDijkstra", ...
    "StateDimensionNames", ["azimuth_deg", "elevation_deg", ...
        "azimuthRate_deg_s", "elevationRate_deg_s", "time_s"], ...
    "TimeStep_s", options.KinematicTimeStep_s, ...
    "ProgressStep_deg", NaN, ...
    "VelocityStep_deg_s", NaN, ...
    "AccelerationStep_deg_s2", NaN, ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "CollisionQueryCount", 0, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "notStarted", ...
    "CompletionTime_s", Inf, ...
    "StateTime_s", zeros(0, 1), ...
    "ProgressDistance_deg", zeros(0, 1), ...
    "PathSpeed_deg_s", zeros(0, 1), ...
    "Position_deg", zeros(0, 2), ...
    "Velocity_deg_s", zeros(0, 2), ...
    "AccelerationCommand_deg_s2", zeros(0, 1), ...
    "AxisAccelerationCommand_deg_s2", zeros(0, 2));

timeStep_s = options.KinematicTimeStep_s;
progressIntervalCount = max(2, ceil( ...
    pathDistance_deg / options.KinematicProgressStep_deg));
% A rest-to-rest sequence on this symmetric lattice advances an even number
% of progress cells. Making the terminal index even guarantees that the
% exact endpoint is representable without a special nonphysical edge.
if mod(progressIntervalCount, 2) ~= 0
    progressIntervalCount = progressIntervalCount + 1;
end
progressStep_deg = pathDistance_deg / progressIntervalCount;
accelerationStep_deg_s2 = 2 * progressStep_deg / timeStep_s^2;
velocityStep_deg_s = accelerationStep_deg_s2 * timeStep_s;
maximumPathSpeed_deg_s = norm(axisLimits.maxVelocity_deg_s);
maximumSpeedIndex = floor( ...
    maximumPathSpeed_deg_s / velocityStep_deg_s + 1e-12);
maximumTimeStepCount = floor((goalState.time_s - ...
    initialState.time_s) / timeStep_s + 1e-12);
result.ProgressStep_deg = progressStep_deg;
result.VelocityStep_deg_s = velocityStep_deg_s;
result.AccelerationStep_deg_s2 = accelerationStep_deg_s2;
if maximumSpeedIndex < 1 || maximumTimeStepCount < 1
    result.Message = ...
        "The configured state lattice cannot represent a moving state.";
    result.TerminationReason = "emptyVelocityOrTimeLattice";
    result.SearchElapsed_s = toc(searchTimer);
    return;
end

latticeStateCount = (maximumTimeStepCount + 1) * ...
    (progressIntervalCount + 1) * (maximumSpeedIndex + 1);
if latticeStateCount > options.KinematicMaximumLatticeStates
    result.Message = sprintf( ...
        "The requested physical lattice has %.0f states; the limit is %d.", ...
        latticeStateCount, options.KinematicMaximumLatticeStates);
    result.TerminationReason = "latticeLimit";
    result.SearchElapsed_s = toc(searchTimer);
    return;
end

startBlocked = queryAzElTimeObstacle(obstacleField, ...
    initialState.position_deg(1), initialState.position_deg(2), ...
    initialState.time_s, collisionOptions(options));
result.CollisionQueryCount = 1;
if startBlocked
    result.Message = "The initial physical state is blocked.";
    result.TerminationReason = "blockedStart";
    result.SearchElapsed_s = toc(searchTimer);
    return;
end

visited = false(maximumTimeStepCount + 1, ...
    progressIntervalCount + 1, maximumSpeedIndex + 1);
nodes = emptyPathStateNodes(options.InitialNodeCapacity);
[nodes, startNodeIndex] = appendPathStateNode( ...
    nodes, 0, 0, 0, 0, 0);
visited(1, 1, 1) = true;
currentLayerNodeIndices = startNodeIndex;
goalNodeIndex = uint32(0);
accelerationLevels = int8([1 0 -1]);

% Every edge has the same duration, so processing one time layer at a time
% is exactly uniform-cost Dijkstra. The first terminal state is therefore
% the earliest arrival represented by this physical lattice.
for timeIndex = 0:maximumTimeStepCount - 1
    nextLayerNodeIndices = zeros( ...
        max(1, 3 * numel(currentLayerNodeIndices)), 1, "uint32");
    nextLayerCount = 0;
    for layerNodeIndex = 1:numel(currentLayerNodeIndices)
        if toc(searchTimer) > options.MaxSearchTime_s || ...
                result.ExpandedNodeCount >= options.MaxExpansions
            result.Message = ...
                "The path-state Dijkstra search reached its work limit.";
            result.TerminationReason = "workLimit";
            result.SearchElapsed_s = toc(searchTimer);
            return;
        end
        currentNodeIndex = currentLayerNodeIndices(layerNodeIndex);
        currentProgressIndex = double( ...
            nodes.ProgressIndex(currentNodeIndex));
        currentSpeedIndex = double(nodes.SpeedIndex(currentNodeIndex));
        result.ExpandedNodeCount = result.ExpandedNodeCount + 1;

        for actionIndex = 1:numel(accelerationLevels)
            accelerationLevel = accelerationLevels(actionIndex);
            nextSpeedIndex = currentSpeedIndex + ...
                double(accelerationLevel);
            progressIncrement = 2 * currentSpeedIndex + ...
                double(accelerationLevel);
            nextProgressIndex = currentProgressIndex + progressIncrement;
            stateIsOutsideLattice = nextSpeedIndex < 0 || ...
                nextSpeedIndex > maximumSpeedIndex || ...
                progressIncrement < 0 || ...
                nextProgressIndex > progressIntervalCount;
            if stateIsOutsideLattice
                continue;
            end
            % A speed index j needs exactly j more braking steps and j^2
            % more progress cells to stop. Reject states that have already
            % made an exact rest arrival impossible.
            cannotStopAtGoal = nextProgressIndex + nextSpeedIndex^2 > ...
                progressIntervalCount || ...
                timeIndex + 1 + nextSpeedIndex > maximumTimeStepCount;
            if cannotStopAtGoal
                continue;
            end
            if visited(timeIndex + 2, nextProgressIndex + 1, ...
                    nextSpeedIndex + 1)
                continue;
            end

            startProgress_deg = currentProgressIndex * progressStep_deg;
            startSpeed_deg_s = currentSpeedIndex * velocityStep_deg_s;
            acceleration_deg_s2 = double(accelerationLevel) * ...
                accelerationStep_deg_s2;
            edgeStartTime_s = initialState.time_s + ...
                timeIndex * timeStep_s;
            [edgeIsSafe, edgeQueryCount] = ...
                pathStateTransitionIsSafe(pathModel, pathDistance_deg, ...
                startProgress_deg, startSpeed_deg_s, ...
                acceleration_deg_s2, edgeStartTime_s, timeStep_s, ...
                obstacleField, axisLimits, options);
            result.CollisionQueryCount = result.CollisionQueryCount + ...
                edgeQueryCount;
            if ~edgeIsSafe
                continue;
            end

            [nodes, candidateNodeIndex] = appendPathStateNode( ...
                nodes, timeIndex + 1, nextProgressIndex, ...
                nextSpeedIndex, currentNodeIndex, accelerationLevel);
            visited(timeIndex + 2, nextProgressIndex + 1, ...
                nextSpeedIndex + 1) = true;
            result.GeneratedNodeCount = result.GeneratedNodeCount + 1;
            nextLayerCount = nextLayerCount + 1;
            nextLayerNodeIndices(nextLayerCount) = candidateNodeIndex;
            if nextProgressIndex == progressIntervalCount && ...
                    nextSpeedIndex == 0
                goalNodeIndex = candidateNodeIndex;
                break;
            end
        end
        if goalNodeIndex ~= 0
            break;
        end
    end
    if goalNodeIndex ~= 0
        break;
    end
    currentLayerNodeIndices = nextLayerNodeIndices(1:nextLayerCount);
    if isempty(currentLayerNodeIndices)
        break;
    end
end

if goalNodeIndex == 0
    result.Message = ...
        "No velocity-carrying state sequence reaches the goal at rest.";
    result.TerminationReason = "noPath";
    result.SearchElapsed_s = toc(searchTimer);
    return;
end

winningNodeIndices = zeros(nodes.Count, 1, "uint32");
winningNodeCount = 0;
pathNodeIndex = goalNodeIndex;
while pathNodeIndex ~= 0
    winningNodeCount = winningNodeCount + 1;
    winningNodeIndices(winningNodeCount) = pathNodeIndex;
    pathNodeIndex = nodes.ParentIndex(pathNodeIndex);
end
winningNodeIndices = flipud( ...
    winningNodeIndices(1:winningNodeCount));
stateTime_s = initialState.time_s + timeStep_s * double( ...
    nodes.TimeIndex(winningNodeIndices));
progressDistance_deg = progressStep_deg * double( ...
    nodes.ProgressIndex(winningNodeIndices));
pathSpeed_deg_s = velocityStep_deg_s * double( ...
    nodes.SpeedIndex(winningNodeIndices));
progressDistance_deg(end) = pathDistance_deg;
normalizedProgress = progressDistance_deg / pathDistance_deg;
positionUnwrapped_deg = evaluatePathPosition( ...
    pathModel, normalizedProgress);
velocity_deg_s = zeros(numel(winningNodeIndices), 2);
for axisIndex = 1:2
    pathSlope_deg = reshape(ppval( ...
        pathModel.FirstDerivative{axisIndex}, normalizedProgress), [], 1);
    velocity_deg_s(:, axisIndex) = pathSlope_deg / pathDistance_deg .* ...
        pathSpeed_deg_s;
end
position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
accelerationLevels = double(nodes.AccelerationLevel( ...
    winningNodeIndices(2:end)));
accelerationCommand_deg_s2 = ...
    accelerationLevels * accelerationStep_deg_s2;
axisAccelerationCommand_deg_s2 = zeros( ...
    numel(accelerationCommand_deg_s2), 2);
for actionIndex = 1:numel(accelerationCommand_deg_s2)
    actionProgress = normalizedProgress(actionIndex);
    actionSpeed_deg_s = pathSpeed_deg_s(actionIndex);
    for axisIndex = 1:2
        pathSlope_deg = ppval( ...
            pathModel.FirstDerivative{axisIndex}, actionProgress);
        pathCurvature_deg = ppval( ...
            pathModel.SecondDerivative{axisIndex}, actionProgress);
        axisAccelerationCommand_deg_s2(actionIndex, axisIndex) = ...
            pathCurvature_deg / pathDistance_deg^2 * ...
            actionSpeed_deg_s^2 + pathSlope_deg / pathDistance_deg * ...
            accelerationCommand_deg_s2(actionIndex);
    end
end

result.Success = true;
result.Message = ...
    "Path-state Dijkstra reached the exact goal position and zero speed.";
result.TerminationReason = "goalReached";
result.CompletionTime_s = stateTime_s(end);
result.StateTime_s = stateTime_s;
result.ProgressDistance_deg = progressDistance_deg;
result.PathSpeed_deg_s = pathSpeed_deg_s;
result.Position_deg = position_deg;
result.Velocity_deg_s = velocity_deg_s;
result.AccelerationCommand_deg_s2 = accelerationCommand_deg_s2;
result.AxisAccelerationCommand_deg_s2 = ...
    axisAccelerationCommand_deg_s2;
result.SearchElapsed_s = toc(searchTimer);
end

function [edgeIsSafe, collisionQueryCount] = pathStateTransitionIsSafe( ...
        pathModel, pathDistance_deg, startProgress_deg, ...
        startSpeed_deg_s, acceleration_deg_s2, startTime_s, duration_s, ...
        obstacleField, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   [edgeIsSafe, collisionQueryCount] = pathStateTransitionIsSafe( ...
%       pathModel, pathDistance_deg, startProgress_deg, ...
%       startSpeed_deg_s, acceleration_deg_s2, startTime_s, duration_s, ...
%       obstacleField, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Integrate one constant path-acceleration action and reject it when any
%     mapped az/el position, velocity, acceleration, or polygon is invalid.
%**************************************************************************
% INPUTS
%   - pathModel, pathDistance_deg (continuous route)
%       Route geometry and its length parameterization.
%   - startProgress_deg, startSpeed_deg_s, acceleration_deg_s2
%       Scalar physical state and commanded path acceleration.
%   - startTime_s, duration_s (numeric scalars)
%       Absolute edge start and fixed primitive duration.
%   - obstacleField, axisLimits, options (planning context)
%       Packed polygons, physical limits, and validation spacing.
%**************************************************************************
% OUTPUTS
%   - edgeIsSafe (logical scalar)
%       True only when every dense physical sample is valid.
%   - collisionQueryCount (nonnegative integer)
%       Polygon samples queried for this edge.
%**************************************************************************
% UNITS
%   - Path state uses degrees and seconds; mapped axes use deg/s derivatives.
edgeSampleStep_s = min([options.ValidationStep_s, ...
    options.CollisionCheckStep_s, duration_s / 8]);
edgeSampleCount = max(3, ceil(duration_s / edgeSampleStep_s) + 1);
elapsedTime_s = linspace(0, duration_s, edgeSampleCount).';
progressDistance_deg = startProgress_deg + ...
    startSpeed_deg_s * elapsedTime_s + ...
    0.5 * acceleration_deg_s2 * elapsedTime_s.^2;
pathSpeed_deg_s = startSpeed_deg_s + ...
    acceleration_deg_s2 * elapsedTime_s;
normalizedProgress = progressDistance_deg / pathDistance_deg;
positionUnwrapped_deg = evaluatePathPosition(pathModel, normalizedProgress);
velocity_deg_s = zeros(edgeSampleCount, 2);
axisAcceleration_deg_s2 = zeros(edgeSampleCount, 2);
for axisIndex = 1:2
    pathSlope_deg = reshape(ppval( ...
        pathModel.FirstDerivative{axisIndex}, normalizedProgress), [], 1);
    pathCurvature_deg = reshape(ppval( ...
        pathModel.SecondDerivative{axisIndex}, normalizedProgress), [], 1);
    velocity_deg_s(:, axisIndex) = pathSlope_deg / pathDistance_deg .* ...
        pathSpeed_deg_s;
    axisAcceleration_deg_s2(:, axisIndex) = ...
        pathCurvature_deg / pathDistance_deg^2 .* pathSpeed_deg_s.^2 + ...
        pathSlope_deg / pathDistance_deg * acceleration_deg_s2;
end
positionsAreInsideLimits = all(positionUnwrapped_deg(:, 1) >= ...
    axisLimits.azimuth_deg(1) - 1e-9 & ...
    positionUnwrapped_deg(:, 1) <= axisLimits.azimuth_deg(2) + 1e-9 & ...
    positionUnwrapped_deg(:, 2) >= axisLimits.elevation_deg(1) - 1e-9 & ...
    positionUnwrapped_deg(:, 2) <= axisLimits.elevation_deg(2) + 1e-9);
velocitiesAreInsideLimits = all(all(abs(velocity_deg_s) <= ...
    axisLimits.maxVelocity_deg_s + 1e-8));
accelerationsAreInsideLimits = all(all(abs(axisAcceleration_deg_s2) <= ...
    axisLimits.maxAcceleration_deg_s2 + 1e-8));
if ~positionsAreInsideLimits || ~velocitiesAreInsideLimits || ...
        ~accelerationsAreInsideLimits
    edgeIsSafe = false;
    collisionQueryCount = 0;
    return;
end

position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
sampleTime_s = startTime_s + elapsedTime_s;
blocked = queryAzElTimeObstacle(obstacleField, ...
    position_deg(:, 1), position_deg(:, 2), sampleTime_s, ...
    collisionOptions(options));
edgeIsSafe = ~any(blocked);
collisionQueryCount = numel(sampleTime_s);
end

function profile = makePathStateSpaceProfile( ...
        pathModel, stateSearch, initialTime_s, goalTime_s, ...
        sampleTime_s, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makePathStateSpaceProfile( ...
%       pathModel, stateSearch, initialTime_s, goalTime_s, ...
%       sampleTime_s, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Reintegrate the winning acceleration actions on any requested sample
%     clock while preserving continuous position and velocity.
%**************************************************************************
% INPUTS
%   - pathModel, stateSearch (winning motion description)
%       Continuous route and discrete physical state/action sequence.
%   - initialTime_s, goalTime_s, sampleTime_s (numeric scalars)
%       Mission horizon and output or validation sampling interval.
%   - axisLimits, options (planning context)
%       Canonical azimuth limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Sampled position, velocity, acceleration, and waiting state.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds.
time_s = (initialTime_s:sampleTime_s:goalTime_s).';
if time_s(end) < goalTime_s - 1e-9
    time_s(end + 1, 1) = goalTime_s;
else
    time_s(end) = goalTime_s;
end
sampleCount = numel(time_s);
progressDistance_deg = repmat( ...
    stateSearch.ProgressDistance_deg(end), sampleCount, 1);
pathSpeed_deg_s = zeros(sampleCount, 1);
pathAcceleration_deg_s2 = zeros(sampleCount, 1);
isMoving = time_s < stateSearch.CompletionTime_s - 1e-12;
movingElapsedTime_s = time_s(isMoving) - initialTime_s;
edgeIndex = floor(movingElapsedTime_s / stateSearch.TimeStep_s) + 1;
edgeIndex = min(edgeIndex, ...
    numel(stateSearch.AccelerationCommand_deg_s2));
edgeStartElapsedTime_s = (edgeIndex - 1) * stateSearch.TimeStep_s;
edgeElapsedTime_s = movingElapsedTime_s - edgeStartElapsedTime_s;
edgeStartProgress_deg = stateSearch.ProgressDistance_deg(edgeIndex);
edgeStartSpeed_deg_s = stateSearch.PathSpeed_deg_s(edgeIndex);
edgeAcceleration_deg_s2 = ...
    stateSearch.AccelerationCommand_deg_s2(edgeIndex);
progressDistance_deg(isMoving) = edgeStartProgress_deg + ...
    edgeStartSpeed_deg_s .* edgeElapsedTime_s + ...
    0.5 * edgeAcceleration_deg_s2 .* edgeElapsedTime_s.^2;
pathSpeed_deg_s(isMoving) = edgeStartSpeed_deg_s + ...
    edgeAcceleration_deg_s2 .* edgeElapsedTime_s;
pathAcceleration_deg_s2(isMoving) = edgeAcceleration_deg_s2;

normalizedProgress = progressDistance_deg / ...
    stateSearch.ProgressDistance_deg(end);
positionUnwrapped_deg = evaluatePathPosition( ...
    pathModel, normalizedProgress);
velocity_deg_s = zeros(sampleCount, 2);
acceleration_deg_s2 = zeros(sampleCount, 2);
for axisIndex = 1:2
    pathSlope_deg = reshape(ppval( ...
        pathModel.FirstDerivative{axisIndex}, normalizedProgress), [], 1);
    pathCurvature_deg = reshape(ppval( ...
        pathModel.SecondDerivative{axisIndex}, normalizedProgress), [], 1);
    pathDistance_deg = stateSearch.ProgressDistance_deg(end);
    velocity_deg_s(:, axisIndex) = pathSlope_deg / pathDistance_deg .* ...
        pathSpeed_deg_s;
    acceleration_deg_s2(:, axisIndex) = ...
        pathCurvature_deg / pathDistance_deg^2 .* pathSpeed_deg_s.^2 + ...
        pathSlope_deg / pathDistance_deg .* pathAcceleration_deg_s2;
end
positionUnwrapped_deg(~isMoving, :) = repmat( ...
    pathModel.GoalPosition_deg, nnz(~isMoving), 1);
velocity_deg_s(~isMoving, :) = 0;
acceleration_deg_s2(~isMoving, :) = 0;
positionUnwrapped_deg(1, :) = pathModel.StartPosition_deg;
velocity_deg_s(1, :) = 0;
acceleration_deg_s2(1, :) = 0;
position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "positionUnwrapped_deg", positionUnwrapped_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "isWaiting", all(abs(velocity_deg_s) <= 1e-10, 2) & ...
        all(abs(acceleration_deg_s2) <= 1e-10, 2));
end

function nodes = emptyPathStateNodes(initialCapacity)
%% Section 0: Header & Readme
% SYNTAX
%   nodes = emptyPathStateNodes(initialCapacity)
%**************************************************************************
% PURPOSE
%   - Allocate compact typed storage for the path-state Dijkstra receipts.
%**************************************************************************
% INPUTS
%   - initialCapacity (positive integer)
%       Number of node rows allocated before geometric growth.
%**************************************************************************
% OUTPUTS
%   - nodes (scalar struct)
%       Time, progress, speed, parent, action, count, and capacity arrays.
%**************************************************************************
% UNITS
%   - Stored values are lattice indices; physical scales live in the report.
nodes = struct( ...
    "TimeIndex", zeros(initialCapacity, 1, "uint32"), ...
    "ProgressIndex", zeros(initialCapacity, 1, "uint32"), ...
    "SpeedIndex", zeros(initialCapacity, 1, "uint32"), ...
    "ParentIndex", zeros(initialCapacity, 1, "uint32"), ...
    "AccelerationLevel", zeros(initialCapacity, 1, "int8"), ...
    "Count", 0, ...
    "Capacity", initialCapacity);
end

function [nodes, nodeIndex] = appendPathStateNode( ...
        nodes, timeIndex, progressIndex, speedIndex, ...
        parentIndex, accelerationLevel)
%% Section 0: Header & Readme
% SYNTAX
%   [nodes, nodeIndex] = appendPathStateNode( ...
%       nodes, timeIndex, progressIndex, speedIndex, ...
%       parentIndex, accelerationLevel)
%**************************************************************************
% PURPOSE
%   - Append one velocity-carrying state and grow every typed array together.
%**************************************************************************
% INPUTS
%   - nodes (scalar struct)
%       Existing compact node storage.
%   - timeIndex, progressIndex, speedIndex (nonnegative integers)
%       State coordinates on the physical lattice.
%   - parentIndex (nonnegative integer)
%       Previous node on the winning explanation for this state.
%   - accelerationLevel (integer -1, 0, or 1)
%       Constant acceleration action used to enter this node.
%**************************************************************************
% OUTPUTS
%   - nodes (scalar struct)
%       Updated node storage.
%   - nodeIndex (positive uint32 scalar)
%       Row assigned to the appended state.
%**************************************************************************
% UNITS
%   - Values are lattice indices and dimensionless action levels.
if nodes.Count >= nodes.Capacity
    newCapacity = 2 * nodes.Capacity;
    nodes.TimeIndex(newCapacity, 1) = uint32(0);
    nodes.ProgressIndex(newCapacity, 1) = uint32(0);
    nodes.SpeedIndex(newCapacity, 1) = uint32(0);
    nodes.ParentIndex(newCapacity, 1) = uint32(0);
    nodes.AccelerationLevel(newCapacity, 1) = int8(0);
    nodes.Capacity = newCapacity;
end
nodes.Count = nodes.Count + 1;
nodeIndex = uint32(nodes.Count);
nodes.TimeIndex(nodeIndex) = uint32(timeIndex);
nodes.ProgressIndex(nodeIndex) = uint32(progressIndex);
nodes.SpeedIndex(nodeIndex) = uint32(speedIndex);
nodes.ParentIndex(nodeIndex) = uint32(parentIndex);
nodes.AccelerationLevel(nodeIndex) = int8(accelerationLevel);
end

function result = searchJointAzElStateSpace( ...
        obstacleField, initialState, goalState, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = searchJointAzElStateSpace( ...
%       obstacleField, initialState, goalState, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Search position, velocity, acceleration, time, and bounded-jerk
%     actions together so route choice is no longer fixed in advance.
%   - Minimize a documented blend of elapsed-time and path-length ratios.
%**************************************************************************
% INPUTS
%   - obstacleField (packed obstacle field)
%       Static or moving polygons queried at each physical edge sample.
%   - initialState, goalState (scalar state structs)
%       Requested boundary position, velocity, acceleration, and time.
%   - axisLimits, options (scalar structs)
%       Hardware limits and joint-lattice controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Winning physical states, jerk actions, sampled command, ratios, and
%       a stable failure report when the sparse search cannot finish.
%**************************************************************************
% UNITS
%   - Position is degrees; derivatives use seconds.
jointTimer = tic;
result = struct( ...
    "Success", false, ...
    "Message", "The joint physical-state search did not start.", ...
    "Method", "jointStateSpaceAStar", ...
    "StateDimensionNames", ["azimuth_deg", "elevation_deg", ...
        "azimuthRate_deg_s", "elevationRate_deg_s", ...
        "azimuthAcceleration_deg_s2", ...
        "elevationAcceleration_deg_s2", "time_s"], ...
    "ActionDimensionNames", ["azimuthJerk_deg_s3", ...
        "elevationJerk_deg_s3"], ...
    "RequestedTimeStep_s", options.JointKinematicTimeStep_s, ...
    "TimeStep_s", NaN, ...
    "PositionStep_deg", nan(1, 2), ...
    "VelocityStep_deg_s", nan(1, 2), ...
    "AccelerationStep_deg_s2", nan(1, 2), ...
    "JerkStep_deg_s3", nan(1, 2), ...
    "TimeWeight", options.JointKinematicTimeWeight, ...
    "DistanceWeight", options.JointKinematicDistanceWeight, ...
    "TimeLowerBound_s", NaN, ...
    "DistanceLowerBound_deg", NaN, ...
    "TimeRatio", Inf, ...
    "DistanceRatio", Inf, ...
    "CombinedRatio", Inf, ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "CollisionQueryCount", 0, ...
    "TheoreticalStateCount", Inf, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "notStarted", ...
    "CompletionTime_s", Inf, ...
    "StateTime_s", zeros(0, 1), ...
    "Position_deg", zeros(0, 2), ...
    "PositionUnwrapped_deg", zeros(0, 2), ...
    "Velocity_deg_s", zeros(0, 2), ...
    "Acceleration_deg_s2", zeros(0, 2), ...
    "JerkCommand_deg_s3", zeros(0, 2), ...
    "PathLength_deg", Inf, ...
    "Profile", struct());

goalDelta_deg = wrappedDelta(initialState.position_deg, ...
    goalState.position_deg, axisLimits, options);
positionStep_deg = repmat( ...
    options.JointKinematicPositionStep_deg, 1, 2);
for axisIndex = 1:2
    if abs(goalDelta_deg(axisIndex)) > 1e-12
        goalIntervalCount = max(1, ceil(abs(goalDelta_deg(axisIndex)) / ...
            options.JointKinematicPositionStep_deg));
        % A zero-rate, zero-acceleration jerk sequence returns to rest after
        % a displacement that is a multiple of six position cells. Adjust
        % the cell size, not the physical endpoint, so exact rest arrival is
        % always representable without a nonphysical terminal shortcut.
        goalIntervalCount = 6 * ceil(goalIntervalCount / 6);
        positionStep_deg(axisIndex) = ...
            abs(goalDelta_deg(axisIndex)) / goalIntervalCount;
    end
end

% Constant jerk over dt lands exactly on this lattice when the derivative
% steps below are used. Increase dt in whole requested increments until one
% acceleration and jerk level fits both hardware axes.
minimumTimeFromAcceleration_s = sqrt( ...
    6 * positionStep_deg ./ axisLimits.maxAcceleration_deg_s2);
minimumTimeFromJerk_s = (6 * positionStep_deg ./ ...
    options.JointKinematicMaximumJerk_deg_s3).^(1 / 3);
minimumRepresentableTimeStep_s = max([ ...
    options.JointKinematicTimeStep_s, ...
    minimumTimeFromAcceleration_s, minimumTimeFromJerk_s]);
timeStep_s = ceil(minimumRepresentableTimeStep_s / ...
    options.JointKinematicTimeStep_s - 1e-12) * ...
    options.JointKinematicTimeStep_s;
jerkStep_deg_s3 = 6 * positionStep_deg / timeStep_s^3;
accelerationStep_deg_s2 = jerkStep_deg_s3 * timeStep_s;
velocityStep_deg_s = jerkStep_deg_s3 * timeStep_s^2 / 2;
maximumVelocityIndex = floor(axisLimits.maxVelocity_deg_s ./ ...
    velocityStep_deg_s + 1e-12);
maximumAccelerationIndex = floor(axisLimits.maxAcceleration_deg_s2 ./ ...
    accelerationStep_deg_s2 + 1e-12);
maximumTimeIndex = floor((goalState.time_s - initialState.time_s) / ...
    timeStep_s + 1e-12);
hasTerminalDynamics = any(abs([goalState.velocity_deg_s, ...
    goalState.acceleration_deg_s2]) > 1e-12);
result.TimeStep_s = timeStep_s;
result.PositionStep_deg = positionStep_deg;
result.VelocityStep_deg_s = velocityStep_deg_s;
result.AccelerationStep_deg_s2 = accelerationStep_deg_s2;
result.JerkStep_deg_s3 = jerkStep_deg_s3;
if maximumTimeIndex < 1 || any(maximumVelocityIndex < 1) || ...
        any(maximumAccelerationIndex < 1)
    result.Message = ...
        "The adaptive joint lattice cannot represent a moving state.";
    result.TerminationReason = "emptyDerivativeOrTimeLattice";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end
if hasTerminalDynamics && abs(initialState.time_s + ...
        maximumTimeIndex * timeStep_s - goalState.time_s) > 1e-9
    result.Message = ...
        "A nonzero terminal state requires its time to lie on the joint lattice.";
    result.TerminationReason = "terminalTimeOffLattice";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

positionMinimumIndex = zeros(1, 2);
positionMaximumIndex = zeros(1, 2);
for axisIndex = 1:2
    axisWraps = axisIndex == 1 && options.AllowAzimuthWrap;
    if axisWraps
        fullTurnIndexCount = ceil(diff(axisLimits.azimuth_deg) / ...
            positionStep_deg(axisIndex));
        positionMinimumIndex(axisIndex) = -fullTurnIndexCount;
        positionMaximumIndex(axisIndex) = fullTurnIndexCount;
    else
        axisName = "azimuth_deg";
        if axisIndex == 2
            axisName = "elevation_deg";
        end
        positionMinimumIndex(axisIndex) = ceil( ...
            (axisLimits.(axisName)(1) - initialState.position_deg(axisIndex)) / ...
            positionStep_deg(axisIndex) - 1e-12);
        positionMaximumIndex(axisIndex) = floor( ...
            (axisLimits.(axisName)(2) - initialState.position_deg(axisIndex)) / ...
            positionStep_deg(axisIndex) + 1e-12);
    end
end
goalPositionIndex = round(goalDelta_deg ./ positionStep_deg);
goalVelocityIndex = round(goalState.velocity_deg_s ./ velocityStep_deg_s);
goalAccelerationIndex = round( ...
    goalState.acceleration_deg_s2 ./ accelerationStep_deg_s2);
terminalStateIsRepresentable = all(abs( ...
    goalVelocityIndex .* velocityStep_deg_s - ...
    goalState.velocity_deg_s) <= 1e-9) && all(abs( ...
    goalAccelerationIndex .* accelerationStep_deg_s2 - ...
    goalState.acceleration_deg_s2) <= 1e-9) && ...
    all(abs(goalVelocityIndex) <= maximumVelocityIndex) && ...
    all(abs(goalAccelerationIndex) <= maximumAccelerationIndex);
if ~terminalStateIsRepresentable
    result.Message = [ ...
        "The requested terminal rate or acceleration does not lie on the " ...
        "adaptive joint lattice."];
    result.TerminationReason = "terminalStateOffLattice";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

indexing = struct( ...
    "PositionMinimumIndex", positionMinimumIndex, ...
    "PositionCount", positionMaximumIndex - positionMinimumIndex + 1, ...
    "MaximumVelocityIndex", maximumVelocityIndex, ...
    "VelocityCount", 2 * maximumVelocityIndex + 1, ...
    "MaximumAccelerationIndex", maximumAccelerationIndex, ...
    "AccelerationCount", 2 * maximumAccelerationIndex + 1);
result.TheoreticalStateCount = (maximumTimeIndex + 1) * ...
    prod(indexing.PositionCount) * prod(indexing.VelocityCount) * ...
    prod(indexing.AccelerationCount);
if result.TheoreticalStateCount >= double(intmax("uint64"))
    result.Message = "The joint lattice is too large to encode safely.";
    result.TerminationReason = "stateKeyOverflow";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

distanceLowerBound_deg = hypot(goalDelta_deg(1), goalDelta_deg(2));
timeLowerBound_s = jointRestToRestTimeLowerBound( ...
    goalDelta_deg, axisLimits);
distanceScale_deg = max(distanceLowerBound_deg, ...
    min(positionStep_deg));
timeScale_s = max(timeLowerBound_s, timeStep_s);
result.DistanceLowerBound_deg = distanceLowerBound_deg;
result.TimeLowerBound_s = timeLowerBound_s;

startBlocked = queryAzElTimeObstacle(obstacleField, ...
    initialState.position_deg(1), initialState.position_deg(2), ...
    initialState.time_s, collisionOptions(options));
result.CollisionQueryCount = 1;
if startBlocked
    result.Message = "The initial joint physical state is blocked.";
    result.TerminationReason = "blockedStart";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

nodes = emptyJointStateNodes(options.InitialNodeCapacity);
startPositionIndex = [0 0];
startVelocityIndex = [0 0];
startAccelerationIndex = [0 0];
startKey = jointStateKey(0, startPositionIndex, ...
    startVelocityIndex, startAccelerationIndex, indexing);
[nodes, startNodeIndex] = appendJointStateNode(nodes, 0, ...
    startPositionIndex, startVelocityIndex, startAccelerationIndex, ...
    0, [0 0], 0, 0, startKey);
bestNodeByState = containers.Map( ...
    'KeyType', 'uint64', 'ValueType', 'uint32');
bestNodeByState(startKey) = startNodeIndex;
frontierCapacity = options.InitialNodeCapacity;
jointFrontier = struct( ...
    "Node", zeros(frontierCapacity, 1, "uint32"), ...
    "Cost_deg", inf(frontierCapacity, 1), ...
    "Serial", zeros(frontierCapacity, 1, "uint64"), ...
    "Count", 0, ...
    "NextSerial", uint64(0));
startHeuristic = jointStateHeuristic(startPositionIndex, ...
    goalPositionIndex, positionStep_deg, axisLimits, ...
    distanceScale_deg, timeScale_s, options);
jointFrontier = pushDijkstraFrontier( ...
    jointFrontier, startNodeIndex, startHeuristic);
goalNodeIndex = uint32(0);
jerkLevels = int32(-1:1);

while jointFrontier.Count > 0
    if toc(jointTimer) >= options.MaxSearchTime_s
        result.TerminationReason = "wallTimeLimit";
        break;
    end
    if result.ExpandedNodeCount >= options.MaxExpansions
        result.TerminationReason = "expansionLimit";
        break;
    end
    [jointFrontier, currentNodeIndex, ~] = ...
        popDijkstraFrontier(jointFrontier);
    currentKey = nodes.Key(currentNodeIndex);
    if ~isKey(bestNodeByState, currentKey) || ...
            bestNodeByState(currentKey) ~= currentNodeIndex
        continue;
    end
    result.ExpandedNodeCount = result.ExpandedNodeCount + 1;
    currentPositionIndex = double( ...
        nodes.PositionIndex(currentNodeIndex, :));
    currentVelocityIndex = double( ...
        nodes.VelocityIndex(currentNodeIndex, :));
    currentAccelerationIndex = double( ...
        nodes.AccelerationIndex(currentNodeIndex, :));
    currentTimeIndex = double(nodes.TimeIndex(currentNodeIndex));
    isGoalState = isequal(currentPositionIndex, goalPositionIndex) && ...
        isequal(currentVelocityIndex, goalVelocityIndex) && ...
        isequal(currentAccelerationIndex, goalAccelerationIndex) && ...
        (~hasTerminalDynamics || currentTimeIndex == maximumTimeIndex);
    if isGoalState
        goalNodeIndex = uint32(currentNodeIndex);
        break;
    end
    if currentTimeIndex >= maximumTimeIndex
        continue;
    end

    currentPositionUnwrapped_deg = initialState.position_deg + ...
        currentPositionIndex .* positionStep_deg;
    currentVelocity_deg_s = currentVelocityIndex .* velocityStep_deg_s;
    currentAcceleration_deg_s2 = currentAccelerationIndex .* ...
        accelerationStep_deg_s2;
    edgeStartTime_s = initialState.time_s + ...
        currentTimeIndex * timeStep_s;
    for azimuthJerkLevel = jerkLevels
        for elevationJerkLevel = jerkLevels
            jerkLevel = double([azimuthJerkLevel elevationJerkLevel]);
            nextAccelerationIndex = currentAccelerationIndex + jerkLevel;
            nextVelocityIndex = currentVelocityIndex + ...
                2 * currentAccelerationIndex + jerkLevel;
            nextPositionIndex = currentPositionIndex + ...
                3 * currentVelocityIndex + ...
                3 * currentAccelerationIndex + jerkLevel;
            stateIsOutsideLattice = any(nextPositionIndex < ...
                positionMinimumIndex) || any(nextPositionIndex > ...
                positionMaximumIndex) || any(abs(nextVelocityIndex) > ...
                maximumVelocityIndex) || any(abs(nextAccelerationIndex) > ...
                maximumAccelerationIndex);
            if stateIsOutsideLattice
                continue;
            end
            jerk_deg_s3 = jerkLevel .* jerkStep_deg_s3;
            [edgeIsSafe, edgeLength_deg, edgeQueryCount] = ...
                jointStateTransitionIsSafe( ...
                currentPositionUnwrapped_deg, currentVelocity_deg_s, ...
                currentAcceleration_deg_s2, jerk_deg_s3, ...
                edgeStartTime_s, timeStep_s, obstacleField, ...
                axisLimits, options);
            result.CollisionQueryCount = result.CollisionQueryCount + ...
                edgeQueryCount;
            if ~edgeIsSafe
                continue;
            end
            nextTimeIndex = currentTimeIndex + 1;
            nextKey = jointStateKey(nextTimeIndex, nextPositionIndex, ...
                nextVelocityIndex, nextAccelerationIndex, indexing);
            candidatePathLength_deg = ...
                nodes.PathLength_deg(currentNodeIndex) + edgeLength_deg;
            candidateCost = nodes.GCost(currentNodeIndex) + ...
                options.JointKinematicTimeWeight * ...
                timeStep_s / timeScale_s + ...
                options.JointKinematicDistanceWeight * ...
                edgeLength_deg / distanceScale_deg;
            if isKey(bestNodeByState, nextKey)
                previousNodeIndex = bestNodeByState(nextKey);
                if candidateCost >= nodes.GCost(previousNodeIndex) - 1e-12
                    continue;
                end
            end
            [nodes, candidateNodeIndex] = appendJointStateNode( ...
                nodes, nextTimeIndex, nextPositionIndex, ...
                nextVelocityIndex, nextAccelerationIndex, ...
                currentNodeIndex, jerkLevel, candidateCost, ...
                candidatePathLength_deg, nextKey);
            bestNodeByState(nextKey) = candidateNodeIndex;
            result.GeneratedNodeCount = result.GeneratedNodeCount + 1;
            heuristic = jointStateHeuristic(nextPositionIndex, ...
                goalPositionIndex, positionStep_deg, axisLimits, ...
                distanceScale_deg, timeScale_s, options);
            jointFrontier = pushDijkstraFrontier(jointFrontier, ...
                candidateNodeIndex, candidateCost + heuristic);
        end
    end
end

if goalNodeIndex == 0
    if result.TerminationReason == "notStarted"
        result.TerminationReason = "noPath";
    end
    if result.TerminationReason == "wallTimeLimit"
        result.Message = "The joint state-space search reached its wall-time limit.";
    elseif result.TerminationReason == "expansionLimit"
        result.Message = "The joint state-space search reached its expansion limit.";
    else
        result.Message = "No joint jerk-limited state reaches the requested terminal state.";
    end
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

winningNodeIndices = zeros(nodes.Count, 1, "uint32");
winningNodeCount = 0;
pathNodeIndex = goalNodeIndex;
while pathNodeIndex ~= 0
    winningNodeCount = winningNodeCount + 1;
    winningNodeIndices(winningNodeCount) = pathNodeIndex;
    pathNodeIndex = nodes.ParentIndex(pathNodeIndex);
end
winningNodeIndices = flipud(winningNodeIndices(1:winningNodeCount));
stateTime_s = initialState.time_s + timeStep_s * double( ...
    nodes.TimeIndex(winningNodeIndices));
positionUnwrapped_deg = initialState.position_deg + double( ...
    nodes.PositionIndex(winningNodeIndices, :)) .* positionStep_deg;
velocity_deg_s = double(nodes.VelocityIndex( ...
    winningNodeIndices, :)) .* velocityStep_deg_s;
acceleration_deg_s2 = double(nodes.AccelerationIndex( ...
    winningNodeIndices, :)) .* accelerationStep_deg_s2;
jerkCommand_deg_s3 = double(nodes.JerkLevel( ...
    winningNodeIndices(2:end), :)) .* jerkStep_deg_s3;
position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
completionTime_s = stateTime_s(end);
profile = makeJointStateSpaceProfile( ...
    stateTime_s, positionUnwrapped_deg, velocity_deg_s, ...
    acceleration_deg_s2, jerkCommand_deg_s3, ...
    initialState.time_s, goalState.time_s, options.SampleTime_s, ...
    axisLimits, options);
validationProfile = makeJointStateSpaceProfile( ...
    stateTime_s, positionUnwrapped_deg, velocity_deg_s, ...
    acceleration_deg_s2, jerkCommand_deg_s3, ...
    initialState.time_s, goalState.time_s, options.ValidationStep_s, ...
    axisLimits, options);
blocked = queryAzElTimeObstacle(obstacleField, ...
    [profile.position_deg(:, 1); validationProfile.position_deg(:, 1)], ...
    [profile.position_deg(:, 2); validationProfile.position_deg(:, 2)], ...
    [profile.time_s; validationProfile.time_s], collisionOptions(options));
limitsAreSatisfied = all(all(abs(validationProfile.velocity_deg_s) <= ...
    axisLimits.maxVelocity_deg_s + 1e-8)) && ...
    all(all(abs(validationProfile.acceleration_deg_s2) <= ...
    axisLimits.maxAcceleration_deg_s2 + 1e-8)) && ...
    all(all(abs(validationProfile.jerk_deg_s3) <= ...
    options.JointKinematicMaximumJerk_deg_s3 + 1e-8));
if any(blocked) || ~limitsAreSatisfied
    result.Message = ...
        "The joint command failed its independent dense validation.";
    result.TerminationReason = "denseValidationFailed";
    result.SearchElapsed_s = toc(jointTimer);
    return;
end

pathLength_deg = nodes.PathLength_deg(goalNodeIndex);
completionDuration_s = completionTime_s - initialState.time_s;
result.Success = true;
result.Message = ...
    "Joint bounded-jerk A* reached and independently validated the goal state.";
result.TerminationReason = "goalReached";
result.CompletionTime_s = completionTime_s;
result.StateTime_s = stateTime_s;
result.Position_deg = position_deg;
result.PositionUnwrapped_deg = positionUnwrapped_deg;
result.Velocity_deg_s = velocity_deg_s;
result.Acceleration_deg_s2 = acceleration_deg_s2;
result.JerkCommand_deg_s3 = jerkCommand_deg_s3;
result.PathLength_deg = pathLength_deg;
result.TimeRatio = completionDuration_s / timeScale_s;
result.DistanceRatio = pathLength_deg / distanceScale_deg;
result.CombinedRatio = options.JointKinematicTimeWeight * ...
    result.TimeRatio + options.JointKinematicDistanceWeight * ...
    result.DistanceRatio;
result.Profile = profile;
result.SearchElapsed_s = toc(jointTimer);
end

function [edgeIsSafe, edgeLength_deg, queryCount] = ...
        jointStateTransitionIsSafe(positionUnwrapped_deg, ...
        velocity_deg_s, acceleration_deg_s2, jerk_deg_s3, ...
        startTime_s, duration_s, obstacleField, axisLimits, options)
%% Section 0: Header & Readme
% PURPOSE
%   - Densely integrate one constant-jerk two-axis action and accept it only
%     when position, rate, acceleration, jerk, and moving polygons are safe.
edgeSampleStep_s = min([options.ValidationStep_s, ...
    options.CollisionCheckStep_s, duration_s / 10]);
sampleCount = max(4, ceil(duration_s / edgeSampleStep_s) + 1);
elapsedTime_s = linspace(0, duration_s, sampleCount).';
positionSamplesUnwrapped_deg = positionUnwrapped_deg + ...
    elapsedTime_s .* velocity_deg_s + ...
    0.5 * elapsedTime_s.^2 .* acceleration_deg_s2 + ...
    (1 / 6) * elapsedTime_s.^3 .* jerk_deg_s3;
velocitySamples_deg_s = velocity_deg_s + ...
    elapsedTime_s .* acceleration_deg_s2 + ...
    0.5 * elapsedTime_s.^2 .* jerk_deg_s3;
accelerationSamples_deg_s2 = acceleration_deg_s2 + ...
    elapsedTime_s .* jerk_deg_s3;
insideElevation = positionSamplesUnwrapped_deg(:, 2) >= ...
    axisLimits.elevation_deg(1) - 1e-9 & ...
    positionSamplesUnwrapped_deg(:, 2) <= ...
    axisLimits.elevation_deg(2) + 1e-9;
insideAzimuth = true(sampleCount, 1);
if ~options.AllowAzimuthWrap
    insideAzimuth = positionSamplesUnwrapped_deg(:, 1) >= ...
        axisLimits.azimuth_deg(1) - 1e-9 & ...
        positionSamplesUnwrapped_deg(:, 1) <= ...
        axisLimits.azimuth_deg(2) + 1e-9;
end
derivativesAreSafe = all(all(abs(velocitySamples_deg_s) <= ...
    axisLimits.maxVelocity_deg_s + 1e-9)) && ...
    all(all(abs(accelerationSamples_deg_s2) <= ...
    axisLimits.maxAcceleration_deg_s2 + 1e-9)) && ...
    all(abs(jerk_deg_s3) <= ...
    options.JointKinematicMaximumJerk_deg_s3 + 1e-9);
if ~all(insideAzimuth & insideElevation) || ~derivativesAreSafe
    edgeIsSafe = false;
    edgeLength_deg = Inf;
    queryCount = 0;
    return;
end
positionSamples_deg = positionSamplesUnwrapped_deg;
positionSamples_deg(:, 1) = canonicalAzimuth( ...
    positionSamples_deg(:, 1), axisLimits, options);
sampleTime_s = startTime_s + elapsedTime_s;
blocked = queryAzElTimeObstacle(obstacleField, ...
    positionSamples_deg(:, 1), positionSamples_deg(:, 2), ...
    sampleTime_s, collisionOptions(options));
edgeIsSafe = ~any(blocked);
edgeLength_deg = sum(hypot(diff( ...
    positionSamplesUnwrapped_deg(:, 1)), ...
    diff(positionSamplesUnwrapped_deg(:, 2))));
queryCount = sampleCount;
end

function heuristic = jointStateHeuristic(positionIndex, goalPositionIndex, ...
        positionStep_deg, axisLimits, distanceScale_deg, timeScale_s, options)
%% Section 0: Header & Readme
% PURPOSE
%   - Supply an optimistic remaining cost for sparse A* ordering.
remainingDistanceByAxis_deg = abs( ...
    (goalPositionIndex - positionIndex) .* positionStep_deg);
remainingDistance_deg = hypot( ...
    remainingDistanceByAxis_deg(1), remainingDistanceByAxis_deg(2));
minimumRemainingTime_s = max( ...
    remainingDistanceByAxis_deg ./ axisLimits.maxVelocity_deg_s);
heuristic = options.JointKinematicDistanceWeight * ...
    remainingDistance_deg / distanceScale_deg + ...
    options.JointKinematicTimeWeight * ...
    minimumRemainingTime_s / timeScale_s;
end

function lowerBound_s = jointRestToRestTimeLowerBound( ...
        positionDelta_deg, axisLimits)
%% Section 0: Header & Readme
% PURPOSE
%   - Compute an obstacle-free per-axis acceleration/rate lower bound.
axisTime_s = zeros(1, 2);
for axisIndex = 1:2
    distance_deg = abs(positionDelta_deg(axisIndex));
    maximumVelocity_deg_s = axisLimits.maxVelocity_deg_s(axisIndex);
    maximumAcceleration_deg_s2 = ...
        axisLimits.maxAcceleration_deg_s2(axisIndex);
    accelerationDistance_deg = maximumVelocity_deg_s^2 / ...
        maximumAcceleration_deg_s2;
    if distance_deg <= accelerationDistance_deg
        axisTime_s(axisIndex) = 2 * sqrt( ...
            distance_deg / maximumAcceleration_deg_s2);
    else
        axisTime_s(axisIndex) = distance_deg / maximumVelocity_deg_s + ...
            maximumVelocity_deg_s / maximumAcceleration_deg_s2;
    end
end
lowerBound_s = max(axisTime_s);
end

function key = jointStateKey(timeIndex, positionIndex, ...
        velocityIndex, accelerationIndex, indexing)
%% Section 0: Header & Readme
% PURPOSE
%   - Encode one seven-dimensional lattice state as a deterministic uint64.
components = [ ...
    positionIndex - indexing.PositionMinimumIndex, ...
    velocityIndex + indexing.MaximumVelocityIndex, ...
    accelerationIndex + indexing.MaximumAccelerationIndex];
componentCounts = [indexing.PositionCount, indexing.VelocityCount, ...
    indexing.AccelerationCount];
key = uint64(timeIndex);
for componentIndex = 1:numel(components)
    key = key * uint64(componentCounts(componentIndex)) + ...
        uint64(components(componentIndex));
end
end

function nodes = emptyJointStateNodes(initialCapacity)
%% Section 0: Header & Readme
% PURPOSE
%   - Allocate compact receipts for the sparse joint physical-state search.
nodes = struct( ...
    "TimeIndex", zeros(initialCapacity, 1, "uint32"), ...
    "PositionIndex", zeros(initialCapacity, 2, "int32"), ...
    "VelocityIndex", zeros(initialCapacity, 2, "int32"), ...
    "AccelerationIndex", zeros(initialCapacity, 2, "int32"), ...
    "ParentIndex", zeros(initialCapacity, 1, "uint32"), ...
    "JerkLevel", zeros(initialCapacity, 2, "int8"), ...
    "GCost", inf(initialCapacity, 1), ...
    "PathLength_deg", inf(initialCapacity, 1), ...
    "Key", zeros(initialCapacity, 1, "uint64"), ...
    "Count", 0, ...
    "Capacity", initialCapacity);
end

function [nodes, nodeIndex] = appendJointStateNode(nodes, timeIndex, ...
        positionIndex, velocityIndex, accelerationIndex, parentIndex, ...
        jerkLevel, cost, pathLength_deg, key)
%% Section 0: Header & Readme
% PURPOSE
%   - Append one joint physical state and grow all receipt arrays together.
if nodes.Count >= nodes.Capacity
    newCapacity = 2 * nodes.Capacity;
    nodes.TimeIndex(newCapacity, 1) = uint32(0);
    nodes.PositionIndex(newCapacity, 2) = int32(0);
    nodes.VelocityIndex(newCapacity, 2) = int32(0);
    nodes.AccelerationIndex(newCapacity, 2) = int32(0);
    nodes.ParentIndex(newCapacity, 1) = uint32(0);
    nodes.JerkLevel(newCapacity, 2) = int8(0);
    nodes.GCost(newCapacity, 1) = Inf;
    nodes.PathLength_deg(newCapacity, 1) = Inf;
    nodes.Key(newCapacity, 1) = uint64(0);
    nodes.Capacity = newCapacity;
end
nodes.Count = nodes.Count + 1;
nodeIndex = uint32(nodes.Count);
nodes.TimeIndex(nodeIndex) = uint32(timeIndex);
nodes.PositionIndex(nodeIndex, :) = int32(positionIndex);
nodes.VelocityIndex(nodeIndex, :) = int32(velocityIndex);
nodes.AccelerationIndex(nodeIndex, :) = int32(accelerationIndex);
nodes.ParentIndex(nodeIndex) = uint32(parentIndex);
nodes.JerkLevel(nodeIndex, :) = int8(jerkLevel);
nodes.GCost(nodeIndex) = cost;
nodes.PathLength_deg(nodeIndex) = pathLength_deg;
nodes.Key(nodeIndex) = key;
end

function profile = makeJointStateSpaceProfile(stateTime_s, ...
        statePositionUnwrapped_deg, stateVelocity_deg_s, ...
        stateAcceleration_deg_s2, jerkCommand_deg_s3, ...
        initialTime_s, goalTime_s, sampleTime_s, axisLimits, options)
%% Section 0: Header & Readme
% PURPOSE
%   - Reintegrate the winning constant-jerk actions on a regular command or
%     validation clock without discarding the exact state receipts.
time_s = (initialTime_s:sampleTime_s:goalTime_s).';
if time_s(end) < goalTime_s - 1e-9
    time_s(end + 1, 1) = goalTime_s;
else
    time_s(end) = goalTime_s;
end
sampleCount = numel(time_s);
completionTime_s = stateTime_s(end);
if isscalar(stateTime_s)
    positionUnwrapped_deg = repmat( ...
        statePositionUnwrapped_deg, sampleCount, 1);
    velocity_deg_s = repmat(stateVelocity_deg_s, sampleCount, 1);
    acceleration_deg_s2 = repmat( ...
        stateAcceleration_deg_s2, sampleCount, 1);
    jerk_deg_s3 = zeros(sampleCount, 2);
    position_deg = positionUnwrapped_deg;
    position_deg(:, 1) = canonicalAzimuth( ...
        position_deg(:, 1), axisLimits, options);
    profile = struct( ...
        "time_s", time_s, ...
        "position_deg", position_deg, ...
        "positionUnwrapped_deg", positionUnwrapped_deg, ...
        "velocity_deg_s", velocity_deg_s, ...
        "acceleration_deg_s2", acceleration_deg_s2, ...
        "jerk_deg_s3", jerk_deg_s3, ...
        "isWaiting", true(sampleCount, 1));
    return;
end
positionUnwrapped_deg = repmat( ...
    statePositionUnwrapped_deg(end, :), sampleCount, 1);
velocity_deg_s = repmat(stateVelocity_deg_s(end, :), sampleCount, 1);
acceleration_deg_s2 = repmat( ...
    stateAcceleration_deg_s2(end, :), sampleCount, 1);
jerk_deg_s3 = zeros(sampleCount, 2);
isTraversing = time_s < completionTime_s - 1e-12;
traversingElapsedTime_s = time_s(isTraversing) - initialTime_s;
timeStep_s = stateTime_s(2) - stateTime_s(1);
edgeIndex = floor(traversingElapsedTime_s / timeStep_s) + 1;
edgeIndex = min(edgeIndex, size(jerkCommand_deg_s3, 1));
edgeElapsedTime_s = traversingElapsedTime_s - ...
    (edgeIndex - 1) * timeStep_s;
edgePosition_deg = statePositionUnwrapped_deg(edgeIndex, :);
edgeVelocity_deg_s = stateVelocity_deg_s(edgeIndex, :);
edgeAcceleration_deg_s2 = stateAcceleration_deg_s2(edgeIndex, :);
edgeJerk_deg_s3 = jerkCommand_deg_s3(edgeIndex, :);
positionUnwrapped_deg(isTraversing, :) = edgePosition_deg + ...
    edgeElapsedTime_s .* edgeVelocity_deg_s + ...
    0.5 * edgeElapsedTime_s.^2 .* edgeAcceleration_deg_s2 + ...
    (1 / 6) * edgeElapsedTime_s.^3 .* edgeJerk_deg_s3;
velocity_deg_s(isTraversing, :) = edgeVelocity_deg_s + ...
    edgeElapsedTime_s .* edgeAcceleration_deg_s2 + ...
    0.5 * edgeElapsedTime_s.^2 .* edgeJerk_deg_s3;
acceleration_deg_s2(isTraversing, :) = edgeAcceleration_deg_s2 + ...
    edgeElapsedTime_s .* edgeJerk_deg_s3;
jerk_deg_s3(isTraversing, :) = edgeJerk_deg_s3;
position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "positionUnwrapped_deg", positionUnwrapped_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "jerk_deg_s3", jerk_deg_s3, ...
    "isWaiting", all(abs(velocity_deg_s) <= 1e-10, 2) & ...
        all(abs(acceleration_deg_s2) <= 1e-10, 2) & ...
        all(abs(jerk_deg_s3) <= 1e-10, 2));
end

function plan = assembleJointStateSpacePlan(jointSearch, obstacleField, ...
        initialState, goalState, axisLimits, options, ...
        motionPlanning, elapsed_s)
%% Section 0: Header & Readme
% PURPOSE
%   - Publish a successful joint physical-state search in the stable planner
%     schema while preserving all state, action, and ratio evidence.
profile = jointSearch.Profile;
if options.Objective == "minimumTime"
    objectiveCost = jointSearch.CompletionTime_s - initialState.time_s;
    objectiveCostUnits = "s";
else
    objectiveCost = jointSearch.PathLength_deg;
    objectiveCostUnits = "deg";
end
retiming = struct( ...
    "Success", true, ...
    "Message", jointSearch.Message, ...
    "MotionStyle", "jointStateSpaceKinematic", ...
    "TimeScalingStyle", "boundedJerkStateSpaceAStar", ...
    "Profile", profile, ...
    "RouteDistance_deg", jointSearch.PathLength_deg, ...
    "MinimumManeuverTime_s", jointSearch.CompletionTime_s - ...
        initialState.time_s, ...
    "SegmentDuration_s", repmat(jointSearch.TimeStep_s, 1, ...
        size(jointSearch.JerkCommand_deg_s3, 1)), ...
    "SegmentInitialTime_s", jointSearch.StateTime_s(1:end - 1).', ...
    "RoutePositions_deg", jointSearch.Position_deg, ...
    "SmoothedPath_deg", jointSearch.Position_deg, ...
    "StateSpaceSearch", jointSearch, ...
    "SearchElapsed_s", jointSearch.SearchElapsed_s);
plan = struct( ...
    "success", true, ...
    "message", jointSearch.Message, ...
    "method", "jointStateSpaceKinematicAStar", ...
    "time_s", profile.time_s, ...
    "position_deg", profile.position_deg, ...
    "positionUnwrapped_deg", profile.positionUnwrapped_deg, ...
    "velocity_deg_s", profile.velocity_deg_s, ...
    "acceleration_deg_s2", profile.acceleration_deg_s2, ...
    "jerk_deg_s3", profile.jerk_deg_s3, ...
    "isWaiting", profile.isWaiting, ...
    "cost_s", goalState.time_s - initialState.time_s, ...
    "objective", options.Objective, ...
    "objectiveCost", objectiveCost, ...
    "objectiveCostUnits", objectiveCostUnits, ...
    "angularPathLength_deg", jointSearch.PathLength_deg, ...
    "angularLowerBound_deg", jointSearch.DistanceLowerBound_deg, ...
    "suboptimalityBound", max(1, jointSearch.DistanceRatio), ...
    "optimalOnLattice", true, ...
    "topologyOptimalOnLattice", false, ...
    "optimalGlobally", false, ...
    "exactCollisionValidated", true, ...
    "expandedNodeCount", jointSearch.ExpandedNodeCount, ...
    "generatedNodeCount", jointSearch.GeneratedNodeCount, ...
    "searchElapsed_s", elapsed_s, ...
    "selectedGridStep_deg", max(jointSearch.PositionStep_deg), ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", axisLimits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ...
    "topologySearch", struct(), ...
    "preShortcutRoute_deg", zeros(0, 2), ...
    "routeShortcut", struct(), ...
    "autonomousRoute_deg", jointSearch.Position_deg, ...
    "retiming", retiming, ...
    "resolutionAttempts", struct([]), ...
    "safeIntervalSearch", struct(), ...
    "motionPlanning", motionPlanning);
end

function timeScaling = makeContinuousTimeScaling( ...
        pathModel, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   timeScaling = makeContinuousTimeScaling( ...
%       pathModel, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Choose the requested whole-path clock and calculate its shortest
%     limit-respecting duration.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Path position and analytic progress derivatives.
%   - axisLimits (scalar struct)
%       Per-axis maximum velocity and acceleration.
%   - options (scalar struct)
%       Resolved PathFirstTimeScaling selection.
%**************************************************************************
% OUTPUTS
%   - timeScaling (scalar struct)
%       Style, duration, and any style-specific schedule values.
%**************************************************************************
% UNITS
%   - Duration_s is seconds; RampFraction and progress are unitless.
if options.PathFirstTimeScaling == "minimumTime"
    timeScaling = minimumTimeContinuousPathScaling( ...
        pathModel, axisLimits);
else
    timeScaling = struct( ...
        "Style", "minimumJerk", ...
        "Duration_s", minimumContinuousPathDuration( ...
            pathModel, axisLimits), ...
        "RampFraction", NaN);
end
end

function timeScaling = minimumTimeContinuousPathScaling( ...
        pathModel, axisLimits)
%% Section 0: Header & Readme
% SYNTAX
%   timeScaling = minimumTimeContinuousPathScaling( ...
%       pathModel, axisLimits)
%**************************************************************************
% PURPOSE
%   - Find the fastest symmetric acceleration/cruise/deceleration clock
%     for one continuous path.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Path position, tangent, and curvature polynomials.
%   - axisLimits (scalar struct)
%       Per-axis maximum velocity and acceleration.
%**************************************************************************
% OUTPUTS
%   - timeScaling (scalar struct)
%       Minimum-time schedule within the searched continuous-clock family.
%**************************************************************************
% UNITS
%   - Duration_s is seconds; RampFraction is unitless.
% A ramp fraction says how much of the maneuver is spent accelerating and
% again decelerating. Fractions near one half describe a triangular speed
% history; smaller values leave a central cruise. Every candidate first
% runs on a one-second clock. Its velocity and acceleration then scale by
% 1/T and 1/T^2, which gives the exact duration needed for that candidate.
normalizedTime = linspace(0, 1, 4001).';
coarseRampFractions = (0.02:0.002:0.5).';
[bestDuration_s, bestRampFraction] = evaluateRampFractionSet( ...
    pathModel, axisLimits, normalizedTime, coarseRampFractions);

% Refine only around the best coarse value. This keeps the result stable
% and inexpensive while resolving the reported duration to much less than
% one output sample for the intended long traversals.
refinementHalfWidth = 0.002;
fineRampFractions = linspace(max(0.005, ...
    bestRampFraction - refinementHalfWidth), min(0.5, ...
    bestRampFraction + refinementHalfWidth), 81).';
[fineDuration_s, fineRampFraction] = evaluateRampFractionSet( ...
    pathModel, axisLimits, normalizedTime, fineRampFractions);
if fineDuration_s < bestDuration_s
    bestDuration_s = fineDuration_s;
    bestRampFraction = fineRampFraction;
end

% The dense calculation is deterministic, but a small margin protects the
% unsampled instant between neighboring progress samples.
timeScaling = struct( ...
    "Style", "minimumTimeTrapezoid", ...
    "Duration_s", 1.005 * max(bestDuration_s, 1e-6), ...
    "RampFraction", bestRampFraction);
end

function [bestDuration_s, bestRampFraction] = evaluateRampFractionSet( ...
        pathModel, axisLimits, normalizedTime, rampFractions)
%% Section 0: Header & Readme
% SYNTAX
%   [bestDuration_s, bestRampFraction] = evaluateRampFractionSet( ...
%       pathModel, axisLimits, normalizedTime, rampFractions)
%**************************************************************************
% PURPOSE
%   - Measure candidate whole-path clocks on a common one-second scale.
%**************************************************************************
% INPUTS
%   - pathModel, axisLimits (scalar structs)
%       Analytic path and per-axis kinematic limits.
%   - normalizedTime (numeric vector)
%       Common zero-to-one clock samples.
%   - rampFractions (numeric vector)
%       Acceleration fractions to compare.
%**************************************************************************
% OUTPUTS
%   - bestDuration_s (positive scalar)
%       Shortest duration required by the compared candidates.
%   - bestRampFraction (scalar in the interval (0, 0.5])
%       Acceleration fraction belonging to bestDuration_s.
%**************************************************************************
% UNITS
%   - bestDuration_s is seconds; other values are unitless except the
%     degree-based path derivatives and limits carried by their structures.
bestDuration_s = Inf;
bestRampFraction = rampFractions(1);
for rampIndex = 1:numel(rampFractions)
    rampFraction = rampFractions(rampIndex);
    [pathProgress, progressRate, progressAcceleration] = ...
        trapezoidalProgress(normalizedTime, 1, rampFraction);
    velocityDuration_s = 0;
    accelerationDuration_s = 0;
    for axisIndex = 1:2
        pathSlope_deg = reshape(ppval( ...
            pathModel.FirstDerivative{axisIndex}, pathProgress), [], 1);
        pathCurvature_deg = reshape(ppval( ...
            pathModel.SecondDerivative{axisIndex}, pathProgress), [], 1);
        velocityAtOneSecond_deg_s = pathSlope_deg .* progressRate;
        accelerationAtOneSecond_deg_s2 = ...
            pathCurvature_deg .* progressRate.^2 + ...
            pathSlope_deg .* progressAcceleration;
        velocityDuration_s = max(velocityDuration_s, ...
            max(abs(velocityAtOneSecond_deg_s)) / ...
            axisLimits.maxVelocity_deg_s(axisIndex));
        accelerationDuration_s = max(accelerationDuration_s, sqrt( ...
            max(abs(accelerationAtOneSecond_deg_s2)) / ...
            axisLimits.maxAcceleration_deg_s2(axisIndex)));
    end
    requiredDuration_s = max( ...
        velocityDuration_s, accelerationDuration_s);
    if requiredDuration_s < bestDuration_s
        bestDuration_s = requiredDuration_s;
        bestRampFraction = rampFraction;
    end
end
end

function blendedPath_deg = makeCornerBlendedPath(routePositions_deg, options)
%% Section 0: Header & Readme
% SYNTAX
%   blendedPath_deg = makeCornerBlendedPath(routePositions_deg, options)
%**************************************************************************
% PURPOSE
%   - Replace each hard interior corner with a short quadratic bend.
%**************************************************************************
% INPUTS
%   - routePositions_deg (numeric N-by-2 matrix)
%       Polygonal path whose intermediate direction changes are abrupt.
%   - options (scalar struct)
%       Grid and exact-shortcut spacing used to size and sample each bend.
%**************************************************************************
% OUTPUTS
%   - blendedPath_deg (numeric M-by-2 matrix)
%       Densely sampled line-and-bend path with unchanged endpoints.
%**************************************************************************
% UNITS
%   - Input, output, blend distances, and sample spacing are degrees.
% Every bend starts along the incoming line and finishes along the outgoing
% line. That matching direction is what lets velocity stay continuous.
routeStep_deg = diff(routePositions_deg, 1, 1);
keepWaypoint = [true; hypot( ...
    routeStep_deg(:, 1), routeStep_deg(:, 2)) > 1e-12];
routePositions_deg = routePositions_deg(keepWaypoint, :);
if size(routePositions_deg, 1) <= 1
    blendedPath_deg = routePositions_deg;
    return;
end

spatialSampleStep_deg = min( ...
    options.RouteShortcutStep_deg, options.GridStep_deg / 4);
maximumBlendDistance_deg = 4 * options.GridStep_deg;
blendFraction = 0.35;
blendedPath_deg = routePositions_deg(1, :);
for waypointIndex = 2:size(routePositions_deg, 1) - 1
    previousPosition_deg = routePositions_deg(waypointIndex - 1, :);
    cornerPosition_deg = routePositions_deg(waypointIndex, :);
    nextPosition_deg = routePositions_deg(waypointIndex + 1, :);
    incomingVector_deg = cornerPosition_deg - previousPosition_deg;
    outgoingVector_deg = nextPosition_deg - cornerPosition_deg;
    incomingLength_deg = hypot( ...
        incomingVector_deg(1), incomingVector_deg(2));
    outgoingLength_deg = hypot( ...
        outgoingVector_deg(1), outgoingVector_deg(2));
    blendDistance_deg = min([ ...
        blendFraction * incomingLength_deg, ...
        blendFraction * outgoingLength_deg, ...
        maximumBlendDistance_deg]);
    entryPosition_deg = cornerPosition_deg - ...
        blendDistance_deg * incomingVector_deg / incomingLength_deg;
    exitPosition_deg = cornerPosition_deg + ...
        blendDistance_deg * outgoingVector_deg / outgoingLength_deg;
    blendedPath_deg = appendStraightPathSamples( ...
        blendedPath_deg, entryPosition_deg, spatialSampleStep_deg);

    bendLengthEstimate_deg = 2 * blendDistance_deg;
    bendSampleCount = max(3, ...
        ceil(bendLengthEstimate_deg / spatialSampleStep_deg) + 1);
    bendFraction = linspace(0, 1, bendSampleCount).';
    bendPosition_deg = (1 - bendFraction).^2 .* entryPosition_deg + ...
        2 * (1 - bendFraction) .* bendFraction .* cornerPosition_deg + ...
        bendFraction.^2 .* exitPosition_deg;
    blendedPath_deg = [ ...
        blendedPath_deg; bendPosition_deg(2:end, :)]; %#ok<AGROW>
end
blendedPath_deg = appendStraightPathSamples(blendedPath_deg, ...
    routePositions_deg(end, :), spatialSampleStep_deg);
end

function path_deg = appendStraightPathSamples( ...
        path_deg, goalPosition_deg, sampleStep_deg)
%% Section 0: Header & Readme
% SYNTAX
%   path_deg = appendStraightPathSamples( ...
%       path_deg, goalPosition_deg, sampleStep_deg)
%**************************************************************************
% PURPOSE
%   - Append evenly spaced samples without duplicating the shared endpoint.
%**************************************************************************
% INPUTS
%   - path_deg (numeric N-by-2 matrix)
%       Path accumulated so far.
%   - goalPosition_deg (numeric two-vector)
%       Endpoint of the straight portion being appended.
%   - sampleStep_deg (positive scalar)
%       Maximum requested spacing along the straight portion.
%**************************************************************************
% OUTPUTS
%   - path_deg (numeric M-by-2 matrix)
%       Extended path with the original rows preserved.
%**************************************************************************
% UNITS
%   - Positions and spacing are degrees.
initialPosition_deg = path_deg(end, :);
displacement_deg = goalPosition_deg - initialPosition_deg;
distance_deg = hypot(displacement_deg(1), displacement_deg(2));
if distance_deg <= 1e-12
    return;
end
sampleCount = max(2, ceil(distance_deg / sampleStep_deg) + 1);
sampleFraction = linspace(0, 1, sampleCount).';
linePosition_deg = initialPosition_deg + sampleFraction .* displacement_deg;
path_deg = [path_deg; linePosition_deg(2:end, :)];
end

function [pathModel, diagnosticPath_deg, pathDistance_deg] = ...
        makeContinuousPathModel(pathSamples_deg, options)
%% Section 0: Header & Readme
% SYNTAX
%   [pathModel, diagnosticPath_deg, pathDistance_deg] = ...
%       makeContinuousPathModel(pathSamples_deg, options)
%**************************************************************************
% PURPOSE
%   - Build a shape-preserving path interpolant and its two derivatives.
%**************************************************************************
% INPUTS
%   - pathSamples_deg (numeric N-by-2 matrix)
%       Dense line-and-bend samples in travel order.
%   - options (scalar struct)
%       Spacing controls for the published diagnostic path.
%**************************************************************************
% OUTPUTS
%   - pathModel (scalar struct)
%       Position, first-derivative, and second-derivative polynomials.
%   - diagnosticPath_deg (numeric M-by-2 matrix)
%       Dense representation of the exact interpolated path.
%   - pathDistance_deg (nonnegative scalar)
%       Sampled arc length of the interpolated path.
%**************************************************************************
% UNITS
%   - Path coordinates and distance are degrees; model progress is unitless.
% The independent variable is progress from zero to one. Keeping position,
% tangent, and curvature together lets the time scaler compute honest axis
% velocity and acceleration rather than estimating them after the fact.
sampleStep_deg = diff(pathSamples_deg, 1, 1);
cumulativeDistance_deg = [0; cumsum(hypot( ...
    sampleStep_deg(:, 1), sampleStep_deg(:, 2)))];
pathDistanceEstimate_deg = cumulativeDistance_deg(end);
if pathDistanceEstimate_deg <= 1e-12
    normalizedDistance = [0; 1];
    pathSamples_deg = [pathSamples_deg(1, :); pathSamples_deg(1, :)];
else
    normalizedDistance = cumulativeDistance_deg / pathDistanceEstimate_deg;
end

pathModel = struct();
pathModel.Position = cell(1, 2);
pathModel.FirstDerivative = cell(1, 2);
pathModel.SecondDerivative = cell(1, 2);
for axisIndex = 1:2
    positionPolynomial = pchip( ...
        normalizedDistance, pathSamples_deg(:, axisIndex));
    firstDerivativePolynomial = differentiatePiecewisePolynomial( ...
        positionPolynomial);
    secondDerivativePolynomial = differentiatePiecewisePolynomial( ...
        firstDerivativePolynomial);
    pathModel.Position{axisIndex} = positionPolynomial;
    pathModel.FirstDerivative{axisIndex} = firstDerivativePolynomial;
    pathModel.SecondDerivative{axisIndex} = secondDerivativePolynomial;
end
pathModel.StartPosition_deg = pathSamples_deg(1, :);
pathModel.GoalPosition_deg = pathSamples_deg(end, :);

diagnosticSampleStep_deg = min( ...
    options.RouteShortcutStep_deg, options.GridStep_deg / 8);
diagnosticSampleCount = min(20000, max(1001, ...
    ceil(pathDistanceEstimate_deg / diagnosticSampleStep_deg) + 1));
diagnosticProgress = linspace(0, 1, diagnosticSampleCount).';
diagnosticPath_deg = evaluatePathPosition(pathModel, diagnosticProgress);
diagnosticStep_deg = diff(diagnosticPath_deg, 1, 1);
pathDistance_deg = sum(hypot( ...
    diagnosticStep_deg(:, 1), diagnosticStep_deg(:, 2)));
end

function derivativePolynomial = differentiatePiecewisePolynomial(polynomial)
%% Section 0: Header & Readme
% SYNTAX
%   derivativePolynomial = ...
%       differentiatePiecewisePolynomial(polynomial)
%**************************************************************************
% PURPOSE
%   - Differentiate a scalar MATLAB piecewise polynomial without requiring
%     an additional toolbox.
%**************************************************************************
% INPUTS
%   - polynomial (MATLAB piecewise-polynomial struct)
%       Scalar polynomial returned by pchip or this helper.
%**************************************************************************
% OUTPUTS
%   - derivativePolynomial (piecewise-polynomial struct)
%       Analytic derivative over the original break intervals.
%**************************************************************************
% UNITS
%   - Units follow the input polynomial divided by its independent variable.
[breaks, coefficients, ~, order, dimension] = unmkpp(polynomial);
if order <= 1
    derivativeCoefficients = zeros(size(coefficients, 1), 1);
else
    powers = order - 1:-1:1;
    derivativeCoefficients = coefficients(:, 1:end - 1) .* powers;
end
derivativePolynomial = mkpp( ...
    breaks, derivativeCoefficients, dimension);
end

function position_deg = evaluatePathPosition(pathModel, progress)
%% Section 0: Header & Readme
% SYNTAX
%   position_deg = evaluatePathPosition(pathModel, progress)
%**************************************************************************
% PURPOSE
%   - Evaluate the two path coordinates at normalized progress samples.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Two-axis position polynomials.
%   - progress (numeric vector)
%       Requested path fractions from zero through one.
%**************************************************************************
% OUTPUTS
%   - position_deg (numeric N-by-2 matrix)
%       Unwrapped azimuth/elevation samples.
%**************************************************************************
% UNITS
%   - Progress is unitless and position is degrees.
position_deg = zeros(numel(progress), 2);
for axisIndex = 1:2
    position_deg(:, axisIndex) = reshape(ppval( ...
        pathModel.Position{axisIndex}, progress), [], 1);
end
end

function minimumDuration_s = minimumContinuousPathDuration( ...
        pathModel, axisLimits)
%% Section 0: Header & Readme
% SYNTAX
%   minimumDuration_s = minimumContinuousPathDuration( ...
%       pathModel, axisLimits)
%**************************************************************************
% PURPOSE
%   - Find one conservative duration that keeps the continuous path inside
%     both axes' velocity and acceleration limits.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Path position and analytic progress derivatives.
%   - axisLimits (scalar struct)
%       Per-axis maximum velocity and acceleration.
%**************************************************************************
% OUTPUTS
%   - minimumDuration_s (positive scalar)
%       Time-scaled maneuver duration including a small sampling margin.
%**************************************************************************
% UNITS
%   - Output is seconds; limits use deg/s and deg/s^2.
% We first evaluate a one-second maneuver. Velocity scales as 1/T and
% acceleration as 1/T^2, so the required duration follows directly from
% the measured ratios. A small margin covers samples between this grid.
normalizedTime = linspace(0, 1, 4001).';
[pathProgress, progressRate, progressAcceleration] = ...
    minimumJerkProgress(normalizedTime, 1);
velocityDuration_s = 0;
accelerationDuration_s = 0;
for axisIndex = 1:2
    pathSlope_deg = reshape(ppval( ...
        pathModel.FirstDerivative{axisIndex}, pathProgress), [], 1);
    pathCurvature_deg = reshape(ppval( ...
        pathModel.SecondDerivative{axisIndex}, pathProgress), [], 1);
    velocityAtOneSecond_deg_s = pathSlope_deg .* progressRate;
    accelerationAtOneSecond_deg_s2 = ...
        pathCurvature_deg .* progressRate.^2 + ...
        pathSlope_deg .* progressAcceleration;
    velocityDuration_s = max(velocityDuration_s, ...
        max(abs(velocityAtOneSecond_deg_s)) / ...
        axisLimits.maxVelocity_deg_s(axisIndex));
    accelerationDuration_s = max(accelerationDuration_s, sqrt( ...
        max(abs(accelerationAtOneSecond_deg_s2)) / ...
        axisLimits.maxAcceleration_deg_s2(axisIndex)));
end
minimumDuration_s = 1.02 * max( ...
    [velocityDuration_s, accelerationDuration_s, 1e-6]);
end

function profile = makeContinuousPathProfile( ...
        pathModel, initialTime_s, goalTime_s, timeScaling, ...
        sampleTime_s, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makeContinuousPathProfile( ...
%       pathModel, initialTime_s, goalTime_s, timeScaling, ...
%       sampleTime_s, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Sample one continuous corner-blended maneuver and its final wait.
%**************************************************************************
% INPUTS
%   - pathModel (scalar struct)
%       Two-axis position and derivative polynomials.
%   - initialTime_s, goalTime_s, sampleTime_s (numeric scalars)
%       Mission horizon and output spacing.
%   - timeScaling (scalar struct)
%       Style, maneuver duration, and any style-specific schedule values.
%   - axisLimits, options (scalar structs)
%       Azimuth canonicalization limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Time, position, velocity, acceleration, and waiting samples.
%**************************************************************************
% UNITS
%   - Angles are degrees; time is seconds.
time_s = (initialTime_s:sampleTime_s:goalTime_s).';
if time_s(end) < goalTime_s - 1e-9
    time_s(end + 1, 1) = goalTime_s;
else
    time_s(end) = goalTime_s;
end
elapsedTime_s = min(max(time_s - initialTime_s, 0), ...
    timeScaling.Duration_s);
normalizedTime = elapsedTime_s / timeScaling.Duration_s;
if timeScaling.Style == "minimumTimeTrapezoid"
    [pathProgress, progressRate_1_s, progressAcceleration_1_s2] = ...
        trapezoidalProgress(normalizedTime, timeScaling.Duration_s, ...
        timeScaling.RampFraction);
else
    [pathProgress, progressRate_1_s, progressAcceleration_1_s2] = ...
        minimumJerkProgress(normalizedTime, timeScaling.Duration_s);
end

positionUnwrapped_deg = evaluatePathPosition(pathModel, pathProgress);
velocity_deg_s = zeros(numel(time_s), 2);
acceleration_deg_s2 = zeros(numel(time_s), 2);
for axisIndex = 1:2
    pathSlope_deg = reshape(ppval( ...
        pathModel.FirstDerivative{axisIndex}, pathProgress), [], 1);
    pathCurvature_deg = reshape(ppval( ...
        pathModel.SecondDerivative{axisIndex}, pathProgress), [], 1);
    velocity_deg_s(:, axisIndex) = ...
        pathSlope_deg .* progressRate_1_s;
    acceleration_deg_s2(:, axisIndex) = ...
        pathCurvature_deg .* progressRate_1_s.^2 + ...
        pathSlope_deg .* progressAcceleration_1_s2;
end
% The trapezoid has a nonzero one-sided acceleration immediately before
% stopping. Once its scheduled duration has elapsed, publish the requested
% rest state instead of repeating that final deceleration during the hold.
maneuverIsComplete = time_s >= ...
    initialTime_s + timeScaling.Duration_s - 1e-12;
positionUnwrapped_deg(maneuverIsComplete, :) = repmat( ...
    pathModel.GoalPosition_deg, nnz(maneuverIsComplete), 1);
velocity_deg_s(maneuverIsComplete, :) = 0;
acceleration_deg_s2(maneuverIsComplete, :) = 0;
positionUnwrapped_deg(1, :) = pathModel.StartPosition_deg;
positionUnwrapped_deg(end, :) = pathModel.GoalPosition_deg;
position_deg = positionUnwrapped_deg;
position_deg(:, 1) = canonicalAzimuth( ...
    position_deg(:, 1), axisLimits, options);
velocity_deg_s([1 end], :) = 0;
acceleration_deg_s2([1 end], :) = 0;
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "positionUnwrapped_deg", positionUnwrapped_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "isWaiting", all(abs(velocity_deg_s) <= 1e-10, 2) & ...
        all(abs(acceleration_deg_s2) <= 1e-10, 2));
end

function [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
        trapezoidalProgress(normalizedTime, duration_s, rampFraction)
%% Section 0: Header & Readme
% SYNTAX
%   [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
%       trapezoidalProgress(normalizedTime, duration_s, rampFraction)
%**************************************************************************
% PURPOSE
%   - Evaluate a continuous-velocity accelerate/cruise/decelerate clock.
%**************************************************************************
% INPUTS
%   - normalizedTime (numeric vector)
%       Clamped maneuver time from zero through one.
%   - duration_s (positive scalar)
%       Physical duration represented by normalizedTime.
%   - rampFraction (scalar in the interval (0, 0.5])
%       Fraction spent accelerating and again decelerating.
%**************************************************************************
% OUTPUTS
%   - progress, progressRate_1_s, progressAcceleration_1_s2
%       Path fraction and its first two physical-time derivatives.
%**************************************************************************
% UNITS
%   - Progress and rampFraction are unitless; derivatives are 1/s and
%     1/s^2.
normalizedAcceleration = 1 / (rampFraction * (1 - rampFraction));
normalizedCruiseRate = 1 / (1 - rampFraction);
progress = zeros(size(normalizedTime));
progressRate = zeros(size(normalizedTime));
progressAcceleration = zeros(size(normalizedTime));

isAccelerating = normalizedTime < rampFraction;
isCruising = normalizedTime >= rampFraction & ...
    normalizedTime <= 1 - rampFraction;
isDecelerating = normalizedTime > 1 - rampFraction;
progress(isAccelerating) = 0.5 * normalizedAcceleration * ...
    normalizedTime(isAccelerating).^2;
progressRate(isAccelerating) = normalizedAcceleration * ...
    normalizedTime(isAccelerating);
progressAcceleration(isAccelerating) = normalizedAcceleration;

accelerationDistance = 0.5 * normalizedAcceleration * rampFraction^2;
progress(isCruising) = accelerationDistance + ...
    normalizedCruiseRate * ...
    (normalizedTime(isCruising) - rampFraction);
progressRate(isCruising) = normalizedCruiseRate;

remainingNormalizedTime = 1 - normalizedTime(isDecelerating);
progress(isDecelerating) = 1 - 0.5 * normalizedAcceleration * ...
    remainingNormalizedTime.^2;
progressRate(isDecelerating) = normalizedAcceleration * ...
    remainingNormalizedTime;
progressAcceleration(isDecelerating) = -normalizedAcceleration;

progressRate_1_s = progressRate / duration_s;
progressAcceleration_1_s2 = progressAcceleration / duration_s^2;
end

function [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
        minimumJerkProgress(normalizedTime, duration_s)
%% Section 0: Header & Readme
% SYNTAX
%   [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
%       minimumJerkProgress(normalizedTime, duration_s)
%**************************************************************************
% PURPOSE
%   - Move from zero to one with zero rate and acceleration at both ends.
%**************************************************************************
% INPUTS
%   - normalizedTime (numeric vector)
%       Clamped maneuver time from zero through one.
%   - duration_s (positive scalar)
%       Physical duration represented by normalizedTime.
%**************************************************************************
% OUTPUTS
%   - progress, progressRate_1_s, progressAcceleration_1_s2
%       Path fraction and its first two physical-time derivatives.
%**************************************************************************
% UNITS
%   - Progress is unitless; derivatives are 1/s and 1/s^2.
% This fifth-order curve supplies a gentle global start and stop while the
% blended spatial path supplies continuous direction through its corners.
progress = 10 * normalizedTime.^3 - 15 * normalizedTime.^4 + ...
    6 * normalizedTime.^5;
progressRate_1_s = (30 * normalizedTime.^2 - ...
    60 * normalizedTime.^3 + 30 * normalizedTime.^4) / duration_s;
progressAcceleration_1_s2 = (60 * normalizedTime - ...
    180 * normalizedTime.^2 + 120 * normalizedTime.^3) / duration_s^2;
end

function profile = makeStaticRouteProfile( ...
        initialTime_s, goalTime_s, routePositions_deg, ...
        segmentDisplacement_deg, segmentInitialTime_s, ...
        segmentDuration_s, normalizedPeakRate, ...
        normalizedAcceleration, sampleTime_s, axisLimits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makeStaticRouteProfile( ...
%       initialTime_s, goalTime_s, routePositions_deg, ...
%       segmentDisplacement_deg, segmentInitialTime_s, ...
%       segmentDuration_s, normalizedPeakRate, ...
%       normalizedAcceleration, sampleTime_s, axisLimits, options)
%**************************************************************************
% PURPOSE
%   - Sample synchronized static-route motion for output or validation.
%**************************************************************************
% INPUTS
%   - route and timing arguments (numeric)
%       Waypoints, segment laws, time horizon, and sample spacing.
%   - axisLimits, options (scalar structs)
%       Canonicalization limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Sampled position, velocity, acceleration, and waiting state.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
% Output and dense validation sample the same retimed motion law at different
% rates, so this shared evaluator prevents validation/output disagreement.
time_s = (initialTime_s:sampleTime_s:goalTime_s).';
if time_s(end) < goalTime_s
    time_s(end + 1, 1) = goalTime_s;
end
elapsedSegmentTime_s = time_s - segmentInitialTime_s;
accelerationDuration_s = normalizedPeakRate ./ normalizedAcceleration;
accelerationDistance = 0.5 .* normalizedAcceleration .* ...
    accelerationDuration_s.^2;
cruiseDuration_s = max(0, ...
    segmentDuration_s - 2 .* accelerationDuration_s);
segmentProgress = zeros(size(elapsedSegmentTime_s));
segmentRate = zeros(size(elapsedSegmentTime_s));
segmentAcceleration = zeros(size(elapsedSegmentTime_s));

accelerationMatrix = repmat( ...
    normalizedAcceleration, numel(time_s), 1);
accelerationDurationMatrix_s = repmat( ...
    accelerationDuration_s, numel(time_s), 1);
accelerationDistanceMatrix = repmat( ...
    accelerationDistance, numel(time_s), 1);
peakRateMatrix = repmat(normalizedPeakRate, numel(time_s), 1);
segmentDurationMatrix_s = repmat(segmentDuration_s, numel(time_s), 1);

accelerating = elapsedSegmentTime_s > 0 & ...
    elapsedSegmentTime_s < accelerationDuration_s;
segmentProgress(accelerating) = 0.5 .* ...
    accelerationMatrix(accelerating) .* ...
    elapsedSegmentTime_s(accelerating).^2;
segmentRate(accelerating) = accelerationMatrix(accelerating) .* ...
    elapsedSegmentTime_s(accelerating);
segmentAcceleration(accelerating) = accelerationMatrix(accelerating);

cruising = elapsedSegmentTime_s >= accelerationDuration_s & ...
    elapsedSegmentTime_s < accelerationDuration_s + cruiseDuration_s;
segmentProgress(cruising) = accelerationDistanceMatrix(cruising) + ...
    peakRateMatrix(cruising) .* ...
    (elapsedSegmentTime_s(cruising) - ...
    accelerationDurationMatrix_s(cruising));
segmentRate(cruising) = peakRateMatrix(cruising);

decelerationStart_s = accelerationDuration_s + cruiseDuration_s;
decelerating = elapsedSegmentTime_s >= decelerationStart_s & ...
    elapsedSegmentTime_s < segmentDuration_s;
remainingSegmentTime_s = segmentDurationMatrix_s - elapsedSegmentTime_s;
segmentProgress(decelerating) = 1 - 0.5 .* ...
    accelerationMatrix(decelerating) .* ...
    remainingSegmentTime_s(decelerating).^2;
segmentRate(decelerating) = accelerationMatrix(decelerating) .* ...
    remainingSegmentTime_s(decelerating);
segmentAcceleration(decelerating) = -accelerationMatrix(decelerating);
segmentProgress(elapsedSegmentTime_s >= segmentDuration_s) = 1;
positionUnwrapped_deg = routePositions_deg(1, :) + ...
    segmentProgress * segmentDisplacement_deg;
velocity_deg_s = segmentRate * segmentDisplacement_deg;
acceleration_deg_s2 = segmentAcceleration * segmentDisplacement_deg;
position_deg = positionUnwrapped_deg;
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(axisLimits.azimuth_deg);
    position_deg(:, 1) = mod(position_deg(:, 1) - ...
        axisLimits.azimuth_deg(1), azimuthSpan_deg) + ...
        axisLimits.azimuth_deg(1);
end
acceleration_deg_s2([1 end], :) = 0;
profile = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "positionUnwrapped_deg", positionUnwrapped_deg, ...
    "velocity_deg_s", velocity_deg_s, ...
    "acceleration_deg_s2", acceleration_deg_s2, ...
    "isWaiting", all(abs(velocity_deg_s) <= 1e-10, 2) & ...
        all(abs(acceleration_deg_s2) <= 1e-10, 2));
end

function retimed = failedRetiming(message, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   retimed = failedRetiming(message, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared failed-retiming diagnostic schema.
%**************************************************************************
% INPUTS
%   - message (scalar text)
%       Failure explanation.
%   - elapsed_s (nonnegative scalar)
%       Retiming wall time.
%**************************************************************************
% OUTPUTS
%   - retimed (scalar struct)
%       Failed retiming diagnostics.
%**************************************************************************
% UNITS
%   - elapsed_s is seconds; empty route fields retain named angular units.
% Both infeasible timing and collision failures expose the same diagnostic
% fields to the resolution controller.
retimed = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "MotionStyle", "", ...
    "TimeScalingStyle", "", ...
    "Profile", struct(), ...
    "RouteDistance_deg", Inf, ...
    "MinimumManeuverTime_s", Inf, ...
    "SegmentDuration_s", zeros(1, 0), ...
    "SegmentInitialTime_s", zeros(1, 0), ...
    "RoutePositions_deg", zeros(0, 2), ...
    "SmoothedPath_deg", zeros(0, 2), ...
    "StateSpaceSearch", struct(), ...
    "SearchElapsed_s", elapsed_s);
end

function plan = failedStaticPlan( ...
        message, obstacleField, initialState, goalState, axisLimits, ...
        options, topology, elapsed_s)
%% Section 0: Header & Readme
% SYNTAX
%   plan = failedStaticPlan( ...
%       message, obstacleField, initialState, goalState, axisLimits, ...
%       options, topology, elapsed_s)
%**************************************************************************
% PURPOSE
%   - Assemble the shared static-planner failure schema.
%**************************************************************************
% INPUTS
%   - message, obstacleField, initialState, goalState (failure context)
%       Explanation, geometry, and boundary states.
%   - axisLimits, options, topology, elapsed_s (diagnostic context)
%       Limits, resolved controls, topology evidence, and elapsed time.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Failed static plan.
%**************************************************************************
% UNITS
%   - Angular quantities are degrees and elapsed_s is seconds.
% Endpoint, topology, shortcut, and retiming failures share one diagnostic
% schema so the resolution controller can compare attempts safely.
plan = struct( ...
    "success", false, ...
    "message", string(message), ...
    "method", "goalRootedDijkstra", ...
    "time_s", zeros(0, 1), ...
    "position_deg", zeros(0, 2), ...
    "positionUnwrapped_deg", zeros(0, 2), ...
    "velocity_deg_s", zeros(0, 2), ...
    "acceleration_deg_s2", zeros(0, 2), ...
    "isWaiting", false(0, 1), ...
    "cost_s", Inf, ...
    "objective", options.Objective, ...
    "objectiveCost", Inf, ...
    "objectiveCostUnits", "deg", ...
    "angularPathLength_deg", Inf, ...
    "angularLowerBound_deg", NaN, ...
    "suboptimalityBound", Inf, ...
    "optimalOnLattice", false, ...
    "topologyOptimalOnLattice", false, ...
    "optimalGlobally", false, ...
    "exactCollisionValidated", false, ...
    "expandedNodeCount", topology.ExpandedNodeCount, ...
    "generatedNodeCount", topology.GeneratedNodeCount, ...
    "searchElapsed_s", elapsed_s, ...
    "selectedGridStep_deg", options.GridStep_deg, ...
    "startState", initialState, ...
    "stopState", goalState, ...
    "limits", axisLimits, ...
    "options", options, ...
    "obstacleField", obstacleField, ...
    "workspace", obstacleField, ... % deprecated compatibility alias
    "topologySearch", topology);
end

function result = emptyGoalDijkstraResult(options)
%% Section 0: Header & Readme
% SYNTAX
%   result = emptyGoalDijkstraResult(options)
%**************************************************************************
% PURPOSE
%   - Define the shared empty topology-search diagnostic schema.
%**************************************************************************
% INPUTS
%   - options (scalar struct)
%       Resolved planner controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Empty goal-rooted Dijkstra result.
%**************************************************************************
% UNITS
%   - Unit-bearing fields identify degrees or seconds.
% Endpoint attachment and all search terminations initialize the same
% topology fields before adding case-specific diagnostics.
result = struct( ...
    "Success", false, ...
    "Message", "Goal-rooted Dijkstra did not run.", ...
    "Method", "goalRootedDijkstra", ...
    "Path_deg", zeros(0, 2), ...
    "GridNodePath", zeros(0, 1, "uint32"), ...
    "LatticeDistance_deg", Inf, ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SearchElapsed_s", 0, ...
    "TerminationReason", "notRun", ...
    "CostToGoal_deg", zeros(0, 0), ...
    "SettledMask", false(0, 0), ...
    "BlockedMask", false(0, 0), ...
    "AzimuthGrid_deg", zeros(1, 0), ...
    "ElevationGrid_deg", zeros(1, 0), ...
    "InitialGridNode", 0, ...
    "GoalGridNode", 0, ...
    "Options", options);
end

function frontier = pushDijkstraFrontier(frontier, node, cost_deg)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = pushDijkstraFrontier(frontier, node, cost_deg)
%**************************************************************************
% PURPOSE
%   - Push one cost-labeled node onto the static binary min-heap.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays, count, and serial state.
%   - node (positive integer)
%       Grid node index.
%   - cost_deg (nonnegative scalar)
%       Cost-to-go label.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - cost_deg is degrees; other values are dimensionless.
% Push and pop share the comparison/swap helpers below so equal-cost states
% retain deterministic FIFO tie-breaking.
if frontier.Count >= numel(frontier.Node)
    previousCapacity = numel(frontier.Node);
    expandedCapacity = 2 * previousCapacity;
    frontier.Node(expandedCapacity, 1) = 0;
    frontier.Cost_deg(previousCapacity + 1:expandedCapacity, 1) = Inf;
    frontier.Serial(previousCapacity + 1:expandedCapacity, 1) = 0;
end
frontier.Count = frontier.Count + 1;
frontier.NextSerial = frontier.NextSerial + 1;
frontierIndex = frontier.Count;
frontier.Node(frontierIndex) = uint32(node);
frontier.Cost_deg(frontierIndex) = cost_deg;
frontier.Serial(frontierIndex) = frontier.NextSerial;
while frontierIndex > 1
    parentIndex = floor(frontierIndex / 2);
    if ~dijkstraFrontierEntryIsLess( ...
            frontier, frontierIndex, parentIndex)
        break;
    end
    frontier = swapDijkstraFrontierEntries( ...
        frontier, frontierIndex, parentIndex);
    frontierIndex = parentIndex;
end
end

function [frontier, node, cost_deg] = popDijkstraFrontier(frontier)
%% Section 0: Header & Readme
% SYNTAX
%   [frontier, node, cost_deg] = popDijkstraFrontier(frontier)
%**************************************************************************
% PURPOSE
%   - Remove the minimum-cost static frontier entry.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Nonempty static binary min-heap.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%   - node (positive integer)
%       Removed grid node.
%   - cost_deg (nonnegative scalar)
%       Removed cost label.
%**************************************************************************
% UNITS
%   - cost_deg is degrees; other values are dimensionless.
% This is paired with pushDijkstraFrontier and intentionally reuses the same
% ordering primitive instead of duplicating heap rules.
node = double(frontier.Node(1));
cost_deg = frontier.Cost_deg(1);
frontier.Node(1) = frontier.Node(frontier.Count);
frontier.Cost_deg(1) = frontier.Cost_deg(frontier.Count);
frontier.Serial(1) = frontier.Serial(frontier.Count);
frontier.Count = frontier.Count - 1;
frontierIndex = 1;
while true
    leftChildIndex = 2 * frontierIndex;
    rightChildIndex = leftChildIndex + 1;
    if leftChildIndex > frontier.Count
        break;
    end
    smallerChildIndex = leftChildIndex;
    if rightChildIndex <= frontier.Count && ...
            dijkstraFrontierEntryIsLess( ...
            frontier, rightChildIndex, leftChildIndex)
        smallerChildIndex = rightChildIndex;
    end
    if ~dijkstraFrontierEntryIsLess( ...
            frontier, smallerChildIndex, frontierIndex)
        break;
    end
    frontier = swapDijkstraFrontierEntries( ...
        frontier, smallerChildIndex, frontierIndex);
    frontierIndex = smallerChildIndex;
end
end

function less = dijkstraFrontierEntryIsLess( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   less = dijkstraFrontierEntryIsLess( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Compare static heap entries by cost and deterministic serial order.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to compare.
%**************************************************************************
% OUTPUTS
%   - less (logical scalar)
%       True when the first entry precedes the second.
%**************************************************************************
% UNITS
%   - Comparison result and indices are dimensionless.
% Both heap directions depend on this single tolerance and serial ordering
% rule.
costTolerance_deg = 1e-12;
if frontier.Cost_deg(firstIndex) < ...
        frontier.Cost_deg(secondIndex) - costTolerance_deg
    less = true;
elseif frontier.Cost_deg(firstIndex) > ...
        frontier.Cost_deg(secondIndex) + costTolerance_deg
    less = false;
else
    less = frontier.Serial(firstIndex) < frontier.Serial(secondIndex);
end
end

function frontier = swapDijkstraFrontierEntries( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = swapDijkstraFrontierEntries( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Swap every parallel array in two static heap entries.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to exchange.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - Indices are dimensionless; stored cost units remain degrees.
% Push and pop both swap three parallel arrays; centralizing it prevents
% frontier corruption when the schema changes.
fieldNames = ["Node", "Cost_deg", "Serial"];
for fieldName = fieldNames
    temporaryValue = frontier.(fieldName)(firstIndex);
    frontier.(fieldName)(firstIndex) = frontier.(fieldName)(secondIndex);
    frontier.(fieldName)(secondIndex) = temporaryValue;
end
end

function delta = wrappedDelta(fromPosition, toPosition, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   delta = wrappedDelta(fromPosition, toPosition, limits, options)
%**************************************************************************
% PURPOSE
%   - Compute the shortest configured two-axis displacement.
%**************************************************************************
% INPUTS
%   - fromPosition, toPosition (numeric angular arrays)
%       Boundary positions.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - delta (numeric angular array)
%       Shortest signed displacement.
%**************************************************************************
% UNITS
%   - Positions and delta are degrees.
% Static and dynamic graph operations must agree on the shortest azimuth
% displacement at the periodic seam.
delta = toPosition - fromPosition;
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    delta(1) = mod(delta(1) + span / 2, span) - span / 2;
end
end

function state = normalizeState(state, label, requiredState)
%% Section 0: Header & Readme
% SYNTAX
%   state = normalizeState(state, label, requiredState)
%**************************************************************************
% PURPOSE
%   - Validate one planner boundary-state schema and orientation.
%**************************************************************************
% INPUTS
%   - state (scalar struct)
%       Boundary state to validate.
%   - label (text)
%       Diagnostic state name.
%   - requiredState (string vector)
%       Required field names.
%**************************************************************************
% OUTPUTS
%   - state (scalar struct)
%       Validated double state.
%**************************************************************************
% UNITS
%   - Units are encoded in required field names.
% Initial and goal states share one public schema; centralizing this repeated
% validation prevents one endpoint from accepting a different shape.
if ~isstruct(state) || ~isscalar(state) || ...
        ~all(isfield(state, cellstr(requiredState)))
    error("planAzElDijkstra:InvalidState", ...
        "%s is missing a required field.", label);
end
validateattributes(state.time_s, {'numeric'}, ...
    {'scalar', 'real', 'finite'});
for name = requiredState(2:end)
    validateattributes(state.(name), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    state.(name) = reshape(double(state.(name)), 1, 2);
end
state.time_s = double(state.time_s);
end

function result = searchAzElSafeIntervalDijkstra( ...
        obstacleField, startState, stopState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = searchAzElSafeIntervalDijkstra( ...
%       obstacleField, startState, stopState, limits, options)
%**************************************************************************
% PURPOSE
%   - Find a continuous-time route through event-compressed safe intervals.
%**************************************************************************
% INPUTS
%   - obstacleField, startState, stopState, limits, options (planner inputs)
%       Packed geometry, boundary states, limits, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Route, sampled profile, search diagnostics, and resolved options.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
%
% PLAIN-LANGUAGE SUMMARY
%   Moving obstacles make position alone incomplete: arriving at the same
%   point before or after an obstacle passes can change whether the route is
%   safe. We therefore pair each position with a "safe interval," meaning a
%   continuous span when the boresight may wait there safely.
%
%   The number written on each state is the earliest arrival proven so far.
%   Parent, departure, and motion records act like a travel receipt: after
%   reaching the goal, they explain exactly where the boresight waited and
%   when each slew began. Waiting stays continuous; the search does not make
%   one separate state for every clock tick.

%% Section 1: List The Times When Safety Can Change
% Obstacle samples are the moments when the stored scene may change. These
% event times give us a compact calendar for deciding when a stationary
% position is safe. A long period with no change becomes one interval rather
% than hundreds of nearly identical time samples.
dynamicSearchTimer = tic;
hasTerminalDynamics = options.AllowNonzeroTerminalState && ...
    any(abs([stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2]) > 1e-12);
packedObstacles = obstacleField.Obstacles;
eventTimeParts = cell(numel(packedObstacles) + 1, 1);
eventTimeParts{1} = [startState.time_s; stopState.time_s];
for obstacleIndex = 1:numel(packedObstacles)
    obstacle = packedObstacles(obstacleIndex);
    obstacleTimes_s = double(obstacle.TimeSeconds(:));
    isInsideSearchHorizon = obstacleTimes_s >= startState.time_s & ...
        obstacleTimes_s <= stopState.time_s;
    eventTimeParts{obstacleIndex + 1} = ...
        obstacleTimes_s(isInsideSearchHorizon);
end
eventTimes = unique(vertcat(eventTimeParts{:}));
if numel(eventTimes) > options.MaximumSafeIntervalSamples
    % Very long histories can contain more event times than the configured
    % memory budget allows. Keep evenly spaced evidence plus both mission
    % endpoints so the reduction is predictable and reproducible.
    retainedEventIndices = unique(round(linspace( ...
        1, numel(eventTimes), options.MaximumSafeIntervalSamples)));
    eventTimes = eventTimes(retainedEventIndices);
    eventTimes = unique([ ...
        startState.time_s; eventTimes; stopState.time_s]);
end
if numel(eventTimes) < 2
    eventTimes = [startState.time_s; stopState.time_s];
end
safeCache = containers.Map( ...
    'KeyType', 'char', 'ValueType', 'any');
safeQueryCount = 0;

%% Section 2: Confirm The Endpoints Are Safe At Their Required Times
% A route cannot repair a start that is already inside an obstacle or a goal
% that is blocked at the required final time. Resolve those two facts before
% allocating the larger search structures.
[startSafeIntervals_s, safeCache, safeQueryCount] = safeIntervalsAt( ...
    startState.position_deg, obstacleField, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
startSafeIntervalIndex = find( ...
    startState.time_s >= startSafeIntervals_s(:, 1) - 1e-9 & ...
    startState.time_s <= startSafeIntervals_s(:, 2) + 1e-9, 1);
if isempty(startSafeIntervalIndex)
    startSafeIntervalIndex = 0;
end
if startSafeIntervalIndex == 0
    result = failedResult( ...
        "The start is not inside a sampled safe interval.", ...
        eventTimes, safeCache, safeQueryCount, ...
        toc(dynamicSearchTimer), options);
    return;
end

[goalSafeIntervals_s, safeCache, safeQueryCount] = safeIntervalsAt( ...
    stopState.position_deg, obstacleField, eventTimes, limits, options, ...
    safeCache, safeQueryCount);
goalSafeIntervalIndex = find( ...
    stopState.time_s >= goalSafeIntervals_s(:, 1) - 1e-9 & ...
    stopState.time_s <= goalSafeIntervals_s(:, 2) + 1e-9, 1);
if isempty(goalSafeIntervalIndex)
    goalSafeIntervalIndex = 0;
end
if goalSafeIntervalIndex == 0
    result = failedResult( ...
        "The stop is not inside a sampled safe interval.", ...
        eventTimes, safeCache, safeQueryCount, ...
        toc(dynamicSearchTimer), options);
    return;
end

%% Section 3: Check Whether The Obvious Direct Route Already Works
% Before building a graph, try the simplest defensible answer: wait if
% needed, then slew directly to the goal. If that straight command is safe,
% its angular distance is the absolute lower bound and no search can improve
% it. Terminal velocity matching is excluded because it needs a different
% final motion shape that is handled in the normal search below.
[directFound, directRoute, directProfile] = deal(false, struct(), struct());
% A collision-free direct slew has the Euclidean lower-bound distance and is
% therefore a global certificate for the angular-distance objective.
if ~hasTerminalDynamics
    directDelta_deg = wrappedDelta( ...
        startState.position_deg, stopState.position_deg, limits, options);
    [directDuration_s, directMotion] = segmentMotion( ...
        directDelta_deg, limits);
    startSafeInterval_s = startSafeIntervals_s( ...
        startSafeIntervalIndex, :);
    goalSafeInterval_s = goalSafeIntervals_s( ...
        goalSafeIntervalIndex, :);
    if directDuration_s <= 1e-12
        requiredSafeEndTime_s = stopState.time_s - 1e-9;
        allowedSafeStartTime_s = startState.time_s + 1e-9;
        startRemainsSafe = startSafeInterval_s(2) >= requiredSafeEndTime_s;
        goalAlreadySafe = goalSafeInterval_s(1) <= allowedSafeStartTime_s;
        directFound = startRemainsSafe && goalAlreadySafe;
        directDeparture_s = startState.time_s;
        directArrival_s = startState.time_s;
    else
        [directFound, directDeparture_s, directArrival_s] = scheduleTransition( ...
            obstacleField, startState.position_deg, ...
            directDelta_deg, startState.time_s, ...
            startSafeInterval_s, goalSafeInterval_s, ...
            directDuration_s, directMotion, eventTimes, limits, options);
    end
    if directFound
        if directDuration_s <= 1e-12
            directRoute = struct( ...
                "position_deg", startState.position_deg, ...
                "positionUnwrapped_deg", startState.position_deg, ...
                "arrivalTime_s", startState.time_s, ...
                "departureTime_s", stopState.time_s, ...
                "motionDuration_s", 0, ...
                "waitingDuration_s", ...
                stopState.time_s - startState.time_s, ...
                "hasTerminalCapture", false, ...
                "terminalVelocity_deg_s", [0 0], ...
                "terminalAcceleration_deg_s2", [0 0], ...
                "angularPathLength_deg", 0);
        else
            directUnwrappedGoal_deg = startState.position_deg + ...
                directDelta_deg;
            directRoute = struct( ...
                "position_deg", [ ...
                startState.position_deg; stopState.position_deg], ...
                "positionUnwrapped_deg", [ ...
                startState.position_deg; directUnwrappedGoal_deg], ...
                "arrivalTime_s", [ ...
                startState.time_s; directArrival_s], ...
                "departureTime_s", [ ...
                directDeparture_s; stopState.time_s], ...
                "motionDuration_s", [directDuration_s; 0], ...
                "waitingDuration_s", [ ...
                directDeparture_s - startState.time_s; ...
                stopState.time_s - directArrival_s], ...
                "hasTerminalCapture", false, ...
                "terminalVelocity_deg_s", [0 0], ...
                "terminalAcceleration_deg_s2", [0 0], ...
                "angularPathLength_deg", hypot( ...
                directDelta_deg(1), directDelta_deg(2)));
        end
        directProfile = makeRouteProfile( ...
            directRoute, startState.time_s, stopState.time_s, ...
            options.SampleTime_s, limits, options);
        directValidationProfile = makeRouteProfile( ...
            directRoute, startState.time_s, stopState.time_s, ...
            options.ValidationStep_s, limits, options);
        directBlocked = queryAzElTimeObstacle(obstacleField, ...
            [directValidationProfile.position_deg(:, 1); ...
            directProfile.position_deg(:, 1)], ...
            [directValidationProfile.position_deg(:, 2); ...
            directProfile.position_deg(:, 2)], ...
            [directValidationProfile.time_s; directProfile.time_s], ...
            collisionOptions(options));
        directFound = ~any(directBlocked);
        if ~directFound
            directRoute = struct();
            directProfile = struct();
        end
    end
end
if directFound && options.Objective == "minimumAngularDistance"
    result = struct( ...
        "Success", true, ...
        "Message", ...
        "A direct wait-and-slew trajectory certifies the global " + ...
        "minimum angular distance.", ...
        "Method", "directSafeIntervalCertificate", ...
        "Route", directRoute, ...
        "Profile", directProfile, ...
        "ExpandedNodeCount", 0, ...
        "GeneratedNodeCount", 1, ...
        "SafeIntervalQueryCount", safeQueryCount, ...
        "SafeIntervalCacheCount", safeCache.Count, ...
        "EventTimeCount", numel(eventTimes), ...
        "EventTimes_s", eventTimes, ...
        "SearchElapsed_s", toc(dynamicSearchTimer), ...
        "TerminationReason", "globalAngularCertificate", ...
        "BlockedValidationSampleCount", 0, ...
        "GlobalAngularOptimal", true, ...
        "Options", options);
    return;
end

%% Section 4: Define Allowed Moves And Create The First Search State
% Motion primitives are the reusable step directions and distances available
% from a grid point. Each new search node stores a position, one safe interval,
% its earliest arrival, and enough parent information to explain that arrival.
primitiveRadii_deg = unique(double(options.PrimitiveRadii_deg(:)));
primitiveAngles_rad = deg2rad((0:options.DirectionStep_deg: ...
    360 - options.DirectionStep_deg).');
offsets = zeros( ...
    numel(primitiveRadii_deg) * numel(primitiveAngles_rad), 2);
offsetCursor = 1;
for primitiveRadius_deg = reshape(primitiveRadii_deg, 1, [])
    primitiveDirectionCount = numel(primitiveAngles_rad);
    directionRows = offsetCursor: ...
        offsetCursor + primitiveDirectionCount - 1;
    offsets(directionRows, :) = primitiveRadius_deg * [ ...
        cos(primitiveAngles_rad), sin(primitiveAngles_rad)];
    offsetCursor = offsetCursor + primitiveDirectionCount;
end
offsets = unique(round(offsets * 1e9) / 1e9, "rows", "stable");
% One node represents one place during one safe span. The stored arrival time
% answers, "What is the earliest safe time we know how to be here?"
nodeCapacity = options.InitialNodeCapacity;
nodes = struct( ...
    "PositionDeg", zeros(nodeCapacity, 2), ...
    "IntervalIndex", zeros(nodeCapacity, 1), ...
    "ArrivalTime_s", inf(nodeCapacity, 1), ...
    "ParentIndex", zeros(nodeCapacity, 1, "uint32"), ...
    "DepartureTime_s", nan(nodeCapacity, 1), ...
    "MotionDuration_s", zeros(nodeCapacity, 1), ...
    "Count", 0);
startKey = stateKey( ...
    startState.position_deg, startSafeIntervalIndex, limits, options);
[nodes, startIndex] = appendNode(nodes, ...
    startState.position_deg, startSafeIntervalIndex, startState.time_s, ...
    0, NaN, 0);
bestNodeByStateKey = containers.Map( ...
    'KeyType', 'char', 'ValueType', 'double');
bestNodeByStateKey(startKey) = startIndex;
arrivalFrontier = struct( ...
    "Node", zeros(nodeCapacity, 1, "uint32"), ...
    "ArrivalTime_s", inf(nodeCapacity, 1), ...
    "Serial", zeros(nodeCapacity, 1, "uint64"), ...
    "Count", 0, ...
    "NextSerial", uint64(0));
arrivalFrontier = pushArrivalFrontier( ...
    arrivalFrontier, startIndex, startState.time_s);

%% Section 5: Visit Reachable States In Earliest-Arrival Order
% This is the heart of dynamic Dijkstra. Repeatedly take the unfinished state
% with the earliest arrival, try every allowed neighboring position, find a
% safe departure/arrival pair, and keep the result only when it improves the
% best arrival previously known for that same place and safe interval.
expandedNodeCount = 0;
generatedNodeCount = 1;
goalIndex = 0;
while arrivalFrontier.Count > 0
    if toc(dynamicSearchTimer) >= options.MaxSearchTime_s
        result = failedResult( ...
            "Safe-interval Dijkstra reached its wall-time limit.", ...
            eventTimes, safeCache, safeQueryCount, ...
            toc(dynamicSearchTimer), options);
        result.ExpandedNodeCount = expandedNodeCount;
        result.GeneratedNodeCount = generatedNodeCount;
        result.TerminationReason = "wallTimeLimit";
        return;
    end
    if expandedNodeCount >= options.MaxExpansions
        result = failedResult( ...
            "Safe-interval Dijkstra reached its expansion limit.", ...
            eventTimes, safeCache, safeQueryCount, ...
            toc(dynamicSearchTimer), options);
        result.ExpandedNodeCount = expandedNodeCount;
        result.GeneratedNodeCount = generatedNodeCount;
        result.TerminationReason = "expansionLimit";
        return;
    end

    [arrivalFrontier, currentNodeIndex] = popArrivalFrontier( ...
        arrivalFrontier);
    currentPosition_deg = nodes.PositionDeg(currentNodeIndex, :);
    currentSafeIntervalIndex = nodes.IntervalIndex(currentNodeIndex);
    currentKey = stateKey( ...
        currentPosition_deg, currentSafeIntervalIndex, limits, options);
    % A better arrival is added as a new record instead of editing an older
    % to-do item in place. If that old item reaches the front later, this
    % check recognizes that a better explanation already exists and skips it.
    if ~isKey(bestNodeByStateKey, currentKey) || ...
            bestNodeByStateKey(currentKey) ~= currentNodeIndex
        continue;
    end

    if samePosition( ...
            currentPosition_deg, stopState.position_deg, ...
            limits, options) && ...
            currentSafeIntervalIndex == goalSafeIntervalIndex
        goalIndex = currentNodeIndex;
        break;
    end

    expandedNodeCount = expandedNodeCount + 1;
    [currentIntervals, safeCache, safeQueryCount] = safeIntervalsAt( ...
        currentPosition_deg, obstacleField, eventTimes, limits, options, ...
        safeCache, safeQueryCount);
    currentSafeInterval_s = currentIntervals( ...
        currentSafeIntervalIndex, :);

    % --- List The Places Reachable By One Allowed Move -----------------
    candidatePositions_deg = currentPosition_deg + offsets;
    candidatePositions_deg(:, 1) = round(( ...
        candidatePositions_deg(:, 1) - limits.azimuth_deg(1)) / ...
        options.GridStep_deg) * options.GridStep_deg + ...
        limits.azimuth_deg(1);
    candidatePositions_deg(:, 1) = canonicalAzimuth( ...
        candidatePositions_deg(:, 1), limits, options);
    candidatePositions_deg(:, 2) = round(( ...
        candidatePositions_deg(:, 2) - limits.elevation_deg(1)) / ...
        options.GridStep_deg) * options.GridStep_deg + ...
        limits.elevation_deg(1);
    minimumElevation_deg = limits.elevation_deg(1) - 1e-9;
    maximumElevation_deg = limits.elevation_deg(2) + 1e-9;
    isInsideElevationLimits = candidatePositions_deg(:, 2) >= minimumElevation_deg & ...
        candidatePositions_deg(:, 2) <= maximumElevation_deg;
    if ~options.AllowAzimuthWrap
        minimumAzimuth_deg = limits.azimuth_deg(1) - 1e-9;
        maximumAzimuth_deg = limits.azimuth_deg(2) + 1e-9;
        isInsideAzimuthLimits = candidatePositions_deg(:, 1) >= minimumAzimuth_deg & ...
            candidatePositions_deg(:, 1) <= maximumAzimuth_deg;
        isInsideElevationLimits = isInsideElevationLimits & ...
            isInsideAzimuthLimits;
    end
    validPrimitivePositions_deg = candidatePositions_deg( ...
        isInsideElevationLimits, :);
    candidatePositions_deg = zeros( ...
        size(validPrimitivePositions_deg, 1) + 1, 2);
    candidatePositions_deg(1:end - 1, :) = validPrimitivePositions_deg;
    candidatePositions_deg(end, :) = stopState.position_deg;
    candidatePositions_deg = unique( ...
        round(candidatePositions_deg * 1e9) / 1e9, "rows", "stable");
    candidateIsCurrentPosition = false( ...
        size(candidatePositions_deg, 1), 1);
    for candidateRowIndex = 1:size(candidatePositions_deg, 1)
        candidateIsCurrentPosition(candidateRowIndex) = samePosition( ...
            currentPosition_deg, ...
            candidatePositions_deg(candidateRowIndex, :), ...
            limits, options);
    end
    candidatePositions_deg = candidatePositions_deg( ...
        ~candidateIsCurrentPosition, :);

    % Each candidate place may have several separate safe intervals. Treat
    % each interval as a different state because arriving between two visits
    % of a moving obstacle is not equivalent to arriving after both visits.
    for candidatePositionIndex = 1:size(candidatePositions_deg, 1)
        candidatePosition_deg = candidatePositions_deg( ...
            candidatePositionIndex, :);
        transitionDelta_deg = wrappedDelta( ...
            currentPosition_deg, candidatePosition_deg, limits, options);
        candidateIsTerminalCapture = hasTerminalDynamics && ...
            samePosition(candidatePosition_deg, ...
            stopState.position_deg, limits, options);
        % Ordinary moves begin and end at rest, which keeps intermediate
        % states small and easy to compare. Only the last rendezvous move may
        % finish with the target's requested velocity and acceleration.
        if candidateIsTerminalCapture
            motionDuration_s = NaN;
            motion = struct();
        else
            [motionDuration_s, motion] = segmentMotion( ...
                transitionDelta_deg, limits);
            if motionDuration_s <= 1e-12
                continue;
            end
        end
        [candidateSafeIntervals_s, safeCache, safeQueryCount] = safeIntervalsAt( ...
            candidatePosition_deg, obstacleField, ...
            eventTimes, limits, options, safeCache, safeQueryCount);
        if isempty(candidateSafeIntervals_s)
            continue;
        end

        % --- Find A Safe Time For The Move, Then Record An Improvement ---
        for candidateSafeIntervalIndex = 1:size(candidateSafeIntervals_s, 1)
            candidateSafeInterval_s = candidateSafeIntervals_s( ...
                candidateSafeIntervalIndex, :);
            if samePosition(candidatePosition_deg, ...
                    stopState.position_deg, limits, options) && ...
                    candidateSafeIntervalIndex ~= goalSafeIntervalIndex
                continue;
            end
            if candidateIsTerminalCapture
                % The final rendezvous is the one deliberately detailed case
                % in this loop. The goal fixes arrival time, position, rate,
                % and acceleration. We therefore try a bounded, reproducible
                % list of departure times, build the complete smooth motion
                % for each, and accept the first one that respects dynamics,
                % field limits, and every sampled obstacle polygon.
                transitionIsScheduled = false;
                departureTime_s = NaN;
                arrivalTime_s = NaN;
                motionDuration_s = NaN;
                candidateSafeStart_s = candidateSafeInterval_s(1) - 1e-9;
                candidateSafeEnd_s = candidateSafeInterval_s(2) + 1e-9;
                goalInsideCandidateInterval = ...
                    stopState.time_s >= candidateSafeStart_s && ...
                    stopState.time_s <= candidateSafeEnd_s;
                earliestTerminalDeparture_s = max( ...
                    nodes.ArrivalTime_s(currentNodeIndex), ...
                    currentSafeInterval_s(1));
                latestTerminalDeparture_s = min( ...
                    currentSafeInterval_s(2), stopState.time_s - 1e-6);
                terminalWindowIsOrdered = ...
                    latestTerminalDeparture_s >= ...
                    earliestTerminalDeparture_s;
                if goalInsideCandidateInterval && terminalWindowIsOrdered
                    % Obstacle event times are natural departure candidates;
                    % evenly spaced trials protect against a valid departure
                    % that falls between events. The configured cap prevents
                    % one final edge from consuming the whole search budget.
                    terminalEventCandidates_s = eventTimes( ...
                        eventTimes >= earliestTerminalDeparture_s & ...
                        eventTimes <= latestTerminalDeparture_s);
                    uniformTerminalTrialCount = min( ...
                        options.MaximumDepartureTrials, 16);
                    uniformTerminalCandidates_s = linspace( ...
                        earliestTerminalDeparture_s, ...
                        latestTerminalDeparture_s, ...
                        uniformTerminalTrialCount).';
                    terminalDepartureCandidates_s = unique([ ...
                        earliestTerminalDeparture_s; ...
                        terminalEventCandidates_s; ...
                        uniformTerminalCandidates_s; ...
                        latestTerminalDeparture_s]);
                    if numel(terminalDepartureCandidates_s) > ...
                            options.MaximumDepartureTrials
                        retainedTerminalTrials = unique(round(linspace( ...
                            1, numel(terminalDepartureCandidates_s), ...
                            options.MaximumDepartureTrials)));
                        terminalDepartureCandidates_s = ...
                            terminalDepartureCandidates_s( ...
                            retainedTerminalTrials);
                    end
                    for terminalTrialIndex = 1:numel( ...
                            terminalDepartureCandidates_s)
                        trialDeparture_s = terminalDepartureCandidates_s( ...
                            terminalTrialIndex);
                        trialDuration_s = stopState.time_s - ...
                            trialDeparture_s;
                        maximumVelocity_deg_s = limits.maxVelocity_deg_s + 1e-9;
                        maximumAcceleration_deg_s2 = ...
                            limits.maxAcceleration_deg_s2 + 1e-9;
                        terminalVelocityIsValid = all(abs( ...
                            stopState.velocity_deg_s) <= maximumVelocity_deg_s);
                        terminalAccelerationMagnitude_deg_s2 = ...
                            abs(stopState.acceleration_deg_s2);
                        terminalAccelerationIsValid = all( ...
                            terminalAccelerationMagnitude_deg_s2 <= ...
                            maximumAcceleration_deg_s2);
                        terminalDynamicsInsideLimits = trialDuration_s > 0 && ...
                            terminalVelocityIsValid && ...
                            terminalAccelerationIsValid;
                        if ~terminalDynamicsInsideLimits
                            continue;
                        end
                        % A quintic boundary profile is the smooth curve that
                        % can satisfy position, rate, and acceleration at both
                        % ends. Sampling it here verifies the full curve, not
                        % just its endpoint values.
                        terminalDelta_deg = wrappedDelta( ...
                            currentPosition_deg, stopState.position_deg, ...
                            limits, options);
                        terminalStopPosition_deg = currentPosition_deg + ...
                            terminalDelta_deg;
                        terminalCheckStep_s = min( ...
                            options.CollisionCheckStep_s, ...
                            options.ValidationStep_s);
                        terminalSampleCount = max(21, ...
                            ceil(trialDuration_s / ...
                            terminalCheckStep_s) + 1);
                        terminalElapsed_s = linspace( ...
                            0, trialDuration_s, ...
                            terminalSampleCount).';
                        terminalProfile = evaluateAzElBoundaryProfile( ...
                            currentPosition_deg, [0 0], [0 0], ...
                            terminalStopPosition_deg, ...
                            stopState.velocity_deg_s, ...
                            stopState.acceleration_deg_s2, ...
                            trialDuration_s, terminalElapsed_s);
                        terminalRateExceeded = any(abs( ...
                            terminalProfile.velocity_deg_s) > ...
                            limits.maxVelocity_deg_s + 1e-9, "all");
                        terminalAccelerationExceeded = any(abs( ...
                            terminalProfile.acceleration_deg_s2) > ...
                            limits.maxAcceleration_deg_s2 + 1e-9, "all");
                        if terminalRateExceeded || ...
                                terminalAccelerationExceeded
                            continue;
                        end
                        terminalPosition_deg = terminalProfile.position_deg;
                        minimumElevation_deg = limits.elevation_deg(1) - 1e-9;
                        maximumElevation_deg = limits.elevation_deg(2) + 1e-9;
                        aboveMinimumElevation = ...
                            terminalPosition_deg(:, 2) >= ...
                            minimumElevation_deg;
                        belowMaximumElevation = ...
                            terminalPosition_deg(:, 2) <= ...
                            maximumElevation_deg;
                        terminalInsideLimits = aboveMinimumElevation & ...
                            belowMaximumElevation;
                        if ~options.AllowAzimuthWrap
                            minimumAzimuth_deg = limits.azimuth_deg(1) - 1e-9;
                            maximumAzimuth_deg = limits.azimuth_deg(2) + 1e-9;
                            aboveMinimumAzimuth = ...
                                terminalPosition_deg(:, 1) >= ...
                                minimumAzimuth_deg;
                            belowMaximumAzimuth = ...
                                terminalPosition_deg(:, 1) <= ...
                                maximumAzimuth_deg;
                            terminalInsideLimits = terminalInsideLimits & ...
                                aboveMinimumAzimuth & belowMaximumAzimuth;
                        end
                        if ~all(terminalInsideLimits)
                            continue;
                        end
                        terminalQueryPosition_deg = terminalPosition_deg;
                        terminalQueryPosition_deg(:, 1) = canonicalAzimuth( ...
                            terminalQueryPosition_deg(:, 1), ...
                            limits, options);
                        terminalBlocked = queryAzElTimeObstacle( ...
                            obstacleField, ...
                            terminalQueryPosition_deg(:, 1), ...
                            terminalQueryPosition_deg(:, 2), ...
                            trialDeparture_s + terminalElapsed_s, ...
                            collisionOptions(options));
                        if ~any(terminalBlocked)
                            transitionIsScheduled = true;
                            departureTime_s = trialDeparture_s;
                            arrivalTime_s = stopState.time_s;
                            motionDuration_s = trialDuration_s;
                            break;
                        end
                    end
                end
            else
                % Ordinary rest-to-rest moves use the shared scheduler. It
                % may wait at the current point before starting the slew.
                [transitionIsScheduled, departureTime_s, arrivalTime_s] = scheduleTransition( ...
                    obstacleField, ...
                    currentPosition_deg, transitionDelta_deg, ...
                    nodes.ArrivalTime_s(currentNodeIndex), ...
                    currentSafeInterval_s, candidateSafeInterval_s, ...
                    motionDuration_s, motion, eventTimes, limits, options);
            end
            % A scheduled transition includes any safe wait at its parent.
            % It is useful only if the move finishes before the mission ends.
            if ~transitionIsScheduled || ...
                    arrivalTime_s > stopState.time_s + 1e-9
                continue;
            end

            candidateKey = stateKey( ...
                candidatePosition_deg, candidateSafeIntervalIndex, ...
                limits, options);
            bestKnownArrivalTime_s = Inf;
            if isKey(bestNodeByStateKey, candidateKey)
                previousBestNodeIndex = bestNodeByStateKey(candidateKey);
                bestKnownArrivalTime_s = nodes.ArrivalTime_s( ...
                    previousBestNodeIndex);
            end
            candidateImprovesArrivalLabel = arrivalTime_s < ...
                bestKnownArrivalTime_s - 1e-9;
            if ~candidateImprovesArrivalLabel
                continue;
            end
            % Even a locally improved arrival is discarded when the fastest
            % physically possible remaining move cannot meet the deadline.
            % This is only a feasibility check; it never changes queue order.
            remainingDelta_deg = wrappedDelta( ...
                candidatePosition_deg, stopState.position_deg, ...
                limits, options);
            if hasTerminalDynamics
                minimumRemainingTravelTime_s = max( ...
                    abs(remainingDelta_deg) ./ limits.maxVelocity_deg_s);
            else
                [minimumRemainingTravelTime_s, ~] = segmentMotion( ...
                    remainingDelta_deg, limits);
            end
            if arrivalTime_s + minimumRemainingTravelTime_s > ...
                    stopState.time_s + 1e-9
                continue;
            end

            % This candidate is now the clearest known explanation for how
            % to reach the state. Save its parent and exact wait/move timing
            % so the final report can reconstruct the command later.
            [nodes, nextNodeIndex] = appendNode(nodes, ...
                candidatePosition_deg, candidateSafeIntervalIndex, ...
                arrivalTime_s, currentNodeIndex, departureTime_s, ...
                motionDuration_s);
            bestNodeByStateKey(candidateKey) = nextNodeIndex;
            generatedNodeCount = generatedNodeCount + 1;
            % The to-do list is ordered only by actual arrival time. The
            % remaining-time calculation above is a reject test, not a hidden
            % heuristic, so the search remains Dijkstra rather than A*.
            arrivalFrontier = pushArrivalFrontier( ...
                arrivalFrontier, nextNodeIndex, arrivalTime_s);
        end
    end
end

%% Section 6: Explain Why No State Reached The Goal
% Emptying the to-do list means every reachable state was considered. Keep
% the event timeline, cache counts, and node totals so a failed run still
% explains how much of the problem was explored.
if goalIndex == 0
    result = failedResult( ...
        "No safe-interval Dijkstra path reaches the stop state.", ...
        eventTimes, safeCache, safeQueryCount, ...
        toc(dynamicSearchTimer), options);
    result.ExpandedNodeCount = expandedNodeCount;
    result.GeneratedNodeCount = generatedNodeCount;
    result.TerminationReason = "noPath";
    return;
end

%% Section 7: Follow The Winning Receipts Back To The Start
% Each improved state saved the parent that produced it. Walk those links
% backward from the goal, reverse the list, and recover every arrival,
% departure, wait, and motion duration in chronological order.
nodePath = zeros(128, 1, "uint32");
nodePathCount = 0;
pathNodeIndex = uint32(goalIndex);
while pathNodeIndex ~= 0
    nodePathCount = nodePathCount + 1;
    if nodePathCount > numel(nodePath)
        nodePath(2 * numel(nodePath), 1) = 0;
    end
    nodePath(nodePathCount) = pathNodeIndex;
    pathNodeIndex = nodes.ParentIndex(pathNodeIndex);
end
nodePath = double(flipud(nodePath(1:nodePathCount)));
routePosition_deg = nodes.PositionDeg(nodePath, :);
routeArrivalTime_s = nodes.ArrivalTime_s(nodePath);
routeDepartureTime_s = nan(numel(nodePath), 1);
routeMotionDuration_s = zeros(numel(nodePath), 1);
for routeEdgeIndex = 1:numel(nodePath) - 1
    childNodeIndex = nodePath(routeEdgeIndex + 1);
    routeDepartureTime_s(routeEdgeIndex) = nodes.DepartureTime_s( ...
        childNodeIndex);
    routeMotionDuration_s(routeEdgeIndex) = nodes.MotionDuration_s( ...
        childNodeIndex);
end
routeDepartureTime_s(end) = stopState.time_s;

%% Section 8: Convert Decisions Into A Continuous Command History
% Canonical azimuth may jump from +180 to -180 even though the boresight made
% a small seam crossing. Build an unwrapped copy for derivatives and distance,
% then sample every wait and slew on the regular output and validation clocks.
routePositionUnwrapped_deg = routePosition_deg;
routePositionUnwrapped_deg(1, :) = startState.position_deg;
% Canonical positions may jump at the azimuth seam. The unwrapped copy
% cannot, because it drives both motion derivatives and path length.
for routeNodeIndex = 2:size(routePosition_deg, 1)
    routeStep_deg = wrappedDelta( ...
        routePositionUnwrapped_deg(routeNodeIndex - 1, :), ...
        routePosition_deg(routeNodeIndex, :), limits, options);
    routePositionUnwrapped_deg(routeNodeIndex, :) = routePositionUnwrapped_deg( ...
        routeNodeIndex - 1, :) + routeStep_deg;
end
if size(routePositionUnwrapped_deg, 1) == 1
    routePositionUnwrapped_deg(end, :) = stopState.position_deg;
else
    finalRouteStep_deg = wrappedDelta( ...
        routePositionUnwrapped_deg(end - 1, :), ...
        stopState.position_deg, limits, options);
    routePositionUnwrapped_deg(end, :) = routePositionUnwrapped_deg( ...
        end - 1, :) + finalRouteStep_deg;
end
routePosition_deg(:, 1) = canonicalAzimuth( ...
    routePositionUnwrapped_deg(:, 1), limits, options);
routePosition_deg(:, 2) = routePositionUnwrapped_deg(:, 2);
hasTerminalCapture = options.AllowNonzeroTerminalState && ...
    any(abs([stopState.velocity_deg_s, ...
    stopState.acceleration_deg_s2]) > 1e-12);
route = struct( ...
    "position_deg", routePosition_deg, ...
    "positionUnwrapped_deg", routePositionUnwrapped_deg, ...
    "arrivalTime_s", routeArrivalTime_s, ...
    "departureTime_s", routeDepartureTime_s, ...
    "motionDuration_s", routeMotionDuration_s, ...
    "waitingDuration_s", max( ...
    0, routeDepartureTime_s - routeArrivalTime_s), ...
    "hasTerminalCapture", hasTerminalCapture, ...
    "terminalVelocity_deg_s", stopState.velocity_deg_s, ...
    "terminalAcceleration_deg_s2", stopState.acceleration_deg_s2, ...
    "angularPathLength_deg", sum(hypot( ...
    diff(routePositionUnwrapped_deg(:, 1)), ...
    diff(routePositionUnwrapped_deg(:, 2)))));
profile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.SampleTime_s, limits, options);
validationProfile = makeRouteProfile( ...
    route, startState.time_s, stopState.time_s, ...
    options.ValidationStep_s, limits, options);
route.angularPathLength_deg = sum(hypot( ...
    diff(validationProfile.positionUnwrapped_deg(:, 1)), ...
    diff(validationProfile.positionUnwrapped_deg(:, 2))));

%% Section 9: Perform The Independent Final Collision Check
% Safe intervals and edge checks helped construct the route, but they are not
% the final authority. Recheck both the fine validation samples and the exact
% samples returned to the caller against the original packed polygons.
blocked = queryAzElTimeObstacle(obstacleField, ...
    [validationProfile.position_deg(:, 1); profile.position_deg(:, 1)], ...
    [validationProfile.position_deg(:, 2); profile.position_deg(:, 2)], ...
    [validationProfile.time_s; profile.time_s], ...
    collisionOptions(options));
% Safe intervals guide the graph search; the packed polygons remain the
% authority. Validate both the fine safety grid and the returned sample grid.
if any(blocked)
    result = failedResult( ...
        sprintf('Safe-interval Dijkstra failed dense validation at %d samples.', ...
        nnz(blocked)), eventTimes, safeCache, ...
        safeQueryCount, toc(dynamicSearchTimer), options);
    result.ExpandedNodeCount = expandedNodeCount;
    result.GeneratedNodeCount = generatedNodeCount;
    result.TerminationReason = "denseValidationFailed";
    result.Route = route;
    result.Profile = profile;
    result.BlockedValidationSampleCount = nnz(blocked);
    return;
end

%% Section 10: Write The Dynamic Search Report
% Return the continuous command together with the event calendar, cache use,
% node counts, stop reason, and resolved options needed to reproduce it.
result = struct( ...
    "Success", true, ...
    "Message", "Dynamic safe-interval Dijkstra path found and validated.", ...
    "Method", "adaptiveSafeIntervalDijkstra", ...
    "Route", route, ...
    "Profile", profile, ...
    "ExpandedNodeCount", expandedNodeCount, ...
    "GeneratedNodeCount", generatedNodeCount, ...
    "SafeIntervalQueryCount", safeQueryCount, ...
    "SafeIntervalCacheCount", safeCache.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", toc(dynamicSearchTimer), ...
    "TerminationReason", "goalReached", ...
    "BlockedValidationSampleCount", 0, ...
    "GlobalAngularOptimal", false, ...
    "Options", options);
end

function [safeIntervals_s, safeIntervalCache, collisionQueryCount] = ...
        safeIntervalsAt(currentPosition_deg, obstacleField, ...
        obstacleEventTimes_s, limits, options, safeIntervalCache, ...
        collisionQueryCount)
%% Section 0: Header & Readme
% SYNTAX
%   [safeIntervals_s, safeIntervalCache, collisionQueryCount] = ...
%       safeIntervalsAt(currentPosition_deg, obstacleField, ...
%       obstacleEventTimes_s, limits, options, safeIntervalCache, ...
%       collisionQueryCount)
%**************************************************************************
% PURPOSE
%   - Classify and cache maximal safe time intervals at one position.
%**************************************************************************
% INPUTS
%   - currentPosition_deg (numeric two-vector)
%       The azimuth/elevation location whose safe times are needed.
%   - obstacleField, obstacleEventTimes_s, limits, options
%       The obstacle description, times worth checking, motion limits, and
%       collision-check settings.
%   - safeIntervalCache, collisionQueryCount (diagnostic state)
%       Previously answered position queries and the running query count.
%**************************************************************************
% OUTPUTS
%   - safeIntervals_s (numeric N-by-2 matrix)
%       Start and stop time of every safe period at this position.
%   - safeIntervalCache, collisionQueryCount (updated diagnostic state)
%       The shared cache and count after answering this query.
%**************************************************************************
% UNITS
%   - Position is degrees; intervals and event times are seconds.
% Think of this function as filling in one row of a calendar. It asks which
% listed times are blocked, joins consecutive safe times into periods, and
% remembers the answer. Start, goal, and expanded nodes all use this same
% calendar, so the planner cannot disagree with itself about one position.
positionCacheKey = positionKey(currentPosition_deg, limits, options);
if isKey(safeIntervalCache, positionCacheKey)
    % Reusing this answer is both faster and more consistent than asking the
    % obstacle model the same question again later in the search.
    safeIntervals_s = safeIntervalCache(positionCacheKey);
    return;
end
isBlockedAtEventTime = queryAzElTimeObstacle(obstacleField, ...
    repmat(canonicalAzimuth(currentPosition_deg(1), limits, options), ...
    numel(obstacleEventTimes_s), 1), ...
    repmat(currentPosition_deg(2), numel(obstacleEventTimes_s), 1), ...
    obstacleEventTimes_s, collisionOptions(options));
isSafeAtEventTime = ~isBlockedAtEventTime(:);

% A long row of individual true/false answers is hard for the search to use.
% The changes below turn, for example, five consecutive safe samples into
% one interval that says "waiting here is allowed from time A through B."
safeStateChanges = diff([false; isSafeAtEventTime; false]);
safeIntervalStartIndices = find(safeStateChanges == 1);
safeIntervalStopIndices = find(safeStateChanges == -1) - 1;
safeIntervals_s = [ ...
    obstacleEventTimes_s(safeIntervalStartIndices), ...
    obstacleEventTimes_s(safeIntervalStopIndices)]; %#ok<FNDSB>
safeIntervalCache(positionCacheKey) = safeIntervals_s;
collisionQueryCount = collisionQueryCount + numel(obstacleEventTimes_s);
end

function [scheduled, departure, arrival] = scheduleTransition( ...
        obstacleField, startPosition, delta, currentArrival, currentSafe, ...
        candidateSafe, duration, motion, eventTimes, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   [scheduled, departure, arrival] = scheduleTransition( ...
%       obstacleField, startPosition, delta, currentArrival, ...
%       currentSafe, candidateSafe, duration, motion, ...
%       eventTimes, limits, options)
%**************************************************************************
% PURPOSE
%   - Find the earliest collision-free departure for one motion primitive.
%**************************************************************************
% INPUTS
%   - obstacleField, startPosition, delta, motion (motion inputs)
%       Geometry and analytic primitive definition.
%   - timing arguments, eventTimes, limits, options (search inputs)
%       Safe windows, duration, event grid, limits, and controls.
%**************************************************************************
% OUTPUTS
%   - scheduled (logical scalar)
%       True when a feasible departure exists.
%   - departure, arrival (numeric scalars)
%       Selected transition times, or NaN on failure.
%**************************************************************************
% UNITS
%   - Position/delta are degrees and all timing arguments are seconds.
% This helper answers one practical question: "If we are allowed to wait at
% the current point, when is the earliest safe time to start this move?"
% The direct-path check and the full Dijkstra search both ask that question
% here, so they cannot silently apply different waiting or collision rules.
earliestDeparture_s = max(currentArrival, candidateSafe(1) - duration);
latestDeparture_s = min(currentSafe(2), candidateSafe(2) - duration);
% Leaving before this window would reach the next point too early. Leaving
% after it would overstay one of the two safe periods.
if latestDeparture_s < earliestDeparture_s - 1e-9
    scheduled = false;
    departure = NaN;
    arrival = NaN;
    return;
end

departureCandidates_s = eventTimes( ...
    eventTimes >= earliestDeparture_s & eventTimes <= latestDeparture_s);
% Obstacle event times and the two window edges are the useful departure
% candidates because obstacle safety can change there. The cap keeps one
% difficult edge from consuming the planner's entire time budget.
departureCandidates_s = unique( ...
    [earliestDeparture_s; departureCandidates_s; latestDeparture_s]);
if numel(departureCandidates_s) > options.MaximumDepartureTrials
    retainedCandidateIndices = unique(round(linspace( ...
        1, numel(departureCandidates_s), options.MaximumDepartureTrials)));
    departureCandidates_s = departureCandidates_s(retainedCandidateIndices);
end
scheduled = false;
departure = NaN;
arrival = NaN;
batchSize = options.DepartureBatchSize;
for batchStartIndex = 1:batchSize:numel(departureCandidates_s)
    % Several departures are packed into one obstacle query for speed. They
    % are still considered in chronological order, so the first safe answer
    % is also the earliest safe departure represented by this search.
    candidateIndices = batchStartIndex:min( ...
        batchStartIndex + batchSize - 1, numel(departureCandidates_s));
    trialDepartures_s = departureCandidates_s(candidateIndices);
    trialCount = numel(trialDepartures_s);
    trialAzimuth_deg = cell(trialCount, 1);
    trialElevation_deg = cell(trialCount, 1);
    trialTime_s = cell(trialCount, 1);
    trialOwner = cell(trialCount, 1);
    relativeSampleCount = max(2, ...
        ceil(duration / options.CollisionCheckStep_s) + 1);
    regularElapsed_s = linspace(0, duration, relativeSampleCount).';
    for trialIndex = 1:trialCount
        trialDeparture_s = trialDepartures_s(trialIndex);
        trialArrival_s = trialDeparture_s + duration;
        missionAlignedTimes_s = [ ...
            alignedTimes(trialDeparture_s, trialArrival_s, ...
            options.ValidationStep_s, eventTimes(1)); ...
            alignedTimes(trialDeparture_s, trialArrival_s, ...
            options.SampleTime_s, eventTimes(1))];
        % One time grid follows the move itself and two grids follow the
        % mission clock. Using both makes it less likely that repeated sample
        % spacing will always step over the same brief obstacle crossing.
        trialElapsed_s = unique([ ...
            regularElapsed_s; missionAlignedTimes_s - trialDeparture_s]);
        [trialProgress, ~, ~] = segmentProgress( ...
            trialElapsed_s, duration, motion);
        trialUnwrappedAzimuth_deg = startPosition(1) + ...
            trialProgress * delta(1);
        trialAzimuth_deg{trialIndex} = canonicalAzimuth( ...
            trialUnwrappedAzimuth_deg, limits, options);
        trialElevation_deg{trialIndex} = startPosition(2) + ...
            trialProgress * delta(2);
        trialTime_s{trialIndex} = trialDeparture_s + trialElapsed_s;
        trialOwner{trialIndex} = repmat( ...
            trialIndex, numel(trialElapsed_s), 1);
    end
    packedTrialAzimuth_deg = vertcat(trialAzimuth_deg{:});
    packedTrialElevation_deg = vertcat(trialElevation_deg{:});
    packedTrialTime_s = vertcat(trialTime_s{:});
    packedTrialOwner = vertcat(trialOwner{:});
    trialBlocked = queryAzElTimeObstacle( ...
        obstacleField, packedTrialAzimuth_deg, ...
        packedTrialElevation_deg, ...
        packedTrialTime_s, collisionOptions(options));
    collisionFreeCandidate = true(trialCount, 1);
    collisionFreeCandidate(unique( ...
        packedTrialOwner(trialBlocked))) = false;
    firstFreeCandidateInBatch = find(collisionFreeCandidate, 1);
    if ~isempty(firstFreeCandidateInBatch)
        % Candidates and batches are ordered from earliest to latest. We can
        % therefore stop as soon as this first collision-free move is found.
        scheduled = true;
        departure = departureCandidates_s( ...
            candidateIndices(firstFreeCandidateInBatch));
        arrival = departure + duration;
        return;
    end
end
end

function times = alignedTimes(firstTime_s, lastTime_s, step_s, originTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   times = alignedTimes(firstTime_s, lastTime_s, step_s, originTime_s)
%**************************************************************************
% PURPOSE
%   - Select mission-clock samples inside one inclusive time interval.
%**************************************************************************
% INPUTS
%   - firstTime_s, lastTime_s, step_s, originTime_s (numeric scalars)
%       Interval, grid spacing, and grid origin.
%**************************************************************************
% OUTPUTS
%   - times (numeric column vector)
%       Aligned samples inside the interval.
%**************************************************************************
% UNITS
%   - All inputs and output are seconds.
% Every edge validator uses the same mission clock phase; duplicating this
% rounding logic would reopen sample-grid aliasing gaps.
firstIndex = ceil((firstTime_s - originTime_s) / step_s - 1e-10);
lastIndex = floor((lastTime_s - originTime_s) / step_s + 1e-10);
if lastIndex < firstIndex
    times = zeros(0, 1);
else
    times = originTime_s + (firstIndex:lastIndex).' * step_s;
end
end

function profile = makeRouteProfile( ...
        route, startTime_s, stopTime_s, sampleStep_s, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   profile = makeRouteProfile( ...
%       route, startTime_s, stopTime_s, sampleStep_s, limits, options)
%**************************************************************************
% PURPOSE
%   - Reconstruct a safe-interval route on a requested uniform sample grid.
%**************************************************************************
% INPUTS
%   - route (scalar struct)
%       Waypoints, arrivals, departures, and terminal dynamics.
%   - startTime_s, stopTime_s, sampleStep_s (numeric scalars)
%       Output horizon and spacing.
%   - limits, options (scalar structs)
%       Dynamic limits and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Sampled position, velocity, acceleration, and waiting state.
%**************************************************************************
% UNITS
%   - Angles are degrees and timing arguments are seconds.
% The route is a compact list of decisions: arrive here, wait until this
% time, then move to the next point. This function expands those decisions
% into the row-by-row command that downstream code can plot, validate, or
% execute. The regular output and the denser safety check both use this
% function, so they reconstruct exactly the same waits and moves.

% Chapter 1: Build the requested report times, including the exact stop.
sampleTime_s = (startTime_s:sampleStep_s:stopTime_s).';
if sampleTime_s(end) < stopTime_s - 1e-9
    sampleTime_s(end + 1, 1) = stopTime_s;
else
    sampleTime_s(end) = stopTime_s;
end
sampleCount = numel(sampleTime_s);
sampledPositionUnwrapped_deg = repmat( ...
    route.positionUnwrapped_deg(1, :), sampleCount, 1);
sampledVelocity_deg_s = zeros(sampleCount, 2);
sampledAcceleration_deg_s2 = zeros(sampleCount, 2);

% Chapter 2: Fill waiting periods by holding the latest reached waypoint.
% At this point every sample has the correct stationary position. The next
% chapter only needs to overwrite the samples during actual movement.
for routeNodeIndex = 2:size(route.positionUnwrapped_deg, 1)
    routeNodeHasBeenReached = ...
        sampleTime_s >= route.arrivalTime_s(routeNodeIndex) - 1e-10;
    sampledPositionUnwrapped_deg(routeNodeHasBeenReached, :) = repmat( ...
        route.positionUnwrapped_deg(routeNodeIndex, :), ...
        nnz(routeNodeHasBeenReached), 1);
end

% Chapter 3: Replace the stationary values inside each move with its smooth
% motion profile. Most edges start and stop at rest. The final edge may use
% a special profile when the caller requested nonzero terminal motion.
for routeEdgeIndex = 1:size(route.positionUnwrapped_deg, 1) - 1
    departureTime_s = route.departureTime_s(routeEdgeIndex);
    motionDuration_s = route.motionDuration_s(routeEdgeIndex);
    sampleIsDuringMotion = ...
        sampleTime_s >= departureTime_s - 1e-10 & ...
        sampleTime_s <= departureTime_s + motionDuration_s + 1e-10;
    if ~any(sampleIsDuringMotion)
        continue;
    end
    elapsedMotionTime_s = min(max( ...
        sampleTime_s(sampleIsDuringMotion) - departureTime_s, 0), ...
        motionDuration_s);
    if route.hasTerminalCapture && ...
            routeEdgeIndex == size(route.positionUnwrapped_deg, 1) - 1
        terminalProfile = evaluateAzElBoundaryProfile( ...
            route.positionUnwrapped_deg(routeEdgeIndex, :), ...
            [0 0], [0 0], ...
            route.positionUnwrapped_deg(routeEdgeIndex + 1, :), ...
            route.terminalVelocity_deg_s, ...
            route.terminalAcceleration_deg_s2, motionDuration_s, ...
            elapsedMotionTime_s);
        sampledPositionUnwrapped_deg(sampleIsDuringMotion, :) = ...
            terminalProfile.position_deg;
        sampledVelocity_deg_s(sampleIsDuringMotion, :) = ...
            terminalProfile.velocity_deg_s;
        sampledAcceleration_deg_s2(sampleIsDuringMotion, :) = ...
            terminalProfile.acceleration_deg_s2;
    else
        edgeDisplacement_deg = ...
            route.positionUnwrapped_deg(routeEdgeIndex + 1, :) - ...
            route.positionUnwrapped_deg(routeEdgeIndex, :);
        [~, normalizedMotion] = segmentMotion( ...
            edgeDisplacement_deg, limits);
        [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
            segmentProgress(elapsedMotionTime_s, motionDuration_s, ...
            normalizedMotion);
        sampledPositionUnwrapped_deg(sampleIsDuringMotion, :) = ...
            route.positionUnwrapped_deg(routeEdgeIndex, :) + ...
            progress * edgeDisplacement_deg;
        sampledVelocity_deg_s(sampleIsDuringMotion, :) = ...
            progressRate_1_s * edgeDisplacement_deg;
        sampledAcceleration_deg_s2(sampleIsDuringMotion, :) = ...
            progressAcceleration_1_s2 * edgeDisplacement_deg;
    end
end

% Chapter 4: Wrap azimuth only for the public command. Keeping the separate
% unwrapped copy preserves continuous motion through the azimuth seam.
sampledPosition_deg = sampledPositionUnwrapped_deg;
sampledPosition_deg(:, 1) = canonicalAzimuth( ...
    sampledPosition_deg(:, 1), limits, options);
sampledVelocity_deg_s(1, :) = 0;
sampledAcceleration_deg_s2(1, :) = 0;

% Chapter 5: Publish stable field names. "isWaiting" is derived from motion,
% not guessed from waypoint times, so it also works at boundary samples.
profile = struct( ...
    "time_s", sampleTime_s, ...
    "position_deg", sampledPosition_deg, ...
    "positionUnwrapped_deg", sampledPositionUnwrapped_deg, ...
    "velocity_deg_s", sampledVelocity_deg_s, ...
    "acceleration_deg_s2", sampledAcceleration_deg_s2, ...
    "isWaiting", all(abs(sampledVelocity_deg_s) <= 1e-10, 2) & ...
    all(abs(sampledAcceleration_deg_s2) <= 1e-10, 2));
end

function [motionDuration_s, normalizedMotion] = ...
        segmentMotion(axisDisplacement_deg, limits)
%% Section 0: Header & Readme
% SYNTAX
%   [motionDuration_s, normalizedMotion] = ...
%       segmentMotion(axisDisplacement_deg, limits)
%**************************************************************************
% PURPOSE
%   - Derive the shortest synchronized rest-to-rest two-axis slew.
%**************************************************************************
% INPUTS
%   - axisDisplacement_deg (numeric two-vector)
%       Signed axis displacement.
%   - limits (scalar struct)
%       Two-axis velocity and acceleration limits.
%**************************************************************************
% OUTPUTS
%   - motionDuration_s (nonnegative scalar)
%       Synchronized slew duration.
%   - normalizedMotion (scalar struct)
%       Normalized trapezoidal or triangular motion law.
%**************************************************************************
% UNITS
%   - Axis displacement is degrees and duration is seconds.
% Both axes must start and finish together even when they travel different
% distances. We therefore describe the move with one shared progress value
% from zero to one. Each axis multiplies that value by its own displacement.
% Search edges and profile reconstruction both use this helper, so the move
% cannot acquire a different duration after the route has been selected.
absoluteDisplacement_deg = abs(axisDisplacement_deg);
axisIsMoving = absoluteDisplacement_deg > 1e-12;
if ~any(axisIsMoving)
    motionDuration_s = 0;
    normalizedMotion = struct( ...
        "PeakRate", 0, "Acceleration", 1, ...
        "AccelerationTime", 0, "CruiseTime", 0);
    return;
end

% Convert each physical axis limit into a limit on shared progress. Choosing
% the smallest value means neither azimuth nor elevation can exceed its own
% velocity or acceleration limit.
progressRateLimit_1_s = min( ...
    limits.maxVelocity_deg_s(axisIsMoving) ./ ...
    absoluteDisplacement_deg(axisIsMoving));
progressAccelerationLimit_1_s2 = min( ...
    limits.maxAcceleration_deg_s2(axisIsMoving) ./ ...
    absoluteDisplacement_deg(axisIsMoving));

% A short move accelerates and immediately decelerates (a triangular speed
% shape). A longer move reaches the speed limit and cruises in the middle
% (a trapezoidal speed shape).
if progressRateLimit_1_s^2 / progressAccelerationLimit_1_s2 >= 1
    accelerationTime_s = sqrt(1 / progressAccelerationLimit_1_s2);
    peakProgressRate_1_s = sqrt(progressAccelerationLimit_1_s2);
    cruiseTime_s = 0;
else
    accelerationTime_s = progressRateLimit_1_s / ...
        progressAccelerationLimit_1_s2;
    peakProgressRate_1_s = progressRateLimit_1_s;
    cruiseTime_s = (1 - progressAccelerationLimit_1_s2 * ...
        accelerationTime_s^2) / peakProgressRate_1_s;
end
motionDuration_s = 2 * accelerationTime_s + cruiseTime_s;
normalizedMotion = struct( ...
    "PeakRate", peakProgressRate_1_s, ...
    "Acceleration", progressAccelerationLimit_1_s2, ...
    "AccelerationTime", accelerationTime_s, ...
    "CruiseTime", cruiseTime_s);
end

function [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
        segmentProgress(elapsedTime_s, motionDuration_s, normalizedMotion)
%% Section 0: Header & Readme
% SYNTAX
%   [progress, progressRate_1_s, progressAcceleration_1_s2] = ...
%       segmentProgress(elapsedTime_s, motionDuration_s, normalizedMotion)
%**************************************************************************
% PURPOSE
%   - Evaluate normalized segment position, rate, and acceleration.
%**************************************************************************
% INPUTS
%   - elapsedTime_s (numeric vector)
%       Elapsed segment times.
%   - motionDuration_s (nonnegative scalar)
%       Segment duration.
%   - normalizedMotion (scalar struct)
%       Analytic normalized motion law.
%**************************************************************************
% OUTPUTS
%   - progress, progressRate_1_s, progressAcceleration_1_s2
%       Normalized motion samples.
%**************************************************************************
% UNITS
%   - progress is dimensionless, rate is 1/s, acceleration is 1/s^2.
% Collision checks and returned velocity/acceleration must use the exact
% same motion shape. This evaluator is the single place that divides the
% move into accelerating, cruising, and slowing-down portions.
progress = zeros(size(elapsedTime_s));
progressRate_1_s = zeros(size(elapsedTime_s));
progressAcceleration_1_s2 = zeros(size(elapsedTime_s));
accelerationStopTime_s = normalizedMotion.AccelerationTime;
cruiseStopTime_s = accelerationStopTime_s + ...
    normalizedMotion.CruiseTime;

sampleIsAccelerating = elapsedTime_s > 0 & ...
    elapsedTime_s < accelerationStopTime_s;
progress(sampleIsAccelerating) = 0.5 * normalizedMotion.Acceleration .* ...
    elapsedTime_s(sampleIsAccelerating).^2;
progressRate_1_s(sampleIsAccelerating) = ...
    normalizedMotion.Acceleration .* elapsedTime_s(sampleIsAccelerating);
progressAcceleration_1_s2(sampleIsAccelerating) = ...
    normalizedMotion.Acceleration;

sampleIsCruising = elapsedTime_s >= accelerationStopTime_s & ...
    elapsedTime_s < cruiseStopTime_s;
progressAtCruiseStart = 0.5 * normalizedMotion.Acceleration * ...
    accelerationStopTime_s^2;
progress(sampleIsCruising) = progressAtCruiseStart + ...
    normalizedMotion.PeakRate .* ...
    (elapsedTime_s(sampleIsCruising) - accelerationStopTime_s);
progressRate_1_s(sampleIsCruising) = normalizedMotion.PeakRate;

sampleIsDecelerating = elapsedTime_s >= cruiseStopTime_s & ...
    elapsedTime_s < motionDuration_s;
remainingMotionTime_s = motionDuration_s - ...
    elapsedTime_s(sampleIsDecelerating);
progress(sampleIsDecelerating) = 1 - ...
    0.5 * normalizedMotion.Acceleration .* remainingMotionTime_s.^2;
progressRate_1_s(sampleIsDecelerating) = ...
    normalizedMotion.Acceleration .* remainingMotionTime_s;
progressAcceleration_1_s2(sampleIsDecelerating) = ...
    -normalizedMotion.Acceleration;
progress(elapsedTime_s >= motionDuration_s) = 1;
end

function yes = samePosition(firstPosition, secondPosition, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   yes = samePosition(firstPosition, secondPosition, limits, options)
%**************************************************************************
% PURPOSE
%   - Compare positions with the same wrapped displacement tolerance.
%**************************************************************************
% INPUTS
%   - firstPosition, secondPosition (numeric two-vectors)
%       Positions to compare.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - yes (logical scalar)
%       True when positions are equivalent.
%**************************************************************************
% UNITS
%   - Position and comparison tolerance are degrees.
% Start/goal tests and candidate deduplication require the same seam-aware
% tolerance.
delta = wrappedDelta(firstPosition, secondPosition, limits, options);
yes = hypot(delta(1), delta(2)) <= 1e-9;
end

function azimuth = canonicalAzimuth(azimuth, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   azimuth = canonicalAzimuth(azimuth, limits, options)
%**************************************************************************
% PURPOSE
%   - Map azimuth values into the configured periodic interval.
%**************************************************************************
% INPUTS
%   - azimuth (numeric array)
%       Possibly unwrapped values.
%   - limits, options (scalar structs)
%       Azimuth span and wrapping policy.
%**************************************************************************
% OUTPUTS
%   - azimuth (numeric array)
%       Canonical values.
%**************************************************************************
% UNITS
%   - Azimuth and limits are degrees.
% Cache keys, collision queries, and returned commands share this canonical
% interval even though motion is reconstructed unwrapped.
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    azimuth = mod(azimuth - limits.azimuth_deg(1), span) + ...
        limits.azimuth_deg(1);
end
end

function key = stateKey(position, interval, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   key = stateKey(position, interval, limits, options)
%**************************************************************************
% PURPOSE
%   - Build a deterministic cache key for a position-safe-interval state.
%**************************************************************************
% INPUTS
%   - position (numeric two-vector)
%       Spatial state.
%   - interval (positive integer)
%       Safe-interval index.
%   - limits, options (scalar structs)
%       Canonicalization policy.
%**************************************************************************
% OUTPUTS
%   - key (character vector)
%       Stable state key.
%**************************************************************************
% UNITS
%   - Position is degrees; interval and output encoding are dimensionless.
% Every frontier lookup must encode a spatial point and its safe interval
% exactly like every insertion.
key = sprintf('%s#%d', ...
    positionKey(position, limits, options), interval);
end

function key = positionKey(position, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   key = positionKey(position, limits, options)
%**************************************************************************
% PURPOSE
%   - Build a deterministic cache key for one canonical position.
%**************************************************************************
% INPUTS
%   - position (numeric two-vector)
%       Spatial state.
%   - limits, options (scalar structs)
%       Canonicalization policy.
%**************************************************************************
% OUTPUTS
%   - key (character vector)
%       Stable position key.
%**************************************************************************
% UNITS
%   - Position is degrees; output encoding is dimensionless.
% Safe-interval caching and graph-state keys share this spatial encoding.
azimuth = canonicalAzimuth(position(1), limits, options);
key = sprintf('%.9f|%.9f', azimuth, position(2));
end

function queryOptions = collisionOptions(options)
%% Section 0: Header & Readme
% SYNTAX
%   queryOptions = collisionOptions(options)
%**************************************************************************
% PURPOSE
%   - Translate planner controls into the shared collision-query schema.
%**************************************************************************
% INPUTS
%   - options (scalar struct)
%       Resolved planner options.
%**************************************************************************
% OUTPUTS
%   - queryOptions (scalar struct)
%       Exact polygon query controls.
%**************************************************************************
% UNITS
%   - SafetyMarginDeg is degrees; sample padding is dimensionless.
% Every exploratory and final collision query must preserve identical
% spatial margin and temporal padding.
queryOptions = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", options.TimePaddingSamples, ...
    "SafetyMarginDeg", options.SafetyMargin_deg);
end

function [nodes, index] = appendNode(nodes, position, interval, arrival, ...
        parent, departure, duration)
%% Section 0: Header & Readme
% SYNTAX
%   [nodes, index] = appendNode( ...
%       nodes, position, interval, arrival, parent, departure, duration)
%**************************************************************************
% PURPOSE
%   - Append one geometrically grown safe-interval search node.
%**************************************************************************
% INPUTS
%   - nodes (scalar packed struct)
%       Parallel search-node arrays.
%   - position, interval, arrival, parent, departure, duration (node values)
%       Spatial, safe-interval, timing, and ancestry fields.
%**************************************************************************
% OUTPUTS
%   - nodes (scalar packed struct)
%       Updated arrays.
%   - index (positive integer)
%       Appended node index.
%**************************************************************************
% UNITS
%   - Position is degrees and timing values are seconds.
% Node creation occurs from multiple transition cases; one allocator keeps
% the structure-of-arrays fields synchronized during growth.
if nodes.Count >= size(nodes.PositionDeg, 1)
    previousCapacity = size(nodes.PositionDeg, 1);
    newCapacity = max(2 * previousCapacity, 1);
    nodes.PositionDeg(newCapacity, 2) = 0;
    nodes.IntervalIndex(newCapacity, 1) = 0;
    nodes.ArrivalTime_s(newCapacity, 1) = Inf;
    nodes.ParentIndex(newCapacity, 1) = 0;
    nodes.DepartureTime_s(newCapacity, 1) = NaN;
    nodes.MotionDuration_s(newCapacity, 1) = 0;
end
nodes.Count = nodes.Count + 1;
index = nodes.Count;
nodes.PositionDeg(index, :) = position;
nodes.IntervalIndex(index) = interval;
nodes.ArrivalTime_s(index) = arrival;
nodes.ParentIndex(index) = uint32(parent);
nodes.DepartureTime_s(index) = departure;
nodes.MotionDuration_s(index) = duration;
end

function result = failedResult( ...
        message, eventTimes, cache, queryCount, elapsed, options)
%% Section 0: Header & Readme
% SYNTAX
%   result = failedResult( ...
%       message, eventTimes, cache, queryCount, elapsed, options)
%**************************************************************************
% PURPOSE
%   - Assemble the shared failed safe-interval search schema.
%**************************************************************************
% INPUTS
%   - message (scalar text)
%       Failure explanation.
%   - eventTimes, cache, queryCount, elapsed, options (diagnostic context)
%       Event grid, cache, work counts, wall time, and resolved controls.
%**************************************************************************
% OUTPUTS
%   - result (scalar struct)
%       Failed dynamic-search result.
%**************************************************************************
% UNITS
%   - Event times and elapsed are seconds.
% All early exits expose one stable diagnostic schema to examples and tests.
result = struct( ...
    "Success", false, ...
    "Message", string(message), ...
    "Method", "eventCompressedSafeIntervalDijkstra", ...
    "Route", struct(), ...
    "Profile", struct(), ...
    "ExpandedNodeCount", 0, ...
    "GeneratedNodeCount", 0, ...
    "SafeIntervalQueryCount", queryCount, ...
    "SafeIntervalCacheCount", cache.Count, ...
    "EventTimeCount", numel(eventTimes), ...
    "EventTimes_s", eventTimes, ...
    "SearchElapsed_s", elapsed, ...
    "TerminationReason", "", ...
    "BlockedValidationSampleCount", 0, ...
    "GlobalAngularOptimal", false, ...
    "Options", options);
end

function frontier = pushArrivalFrontier(frontier, node, arrivalTime_s)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = pushArrivalFrontier(frontier, node, arrivalTime_s)
%**************************************************************************
% PURPOSE
%   - Push one earliest-arrival label onto the dynamic binary min-heap.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays, count, and serial state.
%   - node (positive integer)
%       Search-node index.
%   - arrivalTime_s (numeric scalar)
%       Earliest-arrival label.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - arrivalTime_s is seconds; other values are dimensionless.
% Push and pop share the comparison/swap helpers below so equal-cost labels
% keep deterministic FIFO tie-breaking.
if frontier.Count >= numel(frontier.Node)
    previousCapacity = numel(frontier.Node);
    newCapacity = max(2 * previousCapacity, 1);
    frontier.Node(newCapacity, 1) = 0;
    frontier.ArrivalTime_s(newCapacity, 1) = Inf;
    frontier.Serial(newCapacity, 1) = 0;
end
frontier.Count = frontier.Count + 1;
frontier.NextSerial = frontier.NextSerial + 1;
index = frontier.Count;
frontier.Node(index) = uint32(node);
frontier.ArrivalTime_s(index) = arrivalTime_s;
frontier.Serial(index) = frontier.NextSerial;
while index > 1
    parent = floor(index / 2);
    if ~arrivalFrontierEntryIsLess(frontier, index, parent)
        break;
    end
    frontier = swapArrivalFrontierEntries(frontier, index, parent);
    index = parent;
end
end

function [frontier, node] = popArrivalFrontier(frontier)
%% Section 0: Header & Readme
% SYNTAX
%   [frontier, node] = popArrivalFrontier(frontier)
%**************************************************************************
% PURPOSE
%   - Remove the earliest dynamic frontier entry.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Nonempty arrival-time binary min-heap.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%   - node (positive integer)
%       Removed search-node index.
%**************************************************************************
% UNITS
%   - Stored arrival labels are seconds; outputs are otherwise dimensionless.
% This is paired with pushArrivalFrontier and intentionally reuses the same
% ordering primitive instead of duplicating heap rules.
node = double(frontier.Node(1));
frontier.Node(1) = frontier.Node(frontier.Count);
frontier.ArrivalTime_s(1) = frontier.ArrivalTime_s(frontier.Count);
frontier.Serial(1) = frontier.Serial(frontier.Count);
frontier.Count = frontier.Count - 1;
index = 1;
while true
    left = 2 * index;
    right = left + 1;
    if left > frontier.Count
        break;
    end
    child = left;
    if right <= frontier.Count && ...
            arrivalFrontierEntryIsLess(frontier, right, left)
        child = right;
    end
    if ~arrivalFrontierEntryIsLess(frontier, child, index)
        break;
    end
    frontier = swapArrivalFrontierEntries(frontier, index, child);
    index = child;
end
end

function isLess = arrivalFrontierEntryIsLess( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   isLess = arrivalFrontierEntryIsLess( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Compare dynamic heap entries by arrival time and serial order.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to compare.
%**************************************************************************
% OUTPUTS
%   - isLess (logical scalar)
%       True when the first entry precedes the second.
%**************************************************************************
% UNITS
%   - Comparison result and indices are dimensionless.
% Both heap directions depend on this single cost and serial ordering rule.
firstArrivalTime_s = frontier.ArrivalTime_s(firstIndex);
secondArrivalTime_s = frontier.ArrivalTime_s(secondIndex);
if firstArrivalTime_s ~= secondArrivalTime_s
    isLess = frontier.ArrivalTime_s(firstIndex) < ...
        frontier.ArrivalTime_s(secondIndex);
else
    isLess = frontier.Serial(firstIndex) < frontier.Serial(secondIndex);
end
end

function frontier = swapArrivalFrontierEntries( ...
        frontier, firstIndex, secondIndex)
%% Section 0: Header & Readme
% SYNTAX
%   frontier = swapArrivalFrontierEntries( ...
%       frontier, firstIndex, secondIndex)
%**************************************************************************
% PURPOSE
%   - Swap every parallel array in two dynamic heap entries.
%**************************************************************************
% INPUTS
%   - frontier (scalar struct)
%       Heap arrays.
%   - firstIndex, secondIndex (positive integers)
%       Entries to exchange.
%**************************************************************************
% OUTPUTS
%   - frontier (scalar struct)
%       Updated heap.
%**************************************************************************
% UNITS
%   - Indices are dimensionless; arrival-time units remain seconds.
% Push and pop both swap three parallel arrays; centralizing it prevents
% frontier corruption when the schema changes.
fields = ["Node", "ArrivalTime_s", "Serial"];
for fieldName = fields
    temporaryValue = frontier.(fieldName)(firstIndex);
    frontier.(fieldName)(firstIndex) = frontier.(fieldName)(secondIndex);
    frontier.(fieldName)(secondIndex) = temporaryValue;
end
end

function profile = evaluateAzElBoundaryProfile( ...
        initialPosition, initialVelocity, initialAcceleration, ...
        goalPosition, goalVelocity, goalAcceleration, duration_s, tau_s)
%% Section 0: Header & Readme
% SYNTAX
%   profile = evaluateAzElBoundaryProfile( ...
%       initialPosition, initialVelocity, initialAcceleration, ...
%       goalPosition, goalVelocity, goalAcceleration, duration_s, tau_s)
%**************************************************************************
% PURPOSE
%   - Evaluate the shared quintic terminal boundary-value trajectory.
%**************************************************************************
% INPUTS
%   - initial and goal position/velocity/acceleration (numeric two-vectors)
%       Six terminal boundary conditions.
%   - duration_s (positive scalar)
%       Complete maneuver duration.
%   - tau_s (numeric vector)
%       Elapsed evaluation times.
%**************************************************************************
% OUTPUTS
%   - profile (scalar struct)
%       Position, velocity, acceleration, jerk, and coefficients.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
% Terminal feasibility and route reconstruction must evaluate the same
% quintic boundary-value solution.
validateattributes(duration_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
boundaryValues = {initialPosition, initialVelocity, ...
    initialAcceleration, goalPosition, goalVelocity, goalAcceleration};
for boundaryIndex = 1:numel(boundaryValues)
    validateattributes(boundaryValues{boundaryIndex}, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    boundaryValues{boundaryIndex} = reshape( ...
        double(boundaryValues{boundaryIndex}), 1, 2);
end
initialPosition = boundaryValues{1};
initialVelocity = boundaryValues{2};
initialAcceleration = boundaryValues{3};
goalPosition = boundaryValues{4};
goalVelocity = boundaryValues{5};
goalAcceleration = boundaryValues{6};
tau_s = double(tau_s(:));
validateattributes(tau_s, {'numeric'}, ...
    {'real', 'finite', '>=', 0, '<=', duration_s});

coefficient = zeros(6, 2);
coefficient(1, :) = initialPosition;
coefficient(2, :) = duration_s * initialVelocity;
coefficient(3, :) = 0.5 * duration_s^2 * initialAcceleration;
remainingBoundaryConditions = [ ...
    goalPosition - sum(coefficient(1:3, :), 1); ...
    duration_s * goalVelocity - ...
        coefficient(2, :) - 2 * coefficient(3, :); ...
    duration_s^2 * goalAcceleration - 2 * coefficient(3, :)];
boundaryMatrix = [1 1 1; 3 4 5; 6 12 20];
coefficient(4:6, :) = boundaryMatrix \ remainingBoundaryConditions;

normalizedTime = tau_s / duration_s;
positionBasis = [ones(size(normalizedTime)), normalizedTime, ...
    normalizedTime.^2, normalizedTime.^3, ...
    normalizedTime.^4, normalizedTime.^5];
velocityBasis = [zeros(size(normalizedTime)), ...
    ones(size(normalizedTime)), 2 * normalizedTime, ...
    3 * normalizedTime.^2, 4 * normalizedTime.^3, ...
    5 * normalizedTime.^4] / duration_s;
accelerationBasis = [zeros(size(normalizedTime)), ...
    zeros(size(normalizedTime)), 2 * ones(size(normalizedTime)), ...
    6 * normalizedTime, 12 * normalizedTime.^2, ...
    20 * normalizedTime.^3] / duration_s^2;
jerkBasis = [zeros(size(normalizedTime)), ...
    zeros(size(normalizedTime)), zeros(size(normalizedTime)), ...
    6 * ones(size(normalizedTime)), 24 * normalizedTime, ...
    60 * normalizedTime.^2] / duration_s^3;

profile = struct( ...
    "timeFromStart_s", tau_s, ...
    "position_deg", positionBasis * coefficient, ...
    "velocity_deg_s", velocityBasis * coefficient, ...
    "acceleration_deg_s2", accelerationBasis * coefficient, ...
    "jerk_deg_s3", jerkBasis * coefficient, ...
    "coefficient", coefficient);
end

function limits = normalizePlannerLimits(limits)
%% Section 0: Header & Readme
% SYNTAX
%   limits = normalizePlannerLimits(limits)
%**************************************************************************
% PURPOSE
%   - Apply one limits invariant to planning and explicit-default requests.
%**************************************************************************
% INPUTS
%   - limits (scalar struct)
%       Required angular ranges and two-axis dynamic limits.
%**************************************************************************
% OUTPUTS
%   - limits (scalar struct)
%       Validated row-oriented double values.
%**************************************************************************
% UNITS
%   - Angular ranges are degrees, velocity is deg/s, and acceleration is
%     deg/s^2.
requiredLimitFields = ["azimuth_deg", "elevation_deg", ...
    "maxVelocity_deg_s", "maxAcceleration_deg_s2"];
hasRequiredLimits = isstruct(limits) && isscalar(limits) && ...
    all(isfield(limits, cellstr(requiredLimitFields)));
if ~hasRequiredLimits
    error("planAzElDijkstra:InvalidLimits", ...
        "limits is missing a required field.");
end
for limitField = requiredLimitFields
    validateattributes(limits.(limitField), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    limits.(limitField) = reshape(double(limits.(limitField)), 1, 2);
end
rangesIncrease = all(diff(limits.azimuth_deg) > 0) && ...
    all(diff(limits.elevation_deg) > 0);
dynamicsArePositive = all(limits.maxVelocity_deg_s > 0) && ...
    all(limits.maxAcceleration_deg_s2 > 0);
if ~rangesIncrease || ~dynamicsArePositive
    error("planAzElDijkstra:InvalidLimits", ...
        "Limit ranges must increase and dynamic limits must be positive.");
end
end

function options = defaultAzElDijkstraOptions(limits)
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultAzElDijkstraOptions(limits)
%**************************************************************************
% PURPOSE
%   - Keep argument-dependent Dijkstra defaults in one source of truth.
%**************************************************************************
% INPUTS
%   - limits (validated scalar struct)
%       Azimuth span determines whether wrapping is enabled by default.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated base options. Derived sampling defaults remain empty
%       until the public function resolves them against other options.
%**************************************************************************
% UNITS
%   - Unit-bearing option fields use _deg, _s, or their rate derivatives.
options = struct( ...
    "SampleTime_s", 0.5, ...
    "ValidationStep_s", [], ...
    "GridStep_deg", 1, ...
    "GridStepSchedule_deg", [], ...
    "PrimitiveRadii_deg", [], ...
    "PrimitiveRadiusMultipliers", [1 2 4 8], ...
    "DirectionStep_deg", 45, ...
    "CollisionCheckStep_s", [], ...
    "MaximumSafeIntervalSamples", 10000, ...
    "MaximumDepartureTrials", 64, ...
    "DepartureBatchSize", 8, ...
    "MaxExpansions", 100000, ...
    "MaxSearchTime_s", 45, ...
    "InitialNodeCapacity", 4096, ...
    "TimePaddingSamples", 1, ...
    "SafetyMargin_deg", 0, ...
    "AllowAzimuthWrap", diff(limits.azimuth_deg) >= 360 - 1e-9, ...
    "AllowNonzeroTerminalState", false, ...
    "PrintFailureSuggestions", true, ...
    "MotionMode", "profile", ...
    "PathFirstTimeScaling", "minimumJerk", ...
    "KinematicTimeStep_s", 0.5, ...
    "KinematicProgressStep_deg", 0.25, ...
    "KinematicMaximumLatticeStates", 25000000, ...
    "JointKinematicTimeStep_s", 0.5, ...
    "JointKinematicPositionStep_deg", 0.5, ...
    "JointKinematicPositionStepSchedule_deg", [], ...
    "JointKinematicMaximumJerk_deg_s3", [8 8], ...
    "JointKinematicTimeWeight", 0.5, ...
    "JointKinematicDistanceWeight", 0.5, ...
    "FallbackToProfile", true, ...
    "Objective", "minimumAngularDistance", ...
    "RouteShortcutStep_deg", 0.1, ...
    "MaximumVerticesPerRegion", 500);
end

function plan = normalizeAzElDijkstraPlanSchema(plan)
%% Section 0: Header & Readme
% SYNTAX
%   plan = normalizeAzElDijkstraPlanSchema(plan)
%**************************************************************************
% PURPOSE
%   - Give static, dynamic, successful, and failed public plans the same
%     diagnostic field set without overwriting branch-specific evidence.
%**************************************************************************
% INPUTS
%   - plan (scalar struct)
%       Partially assembled plan from any public exit path.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       Plan with every public diagnostic field present.
%**************************************************************************
% UNITS
%   - Unit-bearing fields use degrees, seconds, or their rate derivatives.
schemaDefaults = struct( ...
    "jerk_deg_s3", zeros(0, 2), ...
    "topologyOptimalOnLattice", false, ...
    "topologySearch", struct(), ...
    "preShortcutRoute_deg", zeros(0, 2), ...
    "routeShortcut", struct(), ...
    "autonomousRoute_deg", zeros(0, 2), ...
    "retiming", struct(), ...
    "motionPlanning", struct( ...
        "RequestedMode", "", ...
        "SelectedMode", "", ...
        "FallbackEnabled", false, ...
        "FallbackUsed", false, ...
        "PathFirstAttempted", false, ...
        "PathFirstSucceeded", false, ...
        "PathFirstMessage", "", ...
        "PathFirstResolutionAttempts", struct([]), ...
        "StateSpaceAttempted", false, ...
        "StateSpaceSucceeded", false, ...
        "StateSpaceMessage", "", ...
        "JointStateAttempted", false, ...
        "JointStateSucceeded", false, ...
        "JointStateMessage", "", ...
        "JointStateResolutionAttempts", struct([])), ...
    "resolutionAttempts", struct([]), ...
    "safeIntervalSearch", struct(), ...
    "failureCategory", "", ...
    "failureCause", "", ...
    "failureSuggestions", strings(0, 1), ...
    "failureSummary", "");
schemaFieldNames = fieldnames(schemaDefaults);
for fieldIndex = 1:numel(schemaFieldNames)
    fieldName = schemaFieldNames{fieldIndex};
    if ~isfield(plan, fieldName)
        plan.(fieldName) = schemaDefaults.(fieldName);
    end
end
end
