%% Example 22: area target in a moving sensor az/el frame (Orekit)
% Orekit replacement for the STK SmartSensor example.  The orbit is
% propagated with zonal harmonics (Eckstein-Hechler J2..J6), the Vietnam
% boundary is projected through WGS-84 horizon geometry, and the first
% reachable pass is animated and accumulated into an az/el sweep print.
suiteRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(suiteRoot);
startupOrekitSuite();

startTime = datetime(2023, 9, 17, 5, 31, 0, "TimeZone", "UTC");
stopTime = datetime(2023, 9, 17, 9, 0, 0, "TimeZone", "UTC");
cfg = ScenarioConfig("Name", "Area target sensor-frame sweep", ...
    "Epoch", startTime, "StopTime", stopTime, ...
    "TimeStep", seconds(10), "AnimationStep", seconds(1));
scenario = MissionScenario(cfg);

earthEquatorialRadiusMeters = 6378137.0;
sat = SatelliteObject.fromKeplerian("sat1", ...
    earthEquatorialRadiusMeters + 900e3, 0, 98.6, 20, 0, 0);
sat.PropagatorType = "EcksteinHechler";  % Orekit zonal J2..J6 analytical model
sat.Attitude = "NadirSun";

sensor = SensorObject.simpleConic("SatAEsensor", "sat1", 1);
sensor.PointingMode = "Nadir";
sensor.FieldOfRegardDeg = 70;             % elevation >= 20 deg
sensor.MinElevationDeg = 5;               % ground-side access constraint
sensor.AzimuthRateLimitDegPerSec = 2;
sensor.ElevationRateLimitDegPerSec = 2;
sensor.AzimuthAccelerationLimitDegPerSec2 = 0.2;
sensor.ElevationAccelerationLimitDegPerSec2 = 0.2;
sensor.MountOffsetMeters = [0 0 2000];
sat = sat.addSensor(sensor);

latitudeDeg = [ ...
    21.6409, 23.2462, 22.4436, 20.8382, 19.8349, 18.4303, 15.6209, ...
    13.0792, 10.2029, 8.66451, 10.6712, 11.6076, 15.3534, 19.0322, 21.0389];
longitudeDeg = [ ...
    107.993, 105.328, 102.664, 103.996, 104.44, 104.631, 107.105, ...
    106.724, 104.821, 104.757, 106.851, 109.072, 108.945, 105.646, 106.724];
vietnam = AreaTargetObject("Vietnam", latitudeDeg, longitudeDeg, 0);
vietnam.Color = [0 0 1];

scenario = scenario.addObject(sat);
scenario = scenario.addObject(vietnam);
scenario = scenario.propagate();

projectionOptions = struct( ...
    "TimeStepSeconds", 1, ...
    "AccessIndex", 1, ...
    "AccessPaddingSeconds", 1, ...
    "MaximumBoundaryStepDeg", 0.15, ...
    "AzimuthLimitsDeg", [-150 150], ...
    "ElevationLimitsDeg", [20 90], ...
    "HomeAzElDeg", [0 90], ...
    "AttitudeMode", "NadirSun");
azElData = computeAreaTargetAzElSweep( ...
    scenario, "sat1", "SatAEsensor", "Vietnam", projectionOptions);

fprintf("Selected access: %s to %s (%d projection samples).\n", ...
    string(azElData.AccessWindow(1)), string(azElData.AccessWindow(2)), ...
    numel(azElData.Time));
animateAreaTargetAzEl(azElData, struct("PauseSeconds", 0.001));
sweepResult = plotAreaTargetAzElSweep(azElData);
