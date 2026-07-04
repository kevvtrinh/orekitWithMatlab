function schedule = emptySensorScheduleTable(timeZone)
%EMPTYSENSORSCHEDULETABLE Create an empty selected schedule table.

base = emptyTaskCandidateTable(timeZone);
schedule = base;
schedule.Scheduled = false(height(schedule), 1);
schedule.ScheduleOrder = zeros(height(schedule), 1);
end
