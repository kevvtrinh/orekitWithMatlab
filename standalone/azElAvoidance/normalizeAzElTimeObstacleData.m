function azElData = normalizeAzElTimeObstacleData(inputData)
%% Section 0: Header & Readme
% SYNTAX
%   azElData = normalizeAzElTimeObstacleData(inputData)
%**************************************************************************
% PURPOSE
%   - Validate and column-normalize one canonical azElData record.
%**************************************************************************
% INPUTS
%   - inputData (scalar struct)
%       targetName, time_s, az_deg, el_deg, and status are required.
%       Nonfinite paired boundary rows are preserved as region separators.
%**************************************************************************
% OUTPUTS
%   - azElData (scalar struct)
%       Validated canonical obstacle record with stable field order.
%**************************************************************************
% UNITS
%   - az_deg and el_deg are degrees; time_s is seconds.

%% Section 1: Validate Structure & Sample Time
requiredFields = ["targetName", "time_s", "az_deg", "el_deg", "status"];
hasRequiredStructure = isstruct(inputData) && isscalar(inputData);
if hasRequiredStructure
    hasRequiredStructure = all(isfield(inputData, cellstr(requiredFields)));
end
if ~hasRequiredStructure
    error("normalizeAzElTimeObstacleData:InvalidInput", ...
        ["azElData must be a scalar calculateAreaTargetAzEl result with " ...
        "targetName, time_s, az_deg, el_deg, and status."]);
end

targetName = string(inputData.targetName);
if ~isscalar(targetName) || strlength(strtrim(targetName)) == 0
    error("normalizeAzElTimeObstacleData:InvalidTargetName", ...
        "targetName must be nonempty scalar text.");
end
validateattributes(inputData.time_s, {'numeric'}, ...
    {'vector', 'real', 'finite'});
time_s = double(inputData.time_s(:));
sampleCount = numel(time_s);
% Strict ordering is required because nearest-slice lookup and temporal
% padding both assume that adjacent row indices are adjacent in time.
if sampleCount == 0 || any(diff(time_s) <= 0)
    error("normalizeAzElTimeObstacleData:InvalidTime", ...
        "time_s must be nonempty and strictly increasing.");
end
%% Section 2: Validate Boundary Slices
hasCellBoundaries = iscell(inputData.az_deg) && iscell(inputData.el_deg);
hasMatchingAzimuthSamples = numel(inputData.az_deg) == sampleCount;
hasMatchingElevationSamples = numel(inputData.el_deg) == sampleCount;
matchingSampleFlags = [ ...
    hasMatchingAzimuthSamples, hasMatchingElevationSamples];
hasMatchingSampleCounts = all(matchingSampleFlags);
if ~hasCellBoundaries || ~hasMatchingSampleCounts
    error("normalizeAzElTimeObstacleData:InvalidBoundary", ...
        "az_deg and el_deg must be cell arrays matching time_s.");
end

azimuthSlices_deg = reshape(inputData.az_deg, [], 1);
elevationSlices_deg = reshape(inputData.el_deg, [], 1);
% Column-oriented cell arrays give all downstream packers one predictable
% shape while allowing each time slice to contain a different vertex count.
for sampleIndex = 1:sampleCount
    validateattributes(azimuthSlices_deg{sampleIndex}, ...
        {'numeric'}, {'vector', 'real'});
    validateattributes(elevationSlices_deg{sampleIndex}, ...
        {'numeric'}, {'vector', 'real'});
    azimuthVertexCount = numel(azimuthSlices_deg{sampleIndex});
    elevationVertexCount = numel(elevationSlices_deg{sampleIndex});
    if azimuthVertexCount ~= elevationVertexCount
        error("normalizeAzElTimeObstacleData:BoundarySizeMismatch", ...
            "az_deg and el_deg slice %d must have equal lengths.", ...
            sampleIndex);
    end
    azimuthSlices_deg{sampleIndex} = double( ...
        azimuthSlices_deg{sampleIndex}(:));
    elevationSlices_deg{sampleIndex} = double( ...
        elevationSlices_deg{sampleIndex}(:));
end

%% Section 3: Normalize Status & Assemble The Output
statusBySample = string(inputData.status);
% A scalar status is shorthand for a uniform history. Status is preserved
% rather than interpreted here because the obstacle-field builder owns the
% policy for which labels produce active obstacle geometry.
if isscalar(statusBySample)
    statusBySample = repmat(statusBySample, sampleCount, 1);
elseif numel(statusBySample) ~= sampleCount
    error("normalizeAzElTimeObstacleData:StatusSizeMismatch", ...
        "status must contain one value per time sample.");
else
    statusBySample = statusBySample(:);
end

azElData = struct( ...
    "targetName", targetName, ...
    "time_s", time_s, ...
    "az_deg", {azimuthSlices_deg}, ...
    "el_deg", {elevationSlices_deg}, ...
    "status", statusBySample);
end
