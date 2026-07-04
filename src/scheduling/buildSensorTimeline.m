function timeline = buildSensorTimeline(schedule)
%BUILDSENSORTIMELINE Return schedule rows sorted by sensor and start time.

if isempty(schedule) || height(schedule) == 0
    timeline = schedule;
    return;
end
timeline = sortrows(schedule, {'SensorName', 'StartTime'});
end
