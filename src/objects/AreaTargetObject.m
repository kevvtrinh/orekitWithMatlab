classdef AreaTargetObject < MissionObject
    %AREATARGETOBJECT Ground polygon with shortest-path longitude edges.
    % Containment, centroid, and grids use a planar latitude/unwrapped-
    % longitude polygon. Area uses a local equirectangular approximation;
    % it is not a geodesic area. Pole-enclosing/winding polygons are not
    % supported. Centroid/grid longitudes use [-180, 180) degrees; the
    % supplied boundary coordinates remain available without modification.
    % Multipart country regions use BoundaryPolygons (outer rings and holes)
    % instead. GeographicAreaGeometry handles their containment, sampling,
    % and spherical longitude/latitude-edge area, including explicit polar caps.

    properties
        AreaType string = "Polygon"
        LatitudeDeg double = 0
        LongitudeDeg double = 0
        BoundaryLatLon double = zeros(0, 2)
        BoundaryLatDeg double = []
        BoundaryLonDeg double = []
        BoundaryPolygons = struct([])
        GridPoints table = table()
        GridResolutionKm double = 50
        Priority double = 1
        RequiredCoveragePercent double = 50
        RequiredRevisitTimeSeconds double = Inf
        RequiredDwellPerGridPointSeconds double = 0
        AltitudeMeters double = 0
        Metadata struct = struct()
    end

    methods
        function obj = AreaTargetObject(name, boundaryLatDeg, boundaryLonDeg, altitudeMeters)
            obj.ObjectType = "AreaTarget";
            obj.Color = [0.40 0.20 0.70];
            if nargin >= 1
                obj.Name = string(name);
            end
            if nargin >= 3
                obj.BoundaryLatDeg = boundaryLatDeg(:);
                obj.BoundaryLonDeg = boundaryLonDeg(:);
                obj.BoundaryLatLon = [obj.BoundaryLatDeg, obj.BoundaryLonDeg];
                centroid = obj.getCentroid();
                obj.LatitudeDeg = centroid(1);
                obj.LongitudeDeg = centroid(2);
            end
            if nargin >= 4
                obj.AltitudeMeters = altitudeMeters;
            end
        end

        function validate(obj)
            validate@MissionObject(obj);
            if ~isempty(obj.BoundaryPolygons)
                GeographicAreaGeometry.validate(obj.BoundaryPolygons);
                if obj.GridResolutionKm <= 0, error("AreaTargetObject:InvalidGridResolution", "GridResolutionKm must be positive."); end
                return;
            end
            if numel(obj.BoundaryLatDeg) ~= numel(obj.BoundaryLonDeg)
                error("AreaTargetObject:InvalidBoundary", ...
                    "Boundary latitude and longitude arrays must have the same length.");
            end
            if numel(obj.BoundaryLatDeg) < 3
                error("AreaTargetObject:InvalidBoundary", ...
                    "Area target boundary must contain at least three points.");
            end
            if obj.GridResolutionKm <= 0
                error("AreaTargetObject:InvalidGridResolution", ...
                    "GridResolutionKm must be positive.");
            end
        end

        function tf = containsPoint(obj, latDeg, lonDeg)
            if ~isempty(obj.BoundaryPolygons)
                tf = GeographicAreaGeometry.contains(obj.BoundaryPolygons, latDeg, lonDeg);
                return;
            end
            [latitude, longitude] = obj.planarBoundary();
            reference = (min(longitude) + max(longitude)) / 2;
            queryLongitude = reference + mod(lonDeg - reference + 180, 360) - 180;
            tf = inpolygon(queryLongitude, latDeg, longitude, latitude);
        end

        function centroid = getCentroid(obj)
            if ~isempty(obj.BoundaryPolygons)
                centroid = [obj.LatitudeDeg, obj.LongitudeDeg];
                return;
            end
            if isempty(obj.BoundaryLatDeg)
                centroid = [obj.LatitudeDeg, obj.LongitudeDeg];
            else
                [latitude, longitude] = obj.planarBoundary();
                % Translate before the shoelace sum to avoid cancellation
                % for small regions far from longitude/latitude zero.
                x = longitude - longitude(1);
                y = latitude - latitude(1);
                nextX = circshift(x, -1);
                nextY = circshift(y, -1);
                edgeArea = x .* nextY - nextX .* y;
                twiceArea = sum(edgeArea);
                if abs(twiceArea) <= eps(max(max(abs(x)), max(abs(y)))^2) * numel(x)
                    error("AreaTargetObject:DegenerateBoundary", ...
                        "The area boundary must enclose a nonzero planar area.");
                end
                centroidLon = longitude(1) + sum((x + nextX) .* edgeArea) / (3 * twiceArea);
                centroidLat = latitude(1) + sum((y + nextY) .* edgeArea) / (3 * twiceArea);
                centroid = [centroidLat, mod(centroidLon + 180, 360) - 180];
            end
        end

        function gridPoints = generateGrid(obj, gridResolutionKm)
            if nargin < 2 || isempty(gridResolutionKm)
                gridResolutionKm = obj.GridResolutionKm;
            end
            obj.validate();
            if ~isempty(obj.BoundaryPolygons)
                [lat, lon] = GeographicAreaGeometry.sample(obj.BoundaryPolygons, gridResolutionKm);
                gridPointID = "GP-" + compose("%03d", (1:numel(lat)).');
                gridPoints = table(gridPointID, lat(:), lon(:), false(numel(lat), 1), ...
                    'VariableNames', {'GridPointID', 'LatitudeDeg', 'LongitudeDeg', 'Covered'});
                return;
            end
            [boundaryLatitude, boundaryLongitude] = obj.planarBoundary();
            latStep = max(gridResolutionKm / 111.0, 0.01);
            meanLat = mean(obj.BoundaryLatDeg, "omitnan");
            lonStep = max(gridResolutionKm / max(111.0 * cosd(meanLat), 1.0), 0.01);
            latValues = (min(obj.BoundaryLatDeg):latStep:max(obj.BoundaryLatDeg)).';
            lonValues = (min(boundaryLongitude):lonStep:max(boundaryLongitude)).';
            [lonGrid, latGrid] = meshgrid(lonValues, latValues);
            inside = inpolygon(lonGrid(:), latGrid(:), boundaryLongitude, boundaryLatitude);
            lat = latGrid(inside);
            lon = mod(lonGrid(inside) + 180, 360) - 180;
            if isempty(lat)
                % A concave polygon's centroid can lie outside its region.
                % A boundary vertex remains a valid sample at coarse spacing.
                lat = boundaryLatitude(1);
                lon = mod(boundaryLongitude(1) + 180, 360) - 180;
            end
            gridPointID = "GP-" + compose("%03d", (1:numel(lat)).');
            covered = false(numel(lat), 1);
            gridPoints = table(gridPointID, lat(:), lon(:), covered, ...
                'VariableNames', {'GridPointID', 'LatitudeDeg', 'LongitudeDeg', 'Covered'});
        end

        function boundary = getBoundary(obj)
            boundary = table(obj.BoundaryLatDeg(:), obj.BoundaryLonDeg(:), ...
                'VariableNames', {'LatitudeDeg', 'LongitudeDeg'});
        end

        function gridPoints = getGridPoints(obj)
            if isempty(obj.GridPoints) || height(obj.GridPoints) == 0
                gridPoints = obj.generateGrid(obj.GridResolutionKm);
            else
                gridPoints = obj.GridPoints;
            end
        end

        function areaKm2 = getAreaKm2(obj)
            if ~isempty(obj.BoundaryPolygons)
                obj.validate();
                areaKm2 = GeographicAreaGeometry.areaKm2(obj.BoundaryPolygons);
                return;
            end
            %GETAREAKM2 Local equirectangular area estimate, square km.
            obj.validate();
            [latitude, longitude] = obj.planarBoundary();
            meanLat = mean(latitude);
            x = (longitude - longitude(1)) * 111.0 * cosd(meanLat);
            y = (latitude - latitude(1)) * 111.0;
            areaKm2 = 0.5 * abs(sum(x .* circshift(y, -1) - circshift(x, -1) .* y));
        end

        function ax = plotArea(obj, ax)
            ax = obj.plotBoundary(ax);
            holdState = ishold(ax);
            hold(ax, "on");
            gridPoints = obj.getGridPoints();
            if ~isempty(gridPoints) && height(gridPoints) > 0
                scatter(ax, gridPoints.LongitudeDeg, gridPoints.LatitudeDeg, ...
                    18, "filled", "MarkerFaceColor", obj.Color, ...
                    "MarkerFaceAlpha", 0.45);
            end
            if ~holdState
                hold(ax, "off");
            end
        end

        function position = getECEF(obj, ~)
            centroid = obj.getCentroid();
            [x, y, z] = OrekitFrames.geodeticToECEF( ...
                centroid(1), centroid(2), obj.AltitudeMeters);
            position = [x, y, z];
        end

        function lla = getLLA(obj, ~)
            centroid = obj.getCentroid();
            lla = [centroid(1), centroid(2), obj.AltitudeMeters];
        end

        function ax = plotBoundary(obj, ax)
            if nargin < 2 || isempty(ax)
                figure("Name", char(obj.Name));
                ax = axes();
            end
            plot(ax, obj.BoundaryLonDeg, obj.BoundaryLatDeg, ...
                "Color", obj.Color, "LineWidth", 1.4);
            xlabel(ax, "Longitude (deg)");
            ylabel(ax, "Latitude (deg)");
            grid(ax, "on");
            title(ax, obj.Name + " Boundary");
        end
    end

    methods (Access = private)
        function [latitude, longitude] = planarBoundary(obj)
            % Use the same shortest longitude increments as az/el projection.
            latitude = obj.BoundaryLatDeg(:);
            longitude = obj.BoundaryLonDeg(:);
            if numel(latitude) ~= numel(longitude) || numel(latitude) < 3 || ...
                    any(~isfinite(latitude) | abs(latitude) > 90) || any(~isfinite(longitude))
                error("AreaTargetObject:InvalidBoundary", ...
                    "Boundary requires at least three finite latitude/longitude pairs.");
            end
            if latitude(end) == latitude(1) && mod(longitude(end) - longitude(1), 360) == 0
                latitude(end) = [];
                longitude(end) = [];
            end
            if numel(latitude) < 3
                error("AreaTargetObject:InvalidBoundary", ...
                    "Boundary requires at least three vertices before closure.");
            end
            increments = mod(diff([longitude; longitude(1)]) + 180, 360) - 180;
            if abs(sum(increments)) > 1e-8
                error("AreaTargetObject:UnsupportedBoundary", ...
                    "Pole-enclosing or longitude-winding boundaries are unsupported.");
            end
            longitude = longitude(1) + [0; cumsum(increments(1:end-1))];
            if max(longitude) - min(longitude) >= 360
                error("AreaTargetObject:UnsupportedBoundary", ...
                    "Boundary must fit within one unwrapped longitude revolution.");
            end
        end
    end

    methods (Static)
        function obj = fromStruct(data)
            if isfield(data, "BoundaryPolygons") && ~isempty(data.BoundaryPolygons)
                obj = AreaTargetObject(data.Name);
            else
                obj = AreaTargetObject(data.Name, data.BoundaryLatDeg, data.BoundaryLonDeg, data.AltitudeMeters);
            end
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
        end
    end
end
