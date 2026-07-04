function fig = plotOrbitalElements(elements, satelliteName)
%PLOTORBITALELEMENTS Plot osculating element history from computeOrbitalElements.

if nargin < 2
    satelliteName = "";
end

fig = figure("Name", "Orbital Elements");
layout = tiledlayout(fig, 3, 2, "TileSpacing", "compact");
if strlength(string(satelliteName)) > 0
    title(layout, "Osculating Elements - " + string(satelliteName));
end

plotOne(nexttile(layout), elements.Time, elements.SemiMajorAxisMeters / 1000.0, ...
    "Semi-major axis (km)");
plotOne(nexttile(layout), elements.Time, elements.Eccentricity, "Eccentricity");
plotOne(nexttile(layout), elements.Time, elements.InclinationDeg, "Inclination (deg)");
plotOne(nexttile(layout), elements.Time, elements.RAANDeg, "RAAN (deg)");
plotOne(nexttile(layout), elements.Time, elements.ArgPerigeeDeg, "Arg of perigee (deg)");
plotOne(nexttile(layout), elements.Time, elements.PerigeeAltKm, "Perigee altitude (km)");
end

function plotOne(ax, t, values, label)
plot(ax, t, values, "LineWidth", 1.2);
ylabel(ax, label);
grid(ax, "on");
end
