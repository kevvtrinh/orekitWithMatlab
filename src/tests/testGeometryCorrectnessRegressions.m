function tests = testGeometryCorrectnessRegressions
% Deterministic analytic geometry fixtures; no propagation or Java required.
tests = functiontests(localfunctions);
end

function setupOnce(~)
sourceRoot = fileparts(fileparts(mfilename("fullpath")));
addpath(fullfile(sourceRoot, "core"), fullfile(sourceRoot, "objects"), ...
    fullfile(sourceRoot, "analysis"), fullfile(sourceRoot, "orekit"));
end

function testMovingTargetUsesCartesianTrajectory(testCase)
epoch = datetime(2026, 1, 1, "TimeZone", "UTC");
target = TargetObject("Moving", 0, 0, 0);
positions = [7000000, 0, 0; 7100000, 1000, 0];
target.Trajectory = cartesianTrajectory(epoch + seconds([0; 10]), positions);
verifyEqual(testCase, target.getPosition(epoch + seconds(10)), positions(2, :));
verifyEqual(testCase, target.getECEF(epoch + seconds(10)), positions(2, :));
verifyEqual(testCase, SensorObject.objectPositionECEF(target, epoch), positions(1, :));
verifyError(testCase, @() target.getPosition(epoch, "GCRF"), ...
    "TargetObject:UnsupportedFrame");
verifyError(testCase, @() target.getECEF(), "TargetObject:InvalidTime");
end

function testMovingTargetUsesGeodeticTrajectory(testCase)
epoch = datetime(2026, 1, 1, "TimeZone", "UTC");
target = TargetObject("Moving", 0, 0, 0);
target.Trajectory = table(epoch + seconds([0; 10]), [0; 80], [0; 90], [0; 100], ...
    'VariableNames', {'Time', 'LatitudeDeg', 'LongitudeDeg', 'AltitudeMeters'});
[x, y, z] = OrekitFrames.geodeticToECEF(80, 90, 100);
verifyEqual(testCase, target.getECEF(epoch + seconds(10)), [x, y, z], "AbsTol", 1e-8);
end

function testMovingSurfaceTargetLosAtEquatorAndHighLatitude(testCase)
for latitude = [0, 80]
    [x, y, z] = OrekitFrames.geodeticToECEF(latitude, 0, 0);
    surface = [x, y, z];
    satellitePosition = surface + 500000 * [cosd(latitude), 0, sind(latitude)];
    scenario = syntheticScenario(repmat(satellitePosition, 2, 1), 10, 10);
    target = TargetObject("Moving", 45, 90, 0);
    target.Trajectory = cartesianTrajectory(scenario.Config.getTimeVector(), ...
        [surface; -surface]);
    scenario = scenario.addObject(target);
    result = computeSensorAccess(scenario, "Sat", "Cam", "Moving", ...
        struct("SuppressNoAccessWarning", true));
    verifyEqual(testCase, result.ConstraintStatus.LineOfSightOK, [true; false]);
    verifyEqual(testCase, result.RangeKm(1), 500, "AbsTol", 1e-8);
    verifyEqual(testCase, result.AccessLogical, [true; false]);
end
end

function testRectangularFovRejectsRearHemisphere(testCase)
sensor = SensorObject.rectangular("Cam", "Sat", 10, 10);
verifyTrue(testCase, sensor.isInsideFieldOfView([0 0 1], [0 0 1]));
verifyFalse(testCase, sensor.isInsideFieldOfView([0 0 -1], [0 0 1]));
verifyFalse(testCase, sensor.isInsideFieldOfView([0.01 0 -1], [0 0 1]));
verifyFalse(testCase, sensor.isInsideFieldOfView([1 0 0], [0 0 1]));
corner = [tand(10), tand(10), 1];
expectedCone = acosd(1 / norm(corner));
verifyEqual(testCase, sensor.effectiveConeHalfAngleDeg(), expectedCone, "AbsTol", 1e-12);
verifyGreaterThan(testCase, expectedCone, 10);
end

function testRectangularAccessRejectsRearGroundTarget(testCase)
scenario = syntheticScenario(repmat([6878137, 0, 0], 2, 1), 10, 10);
satellite = scenario.getObject("Sat");
satellite = satellite.removeSensor("Cam");
sensor = SensorObject.rectangular("Cam", "Sat", 1, 1);
sensor.PointingMode = "FixedVector";
sensor.BoresightVector = [1 0 0];
satellite = satellite.addSensor(sensor);
scenario = scenario.updateObject(satellite);
scenario = scenario.addObject(TargetObject("Ground", 0, 0, 0));
result = computeSensorAccess(scenario, "Sat", "Cam", "Ground", ...
    struct("UseFieldOfRegard", false, "SuppressNoAccessWarning", true));
