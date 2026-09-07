function tests = testInterchangeMathCorrectness
% Independent convention and state-reconstruction checks for the math audit.
tests = functiontests(localfunctions);
end

function setupOnce(~)
suiteRoot = fileparts(fileparts(fileparts(mfilename("fullpath"))));
addpath(suiteRoot);
startupOrekitSuite();
end

function testStkQuaternionMatchesPassiveAxisAngle(testCase)
axes = [eye(3); 1 2 3];
for axisIndex = 1:size(axes, 1)
    axis = axes(axisIndex, :) / norm(axes(axisIndex, :));
    crossMatrix = [0 -axis(3) axis(2); axis(3) 0 -axis(1); ...
        -axis(2) axis(1) 0];
    for angleDeg = [0 90 179.9 180 240]
        % Passive reference-to-body Rodrigues matrix; expected Shuster
        % quaternion follows its axis/angle definition, not our DCM decoder.
        rotation = cosd(angleDeg) * eye(3) + ...
            (1 - cosd(angleDeg)) * (axis.' * axis) - ...
            sind(angleDeg) * crossMatrix;
        expected = [axis * sind(angleDeg / 2), cosd(angleDeg / 2)];
        actual = rotationMatrixToStkQuaternion(rotation);
        verifyEqual(testCase, abs(dot(actual, expected)), 1, "AbsTol", 1e-12);
    end
end
end

function testStkPointingAndInvalidMatrices(testCase)
rotation = [0 0 -1; 0 1 0; 1 0 0];
quaternion = rotationMatrixToStkQuaternion(rotation);
verifyEqual(testCase, quaternion, [0 sqrt(0.5) 0 sqrt(0.5)], "AbsTol", 1e-12);
verifyError(testCase, @() rotationMatrixToStkQuaternion(diag([1 1 -1])), ...
    "rotationMatrixToStkQuaternion:InvalidRotation");
verifyError(testCase, @() rotationMatrixToStkQuaternion(2 * eye(3)), ...
    "rotationMatrixToStkQuaternion:InvalidRotation");
end

function testTaiOemPreservesInstantAndFractionalSeconds(testCase)
text = oemText("TAI", "GCRF", "EARTH");
[filename, cleanup] = temporaryOem(text); %#ok<ASGLU>
satellite = loadOEMFile(filename);
expected = datetime(2025, 12, 31, 23, 59, 23.125, "TimeZone", "UTC");
verifyEqual(testCase, seconds(satellite.SourceEphemeris.Time(1) - expected), ...
    0, "AbsTol", 1e-9);
verifyEqual(testCase, seconds(diff(satellite.SourceEphemeris.Time)), 60, ...
    "AbsTol", 1e-9);
verifyEqual(testCase, satellite.SourceEphemeris.X_m(1), 7000e3);
verifyEqual(testCase, ...
    satellite.SourceEphemeris.Properties.UserData.SourceMetadata.TIME_SYSTEM, "TAI");
end

function testOemAppliesEme2000BiasToPositionAndVelocity(testCase)
for frame = ["EME2000", "J2000"]
    [filename, cleanup] = temporaryOem(oemText("UTC", frame, "EARTH")); %#ok<ASGLU>
    satellite = loadOEMFile(filename);
    date = OrekitTime.toAbsoluteDate(satellite.SourceEphemeris.Time(1));
    sourceFrame = OrekitFrames.outputFrame("EME2000");
    transform = sourceFrame.getTransformTo(OrekitFrames.outputFrame("GCRF"), date);
    position = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
        7000e3, 1000e3, -500e3);
    velocity = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
        1000.0, 7000.0, 500.0);
    expectedPosition = transform.transformVector(position);
    expectedVelocity = transform.transformVector(velocity);
    expected = [expectedPosition.getX(), expectedPosition.getY(), ...
        expectedPosition.getZ(), expectedVelocity.getX(), ...
        expectedVelocity.getY(), expectedVelocity.getZ()];
    actual = satellite.SourceEphemeris{1, 2:7};
    verifyEqual(testCase, actual, expected, "AbsTol", 1e-9);
    verifyGreaterThan(testCase, norm(actual(1:3) - [7000e3 1000e3 -500e3]), 0.1);
end
end

function testOemRejectsUnknownOrMissingConventions(testCase)
cases = {oemText("TT", "GCRF", "EARTH"), "UnsupportedTimeSystem"; ...
    oemText("UTC", "ITRF", "EARTH"), "UnsupportedFrame"; ...
    oemText("UTC", "GCRF", "MARS"), "UnsupportedCenter"; ...
    oemText("UTC", "GCRF", ""), "MissingMetadata"};
for caseIndex = 1:size(cases, 1)
    [filename, cleanup] = temporaryOem(cases{caseIndex, 1}); %#ok<ASGLU>
    verifyError(testCase, @() loadOEMFile(filename), ...
        "loadOEMFile:" + cases{caseIndex, 2});
end
end

