function [occupied, obstacleIndex, details] = queryAzElTimeObstacle( ...
        workspace, azimuthDeg, elevationDeg, queryTime, options)
%QUERYAZELTIMEOBSTACLE Test points against packed az/el/time obstacles.
%
% occupied = queryAzElTimeObstacle(workspace, az, el, time)
% [occupied, obstacleIndex] = queryAzElTimeObstacle(...)
%
% time may be a datetime array or numeric seconds from
% workspace.ReferenceTime. Scalar inputs expand to match vector inputs.
%
% Options:
%   CollisionMode       "polygon" (default) for an exact narrow phase, or
%                       "bounds" for a faster conservative rectangle test.
%   TimePaddingSamples  Also test neighboring slices (default 0). Set to 1
%                       for conservative avoidance between time samples.
%   BoundsMarginDeg     [azimuth elevation] broad-phase margin (default 0).
%   SafetyMarginDeg     Euclidean clearance from polygon edges (default 0).

%% Normalize options and workspace
if nargin < 5
    options = struct();
end
if ~isstruct(workspace) || ~isfield(workspace, "Format") || ...
        workspace.Format ~= "AzElTimeObstacleWorkspace"
    workspace = buildAzElTimeObstacleWorkspace(workspace);
end
defaultOptions = struct( ...
    "CollisionMode", "polygon", ...
    "TimePaddingSamples", 0, ...
    "BoundsMarginDeg", [0 0], ...
    "SafetyMarginDeg", 0);
defaultOptionFields = fieldnames(defaultOptions);
for defaultOptionIndex = 1:numel(defaultOptionFields)
    defaultOptionField = defaultOptionFields{defaultOptionIndex};
    if ~isfield(options, defaultOptionField) || ...
            isempty(options.(defaultOptionField))
        options.(defaultOptionField) = defaultOptions.(defaultOptionField);
    end
end
collisionMode = lower(string(options.CollisionMode));
if ~any(collisionMode == ["polygon", "bounds"])
    error("queryAzElTimeObstacle:InvalidMode", ...
        "CollisionMode must be 'polygon' or 'bounds'.");
end
validateattributes(options.TimePaddingSamples, {'numeric'}, ...
    {'scalar', 'integer', 'nonnegative'});
validateattributes(options.BoundsMarginDeg, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite', 'nonnegative'});
validateattributes(options.SafetyMarginDeg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'nonnegative'});
workspaceHasRequiredFields = isstruct(workspace) && ...
    isfield(workspace, "Format") && ...
    workspace.Format == "AzElTimeObstacleWorkspace" && ...
    isfield(workspace, "Obstacles") && ...
    isfield(workspace, "ReferenceTime");
if ~workspaceHasRequiredFields
    error("queryAzElTimeObstacle:InvalidWorkspace", ...
        "Use buildAzElTimeObstacleWorkspace to create the workspace.");
end

%% Broadcast query coordinates and time to one shape
if isdatetime(queryTime)
    queryTime.TimeZone = "UTC";
    timeSeconds = seconds(queryTime - workspace.ReferenceTime);
elseif isnumeric(queryTime)
    timeSeconds = double(queryTime);
else
    error("queryAzElTimeObstacle:InvalidTime", ...
        "queryTime must be datetime or seconds from ReferenceTime.");
end
queryValues = {double(azimuthDeg), double(elevationDeg), ...
    double(timeSeconds)};
queryElementCounts = zeros(1, 3);
for queryValueIndex = 1:3
    queryElementCounts(queryValueIndex) = numel( ...
        queryValues{queryValueIndex});
end
nonScalarCounts = queryElementCounts(queryElementCounts > 1);
if isempty(nonScalarCounts)
    outputSize = size(queryValues{1});
    targetQueryCount = 1;
elseif any(nonScalarCounts ~= nonScalarCounts(1))
    error("queryAzElTimeObstacle:SizeMismatch", ...
        "Non-scalar azimuth, elevation, and time inputs must have equal size.");
