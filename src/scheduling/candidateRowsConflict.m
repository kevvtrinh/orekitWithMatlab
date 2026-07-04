function [tf, conflictType, overlapSeconds, requiredSlewSeconds, availableSlewSeconds] = ...
        candidateRowsConflict(candidateA, candidateB, options)
%CANDIDATEROWSCONFLICT True when two candidate rows cannot both be scheduled.

if nargin < 3
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
tf = false;
conflictType = "";
overlapSeconds = 0;
requiredSlewSeconds = 0;
availableSlewSeconds = Inf;

sensorsA = candidateSensorNames(candidateA);
sensorsB = candidateSensorNames(candidateB);
sharedSensors = intersect(sensorsA, sensorsB);
if isempty(sharedSensors)
    return;
end

startA = candidateA.StartTime(1);
stopA = candidateA.StopTime(1);
startB = candidateB.StartTime(1);
stopB = candidateB.StopTime(1);

overlapSeconds = max(0, seconds(min(stopA, stopB) - max(startA, startB)));
if options.EnforceOneTaskPerSensor && overlapSeconds > 0
    tf = true;
    conflictType = "SameSensorOverlap";
    availableSlewSeconds = 0;
    return;
end

if options.EnforceSlew
    if stopA <= startB
        availableSlewSeconds = seconds(startB - stopA);
    elseif stopB <= startA
        availableSlewSeconds = seconds(startA - stopB);
    else
        availableSlewSeconds = 0;
    end
    requiredSlewSeconds = max(candidateA.SlewTimeSeconds(1), candidateB.SlewTimeSeconds(1));
    if availableSlewSeconds >= 0 && availableSlewSeconds < requiredSlewSeconds
        tf = true;
        conflictType = "InsufficientSlewTime";
    end
end
end
