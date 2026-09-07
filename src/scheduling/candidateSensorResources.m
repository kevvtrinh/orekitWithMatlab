function resources = candidateSensorResources(candidate)
%CANDIDATESENSORRESOURCES Read per-platform sensor occupancy and endpoints.
% Legacy rows without SlewTransitionData retain their occupancy, but have
% unknown slew geometry. No nominal-pointing slew estimate is substituted.
if istable(candidate)
    hasData = ismember("SlewTransitionData", candidate.Properties.VariableNames);
else
    hasData = isfield(candidate, "SlewTransitionData");
end
if hasData
    serialized = string(candidate.SlewTransitionData);
    hasData = strlength(serialized(1)) > 0;
end
if hasData
    resources = jsondecode(char(serialized(1)));
    resources = resources(:);
else
    names = candidateSensorNames(candidate);
    platformValues = string(candidate.PlatformName);
    platforms = strtrim(split(platformValues(1), ","));
    if numel(platforms) == 1
        platforms = repmat(platforms, numel(names), 1);
    end
    if numel(platforms) ~= numel(names)
        error("candidateSensorResources:InvalidIdentity", ...
            "PlatformName must identify each sensor in SensorName.");
    end
    resources = repmat(struct("PlatformName", "", "SensorName", "", ...
        "StartTimeUnixSeconds", posixtime(candidate.StartTime(1)), ...
        "StopTimeUnixSeconds", posixtime(candidate.StopTime(1)), ...
        "HasSlewGeometry", false), numel(names), 1);
    for index = 1:numel(names)
        resources(index).PlatformName = platforms(index);
        resources(index).SensorName = names(index);
    end
end
for index = 1:numel(resources)
    entry = resources(index);
    validateattributes(entry.StartTimeUnixSeconds, {'numeric'}, {'real', 'scalar', 'finite'});
    validateattributes(entry.StopTimeUnixSeconds, {'numeric'}, {'real', 'scalar', 'finite'});
    if entry.StopTimeUnixSeconds < entry.StartTimeUnixSeconds
        error("candidateSensorResources:InvalidInterval", ...
            "Sensor occupancy stop time must not precede its start time.");
    end
    % Encoding the tuple prevents collisions from punctuation in names.
    resources(index).Key = string(jsonencode( ...
        [string(resources(index).PlatformName), string(resources(index).SensorName)]));
end
end
