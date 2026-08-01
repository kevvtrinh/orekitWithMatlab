function plan = planSimpleAzElTimeKinodynamicBiRRT( ...
        azElData, initialState, destinationState, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   options = planSimpleAzElTimeKinodynamicBiRRT()
%   plan = planSimpleAzElTimeKinodynamicBiRRT( ...
%       azElData, initialState, destinationState, limits)
%   plan = planSimpleAzElTimeKinodynamicBiRRT( ...
%       azElData, initialState, destinationState, limits, options)
%**************************************************************************
% PURPOSE
%   - Demonstrate a bidirectional RRT over azimuth, elevation, time,
%     velocity, and acceleration without advanced planner machinery.
%   - Grow the initial tree forward and the destination tree backward while
%     storing every destination-tree edge in its forward-time form.
%   - Apply one constant azimuth/elevation jerk command per tree edge.
%   - Reconstruct and revalidate every accepted trajectory in forward time.
%**************************************************************************
% INPUTS
%   - azElData (struct array or cell array)
%       Canonical moving obstacle data accepted by
%       buildAzElTimeObstacleWorkspace.
%   - initialState (scalar struct)
%       .time_s, .position_deg, .velocity_deg_s, and
%       .acceleration_deg_s2 describe the initial kinodynamic state.
%   - destinationState (scalar struct)
%       Same fields as initialState. Its time is the terminal time.
%   - limits (scalar struct)
%       .azimuth_deg and .elevation_deg contain axis bounds.
%       .maxVelocity_deg_s, .maxAcceleration_deg_s2, and
%       .maxJerk_deg_s3 contain [azimuth elevation] magnitudes.
%   - options (scalar struct)
%       .TimeStep_s is the uniform tree-edge duration.
%       .CollisionCheckStep_s is the sampled edge-check interval.
%       .DestinationSampleProbability biases each tree toward the opposite
%       boundary state.
%       .JerkCommands_deg_s3 optionally supplies an N-by-2 command set.
%       .PositionWeight, .VelocityWeight, .AccelerationWeight, and
%       .TimeWeight define the visible nearest-node metric.
%       .ConnectionPositionTolerance_deg,
%       .ConnectionVelocityTolerance_deg_s,
%       .ConnectionAccelerationTolerance_deg_s2, and
%       .ConnectionTimeTolerance_s define the connection test.
%       .AllowAzimuthWrap enables a complete 360-degree azimuth domain.
%       .MaximumIterations and .MaximumTreeNodes limit search work.
%       .RandomSeed makes the random search reproducible.
%       .CollisionQueryOptions are passed to queryAzElTimeObstacle.
%       .MaximumObstacleVerticesPerRegion limits packed polygon vertices;
%       Inf preserves the supplied obstacle boundaries exactly.
%**************************************************************************
% OUTPUTS
%   - plan (scalar struct)
%       .success and .message summarize the search.
%       .time_s, .position_deg, .positionUnwrapped_deg,
%       .velocity_deg_s, .acceleration_deg_s2, .jerk_deg_s3, and
%       .isWaiting describe the forward-time trajectory.
%       .initialTree and .destinationTree expose states, parents, jerks,
%       edge durations, directions, and node counts.
%       .connectionNodeIndices contains [initial destination] tree rows.
%       .iterationCount, .generatedNodeCount, and .rejectedNodeCount expose
%       basic search effort.
%       .forwardDynamicsValidated and .exactCollisionValidated report final
%       sampled-edge validation. This is not a continuous collision proof.
%       Tree State columns are [time, azimuth, elevation, azimuth velocity,
%       elevation velocity, azimuth acceleration, elevation acceleration].
%**************************************************************************
% UNITS
%   - Angles are degrees. Time is seconds. Velocity, acceleration, and jerk
%     use deg/s, deg/s^2, and deg/s^3, respectively.

%% Section 1: Validate Inputs
defaultOptions = defaultSimpleBiRRTOptions();
if nargin == 0
    plan = defaultOptions;
    return;
end
if nargin < 5 || isempty(options)
    options = struct();
end
if ~isstruct(options) || ~isscalar(options)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidOptions", ...
        "options must be a scalar struct.");
end
if ~isstruct(initialState) || ~isscalar(initialState) || ...
        ~isstruct(destinationState) || ~isscalar(destinationState)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidState", ...
        "initialState and destinationState must be scalar structures.");
end
requiredStateFields = ["time_s", "position_deg", ...
    "velocity_deg_s", "acceleration_deg_s2"];
