%% Script 201: create a polygon area target and grid
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
area = AreaTargetObject("Denver Metro Area", ...
    [39.25 39.25 40.10 40.10], [-105.45 -104.45 -104.45 -105.45], 1609);
area.GridResolutionKm = 35;
area.GridPoints = area.generateGrid();
disp(area.GridPoints);
plotAreaTarget(area);
