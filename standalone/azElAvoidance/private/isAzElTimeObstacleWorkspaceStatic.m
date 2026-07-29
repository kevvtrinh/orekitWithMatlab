function yes = isAzElTimeObstacleWorkspaceStatic( ...
        workspace, startTime_s, stopTime_s)
%ISAZELTIMEOBSTACLEWORKSPACESTATIC Test exact geometry over a time interval.
%
% A true result permits the planner to collapse az/el/time into one 2-D
% occupancy graph. The comparison is intentionally strict after packing.

yes = true;
for obstacle = reshape(workspace.Obstacles, 1, [])
    if obstacle.SampleCount == 0
        continue;
    end
    if obstacle.TimeSeconds(1) > startTime_s + 1e-9 || ...
            obstacle.TimeSeconds(end) < stopTime_s - 1e-9
        yes = false;
        return;
    end
    count = double(diff(obstacle.SliceOffsets));
    if any(count ~= count(1))
        yes = false;
        return;
    end
    firstIndex = double(obstacle.SliceOffsets(1)): ...
        double(obstacle.SliceOffsets(2) - 1);
    firstAzimuth = obstacle.AzimuthDeg(firstIndex);
    firstElevation = obstacle.ElevationDeg(firstIndex);
    % Vertex count, order, and values must match. Geometrically equivalent
    % polygons with a different parameterization remain classified dynamic.
    for sample = 2:obstacle.SampleCount
        index = double(obstacle.SliceOffsets(sample)): ...
            double(obstacle.SliceOffsets(sample + 1) - 1);
        if ~isequaln(obstacle.AzimuthDeg(index), firstAzimuth) || ...
                ~isequaln(obstacle.ElevationDeg(index), firstElevation)
            yes = false;
            return;
        end
    end
end
end
