function ax = plotSensorGroundFootprint(scenario, parentObjectName, sensorName, time, ax)
%PLOTSENSORGROUNDFOOTPRINT Approximate simple-conic nadir footprint.

if nargin < 5 || isempty(ax)
    figure("Name", "Sensor Ground Footprint");
    ax = axes();
end

parent = scenario.getObject(parentObjectName);
sensor = parent.getSensor(sensorName);
if ~isa(parent, "SatelliteObject")
    error("plotSensorGroundFootprint:UnsupportedParent", ...
        "Ground footprint plotting currently supports satellite sensors.");
end
if upper(string(sensor.FieldOfViewType)) ~= "SIMPLECONIC"
    error("plotSensorGroundFootprint:UnsupportedFOV", ...
        "Ground footprint plotting currently supports SimpleConic sensors.");
end

lla = parent.getLLA(time);
earthRadiusKm = 6378.137;
altitudeKm = lla(3) / 1000.0;
footprintRadiusKm = altitudeKm * tand(sensor.ConeHalfAngleDeg);
angularRadiusDeg = rad2deg(footprintRadiusKm / earthRadiusKm);
theta = linspace(0, 360, 181);
lat = lla(1) + angularRadiusDeg * sind(theta);
lon = lla(2) + angularRadiusDeg * cosd(theta) ./ max(cosd(lla(1)), 0.01);

holdState = ishold(ax);
hold(ax, "on");
try
    coast = load("coastlines");
    plot(ax, coast.coastlon, coast.coastlat, "Color", [0.15 0.35 0.18]);
catch
end
plot(ax, lon, lat, "Color", sensor.Color, "LineWidth", 1.4);
scatter(ax, lla(2), lla(1), 45, "filled", "MarkerFaceColor", parent.Color);
xlim(ax, [-180 180]);
ylim(ax, [-90 90]);
grid(ax, "on");
xlabel(ax, "Longitude (deg)");
ylabel(ax, "Latitude (deg)");
title(ax, sensor.Name + " Approximate Ground Footprint");
if ~holdState
    hold(ax, "off");
end
end
