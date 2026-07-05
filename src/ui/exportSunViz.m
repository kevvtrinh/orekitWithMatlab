function viz = exportSunViz(scenario)
%EXPORTSUNVIZ Serialize Orekit Sun geometry and lighting for the web UI.
%
% viz = exportSunViz(scenario)
%
% Builds the authoritative Sun data the apps/orbit-ui frontend renders:
%   viz.sun.ephemeris      Sun GCRF/ECI positions (km) sampled on the
%                          scenario time grid, as epoch offsets
%   viz.sun.eclipses       per propagated satellite: umbra/penumbra windows
%                          (conical shadow model, computeEclipse) and the
%                          sunlit fraction of the scenario
%   viz.sun.groundLighting per ground point: daylight windows (geometric sun
%                          elevation above the horizon, computeSunElevation)
%
% Pass the result to exportScenarioJson via "Extra" to merge it into the
% web-UI payload.

arguments
    scenario MissionScenario
end

epoch = scenario.Config.Epoch;
timeVector = scenario.Config.getTimeVector();
sunTable = OrekitBodies.sunPositions(timeVector, "GCRF");

sun = struct();
sun.ephemeris = struct( ...
    "tOffsetSec", round(seconds(timeVector - epoch), 3), ...
    "eciKm", round([sunTable.X_m, sunTable.Y_m, sunTable.Z_m] / 1000, 0));

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
