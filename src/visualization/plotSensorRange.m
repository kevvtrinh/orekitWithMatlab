function ax = plotSensorRange(sensorAccessResult, ax)
%PLOTSENSORRANGE Plot sensor target range over time.

if nargin < 2 || isempty(ax)
    figure("Name", "Sensor Range");
    ax = axes();
end

plot(ax, sensorAccessResult.TimeVector, sensorAccessResult.RangeKm, ...
    "LineWidth", 1.4);
grid(ax, "on");
xlabel(ax, "Time");
ylabel(ax, "Range (km)");
title(ax, sensorAccessResult.SensorName + " Range to " + sensorAccessResult.TargetName);
end
