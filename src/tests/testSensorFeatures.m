function tests = testSensorFeatures
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testPlaceAndTargetObjects(testCase)
place = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);
place.validate();
verifyEqual(testCase, place.ObjectType, "Place");
verifySize(testCase, place.getECEF(), [1 3]);

target = TargetObject("Target A", 38, -105, 1700);
target.Priority = 2;
verifyEqual(testCase, target.ObjectType, "Target");
verifyEqual(testCase, target.Priority, 2);
end

function testSensorAttachmentAndDuplicate(testCase)
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Cam", "Sat-1", 20);
sat = sat.addSensor(sensor);

verifyTrue(testCase, sat.hasSensor("Cam"));
verifyEqual(testCase, sat.getSensor("Cam").ParentName, "Sat-1");
verifyError(testCase, @() sat.addSensor(sensor), "SatelliteObject:DuplicateSensor");
end

function testFovChecks(testCase)
sensor = SensorObject.simpleConic("Cone", "Sat-1", 20);
verifyTrue(testCase, sensor.isInsideFieldOfView([0 0 1], [0 0 1]));
verifyFalse(testCase, sensor.isInsideFieldOfView([1 0 0], [0 0 1]));

rect = SensorObject.rectangular("Rect", "Sat-1", 15, 15);
verifyTrue(testCase, rect.isInsideFieldOfView([0 0 1], [0 0 1]));
verifyFalse(testCase, rect.isInsideFieldOfView([1 0 1], [0 0 1]));
end

function testSatelliteSensorAccessToPlace(testCase)
scenario = localPropagatedScenario();
sat = scenario.getObject("Sat-1");
sensor = SensorObject.targeted("TargetCam", "Sat-1", "Denver Target", 5);
sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);

result = computeSensorAccess(scenario, "Sat-1", "TargetCam", "Denver Target");

requiredFields = ["SourceName", "SensorName", "TargetName", "ParentName", ...
    "TargetType", "AccessLogical", "AccessWindows", "ConstraintStatus", ...
    "OffBoresightAngleDeg", "RangeKm"];
for k = 1:numel(requiredFields)
    verifyTrue(testCase, isfield(result, requiredFields(k)));
end
verifyTrue(testCase, any(result.AccessLogical));
verifyTrue(testCase, all(ismember(["Parent", "Sensor", "Target", "StartTime", ...
    "StopTime", "DurationSeconds", "MaxOffBoresightDeg"], ...
    result.AccessWindows.Properties.VariableNames)));
verifyTrue(testCase, all(ismember(["LineOfSightOK", "FieldOfViewOK", ...
    "RangeOK", "FinalAccess"], result.ConstraintStatus.Properties.VariableNames)));
end

function testGroundSensorAccessToSatellite(testCase)
scenario = localPropagatedScenario();
ground = scenario.getObject("Denver Target");
groundSensor = SensorObject.targeted("Tracker", "Denver Target", "Sat-1", 2);
ground = ground.addSensor(groundSensor);
scenario = scenario.updateObject(ground);

result = computeSensorAccess(scenario, "Denver Target", "Tracker", "Sat-1");

verifyTrue(testCase, any(result.AccessLogical));
verifyEqual(testCase, result.ParentType, "Place");
verifyEqual(testCase, result.TargetType, "Satellite");
end

function testSensorExports(testCase)
scenario = localPropagatedScenario();
sat = scenario.getObject("Sat-1");
sensor = SensorObject.targeted("ExportCam", "Sat-1", "Denver Target", 5);
sat = sat.addSensor(sensor);
scenario = scenario.updateObject(sat);
result = computeSensorAccess(scenario, "Sat-1", "ExportCam", "Denver Target");

reportFile = fullfile(tempdir, "sensor_access_test_report.csv");
statusFile = fullfile(tempdir, "sensor_access_test_status.csv");
definitionsFile = fullfile(tempdir, "sensor_definitions_test.csv");
exportSensorAccessReport(result, reportFile);
exportSensorConstraintStatus(result, statusFile);
exportSensorDefinitions(scenario, definitionsFile);

verifyTrue(testCase, isfile(reportFile));
verifyTrue(testCase, isfile(statusFile));
verifyTrue(testCase, isfile(definitionsFile));
verifyGreaterThan(testCase, height(readtable(statusFile)), 0);
verifyGreaterThan(testCase, height(readtable(definitionsFile)), 0);
end

function testAreaTargetCentroid(testCase)
area = AreaTargetObject("Test Area", [39 39 40 40], [-105 -104 -104 -105], 0);
area.validate();
centroid = area.getCentroid();
verifyEqual(testCase, centroid, [39.5 -104.5], "AbsTol", 1e-12);
verifyTrue(testCase, area.containsPoint(39.5, -104.5));
end

function scenario = localPropagatedScenario()
cfg = ScenarioConfig("Name", "Sensor Test", ...
    "Epoch", datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC"), ...
    "Duration", hours(4), ...
    "TimeStep", seconds(120));
scenario = MissionScenario(cfg);
sat = SatelliteObject.fromKeplerian("Sat-1", 7000e3, 0.001, 51.6, 0, 0, 0);
target = PlaceObject("Denver Target", 39.7392, -104.9903, 1609);
scenario = scenario.addObject(sat);
scenario = scenario.addObject(target);
scenario = scenario.propagate();
end
