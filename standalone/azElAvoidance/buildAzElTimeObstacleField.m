function obstacleField = buildAzElTimeObstacleField(azElData, options)
%% Section 0: Header & Readme
% SYNTAX
%   options = buildAzElTimeObstacleField()
%   obstacleField = buildAzElTimeObstacleField(azElData)
%   obstacleField = buildAzElTimeObstacleField(azElData, options)
%**************************************************************************
% PURPOSE
%   - Pack validated moving azimuth/elevation polygons for repeated,
%     allocation-light collision queries.
%**************************************************************************
% INPUTS
%   - azElData (struct array or cell array)
%       Canonical obstacle samples. Nested cells and struct arrays are
%       flattened in caller order. NaN vertex rows separate polygon regions.
%   - options (scalar struct)
%       .MaximumVerticesPerRegion (positive integer or Inf)
%           Boundary cap per region. Reduction is uniform index sampling.
%       .ReferenceTime (datetime scalar)
%           UTC epoch corresponding to time_s == 0.
%**************************************************************************
% OUTPUTS
%   - obstacleField (scalar struct)
%       Packed obstacle records, resolved options, and storage diagnostics.
%       A zero-argument call returns the fully populated options structure.
%**************************************************************************
% UNITS
%   - Input boundary fields az_deg and el_deg are degrees.
%   - Input time_s and packed TimeSeconds values are seconds.

%% Section 1: Validate Inputs & Apply Defaults
defaultOptions = defaultAzElTimeObstacleFieldOptions();
if nargin == 0
    obstacleField = defaultOptions;
    return;
end
if nargin < 2 || isempty(options)
    options = struct();
end
if ~isstruct(options) || ~isscalar(options)
    error("buildAzElTimeObstacleField:InvalidOptions", ...
        "options must be a scalar struct.");
end
unknownOptionFields = setdiff( ...
    fieldnames(options), fieldnames(defaultOptions), "stable");
if ~isempty(unknownOptionFields)
    warning("buildAzElTimeObstacleField:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    options = rmfield(options, unknownOptionFields);
end
resolvedOptions = defaultOptions;
providedOptionFields = fieldnames(options);
for optionIndex = 1:numel(providedOptionFields)
    optionName = providedOptionFields{optionIndex};
    if ~isempty(options.(optionName))
        resolvedOptions.(optionName) = options.(optionName);
    end
end
options = resolvedOptions;
validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
    {'scalar', 'real', 'positive'});
if isfinite(options.MaximumVerticesPerRegion)
    validateattributes(options.MaximumVerticesPerRegion, {'numeric'}, ...
        {'integer', '>=', 4});
end
maximumVertices = options.MaximumVerticesPerRegion;

% The reference epoch is the one input still checked here, because
% queryAzElTimeObstacle reads it from the obstacle field on every collision
% query and a wrong-typed value there fails far from this file.
if isempty(options.ReferenceTime)
    referenceTime = datetime(1970, 1, 1, 0, 0, 0, "TimeZone", "UTC");
else
    referenceTime = options.ReferenceTime;
    if ~isdatetime(referenceTime)
        error("buildAzElTimeObstacleField:InvalidTime", ...
            "Time must be a datetime vector.");
    end
    referenceTime.TimeZone = "UTC";
    if ~isscalar(referenceTime) || isnat(referenceTime)
        error("buildAzElTimeObstacleField:InvalidReferenceTime", ...
            "ReferenceTime must be a finite datetime scalar.");
    end
end

% Separation in degrees below which two vertices count as the same point.
% Used both to spot an explicitly closed ring and to drop zero-length edges,
% so the two always agree on whether first and last vertices coincide.
tolerance_deg = 1e-12;

%% Section 2: Normalize & Pack Obstacles
azElData = combineAzElObstacles(azElData);

% combineAzElObstacles owns recursive flattening and returns a canonical
% column array, so packing never needs a second compatibility branch.
items = num2cell(azElData(:));

