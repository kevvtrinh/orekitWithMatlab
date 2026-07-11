function viz = exportPointingViz(scenario, schedule, options)
%EXPORTPOINTINGVIZ Time-tagged sensor pointing history for the web UI.
%
% viz = exportPointingViz(scenario, schedule)
%
% Samples every satellite sensor's actual boresight through the scenario so
% the browser can replay slews, point tracks, serpentine area scans, dwells,
% and return-home phases without re-deriving any scheduling or pointing
% math. All directions come from the same code paths the backend analyses
% use: resolveSensorPointing for task aim points (including the area-scan
% sweep) and SensorObject.getBoresightVector for home pointing (Nadir,
% VelocityVector, SunPointing with the Orekit sun, FixedVector).
%
% viz.pointing is a list with one entry per (platform, sensor):
%   platform, sensor      names
%   tOffsetSec            sample times, seconds past the scenario epoch;
%                         the scenario grid plus fine sampling across each
%                         task's slew/track/return span and the exact
%                         phase-boundary instants
%   boresightEcef         n-by-3 unit boresight direction, ITRF/ECEF
%   phase                 per sample: "idle" | "slew" | "track" | "scan" |
%                         "return"
%   targetName            aim target ("" while idle)
%   aimLatDeg, aimLonDeg  geodetic ground aim point while tracking or
%                         scanning (null/NaN otherwise)
%
% Phase timing matches the schedule the UI receives from exportScheduleViz:
% the slew lead-in ends at the entry's StartTime and lasts SlewTimeSeconds;
% the return-home slew starts at StopTime and lasts the entry's actual
% return slew (sensorReturnSlewSeconds). Slew interpolation is a spherical
% (great-circle) blend between the resolved endpoint directions.

arguments
    scenario MissionScenario
    schedule table = emptySensorScheduleTable("UTC")
    options.FinePhaseSamples (1, 1) double = 48
    options.MaxSamplesPerSensor (1, 1) double = 4000
end

scenario.SensorSchedule = schedule;
epoch = scenario.Config.Epoch;
baseGrid = scenario.Config.getTimeVector();
stopTime = scenario.Config.getStopTime();
earth = OrekitFrames.earthShape();
earthFrame = OrekitFrames.earthFrame();

pointing = {};
for k = 1:numel(scenario.Objects)
    parent = scenario.Objects{k};
    if parent.ObjectType ~= "Satellite" || isempty(parent.Sensors)
        continue
    end
    if isempty(parent.Ephemeris)
        continue % unpropagated: no positions to point from
    end
    for s = 1:numel(parent.Sensors)
        sensor = parent.Sensors{s};
        entries = sensorEntries(scenario, schedule, ...
            string(parent.Name), string(sensor.Name));
        times = sampleTimes(baseGrid, entries, epoch, stopTime, ...
            options.FinePhaseSamples, options.MaxSamplesPerSensor);
        pointing{end + 1} = sensorPointingSeries(scenario, parent, sensor, ...
            entries, times, epoch, earth, earthFrame); %#ok<AGROW>
    end
end

viz = struct();
viz.pointing = pointing;
end

% -------------------------------------------------------------------------

function entries = sensorEntries(scenario, schedule, platformName, sensorName)
% Scheduled rows for one sensor with precomputed phase boundaries, sorted.
entries = struct("StartTime", {}, "StopTime", {}, "SlewStart", {}, ...
    "ReturnEnd", {}, "TaskType", {}, "TargetName", {}, "Row", {});
if isempty(schedule) || height(schedule) == 0
    return
end
mask = strcmp(string(schedule.SensorName), sensorName);
if ismember("PlatformName", schedule.Properties.VariableNames)
    mask = mask & strcmp(string(schedule.PlatformName), platformName);
end
if ismember("Scheduled", schedule.Properties.VariableNames)
    mask = mask & schedule.Scheduled;
end
rows = schedule(mask, :);
if height(rows) == 0
    return
