function obstacles = combineAzElObstacles(varargin)
%COMBINEAZELOBSTACLES Combine azElData inputs into one obstacle array.
%
% obstacles = combineAzElObstacles(vietnam, china)
% obstacles = combineAzElObstacles([vietnam, china])
% obstacles = combineAzElObstacles({vietnam, china})
%
% Each scalar azElData struct is retained as an independent obstacle. Input
% struct arrays and nested cell arrays are flattened, validated, and
% returned as one canonical column struct array.

if nargin == 0
    error("combineAzElObstacles:EmptyInput", ...
        "Provide at least one azElData obstacle.");
end

%% Flatten nested inputs in caller order
% The stack carries each top-level argument number so a malformed nested
% value still identifies the public input that contained it. Reversing each
% push makes the next pop match the caller's original order.
pendingValues = flipud(varargin(:));
pendingInputIndices = num2cell((nargin:-1:1).');
obstacleItems = cell(0, 1);
while ~isempty(pendingValues)
    currentValue = pendingValues{end};
    currentInputIndex = pendingInputIndices{end};
    pendingValues(end) = [];
    pendingInputIndices(end) = [];
    if isstruct(currentValue)
        flattenedStructItems = num2cell(currentValue(:));
        obstacleItems = [obstacleItems; flattenedStructItems]; %#ok<AGROW>
    elseif iscell(currentValue)
        nestedValueCount = numel(currentValue);
        reversedNestedValues = flipud(currentValue(:));
        pendingValues = [pendingValues; reversedNestedValues]; %#ok<AGROW>
        pendingInputIndices = [pendingInputIndices; repmat( ...
            {currentInputIndex}, nestedValueCount, 1)]; %#ok<AGROW>
    else
        error("combineAzElObstacles:InvalidInput", ...
            ["Input %d must be an azElData struct, struct array, or cell " ...
            "array containing azElData structs."], currentInputIndex);
    end
end
if isempty(obstacleItems)
    error("combineAzElObstacles:EmptyInput", ...
        "Provide at least one azElData obstacle.");
end

%% Normalize every scalar obstacle to the public schema
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
