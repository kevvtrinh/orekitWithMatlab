function tests = testAdaptiveAzElTimeMesh
tests = functiontests(localfunctions);
end

function setupOnce(~)
root = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(root));
end

function testRefinesOnlyNearBoundary(testCase)
workspace = buildAzElTimeObstacleWorkspace(staticSquareData());
mesh = buildAdaptiveAzElTimeMesh(workspace, standardGridSpec(), struct( ...
    "InitialCellSizeDeg", 8, ...
    "MinimumCellSizeDeg", 0.5, ...
    "TimePaddingSamples", 0));
sizes = vertcat(mesh.Leaves.SizeDeg);

verifyEqual(testCase, mesh.Format, "AdaptiveAzElTimeMesh");
verifyGreaterThan(testCase, max(sizes(:, 1)), min(sizes(:, 1)));
verifyLessThan(testCase, mesh.Stats.AdaptiveCellTimeSamples, ...
    mesh.Stats.DenseMinimumGridVoxelEstimate);

[inside, insideInfo] = queryAdaptiveAzElTimeMesh(mesh, 0, 0, 1);
[outside, outsideInfo] = queryAdaptiveAzElTimeMesh(mesh, 7, 5, 1);
verifyTrue(testCase, inside);
verifyTrue(testCase, insideInfo.IsBlocked | insideInfo.IsUnresolved);
verifyFalse(testCase, outside);
verifyTrue(testCase, outsideInfo.IsFree);
end

function testSafeIntervalsTrackMovingObstacle(testCase)
workspace = buildAzElTimeObstacleWorkspace(movingSquareData());
mesh = buildAdaptiveAzElTimeMesh(workspace, standardGridSpec(), struct( ...
    "InitialCellSizeDeg", 4, ...
    "MinimumCellSizeDeg", 0.5, ...
    "TimePaddingSamples", 0));
[occupied, details] = queryAdaptiveAzElTimeMesh( ...
    mesh, [0 0 0], [0 0 0], [0 5 10]);

verifyEqual(testCase, occupied, [false true false]);
leafIds = unique(details.LeafId);
verifyEqual(testCase, numel(leafIds), 1);
leaf = mesh.Leaves(leafIds);
verifyGreaterThanOrEqual(testCase, size(leaf.SafeIntervals_s, 1), 2);
verifyEqual(testCase, leaf.SafeIntervals_s(1, 1), 0);
verifyEqual(testCase, leaf.SafeIntervals_s(end, 2), 10);
end

function testAdjacencyIsSymmetricAndWrapAware(testCase)
workspace = buildAzElTimeObstacleWorkspace(staticSquareData());
gridSpec = struct( ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [-10 10], ...
    "TimeLimitsSeconds", [0 2]);
mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec, struct( ...
    "InitialCellSizeDeg", [90 20], ...
    "MinimumCellSizeDeg", [5 2.5], ...
    "AllowAzimuthWrap", true, ...
    "TimePaddingSamples", 0));

for k = 1:size(mesh.AdjacencyEdges, 1)
    first = mesh.AdjacencyEdges(k, 1);
    second = mesh.AdjacencyEdges(k, 2);
    verifyTrue(testCase, ismember(second, ...
        mesh.Leaves(first).NeighborIds));
    verifyTrue(testCase, ismember(first, ...
        mesh.Leaves(second).NeighborIds));
end
bounds = vertcat(mesh.Leaves.BoundsDeg);
leftIds = find(abs(bounds(:, 1) + 180) < 1e-9);
rightIds = find(abs(bounds(:, 2) - 180) < 1e-9);
hasSeamNeighbor = false;
for left = reshape(leftIds, 1, [])
    hasSeamNeighbor = hasSeamNeighbor || any(ismember( ...
        mesh.Leaves(left).NeighborIds, rightIds));
end
verifyTrue(testCase, hasSeamNeighbor);
end

function testAllVisualizationModesRender(testCase)
workspace = buildAzElTimeObstacleWorkspace(staticSquareData());
mesh = buildAdaptiveAzElTimeMesh(workspace, standardGridSpec(), struct( ...
    "InitialCellSizeDeg", 4, ...
    "MinimumCellSizeDeg", 1, ...
    "TimePaddingSamples", 0));
modes = ["2d", "3d", "combined"];
for mode = modes
    figureHandle = figure("Visible", "off");
    cleanup = onCleanup(@() close(figureHandle));
    handles = plotAdaptiveAzElTimeMesh(mesh, struct( ...
        "Figure", figureHandle, "ViewMode", mode));
    verifyTrue(testCase, isgraphics(handles.Figure));
    if mode ~= "3d"
        verifyTrue(testCase, isgraphics(handles.Axes2D));
    end
    if mode ~= "2d"
        verifyTrue(testCase, isgraphics(handles.Axes3D));
    end
    clear cleanup;
end
end

function testKinodynamicAStarAcceptsAdaptiveCollisionMesh(testCase)
workspace = buildAzElTimeObstacleWorkspace(staticSquareData());
gridSpec = struct( ...
    "AzimuthLimitsDeg", [-8 8], ...
    "ElevationLimitsDeg", [-6 6], ...
    "TimeLimitsSeconds", [0 10]);
mesh = buildAdaptiveAzElTimeMesh(workspace, gridSpec, struct( ...
    "InitialCellSizeDeg", 4, ...
    "MinimumCellSizeDeg", 0.5, ...
    "TimeSeconds", [0; 10], ...
    "TimePaddingSamples", 0));
start = struct( ...
    "AzimuthDeg", -4, "ElevationDeg", 4, "Time", 0);
goal = struct( ...
    "AzimuthDeg", 4, "ElevationDeg", 4, "LatestTime", 10);
limits = struct( ...
    "AzimuthLimitsDeg", [-8 8], ...
    "ElevationLimitsDeg", [-6 6], ...
    "AzimuthRateLimitDegPerSec", 2, ...
    "ElevationRateLimitDegPerSec", 2, ...
    "AzimuthAccelerationLimitDegPerSec2", 1, ...
    "ElevationAccelerationLimitDegPerSec2", 1);
result = planAzElKinodynamicAStar(mesh, start, goal, limits, struct( ...
    "TimeStepSeconds", 1, ...
    "Objective", "minimumTime", ...
    "MaxPlanningTimeSeconds", 10, ...
    "MaxWallTimeSeconds", 10));

verifyTrue(testCase, result.Success);
verifyEqual(testCase, result.CollisionModelFormat, ...
    "AdaptiveAzElTimeMesh");
end

function data = staticSquareData()
time_s = (0:2).';
azimuth = repmat({[-2; 2; 2; -2; -2]}, numel(time_s), 1);
elevation = repmat({[-2; -2; 2; 2; -2]}, numel(time_s), 1);
data = makeAzElObstacleData( ...
    "Static square", time_s, azimuth, elevation);
end

function data = movingSquareData()
time_s = (0:10).';
azimuth = cell(numel(time_s), 1);
elevation = cell(numel(time_s), 1);
for k = 1:numel(time_s)
    center = -6 + 12 * time_s(k) / time_s(end);
    azimuth{k} = center + [-1; 1; 1; -1; -1];
    elevation{k} = [-1; -1; 1; 1; -1];
end
data = makeAzElObstacleData( ...
    "Moving square", time_s, azimuth, elevation);
end

function gridSpec = standardGridSpec()
gridSpec = struct( ...
    "AzimuthLimitsDeg", [-8 8], ...
    "ElevationLimitsDeg", [-6 6], ...
    "TimeLimitsSeconds", [0 10]);
end
