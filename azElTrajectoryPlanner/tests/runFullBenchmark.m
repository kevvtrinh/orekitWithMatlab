function report = runFullBenchmark()
%RUNFULLBENCHMARK Run all frozen examples and persist machine-readable rows.
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
workspaceRoot = fileparts(plannerRoot);
suiteRoot = fullfile(workspaceRoot, "azElStandaloneExamples");
addpath(plannerRoot);
addpath(suiteRoot);
diagnosticRecords = repmat(emptyDiagnosticRecord(), 0, 1);
report = runAllAzElExamples(@capturePlannerDiagnostics, struct());
diagnostics = struct2table(diagnosticRecords, "AsArray", true);
resultRoot = fullfile(plannerRoot, "results");
if ~isfolder(resultRoot)
    mkdir(resultRoot);
end
writetable(report, fullfile(resultRoot, "full_benchmark.csv"));
writetable(diagnostics, fullfile(resultRoot, "planner_diagnostics.csv"));
save(fullfile(resultRoot, "full_benchmark.mat"), "report", "diagnostics");
assert(all(report.PlannerCalled), "A fixture did not call the planner.");
assert(all(report.ValidationPassed), ...
    "At least one plan failed independent validation.");
assert(all(report.AssertionsPassed), ...
    "At least one behavioral assertion failed.");
assert(all(report.Success), "At least one frozen example failed.");

    function plan = capturePlannerDiagnostics(scenario)
        plan = planAzElTrajectory(scenario);
        record = emptyDiagnosticRecord();
        record.ExampleId = string(scenario.id);
        record.Success = plan.success;
        record.SearchElapsed_s = plan.searchElapsed_s;
        record.ExpandedStates = plan.expandedStateCount;
        record.GeneratedStates = plan.generatedStateCount;
        record.AngularPathLength_deg = plan.angularPathLength_deg;
        if ~isempty(fieldnames(plan.searchDiagnostics))
            search = plan.searchDiagnostics;
            record.TotalElapsed_s = search.totalElapsed_s;
            record.PropagationAttempts = search.propagationAttempts;
            record.CollisionPointQueries = search.collisionPointQueries;
            record.DeadlineRejections = search.deadlineRejections;
            record.TerminalConnectorAttempts = ...
                search.terminalConnectorAttempts;
            record.PeakLiveStates = search.peakLiveStates;
            record.EstimatedStateStorageBytes = ...
                search.estimatedStateStorageBytes;
        end
        diagnosticRecords(end + 1, 1) = record;
    end
end

function record = emptyDiagnosticRecord()
record = struct( ...
    "ExampleId", "", ...
    "Success", false, ...
    "SearchElapsed_s", NaN, ...
    "TotalElapsed_s", NaN, ...
    "ExpandedStates", NaN, ...
    "GeneratedStates", NaN, ...
    "PropagationAttempts", NaN, ...
    "CollisionPointQueries", NaN, ...
    "DeadlineRejections", NaN, ...
    "TerminalConnectorAttempts", NaN, ...
    "PeakLiveStates", NaN, ...
    "EstimatedStateStorageBytes", NaN, ...
    "AngularPathLength_deg", NaN);
end
