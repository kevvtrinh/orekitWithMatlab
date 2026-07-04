function betaTable = computeBetaAngle(scenario, satelliteName)
%COMPUTEBETAANGLE Solar beta angle history for a propagated satellite.
%
% Beta is the angle between the Sun vector and the orbit plane, positive
% when the Sun is on the orbit-normal side.

arguments
    scenario MissionScenario
    satelliteName
end

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("computeBetaAngle:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", string(satelliteName));
end

timeVector = sat.Ephemeris.Time;
r = [sat.Ephemeris.X_m, sat.Ephemeris.Y_m, sat.Ephemeris.Z_m];
v = [sat.Ephemeris.VX_mps, sat.Ephemeris.VY_mps, sat.Ephemeris.VZ_mps];
sunTable = OrekitBodies.sunPositions(timeVector, "GCRF");
sunPos = [sunTable.X_m, sunTable.Y_m, sunTable.Z_m];

h = cross(r, v, 2);
hUnit = h ./ sqrt(sum(h.^2, 2));
sunUnit = sunPos ./ sqrt(sum(sunPos.^2, 2));

betaDeg = asind(max(min(sum(hUnit .* sunUnit, 2), 1), -1));
betaTable = table(timeVector, betaDeg, ...
    'VariableNames', {'Time', 'BetaAngleDeg'});
end
