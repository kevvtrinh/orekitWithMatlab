function handle = plotSensorBoresight(sensor, options)
%PLOTSENSORBORESIGHT Draw a sensor boresight arrow in body frame.

if nargin < 2 || isempty(options)
    options = SensorViewerOptions();
end
if isstruct(options)
    incoming = options;
    options = SensorViewerOptions();
    names = fieldnames(incoming);
    for k = 1:numel(names)
        if isprop(options, names{k})
            options.(names{k}) = incoming.(names{k});
        end
    end
end
ax = options.ParentAxes;
if isempty(ax) || ~isvalid(ax)
    figure("Name", char(sensor.Name + " Boresight"));
    ax = axes();
end
p = sensor.MountLocationBody(:).' + sensor.MountOffsetMeters(:).';
v = SensorObject.unitVector(sensor.BoresightBody) * options.BoresightLength;
hold(ax, "on");
handle = quiver3(ax, p(1), p(2), p(3), v(1), v(2), v(3), ...
    "Color", sensor.Color, "LineWidth", 1.6, "MaxHeadSize", 0.45);
end
