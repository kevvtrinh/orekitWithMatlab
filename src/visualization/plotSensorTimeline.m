function ax = plotSensorTimeline(schedule, ax)
%PLOTSENSORTIMELINE Plot scheduled sensor task intervals.

if nargin < 2 || isempty(ax)
    figure("Name", "Sensor Task Timeline");
    ax = axes();
end
cla(ax);
hold(ax, "on");
grid(ax, "on");

if isempty(schedule) || height(schedule) == 0
    title(ax, "Sensor Task Timeline");
    xlabel(ax, "Time");
    ylabel(ax, "Sensor");
    return;
end

schedule = buildSensorTimeline(schedule);
sensors = unique(schedule.SensorName, "stable");
timelineEpoch = min(schedule.StartTime);
yticks(ax, 1:numel(sensors));
yticklabels(ax, cellstr(sensors));
for k = 1:height(schedule)
    y = find(sensors == schedule.SensorName(k), 1);
    startMinutes = minutes(schedule.StartTime(k) - timelineEpoch);
    stopMinutes = minutes(schedule.StopTime(k) - timelineEpoch);
    widthMinutes = max(stopMinutes - startMinutes, eps);
    rectangle(ax, "Position", [startMinutes, y - 0.35, widthMinutes, 0.7], ...
        "FaceColor", [0.12 0.45 0.70 0.65], ...
        "EdgeColor", [0.08 0.28 0.45]);
    text(ax, startMinutes + widthMinutes / 2, y, schedule.TaskName(k), ...
        "HorizontalAlignment", "center", "VerticalAlignment", "middle", ...
        "Interpreter", "none", "Color", [1 1 1], "FontSize", 8);
end
ylim(ax, [0.4, numel(sensors) + 0.6]);
xlabel(ax, "Minutes since " + string(timelineEpoch));
ylabel(ax, "Sensor");
title(ax, "Scheduled Sensor Tasks");
hold(ax, "off");
end