verifyTrue(testCase, all(result.ConstraintStatus.LineOfSightOK));
verifyFalse(testCase, any(result.AccessLogical));
end

function testCoverageConstantSignalsRespectPartialFinalInterval(testCase)
grid = CoverageGrid.regionGrid(-1, 1, -1, 1, 2);
for direction = [1, -1]
    scenario = syntheticScenario(repmat([direction * 42000000, 0, 0], 4, 1), 125, 60);
    result = computeCoverage(scenario, grid);
    if direction == 1
        verifyEqual(testCase, result.Points.TotalAccessMinutes, repmat(125 / 60, 4, 1));
        verifyEqual(testCase, result.Points.CoveragePercent, 100 * ones(4, 1));
        verifyEqual(testCase, result.Points.MaxGapMinutes, zeros(4, 1));
    else
        verifyEqual(testCase, result.Points.TotalAccessMinutes, zeros(4, 1));
        verifyEqual(testCase, result.Points.CoveragePercent, zeros(4, 1));
        verifyEqual(testCase, result.Points.MaxGapMinutes, repmat(125 / 60, 4, 1));
    end
end
end

function testCoverageTransitionUsesActualMidpoints(testCase)
positions = [42000000, 0, 0; 42000000, 0, 0; -42000000, 0, 0; -42000000, 0, 0];
scenario = syntheticScenario(positions, 125, 60);
result = computeCoverage(scenario, CoverageGrid.regionGrid(-1, 1, -1, 1, 2));
% Samples at 0,60,120,125: transition midpoint is 90, so access=90,gap=35 s.
verifyEqual(testCase, result.Points.TotalAccessMinutes, 1.5 * ones(4, 1));
verifyEqual(testCase, result.Points.CoveragePercent, 72 * ones(4, 1));
verifyEqual(testCase, result.Points.MaxGapMinutes, repmat(35 / 60, 4, 1));
verifyEqual(testCase, result.Points.MeanGapMinutes, repmat(35 / 60, 4, 1));
end

function testOutwardFootprintIsEmpty(testCase)
scenario = footprintScenario([1 0 0], 1);
footprint = computeSensorFootprint(scenario, "Sat", "Cam", scenario.Config.Epoch);
verifySize(testCase, footprint.EcefMeters, [0, 3]);
verifySize(testCase, footprint.LatitudeDeg, [0, 1]);
verifySize(testCase, footprint.LongitudeDeg, [0, 1]);
verifyFalse(testCase, footprint.HorizonLimited);
end

