function resolvedOptions = defaultAzElAnimationOptions( ...
        callOverrides, presentationPreferences)
%% Section 0: Header & Readme
% SYNTAX
%   resolvedOptions = defaultAzElAnimationOptions()
%   resolvedOptions = defaultAzElAnimationOptions(callOverrides)
%   resolvedOptions = defaultAzElAnimationOptions( ...
%       callOverrides, presentationPreferences)
%**************************************************************************
% PURPOSE
%   - Resolve reusable example presentation preferences and per-call
%     overrides against the animator's public defaults.
%**************************************************************************
% INPUTS
%   - callOverrides (scalar struct)
%       Per-call animation overrides with highest precedence.
%   - presentationPreferences (scalar struct)
%       Reusable example presentation policy.
%**************************************************************************
% OUTPUTS
%   - resolvedOptions (scalar struct)
%       Fully populated combined-view animation options.
%**************************************************************************
% UNITS
%   - Units follow animateAzElAvoidancePlan.

%% Section 1: Validate Inputs & Apply Defaults
if nargin < 1 || isempty(callOverrides)
    callOverrides = struct();
end
if nargin < 2 || isempty(presentationPreferences)
    presentationPreferences = struct();
end
hasValidOverrides = isstruct(callOverrides) && isscalar(callOverrides);
preferencesAreStruct = isstruct(presentationPreferences);
preferencesAreScalar = isscalar(presentationPreferences);
hasValidPreferences = preferencesAreStruct && preferencesAreScalar;
if ~hasValidOverrides || ~hasValidPreferences
    error("defaultAzElAnimationOptions:InvalidOptions", ...
        "input and preferences must be scalar structs.");
end
figureVisible = string(get(groot, "DefaultFigureVisible"));
defaultOptions = animateAzElAvoidancePlan();
defaultOptions.ObstacleFaceAlpha = 0.06;
defaultOptions.FigureVisible = figureVisible;
knownOptionFields = fieldnames(defaultOptions);
unknownInputFields = setdiff( ...
    fieldnames(callOverrides), knownOptionFields, "stable");
unknownPreferenceFields = setdiff( ...
    fieldnames(presentationPreferences), knownOptionFields, "stable");
unknownOptionFields = unique([ ...
    unknownInputFields; unknownPreferenceFields], "stable");
if ~isempty(unknownOptionFields)
    warning("defaultAzElAnimationOptions:UnknownOptions", ...
        "Ignoring unknown option fields: %s.", ...
        strjoin(string(unknownOptionFields), ", "));
    callOverrides = rmfield(callOverrides, unknownInputFields);
    presentationPreferences = rmfield( ...
        presentationPreferences, unknownPreferenceFields);
end

%% Section 2: Apply Preferences & Per-Call Overrides
% Preferences define reusable presentation policy, while input remains the
% per-call override. Applying them in this order preserves that precedence.
preferenceFields = fieldnames(presentationPreferences);
for preferenceIndex = 1:numel(preferenceFields)
    preferenceField = preferenceFields{preferenceIndex};
    preferenceValue = presentationPreferences.(preferenceField);
    defaultOptions.(preferenceField) = preferenceValue;
end

resolvedOptions = callOverrides;
defaultFields = fieldnames(defaultOptions);
for defaultIndex = 1:numel(defaultFields)
    defaultField = defaultFields{defaultIndex};
    isMissingOption = ~isfield(resolvedOptions, defaultField);
    if isMissingOption
        resolvedOptions.(defaultField) = defaultOptions.(defaultField);
    elseif isempty(resolvedOptions.(defaultField))
        resolvedOptions.(defaultField) = defaultOptions.(defaultField);
    end
end
if lower(string(resolvedOptions.FigureVisible)) == "off"
    % Invisible figures are normally created by tests and batch examples.
    % One final frame exercises every graphics object without spending time
    % replaying an animation nobody can see. Explicit caller values still
    % win when a headless test needs multi-frame coverage.
    if ~isfield(callOverrides, "MaximumAnimationFrames")
        resolvedOptions.MaximumAnimationFrames = 1;
    end
    if ~isfield(callOverrides, "PauseSeconds")
        resolvedOptions.PauseSeconds = 0;
    end
end
% Example entry points promise a comparable side-by-side diagnostic view.
% Direct animateAzElAvoidancePlan callers can still request a single pane.
resolvedOptions.ViewMode = "combined";
end
