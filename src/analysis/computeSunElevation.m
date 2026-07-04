function sunTable = computeSunElevation(scenario, objectName)
%COMPUTESUNELEVATION Sun azimuth/elevation history at a ground object.
%
% Works for any object exposing LatitudeDeg/LongitudeDeg (ground stations,
% places, facilities, targets). IsDaylight is true when the geometric sun
% elevation is above the horizon.

arguments
    scenario MissionScenario
    objectName
end

groundObject = scenario.getObject(objectName);
if ~isprop(groundObject, "LatitudeDeg") || ~isprop(groundObject, "LongitudeDeg")
    error("computeSunElevation:NotAGroundObject", ...
        "Object '%s' does not have geodetic coordinates.", string(objectName));
end
altitudeMeters = 0;
if isprop(groundObject, "AltitudeMeters")
    altitudeMeters = groundObject.AltitudeMeters;
end

timeVector = scenario.Config.getTimeVector();
sunEcef = OrekitBodies.sunPositions(timeVector, "ECEF");
[azDeg, elDeg] = enuAzElRange(groundObject.LatitudeDeg, ...
    groundObject.LongitudeDeg, altitudeMeters, ...
    [sunEcef.X_m, sunEcef.Y_m, sunEcef.Z_m]);

sunTable = table(timeVector, azDeg, elDeg, elDeg > 0, ...
    'VariableNames', {'Time', 'SunAzimuthDeg', 'SunElevationDeg', 'IsDaylight'});
end
