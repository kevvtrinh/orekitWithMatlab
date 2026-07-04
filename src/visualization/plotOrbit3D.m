function ax = plotOrbit3D(scenario, satelliteName, ax)
%PLOTORBIT3D Plot propagated inertial orbit in 3D.

if nargin < 3 || isempty(ax)
    figure("Name", "Orbit 3D");
    ax = axes();
end

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("plotOrbit3D:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", satelliteName);
end

hold(ax, "on");
[x, y, z] = sphere(50);
radiusKm = 6378.137;
surf(ax, radiusKm * x, radiusKm * y, radiusKm * z, ...
    "FaceColor", [0.25 0.52 0.86], "EdgeColor", "none", "FaceAlpha", 0.7);
plot3(ax, sat.Ephemeris.X_m / 1000, sat.Ephemeris.Y_m / 1000, ...
    sat.Ephemeris.Z_m / 1000, "LineWidth", 1.4, "Color", sat.Color);
axis(ax, "equal");
grid(ax, "on");
xlabel(ax, "X (km)");
ylabel(ax, "Y (km)");
zlabel(ax, "Z (km)");
title(ax, "Orbit - " + string(satelliteName));
view(ax, 35, 25);
end

