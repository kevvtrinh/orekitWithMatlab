function options = defaultAzElAnimationOptions(input, preferences)
%% Section 0: Header & Readme
% SYNTAX
%   options = defaultAzElAnimationOptions()
%   options = defaultAzElAnimationOptions(input)
%   options = defaultAzElAnimationOptions(input, preferences)
%**************************************************************************
% PURPOSE
%   - Resolve reusable example presentation preferences and per-call
%     overrides against the animator's public defaults.
%**************************************************************************
% INPUTS
%   - input (scalar struct)
%       Per-call animation overrides with highest precedence.
%   - preferences (scalar struct)
%       Reusable example presentation policy.
%**************************************************************************
% OUTPUTS
%   - options (scalar struct)
%       Fully populated combined-view animation options.
%**************************************************************************
% UNITS
%   - Units follow animateAzElAvoidancePlan.

%% Section 1: Validate Inputs & Apply Defaults
if nargin < 1 || isempty(input)
    input = struct();
end
if nargin < 2 || isempty(preferences)
    preferences = struct();
end
if ~isstruct(input) || ~isscalar(input) || ...
        ~isstruct(preferences) || ~isscalar(preferences)
    error("defaultAzElAnimationOptions:InvalidOptions", ...
        "input and preferences must be scalar structs.");
end
figureVisible = string(get(groot, "DefaultFigureVisible"));
defaultOptions = animateAzElAvoidancePlan();
defaultOptions.ObstacleFaceAlpha = 0.06;
defaultOptions.FigureVisible = figureVisible;
knownOptionFields = fieldnames(defaultOptions);
unknownInputFields = setdiff( ...
    fieldnames(input), knownOptionFields, "stable");
unknownPreferenceFields = setdiff( ...
    fieldnames(preferences), knownOptionFields, "stable");
unknownOptionFields = unique([ ...
    unknownInputFields; unknownPreferenceFields], "stable");
if ~isempty(unknownOptionFields)
    warning("defaultAzElAnimationOptions:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    input = rmfield(input, unknownInputFields);
    preferences = rmfield(preferences, unknownPreferenceFields);
end

%% Section 2: Apply Preferences & Per-Call Overrides
% Preferences define reusable presentation policy, while input remains the
% per-call override. Applying them in this order preserves that precedence.
preferenceFields = fieldnames(preferences);
for preferenceIndex = 1:numel(preferenceFields)
    preferenceField = preferenceFields{preferenceIndex};
    defaultOptions.(preferenceField) = preferences.(preferenceField);
end

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
