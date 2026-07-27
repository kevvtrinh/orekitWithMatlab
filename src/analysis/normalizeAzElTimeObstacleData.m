function [data, referenceTime] = normalizeAzElTimeObstacleData(input, options)
%NORMALIZEAZELTIMEOBSTACLEDATA Convert supported az/el structs to one schema.
%
% [data, referenceTime] = normalizeAzElTimeObstacleData(azElData)
%
% Supported compact input:
%   targetName  scalar text
%   time_s      numeric seconds from a common reference
%   az_deg      cell array of boundary azimuths
%   el_deg      cell array of boundary elevations
%   status      optional status text per sample
%
% The native computeAreaTargetAzElSweep output is also accepted. For compact
% input, the default reference is 1970-01-01 UTC, so numeric time_s values
% remain unchanged when passed to queryAzElTimeObstacle. Set
% options.ReferenceTime to attach the seconds to a mission epoch.

if nargin < 2
    options = struct();
end
defaults = struct( ...
    "ReferenceTime", [], ...
    "AzimuthLimitsDeg", [-180 180], ...
    "ElevationLimitsDeg", [0 90], ...
    "HomeAzElDeg", [0 90]);
options = applyDefaults(options, defaults);
if ~isstruct(input) || ~isscalar(input)
    error("normalizeAzElTimeObstacleData:InvalidInput", ...
        "azElData must be a scalar struct.");
end

nativeFields = ["Time", "AzimuthDeg", "ElevationDeg"];
compactFields = ["time_s", "az_deg", "el_deg"];
isNative = all(isfield(input, cellstr(nativeFields)));
isCompact = all(isfield(input, cellstr(compactFields)));
if ~isNative && ~isCompact
    error("normalizeAzElTimeObstacleData:InvalidInput", ...
        ["azElData must contain Time/AzimuthDeg/ElevationDeg or " ...
        "time_s/az_deg/el_deg."]);
end

if isempty(options.ReferenceTime)
    if isCompact && ~isNative
        referenceTime = datetime(1970, 1, 1, 0, 0, 0, ...
            "TimeZone", "UTC");
    else
        nativeTime = ensureUtc(input.Time(:));
        referenceTime = min(nativeTime);
    end
else
    referenceTime = ensureUtc(options.ReferenceTime);
    if ~isscalar(referenceTime) || isnat(referenceTime)
        error("normalizeAzElTimeObstacleData:InvalidReferenceTime", ...
            "ReferenceTime must be a finite datetime scalar.");
    end
end

data = input;
if isNative
    time = ensureUtc(input.Time(:));
    azimuth = input.AzimuthDeg;
    elevation = input.ElevationDeg;
else
    validateattributes(input.time_s, {'numeric'}, ...
        {'vector', 'real', 'finite'});
    timeSeconds = double(input.time_s(:));
    time = referenceTime + seconds(timeSeconds);
    azimuth = input.az_deg;
    elevation = input.el_deg;
end
n = numel(time);
if n == 0 || any(isnat(time)) || any(diff(time) <= seconds(0))
    error("normalizeAzElTimeObstacleData:InvalidTime", ...
        "The time vector must be nonempty, finite, and strictly increasing.");
end
if ~iscell(azimuth) || ~iscell(elevation) || ...
        numel(azimuth) ~= n || numel(elevation) ~= n
    error("normalizeAzElTimeObstacleData:InvalidBoundary", ...
        "Azimuth and elevation boundaries must be cells matching time.");
end
for k = 1:n
    validateattributes(azimuth{k}, {'numeric'}, {'vector', 'real'});
    validateattributes(elevation{k}, {'numeric'}, {'vector', 'real'});
    if numel(azimuth{k}) ~= numel(elevation{k})
        error("normalizeAzElTimeObstacleData:BoundarySizeMismatch", ...
            "Azimuth and elevation slice %d must have equal lengths.", k);
    end
end

