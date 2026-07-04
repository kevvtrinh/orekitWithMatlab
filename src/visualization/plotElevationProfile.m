function ax = plotElevationProfile(accessResult, ax)
%PLOTELEVATIONPROFILE Plot elevation angle versus time.

if nargin < 2 || isempty(ax)
    figure("Name", "Elevation Profile");
    ax = axes();
end

plot(ax, accessResult.TimeVector, accessResult.Elevation, "LineWidth", 1.3);
grid(ax, "on");
xlabel(ax, "Time");
ylabel(ax, "Elevation (deg)");
title(ax, "Elevation - " + accessResult.SourceName + " to " + accessResult.TargetName);
end

