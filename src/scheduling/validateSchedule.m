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
report.SlewModel = "Rest-to-rest transitions between known parent-body endpoint directions";
report.Limitations = ["Initial acquisition and final parking are not checked."; ...
    "Tracking rate continuity, slew-path obstacles, and jerk are not checked."; ...
    "Access and area coverage retain their documented sampling and estimate limits."];
end