end
rows = sortrows(rows, "StartTime");
for k = 1:height(rows)
    row = rows(k, :);
    slewIn = 0;
    if ismember("SlewTimeSeconds", row.Properties.VariableNames) && ...
            isfinite(row.SlewTimeSeconds(1))
        slewIn = max(row.SlewTimeSeconds(1), 0);
    end
    returnSlew = sensorReturnSlewSeconds(scenario, row);
    entries(end + 1) = struct( ...
        "StartTime", row.StartTime(1), ...
        "StopTime", row.StopTime(1), ...
        "SlewStart", row.StartTime(1) - seconds(slewIn), ...
        "ReturnEnd", row.StopTime(1) + seconds(returnSlew), ...
        "TaskType", string(row.TaskType(1)), ...
        "TargetName", scheduleTargetName(row), ...
        "Row", row); %#ok<AGROW>
end
end

function name = scheduleTargetName(row)
name = "";
if ismember("AreaTargetName", row.Properties.VariableNames) && ...
        strlength(string(row.AreaTargetName(1))) > 0
    name = string(row.AreaTargetName(1));
elseif ismember("TargetName", row.Properties.VariableNames)
    name = string(row.TargetName(1));
end
end

function times = sampleTimes(baseGrid, entries, epoch, stopTime, fineCount, maxSamples)
% Scenario grid plus fine sampling across each task's active span and the
% exact phase boundaries, clamped to the scenario window.
times = baseGrid(:);
for k = 1:numel(entries)
    entry = entries(k);
    span = seconds(entry.ReturnEnd - entry.SlewStart);
    fine = max(1, min(seconds(mode(diff(baseGrid))), span / max(fineCount, 8)));
    times = [times; (entry.SlewStart:seconds(fine):entry.ReturnEnd).']; %#ok<AGROW>
    times = [times; entry.SlewStart; entry.StartTime; ...
        entry.StopTime; entry.ReturnEnd]; %#ok<AGROW>
end
times = times(times >= epoch & times <= stopTime);
times = unique(sort(times));
if numel(times) > maxSamples
    keep = round(linspace(1, numel(times), maxSamples)).';
    times = times(unique(keep));
end
end

function series = sensorPointingSeries(scenario, parent, sensor, entries, ...
        times, epoch, earth, earthFrame)
n = numel(times);
boresight = NaN(n, 3);
phase = repmat("idle", n, 1);
targetName = repmat("", n, 1);
aimLatDeg = NaN(n, 1);
aimLonDeg = NaN(n, 1);

% Aim ground points at each entry's acquisition and release instants; the
% slew phases blend toward/away from these fixed ground points.
aimAtStart = NaN(numel(entries), 3);
aimAtStop = NaN(numel(entries), 3);
for k = 1:numel(entries)
    aimAtStart(k, :) = resolvedAimPoint(scenario, parent, sensor, entries(k).StartTime);
    aimAtStop(k, :) = resolvedAimPoint(scenario, parent, sensor, entries(k).StopTime);
end

for i = 1:n
    t = times(i);
    satPos = SensorObject.objectPositionECEF(parent, t);
    home = sensor.getBoresightVector(t, scenario);
    dir = home;

    [state, entryIndex, progress] = phaseAt(entries, t);
    entry = [];
    if entryIndex > 0
        entry = entries(entryIndex);
    end
    switch state
        case "active"
            resolved = resolveSensorPointing(scenario, parent.Name, sensor.Name, t);
            if all(isfinite(resolved.BoresightEcef))
                dir = resolved.BoresightEcef;
                phase(i) = taskPhaseName(entry.TaskType);
                targetName(i) = entry.TargetName;
                if all(isfinite(resolved.AimEcefMeters))
                    [aimLatDeg(i), aimLonDeg(i)] = ecefToGeodetic(earth, ...
                        earthFrame, resolved.AimEcefMeters, t);
                end
            end
        case "slew"
            toDir = aimDirection(aimAtStart(entryIndex, :), satPos, home);
            fromDir = home;
            if entryIndex > 1
                previous = entries(entryIndex - 1);
                if entry.SlewStart <= previous.ReturnEnd
                    fromDir = aimDirection(aimAtStop(entryIndex - 1, :), satPos, home);
                end
            end
            dir = slerpUnit(fromDir, toDir, progress);
            phase(i) = "slew";
            targetName(i) = entry.TargetName;
        case "return"
            fromDir = aimDirection(aimAtStop(entryIndex, :), satPos, home);
            dir = slerpUnit(fromDir, home, progress);
            phase(i) = "return";
            targetName(i) = entry.TargetName;
    end
    boresight(i, :) = dir;
end

series = struct( ...
    "platform", string(parent.Name), ...
    "sensor", string(sensor.Name), ...
    "tOffsetSec", round(seconds(times - epoch), 3), ...
    "boresightEcef", round(boresight, 6), ...
    "phase", phase, ...
    "targetName", targetName, ...
    "aimLatDeg", round(aimLatDeg, 5), ...
    "aimLonDeg", round(aimLonDeg, 5));
end

function [state, entryIndex, progress] = phaseAt(entries, t)
% Same precedence the web UIs use: an active window wins, then the slew
% lead-in into the next window (which cuts a previous return short), then
% the previous window's return-home slew.
state = "idle";
entryIndex = 0;
progress = 0;
previousIndex = 0;
for k = 1:numel(entries)
    entry = entries(k);
    if t > entry.StopTime
        previousIndex = k;
        continue
    end
    if t >= entry.StartTime
        state = "active";
        entryIndex = k;
        progress = 1;
        return
    end
    if t >= entry.SlewStart
        span = seconds(entry.StartTime - entry.SlewStart);
        state = "slew";
        entryIndex = k;
        if span > 0
            progress = min(max(seconds(t - entry.SlewStart) / span, 0), 1);
        else
            progress = 1;
        end
        return
    end
    break
end
if previousIndex > 0 && t <= entries(previousIndex).ReturnEnd
    span = seconds(entries(previousIndex).ReturnEnd - entries(previousIndex).StopTime);
    state = "return";
    entryIndex = previousIndex;
    if span > 0
        progress = min(max(seconds(t - entries(previousIndex).StopTime) / span, 0), 1);
    else
        progress = 1;
    end
end
end

function name = taskPhaseName(taskType)
if contains(upper(taskType), "SCAN")
    name = "scan";
else
    name = "track";
end
end

function aim = resolvedAimPoint(scenario, parent, sensor, t)
resolved = resolveSensorPointing(scenario, parent.Name, sensor.Name, t);
aim = resolved.AimEcefMeters;
end

function dir = aimDirection(aimEcefMeters, satPosEcef, fallback)
if any(~isfinite(aimEcefMeters))
    dir = fallback;
    return
end
dir = aimEcefMeters - satPosEcef;
magnitude = norm(dir);
if magnitude < 1e-6
    dir = fallback;
else
    dir = dir / magnitude;
end
end

function v = slerpUnit(a, b, t)
a = a / max(norm(a), eps);
b = b / max(norm(b), eps);
d = max(min(dot(a, b), 1), -1);
angle = acos(d);
if sin(angle) < 1e-9
    % Parallel (blend directly) or antipodal (any great circle works; the
    % linear blend renormalized picks one deterministically).
    v = a + (b - a) * t;
    if norm(v) < 1e-9
        [~, idx] = min(abs(a));
        seed = zeros(1, 3);
        seed(idx) = 1;
        v = cross(a, seed);
    end
else
    v = (sin((1 - t) * angle) * a + sin(t * angle) * b) / sin(angle);
end
v = v / max(norm(v), eps);
end

function [latDeg, lonDeg] = ecefToGeodetic(earth, earthFrame, ecefMeters, time)
position = javaObject("org.hipparchus.geometry.euclidean.threed.Vector3D", ...
    ecefMeters(1), ecefMeters(2), ecefMeters(3));
date = OrekitTime.toAbsoluteDate(time);
geodetic = earth.transform(position, earthFrame, date);
latDeg = rad2deg(geodetic.getLatitude());
lonDeg = rad2deg(geodetic.getLongitude());
end
