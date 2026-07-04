function ax = plotGroundTrack(scenario, satelliteName, ax)
%PLOTGROUNDTRACK Plot propagated satellite latitude/longitude.

if nargin < 3 || isempty(ax)
    figure("Name", "Ground Track");
    ax = axes();
end

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("plotGroundTrack:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", satelliteName);
end

hold(ax, "on");
drawCoastlines(ax);
plot(ax, sat.Ephemeris.LongitudeDeg, sat.Ephemeris.LatitudeDeg, ...
    "LineWidth", 1.3, "Color", sat.Color);
scatter(ax, sat.Ephemeris.LongitudeDeg(1), sat.Ephemeris.LatitudeDeg(1), ...
    42, "filled", "MarkerFaceColor", sat.Color);
xlabel(ax, "Longitude (deg)");
ylabel(ax, "Latitude (deg)");
title(ax, "Ground Track - " + string(satelliteName));
xlim(ax, [-180 180]);
ylim(ax, [-90 90]);
grid(ax, "on");
end

function drawCoastlines(ax)
try
    coast = load("coastlines");
    plot(ax, coast.coastlon, coast.coastlat, "Color", [0.15 0.35 0.18]);
catch
    rectangle("Parent", ax, "Position", [-180 -90 360 180], ...
        "EdgeColor", [0.2 0.2 0.2]);
end
end

