function tests = testAzElPlanKinematics
%% Section 0: Header & Readme
% SYNTAX
%   results = runtests("testAzElPlanKinematics.m")
%**************************************************************************
% PURPOSE
%   - Verify kinematic plotting, tabulation, and optional export behavior.
%**************************************************************************
% INPUTS
%   - None; MATLAB supplies local function-test fixtures.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.FunctionTestCase array)
%       Local tests discovered by functiontests.
%**************************************************************************
% UNITS
%   - Test quantities follow the planner's degree/second conventions.
%% Section 1: Register Local Tests
tests = functiontests(localfunctions);
end

function setupOnce(~)
packageRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(genpath(packageRoot));
end

function teardown(~)
close all force;
end

function testPlotsAndReturnsSampledJerkWithoutExport(testCase)
plan = syntheticPlan();
output = plotAzElPlanKinematics(plan, struct( ...
    "FigureVisible", "off"));

verifyTrue(testCase, isgraphics(output.Figure));
verifyEqual(testCase, numel(output.Axes), 4);
verifyFalse(testCase, output.ExportedExcel);
verifyEqual(testCase, output.ExcelFile, "");
verifyEqual(testCase, height(output.Data), numel(plan.time_s));
verifyEqual(testCase, ...
    output.Data.AzimuthJerk_deg_s3, 2 * ones(5, 1), ...
    "AbsTol", 1e-12);
verifyEqual(testCase, ...
    output.Data.ElevationJerk_deg_s3, -ones(5, 1), ...
    "AbsTol", 1e-12);
end

function testOptionalExcelExport(testCase)
plan = syntheticPlan();
excelFile = string(tempname) + ".xlsx";
cleanupFile = onCleanup(@() deleteIfPresent(excelFile));
output = plotAzElPlanKinematics(plan, struct( ...
    "FigureVisible", "off", ...
    "ExportExcel", true, ...
    "ExcelFile", excelFile));

verifyTrue(testCase, output.ExportedExcel);
verifyEqual(testCase, output.ExcelFile, excelFile);
verifyTrue(testCase, isfile(excelFile));
exported = readtable(excelFile, "Sheet", "Kinematics", ...
    "VariableNamingRule", "preserve");
verifyEqual(testCase, height(exported), numel(plan.time_s));
verifyEqual(testCase, ...
    exported.AzimuthUnwrapped_deg, ...
    plan.positionUnwrapped_deg(:, 1), "AbsTol", 1e-12);
clear cleanupFile;
deleteIfPresent(excelFile);
end

function plan = syntheticPlan()
time_s = (0:0.5:2).';
acceleration = [2 * time_s, -time_s];
plan = struct( ...
    "success", true, ...
    "time_s", time_s, ...
    "position_deg", [170 + time_s, 4 * time_s], ...
    "positionUnwrapped_deg", [170 + time_s, 4 * time_s], ...
    "velocity_deg_s", [time_s.^2, 4 * ones(size(time_s))], ...
    "acceleration_deg_s2", acceleration);
end

function deleteIfPresent(file)
if isfile(file)
    delete(file);
end
end
