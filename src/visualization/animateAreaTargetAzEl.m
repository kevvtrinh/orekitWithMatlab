function handles = animateAreaTargetAzEl(data, options)
%ANIMATEAREATARGETAZEL Animate an area boundary in a sensor az/el frame.
if nargin < 2
    options = struct();
end
if ~isfield(options, "PauseSeconds"), options.PauseSeconds = 0.001; end
if ~isfield(options, "Figure"), options.Figure = []; end

if isempty(options.Figure)
    figureHandle = figure("Color", "w", ...
        "Name", char(data.TargetName + " in sensor az/el"));
else
    figureHandle = options.Figure;
end
ax = axes(figureHandle);
hold(ax, "on"); grid(ax, "on"); box(ax, "on");
xlabel(ax, "Sensor azimuth (deg)");
ylabel(ax, "Sensor elevation (deg)");
xlim(ax, [-180 180]); ylim(ax, [0 90]);

azLim = data.AzimuthLimitsDeg;
elLim = data.ElevationLimitsDeg;
limit = plot(ax, [azLim(1) azLim(2) azLim(2) azLim(1) azLim(1)], ...
    [elLim(1) elLim(1) elLim(2) elLim(2) elLim(1)], ...
    "k--", "LineWidth", 1.2, "DisplayName", "Sensor position limits");
boundary = plot(ax, NaN, NaN, "r-", "LineWidth", 2.2, ...
    "DisplayName", char("Visible " + data.TargetName + " boundary"));
home = plot(ax, data.HomeAzElDeg(1), data.HomeAzElDeg(2), "ko", ...
    "LineWidth", 1.4, "MarkerSize", 7, "DisplayName", "Home position");
command = plot(ax, NaN, NaN, "b+", "LineWidth", 2, "MarkerSize", 10, ...
    "DisplayName", "Centroid az/el command");
statusText = text(ax, 0.02, 0.97, "", "Units", "normalized", ...
    "VerticalAlignment", "top", "FontWeight", "bold");
legend(ax, [boundary home command limit], "Location", "best");

for k = 1:numel(data.Time)
    set(boundary, "XData", data.AzimuthDeg{k}, ...
        "YData", data.ElevationDeg{k});
    set(command, "XData", data.CommandAzimuthDeg(k), ...
        "YData", data.CommandElevationDeg(k));
    statusText.String = statusMessage(data.TargetName, data.Status(k), ...
        data.CommandInsidePositionLimits(k));
    title(ax, sprintf("%s in sensor az/el | %s | t = %.2f s", ...
        data.TargetName, string(data.Time(k)), data.ElapsedSeconds(k)));
    drawnow limitrate;
    pause(options.PauseSeconds);
end

handles = struct("Figure", figureHandle, "Axes", ax, ...
    "Boundary", boundary, "Home", home, "Command", command, ...
    "Limits", limit, "StatusText", statusText);
end

function message = statusMessage(name, status, insideLimits)
switch status
    case "visible"
        if insideLimits
            message = sprintf("%s visible; centroid inside position limits", name);
        else
            message = sprintf("%s visible; centroid outside position limits", name);
        end
    case "outside_sensor_front"
        message = sprintf("%s above horizon but behind the sensor frame", name);
    otherwise
        message = sprintf("%s below the geometric horizon", name);
end
end
