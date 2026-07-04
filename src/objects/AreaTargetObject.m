classdef AreaTargetObject < MissionObject
    %AREATARGETOBJECT Polygon/region placeholder for future coverage analysis.

    properties
        LatitudeDeg double = 0
        LongitudeDeg double = 0
        BoundaryLatDeg double = []
        BoundaryLonDeg double = []
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
