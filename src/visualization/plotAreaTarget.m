function ax = plotAreaTarget(areaTarget, ax)
%PLOTAREATARGET Plot an AreaTargetObject boundary.

if nargin < 2 || isempty(ax)
    figure("Name", char(areaTarget.Name));
    ax = axes();
end
ax = areaTarget.plotBoundary(ax);
end
