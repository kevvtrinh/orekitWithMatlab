function names = candidateSensorNames(candidate)
%CANDIDATESENSORNAMES Return all sensor names represented by a candidate row.

values = string(candidate.SensorName);
parts = split(values(1), ",");
names = strtrim(parts);
names = names(strlength(names) > 0);
end
