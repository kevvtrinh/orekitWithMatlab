function workspace = buildAzElTimeObstacleWorkspace(azElData, options)
%BUILDAZELTIMEOBSTACLEWORKSPACE Pack moving az/el polygons for path planning.
%
% workspace = buildAzElTimeObstacleWorkspace(azElData)
% workspace = buildAzElTimeObstacleWorkspace([data1, data2, ...], options)
% workspace = buildAzElTimeObstacleWorkspace({data1, data2, ...}, options)
%
% Each scalar azElData struct becomes an independent obstacle. Struct arrays,
% cell arrays, and nested mixtures are accepted and flattened in caller
% order. The output is an implicit 3-D obstacle workspace whose coordinates
% are sensor azimuth, sensor elevation, and time_s. Boundaries are packed
% into contiguous single-precision arrays and each slice has a precomputed
% bounding box.
%
% INPUT -- ASSUMED, NOT CHECKED
% Obstacle geometry is trusted: there is no validation of it anywhere in this
% file. Each azElData struct is a calculateAreaTargetAzEl result and is
% assumed to hold
%   targetName   Nonempty scalar text; carried through as the obstacle name.
%   time_s       Nonempty, real, finite, strictly increasing vector of
%                sample times in seconds. Each sample is one polygon
%                "slice" of the obstacle.
%   az_deg       Cell array (one cell per sample) of azimuth boundary
%                vertices in degrees.
%   el_deg       Cell array of matching elevation vertices in degrees.
% Within a slice, NaN rows in az_deg/el_deg separate independent polygon
% regions (rings), following the usual MATLAB multi-region convention.
% Malformed input fails deep inside with a raw MATLAB error rather than a
% descriptive one; anything in the input that is neither a struct nor a cell
% is skipped silently, and MaximumVerticesPerRegion is taken on faith (a
% value below 4 will drop rings, and below 2 will throw while subsampling).
% Callers who want those checks can run combineAzElObstacles first, which
% validates and normalizes every obstacle before packing.
%
% Options:
%   MaximumVerticesPerRegion  Boundary cap per region (default 64). Use Inf
%                             to retain every input vertex.
%   ReferenceTime             Mission datetime at time_s == 0 (default
%                             1970-01-01Z). Carried on the output and read
%                             back by queryAzElTimeObstacle.
%
% Use QUERYAZELTIMEOBSTACLE for collision tests and
% PLOTAZELTIMEOBSTACLEWORKSPACE for a decimated static 3-D view.

if nargin < 2
    options = struct();
end
if ~isfield(options, "MaximumVerticesPerRegion") || ...
        isempty(options.MaximumVerticesPerRegion)
    options.MaximumVerticesPerRegion = 64;
end
if ~isfield(options, "ReferenceTime")
    options.ReferenceTime = [];
end
maximumVertices = options.MaximumVerticesPerRegion;

% The reference epoch is the one input still checked here, because
% queryAzElTimeObstacle reads it back off the workspace on every collision
% query and a wrong-typed value there fails far from this file.
if isempty(options.ReferenceTime)
    referenceTime = datetime(1970, 1, 1, 0, 0, 0, "TimeZone", "UTC");
else
    referenceTime = options.ReferenceTime;
    if ~isdatetime(referenceTime)
        error("buildAzElTimeObstacleWorkspace:InvalidTime", ...
            "Time must be a datetime vector.");
    end
    referenceTime.TimeZone = "UTC";
    if ~isscalar(referenceTime) || isnat(referenceTime)
        error("buildAzElTimeObstacleWorkspace:InvalidReferenceTime", ...
            "ReferenceTime must be a finite datetime scalar.");
    end
end

% Separation in degrees below which two vertices count as the same point.
% Used both to spot an explicitly closed ring and to drop zero-length edges,
% so the two always agree on whether first and last vertices coincide.
tolerance = 1e-12;

% =========================================================================
% Flatten nested inputs into a list of scalar structs
% =========================================================================
% Explicit stack instead of recursion: pop a value and either harvest its
% struct elements or push its cell contents back for later. Cell contents go
% back reversed so the next pop is always the caller's next item, which
% preserves input order. Both arrays grow inside the loop, which is fine at
% obstacle-count scale.
pending = {azElData};
items = cell(0, 1);
while ~isempty(pending)
    current = pending{end};
    pending(end) = [];
    if isstruct(current)
        items = [items; num2cell(current(:))]; %#ok<AGROW>
    elseif iscell(current)
        pending = [pending; flipud(current(:))]; %#ok<AGROW>
    end
end

