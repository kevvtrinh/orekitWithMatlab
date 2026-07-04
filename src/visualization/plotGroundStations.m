function ax = plotGroundStations(scenario, ax)
%PLOTGROUNDSTATIONS Plot ground stations on a longitude/latitude map.

if nargin < 2 || isempty(ax)
    figure("Name", "Ground Stations");
    ax = axes();
end

hold(ax, "on");
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    if isa(obj, "GroundStationObject")
        scatter(ax, obj.LongitudeDeg, obj.LatitudeDeg, 56, "filled", ...
            "MarkerFaceColor", obj.Color, "MarkerEdgeColor", [1 1 1]);
        text(ax, obj.LongitudeDeg, obj.LatitudeDeg, "  " + obj.Name);
    end
end
xlabel(ax, "Longitude (deg)");
ylabel(ax, "Latitude (deg)");
xlim(ax, [-180 180]);
ylim(ax, [-90 90]);
grid(ax, "on");
title(ax, "Ground Stations");
end

