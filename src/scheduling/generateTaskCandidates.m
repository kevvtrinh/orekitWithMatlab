function candidates = generateTaskCandidates(scenario, taskList, options)
%GENERATETASKCANDIDATES Generate scheduler-ready sensor task candidates.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
taskCells = normalizeSensorTasks(taskList);
candidates = emptyTaskCandidateTable(scenario.Config.Epoch.TimeZone);

for k = 1:numel(taskCells)
    taskCandidates = computeSensorTaskOpportunities(scenario, taskCells{k}, options);
    candidates = [candidates; taskCandidates]; %#ok<AGROW>
end
end
