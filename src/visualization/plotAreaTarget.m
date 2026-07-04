function ax = plotAreaTarget(areaTarget, ax)
%PLOTAREATARGET Plot an AreaTargetObject boundary and grid points.

if nargin < 2 || isempty(ax)
    figure("Name", char(areaTarget.Name));
    ax = axes();
end
if ismethod(areaTarget, "plotArea")
    ax = areaTarget.plotArea(ax);
else
    ax = areaTarget.plotBoundary(ax);
end
end
