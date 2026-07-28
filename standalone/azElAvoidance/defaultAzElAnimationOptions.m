function options = defaultAzElAnimationOptions(input, preferences)
%DEFAULTAZELANIMATIONOPTIONS Build consistent combined-view animation options.

if nargin < 1 || isempty(input)
    input = struct();
end
if nargin < 2 || isempty(preferences)
    preferences = struct();
end
figureVisible = string(get(groot, "DefaultFigureVisible"));
defaults = struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.06, ...
    "FigureVisible", figureVisible);
defaults = applyValues(defaults, preferences);
options = applyDefaults(input, defaults);
if lower(string(options.FigureVisible)) == "off"
    if ~isfield(input, "MaximumAnimationFrames")
        options.MaximumAnimationFrames = 1;
    end
    if ~isfield(input, "PauseSeconds")
        options.PauseSeconds = 0;
    end
end
options.ViewMode = "combined";
end

function output = applyDefaults(input, defaults)
output = input;
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(output, names{k}) || isempty(output.(names{k}))
        output.(names{k}) = defaults.(names{k});
    end
end
end

function output = applyValues(input, values)
output = input;
names = fieldnames(values);
for k = 1:numel(names)
    output.(names{k}) = values.(names{k});
end
end
