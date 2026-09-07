function tests = testVelocityPointingCorrectness
% Native frame checks supplement the Java-free geometry regression suite.
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testVelocityTransformIncludesEarthRotation(testCase)
time = datetime(2026, 1, 1, "TimeZone", "UTC");
state = [7000000, 1000000, 2000000, -1000, 6000, 2500];
actual = OrekitFrameTransform.gcrfStateToEcefVelocity(time, state);
% An independent derivative of transformed positions includes the moving
% frame without using transformPVCoordinates for the expected result.
stepSeconds = 0.01;
before = OrekitFrameTransform.gcrfToEcef(time - seconds(stepSeconds), ...
    state(1:3) - stepSeconds * state(4:6));
after = OrekitFrameTransform.gcrfToEcef(time + seconds(stepSeconds), ...
    state(1:3) + stepSeconds * state(4:6));
expected = (after - before) / (2 * stepSeconds);
verifyEqual(testCase, actual, expected, "AbsTol", 1e-3);
rotatedOnly = OrekitFrameTransform.gcrfToEcef(time, state(4:6));
verifyGreaterThan(testCase, norm(actual - rotatedOnly), 400);
end

function testVelocityPointingMatchesNativeEarthFixedVelocity(testCase)
scenario = velocityScenario([0, 500, 20]);
satellite = scenario.getObject("Sat");
sensor = satellite.getSensor("Cam");
expected = [0, 500, 20] / norm([0, 500, 20]);
times = scenario.Config.getTimeVector();
for timeIndex = 1:numel(times)
    actual = sensor.getBoresightVector(times(timeIndex), scenario);
    verifyEqual(testCase, actual, expected, "AbsTol", 1e-12);
end
end

function testVelocityPointingIsIndependentOfAccessSampleBatch(testCase)
scenario = velocityScenario([0, 500, 20]);
coarse = computeSensorAccess(scenario, "Sat", "Cam", "Ground", ...
    struct("UseFieldOfRegard", false, "SuppressNoAccessWarning", true));
fine = computeSensorAccess(scenario, "Sat", "Cam", "Ground", ...
    struct("UseFieldOfRegard", false, "TimeStepSeconds", 5, ...
    "SuppressNoAccessWarning", true));
satellite = scenario.getObject("Sat");
sensor = satellite.getSensor("Cam");
look = sensor.computeLookAngles(scenario, "Ground", coarse.TimeVector);
verifyEqual(testCase, coarse.OffBoresightAngleDeg, ...
    fine.OffBoresightAngleDeg(1:2:end), "AbsTol", 1e-12);
verifyEqual(testCase, coarse.OffBoresightAngleDeg, look.OffBoresightAngleDeg, ...
    "AbsTol", 1e-12);
end

function testStationaryEarthFixedVelocityHasNoPointingDirection(testCase)
scenario = velocityScenario([0, 0, 0]);
satellite = scenario.getObject("Sat");
sensor = satellite.getSensor("Cam");
verifyError(testCase, @() sensor.getBoresightVector(scenario.Config.Epoch, scenario), ...
    "SensorObject:UndefinedVelocityPointing");
verifyError(testCase, @() computeSensorAccess(scenario, "Sat", "Cam", "Ground"), ...
    "SensorObject:UndefinedVelocityPointing");
end

function testCartesianMovingTargetLlaMatchesKnownWgs84Locations(testCase)
epoch = datetime(2026, 1, 1, "TimeZone", "UTC");
expected = [0, 0, 0; 80, 179, 1000; -45, -120, 10000];
positions = zeros(3, 3);
for row = 1:3
    [x, y, z] = OrekitFrames.geodeticToECEF(expected(row, 1), expected(row, 2), expected(row, 3));
    positions(row, :) = [x, y, z];
end
times = epoch + seconds([0; 10; 20]);
target = TargetObject("Moving", 1, 2, 3);
target.Trajectory = table(times, positions(:, 1), positions(:, 2), positions(:, 3), ...
    'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m'});
for row = 1:3
    actual = target.getLLA(times(row));
    verifyEqual(testCase, actual(1:2), expected(row, 1:2), "AbsTol", 1e-10);
    verifyEqual(testCase, actual(3), expected(row, 3), "AbsTol", 1e-6);
end
end

function scenario = velocityScenario(velocityEcef)
% Choose an Earth-fixed straight-line trajectory, then form its native
% GCRF PV states with the inverse transform. The expected ECEF velocity is
% the prescribed input, not a second call to the production forward helper.
config = ScenarioConfig("Duration", seconds(20), "TimeStep", seconds(10));
times = config.getTimeVector();
states = zeros(numel(times), 6);
for row = 1:numel(times)
    positionEcef = [7000000, 0, 0] + seconds(times(row) - times(1)) * velocityEcef;
    position = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
        positionEcef(1), positionEcef(2), positionEcef(3));
    velocity = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
        velocityEcef(1), velocityEcef(2), velocityEcef(3));
    earthFrame = OrekitFrames.earthFrame();
    transform = earthFrame.getTransformTo(OrekitFrames.outputFrame("GCRF"), ...
        OrekitTime.toAbsoluteDate(times(row)));
    pv = transform.transformPVCoordinates(javaObject("org.orekit.utils.PVCoordinates", ...
        position, velocity));
    position = pv.getPosition();
    velocity = pv.getVelocity();
    states(row, :) = [position.getX(), position.getY(), position.getZ(), ...
        velocity.getX(), velocity.getY(), velocity.getZ()];
end
satellite = SatelliteObject.fromKeplerian("Sat", 7000000, 0, 0, 0, 0, 0);
satellite.Ephemeris = OrekitEphemeris.fromGcrfStates(times, states);
satellite.IsPropagated = true;
sensor = SensorObject.simpleConic("Cam", "Sat", 20);
sensor.PointingMode = "VelocityVector";
satellite = satellite.addSensor(sensor);
scenario = MissionScenario(config);
scenario = scenario.addObject(satellite);
scenario = scenario.addObject(TargetObject("Ground", 0, 0, 0));
end
