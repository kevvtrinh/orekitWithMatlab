function azElData = calculateAreaTargetAzEl( ...
        targetName, boundaryLatLon_deg, time_s, sensorFixed_km, ...
        CfixedToSensor, maximumBoundaryStep_deg)
%CALCULATEAREATARGETAZEL Project one ground boundary into sensor az/el.
% This is the sole producer of the canonical azElData struct:
%   targetName, time_s, az_deg, el_deg, status
%
% The function performs boundary densification, WGS-84 horizon clipping,
% ECEF-to-sensor rotation, and azimuth/elevation conversion.

validateattributes(targetName, {'char', 'string'}, {'nonempty'});
validateattributes(boundaryLatLon_deg, {'numeric'}, ...
    {'2d', 'ncols', 2, 'finite', 'real'});
validateattributes(time_s, {'numeric'}, ...
    {'vector', 'real', 'finite'});
validateattributes(sensorFixed_km, {'numeric'}, ...
    {'2d', 'ncols', 3, 'real', 'finite'});
validateattributes(CfixedToSensor, {'numeric'}, {'real', 'finite'});
validateattributes(maximumBoundaryStep_deg, {'numeric'}, ...
    {'scalar', 'real', 'finite', 'positive'});
if size(boundaryLatLon_deg, 1) < 3
    error("calculateAreaTargetAzEl:InvalidBoundary", ...
        "The area boundary requires at least three vertices.");
end
time_s = double(time_s(:));
numberOfTimes = numel(time_s);
if numberOfTimes == 0 || any(diff(time_s) <= 0)
    error("calculateAreaTargetAzEl:InvalidTime", ...
        "time_s must be nonempty and strictly increasing.");
end
if size(sensorFixed_km, 1) ~= numberOfTimes || ...
        size(CfixedToSensor, 1) ~= 3 || ...
        size(CfixedToSensor, 2) ~= 3 || ...
        size(CfixedToSensor, 3) ~= numberOfTimes
    error("calculateAreaTargetAzEl:HistorySizeMismatch", ...
        "Time, position, and attitude histories must align.");
end

if isequal(boundaryLatLon_deg(1, :), boundaryLatLon_deg(end, :))
    boundaryLatLon_deg(end, :) = [];
end

%% Densify and convert the stationary boundary to ECEF
simplificationTolerance_deg = 0.05;
originalPointCount = size(boundaryLatLon_deg, 1);
if originalPointCount > 2000
    [reducedLatitude_deg, reducedLongitude_deg] = reducem( ...
        boundaryLatLon_deg(:, 1), boundaryLatLon_deg(:, 2), ...
        simplificationTolerance_deg);
    boundaryLatLon_deg = [ ...
        reducedLatitude_deg(:), reducedLongitude_deg(:)];
    boundaryLatLon_deg = boundaryLatLon_deg( ...
        all(isfinite(boundaryLatLon_deg), 2), :);
    fprintf("Boundary reduced from %d to %d points.\n", ...
        originalPointCount, size(boundaryLatLon_deg, 1));
end

numberOfVertices = size(boundaryLatLon_deg, 1);
boundarySegments = cell(numberOfVertices, 1);
for vertexIndex = 1:numberOfVertices
    nextIndex = mod(vertexIndex, numberOfVertices) + 1;
    delta_deg = boundaryLatLon_deg(nextIndex, :) - ...
        boundaryLatLon_deg(vertexIndex, :);
    delta_deg(2) = mod(delta_deg(2) + 180, 360) - 180;

    numberOfSegments = max(1, ceil( ...
        hypot(delta_deg(1), delta_deg(2)) / maximumBoundaryStep_deg));
    fraction = (0:numberOfSegments - 1).' / numberOfSegments;
    boundarySegments{vertexIndex} = ...
        boundaryLatLon_deg(vertexIndex, :) + fraction .* delta_deg;
    boundarySegments{vertexIndex}(:, 2) = mod( ...
        boundarySegments{vertexIndex}(:, 2) + 180, 360) - 180;
end

denseLatLon_deg = vertcat(boundarySegments{:});
denseLatLon_deg(end + 1, :) = denseLatLon_deg(1, :);
denseFixed_km = lla2ecef( ...
    [denseLatLon_deg, zeros(size(denseLatLon_deg, 1), 1)]) / 1000;

% WGS-84 surface normals are reused at every time step.
earthA_km = 6378.137;
earthB_km = 6356.752314245;
surfaceNormal = [ ...
    denseFixed_km(:, 1) / earthA_km^2, ...
    denseFixed_km(:, 2) / earthA_km^2, ...
    denseFixed_km(:, 3) / earthB_km^2];

az_deg = cell(numberOfTimes, 1);
el_deg = cell(numberOfTimes, 1);
status = strings(numberOfTimes, 1);