function testOemRejectsInvalidOrUnorderedStates(testCase)
text = oemText("UTC", "GCRF", "EARTH");
cases = {replace(text, "7000  1000", "NaN  1000"), "InvalidState"; ...
    replace(text, "00:01:00.125", "00:00:00.125"), "UnorderedEpochs"; ...
    replace(text, "2026-01-01", "2026-02-31"), "InvalidEpoch"};
for caseIndex = 1:size(cases, 1)
    [filename, cleanup] = temporaryOem(cases{caseIndex, 1}); %#ok<ASGLU>
    verifyError(testCase, @() loadOEMFile(filename), ...
        "loadOEMFile:" + cases{caseIndex, 2});
end
end

function testOemRejectsUnrepresentableLeapSecond(testCase)
text = replace(oemText("TAI", "GCRF", "EARTH"), ...
    "2026-01-01T00:00:00.125", "2017-01-01T00:00:36.125");
[filename, cleanup] = temporaryOem(text); %#ok<ASGLU>
verifyError(testCase, @() loadOEMFile(filename), ...
    "OrekitTime:UnrepresentableLeapSecond");
end

function testOrbitalElementsPreserveSingularAndRetrogradeStates(testCase)
for eccentricity = [0 0.1 1e-9]
    for inclinationDeg = [0 1e-7 50 130 180-1e-7 180]
        state = keplerianState(7000e3, eccentricity, inclinationDeg, 40, 60, 30);
        elements = elementsFromState(state);
        reconstructed = keplerianState(elements.SemiMajorAxisMeters, ...
            elements.Eccentricity, elements.InclinationDeg, elements.RAANDeg, ...
            elements.ArgPerigeeDeg, elements.TrueAnomalyDeg);
        verifyEqual(testCase, reconstructed(1:3), state(1:3), "AbsTol", 1e-6);
        verifyEqual(testCase, reconstructed(4:6), state(4:6), "AbsTol", 1e-8);
    end
end
end

function testCircularPhaseAndUnboundDiagnostics(testCase)
elements = elementsFromState(keplerianState(7000e3, 0, 0, 0, 0, 75));
verifyEqual(testCase, elements.TrueAnomalyDeg, 75, "AbsTol", 1e-10);
verifyEqual(testCase, elements.AngleConvention, "CircularEquatorial");
elements = elementsFromState(keplerianState(-14000e3, 1.5, 20, 0, 0, 30));
verifyEqual(testCase, elements.PeriodMinutes, Inf);
verifyEqual(testCase, elements.ApogeeAltKm, Inf);
verifyEqual(testCase, elements.PerigeeAltKm, (7000e3 - 6378137) / 1000, ...
    "AbsTol", 1e-8);
verifyError(testCase, @() elementsFromState([7000e3 0 0 1000 0 0]), ...
    "computeOrbitalElements:DegenerateState");
end

function text = oemText(timeSystem, frame, center)
text = ["CCSDS_OEM_VERS = 2.0"; "META_START"; "OBJECT_NAME = Test"; ...
    "CENTER_NAME = " + center; "REF_FRAME = " + frame; ...
    "TIME_SYSTEM = " + timeSystem; "META_STOP"; ...
    "2026-01-01T00:00:00.125 7000  1000 -500 1 7 0.5"; ...
    "2026-01-01T00:01:00.125 7001 1001 -501 1 7 0.5"];
end

function [filename, cleanup] = temporaryOem(text)
filename = string(tempname) + ".oem";
writelines(text, filename);
cleanup = onCleanup(@() delete(filename));
end

function elements = elementsFromState(state)
epoch = datetime(2026, 1, 1, "TimeZone", "UTC");
ephemeris = array2table(state, 'VariableNames', ...
    {'X_m', 'Y_m', 'Z_m', 'VX_mps', 'VY_mps', 'VZ_mps'});
ephemeris.Time = epoch;
satellite = SatelliteObject.fromEphemeris("Test", ephemeris);
satellite.Ephemeris = ephemeris;
scenario = MissionScenario(ScenarioConfig("Epoch", epoch));
scenario = scenario.addObject(satellite);
elements = computeOrbitalElements(scenario, "Test");
end

function state = keplerianState(a, e, inclination, raan, argument, anomaly)
% Direct perifocal conic formula provides an independent reconstruction.
parameter = a * (1 - e^2);
radius = parameter / (1 + e * cosd(anomaly));
position = radius * [cosd(anomaly); sind(anomaly); 0];
velocity = sqrt(3.986004418e14 / parameter) * ...
    [-sind(anomaly); e + cosd(anomaly); 0];
rotation = rotationZ(raan) * [1 0 0; 0 cosd(inclination) -sind(inclination); ...
    0 sind(inclination) cosd(inclination)] * rotationZ(argument);
state = [(rotation * position).', (rotation * velocity).'];
end

function rotation = rotationZ(angle)
rotation = [cosd(angle) -sind(angle) 0; sind(angle) cosd(angle) 0; 0 0 1];
end
