function handle = plotSensorFOV(varargin)
%PLOTSENSORFOV Plot a body-frame FOV or the legacy ground footprint.

if nargin >= 1 && isa(varargin{1}, "SensorObject")
    sensor = varargin{1};
    if nargin >= 2
        options = varargin{2};
    else
        options = SensorViewerOptions();
    end
    handle = plotBodyFrameFOV(sensor, options);
    return;
end

scenario = varargin{1};
parentObjectName = varargin{2};
sensorName = varargin{3};
time = varargin{4};
if nargin < 5
    options = struct();
else
    options = varargin{5};
end
if isfield(options, "Axes")
    ax = options.Axes;
else
    ax = [];
end
handle = plotSensorGroundFootprint(scenario, parentObjectName, sensorName, time, ax);
end

function handle = plotBodyFrameFOV(sensor, options)
options = normalizeFovOptions(options);
ax = options.ParentAxes;
if isempty(ax) || ~isvalid(ax)
    figure("Name", char(sensor.Name + " FOV"));
    ax = axes();
end
lengthMeters = options.FOVScale;
halfAngleDeg = sensor.effectiveConeHalfAngleDeg();
alpha = 0.22;
if ~options.UseTransparency
    alpha = 0.55;
end
handle = drawCone(ax, sensor.MountLocationBody + sensor.MountOffsetMeters, ...
    sensor.BoresightBody, halfAngleDeg, lengthMeters, sensor.Color, alpha);
end

function options = normalizeFovOptions(options)
if nargin < 1 || isempty(options)
    options = SensorViewerOptions();
elseif isstruct(options)
    incoming = options;
    options = SensorViewerOptions();
    names = fieldnames(incoming);
    for k = 1:numel(names)
        if isprop(options, names{k})
            options.(names{k}) = incoming.(names{k});
        end
    end
end
end

function handle = drawCone(ax, apex, axisVector, halfAngleDeg, lengthMeters, color, faceAlpha)
apex = reshape(apex, 1, 3);
axisVector = SensorObject.unitVector(axisVector);
radius = lengthMeters * tand(halfAngleDeg);
theta = linspace(0, 2 * pi, 40);
[basis1, basis2] = perpendicularBasis(axisVector);
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
    "EdgeColor", color, "EdgeAlpha", min(1, faceAlpha + 0.20));
end

function [basis1, basis2] = perpendicularBasis(axisVector)
basis1 = SensorObject.anyPerpendicular(axisVector);
basis2 = SensorObject.unitVector(cross(axisVector, basis1));
end
