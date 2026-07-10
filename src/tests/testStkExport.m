function tests = testStkExport
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testSaveCreatesNativeAndStkBundle(testCase)
[scenario, ~] = localScenario();
folder = makeTempFolder();
cleaner = onCleanup(@() removeFolder(folder)); %#ok<NASGU>
nativeFile = fullfile(folder, "mission.mat");

saveInfo = saveScenario(scenario, nativeFile);
verifyTrue(testCase, isfile(nativeFile));
verifyTrue(testCase, isfolder(saveInfo.StkBundle.BundleFolder));
verifyTrue(testCase, isfile(saveInfo.StkBundle.ManifestFile));
verifyTrue(testCase, isfile(saveInfo.StkBundle.ConnectFile));
verifyTrue(testCase, isfile(saveInfo.StkBundle.LoaderFile));

restored = loadScenario(nativeFile);
verifyEqual(testCase, string(restored.Config.Name), string(scenario.Config.Name));
verifyEqual(testCase, height(restored.SensorSchedule), 1);
verifyEqual(testCase, string(restored.SensorSchedule.SensorName), "Main Imager");

loader = loadStkBundle(saveInfo.StkBundle.BundleFolder, "DryRun", true);
verifyFalse(testCase, loader.Executed);
verifyFalse(testCase, contains(loader.LoadCommands, "__BUNDLE_DIR__"));
verifyTrue(testCase, contains(loader.LoadCommands, ...
    "New / */Satellite Sat_One"));
verifyTrue(testCase, contains(loader.LoadCommands, ...
    "Define */Satellite/Sat_One/Sensor/Main_Imager SimpleCone 12.5"));
verifyTrue(testCase, contains(loader.LoadCommands, "SetBoundary */AreaTarget/Test_Area"));
verifyTrue(testCase, contains(loader.LoadCommands, ...
    "SetState */Satellite/Sat_One FromFile"));
verifyTrue(testCase, contains(loader.LoadCommands, "SaveAs / * "));
verifyTrue(testCase, endsWith(string(loader.VdfFile), ".vdf"));
end

function testEphemerisAndAttitudeFiles(testCase)
[scenario, satellite] = localScenario();
folder = makeTempFolder();
cleaner = onCleanup(@() removeFolder(folder)); %#ok<NASGU>
bundle = exportStkScenario(scenario, folder);
manifest = jsondecode(fileread(bundle.ManifestFile));
satelliteRecord = findObjectRecord(manifest.Objects, "Sat One");

ephemerisFile = fullfile(folder, string(satelliteRecord.EphemerisFile));
ephemerisText = string(fileread(ephemerisFile));
verifyTrue(testCase, startsWith(ephemerisText, "stk.v.12.0"));
verifyTrue(testCase, contains(ephemerisText, "BEGIN Ephemeris"));
verifyTrue(testCase, contains(ephemerisText, "CoordinateSystem ICRF"));
verifyTrue(testCase, contains(ephemerisText, "DistanceUnit Meters"));
ephemerisData = numericBlock(ephemerisFile, "EphemerisTimePosVel", "END Ephemeris", 7);
verifyEqual(testCase, size(ephemerisData, 1), height(satellite.Ephemeris));
verifyEqual(testCase, ephemerisData(:, 1), ...
    seconds(satellite.Ephemeris.Time - scenario.Config.Epoch), "AbsTol", 1e-9);
verifyEqual(testCase, ephemerisData(1, 2:7), ...
    [satellite.Ephemeris.X_m(1), satellite.Ephemeris.Y_m(1), ...
    satellite.Ephemeris.Z_m(1), satellite.Ephemeris.VX_mps(1), ...
    satellite.Ephemeris.VY_mps(1), satellite.Ephemeris.VZ_mps(1)], ...
    "RelTol", 1e-12);

attitudeFile = fullfile(folder, string(satelliteRecord.AttitudeFile));
attitudeText = string(fileread(attitudeFile));
verifyTrue(testCase, contains(attitudeText, "BEGIN Attitude"));
verifyTrue(testCase, contains(attitudeText, "CoordinateAxes ICRF"));
attitudeData = numericBlock(attitudeFile, "AttitudeTimeQuaternions", "END Attitude", 5);
verifyEqual(testCase, size(attitudeData, 1), height(satellite.Ephemeris));
verifyEqual(testCase, sqrt(sum(attitudeData(:, 2:5).^2, 2)), ...
    ones(size(attitudeData, 1), 1), "AbsTol", 1e-12);
verifyGreaterThanOrEqual(testCase, ...
    min(sum(attitudeData(2:end, 2:5) .* attitudeData(1:end-1, 2:5), 2)), 0);

time = satellite.Ephemeris.Time(1);
axesEcef = [
    SensorObject.bodyVectorToECEF(satellite, time, [1 0 0]);
    SensorObject.bodyVectorToECEF(satellite, time, [0 1 0]);
    SensorObject.bodyVectorToECEF(satellite, time, [0 0 1])];
expected = axesEcef * OrekitFrameTransform.ecefToGcrfRotation(time).';
actual = stkQuaternionToRotation(attitudeData(1, 2:5));
verifyEqual(testCase, actual, expected, "AbsTol", 1e-10);
end

function testSensorPointingIncludesScheduleBoundaries(testCase)
[scenario, ~] = localScenario();
folder = makeTempFolder();
cleaner = onCleanup(@() removeFolder(folder)); %#ok<NASGU>
bundle = exportStkScenario(scenario, folder);
manifest = jsondecode(fileread(bundle.ManifestFile));
sensorRecord = findSensorRecord(manifest.Sensors, "Main Imager");
pointingFile = fullfile(folder, string(sensorRecord.PointingFile));

