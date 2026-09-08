function viz = exportAnalysisViz(scenario)
%EXPORTANALYSISVIZ Serialize satellite report histories for the web UI.
%
% viz.analysis.satellites contains one entry per propagated satellite:
%   satellite, frame (GCRF), tOffsetSec, orbitalElements, betaAngleDeg, errors
% Histories use each satellite's stored ephemeris grid, including imported
% and maneuvered states. They are not the satellite's insertion elements.
%
% Distances are km, angles are degrees, periods are minutes. Orbital angles
% follow computeOrbitalElements: circular orbits report argument of latitude
% in trueAnomalyDeg, equatorial orbits use raanDeg=0, and angleConvention
% identifies the applicable convention at every sample. Unbound period and
% apogee values remain Inf in MATLAB and become null through jsonencode.
%
% Numeric/string histories use cell vectors so jsonencode preserves arrays
% even with one sample. An unavailable report has empty data and an errors
% message; it does not prevent the other report or satellite from exporting.

arguments
    scenario MissionScenario
end

satellites = {};
for k = 1:numel(scenario.Objects)
    satellite = scenario.Objects{k};
    if string(satellite.ObjectType) ~= "Satellite" || isempty(satellite.Ephemeris)
        continue
    end

    entry = struct();
    entry.satellite = string(satellite.Name);
    entry.frame = "GCRF";
    entry.tOffsetSec = numericHistory(seconds( ...
        satellite.Ephemeris.Time - scenario.Config.Epoch));
    entry.orbitalElements = struct();
    entry.betaAngleDeg = {};
    entry.errors = struct();

    try
        elements = computeOrbitalElements(scenario, satellite.Name);
        orbit = struct();
        orbit.semiMajorAxisKm = numericHistory(elements.SemiMajorAxisMeters / 1000);
        orbit.eccentricity = numericHistory(elements.Eccentricity);
        orbit.inclinationDeg = numericHistory(elements.InclinationDeg);
        orbit.raanDeg = numericHistory(elements.RAANDeg);
        orbit.argPerigeeDeg = numericHistory(elements.ArgPerigeeDeg);
        orbit.trueAnomalyDeg = numericHistory(elements.TrueAnomalyDeg);
        orbit.periodMinutes = numericHistory(elements.PeriodMinutes);
        orbit.apogeeAltKm = numericHistory(elements.ApogeeAltKm);
        orbit.perigeeAltKm = numericHistory(elements.PerigeeAltKm);
        orbit.angleConvention = cellstr(elements.AngleConvention(:));
        entry.orbitalElements = orbit;
    catch reportError
        entry.errors.orbitalElements = string(reportError.message);
    end

    try
        beta = computeBetaAngle(scenario, satellite.Name);
        entry.betaAngleDeg = numericHistory(beta.BetaAngleDeg);
    catch reportError
        entry.errors.betaAngle = string(reportError.message);
    end
    satellites{end + 1} = entry; %#ok<AGROW>
end

viz = struct("analysis", struct("satellites", {satellites}));
end

function values = numericHistory(values)
% A cell vector encodes as a JSON array even when it contains one number.
values = num2cell(values(:));
end
