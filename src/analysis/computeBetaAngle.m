function betaTable = computeBetaAngle(scenario, satelliteName)
%COMPUTEBETAANGLE Solar beta angle history for a propagated satellite.
%
% Beta is the angle between the Sun vector and the orbit plane, positive
% when the Sun is on the orbit-normal side. Radial or numerically unresolved
% angular momentum has no orbit plane and raises DegenerateState.

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
validateattributes([r, v], {'numeric'}, {'real', 'finite', 'ncols', 6});

h = cross(r, v, 2);
hNorm = sqrt(sum(h.^2, 2));
rNorm = sqrt(sum(r.^2, 2));
vNorm = sqrt(sum(v.^2, 2));
% Match the element provider's scale-dependent angular-momentum threshold.
% Validate before min/max: MATLAB's default missing-value handling can turn
% an undefined direction (NaN) into a plausible +/-90 degree result.
if any(rNorm == 0) || any(~isfinite([rNorm; vNorm; hNorm])) || ...
        any(hNorm <= 64 * eps .* rNorm .* vNorm)
    error("computeBetaAngle:DegenerateState", ...
        "Solar beta angle requires nonzero position and resolved angular momentum.");
end

sunTable = OrekitBodies.sunPositions(timeVector, "GCRF");
sunPos = [sunTable.X_m, sunTable.Y_m, sunTable.Z_m];
sunNorm = sqrt(sum(sunPos.^2, 2));
if ~isreal(sunPos) || any(~isfinite(sunPos), "all") || ...
        any(~isfinite(sunNorm) | sunNorm == 0)
    error("computeBetaAngle:InvalidSunDirection", ...
        "Solar beta angle requires a finite, nonzero Sun direction.");
end

hUnit = h ./ hNorm;
sunUnit = sunPos ./ sunNorm;

betaDeg = asind(max(min(sum(hUnit .* sunUnit, 2), 1), -1));
betaTable = table(timeVector, betaDeg, ...
    'VariableNames', {'Time', 'BetaAngleDeg'});
end