function testNadirAndPartiallyClippedFootprintsRespectBothConstraints(testCase)
for offNadir = [0, 60]
    axis = [-cosd(offNadir), sind(offNadir), 0];
    scenario = footprintScenario(axis, 20);
    footprint = computeSensorFootprint(scenario, "Sat", "Cam", scenario.Config.Epoch);
    verifyFalse(testCase, isempty(footprint.EcefMeters));
    verifyEqual(testCase, footprint.EcefMeters(1, :), footprint.EcefMeters(end, :), ...
        "AbsTol", 1e-7);
    points = footprint.EcefMeters;
    verifyEqual(testCase, vecnorm(points, 2, 2), ...
        6378137 * ones(size(points, 1), 1), "AbsTol", 1e-6);
    rays = points - [6878137, 0, 0];
    rays = rays ./ vecnorm(rays, 2, 2);
    verifyGreaterThanOrEqual(testCase, min(rays * axis.'), cosd(20) - 1e-12);
    verifyGreaterThanOrEqual(testCase, min(points * [6878137, 0, 0].' - 6378137^2), -1);
    verifyEqual(testCase, footprint.HorizonLimited, offNadir > 0);
end
end

function testFullFieldOfRegardReturnsEarthLimb(testCase)
scenario = footprintScenario([1 0 0], 1);
satellite = scenario.getObject("Sat");
sensor = satellite.getSensor("Cam");
sensor.FieldOfRegardDeg = 180;
satellite = satellite.removeSensor("Cam");
satellite = satellite.addSensor(sensor);
scenario = scenario.updateObject(satellite);
footprint = computeSensorFootprint(scenario, "Sat", "Cam", scenario.Config.Epoch, ...
    struct("UseFieldOfRegard", true));
verifyTrue(testCase, footprint.HorizonLimited);
verifySize(testCase, footprint.EcefMeters, [73, 3]);
centralAngle = acosd(footprint.EcefMeters(:, 1) / 6378137);
verifyEqual(testCase, centralAngle, repmat(acosd(6378137 / 6878137), 73, 1), ...
    "AbsTol", 2e-6);
end

function testDatelinePolygonUsesShortEdges(testCase)
area = AreaTargetObject("Dateline", [-1 -1 1 1], [179 -179 -179 179]);
verifyEqual(testCase, area.getCentroid(), [0, -180], "AbsTol", 1e-12);
verifyTrue(testCase, area.containsPoint(0, 180));
verifyTrue(testCase, area.containsPoint(0, -179.5));
verifyFalse(testCase, area.containsPoint(0, 0));
points = area.generateGrid(100);
verifyTrue(testCase, all(abs(points.LongitudeDeg) >= 179));
verifyTrue(testCase, all(area.containsPoint(points.LatitudeDeg, points.LongitudeDeg)));
verifyEqual(testCase, area.getAreaKm2(), 4 * 111^2, "AbsTol", 1e-8);
end

function testDatelineAccessUsesBoundaryInsteadOfPersistedCentroid(testCase)
scenario = syntheticScenario(repmat([-6878137, 0, 0], 2, 1), 10, 10);
area = AreaTargetObject("Dateline", [-1 -1 1 1], [179 -179 -179 179]);
% Old saved objects can contain the pre-fix arithmetic-mean longitude.
area.LatitudeDeg = 0;
area.LongitudeDeg = 0;
scenario = scenario.addObject(area);
result = computeSensorAccess(scenario, "Sat", "Cam", "Dateline", ...
    struct("SuppressNoAccessWarning", true));
verifyTrue(testCase, all(result.AccessLogical));
verifyEqual(testCase, result.ElevationDeg, 90 * ones(2, 1), "AbsTol", 1e-6);
end

function testCentroidIsInvariantToClosureAndVertexDensification(testCase)
first = AreaTargetObject("Open", [0 0 2 2], [10 12 12 10]);
second = AreaTargetObject("Closed", [0 0 0 2 2 0], [10 11 12 12 10 10]);
verifyEqual(testCase, first.getCentroid(), [1 11], "AbsTol", 1e-12);
verifyEqual(testCase, second.getCentroid(), first.getCentroid(), "AbsTol", 1e-12);
verifyError(testCase, @() AreaTargetObject("Winding", [80 80 80], [0 120 -120]), ...
    "AreaTargetObject:UnsupportedBoundary");
end

function testCoarseAreaGridRetainsAValidRegionPoint(testCase)
area = AreaTargetObject("Triangle", [0 1 2], [1 2 0]);
points = area.generateGrid(1000);
verifyEqual(testCase, height(points), 1);
verifyTrue(testCase, area.containsPoint(points.LatitudeDeg, points.LongitudeDeg));
end

function scenario = footprintScenario(axis, halfAngle)
scenario = syntheticScenario(repmat([6878137, 0, 0], 2, 1), 10, 10);
satellite = scenario.getObject("Sat");
satellite = satellite.removeSensor("Cam");
satellite = satellite.addSensor(SensorObject.fixedVector("Cam", "Sat", axis, halfAngle));
scenario = scenario.updateObject(satellite);
end

function scenario = syntheticScenario(positions, durationSeconds, stepSeconds)
% Prescribed ECEF samples isolate geometry from propagation and frame engines.
config = ScenarioConfig("Duration", seconds(durationSeconds), "TimeStep", seconds(stepSeconds));
scenario = MissionScenario(config);
times = config.getTimeVector();
satellite = SatelliteObject.fromKeplerian("Sat", 6878137, 0, 0, 0, 0, 0);
satellite.Ephemeris = table(times, positions(:, 1), positions(:, 2), positions(:, 3), ...
    'VariableNames', {'Time', 'ECEF_X_m', 'ECEF_Y_m', 'ECEF_Z_m'});
satellite.IsPropagated = true;
satellite = satellite.addSensor(SensorObject.simpleConic("Cam", "Sat", 20));
scenario = scenario.addObject(satellite);
end

function trajectory = cartesianTrajectory(times, positions)
trajectory = table(times, positions(:, 1), positions(:, 2), positions(:, 3), ...
    'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m'});
end