endpointStates = {initialState, destinationState};
endpointNames = ["initialState", "destinationState"];
normalizedEndpointRows = zeros(2, 7);
for endpointIndex = 1:2
    endpointState = endpointStates{endpointIndex};
    missingStateFields = setdiff(requiredStateFields, ...
        string(fieldnames(endpointState)), "stable");
    if ~isempty(missingStateFields)
        error("planSimpleAzElTimeKinodynamicBiRRT:MissingStateField", ...
            "%s is missing: %s.", endpointNames(endpointIndex), ...
            strjoin(missingStateFields, ", "));
    end
    validateattributes(endpointState.time_s, {'numeric'}, ...
        {'scalar', 'real', 'finite'});
    validateattributes(endpointState.position_deg, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    validateattributes(endpointState.velocity_deg_s, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    validateattributes(endpointState.acceleration_deg_s2, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite'});
    normalizedEndpointRows(endpointIndex, :) = [ ...
        double(endpointState.time_s), ...
        double(endpointState.position_deg(:).'), ...
        double(endpointState.velocity_deg_s(:).'), ...
        double(endpointState.acceleration_deg_s2(:).')];
end
initialStateRow = normalizedEndpointRows(1, :);
destinationStateRow = normalizedEndpointRows(2, :);
if destinationStateRow(1) <= initialStateRow(1)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidTimeOrder", ...
        "destinationState.time_s must follow initialState.time_s.");
end

if ~isstruct(limits) || ~isscalar(limits)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidLimits", ...
        "limits must be a scalar struct.");
end
requiredLimitFields = ["azimuth_deg", "elevation_deg", ...
    "maxVelocity_deg_s", "maxAcceleration_deg_s2", ...
    "maxJerk_deg_s3"];
missingLimitFields = setdiff(requiredLimitFields, ...
    string(fieldnames(limits)), "stable");
if ~isempty(missingLimitFields)
    error("planSimpleAzElTimeKinodynamicBiRRT:MissingLimitField", ...
        "limits is missing: %s.", strjoin(missingLimitFields, ", "));
end
validateattributes(limits.azimuth_deg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
validateattributes(limits.elevation_deg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
validateattributes(limits.maxVelocity_deg_s, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
validateattributes(limits.maxAcceleration_deg_s2, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
validateattributes(limits.maxJerk_deg_s3, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
limits.azimuth_deg = double(limits.azimuth_deg(:).');
limits.elevation_deg = double(limits.elevation_deg(:).');
limits.maxVelocity_deg_s = double(limits.maxVelocity_deg_s(:).');
limits.maxAcceleration_deg_s2 = ...
    double(limits.maxAcceleration_deg_s2(:).');
limits.maxJerk_deg_s3 = double(limits.maxJerk_deg_s3(:).');
if limits.azimuth_deg(2) <= limits.azimuth_deg(1) || ...
        limits.elevation_deg(2) <= limits.elevation_deg(1)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidPositionLimits", ...
        "Azimuth and elevation limits must be strictly increasing.");
end

%% Section 2: Resolve Planner And Kinodynamic Options
options = resolveSimpleBiRRTOptions(options, defaultOptions, limits);
timeBounds_s = [initialStateRow(1), destinationStateRow(1)];
requestedDuration_s = diff(timeBounds_s);
timeStepCount = round(requestedDuration_s / options.TimeStep_s);
mappedDuration_s = timeStepCount * options.TimeStep_s;
if timeStepCount < 1 || abs(mappedDuration_s - requestedDuration_s) > ...
        options.ConnectionTimeTolerance_s
    error("planSimpleAzElTimeKinodynamicBiRRT:TimeGridMismatch", ...
        "The boundary-state duration must be an integer multiple of " + ...
        "options.TimeStep_s within ConnectionTimeTolerance_s.");
end
if options.AllowAzimuthWrap
    azimuthSpan_deg = diff(limits.azimuth_deg);
    if abs(azimuthSpan_deg - 360) > 1e-9
        error("planSimpleAzElTimeKinodynamicBiRRT:InvalidWrappedDomain", ...
            "AllowAzimuthWrap requires a complete 360-degree domain.");
    end
    initialStateRow(2) = limits.azimuth_deg(1) + mod( ...
        initialStateRow(2) - limits.azimuth_deg(1), 360);
    destinationStateRow(2) = limits.azimuth_deg(1) + mod( ...
        destinationStateRow(2) - limits.azimuth_deg(1), 360);
end
limitTolerance = 1e-12;
for endpointIndex = 1:2
    endpointStateRow = [initialStateRow; destinationStateRow];
    endpointStateRow = endpointStateRow(endpointIndex, :);
    azimuthIsInsideLimits = options.AllowAzimuthWrap || ( ...
        endpointStateRow(2) >= limits.azimuth_deg(1) - limitTolerance && ...
        endpointStateRow(2) <= limits.azimuth_deg(2) + limitTolerance);
    elevationIsInsideLimits = ...
        endpointStateRow(3) >= limits.elevation_deg(1) - limitTolerance && ...
        endpointStateRow(3) <= limits.elevation_deg(2) + limitTolerance;
    velocityIsInsideLimits = all(abs(endpointStateRow(4:5)) <= ...
        limits.maxVelocity_deg_s + limitTolerance);
    accelerationIsInsideLimits = all(abs(endpointStateRow(6:7)) <= ...
        limits.maxAcceleration_deg_s2 + limitTolerance);
    if ~azimuthIsInsideLimits || ~elevationIsInsideLimits || ...
            ~velocityIsInsideLimits || ~accelerationIsInsideLimits
        error("planSimpleAzElTimeKinodynamicBiRRT:EndpointOutsideLimits", ...
            "%s violates a position, velocity, or acceleration limit.", ...
            endpointNames(endpointIndex));
    end
end

%% Section 3: Prepare The Time-Varying Obstacle Data
obstacleFieldOptions = struct( ...
    "MaximumVerticesPerRegion", ...
    options.MaximumObstacleVerticesPerRegion);
obstacleField = buildAzElTimeObstacleWorkspace( ...
    azElData, obstacleFieldOptions);
endpointRows = [initialStateRow; destinationStateRow];
endpointOccupied = queryAzElTimeObstacle(obstacleField, ...
    endpointRows(:, 2), endpointRows(:, 3), endpointRows(:, 1), ...
    options.CollisionQueryOptions);
if any(endpointOccupied)
    occupiedEndpointName = endpointNames(find(endpointOccupied, 1));
    error("planSimpleAzElTimeKinodynamicBiRRT:EndpointInCollision", ...
        "%s is inside a time-varying obstacle.", occupiedEndpointName);
end

%% Section 4: Initialize The Initial And Destination Trees
stateColumnNames = ["time_s", "azimuth_deg", "elevation_deg", ...
    "azimuthVelocity_deg_s", "elevationVelocity_deg_s", ...
    "azimuthAcceleration_deg_s2", "elevationAcceleration_deg_s2"];
initialTree = struct( ...
    "State", nan(options.MaximumTreeNodes, 7), ...
    "ParentNodeIndex", zeros(options.MaximumTreeNodes, 1, "uint32"), ...
    "AppliedJerk_deg_s3", nan(options.MaximumTreeNodes, 2), ...
    "EdgeDuration_s", zeros(options.MaximumTreeNodes, 1), ...
    "NodeCount", 1, ...
    "SearchDirection", "forward", ...
    "StateColumnNames", stateColumnNames);
initialTree.State(1, :) = initialStateRow;
initialTree.AppliedJerk_deg_s3(1, :) = [0, 0];
destinationTree = struct( ...
    "State", nan(options.MaximumTreeNodes, 7), ...
    "ParentNodeIndex", zeros(options.MaximumTreeNodes, 1, "uint32"), ...
    "AppliedJerk_deg_s3", nan(options.MaximumTreeNodes, 2), ...
    "EdgeDuration_s", zeros(options.MaximumTreeNodes, 1), ...
    "NodeCount", 1, ...
    "SearchDirection", "backward", ...
    "StateColumnNames", stateColumnNames);
destinationTree.State(1, :) = destinationStateRow;
destinationTree.AppliedJerk_deg_s3(1, :) = [0, 0];

%% Section 5: Define Sampling And Distance Rules
% The metric remains deliberately explicit. Azimuth uses the shortest
% wrapped displacement; other state dimensions remain ordinary Euclidean
% differences. Time is not normalized, so every weight has an inspectable
% and direct effect in the documented physical units.
positionWeight = options.PositionWeight;
velocityWeight = options.VelocityWeight;
accelerationWeight = options.AccelerationWeight;
timeWeight = options.TimeWeight;
randomStream = RandStream("mt19937ar", "Seed", options.RandomSeed);

%% Section 6: Define The Discrete Jerk Commands
jerkCommands_deg_s3 = options.JerkCommands_deg_s3;
jerkCommandCount = size(jerkCommands_deg_s3, 1);

%% Section 7: Alternate Tree Expansion
connectionWasFound = false;
connectionInitialNodeIndex = 0;
connectionDestinationNodeIndex = 0;
connectionJerk_deg_s3 = [0, 0];
connectionDuration_s = 0;
iterationCount = 0;
rejectedNodeCount = 0;
candidateControlCount = 0;
for iterationIndex = 1:options.MaximumIterations
    iterationCount = iterationIndex;
    expandingInitialTree = mod(iterationIndex, 2) == 1;
    if expandingInitialTree
        activeTree = initialTree;
        oppositeBoundaryState = destinationStateRow;
    else
        activeTree = destinationTree;
        oppositeBoundaryState = initialStateRow;
    end
    if activeTree.NodeCount >= options.MaximumTreeNodes
        continue;
    end

    % --- Sample A Target State ------------------------------------------
    if rand(randomStream) < options.DestinationSampleProbability
        sampledState = oppositeBoundaryState;
    else
        sampledAzimuth_deg = limits.azimuth_deg(1) + ...
            rand(randomStream) * diff(limits.azimuth_deg);
        sampledElevation_deg = limits.elevation_deg(1) + ...
            rand(randomStream) * diff(limits.elevation_deg);
        sampledTime_s = timeBounds_s(1) + ...
            rand(randomStream) * diff(timeBounds_s);
        sampledVelocity_deg_s = (2 * rand(randomStream, 1, 2) - 1) .* ...
            limits.maxVelocity_deg_s;
        sampledAcceleration_deg_s2 = ...
            (2 * rand(randomStream, 1, 2) - 1) .* ...
            limits.maxAcceleration_deg_s2;
        sampledState = [sampledTime_s, sampledAzimuth_deg, ...
            sampledElevation_deg, sampledVelocity_deg_s, ...
            sampledAcceleration_deg_s2];
    end

    % --- Select The Nearest Node ----------------------------------------
    activeState = activeTree.State(1:activeTree.NodeCount, :);
    if expandingInitialTree
        nodeCanExpand = activeState(:, 1) <= ...
            destinationStateRow(1) - options.TimeStep_s + ...
            options.ConnectionTimeTolerance_s;
    else
        nodeCanExpand = activeState(:, 1) >= ...
            initialStateRow(1) + options.TimeStep_s - ...
            options.ConnectionTimeTolerance_s;
    end
    expandableNodeIndices = find(nodeCanExpand);
    if isempty(expandableNodeIndices)
        continue;
    end
    expandableState = activeState(expandableNodeIndices, :);
    if options.AllowAzimuthWrap
        azimuthDifference_deg = mod(expandableState(:, 2) - ...
            sampledState(2) + 180, 360) - 180;
    else
        azimuthDifference_deg = ...
            expandableState(:, 2) - sampledState(2);
    end
    elevationDifference_deg = ...
        expandableState(:, 3) - sampledState(3);
    positionDistance_deg = hypot( ...
        azimuthDifference_deg, elevationDifference_deg);
    velocityDistance_deg_s = vecnorm( ...
        expandableState(:, 4:5) - sampledState(4:5), 2, 2);
    accelerationDistance_deg_s2 = vecnorm( ...
        expandableState(:, 6:7) - sampledState(6:7), 2, 2);
    timeDistance_s = abs(expandableState(:, 1) - sampledState(1));
    stateDistance = positionWeight * positionDistance_deg + ...
        velocityWeight * velocityDistance_deg_s + ...
        accelerationWeight * accelerationDistance_deg_s2 + ...
        timeWeight * timeDistance_s;
    [~, nearestExpandableLocation] = min(stateDistance);
    nearestNodeIndex = expandableNodeIndices(nearestExpandableLocation);
    nearestNodeState = activeTree.State(nearestNodeIndex, :);

    % --- Section 8: Propagate Candidate Kinodynamic States --------------
    bestCandidateWasFound = false;
    bestCandidateDistance = Inf;
    bestCandidateState = nan(1, 7);
    bestAppliedJerk_deg_s3 = [0, 0];
    for jerkCommandIndex = 1:jerkCommandCount
        candidateControlCount = candidateControlCount + 1;
        appliedJerk_deg_s3 = jerkCommands_deg_s3(jerkCommandIndex, :);
        timeStep_s = options.TimeStep_s;
        if expandingInitialTree
            newAcceleration_deg_s2 = nearestNodeState(6:7) + ...
                appliedJerk_deg_s3 * timeStep_s;
            newVelocity_deg_s = nearestNodeState(4:5) + ...
                nearestNodeState(6:7) * timeStep_s + ...
                0.5 * appliedJerk_deg_s3 * timeStep_s^2;
            newPosition_deg = nearestNodeState(2:3) + ...
                nearestNodeState(4:5) * timeStep_s + ...
                0.5 * nearestNodeState(6:7) * timeStep_s^2 + ...
                (1 / 6) * appliedJerk_deg_s3 * timeStep_s^3;
            newTime_s = nearestNodeState(1) + timeStep_s;
            candidateState = [newTime_s, newPosition_deg, ...
                newVelocity_deg_s, newAcceleration_deg_s2];
            earlierEdgeState = nearestNodeState;
        else
            % Inverse constant-jerk equations produce the earlier state.
            % The same appliedJerk command then propagates this candidate
            % forward exactly to the current destination-tree node.
            newAcceleration_deg_s2 = nearestNodeState(6:7) - ...
                appliedJerk_deg_s3 * timeStep_s;
            newVelocity_deg_s = nearestNodeState(4:5) - ...
                nearestNodeState(6:7) * timeStep_s + ...
                0.5 * appliedJerk_deg_s3 * timeStep_s^2;
            newPosition_deg = nearestNodeState(2:3) - ...
                nearestNodeState(4:5) * timeStep_s + ...
                0.5 * nearestNodeState(6:7) * timeStep_s^2 - ...
                (1 / 6) * appliedJerk_deg_s3 * timeStep_s^3;
            newTime_s = nearestNodeState(1) - timeStep_s;
            candidateState = [newTime_s, newPosition_deg, ...
                newVelocity_deg_s, newAcceleration_deg_s2];
            earlierEdgeState = candidateState;
        end
        if options.AllowAzimuthWrap
            candidateState(2) = limits.azimuth_deg(1) + mod( ...
                candidateState(2) - limits.azimuth_deg(1), 360);
            earlierEdgeState(2) = candidateState(2);
        end

        % --- Section 9: Check Limits And Collision ----------------------
        [edgeIsValid, ~] = checkSimpleBiRRTEdge( ...
            obstacleField, earlierEdgeState, appliedJerk_deg_s3, ...
            timeStep_s, timeBounds_s, limits, options);
        if ~edgeIsValid
            rejectedNodeCount = rejectedNodeCount + 1;
            continue;
        end

        % A fixed parent and fixed jerk produce the same child every time.
        % Keeping a duplicate would consume the node budget without adding
        % a new branch, so repeated seven-state rows are not inserted.
        existingStateAtCandidateTime = abs(activeState(:, 1) - ...
            candidateState(1)) <= options.ConnectionTimeTolerance_s;
        existingStateRows = find(existingStateAtCandidateTime);
        candidateDuplicatesExistingNode = false;
        for existingStateIndex = existingStateRows(:).'
            if options.AllowAzimuthWrap
                existingAzimuthDifference_deg = mod( ...
                    activeState(existingStateIndex, 2) - ...
                    candidateState(2) + 180, 360) - 180;
            else
                existingAzimuthDifference_deg = ...
                    activeState(existingStateIndex, 2) - candidateState(2);
            end
            remainingStateDifference = activeState( ...
                existingStateIndex, 3:7) - candidateState(3:7);
            if abs(existingAzimuthDifference_deg) <= 1e-12 && ...
                    all(abs(remainingStateDifference) <= 1e-12)
                candidateDuplicatesExistingNode = true;
                break;
            end
        end
        if candidateDuplicatesExistingNode
            rejectedNodeCount = rejectedNodeCount + 1;
            continue;
        end

        if options.AllowAzimuthWrap
            candidateAzimuthDifference_deg = mod(candidateState(2) - ...
                sampledState(2) + 180, 360) - 180;
        else
            candidateAzimuthDifference_deg = ...
                candidateState(2) - sampledState(2);
        end
        candidatePositionDistance_deg = hypot( ...
            candidateAzimuthDifference_deg, ...
            candidateState(3) - sampledState(3));
        candidateVelocityDistance_deg_s = norm( ...
            candidateState(4:5) - sampledState(4:5));
        candidateAccelerationDistance_deg_s2 = norm( ...
            candidateState(6:7) - sampledState(6:7));
        candidateTimeDistance_s = abs( ...
            candidateState(1) - sampledState(1));
        candidateDistance = ...
            positionWeight * candidatePositionDistance_deg + ...
            velocityWeight * candidateVelocityDistance_deg_s + ...
            accelerationWeight * candidateAccelerationDistance_deg_s2 + ...
            timeWeight * candidateTimeDistance_s;
        if candidateDistance < bestCandidateDistance
            bestCandidateWasFound = true;
            bestCandidateDistance = candidateDistance;
            bestCandidateState = candidateState;
            bestAppliedJerk_deg_s3 = appliedJerk_deg_s3;
        end
    end
    if ~bestCandidateWasFound
        continue;
    end

    % --- Insert The Best Candidate --------------------------------------
    newNodeIndex = activeTree.NodeCount + 1;
    activeTree.State(newNodeIndex, :) = bestCandidateState;
    activeTree.ParentNodeIndex(newNodeIndex) = uint32(nearestNodeIndex);
    activeTree.AppliedJerk_deg_s3(newNodeIndex, :) = ...
        bestAppliedJerk_deg_s3;
    activeTree.EdgeDuration_s(newNodeIndex) = options.TimeStep_s;
    activeTree.NodeCount = newNodeIndex;
    if expandingInitialTree
        initialTree = activeTree;
    else
        destinationTree = activeTree;
    end

    % --- Section 10: Attempt To Connect The Trees ----------------------
    % A connection is either a same-time state match or one final
    % constant-jerk edge no longer than TimeStep_s. Position alone is never
    % sufficient: time, velocity, acceleration, limits, and collision are
    % all checked before the trees are declared connected.
    if expandingInitialTree
        candidateInitialNodeIndices = newNodeIndex;
        candidateDestinationNodeIndices = (1:destinationTree.NodeCount).';
    else
        candidateInitialNodeIndices = (1:initialTree.NodeCount).';
        candidateDestinationNodeIndices = newNodeIndex;
    end
    if isscalar(candidateInitialNodeIndices)
        initialConnectionState = initialTree.State( ...
            candidateInitialNodeIndices, :);
        destinationConnectionStates = destinationTree.State( ...
            candidateDestinationNodeIndices, :);
        connectionTimeGaps_s = destinationConnectionStates(:, 1) - ...
            initialConnectionState(1);
    else
        initialConnectionStates = initialTree.State( ...
            candidateInitialNodeIndices, :);
        destinationConnectionState = destinationTree.State( ...
            candidateDestinationNodeIndices, :);
        connectionTimeGaps_s = destinationConnectionState(1) - ...
            initialConnectionStates(:, 1);
    end
    connectionTimeIsUsable = connectionTimeGaps_s >= ...
        -options.ConnectionTimeTolerance_s & ...
        connectionTimeGaps_s <= options.TimeStep_s + ...
        options.ConnectionTimeTolerance_s;
    usableConnectionLocations = find(connectionTimeIsUsable);
    if isempty(usableConnectionLocations)
        continue;
    end

    connectionRanking = Inf(size(usableConnectionLocations));
    for usableIndex = 1:numel(usableConnectionLocations)
        connectionLocation = usableConnectionLocations(usableIndex);
        if isscalar(candidateInitialNodeIndices)
            earlierState = initialTree.State( ...
                candidateInitialNodeIndices, :);
            laterState = destinationTree.State( ...
                candidateDestinationNodeIndices(connectionLocation), :);
        else
            earlierState = initialTree.State( ...
                candidateInitialNodeIndices(connectionLocation), :);
            laterState = destinationTree.State( ...
                candidateDestinationNodeIndices, :);
        end
        if options.AllowAzimuthWrap
            connectionAzimuthDifference_deg = mod( ...
                laterState(2) - earlierState(2) + 180, 360) - 180;
        else
            connectionAzimuthDifference_deg = ...
                laterState(2) - earlierState(2);
        end
        connectionRanking(usableIndex) = hypot( ...
            connectionAzimuthDifference_deg, ...
            laterState(3) - earlierState(3)) + ...
            velocityWeight * norm(laterState(4:5) - earlierState(4:5)) + ...
            accelerationWeight * norm( ...
            laterState(6:7) - earlierState(6:7));
    end
    [~, connectionOrder] = sort(connectionRanking);
    for connectionOrderIndex = 1:numel(connectionOrder)
        connectionLocation = usableConnectionLocations( ...
            connectionOrder(connectionOrderIndex));
        if isscalar(candidateInitialNodeIndices)
            trialInitialNodeIndex = candidateInitialNodeIndices;
            trialDestinationNodeIndex = ...
                candidateDestinationNodeIndices(connectionLocation);
        else
            trialInitialNodeIndex = ...
                candidateInitialNodeIndices(connectionLocation);
            trialDestinationNodeIndex = candidateDestinationNodeIndices;
        end
        earlierState = initialTree.State(trialInitialNodeIndex, :);
        laterState = destinationTree.State(trialDestinationNodeIndex, :);
        trialDuration_s = laterState(1) - earlierState(1);
        if abs(trialDuration_s) <= options.ConnectionTimeTolerance_s
            trialDuration_s = 0;
            trialJerkCommands_deg_s3 = [0, 0];
        else
            trialJerkCommands_deg_s3 = jerkCommands_deg_s3;
        end
        bestTrialResidual = Inf;
        bestTrialJerk_deg_s3 = [0, 0];
        trialConnectionWasFound = false;
        for trialJerkIndex = 1:size(trialJerkCommands_deg_s3, 1)
            trialJerk_deg_s3 = ...
                trialJerkCommands_deg_s3(trialJerkIndex, :);
            if trialDuration_s == 0
                trialEdgeIsValid = true;
                predictedLaterState = earlierState;
            else
                [trialEdgeIsValid, predictedLaterState] = ...
                    checkSimpleBiRRTEdge(obstacleField, earlierState, ...
                    trialJerk_deg_s3, trialDuration_s, timeBounds_s, ...
                    limits, options);
            end
            if ~trialEdgeIsValid
                continue;
            end
            if options.AllowAzimuthWrap
                predictedAzimuthError_deg = mod( ...
                    predictedLaterState(2) - laterState(2) + 180, 360) - 180;
            else
                predictedAzimuthError_deg = ...
                    predictedLaterState(2) - laterState(2);
            end
            positionError_deg = [predictedAzimuthError_deg, ...
                predictedLaterState(3) - laterState(3)];
            velocityError_deg_s = ...
                predictedLaterState(4:5) - laterState(4:5);
            accelerationError_deg_s2 = ...
                predictedLaterState(6:7) - laterState(6:7);
            timeError_s = predictedLaterState(1) - laterState(1);
            connectionStateMatches = all(abs(positionError_deg) <= ...
                options.ConnectionPositionTolerance_deg) && ...
                all(abs(velocityError_deg_s) <= ...
                options.ConnectionVelocityTolerance_deg_s) && ...
                all(abs(accelerationError_deg_s2) <= ...
                options.ConnectionAccelerationTolerance_deg_s2) && ...
                abs(timeError_s) <= options.ConnectionTimeTolerance_s;
            if ~connectionStateMatches
                continue;
            end
            normalizedResidual = norm(positionError_deg ./ ...
                options.ConnectionPositionTolerance_deg) + ...
                norm(velocityError_deg_s ./ ...
                options.ConnectionVelocityTolerance_deg_s) + ...
                norm(accelerationError_deg_s2 ./ ...
                options.ConnectionAccelerationTolerance_deg_s2);
            if normalizedResidual < bestTrialResidual
                bestTrialResidual = normalizedResidual;
                bestTrialJerk_deg_s3 = trialJerk_deg_s3;
                trialConnectionWasFound = true;
            end
        end
        if trialConnectionWasFound
            connectionWasFound = true;
            connectionInitialNodeIndex = trialInitialNodeIndex;
            connectionDestinationNodeIndex = trialDestinationNodeIndex;
            connectionJerk_deg_s3 = bestTrialJerk_deg_s3;
            connectionDuration_s = trialDuration_s;
            break;
        end
    end
    if connectionWasFound
        break;
    end
end

%% Section 11: Reconstruct The Forward-Time Trajectory
trajectoryTime_s = zeros(0, 1);
trajectoryPosition_deg = zeros(0, 2);
trajectoryPositionUnwrapped_deg = zeros(0, 2);
trajectoryVelocity_deg_s = zeros(0, 2);
trajectoryAcceleration_deg_s2 = zeros(0, 2);
trajectoryJerk_deg_s3 = zeros(0, 2);
trajectoryIsWaiting = false(0, 1);
forwardDynamicsValidated = false;
exactCollisionValidated = false;
if connectionWasFound
    [trajectoryState, trajectoryJerk_deg_s3] = ...
        reconstructSimpleBiRRTBranches(initialTree, destinationTree, ...
        connectionInitialNodeIndex, connectionDestinationNodeIndex, ...
        connectionJerk_deg_s3, connectionDuration_s, ...
        options.ConnectionTimeTolerance_s);
    trajectoryTime_s = trajectoryState(:, 1);
    trajectoryPosition_deg = trajectoryState(:, 2:3);
    trajectoryVelocity_deg_s = trajectoryState(:, 4:5);
    trajectoryAcceleration_deg_s2 = trajectoryState(:, 6:7);

    trajectoryPositionUnwrapped_deg = trajectoryPosition_deg;
    for trajectoryIndex = 2:size(trajectoryPosition_deg, 1)
        if options.AllowAzimuthWrap
            azimuthStep_deg = mod( ...
                trajectoryPosition_deg(trajectoryIndex, 1) - ...
                trajectoryPosition_deg(trajectoryIndex - 1, 1) + ...
                180, 360) - 180;
        else
            azimuthStep_deg = trajectoryPosition_deg(trajectoryIndex, 1) - ...
                trajectoryPosition_deg(trajectoryIndex - 1, 1);
        end
        trajectoryPositionUnwrapped_deg(trajectoryIndex, 1) = ...
            trajectoryPositionUnwrapped_deg(trajectoryIndex - 1, 1) + ...
            azimuthStep_deg;
    end

    trajectoryIsWaiting = false(size(trajectoryTime_s));
    holdDynamicsTolerance = 1e-12;
    for trajectoryIndex = 2:numel(trajectoryTime_s)
        previousIndex = trajectoryIndex - 1;
        if options.AllowAzimuthWrap
            azimuthChange_deg = mod( ...
                trajectoryPosition_deg(trajectoryIndex, 1) - ...
                trajectoryPosition_deg(previousIndex, 1) + 180, 360) - 180;
        else
            azimuthChange_deg = ...
                trajectoryPosition_deg(trajectoryIndex, 1) - ...
                trajectoryPosition_deg(previousIndex, 1);
        end
        positionDidNotChange = ...
            abs(azimuthChange_deg) <= options.WaitingTolerance_deg && ...
            abs(trajectoryPosition_deg(trajectoryIndex, 2) - ...
            trajectoryPosition_deg(previousIndex, 2)) <= ...
            options.WaitingTolerance_deg;
        dynamicsDescribeTrueHold = all(abs( ...
            trajectoryVelocity_deg_s(previousIndex, :)) <= ...
            holdDynamicsTolerance) && all(abs( ...
            trajectoryAcceleration_deg_s2(previousIndex, :)) <= ...
            holdDynamicsTolerance) && all(abs( ...
            trajectoryJerk_deg_s3(trajectoryIndex, :)) <= ...
            holdDynamicsTolerance);
        trajectoryIsWaiting(trajectoryIndex) = ...
            positionDidNotChange && dynamicsDescribeTrueHold;
    end

    % Re-run every reconstructed edge from its earlier stored state. The
    % connection tolerances are also the explicit numerical acceptance
    % tolerances for the one possible tree-to-tree splice.
    timeMovesForward = all(diff(trajectoryTime_s) > 0);
    dynamicsAreConsistent = timeMovesForward;
    everyEdgeIsCollisionFree = timeMovesForward;
    for trajectoryIndex = 1:numel(trajectoryTime_s) - 1
        edgeDuration_s = trajectoryTime_s(trajectoryIndex + 1) - ...
            trajectoryTime_s(trajectoryIndex);
        [edgeIsValid, predictedNextState] = checkSimpleBiRRTEdge( ...
            obstacleField, trajectoryState(trajectoryIndex, :), ...
            trajectoryJerk_deg_s3(trajectoryIndex + 1, :), ...
            edgeDuration_s, timeBounds_s, limits, options);
        expectedNextState = trajectoryState(trajectoryIndex + 1, :);
        if options.AllowAzimuthWrap
            predictedAzimuthError_deg = mod(predictedNextState(2) - ...
                expectedNextState(2) + 180, 360) - 180;
        else
            predictedAzimuthError_deg = ...
                predictedNextState(2) - expectedNextState(2);
        end
        positionError_deg = [predictedAzimuthError_deg, ...
            predictedNextState(3) - expectedNextState(3)];
        velocityError_deg_s = ...
            predictedNextState(4:5) - expectedNextState(4:5);
        accelerationError_deg_s2 = ...
            predictedNextState(6:7) - expectedNextState(6:7);
        timeError_s = predictedNextState(1) - expectedNextState(1);
        dynamicsAreConsistent = dynamicsAreConsistent && ...
            all(abs(positionError_deg) <= ...
            options.ConnectionPositionTolerance_deg) && ...
            all(abs(velocityError_deg_s) <= ...
            options.ConnectionVelocityTolerance_deg_s) && ...
            all(abs(accelerationError_deg_s2) <= ...
            options.ConnectionAccelerationTolerance_deg_s2) && ...
            abs(timeError_s) <= options.ConnectionTimeTolerance_s;
        everyEdgeIsCollisionFree = everyEdgeIsCollisionFree && edgeIsValid;
    end
    forwardDynamicsValidated = dynamicsAreConsistent;
    exactCollisionValidated = everyEdgeIsCollisionFree;
    if ~forwardDynamicsValidated || ~exactCollisionValidated
        connectionWasFound = false;
        trajectoryTime_s = zeros(0, 1);
        trajectoryPosition_deg = zeros(0, 2);
        trajectoryPositionUnwrapped_deg = zeros(0, 2);
        trajectoryVelocity_deg_s = zeros(0, 2);
        trajectoryAcceleration_deg_s2 = zeros(0, 2);
        trajectoryJerk_deg_s3 = zeros(0, 2);
        trajectoryIsWaiting = false(0, 1);
    end
end

%% Section 12: Package The Result
initialTree.State = initialTree.State(1:initialTree.NodeCount, :);
initialTree.ParentNodeIndex = ...
    initialTree.ParentNodeIndex(1:initialTree.NodeCount);
initialTree.AppliedJerk_deg_s3 = ...
    initialTree.AppliedJerk_deg_s3(1:initialTree.NodeCount, :);
initialTree.EdgeDuration_s = ...
    initialTree.EdgeDuration_s(1:initialTree.NodeCount);
destinationTree.State = ...
    destinationTree.State(1:destinationTree.NodeCount, :);
destinationTree.ParentNodeIndex = ...
    destinationTree.ParentNodeIndex(1:destinationTree.NodeCount);
destinationTree.AppliedJerk_deg_s3 = ...
    destinationTree.AppliedJerk_deg_s3(1:destinationTree.NodeCount, :);
destinationTree.EdgeDuration_s = ...
    destinationTree.EdgeDuration_s(1:destinationTree.NodeCount);

if connectionWasFound
    success = true;
    message = "Simple bidirectional kinodynamic RRT trajectory found.";
    if options.AllowAzimuthWrap
        azimuthChange_deg = mod(diff( ...
            trajectoryPosition_deg(:, 1)) + 180, 360) - 180;
    else
        azimuthChange_deg = diff(trajectoryPosition_deg(:, 1));
    end
    elevationChange_deg = diff(trajectoryPosition_deg(:, 2));
    totalCost = sum(hypot( ...
        azimuthChange_deg, elevationChange_deg));
    connectionNodeIndices = [connectionInitialNodeIndex, ...
        connectionDestinationNodeIndex];
else
    success = false;
    if forwardDynamicsValidated && ~exactCollisionValidated
        message = "A tree connection failed final collision validation.";
    elseif ~forwardDynamicsValidated && exactCollisionValidated
        message = "A tree connection failed forward-dynamics validation.";
    else
        message = "No collision-free kinodynamic tree connection was " + ...
            "found within the configured iteration and node limits.";
    end
    totalCost = Inf;
    connectionNodeIndices = [0, 0];
    connectionInitialNodeIndex = 0;
    connectionDestinationNodeIndex = 0;
    connectionJerk_deg_s3 = [0, 0];
    connectionDuration_s = 0;
end
generatedNodeCount = initialTree.NodeCount + destinationTree.NodeCount;
connection = struct( ...
    "InitialNodeIndex", connectionInitialNodeIndex, ...
    "DestinationNodeIndex", connectionDestinationNodeIndex, ...
    "AppliedJerk_deg_s3", connectionJerk_deg_s3, ...
    "Duration_s", connectionDuration_s);
plan = struct( ...
    "success", success, ...
    "message", message, ...
    "time_s", trajectoryTime_s, ...
    "position_deg", trajectoryPosition_deg, ...
    "positionUnwrapped_deg", trajectoryPositionUnwrapped_deg, ...
    "velocity_deg_s", trajectoryVelocity_deg_s, ...
    "acceleration_deg_s2", trajectoryAcceleration_deg_s2, ...
    "jerk_deg_s3", trajectoryJerk_deg_s3, ...
    "isWaiting", trajectoryIsWaiting, ...
    "initialTree", initialTree, ...
    "destinationTree", destinationTree, ...
    "connectionNodeIndices", connectionNodeIndices, ...
    "connection", connection, ...
    "iterationCount", iterationCount, ...
    "generatedNodeCount", generatedNodeCount, ...
    "generatedCandidateCount", candidateControlCount, ...
    "rejectedNodeCount", rejectedNodeCount, ...
    "totalCost", totalCost, ...
    "exactCollisionValidated", exactCollisionValidated, ...
    "forwardDynamicsValidated", forwardDynamicsValidated, ...
    "continuousCollisionGuaranteed", false, ...
    "workspace", obstacleField, ...
    "obstacleField", obstacleField, ...
    "limits", limits, ...
    "options", options, ...
    "stateColumnNames", stateColumnNames);
end

function options = defaultSimpleBiRRTOptions()
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultSimpleBiRRTOptions()
%**************************************************************************
% PURPOSE
%   - Keep every public simple bidirectional RRT default in one place.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated planner options.
%**************************************************************************
% UNITS
%   - Option names carry their physical units where applicable.
options = struct( ...
    "TimeStep_s", 1, ...
    "CollisionCheckStep_s", 0.1, ...
    "DestinationSampleProbability", 0.15, ...
    "JerkCommands_deg_s3", zeros(0, 2), ...
    "PositionWeight", 1, ...
    "VelocityWeight", 0.5, ...
    "AccelerationWeight", 0.25, ...
    "TimeWeight", 0.05, ...
    "ConnectionPositionTolerance_deg", [0.5, 0.5], ...
    "ConnectionVelocityTolerance_deg_s", [0.5, 0.5], ...
    "ConnectionAccelerationTolerance_deg_s2", [0.5, 0.5], ...
    "ConnectionTimeTolerance_s", 1e-9, ...
    "WaitingTolerance_deg", 1e-9, ...
    "AllowAzimuthWrap", true, ...
    "MaximumIterations", 5000, ...
    "MaximumTreeNodes", 3000, ...
    "RandomSeed", 7, ...
    "CollisionQueryOptions", struct(), ...
    "MaximumObstacleVerticesPerRegion", Inf);
end

function options = resolveSimpleBiRRTOptions( ...
        providedOptions, defaultOptions, limits)
%% Section 0: Header & Readme
% SYNTAX
%   options = resolveSimpleBiRRTOptions(provided, defaults, limits)
%**************************************************************************
% PURPOSE
%   - Merge, validate, and finish the simple bidirectional RRT options.
%**************************************************************************
% INPUTS
%   - providedOptions (scalar struct)
%       Caller overrides.
%   - defaultOptions (scalar struct)
%       Complete defaults from defaultSimpleBiRRTOptions.
%   - limits (scalar struct)
%       Kinodynamic limits used to construct default jerk commands.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Resolved and validated planner options.
%**************************************************************************
% UNITS
%   - Option names carry their physical units where applicable.
unknownOptionFields = setdiff(fieldnames(providedOptions), ...
    fieldnames(defaultOptions), "stable");
if ~isempty(unknownOptionFields)
    warning("planSimpleAzElTimeKinodynamicBiRRT:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    providedOptions = rmfield(providedOptions, unknownOptionFields);
end
options = defaultOptions;
providedOptionFields = fieldnames(providedOptions);
for optionIndex = 1:numel(providedOptionFields)
    optionName = providedOptionFields{optionIndex};
    if ~isempty(providedOptions.(optionName))
        options.(optionName) = providedOptions.(optionName);
    end
end
validateattributes(options.TimeStep_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.CollisionCheckStep_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.DestinationSampleProbability, {'numeric'}, ...
    {'scalar', 'real', 'finite', '>=', 0, '<=', 1});
weightNames = ["PositionWeight", "VelocityWeight", ...
    "AccelerationWeight", "TimeWeight"];
for weightIndex = 1:numel(weightNames)
    validateattributes(options.(weightNames(weightIndex)), {'numeric'}, ...
        {'scalar', 'real', 'finite', 'nonnegative'});
end
if all([options.PositionWeight, options.VelocityWeight, ...
        options.AccelerationWeight, options.TimeWeight] == 0)
    error("planSimpleAzElTimeKinodynamicBiRRT:ZeroDistanceMetric", ...
        "At least one state-distance weight must be positive.");
end
vectorToleranceNames = ["ConnectionPositionTolerance_deg", ...
    "ConnectionVelocityTolerance_deg_s", ...
    "ConnectionAccelerationTolerance_deg_s2"];
for toleranceIndex = 1:numel(vectorToleranceNames)
    toleranceName = vectorToleranceNames(toleranceIndex);
    validateattributes(options.(toleranceName), {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite', 'positive'});
    options.(toleranceName) = double(options.(toleranceName)(:).');
end
validateattributes(options.ConnectionTimeTolerance_s, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
validateattributes(options.WaitingTolerance_deg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
validateattributes(options.AllowAzimuthWrap, {'logical', 'numeric'}, ...
    {'scalar'});
options.AllowAzimuthWrap = logical(options.AllowAzimuthWrap);
validateattributes(options.MaximumIterations, {'numeric'}, ...
    {'scalar', 'integer', 'positive'});
validateattributes(options.MaximumTreeNodes, {'numeric'}, ...
    {'scalar', 'integer', '>=', 2});
validateattributes(options.RandomSeed, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative', '<=', 2^32 - 1});
if ~isstruct(options.CollisionQueryOptions) || ...
        ~isscalar(options.CollisionQueryOptions)
    error("planSimpleAzElTimeKinodynamicBiRRT:InvalidCollisionOptions", ...
        "CollisionQueryOptions must be a scalar struct.");
end
validateattributes(options.MaximumObstacleVerticesPerRegion, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
if isfinite(options.MaximumObstacleVerticesPerRegion)
    validateattributes(options.MaximumObstacleVerticesPerRegion, ...
        {'numeric'}, {'integer', '>=', 4});
end

if isempty(options.JerkCommands_deg_s3)
    azimuthJerkValues_deg_s3 = unique([ ...
        -limits.maxJerk_deg_s3(1), 0, limits.maxJerk_deg_s3(1)]);
    elevationJerkValues_deg_s3 = unique([ ...
        -limits.maxJerk_deg_s3(2), 0, limits.maxJerk_deg_s3(2)]);
    [azimuthJerkMesh_deg_s3, elevationJerkMesh_deg_s3] = ndgrid( ...
        azimuthJerkValues_deg_s3, elevationJerkValues_deg_s3);
    options.JerkCommands_deg_s3 = [ ...
        azimuthJerkMesh_deg_s3(:), elevationJerkMesh_deg_s3(:)];
else
    validateattributes(options.JerkCommands_deg_s3, {'numeric'}, ...
        {'2d', 'real', 'finite', 'ncols', 2, 'nonempty'});
    options.JerkCommands_deg_s3 = ...
        double(options.JerkCommands_deg_s3);
end
jerkIsInsideLimits = all(abs(options.JerkCommands_deg_s3) <= ...
    limits.maxJerk_deg_s3 + 1e-12, 2);
if ~all(jerkIsInsideLimits)
    error("planSimpleAzElTimeKinodynamicBiRRT:JerkOutsideLimits", ...
        "Every JerkCommands_deg_s3 row must satisfy maxJerk_deg_s3.");
end
options.JerkCommands_deg_s3 = unique( ...
    options.JerkCommands_deg_s3, "rows", "stable");
end

function [edgeIsValid, terminalState] = checkSimpleBiRRTEdge( ...
        obstacleField, initialEdgeState, appliedJerk_deg_s3, ...
        edgeDuration_s, timeBounds_s, limits, options)
%% Section 0: Header & Readme
% SYNTAX
%   [valid, terminalState] = checkSimpleBiRRTEdge( ...
%       obstacleField, initialState, jerk, duration, timeBounds, ...
%       limits, options)
%**************************************************************************
% PURPOSE
%   - Sample one complete constant-jerk edge, enforce every state limit,
%     and query the original packed time-varying polygons.
%**************************************************************************
% INPUTS
%   - obstacleField (scalar struct)
%       Packed time-varying azimuth/elevation polygons.
%   - initialEdgeState (1-by-7 numeric row)
%       Earlier forward-time state.
%   - appliedJerk_deg_s3 (1-by-2 numeric row)
%       Constant jerk command over the edge.
%   - edgeDuration_s (nonnegative scalar)
%       Forward edge duration.
%   - timeBounds_s (1-by-2 numeric row)
%       Initial and destination times.
%   - limits (scalar struct)
%       Position and kinodynamic limits.
%   - options (scalar struct)
%       Collision interval, wrapping, and collision query settings.
%**************************************************************************
% OUTPUTS
%   - edgeIsValid (logical scalar)
%       True when all sampled states satisfy limits and avoid obstacles.
%   - terminalState (1-by-7 numeric row)
%       Forward-propagated state at edgeDuration_s.
%**************************************************************************
% UNITS
%   - State and command units follow the public planner.
if edgeDuration_s < 0
    edgeIsValid = false;
    terminalState = nan(1, 7);
    return;
end
if edgeDuration_s == 0
    elapsedTime_s = 0;
else
    elapsedTime_s = (0:options.CollisionCheckStep_s:edgeDuration_s).';
    if elapsedTime_s(end) < edgeDuration_s - 1e-12
        elapsedTime_s(end + 1, 1) = edgeDuration_s;
    else
        elapsedTime_s(end) = edgeDuration_s;
    end
end
sampledTime_s = initialEdgeState(1) + elapsedTime_s;
sampledAcceleration_deg_s2 = initialEdgeState(6:7) + ...
    elapsedTime_s .* appliedJerk_deg_s3;
sampledVelocity_deg_s = initialEdgeState(4:5) + ...
    elapsedTime_s .* initialEdgeState(6:7) + ...
    0.5 * elapsedTime_s.^2 .* appliedJerk_deg_s3;
sampledPosition_deg = initialEdgeState(2:3) + ...
    elapsedTime_s .* initialEdgeState(4:5) + ...
    0.5 * elapsedTime_s.^2 .* initialEdgeState(6:7) + ...
    (1 / 6) * elapsedTime_s.^3 .* appliedJerk_deg_s3;
if options.AllowAzimuthWrap
    sampledPosition_deg(:, 1) = limits.azimuth_deg(1) + mod( ...
        sampledPosition_deg(:, 1) - limits.azimuth_deg(1), 360);
end
terminalState = [sampledTime_s(end), sampledPosition_deg(end, :), ...
    sampledVelocity_deg_s(end, :), sampledAcceleration_deg_s2(end, :)];

limitTolerance = 1e-12;
timeIsInsideLimits = all(sampledTime_s >= ...
    timeBounds_s(1) - limitTolerance & sampledTime_s <= ...
    timeBounds_s(2) + limitTolerance);
if options.AllowAzimuthWrap
    azimuthIsInsideLimits = true;
else
    azimuthIsInsideLimits = all(sampledPosition_deg(:, 1) >= ...
        limits.azimuth_deg(1) - limitTolerance & ...
        sampledPosition_deg(:, 1) <= ...
        limits.azimuth_deg(2) + limitTolerance);
end
elevationIsInsideLimits = all(sampledPosition_deg(:, 2) >= ...
    limits.elevation_deg(1) - limitTolerance & ...
    sampledPosition_deg(:, 2) <= ...
    limits.elevation_deg(2) + limitTolerance);
velocityIsInsideLimits = all(all(abs(sampledVelocity_deg_s) <= ...
    limits.maxVelocity_deg_s + limitTolerance));
accelerationIsInsideLimits = all(all(abs( ...
    sampledAcceleration_deg_s2) <= ...
    limits.maxAcceleration_deg_s2 + limitTolerance));
jerkIsInsideLimits = all(abs(appliedJerk_deg_s3) <= ...
    limits.maxJerk_deg_s3 + limitTolerance);
if ~timeIsInsideLimits || ~azimuthIsInsideLimits || ...
        ~elevationIsInsideLimits || ~velocityIsInsideLimits || ...
        ~accelerationIsInsideLimits || ~jerkIsInsideLimits
    edgeIsValid = false;
    return;
end

sampleIsOccupied = queryAzElTimeObstacle(obstacleField, ...
    sampledPosition_deg(:, 1), sampledPosition_deg(:, 2), ...
    sampledTime_s, options.CollisionQueryOptions);
edgeIsValid = ~any(sampleIsOccupied);
end

function [trajectoryState, trajectoryJerk_deg_s3] = ...
        reconstructSimpleBiRRTBranches(initialTree, destinationTree, ...
        initialConnectionNodeIndex, destinationConnectionNodeIndex, ...
        connectionJerk_deg_s3, connectionDuration_s, timeTolerance_s)
%% Section 0: Header & Readme
% SYNTAX
%   [state, jerk] = reconstructSimpleBiRRTBranches( ...
%       initialTree, destinationTree, initialIndex, destinationIndex, ...
%       connectionJerk, connectionDuration, timeTolerance)
%**************************************************************************
% PURPOSE
%   - Follow both parent chains, reverse only the initial-tree chain, and
%     assemble one monotonically forward-time state and control sequence.
%**************************************************************************
% INPUTS
%   - initialTree, destinationTree (scalar structs)
%       Inspectable bidirectional search trees.
%   - initialConnectionNodeIndex, destinationConnectionNodeIndex
%       Tree rows joined by the accepted connection.
%   - connectionJerk_deg_s3 (1-by-2 numeric row)
%       Forward jerk command across a positive-duration connection.
%   - connectionDuration_s (nonnegative scalar)
%       Connection duration. Zero identifies a same-time state match.
%   - timeTolerance_s (positive scalar)
%       Numerical same-time tolerance.
%**************************************************************************
% OUTPUTS
%   - trajectoryState (N-by-7 numeric array)
%       Initial-to-destination state rows.
%   - trajectoryJerk_deg_s3 (N-by-2 numeric array)
%       Incoming edge jerk per row; the first row is zero.
%**************************************************************************
% UNITS
%   - State and command units follow the public planner.
initialNodeIndices = zeros(initialTree.NodeCount, 1);
writeIndex = initialTree.NodeCount;
currentNodeIndex = initialConnectionNodeIndex;
while currentNodeIndex ~= 0
    initialNodeIndices(writeIndex) = currentNodeIndex;
    writeIndex = writeIndex - 1;
    currentNodeIndex = double( ...
        initialTree.ParentNodeIndex(currentNodeIndex));
end
initialNodeIndices = initialNodeIndices(writeIndex + 1:end);

destinationNodeIndices = zeros(destinationTree.NodeCount, 1);
destinationCount = 0;
currentNodeIndex = destinationConnectionNodeIndex;
while currentNodeIndex ~= 0
    destinationCount = destinationCount + 1;
    destinationNodeIndices(destinationCount) = currentNodeIndex;
    currentNodeIndex = double( ...
        destinationTree.ParentNodeIndex(currentNodeIndex));
end
destinationNodeIndices = destinationNodeIndices(1:destinationCount);

initialBranchState = initialTree.State(initialNodeIndices, :);
initialBranchJerk_deg_s3 = zeros(numel(initialNodeIndices), 2);
for branchIndex = 2:numel(initialNodeIndices)
    initialBranchJerk_deg_s3(branchIndex, :) = ...
        initialTree.AppliedJerk_deg_s3(initialNodeIndices(branchIndex), :);
end
destinationBranchState = destinationTree.State( ...
    destinationNodeIndices, :);

if connectionDuration_s > timeTolerance_s
    trajectoryState = [initialBranchState; destinationBranchState];
    destinationIncomingJerk_deg_s3 = zeros( ...
        numel(destinationNodeIndices), 2);
    destinationIncomingJerk_deg_s3(1, :) = connectionJerk_deg_s3;
    for branchIndex = 2:numel(destinationNodeIndices)
        destinationIncomingJerk_deg_s3(branchIndex, :) = ...
            destinationTree.AppliedJerk_deg_s3( ...
            destinationNodeIndices(branchIndex - 1), :);
    end
    trajectoryJerk_deg_s3 = [initialBranchJerk_deg_s3; ...
        destinationIncomingJerk_deg_s3];
else
    % Same-time states have already passed the complete state tolerance.
    % Keep the initial-tree representative and continue with the first
    % positive-duration destination edge, avoiding duplicate timestamps.
    trajectoryState = [initialBranchState; destinationBranchState(2:end, :)];
    destinationIncomingJerk_deg_s3 = zeros( ...
        max(numel(destinationNodeIndices) - 1, 0), 2);
    for branchIndex = 2:numel(destinationNodeIndices)
        destinationIncomingJerk_deg_s3(branchIndex - 1, :) = ...
            destinationTree.AppliedJerk_deg_s3( ...
            destinationNodeIndices(branchIndex - 1), :);
    end
    trajectoryJerk_deg_s3 = [initialBranchJerk_deg_s3; ...
        destinationIncomingJerk_deg_s3];
end
end
