function result = simplifyAzElRouteVisibility( ...
        workspace, route_deg, queryTime_s, limits, options)
%SIMPLIFYAZELROUTEVISIBILITY Remove stops using sampled polygon visibility.
%
% Starting at each retained point, the algorithm extends a chord along the
% route until the next extension becomes blocked. Every accepted chord is
% sampled against the original packed polygons with the requested safety
% margin. The route remains in its discovered homotopy class.

timer = tic;
route_deg = double(route_deg);
inputCount = size(route_deg, 1);
if size(route_deg, 1) <= 2
    result = successfulResult(route_deg, inputCount, 0, toc(timer));
    return;
end
output = zeros(size(route_deg));
outputCount = 1;
output(1, :) = route_deg(1, :);
current = 1;
collisionChecks = 0;
while current < size(route_deg, 1)
    best = current + 1;
    candidate = current + 2;
    while candidate <= size(route_deg, 1)
        collisionChecks = collisionChecks + 1;
        if segmentFree(workspace, route_deg(current, :), ...
                route_deg(candidate, :), queryTime_s, limits, options)
            best = candidate;
            candidate = candidate + 1;
        else
            break;
        end
    end
    outputCount = outputCount + 1;
    output(outputCount, :) = route_deg(best, :);
    current = best;
end
output = output(1:outputCount, :);
result = successfulResult( ...
    output, inputCount, collisionChecks, toc(timer));
end

function yes = segmentFree( ...
        workspace, first, second, queryTime_s, limits, options)
distance = hypot(second(1) - first(1), second(2) - first(2));
sampleCount = max(2, ceil(distance / options.RouteShortcutStep_deg) + 1);
fraction = linspace(0, 1, sampleCount).';
point = first + fraction .* (second - first);
if options.AllowAzimuthWrap
    span = diff(limits.azimuth_deg);
    point(:, 1) = mod( ...
        point(:, 1) - limits.azimuth_deg(1), span) + ...
        limits.azimuth_deg(1);
end
blocked = queryAzElTimeObstacle(workspace, ...
    point(:, 1), point(:, 2), queryTime_s, struct( ...
    "CollisionMode", "polygon", ...
    "SafetyMarginDeg", options.SafetyMargin_deg));
yes = ~any(blocked);
end

function result = successfulResult(route, inputCount, checks, elapsed_s)
delta = diff(route, 1, 1);
result = struct( ...
    "Success", true, ...
    "Message", "Visibility shortcutting complete.", ...
    "Method", "continuousVisibilityShortcut", ...
    "Path_deg", route, ...
    "AngularLength_deg", sum(hypot(delta(:, 1), delta(:, 2))), ...
    "InputWaypointCount", inputCount, ...
    "OutputWaypointCount", size(route, 1), ...
    "CollisionCheckCount", checks, ...
    "Elapsed_s", elapsed_s);
end
