%% Script 200: create a point target
suiteRoot = fileparts(fileparts(fileparts(fileparts(mfilename("fullpath")))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
target = TargetObject("Denver Target", 39.7392, -104.9903, 1609);
disp(target);
