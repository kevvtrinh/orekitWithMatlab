function ax = plotAccessTimeline(accessResult, ax)
%PLOTACCESSTIMELINE Plot boolean access over scenario time.

if nargin < 2 || isempty(ax)
    figure("Name", "Access Timeline");
    ax = axes();
end

stairs(ax, accessResult.TimeVector, double(accessResult.AccessLogical), ...
    "LineWidth", 1.4);
ylim(ax, [-0.1 1.1]);
yticks(ax, [0 1]);
yticklabels(ax, ["No Access", "Access"]);
grid(ax, "on");
xlabel(ax, "Time");
title(ax, accessResult.SourceName + " to " + accessResult.TargetName);
end

