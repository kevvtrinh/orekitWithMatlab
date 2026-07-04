classdef AreaTargetObject < MissionObject
    %AREATARGETOBJECT Polygon/region placeholder for future coverage analysis.

    properties
        AreaType string = "Polygon"
        LatitudeDeg double = 0
        LongitudeDeg double = 0
        BoundaryLatLon double = zeros(0, 2)
        BoundaryLatDeg double = []
        BoundaryLonDeg double = []
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
            tf = inpolygon(lonDeg, latDeg, obj.BoundaryLonDeg, obj.BoundaryLatDeg);
        end

        function centroid = getCentroid(obj)
            if isempty(obj.BoundaryLatDeg)
                centroid = [obj.LatitudeDeg, obj.LongitudeDeg];
            else
                centroid = [mean(obj.BoundaryLatDeg, "omitnan"), ...
                    mean(obj.BoundaryLonDeg, "omitnan")];
            end
        end

        function gridPoints = generateGrid(obj, gridResolutionKm)
            if nargin < 2 || isempty(gridResolutionKm)
                gridResolutionKm = obj.GridResolutionKm;
            end
            obj.validate();
            latStep = max(gridResolutionKm / 111.0, 0.01);
            meanLat = mean(obj.BoundaryLatDeg, "omitnan");
            lonStep = max(gridResolutionKm / max(111.0 * cosd(meanLat), 1.0), 0.01);
            latValues = (min(obj.BoundaryLatDeg):latStep:max(obj.BoundaryLatDeg)).';
            lonValues = (min(obj.BoundaryLonDeg):lonStep:max(obj.BoundaryLonDeg)).';
            [lonGrid, latGrid] = meshgrid(lonValues, latValues);
            inside = inpolygon(lonGrid(:), latGrid(:), obj.BoundaryLonDeg, obj.BoundaryLatDeg);
            lat = latGrid(inside);
            lon = lonGrid(inside);
            if isempty(lat)
                centroid = obj.getCentroid();
                lat = centroid(1);
                lon = centroid(2);
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
            obj.validate();
            meanLat = mean(obj.BoundaryLatDeg, "omitnan");
            x = obj.BoundaryLonDeg(:) * 111.0 * cosd(meanLat);
            y = obj.BoundaryLatDeg(:) * 111.0;
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

    methods (Static)
        function obj = fromStruct(data)
            obj = AreaTargetObject(data.Name, data.BoundaryLatDeg, ...
                data.BoundaryLonDeg, data.AltitudeMeters);
            names = fieldnames(data);
            for k = 1:numel(names)
                if isprop(obj, names{k})
                    obj.(names{k}) = data.(names{k});
                end
            end
        end
    end
end
