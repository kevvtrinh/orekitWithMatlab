function handles = animateAreaTargetAzEl(data, options)
%ANIMATEAREATARGETAZEL Animate an area boundary in a sensor az/el frame.
if nargin < 2
    options = struct();
end
data = normalizeAzElTimeObstacleData(data);
if ~isfield(options, "PauseSeconds"), options.PauseSeconds = 0.001; end
if ~isfield(options, "Figure"), options.Figure = []; end

if isempty(options.Figure)
    figureHandle = figure("Color", "w", ...
        "Name", char(data.targetName + " in sensor az/el"));
else
    figureHandle = options.Figure;
end
ax = axes(figureHandle);
hold(ax, "on"); grid(ax, "on"); box(ax, "on");
xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
xlim(ax, [-180 180]); ylim(ax, [0 90]);

boundary = plot(ax, NaN, NaN, "r-", "LineWidth", 2.2, ...
    "DisplayName", char("Visible " + data.targetName + " boundary"));
statusText = text(ax, 0.02, 0.97, "", "Units", "normalized", ...
    "VerticalAlignment", "top", "FontWeight", "bold");
legend(ax, boundary, "Location", "best");

for k = 1:numel(data.time_s)
    set(boundary, "XData", data.az_deg{k}, ...
        "YData", data.el_deg{k});
    statusText.String = statusMessage(data.targetName, data.status(k));
    title(ax, sprintf("%s in sensor az/el | t = %.2f s", ...
        data.targetName, data.time_s(k)));
    drawnow limitrate;
    pause(options.PauseSeconds);
end

handles = struct("Figure", figureHandle, "Axes", ax, ...
    "Boundary", boundary, "StatusText", statusText);
end

function message = statusMessage(name, status)
switch status
    case "visible"
        message = sprintf("%s visible", name);
    case "outside_sensor_front"
        message = sprintf("%s above horizon but behind the sensor frame", name);
    otherwise
        message = sprintf("%s below the geometric horizon", name);
end
end
