%% Script 223: plot a sensor boresight arrow
startupOrekitSuite("InitializeOrekit", false);
sensor = SensorObject.simpleConic("BoresightOnly", "DemoSat", 10);
sensor.MountLocationBody = [0 0 -0.5];
sensor.BoresightBody = [0 0 -1];
opts = SensorViewerOptions();
plotSensorBoresight(sensor, opts);
axis equal; grid on; view(35, 24);
