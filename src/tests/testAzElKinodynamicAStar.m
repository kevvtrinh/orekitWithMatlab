function tests = testAzElKinodynamicAStar
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(genpath(fullfile(suiteRoot, "src")));
end

function testRestToRestSlew(testCase)
[workspace, epoch] = emptyWorkspace(30);
limits = plannerLimits([0 90]);

result = planAzElKinodynamicAStar(workspace, ...
    struct("AzimuthDeg", 0, "ElevationDeg", 45, "Time", epoch), ...
    struct("AzimuthDeg", 4, "ElevationDeg", 45), limits);

verifyTrue(testCase, result.Success);
verifyEqual(testCase, result.CostSeconds, 4);
verifyEqual(testCase, result.Path.AzimuthDeg, [0; 0.5; 2; 3.5; 4], ...
    "AbsTol", 1e-12);
verifyEqual(testCase, result.Path.AzimuthRateDegPerSec([1 end]), [0; 0]);
verifyLessThanOrEqual(testCase, ...
    max(abs(result.Path.AzimuthRateDegPerSec)), ...
    limits.AzimuthRateLimitDegPerSec);
end

function testAvoidsObstacleBetweenSamples(testCase)
epoch = localEpoch();
data = rectangleObstacle(0:40, [-1 1 43 47]);
workspace = buildAzElTimeObstacleWorkspace(data, struct( ...
    "ReferenceTime", epoch));
limits = plannerLimits([40 50]);
options = struct( ...
    "CollisionCheckStepSeconds", 0.2, ...
    "MaxPlanningTimeSeconds", 30);

result = planAzElKinodynamicAStar(workspace, ...
    struct("AzimuthDeg", -6, "ElevationDeg", 45, "Time", epoch), ...
    struct("AzimuthDeg", 6, "ElevationDeg", 45), limits, options);

verifyTrue(testCase, result.Success);
verifyGreaterThanOrEqual(testCase, ...
    max(abs(result.Path.ElevationDeg - 45)), 3);
[azimuth, elevation, time] = samplePrimitives(result);
blocked = queryAzElTimeObstacle(workspace, azimuth, elevation, time);
verifyFalse(testCase, any(blocked));
end

function testAzimuthWrapReturnsContinuousCommand(testCase)
[workspace, epoch] = emptyWorkspace(20);
limits = plannerLimits([0 90]);

result = planAzElKinodynamicAStar(workspace, ...
    struct("AzimuthDeg", 179, "ElevationDeg", 45, "Time", epoch), ...
    struct("AzimuthDeg", -179, "ElevationDeg", 45), limits);

verifyTrue(testCase, result.Success);
verifyEqual(testCase, result.Path.AzimuthDeg(end), -179);
verifyEqual(testCase, result.Path.AzimuthUnwrappedDeg(end), 181);
verifyLessThanOrEqual(testCase, ...
    max(abs(diff(result.Path.AzimuthUnwrappedDeg))), ...
    limits.AzimuthRateLimitDegPerSec);
end

function testClosingGateRequiresWait(testCase)
epoch = localEpoch();
n = 21;
azimuth = cell(n, 1);
elevation = cell(n, 1);
for k = 1:n
    if k <= 7
        azimuth{k} = [-1; 1; 1; -1; -1];
        elevation{k} = [39; 39; 51; 51; 39];
    else
        azimuth{k} = zeros(0, 1);
        elevation{k} = zeros(0, 1);
    end
end
data = obstacleData("Closing gate", (0:n - 1).', ...
    azimuth, elevation);
workspace = buildAzElTimeObstacleWorkspace(data, struct( ...
    "ReferenceTime", epoch));
limits = plannerLimits([40 50]);
options = struct( ...
    "CollisionCheckStepSeconds", 0.2, ...
    "TimePaddingSamples", 0, ...
    "MaxPlanningTimeSeconds", 20);

result = planAzElKinodynamicAStar(workspace, ...
    struct("AzimuthDeg", -4, "ElevationDeg", 45, "Time", epoch), ...
    struct("AzimuthDeg", 4, "ElevationDeg", 45), limits, options);

verifyTrue(testCase, result.Success);
verifyGreaterThanOrEqual(testCase, nnz(result.Path.IsWaiting), 1);
verifyGreaterThan(testCase, result.CostSeconds, 6);
[azimuthPath, elevationPath, time] = samplePrimitives(result);
blocked = queryAzElTimeObstacle(workspace, ...
    azimuthPath, elevationPath, time);
