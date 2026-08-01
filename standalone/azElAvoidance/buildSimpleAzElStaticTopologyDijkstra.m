function topology = buildSimpleAzElStaticTopologyDijkstra( ...
        occupiedPosition, azimuthGrid_deg, elevationGrid_deg, ...
        initialAzimuthIndex, initialElevationIndex, ...
        destinationAzimuthIndex, destinationElevationIndex, ...
        allowAzimuthWrap)
%% Section 0: Header & Readme
% SYNTAX
%   topology = buildSimpleAzElStaticTopologyDijkstra()
%   topology = buildSimpleAzElStaticTopologyDijkstra( ...
%       occupiedPosition, azimuthGrid_deg, elevationGrid_deg, ...
%       initialAzimuthIndex, initialElevationIndex, ...
%       destinationAzimuthIndex, destinationElevationIndex, ...
%       allowAzimuthWrap)
%**************************************************************************
% PURPOSE
%   - Run a first-principles reverse Dijkstra search from one destination
%     over a static eight-connected azimuth/elevation occupancy lattice.
%   - Return an exact static-lattice cost-to-go map that can order only
%     equal-cost states in the seven-coordinate kinodynamic search.
%   - Prevent diagonal edges from crossing an occupied cell corner.
%**************************************************************************
% INPUTS
%   - occupiedPosition (elevation-by-azimuth logical matrix)
%       True at static position cells that cannot be traversed.
%   - azimuthGrid_deg, elevationGrid_deg (numeric vectors)
%       Strictly increasing uniform position-lattice coordinates.
%   - initialAzimuthIndex, initialElevationIndex (positive integers)
%       Mapped initial position subscripts used to reconstruct one route.
%   - destinationAzimuthIndex, destinationElevationIndex
%       Mapped destination position subscripts that root reverse Dijkstra.
%   - allowAzimuthWrap (logical scalar)
%       Whether first and last azimuth columns are adjacent.
%**************************************************************************
% OUTPUTS
%   - topology (scalar diagnostic struct)
%       PascalCase fields expose use, connectivity, costs, settled cells,
%       next-cell parents, the initial-to-destination grid route, and node
%       counts. A zero-argument call returns the unused record template.
%**************************************************************************
% UNITS
%   - Position and edge costs are degrees. Indices and counts are unitless.

%% Section 1: Validate Inputs
topology = emptySimpleAzElStaticTopology();
if nargin == 0
    return;
end
validateattributes(occupiedPosition, {'logical', 'numeric'}, ...
    {'2d', 'nonempty'});
