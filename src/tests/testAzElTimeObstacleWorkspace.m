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
    [0 2 20], [30 30 30], data.time_s);

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
    [0 22 50], 30, first.time_s);

verifyEqual(testCase, occupied, [true true false]);
verifyEqual(testCase, obstacleIndex, uint32([1 2 0]));
verifyEqual(testCase, details.ObstacleName, ["Area-A" "Area-B" ""]);
verifyEqual(testCase, workspace.ObstacleCount, 2);
end

function testCompactInputPreservesTimeSeconds(testCase)
data = compactMovingRectangles("Compact Area", [0 2 4], [10 20 30]);
workspace = buildAzElTimeObstacleWorkspace(data);

verifyEqual(testCase, workspace.ReferenceTime, ...
    datetime(1970, 1, 1, 0, 0, 0, "TimeZone", "UTC"));
verifyEqual(testCase, workspace.Obstacles.TimeSeconds, [10; 20; 30]);
verifyEqual(testCase, workspace.Obstacles.Name, "Compact Area");
occupied = queryAzElTimeObstacle(workspace, [0 2 20], [30 30 30], ...
    data.time_s);
verifyEqual(testCase, occupied, [true true false]);
end

function testCompactInputWorksDirectlyWithQueryAndAnimation(testCase)
data = compactMovingRectangles("Compact Area", [0 2 4], [0 1 2]);
occupied = queryAzElTimeObstacle(data, [0 2 20], [30 30 30], data.time_s);
verifyEqual(testCase, occupied, [true true false]);

workspace = buildAzElTimeObstacleWorkspace(data);
figureHandle = figure("Visible", "off");
cleaner = onCleanup(@() close(figureHandle));
handles = animateAzElTimeObstacleWorkspace(data, workspace, struct( ...
    "Figure", figureHandle, ...
    "ViewMode", "combined", ...
    "MaximumAnimationFrames", 2, ...
    "MaximumDisplayedSlices", 2, ...
    "PauseSeconds", 0));
verifyEqual(testCase, handles.ViewMode, "combined");
verifyTrue(testCase, isgraphics(handles.TwoDimensionalAxes));
verifyTrue(testCase, isgraphics(handles.ThreeDimensionalAxes));
clear cleaner;
end

function testBoundsModeAndNeighborPadding(testCase)
data = movingRectangles("Area", [0 10 20]);
workspace = buildAzElTimeObstacleWorkspace(data);
betweenSamples = data.time_s(1) + 6;

exact = queryAzElTimeObstacle(workspace, 0, 30, betweenSamples);
padded = queryAzElTimeObstacle(workspace, 0, 30, betweenSamples, ...
    struct("TimePaddingSamples", 1));
fastBounds = queryAzElTimeObstacle(workspace, 10, 30, data.time_s(2), ...
    struct("CollisionMode", "bounds"));

verifyFalse(testCase, exact);
verifyTrue(testCase, padded);
verifyTrue(testCase, fastBounds);
end

function testPolygonSafetyMargin(testCase)
data = movingRectangles("Area", 0);
workspace = buildAzElTimeObstacleWorkspace(data);

withoutMargin = queryAzElTimeObstacle(workspace, 2.5, 30, 0);
withMargin = queryAzElTimeObstacle(workspace, 2.5, 30, 0, struct( ...
    "SafetyMarginDeg", 0.6));

verifyFalse(testCase, withoutMargin);
verifyTrue(testCase, withMargin);
end

function testMultipleRegionsAndConservativeBounds(testCase)
data = struct( ...
    "targetName", "Two-Region", ...
    "time_s", 0, ...
    "az_deg", {{[-10; -6; -8; -10; NaN; 6; 10; 8; 6]}}, ...
    "el_deg", {{[28; 28; 32; 28; NaN; 28; 28; 32; 28]}}, ...
    "status", "visible");
workspace = buildAzElTimeObstacleWorkspace(data);

exact = queryAzElTimeObstacle(workspace, [-8 8 0], [30 30 30], 0);
bounds = queryAzElTimeObstacle(workspace, 0, 30, 0, ...
    struct("CollisionMode", "bounds"));

verifyEqual(testCase, exact, [true true false]);
verifyTrue(testCase, bounds);
end

function testEnvelopeDoesNotBridgeMissingTimeRun(testCase)
data = movingRectangles("Area", 0:4);
data.az_deg{3} = zeros(0, 1);
data.el_deg{3} = zeros(0, 1);
workspace = buildAzElTimeObstacleWorkspace(data);
mesh = computeAzElTimeObstacleEnvelopeMesh(workspace.Obstacles, struct( ...
    "MaximumSlices", 5, "VerticesPerContour", 12));

