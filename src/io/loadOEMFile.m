function sat = loadOEMFile(filename, satelliteName)
%LOADOEMFILE Load a CCSDS OEM ephemeris file into an ephemeris satellite.
%
% sat = loadOEMFile("sat.oem")            % name from OBJECT_NAME
% sat = loadOEMFile("sat.oem", "MySat")   % override the name
%
% Reads the first segment of a GCRF/EME2000, UTC, km + km/s OEM file (the
% format written by exportOEM, STK, and GMAT). The returned SatelliteObject
% uses OrbitDefinitionType "Ephemeris": propagation resamples the loaded
% states onto the scenario time grid instead of running a propagator.

rawLines = strtrim(readlines(filename));
objectName = "OEM Satellite";
inData = false;
epochs = strings(0, 1);
states = zeros(0, 6);

for k = 1:numel(rawLines)
    line = rawLines(k);
    if strlength(line) == 0 || startsWith(line, "COMMENT")
        continue;
    end
    if startsWith(line, "OBJECT_NAME")
        objectName = strtrim(extractAfter(line, "="));
    elseif startsWith(line, "REF_FRAME")
        frame = upper(strtrim(extractAfter(line, "=")));
        if ~ismember(frame, ["GCRF", "EME2000", "J2000", "ICRF"])
            error("loadOEMFile:UnsupportedFrame", ...
                "OEM REF_FRAME '%s' is not supported (expected GCRF/EME2000).", frame);
        end
    elseif strcmp(line, "META_STOP")
        inData = true;
    elseif strcmp(line, "META_START") && ~isempty(epochs)
        break; % only the first segment is read
    end
    if inData && contains(line, "T") && ~startsWith(line, "META")
        fields = strsplit(line);
        if numel(fields) >= 7
            epochs(end + 1, 1) = string(fields{1}); %#ok<AGROW>
            states(end + 1, :) = str2double(fields(2:7)) * 1000.0; %#ok<AGROW>
        end
    end
end

if isempty(epochs)
    error("loadOEMFile:NoData", "No ephemeris lines were found in %s.", string(filename));
end

timeVector = datetime(epochs, "InputFormat", "uuuu-MM-dd'T'HH:mm:ss.SSS", ...
    "TimeZone", "UTC");
if any(isnat(timeVector))
    timeVector = datetime(epochs, "InputFormat", "uuuu-MM-dd'T'HH:mm:ss", ...
        "TimeZone", "UTC");
end

if nargin >= 2 && strlength(string(satelliteName)) > 0
    objectName = string(satelliteName);
end

sourceEphemeris = table(timeVector, states(:, 1), states(:, 2), states(:, 3), ...
    states(:, 4), states(:, 5), states(:, 6), ...
    'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m', 'VX_mps', 'VY_mps', 'VZ_mps'});
sat = SatelliteObject.fromEphemeris(objectName, sourceEphemeris);
end
