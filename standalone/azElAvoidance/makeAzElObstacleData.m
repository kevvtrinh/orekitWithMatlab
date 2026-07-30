function data = makeAzElObstacleData(name, time_s, ...
        azimuthBoundary, elevationBoundary)
%MAKEAZELOBSTACLEDATA Build canonical static or time-varying azElData.
%
% Numeric boundaries are repeated at every time. Cell boundaries must
% contain one vector per time sample.

time_s = double(time_s(:));
sampleCount = numel(time_s);
% Numeric boundaries describe a static polygon and are repeated across the
% supplied time base. Cell inputs preserve independent moving slices.
if ~iscell(azimuthBoundary)
    azimuthBoundary = repmat( ...
        {double(azimuthBoundary(:))}, sampleCount, 1);
end
if ~iscell(elevationBoundary)
    elevationBoundary = repmat( ...
        {double(elevationBoundary(:))}, sampleCount, 1);
end
data = struct( ...
    "targetName", string(name), ...
    "time_s", time_s, ...
    "az_deg", {reshape(azimuthBoundary, [], 1)}, ...
    "el_deg", {reshape(elevationBoundary, [], 1)}, ...
    "status", repmat("visible", sampleCount, 1));
% Route synthetic examples through the same validator as measured input.
% This keeps test fixtures from relying on shapes the public planner would
% reject in operational data.
data = normalizeAzElTimeObstacleData(data);
end