verifyFalse(testCase, any(blocked));
end

function testMinimumAngularDistanceObjective(testCase)
[workspace, epoch] = emptyWorkspace(10);
limits = plannerLimits([0 90]);
goalTime = epoch + seconds(10);
options = struct( ...
    "Objective", "minimumAngularDistance", ...
    "MaxPlanningTimeSeconds", 10);

result = planAzElKinodynamicAStar(workspace, ...
    struct("AzimuthDeg", 0, "ElevationDeg", 45, "Time", epoch), ...
    struct( ...
        "AzimuthDeg", 4, ...
        "ElevationDeg", 45, ...
        "AzimuthAccelerationDegPerSec2", 0, ...
        "ElevationAccelerationDegPerSec2", 0, ...
        "EarliestTime", goalTime, ...
        "LatestTime", goalTime), ...
    limits, options);

verifyTrue(testCase, result.Success);
verifyTrue(testCase, result.OptimalOnLattice);
verifyEqual(testCase, result.Objective, "minimumAngularDistance");
verifyEqual(testCase, result.ObjectiveCostUnits, "degrees");
verifyEqual(testCase, result.ObjectiveCost, 4, "AbsTol", 1e-9);
verifyEqual(testCase, result.AngularPathLengthDeg, 4, "AbsTol", 1e-9);
verifyEqual(testCase, result.CostSeconds, 10, "AbsTol", 1e-9);
end

function [azimuth, elevation, time] = samplePrimitives(result)
samplesPerEdge = 11;
edgeCount = height(result.Path) - 1;
azimuth = zeros(edgeCount * samplesPerEdge, 1);
elevation = zeros(edgeCount * samplesPerEdge, 1);
time = NaT(edgeCount * samplesPerEdge, 1, "TimeZone", "UTC");
dt = result.Options.TimeStepSeconds;
write = 0;
for k = 1:edgeCount
    tau = linspace(0, dt, samplesPerEdge).';
    row = result.Path(k, :);
    next = result.Path(k + 1, :);
    index = write + (1:samplesPerEdge);
    azimuth(index) = row.AzimuthUnwrappedDeg + ...
        row.AzimuthRateDegPerSec .* tau + ...
        0.5 .* next.AzimuthAccelerationDegPerSec2 .* tau.^2;
    if result.Options.AzimuthWrap
        azimuth(index) = mod(azimuth(index) + 180, 360) - 180;
    end
    elevation(index) = row.ElevationDeg + ...
        row.ElevationRateDegPerSec .* tau + ...
        0.5 .* next.ElevationAccelerationDegPerSec2 .* tau.^2;
    time(index) = row.Time + seconds(tau);
    write = write + samplesPerEdge;
end
end

function limits = plannerLimits(elevationLimits)
limits = struct( ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", elevationLimits, ...
    "AzimuthRateLimitDegPerSec", 2, ...
    "ElevationRateLimitDegPerSec", 2, ...
    "AzimuthAccelerationLimitDegPerSec2", 1, ...
    "ElevationAccelerationLimitDegPerSec2", 1);
end

function [workspace, epoch] = emptyWorkspace(durationSeconds)
epoch = localEpoch();
n = durationSeconds + 1;
empty = repmat({zeros(0, 1)}, n, 1);
data = obstacleData("Empty", (0:n - 1).', empty, empty);
workspace = buildAzElTimeObstacleWorkspace(data, struct( ...
    "ReferenceTime", epoch));
end

function data = rectangleObstacle(timeSeconds, bounds)
n = numel(timeSeconds);
azimuth = repmat({ ...
    [bounds(1); bounds(2); bounds(2); bounds(1); bounds(1)]}, n, 1);
elevation = repmat({ ...
    [bounds(3); bounds(3); bounds(4); bounds(4); bounds(3)]}, n, 1);
data = obstacleData("Rectangle", ...
    timeSeconds(:), azimuth, elevation);
end

function data = obstacleData(name, time_s, azimuth, elevation)
data = struct( ...
    "targetName", string(name), ...
    "time_s", double(time_s(:)), ...
    "az_deg", {azimuth}, ...
    "el_deg", {elevation}, ...
    "status", repmat("visible", numel(time_s), 1));
end

function epoch = localEpoch()
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
end
