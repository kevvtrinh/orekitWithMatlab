function eclipseResult = computeEclipse(scenario, satelliteName)
%COMPUTEECLIPSE Umbra/penumbra intervals for a propagated satellite.
%
% Uses the conical Earth-shadow model: at each ephemeris step the apparent
% angular radii of the Sun and Earth are compared with their angular
% separation as seen from the satellite.
%
% eclipseResult fields:
%   SatelliteName, TimeVector
%   LightingState      string per step: "Sunlit" | "Penumbra" | "Umbra"
%   UmbraLogical       true when fully shadowed
%   ShadowLogical      true when in umbra or penumbra
%   EclipseWindows     table of shadow intervals with Type column
%   SunlitFractionPercent

arguments
    scenario MissionScenario
    satelliteName
end

sat = scenario.getObject(satelliteName);
if isempty(sat.Ephemeris)
    error("computeEclipse:NoEphemeris", ...
        "Satellite '%s' has not been propagated.", string(satelliteName));
end

sunRadiusM = 6.96e8;
earthRadiusM = 6378137.0;

timeVector = sat.Ephemeris.Time;
satPos = [sat.Ephemeris.X_m, sat.Ephemeris.Y_m, sat.Ephemeris.Z_m];
sunTable = OrekitBodies.sunPositions(timeVector, "GCRF");
sunPos = [sunTable.X_m, sunTable.Y_m, sunTable.Z_m];

satToSun = sunPos - satPos;
satToSunDist = sqrt(sum(satToSun.^2, 2));
satDist = sqrt(sum(satPos.^2, 2));

sunApparentRad = asin(min(sunRadiusM ./ satToSunDist, 1));
earthApparentRad = asin(min(earthRadiusM ./ satDist, 1));
cosSeparation = sum(satToSun .* (-satPos), 2) ./ (satToSunDist .* satDist);
separation = acos(max(min(cosSeparation, 1), -1));

umbra = separation < (earthApparentRad - sunApparentRad);
shadow = separation < (earthApparentRad + sunApparentRad);

lightingState = repmat("Sunlit", numel(timeVector), 1);
lightingState(shadow) = "Penumbra";
lightingState(umbra) = "Umbra";

eclipseResult = struct();
eclipseResult.SatelliteName = string(sat.Name);
eclipseResult.TimeVector = timeVector;
eclipseResult.LightingState = lightingState;
eclipseResult.UmbraLogical = umbra;
eclipseResult.ShadowLogical = shadow;
eclipseResult.EclipseWindows = [ ...
    shadowWindows(timeVector, umbra, sat.Name, "Umbra"); ...
    shadowWindows(timeVector, shadow & ~umbra, sat.Name, "Penumbra")];
eclipseResult.EclipseWindows = sortrows(eclipseResult.EclipseWindows, "StartTime");
eclipseResult.SunlitFractionPercent = 100.0 * sum(~shadow) / numel(shadow);
end

function windows = shadowWindows(timeVector, flag, satName, typeName)
flag = flag(:);
changes = diff([false; flag; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;

n = numel(starts);
satellite = repmat(string(satName), n, 1);
shadowType = repmat(string(typeName), n, 1);
startTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
stopTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
durationSeconds = zeros(n, 1);
for k = 1:n
    startTime(k) = timeVector(starts(k));
    stopTime(k) = timeVector(stops(k));
    durationSeconds(k) = seconds(stopTime(k) - startTime(k));
end
windows = table(satellite, shadowType, startTime, stopTime, durationSeconds, ...
    'VariableNames', {'Satellite', 'Type', 'StartTime', 'StopTime', 'DurationSeconds'});
end
