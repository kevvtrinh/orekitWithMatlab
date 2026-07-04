function windows = buildContactPlan(timeVector, accessLogical, elevationDeg, rangeKm, sourceName, targetName)
%BUILDCONTACTPLAN Convert access logical samples into an access window table.

timeVector = timeVector(:);
accessLogical = accessLogical(:);
elevationDeg = elevationDeg(:);
rangeKm = rangeKm(:);

if isempty(timeVector) || ~any(accessLogical)
    windows = emptyAccessWindowTable();
    return;
end

changes = diff([false; accessLogical; false]);
starts = find(changes == 1);
stops = find(changes == -1) - 1;

n = numel(starts);
source = strings(n, 1);
target = strings(n, 1);
startTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
stopTime = NaT(n, 1, "TimeZone", timeVector.TimeZone);
durationSeconds = zeros(n, 1);
maxElevationDeg = nan(n, 1);
minRangeKm = nan(n, 1);
accessType = strings(n, 1);

for k = 1:n
    idx = starts(k):stops(k);
    source(k) = string(sourceName);
    target(k) = string(targetName);
    startTime(k) = timeVector(starts(k));
    stopTime(k) = timeVector(stops(k));
    durationSeconds(k) = seconds(stopTime(k) - startTime(k));
    maxElevationDeg(k) = max(elevationDeg(idx), [], "omitnan");
    minRangeKm(k) = min(rangeKm(idx), [], "omitnan");
    accessType(k) = "Elevation";
end

windows = table(source, target, startTime, stopTime, durationSeconds, ...
    maxElevationDeg, minRangeKm, accessType, ...
    'VariableNames', {'Source', 'Target', 'StartTime', 'StopTime', ...
    'DurationSeconds', 'MaxElevationDeg', 'MinRangeKm', 'AccessType'});
end

function windows = emptyAccessWindowTable()
windows = table(strings(0, 1), strings(0, 1), NaT(0, 1, "TimeZone", "UTC"), ...
    NaT(0, 1, "TimeZone", "UTC"), zeros(0, 1), nan(0, 1), nan(0, 1), strings(0, 1), ...
    'VariableNames', {'Source', 'Target', 'StartTime', 'StopTime', ...
    'DurationSeconds', 'MaxElevationDeg', 'MinRangeKm', 'AccessType'});
end