% =========================================================================
% Pack each obstacle
% =========================================================================
% Preallocating from emptyObstacle() fixes the field order so struct-array
% assignment in the loop cannot fail.
obstacles = repmat(emptyObstacle(), numel(items), 1);
for obstacleIndex = 1:numel(items)
    obstacleData = items{obstacleIndex};
    sliceTimeSeconds = double(obstacleData.time_s(:));
    sliceCount = numel(sliceTimeSeconds);

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
    sliceAzimuthBuffer = cell(sliceCount, 1);   % vertices, NaN-separated
    sliceElevationBuffer = cell(sliceCount, 1);
    sliceEdgeBuffer = cell(sliceCount, 1);      % [startAz startEl endAz endEl]
    sliceVertexCounts = zeros(sliceCount, 1);   % vertex rows written per slice
    sliceEdgeCounts = zeros(sliceCount, 1);     % edge rows written per slice
    sliceBounds = nan(sliceCount, 4, "single"); % [azMin azMax elMin elMax]

    for sliceIndex = 1:sliceCount
        inputAzimuth = double(obstacleData.az_deg{sliceIndex}(:));
        inputElevation = double(obstacleData.el_deg{sliceIndex}(:));
        % Tolerate mismatched az/el lengths by taking the common prefix.
        usableCount = min(numel(inputAzimuth), numel(inputElevation));
        inputAzimuth = inputAzimuth(1:usableCount);
        inputElevation = inputElevation(1:usableCount);
        % A vertex counts only if BOTH coordinates are finite. NaN rows are
        % the ring separators, so this mask is also the ring structure.
        isRealVertex = isfinite(inputAzimuth) & isfinite(inputElevation);

        % Broad-phase reject box, used by queryAzElTimeObstacle to skip the
        % expensive point-in-polygon test. Taken from the raw finite vertices
        % BEFORE any reduction, so it always encloses the full-resolution
        % boundary and can never reject a point the polygon would contain.
        % A slice with nothing usable (target below horizon, no data) keeps
        % its all-NaN box, which compares false and rejects everything.
        if any(isRealVertex)
            sliceBounds(sliceIndex, :) = single([ ...
                min(inputAzimuth(isRealVertex)), ...
                max(inputAzimuth(isRealVertex)), ...
                min(inputElevation(isRealVertex)), ...
                max(inputElevation(isRealVertex))]);
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
        keptRingAzimuth = cell(numel(ringFirstVertex), 1);
        keptRingElevation = cell(numel(ringFirstVertex), 1);
        keptRingEdges = cell(numel(ringFirstVertex), 1);
        keptRingCount = 0;        % rings that survived to be packed
        keptVertexTotal = 0;      % their combined vertex count
        keptEdgeTotal = 0;        % their combined edge count

        for ringIndex = 1:numel(ringFirstVertex)
            ringRange = ringFirstVertex(ringIndex):ringLastVertex(ringIndex);
            if numel(ringRange) < 3
                continue;  % fewer than 3 vertices cannot form a polygon
            end
            ringAzimuth = inputAzimuth(ringRange);
            ringElevation = inputElevation(ringRange);

            % Cap the ring by uniform index subsampling. This is a storage
            % and performance control, NOT a geometric simplifier: it does
            % not preserve area or shape, it just thins vertices evenly. A
            % ring that arrives explicitly closed stays explicitly closed.
            inputRingSize = numel(ringAzimuth);
            if isfinite(maximumVertices) && inputRingSize > maximumVertices
                % "Explicitly closed" means the last vertex repeats the
                % first. Such a ring must keep that property, or the closing
                % edge below would be computed from the wrong pair.
                isExplicitlyClosed = inputRingSize > 3 && ...
                    hypot(ringAzimuth(1) - ringAzimuth(end), ...
                    ringElevation(1) - ringElevation(end)) <= tolerance;
                if isExplicitlyClosed
                    % Thin the unique vertices only -- range stops one short
                    % of the duplicate closer -- then re-append the first
                    % kept vertex. That is maximumVertices-1 unique plus 1
                    % repeat, so the cap is still respected exactly.
                    keptVertexIndex = round(linspace( ...
                        1, inputRingSize - 1, maximumVertices - 1));
                    ringAzimuth = [ringAzimuth(keptVertexIndex); ...
                        ringAzimuth(keptVertexIndex(1))];
                    ringElevation = [ringElevation(keptVertexIndex); ...
                        ringElevation(keptVertexIndex(1))];
                else
                    keptVertexIndex = round(linspace( ...
                        1, inputRingSize, maximumVertices));
                    ringAzimuth = ringAzimuth(keptVertexIndex);
                    ringElevation = ringElevation(keptVertexIndex);
                end
                % round(linspace(...)) can repeat an index when the cap is
                % close to the ring size. Harmless: repeats become
                % zero-length edges and are dropped just below.
            end
            if numel(ringAzimuth) < 3
                continue;  % ring degenerated during reduction; drop it
            end

            % Build the closed edge list. circshift(-1) pairs vertex i with
            % i+1 and wraps the last back to the first, so the closing edge
            % is produced without appending anything. Zero-length edges are
            % then dropped, which quietly absorbs both explicit closing
            % vertices and any repeated points. Edges come straight off this
            % ring rather than from a rescan of the reassembled slice, so
            % the vertex list and the edge list cannot disagree.
            edgeEndAzimuth = circshift(ringAzimuth, -1);
            edgeEndElevation = circshift(ringElevation, -1);
            edgeHasLength = hypot(edgeEndAzimuth - ringAzimuth, ...
                edgeEndElevation - ringElevation) > tolerance;

            keptRingCount = keptRingCount + 1;
            keptRingAzimuth{keptRingCount} = ringAzimuth;
            keptRingElevation{keptRingCount} = ringElevation;
            keptRingEdges{keptRingCount} = single([ ...
                ringAzimuth(edgeHasLength), ...
                ringElevation(edgeHasLength), ...
                edgeEndAzimuth(edgeHasLength), ...
                edgeEndElevation(edgeHasLength)]);
            keptVertexTotal = keptVertexTotal + numel(ringAzimuth);
            keptEdgeTotal = keptEdgeTotal + nnz(edgeHasLength);
        end

        if keptRingCount == 0
            % Nothing survived. Empty parts keep the concatenation below
            % type-correct; the two count entries stay 0.
            sliceAzimuthBuffer{sliceIndex} = single.empty(0, 1);
            sliceElevationBuffer{sliceIndex} = single.empty(0, 1);
            sliceEdgeBuffer{sliceIndex} = single.empty(0, 4);
            continue;
        end

        % Reassemble the slice in the same NaN-separated form the input
        % used, so a packed slice reads back like the data it came from.
        % The array is prefilled with NaN and the cursor advances by
        % ringSize+1, skipping one slot between rings -- that skipped slot
        % IS the separator, so no separator is ever written explicitly.
        % Length is vertices + (rings - 1) separators.
        sliceVertexAzimuth = nan(keptVertexTotal + keptRingCount - 1, 1);
        sliceVertexElevation = sliceVertexAzimuth;
        writeCursor = 1;
        for ringIndex = 1:keptRingCount
            ringSize = numel(keptRingAzimuth{ringIndex});
            ringSlots = writeCursor:writeCursor + ringSize - 1;
            sliceVertexAzimuth(ringSlots) = keptRingAzimuth{ringIndex};
            sliceVertexElevation(ringSlots) = keptRingElevation{ringIndex};
            writeCursor = writeCursor + ringSize + 1;
        end

        sliceAzimuthBuffer{sliceIndex} = single(sliceVertexAzimuth);
        sliceElevationBuffer{sliceIndex} = single(sliceVertexElevation);
        sliceEdgeBuffer{sliceIndex} = vertcat(keptRingEdges{1:keptRingCount});
        % Counts are taken from what was actually written, never predicted,
        % which is what keeps the offset tables below honest.
        sliceVertexCounts(sliceIndex) = numel(sliceVertexAzimuth);
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
        packedAzimuth = single.empty(0, 1);
        packedElevation = single.empty(0, 1);
        packedEdges = single.empty(0, 4);
    else
        packedAzimuth = vertcat(sliceAzimuthBuffer{:});
        packedElevation = vertcat(sliceElevationBuffer{:});
        packedEdges = vertcat(sliceEdgeBuffer{:});
    end

    % Uniform-grid metadata: when the time step is constant, a query time
    % maps to a slice index arithmetically instead of via search. The
    % relative tolerance absorbs floating-point noise across long missions
    % and the 1e-9 s floor covers steps near zero. NaN is the signal to fall
    % back to search-based lookup.
    isUniform = true;
    sampleStep = NaN;
    if sliceCount >= 2
        stepSeconds = diff(sliceTimeSeconds);
        sampleStep = median(stepSeconds);
        stepTolerance = max(1e-9, abs(sampleStep) * 1e-9);
        isUniform = all(abs(stepSeconds - sampleStep) <= stepTolerance);
        if ~isUniform
            sampleStep = NaN;
        end
    end

    obstacle = emptyObstacle();
    obstacle.Name = string(obstacleData.targetName);
    obstacle.TimeSeconds = sliceTimeSeconds;
    obstacle.IsUniformTime = isUniform;
    obstacle.TimeStepSeconds = sampleStep;
    obstacle.SliceOffsets = vertexOffsets;
    obstacle.AzimuthDeg = packedAzimuth;
    obstacle.ElevationDeg = packedElevation;
    obstacle.EdgeOffsets = edgeOffsets;
    obstacle.EdgeStartAzimuthDeg = packedEdges(:, 1);
    obstacle.EdgeStartElevationDeg = packedEdges(:, 2);
    obstacle.EdgeEndAzimuthDeg = packedEdges(:, 3);
    obstacle.EdgeEndElevationDeg = packedEdges(:, 4);
    obstacle.BoundsDeg = sliceBounds;
    obstacle.SampleCount = sliceCount;
    obstacle.PackedVertexCount = numel(packedAzimuth);
    obstacle.PackedEdgeCount = size(packedEdges, 1);
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
end

% Format and Version identify an already-packed workspace: both planners test
% Format to decide whether to reuse the input instead of repacking it, and
% queryAzElTimeObstacle reads ReferenceTime back on every collision query.
workspace = struct();
workspace.Format = "AzElTimeObstacleWorkspace";
workspace.Version = 2;
workspace.ReferenceTime = referenceTime;
workspace.Obstacles = obstacles;
workspace.ObstacleCount = numel(obstacles);
workspace.Options = options;
workspace.EstimatedStorageBytes = sum([obstacles.EstimatedStorageBytes]);
end

function obstacle = emptyObstacle()
%EMPTYOBSTACLE Zero-slice obstacle that defines the packed schema.
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
