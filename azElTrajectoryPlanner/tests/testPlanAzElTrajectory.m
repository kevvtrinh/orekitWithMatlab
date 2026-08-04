function tests = testPlanAzElTrajectory
%TESTPLANAZELTRAJECTORY Public-API unit and integration tests.
tests = functiontests(localfunctions);
end

function testStableSchemaOnSuccessAndFailure(testCase)
scenario = obstacleFreeScenario();
successPlan = planAzElTrajectory(scenario);
invalidPlan = planAzElTrajectory(struct());
verifyEqual(testCase, sort(fieldnames(successPlan)), ...
    sort(fieldnames(invalidPlan)));
verifyTrue(testCase, successPlan.success);
verifyFalse(testCase, invalidPlan.success);
verifyEqual(testCase, invalidPlan.failureAssessment.classification, ...
    "invalid-input");
end

function testNonzeroBoundaryDerivativesAndAnalyticLimits(testCase)
scenario = obstacleFreeScenario();
scenario.initialState.velocity_deg_s = [0.2 -0.1];
scenario.initialState.acceleration_deg_s2 = [0.05 0.02];
scenario.goalState.velocity_deg_s = [-0.15 0.1];
scenario.goalState.acceleration_deg_s2 = [0.01 -0.03];
plan = planAzElTrajectory(scenario);
verifyTrue(testCase, plan.success, plan.message);
verifyLessThanOrEqual(testCase, ...
    max(plan.validation.maximumVelocity_deg_s - ...
    scenario.limits.maxVelocity_deg_s), 1e-7);
verifyLessThanOrEqual(testCase, ...
    max(plan.validation.maximumAcceleration_deg_s2 - ...
    scenario.limits.maxAcceleration_deg_s2), 1e-7);
verifyEqual(testCase, plan.velocity_deg_s(1, :), ...
    scenario.initialState.velocity_deg_s, "AbsTol", 1e-9);
verifyEqual(testCase, plan.acceleration_deg_s2(end, :), ...
    scenario.goalState.acceleration_deg_s2, "AbsTol", 1e-8);
end

function testImpossibleDeadlineIsProven(testCase)
scenario = obstacleFreeScenario();
scenario.goalState.time_s = 0.1;
plan = planAzElTrajectory(scenario);
verifyFalse(testCase, plan.success);
verifyTrue(testCase, plan.failureAssessment.provenInfeasible);
verifyEqual(testCase, plan.failureAssessment.classification, "infeasible");
end

function testWrappedAzimuthUsesContinuousInternalCoordinate(testCase)
scenario = obstacleFreeScenario();
scenario.initialState.position_deg = [179 0];
scenario.goalState.position_deg = [-179 2];
scenario.options.allowAzimuthWrap = true;
scenario.limits.azimuth_deg = [-180 180];
plan = planAzElTrajectory(scenario);
verifyTrue(testCase, plan.success, plan.message);
verifyLessThan(testCase, max(abs(diff( ...
    plan.positionUnwrapped_deg(:, 1)))), 2);
verifyEqual(testCase, plan.position_deg(end, :), [-179 2], ...
    "AbsTol", 1e-6);
end

function testBudgetExhaustionIsInconclusive(testCase)
scenario = obstacleFreeScenario();
scenario.azElData = staticRectangle([4 6 -10 10], [0 20]);
plan = planAzElTrajectory(scenario, struct( ...
    "MaxWallTime_s", 0.01, "MaxExpandedStates", 1));
verifyFalse(testCase, plan.success);
verifyFalse(testCase, plan.failureAssessment.provenInfeasible);
verifyEqual(testCase, plan.failureAssessment.classification, ...
    "inconclusive");
end

function scenario = obstacleFreeScenario()
scenario = struct();
scenario.requestKind = "fixed-goal";
scenario.azElData = [];
scenario.initialState = state(0, [0 0]);
scenario.goalState = state(20, [10 4]);
scenario.target = [];
scenario.limits = struct( ...
    "azimuth_deg", [-30 30], ...
    "elevation_deg", [-20 20], ...
    "maxVelocity_deg_s", [3 3], ...
    "maxAcceleration_deg_s2", [2 2], ...
    "maxJerk_deg_s3", [20 20]);
scenario.options = struct( ...
    "sampleTime_s", 0.1, ...
    "collisionCheckStep_s", 0.05, ...
    "safetyMargin_deg", 0, ...
    "allowAzimuthWrap", false);
scenario.resourceBudget = struct( ...
    "maximumWallTime_s", 5, "maximumExpansions", 10000);
end

function value = state(time_s, position_deg)
value = struct( ...
    "time_s", time_s, ...
    "position_deg", position_deg, ...
    "velocity_deg_s", [0 0], ...
    "acceleration_deg_s2", [0 0]);
end

function obstacle = staticRectangle(bounds, time_s)
azimuth_deg = [bounds(1); bounds(2); bounds(2); bounds(1); bounds(1)];
elevation_deg = [bounds(3); bounds(3); bounds(4); bounds(4); bounds(3)];
obstacle = struct( ...
    "time_s", time_s(:), ...
    "az_deg", {{azimuth_deg; azimuth_deg}}, ...
    "el_deg", {{elevation_deg; elevation_deg}});
end
