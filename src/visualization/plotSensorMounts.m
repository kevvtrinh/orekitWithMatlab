function handles = plotSensorMounts(satellite, options)
%PLOTSENSORMOUNTS Draw sensor mount points and optional labels.

options = normalizeViewerOptionsLocal(options);
ax = ensureAxesLocal(options.ParentAxes);
handles = gobjects(0);
hold(ax, "on");

if isempty(satellite.Sensors) || ~satellite.ShowSensorMounts || ~options.ShowSensorMounts
    return;
end

selected = string(options.SelectedSensorName);
for k = 1:numel(satellite.Sensors)
    sensor = satellite.Sensors{k};
    if ~sensor.ShowInViewer
        continue;
    end
    if strlength(strtrim(selected)) > 0 && selected ~= sensor.Name
        continue;
    end
    p = sensorMountLocation(sensor, satellite);
    handles(end + 1) = scatter3(ax, p(1), p(2), p(3), 48, "filled", ...
        "MarkerFaceColor", sensor.Color, "MarkerEdgeColor", [0.08 0.08 0.08]); %#ok<AGROW>
    if options.ShowLabels && sensor.LabelVisible
        text(ax, p(1), p(2), p(3), "  " + string(sensor.Name), ...
            "Interpreter", "none", "FontSize", 8);
    end
    if options.ShowBoresight && sensor.BoresightVisible
        plotSensorBoresight(sensor, options);
    end
    if options.ShowFOV && sensor.FOVVisible
        plotSensorFOV(sensor, options);
    end
    if options.ShowFOR && sensor.FORVisible
        plotSensorFOR(sensor, options);
    end
end
end

function p = sensorMountLocation(sensor, satellite)
p = sensor.MountLocationBody(:).';
if norm(p) > 0
    return;
end
dims = satellite.BodyDimensionsMeters(:).' / 2;
switch string(sensor.MountFace)
    case "+X"
        p = [dims(1) 0 0];
    case "-X"
        p = [-dims(1) 0 0];
    case "+Y"
        p = [0 dims(2) 0];
    case "-Y"
        p = [0 -dims(2) 0];
    case "+Z"
        p = [0 0 dims(3)];
    otherwise
        p = [0 0 -dims(3)];
end
end

function options = normalizeViewerOptionsLocal(options)
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

function ax = ensureAxesLocal(ax)
if isempty(ax) || ~isvalid(ax)
    figure("Name", "Sensor Mounts");
    ax = axes();
end
end
