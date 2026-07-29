function grid = rasterizeAzElTimeWorkspace(workspace, gridSpec, options)
%RASTERIZEAZELTIMEWORKSPACE Rasterize packed obstacles into occupancy grids.
%
% grid = rasterizeAzElTimeWorkspace(workspace, gridSpec)
% grid = rasterizeAzElTimeWorkspace(workspace, gridSpec, options)
%
% workspace is the output of buildAzElTimeObstacleWorkspace. The rasterizer
% reads the packed vertex arrays (SliceOffsets, AzimuthDeg, ElevationDeg)
% and fills grid cells with a vectorized even-odd scanline algorithm. The
% cost per slice is O(edges * rows + cells), unlike inpolygon over a full
% grid which is O(cells * edges). Cells are classified at their centers.
%
% Required gridSpec fields:
%   AzimuthLimitsDeg    [minAz maxAz] grid limits in degrees.
%   ElevationLimitsDeg  [minEl maxEl] grid limits in degrees.
%   CellSizeDeg         Scalar, or [azimuthCell elevationCell], degrees.
%
% Optional gridSpec fields:
%   TimeSeconds
%       Grid time samples, strictly increasing. When omitted, every
%       obstacle must share one time vector and that vector is used.
%
% Options:
%   TimeMapping
%       'nearest' (default) maps each grid time to the closest obstacle
%       slice. 'bracket' marks a cell occupied when either neighboring
%       slice covers it, which is conservative between slice times.
%   MarginCells
%       Nonnegative integer dilation radius in cells (disk shaped). Use
%       this to add a clearance margin, or to absorb the discretization
%       error of a coarse planning grid. The default is 0.
%   OutOfRangeTime
%       Behavior for grid times outside an obstacle time range:
%       'error' (default), 'clamp' (hold the first or last slice), or
%       'free' (the obstacle does not exist outside its time range).
%   UseParallel
%       true runs the time loop with parfor. The default is false.
%
% Output grid fields:
%   Occupancy            numEl-by-numAz-by-numTimes logical array.
%                        Occupancy(iEl, iAz, iTime) is true when the cell
%                        center (AzimuthCentersDeg(iAz),
%                        ElevationCentersDeg(iEl)) is inside any obstacle
%                        at TimeSeconds(iTime).
%   AzimuthCentersDeg    1-by-numAz cell center azimuths.
%   ElevationCentersDeg  numEl-by-1 cell center elevations.
%   TimeSeconds          numTimes-by-1 grid time samples.
%   CellSizeDeg          [azimuthCell elevationCell] in degrees.
%   GridSpec, Options    Echo of the validated inputs.
%   GridSize             [numEl numAz numTimes].
%   VoxelCount           Number of logical occupancy values.
%   EstimatedStorageBytes Approximate occupancy-array bytes.
%
% Semantics and limitations:
%   * Even-odd (crossing parity) fill, matching inpolygon. NaN-separated
%     regions in one slice must not overlap each other; overlapping
%     regions would cancel where they intersect.
%   * Boundaries must not wrap through the 0/360 azimuth seam within one
%     region. Split wrapping regions at the seam before packing.
%   * MarginCells dilates in cell units, so with anisotropic cells the
%     margin is anisotropic in degrees.
%
% Example:
%   gridSpec = struct();
%   gridSpec.AzimuthLimitsDeg = [0 360];
%   gridSpec.ElevationLimitsDeg = [0 90];
%   gridSpec.CellSizeDeg = 0.5;
%   grid = rasterizeAzElTimeWorkspace(workspace, gridSpec);

% 1. Validate inputs and apply option defaults
    if nargin < 3 || isempty(options)
        options = struct();
    end
    options = applyRasterizerOptionDefaults(options);
    validateWorkspaceInput(workspace);
    gridSpec = validateGridSpec(gridSpec);