verifyEqual(testCase, mesh.ConnectedSlicePairs, [1 2; 4 5]);
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
verifyTrue(testCase, isgraphics(handles.EnvelopeHandles));
verifyLessThan(testCase, handles.EnvelopeHandles.FaceAlpha, 0.2);
verifyEqual(testCase, handles.EnvelopeHandles.FaceColor, ...
    [0.48 0.08 0.72], "AbsTol", 1e-12);
verifyTrue(testCase, isgraphics(handles.SliceVisibilityControl));
setControlValue(handles.SliceVisibilityControl, false);
verifyTrue(testCase, all(string(get(handles.SliceHandles, "Visible")) == "off"));
setControlValue(handles.SliceVisibilityControl, true);
clear cleaner;
end

function testCombinedAnimationUsesTwoPanes(testCase)
data = movingRectangles("Area", 0:9);
workspace = buildAzElTimeObstacleWorkspace(data);
figureHandle = figure("Visible", "off");
cleaner = onCleanup(@() close(figureHandle));
handles = animateAzElTimeObstacleWorkspace(data, workspace, struct( ...
    "Figure", figureHandle, ...
    "MaximumAnimationFrames", 4, ...
    "MaximumDisplayedSlices", 3, ...
    "PauseSeconds", 0));

verifyTrue(testCase, isgraphics(handles.TwoDimensionalAxes));
verifyTrue(testCase, isgraphics(handles.ThreeDimensionalAxes));
verifyEqual(testCase, numel(handles.AnimationFrameSamples), 4);
verifyEqual(testCase, numel(handles.DisplayedSliceSamples), 3);
verifyTrue(testCase, all(string(get(handles.SliceHandles, "Visible")) == "on"));
verifyTrue(testCase, isgraphics(handles.EnvelopeHandle));
verifyEqual(testCase, string(handles.EnvelopeHandle.Visible), "on");
verifyLessThan(testCase, handles.EnvelopeHandle.FaceAlpha, ...
    handles.SliceHandles(1).FaceAlpha);
verifyEqual(testCase, handles.EnvelopeHandle.FaceColor, ...
    [0.48 0.08 0.72], "AbsTol", 1e-12);
verifyTrue(testCase, isgraphics(handles.CombinedSweep));
verifyTrue(testCase, isgraphics(handles.SliceVisibilityControl));
verifyTrue(testCase, isgraphics(handles.SweepVisibilityControl));
setControlValue(handles.SliceVisibilityControl, false);
verifyTrue(testCase, all(string(get(handles.SliceHandles, "Visible")) == "off"));
verifyEqual(testCase, string(handles.CurrentSlice3D.Visible), "off");
setControlValue(handles.SweepVisibilityControl, false);
verifyEqual(testCase, string(handles.CombinedSweep.Visible), "off");
clear cleaner;
end

function testAnimationViewModes(testCase)
data = movingRectangles("Area", 0:4);
workspace = buildAzElTimeObstacleWorkspace(data);
for mode = ["2d" "3d"]
    figureHandle = figure("Visible", "off");
    cleaner = onCleanup(@() close(figureHandle));
    handles = animateAzElTimeObstacleWorkspace(data, workspace, struct( ...
        "Figure", figureHandle, ...
        "ViewMode", mode, ...
        "MaximumAnimationFrames", 2, ...
        "MaximumDisplayedSlices", 2, ...
        "PauseSeconds", 0));
    verifyEqual(testCase, handles.ViewMode, mode);
    if mode == "2d"
        verifyTrue(testCase, isgraphics(handles.TwoDimensionalAxes));
        verifyEmpty(testCase, handles.ThreeDimensionalAxes);
        verifyEmpty(testCase, handles.EnvelopeHandle);
        verifyTrue(testCase, isgraphics(handles.CombinedSweep));
        verifyEmpty(testCase, handles.SliceVisibilityControl);
        verifyTrue(testCase, isgraphics(handles.SweepVisibilityControl));
    else
        verifyEmpty(testCase, handles.TwoDimensionalAxes);
        verifyTrue(testCase, isgraphics(handles.ThreeDimensionalAxes));
        verifyTrue(testCase, isgraphics(handles.EnvelopeHandle));
        verifyEmpty(testCase, handles.CombinedSweep);
        verifyTrue(testCase, isgraphics(handles.SliceVisibilityControl));
        verifyEmpty(testCase, handles.SweepVisibilityControl);
    end
    clear cleaner;
end
end

function setControlValue(control, value)
control.Value = value;
callback = control.Callback;
callback(control, []);
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
    center(end), 30, data.time_s(end)));
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
data = struct( ...
    "targetName", string(name), ...
    "time_s", (0:n - 1).' * 10, ...
    "az_deg", {azimuth}, ...
    "el_deg", {elevation}, ...
    "status", repmat("visible", n, 1));
end

function data = compactMovingRectangles(name, centerAzimuth, timeSeconds)
data = movingRectangles(name, centerAzimuth);
data.time_s = double(timeSeconds(:));
end
