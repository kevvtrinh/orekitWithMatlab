function compact = planOrbitUiSlew(requestFile, resultFile)
%PLANORBITUISLEW File bridge for Orbit Console's geographic keep-out export.
% Frame: nadir boresight, projected inertial velocity up. Angles are degrees.
% This plans boresight clearance, not clearance of the entire sensor cone.
% Uses the pinned AzElObsAvoid main copy and its independent validator.
repositoryRoot = fileparts(fileparts(fileparts(mfilename('fullpath'))));
plannerRoot = fullfile(repositoryRoot, 'vendor', 'AzElObsAvoid');
addpath(plannerRoot, fullfile(plannerRoot, 'trajectory'), '-begin');
request = jsondecode(fileread(requestFile));
assert(request.version == 1, "Unsupported Orbit Console slew format.");
obstacles = request.obstacles;
azElData = cell(numel(obstacles), 1);
protectedObstacles = cell(numel(obstacles), 1);
for k = 1:numel(obstacles)
    obstacle = obstacles(k);
    az = cell(numel(obstacle.time_s), 1); el = az;
    for j = 1:numel(az)
        az{j} = obstacle.slices(j).az_deg(:);
        el{j} = obstacle.slices(j).el_deg(:);
    end
    azElData{k} = makeAzElObstacleData(string(obstacle.targetName), ...
        obstacle.time_s(:), az, el);
    protectedObstacles{k} = obstacleAvoidance.obstacles.createObstacle( ...
        string(obstacle.targetName), obstacle.time_s(:), az, el, request.options.SafetyMargin_deg);
end
initialState = request.initialState;
goalState = request.goalState;
limits = struct('maxVelocity_deg_s', request.limits.maxVelocity_deg_s, ...
    'maxAcceleration_deg_s2', request.limits.maxAcceleration_deg_s2, ...
    'maxJerk_deg_s3', [4 4], ...
    'azimuthInterval_deg', request.limits.azimuth_deg, ...
    'elevationInterval_deg', request.limits.elevation_deg);
options = struct('GoalTimeMode', 'fixedArrival', 'SampleTime_s', 0.05);
outputFolder = fileparts(resultFile);
save(fullfile(outputFolder, "request.mat"), "azElData", "protectedObstacles", "initialState", "goalState", "limits", "options", "request");
[plan, diagnosis] = obstacleAvoidance.planTrajectory(protectedObstacles, initialState, goalState, limits, options);
validation = obstacleAvoidance.validateTrajectory(plan);
save(fullfile(outputFolder, "plan.mat"), "plan", "diagnosis", "validation", "-v7.3");
compact = struct('success', plan.Success && validation.Passed, ...
    'message', plan.Message, 'method', 'AzElObsAvoid / BMTP', ...
    'plannerRevision', 'b22e7bb5cd7e2e6028822a5bd8b4d55a49e71ddc', ...
    'exactCollisionValidated', validation.Passed && validation.CollisionFree && validation.CollisionResolved, ...
    'terminationReason', plan.TerminationReason, 'validation', validation, ...
    'angularPathLength_deg', sum(vecnorm(diff(plan.position_deg), 2, 2)), ...
    'searchElapsed_s', plan.ElapsedPlanningTime_s);
if ~validation.Passed, compact.message = plan.Message + " " + validation.Message; end
fields = ["time_s", "position_deg", "velocity_deg_s", "acceleration_deg_s2", "jerk_deg_s3"];
for field = fields
    if isfield(plan, field), compact.(field) = plan.(field); end
end
fid = fopen(resultFile, 'w');
assert(fid >= 0, "Cannot open planner result file.");
cleanup = onCleanup(@() fclose(fid));
fwrite(fid, jsonencode(compact), 'char');
fprintf('Orbit Console slew: %s | %s\n', string(plan.TerminationReason), string(validation.Message));
end