% 2. Build the cell center axes
    cellSize = gridSpec.CellSizeDeg;
    azMin = gridSpec.AzimuthLimitsDeg(1);
    elMin = gridSpec.ElevationLimitsDeg(1);
    numAz = floor((gridSpec.AzimuthLimitsDeg(2) - azMin) / ...
        cellSize(1) + 1e-9);
    numEl = floor((gridSpec.ElevationLimitsDeg(2) - elMin) / ...
        cellSize(2) + 1e-9);
    if numAz < 1 || numEl < 1
        error('rasterizeAzElTimeWorkspace:GridTooSmall', ...
            'The grid limits must span at least one cell.');
    end
    azimuthCenters = azMin + ((1:numAz) - 0.5) * cellSize(1);
    elevationCenters = elMin + ((1:numEl)' - 0.5) * cellSize(2);

% 3. Resolve the grid time base
    obstacles = workspace.Obstacles;
    numObstacles = numel(obstacles);
    if isfield(gridSpec, 'TimeSeconds') && ~isempty(gridSpec.TimeSeconds)
        gridTimes = double(gridSpec.TimeSeconds(:));
    else
        gridTimes = resolveCommonTimeBase(obstacles);
    end
    numTimes = numel(gridTimes);

% 4. Map every grid time to obstacle slice indices
%
% sliceMap{k} is numTimes-by-2. Column 1 and column 2 hold the lower and
% upper bracketing slice indices, and 0 means no slice applies.
    sliceMap = cell(numObstacles, 1);
    for obstacleIdx = 1:numObstacles
        sliceMap{obstacleIdx} = mapTimesToSliceIndices( ...
            obstacles(obstacleIdx), gridTimes, ...
            options.TimeMapping, options.OutOfRangeTime, ...
            options.TimeToleranceSeconds);
    end

% 5. Rasterize every time page
    pages = cell(numTimes, 1);
    azCellSize = cellSize(1);
    elCellSize = cellSize(2);
    marginCells = options.MarginCells;
    if options.UseParallel
        parfor timeIdx = 1:numTimes
            pages{timeIdx} = rasterizeOnePage(obstacles, sliceMap, ...
                timeIdx, azMin, azCellSize, numAz, ...
                elMin, elCellSize, numEl, marginCells);
        end
    else
        for timeIdx = 1:numTimes
            pages{timeIdx} = rasterizeOnePage(obstacles, sliceMap, ...
                timeIdx, azMin, azCellSize, numAz, ...
                elMin, elCellSize, numEl, marginCells);
        end
    end

% 6. Assemble the output grid
    grid = struct();
    grid.Format = "AzElTimeOccupancyGrid";
    grid.Version = 1;
    grid.Occupancy = cat(3, pages{:});
    grid.AzimuthCentersDeg = azimuthCenters;
    grid.ElevationCentersDeg = elevationCenters;
    grid.TimeSeconds = gridTimes;
    grid.CellSizeDeg = cellSize;
    grid.GridSpec = gridSpec;
    grid.Options = options;
    grid.GridSize = [numEl, numAz, numTimes];
    grid.VoxelCount = numel(grid.Occupancy);
    grid.EstimatedStorageBytes = numel(grid.Occupancy);
end

function options = applyRasterizerOptionDefaults(options)
%APPLYRASTERIZEROPTIONDEFAULTS Fill missing options and validate them.
    if ~isfield(options, 'TimeMapping') || isempty(options.TimeMapping)
        options.TimeMapping = 'nearest';
    end
    options.TimeMapping = validatestring(options.TimeMapping, ...
        {'nearest', 'bracket'});
    if ~isfield(options, 'MarginCells') || isempty(options.MarginCells)
        options.MarginCells = 0;
    end
    validateattributes(options.MarginCells, {'numeric'}, ...
        {'scalar', 'integer', 'nonnegative'});
    if ~isfield(options, 'OutOfRangeTime') || ...
            isempty(options.OutOfRangeTime)
        options.OutOfRangeTime = 'error';
    end
    options.OutOfRangeTime = validatestring(options.OutOfRangeTime, ...
        {'error', 'clamp', 'free'});
    if ~isfield(options, 'TimeToleranceSeconds') || ...
            isempty(options.TimeToleranceSeconds)
        options.TimeToleranceSeconds = 1e-6;
    end
    validateattributes(options.TimeToleranceSeconds, {'numeric'}, ...
        {'scalar', 'real', 'nonnegative', 'finite'});
    if ~isfield(options, 'UseParallel') || isempty(options.UseParallel)
        options.UseParallel = false;
    end
    validateattributes(options.UseParallel, {'logical', 'numeric'}, ...
        {'scalar'});
    options.UseParallel = logical(options.UseParallel);
end

function validateWorkspaceInput(workspace)
%VALIDATEWORKSPACEINPUT Check for the packed workspace fields.
    requiredFields = {'Format', 'Obstacles', 'ObstacleCount'};
    if ~isstruct(workspace) || ~isscalar(workspace) || ...
            ~all(isfield(workspace, requiredFields)) || ...
            workspace.Format ~= "AzElTimeObstacleWorkspace"
        error('rasterizeAzElTimeWorkspace:InvalidWorkspace', ...
            ['workspace must be the output of ' ...
            'buildAzElTimeObstacleWorkspace.']);
    end
end

function gridSpec = validateGridSpec(gridSpec)
%VALIDATEGRIDSPEC Check limits and normalize the cell size.
    requiredFields = {'AzimuthLimitsDeg', 'ElevationLimitsDeg', ...
        'CellSizeDeg'};
    if ~isstruct(gridSpec) || ~all(isfield(gridSpec, requiredFields))
        error('rasterizeAzElTimeWorkspace:InvalidGridSpec', ...
            ['gridSpec must contain AzimuthLimitsDeg, ' ...
            'ElevationLimitsDeg, and CellSizeDeg.']);
    end
    validateattributes(gridSpec.AzimuthLimitsDeg, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
    validateattributes(gridSpec.ElevationLimitsDeg, {'numeric'}, ...
        {'vector', 'numel', 2, 'real', 'finite', 'increasing'});
    validateattributes(gridSpec.CellSizeDeg, {'numeric'}, ...
        {'vector', 'real', 'finite', 'positive'});
    if isscalar(gridSpec.CellSizeDeg)
        gridSpec.CellSizeDeg = ...
            [gridSpec.CellSizeDeg, gridSpec.CellSizeDeg];
    elseif numel(gridSpec.CellSizeDeg) ~= 2
        error('rasterizeAzElTimeWorkspace:InvalidCellSize', ...
            'CellSizeDeg must be a scalar or a two element vector.');
    end
    gridSpec.CellSizeDeg = double(gridSpec.CellSizeDeg(:)');
    gridSpec.AzimuthLimitsDeg = double(gridSpec.AzimuthLimitsDeg(:)');
    gridSpec.ElevationLimitsDeg = ...
        double(gridSpec.ElevationLimitsDeg(:)');
    if isfield(gridSpec, 'TimeSeconds') && ~isempty(gridSpec.TimeSeconds)
        validateattributes(gridSpec.TimeSeconds, {'numeric'}, ...
            {'vector', 'real', 'finite', 'nonempty'});
        if any(diff(double(gridSpec.TimeSeconds(:))) <= 0)
            error('rasterizeAzElTimeWorkspace:InvalidGridTime', ...
                'gridSpec.TimeSeconds must be strictly increasing.');
        end
    end
end

function gridTimes = resolveCommonTimeBase(obstacles)
%RESOLVECOMMONTIMEBASE Require one shared obstacle time vector.
    gridTimes = obstacles(1).TimeSeconds(:);
    for obstacleIdx = 2:numel(obstacles)
        candidate = obstacles(obstacleIdx).TimeSeconds(:);
        if numel(candidate) ~= numel(gridTimes) || ...
                any(abs(candidate - gridTimes) > 1e-9)
            error('rasterizeAzElTimeWorkspace:NoCommonTimeBase', ...
                ['The obstacles do not share one time vector. ' ...
                'Provide gridSpec.TimeSeconds explicitly.']);
        end
    end
end

function sliceIndices = mapTimesToSliceIndices(obstacle, queryTimes, ...
        timeMapping, outOfRangePolicy, toleranceSeconds)
%MAPTIMESTOSLICEINDICES Convert query times to bracketing slice indices.
%
% The result is numQueries-by-2 with [lower, upper] slice indices. A zero
% index means the obstacle does not apply at that query time.
    sliceTimes = obstacle.TimeSeconds(:);
    numSlices = numel(sliceTimes);
    numQueries = numel(queryTimes);
    queryTimes = double(queryTimes(:));

% 1. Classify out-of-range query times
    isBelow = queryTimes < sliceTimes(1) - toleranceSeconds;
    isAbove = queryTimes > sliceTimes(end) + toleranceSeconds;
    isOutside = isBelow | isAbove;
    if any(isOutside)
        switch outOfRangePolicy
            case 'error'
                error(['rasterizeAzElTimeWorkspace:' ...
                    'TimeOutOfRange'], ...
                    ['A query time is outside the time range of ' ...
                    'obstacle %s. Use the OutOfRangeTime option to ' ...
                    'allow this.'], char(obstacle.Name));
            case 'clamp'
                isOutside(:) = false;
            case 'free'
                % Outside times resolve to index 0 below.
        end
    end

% 2. Clamp the remaining query times into the sampled range
    clampedTimes = min(max(queryTimes, sliceTimes(1)), sliceTimes(end));

% 3. Find the lower and upper slice for every query
    if numSlices == 1
        lowerIdx = ones(numQueries, 1);
        upperIdx = ones(numQueries, 1);
    else
        switch timeMapping
            case 'nearest'
                lowerIdx = interp1(sliceTimes, (1:numSlices)', ...
                    clampedTimes, 'nearest');
                upperIdx = lowerIdx;
            case 'bracket'
                lowerIdx = interp1(sliceTimes, (1:numSlices)', ...
                    clampedTimes, 'previous');
                isStrictlyAfter = clampedTimes > ...
                    sliceTimes(lowerIdx) + toleranceSeconds;
                upperIdx = min(lowerIdx + isStrictlyAfter, numSlices);
        end
    end

% 4. Zero out queries where the obstacle does not exist
    lowerIdx(isOutside) = 0;
    upperIdx(isOutside) = 0;
    sliceIndices = [lowerIdx, upperIdx];
end

function page = rasterizeOnePage(obstacles, sliceMap, timeIdx, ...
        azMin, azCellSize, numAz, elMin, elCellSize, numEl, marginCells)
%RASTERIZEONEPAGE Combine every obstacle into one time page.
    page = false(numEl, numAz);
    for obstacleIdx = 1:numel(obstacles)
        indices = sliceMap{obstacleIdx}(timeIdx, :);
        indices = unique(indices(indices > 0));
        for sliceIdx = indices
            [azimuth, elevation] = extractSliceVertices( ...
                obstacles(obstacleIdx), sliceIdx);
            if isempty(azimuth)
                continue;
            end
            page = page | rasterizeSliceEvenOdd(azimuth, elevation, ...
                azMin, azCellSize, numAz, elMin, elCellSize, numEl);
        end
    end
    if marginCells > 0 && any(page(:))
        page = dilateMask(page, marginCells);
    end
end

function [azimuth, elevation] = extractSliceVertices(obstacle, sliceIdx)
%EXTRACTSLICEVERTICES Unpack one slice from the packed vertex arrays.
    firstIdx = obstacle.SliceOffsets(sliceIdx);
    lastIdx = obstacle.SliceOffsets(sliceIdx + 1) - 1;
    azimuth = double(obstacle.AzimuthDeg(firstIdx:lastIdx));
    elevation = double(obstacle.ElevationDeg(firstIdx:lastIdx));
end

function mask = rasterizeSliceEvenOdd(azimuth, elevation, ...
        azMin, azCellSize, numAz, elMin, elCellSize, numEl)
%RASTERIZESLICEEVENODD Vectorized even-odd scanline fill of one slice.
%
% For every grid row, each polygon edge that crosses the row center
% contributes one azimuth crossing. A cell center is inside when an odd
% number of crossings lie strictly to its left. The parity is computed
% for all rows at once with one accumarray and one cumsum.
    mask = false(numEl, numAz);

% 1. Build the closed edge list from the NaN-separated regions
    [edgeStartAz, edgeStartEl, edgeEndAz, edgeEndEl] = ...
        buildClosedEdges(azimuth, elevation);
    if isempty(edgeStartAz)
        return;
    end

% 2. Restrict the work to grid rows the slice can touch
%
% The row bounds are padded by one cell so borderline rounding can never
% drop a row. Rows without crossings cost nothing.
    lowestEdgeEl = min(min(edgeStartEl), min(edgeEndEl));
    highestEdgeEl = max(max(edgeStartEl), max(edgeEndEl));
    rowFirst = max(1, floor((lowestEdgeEl - elMin) / elCellSize));
    rowLast = min(numEl, ceil((highestEdgeEl - elMin) / elCellSize) + 1);
    if rowFirst > rowLast
        return;
    end
    rowElevations = elMin + ((rowFirst:rowLast) - 0.5) * elCellSize;
    numRows = numel(rowElevations);

% 3. Find every edge/row crossing
%
% The half-open comparison counts a vertex that lies exactly on a row
% center exactly once per true crossing.
    startBelow = edgeStartEl <= rowElevations;
    isCrossing = startBelow ~= (edgeEndEl <= rowElevations);
    if ~any(isCrossing(:))
        return;
    end
    edgeFraction = (rowElevations - edgeStartEl) ./ ...
        (edgeEndEl - edgeStartEl);
    crossingAz = edgeStartAz + edgeFraction .* (edgeEndAz - edgeStartAz);

% 4. Convert crossings into parity flips per cell column
%
% A crossing at azimuth aX flips the parity of every cell center to its
% right. The first flipped column is floor((aX - azMin)/cell + 0.5) + 1.
    [~, rowOfCrossing] = find(isCrossing);
    crossingAz = crossingAz(isCrossing);
    flipColumn = floor((crossingAz - azMin) / azCellSize + 0.5) + 1;
    isInsideGrid = flipColumn <= numAz;
    flipColumn = max(flipColumn(isInsideGrid), 1);
    rowOfCrossing = rowOfCrossing(isInsideGrid);
    if isempty(flipColumn)
        return;
    end

% 5. Accumulate flips and take the running parity along azimuth
    flipCounts = accumarray([rowOfCrossing(:), flipColumn(:)], 1, ...
        [numRows, numAz]);
    mask(rowFirst:rowLast, :) = mod(cumsum(flipCounts, 2), 2) > 0;
end

function [startAz, startEl, endAz, endEl] = ...
        buildClosedEdges(azimuth, elevation)
%BUILDCLOSEDEDGES Convert NaN-separated loops into a closed edge list.
%
% Each region is closed with an edge back to its first vertex. A region
% that already repeats its first vertex gains one zero-length edge, which
% never crosses a row center and is therefore harmless.
    isFinitePoint = isfinite(azimuth) & isfinite(elevation);
    finiteChanges = diff([false; isFinitePoint; false]);
    regionStarts = find(finiteChanges == 1);
    regionStops = find(finiteChanges == -1) - 1;
    startAzByRegion = cell(numel(regionStarts), 1);
    startElByRegion = cell(numel(regionStarts), 1);
    endAzByRegion = cell(numel(regionStarts), 1);
    endElByRegion = cell(numel(regionStarts), 1);
    numValidRegions = 0;
    for regionIdx = 1:numel(regionStarts)
        regionIndices = regionStarts(regionIdx):regionStops(regionIdx);
        if numel(regionIndices) < 3
            continue;
        end
        regionAz = azimuth(regionIndices);
        regionEl = elevation(regionIndices);
        numValidRegions = numValidRegions + 1;
        startAzByRegion{numValidRegions} = regionAz;
        startElByRegion{numValidRegions} = regionEl;
        endAzByRegion{numValidRegions} = [regionAz(2:end); regionAz(1)];
        endElByRegion{numValidRegions} = [regionEl(2:end); regionEl(1)];
    end
    if numValidRegions == 0
        startAz = zeros(0, 1);
        startEl = zeros(0, 1);
        endAz = zeros(0, 1);
        endEl = zeros(0, 1);
        return;
    end
    startAz = vertcat(startAzByRegion{1:numValidRegions});
    startEl = vertcat(startElByRegion{1:numValidRegions});
    endAz = vertcat(endAzByRegion{1:numValidRegions});
    endEl = vertcat(endElByRegion{1:numValidRegions});
end

function mask = dilateMask(mask, radiusCells)
%DILATEMASK Disk dilation without any toolbox dependency.
    [gridAz, gridEl] = meshgrid(-radiusCells:radiusCells);
    diskKernel = single(gridAz.^2 + gridEl.^2 <= radiusCells^2 + 0.25);
    mask = conv2(single(mask), diskKernel, 'same') > 0;
end