data.TargetName = textField(input, ["TargetName", "targetName"], "Obstacle");
data.Time = time;
data.AzimuthDeg = reshape(azimuth, [], 1);
data.ElevationDeg = reshape(elevation, [], 1);
data.ElapsedSeconds = vectorField(input, ...
    ["ElapsedSeconds", "time_s"], n, seconds(time - time(1)));
data.Status = stringVectorField(input, ["Status", "status"], n, "visible");
data.CommandAzimuthDeg = vectorField(input, ...
    ["CommandAzimuthDeg", "commandAz_deg"], n, nan(n, 1));
data.CommandElevationDeg = vectorField(input, ...
    ["CommandElevationDeg", "commandEl_deg"], n, nan(n, 1));
data.AzimuthLimitsDeg = twoElementField(input, ...
    ["AzimuthLimitsDeg", "azimuthLimits_deg"], ...
    options.AzimuthLimitsDeg);
data.ElevationLimitsDeg = twoElementField(input, ...
    ["ElevationLimitsDeg", "elevationLimits_deg"], ...
    options.ElevationLimitsDeg);
data.HomeAzElDeg = twoElementField(input, ...
    ["HomeAzElDeg", "homeAzEl_deg"], options.HomeAzElDeg);
insideDefault = isfinite(data.CommandAzimuthDeg) & ...
    isfinite(data.CommandElevationDeg) & ...
    data.CommandAzimuthDeg >= data.AzimuthLimitsDeg(1) & ...
    data.CommandAzimuthDeg <= data.AzimuthLimitsDeg(2) & ...
    data.CommandElevationDeg >= data.ElevationLimitsDeg(1) & ...
    data.CommandElevationDeg <= data.ElevationLimitsDeg(2);
data.CommandInsidePositionLimits = logical(vectorField(input, ...
    "CommandInsidePositionLimits", n, insideDefault));
data.ParentName = textField(input, ["ParentName", "parentName"], "");
data.SensorName = textField(input, ["SensorName", "sensorName"], "");
data.AccessWindow = [time(1) time(end)];
end

function value = textField(input, names, fallback)
value = string(fallback);
for name = string(names)
    if isfield(input, name) && ~isempty(input.(name))
        candidate = string(input.(name));
        value = candidate(1);
        return;
    end
end
end

function value = vectorField(input, names, n, fallback)
value = fallback;
for name = string(names)
    if isfield(input, name) && ~isempty(input.(name))
        candidate = input.(name);
        if numel(candidate) ~= n
            error("normalizeAzElTimeObstacleData:FieldSizeMismatch", ...
                "%s must contain one value per time sample.", name);
        end
        value = double(candidate(:));
        return;
    end
end
value = reshape(value, [], 1);
end

function value = stringVectorField(input, names, n, fallback)
value = repmat(string(fallback), n, 1);
for name = string(names)
    if isfield(input, name) && ~isempty(input.(name))
        candidate = string(input.(name));
        if isscalar(candidate)
            candidate = repmat(candidate, n, 1);
        elseif numel(candidate) ~= n
            error("normalizeAzElTimeObstacleData:FieldSizeMismatch", ...
                "%s must contain one value per time sample.", name);
        end
        value = candidate(:);
        return;
    end
end
end

function value = twoElementField(input, names, fallback)
value = fallback;
for name = string(names)
    if isfield(input, name) && ~isempty(input.(name))
        value = input.(name);
        break;
    end
end
validateattributes(value, {'numeric'}, ...
    {'vector', 'numel', 2, 'real', 'finite'});
value = reshape(double(value), 1, 2);
end

function times = ensureUtc(times)
if ~isdatetime(times)
    error("normalizeAzElTimeObstacleData:InvalidTime", ...
        "Native Time and ReferenceTime values must be datetime.");
end
times.TimeZone = "UTC";
end

function output = applyDefaults(input, defaults)
output = input;
names = fieldnames(defaults);
for k = 1:numel(names)
    if ~isfield(output, names{k}) || isempty(output.(names{k}))
        output.(names{k}) = defaults.(names{k});
    end
end
end
