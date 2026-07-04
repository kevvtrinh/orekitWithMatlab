function handles = plotScheduledSensorTask(scenario, schedule, taskID, options)
%PLOTSCHEDULEDSENSORTASK Visualize one scheduled task in sensor viewer mode.

if nargin < 4 || isempty(options)
    options = SensorViewerOptions();
end
if isempty(schedule) || height(schedule) == 0
    error("plotScheduledSensorTask:EmptySchedule", "Schedule is empty.");
end
idx = find(schedule.TaskID == string(taskID) | schedule.CandidateID == string(taskID), 1);
if isempty(idx)
    error("plotScheduledSensorTask:TaskNotFound", ...
        "Task or candidate '%s' was not found in the schedule.", string(taskID));
end
row = schedule(idx, :);
platforms = split(string(row.PlatformName(1)), ",");
sensors = split(string(row.SensorName(1)), ",");
targetName = row.TargetName(1);
if strlength(targetName) == 0
    targetName = row.AreaTargetName(1);
end

options.SelectedSensorName = strtrim(sensors(1));
handles = plotSatelliteSensorViewer(scenario, strtrim(platforms(1)), options);
ax = handles.Axes;

try
    platform = scenario.getObject(strtrim(platforms(1)));
    target = scenario.getObject(targetName);
    if isa(platform, "SatelliteObject") && platform.IsPropagated
        time = row.StartTime(1);
        platformPos = platform.getECEF(time);
        targetPos = SensorObject.objectPositionECEF(target, time);
        look = SensorObject.unitVector(targetPos - platformPos);
        p = platform.getSensor(strtrim(sensors(1))).MountLocationBody;
        q = p + look * options.BoresightLength;
        hold(ax, "on");
        handles.TargetLine = plot3(ax, [p(1) q(1)], [p(2) q(2)], [p(3) q(3)], ...
            "Color", [0.95 0.55 0.10], "LineWidth", 1.8, "LineStyle", "-.");
        hold(ax, "off");
    end
catch
    % The viewer is body-frame MVP; target line is best effort until attitude support exists.
end
end
