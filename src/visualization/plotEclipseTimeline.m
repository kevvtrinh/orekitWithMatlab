function ax = plotEclipseTimeline(eclipseResult, ax)
%PLOTECLIPSETIMELINE Plot satellite lighting state over scenario time.

if nargin < 2 || isempty(ax)
    figure("Name", "Eclipse Timeline");
    ax = axes();
end

level = ones(numel(eclipseResult.TimeVector), 1);
level(eclipseResult.ShadowLogical) = 1;
level(~eclipseResult.ShadowLogical) = 2;
level(eclipseResult.UmbraLogical) = 0;

stairs(ax, eclipseResult.TimeVector, level, "LineWidth", 1.4);
ylim(ax, [-0.2 2.2]);
yticks(ax, [0 1 2]);
yticklabels(ax, ["Umbra", "Penumbra", "Sunlit"]);
grid(ax, "on");
xlabel(ax, "Time");
title(ax, "Lighting - " + eclipseResult.SatelliteName + ...
    sprintf(" (%.1f%% sunlit)", eclipseResult.SunlitFractionPercent));
end
