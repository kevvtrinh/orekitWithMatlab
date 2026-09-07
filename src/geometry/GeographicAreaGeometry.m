classdef GeographicAreaGeometry
    %GEOGRAPHICAREAGEOMETRY Multipart lon/lat boundaries with explicit holes.
    % Rings use unwrapped longitudes. Country import preserves pole closures.
    % Containment matches the UI's planar longitude/latitude boundary model.
    methods (Static)
        function items = asCells(value)
            if isempty(value), items = {}; elseif iscell(value), items = value; else, items = num2cell(value); end
        end

        function rings = rings(polygon)
            rings = {double(polygon.outer)};
            if isfield(polygon, "holes")
                holes = GeographicAreaGeometry.asCells(polygon.holes);
                for k = 1:numel(holes), rings{end + 1} = double(holes{k}.ring); end %#ok<AGROW>
            end
        end

        function validate(polygons)
            parts = GeographicAreaGeometry.asCells(polygons);
            if isempty(parts), error("GeographicAreaGeometry:EmptyBoundary", "A geographic area needs a polygon."); end
            for p = 1:numel(parts)
                rings = GeographicAreaGeometry.rings(parts{p});
                for r = 1:numel(rings)
                    ring = rings{r};
                    if size(ring, 2) ~= 2 || size(ring, 1) < 4 || any(~isfinite(ring), "all") || ...
                            any(abs(ring(:, 2)) > 90) || max(ring(:, 1)) - min(ring(:, 1)) > 360 + 1e-8
                        error("GeographicAreaGeometry:InvalidBoundary", "Boundary rings require finite [longitude latitude] pairs and at most one longitude revolution.");
                    end
                end
            end
        end

        function tf = contains(polygons, lat, lon)
            tf = false(size(lat + lon));
            parts = GeographicAreaGeometry.asCells(polygons);
            for p = 1:numel(parts)
                rings = GeographicAreaGeometry.rings(parts{p});
                inside = GeographicAreaGeometry.insideRing(rings{1}, lat, lon);
                for h = 2:numel(rings), inside = inside & ~GeographicAreaGeometry.insideRing(rings{h}, lat, lon); end
                tf = tf | inside;
            end
        end

        function tf = insideRing(ring, lat, lon)
            reference = (min(ring(:, 1)) + max(ring(:, 1))) / 2;
            queryLon = reference + mod(lon - reference + 180, 360) - 180;
            tf = inpolygon(queryLon, lat, ring(:, 1), ring(:, 2));
        end

        function area = areaKm2(polygons)
            % Spherical lon/lat-edge area; not ellipsoidal/geodesic surveying.
            area = 0;
            parts = GeographicAreaGeometry.asCells(polygons);
            for p = 1:numel(parts)
                rings = GeographicAreaGeometry.rings(parts{p});
                for r = 1:numel(rings)
                    ring = rings{r};
                    if any(ring(1, :) ~= ring(end, :)), ring(end + 1, :) = ring(1, :); end
                    ringArea = 6371^2 * abs(sum(deg2rad(diff(ring(:, 1))) .* ...
                        (sind(ring(1:end-1, 2)) + sind(ring(2:end, 2))) / 2));
                    if r == 1, area = area + ringArea; else, area = area - ringArea; end
                end
            end
            area = max(area, 0);
        end

        function [lat, lon] = sample(polygons, spacingKm)
            lat = []; lon = [];
            parts = GeographicAreaGeometry.asCells(polygons);
            for p = 1:numel(parts)
                outer = double(parts{p}.outer);
                west = min(outer(:, 1)); east = max(outer(:, 1));
                south = min(outer(:, 2)); north = max(outer(:, 2));
                rows = max(1, ceil((north - south) * 111.32 / spacingKm));
                before = numel(lat);
                for row = 0:rows - 1
                    latitude = south + (row + 0.5) * (north - south) / rows;
                    cols = max(1, ceil((east - west) * 111.32 * cosd(latitude) / spacingKm));
                    longitude = west + ((0:cols - 1).' + 0.5) * (east - west) / cols;
                    latitude = repmat(latitude, size(longitude));
                    inside = GeographicAreaGeometry.contains(parts(p), latitude, longitude);
                    lat = [lat; latitude(inside)]; %#ok<AGROW>
                    lon = [lon; longitude(inside)]; %#ok<AGROW>
                end
                if numel(lat) == before
                    inside = GeographicAreaGeometry.contains(parts(p), outer(:, 2), outer(:, 1));
                    first = find(inside, 1);
                    if ~isempty(first), lat(end + 1, 1) = outer(first, 2); lon(end + 1, 1) = outer(first, 1); end %#ok<AGROW>
                end
            end
            lon = mod(lon + 180, 360) - 180;
        end
    end
end
