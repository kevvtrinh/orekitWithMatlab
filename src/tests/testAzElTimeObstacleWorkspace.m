function tests = testAzElTimeObstacleWorkspace
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(genpath(fullfile(suiteRoot, "src")));
end

function testPackedPolygonQuery(testCase)
data = movingRectangles("Area-A", [0 2 4]);
workspace = buildAzElTimeObstacleWorkspace(data);

[occupied, obstacleIndex] = queryAzElTimeObstacle(workspace, ...
    [0 2 20], [30 30 30], data.Time);

verifyEqual(testCase, occupied, [true true false]);
verifyEqual(testCase, obstacleIndex, uint32([1 1 0]));
verifyClass(testCase, workspace.Obstacles.AzimuthDeg, "single");
verifyEqual(testCase, workspace.Obstacles.SampleCount, 3);
end

function testMultipleObstacles(testCase)
first = movingRectangles("Area-A", [0 2 4]);
second = movingRectangles("Area-B", [20 22 24]);
workspace = buildAzElTimeObstacleWorkspace({first, second});

[occupied, obstacleIndex, details] = queryAzElTimeObstacle(workspace, ...
    [0 22 50], 30, first.Time);

verifyEqual(testCase, occupied, [true true false]);
verifyEqual(testCase, obstacleIndex, uint32([1 2 0]));
verifyEqual(testCase, details.ObstacleName, ["Area-A" "Area-B" ""]);
verifyEqual(testCase, workspace.ObstacleCount, 2);
end

function testBoundsModeAndNeighborPadding(testCase)
data = movingRectangles("Area", [0 10 20]);
workspace = buildAzElTimeObstacleWorkspace(data);
betweenSamples = data.Time(1) + seconds(6);

exact = queryAzElTimeObstacle(workspace, 0, 30, betweenSamples);
padded = queryAzElTimeObstacle(workspace, 0, 30, betweenSamples, ...
    struct("TimePaddingSamples", 1));
fastBounds = queryAzElTimeObstacle(workspace, 10, 30, data.Time(2), ...
    struct("CollisionMode", "bounds"));

verifyFalse(testCase, exact);
verifyTrue(testCase, padded);
verifyTrue(testCase, fastBounds);
end

function testMultipleRegionsAndConservativeBounds(testCase)
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
data = struct( ...
    "TargetName", "Two-Region", ...
    "Time", epoch, ...
    "AzimuthDeg", {{[-10; -6; -8; -10; NaN; 6; 10; 8; 6]}}, ...
    "ElevationDeg", {{[28; 28; 32; 28; NaN; 28; 28; 32; 28]}});
workspace = buildAzElTimeObstacleWorkspace(data);

exact = queryAzElTimeObstacle(workspace, [-8 8 0], [30 30 30], epoch);
bounds = queryAzElTimeObstacle(workspace, 0, 30, epoch, ...
    struct("CollisionMode", "bounds"));

verifyEqual(testCase, exact, [true true false]);
verifyTrue(testCase, bounds);
end

function testStaticPlotUsesDecimatedSlices(testCase)
data = movingRectangles("Area", 0:9);
workspace = buildAzElTimeObstacleWorkspace(data);
figureHandle = figure("Visible", "off");
cleaner = onCleanup(@() close(figureHandle));
handles = plotAzElTimeObstacleWorkspace(workspace, struct( ...
    "Figure", figureHandle, "MaximumDisplayedSlices", 4));

verifyEqual(testCase, numel(handles.SliceHandles), 4);
verifyTrue(testCase, isgraphics(handles.Axes));
clear cleaner;
end

function testLargePackingRemainsCompact(testCase)
sampleCount = 5000;
center = mod((0:sampleCount - 1).' / 100, 20) - 10;
data = movingRectangles("Long-Run", center);
workspace = buildAzElTimeObstacleWorkspace(data, struct( ...
    "MaximumVerticesPerRegion", 5));

verifyEqual(testCase, workspace.Obstacles.SampleCount, sampleCount);
verifyLessThan(testCase, workspace.EstimatedStorageBytes, 1e6);
verifyTrue(testCase, queryAzElTimeObstacle(workspace, ...
    center(end), 30, data.Time(end)));
end

function data = movingRectangles(name, centerAzimuth)
centerAzimuth = centerAzimuth(:);
n = numel(centerAzimuth);
azimuth = cell(n, 1);
elevation = cell(n, 1);
for k = 1:n
    center = centerAzimuth(k);
    azimuth{k} = center + [-2; 2; 2; -2; -2];
    elevation{k} = [28; 28; 32; 32; 28];
end
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
data = struct( ...
    "TargetName", string(name), ...
    "ParentName", "Sat", ...
    "SensorName", "Sensor", ...
    "Time", epoch + seconds((0:n - 1).' * 10), ...
    "AzimuthDeg", {azimuth}, ...
    "ElevationDeg", {elevation}, ...
    "CommandAzimuthDeg", centerAzimuth, ...
    "CommandElevationDeg", repmat(30, n, 1));
end
