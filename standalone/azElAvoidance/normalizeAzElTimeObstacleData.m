function data = normalizeAzElTimeObstacleData(input)
%% Section 0: Header & Readme
% SYNTAX
%   data = normalizeAzElTimeObstacleData(input)
%**************************************************************************
% PURPOSE
%   - Validate and column-normalize one canonical azElData record.
%**************************************************************************
% INPUTS
%   - input (scalar struct)
%       targetName, time_s, az_deg, el_deg, and status are required.
%       Nonfinite paired boundary rows are preserved as region separators.
%**************************************************************************
% OUTPUTS
%   - data (scalar struct)
%       Validated canonical obstacle record with stable field order.
%**************************************************************************
% UNITS
%   - az_deg and el_deg are degrees; time_s is seconds.

%% Section 1: Validate Structure & Sample Time
requiredFields = ["targetName", "time_s", "az_deg", "el_deg", "status"];
if ~isstruct(input) || ~isscalar(input) || ...
        ~all(isfield(input, cellstr(requiredFields)))
    error("normalizeAzElTimeObstacleData:InvalidInput", ...
        ["azElData must be a scalar calculateAreaTargetAzEl result with " ...
        "targetName, time_s, az_deg, el_deg, and status."]);
end

targetName = string(input.targetName);
if ~isscalar(targetName) || strlength(strtrim(targetName)) == 0
    error("normalizeAzElTimeObstacleData:InvalidTargetName", ...
        "targetName must be nonempty scalar text.");
end
validateattributes(input.time_s, {'numeric'}, ...
    {'vector', 'real', 'finite'});
time_s = double(input.time_s(:));
sampleCount = numel(time_s);
% Strict ordering is required because nearest-slice lookup and temporal
% padding both assume that adjacent row indices are adjacent in time.
if sampleCount == 0 || any(diff(time_s) <= 0)
    error("normalizeAzElTimeObstacleData:InvalidTime", ...
        "time_s must be nonempty and strictly increasing.");
end
%% Section 2: Validate Boundary Slices
if ~iscell(input.az_deg) || ~iscell(input.el_deg) || ...
        numel(input.az_deg) ~= sampleCount || ...
        numel(input.el_deg) ~= sampleCount
    error("normalizeAzElTimeObstacleData:InvalidBoundary", ...
        "az_deg and el_deg must be cell arrays matching time_s.");
end

az_deg = reshape(input.az_deg, [], 1);
el_deg = reshape(input.el_deg, [], 1);
% Column-oriented cell arrays give all downstream packers one predictable
% shape while allowing each time slice to contain a different vertex count.
for sampleIndex = 1:sampleCount
    validateattributes(az_deg{sampleIndex}, ...
        {'numeric'}, {'vector', 'real'});
    validateattributes(el_deg{sampleIndex}, ...
        {'numeric'}, {'vector', 'real'});
    if numel(az_deg{sampleIndex}) ~= numel(el_deg{sampleIndex})
        error("normalizeAzElTimeObstacleData:BoundarySizeMismatch", ...
            "az_deg and el_deg slice %d must have equal lengths.", ...
            sampleIndex);
    end
    az_deg{sampleIndex} = double(az_deg{sampleIndex}(:));
    el_deg{sampleIndex} = double(el_deg{sampleIndex}(:));
end

%% Section 3: Normalize Status & Assemble The Output
status = string(input.status);
% A scalar status is shorthand for a uniform history. Status is preserved
% rather than interpreted here because the obstacle-field builder owns the
% policy for which labels produce active obstacle geometry.
if isscalar(status)
    status = repmat(status, sampleCount, 1);
elseif numel(status) ~= sampleCount
    error("normalizeAzElTimeObstacleData:StatusSizeMismatch", ...
        "status must contain one value per time sample.");
else
    status = status(:);
end

data = struct( ...
    "targetName", targetName, ...
    "time_s", time_s, ...
    "az_deg", {az_deg}, ...
    "el_deg", {el_deg}, ...
    "status", status);
end