pointingText = string(fileread(pointingFile));
verifyTrue(testCase, contains(pointingText, "CoordinateAxes Fixed"));
pointingData = numericBlock(pointingFile, "AttitudeTimeQuaternions", "END Attitude", 5);
verifyTrue(testCase, any(abs(pointingData(:, 1) - 75) < 1e-9));
verifyTrue(testCase, any(abs(pointingData(:, 1) - 165) < 1e-9));
verifyTrue(testCase, all(diff(pointingData(:, 1)) > 0));

row = find(abs(pointingData(:, 1) - 75) < 1e-9, 1);
rotation = stkQuaternionToRotation(pointingData(row, 2:5));
resolved = resolveSensorPointing(scenario, "Sat One", "Main Imager", ...
    scenario.Config.Epoch + seconds(75));
verifyGreaterThan(testCase, dot(rotation(3, :), resolved.BoresightEcef), 1 - 1e-12);
end

function testMasksAndCollisionSafeNames(testCase)
cfg = ScenarioConfig("Name", "Names", "Duration", minutes(2), ...
    "TimeStep", seconds(60));
scenario = MissionScenario(cfg);
first = PlaceObject("A B", 10, 20, 0);
second = PlaceObject("A@B", 11, 21, 0);
station = GroundStationObject("Masked Site", 35, -106, 1000, 5);
station.AzElMask = table([0; 180; 360], [5; 12; 5], ...
    'VariableNames', {'AzimuthDeg', 'MinElevationDeg'});
scenario = scenario.addObject(first);
scenario = scenario.addObject(second);
scenario = scenario.addObject(station);

folder = makeTempFolder();
cleaner = onCleanup(@() removeFolder(folder)); %#ok<NASGU>
bundle = exportStkScenario(scenario, folder);
manifest = jsondecode(fileread(bundle.ManifestFile));
placeRecords = manifest.Objects(strcmp({manifest.Objects.StkClass}, "Place"));
verifyEqual(testCase, numel(placeRecords), 2);
verifyNotEqual(testCase, lower(string(placeRecords(1).StkName)), ...
    lower(string(placeRecords(2).StkName)));

stationRecord = findObjectRecord(manifest.Objects, "Masked Site");
maskFile = fullfile(folder, string(stationRecord.AzElMaskFile));
verifyTrue(testCase, isfile(maskFile));
maskText = string(fileread(maskFile));
verifyTrue(testCase, contains(maskText, "BEGIN AzElMask"));
verifyTrue(testCase, contains(maskText, "360 5"));
end

function [scenario, satellite] = localScenario()
epoch = datetime(2026, 1, 1, 0, 0, 0, "TimeZone", "UTC");
cfg = ScenarioConfig("Name", "STK Export Demo", "Epoch", epoch, ...
    "Duration", minutes(4), "TimeStep", seconds(60));
scenario = MissionScenario(cfg);

satellite = SatelliteObject.fromKeplerian( ...
    "Sat One", 7000e3, 0.001, 51.6, 0, 0, 0);
sensor = SensorObject.simpleConic("Main Imager", "Sat One", 12.5);
satellite = satellite.addSensor(sensor);
target = TargetObject("Target One", 10, 20, 0);
area = AreaTargetObject("Test Area", [5; 6; 5], [20; 21; 22], 0);
station = GroundStationObject("Ground Site", 35, -106, 1000, 5);
station.AzElMask = table([0; 120; 240; 360], [5; 8; 7; 5], ...
    'VariableNames', {'AzimuthDeg', 'MinElevationDeg'});
scenario = scenario.addObject(satellite);
scenario = scenario.addObject(target);
scenario = scenario.addObject(area);
scenario = scenario.addObject(station);
scenario = scenario.propagate();
satellite = scenario.getObject("Sat One");

scenario.SensorSchedule = table( ...
    "Main Imager", "Sat One", "TrackPointTarget", "Target One", "", ...
    epoch + seconds(75), epoch + seconds(165), true, ...
    'VariableNames', {'SensorName', 'PlatformName', 'TaskType', ...
    'TargetName', 'AreaTargetName', 'StartTime', 'StopTime', 'Scheduled'});
end

function record = findObjectRecord(records, originalName)
index = find(strcmp(string({records.OriginalName}), string(originalName)), 1);
record = records(index);
end

function record = findSensorRecord(records, originalName)
index = find(strcmp(string({records.OriginalName}), string(originalName)), 1);
record = records(index);
end

function data = numericBlock(filename, startKeyword, endKeyword, columnCount)
lines = strip(splitlines(string(fileread(filename))));
startIndex = find(lines == string(startKeyword), 1) + 1;
endIndex = find(lines(startIndex:end) == string(endKeyword), 1) + startIndex - 2;
dataLines = lines(startIndex:endIndex);
dataLines = dataLines(strlength(dataLines) > 0 & ~startsWith(dataLines, "#"));
data = zeros(numel(dataLines), columnCount);
for k = 1:numel(dataLines)
    values = sscanf(char(dataLines(k)), "%f").';
    data(k, :) = values(1:columnCount);
end
end

function rotation = stkQuaternionToRotation(quaternion)
quaternion = quaternion / norm(quaternion);
x = quaternion(1); y = quaternion(2); z = quaternion(3); w = quaternion(4);
rotation = [
    1 - 2 * (y^2 + z^2), 2 * (x*y - z*w), 2 * (x*z + y*w);
    2 * (x*y + z*w), 1 - 2 * (x^2 + z^2), 2 * (y*z - x*w);
    2 * (x*z - y*w), 2 * (y*z + x*w), 1 - 2 * (x^2 + y^2)];
end

function folder = makeTempFolder()
folder = string(tempname);
mkdir(folder);
end

function removeFolder(folder)
if isfolder(folder)
    rmdir(folder, "s");
end
end
