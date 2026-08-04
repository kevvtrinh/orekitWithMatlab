function results = runPlannerTests()
%RUNPLANNERTESTS Run the public planner tests and fail on any test failure.
plannerRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(plannerRoot);
results = runtests(fullfile(plannerRoot, "tests", ...
    "testPlanAzElTrajectory.m"));
assertSuccess(results);
end