else
    targetQueryCount = nonScalarCounts(1);
    shapeSourceIndex = find( ...
        queryElementCounts == targetQueryCount, 1);
    outputSize = size(queryValues{shapeSourceIndex});
end
for queryValueIndex = 1:3
    if queryElementCounts(queryValueIndex) == 1
        queryValues{queryValueIndex} = repmat( ...
            queryValues{queryValueIndex}, targetQueryCount, 1);
    elseif ~isequal(size(queryValues{queryValueIndex}), outputSize)
        queryValues{queryValueIndex} = reshape( ...
            queryValues{queryValueIndex}, outputSize);
    end
    queryValues{queryValueIndex} = queryValues{queryValueIndex}(:);
end
azimuthDeg = queryValues{1};
elevationDeg = queryValues{2};
timeSeconds = queryValues{3};
queryCount = numel(azimuthDeg);
occupied = false(queryCount, 1);
obstacleIndex = zeros(queryCount, 1, "uint32");

%% Test unresolved queries against each packed obstacle
for obstacleNumber = 1:numel(workspace.Obstacles)
    % Once one obstacle claims a query, later obstacles cannot change its
    % boolean result or diagnostic owner.
    unresolvedQuery = ~occupied & isfinite(azimuthDeg) & ...
        isfinite(elevationDeg) & isfinite(timeSeconds);
    if ~any(unresolvedQuery)
        break;
    end
    obstacle = workspace.Obstacles(obstacleNumber);

    % Uniform time bases map arithmetically. Irregular time bases use nearest
    % interpolation, but neither path extrapolates outside the obstacle span.
    nearestSampleIndex = zeros(size(timeSeconds));
    validQueryTime = false(size(timeSeconds));
    if obstacle.SampleCount > 0
        obstacleTimes = obstacle.TimeSeconds;
        validQueryTime = timeSeconds >= obstacleTimes(1) & ...
            timeSeconds <= obstacleTimes(end);
        if obstacle.SampleCount == 1
            nearestSampleIndex(validQueryTime) = 1;
        elseif obstacle.IsUniformTime
            nearestSampleIndex(validQueryTime) = round(( ...
                timeSeconds(validQueryTime) - obstacleTimes(1)) ./ ...
                obstacle.TimeStepSeconds) + 1;
        else
            sampleNumbers = (1:obstacle.SampleCount).';
            nearestSampleIndex(validQueryTime) = interp1( ...
                obstacleTimes, sampleNumbers, ...
                timeSeconds(validQueryTime), "nearest");
        end
        nearestSampleIndex = round(nearestSampleIndex);
    end
    validQuery = unresolvedQuery & validQueryTime;

    % Padding checks neighboring source slices rather than inventing an
    % interpolated polygon between measured boundaries.
    for sampleOffset = -options.TimePaddingSamples: ...
            options.TimePaddingSamples
        candidateSampleIndex = nearestSampleIndex + sampleOffset;
        candidateQuery = validQuery & candidateSampleIndex >= 1 & ...
            candidateSampleIndex <= obstacle.SampleCount & ~occupied;
        candidateRows = find(candidateQuery);
        if isempty(candidateRows)
            continue;
        end

        %% Reject points outside the conservative slice bounds
        sampledBounds = double(obstacle.BoundsDeg( ...
            candidateSampleIndex(candidateRows), :));
        broadPhaseMargin = options.BoundsMarginDeg + ...
            options.SafetyMarginDeg;
        minimumAzimuth = sampledBounds(:, 1) - broadPhaseMargin(1);
        maximumAzimuth = sampledBounds(:, 2) + broadPhaseMargin(1);
        minimumElevation = sampledBounds(:, 3) - broadPhaseMargin(2);
        maximumElevation = sampledBounds(:, 4) + broadPhaseMargin(2);
        insideBounds = all(isfinite(sampledBounds), 2) & ...
            azimuthDeg(candidateRows) >= minimumAzimuth & ...
            azimuthDeg(candidateRows) <= maximumAzimuth & ...
            elevationDeg(candidateRows) >= minimumElevation & ...
            elevationDeg(candidateRows) <= maximumElevation;
        collisionRows = candidateRows(insideBounds);
        if isempty(collisionRows)
            continue;
        end
        if collisionMode == "bounds"
            newCollisionRows = collisionRows(~occupied(collisionRows));
            occupied(newCollisionRows) = true;
            obstacleIndex(newCollisionRows) = uint32(obstacleNumber);
            continue;
        end

        %% Expand ragged edge ranges once for polygon and margin tests
        collisionSamples = candidateSampleIndex(collisionRows);
        edgeCounts = double(obstacle.EdgeOffsets(collisionSamples + 1) - ...
            obstacle.EdgeOffsets(collisionSamples));
        edgeCounts = edgeCounts(:);
        queryHasEdges = edgeCounts > 0;
        if ~any(queryHasEdges)
            continue;
        end
        activeRows = collisionRows(queryHasEdges);
        activeSamples = collisionSamples(queryHasEdges);
        activeEdgeCounts = edgeCounts(queryHasEdges);
        activeQueryCount = numel(activeSamples);
        totalEdgeCount = sum(activeEdgeCounts);
        edgeOwner = repelem((1:activeQueryCount).', activeEdgeCounts);
        % repelem can preserve a row-shaped repetition argument and return
        % a matrix. Every later edge array is packed as a column, so force
        % the owner map to the same one-edge-per-row invariant before it is
        % used for indexing or accumarray grouping.
        edgeOwner = edgeOwner(:);
        precedingEdgeCounts = cumsum([0; activeEdgeCounts(1:end - 1)]);
        ownerBaseOffset = repelem(precedingEdgeCounts, activeEdgeCounts);
        withinOwnerOffset = (0:totalEdgeCount - 1).' - ...
            ownerBaseOffset(:);
        firstEdgeIndex = double(obstacle.EdgeOffsets(activeSamples));
        repeatedFirstEdgeIndex = repelem( ...
            firstEdgeIndex(:), activeEdgeCounts);
        packedEdgeIndex = repeatedFirstEdgeIndex(:) + withinOwnerOffset;

        edgeStartAzimuth = double( ...
            obstacle.EdgeStartAzimuthDeg(packedEdgeIndex));
        edgeStartElevation = double( ...
            obstacle.EdgeStartElevationDeg(packedEdgeIndex));
        edgeEndAzimuth = double( ...
            obstacle.EdgeEndAzimuthDeg(packedEdgeIndex));
        edgeEndElevation = double( ...
            obstacle.EdgeEndElevationDeg(packedEdgeIndex));
        queryAzimuth = azimuthDeg(activeRows(edgeOwner));
        queryElevation = elevationDeg(activeRows(edgeOwner));
        edgeStartAzimuth = edgeStartAzimuth(:);
        edgeStartElevation = edgeStartElevation(:);
        edgeEndAzimuth = edgeEndAzimuth(:);
        edgeEndElevation = edgeEndElevation(:);
        queryAzimuth = queryAzimuth(:);
        queryElevation = queryElevation(:);

        %% Apply odd-even ray crossing with an explicit boundary test
        edgeStartsAboveQuery = edgeStartElevation > queryElevation;
        edgeEndsAboveQuery = edgeEndElevation > queryElevation;
        verticalStraddle = edgeStartsAboveQuery ~= edgeEndsAboveQuery;
        rayCrossesEdge = false(totalEdgeCount, 1);
        rayCrossesEdge(verticalStraddle) = queryAzimuth( ...
            verticalStraddle) < ...
            edgeStartAzimuth(verticalStraddle) + ( ...
            queryElevation(verticalStraddle) - ...
            edgeStartElevation(verticalStraddle)) .* ( ...
            edgeEndAzimuth(verticalStraddle) - ...
            edgeStartAzimuth(verticalStraddle)) ./ ( ...
            edgeEndElevation(verticalStraddle) - ...
            edgeStartElevation(verticalStraddle));
        crossingCount = accumarray( ...
            edgeOwner, double(rayCrossesEdge), ...
            [activeQueryCount 1], @sum, 0);

        edgeAzimuthDelta = edgeEndAzimuth - edgeStartAzimuth;
        edgeElevationDelta = edgeEndElevation - edgeStartElevation;
        edgeLength = hypot(edgeAzimuthDelta, edgeElevationDelta);
        crossProduct = (queryAzimuth - edgeStartAzimuth) .* ...
            edgeElevationDelta - ...
            (queryElevation - edgeStartElevation) .* edgeAzimuthDelta;
        boundaryTolerance = 1e-7 .* max(1, edgeLength);
        queryOnEdge = abs(crossProduct) <= boundaryTolerance & ...
            queryAzimuth >= min( ...
            edgeStartAzimuth, edgeEndAzimuth) - boundaryTolerance & ...
            queryAzimuth <= max( ...
            edgeStartAzimuth, edgeEndAzimuth) + boundaryTolerance & ...
            queryElevation >= min( ...
            edgeStartElevation, edgeEndElevation) - boundaryTolerance & ...
            queryElevation <= max( ...
            edgeStartElevation, edgeEndElevation) + boundaryTolerance;
        boundaryCount = accumarray( ...
            edgeOwner, double(queryOnEdge), ...
            [activeQueryCount 1], @sum, 0);
        activeCollision = mod(crossingCount, 2) == 1 | boundaryCount > 0;

        %% Add Euclidean edge clearance when requested
        if options.SafetyMarginDeg > 0
            edgeLengthSquared = edgeAzimuthDelta.^2 + ...
                edgeElevationDelta.^2;
            minimumDistanceSquared = inf(totalEdgeCount, 1);
            % Adjacent azimuth images keep clearance continuous at the
            % conventional -180/180 seam.
            for azimuthShift = [-360 0 360]
                shiftedQueryAzimuth = queryAzimuth + azimuthShift;
                edgeFraction = (( ...
                    shiftedQueryAzimuth - edgeStartAzimuth) .* ...
                    edgeAzimuthDelta + ( ...
                    queryElevation - edgeStartElevation) .* ...
                    edgeElevationDelta) ./ ...
                    max(edgeLengthSquared, eps);
                edgeFraction = min(max(edgeFraction, 0), 1);
                closestAzimuth = edgeStartAzimuth + ...
                    edgeFraction .* edgeAzimuthDelta;
                closestElevation = edgeStartElevation + ...
                    edgeFraction .* edgeElevationDelta;
                distanceSquared = ( ...
                    shiftedQueryAzimuth - closestAzimuth).^2 + ...
                    (queryElevation - closestElevation).^2;
                minimumDistanceSquared = min( ...
                    minimumDistanceSquared, distanceSquared);
            end
            squaredSafetyMargin = options.SafetyMarginDeg^2;
            edgeWithinMargin = minimumDistanceSquared <= squaredSafetyMargin;
            nearEdgeCount = accumarray( ...
                edgeOwner, double(edgeWithinMargin), ...
                [activeQueryCount 1], @sum, 0);
            activeCollision = activeCollision | nearEdgeCount > 0;
        end

        newCollisionRows = activeRows(activeCollision & ...
            ~occupied(activeRows));
        occupied(newCollisionRows) = true;
        obstacleIndex(newCollisionRows) = uint32(obstacleNumber);
    end
end

%% Restore caller shape and optional diagnostics
occupied = reshape(occupied, outputSize);
obstacleIndex = reshape(obstacleIndex, outputSize);
if nargout >= 3
    obstacleNames = strings(queryCount, 1);
    flatObstacleIndex = obstacleIndex(:);
    for obstacleNumber = 1:numel(workspace.Obstacles)
        obstacleNames(flatObstacleIndex == obstacleNumber) = workspace.Obstacles( ...
            obstacleNumber).Name;
    end
    details = struct( ...
        "ObstacleName", reshape(obstacleNames, outputSize), ...
        "QueryTimeSeconds", reshape(timeSeconds, outputSize), ...
        "CollisionMode", collisionMode, ...
        "SafetyMarginDeg", options.SafetyMarginDeg);
end
end
