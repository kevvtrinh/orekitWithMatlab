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

items = cell(0, 1);
for inputIndex = 1:nargin
    items = [items; flattenInput(varargin{inputIndex}, inputIndex)]; ...
        %#ok<AGROW>
end
if isempty(items)
    error("combineAzElObstacles:EmptyInput", ...
        "Provide at least one azElData obstacle.");
end

normalized = cell(size(items));
for obstacleIndex = 1:numel(items)
    normalized{obstacleIndex} = ...
        normalizeAzElTimeObstacleData(items{obstacleIndex});
end
obstacles = vertcat(normalized{:});
end

function items = flattenInput(input, inputIndex)
if isstruct(input)
    items = cell(numel(input), 1);
    for itemIndex = 1:numel(input)
        items{itemIndex} = input(itemIndex);
    end
    return;
end
if iscell(input)
    items = cell(0, 1);
    for itemIndex = 1:numel(input)
        nested = flattenInput(input{itemIndex}, inputIndex);
        items = [items; nested]; %#ok<AGROW>
    end
    return;
end
error("combineAzElObstacles:InvalidInput", ...
    ["Input %d must be an azElData struct, struct array, or cell " ...
    "array containing azElData structs."], inputIndex);
end
