function tests = testSensorViewer
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite("InitializeOrekit", false);
end

function testSensorViewerOptionsAndPlot(testCase)
scenario = MissionScenario(ScenarioConfig("Name", "Viewer Test"));
sat = SatelliteObject.fromKeplerian("ViewerSat", 7000e3, 0.001, 51.6, 0, 0, 0);
sat.BodyDimensionsMeters = [1 1 1];
sensor = SensorObject.simpleConic("Cam", "ViewerSat", 10);
sensor.MountLocationBody = [0 0 -0.5];
sensor.BoresightBody = [0 0 -1];
sensor.FORVisible = true;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);

fig = figure("Visible", "off");
cleanup = onCleanup(@() close(fig));
ax = axes(fig);
opts = SensorViewerOptions("ParentAxes", ax, "ShowFOV", true, "ShowFOR", true);
handles = plotSatelliteSensorViewer(scenario, "ViewerSat", opts);
verifyTrue(testCase, isfield(handles, "Axes"));
verifyEqual(testCase, handles.Axes, ax);
verifyGreaterThan(testCase, numel(ax.Children), 0);
end
