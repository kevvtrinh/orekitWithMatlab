function conflicts = detectTaskConflicts(candidates, options)
%DETECTTASKCONFLICTS Detect conflicts among task candidate windows.

if nargin < 2
    options = SchedulerOptions();
end
options = normalizeSchedulerOptions(options);
conflicts = emptyTaskConflictTable();
if isempty(candidates) || height(candidates) < 2
    return;
end

conflictCount = 0;
for a = 1:height(candidates)
    for b = a + 1:height(candidates)
        [hasConflict, conflictType, overlapSeconds, requiredSlewSeconds, availableSlewSeconds] = ...
            candidateRowsConflict(candidates(a, :), candidates(b, :), options);
        if ~hasConflict
            continue;
        end
        conflictCount = conflictCount + 1;
        shared = intersect(candidateSensorNames(candidates(a, :)), candidateSensorNames(candidates(b, :)));
        if isempty(shared)
            sensorName = "";
        else
            sensorName = strjoin(shared, ",");
        end
        explanation = sprintf("%s between %s and %s.", ...
            conflictType, candidates.CandidateID(a), candidates.CandidateID(b));
        row = table("CONFLICT-" + compose("%03d", conflictCount), ...
            candidates.CandidateID(a), candidates.CandidateID(b), string(conflictType), ...
            string(sensorName), overlapSeconds, requiredSlewSeconds, availableSlewSeconds, ...
            string(explanation), ...
            'VariableNames', {'ConflictID', 'CandidateID_1', 'CandidateID_2', ...
            'ConflictType', 'SensorName', 'OverlapSeconds', 'RequiredSlewSeconds', ...
            'AvailableSlewSeconds', 'Explanation'});
        conflicts = [conflicts; row]; %#ok<AGROW>
    end
end
end
