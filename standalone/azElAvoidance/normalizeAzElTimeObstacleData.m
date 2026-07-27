function data = normalizeAzElTimeObstacleData(input)
%NORMALIZEAZELTIMEOBSTACLEDATA Validate canonical azElData orientation.
%
% azElData is created by calculateAreaTargetAzEl and always contains:
%   targetName, time_s, az_deg, el_deg, status

required = ["targetName", "time_s", "az_deg", "el_deg", "status"];
if ~isstruct(input) || ~isscalar(input) || ...
        ~all(isfield(input, cellstr(required)))
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
n = numel(time_s);
if n == 0 || any(diff(time_s) <= 0)
    error("normalizeAzElTimeObstacleData:InvalidTime", ...
        "time_s must be nonempty and strictly increasing.");
end
if ~iscell(input.az_deg) || ~iscell(input.el_deg) || ...
        numel(input.az_deg) ~= n || numel(input.el_deg) ~= n
    error("normalizeAzElTimeObstacleData:InvalidBoundary", ...
        "az_deg and el_deg must be cell arrays matching time_s.");
end

az_deg = reshape(input.az_deg, [], 1);
el_deg = reshape(input.el_deg, [], 1);
for k = 1:n
    validateattributes(az_deg{k}, {'numeric'}, {'vector', 'real'});
    validateattributes(el_deg{k}, {'numeric'}, {'vector', 'real'});
    if numel(az_deg{k}) ~= numel(el_deg{k})
        error("normalizeAzElTimeObstacleData:BoundarySizeMismatch", ...
            "az_deg and el_deg slice %d must have equal lengths.", k);
    end
    az_deg{k} = double(az_deg{k}(:));
    el_deg{k} = double(el_deg{k}(:));
end

status = string(input.status);
if isscalar(status)
    status = repmat(status, n, 1);
elseif numel(status) ~= n
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
