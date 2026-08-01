function results = runStaticGauntletExamples()
%% Section 0: Header & Readme
% SYNTAX
%   results = runStaticGauntletExamples()
%**************************************************************************
% PURPOSE
%   - Run and require success from numbered examples 05 through 09.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - results (struct array)
%       One complete result record per static gauntlet.
%**************************************************************************
% UNITS
%   - Units follow each example result.

%% Section 1: Define The Ordered Example Set
exampleFunctions = { ...
    @example05FiveTurnSpiral, ...
    @example06StopGoGates, ...
    @example07WrappedAzimuthSeam, ...
    @example08AlternatingSlalom, ...
    @example09UTrapEscape};
results = struct.empty(0, 1);

%% Section 2: Run Every Example
for exampleIndex = 1:numel(exampleFunctions)
    fprintf("\nRunning gauntlet %d of %d...\n", ...
        exampleIndex, numel(exampleFunctions));
    currentResult = exampleFunctions{exampleIndex}();
    if isempty(results)
        results = repmat(currentResult, numel(exampleFunctions), 1);
    else
        results(exampleIndex) = currentResult;
    end
end
fprintf("\nAll five az/el avoidance gauntlets passed.\n");
end