% =========================================================================
% Pack each obstacle
% =========================================================================
% Preallocating from emptyObstacle() fixes the field order so struct-array
% assignment in the loop cannot fail.
obstacles = repmat(emptyObstacle(), numel(items), 1);
for obstacleIndex = 1:numel(items)
    obstacleData = items{obstacleIndex};
    sliceTime_s = double(obstacleData.time_s(:));
    sliceCount = numel(sliceTime_s);
    reducedRegionCount = 0;
    droppedRegionCount = 0;

    % One buffer entry per time slice, filled by the slice loop below and
    % concatenated afterwards. Buffering costs one transient copy but means
    % the packed arrays and the offset tables are both derived from the same
    % data, so they cannot describe different geometry.
    %
    % DIAGNOSING A BAD SLICE: sliceVertexCounts(i) == 0 means slice i
    % contributed nothing -- either it had no finite vertices at all, or
    % every ring in it was too small to be a polygon. That slice is not an
    % error; it packs as an empty CSR range and reads back as "no obstacle
    % here at this time".
    sliceAzimuthBuffer_deg = cell(sliceCount, 1);
    sliceElevationBuffer_deg = cell(sliceCount, 1);
    sliceEdgeBuffer_deg = cell(sliceCount, 1);
    sliceVertexCounts = zeros(sliceCount, 1);   % vertex rows written per slice
    sliceEdgeCounts = zeros(sliceCount, 1);     % edge rows written per slice
    sliceBounds_deg = nan(sliceCount, 4, "single");

    for sliceIndex = 1:sliceCount
        inputAzimuth_deg = double(obstacleData.az_deg{sliceIndex}(:));
        inputElevation_deg = double(obstacleData.el_deg{sliceIndex}(:));
        % Tolerate mismatched az/el lengths by taking the common prefix.
        usableCount = min( ...
            numel(inputAzimuth_deg), numel(inputElevation_deg));
        inputAzimuth_deg = inputAzimuth_deg(1:usableCount);
        inputElevation_deg = inputElevation_deg(1:usableCount);
        % A vertex counts only if BOTH coordinates are finite. NaN rows are
        % the ring separators, so this mask is also the ring structure.
        isRealVertex = ...
            isfinite(inputAzimuth_deg) & isfinite(inputElevation_deg);

        % Broad-phase reject box, used by queryAzElTimeObstacle to skip the
        % expensive point-in-polygon test. Taken from the raw finite vertices
        % BEFORE any reduction, so it always encloses the full-resolution
        % boundary and can never reject a point the polygon would contain.
        % A slice with nothing usable (target below horizon, no data) keeps
        % its all-NaN box, which compares false and rejects everything.
        if any(isRealVertex)
            sliceBounds_deg(sliceIndex, :) = single([ ...
                min(inputAzimuth_deg(isRealVertex)), ...
                max(inputAzimuth_deg(isRealVertex)), ...
                min(inputElevation_deg(isRealVertex)), ...
                max(inputElevation_deg(isRealVertex))]);
        end

        % Locate each maximal run of real vertices; one run is one ring. The
        % false sentinels at both ends make a run that touches either end
        % produce a transition like any other, so no special casing is
        % needed. +1 marks the first vertex of a run, -1 the first vertex
        % after it, hence the -1 on ringLastVertex.
        runTransitions = diff([false; isRealVertex; false]);
        ringFirstVertex = find(runTransitions == 1);
        ringLastVertex = find(runTransitions == -1) - 1;

        % Each ring is reduced and turned into edges on its own. Nothing is
        % ever computed across ring boundaries, which is what stops a phantom
        % edge from bridging two disconnected regions of the same slice.
        keptRingAzimuth_deg = cell(numel(ringFirstVertex), 1);
        keptRingElevation_deg = cell(numel(ringFirstVertex), 1);
        keptRingEdges_deg = cell(numel(ringFirstVertex), 1);
        keptRingCount = 0;        % rings that survived to be packed
        keptVertexTotal = 0;      % their combined vertex count
        keptEdgeTotal = 0;        % their combined edge count

        for ringIndex = 1:numel(ringFirstVertex)
            ringRange = ringFirstVertex(ringIndex):ringLastVertex(ringIndex);
            if numel(ringRange) < 3
                droppedRegionCount = droppedRegionCount + 1;
                continue;  % fewer than 3 vertices cannot form a polygon
            end
            ringAzimuth_deg = inputAzimuth_deg(ringRange);
            ringElevation_deg = inputElevation_deg(ringRange);

            % Cap the ring by uniform index subsampling. This is a storage
            % and performance control, NOT a geometric simplifier: it does
            % not preserve area or shape, it just thins vertices evenly. A
            % ring that arrives explicitly closed stays explicitly closed.
            inputRingSize = numel(ringAzimuth_deg);
            if isfinite(maximumVertices) && inputRingSize > maximumVertices
                reducedRegionCount = reducedRegionCount + 1;
                % "Explicitly closed" means the last vertex repeats the
                % first. Such a ring must keep that property, or the closing
                % edge below would be computed from the wrong pair.
                isExplicitlyClosed = inputRingSize > 3 && ...
                    hypot( ...
                    ringAzimuth_deg(1) - ringAzimuth_deg(end), ...
                    ringElevation_deg(1) - ringElevation_deg(end)) <= ...
                    tolerance_deg;
                if isExplicitlyClosed
                    % Thin the unique vertices only -- range stops one short
                    % of the duplicate closer -- then re-append the first
                    % kept vertex. That is maximumVertices-1 unique plus 1
                    % repeat, so the cap is still respected exactly.
                    keptVertexIndex = round(linspace( ...
                        1, inputRingSize - 1, maximumVertices - 1));
                    ringAzimuth_deg = [ ...
                        ringAzimuth_deg(keptVertexIndex); ...
                        ringAzimuth_deg(keptVertexIndex(1))];
                    ringElevation_deg = [ ...
                        ringElevation_deg(keptVertexIndex); ...
                        ringElevation_deg(keptVertexIndex(1))];
                else
                    keptVertexIndex = round(linspace( ...
                        1, inputRingSize, maximumVertices));
                    ringAzimuth_deg = ringAzimuth_deg(keptVertexIndex);
                    ringElevation_deg = ...
                        ringElevation_deg(keptVertexIndex);
                end
                % round(linspace(...)) can repeat an index when the cap is
                % close to the ring size. Harmless: repeats become
                % zero-length edges and are dropped just below.
            end
            if numel(ringAzimuth_deg) < 3
                droppedRegionCount = droppedRegionCount + 1;
                continue;  % ring degenerated during reduction; drop it
            end

            % Build the closed edge list. circshift(-1) pairs vertex i with
            % i+1 and wraps the last back to the first, so the closing edge
            % is produced without appending anything. Zero-length edges are
            % then dropped, which quietly absorbs both explicit closing
            % vertices and any repeated points. Edges come straight off this
            % ring rather than from a rescan of the reassembled slice, so
            % the vertex list and the edge list cannot disagree.
            edgeEndAzimuth_deg = circshift(ringAzimuth_deg, -1);
            edgeEndElevation_deg = circshift(ringElevation_deg, -1);
            edgeHasLength = hypot( ...
                edgeEndAzimuth_deg - ringAzimuth_deg, ...
                edgeEndElevation_deg - ringElevation_deg) > tolerance_deg;

            keptRingCount = keptRingCount + 1;
            keptRingAzimuth_deg{keptRingCount} = ringAzimuth_deg;
            keptRingElevation_deg{keptRingCount} = ringElevation_deg;
            keptRingEdges_deg{keptRingCount} = single([ ...
                ringAzimuth_deg(edgeHasLength), ...
                ringElevation_deg(edgeHasLength), ...
                edgeEndAzimuth_deg(edgeHasLength), ...
                edgeEndElevation_deg(edgeHasLength)]);
            keptVertexTotal = keptVertexTotal + numel(ringAzimuth_deg);
            keptEdgeTotal = keptEdgeTotal + nnz(edgeHasLength);
        end

        if keptRingCount == 0
            % Nothing survived. Empty parts keep the concatenation below
            % type-correct; the two count entries stay 0.
            sliceAzimuthBuffer_deg{sliceIndex} = single.empty(0, 1);
            sliceElevationBuffer_deg{sliceIndex} = single.empty(0, 1);
            sliceEdgeBuffer_deg{sliceIndex} = single.empty(0, 4);
            continue;
        end

        % Reassemble the slice in the same NaN-separated form the input
        % used, so a packed slice reads back like the data it came from.
        % The array is prefilled with NaN and the cursor advances by
        % ringSize+1, skipping one slot between rings -- that skipped slot
        % IS the separator, so no separator is ever written explicitly.
        % Length is vertices + (rings - 1) separators.
        sliceVertexAzimuth_deg = ...
            nan(keptVertexTotal + keptRingCount - 1, 1);
        sliceVertexElevation_deg = sliceVertexAzimuth_deg;
        writeCursor = 1;
        for ringIndex = 1:keptRingCount
            ringSize = numel(keptRingAzimuth_deg{ringIndex});
            ringSlots = writeCursor:writeCursor + ringSize - 1;
            sliceVertexAzimuth_deg(ringSlots) = ...
                keptRingAzimuth_deg{ringIndex};
            sliceVertexElevation_deg(ringSlots) = ...
                keptRingElevation_deg{ringIndex};
            writeCursor = writeCursor + ringSize + 1;
        end

        sliceAzimuthBuffer_deg{sliceIndex} = ...
            single(sliceVertexAzimuth_deg);
        sliceElevationBuffer_deg{sliceIndex} = ...
            single(sliceVertexElevation_deg);
        sliceEdgeBuffer_deg{sliceIndex} = ...
            vertcat(keptRingEdges_deg{1:keptRingCount});
        % Counts are taken from what was actually written, never predicted,
        % which is what keeps the offset tables below honest.
        sliceVertexCounts(sliceIndex) = numel(sliceVertexAzimuth_deg);
        sliceEdgeCounts(sliceIndex) = keptEdgeTotal;
    end

    % CSR-style offset tables. Slice i owns rows
    % vertexOffsets(i) .. vertexOffsets(i+1)-1 of the packed arrays;
    % vertexOffsets(end)-1 is the grand total; an empty slice leaves
    % vertexOffsets(i) == vertexOffsets(i+1), i.e. a zero-width range.
    % Offsets are 1-based to index MATLAB arrays directly.
    vertexOffsets = ones(sliceCount + 1, 1, "uint64");
    vertexOffsets(2:end) = uint64(1) + cumsum(uint64(sliceVertexCounts));
    edgeOffsets = ones(sliceCount + 1, 1, "uint64");
    edgeOffsets(2:end) = uint64(1) + cumsum(uint64(sliceEdgeCounts));

    % Vertices support reconstruction and plotting; explicit edges support
    % the vectorized point-in-polygon and safety-margin narrow phases. The
    % zero-slice branch exists because vertcat of an empty cell yields [],
    % which would be the wrong type and shape for the packed fields.
    if sliceCount == 0
        packedAzimuth_deg = single.empty(0, 1);
        packedElevation_deg = single.empty(0, 1);
        packedEdges_deg = single.empty(0, 4);
    else
        packedAzimuth_deg = vertcat(sliceAzimuthBuffer_deg{:});
        packedElevation_deg = vertcat(sliceElevationBuffer_deg{:});
        packedEdges_deg = vertcat(sliceEdgeBuffer_deg{:});
    end

    % Uniform-grid metadata: when the time step is constant, a query time
    % maps to a slice index arithmetically instead of via search. The
    % relative tolerance absorbs floating-point noise across long missions
    % and the 1e-9 s floor covers steps near zero. NaN is the signal to fall
    % back to search-based lookup.
    isUniformTime = true;
    timeStep_s = NaN;
    if sliceCount >= 2
        adjacentTimeSteps_s = diff(sliceTime_s);
        timeStep_s = median(adjacentTimeSteps_s);
        timeStepTolerance_s = max(1e-9, abs(timeStep_s) * 1e-9);
        isUniformTime = all( ...
            abs(adjacentTimeSteps_s - timeStep_s) <= ...
            timeStepTolerance_s);
        if ~isUniformTime
            timeStep_s = NaN;
        end
    end

    obstacle = emptyObstacle();
    obstacle.Name = string(obstacleData.targetName);
    obstacle.TimeSeconds = sliceTime_s;
    obstacle.IsUniformTime = isUniformTime;
    obstacle.TimeStepSeconds = timeStep_s;
    obstacle.SliceOffsets = vertexOffsets;
    obstacle.AzimuthDeg = packedAzimuth_deg;
    obstacle.ElevationDeg = packedElevation_deg;
    obstacle.EdgeOffsets = edgeOffsets;
    obstacle.EdgeStartAzimuthDeg = packedEdges_deg(:, 1);
    obstacle.EdgeStartElevationDeg = packedEdges_deg(:, 2);
    obstacle.EdgeEndAzimuthDeg = packedEdges_deg(:, 3);
    obstacle.EdgeEndElevationDeg = packedEdges_deg(:, 4);
    obstacle.BoundsDeg = sliceBounds_deg;
    obstacle.SampleCount = sliceCount;
    obstacle.PackedVertexCount = numel(packedAzimuth_deg);
    obstacle.PackedEdgeCount = size(packedEdges_deg, 1);
    % Reported footprint: 8 bytes per double time and per uint64 offset,
    % 4 bytes per single geometry value.
    doubleBytes = 8 * numel(obstacle.TimeSeconds) + 8 * ( ...
        numel(obstacle.SliceOffsets) + numel(obstacle.EdgeOffsets));
    singleBytes = 4 * ( ...
        numel(obstacle.AzimuthDeg) + numel(obstacle.ElevationDeg) + ...
        numel(obstacle.EdgeStartAzimuthDeg) + ...
        numel(obstacle.EdgeStartElevationDeg) + ...
        numel(obstacle.EdgeEndAzimuthDeg) + ...
        numel(obstacle.EdgeEndElevationDeg) + numel(obstacle.BoundsDeg));
    obstacle.EstimatedStorageBytes = doubleBytes + singleBytes;
    obstacles(obstacleIndex) = obstacle;
    if reducedRegionCount > 0
        warning("buildAzElTimeObstacleField:RegionsReduced", ...
            ["Obstacle %d (%s) uniformly reduced %d polygon regions; " ...
            "the packed collision boundary is an approximation."], ...
            obstacleIndex, obstacle.Name, reducedRegionCount);
    end
    if droppedRegionCount > 0
        warning("buildAzElTimeObstacleField:RegionsDropped", ...
            ["Obstacle %d (%s) dropped %d regions with fewer than three " ...
            "usable vertices; those regions cannot block queries."], ...
            obstacleIndex, obstacle.Name, droppedRegionCount);
    end
