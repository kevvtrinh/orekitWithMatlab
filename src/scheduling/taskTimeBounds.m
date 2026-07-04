function [earliest, latest] = taskTimeBounds(task, scenario)
%TASKTIMEBOUNDS Resolve task time window against scenario bounds.

earliest = taskField(task, "EarliestStartTime", NaT(1, 1, "TimeZone", "UTC"));
latest = taskField(task, "LatestStopTime", NaT(1, 1, "TimeZone", "UTC"));

requiredStart = taskField(task, "RequiredStartTime", NaT(1, 1, "TimeZone", "UTC"));
requiredStop = taskField(task, "RequiredStopTime", NaT(1, 1, "TimeZone", "UTC"));

if isdatetime(requiredStart) && ~isnat(requiredStart)
    earliest = requiredStart;
end
if isdatetime(requiredStop) && ~isnat(requiredStop)
    latest = requiredStop;
end
if ~(isdatetime(earliest) && ~isnat(earliest))
    earliest = scenario.Config.Epoch;
end
if ~(isdatetime(latest) && ~isnat(latest))
    latest = scenario.Config.getStopTime();
end
end
