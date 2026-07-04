function score = scoreTaskCandidate(candidate, task, options)
%SCORETASKCANDIDATE Score a candidate for greedy scheduling and MILP export.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);

priority = scalarTableValue(candidate, "Priority", taskField(task, "Priority", 1));
quality = scalarTableValue(candidate, "QualityScore", 0);
coverageFraction = scalarTableValue(candidate, "CoveragePercent", 0) / 100.0;
dwell = scalarTableValue(candidate, "DwellTimeSeconds", 0);
requiredDwell = max(taskField(task, "RequiredDwellTimeSeconds", 0), ...
    taskField(task, "MinDurationSeconds", 0));
if requiredDwell <= 0
    dwellSatisfaction = 1;
else
    dwellSatisfaction = min(1, dwell / requiredDwell);
end
slew = scalarTableValue(candidate, "SlewTimeSeconds", 0);
duration = max(scalarTableValue(candidate, "DurationSeconds", 1), eps);
normalizedSlew = min(1, slew / duration);
dataVolume = scalarTableValue(candidate, "DataVolumeMb", 0);
normalizedData = min(1, dataVolume / 1024);
normalizedPriority = min(1, priority / 10);

score = options.PriorityWeight * normalizedPriority + ...
    options.QualityWeight * quality + ...
    options.CoverageWeight * coverageFraction + ...
    options.DwellWeight * dwellSatisfaction - ...
    options.SlewPenaltyWeight * normalizedSlew - ...
    options.DataPenaltyWeight * normalizedData;
score = max(0, min(1, score));
end

function value = scalarTableValue(candidate, name, defaultValue)
if istable(candidate) && ismember(name, candidate.Properties.VariableNames)
    value = candidate.(name)(1);
elseif isstruct(candidate) && isfield(candidate, name)
    value = candidate.(name);
else
    value = defaultValue;
end
end
