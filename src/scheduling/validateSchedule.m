function report = validateSchedule(schedule, options)
%VALIDATESCHEDULE Validate a selected schedule table for conflicts.

if nargin < 2
    options = SchedulerOptions();
end
conflicts = detectTaskConflicts(schedule, options);
report = struct();
report.IsValid = height(conflicts) == 0;
report.ConflictCount = height(conflicts);
report.Conflicts = conflicts;
end
