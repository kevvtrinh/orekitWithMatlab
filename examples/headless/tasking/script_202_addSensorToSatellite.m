%% Script 202: add a sensor to a satellite
startupOrekitSuite("InitializeOrekit", false);
scenario = MissionScenario(ScenarioConfig("Name", "Add Sensor To Satellite"));
sat = SatelliteObject.fromKeplerian("TaskSat", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("WideCam", "TaskSat", 35);
sensor.SensorType = "OpticalAgile";
sensor.PointingMode = "Targeted";
sensor.CurrentPointingTarget = "";
sensor.FieldOfRegardDeg = 70;
sat = sat.addSensor(sensor);
scenario = scenario.addObject(sat);
disp(sat.listSensors());