end

%% Section 3: Assemble The Output
% Format and Version allow planners and queries to reuse packed input.
obstacleField = struct();
obstacleField.Format = "AzElTimeObstacleField";
obstacleField.Version = 3;
obstacleField.ReferenceTime = referenceTime;
obstacleField.Obstacles = obstacles;
obstacleField.ObstacleCount = numel(obstacles);
obstacleField.Options = options;
obstacleField.EstimatedStorageBytes = ...
    sum([obstacles.EstimatedStorageBytes]);
end

%% Section 4: Local Functions
function obstacle = emptyObstacle()
%% Section 0: Header & Readme
% SYNTAX
%   obstacle = emptyObstacle()
%**************************************************************************
% PURPOSE
%   - Define the single source of truth for one packed obstacle record.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - obstacle (scalar struct)
%       Empty packed obstacle record used for preallocation.
%**************************************************************************
% UNITS
%   - Unit-bearing fields identify seconds or degrees in their names.
%
% Serves both as the preallocation template (fixing field order for
% struct-array assignment) and as documentation of every field. Offset
% tables begin as the single sentinel value 1: an empty CSR table.
obstacle = struct( ...
    "Name", "", ...                   % obstacle display name
    "TimeSeconds", zeros(0, 1), ...   % slice sample times (s)
    "IsUniformTime", false, ...       % constant time step?
    "TimeStepSeconds", NaN, ...       % step if uniform, else NaN
    "SliceOffsets", ones(1, 1, "uint64"), ...  % vertex CSR offsets (n+1)
    "AzimuthDeg", single.empty(0, 1), ...      % packed vertex azimuths
    "ElevationDeg", single.empty(0, 1), ...    % packed vertex elevations
    "EdgeOffsets", ones(1, 1, "uint64"), ...   % edge CSR offsets (n+1)
    "EdgeStartAzimuthDeg", single.empty(0, 1), ...  % edge start vertices
    "EdgeStartElevationDeg", single.empty(0, 1), ...
    "EdgeEndAzimuthDeg", single.empty(0, 1), ...    % edge end vertices
    "EdgeEndElevationDeg", single.empty(0, 1), ...
    "BoundsDeg", single.empty(0, 4), ...  % [azMin azMax elMin elMax] rows
    "SampleCount", 0, ...             % number of time slices
    "PackedVertexCount", 0, ...       % rows in AzimuthDeg/ElevationDeg
    "PackedEdgeCount", 0, ...         % rows in the edge arrays
    "EstimatedStorageBytes", 0);      % reported packed footprint
end

function options = defaultAzElTimeObstacleFieldOptions()
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultAzElTimeObstacleFieldOptions()
%**************************************************************************
% PURPOSE
%   - Keep obstacle-field defaults in one source of truth.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated public options structure.
%**************************************************************************
% UNITS
%   - MaximumVerticesPerRegion is dimensionless.
%   - ReferenceTime is a UTC datetime.
options = struct( ...
    "MaximumVerticesPerRegion", 64, ...
    "ReferenceTime", []);
end
