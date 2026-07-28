function results = runStaticGauntletExamples()
%RUNSTATICGAUNTLETEXAMPLES Run numbered static examples 05 through 09.

examples = { ...
    @example05FiveTurnSpiral, ...
    @example06StopGoGates, ...
    @example07WrappedAzimuthSeam, ...
    @example08AlternatingSlalom, ...
    @example09UTrapEscape};
results = struct.empty(0, 1);
for exampleIndex = 1:numel(examples)
    fprintf("\nRunning gauntlet %d of %d...\n", ...
        exampleIndex, numel(examples));
    current = examples{exampleIndex}();
    if isempty(results)
        results = repmat(current, numel(examples), 1);
    else
        results(exampleIndex) = current;
    end
end
fprintf("\nAll five az/el avoidance gauntlets passed.\n");
end
