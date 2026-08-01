function tests = testSimpleDijkstraExampleCompatibility
%% Section 0: Header & Readme
% SYNTAX
%   tests = testSimpleDijkstraExampleCompatibility
%**************************************************************************
% PURPOSE
%   - Expose the complete legacy-example compatibility run to MATLAB's
%     function-based test framework.
%**************************************************************************
% INPUTS
%   - None.
%**************************************************************************
% OUTPUTS
%   - tests (matlab.unittest.Test array)
%       One aggregate test that always runs every example case.
%**************************************************************************
% UNITS
%   - Test quantities use the units documented by the planner.
tests = functiontests(localfunctions);
end

function testEveryExampleUsesSimpleDijkstra(testCase)
%% Section 0: Header & Readme
% SYNTAX
%   testEveryExampleUsesSimpleDijkstra(testCase)
%**************************************************************************
% PURPOSE
%   - Require every standalone example dataset to succeed with the simple
%     planner while retaining a complete report when some cases fail.
%**************************************************************************
% INPUTS
%   - testCase (matlab.unittest.FunctionTestCase)
%       Active verification fixture.
%**************************************************************************
% OUTPUTS
%   - None.
%**************************************************************************
% UNITS
%   - Angles are degrees and time is seconds.
report = runSimpleDijkstraExampleCompatibility();
failedRows = report(~report.Passed, :);
failureMessages = failedRows.Example + ": " + failedRows.Message;
verifyTrue(testCase, all(report.Passed), ...
    sprintf("%d of %d example cases failed:\n%s", ...
        height(failedRows), height(report), ...
        strjoin(failureMessages, newline)));
end
