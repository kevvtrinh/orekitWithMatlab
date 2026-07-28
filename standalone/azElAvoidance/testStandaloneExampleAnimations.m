function tests = testStandaloneExampleAnimations
tests = functiontests(localfunctions);
end

function setupOnce(~)
addpath(fileparts(mfilename("fullpath")));
end

function teardown(~)
close all force;
end

function testEveryExampleUsesCommonAnimationPath(testCase)
folder = fileparts(mfilename("fullpath"));
examples = dir(fullfile(folder, "example*.m"));
verifyGreaterThan(testCase, numel(examples), 0);
for k = 1:numel(examples)
    source = string(fileread(fullfile(folder, examples(k).name)));
    usesAnimator = contains(source, "animateAzElAvoidancePlan");
    usesGauntletRunner = contains(source, "runAzElGauntletCase");
    verifyTrue(testCase, usesAnimator || usesGauntletRunner, ...
        sprintf('%s has no 2-D/3-D animation path.', examples(k).name));
end
end

function testDefaultOptionsForceCombinedView(testCase)
options = defaultAzElAnimationOptions(struct( ...
    "ViewMode", "2d", ...
    "FigureVisible", "off"));

verifyEqual(testCase, options.ViewMode, "combined");
end

function testCombinedAnimatorCreatesBothAxes(testCase)
time_s = (0:2).';
empty = repmat({zeros(0, 1)}, numel(time_s), 1);
data = makeAzElObstacleData("Empty", time_s, empty, empty);
plan = struct( ...
    "success", true, ...
    "time_s", time_s, ...
    "position_deg", [-1 0; 0 0; 1 0], ...
    "workspace", buildAzElTimeObstacleWorkspace(data), ...
    "limits", struct( ...
    "azimuth_deg", [-2 2], ...
    "elevation_deg", [-1 1]));
handles = animateAzElAvoidancePlan(data, plan, ...
    defaultAzElAnimationOptions(struct( ...
    "FigureVisible", "off", ...
    "MaximumAnimationFrames", 1, ...
    "PauseSeconds", 0)));

verifyTrue(testCase, isgraphics(handles.AzElAxes, "axes"));
verifyTrue(testCase, isgraphics(handles.WorkspaceAxes, "axes"));
verifyEqual(testCase, handles.Options.ViewMode, "combined");
end

function testGauntletsDoNotInjectRoutes(testCase)
folder = fileparts(mfilename("fullpath"));
files = [ ...
    dir(fullfile(folder, "exampleGauntlet*.m")); ...
    dir(fullfile(folder, "example*Gauntlet.m")); ...
    dir(fullfile(folder, "make*Gauntlet.m"))];
[~, uniqueIndex] = unique({files.name}, "stable");
files = files(uniqueIndex);
for k = 1:numel(files)
    source = string(fileread(fullfile(folder, files(k).name)));
    verifyEmpty(testCase, regexp(source, ...
        """GuidePath_deg""\s*,|""StateCorridor""\s*,|" + ...
        """ReferencePath[^""]*""\s*,|@planAzElGuidedRoute", ...
        "match"), sprintf('%s injects a route or search corridor.', ...
        files(k).name));
    direction = regexp(source, ...
        '"GuideDirectionAngles_deg"\s*,\s*([^,\r\n]+)', ...
        "tokens");
    for directionIndex = 1:numel(direction)
        value = erase(string(direction{directionIndex}{1}), " ");
        verifyEqual(testCase, value, "0:45:315", ...
            sprintf('%s uses an asymmetric direction hint.', ...
            files(k).name));
    end
end
end

function testStopGoMovesImmediatelyAfterFinalGate(testCase)
set(0, "DefaultFigureVisible", "off");
result = exampleGauntlet02StopGoStopGo();

verifyEqual(testCase, result.blockedSampleCount, 0);
verifyEqual(testCase, result.plan.angularPathLength_deg, 24, ...
    "AbsTol", 1e-9);
verifyLessThanOrEqual(testCase, ...
    result.diagnostics.firstSettledGoalTime_s, 37.5);
afterClearBeforeGoal = result.plan.time_s > 36 & ...
    result.plan.time_s < result.diagnostics.firstSettledGoalTime_s;
verifyFalse(testCase, any( ...
    result.plan.isWaiting(afterClearBeforeGoal)));
end
