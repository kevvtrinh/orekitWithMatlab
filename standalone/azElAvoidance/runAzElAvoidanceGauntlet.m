function results = runAzElAvoidanceGauntlet()
%RUNAZELAVOIDANCEGAUNTLET Run all five generated-data planner examples.

examples = { ...
    @exampleGauntlet01FiveTurnSpiral, ...
    @exampleGauntlet02StopGoStopGo, ...
    @exampleGauntlet03WrappedSeamDetour, ...
    @exampleGauntlet04AlternatingSlalom, ...
    @exampleGauntlet05UTrapEscape};
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
