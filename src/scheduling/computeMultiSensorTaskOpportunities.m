function opportunities = computeMultiSensorTaskOpportunities(scenario, task, options)
%COMPUTEMULTISENSORTASKOPPORTUNITIES Combine N distinct sensor opportunities.
% Simultaneous members must satisfy dwell requirements within their common
% window. Asynchronous members keep their own occupied intervals in metadata.
% Area coverage uses the largest member estimate, a conservative union bound
% because distinct covered grid-point identities are not available here.
if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
opportunities = emptyTaskCandidateTable(scenario.Config.Epoch.TimeZone);
if ~options.AllowMultiSensorTasks
    return;
end
requiredSensorCount = taskField(task, "RequiredSensorCount", 2);
validateattributes(requiredSensorCount, {'numeric'}, ...
    {'real', 'scalar', 'finite', 'integer', 'positive'});
singleTask = task;
singleTask.RequiredSensorCount = 1;
singleTask.RequiresSimultaneousSensors = false;
taskType = upper(string(taskField(task, "TaskType", "")));
isArea = contains(taskType, "AREA") || taskType == "IMAGESTRIP";
singles = singleOpportunities(scenario, singleTask, options, isArea);
singles = singles(singles.Feasible, :);
if height(singles) < requiredSensorCount
    return;
end
requiresSimultaneous = taskField(task, "RequiresSimultaneousSensors", true);
indices = 1:requiredSensorCount;
while ~isempty(indices)
    members = singles(indices, :);
    identities = members(:, {'PlatformName', 'SensorName'});
    if height(unique(identities, "rows")) == requiredSensorCount
        if requiresSimultaneous
            members = commonWindowMembers(scenario, singleTask, members, options, isArea);
        end
        if height(members) == requiredSensorCount
            row = combineMembers(members, task, options, height(opportunities) + 1);
            opportunities = [opportunities; row]; %#ok<AGROW>
        end
    end
    % Enumerate lazily instead of allocating nchoosek(N,K) rows up front.
    indices = nextCombination(indices, height(singles));
end
end

function members = commonWindowMembers(scenario, singleTask, members, options, isArea)
% Re-run each member's public opportunity calculation inside the overlap.
% This keeps dwell, endpoint geometry, data, power and area estimates aligned.
startTime = max(members.StartTime);
stopTime = min(members.StopTime);
requiredDuration = max([taskField(singleTask, "RequiredDwellTimeSeconds", 0), ...
    taskField(singleTask, "MinDurationSeconds", 0), ...
    options.MinimumCandidateDurationSeconds, options.SimultaneousToleranceSeconds]);
if seconds(stopTime - startTime) <= 0 || seconds(stopTime - startTime) < requiredDuration
    members = members([], :);
    return;
end
for index = 1:height(members)
    clippedTask = singleTask;
    clippedTask.AssignedSensorName = members.SensorName(index);
    clippedTask.AssignedPlatformName = members.PlatformName(index);
    clippedTask.RequiredStartTime = startTime;
    clippedTask.RequiredStopTime = stopTime;
    clipped = singleOpportunities(scenario, clippedTask, options, isArea);
    valid = clipped.Feasible & clipped.StartTime == startTime & clipped.StopTime == stopTime;
    if sum(valid) ~= 1
        members = members([], :);
        return;
    end
    members(index, :) = clipped(valid, :);
end
end

function opportunities = singleOpportunities(scenario, task, options, isArea)
% Keep cooperative candidate generation on the same single-sensor APIs.
if isArea
    opportunities = computeAreaScanOpportunities(scenario, task, options);
else
    opportunities = computePointTargetTrackOpportunities(scenario, task, options);
end
end

function row = combineMembers(members, task, options, candidateIndex)
% Summaries describe the selected member intervals, not the original windows.
values = table2struct(members(1, :));
values.CandidateID = string(taskField(task, "TaskID", "")) + ...
    "-M" + compose("%03d", candidateIndex);
values.TaskType = string(taskField(task, "TaskType", "MultiSensorTrackPointTarget"));
values.SensorName = strjoin(members.SensorName, ",");
values.PlatformName = strjoin(members.PlatformName, ",");
values.StartTime = min(members.StartTime);
values.StopTime = max(members.StopTime);
values.DurationSeconds = seconds(values.StopTime - values.StartTime);
values.DwellTimeSeconds = min(members.DwellTimeSeconds);
values.SlewTimeSeconds = max(members.SlewTimeSeconds);
values.CoveragePercent = max(members.CoveragePercent);
values.CoveredGridPointCount = max(members.CoveredGridPointCount);
values.TotalGridPointCount = max(members.TotalGridPointCount);
values.MeanRangeKm = mean(members.MeanRangeKm, "omitnan");
values.MinRangeKm = min(members.MinRangeKm, [], "omitnan");
values.MaxElevationDeg = max(members.MaxElevationDeg, [], "omitnan");
values.MeanOffNadirDeg = mean(members.MeanOffNadirDeg, "omitnan");
values.MaxOffNadirDeg = max(members.MaxOffNadirDeg, [], "omitnan");
values.EstimatedSwathKm = max(members.EstimatedSwathKm, [], "omitnan");
values.QualityScore = mean(members.QualityScore, "omitnan");
values.DataVolumeMb = sum(members.DataVolumeMb);
values.PowerUsedWh = sum(members.PowerUsedWh);
values.ConflictGroup = values.SensorName;
values.RequiresSimultaneousSensors = taskField(task, "RequiresSimultaneousSensors", true);
values.RequiredSensorCount = height(members);
entries = jsondecode(members.SlewTransitionData(1));
for index = 2:height(members)
    entries(end + 1) = jsondecode(members.SlewTransitionData(index)); %#ok<AGROW>
end
values.SlewTransitionData = string(jsonencode(entries));
row = makeTaskCandidateRow(values, values.StartTime.TimeZone);
row.QualityScore(1) = scoreTaskCandidate(row, task, options);
end

function indices = nextCombination(indices, totalCount)
% Advance a fixed-size increasing index tuple in lexicographic order.
count = numel(indices);
index = count;
while index >= 1 && indices(index) == totalCount - count + index
    index = index - 1;
end
if index == 0
    indices = [];
    return;
end
indices(index) = indices(index) + 1;
for next = index + 1:count
    indices(next) = indices(next - 1) + 1;
end
end
