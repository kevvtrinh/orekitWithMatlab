function results = visualizeAzElExample(exampleNumbers, options)
%VISUALIZEAZELEXAMPLE Plan and animate one or more frozen examples.
%
% result = visualizeAzElExample(4)
% results = visualizeAzElExample([1 4 7])
% results = visualizeAzElExample("all")
% results = visualizeAzElExample(exampleNumbers, animationOptions)

if nargin < 1 || isempty(exampleNumbers)
    exampleNumbers = 1;
end
if nargin < 2
    options = struct();
end
if isstring(exampleNumbers) || ischar(exampleNumbers)
    if ~isscalar(string(exampleNumbers)) || ...
            lower(string(exampleNumbers)) ~= "all"
        error("visualizeAzElExample:InvalidSelection", ...
            "Use example numbers from 1 through 15, or ""all"".");
    end
    exampleNumbers = 1:15;
end
validateattributes(exampleNumbers, {'numeric'}, ...
    {'vector', 'integer', '>=', 1, '<=', 15});

plannerRoot = fileparts(mfilename("fullpath"));
suiteRoot = fullfile(fileparts(plannerRoot), "azElStandaloneExamples");
if ~isfolder(suiteRoot)
    error("visualizeAzElExample:MissingSuite", ...
        "Expected the frozen suite at %s.", suiteRoot);
end
addpath(plannerRoot);

emptyResult = struct("ExampleNumber", NaN, "Scenario", struct(), ...
    "Plan", struct(), "Animation", struct());
results = repmat(emptyResult, numel(exampleNumbers), 1);
for resultIndex = 1:numel(exampleNumbers)
    exampleNumber = exampleNumbers(resultIndex);
    fixturePath = fullfile(suiteRoot, "fixtures", ...
        sprintf("example%02dInput.mat", exampleNumber));
    fixture = load(fixturePath, "scenario");
    scenario = fixture.scenario;
    fprintf("Planning %s: %s...\n", string(scenario.id), ...
        string(scenario.name));
    plan = planAzElTrajectory(scenario);
    if ~plan.success
        error("visualizeAzElExample:PlanningFailed", ...
            "%s failed: %s", string(scenario.id), string(plan.message));
    end
    animation = animateAzElAvoidancePlan(scenario, plan, options);
    results(resultIndex) = struct( ...
        "ExampleNumber", exampleNumber, ...
        "Scenario", scenario, ...
        "Plan", plan, ...
        "Animation", animation);
end
end
