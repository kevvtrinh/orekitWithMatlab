function ax = plotOffBoresightAngle(sensorAccessResult, ax)
%PLOTOFFBORESIGHTANGLE Plot sensor off-boresight angle over time.

if nargin < 2 || isempty(ax)
    figure("Name", "Off-Boresight Angle");
    ax = axes();
end

plot(ax, sensorAccessResult.TimeVector, ...
    sensorAccessResult.OffBoresightAngleDeg, "LineWidth", 1.4);
grid(ax, "on");
xlabel(ax, "Time");
ylabel(ax, "Off-boresight angle (deg)");
title(ax, sensorAccessResult.SensorName + " Off-Boresight Angle");
end
