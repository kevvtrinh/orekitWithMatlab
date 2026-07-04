function elements = computeOrbitalElements(scenario, satelliteName)
%COMPUTEORBITALELEMENTS Osculating Keplerian element history from ephemeris.
%
% Computed in MATLAB from the stored GCRF position/velocity samples, so it
% works for every propagator type, including maneuvered trajectories.
% Angles are in degrees; distances follow the suite conventions
% (semi-major axis in meters, apogee/perigee altitude in km).

arguments
    scenario MissionScenario
    satelliteName
end

mu = 3.986004418e14;
earthRadiusM = 6378137.0;

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("computeOrbitalElements:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", string(satelliteName));
end

timeVector = sat.Ephemeris.Time;
r = [sat.Ephemeris.X_m, sat.Ephemeris.Y_m, sat.Ephemeris.Z_m];
v = [sat.Ephemeris.VX_mps, sat.Ephemeris.VY_mps, sat.Ephemeris.VZ_mps];

rNorm = sqrt(sum(r.^2, 2));
vNorm2 = sum(v.^2, 2);

h = cross(r, v, 2);
hNorm = sqrt(sum(h.^2, 2));
nodeVec = [-h(:, 2), h(:, 1), zeros(size(h, 1), 1)];
nodeNorm = sqrt(sum(nodeVec.^2, 2));

eVec = ((vNorm2 - mu ./ rNorm) .* r - sum(r .* v, 2) .* v) / mu;
ecc = sqrt(sum(eVec.^2, 2));

energy = vNorm2 / 2 - mu ./ rNorm;
sma = -mu ./ (2 * energy);

incDeg = acosd(max(min(h(:, 3) ./ hNorm, 1), -1));

raanDeg = acosd(max(min(nodeVec(:, 1) ./ max(nodeNorm, eps), 1), -1));
raanDeg(nodeVec(:, 2) < 0) = 360 - raanDeg(nodeVec(:, 2) < 0);
raanDeg(nodeNorm < 1e-8) = 0;

cosArgP = sum(nodeVec .* eVec, 2) ./ max(nodeNorm .* ecc, eps);
argPerigeeDeg = acosd(max(min(cosArgP, 1), -1));
argPerigeeDeg(eVec(:, 3) < 0) = 360 - argPerigeeDeg(eVec(:, 3) < 0);
argPerigeeDeg(ecc < 1e-8 | nodeNorm < 1e-8) = 0;

cosNu = sum(eVec .* r, 2) ./ max(ecc .* rNorm, eps);
trueAnomalyDeg = acosd(max(min(cosNu, 1), -1));
flyingAway = sum(r .* v, 2) < 0;
trueAnomalyDeg(flyingAway) = 360 - trueAnomalyDeg(flyingAway);
trueAnomalyDeg(ecc < 1e-8) = 0;

periodMinutes = 2 * pi * sqrt(max(sma, 0).^3 / mu) / 60.0;
apogeeAltKm = (sma .* (1 + ecc) - earthRadiusM) / 1000.0;
perigeeAltKm = (sma .* (1 - ecc) - earthRadiusM) / 1000.0;

elements = table(timeVector, sma, ecc, incDeg, raanDeg, argPerigeeDeg, ...
    trueAnomalyDeg, periodMinutes, apogeeAltKm, perigeeAltKm, ...
    'VariableNames', {'Time', 'SemiMajorAxisMeters', 'Eccentricity', ...
    'InclinationDeg', 'RAANDeg', 'ArgPerigeeDeg', 'TrueAnomalyDeg', ...
    'PeriodMinutes', 'ApogeeAltKm', 'PerigeeAltKm'});
end
