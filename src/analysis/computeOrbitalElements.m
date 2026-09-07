function elements = computeOrbitalElements(scenario, satelliteName)
%COMPUTEORBITALELEMENTS Osculating Keplerian element history from ephemeris.
%
% Computed in MATLAB from the stored GCRF position/velocity samples, so it
% works for every propagator type, including maneuvered trajectories.
% Angles are in degrees; distances follow the suite conventions
% (semi-major axis in meters, apogee/perigee altitude in km).
% Circular orbits use argument of latitude as TrueAnomalyDeg with
% ArgPerigeeDeg=0. Equatorial orbits use RAANDeg=0 and preserve the directed
% longitude of periapsis (or true longitude if circular). Retrograde angles
% increase about the orbit normal. AngleConvention identifies these cases.

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
validateattributes([r, v], {'numeric'}, {'real', 'finite', 'ncols', 6});

rNorm = sqrt(sum(r.^2, 2));
vNorm2 = sum(v.^2, 2);

h = cross(r, v, 2);
hNorm = sqrt(sum(h.^2, 2));
if any(rNorm == 0) || any(hNorm <= 64 * eps .* rNorm .* sqrt(vNorm2))
    error("computeOrbitalElements:DegenerateState", ...
        "Orbital elements require nonzero position and angular momentum.");
end
nodeVec = [-h(:, 2), h(:, 1), zeros(size(h, 1), 1)];
nodeNorm = sqrt(sum(nodeVec.^2, 2));

eVec = ((vNorm2 - mu ./ rNorm) .* r - sum(r .* v, 2) .* v) / mu;
ecc = sqrt(sum(eVec.^2, 2));

energy = vNorm2 / 2 - mu ./ rNorm;
sma = -mu ./ (2 * energy);

incDeg = atan2d(nodeNorm, h(:, 3));

% Dimensionless tolerances distinguish roundoff from resolved eccentricity
% and inclination. Unlike the old absolute node threshold, these do not
% depend on the orbit's radius or velocity units.
singularityTolerance = 1e-12;
isCircular = ecc <= singularityTolerance;
isEquatorial = nodeNorm ./ hNorm <= singularityTolerance;
raanDeg = mod(atan2d(nodeVec(:, 2), nodeVec(:, 1)), 360);
raanDeg(isEquatorial) = 0;
argPerigeeDeg = zeros(size(ecc));
trueAnomalyDeg = zeros(size(ecc));
angleConvention = repmat("Classical", size(ecc));
for sampleIndex = 1:numel(ecc)
    normal = h(sampleIndex, :) / hNorm(sampleIndex);
    if isEquatorial(sampleIndex)
        referenceAxis = [1 0 0];
        angleConvention(sampleIndex) = "Equatorial";
    else
        referenceAxis = nodeVec(sampleIndex, :) / nodeNorm(sampleIndex);
    end
    if isCircular(sampleIndex)
        periapsisAxis = referenceAxis;
        if isEquatorial(sampleIndex)
            angleConvention(sampleIndex) = "CircularEquatorial";
        else
            angleConvention(sampleIndex) = "CircularInclined";
        end
    else
        periapsisAxis = eVec(sampleIndex, :) / ecc(sampleIndex);
        argPerigeeDeg(sampleIndex) = directedAngle( ...
            referenceAxis, periapsisAxis, normal);
    end
    trueAnomalyDeg(sampleIndex) = directedAngle( ...
        periapsisAxis, r(sampleIndex, :) / rNorm(sampleIndex), normal);
end

periodMinutes = inf(size(sma));
isBound = energy < 0;
periodMinutes(isBound) = 2 * pi * sqrt(sma(isBound).^3 / mu) / 60.0;
apogeeAltKm = (sma .* (1 + ecc) - earthRadiusM) / 1000.0;
apogeeAltKm(~isBound) = Inf;
% The semilatus-rectum expression also remains finite for parabolic motion.
perigeeAltKm = (hNorm.^2 ./ (mu * (1 + ecc)) - earthRadiusM) / 1000.0;

elements = table(timeVector, sma, ecc, incDeg, raanDeg, argPerigeeDeg, ...
    trueAnomalyDeg, periodMinutes, apogeeAltKm, perigeeAltKm, ...
    'VariableNames', {'Time', 'SemiMajorAxisMeters', 'Eccentricity', ...
    'InclinationDeg', 'RAANDeg', 'ArgPerigeeDeg', 'TrueAnomalyDeg', ...
    'PeriodMinutes', 'ApogeeAltKm', 'PerigeeAltKm'});
elements.AngleConvention = angleConvention;
end

function angleDeg = directedAngle(first, second, normal)
% Signed angle about the orbit normal preserves prograde/retrograde phase.
angleDeg = mod(atan2d(dot(cross(first, second), normal), ...
    dot(first, second)), 360);
end
