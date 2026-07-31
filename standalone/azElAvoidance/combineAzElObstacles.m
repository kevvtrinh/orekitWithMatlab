function obstacles = combineAzElObstacles(varargin)
%% Section 0: Header & Readme
% SYNTAX
%   obstacles = combineAzElObstacles(obstacle1, obstacle2, ...)
%   obstacles = combineAzElObstacles(obstacleArray)
%   obstacles = combineAzElObstacles(nestedObstacleCells)
%**************************************************************************
% PURPOSE
%   - Flatten and validate canonical obstacle inputs in caller order.
%**************************************************************************
% INPUTS
%   - varargin (struct arrays or nested cell arrays)
%       Every leaf must be a canonical scalar azElData struct.
%**************************************************************************
% OUTPUTS
%   - obstacles (column struct array)
%       Independently retained, validated obstacle records.
%**************************************************************************
% UNITS
%   - Canonical az_deg and el_deg fields are degrees; time_s is seconds.

%% Section 1: Validate Inputs
if nargin == 0
    error("combineAzElObstacles:EmptyInput", ...
        "Provide at least one azElData obstacle.");
end

%% Section 2: Flatten Nested Inputs
% The stack carries each top-level argument number so a malformed nested
% value still identifies the public input that contained it. Reversing each
% push makes the next pop match the caller's original order.
pendingCapacity = max(16, nargin);
pendingValues = cell(pendingCapacity, 1);
pendingInputIndices = zeros(pendingCapacity, 1);
pendingValues(1:nargin) = flipud(varargin(:));
pendingInputIndices(1:nargin) = (nargin:-1:1).';
pendingCount = nargin;
obstacleCapacity = 16;
obstacleItems = cell(obstacleCapacity, 1);
obstacleCount = 0;
while pendingCount > 0
    currentValue = pendingValues{pendingCount};
    currentInputIndex = pendingInputIndices(pendingCount);
    pendingValues{pendingCount} = [];
    pendingCount = pendingCount - 1;
    if isstruct(currentValue)
        flattenedStructItems = num2cell(currentValue(:));
        addedObstacleCount = numel(flattenedStructItems);
        requiredObstacleCapacity = obstacleCount + addedObstacleCount;
        if requiredObstacleCapacity > obstacleCapacity
            obstacleCapacity = max( ...
                2 * obstacleCapacity, requiredObstacleCapacity);
            obstacleItems{obstacleCapacity, 1} = [];
        end
        itemRows = obstacleCount + (1:addedObstacleCount);
        obstacleItems(itemRows) = flattenedStructItems;
        obstacleCount = requiredObstacleCapacity;
    elseif iscell(currentValue)
        nestedValueCount = numel(currentValue);
        reversedNestedValues = flipud(currentValue(:));
        requiredPendingCapacity = pendingCount + nestedValueCount;
        if requiredPendingCapacity > pendingCapacity
            pendingCapacity = max( ...
                2 * pendingCapacity, requiredPendingCapacity);
            pendingValues{pendingCapacity, 1} = [];
            pendingInputIndices(pendingCapacity, 1) = 0;
        end
        pendingRows = pendingCount + (1:nestedValueCount);
        pendingValues(pendingRows) = reversedNestedValues;
        pendingInputIndices(pendingRows) = currentInputIndex;
        pendingCount = requiredPendingCapacity;
    else
        error("combineAzElObstacles:InvalidInput", ...
            ["Input %d must be an azElData struct, struct array, or cell " ...
            "array containing azElData structs."], currentInputIndex);
    end
end
obstacleItems = obstacleItems(1:obstacleCount);
if obstacleCount == 0
    error("combineAzElObstacles:EmptyInput", ...
        "Provide at least one azElData obstacle.");
end

%% Section 3: Normalize The Public Schema
% Validation occurs after flattening so all accepted container forms reach
% one schema gate. A bad obstacle therefore cannot survive merely because
% it arrived inside a cell or struct array.
normalizedObstacles = cell(size(obstacleItems));
for obstacleIndex = 1:numel(obstacleItems)
    normalizedObstacles{obstacleIndex} = normalizeAzElTimeObstacleData( ...
        obstacleItems{obstacleIndex});
end
obstacles = vertcat(normalizedObstacles{:});
end
