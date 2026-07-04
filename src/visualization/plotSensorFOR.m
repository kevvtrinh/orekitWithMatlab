function handle = plotSensorFOR(sensor, options)
%PLOTSENSORFOR Draw a field-of-regard volume in body frame.

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
    figure("Name", char(sensor.Name + " FOR"));
    ax = axes();
end
alpha = 0.10;
if ~options.UseTransparency
    alpha = 0.35;
end
handle = drawForCone(ax, sensor.MountLocationBody + sensor.MountOffsetMeters, ...
    sensor.BoresightBody, sensor.FieldOfRegardDeg, options.FORScale, ...
    [0.20 0.55 0.95], alpha);
end

function handle = drawForCone(ax, apex, axisVector, halfAngleDeg, lengthMeters, color, faceAlpha)
apex = reshape(apex, 1, 3);
axisVector = SensorObject.unitVector(axisVector);
radius = lengthMeters * tand(min(halfAngleDeg, 89));
theta = linspace(0, 2 * pi, 56);
basis1 = SensorObject.anyPerpendicular(axisVector);
basis2 = SensorObject.unitVector(cross(axisVector, basis1));
rim = apex + lengthMeters * axisVector + ...
    radius * (cos(theta(:)) .* basis1 + sin(theta(:)) .* basis2);
vertices = [apex; rim];
faces = zeros(numel(theta) - 1, 3);
for k = 1:numel(theta) - 1
    faces(k, :) = [1, k + 1, k + 2];
end
hold(ax, "on");
handle = patch(ax, "Vertices", vertices, "Faces", faces, ...
    "FaceColor", color, "FaceAlpha", faceAlpha, ...
    "EdgeColor", color, "EdgeAlpha", min(1, faceAlpha + 0.18), ...
    "LineStyle", "--");
end
