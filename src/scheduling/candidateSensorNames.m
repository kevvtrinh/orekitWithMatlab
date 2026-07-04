function names = candidateSensorNames(candidate)
%CANDIDATESENSORNAMES Return all sensor names represented by a candidate row.

if istable(candidate)
    value = candidate.SensorName(1);
else
    value = candidate.SensorName;
end
parts = split(string(value), ",");
names = strtrim(parts);
names = names(strlength(names) > 0);
end
