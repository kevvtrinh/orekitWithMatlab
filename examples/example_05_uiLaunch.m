%% Example 05: launch the current MATLAB UI front end
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();
launchOrekitSatelliteUI();