%% Clip and project the boundary at every time step
parfor timeIndex = 1:numberOfTimes
    sensorPosition_km = sensorFixed_km(timeIndex, :);
    CfixedToSensorNow = CfixedToSensor(:, :, timeIndex);

    % Positive tangent-plane value means the point is above the horizon.
    visibility = sum(surfaceNormal .* ...
        (sensorPosition_km - denseFixed_km), 2);
    isVisible = visibility >= 0;
    visibleFixed_km = zeros(0, 3);

    for edgeIndex = 1:size(denseFixed_km, 1) - 1
        point1Fixed_km = denseFixed_km(edgeIndex, :);
        visible1 = isVisible(edgeIndex);
        visible2 = isVisible(edgeIndex + 1);

        if visible1
            if isempty(visibleFixed_km) || ...
                    any(isnan(visibleFixed_km(end, :))) || ...
                    norm(visibleFixed_km(end, :) - point1Fixed_km) > 1e-9
                visibleFixed_km(end + 1, :) = point1Fixed_km; %#ok<AGROW>
            end
        end

        if visible1 ~= visible2
            % Refine the exact horizon crossing with 20 bisections.
            point1_deg = denseLatLon_deg(edgeIndex, :); %#ok<PFBNS>
            delta_deg = denseLatLon_deg(edgeIndex + 1, :) - point1_deg;
            delta_deg(2) = mod(delta_deg(2) + 180, 360) - 180;
            low = 0;
            high = 1;
            lowValue = visibility(edgeIndex);

            for iteration = 1:20
                middle = (low + high) / 2;
                trial_deg = point1_deg + middle * delta_deg;
                trial_deg(2) = mod(trial_deg(2) + 180, 360) - 180;
                trialFixed_km = lla2ecef([trial_deg, 0]) / 1000;
                trialNormal = [ ...
                    trialFixed_km(1) / earthA_km^2, ...
                    trialFixed_km(2) / earthA_km^2, ...
                    trialFixed_km(3) / earthB_km^2];
                middleValue = sum(trialNormal .* ...
                    (sensorPosition_km - trialFixed_km));

                if sign(middleValue) == sign(lowValue)
                    low = middle;
                    lowValue = middleValue;
                else
                    high = middle;
                end
            end

            crossing_deg = point1_deg + ((low + high) / 2) * delta_deg;
            crossing_deg(2) = mod(crossing_deg(2) + 180, 360) - 180;
            crossingFixed_km = lla2ecef([crossing_deg, 0]) / 1000;
            visibleFixed_km(end + 1, :) = crossingFixed_km; %#ok<AGROW>
            if visible1
                visibleFixed_km(end + 1, :) = NaN(1, 3); %#ok<AGROW>
            end
        end
    end

    if isVisible(end)
        visibleFixed_km(end + 1, :) = denseFixed_km(end, :); %#ok<AGROW>
    end
    while ~isempty(visibleFixed_km) && ...
            any(isnan(visibleFixed_km(end, :)))
        visibleFixed_km(end, :) = [];
    end

    currentAz_deg = zeros(0, 1);
    currentEl_deg = zeros(0, 1);
    currentStatus = "below_horizon";
    if ~isempty(visibleFixed_km)
        validPoint = all(isfinite(visibleFixed_km), 2);
        sensorFORFixed = ...
            visibleFixed_km(validPoint, :) - sensorPosition_km;
        sensorFORFixed = sensorFORFixed ./ vecnorm(sensorFORFixed, 2, 2);
        sensorFOR = (CfixedToSensorNow * sensorFORFixed.').';

        localAz_deg = mod( ...
            atan2d(sensorFOR(:, 2), sensorFOR(:, 1)) + 180, 360) - 180;
        localEl_deg = atan2d( ...
            sensorFOR(:, 3), hypot(sensorFOR(:, 1), sensorFOR(:, 2)));
        inFront = localEl_deg >= 0 & localEl_deg <= 90;

        currentAz_deg = NaN(size(visibleFixed_km, 1), 1);
        currentEl_deg = NaN(size(visibleFixed_km, 1), 1);
        validIndex = find(validPoint);
        currentAz_deg(validIndex(inFront)) = localAz_deg(inFront);
        currentEl_deg(validIndex(inFront)) = localEl_deg(inFront);

        % Break the line rather than connecting +180 to -180 degrees.
        adjacent = isfinite(currentAz_deg(1:end - 1)) & ...
            isfinite(currentAz_deg(2:end));
        wrapBreak = find(adjacent & abs(diff(currentAz_deg)) > 180) + 1;
        currentAz_deg(wrapBreak) = NaN;
        currentEl_deg(wrapBreak) = NaN;

        if any(isfinite(currentAz_deg))
            currentStatus = "visible";
        else
            currentStatus = "outside_sensor_front";
        end
    end

    az_deg{timeIndex} = currentAz_deg;
    el_deg{timeIndex} = currentEl_deg;
    status(timeIndex) = currentStatus;
end

azElData = struct( ...
    "targetName", string(targetName), ...
    "time_s", time_s, ...
    "az_deg", {az_deg}, ...
    "el_deg", {el_deg}, ...
    "status", status);
end
