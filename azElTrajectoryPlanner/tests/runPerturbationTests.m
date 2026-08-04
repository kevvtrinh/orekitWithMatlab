function results = runPerturbationTests()
%RUNPERTURBATIONTESTS Translate, reflect, retime, and rename neutral inputs.
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
workspaceRoot = fileparts(plannerRoot);
addpath(plannerRoot);
fixture = load(fullfile(workspaceRoot, "azElStandaloneExamples", ...
    "fixtures", "example03Input.mat"), "scenario");
baseScenario = fixture.scenario;

translated = transformScenario(baseScenario, [7 -3], 1, 0);
reflected = transformScenario(baseScenario, [0 0], -1, 0);
retimed = transformScenario(baseScenario, [0 0], 1, 11);
variants = {translated; reflected; retimed};
names = ["translated"; "reflected"; "retimed"];
success = false(numel(variants), 1);
validationPassed = false(numel(variants), 1);
for variantIndex = 1:numel(variants)
    plan = planAzElTrajectory(variants{variantIndex});
    success(variantIndex) = plan.success;
    validationPassed(variantIndex) = plan.validation.passed;
end
results = table(names, success, validationPassed);
assert(all(results.success & results.validationPassed), ...
    "A generalization perturbation failed.");
end

function scenario = transformScenario(scenario, translation_deg, ...
        azimuthScale, timeShift_s)
scenario.initialState.position_deg = transformPosition( ...
    scenario.initialState.position_deg, translation_deg, azimuthScale);
scenario.goalState.position_deg = transformPosition( ...
    scenario.goalState.position_deg, translation_deg, azimuthScale);
scenario.initialState.time_s = scenario.initialState.time_s + timeShift_s;
scenario.goalState.time_s = scenario.goalState.time_s + timeShift_s;
scenario.initialState.velocity_deg_s(1) = ...
    azimuthScale * scenario.initialState.velocity_deg_s(1);
scenario.goalState.velocity_deg_s(1) = ...
    azimuthScale * scenario.goalState.velocity_deg_s(1);
scenario.initialState.acceleration_deg_s2(1) = ...
    azimuthScale * scenario.initialState.acceleration_deg_s2(1);
scenario.goalState.acceleration_deg_s2(1) = ...
    azimuthScale * scenario.goalState.acceleration_deg_s2(1);
scenario.limits.azimuth_deg = sort(azimuthScale * ...
    scenario.limits.azimuth_deg + translation_deg(1));
scenario.limits.elevation_deg = ...
    scenario.limits.elevation_deg + translation_deg(2);
for obstacleIndex = 1:numel(scenario.azElData)
    scenario.azElData(obstacleIndex).time_s = ...
        scenario.azElData(obstacleIndex).time_s + timeShift_s;
    for sliceIndex = 1:numel(scenario.azElData(obstacleIndex).az_deg)
        scenario.azElData(obstacleIndex).az_deg{sliceIndex} = ...
            azimuthScale * scenario.azElData(obstacleIndex).az_deg{sliceIndex} + ...
            translation_deg(1);
        scenario.azElData(obstacleIndex).el_deg{sliceIndex} = ...
            scenario.azElData(obstacleIndex).el_deg{sliceIndex} + ...
            translation_deg(2);
    end
end
end

function position_deg = transformPosition( ...
        position_deg, translation_deg, azimuthScale)
position_deg = [azimuthScale * position_deg(1) + translation_deg(1) ...
    position_deg(2) + translation_deg(2)];
end
