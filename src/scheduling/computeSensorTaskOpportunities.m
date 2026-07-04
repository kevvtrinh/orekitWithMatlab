function opportunities = computeSensorTaskOpportunities(scenario, task, options)
%COMPUTESENSORTASKOPPORTUNITIES Convert one task request into candidates.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
taskType = string(taskField(task, "TaskType", "TrackPointTarget"));

switch upper(taskType)
    case {"SCANAREATARGET", "REVISITAREATARGET", "SEARCHAREA", "IMAGESTRIP"}
        opportunities = computeAreaScanOpportunities(scenario, task, options);
    case {"MULTISENSORTRACKPOINTTARGET", "STEREOOBSERVEPOINTTARGET", "MULTISENSORSCANAREATARGET"}
        opportunities = computeMultiSensorTaskOpportunities(scenario, task, options);
    otherwise
        opportunities = computePointTargetTrackOpportunities(scenario, task, options);
end
end
