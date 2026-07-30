function result = example08AlternatingSlalom()
%EXAMPLE08ALTERNATINGSLALOM Weave through alternating barriers.

problem = makeAlternatingSlalomGauntlet();
centers = problem.geometry.barrierCenters_deg;

result = runAzElGauntletCase( ...
    "Gauntlet 4", ...
    "four-barrier alternating slalom", ...
    problem.azElData, problem.startState, problem.stopState, ...
    problem.limits, problem.options);
path = result.plan.positionUnwrapped_deg;
crossingElevation = zeros(size(centers));
for obstacleIndex = 1:numel(centers)
    [~, sample] = min(abs(path(:, 1) - centers(obstacleIndex)));
    crossingElevation(obstacleIndex) = path(sample, 2);
end
result.diagnostics.crossingElevation_deg = crossingElevation;
expectedSign = [1, -1, 1, -1];
if any(sign(crossingElevation) ~= expectedSign) || ...
        any(abs(crossingElevation) < 1.25)
    error("example08AlternatingSlalom:WrongPassSide", ...
        "The route did not alternate through all four slalom openings.");
end
fprintf("  Crossing elevations: %s deg\n", ...
    mat2str(crossingElevation, 3));
end
