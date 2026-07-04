function ax = plotSensorFOV(scenario, parentObjectName, sensorName, time, options)
%PLOTSENSORFOV Plot the MVP ground footprint representation of a sensor FOV.

if nargin < 5
    options = struct();
end
if isfield(options, "Axes")
    ax = options.Axes;
else
    ax = [];
end
ax = plotSensorGroundFootprint(scenario, parentObjectName, sensorName, time, ax);
end
