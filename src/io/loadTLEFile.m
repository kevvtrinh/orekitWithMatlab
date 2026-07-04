function satellites = loadTLEFile(filename, options)
%LOADTLEFILE Load a TLE catalog file into SatelliteObject instances.
%
% satellites = loadTLEFile("catalog.tle")
% satellites = loadTLEFile("catalog.tle", struct("NamePattern", "STARLINK", "MaxCount", 20))
%
% Supports both 3-line sets (name line followed by line 1/line 2) and bare
% 2-line sets (satellites are then named by catalog number). Returns a cell
% array of SatelliteObject with OrbitDefinitionType "TLE".
%
% Options:
%   NamePattern  Case-insensitive substring filter on the satellite name.
%   MaxCount     Stop after this many satellites.

arguments
    filename
    options struct = struct()
end

namePattern = "";
if isfield(options, "NamePattern") && ~isempty(options.NamePattern)
    namePattern = upper(string(options.NamePattern));
end
maxCount = Inf;
if isfield(options, "MaxCount") && ~isempty(options.MaxCount)
    maxCount = options.MaxCount;
end

rawLines = readlines(filename);
rawLines = strtrim(rawLines);
rawLines(strlength(rawLines) == 0) = [];

satellites = {};
pendingName = "";
k = 1;
while k <= numel(rawLines)
    line = rawLines(k);
    if startsWith(line, "1 ") && k < numel(rawLines) && startsWith(rawLines(k + 1), "2 ")
        line1 = line;
        line2 = rawLines(k + 1);
        if strlength(pendingName) > 0
            satName = pendingName;
        else
            satName = "SAT-" + strtrim(extractBetween(line1, 3, 7));
        end
        pendingName = "";
        k = k + 2;

        if strlength(namePattern) > 0 && ~contains(upper(satName), namePattern)
            continue;
        end
        satellites{end + 1} = SatelliteObject.fromTLE(satName, line1, line2); %#ok<AGROW>
        if numel(satellites) >= maxCount
            return;
        end
    else
        % Anything that is not an element line is treated as a name line.
        pendingName = string(line);
        if startsWith(pendingName, "0 ")
            pendingName = strtrim(extractAfter(pendingName, 2));
        end
        k = k + 1;
    end
end

if isempty(satellites)
    warning("loadTLEFile:NoSatellites", ...
        "No TLE sets matched in %s.", string(filename));
end
end
