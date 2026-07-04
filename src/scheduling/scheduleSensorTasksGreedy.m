function schedule = scheduleSensorTasksGreedy(scenario, candidates, options)
%SCHEDULESENSORTASKSGREEDY Select feasible candidates while avoiding conflicts.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
if nargin < 1 || isempty(scenario)
    timeZone = "UTC";
else
    timeZone = scenario.Config.Epoch.TimeZone;
end
schedule = emptySensorScheduleTable(timeZone);
if isempty(candidates) || height(candidates) == 0
    return;
end

pool = candidates(candidates.Feasible, :);
if height(pool) == 0
    return;
end
[~, order] = sortrows(table(-pool.Priority, -pool.QualityScore, pool.StartTime), [1 2 3]);
pool = pool(order, :);

selectedTaskIDs = strings(0, 1);
for k = 1:height(pool)
    candidate = pool(k, :);
    if any(selectedTaskIDs == candidate.TaskID(1))
        continue;
    end
    conflictsExisting = false;
    for s = 1:height(schedule)
        [hasConflict, ~, ~, ~, ~] = candidateRowsConflict(schedule(s, :), candidate, options);
        if hasConflict
            conflictsExisting = true;
            break;
        end
    end
    if conflictsExisting
        continue;
    end
    candidate.Scheduled = true;
    candidate.ScheduleOrder = height(schedule) + 1;
    schedule = [schedule; candidate]; %#ok<AGROW>
    selectedTaskIDs(end + 1, 1) = candidate.TaskID(1); %#ok<AGROW>
end
end