validateattributes(azimuthGrid_deg, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
validateattributes(elevationGrid_deg, {'numeric'}, ...
    {'vector', 'real', 'finite', 'increasing'});
azimuthGrid_deg = reshape(double(azimuthGrid_deg), 1, []);
elevationGrid_deg = reshape(double(elevationGrid_deg), 1, []);
occupiedPosition = logical(occupiedPosition);

positionGridSize = [numel(elevationGrid_deg), numel(azimuthGrid_deg)];
if ~isequal(size(occupiedPosition), positionGridSize)
    error("buildSimpleAzElStaticTopologyDijkstra:GridSizeMismatch", ...
        ["occupiedPosition must contain one row per elevation value and " ...
        "one column per azimuth value."]);
end
if numel(azimuthGrid_deg) < 2 || numel(elevationGrid_deg) < 2
    error("buildSimpleAzElStaticTopologyDijkstra:GridTooSmall", ...
        "Both position axes must contain at least two grid values.");
end

indexValues = [initialAzimuthIndex, initialElevationIndex, ...
    destinationAzimuthIndex, destinationElevationIndex];
indexUpperBounds = [positionGridSize(2), positionGridSize(1), ...
    positionGridSize(2), positionGridSize(1)];
validateattributes(indexValues, {'numeric'}, ...
    {'vector', 'numel', 4, 'real', 'finite', 'integer', 'positive'});
if any(indexValues > indexUpperBounds)
    error("buildSimpleAzElStaticTopologyDijkstra:IndexOutsideGrid", ...
        "Every endpoint subscript must lie inside its position axis.");
end
validateattributes(allowAzimuthWrap, {'logical', 'numeric'}, {'scalar'});
allowAzimuthWrap = logical(allowAzimuthWrap);

azimuthSteps_deg = diff(azimuthGrid_deg);
elevationSteps_deg = diff(elevationGrid_deg);
uniformityTolerance = 1e-9;
azimuthIsUniform = max(abs(azimuthSteps_deg - azimuthSteps_deg(1))) <= ...
    uniformityTolerance * max(1, abs(azimuthSteps_deg(1)));
elevationIsUniform = ...
    max(abs(elevationSteps_deg - elevationSteps_deg(1))) <= ...
    uniformityTolerance * max(1, abs(elevationSteps_deg(1)));
if ~azimuthIsUniform || ~elevationIsUniform
    error("buildSimpleAzElStaticTopologyDijkstra:NonuniformGrid", ...
        "Static topology Dijkstra requires uniform position axes.");
end
if occupiedPosition(destinationElevationIndex, destinationAzimuthIndex)
    error("buildSimpleAzElStaticTopologyDijkstra:DestinationOccupied", ...
        "The static-topology destination cell is occupied.");
end

%% Section 2: Initialize Reverse Dijkstra
azimuthStep_deg = azimuthSteps_deg(1);
elevationStep_deg = elevationSteps_deg(1);
positionNodeCount = prod(positionGridSize);
costToGoal_deg = inf(positionGridSize);
settledMask = false(positionGridSize);
nextAzimuthIndex = zeros(positionGridSize, "uint32");
nextElevationIndex = zeros(positionGridSize, "uint32");

destinationNodeIndex = sub2ind(positionGridSize, ...
    destinationElevationIndex, destinationAzimuthIndex);
costToGoal_deg(destinationNodeIndex) = 0;
nextAzimuthIndex(destinationNodeIndex) = ...
    uint32(destinationAzimuthIndex);
nextElevationIndex(destinationNodeIndex) = ...
    uint32(destinationElevationIndex);

% The indexed heap contains at most one entry per position cell. Its
% location map makes every relaxation a visible insert or decrease-key.
frontierNodeIndex = zeros(positionNodeCount, 1, "uint32");
frontierCost_deg = inf(positionNodeCount, 1);
frontierLocationByNodeIndex = zeros(positionNodeCount, 1, "uint32");
frontierCount = 1;
frontierNodeIndex(1) = uint32(destinationNodeIndex);
frontierCost_deg(1) = 0;
frontierLocationByNodeIndex(destinationNodeIndex) = uint32(1);

neighborOffset = [ ...
    -1, -1; 0, -1; 1, -1; ...
    -1,  0;          1,  0; ...
    -1,  1; 0,  1; 1,  1];
expandedNodeCount = 0;

%% Section 3: Run Goal-Rooted Dijkstra
while frontierCount > 0
    currentNodeIndex = double(frontierNodeIndex(1));
    finalFrontierNodeIndex = ...
        double(frontierNodeIndex(frontierCount));
    finalFrontierCost_deg = frontierCost_deg(frontierCount);
    frontierLocationByNodeIndex(currentNodeIndex) = uint32(0);
    frontierCount = frontierCount - 1;

    if frontierCount > 0
        frontierNodeIndex(1) = uint32(finalFrontierNodeIndex);
        frontierCost_deg(1) = finalFrontierCost_deg;
        frontierLocationByNodeIndex(finalFrontierNodeIndex) = uint32(1);

        parentLocation = 1;
        while true
            leftChildLocation = 2 * parentLocation;
            if leftChildLocation > frontierCount
                break;
            end
            rightChildLocation = leftChildLocation + 1;
            selectedChildLocation = leftChildLocation;
            if rightChildLocation <= frontierCount
                rightCostIsLower = ...
                    frontierCost_deg(rightChildLocation) < ...
                    frontierCost_deg(leftChildLocation);
                rightTieIndexIsLower = ...
                    frontierCost_deg(rightChildLocation) == ...
                    frontierCost_deg(leftChildLocation) && ...
                    frontierNodeIndex(rightChildLocation) < ...
                    frontierNodeIndex(leftChildLocation);
                if rightCostIsLower || rightTieIndexIsLower
                    selectedChildLocation = rightChildLocation;
                end
            end

            childCostIsLower = ...
                frontierCost_deg(selectedChildLocation) < ...
                frontierCost_deg(parentLocation);
            childTieIndexIsLower = ...
                frontierCost_deg(selectedChildLocation) == ...
                frontierCost_deg(parentLocation) && ...
                frontierNodeIndex(selectedChildLocation) < ...
                frontierNodeIndex(parentLocation);
            if ~childCostIsLower && ~childTieIndexIsLower
                break;
            end

            parentNodeIndex = frontierNodeIndex(parentLocation);
            parentCost_deg = frontierCost_deg(parentLocation);
            childNodeIndex = frontierNodeIndex(selectedChildLocation);
            childCost_deg = frontierCost_deg(selectedChildLocation);
            frontierNodeIndex(parentLocation) = childNodeIndex;
            frontierCost_deg(parentLocation) = childCost_deg;
            frontierNodeIndex(selectedChildLocation) = parentNodeIndex;
            frontierCost_deg(selectedChildLocation) = parentCost_deg;
            frontierLocationByNodeIndex(childNodeIndex) = ...
                uint32(parentLocation);
            frontierLocationByNodeIndex(parentNodeIndex) = ...
                uint32(selectedChildLocation);
            parentLocation = selectedChildLocation;
        end
    end

    settledMask(currentNodeIndex) = true;
    expandedNodeCount = expandedNodeCount + 1;
    [currentElevationIndex, currentAzimuthIndex] = ...
        ind2sub(positionGridSize, currentNodeIndex);
    currentCost_deg = costToGoal_deg(currentNodeIndex);

    for neighborOffsetIndex = 1:size(neighborOffset, 1)
        azimuthIndexOffset = neighborOffset(neighborOffsetIndex, 1);
        elevationIndexOffset = neighborOffset(neighborOffsetIndex, 2);
        neighborElevationIndex = ...
            currentElevationIndex + elevationIndexOffset;
        if neighborElevationIndex < 1 || ...
                neighborElevationIndex > positionGridSize(1)
            continue;
        end

        neighborAzimuthIndex = currentAzimuthIndex + azimuthIndexOffset;
        if allowAzimuthWrap
            neighborAzimuthIndex = mod( ...
                neighborAzimuthIndex - 1, positionGridSize(2)) + 1;
        elseif neighborAzimuthIndex < 1 || ...
                neighborAzimuthIndex > positionGridSize(2)
            continue;
        end
        neighborNodeIndex = sub2ind(positionGridSize, ...
            neighborElevationIndex, neighborAzimuthIndex);
        if neighborNodeIndex == currentNodeIndex || ...
                occupiedPosition(neighborNodeIndex) || ...
                settledMask(neighborNodeIndex)
            continue;
        end

        edgeIsDiagonal = ...
            azimuthIndexOffset ~= 0 && elevationIndexOffset ~= 0;
        if edgeIsDiagonal
            azimuthSideIsOccupied = occupiedPosition( ...
                currentElevationIndex, neighborAzimuthIndex);
            elevationSideIsOccupied = occupiedPosition( ...
                neighborElevationIndex, currentAzimuthIndex);
            if azimuthSideIsOccupied || elevationSideIsOccupied
                continue;
            end
        end

        edgeCost_deg = hypot( ...
            azimuthIndexOffset * azimuthStep_deg, ...
            elevationIndexOffset * elevationStep_deg);
        candidateCost_deg = currentCost_deg + edgeCost_deg;
        if candidateCost_deg >= costToGoal_deg(neighborNodeIndex)
            continue;
        end

        costToGoal_deg(neighborNodeIndex) = candidateCost_deg;
        nextAzimuthIndex(neighborNodeIndex) = uint32(currentAzimuthIndex);
        nextElevationIndex(neighborNodeIndex) = ...
            uint32(currentElevationIndex);

        frontierLocation = double( ...
            frontierLocationByNodeIndex(neighborNodeIndex));
        if frontierLocation == 0
            frontierCount = frontierCount + 1;
            frontierLocation = frontierCount;
            frontierNodeIndex(frontierLocation) = ...
                uint32(neighborNodeIndex);
            frontierLocationByNodeIndex(neighborNodeIndex) = ...
                uint32(frontierLocation);
        end
        frontierCost_deg(frontierLocation) = candidateCost_deg;

        childLocation = frontierLocation;
        while childLocation > 1
            parentLocation = floor(childLocation / 2);
            childCostIsLower = frontierCost_deg(childLocation) < ...
                frontierCost_deg(parentLocation);
            childTieIndexIsLower = ...
                frontierCost_deg(childLocation) == ...
                frontierCost_deg(parentLocation) && ...
                frontierNodeIndex(childLocation) < ...
                frontierNodeIndex(parentLocation);
            if ~childCostIsLower && ~childTieIndexIsLower
                break;
            end

            childNodeIndex = frontierNodeIndex(childLocation);
            childCost_deg = frontierCost_deg(childLocation);
            parentNodeIndex = frontierNodeIndex(parentLocation);
            parentCost_deg = frontierCost_deg(parentLocation);
            frontierNodeIndex(parentLocation) = childNodeIndex;
            frontierCost_deg(parentLocation) = childCost_deg;
            frontierNodeIndex(childLocation) = parentNodeIndex;
            frontierCost_deg(childLocation) = parentCost_deg;
            frontierLocationByNodeIndex(childNodeIndex) = ...
                uint32(parentLocation);
            frontierLocationByNodeIndex(parentNodeIndex) = ...
                uint32(childLocation);
            childLocation = parentLocation;
        end
    end
end

%% Section 4: Reconstruct The Initial Static Route
initialNodeIndex = sub2ind(positionGridSize, ...
    initialElevationIndex, initialAzimuthIndex);
initialCellCanReachDestination = isfinite(costToGoal_deg(initialNodeIndex));
pathSubscripts = zeros(positionNodeCount, 2, "uint32");
pathNodeCount = 0;
if initialCellCanReachDestination
    currentAzimuthIndex = initialAzimuthIndex;
    currentElevationIndex = initialElevationIndex;
    while pathNodeCount < positionNodeCount
        pathNodeCount = pathNodeCount + 1;
        pathSubscripts(pathNodeCount, :) = uint32( ...
            [currentAzimuthIndex, currentElevationIndex]);
        if currentAzimuthIndex == destinationAzimuthIndex && ...
                currentElevationIndex == destinationElevationIndex
            break;
        end
        currentNodeIndex = sub2ind(positionGridSize, ...
            currentElevationIndex, currentAzimuthIndex);
        currentAzimuthIndex = double( ...
            nextAzimuthIndex(currentNodeIndex));
        currentElevationIndex = double( ...
            nextElevationIndex(currentNodeIndex));
        if currentAzimuthIndex == 0 || currentElevationIndex == 0
            initialCellCanReachDestination = false;
            break;
        end
    end
end
pathSubscripts = pathSubscripts(1:pathNodeCount, :);
pathPosition_deg = zeros(pathNodeCount, 2);
if pathNodeCount > 0
    pathPosition_deg(:, 1) = azimuthGrid_deg( ...
        double(pathSubscripts(:, 1)));
    pathPosition_deg(:, 2) = elevationGrid_deg( ...
        double(pathSubscripts(:, 2)));
end

%% Section 5: Package The Topology Diagnostic
if initialCellCanReachDestination
    message = "Static goal-rooted Dijkstra found a position route.";
else
    message = ["Static goal-rooted Dijkstra completed, but the mapped " ...
        "initial position is disconnected from the destination."];
end
topology.Used = true;
topology.GeometryIsStatic = true;
topology.AppliedAsEqualCostTieBreaker = false;
topology.Success = initialCellCanReachDestination;
topology.Message = message;
topology.InitialSubscripts = ...
    uint32([initialAzimuthIndex, initialElevationIndex]);
topology.DestinationSubscripts = ...
    uint32([destinationAzimuthIndex, destinationElevationIndex]);
topology.InitialCostToGoal_deg = costToGoal_deg(initialNodeIndex);
topology.CostToGoal_deg = costToGoal_deg;
topology.SettledMask = settledMask;
topology.NextAzimuthIndex = nextAzimuthIndex;
topology.NextElevationIndex = nextElevationIndex;
topology.InitialPathSubscripts = pathSubscripts;
topology.InitialPath_deg = pathPosition_deg;
topology.ExpandedNodeCount = expandedNodeCount;
topology.ReachableNodeCount = nnz(isfinite(costToGoal_deg));
end

function topology = emptySimpleAzElStaticTopology()
%% Section 0: Header & Readme
% SYNTAX
%   topology = emptySimpleAzElStaticTopology()
%**************************************************************************
% PURPOSE
%   - Define one stable return schema for unused and completed static
%     topology searches.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - topology (scalar diagnostic struct)
%       Empty static-topology record with PascalCase fields.
%**************************************************************************
% UNITS
%   - Position and edge costs are degrees. Indices and counts are unitless.
topology = struct( ...
    "Used", false, ...
    "GeometryIsStatic", false, ...
    "AppliedAsEqualCostTieBreaker", false, ...
    "Success", false, ...
    "Message", "Static topology Dijkstra was not requested.", ...
    "InitialSubscripts", zeros(0, 2, "uint32"), ...
    "DestinationSubscripts", zeros(0, 2, "uint32"), ...
    "InitialCostToGoal_deg", Inf, ...
    "CostToGoal_deg", zeros(0, 0), ...
    "SettledMask", false(0, 0), ...
    "NextAzimuthIndex", zeros(0, 0, "uint32"), ...
    "NextElevationIndex", zeros(0, 0, "uint32"), ...
    "InitialPathSubscripts", zeros(0, 2, "uint32"), ...
    "InitialPath_deg", zeros(0, 2), ...
    "ExpandedNodeCount", 0, ...
    "ReachableNodeCount", 0);
end
