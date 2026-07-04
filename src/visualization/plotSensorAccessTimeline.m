function ax = plotSensorAccessTimeline(sensorAccessResult, ax)
%PLOTSENSORACCESSTIMELINE Plot boolean sensor access over scenario time.

if nargin < 2 || isempty(ax)
    figure("Name", "Sensor Access Timeline");
    ax = axes();
end

stairs(ax, sensorAccessResult.TimeVector, double(sensorAccessResult.AccessLogical), ...
    "LineWidth", 1.4);
ylim(ax, [-0.1 1.1]);
yticks(ax, [0 1]);
yticklabels(ax, ["No Access", "Access"]);
grid(ax, "on");
xlabel(ax, "Time");
title(ax, sensorAccessResult.ParentName + "/" + ...
    sensorAccessResult.SensorName + " to " + sensorAccessResult.TargetName);
end
