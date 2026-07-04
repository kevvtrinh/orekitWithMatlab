function handles = plotSatelliteBody(satellite, options)
%PLOTSATELLITEBODY Draw a simple satellite bus in body frame.

options = normalizeViewerOptions(options);
ax = ensureViewerAxes(options.ParentAxes, string(satellite.Name));
hold(ax, "on");
handles = struct();

dims = satellite.BodyDimensionsMeters(:).' * options.SatelliteScale;
if numel(dims) ~= 3 || any(dims <= 0)
    dims = [1 1 1] * options.SatelliteScale;
end
x = dims(1) / 2;
y = dims(2) / 2;
z = dims(3) / 2;
vertices = [-x -y -z; x -y -z; x y -z; -x y -z; ...
    -x -y z; x -y z; x y z; -x y z];
faces = [1 2 3 4; 5 6 7 8; 1 2 6 5; 2 3 7 6; 3 4 8 7; 4 1 5 8];

if options.ShowSatelliteBody
    handles.Body = patch(ax, "Vertices", vertices, "Faces", faces, ...
        "FaceColor", satellite.BodyColor, "FaceAlpha", 0.65, ...
        "EdgeColor", [0.25 0.28 0.30], "LineWidth", 1.0);
end

if options.ShowBodyFrame && satellite.ShowBodyFrame
    axisLength = max(dims) * 0.9;
    handles.XAxis = quiver3(ax, 0, 0, 0, axisLength, 0, 0, ...
        "Color", [0.85 0.10 0.10], "LineWidth", 1.4, "MaxHeadSize", 0.45);
    handles.YAxis = quiver3(ax, 0, 0, 0, 0, axisLength, 0, ...
        "Color", [0.10 0.55 0.18], "LineWidth", 1.4, "MaxHeadSize", 0.45);
    handles.ZAxis = quiver3(ax, 0, 0, 0, 0, 0, axisLength, ...
        "Color", [0.10 0.25 0.85], "LineWidth", 1.4, "MaxHeadSize", 0.45);
    text(ax, axisLength * 1.08, 0, 0, "+X", "Color", [0.85 0.10 0.10]);
    text(ax, 0, axisLength * 1.08, 0, "+Y", "Color", [0.10 0.55 0.18]);
    text(ax, 0, 0, axisLength * 1.08, "+Z", "Color", [0.10 0.25 0.85]);
end

axis(ax, "equal");
grid(ax, "on");
view(ax, 35, 24);
xlabel(ax, "Body X (m)");
ylabel(ax, "Body Y (m)");
zlabel(ax, "Body Z (m)");
title(ax, string(satellite.Name) + " Sensor Inspection");
end

function options = normalizeViewerOptions(options)
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

function ax = ensureViewerAxes(ax, name)
if isempty(ax) || ~isvalid(ax)
    figure("Name", char(name + " Sensor Viewer"));
    ax = axes();
end
end
