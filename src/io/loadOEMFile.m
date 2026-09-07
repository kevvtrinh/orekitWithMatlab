function sat = loadOEMFile(filename, satelliteName)
%LOADOEMFILE Load the first Earth-centered CCSDS OEM state segment.
%
% sat = loadOEMFile("sat.oem")            % name from OBJECT_NAME
% sat = loadOEMFile("sat.oem", "MySat")   % override the name
%
% Input states use km and km/s in GCRF/ICRF or EME2000/J2000 axes, with
% TIME_SYSTEM UTC or TAI. Output states use GCRF, UTC datetime, m and m/s.
% CENTER_NAME, REF_FRAME, and TIME_SYSTEM are required. Other centers,
% frames and time systems are rejected; they are never inferred. Only the
% first state segment is read; optional acceleration/covariance is not used.
% Orekit supplies TAI conversion and EME2000 frame bias. UTC leap-second
% instants are rejected because MATLAB UTC datetime cannot represent them.

rawLines = strtrim(readlines(filename));
metadata = struct("OBJECT_NAME", "OEM Satellite", ...
    "CENTER_NAME", "", "REF_FRAME", "", "TIME_SYSTEM", "");
inMetadata = false;
inData = false;
epochs = strings(0, 1);
states = zeros(0, 6);

for lineIndex = 1:numel(rawLines)
    line = rawLines(lineIndex);
    if strlength(line) == 0 || startsWith(line, "COMMENT")
        continue;
    end
    if line == "META_START"
        if inData
            break;
        end
        inMetadata = true;
        continue;
    end
    if line == "META_STOP"
        validateMetadata(metadata);
        inMetadata = false;
        inData = true;
        continue;
    end
    if line == "COVARIANCE_START"
        break;
    end
    if inMetadata
        separatorIndex = strfind(line, "=");
        if ~isempty(separatorIndex)
            name = strtrim(extractBefore(line, separatorIndex(1)));
            if isfield(metadata, name)
                metadata.(name) = strtrim(extractAfter(line, separatorIndex(1)));
            end
        end
    elseif inData
        fields = split(regexprep(line, "\s+", " "));
        if numel(fields) < 7
            error("loadOEMFile:InvalidState", ...
                "OEM line %d requires an epoch and six state components.", lineIndex);
        end
        values = str2double(fields(2:7)).';
        if any(~isfinite(values))
            error("loadOEMFile:InvalidState", ...
                "OEM line %d contains a nonfinite or invalid state.", lineIndex);
        end
        epochs(end + 1, 1) = fields(1); %#ok<AGROW>
        states(end + 1, :) = values * 1000; %#ok<AGROW>
    end
end
if isempty(epochs)
    error("loadOEMFile:NoData", ...
        "No ephemeris states were found in %s.", string(filename));
end

timeVector = parseEpochs(epochs, upper(metadata.TIME_SYSTEM));
if any(diff(timeVector) <= seconds(0))
    error("loadOEMFile:UnorderedEpochs", ...
        "OEM state epochs must be unique and strictly increasing.");
end
states = OrekitFrameTransform.inertialStateToGcrf( ...
    timeVector, states, metadata.REF_FRAME);
objectName = metadata.OBJECT_NAME;
if nargin >= 2 && strlength(string(satelliteName)) > 0
    objectName = string(satelliteName);
end
sourceEphemeris = table(timeVector, states(:, 1), states(:, 2), states(:, 3), ...
    states(:, 4), states(:, 5), states(:, 6), ...
    'VariableNames', {'Time', 'X_m', 'Y_m', 'Z_m', 'VX_mps', 'VY_mps', 'VZ_mps'});
sourceEphemeris.Properties.UserData = struct( ...
    "SourceFile", string(filename), "SourceMetadata", metadata, ...
    "Frame", "GCRF", "TimeSystem", "UTC");
sat = SatelliteObject.fromEphemeris(objectName, sourceEphemeris);
end

function validateMetadata(metadata)
% Missing and unsupported metadata must not be silently relabeled.
required = ["CENTER_NAME", "REF_FRAME", "TIME_SYSTEM"];
for name = required
    if strlength(metadata.(name)) == 0
        error("loadOEMFile:MissingMetadata", "OEM requires %s.", name);
    end
end
if upper(metadata.CENTER_NAME) ~= "EARTH"
    error("loadOEMFile:UnsupportedCenter", ...
        "OEM CENTER_NAME '%s' is unsupported; expected EARTH.", metadata.CENTER_NAME);
end
if ~any(upper(metadata.REF_FRAME) == ["GCRF", "EME2000", "J2000", "ICRF"])
    error("loadOEMFile:UnsupportedFrame", ...
        "OEM REF_FRAME '%s' is unsupported.", metadata.REF_FRAME);
end
if ~any(upper(metadata.TIME_SYSTEM) == ["UTC", "TAI"])
    error("loadOEMFile:UnsupportedTimeSystem", ...
        "OEM TIME_SYSTEM '%s' is unsupported; expected UTC or TAI.", ...
        metadata.TIME_SYSTEM);
end
end

function times = parseEpochs(epochs, timeSystem)
% Preserve each instant during conversion, including fractional seconds.
times = NaT(numel(epochs), 1, "TimeZone", "UTC");
if timeSystem == "TAI"
    OrekitInitializer.initialize();
    timeScale = javaMethod("getTAI", "org.orekit.time.TimeScalesFactory");
end
for sampleIndex = 1:numel(epochs)
    if timeSystem == "TAI"
        date = javaObject("org.orekit.time.AbsoluteDate", ...
            char(epochs(sampleIndex)), timeScale);
        times(sampleIndex) = OrekitTime.fromAbsoluteDate(date);
        continue;
    end
    tokens = regexp(char(epochs(sampleIndex)), ...
        '^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)Z?$', ...
        'tokens', 'once');
    if isempty(tokens)
        error("loadOEMFile:InvalidEpoch", ...
            "OEM epoch '%s' must use YYYY-MM-DDThh:mm:ss[.fraction].", epochs(sampleIndex));
    end
    components = str2double(tokens);
    if components(6) >= 60
        error("OrekitTime:UnrepresentableLeapSecond", ...
            "MATLAB UTC datetime cannot represent a leap-second instant.");
    end
    if components(2) < 1 || components(2) > 12 || components(3) < 1 || ...
            components(3) > eomday(components(1), components(2)) || ...
            components(4) > 23 || components(5) > 59
        error("loadOEMFile:InvalidEpoch", ...
            "Invalid OEM calendar epoch '%s'.", epochs(sampleIndex));
    end
    times(sampleIndex) = datetime(components, "TimeZone", "UTC");
end
end
