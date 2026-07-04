function handles = plotSatelliteSensorViewer(scenario, satelliteName, options)
%PLOTSATELLITESENSORVIEWER Draw a satellite and its mounted sensors.

if nargin < 3 || isempty(options)
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
if upper(string(options.ViewMode)) ~= "BODYFRAME"
    warning("plotSatelliteSensorViewer:BodyFrameOnly", ...
        "Only BodyFrame view mode is implemented in the MVP.");
end

satellite = scenario.getObject(satelliteName);
if ~isa(satellite, "SatelliteObject")
    error("plotSatelliteSensorViewer:NotSatellite", ...
        "Object '%s' is not a SatelliteObject.", string(satelliteName));
end

ax = options.ParentAxes;
if isempty(ax) || ~isvalid(ax)
    figure("Name", char(string(satelliteName) + " Sensor Viewer"));
    ax = axes();
else
    cla(ax);
end
options.ParentAxes = ax;
hold(ax, "on");

handles = struct();
handles.Axes = ax;
handles.Body = plotSatelliteBody(satellite, options);
handles.Sensors = plotSensorMounts(satellite, options);

dims = satellite.BodyDimensionsMeters(:).' * options.SatelliteScale;
extent = max([dims, options.FORScale * 2, options.FOVScale * 2, 1]);
xlim(ax, [-extent extent]);
ylim(ax, [-extent extent]);
zlim(ax, [-extent extent]);
axis(ax, "equal");
grid(ax, "on");
view(ax, 35, 24);
hold(ax, "off");
end
