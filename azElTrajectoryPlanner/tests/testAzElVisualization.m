function tests = testAzElVisualization
%TESTAZELVISUALIZATION Headless smoke tests for plan playback.
tests = functiontests(localfunctions);
end

function setupOnce(testCase)
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(plannerRoot);
testCase.TestData.PlannerRoot = plannerRoot;
end

function testDefaultOptions(testCase)
options = animateAzElAvoidancePlan();
verifyEqual(testCase, options.ViewMode, "combined");
verifyEqual(testCase, options.FigureVisible, "on");
verifyTrue(testCase, options.ShowObstacleSlices);
end

function testHeadlessCombinedPlayback(testCase)
scenario = syntheticScenario();
plan = syntheticPlan();
options = struct("FigureVisible", "off", ...
    "MaximumAnimationFrames", 2, "MaximumDisplayedSlices", 4, ...
    "PauseSeconds", 0);
handles = animateAzElAvoidancePlan(scenario, plan, options);
cleanup = onCleanup(@() closeIfOpen(handles.Figure));
verifyTrue(testCase, isgraphics(handles.Figure));
verifyTrue(testCase, handles.Completed);
verifyEqual(testCase, handles.FrameCount, 2);
verifyTrue(testCase, isgraphics(handles.AzElAxes));
verifyTrue(testCase, isgraphics(handles.TimeAxes));
end

function scenario = syntheticScenario()
firstSlice = [2 -1; 4 -1; 4 1; 2 1];
secondSlice = [3 -1; 5 -1; 5 1; 3 1];
obstacle = struct("targetName", "moving test obstacle", ...
    "time_s", [0; 2], ...
    "az_deg", {{firstSlice(:, 1); secondSlice(:, 1)}}, ...
    "el_deg", {{firstSlice(:, 2); secondSlice(:, 2)}}, ...
    "status", [true; true]);
target = struct("time_s", [0; 2], ...
    "position_deg", [8 0; 9 1]);
scenario = struct("id", "visual-test", "name", "Visual smoke test", ...
    "azElData", obstacle, "target", target, ...
    "limits", struct("azimuth_deg", [-10 15], ...
    "elevation_deg", [-5 5]));
end

function plan = syntheticPlan()
plan = struct("success", true, "message", "", ...
    "time_s", [0; 1; 2], ...
    "position_deg", [0 0; 1 2; 8 0]);
end

function closeIfOpen(figureHandle)
if isgraphics(figureHandle)
    close(figureHandle);
end
end
