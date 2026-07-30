function options = defaultAzElAnimationOptions(input, preferences)
%DEFAULTAZELANIMATIONOPTIONS Build consistent combined-view animation options.

if nargin < 1 || isempty(input)
    input = struct();
end
if nargin < 2 || isempty(preferences)
    preferences = struct();
end
figureVisible = string(get(groot, "DefaultFigureVisible"));
defaultOptions = struct( ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 180, ...
    "MaximumDisplayedSlices", 100, ...
    "PauseSeconds", 0.01, ...
    "ShowFuturePath", true, ...
    "ShowObstacleSlices", true, ...
    "ObstacleFaceAlpha", 0.06, ...
    "FigureVisible", figureVisible);

%% Apply caller preferences to defaults
% Preferences define reusable presentation policy, while input remains the
% per-call override. Applying them in this order preserves that precedence.
preferenceFields = fieldnames(preferences);
for preferenceIndex = 1:numel(preferenceFields)
    preferenceField = preferenceFields{preferenceIndex};
    defaultOptions.(preferenceField) = preferences.(preferenceField);
end

%% Fill only missing per-call values
options = input;
defaultFields = fieldnames(defaultOptions);
for defaultIndex = 1:numel(defaultFields)
    defaultField = defaultFields{defaultIndex};
    if ~isfield(options, defaultField) || isempty(options.(defaultField))
        options.(defaultField) = defaultOptions.(defaultField);
    end
end
if lower(string(options.FigureVisible)) == "off"
    % Invisible figures are normally created by tests and batch examples.
    % One final frame exercises every graphics object without spending time
    % replaying an animation nobody can see. Explicit caller values still
    % win when a headless test needs multi-frame coverage.
    if ~isfield(input, "MaximumAnimationFrames")
        options.MaximumAnimationFrames = 1;
    end
    if ~isfield(input, "PauseSeconds")
        options.PauseSeconds = 0;
    end
end
% Example entry points promise a comparable side-by-side diagnostic view.
% Direct animateAzElAvoidancePlan callers can still request a single pane.
options.ViewMode = "combined";
end
