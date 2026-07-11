function viz = exportSunViz(scenario)
%EXPORTSUNVIZ Serialize Orekit Sun geometry and lighting for the web UI.
%
% viz = exportSunViz(scenario)
%
% Builds the authoritative Sun data the web frontends render:
%   viz.sun.ephemeris       time-tagged Sun geometry on the scenario grid:
%       tOffsetSec          seconds past the scenario epoch
%       eciKm               Sun GCRF/ECI positions (km)
%       eciUnit             Sun GCRF/ECI unit direction
%       ecefUnit            Sun ITRF/ECEF unit direction (IERS 2010 frames)
%       subsolarLatDeg      geodetic latitude of the subsolar point (WGS84)
%       subsolarLonDeg      longitude of the subsolar point
%   viz.sun.eclipses        per propagated satellite: umbra/penumbra windows
%                           (conical shadow model, computeEclipse) and the
%                           sunlit fraction of the scenario
%   viz.sun.groundLighting  per ground point: daylight windows (geometric sun
%                           elevation above the horizon, computeSunElevation)
%   viz.earthOrientation    GCRF<->ITRF orientation on the same grid:
%       tOffsetSec          seconds past the scenario epoch
%       gmstRad             continuous (unwrapped) rotation angle of the
%                           prime meridian about the GCRF +Z axis, extracted
%                           from the full Orekit IERS-2010 ITRF->GCRF
%                           transform (v_gcrf ~ Rz(gmstRad) * v_ecef).
%
% Every value is computed with the same Orekit frames used elsewhere in the
% backend, so the UI never has to duplicate frame math: the browser only
% interpolates (and renormalizes) these samples.
%
% Pass the result to exportScenarioJson via "Extra" to merge it into the
% web-UI payload.

arguments
    scenario MissionScenario
end

epoch = scenario.Config.Epoch;
timeVector = scenario.Config.getTimeVector();
n = numel(timeVector);

sunGcrf = OrekitBodies.sunPositions(timeVector, "GCRF");
sunEcef = OrekitBodies.sunPositions(timeVector, "ECEF");

gcrfKm = [sunGcrf.X_m, sunGcrf.Y_m, sunGcrf.Z_m] / 1000;
ecefMeters = [sunEcef.X_m, sunEcef.Y_m, sunEcef.Z_m];
eciUnit = gcrfKm ./ vecnorm(gcrfKm, 2, 2);
ecefUnit = ecefMeters ./ vecnorm(ecefMeters, 2, 2);

% Geodetic subsolar point: the WGS84 surface point whose ellipsoid normal
% passes through the Sun, i.e. the geodetic coordinates of the Sun position.
earth = OrekitFrames.earthShape();
earthFrame = OrekitFrames.earthFrame();
subsolarLatDeg = zeros(n, 1);
subsolarLonDeg = zeros(n, 1);
gmstRad = zeros(n, 1);
for k = 1:n
    date = OrekitTime.toAbsoluteDate(timeVector(k));
    position = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
        ecefMeters(k, 1), ecefMeters(k, 2), ecefMeters(k, 3));
    geodetic = earth.transform(position, earthFrame, date);
    subsolarLatDeg(k) = rad2deg(geodetic.getLatitude());
    subsolarLonDeg(k) = rad2deg(geodetic.getLongitude());

    % Prime-meridian right ascension from the full ITRF->GCRF matrix. Polar
    % motion and nutation leave sub-microradian off-axis terms; the Z
    % rotation captures everything the display needs.
    rotation = OrekitFrameTransform.ecefToGcrfRotation(timeVector(k));
    gmstRad(k) = atan2(rotation(2, 1), rotation(1, 1));
end
gmstRad = unwrap(gmstRad);

sun = struct();
sun.ephemeris = struct( ...
    "tOffsetSec", round(seconds(timeVector - epoch), 3), ...
    "eciKm", round(gcrfKm, 0), ...
    "eciUnit", round(eciUnit, 8), ...
    "ecefUnit", round(ecefUnit, 8), ...
    "subsolarLatDeg", round(subsolarLatDeg, 4), ...
    "subsolarLonDeg", round(subsolarLonDeg, 4));

eclipses = {};
groundLighting = {};
for k = 1:numel(scenario.Objects)
    obj = scenario.Objects{k};
    switch string(obj.ObjectType)
        case "Satellite"
            if isempty(obj.Ephemeris)
                continue
            end
            result = computeEclipse(scenario, obj.Name);
            windows = {};
            w = result.EclipseWindows;
            for j = 1:height(w)
                windows{end + 1} = struct( ...
                    "type", string(w.Type(j)), ...
                    "startUtc", iso8601(w.StartTime(j)), ...
                    "stopUtc", iso8601(w.StopTime(j)), ...
                    "durationSeconds", w.DurationSeconds(j)); %#ok<AGROW>
            end
            eclipses{end + 1} = struct( ...
                "satellite", string(obj.Name), ...
                "sunlitFractionPercent", round(result.SunlitFractionPercent, 1), ...
                "windows", {windows}); %#ok<AGROW>
        case {"GroundStation", "Place", "Facility", "Target"}
            sunElevation = computeSunElevation(scenario, obj.Name);
            groundLighting{end + 1} = struct( ...
                "name", string(obj.Name), ...
                "daylightWindows", {logicalWindows(sunElevation.Time, ...
                    sunElevation.IsDaylight)}); %#ok<AGROW>
    end
end
sun.eclipses = eclipses;
sun.groundLighting = groundLighting;

viz = struct("sun", sun);
viz.earthOrientation = struct( ...
    "tOffsetSec", round(seconds(timeVector - epoch), 3), ...
    "gmstRad", round(gmstRad, 9));
end

function windows = logicalWindows(timeVector, flag)
flag = flag(:);
changes = diff([false; flag; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;
windows = {};
for k = 1:numel(starts)
    windows{end + 1} = struct( ...
        "startUtc", iso8601(timeVector(starts(k))), ...
        "stopUtc", iso8601(timeVector(stops(k))), ...
        "durationSeconds", seconds(timeVector(stops(k)) - timeVector(starts(k)))); %#ok<AGROW>
end
end

function text = iso8601(t)
t.TimeZone = "UTC";
text = string(t, "uuuu-MM-dd'T'HH:mm:ss.SSS'Z'");
end
